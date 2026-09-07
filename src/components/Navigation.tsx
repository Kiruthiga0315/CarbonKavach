import React from 'react';
import { UploadCloud, LayoutDashboard, Cpu, SlidersHorizontal, FileCheck } from 'lucide-react';
import { ActiveTab, Language } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: Language;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  language,
}) => {
  const navItems: { id: ActiveTab; labelEn: string; labelTa: string; icon: React.ReactNode }[] = [
    {
      id: 'upload',
      labelEn: 'Upload',
      labelTa: 'பதிவேற்றம்',
      icon: <UploadCloud className="w-5 h-5" />,
    },
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelTa: 'கட்டுப்பாடு',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'machines',
      labelEn: 'Machines',
      labelTa: 'இயந்திரங்கள்',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      id: 'simulator',
      labelEn: 'Simulator',
      labelTa: 'கணக்கீடு',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
    {
      id: 'report',
      labelEn: 'Report',
      labelTa: 'அறிக்கை',
      icon: <FileCheck className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#F7F5F0]/95 backdrop-blur-md border-t border-[#E6E2D8] shadow-[0_-2px_12px_rgba(45,69,62,0.06)] no-print">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 sm:w-20 min-h-[44px] transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#2D453E] font-bold'
                  : 'text-[#6B705C] hover:text-[#2D453E]'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-7 sm:w-8 h-1 bg-[#2D453E] rounded-full" />
              )}
              <div
                className={`mt-1 p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110 text-[#2D453E]' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium truncate max-w-full">
                {language === 'en' ? item.labelEn : item.labelTa}
              </span>
              <span className="text-[8px] sm:text-[9px] leading-none text-[#8C8F7A] truncate max-w-full">
                {language === 'en' ? item.labelTa : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
