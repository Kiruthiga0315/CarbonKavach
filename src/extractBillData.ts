/**
 * AI Extraction Layer (Extraction Only)
 *
 * NON-NEGOTIABLE ARCHITECTURE RULE:
 * This layer is used ONLY to read a photographed electricity bill or fuel receipt
 * and pull out raw numbers as strict JSON.
 * It NEVER calculates CO2, NEVER invents a number it isn't confident about (returns null),
 * and NEVER produces a recommendation.
 */

import { ExtractedBillPayload, BillType } from './types';

export interface ExtractionResponse {
  success: boolean;
  data?: ExtractedBillPayload;
  error?: string;
  confidence?: number;
  rawJson?: string;
}

/**
 * Strict validator to guarantee the returned object matches the exact required JSON schema.
 * Rejects any unexpected types, NaN, or invalid enum values.
 */
export function validateBillPayload(data: unknown): ExtractedBillPayload {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid bill data structure: expected JSON object.');
  }

  const obj = data as Record<string, unknown>;

  // 1. Validate bill_type
  const validBillTypes: BillType[] = ['electricity', 'petrol', 'diesel'];
  if (!validBillTypes.includes(obj.bill_type as BillType)) {
    throw new Error(
      `Invalid bill_type: "${String(obj.bill_type)}". Expected "electricity", "petrol", or "diesel".`
    );
  }
  const bill_type = obj.bill_type as BillType;

  // 2. Validate unit
  const validUnits = ['kWh', 'litres'];
  if (!validUnits.includes(obj.unit as string)) {
    throw new Error(
      `Invalid unit: "${String(obj.unit)}". Expected "kWh" or "litres".`
    );
  }
  const unit = obj.unit as 'kWh' | 'litres';

  // Unit consistency check
  if (bill_type === 'electricity' && unit !== 'kWh') {
    throw new Error('Unit mismatch: electricity bills must use "kWh".');
  }
  if ((bill_type === 'petrol' || bill_type === 'diesel') && unit !== 'litres') {
    throw new Error(`Unit mismatch: ${bill_type} receipts must use "litres".`);
  }

  // 3. Validate units_consumed (number or null)
  let units_consumed: number | null = null;
  if (obj.units_consumed !== null && obj.units_consumed !== undefined) {
    const parsed = Number(obj.units_consumed);
    if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
      throw new Error('Invalid units_consumed: must be a positive number or null.');
    }
    units_consumed = Number(parsed.toFixed(2));
  }

  // 4. Validate billing_period_days (number or null)
  let billing_period_days: number | null = null;
  if (obj.billing_period_days !== null && obj.billing_period_days !== undefined) {
    const parsed = Number(obj.billing_period_days);
    if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
      throw new Error('Invalid billing_period_days: must be a positive integer or null.');
    }
    billing_period_days = Math.round(parsed);
  }

  // 5. Validate cost_rupees (number or null)
  let cost_rupees: number | null = null;
  if (obj.cost_rupees !== null && obj.cost_rupees !== undefined) {
    const parsed = Number(obj.cost_rupees);
    if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
      throw new Error('Invalid cost_rupees: must be a valid rupee amount or null.');
    }
    cost_rupees = Number(parsed.toFixed(2));
  }

  return {
    bill_type,
    units_consumed,
    unit,
    billing_period_days,
    cost_rupees,
  };
}

/**
 * Sends bill image to the server-side Gemini OCR endpoint.
 *
 * @param imageBase64 - Base64 encoded string of receipt image
 * @param mimeType - e.g. "image/jpeg", "image/png", "application/pdf"
 * @param categoryHint - Optional user selected category hint
 */
export async function extractBillData(
  imageBase64: string,
  mimeType: string,
  categoryHint?: BillType
): Promise<ExtractedBillPayload> {
  // Strip data URL prefix if present
  const cleanBase64 = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  const response = await fetch('/api/extract-bill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64: cleanBase64,
      mimeType: mimeType || 'image/jpeg',
      categoryHint,
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to extract bill data';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(
      result.error ||
        'Could not clearly read numbers on the receipt. Please retake the photo with better lighting.'
    );
  }

  // Strict validation: NEVER pass unvalidated AI outputs forward
  const validated = validateBillPayload(result.data);

  // If both units and cost are null, bill was completely illegible
  if (validated.units_consumed === null && validated.cost_rupees === null) {
    throw new Error(
      'The receipt text was too blurry or obscured to read units and cost. Please retake the photo with clear focus.'
    );
  }

  return validated;
}
