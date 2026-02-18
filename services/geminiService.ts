
// @google/genai guidelines followed: Using new GoogleGenAI({ apiKey: ... }) directly.
import { GoogleGenAI, Type } from "@google/genai";
import { Meal, Workout } from '../types';

// Using Gemini 3 Flash as per recommended guidelines for basic text tasks (parsing/summarization)
const MODEL_NAME = 'gemini-3-flash-preview';
const VISION_MODEL_NAME = 'gemini-3-flash-preview';
const USAGE_STORAGE_KEY = 'gemini_usage_stats';
const DAILY_QUOTA = 1500; // Standard free tier limit for Gemini Flash

// --- Usage Tracking Logic ---

export interface UsageStats {
  todayCount: number;
  totalCount: number;
  lastUsed: string;
  quotaLimit: number;
  isRateLimited: boolean;
  retryAfterSeconds: number;
}

const getUsageStats = (): UsageStats => {
  const raw = localStorage.getItem(USAGE_STORAGE_KEY);
  const today = new Date().toISOString().split('T')[0];
  
  let stats: any = { todayCount: 0, totalCount: 0, lastUsed: today, quotaLimit: DAILY_QUOTA, isRateLimited: false, retryAfterSeconds: 0 };
  
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      stats = { ...stats, ...saved };
    } catch (e) {
      console.error("Failed to parse usage stats", e);
    }
  }

  if (stats.lastUsed !== today) {
    stats.todayCount = 0;
    stats.lastUsed = today;
    stats.isRateLimited = false;
  }
  
  return stats;
};

const trackUsage = (error?: any) => {
  const stats = getUsageStats();
  
  if (error && (error.status === 'RESOURCE_EXHAUSTED' || error.message?.includes('429'))) {
    stats.isRateLimited = true;
    const retryDelay = error.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
    if (retryDelay) {
      stats.retryAfterSeconds = parseInt(retryDelay.replace('s', '')) || 60;
    } else {
      stats.retryAfterSeconds = 60;
    }
  } else if (!error) {
    stats.todayCount += 1;
    stats.totalCount += 1;
    stats.isRateLimited = false;
  }
  
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(stats));
};

export const getAiUsage = () => getUsageStats();

// --- API Methods ---

const getApiKey = (): string | undefined => {
  // Check local storage first, then env var
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY;
};

export const isAiReady = (): boolean => {
  const key = getApiKey();
  return !!key && key !== 'undefined';
};

const MEAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER, description: "grams" },
    carbs: { type: Type.NUMBER, description: "grams" },
    fats: { type: Type.NUMBER, description: "grams" },
    fiber: { type: Type.NUMBER, description: "grams" },
    sugar: { type: Type.NUMBER, description: "grams" },
    saturatedFat: { type: Type.NUMBER, description: "grams" },
    sodium: { type: Type.NUMBER, description: "milligrams" },
    cholesterol: { type: Type.NUMBER, description: "milligrams" },
    potassium: { type: Type.NUMBER, description: "milligrams" },
    iron: { type: Type.NUMBER, description: "milligrams" },
    calcium: { type: Type.NUMBER, description: "milligrams" },
    vitaminD: { type: Type.NUMBER, description: "micrograms" },
  },
  required: ["name", "calories", "protein", "carbs", "fats"]
};

/**
 * Parses meal description into nutritional components.
 * Creates a fresh GoogleGenAI instance using the best available API Key.
 */
export const parseMealLog = async (description: string): Promise<Partial<Meal> | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  You are an expert nutritionist database. Analyze the user's meal description and return precise nutritional estimates.

  PORTION RULES (when quantity is NOT specified):
  - "rice" = 1 standard cup cooked (200g)
  - "chicken breast" = 1 medium piece (150g)
  - "bread" = 1 regular slice or 1 small flatbread
  - "eggs" = 1 large egg
  - "salad" = 1 side plate (~150g)
  - Any protein without quantity = 1 standard serving (120-150g)
  - Any drink = 1 regular cup/glass (250ml)
  - "plate of [food]" = standard restaurant portion

  REGIONAL FOOD AWARENESS:
  - The user is based in the UAE. Recognize Arabic, South Asian, and Middle Eastern foods.
  - "machboos" / "kabsa" = spiced rice with meat, ~600-700 cal per plate
  - "shawarma" = 1 wrap with garlic sauce, ~450-550 cal
  - "karak" = sweet chai tea with condensed milk, ~120 cal per cup
  - "manakeesh" = flatbread with cheese/zaatar, ~350-450 cal
  - "fattoush" = Lebanese salad, ~150-200 cal
  - "hummus" = assume ~3 tablespoons (100g), ~170 cal
  - "biryani" = 1 plate with raita, ~650-750 cal
  - "daal" = 1 bowl lentil curry, ~200-250 cal
  - Default cooking oil for Arabic food = ghee or vegetable oil

  COOKING METHOD IMPACT:
  - Fried items: add 30-50% more fat/calories vs grilled
  - "grilled chicken" vs "fried chicken" = significant calorie difference
  - Assume grilled/baked unless stated fried

  ACCURACY RULES:
  - Use USDA-equivalent nutritional data as baseline
  - Round calories to nearest 5
  - Round macros (protein, carbs, fats) to nearest 0.5g
  - For combined meals, calculate each component separately then sum
  - Always estimate slightly HIGH rather than low for weight management
  - Fiber, sugar, sodium, etc. should be realistic, not zero — estimate based on ingredients

  Respond ONLY with a JSON object matching the required schema.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: description,
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json",
        responseSchema: MEAL_SCHEMA
      }
    });

    trackUsage();
    // Guidelines: response.text is a property, not a method
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Meal Parse Error:", error);
    trackUsage(error);
    return null;
  }
};

/**
 * Analyzes food image into nutritional components.
 */
export const analyzeFoodImage = async (base64Data: string, mimeType: string): Promise<Partial<Meal> | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  You are an expert nutritionist analyzing a photo of food. Identify every item visible and estimate total nutritional content.

  ANALYSIS METHOD:
  1. Identify each food item in the image
  2. Estimate portion size using visual cues (plate size, utensils for scale, container size)
  3. Calculate nutrition for each item separately, then sum totals
  4. Use the "name" field to list what you identified (e.g. "Grilled chicken with rice and salad")

  PORTION ESTIMATION FROM IMAGES:
  - Use the plate/bowl as reference: standard dinner plate = 25cm diameter
  - Half a plate of rice ≈ 1.5 cups cooked
  - A piece of meat the size of a palm ≈ 120-150g
  - A full plate = generous restaurant portion
  - Consider depth/piling of food

  REGIONAL AWARENESS: The user is based in the UAE. Recognize Arabic, Middle Eastern, and South Asian dishes by appearance.

  ACCURACY: Estimate slightly HIGH rather than low. Include realistic values for all micronutrients based on visible ingredients, do not return zeros.

  Respond ONLY with a JSON object matching the required schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: VISION_MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this meal's nutrition."
          }
        ]
      },
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json",
        responseSchema: MEAL_SCHEMA
      }
    });

    trackUsage();
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    trackUsage(error);
    return null;
  }
};

/**
 * Refines meal data based on user feedback.
 */
export const refineMealLog = async (currentMeal: Partial<Meal>, instruction: string): Promise<Partial<Meal> | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  Here is the current nutrition estimate for a meal:
  ${JSON.stringify(currentMeal)}

  The user wants to adjust it: "${instruction}"

  RULES:
  - If they say "add X" → add that item's nutrition to the existing totals
  - If they say "remove X" → subtract that item's estimated nutrition
  - If they say "more X" or "less X" → scale that ingredient up or down proportionally
  - If they say "it was fried not grilled" → recalculate fat and calories accordingly
  - If they correct portion size (e.g. "it was a large plate" or "only half") → scale all values
  - Update the "name" field to reflect the change
  - Keep all other values that weren't affected by the change
  - Estimate slightly HIGH rather than low

  Respond ONLY with the complete updated JSON object matching the required schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Update the meal data.",
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json",
        responseSchema: MEAL_SCHEMA
      }
    });

    trackUsage();
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Meal Refine Error:", error);
    trackUsage(error);
    return null;
  }
};

/**
 * Parses workout text (e.g. from Hevy) into a structured workout object.
 */
export const parseWorkoutLog = async (text: string): Promise<Partial<Workout>[] | null> => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Extract workout data from this text (e.g. copied from Hevy). 
    Return an array of exercises. 
    Infer the 'type' (Push, Pull, Legs, Cardio, Mixed, Rest) based on the exercises.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING },
                notes: { type: Type.STRING, description: "Summary of sets/reps/weight" },
                duration: { type: Type.NUMBER, description: "Estimated duration in minutes if not specified, default to 45" }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: text,
            config: {
                systemInstruction: prompt,
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        trackUsage();
        const resText = response.text;
        if (!resText) return null;
        return JSON.parse(resText);
    } catch (error: any) {
        console.error("Gemini Workout Parse Error:", error);
        trackUsage(error);
        return null;
    }
};

/**
 * Suggests a protein source based on remaining protein goal.
 */
export const getProteinSuggestion = async (remainingProtein: number): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) return "Eat some chicken or greek yogurt.";
    
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    The user needs ${remainingProtein}g more protein today. Suggest a quick, easy single food item or small meal to hit this target. Keep it short (max 10 words).
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: "Suggest a protein source.",
            config: {
                systemInstruction: prompt,
                maxOutputTokens: 50,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        trackUsage();
        return response.text || "Greek yogurt or a protein shake.";
    } catch (error: any) {
        trackUsage(error);
        return "Protein shake or eggs.";
    }
};
