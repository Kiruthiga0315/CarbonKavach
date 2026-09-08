// SIMULATED DATA GENERATOR — for UI demo/preview purposes only. Not connected to any sensor.
// Must never feed emissionsCalculator, machineLoadModel, or report generation.

import { useState, useEffect } from 'react';
import { Machine } from './types';

export interface TelemetryReading {
  machineId: string;
  timestamp: number;
  simulated_kw: number;
  accumulated_kwh: number;
  isIdle: boolean;
}

export function useSimulatedTelemetry(machines: Machine[]) {
  const [readings, setReadings] = useState<Record<string, TelemetryReading>>({});

  useEffect(() => {
    if (!machines || machines.length === 0) return;

    // Generate initial readings immediately
    const now = Date.now();
    const initialReadings: Record<string, TelemetryReading> = {};
    
    machines.forEach(machine => {
      // Use the provided formula, taking quantity into account for the whole group of identical machines
      const base_kw = machine.rated_power_kw * machine.load_factor * machine.quantity;
      initialReadings[machine.id] = {
        machineId: machine.id,
        timestamp: now,
        simulated_kw: base_kw,
        accumulated_kwh: base_kw * 6.5, // Seed with ~6.5 hours of runtime for visual effect
        isIdle: false
      };
    });
    
    setReadings(initialReadings);

    // Update every 2 seconds
    const interval = setInterval(() => {
      const currentTime = Date.now();
      
      setReadings(prev => {
        const newReadings = { ...prev };

        machines.forEach(machine => {
          // roughly 1 in 15 ticks a machine simulates an idle dip
          const isIdle = Math.random() < (1 / 15);
          let simulated_kw = 0;
          
          // Total power considering quantity
          const totalRatedPowerKw = machine.rated_power_kw * machine.quantity;

          if (isIdle) {
            // idle dip to 5-10% of rated power
            const idleFactor = 0.05 + Math.random() * 0.05; // 0.05 to 0.10
            simulated_kw = totalRatedPowerKw * idleFactor;
          } else {
            // random value between -0.15 and +0.15
            const jitter = (Math.random() * 0.30) - 0.15;
            simulated_kw = totalRatedPowerKw * machine.load_factor * (1 + jitter);
          }
          
          // Ensure we don't drop below 0
          simulated_kw = Math.max(0, simulated_kw);

          newReadings[machine.id] = {
            machineId: machine.id,
            timestamp: currentTime,
            simulated_kw,
            accumulated_kwh: prev[machine.id].accumulated_kwh + (simulated_kw * (2 / 3600)), // add kw * hours
            isIdle
          };
        });

        return newReadings;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [machines]);

  return readings;
}
