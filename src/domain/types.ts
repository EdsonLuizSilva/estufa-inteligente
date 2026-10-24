/**
 * Tipos de Domínio do Sistema de Monitoramento da Estufa Inteligente
 */

export type SoilStatus = 'MUITO_MOLHADO' | 'UMIDO' | 'SECO';

export type WaterLevel = 'BAIXO' | 'MEDIO' | 'CHEIO';

export interface SensorReadings {
  temperature: number; // Graus Celsius (°C)
  airHumidity: number; // Umidade relativa do ar (%)
  soilStatus: SoilStatus;
  waterLevel: WaterLevel;
  waterPercentage?: number; // 0 - 100%
  timestamp: string; // ISO String
}

export type ActuatorMode = 'AUTO' | 'FORCE_OFF';

export interface ActuatorOverrideConfig {
  fan: ActuatorMode;
  waterPump: ActuatorMode;
}

export interface ActuatorState {
  fanOn: boolean; // Ventilador (resfriamento da estufa)
  waterPumpOn: boolean; // Bomba de irrigação
  alarmActive: boolean; // Alerta de nível crítico acionado
  mode: ActuatorOverrideConfig;
  reason: {
    fan: string;
    waterPump: string;
    alarm: string;
  };
}

export interface WhatsAppNotification {
  to: string;
  message: string;
  timestamp: string;
  sent: boolean;
}

export interface SystemState {
  sensors: SensorReadings;
  actuators: ActuatorState;
  lastNotification?: WhatsAppNotification | null;
}
