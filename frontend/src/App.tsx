import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  LineChart, 
  Waves, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { SystemState, SoilStatus, WaterLevel } from './types.js';
import { CockpitScreen } from './components/CockpitScreen.js';
import { HistoryScreen } from './components/HistoryScreen.js';
import { ReservoirScreen } from './components/ReservoirScreen.js';
import { SensorSimulator } from './components/SensorSimulator.js';
import { ThemeToggle } from './components/ThemeToggle.js';

type Tab = 'cockpit' | 'history' | 'reservoir';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('cockpit');
  const [connected, setConnected] = useState(false);
  const [systemState, setSystemState] = useState<SystemState>({
    sensors: {
      temperature: 24.5,
      airHumidity: 65,
      soilStatus: 'UMIDO',
      waterLevel: 'CHEIO',
      waterPercentage: 85,
      timestamp: new Date().toISOString()
    },
    actuators: {
      fanOn: false,
      waterPumpOn: false,
      alarmActive: false,
      reason: {
        fan: 'Temperatura adequada (24.5°C): ventilador desligado.',
        waterPump: 'Solo úmido: irrigação desnecessária.',
        alarm: 'Nível de água seguro.'
      }
    },
    notifications: []
  });

  // Polling em tempo real com a API do backend
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setSystemState(data);
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch (err) {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchState();
    const timer = setInterval(fetchState, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleSimulate = async (data: {
    temperature: number;
    airHumidity: number;
    soilStatus: SoilStatus;
    waterLevel: WaterLevel;
    waterPercentage: number;
  }) => {
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao enviar telemetria:', err);
    }
  };

  const handleOverride = async (actuator: 'fan' | 'waterPump', mode: 'AUTO' | 'FORCE_OFF') => {
    try {
      const res = await fetch('/api/actuators/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actuator, mode })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Falha ao definir override de atuador:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans pb-10 transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Estufa Inteligente IoT</h1>
                <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Feira de Ciências
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sistema Autônomo com Interlock e Notificação WhatsApp</p>
            </div>
          </div>

          {/* Navegação entre as 3 Telas */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentTab('cockpit')}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'cockpit'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Cockpit da Estufa</span>
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>2. Dashboard Histórico</span>
            </button>
            <button
              onClick={() => setCurrentTab('reservoir')}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'reservoir'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>3. Reservatório & WhatsApp</span>
            </button>
          </div>

          {/* Status de Conexão com a Telemetria e Alternador de Tema */}
          <div className="flex items-center space-x-3">
            {connected ? (
              <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full">
                <Wifi className="w-3.5 h-3.5 mr-1.5" /> Telemetria Online
              </span>
            ) : (
              <span className="flex items-center text-xs font-medium text-amber-700 bg-amber-500/10 border border-amber-500/30 dark:text-amber-400 dark:bg-amber-950/60 px-3 py-1.5 rounded-full">
                <WifiOff className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Modo Demonstração
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden mt-3 grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentTab('cockpit')}
            className={`text-[11px] font-bold py-1.5 rounded-lg text-center ${currentTab === 'cockpit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Cockpit
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`text-[11px] font-bold py-1.5 rounded-lg text-center ${currentTab === 'history' ? 'bg-emerald-500 text-slate-950' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Histórico
          </button>
          <button
            onClick={() => setCurrentTab('reservoir')}
            className={`text-[11px] font-bold py-1.5 rounded-lg text-center ${currentTab === 'reservoir' ? 'bg-emerald-500 text-slate-950' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Tanque
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 pt-6 flex-1 space-y-6">
        {/* Barra de Simulação Interativa (sempre acessível para a banca da feira) */}
        <SensorSimulator onSimulate={handleSimulate} />

        {/* Renderização Condicional das 3 Telas */}
        {currentTab === 'cockpit' && <CockpitScreen state={systemState} onOverride={handleOverride} />}
        {currentTab === 'history' && <HistoryScreen />}
        {currentTab === 'reservoir' && <ReservoirScreen state={systemState} />}
      </main>
    </div>
  );
};

export default App;
