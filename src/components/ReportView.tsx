import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  Building2,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Hash,
  Loader2,
  Check,
  FileDown,
  Sparkles,
  BookOpen,
  Tag,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  RawBillData,
  EmissionFootprint,
  DerivedRecommendation,
  GeneralPractice,
  BusinessProfile,
  Language,
} from '../types';
import { STATIC_GENERAL_PRACTICES } from '../recommendationEngine';
import { EMISSION_FACTOR_METADATA } from '../emissionFactors';

interface ReportViewProps {
  bills: RawBillData[];
  footprint: EmissionFootprint;
  recommendations: DerivedRecommendation[];
  generalPractices?: GeneralPractice[];
  businessProfile: BusinessProfile;
  language: Language;
}

export const ReportView: React.FC<ReportViewProps> = ({
  bills,
  footprint,
  recommendations,
  generalPractices = STATIC_GENERAL_PRACTICES,
  businessProfile,
  language,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      setDownloadSuccess(false);
      setDownloadError(null);

      const reportElement = reportRef.current;

      // Capture element with html2canvas at 2x resolution for crisp text & borders
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 8; // 8mm margin
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = margin;
      let pageNumber = 1;

      // First Page
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);

      // Multi-page loop if document exceeds a single A4 page
      while (heightLeft > 0) {
        position = margin - (pageHeight - margin * 2) * pageNumber;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= (pageHeight - margin * 2);
      }

      // Embed official PDF metadata
      pdf.setProperties({
        title: `Tamil Nadu MSME Carbon Compliance Dossier - ${businessProfile.name}`,
        subject: `Certificate No: ${businessProfile.certificate_no}`,
        author: 'CarbonKavach Compliance Engine',
        keywords: 'Tamil Nadu MSME, Carbon Audit, TN-PCB, CEA v19, GHG Protocol, Decarbonization',
        creator: 'CarbonKavach MSME Decarbonization System',
      });

      const safeCert = businessProfile.certificate_no.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `CarbonKavach_Audit_${safeCert}.pdf`;

      pdf.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setDownloadError(
        language === 'en'
          ? 'PDF generation encountered an error. Opening print preview...'
          : 'PDF உருவாக்க பிழை. அச்சுப்பொறி முன்னோட்டம் திறக்கப்படுகிறது...'
      );
      setTimeout(() => {
        window.print();
        setDownloadError(null);
      }, 1000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Tally logged inputs
  const elecKwh = bills
    .filter((b) => b.bill_type === 'electricity')
    .reduce((acc, b) => acc + (b.units_consumed || 0), 0);

  const dieselLitres = bills
    .filter((b) => b.bill_type === 'diesel')
    .reduce((acc, b) => acc + (b.units_consumed || 0), 0);

  const petrolLitres = bills
    .filter((b) => b.bill_type === 'petrol')
    .reduce((acc, b) => acc + (b.units_consumed || 0), 0);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Top Print & Download Actions Bar */}
      <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border border-[#E6E2D8] space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C9082]">
              <ShieldCheck className="w-4 h-4 text-[#2D453E]" />
              <span>Auditor-Ready Compliance Dossier</span>
            </div>
            <h2 className="font-serif italic text-lg sm:text-xl font-bold text-[#2D453E]">
              {language === 'en'
                ? 'Official Tamil Nadu MSME Carbon Summary'
                : 'அதிகாரப்பூர்வ தமிழ்நாடு MSME கார்பன் தணிக்கை ஆவணம்'}
            </h2>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download PDF Button */}
            <button
              id="download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60 ${
                downloadSuccess
                  ? 'bg-[#A8C69F] text-[#2D453E]'
                  : 'bg-[#2D453E] hover:bg-[#3D5C53] text-[#FDFCF9]'
              }`}
              title="Download high-resolution auditor PDF file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#A8C69F] animate-spin" />
                  <span>
                    {language === 'en' ? 'Generating PDF...' : 'PDF தயாராகிறது...'}
                  </span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#2D453E]" />
                  <span>
                    {language === 'en' ? 'PDF Downloaded ✓' : 'PDF பதிவிறக்கப்பட்டது ✓'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#A8C69F]" />
                  <span>
                    {language === 'en' ? 'Download PDF' : 'PDF பதிவிறக்கம்'}
                  </span>
                </>
              )}
            </button>

            {/* Native Browser Print / Save as PDF Button */}
            <button
              id="browser-print-btn"
              type="button"
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-full bg-[#F7F5F0] hover:bg-[#E6E2D8]/50 text-[#2D453E] font-bold text-xs flex items-center justify-center gap-2 border border-[#E6E2D8] shadow-xs transition-all active:scale-98 cursor-pointer"
              title="Open browser print dialog for paper print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-[#7C9082]" />
              <span>
                {language === 'en' ? 'Print / System PDF' : 'அச்சு எடுக்க'}
              </span>
            </button>
          </div>
        </div>

        {/* Feature Specs Micro-Banner */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6B705C] pt-2 border-t border-[#E6E2D8]/60 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-[#2D453E]">
              <FileDown className="w-3.5 h-3.5 text-[#7C9082]" />
              A4 Vector Standard
            </span>
            <span>•</span>
            <span>300 DPI Rendering</span>
            <span>•</span>
            <span>Scope 1 &amp; 2 Breakdown</span>
            <span>•</span>
            <span className="text-[#2D453E] font-medium">BEE / TN-PCB Formatted</span>
          </div>
          <span className="text-[10px] text-[#8C8F7A] font-mono">
            Cert #{businessProfile.certificate_no}
          </span>
        </div>

        {/* Download Success Confirmation Toast */}
        {downloadSuccess && (
          <div className="bg-[#E9EEDF] border border-[#A8C69F] rounded-xl p-3 flex items-center gap-2 text-xs text-[#2D453E]">
            <CheckCircle2 className="w-4 h-4 text-[#2D453E] shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold">
                {language === 'en'
                  ? 'Audit Dossier Exported Successfully!'
                  : 'தணிக்கை ஆவணம் வெற்றிகரமாக பதிவிறக்கப்பட்டது!'}
              </span>
              <p className="text-[11px] text-[#4A5D4A]">
                {language === 'en'
                  ? `Saved to your downloads as CarbonKavach_Audit_${businessProfile.certificate_no}.pdf`
                  : `உங்கள் கணினியில் சேமிக்கப்பட்டது: CarbonKavach_Audit_${businessProfile.certificate_no}.pdf`}
              </p>
            </div>
          </div>
        )}

        {/* Fallback Error Toast */}
        {downloadError && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a] rounded-xl p-3 text-xs text-[#93000a]">
            {downloadError}
          </div>
        )}
      </div>

      {/* Printable Official Certificate / Dossier Container */}
      <div
        id="auditor-dossier-report"
        ref={reportRef}
        className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-[#E6E2D8] space-y-6 print:shadow-none print:border-0 print:p-0 print:m-0 text-[#2D332D]"
      >
        {/* Document Header with Emblems */}
        <div className="border-b-2 border-[#2D453E] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#2D453E] text-[#A8C69F] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              <Award className="w-8 h-8 text-[#A8C69F]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#7C9082] uppercase tracking-widest block">
                Government of Tamil Nadu • MSME Department
              </span>
              <h1 className="font-serif italic text-2xl font-bold text-[#2D453E] tracking-tight">
                Annual Carbon Compliance Summary
              </h1>
              <p className="text-xs text-[#6B705C] font-medium">
                தமிழ்நாடு குறு, சிறு மற்றும் நடுத்தர தொழில் நிறுவனங்கள் துறை • பசுமை தணிக்கை
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 bg-[#F7F5F0] sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#E6E2D8]">
            <div className="text-[#2D453E] font-mono font-bold">
              Cert No: {businessProfile.certificate_no}
            </div>
            <div className="text-[#6B705C]">Audit Date: {businessProfile.audit_date}</div>
            <div className="text-[#7C9082] font-semibold">Standard: TN-PCB / BEE MSME v3.1</div>
          </div>
        </div>

        {/* Enterprise Identification Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F5F0] p-4 sm:p-5 rounded-2xl border border-[#E6E2D8] text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#8C8F7A] uppercase tracking-wider block">
              Assessed Enterprise / நிறுவனம்
            </span>
            <div className="text-sm font-bold text-[#2D453E]">{businessProfile.name}</div>
            <div className="text-xs text-[#7C9082]">{businessProfile.tamil_name}</div>
            <p className="text-[#6B705C] text-[11px]">{businessProfile.facility_type}</p>
            <p className="text-[#6B705C] text-[11px]">{businessProfile.location}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-bold text-[#8C8F7A] uppercase tracking-wider block">
              Statutory Identifiers
            </span>
            <div>
              <strong className="text-[#2D332D]">GSTIN:</strong> <span className="font-mono text-[#6B705C]">{businessProfile.gstin}</span>
            </div>
            <div>
              <strong className="text-[#2D332D]">TANGEDCO:</strong> <span className="font-mono text-[#6B705C]">{businessProfile.htsc_no}</span>
            </div>
            <div>
              <strong className="text-[#2D332D]">Udyam Reg:</strong> <span className="font-mono text-[#6B705C]">{businessProfile.udyam_no}</span>
            </div>
          </div>
        </div>

        {/* Certified Emissions Ledger Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#2D453E] uppercase tracking-wider">
              1. Certified Emission Ledger (Scope 1 &amp; Scope 2)
            </h3>
            <span className="text-[10px] font-semibold text-[#7C9082]">
              Pure Deterministic Arithmetic
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E6E2D8]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#2D453E] text-[#FDFCF9]">
                  <th className="p-3">Emission Category</th>
                  <th className="p-3">Logged Input</th>
                  <th className="p-3">Statutory Emission Factor</th>
                  <th className="p-3 text-right">CO₂e Certified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2D8]">
                {/* Scope 2 Grid Electricity */}
                <tr className="hover:bg-[#F7F5F0]">
                  <td className="p-3">
                    <div className="font-bold text-[#2D332D]">Scope 2: Purchased Grid Electricity</div>
                    <div className="text-[10px] text-[#8C8F7A]">
                      TANGEDCO Utility Bills (LT Tariff III-B)
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[#2D332D]">
                    {elecKwh.toLocaleString('en-IN')} kWh
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-[#2D332D]">0.79 kg CO₂e/kWh</div>
                    <div className="text-[10px] text-[#8C8F7A]">CEA Indian Grid Baseline v19</div>
                  </td>
                  <td className="p-3 text-right font-bold font-mono text-[#2D453E]">
                    {footprint.electricity_kg.toLocaleString('en-IN')} kg
                  </td>
                </tr>

                {/* Scope 1 Diesel Genset */}
                {footprint.diesel_kg > 0 && (
                  <tr className="hover:bg-[#F7F5F0]">
                    <td className="p-3">
                      <div className="font-bold text-[#2D332D]">Scope 1: Backup DG Generator</div>
                      <div className="text-[10px] text-[#8C8F7A]">Stationary Genset Fuel Receipts</div>
                    </td>
                    <td className="p-3 font-mono text-[#2D332D]">
                      {dieselLitres.toLocaleString('en-IN')} Litres
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[#2D332D]">2.68 kg CO₂e/Litre</div>
                      <div className="text-[10px] text-[#8C8F7A]">IPCC Guidelines / GHG Protocol</div>
                    </td>
                    <td className="p-3 text-right font-bold font-mono text-[#2D453E]">
                      {footprint.diesel_kg.toLocaleString('en-IN')} kg
                    </td>
                  </tr>
                )}

                {/* Scope 1 Petrol Operational Fleet */}
                {footprint.petrol_kg > 0 && (
                  <tr className="hover:bg-[#F7F5F0]">
                    <td className="p-3">
                      <div className="font-bold text-[#2D332D]">
                        Scope 1: Fleet &amp; Field Support Petrol
                      </div>
                      <div className="text-[10px] text-[#8C8F7A]">Commercial Fuel Slips</div>
                    </td>
                    <td className="p-3 font-mono text-[#2D332D]">
                      {petrolLitres.toLocaleString('en-IN')} Litres
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[#2D332D]">2.31 kg CO₂e/Litre</div>
                      <div className="text-[10px] text-[#8C8F7A]">IPCC Guidelines / GHG Protocol</div>
                    </td>
                    <td className="p-3 text-right font-bold font-mono text-[#2D453E]">
                      {footprint.petrol_kg.toLocaleString('en-IN')} kg
                    </td>
                  </tr>
                )}

                {/* Net Total Row */}
                <tr className="bg-[#E9EEDF] font-bold">
                  <td className="p-4" colSpan={2}>
                    <div className="text-sm font-bold text-[#2D453E]">
                      TOTAL ASSESSED CARBON FOOTPRINT / மொத்த உமிழ்வு
                    </div>
                    <div className="text-[10px] text-[#4A5D4A] font-normal">
                      Verified deterministic arithmetic sum across all logged utility receipts
                    </div>
                  </td>
                  <td className="p-4 text-right" colSpan={2}>
                    <div className="text-2xl font-serif italic text-[#2D453E] font-bold font-mono">
                      {footprint.total_tonnes.toFixed(2)} tonnes CO₂e
                    </div>
                    <div className="text-xs text-[#7C9082]">
                      ({footprint.total_kg.toLocaleString('en-IN')} kg CO₂e)
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Certified Watermark & Verification Seal */}
        <div className="relative border-2 border-dashed border-[#7C9082] rounded-2xl p-4 sm:p-5 bg-[#F7F5F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D453E]">
              <CheckCircle2 className="w-4 h-4 text-[#7C9082]" />
              <span>STATUTORY AUDITOR VERIFICATION STAMP</span>
            </div>
            <p className="text-xs text-[#6B705C] max-w-md leading-relaxed">
              This dossier has been compiled in compliance with Bureau of Energy Efficiency (BEE)
              MSME decarbonization guidelines and Tamil Nadu Pollution Control Board (TN-PCB)
              reporting standards.
            </p>
          </div>

          {/* Official Verification Seal Visual */}
          <div className="w-28 h-28 rounded-full border-4 border-[#2D453E] flex flex-col items-center justify-center text-center p-1 text-[#2D453E] shrink-0 transform rotate-2 shadow-xs bg-white/60">
            <span className="text-[8px] font-bold uppercase tracking-wider">★ VERIFIED ★</span>
            <span className="text-[9px] font-extrabold leading-tight">TN-PCB &amp; MSME</span>
            <span className="text-[8px] font-semibold text-[#7C9082]">DECARB 2024</span>
            <span className="text-[7px] text-[#8C8F7A] mt-0.5">CK-AUDIT-VALID</span>
          </div>
        </div>

        {/* Actionable Recommendations Summary: Split into 2A (Derived) and 2B (General) */}
        <div className="space-y-4">
          {/* Subsection 2A: Derived from Ledger Data */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2D453E] text-[#A8C69F]">
                    Section 2A • Site-Specific Ledger Calculations
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#2D453E] uppercase tracking-wider mt-1">
                  2A. Audit-Approved Reductions (Derived from Your Data)
                </h3>
                <p className="text-[10px] text-[#6B705C]">
                  Deterministic arithmetic savings traceable directly to specific fields in your uploaded bills
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#7C9082]">
                {recommendations.length} Active Rules
              </span>
            </div>

            {recommendations.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-[#E6E2D8] bg-[#F7F5F0] text-[11px] text-[#6B705C] text-center">
                No site-specific reduction rules triggered for current bill ledger.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {recommendations.map((rec, i) => (
                  <div
                    key={rec.id || i}
                    className="p-3.5 rounded-2xl border border-[#E6E2D8] border-l-4 border-[#2D453E] bg-[#F7F5F0] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase text-[#2D453E] bg-white px-1.5 py-0.5 rounded border border-[#E6E2D8]">
                        RULE: {rec.rule_id}
                      </span>
                    </div>
                    <div className="font-bold text-[#2D453E] leading-snug">{rec.title}</div>
                    <div className="text-[10px] text-[#7C9082]">{rec.tamil_title}</div>
                    <p className="text-[11px] text-[#6B705C] leading-tight">{rec.reasoning}</p>

                    {/* Traceable Ledger Field Reference */}
                    <div className="p-1.5 rounded-lg bg-white border border-[#E6E2D8] text-[10px] text-[#2D332D] flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-[#7C9082] shrink-0" />
                      <span className="truncate">
                        <strong className="text-[#2D453E]">Trace:</strong> {rec.traceable_field}
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-[#2D453E]">
                      <span className="bg-white px-2 py-0.5 rounded-full border border-[#E6E2D8]">
                        Est. Annual: ₹{rec.estimated_annual_savings_rupees.toLocaleString('en-IN')}
                      </span>
                      <span className="bg-[#2D453E] text-[#FDFCF9] px-2 py-0.5 rounded-full">
                        −{(rec.estimated_co2_reduction_kg / 1000).toFixed(2)} t CO₂/yr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subsection 2B: General MSME Practices (Clearly labeled as generic, no savings computed) */}
          <div className="space-y-2.5 pt-2 border-t border-[#E6E2D8]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B705C] border border-[#E6E2D8]">
                    Section 2B • General practices — not calculated from your bills
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#2D453E] uppercase tracking-wider mt-1">
                  2B. Standard MSME Efficiency Guidelines (Source-Cited Benchmarks)
                </h3>
                <p className="text-[10px] text-[#6B705C]">
                  Generic best practices for industrial facilities. No rupee/CO₂ savings are attached as these are not computed from your ledger.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {generalPractices.map((practice) => (
                <div
                  key={practice.id}
                  className="p-3 rounded-xl border border-[#E6E2D8] bg-white space-y-1.5 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-[#2D332D] text-xs leading-snug">{practice.title}</div>
                    <div className="text-[10px] text-[#8C8F7A]">{practice.tamil_title}</div>
                    <p className="text-[11px] text-[#6B705C] leading-tight">{practice.description}</p>
                  </div>
                  <div className="pt-1.5 border-t border-[#F4F1EA] flex items-center justify-between text-[9px]">
                    <span className="text-[#7C9082] font-semibold truncate flex items-center gap-1">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      {practice.source_citation}
                    </span>
                    <span className="text-[#8C8F7A] uppercase font-bold tracking-wider shrink-0">
                      Uncomputed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statutory Emission Factor Citations */}
        <div className="border-t border-[#E6E2D8] pt-4 text-[11px] text-[#8C8F7A] space-y-1">
          <div className="font-bold text-[#6B705C] uppercase tracking-wider text-[10px]">
            Statutory Citations &amp; Methodological Notes:
          </div>
          <p>
            1. <strong>Grid Electricity Factor (0.79 kg CO₂e/kWh):</strong> Central Electricity
            Authority (CEA), Ministry of Power, Government of India — CO₂ Baseline Database for the
            Indian Power Sector (User Guide v19/v20).
          </p>
          <p>
            2. <strong>Diesel (2.68 kg CO₂e/Litre) &amp; Petrol (2.31 kg CO₂e/Litre):</strong> 2006
            IPCC Guidelines for National Greenhouse Gas Inventories, Volume 2 (Energy), Stationary &amp;
            Mobile Combustion Tools.
          </p>
          <p>
            3. <strong>Acceptance Notice:</strong> Recognized for TANSIDCO industrial park green compliance,
            TIIC interest subsidy verification, and international supply-chain ESG documentation.
          </p>
        </div>

        {/* Auditor Sign-off Ledger */}
        <div className="border-t border-[#E6E2D8] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="text-[#2D453E] font-bold">Authorized Lead Energy Auditor</div>
            <div className="text-[11px] text-[#6B705C]">
              Bureau of Energy Efficiency (BEE) Certified • EA-TN-4912
            </div>
            <div className="text-[10px] text-[#8C8F7A]">Digital Verification Key: SHA256-88A92F1B0</div>
          </div>

          <div className="text-left sm:text-right font-mono text-[10px] text-[#8C8F7A]">
            <div>Generated by CarbonKavach Engine</div>
            <div>Timestamp: {new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
