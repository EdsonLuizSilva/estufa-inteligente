import { ActuatorOverrideConfig, ActuatorState, SensorReadings } from './types.js';

export interface IWhatsAppNotifier {
  send(message: string): Promise<boolean>;
}

export class AutomationEngine {
  private tempThreshold = 28.0; // °C
  private notifier?: IWhatsAppNotifier;
  private lastAlertTimestamp = 0;
  private alertCooldownMs = 60000; // 1 minuto de intervalo entre mensagens

  constructor(notifier?: IWhatsAppNotifier) {
    this.notifier = notifier;
  }

  /**
   * Avalia os dados dos sensores e determina o estado dos atuadores e alarmes.
   * Permite override manual para desligar os atuadores forçadamente.
   */
  async evaluate(
    readings: SensorReadings,
    overrideConfig: ActuatorOverrideConfig = { fan: 'AUTO', waterPump: 'AUTO' }
  ): Promise<ActuatorState> {
    const mode: ActuatorOverrideConfig = {
      fan: overrideConfig?.fan ?? 'AUTO',
      waterPump: overrideConfig?.waterPump ?? 'AUTO'
    };

    const isHot = readings.temperature >= this.tempThreshold;
    const isSoilDry = readings.soilStatus === 'SECO';
    const isWaterLow = readings.waterLevel === 'BAIXO';

    // 1. Regra do Ventilador
    let fanOn = false;
    let fanReason = '';

    if (mode.fan === 'FORCE_OFF') {
      fanOn = false;
      fanReason = 'VENTILADOR DESLIGADO MANUALMENTE: intervenção direta do operador (modo manual).';
    } else {
      fanOn = isHot;
      fanReason = isHot
        ? `Temperatura alta (${readings.temperature.toFixed(1)}°C >= ${this.tempThreshold}°C): ventilador acionado.`
        : `Temperatura adequada (${readings.temperature.toFixed(1)}°C < ${this.tempThreshold}°C): ventilador desligado.`;
    }

    // 2. Regra da Bomba de Água com Interlock de Segurança
    let waterPumpOn = false;
    let waterPumpReason = '';

    if (mode.waterPump === 'FORCE_OFF') {
      waterPumpOn = false;
      waterPumpReason = 'BOMBA DESLIGADA MANUALMENTE: intervenção direta do operador (modo manual).';
    } else if (isWaterLow) {
      waterPumpOn = false;
      waterPumpReason = 'BOMBA BLOQUEADA: reservatório com pouca água (risco de queima a seco).';
    } else if (isSoilDry) {
      waterPumpOn = true;
      waterPumpReason = `Solo seco e água disponível (${readings.waterLevel}): bomba acionada para irrigação.`;
    } else {
      waterPumpOn = false;
      waterPumpReason = `Solo em estado ${readings.soilStatus}: irrigação desnecessária.`;
    }

    // 3. Regra do Alarme & Notificação WhatsApp
    let alarmActive = false;
    let alarmReason = 'Nível de água seguro.';

    if (isWaterLow) {
      alarmActive = true;
      alarmReason = 'ALERTA CRÍTICO: Nível do reservatório está BAIXO.';

      const now = Date.now();
      if (this.notifier && (now - this.lastAlertTimestamp >= this.alertCooldownMs)) {
        this.lastAlertTimestamp = now;
        await this.notifier.send(
          `⚠️ [Estufa Inteligente] Alerta Crítico! Reservatório com nível crítico de água (BAIXO). A bomba de irrigação foi travada. Favor abastecer imediatamente!`
        );
      }
    }

    return {
      fanOn,
      waterPumpOn,
      alarmActive,
      mode,
      reason: {
        fan: fanReason,
        waterPump: waterPumpReason,
        alarm: alarmReason
      }
    };
  }
}
