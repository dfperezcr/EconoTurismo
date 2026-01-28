
import { GoogleGenAI, Type } from "@google/genai";
import { EconomicEvent } from "../types";

export const generateTourismShock = async (currentStats: any): Promise<EconomicEvent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a real-time economic event for a Costa Rican tourism village. 
    Focus on social dilemmas, community challenges, or shared resources.
    Style: Flavorful but educational. Mention if the event is 'local' or 'community' wide.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING },
          concept: { type: Type.STRING, description: "Economic concept: e.g. Tragedy of the Commons, Public Goods, Free-Rider Problem" },
          scope: { type: Type.STRING, enum: ["local", "community"] }
        },
        required: ["title", "description", "impact", "concept", "scope"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as EconomicEvent;
};

export const getTourismAdvice = async (action: string, stats: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Action: "${action}". 
    Stats: ${JSON.stringify(stats)}. 
    Explain the economics of COOPERATION versus COMPETITION in this scenario.`,
    config: {
      temperature: 0.8,
      systemInstruction: "You are Don Carlos. You explain complex economics using village metaphors. Focus on how individual actions affect the 'Community Project' and the shared environment. Use phrases like 'Somos un equipo' or 'The village depends on you'. Under 40 words."
    }
  });

  return response.text;
};
