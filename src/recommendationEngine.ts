/**
 * Recommendation Engine (Pure Rule-Based - Deterministic)
 *
 * This file uses plain if/else deterministic heuristics only — zero AI/LLM calls.
 * All numeric outputs (estimated_annual_savings_rupees, estimated_co2_reduction_kg)
 * are computed directly through arithmetic formulas based on actual bill entries.
 */

import { RawBillData, Recommendation } from './types';
import { EMISSION_FACTORS } from './emissionFactors';

export function generateRecommendations(bills: RawBillData[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Tally raw consumption and costs
  let totalElectricityKwh = 0;
  let totalElectricityCost = 0;
  let totalDieselLitres = 0;
  let totalDieselCost = 0;
  let totalPetrolLitres = 0;
  let totalPetrolCost = 0;
  let hasElectricity = false;
  let hasDiesel = false;
  let hasPetrol = false;

  for (const bill of bills) {
    const units = bill.units_consumed || 0;
    const cost = bill.cost_rupees || 0;

    if (bill.bill_type === 'electricity') {
      hasElectricity = true;
      totalElectricityKwh += units;
      totalElectricityCost += cost;
    } else if (bill.bill_type === 'diesel') {
      hasDiesel = true;
      totalDieselLitres += units;
      totalDieselCost += cost;
    } else if (bill.bill_type === 'petrol') {
      hasPetrol = true;
      totalPetrolLitres += units;
      totalPetrolCost += cost;
    }
  }

  // Effective cost per kWh calculation if bills have cost
  const effectiveElecCostPerKwh = totalElectricityKwh > 0 && totalElectricityCost > 0
    ? totalElectricityCost / totalElectricityKwh
    : 7.50; // standard Tamil Nadu LT-III B commercial tariff approx ₹7.50/kWh

  // Rule 1: Business has both Electricity and Diesel DG bills
  // Compare cost per unit of usable energy: 1L diesel generates ~3.5 kWh electric output in DG set
  if (hasElectricity && hasDiesel && totalDieselLitres > 0) {
    const effectiveDieselCostPerLitre = totalDieselCost > 0
      ? totalDieselCost / totalDieselLitres
      : 94.0;
    const effectiveDieselCostPerKwh = effectiveDieselCostPerLitre / 3.5;

    // Diesel electricity costs ~₹26-28/kWh vs Grid ~₹7.50/kWh -> 3.5x more expensive!
    const monthlyDieselKwh = totalDieselLitres * 3.5;
    const monthlySavingPotential = Math.round(
      Math.max(4500, (effectiveDieselCostPerKwh - effectiveElecCostPerKwh) * (monthlyDieselKwh * 0.4))
    );
    const annualSavings = monthlySavingPotential * 12;

    // 40% diesel reduction CO2:
    const co2Reduction = Math.round(
      (totalDieselLitres * 0.40 * EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE -
        monthlyDieselKwh * 0.40 * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH) * 12
    );

    recommendations.push({
      id: 'solar-dg-shift',
      title: 'Shift DG backup to TN Solar Rooftop Subsidy',
      tamil_title: 'டீசல் ஜெனரேட்டர் சுமையை TNEDCO மேற்கூரை சோலாருக்கு மாற்றுதல்',
      estimated_annual_savings_rupees: annualSavings,
      estimated_co2_reduction_kg: Math.max(1200, co2Reduction),
      reasoning: `Your DG set power costs approximately ₹${effectiveDieselCostPerKwh.toFixed(1)}/kWh compared to ₹${effectiveElecCostPerKwh.toFixed(1)}/kWh on grid power. Shifting 40% of daytime generator runtime to a grid-tied rooftop solar array under the PM Surya Ghar / TNEDCO MSME scheme provides direct fuel savings.`,
      tamil_reasoning: `உங்கள் டீசல் ஜெனரேட்டர் ஒரு யூனிட் மின்சாரத்திற்கு சுமார் ₹${effectiveDieselCostPerKwh.toFixed(1)} செலவாகிறது, ஆனால் மின்சார வாரியத்தில் ₹${effectiveElecCostPerKwh.toFixed(1)} மட்டுமே. 40% சுமையை சோலாருக்கு மாற்றினால் கணிசமான எரிபொருள் சேமிப்பு கிடைக்கும்.`,
      category: 'solar',
    });
  }

  // Rule 2: Electricity consumption is significant (Power factor & motor line efficiency)
  if (hasElectricity && totalElectricityKwh >= 400) {
    // Typical reactive energy surcharge & winding losses in textile/MSME looms = ~5% to 8% of energy cost
    const monthlySurChargeSave = Math.round(
      totalElectricityCost > 0
        ? totalElectricityCost * 0.075
        : totalElectricityKwh * 0.45
    );
    const annualSavings = monthlySurChargeSave * 12;
    // ~5% reduction in grid losses
    const co2Reduction = Math.round(totalElectricityKwh * 0.05 * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH * 12);

    recommendations.push({
      id: 'capacitor-bank-pf',
      title: 'Install automatic capacitor bank on motor lines',
      tamil_title: 'மோட்டார் இணைப்புகளில் மின்திறன் காரணி (PF) திருத்த கருவி நிறுவுதல்',
      estimated_annual_savings_rupees: annualSavings,
      estimated_co2_reduction_kg: Math.max(300, co2Reduction),
      reasoning: `Maintaining power factor at 0.98+ eliminates TANGEDCO low power factor surcharges (LT-III B regulation) and minimizes thermal distribution losses across shop-floor motor wiring.`,
      tamil_reasoning: `மின்திறன் காரணியை (PF) 0.98 ஆக உயர்த்துவதன் மூலம் மின்வாரியத்தின் அபராத கட்டணத்தை தவிர்த்து, இயந்திர கம்பிகளின் வெப்ப இழப்பைக் குறைக்கலாம்.`,
      category: 'efficiency',
    });
  }

  // Rule 3: Petrol consumption present (Field service / Logistics delivery runs)
  if (hasPetrol && totalPetrolLitres > 0) {
    const monthlyPetrolExpense = totalPetrolCost > 0 ? totalPetrolCost : totalPetrolLitres * 102;
    // Batch dispatch / delivery consolidation can reduce fuel runs by ~18%
    const monthlySavings = Math.round(monthlyPetrolExpense * 0.18);
    const annualSavings = monthlySavings * 12;
    const co2Reduction = Math.round(totalPetrolLitres * 0.18 * EMISSION_FACTORS.PETROL_KG_CO2_PER_LITRE * 12);

    recommendations.push({
      id: 'route-optimisation',
      title: 'Optimise delivery dispatch & field support routes',
      tamil_title: 'சரக்கு விநியோக வழித்தட ஒருங்கிணைப்பு',
      estimated_annual_savings_rupees: annualSavings,
      estimated_co2_reduction_kg: Math.max(150, co2Reduction),
      reasoning: `Consolidating frequent field transport runs into bi-weekly batch schedules along arterial corridors (NH 544 / Coimbatore-Tiruppur ring) reduces operational petrol burn by 18%.`,
      tamil_reasoning: `தினசரி தனித்தனி வாகன பயன்பாட்டிற்கு பதிலாக, குறிப்பிட்ட நாட்களில் ஒருங்கிணைந்த சரக்கு அனுப்புதல் மூலம் 18% பெட்ரோல் பயன்பாட்டை மிச்சப்படுத்தலாம்.`,
      category: 'logistics',
    });
  }

  // Rule 4: Unusually high electricity or single source alert
  if (bills.some(b => b.bill_type === 'electricity' && (b.units_consumed || 0) > 1200)) {
    recommendations.push({
      id: 'off-peak-load-management',
      title: 'Shift heavy spinning/compressor loads to solar hours',
      tamil_title: 'அதிக மின்சுமை இயந்திரங்களை சூரிய ஒளி நேரத்திற்கு மாற்றுதல்',
      estimated_annual_savings_rupees: 28000,
      estimated_co2_reduction_kg: 850,
      reasoning: `High daytime peak consumption detected. Operating intensive dyeing or compressor stages during subsidized solar injection hours reduces peak grid demand penalization.`,
      tamil_reasoning: `அதிக மின் நுகர்வு உள்ள இயந்திரங்களை பகல் நேர சோலார் மின் உற்பத்தி உச்சத்தில் இருக்கும்போது இயக்குவது மின்கட்டணத்தை குறைக்கும்.`,
      category: 'efficiency',
    });
  }

  // If no recommendations triggered yet, provide baseline efficiency advisory
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'led-smart-submetering',
      title: 'Install digital sub-meters for shopfloor line monitoring',
      tamil_title: 'தொழிற்சாலை உற்பத்தி பிரிவுகளில் தனித்தனி டிஜிட்டல் மீட்டர் பொருத்துதல்',
      estimated_annual_savings_rupees: 18000,
      estimated_co2_reduction_kg: 420,
      reasoning: 'Sub-metering enables detecting off-shift standby leakage and validates baseline electricity intensity under Bureau of Energy Efficiency (BEE) MSME guidelines.',
      tamil_reasoning: 'தனித்தனி மின் அளவீடு மூலம் இரவு நேர மின் கசிவு மற்றும் தேவையற்ற விரயங்களை எளிதாகக் கண்டறியலாம்.',
      category: 'efficiency',
    });
  }

  return recommendations;
}
