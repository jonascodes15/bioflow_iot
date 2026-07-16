import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplet, RefreshCw, Radio } from 'lucide-react';

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(true);

  // We automatically target the relative path or fallback to local port
  const API_URL = "https://reimagined-space-invention-x5qvpg74vj4wfv7-8000.app.github.dev/api/telemetry/latest";

  const fetchLatestData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch telemetry data");
      }
      const data = await response.json();
      setTelemetry(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLatestData();

    // Poll the API every 1.5 seconds for new real-time database entries
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        fetchLatestData();
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            BioFlow IoT Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time biological telemetry stream</p>
        </div>

        {/* Live Status Controls */}
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
              {isLive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isLive ? 'Live Stream Active' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin" />
            <p className="text-slate-400">Warming up sensor connection...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/30 border border-rose-900 text-rose-200 p-6 rounded-xl max-w-lg mx-auto text-center">
            <h3 className="font-bold text-lg mb-2">Connection Error</h3>
            <p className="text-sm mb-4 text-rose-300/80">{error}</p>
            <p className="text-xs text-slate-500">Ensure your FastAPI local server is actively running.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card: Flow Rate */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 shadow-xl shadow-black/40">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity className="h-32 w-32 text-emerald-400" />
              </div>
              <div className="flex items-center gap-3 text-emerald-400 mb-4">
                <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/30">
                  <Activity className="h-6 w-6" />
                </div>
                <h2 className="font-bold tracking-wide uppercase text-xs text-slate-400">Flow Rate</h2>
              </div>
              <p className="text-5xl font-black text-slate-50 tracking-tight">
                {telemetry?.flow_rate_lpm?.toFixed(2)}
                <span className="text-lg font-medium text-slate-400 ml-2">L/min</span>
              </p>
              <div className="mt-4 text-xs text-slate-500 flex justify-between">
                <span>Sensor ID: {telemetry?.sensor_id}</span>
                <span className="text-emerald-500/80">Normal Operating Flow</span>
              </div>
            </div>

            {/* Card: Temperature */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300 shadow-xl shadow-black/40">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Thermometer className="h-32 w-32 text-cyan-400" />
              </div>
              <div className="flex items-center gap-3 text-cyan-400 mb-4">
                <div className="bg-cyan-950/50 p-3 rounded-xl border border-cyan-900/30">
                  <Thermometer className="h-6 w-6" />
                </div>
                <h2 className="font-bold tracking-wide uppercase text-xs text-slate-400">Temperature</h2>
              </div>
              <p className="text-5xl font-black text-slate-50 tracking-tight">
                {telemetry?.temperature_c?.toFixed(1)}
                <span className="text-lg font-medium text-slate-400 ml-2">°C</span>
              </p>
              <div className="mt-4 text-xs text-slate-500 flex justify-between">
                <span>Target: 37.0°C</span>
                <span className="text-cyan-500/80">Regulated</span>
              </div>
            </div>

            {/* Card: pH Level */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/50 transition-all duration-300 shadow-xl shadow-black/40">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Droplet className="h-32 w-32 text-violet-400" />
              </div>
              <div className="flex items-center gap-3 text-violet-400 mb-4">
                <div className="bg-violet-950/50 p-3 rounded-xl border border-violet-900/30">
                  <Droplet className="h-6 w-6" />
                </div>
                <h2 className="font-bold tracking-wide uppercase text-xs text-slate-400">pH Level</h2>
              </div>
              <p className="text-5xl font-black text-slate-50 tracking-tight">
                {telemetry?.ph_level?.toFixed(2)}
              </p>
              <div className="mt-4 text-xs text-slate-500 flex justify-between">
                <span>Range: 7.0 - 7.5</span>
                <span className={`${telemetry?.ph_level >= 7.2 && telemetry?.ph_level <= 7.4 ? 'text-violet-400' : 'text-amber-500'}`}>
                  {telemetry?.ph_level >= 7.2 && telemetry?.ph_level <= 7.4 ? 'Optimal pH' : 'Slight Deviation'}
                </span>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;