import React from 'react';
import { WaterLevel } from '../types.js';

interface WaterTankVisualProps {
  percentage: number;
  waterLevel: WaterLevel;
}

export const WaterTankVisual: React.FC<WaterTankVisualProps> = ({ percentage, waterLevel }) => {
  const isCritical = waterLevel === 'BAIXO' || percentage <= 25;
  const isFull = waterLevel === 'CHEIO' || percentage >= 75;

  // Gradientes e cores dinâmicas da água
  const getWaterColors = () => {
    if (isCritical) {
      return {
        wave1: '#ef4444',
        wave2: '#f97316',
        gradientStart: '#ef4444',
        gradientEnd: '#b91c1c',
        glowColor: 'rgba(239, 68, 68, 0.45)',
        statusBeacon: 'bg-red-500 animate-ping',
        statusColor: 'text-red-500',
      };
    }
    if (isFull) {
      return {
        wave1: '#06b6d4',
        wave2: '#0284c7',
        gradientStart: '#22d3ee',
        gradientEnd: '#1d4ed8',
        glowColor: 'rgba(6, 182, 212, 0.35)',
        statusBeacon: 'bg-emerald-400',
        statusColor: 'text-emerald-400',
      };
    }
    return {
      wave1: '#38bdf8',
      wave2: '#0ea5e9',
      gradientStart: '#38bdf8',
      gradientEnd: '#1e40af',
      glowColor: 'rgba(14, 165, 233, 0.35)',
      statusBeacon: 'bg-cyan-400',
      statusColor: 'text-cyan-400',
    };
  };

  const colors = getWaterColors();

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      {/* Aura Difusa de Fundo */}
      <div 
        className={`absolute w-48 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isCritical ? 'bg-red-500/20 animate-pulse' : 'bg-blue-500/15'
        }`}
      />

      {/* SVG Principal do Silo / Tanque Tecnológico */}
      <svg 
        viewBox="0 0 160 220" 
        className="w-44 h-60 sm:w-48 sm:h-64 drop-shadow-xl overflow-visible"
      >
        <defs>
          {/* Clip path cilíndrico interno onde o líquido e ondas se movem */}
          <clipPath id="tankInteriorClip">
            <rect x="22" y="32" width="116" height="152" rx="16" />
          </clipPath>

          {/* Gradiente da Coluna de Água Principal */}
          <linearGradient id="tankLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.gradientStart} />
            <stop offset="70%" stopColor={colors.gradientEnd} />
            <stop offset="100%" stopColor={isCritical ? '#7f1d1d' : '#172554'} />
          </linearGradient>

          {/* Reflexo Especular de Vidro / Acrílico */}
          <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="95%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          {/* Gradiente Metálico das Tampas e Flanges */}
          <linearGradient id="metalChrome" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* 1. ESTRUTURA DO TOPO (Bocal de entrada, sensores e tampa metálica) */}
        {/* Válvula / Tubulação de Entrada Superior */}
        <rect x="68" y="4" width="24" height="12" rx="3" fill="url(#metalChrome)" stroke="#475569" strokeWidth="1" />
        <rect x="64" y="2" width="32" height="4" rx="2" fill="url(#metalChrome)" />

        {/* Cúpula / Tampa Superior do Tanque */}
        <path d="M 22 34 C 22 18 138 18 138 34 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="1.5" />
        
        {/* Sensor de Nível Óptico / LED Beacon */}
        <circle cx="80" cy="18" r="4.5" fill={isCritical ? '#ef4444' : '#22c55e'} />
        <circle cx="80" cy="18" r="7" fill="none" stroke={isCritical ? '#ef4444' : '#22c55e'} opacity="0.6" className={isCritical ? 'animate-ping' : ''} />

        {/* 2. BASE DO TANQUE (Suporte metálico e conexão da bomba) */}
        {/* Pés / Suporte do Tanque */}
        <rect x="30" y="196" width="16" height="14" rx="2" fill="url(#metalDark)" />
        <rect x="114" y="196" width="16" height="14" rx="2" fill="url(#metalDark)" />
        
        {/* Base Metálica Arredondada */}
        <path d="M 22 180 C 22 200 138 200 138 180 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="1.5" />

        {/* Tubulação de Saída Inferior (Conexão com a Bomba de Irrigação) */}
        <rect x="70" y="194" width="20" height="18" rx="3" fill="url(#metalChrome)" stroke="#475569" strokeWidth="1" />
        <path d="M 80 200 L 80 216 L 98 216" stroke="url(#metalChrome)" strokeWidth="8" strokeLinecap="round" fill="none" />

        {/* 3. CORPO TRANSPARENTE DO RESERVATÓRIO (Fundo interno) */}
        <rect 
          x="22" 
          y="32" 
          width="116" 
          height="152" 
          rx="16" 
          fill="#f8fafc" 
          fillOpacity="0.15" 
          stroke="#94a3b8" 
          strokeWidth="2.5" 
          className="dark:fill-slate-900/60 dark:stroke-slate-700"
        />

        {/* 4. CONTEÚDO LÍQUIDO COM ONDAS E BOLHAS (Clipado no interior) */}
        <g clipPath="url(#tankInteriorClip)">
          {/* Container de Nível Variável da Água */}
          {/* Altura total = 152px (de y=32 a y=184). */}
          {/* waterY = 184 - (152 * (percentage / 100)) */}
          {(() => {
            const innerHeight = 152;
            const waterHeight = Math.max(10, Math.min(innerHeight, (innerHeight * percentage) / 100));
            const waterY = 184 - waterHeight;

            return (
              <g className="transition-all duration-700 ease-out" style={{ transform: 'translateZ(0)' }}>
                {/* Bloco Base do Líquido */}
                <rect 
                  x="20" 
                  y={waterY} 
                  width="120" 
                  height={waterHeight + 10} 
                  fill="url(#tankLiquidGrad)" 
                />

                {/* Camada de Ondas 2 (Fundo, mais lenta e translúcida) */}
                <g style={{ transform: `translateY(${waterY - 8}px)` }} className="animate-tank-wave-2 opacity-60">
                  <path 
                    d="M 0 8 Q 30 2 60 8 T 120 8 T 180 8 T 240 8 T 300 8 T 360 8 V 30 H 0 Z" 
                    fill={colors.wave2} 
                  />
                </g>

                {/* Camada de Ondas 1 (Frente, mais rápida e dinâmica) */}
                <g style={{ transform: `translateY(${waterY - 7}px)` }} className="animate-tank-wave-1 opacity-90">
                  <path 
                    d="M 0 7 Q 30 13 60 7 T 120 7 T 180 7 T 240 7 T 300 7 T 360 7 V 30 H 0 Z" 
                    fill={colors.wave1} 
                  />
                </g>

                {/* Linha de Crista Brilhante da Onda Superior */}
                <g style={{ transform: `translateY(${waterY - 7}px)` }} className="animate-tank-wave-1 opacity-80">
                  <path 
                    d="M 0 7 Q 30 13 60 7 T 120 7 T 180 7 T 240 7 T 300 7 T 360 7" 
                    stroke="#ffffff" 
                    strokeWidth="1.8" 
                    fill="none" 
                  />
                </g>

                {/* Bolhas de Aeração Subindo */}
                <g className="animate-bubble-1" style={{ transformOrigin: '48px 170px' }}>
                  <circle cx="48" cy="170" r="3" fill="#ffffff" fillOpacity="0.65" />
                </g>
                <g className="animate-bubble-2" style={{ transformOrigin: '76px 174px' }}>
                  <circle cx="76" cy="174" r="2.2" fill="#ffffff" fillOpacity="0.5" />
                </g>
                <g className="animate-bubble-3" style={{ transformOrigin: '104px 168px' }}>
                  <circle cx="104" cy="168" r="3.5" fill="#ffffff" fillOpacity="0.6" />
                </g>
              </g>
            );
          })()}

          {/* Efeito de Reflexo de Vidro Frontal */}
          <rect x="22" y="32" width="116" height="152" fill="url(#glassHighlight)" opacity="0.35" />
          <path d="M 28 36 L 40 36 L 40 180 L 28 180 Z" fill="#ffffff" opacity="0.15" />
        </g>

        {/* 5. ANÉIS E GRADUAÇÕES DO RESERVATÓRIO */}
        {/* Anel de Reforço Estrutural Superior */}
        <line x1="22" y1="70" x2="138" y2="70" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        {/* Anel de Reforço Central */}
        <line x1="22" y1="108" x2="138" y2="108" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        {/* Anel de Reforço Inferior (Limiar Crítico 25%) */}
        <line x1="22" y1="146" x2="138" y2="146" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" opacity="0.85" />

        {/* Régua de Graduação Lateral Direita */}
        <g stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
          <line x1="130" y1="36" x2="136" y2="36" />
          <line x1="132" y1="70" x2="136" y2="70" />
          <line x1="130" y1="108" x2="136" y2="108" />
          <line x1="128" y1="146" x2="136" y2="146" stroke="#ef4444" strokeWidth="2" />
          <line x1="130" y1="180" x2="136" y2="180" />
        </g>

        {/* Indicador de Limiar Crítico */}
        <g transform="translate(18, 142)">
          <polygon points="0,4 6,1 6,7" fill="#ef4444" />
        </g>
      </svg>
    </div>
  );
};
