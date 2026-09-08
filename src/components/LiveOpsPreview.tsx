import React, { useMemo } from 'react';
import { Activity, AlertTriangle, Zap, Radio } from 'lucide-react';
import { Machine, Language } from '../types';
import { useSimulatedTelemetry } from '../simulatedTelemetry';
import { EMISSION_FACTORS } from '../emissionFactors';

interface LiveOpsPreviewProps {
  machines: Machine[];
  language: Language;
}

export const LiveOpsPreview: React.FC<LiveOpsPreviewProps> = ({ machines, language }) => {
  const telemetry = useSimulatedTelemetry(machines);

  // Calculate top emitter right now
  const topEmitter = useMemo(() => {
    let maxEmissions = -1;
    let maxMachine: Machine | null = null;
    let maxKw = 0;

    Object.values(telemetry).forEach(reading => {
      const machine = machines.find(m => m.id === reading.machineId);
      if (machine) {
        const emissionsRate = reading.simulated_kw * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH;
        if (emissionsRate > maxEmissions) {
          maxEmissions = emissionsRate;
          maxMachine = machine;
          maxKw = reading.simulated_kw;
        }
      }
    });

    return { machine: maxMachine, emissionsRate: maxEmissions, kw: maxKw };
  }, [telemetry, machines]);

  return (
    <div className="min-h-full pb-20 relative bg-slate-50/50">
      {/* Visual Watermark pattern to clearly indicate this is a simulation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#f59e0b 2px, transparent 2px)',
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Persistent Amber Banner */}
      <div className="sticky top-0 z-40 bg-amber-500 text-amber-950 px-4 py-3 shadow-md flex items-start sm:items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
        <div className="text-sm font-medium leading-tight">
          <strong>SIMULATED DATA</strong> — This preview shows what real-time monitoring would look like with IoT sensors installed. No physical sensors are connected.
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-6 h-6 text-amber-500 animate-pulse" />
              {language === 'en' ? 'Live Operations (Simulated)' : 'நேரடி செயல்பாடுகள் (மாதிரி)'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Data stream updating every 2s
            </p>
          </div>
          <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200">
            Preview Mode
          </div>
        </div>

        {/* Top Emitter Callout */}
        {topEmitter.machine && (
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
              Simulated
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Top Emitter Right Now
                </h3>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">
                  {topEmitter.machine.name}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <div className="bg-slate-100 px-2.5 py-1 rounded-md font-mono text-slate-700">
                    {topEmitter.kw.toFixed(1)} kW
                  </div>
                  <div className="text-slate-400">→</div>
                  <div className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-mono font-medium border border-rose-100">
                    {topEmitter.emissionsRate.toFixed(2)} kg CO₂e / hr
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Machine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map(machine => {
            const reading = telemetry[machine.id];
            if (!reading) return null;

            const usagePercent = Math.min(100, (reading.simulated_kw / (machine.rated_power_kw * machine.quantity)) * 100);
            
            return (
              <div key={machine.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="font-semibold text-slate-700 truncate pr-4">{machine.name}</div>
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${reading.isIdle ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm text-slate-500 font-medium">Instant Power</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono text-slate-800 tracking-tight">
                        {reading.simulated_kw.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">kW</span>
                    </div>
                  </div>
                  
                  {/* Fake Sparkline / Gauge Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-2 flex">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${reading.isIdle ? 'bg-amber-400' : 'bg-indigo-500'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Sim. Energy Today</span>
                    </div>
                    <div className="font-mono text-sm font-semibold text-slate-700">
                      {reading.accumulated_kwh.toFixed(2)} kWh
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {machines.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-600">No machines configured</h3>
            <p className="text-slate-500 mt-1">Add machines in the Inventory tab to see simulated live data.</p>
          </div>
        )}
      </div>
    </div>
  );
};
