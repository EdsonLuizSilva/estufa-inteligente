export type SoilStatus = 'MUITO_MOLHADO' | 'UMIDO' | 'SECO';
export type WaterLevel = 'BAIXO' | 'MEDIO' | 'CHEIO';

export interface SensorReadings {
  temperature: number;
  airHumidity: number;
  soilStatus: SoilStatus;
  waterLevel: WaterLevel;
  waterPercentage?: number;
  timestamp: string;
}

export type ActuatorMode = 'AUTO' | 'FORCE_OFF';

export interface ActuatorOverrideConfig {
  fan: ActuatorMode;
  waterPump: ActuatorMode;
}

export interface ActuatorState {
  fanOn: boolean;
  waterPumpOn: boolean;
  alarmActive: boolean;
  mode?: ActuatorOverrideConfig;
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
  notifications: WhatsAppNotification[];
}
