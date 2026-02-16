import { GoogleGenAI, Type } from "@google/genai";
import { Meal, Workout } from '../types';

// DO NOT create GoogleGenAI at the top level — it crashes without a key.
const MODEL_NAME = 'gemini-2.0-flash';
const VISION_MODEL_NAME = 'gemini-2.0-flash';

let _ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI | null => {
  const key = localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
  if (!key || key === 'undefined' || key.length < 10) return null;
  if (!_ai) {
    try { _ai = new GoogleGenAI({ apiKey: key }); } catch { return null; }
  }
  return _ai;
};

export const clearAiInstance = () => { _ai = null; };

export const isAiReady = (): boolean => {
  return getAi() !== null;
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

export const parseMealLog = async (description: string): Promise<Partial<Meal> | null> => {
  const ai = getAi();
  if (!ai) return null;

  const prompt = `
  You are a nutrition analyzer. The user will describe a meal they ate. Estimate the nutrition.
  Respond ONLY with a JSON object, no other text, no markdown.
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

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Meal Parse Error:", error);
    return null;
  }
};

export const analyzeFoodImage = async (base64Data: string, mimeType: string): Promise<Partial<Meal> | null> => {
  const ai = getAi();
  if (!ai) return null;

  const prompt = `
  Analyze this image of food. Identify the meal and estimate the nutritional content for the entire visible portion.
  Respond ONLY with a JSON object.
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

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

export const refineMealLog = async (currentMeal: Partial<Meal>, instruction: string): Promise<Partial<Meal> | null> => {
  const ai = getAi();
  if (!ai) return null;

  const prompt = `
  Here is the current nutrition data for a meal: ${JSON.stringify(currentMeal)}.
  The user has provided additional context/instruction: "${instruction}".
  Update the nutrition data based on this context (e.g., adjust quantities, add/remove ingredients).
  Respond ONLY with the updated JSON object.
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

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Meal Refine Error:", error);
    return null;
  }
};

export const parseWorkoutLog = async (text: string): Promise<Partial<Workout>[] | null> => {
    const ai = getAi();
    if (!ai) return null;

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

        const resText = response.text;
        if (!resText) return null;
        return JSON.parse(resText);
    } catch (error) {
        console.error("Gemini Workout Parse Error:", error);
        return null;
    }
};

export const getProteinSuggestion = async (remainingProtein: number): Promise<string> => {
    const ai = getAi();
    if (!ai) return "Eat some chicken or greek yogurt.";

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
        return response.text || "Greek yogurt or a protein shake.";
    } catch (error) {
        return "Protein shake or eggs.";
    }
};