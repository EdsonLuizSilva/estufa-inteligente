import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutomationEngine } from './automation-engine.js';
import { SensorReadings } from './types.js';

describe('AutomationEngine (TDD Core da Estufa)', () => {
  let engine: AutomationEngine;
  let mockWhatsAppSender: { send: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockWhatsAppSender = {
      send: vi.fn().mockResolvedValue(true)
    };
    engine = new AutomationEngine(mockWhatsAppSender);
  });

  describe('Controle do Ventilador (Temperatura da Estufa)', () => {
    it('deve LIGAR o ventilador se a temperatura for >= 28.0°C', async () => {
      const readings: SensorReadings = {
        temperature: 28.5,
        airHumidity: 65,
        soilStatus: 'UMIDO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.fanOn).toBe(true);
      expect(state.reason.fan).toContain('alta');
    });

    it('deve DESLIGAR o ventilador se a temperatura for < 28.0°C', async () => {
      const readings: SensorReadings = {
        temperature: 24.0,
        airHumidity: 70,
        soilStatus: 'UMIDO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.fanOn).toBe(false);
      expect(state.reason.fan).toContain('adequada');
    });
  });

  describe('Controle da Bomba de Água (Umidade do Solo & Reservatório)', () => {
    it('deve LIGAR a bomba se o solo estiver SECO e houver água (Nível CHEIO ou MEDIO)', async () => {
      const readings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'SECO',
        waterLevel: 'MEDIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.waterPumpOn).toBe(true);
      expect(state.reason.waterPump).toContain('Solo seco');
    });

    it('deve DESLIGAR a bomba se o solo já estiver UMIDO ou MUITO_MOLHADO', async () => {
      const readings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'MUITO_MOLHADO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.waterPumpOn).toBe(false);
    });

    it('INTERLOCK CRÍTICO: NUNCA deve ligar a bomba se o reservatório estiver BAIXO, mesmo com solo SECO (Proteção contra queima)', async () => {
      const readings: SensorReadings = {
        temperature: 26.0,
        airHumidity: 50,
        soilStatus: 'SECO',
        waterLevel: 'BAIXO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.waterPumpOn).toBe(false);
      expect(state.reason.waterPump).toContain('reservatório com pouca água');
    });
  });

  describe('Alerta e Notificação WhatsApp (Nível do Reservatório)', () => {
    it('deve disparar notificação no WhatsApp e ativar alarme se o nível de água for BAIXO', async () => {
      const readings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'BAIXO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.alarmActive).toBe(true);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(1);
      expect(mockWhatsAppSender.send).toHaveBeenCalledWith(
        expect.stringContaining('Reservatório com nível crítico de água')
      );
    });

    it('NÃO deve enviar notificação no WhatsApp se a água estiver em nível MEDIO ou CHEIO', async () => {
      const readings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.alarmActive).toBe(false);
      expect(mockWhatsAppSender.send).not.toHaveBeenCalled();
    });
  });

  describe('Controle Manual & Override de Atuadores', () => {
    it('deve manter o ventilador DESLIGADO quando override for FORCE_OFF, mesmo em temperatura alta (>= 28°C)', async () => {
      const readings: SensorReadings = {
        temperature: 32.0,
        airHumidity: 50,
        soilStatus: 'UMIDO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings, { fan: 'FORCE_OFF', waterPump: 'AUTO' });

      expect(state.fanOn).toBe(false);
      expect(state.mode.fan).toBe('FORCE_OFF');
      expect(state.reason.fan).toContain('VENTILADOR DESLIGADO MANUALMENTE');
    });

    it('deve manter a bomba DESLIGADA quando override for FORCE_OFF, mesmo com solo SECO e água disponível', async () => {
      const readings: SensorReadings = {
        temperature: 24.0,
        airHumidity: 50,
        soilStatus: 'SECO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings, { fan: 'AUTO', waterPump: 'FORCE_OFF' });

      expect(state.waterPumpOn).toBe(false);
      expect(state.mode.waterPump).toBe('FORCE_OFF');
      expect(state.reason.waterPump).toContain('BOMBA DESLIGADA MANUALMENTE');
    });

    it('deve retornar modo AUTO por padrão quando nenhum override for especificado', async () => {
      const readings: SensorReadings = {
        temperature: 24.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'CHEIO',
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.mode).toEqual({ fan: 'AUTO', waterPump: 'AUTO' });
    });
  });
});

