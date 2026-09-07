import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 25MB limit for high-res photo uploads
app.use(express.json({ limit: '25mb' }));

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CarbonKavach Compliance Engine',
    timestamp: new Date().toISOString(),
  });
});

/**
 * AI EXTRACTION ENDPOINT
 *
 * Strict separation:
 * This endpoint performs OCR and raw field extraction ONLY.
 * It NEVER performs emission calculations or produces recommendations.
 */
app.post('/api/extract-bill', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, categoryHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing bill image payload. Please upload or scan a receipt.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets settings.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `Analyze this photographed utility bill or fuel receipt from an Indian commercial enterprise.
Extract the raw numerical figures into the specified JSON format.
Category hint if provided by user: "${categoryHint || 'auto-detect'}".

CRITICAL INSTRUCTIONS:
- Identify if this is "electricity" (e.g. TANGEDCO, BESCOM, DISCOM electricity bill), "petrol" (petrol fuel receipt), or "diesel" (diesel / DG set fuel receipt).
- Extract "units_consumed": Total kWh (for electricity) or total Litres (for petrol/diesel) as a pure number. If units are not clearly visible, return null.
- Extract "unit": Must be "kWh" for electricity or "litres" for fuel.
- Extract "billing_period_days": Number of days in the billing cycle if printed (e.g., 30, 60), or null.
- Extract "cost_rupees": Total net bill amount in Indian Rupees (₹) as a number, or null if unclear.
- STRICT RULE: NEVER guess or invent numbers. If any number is torn, smudged, blurry, or missing, return null.
- DO NOT calculate CO2. DO NOT make recommendations.
- Return ONLY the strict JSON object matching the requested schema.`;

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];
    let lastError: any = null;
    let responseText = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            systemInstruction:
              'You are an AI bill extraction engine for Indian MSME enterprises. You extract raw numbers as strict JSON only. You NEVER calculate CO2. You NEVER invent numbers (return null if not completely confident). You NEVER produce recommendations.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                bill_type: {
                  type: Type.STRING,
                  enum: ['electricity', 'petrol', 'diesel'],
                  description: 'Type of bill',
                },
                units_consumed: {
                  type: Type.NUMBER,
                  description: 'Total kWh or Litres consumed as a number, or null if unreadable',
                  nullable: true,
                },
                unit: {
                  type: Type.STRING,
                  enum: ['kWh', 'litres'],
                  description: 'Measurement unit: kWh for electricity, litres for petrol/diesel',
                },
                billing_period_days: {
                  type: Type.INTEGER,
                  description: 'Number of billing period days, or null if not stated',
                  nullable: true,
                },
                cost_rupees: {
                  type: Type.NUMBER,
                  description: 'Total billed or paid amount in INR (₹) as a number, or null',
                  nullable: true,
                },
              },
              required: ['bill_type', 'unit'],
            },
          },
        });

        responseText = response.text?.trim() || '';
        if (responseText) {
          break; // Successfully got response
        }
      } catch (err: any) {
        lastError = err;
        console.log(`[AI OCR] Model ${modelName} busy or unavailable, attempting next model...`);
        // Short pause before fallback attempt
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    if (!responseText && lastError) {
      throw lastError;
    }

    if (!responseText) {
      return res.status(422).json({
        success: false,
        error: 'The bill photograph could not be read clearly. Please retake the photo with better lighting.',
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      return res.status(422).json({
        success: false,
        error: 'Invalid OCR response received. Please retake the photo and try again.',
      });
    }

    // Basic structure verification before returning to client validator
    if (!parsedData.bill_type || !parsedData.unit) {
      return res.status(422).json({
        success: false,
        error: 'Could not determine bill type or units from image. Please retake a clear photo of the full bill.',
      });
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    const errString = error?.message || String(error);
    console.log('[API extract-bill error]:', errString.slice(0, 150));
    let friendlyMessage = 'Server error during bill extraction. Please try again.';

    if (errString.includes('503') || errString.includes('high demand') || errString.includes('UNAVAILABLE')) {
      friendlyMessage =
        'The upstream Google AI OCR service is currently experiencing temporary high traffic. Please retry uploading your receipt in a few seconds.';
    } else if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
      friendlyMessage =
        'Rate limit reached for AI OCR. Please wait a moment and try scanning again.';
    } else if (errString.includes('API_KEY_INVALID') || errString.includes('UNAUTHENTICATED')) {
      friendlyMessage =
        'The configured Gemini API key is invalid or unauthorized. Please verify the key in Settings.';
    }

    return res.status(500).json({
      success: false,
      error: friendlyMessage,
    });
  }
});

/**
 * Start Server with Vite Middleware in Development
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonKavach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
