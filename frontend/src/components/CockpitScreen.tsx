import React from 'react';
import {
  Wind,
  Waves,
  AlertTriangle,
  XCircle,
  Power,
  SlidersHorizontal
} from 'lucide-react';
import { SystemState, ActuatorMode } from '../types.js';
import tempColdIcon from '../assets/images/temperature-cold.svg';
import tempIdealIcon from '../assets/images/temperature-ideal.svg';
import tempHotIcon from '../assets/images/temperature-hot.svg';
import tempCriticalIcon from '../assets/images/temperature-critical.svg';
import humidityDryIcon from '../assets/images/humidity-dry.svg';
import humidityModerateIcon from '../assets/images/humidity-moderate.svg';
import humidityIdealIcon from '../assets/images/humidity-ideal.svg';
import humiditySaturatedIcon from '../assets/images/humidity-saturated.svg';
import soilDryIcon from '../assets/images/soil-dry.svg';
import soilIdealIcon from '../assets/images/soil-ideal.svg';
import soilWetIcon from '../assets/images/soil-wet.svg';

interface CockpitScreenProps {
  state: SystemState;
  onOverride?: (actuator: 'fan' | 'waterPump', mode: ActuatorMode) => void;
}

export const CockpitScreen: React.FC<CockpitScreenProps> = ({ state, onOverride }) => {
  const { sensors, actuators } = state;

  const getSoilBadge = () => {
    switch (sensors.soilStatus) {
      case 'MUITO_MOLHADO':
        return {
          label: 'Muito Molhado',
          color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40',
          desc: 'Solo saturado de água',
          imageSrc: soilWetIcon,
          animationClass: 'animate-soil-ripple',
          auraColor: 'bg-blue-500/15 dark:bg-blue-500/25',
          containerBorder: 'border-blue-400/30 dark:border-blue-500/40',
          containerBg: 'bg-gradient-to-br from-blue-500/15 via-sky-500/10 to-transparent dark:from-blue-500/25 dark:to-transparent',
        };
      case 'UMIDO':
        return {
          label: 'Úmido (Ideal)',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40',
          desc: 'Nível perfeito para a planta',
          imageSrc: soilIdealIcon,
          animationClass: 'animate-gentle-float',
          auraColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          containerBorder: 'border-emerald-400/30 dark:border-emerald-500/30',
          containerBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:to-transparent',
        };
      case 'SECO':
        return {
          label: 'Seco (Necessita Rega)',
          color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40 animate-pulse',
          desc: 'Solo precisando de água',
          imageSrc: soilDryIcon,
          animationClass: 'animate-soil-wither',
          auraColor: 'bg-amber-500/15 dark:bg-amber-500/20',
          containerBorder: 'border-amber-400/30 dark:border-amber-500/40',
          containerBg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:to-transparent',
        };
    }
  };

  const soilBadge = getSoilBadge();

  const getTemperatureThermalState = (temp: number) => {
    if (temp < 21.0) {
      return {
        state: 'FRIO',
        label: 'Frio (Abaixo)',
        badgeColor: 'text-sky-700 bg-sky-100 border border-sky-300 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-800',
        animationClass: 'animate-shiver',
        imageSrc: tempColdIcon,
        auraColor: 'bg-sky-500/15 dark:bg-sky-500/20',
        containerBorder: 'border-sky-400/30 dark:border-sky-500/40',
        containerBg: 'bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-500/20 dark:to-transparent',
        statusDesc: 'Temperatura baixa para mudas',
      };
    } else if (temp < 28.0) {
      return {
        state: 'IDEAL',
        label: 'Ideal (Estável)',
        badgeColor: 'text-emerald-700 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800',
        animationClass: 'animate-gentle-float',
        imageSrc: tempIdealIcon,
        auraColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        containerBorder: 'border-emerald-400/30 dark:border-emerald-500/30',
        containerBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:to-transparent',
        statusDesc: 'Faixa ótima de cultivo',
      };
    } else if (temp < 34.0) {
      return {
        state: 'ALTA',
        label: 'Alta (Ventilando)',
        badgeColor: 'text-orange-600 bg-orange-100 border border-orange-300 dark:text-orange-400 dark:bg-orange-950/50 dark:border-orange-800 animate-pulse',
        animationClass: 'animate-heat-throb',
        imageSrc: tempHotIcon,
        auraColor: 'bg-orange-500/15 dark:bg-orange-500/25',
        containerBorder: 'border-orange-400/40 dark:border-orange-500/40',
        containerBg: 'bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent dark:from-orange-500/25 dark:to-transparent',
        statusDesc: 'Ventilador acionado (≥ 28°C)',
      };
    } else {
      return {
        state: 'CRITICA',
        label: 'Crítica (Alerta Máximo)',
        badgeColor: 'text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-950/60 dark:border-red-800 animate-bounce',
        animationClass: 'animate-heat-shake',
        imageSrc: tempCriticalIcon,
        auraColor: 'bg-red-500/25 dark:bg-red-500/35',
        containerBorder: 'border-red-500/40 dark:border-red-500/50',
        containerBg: 'bg-gradient-to-br from-red-500/20 via-orange-500/15 to-transparent dark:from-red-500/30 dark:to-transparent',
        statusDesc: 'Risco térmico severo!',
      };
    }
  };

  const getHumidityAirState = (humidity: number) => {
    if (humidity < 45) {
      return {
        state: 'SECO',
        label: 'Seco (Alerta)',
        badgeColor: 'text-amber-700 bg-amber-100 border border-amber-300 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800 animate-pulse',
        animationClass: 'animate-dry-fade',
        imageSrc: humidityDryIcon,
        auraColor: 'bg-amber-500/15 dark:bg-amber-500/20',
        containerBorder: 'border-amber-400/30 dark:border-amber-500/40',
        containerBg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:to-transparent',
        statusDesc: 'Risco de dessecação das folhas',
      };
    } else if (humidity < 60) {
      return {
        state: 'MODERADO',
        label: 'Moderado',
        badgeColor: 'text-sky-700 bg-sky-100 border border-sky-300 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-800',
        animationClass: 'animate-gentle-float',
        imageSrc: humidityModerateIcon,
        auraColor: 'bg-sky-500/10 dark:bg-sky-500/15',
        containerBorder: 'border-sky-400/30 dark:border-sky-500/30',
        containerBg: 'bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-500/20 dark:to-transparent',
        statusDesc: 'Nível aceitável para o cultivo',
      };
    } else if (humidity < 80) {
      return {
        state: 'IDEAL',
        label: 'Ideal (Microclima)',
        badgeColor: 'text-cyan-700 bg-cyan-100 border border-cyan-300 dark:text-cyan-400 dark:bg-cyan-950/50 dark:border-cyan-800',
        animationClass: 'animate-water-breathe',
        imageSrc: humidityIdealIcon,
        auraColor: 'bg-cyan-500/15 dark:bg-cyan-500/25',
        containerBorder: 'border-cyan-400/40 dark:border-cyan-500/40',
        containerBg: 'bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-transparent dark:from-cyan-500/25 dark:to-transparent',
        statusDesc: 'Microclima perfeito da estufa',
      };
    } else {
      return {
        state: 'SATURADO',
        label: 'Saturado (Condensação)',
        badgeColor: 'text-blue-700 bg-blue-100 border border-blue-300 dark:text-blue-400 dark:bg-blue-950/60 dark:border-blue-800 animate-pulse',
        animationClass: 'animate-droplet-pulse',
        imageSrc: humiditySaturatedIcon,
        auraColor: 'bg-blue-500/25 dark:bg-blue-500/35',
        containerBorder: 'border-blue-500/40 dark:border-blue-500/50',
        containerBg: 'bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-transparent dark:from-blue-500/30 dark:to-transparent',
        statusDesc: 'Atenção para risco de fungos',
      };
    }
  };

  const thermalState = getTemperatureThermalState(sensors.temperature);
  const humidityState = getHumidityAirState(sensors.airHumidity);

  return (
    <div className="space-y-6">
      {/* Alerta crítico caso a água esteja baixa */}
      {sensors.waterLevel === 'BAIXO' && (
        <div className="bg-red-50 dark:bg-red-950/80 border-2 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-red-500/10 dark:shadow-red-950/50 animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-lg text-red-900 dark:text-white">INTERLOCK DE SEGURANÇA ATIVADO</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
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
        <div className="group bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-none backdrop-blur-md transition-all duration-300 hover:shadow-md dark:hover:border-slate-700 flex flex-col justify-between">
          <div className={`absolute -right-6 -bottom-6 w-36 h-36 ${thermalState.auraColor} rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${sensors.temperature >= 28 ? (sensors.temperature >= 34 ? 'animate-pulse-fast' : 'animate-pulse') : ''}`} />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Temperatura Interna</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${thermalState.badgeColor}`}>
              {thermalState.label}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {sensors.temperature.toFixed(1)}
                </span>
                <span className="text-2xl text-slate-400 font-bold">°C</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium transition-colors duration-300">
                {thermalState.statusDesc}
              </span>
            </div>

            <div className={`relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-2 rounded-2xl ${thermalState.containerBg} border ${thermalState.containerBorder} shadow-sm transition-colors duration-500`}>
              <img
                key={thermalState.state}
                src={thermalState.imageSrc}
                alt={`Temperatura: ${thermalState.label}`}
                className={`w-full h-full object-contain select-none block transform-gpu ${thermalState.animationClass}`}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
            <span className="text-slate-500 dark:text-slate-400">Ativação ventilador: <b className="text-slate-700 dark:text-slate-300">28.0°C</b></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">DHT22 Ativo</span>
          </div>
        </div>

        {/* Cartão de Umidade do Ar */}
        <div className="group bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-none backdrop-blur-md transition-all duration-300 hover:shadow-md dark:hover:border-slate-700 flex flex-col justify-between">
          <div className={`absolute -right-6 -bottom-6 w-36 h-36 ${humidityState.auraColor} rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${sensors.airHumidity >= 80 ? 'animate-pulse' : ''}`} />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Umidade do Ar</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${humidityState.badgeColor}`}>
              {humidityState.label}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {sensors.airHumidity}
                </span>
                <span className="text-2xl text-slate-400 font-bold">%</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium transition-colors duration-300">
                {humidityState.statusDesc}
              </span>
            </div>

            <div className={`relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-2 rounded-2xl ${humidityState.containerBg} border ${humidityState.containerBorder} shadow-sm transition-colors duration-500`}>
              <img
                key={humidityState.state}
                src={humidityState.imageSrc}
                alt={`Umidade do Ar: ${humidityState.label}`}
                className={`w-full h-full object-contain select-none block transform-gpu ${humidityState.animationClass}`}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
            <span className="text-slate-500 dark:text-slate-400">Faixa ideal: <b className="text-slate-700 dark:text-slate-300">50% - 80%</b></span>
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">Monitorando</span>
          </div>
        </div>

        {/* Cartão de Umidade do Solo */}
        <div className="group bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-none backdrop-blur-md transition-all duration-300 hover:shadow-md dark:hover:border-slate-700 flex flex-col justify-between">
          <div className={`absolute -right-6 -bottom-6 w-36 h-36 ${soilBadge.auraColor} rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${sensors.soilStatus === 'SECO' ? 'animate-pulse' : ''}`} />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Umidade do Solo</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50">
              Higrômetro
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 relative z-10">
            <div className="flex flex-col">
              <span className={`inline-block text-base sm:text-lg font-bold px-3 py-1.5 rounded-xl border transition-all duration-300 ${soilBadge.color}`}>
                {soilBadge.label}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium transition-colors duration-300">
                {soilBadge.desc}
              </p>
            </div>

            <div className={`relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-2 rounded-2xl ${soilBadge.containerBg} border ${soilBadge.containerBorder} shadow-sm transition-colors duration-500`}>
              <img
                key={sensors.soilStatus}
                src={soilBadge.imageSrc}
                alt={`Umidade do Solo: ${soilBadge.label}`}
                className={`w-full h-full object-contain select-none block transform-gpu ${soilBadge.animationClass}`}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
            <span className="text-slate-500 dark:text-slate-400">Sensor Resistivo</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">3 Estados Analógicos</span>
          </div>
        </div>
      </div>

      {/* Seção dos Atuadores Autônomos (Ventilador & Bomba) */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight pt-2">
        Automações & Atuadores em Tempo Real
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Atuador: Ventilador */}
        {(() => {
          const fanMode = actuators.mode?.fan ?? 'AUTO';
          return (
            <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${fanMode === 'FORCE_OFF'
                ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700/80 shadow-sm'
                : actuators.fanOn
                  ? 'bg-gradient-to-br from-orange-50 via-white to-white dark:from-orange-950/40 dark:via-slate-900 dark:to-slate-900 border-orange-300 dark:border-orange-500/50 shadow-lg shadow-orange-500/10 dark:shadow-orange-950/30'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none'
              }`}>
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3.5 rounded-2xl ${fanMode === 'FORCE_OFF'
                        ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        : actuators.fanOn
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                      <Wind className={`w-8 h-8 ${actuators.fanOn ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Ventilador da Estufa</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Controle térmico de convecção</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {fanMode === 'FORCE_OFF' ? (
                      <span className="flex items-center text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                        <Power className="w-3.5 h-3.5 mr-1" /> FORÇADO DESLIGADO
                      </span>
                    ) : actuators.fanOn ? (
                      <span className="flex items-center text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 animate-ping mr-2"></span>
                        LIGADO
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> DESLIGADO
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                    {fanMode === 'FORCE_OFF' ? 'Status de Operação:' : 'Motivo da Decisão Automática:'}
                  </span>
                  {actuators.reason.fan}
                </div>
              </div>

              {/* Controle Manual do Ventilador */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="font-medium">Modo:</span>
                  <span className={`font-semibold ${fanMode === 'FORCE_OFF' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {fanMode === 'FORCE_OFF' ? 'Manual' : 'Automático'}
                  </span>
                </div>

                <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => onOverride?.('fan', 'AUTO')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${fanMode === 'AUTO'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => onOverride?.('fan', 'FORCE_OFF')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${fanMode === 'FORCE_OFF'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                  >
                    <Power className="w-3 h-3" /> Desligar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Atuador: Bomba de Irrigação */}
        {(() => {
          const waterPumpMode = actuators.mode?.waterPump ?? 'AUTO';
          return (
            <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${waterPumpMode === 'FORCE_OFF'
                ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700/80 shadow-sm'
                : actuators.waterPumpOn
                  ? 'bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 border-blue-300 dark:border-blue-500/50 shadow-lg shadow-blue-500/10 dark:shadow-blue-950/30'
                  : sensors.waterLevel === 'BAIXO'
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-500/40'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none'
              }`}>
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3.5 rounded-2xl ${waterPumpMode === 'FORCE_OFF'
                        ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        : actuators.waterPumpOn
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : sensors.waterLevel === 'BAIXO'
                            ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                      <Waves className={`w-8 h-8 ${actuators.waterPumpOn ? 'animate-pulse-fast' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Bomba de Água (Rega)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gotejamento automatizado</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {waterPumpMode === 'FORCE_OFF' ? (
                      <span className="flex items-center text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                        <Power className="w-3.5 h-3.5 mr-1" /> FORÇADA DESLIGADA
                      </span>
                    ) : actuators.waterPumpOn ? (
                      <span className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping mr-2"></span>
                        LIGADA (REGANDO)
                      </span>
                    ) : sensors.waterLevel === 'BAIXO' ? (
                      <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-500/20 dark:border-red-500/40 px-3 py-1 rounded-full flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> BLOQUEADA
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> DESLIGADA
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                    {waterPumpMode === 'FORCE_OFF' ? 'Status de Operação:' : 'Motivo da Decisão Automática:'}
                  </span>
                  {actuators.reason.waterPump}
                </div>
              </div>

              {/* Controle Manual da Bomba de Água */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="font-medium">Modo:</span>
                  <span className={`font-semibold ${waterPumpMode === 'FORCE_OFF' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {waterPumpMode === 'FORCE_OFF' ? 'Manual' : 'Automático'}
                  </span>
                </div>

                <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => onOverride?.('waterPump', 'AUTO')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${waterPumpMode === 'AUTO'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => onOverride?.('waterPump', 'FORCE_OFF')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${waterPumpMode === 'FORCE_OFF'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                  >
                    <Power className="w-3 h-3" /> Desligar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
