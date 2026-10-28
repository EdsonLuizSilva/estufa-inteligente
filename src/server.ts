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
  const config = notifier.getConfig();
  const lastAlertTimestamp = engine.getLastAlertTimestamp();
  const cooldownMs = engine.getAlertCooldownMs();
  const now = Date.now();
  const isCritical = currentReadings.waterLevel === 'BAIXO' || (currentReadings.waterPercentage !== undefined && currentReadings.waterPercentage <= 25);
  const nextAlertInMs = (lastAlertTimestamp > 0 && isCritical)
    ? Math.max(0, cooldownMs - (now - lastAlertTimestamp))
    : 0;

  res.json({
    sensors: currentReadings,
    actuators: currentActuators,
    notifications: notifier.getHistory(),
    simulationActive: isSimulationActive,
    whatsappConfig: {
      targetPhone: config.targetPhone,
      hasApiKey: Boolean(config.apiKey && config.apiKey.length > 0),
      enabled: config.enabled,
      lastAlertTimestamp,
      nextAlertInMs,
      isCritical
    }
  });
});

let isSimulationActive = false;
let simulationExpireTimer: NodeJS.Timeout | null = null;
let latestPhysicalReadings: SensorReadings | null = null;

/**
 * Monitor Autônomo em Background (Heartbeat de 5 segundos)
 * Garante que regras contínuas baseadas em tempo (como o envio a cada 5 minutos do alerta crítico)
 * sejam avaliadas e disparadas pontualmente, mesmo se nenhum novo POST de telemetria chegar no momento.
 */
setInterval(async () => {
  try {
    currentActuators = await engine.evaluate(currentReadings, currentOverride);
  } catch (err: any) {
    console.error('[AutomationEngine] Erro no ciclo de avaliação autônomo:', err.message);
  }
}, 5000);

/**
 * 2. Ingestão de telemetria dos sensores (ESP32 ou Simulador)
 */
app.post('/api/telemetry', async (req: Request, res: Response) => {
  res.setHeader('Connection', 'close');

  const result = TelemetrySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados de telemetria inválidos', details: result.error.format() });
  }

  const isFromSimulator = req.headers['x-simulation'] === 'true' || req.body?.isSimulation === true;
  const { temperature, airHumidity, soilStatus, waterLevel, waterPercentage } = result.data;
  
  const incomingReadings: SensorReadings = {
    temperature,
    airHumidity,
    soilStatus: soilStatus as SoilStatus,
    waterLevel: waterLevel as WaterLevel,
    waterPercentage: waterPercentage ?? (waterLevel === 'BAIXO' ? 15 : waterLevel === 'MEDIO' ? 50 : 90),
    timestamp: new Date().toISOString()
  };

  console.log(`[Telemetria] ${new Date().toLocaleTimeString('pt-BR')} [${isFromSimulator ? 'SIMULADOR' : 'ESP32 ' + req.ip}] -> Temp: ${incomingReadings.temperature}°C | Ar: ${incomingReadings.airHumidity}% | Solo: ${incomingReadings.soilStatus} | Água: ${incomingReadings.waterPercentage}% (${incomingReadings.waterLevel})`);

  if (!isFromSimulator) {
    // Guarda SEMPRE o dado físico mais recente do ESP32 em cache quente
    latestPhysicalReadings = incomingReadings;

    // Se o modo simulação estiver ativo, guardamos o dado no cache e mantemos os dados de simulação na tela
    if (isSimulationActive) {
      return res.json({
        message: 'Telemetria do ESP32 salva em buffer de prontidão (Modo Simulação ativo no painel)',
        simulationActive: true,
        sensors: currentReadings,
        actuators: currentActuators
      });
    }
  } else {
    // Veio do simulador
    isSimulationActive = true;
    if (simulationExpireTimer) clearTimeout(simulationExpireTimer);
    simulationExpireTimer = setTimeout(() => {
      isSimulationActive = false;
      if (latestPhysicalReadings) {
        currentReadings = latestPhysicalReadings;
        engine.evaluate(currentReadings, currentOverride).then(acts => { currentActuators = acts; });
      }
      console.log('[Simulação] Período de simulação finalizado. Retomando dados físicos do ESP32.');
    }, 15 * 60 * 1000);
  }

  currentReadings = incomingReadings;

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

/**
 * 6. Configurações de Notificação WhatsApp (CallMeBot)
 */
const WhatsAppSettingsSchema = z.object({
  targetPhone: z.string().min(8, 'Número de telefone deve conter DDD e número'),
  apiKey: z.string().optional(),
  enabled: z.boolean().optional()
});

app.get('/api/settings/whatsapp', (req: Request, res: Response) => {
  const config = notifier.getConfig();
  res.json({
    targetPhone: config.targetPhone,
    apiKey: config.apiKey,
    enabled: config.enabled,
    hasApiKey: Boolean(config.apiKey && config.apiKey.length > 0)
  });
});

app.post('/api/settings/whatsapp', (req: Request, res: Response) => {
  const result = WhatsAppSettingsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Configuração inválida', details: result.error.format() });
  }

  const updated = notifier.updateConfig(result.data);
  res.json({
    message: 'Configurações do WhatsApp atualizadas com sucesso!',
    settings: {
      targetPhone: updated.targetPhone,
      hasApiKey: Boolean(updated.apiKey && updated.apiKey.length > 0),
      enabled: updated.enabled
    }
  });
});

app.post('/api/settings/whatsapp/test', async (req: Request, res: Response) => {
  if (req.body && req.body.targetPhone) {
    notifier.updateConfig({
      targetPhone: req.body.targetPhone,
      apiKey: req.body.apiKey
    });
  }

  const success = await notifier.sendTestMessage();
  const lastNotification = notifier.getHistory()[0];

  res.json({
    message: success 
      ? 'Mensagem de teste enviada com sucesso!' 
      : (lastNotification?.error || 'Falha no envio da mensagem. Verifique chave e número.'),
    success,
    notifications: notifier.getHistory()
  });
});

/**
 * 7. Controle do Modo Simulação
 */
app.post('/api/simulation/reset', async (req: Request, res: Response) => {
  isSimulationActive = false;
  if (simulationExpireTimer) clearTimeout(simulationExpireTimer);

  // Restaura instantaneamente os últimos dados reais do ESP32 que foram recebidos no buffer
  if (latestPhysicalReadings) {
    currentReadings = latestPhysicalReadings;
    currentActuators = await engine.evaluate(currentReadings, currentOverride);
  }

  console.log('[Simulação] Modo simulação desativado. Dados do ESP32 restaurados instantaneamente.');
  res.json({ 
    message: 'Modo simulação desativado. Leituras físicas dos sensores do ESP32 retomadas instantaneamente!',
    simulationActive: false,
    sensors: currentReadings,
    actuators: currentActuators
  });
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

// Middleware global para capturar erros (ex: conexões abortadas pelo ESP32/cliente)
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err && (err.type === 'request.aborted' || err.message === 'request aborted')) {
    return;
  }
  console.error('[Server Error]', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ error: err.message || 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`[Greenhouse Monitor Backend] Servidor rodando na porta ${PORT}`);
  console.log(`Rotas ativas:`);
  console.log(`- GET  /api/state`);
  console.log(`- POST /api/telemetry`);
  console.log(`- POST /api/actuators/override`);
  console.log(`- GET  /api/history`);
  console.log(`- GET  /api/notifications`);
});
