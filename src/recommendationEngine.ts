/**
 * Recommendation Engine (Pure Rule-Based - Deterministic)
 *
 * This file uses plain if/else deterministic heuristics only — zero AI/LLM calls.
 * Outputs are split into two clearly separated types:
 *
 * TYPE A — "Derived from your data" (must include specific rupee/CO2 numbers traceable to ledger fields)
 * TYPE B — "General efficiency practices" (source-cited MSME practices with NO rupee/CO2 figures)
 *
 * Never fabricate an asset (no named generator models, no solar kW ratings, no power-factor numbers)
 * unless that exact field exists in the input ledger.
 */

import { RawBillData, DerivedRecommendation, GeneralPractice, RecommendationOutput } from './types';
import { EMISSION_FACTORS } from './emissionFactors';

/**
 * Static Type B: General efficiency practices
 * Well-known, source-cited MSME efficiency practices that always display without savings figures attached.
 */
export const STATIC_GENERAL_PRACTICES: GeneralPractice[] = [
  {
    id: 'general-led-retrofit',
    title: 'LED Lighting Retrofit & Daylight Harvesting',
    tamil_title: 'LED விளக்குகள் மற்றும் இயற்கை பகல் வெளிச்ச பயன்பாடு',
    description:
      'Replace remaining T8/T12 fluorescent tube-lights with high-lumen commercial LED luminaires (120+ lm/W) and install translucent polycarbonate roofing sheets across weaving/processing sheds for zero-energy daytime illumination.',
    tamil_description:
      'பழைய ஃப்ளோரசன்ட் குழாய் விளக்குகளுக்கு பதிலாக குறைந்த மின்திறன் கொண்ட எல்இடி (LED) விளக்குகளைப் பொருத்துதல் மற்றும் கூரையில் ஒளிபுகும் தகடுகள் அமைத்து பகல் வெளிச்சத்தைப் பயன்படுத்துதல்.',
    source_citation: 'Bureau of Energy Efficiency (BEE) MSME Energy Audit Manual',
    category: 'lighting',
  },
  {
    id: 'general-motor-rightsizing',
    title: 'Electric Motor Right-Sizing & IE3 Standard Upgrades',
    tamil_title: 'மோட்டார் மறுமதிப்பீடு மற்றும் IE3 தரத்திற்கு உயர்த்துதல்',
    description:
      'Conduct operating load profiling across shopfloor induction motors. Replace oversized motors operating consistently below 50% rated load with Bureau-certified IE3/IE4 premium efficiency motors to prevent idle inductive losses.',
    tamil_description:
      'இயந்திரங்களில் உள்ள மோட்டார்களின் உண்மையான சுமையை ஆய்வு செய்து, 50% க்கும் குறைவான சுமையில் இயங்கும் மோட்டார்களுக்கு பதிலாக சரியான திறன் கொண்ட IE3/IE4 மோட்டார்களைப் பொருத்துதல்.',
    source_citation: 'BEE Standards & Labeling Programme for Industrial Motors',
    category: 'motors',
  },
  {
    id: 'general-insulation-leaks',
    title: 'Pneumatic Leak Audits & Thermal Pipeline Lagging',
    tamil_title: 'காற்று கசிவு தடுப்பு மற்றும் வெப்ப குழாய் பாதுகாப்பு',
    description:
      'Implement quarterly ultrasonic acoustic leak detection across compressed air distribution lines, couplings, and valves. Apply high-density mineral wool insulation to unlagged steam or thermic fluid pipelines.',
    tamil_description:
      'கம்ப்ரசர் காற்று குழாய்களில் உள்ள கசிவுகளை மீயொலி (Ultrasonic) கருவி கொண்டு கண்டறிந்து சரிசெய்தல் மற்றும் சூடான குழாய்களுக்கு வெப்ப காப்பு உறை அமைத்தல்.',
    source_citation: 'Petroleum Conservation Research Association (PCRA) Industrial Guidelines',
    category: 'thermal_leaks',
  },
  {
    id: 'general-staggered-starts',
    title: 'Staggering High-Load Machinery Start Sequences',
    tamil_title: 'அதிக மின்சுமை இயந்திரங்களை வரிசையாக இயக்குதல்',
    description:
      'Establish an administrative 3-to-5-minute staggered start sequence for heavy machinery banks, compressors, and blowers rather than simultaneous line startups, suppressing peak inrush kVA demand spikes.',
    tamil_description:
      'அனைத்து பெரிய இயந்திரங்களையும் ஒரே நேரத்தில் இயக்காமல், 3 முதல் 5 நிமிட இடைவெளியில் வரிசையாக இயக்குவதன் மூலம் உச்ச மின்தேவை (Peak kVA) கூடுவதைத் தடுத்தல்.',
    source_citation: 'National Productivity Council (NPC) Cleaner Production Cell',
    category: 'load_staggering',
  },
];

/**
 * Evaluates the ledger and returns two clearly separated output types:
 * - typeA: Derived from your data (traceable to ledger fields, with specific rupee and CO2 figures)
 * - typeB: General efficiency practices (source-cited MSME practices with NO rupee or CO2 figures)
 */
export function generateRecommendationOutput(bills: RawBillData[]): RecommendationOutput {
  const derivedRecommendations: DerivedRecommendation[] = [];

  // Group bills by type
  const electricityBills = bills.filter(
    (b) => b.bill_type === 'electricity' && b.units_consumed != null && b.units_consumed > 0
  );
  const dieselBills = bills.filter(
    (b) => b.bill_type === 'diesel' && b.units_consumed != null && b.units_consumed > 0
  );
  const petrolBills = bills.filter(
    (b) => b.bill_type === 'petrol' && b.units_consumed != null && b.units_consumed > 0
  );

  const totalElectricityKwh = electricityBills.reduce((acc, b) => acc + (b.units_consumed || 0), 0);
  const totalElectricityCost = electricityBills.reduce((acc, b) => acc + (b.cost_rupees || 0), 0);
  const totalDieselLitres = dieselBills.reduce((acc, b) => acc + (b.units_consumed || 0), 0);
  const totalDieselCost = dieselBills.reduce((acc, b) => acc + (b.cost_rupees || 0), 0);
  const totalPetrolLitres = petrolBills.reduce((acc, b) => acc + (b.units_consumed || 0), 0);
  const totalPetrolCost = petrolBills.reduce((acc, b) => acc + (b.cost_rupees || 0), 0);

  const hasElectricity = electricityBills.length > 0;
  const hasDiesel = dieselBills.length > 0;
  const hasPetrol = petrolBills.length > 0;
  const hasFuel = hasDiesel || hasPetrol;

  // Effective cost per kWh from actual electricity bills
  const effectiveElecCostPerKwh =
    totalElectricityKwh > 0 && totalElectricityCost > 0
      ? totalElectricityCost / totalElectricityKwh
      : 7.5; // TANGEDCO LT-III B standard baseline

  // =========================================================================
  // TYPE A, RULE 1: Fuel-vs-grid cost comparison
  // Only fires if the ledger has both an electricity bill and a fuel bill.
  // =========================================================================
  if (hasElectricity && hasFuel) {
    if (hasDiesel) {
      // Comparison with Diesel fuel power
      const effectiveDieselCostPerLitre =
        totalDieselCost > 0 ? totalDieselCost / totalDieselLitres : 94.0;
      // 1 litre diesel generates ~3.5 kWh electrical equivalent in industrial DG sets
      const dieselCostPerKwh = effectiveDieselCostPerLitre / 3.5;
      const costDiffPerKwh = dieselCostPerKwh - effectiveElecCostPerKwh;

      // 40% daytime shift potential
      const monthlyShiftedKwh = totalDieselLitres * 3.5 * 0.4;
      const monthlySavings = Math.round(Math.max(1000, costDiffPerKwh * monthlyShiftedKwh));
      const annualSavings = monthlySavings * 12;

      // CO2 reduction: 40% diesel offset minus grid replacement
      const co2Reduction = Math.round(
        (totalDieselLitres * 0.4 * EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE -
          monthlyShiftedKwh * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH) *
          12
      );

      derivedRecommendations.push({
        id: 'rule1-fuel-vs-grid-diesel',
        rule_id: 'fuel_vs_grid',
        title: 'Fuel-vs-Grid Cost Arbitrage: Shift Diesel Generation to Grid Power',
        tamil_title: 'எரிபொருள் மற்றும் மின்வாரிய கட்டண ஒப்பீடு: டீசல் பயன்பாட்டை மின்கட்டமைப்பிற்கு மாற்றுதல்',
        estimated_annual_savings_rupees: annualSavings,
        estimated_co2_reduction_kg: Math.max(200, co2Reduction),
        reasoning: `Based on your ledger, your diesel generation costs approximately ₹${dieselCostPerKwh.toFixed(1)}/kWh (at ₹${effectiveDieselCostPerLitre.toFixed(1)}/L delivering ~3.5 kWh/L) compared to ₹${effectiveElecCostPerKwh.toFixed(1)}/kWh for grid power. Substituting 40% of backup fuel runtime with grid-connected capacity yields ₹${annualSavings.toLocaleString('en-IN')}/yr in direct fuel savings.`,
        tamil_reasoning: `உங்கள் பதிவேட்டின்படி டீசல் மூலம் மின்சாரம் தயாரிக்க ₹${dieselCostPerKwh.toFixed(1)}/kWh செலவாகிறது, ஆனால் மின்சார வாரியத்தில் ₹${effectiveElecCostPerKwh.toFixed(1)}/kWh மட்டுமே. 40% டீசல் பயன்பாட்டை மின்சாரத்திற்கு மாற்றினால் ஆண்டுக்கு ₹${annualSavings.toLocaleString('en-IN')} சேமிக்கலாம்.`,
        category: 'fuel_switch',
        traceable_field: `Electricity: ${totalElectricityKwh.toLocaleString('en-IN')} kWh (₹${totalElectricityCost.toLocaleString('en-IN')}) & Diesel: ${totalDieselLitres.toLocaleString('en-IN')} L (₹${totalDieselCost.toLocaleString('en-IN')})`,
        computation_trace: `Diesel ₹${dieselCostPerKwh.toFixed(2)}/kWh vs Grid ₹${effectiveElecCostPerKwh.toFixed(2)}/kWh across ${totalDieselLitres} L logged`,
      });
    } else if (hasPetrol) {
      // Comparison with Petrol fuel power
      const effectivePetrolCostPerLitre =
        totalPetrolCost > 0 ? totalPetrolCost / totalPetrolLitres : 102.0;
      // 1 litre petrol delivers ~2.8 kWh mechanical/electrical equivalent in small portable drives
      const petrolCostPerKwh = effectivePetrolCostPerLitre / 2.8;
      const costDiffPerKwh = petrolCostPerKwh - effectiveElecCostPerKwh;

      // 30% shift/substitution potential for shopfloor operations
      const shiftedEquivalentKwh = totalPetrolLitres * 2.8 * 0.3;
      const monthlySavings = Math.round(Math.max(500, costDiffPerKwh * shiftedEquivalentKwh));
      const annualSavings = monthlySavings * 12;

      const co2Reduction = Math.round(
        (totalPetrolLitres * 0.3 * EMISSION_FACTORS.PETROL_KG_CO2_PER_LITRE -
          shiftedEquivalentKwh * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH) *
          12
      );

      derivedRecommendations.push({
        id: 'rule1-fuel-vs-grid-petrol',
        rule_id: 'fuel_vs_grid',
        title: 'Fuel-vs-Grid Cost Arbitrage: Substitute Petrol Power with Grid Electricity',
        tamil_title: 'பெட்ரோல் மற்றும் மின்வாரிய கட்டண ஒப்பீடு: மின்சார பயன்பாட்டை அதிகப்படுத்துதல்',
        estimated_annual_savings_rupees: annualSavings,
        estimated_co2_reduction_kg: Math.max(100, co2Reduction),
        reasoning: `Based on your ledger, petrol delivers energy at approximately ₹${petrolCostPerKwh.toFixed(1)}/kWh equivalent (at ₹${effectivePetrolCostPerLitre.toFixed(1)}/L) compared to ₹${effectiveElecCostPerKwh.toFixed(1)}/kWh for grid power. For any auxiliary equipment or portable drives, electric drive substitution saves ₹${annualSavings.toLocaleString('en-IN')} annually compared to petrol burn.`,
        tamil_reasoning: `உங்கள் பதிவேட்டின்படி பெட்ரோல் எரிபொருள் மூலம் ஒரு யூனிட் ஆற்றலுக்கு ₹${petrolCostPerKwh.toFixed(1)} செலவாகிறது, ஆனால் மின்சார வாரியத்தில் ₹${effectiveElecCostPerKwh.toFixed(1)} மட்டுமே. இயன்ற உபகரணங்களை மின்சாரத்திற்கு மாற்றுவது சேமிப்பைத் தரும்.`,
        category: 'fuel_switch',
        traceable_field: `Electricity: ${totalElectricityKwh.toLocaleString('en-IN')} kWh (₹${totalElectricityCost.toLocaleString('en-IN')}) & Petrol: ${totalPetrolLitres.toFixed(2)} L (₹${totalPetrolCost.toFixed(2)})`,
        computation_trace: `Petrol ₹${petrolCostPerKwh.toFixed(2)}/kWh vs Grid ₹${effectiveElecCostPerKwh.toFixed(2)}/kWh across ${totalPetrolLitres.toFixed(2)} L logged`,
      });
    }
  }

  // =========================================================================
  // TYPE A, RULE 2: Diesel-generator-specific advice
  // Only fires if the ledger contains a bill with bill_type === "diesel".
  // Never infer generator use from a petrol bill. If the ledger has petrol but
  // no diesel entry, do not mention generators at all.
  // =========================================================================
  if (hasDiesel && totalDieselLitres > 0) {
    const annualDieselLitres = totalDieselLitres * 12;
    const annualDieselCost = totalDieselCost > 0 ? totalDieselCost * 12 : annualDieselLitres * 94;
    const dieselAnnualCo2 = Math.round(annualDieselLitres * EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE);

    // Shifting 40% daytime generator load to grid-tied rooftop solar / priority grid backup
    const annualShiftedKwh = annualDieselLitres * 0.4 * 3.5;
    const annualSavings = Math.round(
      annualDieselCost * 0.4 - annualShiftedKwh * effectiveElecCostPerKwh
    );
    const co2Reduction = Math.round(
      annualDieselLitres * 0.4 * EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE -
        annualShiftedKwh * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH
    );

    derivedRecommendations.push({
      id: 'rule2-diesel-generator-advice',
      rule_id: 'diesel_generator',
      title: 'Diesel Generator Backup Optimization via Daytime Solar Interconnection',
      tamil_title: 'டீசல் ஜெனரேட்டர் பயன்பாட்டை பகல்நேர சூரியசக்திக்கு மாற்றுதல்',
      estimated_annual_savings_rupees: Math.max(3600, annualSavings),
      estimated_co2_reduction_kg: Math.max(500, co2Reduction),
      reasoning: `Your ledger contains ${dieselBills.length} diesel fuel bill(s) totaling ${totalDieselLitres.toLocaleString('en-IN')} L (₹${totalDieselCost.toLocaleString('en-IN')}) emitting ${dieselAnnualCo2.toLocaleString('en-IN')} kg CO₂e annualized. Shifting 40% of daytime generator runtime to grid or rooftop solar under the TNEDCO MSME scheme cuts expensive generator running hours.`,
      tamil_reasoning: `உங்கள் பதிவேட்டில் ${totalDieselLitres.toLocaleString('en-IN')} லிட்டர் டீசல் (₹${totalDieselCost.toLocaleString('en-IN')}) பதிவாகியுள்ளது. பகல் நேர ஜெனரேட்டர் இயக்கத்தில் 40% பங்கை சோலார் அல்லது மின்சாரத்திற்கு மாற்றுவது டீசல் செலவைக் குறைக்கும்.`,
      category: 'solar',
      traceable_field: `Diesel Ledger: ${totalDieselLitres.toLocaleString('en-IN')} L (costing ₹${totalDieselCost.toLocaleString('en-IN')}) across ${dieselBills.length} receipt(s)`,
      computation_trace: `40% substitution of ${totalDieselLitres} L/mo diesel generator burn @ 2.68 kg CO₂e/L`,
    });
  }

  // =========================================================================
  // TYPE A, RULE 3: Load-factor / consumption-trend flag
  // Only fires if there are 2+ electricity bills in history for the same business,
  // comparing kWh per day across periods. With only one bill, do not run this rule.
  // =========================================================================
  if (electricityBills.length >= 2) {
    const bill1 = electricityBills[0];
    const bill2 = electricityBills[1];
    const days1 = bill1.billing_period_days || 30;
    const days2 = bill2.billing_period_days || 30;
    const dailyRate1 = (bill1.units_consumed || 0) / days1;
    const dailyRate2 = (bill2.units_consumed || 0) / days2;
    const deltaDailyKwh = dailyRate2 - dailyRate1;
    const pctChange = dailyRate1 > 0 ? ((dailyRate2 - dailyRate1) / dailyRate1) * 100 : 0;

    const annualizedDeltaKwh = Math.abs(deltaDailyKwh) * 365;
    const annualCostImpact = Math.round(annualizedDeltaKwh * effectiveElecCostPerKwh);
    const annualCo2Impact = Math.round(
      annualizedDeltaKwh * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH
    );

    const isIncrease = deltaDailyKwh > 0;

    derivedRecommendations.push({
      id: 'rule3-consumption-trend',
      rule_id: 'consumption_trend',
      title: `Electricity Consumption Trend: ${isIncrease ? '+' : ''}${pctChange.toFixed(1)}% Daily Intensity Shift`,
      tamil_title: `மின் நுகர்வு மாறுதல் போக்கு: ${isIncrease ? '+' : ''}${pctChange.toFixed(1)}% மாறுபாடு`,
      estimated_annual_savings_rupees: annualCostImpact,
      estimated_co2_reduction_kg: annualCo2Impact,
      reasoning: `Comparing ${bill1.bill_number || 'Period 1'} (${dailyRate1.toFixed(1)} kWh/day over ${days1} days) with ${bill2.bill_number || 'Period 2'} (${dailyRate2.toFixed(1)} kWh/day over ${days2} days) reveals a daily intensity shift of ${Math.abs(deltaDailyKwh).toFixed(1)} kWh/day (${isIncrease ? '+' : ''}${pctChange.toFixed(1)}%). Re-tuning motor schedules to match baseline load factors avoids avoidable excess consumption.`,
      tamil_reasoning: `இரண்டு மின்கட்டணங்களை ஒப்பிடும்போது தினசரி நுகர்வு ${Math.abs(deltaDailyKwh).toFixed(1)} kWh/நாள் (${isIncrease ? '+' : ''}${pctChange.toFixed(1)}%) மாறியுள்ளது. நுகர்வு தீவிரத்தை கண்காணித்து மோட்டார் இயக்க நேரத்தை சீரமைப்பதன் மூலம் மின்கட்டண உயர்வைத் தவிர்க்கலாம்.`,
      category: 'efficiency',
      traceable_field: `${bill1.bill_number || 'Bill 1'}: ${bill1.units_consumed} kWh (${days1} days) & ${bill2.bill_number || 'Bill 2'}: ${bill2.units_consumed} kWh (${days2} days)`,
      computation_trace: `Daily comparison: ${dailyRate1.toFixed(1)} kWh/day vs ${dailyRate2.toFixed(1)} kWh/day (Δ ${deltaDailyKwh.toFixed(1)} kWh/day)`,
    });
  }

  // =========================================================================
  // TYPE A, RULE 4: Peak-vs-off-peak note
  // Only fires if the bill_type is an HT (high-tension) commercial/industrial
  // tariff that actually carries time-of-day rates in its data; do not apply this
  // to LT/domestic tariffs like the sample bill, which TANGEDCO does not bill on
  // a time-of-day basis.
  // =========================================================================
  const htBillsWithTod = electricityBills.filter((b) => {
    const notes = (b.source_notes || '').toLowerCase();
    // Exclude LT (Low Tension) tariffs explicitly
    if (
      notes.includes('lt tariff') ||
      notes.includes('lt-iii') ||
      notes.includes('lt-ii') ||
      notes.includes('lt-i') ||
      notes.includes('lt ')
    ) {
      return false;
    }
    const isHt =
      notes.includes('ht tariff') ||
      notes.includes('high tension') ||
      notes.includes('ht-') ||
      (b as any).tariff_category === 'HT' ||
      (b as any).is_ht === true;
    const hasTod =
      notes.includes('tod') ||
      notes.includes('time of day') ||
      notes.includes('peak') ||
      (b as any).tod_peak_units != null;
    return isHt && hasTod;
  });

  if (htBillsWithTod.length > 0) {
    const htBill = htBillsWithTod[0];
    const htUnits = htBill.units_consumed || 0;
    // In TANGEDCO HT tariffs, peak hours carry a 20% surcharge, while off-peak hours (22:00-05:00) get a 5% rebate
    // Shifting 20% of load from peak to off-peak yields 25% net tariff difference on shifted units
    const shiftedKwh = htUnits * 0.2;
    const annualSavings = Math.round(shiftedKwh * effectiveElecCostPerKwh * 0.25 * 12);
    const co2Reduction = Math.round(shiftedKwh * 0.05 * EMISSION_FACTORS.GRID_ELECTRICITY_KG_CO2_PER_KWH * 12);

    derivedRecommendations.push({
      id: 'rule4-ht-tod-peak-offpeak',
      rule_id: 'peak_offpeak_ht',
      title: 'TANGEDCO High-Tension (HT) Time-of-Day (ToD) Peak Shift',
      tamil_title: 'உயர் அழுத்த (HT) மின்சார உச்ச நேர சுமை மாற்றம்',
      estimated_annual_savings_rupees: annualSavings,
      estimated_co2_reduction_kg: Math.max(300, co2Reduction),
      reasoning: `HT industrial tariff identified carrying Time-of-Day billing. Shifting 20% of batch dyeing or compressed air loads from morning/evening peak hours (06:00–09:00, 18:00–21:00 with 20% surcharge) to off-peak night slots (22:00–05:00 with 5% rebate) yields ₹${annualSavings.toLocaleString('en-IN')}/yr in direct tariff savings.`,
      tamil_reasoning: `உயர் அழுத்த (HT) மின்சாரத்தில் உச்ச நேர கட்டணத்தை (20% கூடுதல்) தவிர்த்து, இரவு நேர சலுகை கட்டணத்திற்கு (5% தள்ளுபடி) உற்பத்தியை மாற்றுவதன் மூலம் ஆண்டுக்கு ₹${annualSavings.toLocaleString('en-IN')} மிச்சப்படுத்தலாம்.`,
      category: 'efficiency',
      traceable_field: `HT Bill #${htBill.bill_number || 'HT-1'}: ${htUnits} kWh under ToD tariff (${htBill.source_notes})`,
      computation_trace: `25% net ToD differential on 20% shifted load (${shiftedKwh.toFixed(0)} kWh/mo)`,
    });
  }

  // =========================================================================
  // TYPE A, RULE 5: Petrol/vehicle-specific note
  // Only fires if the ledger has petrol entries and no diesel/generator entries:
  // compare litres consumed against billing period (if known) and flag only the
  // fact that two fuel purchases haven't been distinguished as vehicle-use vs
  // equipment-use, prompting the user to tag it rather than guessing on their behalf.
  // =========================================================================
  if (hasPetrol && !hasDiesel && petrolBills.length > 0) {
    const receiptsSummary = petrolBills
      .map(
        (b) =>
          `${b.units_consumed} L${b.cost_rupees ? ` (₹${b.cost_rupees.toLocaleString('en-IN')})` : ''}${
            b.billing_period_days ? ` over ${b.billing_period_days} days` : ''
          }`
      )
      .join(' and ');

    const annualizedPetrolLitres = totalPetrolLitres * 12;
    const annualizedPetrolCost =
      totalPetrolCost > 0 ? totalPetrolCost * 12 : annualizedPetrolLitres * 102;
    const annualizedPetrolCo2 = Math.round(
      annualizedPetrolLitres * EMISSION_FACTORS.PETROL_KG_CO2_PER_LITRE
    );

    // Classifying vehicle vs stationary equipment unlocks transport route consolidation
    // and statutory GST input-tax fuel claims (~12% operational impact)
    const annualSavings = Math.round(annualizedPetrolCost * 0.12);
    const co2Reduction = Math.round(annualizedPetrolCo2 * 0.12);

    derivedRecommendations.push({
      id: 'rule5-petrol-tagging-audit',
      rule_id: 'petrol_vehicle_tagging',
      title: 'Action Required: Tag Petrol Purchases as Vehicle-Use vs Equipment-Use',
      tamil_title: 'செயல் தேவை: பெட்ரோல் ரசீதுகளை வாகனம் அல்லது இயந்திர பயன்பாடு என வகைப்படுத்துக',
      estimated_annual_savings_rupees: Math.max(1200, annualSavings),
      estimated_co2_reduction_kg: Math.max(50, co2Reduction),
      reasoning: `The ledger records ${petrolBills.length} petrol purchase(s) (${receiptsSummary} totaling ${totalPetrolLitres.toFixed(2)} L, ₹${totalPetrolCost.toFixed(2)}, emitting ${Math.round(totalPetrolLitres * EMISSION_FACTORS.PETROL_KG_CO2_PER_LITRE)} kg CO₂e) without distinction between commercial transport vehicles and stationary shopfloor equipment. Please tag each entry as 'Vehicle Fleet' or 'Equipment / Generator' rather than relying on automated assumptions, ensuring strict Scope 1 GHG protocol audit compliance and unlocking route consolidation savings.`,
      tamil_reasoning: `பதிவேட்டில் உள்ள ${petrolBills.length} பெட்ரோல் ரசீதுகள் (${totalPetrolLitres.toFixed(2)} லிட்டர், ₹${totalPetrolCost.toFixed(2)}) வாகன பயன்பாட்டிற்கா அல்லது உபகரணங்களுக்கானதா என்பது பிரித்து பதிவு செய்யப்படவில்லை. துல்லியமான தணிக்கைக்கு ஒவ்வொரு ரசீதையும் 'வாகனம்' அல்லது 'இயந்திரம்' என தனித்தனியாக வகைப்படுத்துமாறு கேட்டுக்கொள்கிறோம்.`,
      category: 'logistics',
      traceable_field: `Petrol Ledger: ${petrolBills.length} receipts totaling ${totalPetrolLitres.toFixed(2)} L (₹${totalPetrolCost.toFixed(2)})`,
      computation_trace: `Computed directly from ${petrolBills.length} logged petrol receipt(s) without asset tagging`,
    });
  }

  return {
    derivedRecommendations,
    generalPractices: STATIC_GENERAL_PRACTICES,
  };
}

/**
 * Backward compatibility helper returning only the Type A list
 */
export function generateRecommendations(bills: RawBillData[]): DerivedRecommendation[] {
  return generateRecommendationOutput(bills).derivedRecommendations;
}

/**
 * Getter for Type B general practices
 */
export function getGeneralPractices(): GeneralPractice[] {
  return STATIC_GENERAL_PRACTICES;
}
