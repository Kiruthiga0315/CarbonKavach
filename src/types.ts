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

// TYPE A — "Derived from your data" (must include specific rupee/CO2 numbers traceable to ledger fields)
export interface DerivedRecommendation {
  id: string;
  rule_id: 'fuel_vs_grid' | 'diesel_generator' | 'consumption_trend' | 'peak_offpeak_ht' | 'petrol_vehicle_tagging';
  title: string;
  tamil_title: string;
  estimated_annual_savings_rupees: number;
  estimated_co2_reduction_kg: number;
  reasoning: string;
  tamil_reasoning: string;
  category: 'solar' | 'efficiency' | 'fuel_switch' | 'logistics';
  traceable_field: string;
  computation_trace?: string;
}

// Alias for backward compatibility
export type Recommendation = DerivedRecommendation;

// TYPE B — "General efficiency practices" (no rupee/CO2 figures, generic MSME practices with source citations)
export interface GeneralPractice {
  id: string;
  title: string;
  tamil_title: string;
  description: string;
  tamil_description: string;
  source_citation: string;
  category: 'lighting' | 'motors' | 'thermal_leaks' | 'load_staggering';
}

// Two clearly separated output types — do not merge them into one list
export interface RecommendationOutput {
  derivedRecommendations: DerivedRecommendation[]; // TYPE A
  generalPractices: GeneralPractice[]; // TYPE B
}

export interface BusinessProfile {
  id?: string;
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

/**
 * Machine Inventory entity matching Firestore collection `machines/{machineId}`
 * Feeds the connected-load digital twin model.
 *
 * CRITICAL COMPLIANCE NOTICE:
 * This is explicitly a modeled estimate, not sensor data.
 */
export interface Machine {
  id: string;
  businessId: string;
  name: string;
  rated_power_kw: number; // User-entered from nameplate (> 0)
  quantity: number; // Positive integer (> 0)
  typical_hours_per_day: number; // Typical daily operating hours (> 0 and <= 24)
  typical_days_in_period: number; // Operating days in period (> 0 and <= 365)
  load_factor: number; // Default 0.75 (IEC/electrical engineering standard), user-editable
  notes?: string;
  created_at?: string;
}

export type ActiveTab = 'upload' | 'dashboard' | 'machines' | 'simulator' | 'report' | 'live';
export type Language = 'en' | 'ta';
