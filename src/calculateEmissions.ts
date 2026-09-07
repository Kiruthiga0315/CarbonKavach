// This file makes zero calls to any AI model. Every output here is a deterministic function of its input.

import { EMISSION_FACTORS } from './emissionFactors';
import { BillType, EmissionFootprint, RawBillData } from './types';

/**
 * Pure arithmetic function to compute CO2 emissions for a given bill type and consumed units.
 *
 * @param billType - 'electricity' | 'petrol' | 'diesel'
 * @param unitsConsumed - Amount in kWh (for electricity) or Litres (for petrol/diesel)
 * @returns Kilograms of CO2 emitted (arithmetic product of unitsConsumed * statutory emission factor)
 */
export function calculateCO2(
  billType: BillType,
  unitsConsumed: number | null | undefined
): number {
  if (typeof unitsConsumed !== 'number' || isNaN(unitsConsumed) || unitsConsumed <= 0) {
    return 0;
  }

  switch (billType) {
    case 'electricity':
      // unitsConsumed (kWh) * 0.79 kg CO2/kWh
      return unitsConsumed * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH;

    case 'petrol':
      // unitsConsumed (Litres) * 2.31 kg CO2/Litre
      return unitsConsumed * EMISSION_FACTORS.PETROL_KG_CO2_PER_LITRE;

    case 'diesel':
      // unitsConsumed (Litres) * 2.68 kg CO2/Litre
      return unitsConsumed * EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE;

    default:
      return 0;
  }
}

/**
 * Pure aggregation function that sums emissions across an array of bills into category totals.
 *
 * @param bills - Array of raw bill records containing bill_type and units_consumed
 * @returns EmissionFootprint containing electricity_kg, petrol_kg, diesel_kg, total_kg, total_tonnes
 */
export function calculateTotalFootprint(
  bills: Array<Pick<RawBillData, 'bill_type' | 'units_consumed'>>
): EmissionFootprint {
  let electricity_kg = 0;
  let petrol_kg = 0;
  let diesel_kg = 0;

  for (const bill of bills) {
    const co2 = calculateCO2(bill.bill_type, bill.units_consumed);
    if (bill.bill_type === 'electricity') {
      electricity_kg += co2;
    } else if (bill.bill_type === 'petrol') {
      petrol_kg += co2;
    } else if (bill.bill_type === 'diesel') {
      diesel_kg += co2;
    }
  }

  const total_kg = electricity_kg + petrol_kg + diesel_kg;
  const total_tonnes = total_kg / 1000;

  return {
    electricity_kg: Number(electricity_kg.toFixed(2)),
    petrol_kg: Number(petrol_kg.toFixed(2)),
    diesel_kg: Number(diesel_kg.toFixed(2)),
    total_kg: Number(total_kg.toFixed(2)),
    total_tonnes: Number(total_tonnes.toFixed(3)),
  };
}

/**
 * Simulation function: re-calculates total footprint when shifting fuel (diesel/petrol) to grid electricity.
 * Pure arithmetic only. Uses the EXACT same calculateCO2 and calculateTotalFootprint logic.
 *
 * Energy density assumptions (pure constants):
 * - Diesel: ~10.0 kWh thermal energy equivalent per litre (at ~35% generator efficiency => ~3.5 kWh electric output per litre)
 * - Petrol: ~9.0 kWh thermal energy equivalent per litre (at ~30% engine efficiency => ~2.7 kWh electric output per litre)
 */
export function simulateFuelToElectricityShift(
  bills: Array<Pick<RawBillData, 'bill_type' | 'units_consumed'>>,
  shiftPercentage: number // 0 to 100
): {
  baseline: EmissionFootprint;
  simulated: EmissionFootprint;
  co2ReductionKg: number;
  percentageReduction: number;
} {
  const clampedShift = Math.max(0, Math.min(100, shiftPercentage)) / 100;
  const baseline = calculateTotalFootprint(bills);

  // Generate modified bill list with fraction of fuel replaced by grid electricity
  const modifiedBills: Array<Pick<RawBillData, 'bill_type' | 'units_consumed'>> = [];
  let addedElectricityKwh = 0;

  for (const bill of bills) {
    const units = bill.units_consumed || 0;
    if (bill.bill_type === 'diesel') {
      const remainingUnits = units * (1 - clampedShift);
      const shiftedUnits = units * clampedShift;
      // 1 litre diesel generator output replaced by ~3.5 kWh from grid
      addedElectricityKwh += shiftedUnits * 3.5;
      modifiedBills.push({ bill_type: 'diesel', units_consumed: remainingUnits });
    } else if (bill.bill_type === 'petrol') {
      const remainingUnits = units * (1 - clampedShift);
      const shiftedUnits = units * clampedShift;
      // 1 litre petrol replaced by EV / electric small utility ~2.7 kWh
      addedElectricityKwh += shiftedUnits * 2.7;
      modifiedBills.push({ bill_type: 'petrol', units_consumed: remainingUnits });
    } else {
      modifiedBills.push({ bill_type: 'electricity', units_consumed: units });
    }
  }

  // Add the newly required electricity to grid consumption
  if (addedElectricityKwh > 0) {
    const existingElecIdx = modifiedBills.findIndex(b => b.bill_type === 'electricity');
    if (existingElecIdx >= 0) {
      modifiedBills[existingElecIdx].units_consumed =
        (modifiedBills[existingElecIdx].units_consumed || 0) + addedElectricityKwh;
    } else {
      modifiedBills.push({ bill_type: 'electricity', units_consumed: addedElectricityKwh });
    }
  }

  const simulated = calculateTotalFootprint(modifiedBills);
  const co2ReductionKg = Math.max(0, Number((baseline.total_kg - simulated.total_kg).toFixed(2)));
  const percentageReduction = baseline.total_kg > 0
    ? Number(((co2ReductionKg / baseline.total_kg) * 100).toFixed(1))
    : 0;

  return {
    baseline,
    simulated,
    co2ReductionKg,
    percentageReduction,
  };
}
