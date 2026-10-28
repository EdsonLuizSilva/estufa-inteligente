import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  ShieldAlert,
  AlertTriangle,
  Droplet,
  Layers,
  Phone,
  Key,
  Save,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Check,
  ChevronDown
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

  // Estados locais para configuração de WhatsApp e CallMeBot
  const [targetPhone, setTargetPhone] = useState(state.whatsappConfig?.targetPhone || '+55 11 99999-8888');
  const [apiKey, setApiKey] = useState('');
  const [hasSavedKey, setHasSavedKey] = useState(Boolean(state.whatsappConfig?.hasApiKey));
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Carrega configurações iniciais da API
  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then(res => res.json())
      .then(data => {
        if (data.targetPhone) setTargetPhone(data.targetPhone);
        if (data.hasApiKey) {
          setHasSavedKey(true);
          setApiKey(data.apiKey || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhone,
          apiKey
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ message: 'Número e configurações salvos com sucesso!', type: 'success' });
        setHasSavedKey(data.settings?.hasApiKey ?? false);
      } else {
        setFeedback({ message: data.error || 'Erro ao salvar configurações.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: 'Erro de comunicação ao salvar.', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleTestSend = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhone,
          apiKey
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ 
          message: 'Mensagem de teste enviada com sucesso para o seu WhatsApp!', 
          type: 'success' 
        });
      } else {
        setFeedback({ 
          message: data.message || 'Falha ao enviar mensagem de teste.', 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setFeedback({ 
        message: 'Erro de conexão com o servidor da Estufa. Certifique-se de que o backend está rodando no terminal (npm start).', 
        type: 'error' 
      });
    } finally {
      setIsTesting(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

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
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-200 space-y-5">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Automação de WhatsApp (Alertas)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Disparo a cada 5 min quando a água atinge nível crítico</p>
              </div>
            </div>
            <span className={`border text-xs font-semibold px-2.5 py-1 rounded-full flex items-center ${
              hasSavedKey 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400' 
                : 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 animate-pulse ${hasSavedKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {hasSavedKey ? 'CallMeBot Conectado' : 'Simulador Local'}
            </span>
          </div>

          {/* Card de Configuração do Número Cadastrado & CallMeBot */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-xs transition-all duration-200">
            <div className={`flex items-center justify-between transition-colors duration-200 ${showConfig ? 'pb-3 border-b border-slate-200 dark:border-slate-800' : ''}`}>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  Configurar Destinatário & CallMeBot
                </span>
                <button 
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                  title={showConfig ? "Ocultar configurações" : "Exibir configurações"}
                >
                  <span>{showConfig ? 'Ocultar' : 'Exibir'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ease-out transform ${showConfig ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </div>

              {showConfig && (
                <button 
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium transition-all"
                >
                  {showGuide ? 'Ocultar instruções' : 'Como ativar grátis?'}
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Conteúdo com animação de expansão suave */}
            <div className={`smooth-collapse ${showConfig ? 'open' : ''}`}>
              <div className="smooth-collapse-inner pt-3 space-y-3">
                {/* Guia Rápido de Ativação do CallMeBot */}
                {showGuide && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px] animate-fadeIn">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Como receber no seu WhatsApp real em 3 passos:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      <li>Adicione aos contatos: <b className="font-mono text-emerald-700 dark:text-emerald-300">+34 941 07 41 84</b></li>
                      <li>Envie no WhatsApp para ele: <code className="bg-emerald-200/60 dark:bg-emerald-900/60 px-1 py-0.5 rounded font-mono">I allow callmebot to send me messages</code></li>
                      <li>Copie a <code className="font-bold">apiKey</code> que o bot responder e cole no campo abaixo.</li>
                    </ol>
                  </div>
                )}

                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Número Cadastrado (com DDD)
                      </label>
                      <input
                        type="text"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        placeholder="+55 11 99999-8888"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Key className="w-3 h-3 text-slate-400" />
                        API Key CallMeBot (opcional)
                      </label>
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Ex: 1234567 (ou vazio para simular)"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {feedback && (
                    <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      feedback.type === 'success' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700' 
                        : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                    }`}>
                      {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? 'Salvando...' : 'Salvar Número'}
                    </button>

                    <button
                      type="button"
                      onClick={handleTestSend}
                      disabled={isTesting}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-500" />
                      {isTesting ? 'Enviando...' : 'Testar Disparo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Feed de Notificações estilo WhatsApp */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-72 pr-2">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Histórico de Mensagens ({notifications.length})
            </div>

            {notifications.length === 0 ? (
              <div className="h-36 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500/40 mb-2" />
                <p>Nenhum alerta crítico disparado até o momento.</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">O nível da água está seguro.</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div 
                  key={index} 
                  className={`border rounded-2xl p-3.5 text-xs space-y-1.5 relative overflow-hidden ${
                    notif.sent 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40' 
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Send className="w-3 h-3" /> Enviado para {notif.to}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                        {notif.provider || 'WhatsApp'}
                      </span>
                      <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-100/70 dark:bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/30 text-emerald-900 dark:text-emerald-100 font-sans leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </div>
                  {notif.error && (
                    <div className="text-[10px] text-red-600 dark:text-red-400 font-mono">
                      Erro: {notif.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rodapé com Política de Cooldown & Interlock */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1.5">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-emerald-500" />
              Intervalo de alerta: <b>A cada 5 minutos</b> enquanto o nível for crítico
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Interlock Ativo (Bomba Travada)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
