import React, { useState } from 'react';
import { Sliders, RefreshCw, Send } from 'lucide-react';
import { SoilStatus, WaterLevel } from '../types.js';

interface SensorSimulatorProps {
  onSimulate: (data: {
    temperature: number;
    airHumidity: number;
    soilStatus: SoilStatus;
    waterLevel: WaterLevel;
    waterPercentage: number;
  }) => Promise<void>;
}

export const SensorSimulator: React.FC<SensorSimulatorProps> = ({ onSimulate }) => {
  const [temperature, setTemperature] = useState(25.0);
  const [humidity, setHumidity] = useState(65);
  const [soil, setSoil] = useState<SoilStatus>('UMIDO');
  const [water, setWater] = useState<WaterLevel>('CHEIO');
  const [waterPct, setWaterPct] = useState(85);
  const [sending, setSending] = useState(false);

  const handleApply = async () => {
    setSending(true);
    try {
      await onSimulate({
        temperature,
        airHumidity: humidity,
        soilStatus: soil,
        waterLevel: water,
        waterPercentage: waterPct
      });
    } finally {
      setSending(false);
    }
  };

  const handleWaterPreset = (level: WaterLevel) => {
    setWater(level);
    if (level === 'BAIXO') setWaterPct(15);
    else if (level === 'MEDIO') setWaterPct(50);
    else setWaterPct(90);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-white text-sm">Simulador de Sensores IoT (Bancada da Feira)</h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Altere os valores para demonstrar os atuadores respondendo ao vivo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Controle 1: Temperatura */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Temperatura:</span>
            <span className={`font-mono ${temperature >= 28 ? 'text-orange-400 font-bold' : 'text-emerald-400'}`}>
              {temperature.toFixed(1)} °C {temperature >= 28 && '🔥'}
            </span>
          </div>
          <input 
            type="range" 
            min="15" 
            max="38" 
            step="0.5" 
            value={temperature} 
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>15°C (Frio)</span>
            <span className="text-orange-400 font-bold">28°C (Liga Fan)</span>
            <span>38°C (Quente)</span>
          </div>
        </div>

        {/* Controle 2: Umidade do Ar */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Umidade do Ar:</span>
            <span className="text-cyan-400 font-mono">{humidity} %</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="95" 
            step="1" 
            value={humidity} 
            onChange={(e) => setHumidity(parseInt(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>20% (Seco)</span>
            <span>95% (Úmido)</span>
          </div>
        </div>

        {/* Controle 3: Umidade do Solo (Tri-estado) */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block">Solo:</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setSoil('MUITO_MOLHADO')}
              className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                soil === 'MUITO_MOLHADO' 
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Molhado
            </button>
            <button
              type="button"
              onClick={() => setSoil('UMIDO')}
              className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                soil === 'UMIDO' 
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Úmido
            </button>
            <button
              type="button"
              onClick={() => setSoil('SECO')}
              className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                soil === 'SECO' 
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Seco (Rega)
            </button>
          </div>
        </div>

        {/* Controle 4: Reservatório de Água */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block">Nível do Tanque:</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => handleWaterPreset('CHEIO')}
              className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                water === 'CHEIO' 
                  ? 'bg-blue-600 text-white border-blue-400' 
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Cheio (85%)
            </button>
            <button
              type="button"
              onClick={() => handleWaterPreset('MEDIO')}
              className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                water === 'MEDIO' 
                  ? 'bg-cyan-600 text-white border-cyan-400' 
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Médio (50%)
            </button>
            <button
              type="button"
              onClick={() => handleWaterPreset('BAIXO')}
              className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                water === 'BAIXO' 
                  ? 'bg-red-600 text-white border-red-400 animate-pulse' 
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Baixo (15%)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={handleApply}
          disabled={sending}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer"
        >
          {sending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Injetando no Backend...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Aplicar Estado na Estufa</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
