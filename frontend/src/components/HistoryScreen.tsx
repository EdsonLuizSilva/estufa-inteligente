import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Activity, Clock } from 'lucide-react';
import { SensorReadings } from '../types.js';

export const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<SensorReadings[]>([]);
  const [loading, setLoading] = useState(true);

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

  const chartData = history.map((item, idx) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperatura: item.temperature,
    umidade: item.airHumidity,
    index: idx
  }));

  const avgTemp = history.length ? (history.reduce((a, b) => a + b.temperature, 0) / history.length).toFixed(1) : '0';
  const avgHum = history.length ? (history.reduce((a, b) => a + b.airHumidity, 0) / history.length).toFixed(0) : '0';
  const maxTemp = history.length ? Math.max(...history.map(h => h.temperature)).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Dashboard de Séries Históricas
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhamento temporal de temperatura e umidade da estufa
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full w-fit">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Atualização contínua a cada 3s</span>
        </div>
      </div>

      {/* Cartões de Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs">Média de Temperatura</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{avgTemp} °C</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs">Pico de Temperatura</span>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">{maxTemp} °C</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs">Média de Umidade Relativa</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{avgHum} %</div>
        </div>
      </div>

      {/* Gráfico 1: Temperatura com linha de corte do ventilador */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Evolução da Temperatura (°C)
          </h4>
          <span className="text-xs text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded-md">
            Linha Vermelha: Limiar de Acionamento (28°C)
          </span>
        </div>
        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Carregando dados...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis domain={[15, 35]} stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} 
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

      {/* Gráfico 2: Umidade do Ar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          Evolução da Umidade do Ar (%)
        </h4>
        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Carregando dados...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis domain={[20, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} 
                />
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
  );
};
