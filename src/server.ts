import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { AutomationEngine } from './domain/automation-engine.js';
import { ActuatorOverrideConfig, ActuatorState, SensorReadings, SoilStatus, WaterLevel } from './domain/types.js';
import { WhatsAppNotifierService } from './services/whatsapp-notifier.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Injeção de dependências do ECC Domain
const notifier = new WhatsAppNotifierService();
const engine = new AutomationEngine(notifier);

// Estado de override manual dos atuadores
let currentOverride: ActuatorOverrideConfig = {
  fan: 'AUTO',
  waterPump: 'AUTO'
};

// Estado inicial do sistema
let currentReadings: SensorReadings = {
  temperature: 24.5,
  airHumidity: 65,
  soilStatus: 'UMIDO',
  waterLevel: 'CHEIO',
  waterPercentage: 85,
  timestamp: new Date().toISOString()
};

let currentActuators: ActuatorState = {
  fanOn: false,
  waterPumpOn: false,
  alarmActive: false,
  mode: {
    fan: 'AUTO',
    waterPump: 'AUTO'
  },
  reason: {
    fan: 'Temperatura adequada (24.5°C): ventilador desligado.',
    waterPump: 'Solo úmido: irrigação desnecessária.',
    alarm: 'Nível de água seguro.'
  }
};

// Histórico de leituras para a Tela 2 (Gráficos)
const historyData: SensorReadings[] = [];

// Inicializa com alguns dados históricos para o gráfico não começar vazio
const now = Date.now();
for (let i = 20; i >= 0; i--) {
  const time = new Date(now - i * 60000).toISOString();
  historyData.push({
    temperature: +(22 + Math.sin(i / 3) * 4).toFixed(1),
    airHumidity: +(60 + Math.cos(i / 3) * 10).toFixed(0),
    soilStatus: i < 5 ? 'UMIDO' : 'SECO',
    waterLevel: i < 2 ? 'MEDIO' : 'CHEIO',
    waterPercentage: Math.max(30, 95 - i * 2),
    timestamp: time
  });
}

// Validação com Zod para entrada da telemetria
const TelemetrySchema = z.object({
  temperature: z.number().min(-10).max(60),
  airHumidity: z.number().min(0).max(100),
  soilStatus: z.enum(['MUITO_MOLHADO', 'UMIDO', 'SECO']),
  waterLevel: z.enum(['BAIXO', 'MEDIO', 'CHEIO']),
  waterPercentage: z.number().min(0).max(100).optional()
});

/**
 * 1. Obter estado atual dos sensores, atuadores e último alerta
 */
app.get('/api/state', (req: Request, res: Response) => {
  res.json({
    sensors: currentReadings,
    actuators: currentActuators,
    notifications: notifier.getHistory()
  });
});

/**
 * 2. Ingestão de telemetria dos sensores (ESP32 ou Simulador)
 */
app.post('/api/telemetry', async (req: Request, res: Response) => {
  const result = TelemetrySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados de telemetria inválidos', details: result.error.format() });
  }

  const { temperature, airHumidity, soilStatus, waterLevel, waterPercentage } = result.data;
  
  currentReadings = {
    temperature,
    airHumidity,
    soilStatus: soilStatus as SoilStatus,
    waterLevel: waterLevel as WaterLevel,
    waterPercentage: waterPercentage ?? (waterLevel === 'BAIXO' ? 15 : waterLevel === 'MEDIO' ? 50 : 90),
    timestamp: new Date().toISOString()
  };

  // Avalia as regras de negócio pela AutomationEngine do ECC com o override ativo
  currentActuators = await engine.evaluate(currentReadings, currentOverride);

  // Armazena no histórico (mantém até 100 pontos)
  historyData.push(currentReadings);
  if (historyData.length > 100) {
    historyData.shift();
  }

  res.json({
    message: 'Telemetria processada com sucesso',
    sensors: currentReadings,
    actuators: currentActuators
  });
});

/**
 * 3. Controle Manual / Override dos Atuadores (Ventilador e Bomba de Água)
 */
const OverrideSchema = z.object({
  actuator: z.enum(['fan', 'waterPump']),
  mode: z.enum(['AUTO', 'FORCE_OFF'])
});

app.post('/api/actuators/override', async (req: Request, res: Response) => {
  const result = OverrideSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Comando de override inválido', details: result.error.format() });
  }

  const { actuator, mode } = result.data;
  currentOverride[actuator] = mode;

  // Reavalia imediatamente os atuadores com as leituras atuais
  currentActuators = await engine.evaluate(currentReadings, currentOverride);

  res.json({
    message: `Modo do atuador ${actuator} alterado para ${mode}`,
    actuators: currentActuators
  });
});

/**
 * 4. Dados históricos para a Tela 2 (Gráficos e Estatísticas)
 */
app.get('/api/history', (req: Request, res: Response) => {
  res.json(historyData);
});

/**
 * 5. Histórico de notificações WhatsApp para a Tela 3
 */
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(notifier.getHistory());
});

// Em produção (como no Render), serve os arquivos estáticos do frontend compilado
const frontendDist = path.resolve(process.cwd(), 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Greenhouse Monitor Backend] Servidor rodando na porta ${PORT}`);
  console.log(`Rotas ativas:`);
  console.log(`- GET  /api/state`);
  console.log(`- POST /api/telemetry`);
  console.log(`- POST /api/actuators/override`);
  console.log(`- GET  /api/history`);
  console.log(`- GET  /api/notifications`);
});
