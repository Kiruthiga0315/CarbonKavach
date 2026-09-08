import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { UploadView } from './components/UploadView';
import { DashboardView } from './components/DashboardView';
import { SimulatorView } from './components/SimulatorView';
import { ReportView } from './components/ReportView';
import { ScanningModal } from './components/ScanningModal';
import { MachineInventoryView } from './components/MachineInventoryView';
import { LiveOpsPreview } from './components/LiveOpsPreview';

import { ActiveTab, Language, RawBillData, ExtractedBillPayload, BillType, Machine } from './types';
import { STAGE_DEMO_FIXTURE, DEFAULT_BUSINESS_PROFILE, SAMPLE_BILL_PREVIEWS } from './sampleData';
import { calculateTotalFootprint } from './calculateEmissions';
import { generateRecommendationOutput } from './recommendationEngine';
import { extractBillData } from './extractBillData';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguage] = useState<Language>('en');

  // Active bills in audit ledger: seeded by default with guaranteed stage-ready demo fixture
  const [bills, setBills] = useState<RawBillData[]>(STAGE_DEMO_FIXTURE);
  const [businessProfile] = useState(DEFAULT_BUSINESS_PROFILE);

  // Machine Inventory: feeds the connected-load digital twin model
  // Persisted locally so user inputs survive page reloads
  const [machines, setMachines] = useState<Machine[]>(() => {
    try {
      const saved = localStorage.getItem('carbonkavach_machines');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved machines from localStorage', e);
    }
    return [];
  });

  const handleAddMachine = (newMachine: Machine) => {
    setMachines((prev) => {
      const next = [newMachine, ...prev];
      try {
        localStorage.setItem('carbonkavach_machines', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save machines to localStorage', e);
      }
      return next;
    });
  };

  const handleRemoveMachine = (machineId: string) => {
    setMachines((prev) => {
      const next = prev.filter((m) => m.id !== machineId);
      try {
        localStorage.setItem('carbonkavach_machines', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save machines to localStorage', e);
      }
      return next;
    });
  };

  // Scanning Modal States
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBillPayload | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const [pendingBillMeta, setPendingBillMeta] = useState<Partial<RawBillData>>({});

  // Flag indicating if current state matches the required demo fixture
  const isUsingSeedFixture = useMemo(() => {
    if (bills.length !== STAGE_DEMO_FIXTURE.length) return false;
    return bills[0]?.units_consumed === 786;
  }, [bills]);

  // Pure deterministic emissions calculation: runs on EVERY state change with ZERO AI calls
  const footprint = useMemo(() => {
    return calculateTotalFootprint(bills);
  }, [bills]);

  // Pure deterministic recommendations: plain if/else rules separating Type A and Type B
  const recommendationOutput = useMemo(() => {
    return generateRecommendationOutput(bills);
  }, [bills]);

  // Handler to load the exact requested stage demo fixture
  const handleLoadSeedFixture = () => {
    setBills(STAGE_DEMO_FIXTURE);
    setActiveTab('dashboard');
  };

  // Handler for uploading raw image / file
  const handleUploadFile = async (file: File, categoryHint: BillType) => {
    setIsExtracting(true);
    setScanErrorMessage(null);
    setExtractedData(null);
    setIsScanningModalOpen(true);

    try {
      // Compress image client side before sending to save massive network time
      let finalBase64Data = '';
      
      if (file.type.startsWith('image/')) {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = objectUrl;
        });
        
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1600;
        let { width, height } = image;
        
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, width, height);
          finalBase64Data = canvas.toDataURL('image/jpeg', 0.8);
        } else {
          // Fallback if canvas context fails
          const reader = new FileReader();
          finalBase64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        URL.revokeObjectURL(objectUrl);
      } else {
        // Fallback for PDFs or non-images
        const reader = new FileReader();
        finalBase64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setPendingBillMeta({
        consumer_name: businessProfile.name,
        bill_number: `SCAN-${Date.now().toString().slice(-6)}`,
        bill_date: new Date().toLocaleDateString('en-GB'),
        source_notes: file.name,
      });

      // Call AI Extraction Layer (OCR only - never calculates CO2)
      const data = await extractBillData(finalBase64Data, file.type, categoryHint);
      setExtractedData(data);
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setScanErrorMessage(
        err?.message ||
          'Could not clearly read numbers on the receipt. Please retake the photo with better lighting.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Handler for selecting sample bills from drawer
  const handleSelectSampleBill = (sample: typeof SAMPLE_BILL_PREVIEWS[0]) => {
    setScanErrorMessage(null);
    const mockExtracted: ExtractedBillPayload = {
      bill_type: sample.bill_type,
      units_consumed: sample.units,
      unit: sample.bill_type === 'electricity' ? 'kWh' : 'litres',
      billing_period_days: 30,
      cost_rupees: sample.amount,
    };
    setExtractedData(mockExtracted);
    setPendingBillMeta({
      consumer_name: businessProfile.name,
      bill_number: sample.id.toUpperCase(),
      bill_date: sample.date,
      source_notes: sample.categoryName,
    });
    setIsScanningModalOpen(true);
  };

  // Confirm extracted data from modal and add to bills
  const handleConfirmExtraction = () => {
    if (!extractedData) return;

    const newBill: RawBillData = {
      id: `bill-${Date.now()}`,
      bill_type: extractedData.bill_type,
      units_consumed: extractedData.units_consumed,
      unit: extractedData.unit,
      billing_period_days: extractedData.billing_period_days,
      cost_rupees: extractedData.cost_rupees,
      consumer_name: pendingBillMeta.consumer_name || businessProfile.name,
      bill_number: pendingBillMeta.bill_number || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      bill_date: pendingBillMeta.bill_date || new Date().toLocaleDateString('en-GB'),
      source_notes: pendingBillMeta.source_notes,
    };

    setBills((prev) => [newBill, ...prev]);
    setIsScanningModalOpen(false);
    setExtractedData(null);
    setActiveTab('dashboard');
  };

  const handleRemoveBill = (id: string) => {
    setBills((prev) => prev.filter((b, idx) => b.id !== id && String(idx) !== id));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2D332D] font-sans antialiased flex flex-col justify-between">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        language={language}
        onLanguageToggle={() => setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'))}
        onLoadSeedFixture={handleLoadSeedFixture}
        isUsingSeedFixture={isUsingSeedFixture}
      />

      {/* Main View Area */}
      <main className="pt-16 sm:pt-20 flex-1">
        {activeTab === 'upload' && (
          <UploadView
            bills={bills}
            onUploadFile={handleUploadFile}
            onSelectSampleBill={handleSelectSampleBill}
            onLoadSeedFixture={handleLoadSeedFixture}
            onRemoveBill={handleRemoveBill}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            isExtracting={isExtracting}
            language={language}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            bills={bills}
            footprint={footprint}
            recommendations={recommendationOutput.derivedRecommendations}
            generalPractices={recommendationOutput.generalPractices}
            businessProfile={businessProfile}
            onNavigateToSimulator={() => setActiveTab('simulator')}
            onNavigateToReport={() => setActiveTab('report')}
            language={language}
          />
        )}

        {activeTab === 'machines' && (
          <MachineInventoryView
            machines={machines}
            onAddMachine={handleAddMachine}
            onRemoveMachine={handleRemoveMachine}
            businessProfile={businessProfile}
            language={language}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            bills={bills}
            onApplySimulation={(_simulatedFootprint) => {
              // Simulation applied feedback
            }}
            onNavigateToReport={() => setActiveTab('report')}
            language={language}
          />
        )}

        {activeTab === 'live' && (
          <LiveOpsPreview
            machines={machines}
            language={language}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            bills={bills}
            footprint={footprint}
            recommendations={recommendationOutput.derivedRecommendations}
            generalPractices={recommendationOutput.generalPractices}
            businessProfile={businessProfile}
            language={language}
          />
        )}
      </main>

      {/* Natural Tones Compliance Engine Footer */}
      <footer className="hidden sm:flex h-12 bg-[#F4F1EA] border-t border-[#E6E2D8] px-6 lg:px-8 items-center justify-between text-[11px] text-[#8C8F7A] font-medium no-print mb-16 sm:mb-0">
        <div className="truncate mr-4">Data Sources: CEA CO₂ Baseline (2023) | IPCC Fuel Intensity (2022) | GHG Protocol India</div>
        <div className="uppercase tracking-widest text-[10px] shrink-0">Deterministic Compliance Engine v1.0.4</div>
      </footer>

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
      />

      {/* Scanning / Reading Modal */}
      <ScanningModal
        isOpen={isScanningModalOpen}
        onClose={() => {
          setIsScanningModalOpen(false);
          setExtractedData(null);
          setScanErrorMessage(null);
        }}
        extractedData={extractedData}
        errorMessage={scanErrorMessage}
        onConfirm={handleConfirmExtraction}
        language={language}
      />
    </div>
  );
}

export default App;
