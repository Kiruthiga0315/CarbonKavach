import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Zap,
  Fuel,
  Lock,
  PhoneCall,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { BillType, RawBillData, Language } from '../types';
import { SAMPLE_BILL_PREVIEWS } from '../sampleData';

interface UploadViewProps {
  bills: RawBillData[];
  onUploadFile: (file: File, category: BillType) => void;
  onSelectSampleBill: (sample: typeof SAMPLE_BILL_PREVIEWS[0]) => void;
  onLoadSeedFixture: () => void;
  onRemoveBill: (id: string) => void;
  onNavigateToDashboard: () => void;
  isExtracting: boolean;
  language: Language;
}

export const UploadView: React.FC<UploadViewProps> = ({
  bills,
  onUploadFile,
  onSelectSampleBill,
  onLoadSeedFixture,
  onRemoveBill,
  onNavigateToDashboard,
  isExtracting,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BillType>('electricity');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file, selectedCategory);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file, selectedCategory);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Micro Context Tag */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A8C69F] text-[#2D453E] shadow-xs font-bold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D453E]" />
          <span>
            {language === 'en'
              ? 'Quick Carbon Audit • Tier-2 MSME'
              : 'விரைவு தணிக்கை • MSME நெசவாலை'}
          </span>
        </div>
        <span className="text-xs text-[#6B705C] flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#7C9082]"></span>
          TN-PCB 2024 V3.1
        </span>
      </div>

      {/* Intro Heading */}
      <div className="space-y-1">
        <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2D453E] tracking-tight">
          {language === 'en' ? 'Scan Factory Receipts' : 'ஆலை ரசீதுகளை ஸ்கேன் செய்யவும்'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B705C] font-medium">
          {language === 'en'
            ? 'Extract raw units from TANGEDCO EB slips and diesel/petrol challans'
            : 'மின்சார வாரிய ரசீது அல்லது எரிபொருள் சீட்டுகளை பதிவேற்றவும்'}
        </p>
      </div>

      {/* Non-Negotiable AI Rule Banner */}
      <div className="bg-[#E9EEDF] border border-[#A8C69F]/50 rounded-[24px] p-4 flex items-start gap-3.5 shadow-sm text-[#2D332D]">
        <div className="p-2 bg-[#2D453E] text-[#A8C69F] rounded-xl shrink-0 mt-0.5 shadow-xs">
          <Zap className="w-4 h-4 text-[#A8C69F]" />
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-[#2D453E] font-bold leading-snug">
            {language === 'en'
              ? 'AI only reads your bill. Every CO₂ number below is calculated using fixed, published emission factors — not the AI\'s opinion.'
              : 'செயற்கை நுண்ணறிவு (AI) உங்கள் ரசீதை படிக்க மட்டுமே பயன்படுகிறது. அனைத்து CO₂ உமிழ்வுகளும் அரசு வெளியிட்ட நிலையான விதிகளின்படியே கணக்கிடப்படுகின்றன.'}
          </p>
          <p className="text-[11px] text-[#4A5D4A]">
            Zero hallucinations • Strict JSON validation • Certified deterministic math
          </p>
        </div>
      </div>

      {/* Guaranteed Demo Fixture Card */}
      <div className="bg-[#2D453E] text-[#FDFCF9] rounded-[28px] p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 border border-[#253933]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#3D5C53] px-2.5 py-0.5 rounded-full text-xs text-[#A8C69F] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#A8C69F]" />
            <span>Guaranteed Stage Demo Fixture</span>
          </div>
          <h3 className="text-sm font-bold text-[#FDFCF9]">
            Pre-loaded Real MSME Data (786 kWh EB + Petrol Runs)
          </h3>
          <p className="text-xs text-[#A8C69F]">
            {language === 'en'
              ? 'Instant 1-click load for live demos even if camera/OCR is offline.'
              : 'நேரலை விளக்கக்காட்சிக்காக உண்மையான விசைத்தறி ஆலை தரவு.'}
          </p>
        </div>
        <button
          onClick={onLoadSeedFixture}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#A8C69F] hover:brightness-105 text-[#2D453E] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <span>Load Test Fixture</span>
          <ArrowRight className="w-4 h-4 text-[#2D453E]" />
        </button>
      </div>

      {/* Bill Category Switcher */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#6B705C] uppercase tracking-wider text-[10px]">
          {language === 'en'
            ? 'Select Bill Category / வகை தேர்ந்தெடுக்கவும்:'
            : 'ரசீது வகையை தேர்ந்தெடுக்கவும்:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* TANGEDCO Electricity */}
          <button
            type="button"
            onClick={() => setSelectedCategory('electricity')}
            className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-center justify-between cursor-pointer ${
              selectedCategory === 'electricity'
                ? 'bg-white border-[#2D453E] ring-2 ring-[#A8C69F] shadow-sm'
                : 'bg-[#F7F5F0] border-[#E6E2D8] hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedCategory === 'electricity'
                    ? 'bg-[#E9EEDF] text-[#2D453E]'
                    : 'bg-[#E6E2D8]/50 text-[#6B705C]'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D332D]">TANGEDCO Electricity</h4>
                <p className="text-xs text-[#6B705C]">LT Tariff IIIB / HT IA (kWh)</p>
              </div>
            </div>
            {selectedCategory === 'electricity' && (
              <CheckCircle2 className="w-5 h-5 text-[#2D453E]" />
            )}
          </button>

          {/* Fuel & DG Set Diesel */}
          <button
            type="button"
            onClick={() => setSelectedCategory('diesel')}
            className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-center justify-between cursor-pointer ${
              selectedCategory === 'diesel'
                ? 'bg-white border-[#2D453E] ring-2 ring-[#A8C69F] shadow-sm'
                : 'bg-[#F7F5F0] border-[#E6E2D8] hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedCategory === 'diesel'
                    ? 'bg-[#E9EEDF] text-[#2D453E]'
                    : 'bg-[#E6E2D8]/50 text-[#6B705C]'
                }`}
              >
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D332D]">Fuel &amp; DG Set Diesel</h4>
                <p className="text-xs text-[#6B705C]">HPCL / IOCL / BPCL (Litres)</p>
              </div>
            </div>
            {selectedCategory === 'diesel' && (
              <CheckCircle2 className="w-5 h-5 text-[#2D453E]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative w-full rounded-[32px] bg-white border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
          dragOver
            ? 'border-[#2D453E] bg-[#E9EEDF]/30 scale-[0.99]'
            : 'border-[#E6E2D8] hover:border-[#7C9082]'
        } shadow-sm`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Tactile Icon Stack */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-[#E9EEDF] flex items-center justify-center text-[#2D453E] shadow-xs">
            <Camera className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#2D453E] text-white flex items-center justify-center shadow-md">
            <UploadCloud className="w-4 h-4 text-[#A8C69F]" />
          </div>
        </div>

        <h3 className="text-base font-bold text-[#2D332D]">
          {language === 'en'
            ? 'Point Camera or Pick Document'
            : 'கேமரா மூலம் படம் எடுக்கவும் அல்லது பதிவேற்றவும்'}
        </h3>
        <p className="text-xs text-[#6B705C] mt-1 max-w-xs">
          {language === 'en'
            ? 'Take a clear photograph of the bill showing units consumed and total amount.'
            : 'அலகு பயன்பாடு (kWh / Litres) மற்றும் கட்டண தொகை தெளிவாக தெரிய வேண்டும்.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 my-4">
          <span className="px-3 py-1 rounded-full bg-[#F7F5F0] text-xs font-medium text-[#6B705C] border border-[#E6E2D8]">
            JPG, PNG, PDF
          </span>
          <span className="px-3 py-1 rounded-full bg-[#F7F5F0] text-xs font-medium text-[#6B705C] border border-[#E6E2D8]">
            Max 25MB
          </span>
          <span className="px-3 py-1 rounded-full bg-[#E9EEDF] text-xs font-bold text-[#2D453E] flex items-center gap-1 border border-[#A8C69F]/30">
            <Zap className="w-3 h-3 text-[#2D453E]" />
            Instant AI OCR
          </span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          disabled={isExtracting}
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-80 min-h-[48px] py-3.5 px-6 rounded-full bg-[#2D453E] hover:bg-[#3D5C53] text-[#FDFCF9] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-5 h-5 text-[#A8C69F]" />
          <span>
            {isExtracting
              ? 'Processing OCR...'
              : language === 'en'
              ? 'Scan or Upload Receipt'
              : 'ரசீதை ஸ்கேன் செய்க'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 text-xs text-[#2D453E] font-semibold hover:underline cursor-pointer"
        >
          {language === 'en'
            ? 'Browse Device Files / கோப்புகளைத் தேட'
            : 'கோப்புகளைத் தேர்ந்தெடுக்கவும்'}
        </button>
      </div>

      {/* Quick Select Sample Receipts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B705C] uppercase tracking-wider text-[10px]">
            {language === 'en' ? 'Or Try Sample Receipts:' : 'மாதிரி ரசீதுகளை முயற்சிக்கவும்:'}
          </span>
          <span className="text-xs text-[#7C9082] font-semibold">Tiruppur Cluster Data</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_BILL_PREVIEWS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSampleBill(sample)}
              className="p-3 rounded-2xl bg-white border border-[#E6E2D8] hover:border-[#7C9082] shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#F7F5F0] text-[#2D453E] flex items-center justify-center shrink-0 group-hover:bg-[#E9EEDF] transition-colors">
                  {sample.bill_type === 'electricity' ? (
                    <Zap className="w-4 h-4 text-[#2D453E]" />
                  ) : (
                    <Fuel className="w-4 h-4 text-[#6B705C]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D332D] truncate">{sample.title}</p>
                  <p className="text-[11px] text-[#6B705C]">{sample.unit_str} • ₹{sample.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F7F5F0] text-[#2D453E] border border-[#E6E2D8] shrink-0">
                Test
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Bills in Session */}
      {bills.length > 0 && (
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 shadow-sm border border-[#E6E2D8] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2D453E]" />
              <h3 className="font-serif italic text-base font-bold text-[#2D332D]">
                {language === 'en'
                  ? `Active Audit Ledger (${bills.length} bills loaded)`
                  : `தணிக்கை ரசீதுகள் (${bills.length})`}
              </h3>
            </div>
            <button
              onClick={onNavigateToDashboard}
              className="text-xs font-bold text-[#2D453E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2D453E]" />
            </button>
          </div>

          <div className="divide-y divide-[#E6E2D8]">
            {bills.map((bill, index) => (
              <div key={bill.id || index} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] flex items-center justify-center text-[#2D453E] shrink-0">
                    {bill.bill_type === 'electricity' ? (
                      <Zap className="w-3.5 h-3.5 text-[#7C9082]" />
                    ) : (
                      <Fuel className="w-3.5 h-3.5 text-[#6B705C]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2D332D] capitalize">
                      {bill.bill_type} ({bill.units_consumed} {bill.unit})
                    </p>
                    <p className="text-[11px] text-[#6B705C]">
                      {bill.cost_rupees ? `₹${bill.cost_rupees.toLocaleString('en-IN')}` : 'Cost: null'}
                      {bill.bill_number ? ` • ${bill.bill_number}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemoveBill(bill.id || String(index))}
                    className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-full transition-colors cursor-pointer"
                    title="Remove bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="w-full py-3 px-6 rounded-full bg-[#2D453E] hover:bg-[#3D5C53] text-[#FDFCF9] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span>Proceed to Emissions Dashboard</span>
            <ArrowRight className="w-4 h-4 text-[#A8C69F]" />
          </button>
        </div>
      )}

      {/* Privacy & Auditor Shield Notice */}
      <div className="rounded-[24px] bg-[#F7F5F0] border border-[#E6E2D8] p-4 flex items-start gap-3.5 text-[#2D332D]">
        <div className="p-2 bg-white text-[#2D453E] rounded-xl shrink-0 mt-0.5 border border-[#E6E2D8]">
          <Lock className="w-4 h-4 text-[#2D453E]" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#2D453E]">
            Auditor Shield &amp; Statutory Data Privacy Lock
          </h4>
          <p className="text-xs text-[#6B705C] leading-relaxed">
            {language === 'en'
              ? 'Your bills are processed in volatile memory for Tamil Nadu MSME emission reporting. No raw utility copies are saved on public cloud databases.'
              : 'உங்கள் ஆவணங்கள் பாதுகாப்பாக கணக்கிடப்படுகின்றன. பொது தளங்களில் சேமிக்கப்படாது. தணிக்கை ஆவணங்களுக்காக மட்டுமே.'}
          </p>
        </div>
      </div>

      {/* Operational Help Helpline */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#6B705C] py-1">
        <PhoneCall className="w-4 h-4 text-[#7C9082]" />
        <span>
          Need Help? TN DIC Helpline:{' '}
          <strong className="text-[#2D453E]">1800-425-2425</strong>
        </span>
      </div>
    </div>
  );
};
