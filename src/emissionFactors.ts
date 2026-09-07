/**
 * Published Statutory & International Emission Factors
 * Used strictly for deterministic arithmetic calculations.
 */

export const EMISSION_FACTORS = {
  GRID_ELECTRICITY_KG_CO2_PER_KWH: 0.79, // Source: CEA CO2 Baseline Database — confirm latest published edition before presenting publicly
  PETROL_KG_CO2_PER_LITRE: 2.31,         // Source: IPCC/GHG Protocol
  DIESEL_KG_CO2_PER_LITRE: 2.68,         // Source: IPCC/GHG Protocol
} as const;

export const EMISSION_FACTOR_METADATA = {
  GRID_ELECTRICITY: {
    factor: EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH,
    unit: 'kg CO₂e/kWh',
    source: 'Central Electricity Authority (CEA) CO₂ Baseline Database for Indian Power Sector (User Guide v19/v20)',
    scope: 'Scope 2 (Indirect - Purchased Grid Electricity)',
    year: '2023-2024',
  },
  PETROL: {
    factor: EMISSION_FACTORS.PETROL_KG_CO2_PER_LITRE,
    unit: 'kg CO₂e/Litre',
    source: 'IPCC Guidelines for National Greenhouse Gas Inventories / GHG Protocol Mobile Combustion Tool',
    scope: 'Scope 1 (Direct - Mobile Fleet / Field Support)',
    year: '2023',
  },
  DIESEL: {
    factor: EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE,
    unit: 'kg CO₂e/Litre',
    source: 'IPCC Guidelines for National Greenhouse Gas Inventories / GHG Protocol Stationary & Mobile Combustion',
    scope: 'Scope 1 (Direct - Stationary DG Genset & Logistics)',
    year: '2023',
  },
} as const;
