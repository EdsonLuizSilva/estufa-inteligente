import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart,
  Area,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Waves, 
  Download, 
  Droplet, 
  ShieldAlert
} from 'lucide-react';
import { SensorReadings } from '../types.js';
import { useTheme } from '../context/ThemeContext.js';

export const HistoryScreen: React.FC = () => {
  const { isDark } = useTheme();
  const [history, setHistory] = useState<SensorReadings[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowFilter, setWindowFilter] = useState<'all' | 'recent'>('all');

  const TOTAL_CAPACITY = 200; // Capacidade total de 200 Litros

  const getWaterPct = (item: SensorReadings): number => {
    if (typeof item.waterPercentage === 'number') return item.waterPercentage;
    return item.waterLevel === 'BAIXO' ? 15 : item.waterLevel === 'MEDIO' ? 50 : 85;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtro de janela de dados
  const displayHistory = windowFilter === 'recent' ? history.slice(-15) : history;

  const chartData = displayHistory.map((item, idx) => {
    const waterPct = getWaterPct(item);
    const waterLiters = Math.round((TOTAL_CAPACITY * waterPct) / 100);
    return {
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      temperatura: item.temperature,
      umidade: item.airHumidity,
      agua: waterPct,
      litros: waterLiters,
      soilStatus: item.soilStatus,
      waterLevel: item.waterLevel,
      index: idx
    };
  });

  // Cálculos analíticos
  const avgTemp = history.length ? (history.reduce((a, b) => a + b.temperature, 0) / history.length).toFixed(1) : '0';
  const maxTemp = history.length ? Math.max(...history.map(h => h.temperature)).toFixed(1) : '0';
  const avgHum = history.length ? (history.reduce((a, b) => a + b.airHumidity, 0) / history.length).toFixed(0) : '0';

  const latestReading = history.length ? history[history.length - 1] : null;
  const currentWaterPct = latestReading ? getWaterPct(latestReading) : 85;
  const currentWaterLiters = Math.round((TOTAL_CAPACITY * currentWaterPct) / 100);
  const usedLiters = TOTAL_CAPACITY - currentWaterLiters;

  // Estimativa de autonomia hídrica
  const getAutonomiaLabel = () => {
    if (currentWaterPct <= 25) return { text: 'Crítica (< 2h)', color: 'text-red-600 dark:text-red-400', isCrit: true };
    if (currentWaterPct <= 50) return { text: '~14h a 18h', color: 'text-cyan-600 dark:text-cyan-400', isCrit: false };
    return { text: '> 24h Seguras', color: 'text-emerald-600 dark:text-emerald-400', isCrit: false };
  };

  const autonomia = getAutonomiaLabel();

  // Exportação de Relatório CSV
  const handleExportCSV = () => {
    if (!history.length) return;
    const headers = ['Timestamp', 'Horario', 'Temperatura_C', 'Umidade_Ar_Pct', 'Status_Solo', 'Nivel_Agua_Pct', 'Volume_Agua_L'];
    const rows = history.map(item => {
      const waterPct = getWaterPct(item);
      const waterLiters = Math.round((TOTAL_CAPACITY * waterPct) / 100);
      const time = new Date(item.timestamp).toLocaleTimeString();
      return [
        item.timestamp,
        `"${time}"`,
        item.temperature,
        item.airHumidity,
        `"${item.soilStatus}"`,
        waterPct,
        waterLiters
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estufa-iot-telemetria-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página com Filtro e Botão de Exportação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Dashboard de Séries Históricas & Telemetria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Análise temporal de microclima e gestão hídrica contínua da estufa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Janela Temporal */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setWindowFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                windowFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Histórico Completo ({history.length})
            </button>
            <button
              onClick={() => setWindowFilter('recent')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                windowFilter === 'recent'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Últimas 15
            </button>
          </div>

          {/* Botão de Exportação CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!history.length}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            title="Baixar planilha de dados coletados"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs Analíticos Globais (5 Cartões) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Temperatura Média */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-200">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Média de Temp.</span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {avgTemp} <span className="text-sm font-semibold text-slate-400">°C</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Pico: {maxTemp}°C</span>
        </div>

        {/* KPI 2: Umidade do Ar Média */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-200">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Média Umidade Ar</span>
          <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            {avgHum} <span className="text-sm font-semibold text-slate-400">%</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Faixa ideal: 50%-80%</span>
        </div>

        {/* KPI 3: Nível do Tanque (%) */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-200">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
            <Waves className="w-3 h-3 text-blue-500" /> Nível Tanque
          </span>
          <div className={`text-2xl font-black font-mono mt-1 ${currentWaterPct <= 25 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {currentWaterPct} <span className="text-sm font-semibold text-slate-400">%</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
            {currentWaterPct <= 25 ? '⚠️ Nível Crítico' : 'Seguro'}
          </span>
        </div>

        {/* KPI 4: Volume Disponível em Litros */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-200">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
            <Droplet className="w-3 h-3 text-cyan-500" /> Vol. Restante
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {currentWaterLiters} <span className="text-sm font-semibold text-slate-400">L</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Consumo: {usedLiters} L de {TOTAL_CAPACITY} L</span>
        </div>

        {/* KPI 5: Autonomia Hídrica */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-200">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" /> Autonomia
          </span>
          <div className={`text-lg sm:text-xl font-black font-mono mt-1 ${autonomia.color}`}>
            {autonomia.text}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Gotejamento calibrado</span>
        </div>
      </div>

      {/* GRÁFICO 1 EM DESTAQUE: Análise Temporal do Tanque de Água (Novo!) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Análise Histórica do Nível do Reservatório de Água (%)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Monitoramento de consumo hídrico com limiar de proteção da bomba
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Linha Vermelha: Corte 25% (50 L)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Carregando dados...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="waterHistoryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <YAxis domain={[0, 100]} stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderColor: isDark ? '#334155' : '#e2e8f0', 
                    borderRadius: '1rem', 
                    color: isDark ? '#fff' : '#0f172a',
                    boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Nível de Água (%)') {
                      const liters = Math.round((TOTAL_CAPACITY * Number(value)) / 100);
                      return [`${value}% (${liters} Litros)`, 'Nível da Água'];
                    }
                    return [value, name];
                  }}
                />
                <ReferenceLine 
                  y={25} 
                  stroke="#ef4444" 
                  strokeDasharray="5 4" 
                  strokeWidth={2}
                  label={{ value: 'LIMIAR CRÍTICO (25%)', fill: '#ef4444', fontSize: 10, position: 'top', fontWeight: 'bold' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="agua" 
                  name="Nível de Água (%)"
                  stroke="#0284c7" 
                  strokeWidth={3} 
                  fillOpacity={1}
                  fill="url(#waterHistoryGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grids 2 e 3: Gráficos de Temperatura e Umidade do Ar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 2: Temperatura com linha de corte do ventilador */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              Evolução da Temperatura (°C)
            </h4>
            <span className="text-[11px] text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-500/30 px-2 py-0.5 rounded-md font-medium">
              Cooler ≥ 28°C
            </span>
          </div>
          <div className="h-60 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Carregando dados...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                  <YAxis domain={[15, 35]} stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#334155' : '#e2e8f0', 
                      borderRadius: '1rem', 
                      color: isDark ? '#fff' : '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <ReferenceLine y={28} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Aciona Cooler (28°C)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                  <Line 
                    type="monotone" 
                    dataKey="temperatura" 
                    name="Temperatura (°C)"
                    stroke="#f97316" 
                    strokeWidth={3} 
                    dot={{ r: 3, fill: '#f97316' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 3: Umidade do Ar */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Evolução da Umidade do Ar (%)
            </h4>
            <span className="text-[11px] text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-500/30 px-2 py-0.5 rounded-md font-medium">
              Ideal: 50% - 80%
            </span>
          </div>
          <div className="h-60 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Carregando dados...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                  <YAxis domain={[20, 100]} stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#334155' : '#e2e8f0', 
                      borderRadius: '1rem', 
                      color: isDark ? '#fff' : '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <ReferenceLine y={50} stroke="#06b6d4" strokeDasharray="3 3" opacity={0.6} />
                  <ReferenceLine y={80} stroke="#06b6d4" strokeDasharray="3 3" opacity={0.6} />
                  <Line 
                    type="monotone" 
                    dataKey="umidade" 
                    name="Umidade (%)"
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    dot={{ r: 3, fill: '#06b6d4' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
