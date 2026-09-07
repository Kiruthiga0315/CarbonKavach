import React from 'react';
import { ShieldCheck, Globe2, User, RefreshCw, Sparkles } from 'lucide-react';
import { ActiveTab, Language } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  language: Language;
  onLanguageToggle: () => void;
  onLoadSeedFixture: () => void;
  isUsingSeedFixture: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  language,
  onLanguageToggle,
  onLoadSeedFixture,
  isUsingSeedFixture,
}) => {
  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'upload':
        return language === 'en' ? 'Bill Scanner Session' : 'ரசீது ஸ்கேனர் பதிவு';
      case 'dashboard':
        return language === 'en' ? 'Compliance Dashboard' : 'கட்டுப்பாட்டு அறை';
      case 'machines':
        return language === 'en'
          ? 'Machine Inventory (Modeled Estimate — Not Sensor Data)'
          : 'இயந்திரப் பட்டியல் (மாதிரி மதிப்பீடு — சென்சார் அல்ல)';
      case 'simulator':
        return language === 'en' ? 'What-If Decarbonization Simulator' : 'மாதிரி உமிழ்வு கணக்கீடு';
      case 'report':
        return language === 'en' ? 'Auditor-Ready Dossier' : 'தணிக்கை ஆவணம் & சான்றிதழ்';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#2D453E] text-[#FDFCF9] shadow-md border-b border-[#253933] no-print">
      <div className="max-w-6xl mx-auto h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Shield Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#A8C69F] flex items-center justify-center font-bold text-[#2D453E] shadow-sm shrink-0">
            <span className="text-sm sm:text-base font-extrabold tracking-tight">CK</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#A8C69F] ring-2 ring-[#2D453E] animate-pulse"></span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-semibold tracking-tight uppercase text-[#FDFCF9] leading-none">
                CarbonKavach
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#A8C69F] bg-[#3D5C53] px-2 py-0.5 rounded-full leading-none">
                கார்பன்கவசம்
              </span>
            </div>
            <span className="text-xs text-[#A8C69F]/90 tracking-tight mt-1 font-medium hidden xs:block">
              {getTabSubtitle()}
            </span>
          </div>
        </div>

        {/* Right Actions: Seed Fixture, TN MSME Badge, Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Stage Fixture Button */}
          <button
            onClick={onLoadSeedFixture}
            title="Load Stage Demo Data (786 kWh EB + Petrol)"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isUsingSeedFixture
                ? 'bg-[#A8C69F] text-[#2D453E] shadow-sm hover:brightness-105'
                : 'bg-[#3D5C53] text-[#FDFCF9] hover:bg-[#4A6D63]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2D453E]" />
            <span>{isUsingSeedFixture ? 'Stage Demo Loaded' : 'Demo Fixture'}</span>
          </button>

          {/* TN MSME Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#253933] px-2.5 py-1 rounded-full text-[#A8C69F] text-xs font-semibold border border-[#A8C69F]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8C69F] animate-pulse"></span>
            <span>TN MSME</span>
          </div>

          {/* Language Toggle Button */}
          <button
            aria-label="Language Toggle"
            onClick={onLanguageToggle}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] px-2.5 rounded-lg bg-[#253933] hover:bg-[#3D5C53] text-[#FDFCF9] text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-[#A8C69F]/20 cursor-pointer"
            type="button"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#A8C69F]" />
            <span>{language === 'en' ? 'EN | தமிழ்' : 'தமிழ் | EN'}</span>
          </button>

          {/* User profile avatar */}
          <div
            className="w-9 h-9 rounded-full bg-[#253933] border border-[#A8C69F]/30 flex items-center justify-center text-white"
            title="Sri Velan Weaving Mills (Tiruppur Cluster)"
          >
            <User className="w-4 h-4 text-[#A8C69F]" />
          </div>
        </div>
      </div>
    </header>
  );
};
