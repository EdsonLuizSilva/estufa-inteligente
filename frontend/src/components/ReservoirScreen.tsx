import React from 'react';
import { 
  Waves, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  ShieldAlert 
} from 'lucide-react';
import { SystemState } from '../types.js';

interface ReservoirScreenProps {
  state: SystemState;
}

export const ReservoirScreen: React.FC<ReservoirScreenProps> = ({ state }) => {
  const { sensors, notifications } = state;
  const percentage = sensors.waterPercentage ?? (sensors.waterLevel === 'BAIXO' ? 15 : sensors.waterLevel === 'MEDIO' ? 50 : 85);

  const getLevelInfo = () => {
    switch (sensors.waterLevel) {
      case 'CHEIO':
        return {
          title: 'Reservatório Cheio',
          desc: 'Nível ótimo de água para irrigação contínua.',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500',
          barColor: 'from-blue-600 to-cyan-400',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30'
        };
      case 'MEDIO':
        return {
          title: 'Reservatório Médio',
          desc: 'Água suficiente, sem necessidade imediata de recarga.',
          textColor: 'text-cyan-400',
          bgColor: 'bg-cyan-500',
          barColor: 'from-blue-600 to-cyan-500',
          badgeBg: 'bg-cyan-500/10 border-cyan-500/30'
        };
      case 'BAIXO':
        return {
          title: 'Nível Crítico (Baixo)',
          desc: 'Risco iminente de queima a seco! Bomba travada.',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500',
          barColor: 'from-red-600 to-amber-500',
          badgeBg: 'bg-red-500/20 border-red-500/40'
        };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-400" />
          Monitoramento do Reservatório de Água & WhatsApp
        </h3>
        <p className="text-xs text-slate-400">
          Supervisão do nível de abastecimento e telemetria de alertas em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mostrador Visual do Tanque de Água (5 colunas) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col items-center">
          <h4 className="text-sm font-semibold text-slate-300 self-start mb-6">Tanque de Água da Estufa</h4>

          {/* Tanque Estilizado */}
          <div className="relative w-48 h-72 border-4 border-slate-700 bg-slate-950/80 rounded-3xl p-2 flex flex-col justify-end overflow-hidden shadow-2xl">
            {/* Linhas de graduação do tanque */}
            <div className="absolute inset-y-0 right-2 flex flex-col justify-between py-6 text-[10px] text-slate-600 font-mono pointer-events-none z-10">
              <span>100% —</span>
              <span>75% —</span>
              <span>50% —</span>
              <span>25% —</span>
              <span>0% —</span>
            </div>

            {/* Linha de perigo (marca de 25%) */}
            <div className="absolute bottom-[25%] left-0 right-0 border-b-2 border-dashed border-red-500/60 z-10">
              <span className="absolute -top-3 left-2 text-[9px] text-red-400 font-bold bg-slate-950 px-1 rounded">
                LIMIAR CRÍTICO
              </span>
            </div>

            {/* Coluna de Água Animada */}
            <div 
              className={`w-full rounded-2xl bg-gradient-to-t ${levelInfo.barColor} transition-all duration-700 relative overflow-hidden flex items-center justify-center`}
              style={{ height: `${percentage}%` }}
            >
              {/* Efeito de onda na superfície */}
              <div className="absolute inset-x-0 top-0 h-2 bg-white/30 animate-pulse"></div>
              
              <span className="font-mono font-black text-2xl text-white drop-shadow-md z-10">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Status do Reservatório */}
          <div className="mt-6 w-full text-center">
            <span className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full border ${levelInfo.badgeBg} ${levelInfo.textColor}`}>
              {sensors.waterLevel === 'BAIXO' ? (
                <ShieldAlert className="w-4 h-4 mr-1.5 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              )}
              {levelInfo.title}
            </span>
            <p className="text-xs text-slate-400 mt-2">{levelInfo.desc}</p>
          </div>
        </div>

        {/* Central de Alertas e Notificações WhatsApp (7 colunas) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Automação de WhatsApp (Alertas)</h4>
                <p className="text-xs text-slate-400">Disparo automático quando a água atinge nível crítico</p>
              </div>
            </div>
            <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Ativo
            </span>
          </div>

          {/* Feed de Notificações estilo WhatsApp */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-96 pr-2">
            {notifications.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
                <p>Nenhum alerta crítico disparado até o momento.</p>
                <p className="text-xs text-slate-600 mt-1">O nível da água está em parâmetros seguros.</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div 
                  key={index} 
                  className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-4 text-xs space-y-1.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Send className="w-3 h-3" /> Enviado para {notif.to}
                    </span>
                    <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-700/30 text-emerald-100 font-sans leading-relaxed">
                    {notif.message}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400 flex items-center justify-between">
            <span>Cooldown anti-spam de WhatsApp: 1 min entre mensagens</span>
            <span className="font-mono text-emerald-400 font-bold">Interlock Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
