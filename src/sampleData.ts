import { RawBillData, BusinessProfile } from './types';

/**
 * Guaranteed Stage-Ready Real Data Test Fixture
 * Specified directly in requirements:
 * [
 *   { "bill_type": "electricity", "units_consumed": 786, "unit": "kWh", "billing_period_days": null, "cost_rupees": 4638 },
 *   { "bill_type": "petrol", "units_consumed": 18.33, "unit": "litres", "billing_period_days": null, "cost_rupees": 2000 },
 *   { "bill_type": "petrol", "units_consumed": 42.62, "unit": "litres", "billing_period_days": null, "cost_rupees": 4599.98 }
 * ]
 */
export const STAGE_DEMO_FIXTURE: RawBillData[] = [
  {
    id: 'seed-eb-1',
    bill_type: 'electricity',
    units_consumed: 786,
    unit: 'kWh',
    billing_period_days: null,
    cost_rupees: 4638,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'EB-492-019-382',
    bill_date: '15/10/2024',
    source_notes: 'TANGEDCO LT Tariff III-B',
  },
  {
    id: 'seed-fuel-1',
    bill_type: 'petrol',
    units_consumed: 18.33,
    unit: 'litres',
    billing_period_days: null,
    cost_rupees: 2000,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'HPCL-REC-9014',
    bill_date: '08/10/2024',
    source_notes: 'Field Service Run (Tiruppur - Avinashi)',
  },
  {
    id: 'seed-fuel-2',
    bill_type: 'petrol',
    units_consumed: 42.62,
    unit: 'litres',
    billing_period_days: null,
    cost_rupees: 4599.98,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'IOCL-CHALLAN-3382',
    bill_date: '22/10/2024',
    source_notes: 'Logistics Batch Van Run (Tiruppur - Erode)',
  },
];

/**
 * Extended Industrial Cluster Benchmark Profile
 * Matching Stitch Screen references for Sri Velan Weaving Mills
 */
export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  id: 'biz_sri_velan_mills',
  name: 'Sri Velan Weaving Mills',
  tamil_name: 'ஸ்ரீ வேலன் நெசவாலை',
  facility_type: 'Powerloom & Garment Knitting Facility (LT Tariff III-B)',
  location: 'Tiruppur District, Tamil Nadu (PIN: 641 604)',
  htsc_no: 'HTSC No. 438-012 (Tiruppur Circle)',
  gstin: '33AABCS1429B1Z8',
  udyam_no: 'UDYAM-TN-29-0014829',
  audit_date: '28/10/2024',
  certificate_no: 'CK-TN-2024-884192',
};

/**
 * Rich industrial multi-source fixture (including DG set diesel) for demonstrating comprehensive multi-bill audits
 */
export const INDUSTRIAL_CLUSTER_FIXTURE: RawBillData[] = [
  {
    id: 'ind-eb-1',
    bill_type: 'electricity',
    units_consumed: 2420,
    unit: 'kWh',
    billing_period_days: 31,
    cost_rupees: 19360,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'EB-492-019-382',
    bill_date: '24/10/2024',
    source_notes: 'TANGEDCO LT Tariff III-B Main Meter',
  },
  {
    id: 'ind-dg-1',
    bill_type: 'diesel',
    units_consumed: 310,
    unit: 'litres',
    billing_period_days: 31,
    cost_rupees: 29450,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'BPCL-DG-771',
    bill_date: '18/10/2024',
    source_notes: '62.5 kVA Backup Generator Fuel Log',
  },
  {
    id: 'ind-van-1',
    bill_type: 'diesel',
    units_consumed: 154,
    unit: 'litres',
    billing_period_days: 31,
    cost_rupees: 14630,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'IOCL-LOG-441',
    bill_date: '22/10/2024',
    source_notes: 'Yarn Delivery Logistics Van (NH 544)',
  },
  {
    id: 'ind-petrol-1',
    bill_type: 'petrol',
    units_consumed: 90,
    unit: 'litres',
    billing_period_days: 31,
    cost_rupees: 9180,
    consumer_name: 'Sri Velan Weaving Mills',
    bill_number: 'HPCL-FL-902',
    bill_date: '26/10/2024',
    source_notes: 'Field Technician Inspection Runs',
  },
];

/**
 * Sample bill images for quick testing (SVG representations of authentic Indian utility receipts)
 */
export const SAMPLE_BILL_PREVIEWS = [
  {
    id: 'tangedco-sample',
    title: 'TANGEDCO LT Bill #492-019-382',
    subtitle: 'திருப்பூர் - விசைத்தறி பிரிவு மின்ரசீது',
    bill_type: 'electricity' as const,
    units: 786,
    unit_str: '786 kWh',
    amount: 4638,
    categoryName: 'TANGEDCO Electricity',
    date: '15/10/2024',
    tariff: 'LT-III B',
  },
  {
    id: 'hpcl-sample',
    title: 'HPCL Fuel Slip #9014',
    subtitle: 'களப்பணி பெட்ரோல் ரசீது (18.33 L)',
    bill_type: 'petrol' as const,
    units: 18.33,
    unit_str: '18.33 Litres',
    amount: 2000,
    categoryName: 'HPCL Petrol Receipt',
    date: '08/10/2024',
    tariff: 'Retail Fleet',
  },
  {
    id: 'iocl-sample',
    title: 'IOCL Delivery Challan #3382',
    subtitle: 'சரக்கு போக்குவரத்து ரசீது (42.62 L)',
    bill_type: 'petrol' as const,
    units: 42.62,
    unit_str: '42.62 Litres',
    amount: 4599.98,
    categoryName: 'IOCL Commercial Fuel',
    date: '22/10/2024',
    tariff: 'Bulk Logistics',
  },
  {
    id: 'dg-diesel-sample',
    title: 'BPCL DG Set Diesel Slip #771',
    subtitle: 'டீசல் ஜெனரேட்டர் பயன்பாடு (310 L)',
    bill_type: 'diesel' as const,
    units: 310,
    unit_str: '310 Litres',
    amount: 29450,
    categoryName: 'Industrial Diesel DG',
    date: '18/10/2024',
    tariff: 'Stationary Genset',
  },
];
