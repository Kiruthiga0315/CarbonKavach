import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  Zap,
  Building2,
  Database,
  Hash,
  Clock,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Machine, BusinessProfile, Language } from '../types';
import {
  DEFAULT_LOAD_FACTOR,
  LOAD_FACTOR_CITATION,
  LOAD_FACTOR_CITATION_TAMIL,
  MODELED_ESTIMATE_DISCLAIMER,
  MODELED_ESTIMATE_DISCLAIMER_TAMIL,
  MachineFormData,
  ValidationErrors,
  validateMachineFormData,
  calculateMachineModeledKwh,
  calculateTotalModeledKwh,
  calculateTotalConnectedLoadKw,
} from '../machineModel';

interface MachineInventoryViewProps {
  machines: Machine[];
  onAddMachine: (machine: Machine) => void;
  onRemoveMachine: (id: string) => void;
  businessProfile: BusinessProfile;
  language: Language;
}

export const MachineInventoryView: React.FC<MachineInventoryViewProps> = ({
  machines,
  onAddMachine,
  onRemoveMachine,
  businessProfile,
  language,
}) => {
  // Form input states: strictly NO plausible-looking defaults for any field except load_factor
  const [formData, setFormData] = useState<MachineFormData>({
    name: '',
    rated_power_kw: '',
    quantity: '',
    typical_hours_per_day: '',
    typical_days_in_period: '',
    load_factor: String(DEFAULT_LOAD_FACTOR),
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Totals for the running summary
  const totalModeledKwh = calculateTotalModeledKwh(machines);
  const totalConnectedKw = calculateTotalConnectedLoadKw(machines);
  const totalUnits = machines.reduce((acc, m) => acc + m.quantity, 0);

  const handleInputChange = (field: keyof MachineFormData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // If user already attempted to submit, validate live on change
    if (hasAttemptedSubmit) {
      const validation = validateMachineFormData(updated);
      setErrors(validation.errors);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      rated_power_kw: '',
      quantity: '',
      typical_hours_per_day: '',
      typical_days_in_period: '',
      load_factor: String(DEFAULT_LOAD_FACTOR),
      notes: '',
    });
    setErrors({});
    setHasAttemptedSubmit(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setSuccessNotice(null);

    const validation = validateMachineFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const businessId = businessProfile.id || 'biz_sri_velan_mills';
    const newMachineId = `mach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newMachine: Machine = {
      id: newMachineId,
      businessId,
      name: formData.name.trim(),
      rated_power_kw: Number(formData.rated_power_kw),
      quantity: Number(formData.quantity),
      typical_hours_per_day: Number(formData.typical_hours_per_day),
      typical_days_in_period: Number(formData.typical_days_in_period),
      load_factor: Number(formData.load_factor),
      notes: formData.notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    onAddMachine(newMachine);
    setSuccessNotice(
      language === 'en'
        ? `Added "${newMachine.name}" (${newMachine.quantity} units) to connected-load digital twin.`
        : `"${newMachine.name}" இயந்திரம் இணைக்கப்பட்ட சுமை மாதிரி கணக்கீட்டில் சேர்க்கப்பட்டது.`
    );
    handleResetForm();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-24">
      {/* 1. Mandatory Top Disclaimer Banner */}
      <div className="bg-[#E9EEDF] border-2 border-[#7C9082] rounded-2xl p-4 sm:p-5 text-[#2D453E] shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-[#2D453E] text-[#A8C69F] shrink-0 mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-[#2D453E] text-[#FDFCF9] px-2.5 py-0.5 rounded-full">
                {language === 'en'
                  ? 'Connected-Load Digital Twin'
                  : 'இணைக்கப்பட்ட சுமை மாதிரி கணக்கீடு'}
              </span>
              <span className="text-xs font-bold bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/30 px-2.5 py-0.5 rounded-full">
                {language === 'en' ? MODELED_ESTIMATE_DISCLAIMER : MODELED_ESTIMATE_DISCLAIMER_TAMIL}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#2D453E] leading-relaxed pt-1">
              {language === 'en'
                ? 'This module models plant energy consumption strictly from user-entered equipment nameplates and operational schedules. It is a mathematical modeled estimate and is not derived from IoT meters, hardware telemetry, or physical sensor data.'
                : 'இந்த பிரிவு பயனர் உள்ளிட்ட உபகரண விவரக்குறிப்புகள் மற்றும் இயக்க அட்டவணைகளிலிருந்து மட்டுமே மின் நுகர்வை மாதிரியாக்குகிறது. இது ஒரு கணித மாதிரி மதிப்பீடு; ஐஓடி மீட்டர்கள் அல்லது சென்சார் அளவீடுகள் அல்ல.'}
            </p>
            <div className="text-[11px] text-[#6B705C] font-mono pt-0.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#7C9082]" />
              <span>Backing Model Schema: Firestore collection </span>
              <span className="font-bold text-[#2D453E]">machines/{'{machineId}'}</span>
              <span> • businessId: {businessProfile.id || 'biz_sri_velan_mills'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Running Total Digital Twin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card A: Running Total Modeled kWh */}
        <div className="bg-[#F7F5F0] border border-[#E6E2D8] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B705C]">
              {language === 'en' ? 'Running Modeled Energy' : 'மொத்த மாதிரி மின்சாரம்'}
            </span>
            <div className="p-2 rounded-xl bg-[#2D453E] text-[#A8C69F]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#2D453E] tracking-tight font-mono">
              {totalModeledKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-base font-semibold text-[#6B705C] ml-1.5">kWh</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9EEDF] text-[#2D453E] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C9082]" />
              <span>
                {language === 'en'
                  ? 'Modeled Estimate — Not Sensor Data'
                  : 'மாதிரி மதிப்பீடு — சென்சார் அல்ல'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#6B705C] mt-3">
            {language === 'en'
              ? 'Aggregated across all registered equipment entries in the digital twin.'
              : 'பதிவுசெய்யப்பட்ட அனைத்து இயந்திரங்களின் ஒருங்கிணைந்த மாதிரி நுகர்வு.'}
          </p>
        </div>

        {/* Card B: Connected Nameplate Load (kW) */}
        <div className="bg-[#F7F5F0] border border-[#E6E2D8] rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B705C]">
              {language === 'en' ? 'Connected Nameplate Load' : 'மொத்த இணைக்கப்பட்ட சுமை'}
            </span>
            <div className="p-2 rounded-xl bg-[#E9EEDF] text-[#2D453E]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#2D453E] tracking-tight font-mono">
              {totalConnectedKw.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-base font-semibold text-[#6B705C] ml-1.5">kW</span>
            </div>
            <div className="mt-2 text-[11px] text-[#6B705C]">
              {language === 'en'
                ? 'Cumulative rated power (nameplate sum across all units)'
                : 'அனைத்து இயந்திரங்களின் பெயர் பலகை திறன் கூடுதல்'}
            </div>
          </div>
        </div>

        {/* Card C: Machine Count & Business Profile */}
        <div className="bg-[#F7F5F0] border border-[#E6E2D8] rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B705C]">
              {language === 'en' ? 'Equipment Count' : 'இயந்திரங்கள் எண்ணிக்கை'}
            </span>
            <div className="p-2 rounded-xl bg-[#E9EEDF] text-[#2D453E]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#2D453E] tracking-tight font-mono">
              {machines.length}
              <span className="text-base font-semibold text-[#6B705C] ml-1.5">
                {language === 'en' ? `types (${totalUnits} units)` : `வகைகள் (${totalUnits} அலகுகள்)`}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#6B705C] flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#7C9082] shrink-0" />
              <span className="truncate">{businessProfile.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="bg-[#E9EEDF] border border-[#A8C69F] rounded-2xl p-4 text-[#2D453E] text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#2D453E]" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs font-bold text-[#6B705C] hover:text-[#2D453E] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Add Machine Form UI */}
      <div className="bg-[#FDFCF9] border border-[#E6E2D8] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="border-b border-[#E6E2D8] pb-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2D453E] text-[#A8C69F]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#2D453E]">
                  {language === 'en' ? 'Add Machine to Inventory' : 'இயந்திரத்தைச் சேர்க்கவும்'}
                </h3>
                <p className="text-xs text-[#6B705C]">
                  {language === 'en'
                    ? 'Enter equipment specifications from the physical nameplate to feed the digital twin model.'
                    : 'மாதிரி கணக்கீட்டிற்கு பெயர் பலகையிலுள்ள விவரக்குறிப்புகளை உள்ளிடவும்.'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-[#F4F1EA] text-[#6B705C] px-3 py-1 rounded-full border border-[#E6E2D8]">
              {language === 'en'
                ? 'Modeled Estimate — Not Sensor Data'
                : 'மாதிரி மதிப்பீடு — சென்சார் அல்ல'}
            </span>
          </div>
        </div>

        {/* Form Validation Failure Banner if rejected */}
        {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
          <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-2xl p-4 text-[#93000a] mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                {language === 'en'
                  ? 'Entry Rejected: Please correct invalid or blank fields'
                  : 'உள்ளீடு நிராகரிக்கப்பட்டது: தவறான அல்லது காலியான புலங்களைச் சரிசெய்யவும்'}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {language === 'en'
                ? 'Validation policy: Rated power (kW) and quantity must be positive numbers greater than zero. The system strictly rejects blank or zero entries rather than silently assuming zero consumption.'
                : 'சரிபார்ப்புக் கொள்கை: பெயர் பலகை திறன் (kW) மற்றும் எண்ணிக்கை பூஜ்ஜியத்திற்கு அதிகமான நேர்மறை எண்களாக இருக்க வேண்டும். பூஜ்ஜிய நுகர்வை அமைதியாக ஊகிக்காமல் கணினி காலியான உள்ளீடுகளை நிராகரிக்கிறது.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Machine Name & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D453E] mb-2">
                {language === 'en' ? 'Machine Name / Equipment ID *' : 'இயந்திரத்தின் பெயர் / அடையாளம் *'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'e.g. Ring Frame Spinning Motor #1'
                    : 'எ.கா. நூற்பாலை மோட்டார் #1'
                }
                className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#2D332D] focus:outline-none transition-colors ${
                  errors.name
                    ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                    : 'border-[#E6E2D8] focus:border-[#2D453E]'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-[#ba1a1a] font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D453E] mb-2">
                {language === 'en' ? 'Equipment Notes / Location' : 'குறிப்புகள் / அமைவிடம்'}
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'e.g. Shed B, 415V 3-phase induction motor'
                    : 'எ.கா. கொட்டகை பி, 415V மோட்டார்'
                }
                className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-white text-sm text-[#2D332D] focus:border-[#2D453E] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Rated Power (kW) & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D453E] mb-2">
                {language === 'en'
                  ? 'Rated Power (kW) [From Nameplate] *'
                  : 'பெயர் பலகை திறன் (kW) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.rated_power_kw}
                  onChange={(e) => handleInputChange('rated_power_kw', e.target.value)}
                  placeholder="e.g. 15.0"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white text-sm text-[#2D332D] focus:outline-none transition-colors font-mono ${
                    errors.rated_power_kw
                      ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                      : 'border-[#E6E2D8] focus:border-[#2D453E]'
                  }`}
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-[#6B705C] pointer-events-none">
                  kW
                </span>
              </div>
              <p className="text-[11px] text-[#6B705C] mt-1">
                {language === 'en'
                  ? 'User-entered from physical motor/machine nameplate. (Must be > 0)'
                  : 'உபகரண பெயர் பலகையிலிருந்து உள்ளிட வேண்டும். (> 0)'}
              </p>
              {errors.rated_power_kw && (
                <p className="text-xs text-[#ba1a1a] font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.rated_power_kw}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D453E] mb-2">
                {language === 'en' ? 'Quantity of Machines *' : 'இயந்திரங்களின் எண்ணிக்கை *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="e.g. 4"
                  className={`w-full px-4 py-3 pr-14 rounded-xl border bg-white text-sm text-[#2D332D] focus:outline-none transition-colors font-mono ${
                    errors.quantity
                      ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                      : 'border-[#E6E2D8] focus:border-[#2D453E]'
                  }`}
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-[#6B705C] pointer-events-none">
                  units
                </span>
              </div>
              <p className="text-[11px] text-[#6B705C] mt-1">
                {language === 'en'
                  ? 'Number of identical installed units. (Must be at least 1)'
                  : 'ஒரே மாதிரியான இயந்திரங்களின் எண்ணிக்கை. (குறைந்தது 1)'}
              </p>
              {errors.quantity && (
                <p className="text-xs text-[#ba1a1a] font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.quantity}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Typical Hours/Day & Typical Days in Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D453E] mb-2">
                {language === 'en'
                  ? 'Typical Hours Operated per Day *'
                  : 'ஒரு நாளைக்கு வழக்கமான இயக்க நேரம் *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="24"
                  value={formData.typical_hours_per_day}
                  onChange={(e) => handleInputChange('typical_hours_per_day', e.target.value)}
                  placeholder="e.g. 16.0"
                  className={`w-full px-4 py-3 pr-16 rounded-xl border bg-white text-sm text-[#2D332D] focus:outline-none transition-colors font-mono ${
                    errors.typical_hours_per_day
                      ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                      : 'border-[#E6E2D8] focus:border-[#2D453E]'
                  }`}
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-[#6B705C] pointer-events-none">
                  hrs/day
                </span>
              </div>
              <p className="text-[11px] text-[#6B705C] mt-1">
                {language === 'en'
                  ? 'Operational estimate (e.g., 8 hrs for single shift, 16 hrs for two shifts)'
                  : 'இயக்க மதிப்பீடு (எ.கா., ஒரு ஷிப்ட் 8 மணி, 2 ஷிப்ட் 16 மணி)'}
              </p>
              {errors.typical_hours_per_day && (
                <p className="text-xs text-[#ba1a1a] font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.typical_hours_per_day}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D453E] mb-2">
                {language === 'en'
                  ? 'Typical Days in Billing Period *'
                  : 'கணக்கீட்டுக் காலத்தில் இயக்கப்படும் நாட்கள் *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="365"
                  value={formData.typical_days_in_period}
                  onChange={(e) => handleInputChange('typical_days_in_period', e.target.value)}
                  placeholder="e.g. 26"
                  className={`w-full px-4 py-3 pr-14 rounded-xl border bg-white text-sm text-[#2D332D] focus:outline-none transition-colors font-mono ${
                    errors.typical_days_in_period
                      ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                      : 'border-[#E6E2D8] focus:border-[#2D453E]'
                  }`}
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-[#6B705C] pointer-events-none">
                  days
                </span>
              </div>
              <p className="text-[11px] text-[#6B705C] mt-1">
                {language === 'en'
                  ? 'Working days in the period (e.g. 26 days/month excluding Sundays)'
                  : 'வேலை நாட்கள் (எ.கா. மாதத்திற்கு 26 வேலை நாட்கள்)'}
              </p>
              {errors.typical_days_in_period && (
                <p className="text-xs text-[#ba1a1a] font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.typical_days_in_period}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Load Factor with MANDATORY Source Citation */}
          <div className="bg-[#F7F5F0] border border-[#E6E2D8] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2D453E] flex items-center gap-1.5">
                <GaugeIcon className="w-4 h-4 text-[#7C9082]" />
                <span>{language === 'en' ? 'Load Factor (User-Editable)' : 'சுமைக் காரணி (திருத்தக்கூடியது)'}</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-[#7C9082]">
                IEC 60034 Standard Reference
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
              <div className="sm:col-span-1">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.2"
                  value={formData.load_factor}
                  onChange={(e) => handleInputChange('load_factor', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-[#2D332D] font-mono font-bold focus:outline-none ${
                    errors.load_factor
                      ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                      : 'border-[#E6E2D8] focus:border-[#2D453E]'
                  }`}
                />
                {errors.load_factor && (
                  <p className="text-xs text-[#ba1a1a] font-medium mt-1">
                    {errors.load_factor}
                  </p>
                )}
              </div>

              {/* Exact Mandated Inline Source Citation */}
              <div className="sm:col-span-3 bg-white border border-[#E6E2D8] rounded-xl p-3 text-xs text-[#2D453E] space-y-1">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#7C9082] shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed italic text-[#2D453E]">
                    "{LOAD_FACTOR_CITATION}"
                  </p>
                </div>
                {language === 'ta' && (
                  <p className="text-[11px] text-[#6B705C] pl-6 italic">
                    "{LOAD_FACTOR_CITATION_TAMIL}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modeled Output Live Preview for this entry */}
          {Number(formData.rated_power_kw) > 0 &&
            Number(formData.quantity) > 0 &&
            Number(formData.typical_hours_per_day) > 0 &&
            Number(formData.typical_days_in_period) > 0 &&
            Number(formData.load_factor) > 0 && (
              <div className="bg-[#E9EEDF] border border-[#A8C69F] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#2D453E]" />
                  <span className="text-xs font-bold text-[#2D453E]">
                    {language === 'en'
                      ? 'Projected Single Entry Addition:'
                      : 'இந்த இயந்திரத்திற்கான மாதிரி கணக்கீடு:'}
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#2D453E]">
                    +
                    {calculateMachineModeledKwh({
                      rated_power_kw: Number(formData.rated_power_kw),
                      quantity: Number(formData.quantity),
                      typical_hours_per_day: Number(formData.typical_hours_per_day),
                      typical_days_in_period: Number(formData.typical_days_in_period),
                      load_factor: Number(formData.load_factor),
                    }).toLocaleString()}{' '}
                    kWh
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#6B705C]">
                  [Modeled estimate based on entered nameplate & hours]
                </span>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-full border border-[#E6E2D8] text-xs font-bold text-[#6B705C] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Clear Form' : 'படிவத்தை அழிக்கவும்'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2D453E] text-[#FDFCF9] text-xs font-bold hover:bg-[#253933] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Add Machine' : 'இயந்திரத்தைச் சேர்'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Running List of Added Machines */}
      <div className="bg-[#FDFCF9] border border-[#E6E2D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#E6E2D8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#2D453E]">
                {language === 'en'
                  ? 'Connected-Load Inventory List'
                  : 'பதிவுசெய்யப்பட்ட இயந்திரங்களின் பட்டியல்'}
              </h3>
              <span className="text-xs font-mono font-bold bg-[#E9EEDF] text-[#2D453E] px-2.5 py-0.5 rounded-full">
                {machines.length}
              </span>
            </div>
            <p className="text-xs text-[#6B705C] mt-0.5">
              {language === 'en'
                ? 'Watch the digital twin modeled consumption build up as machinery is logged.'
                : 'இயந்திரங்கள் சேர்க்கப்படும்போது மாதிரி நுகர்வு உயர்வதை நீங்கள் பார்க்கலாம்.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B705C] block">
              {language === 'en' ? 'Running Modeled Total' : 'தற்போதைய மொத்த மாதிரி நுகர்வு'}
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-[#2D453E] font-mono">
              {totalModeledKwh.toLocaleString()}{' '}
              <span className="text-xs font-medium text-[#6B705C]">kWh (Modeled Estimate)</span>
            </span>
          </div>
        </div>

        {machines.length === 0 ? (
          <div className="py-12 px-4 text-center border-2 border-dashed border-[#E6E2D8] rounded-2xl space-y-3 bg-[#F7F5F0]/50">
            <div className="w-12 h-12 rounded-full bg-[#E9EEDF] text-[#2D453E] flex items-center justify-center mx-auto">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-[#2D453E]">
                {language === 'en'
                  ? 'No equipment added to the digital twin yet'
                  : 'மாதிரி கணக்கீட்டில் இதுவரை இயந்திரங்கள் எதுவும் சேர்க்கப்படவில்லை'}
              </h4>
              <p className="text-xs text-[#6B705C] leading-relaxed">
                {language === 'en'
                  ? 'Add your plant motors, compressors, and machines using the form above. The running total above will update dynamically as you register each machine.'
                  : 'மேலே உள்ள படிவத்தைப் பயன்படுத்தி மோட்டார்கள், கம்ப்ரசர்கள் மற்றும் இயந்திரங்களைச் சேர்க்கவும்.'}
              </p>
              <div className="pt-2">
                <span className="inline-block text-[11px] font-semibold bg-[#E9EEDF] text-[#2D453E] px-3 py-1 rounded-full border border-[#A8C69F]/50">
                  {language === 'en' ? MODELED_ESTIMATE_DISCLAIMER : MODELED_ESTIMATE_DISCLAIMER_TAMIL}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {machines.map((machine, index) => {
              const machineKwh = calculateMachineModeledKwh(machine);
              const connectedKw = machine.rated_power_kw * machine.quantity;

              return (
                <div
                  key={machine.id}
                  className="bg-[#F7F5F0] border border-[#E6E2D8] rounded-2xl p-4 sm:p-5 hover:border-[#7C9082] transition-colors relative"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Machine Info */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-full bg-[#2D453E] text-[#FDFCF9] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#2D453E] truncate">
                          {machine.name}
                        </h4>
                        <span className="text-[11px] font-bold bg-[#E9EEDF] text-[#2D453E] px-2 py-0.5 rounded-md font-mono">
                          {machine.quantity} {machine.quantity === 1 ? 'unit' : 'units'}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B705C] bg-white px-2 py-0.5 rounded border border-[#E6E2D8]">
                          id: {machine.id}
                        </span>
                      </div>

                      {/* Specs pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8]">
                          <span className="text-[10px] text-[#6B705C] block uppercase font-semibold">
                            Rated Nameplate
                          </span>
                          <span className="font-mono font-bold text-[#2D453E]">
                            {machine.rated_power_kw} kW / unit
                          </span>
                        </div>

                        <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8]">
                          <span className="text-[10px] text-[#6B705C] block uppercase font-semibold">
                            Total Connected
                          </span>
                          <span className="font-mono font-bold text-[#2D453E]">
                            {connectedKw.toFixed(1)} kW
                          </span>
                        </div>

                        <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8]">
                          <span className="text-[10px] text-[#6B705C] block uppercase font-semibold">
                            Operating Schedule
                          </span>
                          <span className="font-mono font-bold text-[#2D453E]">
                            {machine.typical_hours_per_day}h/d × {machine.typical_days_in_period}d
                          </span>
                        </div>

                        <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8]">
                          <span className="text-[10px] text-[#6B705C] block uppercase font-semibold">
                            Load Factor
                          </span>
                          <span className="font-mono font-bold text-[#2D453E]">
                            {machine.load_factor} (IEC)
                          </span>
                        </div>
                      </div>

                      {machine.notes && (
                        <p className="text-xs text-[#6B705C] flex items-center gap-1 pt-0.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-[#7C9082]" />
                          <span>{machine.notes}</span>
                        </p>
                      )}

                      {/* Explicit Arithmetic Formula Trace */}
                      <div className="text-[11px] font-mono text-[#6B705C] bg-[#E9EEDF]/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#2D453E]">Formula:</span>
                        <span>
                          {machine.rated_power_kw} kW × {machine.quantity} units ×{' '}
                          {machine.typical_hours_per_day} hrs × {machine.typical_days_in_period} days ×{' '}
                          {machine.load_factor} load factor ={' '}
                          <strong className="text-[#2D453E]">{machineKwh.toLocaleString()} kWh</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right: Calculated Modeled kWh & Delete */}
                    <div className="flex items-center lg:flex-col lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6E2D8]">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B705C] block">
                          Modeled Energy
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#2D453E] font-mono">
                          {machineKwh.toLocaleString()}
                          <span className="text-xs font-semibold text-[#6B705C] ml-1">kWh</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#ba1a1a] block">
                          (Modeled Estimate — Not Sensor Data)
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveMachine(machine.id)}
                        className="p-2 rounded-xl text-[#6B705C] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors cursor-pointer"
                        title={
                          language === 'en'
                            ? 'Remove machine from inventory'
                            : 'இயந்திரத்தை நீக்கு'
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper simple icon component
function GaugeIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Zap {...props} />;
}
