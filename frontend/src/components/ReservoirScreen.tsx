import React from 'react';
import { 
  Waves, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  ShieldAlert,
  AlertTriangle,
  Droplet,
  Layers
} from 'lucide-react';
import { SystemState } from '../types.js';
import { WaterTankVisual } from './WaterTankVisual.js';

interface ReservoirScreenProps {
  state: SystemState;
}

export const ReservoirScreen: React.FC<ReservoirScreenProps> = ({ state }) => {
  const { sensors, notifications } = state;
  const percentage = sensors.waterPercentage ?? (sensors.waterLevel === 'BAIXO' ? 15 : sensors.waterLevel === 'MEDIO' ? 50 : 85);
  const TOTAL_CAPACITY = 200; // Capacidade total de 200 Litros
  const remainingLiters = Math.round((TOTAL_CAPACITY * percentage) / 100);
  const usedLiters = TOTAL_CAPACITY - remainingLiters;

  const getLevelInfo = () => {
    switch (sensors.waterLevel) {
      case 'CHEIO':
        return {
          title: 'Reservatório Cheio',
          desc: 'Nível ótimo de água para irrigação contínua.',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          bgColor: 'bg-emerald-500',
          barColor: 'from-blue-600 via-cyan-500 to-emerald-400',
          badgeBg: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30'
        };
      case 'MEDIO':
        return {
          title: 'Reservatório Médio',
          desc: 'Água suficiente, sem necessidade imediata de recarga.',
          textColor: 'text-cyan-700 dark:text-cyan-400',
          bgColor: 'bg-cyan-500',
          barColor: 'from-blue-600 to-cyan-400',
          badgeBg: 'bg-cyan-100 border-cyan-300 dark:bg-cyan-500/10 dark:border-cyan-500/30'
        };
      case 'BAIXO':
        return {
          title: 'Nível Crítico (Baixo)',
          desc: 'Risco iminente de queima a seco! Bomba travada.',
          textColor: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-500',
          barColor: 'from-red-600 to-amber-500',
          badgeBg: 'bg-red-100 border-red-300 dark:bg-red-500/20 dark:border-red-500/40'
        };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Monitoramento do Reservatório de Água & WhatsApp
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supervisão do nível de abastecimento e telemetria de alertas em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mostrador Visual do Tanque de Água (6 colunas) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors duration-200">
          <div>
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Reservatório Atual
              </span>
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${levelInfo.badgeBg} ${levelInfo.textColor}`}>
                {sensors.waterLevel === 'BAIXO' ? (
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                )}
                {levelInfo.title}
              </span>
            </div>

            {/* Bloco Central: Tanque 3D Animado + Porcentagem e Status */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Tanque com Ondas e Bolhas Animadas */}
              <WaterTankVisual percentage={percentage} waterLevel={sensors.waterLevel} />

              {/* Informações de Nível e Diagnóstico */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {percentage}%
                </span>
                <p className={`text-sm font-bold mt-1 ${levelInfo.textColor}`}>
                  {sensors.waterLevel === 'BAIXO' 
                    ? 'Baixo — Reabastecer com urgência' 
                    : sensors.waterLevel === 'MEDIO'
                    ? 'Médio — Reserva em nível seguro'
                    : 'Cheio — Capacidade plena de rega'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  {levelInfo.desc}
                </p>
              </div>
            </div>

            {/* 3 Cards de Telemetria de Volume */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Capacidade */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center">
                <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px] font-medium mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Capacidade</span>
                </div>
                <span className="font-mono font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  {TOTAL_CAPACITY} L
                </span>
              </div>

              {/* Usado */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center">
                <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px] font-medium mb-1">
                  <Droplet className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Usado</span>
                </div>
                <span className="font-mono font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  {usedLiters} L
                </span>
              </div>

              {/* Restante */}
              <div className={`p-3 rounded-2xl border flex flex-col items-center text-center ${
                sensors.waterLevel === 'BAIXO'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/30'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800'
              }`}>
                <div className="flex items-center space-x-1 text-[11px] font-medium mb-1">
                  {sensors.waterLevel === 'BAIXO' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span className={sensors.waterLevel === 'BAIXO' ? 'text-red-700 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                    Restante
                  </span>
                </div>
                <span className={`font-mono font-black text-base sm:text-lg ${
                  sensors.waterLevel === 'BAIXO' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {remainingLiters} L
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso com Limiar Crítico */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${levelInfo.barColor} transition-all duration-700`}
                style={{ width: `${percentage}%` }}
              />
              {/* Marcador do corte de 25% */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500/80 z-10"
                style={{ left: '25%' }}
                title="Corte Crítico (25%)"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{percentage}% do reservatório — <b className="text-slate-700 dark:text-slate-300">{remainingLiters} L disponíveis</b></span>
              <span className="text-red-500 dark:text-red-400 font-semibold">Corte: 25% (50 L)</span>
            </div>
          </div>
        </div>

        {/* Central de Alertas e Notificações WhatsApp (6 colunas) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Automação de WhatsApp (Alertas)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Disparo automático quando a água atinge nível crítico</p>
              </div>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5 animate-pulse"></span>
              Ativo
            </span>
          </div>

          {/* Feed de Notificações estilo WhatsApp */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-96 pr-2">
            {notifications.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
                <p>Nenhum alerta crítico disparado até o momento.</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">O nível da água está em parâmetros seguros.</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div 
                  key={index} 
                  className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 text-xs space-y-1.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Send className="w-3 h-3" /> Enviado para {notif.to}
                    </span>
                    <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="bg-emerald-100/70 dark:bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/30 text-emerald-900 dark:text-emerald-100 font-sans leading-relaxed">
                    {notif.message}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Cooldown anti-spam de WhatsApp: 1 min entre mensagens</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Interlock Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
