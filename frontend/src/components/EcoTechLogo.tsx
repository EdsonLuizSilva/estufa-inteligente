import React from 'react';

interface EcoTechLogoProps {
  className?: string;
  withGlow?: boolean;
}

export const EcoTechLogo: React.FC<EcoTechLogoProps> = ({ 
  className = "w-8 h-8",
  withGlow = true 
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/25 rounded-2xl blur-md -z-10 animate-pulse" />
      )}
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Gradiente principal da folha/circuito */}
          <linearGradient id="ecoGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />   {/* Emerald 400 */}
            <stop offset="50%" stopColor="#10b981" />  {/* Emerald 500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan 500 */}
          </linearGradient>

          {/* Gradiente de preenchimento suave da folha */}
          <linearGradient id="leafFill" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Silhueta da Folha Orgânica */}
        <path
          d="M 24 6 C 36 6, 42 16, 41 28 C 40 38, 29 42, 24 42 C 19 42, 7 38, 7 26 C 7 14, 15 6, 24 6 Z"
          fill="url(#leafFill)"
          stroke="url(#ecoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Linha Central / Caule Tecnológico */}
        <path
          d="M 24 42 V 16"
          stroke="url(#ecoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Trilha do Circuito Esquerda */}
        <path
          d="M 24 30 L 15 25 V 20"
          stroke="url(#ecoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Trilha do Circuito Direita */}
        <path
          d="M 24 24 L 33 19 V 14"
          stroke="url(#ecoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Trilha Superior de Conexão IoT */}
        <path
          d="M 24 16 L 29 11"
          stroke="url(#ecoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Nós Digitais (Pontos de Sensores / Conectividade) */}
        <circle cx="15" cy="20" r="2.5" fill="#34d399" />
        <circle cx="33" cy="14" r="2.5" fill="#06b6d4" />
        <circle cx="29" cy="11" r="2" fill="#6ee7b7" />
        <circle cx="24" cy="42" r="2.5" fill="#10b981" />

        {/* Nó Central Inteligente com Micro-pulso */}
        <circle cx="24" cy="24" r="3" fill="#10b981" />
        <circle cx="24" cy="24" r="5" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '6s' }} />
      </svg>
    </div>
  );
};
