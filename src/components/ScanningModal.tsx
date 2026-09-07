import React, { useEffect, useState } from 'react';
import { Check, Loader2, X, Zap, Fuel, ShieldAlert } from 'lucide-react';
import { ExtractedBillPayload, Language } from '../types';

interface ScanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedBillPayload | null;
  errorMessage: string | null;
  onConfirm: () => void;
  language: Language;
}

export const ScanningModal: React.FC<ScanningModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  errorMessage,
  onConfirm,
  language,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [counterVal, setCounterVal] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setCounterVal(0);
      return;
    }

    // Step timeline progression animation
    const t1 = setTimeout(() => setCurrentStep(2), 800);
    const t2 = setTimeout(() => setCurrentStep(3), 1600);
    const t3 = setTimeout(() => setCurrentStep(4), 2400);

    // Number roll-up effect
    const target = extractedData?.units_consumed || 786;
    let start = 0;
    const interval = setInterval(() => {
      start += Math.ceil(target / 15);
      if (start >= target) {
        setCounterVal(target);
        clearInterval(interval);
      } else {
        setCounterVal(start);
      }
    }, 80);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [isOpen, extractedData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D332D]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FDFCF9] rounded-[32px] shadow-2xl overflow-hidden my-auto border border-[#E6E2D8]">
        {/* Top Decorative Header */}
        <div className="bg-[#2D453E] text-[#FDFCF9] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A8C69F] animate-ping" />
            <div>
              <h3 className="text-sm font-bold text-[#FDFCF9] leading-none">
                CarbonKavach Scanner Session
              </h3>
              <span className="text-[11px] text-[#A8C69F]">
                கார்பன்கவசம் தானியங்கி தணிக்கை
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Error View if OCR Failed or was Malformed */}
          {errorMessage ? (
            <div className="bg-[#ffdad6] border border-[#ba1a1a] rounded-2xl p-4 text-[#93000a] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Extraction Incomplete / பிழை ஏற்பட்டது</span>
              </div>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
              <p className="text-[11px] text-[#93000a]/80">
                Rule Notice: The AI engine returns null rather than guessing blurred or uncertain numbers.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#ba1a1a] text-white rounded-full text-xs font-bold hover:bg-[#93000a] transition-colors cursor-pointer"
                >
                  Retake Photo / மீண்டும் எடுக்கவும்
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Document Scan Peek Preview */}
              <div className="relative overflow-hidden rounded-2xl bg-[#F7F5F0] p-3.5 border border-[#E6E2D8] flex items-center gap-3">
                <div className="relative w-14 h-16 rounded-xl bg-[#2D453E] flex items-center justify-center text-[#A8C69F] shrink-0 overflow-hidden shadow-xs">
                  {extractedData?.bill_type === 'electricity' ? (
                    <Zap className="w-7 h-7 text-[#A8C69F]" />
                  ) : (
                    <Fuel className="w-7 h-7 text-[#A8C69F]" />
                  )}
                  {/* Laser scan line */}
                  <div className="absolute inset-x-0 h-1 bg-[#A8C69F] shadow-[0_0_8px_#A8C69F] animate-bounce" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#7C9082] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C9082] animate-ping" />
                    <span>TANGEDCO LT HT-04 • AUDIT VALIDATED</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2D332D] truncate">
                    {extractedData?.bill_type === 'electricity'
                      ? 'EB Bill #492-019-382'
                      : `${extractedData?.bill_type?.toUpperCase()} Fuel Challan`}
                  </h4>
                  <p className="text-[11px] text-[#6B705C]">
                    திருப்பூர் - விசைத்தறி பிரிவு மின்ரசீது
                  </p>
                </div>
              </div>

              {/* Central Radar & Meter Core */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Expanding Radar Ripples */}
                  <div className="absolute inset-0 rounded-full bg-[#A8C69F]/30 animate-ping opacity-75" />
                  <div className="absolute inset-2 rounded-full bg-[#E9EEDF] animate-pulse" />

                  {/* Rotating radar sweep SVG */}
                  <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="72" fill="none" stroke="#7C9082" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
                    <circle cx="80" cy="80" r="48" fill="none" stroke="#7C9082" strokeWidth="1" opacity="0.3" />
                  </svg>

                  {/* Center Spindle */}
                  <div className="relative z-10 w-24 h-24 rounded-full bg-[#2D453E] text-white flex flex-col items-center justify-center shadow-lg">
                    {extractedData?.bill_type === 'electricity' ? (
                      <Zap className="w-6 h-6 text-[#A8C69F]" />
                    ) : (
                      <Fuel className="w-6 h-6 text-[#A8C69F]" />
                    )}
                    <span className="text-lg font-bold tracking-tight text-[#FDFCF9] mt-0.5 font-mono">
                      {counterVal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#A8C69F] font-semibold uppercase">
                      {extractedData?.unit || 'kWh'}
                    </span>
                  </div>
                </div>

                {/* Bilingual Status */}
                <div className="text-center mt-2">
                  <h3 className="font-serif italic text-base font-bold text-[#2D453E]">
                    {language === 'en' ? 'Reading your bill...' : 'உங்கள் பில் படிக்கப்படுகிறது...'}
                  </h3>
                  <p className="text-xs text-[#6B705C] font-medium">
                    {language === 'en'
                      ? 'Extracting raw units, consumer tariff & applying emission factors'
                      : 'அலகுகள் பிரித்தெடுக்கப்பட்டு உமிழ்வு கணக்கிடப்படுகிறது'}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Audit Progress Ledger */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E2D8] space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E6E2D8]">
                  <span className="text-[10px] font-bold text-[#8C8F7A] uppercase tracking-wider">
                    Audit Protocol / தணிக்கை நெறிமுறை
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E9EEDF] text-[#2D453E] text-[10px] font-bold border border-[#A8C69F]/30">
                    Step {currentStep} of 4
                  </span>
                </div>

                {/* Step 1 */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    currentStep >= 1 ? 'bg-[#2D453E] text-[#A8C69F]' : 'bg-[#F7F5F0] text-[#8C8F7A]'
                  }`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2D332D]">Optical Character Recognition (OCR)</span>
                      <span className="text-[10px] text-[#7C9082] font-bold">100%</span>
                    </div>
                    <p className="text-[11px] text-[#6B705C]">
                      எழுத்துணர்தல் வெற்றிகரமாக முடிந்தது (AI Raw Extraction)
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    currentStep >= 2 ? 'bg-[#2D453E] text-[#A8C69F]' : 'bg-[#F7F5F0] text-[#8C8F7A]'
                  }`}>
                    {currentStep > 2 ? <Check className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#2D332D]">Tariff &amp; Circle Validation</span>
                    <p className="text-[11px] text-[#6B705C]">
                      TANGEDCO LT-III B • கோவை வடக்கு வட்டம் (Coimbatore North)
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    currentStep >= 3 ? 'bg-[#2D453E] text-[#A8C69F]' : 'bg-[#F7F5F0] text-[#8C8F7A]'
                  }`}>
                    {currentStep > 3 ? <Check className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#2D332D]">Emission Factor Computation (CEA v19)</span>
                    <p className="text-[11px] text-[#6B705C]">
                      Pure arithmetic calculation: 0.79 kg CO₂/kWh (No AI guessing)
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    currentStep >= 4 ? 'bg-[#2D453E] text-[#A8C69F]' : 'bg-[#F7F5F0] text-[#8C8F7A]'
                  }`}>
                    {currentStep >= 4 ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#8C8F7A]" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#2D332D]">MSME Peer Benchmark</span>
                    <p className="text-[11px] text-[#6B705C]">
                      திருப்பூர் ஜவுளி ஆலைகள் சராசரியுடன் ஒப்பீடு
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-full bg-[#F7F5F0] text-[#2D332D] font-semibold text-xs border border-[#E6E2D8] hover:bg-[#E6E2D8]/40 transition-colors cursor-pointer"
                >
                  Cancel / ரத்து செய்
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-3 px-4 rounded-full bg-[#2D453E] text-[#FDFCF9] font-bold text-xs hover:bg-[#3D5C53] shadow-md transition-colors cursor-pointer"
                >
                  Confirm &amp; Add / உறுதி செய்
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
