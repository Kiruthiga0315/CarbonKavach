import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Zap,
  Fuel,
  Sun,
  CheckCircle2,
  TrendingDown,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Factory,
} from 'lucide-react';
import { RawBillData, EmissionFootprint, Language } from '../types';
import { simulateFuelToElectricityShift } from '../calculateEmissions';

interface SimulatorViewProps {
  bills: RawBillData[];
  onApplySimulation: (simulatedFootprint: EmissionFootprint) => void;
  onNavigateToReport: () => void;
  language: Language;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  bills,
  onApplySimulation,
  onNavigateToReport,
  language,
}) => {
  const [shiftPercentage, setShiftPercentage] = useState<number>(60);
  const [appliedNotification, setAppliedNotification] = useState(false);

  // Pure deterministic simulation call — zero AI/LLM calls!
  const simResult = simulateFuelToElectricityShift(bills, shiftPercentage);
  const baseline = simResult.baseline;
  const simulated = simResult.simulated;

  // Calculate approximate rupee cost variations based on actual logged costs
  const baselineCost = bills.reduce((acc, b) => acc + (b.cost_rupees || 0), 0) || 48200;
  // Fuel cost savings: diesel costs ~₹26/kWh equivalent, grid ~₹7.50/kWh -> ~70% cost saving on shifted unit
  const estimatedSavings = Math.round(baselineCost * (shiftPercentage / 100) * 0.28);
  const projectedCost = Math.max(1000, baselineCost - estimatedSavings);

  // Donut chart segments for simulated energy mix
  const simTotalKg = simulated.total_kg > 0 ? simulated.total_kg : 1;
  const solarGridPct = Math.min(
    95,
    Math.max(15, Math.round((simulated.electricity_kg / simTotalKg) * 100))
  );
  const dieselPct = Math.max(1, Math.round((simulated.diesel_kg / simTotalKg) * 100));
  const remainingPct = Math.max(0, 100 - solarGridPct - dieselPct);

  // Circumference for 38 radius
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ≈ 238.76
  const solarLength = (solarGridPct / 100) * circumference;
  const dieselLength = (dieselPct / 100) * circumference;

  const handleApply = () => {
    onApplySimulation(simulated);
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 3000);
  };

  const handleReset = () => {
    setShiftPercentage(20);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Context Header */}
      <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border border-[#E6E2D8]">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C9082]">
              <Zap className="w-3.5 h-3.5 text-[#2D453E]" />
              <span>TANGEDCO Tariff III-B &amp; Rooftop Solar</span>
            </div>
            <h1 className="font-serif italic text-xl font-bold text-[#2D453E] mt-1">
              {language === 'en'
                ? 'Operational What-If Analysis'
                : 'மாற்று எரிபொருள் மாதிரி & உத்தேச சேமிப்பு'}
            </h1>
            <p className="text-xs text-[#6B705C]">
              Simulate shifting fuel generator load to grid electricity &amp; rooftop solar
            </p>
          </div>
          <div className="bg-[#E9EEDF] px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0 border border-[#A8C69F]/30">
            <span className="w-2 h-2 rounded-full bg-[#2D453E] animate-ping" />
            <span className="text-[11px] font-bold text-[#2D453E]">Live Engine</span>
          </div>
        </div>
      </div>

      {/* Slider Control Card in Rich Deep Natural Green (#2D453E) */}
      <div className="bg-[#2D453E] text-[#FDFCF9] rounded-[28px] sm:rounded-[32px] p-6 shadow-lg space-y-5 border border-[#253933]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif italic text-xl text-[#FDFCF9]">
              {language === 'en'
                ? 'What-If Decarbonization Simulator'
                : 'டீசல் சுமையை சோலார்/மின்சாரத்திற்கு மாற்றுதல்'}
            </h3>
            <p className="text-xs text-[#A8C69F] mt-0.5">
              Replaces diesel combustion with CEA grid &amp; zero-emission solar
            </p>
          </div>
          <div className="bg-[#A8C69F] text-[#2D453E] px-3.5 py-1.5 rounded-xl text-center font-bold shadow-xs">
            <span className="text-lg leading-none">{shiftPercentage}%</span>
            <span className="block text-[10px] uppercase tracking-wider text-[#2D453E]/80">Shifted</span>
          </div>
        </div>

        {/* Range Input */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={shiftPercentage}
            onChange={(e) => setShiftPercentage(Number(e.target.value))}
            className="w-full h-2.5 bg-[#3D5C53] rounded-full appearance-none cursor-pointer accent-[#A8C69F]"
          />
          <div className="flex justify-between text-xs text-[#FDFCF9]/70 font-medium">
            <div className="text-left">
              <span className="font-bold text-[#A8C69F]">0% Fuel Base</span>
              <span className="block text-[10px] opacity-70">ஆரம்ப நிலை</span>
            </div>
            <div className="text-center">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3D5C53] text-[#FDFCF9] font-semibold text-[11px]">
                Active: {shiftPercentage}% Shifted
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-[#A8C69F]">100% Clean Shift</span>
              <span className="block text-[10px] opacity-70">முழு மாற்றம்</span>
            </div>
          </div>
        </div>

        {/* Estimated Savings Strip in Card */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#FDFCF9]/80">Estimated Monthly Savings / உத்தேச சேமிப்பு</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#A8C69F] tracking-tight">₹{estimatedSavings.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#FDFCF9]/80">CO₂ Reduction</p>
            <p className="text-xl font-bold text-[#FDFCF9]">−{simResult.co2ReductionKg} kg</p>
          </div>
        </div>
      </div>

      {/* Before vs Projected Comparison Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current State */}
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-[#E6E2D8] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B705C] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#8C8F7A]" />
              <span>Current Footprint</span>
            </div>
            <span className="text-[10px] text-[#8C8F7A]">தற்போதைய நிலை</span>
            <div className="text-2xl font-serif italic font-bold text-[#2D453E] mt-1">
              {baseline.total_tonnes.toFixed(2)}{' '}
              <span className="text-xs font-sans not-italic font-normal text-[#6B705C]">t CO₂e</span>
            </div>
          </div>
          <div className="mt-3 pt-2 bg-[#F7F5F0] p-2.5 rounded-xl border border-[#E6E2D8]">
            <span className="text-[11px] text-[#6B705C] block">Fuel Expense</span>
            <span className="text-xs font-bold text-[#2D332D]">
              ₹{baselineCost.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#8C8F7A] block">மாத செலவு</span>
          </div>
        </div>

        {/* Projected State */}
        <div className="bg-[#E9EEDF] border border-[#A8C69F]/50 rounded-[24px] p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#2D453E] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#2D453E]" />
              <span>Projected Footprint</span>
            </div>
            <span className="text-[10px] text-[#4A5D4A]">உத்தேச நிலை</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-serif italic font-bold text-[#2D453E]">
                {simulated.total_tonnes.toFixed(2)}
              </span>
              <span className="text-xs font-sans not-italic font-medium text-[#6B705C]">t CO₂e</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-[#2D453E] text-[#FDFCF9] text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1">
              <TrendingDown className="w-3 h-3 text-[#A8C69F]" />
              <span>−{simResult.percentageReduction}%</span>
            </span>
          </div>
          <div className="mt-3 bg-white/90 p-2.5 rounded-xl border border-[#A8C69F]/40">
            <span className="text-[11px] text-[#2D453E] block font-medium">New Est. Expense</span>
            <span className="text-xs font-bold text-[#2D453E]">
              ₹{projectedCost.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#6B705C] font-semibold block">
              Save ₹{estimatedSavings.toLocaleString('en-IN')} / mo
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Energy Mix Visualizer (Donut Chart) */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-[#E6E2D8] space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif italic text-lg text-[#2D453E]">
              {language === 'en' ? 'Projected Energy Mix' : 'ஆற்றல் பயன்பாட்டு விகிதம்'}
            </h3>
            <p className="text-[11px] text-[#6B705C]">
              Calculated using pure arithmetic without LLM guessing
            </p>
          </div>
          <span className="text-xs bg-[#F7F5F0] text-[#2D453E] border border-[#E6E2D8] font-bold px-2.5 py-0.5 rounded-full">
            Scope 1 &amp; 2
          </span>
        </div>

        <div className="flex items-center gap-4 pt-1">
          {/* Donut SVG */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F4F1EA"
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#7C9082"
                strokeWidth="11"
                strokeDasharray={`${solarLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#6B705C"
                strokeWidth="11"
                strokeDasharray={`${dieselLength} ${circumference}`}
                strokeDashoffset={-solarLength}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-serif italic font-bold text-[#2D453E] leading-none">
                {solarGridPct}%
              </span>
              <span className="text-[10px] text-[#7C9082] font-bold">Clean</span>
              <span className="text-[8px] text-[#8C8F7A]">பசுமை</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7C9082]" />
                <span className="font-semibold text-[#2D332D]">Solar &amp; Grid Power</span>
              </div>
              <span className="font-bold text-[#7C9082]">{solarGridPct}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#6B705C]" />
                <span className="font-semibold text-[#2D332D]">Diesel Generator</span>
              </div>
              <span className="font-bold text-[#6B705C]">{dieselPct}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#A8C69F]" />
                <span className="font-semibold text-[#2D332D]">Fleet / Transport</span>
              </div>
              <span className="font-medium text-[#6B705C]">{remainingPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Assets */}
      <div className="bg-white rounded-[24px] p-4 shadow-sm border border-[#E6E2D8] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#6B705C] uppercase tracking-wider text-[10px]">
            Associated Target Assets
          </span>
          <span className="bg-[#F7F5F0] text-[#2D453E] px-2.5 py-0.5 rounded-full font-semibold text-[10px] border border-[#E6E2D8]">
            2 Gensets &amp; Rooftop Inverter
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E6E2D8] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#6B705C] shrink-0 border border-[#E6E2D8]">
              <Factory className="w-4 h-4 text-[#6B705C]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#2D332D] truncate block">
                DG Set #1 (62.5 kVA)
              </span>
              <span className="text-[10px] text-[#6B705C] font-semibold">
                Reduced by {shiftPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E6E2D8] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E9EEDF] flex items-center justify-center text-[#2D453E] shrink-0 border border-[#A8C69F]/30">
              <Sun className="w-4 h-4 text-[#2D453E]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#2D332D] truncate block">
                Rooftop Solar 30kW
              </span>
              <span className="text-[10px] text-[#7C9082] font-semibold">Increased Load</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIDCO & TN MSME Concession Eligible */}
      <div className="bg-[#F7F5F0] border border-[#E6E2D8] rounded-[24px] p-4 shadow-xs flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-full bg-[#2D453E] text-[#A8C69F] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#2D453E]">
            SIDCO &amp; TN MSME Concession Eligible
          </h4>
          <p className="text-xs text-[#6B705C] leading-tight">
            Qualifies for <strong>SIDCO / MSME Green Energy Concession</strong> (1.5% interest
            subsidy on machinery &amp; solar cap-ex loans).
          </p>
          <p className="text-[11px] text-[#8C8F7A] leading-tight">
            இந்த மாற்றம் சிட்கோ பசுமை கடனுதவிக்கு (1.5% வட்டி மானியம்) முழு தகுதி பெறும்.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-2.5 pt-1">
        {appliedNotification && (
          <div className="p-3 rounded-xl bg-[#E9EEDF] border border-[#A8C69F]/50 text-[#2D453E] text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#2D453E]" />
            <span>Simulation applied to active audit profile!</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleApply}
          className="w-full py-3.5 px-6 rounded-full bg-[#A8C69F] hover:brightness-105 text-[#2D453E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2D453E]" />
          <span>Apply to Audit Report / அறிக்கையில் சேர்க்க</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-2.5 rounded-full bg-white border border-[#E6E2D8] text-[#6B705C] font-semibold text-xs flex items-center justify-center gap-1.5 hover:text-[#2D332D] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8C8F7A]" />
          <span>Reset to Baseline (20%) / மீட்டமை</span>
        </button>
      </div>
    </div>
  );
};
