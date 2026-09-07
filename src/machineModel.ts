import { Machine } from './types';

/**
 * Standard IEC Electrical Engineering Citation for Industrial Motor Utilization
 */
export const DEFAULT_LOAD_FACTOR = 0.75;

export const LOAD_FACTOR_CITATION =
  'Default 0.75 — typical utilization factor for industrial motors (IEC/electrical engineering convention); edit if you know your actual value.';

export const LOAD_FACTOR_CITATION_TAMIL =
  'இயல்புநிலை 0.75 — தொழில்துறை மோட்டார்களுக்கான பொதுவான பயன்பாட்டுக் காரணி (IEC/மின் பொறியியல் மரபு); உங்களிடம் உண்மையான மதிப்பு இருந்தால் மாற்றவும்.';

export const MODELED_ESTIMATE_DISCLAIMER =
  'This is explicitly a modeled estimate, not sensor data.';

export const MODELED_ESTIMATE_DISCLAIMER_TAMIL =
  'இது வெளிப்படையாக ஒரு மாதிரி மதிப்பீடு, சென்சார் தரவு அல்ல.';

export interface MachineFormData {
  name: string;
  rated_power_kw: string; // Form inputs are strings until parsed & validated
  quantity: string;
  typical_hours_per_day: string;
  typical_days_in_period: string;
  load_factor: string;
  notes: string;
}

export interface ValidationErrors {
  name?: string;
  rated_power_kw?: string;
  quantity?: string;
  typical_hours_per_day?: string;
  typical_days_in_period?: string;
  load_factor?: string;
}

/**
 * Validates machine input fields strictly according to specifications:
 * - rated_power_kw and quantity must be positive numbers (> 0)
 * - rejects silently-defaulted zero/blank entries with explicit error messages
 */
export function validateMachineFormData(data: MachineFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // 1. Machine name validation
  if (!data.name || !data.name.trim()) {
    errors.name = 'Machine name or identifier from the nameplate is required (cannot be blank).';
  }

  // 2. Rated power (kW) validation - must be positive number (> 0), never zero or blank
  if (!data.rated_power_kw || data.rated_power_kw.trim() === '') {
    errors.rated_power_kw =
      'Rated power is required from equipment nameplate. Blank entries cannot be treated as zero.';
  } else {
    const power = Number(data.rated_power_kw);
    if (isNaN(power) || power <= 0) {
      errors.rated_power_kw =
        'Rated power (kW) must be a positive number greater than 0 (e.g. 7.5 kW). Zero or negative values are invalid.';
    }
  }

  // 3. Quantity validation - must be positive integer (> 0), never zero or blank
  if (!data.quantity || data.quantity.trim() === '') {
    errors.quantity =
      'Quantity of machines is required. Blank entries cannot be treated as zero.';
  } else {
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      errors.quantity =
        'Quantity must be a positive whole number of at least 1 unit (cannot be 0 or decimal).';
    }
  }

  // 4. Typical hours per day validation
  if (!data.typical_hours_per_day || data.typical_hours_per_day.trim() === '') {
    errors.typical_hours_per_day =
      'Typical operating hours per day is required. Blank entries cannot be treated as zero.';
  } else {
    const hours = Number(data.typical_hours_per_day);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      errors.typical_hours_per_day =
        'Operating hours must be between 0.1 and 24.0 hours per day.';
    }
  }

  // 5. Typical days in period validation (e.g., 26 or 30 days)
  if (!data.typical_days_in_period || data.typical_days_in_period.trim() === '') {
    errors.typical_days_in_period =
      'Typical operating days in billing period is required. Blank entries cannot be treated as zero.';
  } else {
    const days = Number(data.typical_days_in_period);
    if (isNaN(days) || days <= 0 || days > 365) {
      errors.typical_days_in_period =
        'Operating days must be a positive number (typically 20–31 days for monthly billing).';
    }
  }

  // 6. Load factor validation (default 0.75, user-editable)
  if (!data.load_factor || data.load_factor.trim() === '') {
    errors.load_factor =
      'Load factor is required. Restore the IEC default (0.75) or enter an operating factor between 0.10 and 1.20.';
  } else {
    const factor = Number(data.load_factor);
    if (isNaN(factor) || factor <= 0 || factor > 1.5) {
      errors.load_factor =
        'Load factor must be a positive number between 0.10 and 1.20 (standard IEC motor default is 0.75).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Pure deterministic calculation of individual machine modeled consumption.
 * Modeled kWh = Rated Power (kW) × Quantity × Typical Hours/Day × Typical Days × Load Factor
 * NOTE: This is explicitly a modeled estimate, not sensor data.
 */
export function calculateMachineModeledKwh(machine: {
  rated_power_kw: number;
  quantity: number;
  typical_hours_per_day: number;
  typical_days_in_period: number;
  load_factor: number;
}): number {
  const result =
    machine.rated_power_kw *
    machine.quantity *
    machine.typical_hours_per_day *
    machine.typical_days_in_period *
    machine.load_factor;
  return Math.round(result * 100) / 100;
}

/**
 * Running total of modeled kWh across all entered machines in inventory.
 * NOTE: This is explicitly a modeled estimate, not sensor data.
 */
export function calculateTotalModeledKwh(machines: Machine[]): number {
  const total = machines.reduce((acc, m) => acc + calculateMachineModeledKwh(m), 0);
  return Math.round(total * 100) / 100;
}

/**
 * Total connected nameplate load in kW.
 */
export function calculateTotalConnectedLoadKw(machines: Machine[]): number {
  const total = machines.reduce((acc, m) => acc + m.rated_power_kw * m.quantity, 0);
  return Math.round(total * 100) / 100;
}
