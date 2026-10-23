import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Wind, 
  Waves, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react';
import { SystemState } from '../types.js';

interface CockpitScreenProps {
  state: SystemState;
}

export const CockpitScreen: React.FC<CockpitScreenProps> = ({ state }) => {
  const { sensors, actuators } = state;

  const getSoilBadge = () => {
    switch (sensors.soilStatus) {
      case 'MUITO_MOLHADO':
        return {
          label: 'Muito Molhado',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          desc: 'Solo saturado de água'
        };
      case 'UMIDO':
        return {
          label: 'Úmido (Ideal)',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          desc: 'Nível perfeito para a planta'
        };
      case 'SECO':
        return {
          label: 'Seco (Necessita Rega)',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse',
          desc: 'Solo precisando de água'
        };
    }
  };

  const soilBadge = getSoilBadge();

  return (
    <div className="space-y-6">
      {/* Alerta crítico caso a água esteja baixa */}
      {sensors.waterLevel === 'BAIXO' && (
        <div className="bg-red-950/80 border-2 border-red-500 text-red-200 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-red-950/50 animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-lg text-white">INTERLOCK DE SEGURANÇA ATIVADO</h4>
              <p className="text-sm text-red-300">
                Reservatório com nível crítico de água! A bomba foi travada para evitar queima a seco e o alerta foi enviado via WhatsApp.
              </p>
            </div>
          </div>
          <span className="bg-red-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            Bomba Bloqueada
          </span>
        </div>
      )}

      {/* Grid de Sensores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cartão de Temperatura */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">Temperatura Interna</span>
            <div className={`p-2.5 rounded-2xl ${sensors.temperature >= 28 ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-5xl font-black tracking-tight text-white font-mono">
              {sensors.temperature.toFixed(1)}
            </span>
            <span className="text-2xl text-slate-400 font-semibold">°C</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Limiar do Ventilador: 28.0°C</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${sensors.temperature >= 28 ? 'text-orange-400 bg-orange-950/50' : 'text-slate-400'}`}>
              {sensors.temperature >= 28 ? 'Alta (Ventilando)' : 'Normal'}
            </span>
          </div>
        </div>

        {/* Cartão de Umidade do Ar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">Umidade do Ar</span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-5xl font-black tracking-tight text-white font-mono">
              {sensors.airHumidity}
            </span>
            <span className="text-2xl text-slate-400 font-semibold">%</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Status Ambiente</span>
            <span className="text-cyan-400 font-semibold">Microclima Ativo</span>
          </div>
        </div>

        {/* Cartão de Umidade do Solo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">Umidade do Solo</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-block text-lg font-bold px-3 py-1.5 rounded-xl border ${soilBadge.color}`}>
              {soilBadge.label}
            </span>
            <p className="text-xs text-slate-400 mt-2">{soilBadge.desc}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Sensor Higrômetro</span>
            <span className="text-slate-300 font-medium">3 Estados Analógicos</span>
          </div>
        </div>
      </div>

      {/* Seção dos Atuadores Autônomos (Ventilador & Bomba) */}
      <h3 className="text-xl font-bold text-white tracking-tight pt-2">
        Automações & Atuadores em Tempo Real
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Atuador: Ventilador */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          actuators.fanOn 
            ? 'bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-900 border-orange-500/50 shadow-lg shadow-orange-950/30' 
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3.5 rounded-2xl ${
                actuators.fanOn 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                <Wind className={`w-8 h-8 ${actuators.fanOn ? 'animate-spin-slow' : ''}`} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Ventilador da Estufa</h4>
                <p className="text-xs text-slate-400">Controle térmico de convecção</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              {actuators.fanOn ? (
                <span className="flex items-center text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping mr-2"></span>
                  LIGADO
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full flex items-center">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> DESLIGADO
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-950/50 rounded-2xl border border-slate-800/60 text-xs text-slate-300">
            <span className="text-slate-400 font-semibold block mb-1">Motivo da Decisão Automática:</span>
            {actuators.reason.fan}
          </div>
        </div>

        {/* Atuador: Bomba de Irrigação */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          actuators.waterPumpOn 
            ? 'bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/50 shadow-lg shadow-blue-950/30' 
            : sensors.waterLevel === 'BAIXO'
            ? 'bg-red-950/30 border-red-500/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3.5 rounded-2xl ${
                actuators.waterPumpOn 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' 
                  : sensors.waterLevel === 'BAIXO'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                <Waves className={`w-8 h-8 ${actuators.waterPumpOn ? 'animate-pulse-fast' : ''}`} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Bomba de Água (Rega)</h4>
                <p className="text-xs text-slate-400">Gotejamento automatizado</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              {actuators.waterPumpOn ? (
                <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping mr-2"></span>
                  LIGADA (REGANDO)
                </span>
              ) : sensors.waterLevel === 'BAIXO' ? (
                <span className="text-xs font-bold text-red-400 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> BLOQUEADA
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full flex items-center">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> DESLIGADA
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-950/50 rounded-2xl border border-slate-800/60 text-xs text-slate-300">
            <span className="text-slate-400 font-semibold block mb-1">Motivo da Decisão Automática:</span>
            {actuators.reason.waterPump}
          </div>
        </div>
      </div>
    </div>
  );
};
