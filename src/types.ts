export type BillType = 'electricity' | 'petrol' | 'diesel';

export interface RawBillData {
  id?: string;
  bill_type: BillType;
  units_consumed: number | null;
  unit: 'kWh' | 'litres';
  billing_period_days: number | null;
  cost_rupees: number | null;
  // Optional non-numeric metadata for record keeping (never used for CO2 math)
  consumer_name?: string | null;
  bill_number?: string | null;
  bill_date?: string | null;
  source_notes?: string | null;
}

export interface ExtractedBillPayload {
  bill_type: BillType;
  units_consumed: number | null;
  unit: 'kWh' | 'litres';
  billing_period_days: number | null;
  cost_rupees: number | null;
}

export interface EmissionFootprint {
  electricity_kg: number;
  petrol_kg: number;
  diesel_kg: number;
  total_kg: number;
  total_tonnes: number;
}

export interface Recommendation {
  id: string;
  title: string;
  tamil_title: string;
  estimated_annual_savings_rupees: number;
  estimated_co2_reduction_kg: number;
  reasoning: string;
  tamil_reasoning: string;
  category: 'solar' | 'efficiency' | 'fuel_switch' | 'logistics';
}

export interface BusinessProfile {
  name: string;
  tamil_name: string;
  facility_type: string;
  location: string;
  htsc_no: string;
  gstin: string;
  udyam_no: string;
  audit_date: string;
  certificate_no: string;
}

export type ActiveTab = 'upload' | 'dashboard' | 'simulator' | 'report';
export type Language = 'en' | 'ta';
