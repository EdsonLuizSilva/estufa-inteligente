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

  describe('Alerta e Notificação WhatsApp (Nível do Reservatório a cada 5 minutos)', () => {
    it('deve disparar notificação com o nível detalhado (porcentagem e litros) e ativar alarme se o nível de água for BAIXO', async () => {
      const readings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'BAIXO',
        waterPercentage: 12,
        timestamp: new Date().toISOString()
      };

      const state = await engine.evaluate(readings);

      expect(state.alarmActive).toBe(true);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(1);
      expect(mockWhatsAppSender.send).toHaveBeenCalledWith(
        expect.stringContaining('12% - ~24L de 200L restantes')
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

    it('deve respeitar o intervalo de 5 minutos (300.000 ms) entre mensagens enquanto o nível continuar crítico', async () => {
      vi.useFakeTimers();
      const baseTime = new Date('2026-10-27T12:00:00.000Z');
      vi.setSystemTime(baseTime);

      const criticalReadings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'BAIXO',
        waterPercentage: 10,
        timestamp: baseTime.toISOString()
      };

      // 1° Envio: Imediato
      await engine.evaluate(criticalReadings);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(1);

      // Avança 3 minutos (180.000 ms) -> Menos de 5 minutos, NÃO deve enviar
      vi.advanceTimersByTime(3 * 60 * 1000);
      await engine.evaluate(criticalReadings);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(1);

      // Avança mais 2 minutos (total 5 minutos = 300.000 ms) -> DEVE enviar o 2° alerta
      vi.advanceTimersByTime(2 * 60 * 1000);
      await engine.evaluate(criticalReadings);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(2);

      // Avança mais 5 minutos (total 10 minutos) -> DEVE enviar o 3° alerta
      vi.advanceTimersByTime(5 * 60 * 1000);
      await engine.evaluate(criticalReadings);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('deve rearmar o envio imediato se o nível subir para normal e voltar a ficar crítico no futuro', async () => {
      vi.useFakeTimers();
      const baseTime = new Date('2026-10-27T12:00:00.000Z');
      vi.setSystemTime(baseTime);

      const criticalReadings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'BAIXO',
        waterPercentage: 10,
        timestamp: baseTime.toISOString()
      };

      const normalReadings: SensorReadings = {
        temperature: 25.0,
        airHumidity: 60,
        soilStatus: 'UMIDO',
        waterLevel: 'CHEIO',
        waterPercentage: 90,
        timestamp: baseTime.toISOString()
      };

      // 1° Disparo crítico
      await engine.evaluate(criticalReadings);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(1);

      // Água é reabastecida para normal (CHEIO)
      vi.advanceTimersByTime(60 * 1000); // 1 minuto depois
      await engine.evaluate(normalReadings);
      expect(engine.getLastAlertTimestamp()).toBe(0); // Cooldown rearmado/resetado

      // Nível cai novamente para crítico 30 segundos depois -> DEVE disparar imediatamente sem esperar os 5 minutos do ciclo anterior
      vi.advanceTimersByTime(30 * 1000);
      await engine.evaluate(criticalReadings);
      expect(mockWhatsAppSender.send).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
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

