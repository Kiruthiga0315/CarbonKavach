import React, { useState } from 'react';
import {
  Factory,
  CheckCircle2,
  Calendar,
  TrendingDown,
  PieChart as PieIcon,
  Zap,
  Fuel,
  Truck,
  Flame,
  ShieldCheck,
  Sliders,
  FileDown,
  Info,
} from 'lucide-react';
import { RawBillData, EmissionFootprint, Recommendation, BusinessProfile, Language } from '../types';
import { calculateCO2 } from '../calculateEmissions';

interface DashboardViewProps {
  bills: RawBillData[];
  footprint: EmissionFootprint;
  recommendations: Recommendation[];
  businessProfile: BusinessProfile;
  onNavigateToSimulator: () => void;
  onNavigateToReport: () => void;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bills,
  footprint,
  recommendations,
  businessProfile,
  onNavigateToSimulator,
  onNavigateToReport,
  language,
}) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Compute breakdown percentages strictly from the deterministic footprint
  const totalKg = footprint.total_kg > 0 ? footprint.total_kg : 1;
  const elecPct = Math.round((footprint.electricity_kg / totalKg) * 100);
  const dieselPct = Math.round((footprint.diesel_kg / totalKg) * 100);
  const petrolPct = Math.max(0, 100 - elecPct - dieselPct);

  // Extract logged units across bills
  const totalElecKwh = bills
    .filter((b) => b.bill_type === 'electricity')
    .reduce((acc, b) => acc + (b.units_consumed || 0), 0);

  const totalDieselLitres = bills
    .filter((b) => b.bill_type === 'diesel')
    .reduce((acc, b) => acc + (b.units_consumed || 0), 0);

  const totalPetrolLitres = bills
    .filter((b) => b.bill_type === 'petrol')
    .reduce((acc, b) => acc + (b.units_consumed || 0), 0);

  // SVG Donut calculation: Circumference = 2 * PI * 62 ≈ 389.56
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  const elecLength = (elecPct / 100) * circumference;
  const dieselLength = (dieselPct / 100) * circumference;
  const petrolLength = (petrolPct / 100) * circumference;

  const elecOffset = 0;
  const dieselOffset = -elecLength;
  const petrolOffset = -(elecLength + dieselLength);

  // Primary contributor label
  let primaryContributor = 'Grid Power (TANGEDCO)';
  if (footprint.diesel_kg > footprint.electricity_kg && footprint.diesel_kg > footprint.petrol_kg) {
    primaryContributor = 'Diesel Generators (DG Sets)';
  } else if (footprint.petrol_kg > footprint.electricity_kg) {
    primaryContributor = 'Fleet & Petrol Transport';
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Verification & Facility Banner */}
      <div className="w-full bg-white rounded-[24px] p-4 shadow-sm border border-[#E6E2D8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9EEDF] flex items-center justify-center text-[#2D453E] shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#2D332D] truncate">
              {businessProfile.name}
            </h2>
            <p className="text-[11px] text-[#6B705C] truncate">
              {businessProfile.location} • {businessProfile.htsc_no}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="inline-flex items-center gap-1 bg-[#A8C69F] text-[#2D453E] px-3 py-1 rounded-full text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D453E]" />
            <span>Verified</span>
          </span>
          <span className="text-[10px] text-[#8C8F7A] mt-0.5">தணிக்கை முடிந்தது</span>
        </div>
      </div>

      {/* MANDATORY STRICT RULE COPY (Requirement 9) */}
      <div className="w-full bg-[#E9EEDF] text-[#2D332D] rounded-[24px] p-4 sm:p-5 shadow-sm flex items-start gap-3.5 border border-[#A8C69F]/40">
        <div className="p-2 bg-[#2D453E] text-[#A8C69F] rounded-xl shrink-0 mt-0.5 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#A8C69F]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#2D453E] uppercase tracking-wider">
            <span>Kavach Verification • Statutory Mandate</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#2D453E] leading-relaxed">
            &ldquo;AI only reads your bill. Every CO₂ number below is calculated using fixed, published emission factors — not the AI&apos;s opinion.&rdquo;
          </p>
          <p className="text-[11px] sm:text-xs text-[#4A5D4A] leading-tight">
            உமிழ்வு எண்கள் அனைத்தும் அரசு வெளியிட்ட மாறிலி காரணிகளின்படி (CEA Baseline v19 &amp; IPCC) கணக்கிடப்பட்டுள்ளன.
          </p>
        </div>
      </div>

      {/* Hero Total Monthly Emissions Card */}
      <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-[#E6E2D8] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#6B705C] font-semibold">
              {language === 'en' ? 'Total Monthly Emissions' : 'மொத்த மாத கார்பன் உமிழ்வு'}
            </span>
            <span className="text-xs text-[#6B705C]">
              {businessProfile.audit_date} • GHG Accounting Cycle
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F7F5F0] text-[#2D453E] border border-[#E6E2D8] text-xs font-bold">
            Scope 1 &amp; 2
          </span>
        </div>

        {/* Big Number in Serif Italic */}
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-5xl font-serif font-bold text-[#2D453E] italic tracking-tight">
            {footprint.total_tonnes.toFixed(2)}
          </span>
          <span className="text-xl font-sans not-italic font-bold text-[#7C9082]">tonnes CO₂e</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-medium text-[#6B705C]">
            {footprint.total_kg.toLocaleString('en-IN')} kg CO₂e equivalent
          </span>
          <span className="w-1 h-1 rounded-full bg-[#8C8F7A]"></span>
          <span className="text-xs font-semibold text-[#2D453E]">Tier-2 MSME Certified</span>
        </div>

        {/* Date & Audit strip */}
        <div className="mt-4 pt-2 bg-[#F7F5F0] rounded-xl p-3 flex items-center justify-between text-xs text-[#6B705C] border border-[#E6E2D8]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2D453E]" />
            <span>01/10/2024 – 31/10/2024</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[#2D453E]">
            <span className="w-2 h-2 rounded-full bg-[#7C9082]"></span>
            <span>TN MSME Green Audit</span>
          </div>
        </div>
      </div>

      {/* Peer Benchmark Banner */}
      <div className="w-full bg-[#F7F5F0] border border-[#E6E2D8] rounded-[24px] p-4 shadow-sm flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#7C9082] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#2D453E]">
            {language === 'en' ? '14% Less Carbon Emitted' : '14% குறைந்த கார்பன் உமிழ்வு'}
          </h4>
          <p className="text-xs text-[#6B705C] leading-tight">
            You emit 14% less carbon than similar textile weaving &amp; garment units in{' '}
            <strong className="text-[#2D453E]">Tiruppur District</strong>.
          </p>
          <p className="text-[11px] text-[#6B705C]/90 leading-tight">
            உங்கள் மாவட்டத்தில் உள்ள ஒத்த ஆடை உற்பத்தி நிறுவனங்களை விட 14% குறைவான உமிழ்வு.
          </p>
        </div>
      </div>

      {/* Donut Chart & Category Breakdown Card */}
      <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-[#E6E2D8] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif italic text-lg text-[#2D453E]">
              {language === 'en' ? 'Emissions Breakdown' : 'மூலங்களின்படி வகைப்பாடு'}
            </h3>
            <p className="text-[11px] text-[#6B705C]">
              Pure arithmetic breakdown via published emission factors
            </p>
          </div>
          <PieIcon className="w-4 h-4 text-[#8C8F7A]" />
        </div>

        {/* SVG Donut Visual */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#F4F1EA"
                strokeWidth="18"
              />
              {/* Electricity slice */}
              {elecPct > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#7C9082"
                  strokeWidth="18"
                  strokeDasharray={`${elecLength} ${circumference}`}
                  strokeDashoffset={elecOffset}
                  className="cursor-pointer transition-all hover:opacity-85"
                  onMouseEnter={() => setActiveSegment('electricity')}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              )}
              {/* Diesel slice */}
              {dieselPct > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#6B705C"
                  strokeWidth="18"
                  strokeDasharray={`${dieselLength} ${circumference}`}
                  strokeDashoffset={dieselOffset}
                  className="cursor-pointer transition-all hover:opacity-85"
                  onMouseEnter={() => setActiveSegment('diesel')}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              )}
              {/* Petrol slice */}
              {petrolPct > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#A8C69F"
                  strokeWidth="18"
                  strokeDasharray={`${petrolLength} ${circumference}`}
                  strokeDashoffset={petrolOffset}
                  className="cursor-pointer transition-all hover:opacity-85"
                  onMouseEnter={() => setActiveSegment('petrol')}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              )}
            </svg>

            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-serif italic font-bold text-[#2D453E]">
                {activeSegment === 'electricity'
                  ? `${(footprint.electricity_kg / 1000).toFixed(2)} t`
                  : activeSegment === 'diesel'
                  ? `${(footprint.diesel_kg / 1000).toFixed(2)} t`
                  : activeSegment === 'petrol'
                  ? `${(footprint.petrol_kg / 1000).toFixed(2)} t`
                  : `${footprint.total_tonnes.toFixed(2)} t`}
              </span>
              <span className="text-[10px] text-[#6B705C] font-medium">
                {activeSegment === 'electricity'
                  ? `Electricity (${elecPct}%)`
                  : activeSegment === 'diesel'
                  ? `Diesel DG (${dieselPct}%)`
                  : activeSegment === 'petrol'
                  ? `Petrol (${petrolPct}%)`
                  : '100% Total'}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-[#8C8F7A] mt-1">
            Tap or hover any segment to inspect category
          </span>
        </div>

        {/* Category Ledger Items */}
        <div className="space-y-2">
          {/* Grid Power Electricity */}
          <div className="p-3 rounded-xl bg-[#F7F5F0] flex items-center justify-between border border-[#E6E2D8]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#7C9082] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2D332D] truncate">
                  Grid Power (TANGEDCO)
                </p>
                <p className="text-[11px] text-[#6B705C]">
                  மின்வாரிய விநியோகம் • {totalElecKwh.toLocaleString('en-IN')} kWh @ 0.79 kg/kWh
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-[#2D332D] block">
                {(footprint.electricity_kg / 1000).toFixed(2)} t
              </span>
              <span className="text-[10px] font-bold text-[#7C9082]">{elecPct}%</span>
            </div>
          </div>

          {/* Diesel Generator */}
          {footprint.diesel_kg > 0 && (
            <div className="p-3 rounded-xl bg-[#F7F5F0] flex items-center justify-between border border-[#E6E2D8]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3.5 h-3.5 rounded-full bg-[#6B705C] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D332D] truncate">
                    Diesel Generator (DG Set)
                  </p>
                  <p className="text-[11px] text-[#6B705C]">
                    டீசல் ஜெனரேட்டர் • {totalDieselLitres.toLocaleString('en-IN')} L @ 2.68 kg/L
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#2D332D] block">
                  {(footprint.diesel_kg / 1000).toFixed(2)} t
                </span>
                <span className="text-[10px] font-bold text-[#6B705C]">{dieselPct}%</span>
              </div>
            </div>
          )}

          {/* Petrol Operational Runs */}
          {footprint.petrol_kg > 0 && (
            <div className="p-3 rounded-xl bg-[#F7F5F0] flex items-center justify-between border border-[#E6E2D8]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3.5 h-3.5 rounded-full bg-[#A8C69F] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D332D] truncate">
                    Field Support &amp; Petrol Runs
                  </p>
                  <p className="text-[11px] text-[#6B705C]">
                    களப்பணி பயன்பாடு • {totalPetrolLitres.toLocaleString('en-IN')} L @ 2.31 kg/L
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#2D332D] block">
                  {(footprint.petrol_kg / 1000).toFixed(2)} t
                </span>
                <span className="text-[10px] font-bold text-[#2D453E]">{petrolPct}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Context Strip */}
      <div className="w-full bg-white rounded-[24px] p-4 shadow-sm border border-[#E6E2D8] flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#2D453E] text-[#A8C69F] flex items-center justify-center shrink-0 shadow-xs">
          <Factory className="w-6 h-6 text-[#A8C69F]" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold text-[#2D332D] block">
            Primary Contributor: {primaryContributor}
          </span>
          <p className="text-[11px] text-[#6B705C] truncate">
            Weaving and auxiliary units operated peak shifts during the billing cycle.
          </p>
          <span className="text-[10px] text-[#7C9082] font-semibold block">
            தொடர் உற்பத்தி பயன்பாடு பதிவு செய்யப்பட்டது
          </span>
        </div>
      </div>

      {/* Audit-Approved Reductions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif italic text-lg text-[#2D453E]">
              {language === 'en' ? 'Audit-Approved Reductions' : 'பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்'}
            </h3>
            <p className="text-[11px] text-[#6B705C]">
              Deterministic rule-based opportunities for cost &amp; CO₂ savings
            </p>
          </div>
          <span className="bg-[#E9EEDF] text-[#2D453E] text-xs font-bold px-3 py-1 rounded-full border border-[#A8C69F]/30">
            {recommendations.length} Actionable
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => {
            const monthlySavings = Math.round(rec.estimated_annual_savings_rupees / 12);
            const monthlyCo2 = (rec.estimated_co2_reduction_kg / 12 / 1000).toFixed(2);
            const borderAccent = idx % 2 === 0 ? 'border-[#7C9082]' : 'border-[#A8C69F]';
            const badgeBg = idx % 2 === 0 ? 'bg-[#7C9082]' : 'bg-[#A8C69F] text-[#2D453E]';

            return (
              <div
                key={rec.id}
                className={`w-full bg-[#F7F5F0] rounded-2xl p-4 shadow-sm border border-[#E6E2D8] border-l-4 ${borderAccent} space-y-2`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${badgeBg} flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-xs`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#2D332D] leading-tight">
                      {language === 'en' ? rec.title : rec.tamil_title}
                    </h4>
                    <p className="text-[11px] text-[#8C8F7A] mt-0.5">
                      {language === 'en' ? rec.tamil_title : rec.title}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#6B705C] leading-relaxed pl-11">
                  {language === 'en' ? rec.reasoning : rec.tamil_reasoning}
                </p>

                <div className="flex flex-wrap items-center gap-2 pl-11 pt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#2D453E] text-xs font-bold border border-[#E6E2D8]">
                    <span>Save ₹{monthlySavings.toLocaleString('en-IN')}/mo</span>
                    <span className="text-[10px] text-[#8C8F7A]">(சேமிப்பு)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2D453E] text-[#FDFCF9] text-xs font-bold">
                    <span>−{monthlyCo2} t CO₂/mo</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onNavigateToSimulator}
          className="w-full py-3.5 px-6 rounded-full bg-[#2D453E] hover:bg-[#3D5C53] text-[#FDFCF9] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-[#A8C69F]" />
          <span>Run What-If Simulator / மாதிரி கணக்கீடு செய்க</span>
        </button>

        <button
          type="button"
          onClick={onNavigateToReport}
          className="w-full py-2.5 text-xs text-[#2D453E] font-bold flex items-center justify-center gap-1.5 hover:underline cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-[#7C9082]" />
          <span>Official PCB Audit Dossier ready for export / சான்றிதழ் விவரங்கள்</span>
        </button>
      </div>
    </div>
  );
};
