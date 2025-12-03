import { GoogleGenAI, Type } from "@google/genai";
import { ElementType, Pokemon, Move } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a creative game designer for a Pokemon-style battle game.
Create unique, balanced creatures with interesting Chinese names and stats.
The setting is a fantasy world.
Output JSON only.
`;

export const generateBattleData = async (): Promise<{ player: Omit<Pokemon, 'imageUrl' | 'id' | 'currentHp' | 'isPlayer'>, opponent: Omit<Pokemon, 'imageUrl' | 'id' | 'currentHp' | 'isPlayer'> }> => {
  const model = 'gemini-2.5-flash';
  
  const response = await ai.models.generateContent({
    model,
    contents: "Generate two unique battling monsters (Pokemon-like). One for the player, one for the opponent. Give them Chinese names, elemental types, stats (HP between 100-200), and 4 moves each.",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          player: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(ElementType) },
              maxHp: { type: Type.INTEGER },
              attack: { type: Type.INTEGER },
              defense: { type: Type.INTEGER },
              speed: { type: Type.INTEGER },
              description: { type: Type.STRING, description: "A detailed visual description of the monster for image generation. e.g. 'A fiery red fox with three tails...'" },
              moves: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: Object.values(ElementType) },
                    power: { type: Type.INTEGER },
                    accuracy: { type: Type.INTEGER },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "type", "power", "accuracy", "description"]
                }
              }
            },
            required: ["name", "type", "maxHp", "attack", "defense", "speed", "description", "moves"]
          },
          opponent: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(ElementType) },
              maxHp: { type: Type.INTEGER },
              attack: { type: Type.INTEGER },
              defense: { type: Type.INTEGER },
              speed: { type: Type.INTEGER },
              description: { type: Type.STRING, description: "A detailed visual description of the monster for image generation." },
              moves: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: Object.values(ElementType) },
                    power: { type: Type.INTEGER },
                    accuracy: { type: Type.INTEGER },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "type", "power", "accuracy", "description"]
                }
              }
            },
            required: ["name", "type", "maxHp", "attack", "defense", "speed", "description", "moves"]
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate battle data");
  }

  return JSON.parse(response.text);
};

export const generatePokemonImage = async (description: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  // Create a cute/cool sprite style prompt
  const imagePrompt = `A high quality, digital art style sprite of a pokemon-like monster. White background. Style: Anime, cel-shaded, vibrant colors. Description: ${description}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: imagePrompt,
      config: {
        // Image generation doesn't use standard responseSchema/MimeType the same way for outputting the image itself in the response object structure for this SDK version usually, 
        // but the prompt implies we get a response with parts.
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
         return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    // Fallback if no image found
    return "https://picsum.photos/200"; 
  } catch (error) {
    console.error("Image gen error", error);
    return "https://picsum.photos/200";
  }
};
