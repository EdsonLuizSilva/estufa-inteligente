import { ActuatorOverrideConfig, ActuatorState, SensorReadings } from './types.js';

export interface IWhatsAppNotifier {
  send(message: string): Promise<boolean>;
}

export class AutomationEngine {
  private tempThreshold = 28.0; // °C
  private notifier?: IWhatsAppNotifier;
  private lastAlertTimestamp = 0;
  private alertCooldownMs = 300000; // 5 minutos (300.000 ms) entre alertas consecutivos

  constructor(notifier?: IWhatsAppNotifier, alertCooldownMs = 300000) {
    this.notifier = notifier;
    this.alertCooldownMs = alertCooldownMs;
  }

  getLastAlertTimestamp(): number {
    return this.lastAlertTimestamp;
  }

  getAlertCooldownMs(): number {
    return this.alertCooldownMs;
  }

  resetAlertCooldown(): void {
    this.lastAlertTimestamp = 0;
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

        const percentage = readings.waterPercentage ?? 15;
        const totalCapacity = 200; // 200 Litros de capacidade padrão
        const remainingLiters = Math.round((totalCapacity * percentage) / 100);

        await this.notifier.send(
          `⚠️ [Estufa Inteligente] ALERTA CRÍTICO: Nível de água crítico no reservatório (${percentage}% - ~${remainingLiters}L de ${totalCapacity}L restantes). A bomba de irrigação foi travada. Reabasteça o reservatório imediatamente!`
        );
      }
    } else {
      // Quando o nível for restaurado (MEDIO ou CHEIO), reinicia o timestamp para disparar imediatamente caso venha a baixar novamente no futuro
      this.lastAlertTimestamp = 0;
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
