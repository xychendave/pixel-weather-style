
import { GoogleGenAI, Type } from "@google/genai";
import { OutfitData, UserStats, WeatherData } from "../types";

// Constants
const MODEL_TEXT_FAST = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image';
const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Retry Helper to handle 429 errors
async function retryOperation<T>(operation: () => Promise<T>, delayMs: number = 5000, retries: number = 5): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.code === 429 || error.message?.includes('Resource has been exhausted');
            if (isRateLimit && i < retries - 1) {
                // Exponential backoff
                const waitTime = (delayMs * Math.pow(2, i)) + (Math.random() * 2000);
                console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime/1000)}s... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Operation failed after retries");
}

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  return retryOperation(async () => {
      const ai = getClient();
      
      const prompt = `
      Identify the location for coordinates ${lat}, ${lng}. 
      Search for the current real-time weather in this specific location.
      Also identify a famous architectural landmark in this city.
      
      Return a valid JSON object (no markdown formatting) with the following structure in Simplified Chinese:
      {
        "locationName": "City Name (in Chinese)",
        "temperature": "Current temp like '24°C'",
        "condition": "Short condition like '晴朗', '小雨'",
        "landmark": "Name of a famous landmark here (in Chinese)",
        "description": "A 1 sentence witty and cute comment about the weather for a retro pixel game.",
        "isRainy": boolean,
        "isSunny": boolean
      }`;

      const response = await ai.models.generateContent({
        model: MODEL_TEXT_FAST,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      if (!response.text) throw new Error("无法获取天气数据");
      
      let jsonStr = response.text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let data;
      try {
          data = JSON.parse(jsonStr);
      } catch (e) {
          console.error("JSON Parse Error", jsonStr);
          throw new Error("数据解析失败");
      }

      let sourceUrl;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
          const webChunk = chunks.find((c: any) => c.web?.uri);
          if (webChunk) {
              sourceUrl = webChunk.web.uri;
          }
      }

      return { ...data, sourceUrl };
  }, 3000, 3);
};

export const generateOutfitRecommendation = async (weather: WeatherData, stats: UserStats): Promise<OutfitData> => {
  return retryOperation(async () => {
      const ai = getClient();
      
      const prompt = `
        You are a stylist for a retro pixel-art RPG game.
        User is a ${stats.age} year old ${stats.gender} with ${stats.weight} build.
        Weather is ${weather.temperature}, ${weather.condition} in ${weather.locationName}.
        Recommend a cute, pixel-perfect outfit.
        
        CRITICAL: You MUST include the color in the item name. 
        Example: "Red Pixel Hat", "Blue Denim Jeans", "Green T-Shirt".
        
        Rules:
        1. If gender is '女性', you CAN choose a 'dress'. If 'dress' is chosen, do NOT recommend 'top' or 'bottom'.
        2. 'hat', 'outerwear', 'shoes', 'accessories' are always good if weather permits.
        3. Return output in Simplified Chinese (including color names).
        4. Keep descriptions short.
        
        Return JSON.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_TEXT_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hat: { type: Type.STRING, nullable: true, description: "Name of hat with color" },
              top: { type: Type.STRING, nullable: true, description: "Name of top with color" },
              bottom: { type: Type.STRING, nullable: true, description: "Name of bottom with color" },
              dress: { type: Type.STRING, nullable: true, description: "Name of dress with color" },
              outerwear: { type: Type.STRING, nullable: true, description: "Coat or jacket with color" },
              shoes: { type: Type.STRING, description: "Shoes with color" },
              accessories: { type: Type.STRING, nullable: true, description: "Bag, scarf, prop etc. with color" }
            }
          }
        }
      });

      if (!response.text) throw new Error("无法生成穿搭建议");
      return JSON.parse(response.text);
  }, 3000, 3);
};

export const generateItemThumbnail = async (itemName: string, category: string): Promise<string> => {
    const ai = getClient();
    const prompt = `
      Create a single high-quality pixel art icon of: ${itemName}.
      Style: 16-bit JRPG inventory item (like Final Fantasy VI or Octopath Traveler).
      Detail: Distinct black outlines, vibrant colors, detailed shading.
      Composition: Centered, floating, no background (or solid white background).
    `;
    
    try {
        return await retryOperation(async () => {
            const response = await ai.models.generateContent({
                model: MODEL_IMAGE,
                contents: prompt,
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            return "";
        }, 8000, 4); 
    } catch (e) {
        console.warn(`Skipping thumbnail for ${itemName} due to quota or error.`);
        return ""; 
    }
};

export const generateAvatarImage = async (stats: UserStats, outfit?: OutfitData): Promise<string> => {
  const ai = getClient();

  let outfitDesc = "Basic white t-shirt and blue jeans";
  if (outfit) {
    const parts = [
      outfit.hat ? `wearing ${outfit.hat}` : '',
      outfit.dress ? `wearing ${outfit.dress}` : `wearing ${outfit.top} and ${outfit.bottom}`,
      outfit.outerwear ? `with ${outfit.outerwear}` : '',
      outfit.shoes ? `wearing ${outfit.shoes}` : '',
      outfit.accessories ? `holding/wearing ${outfit.accessories}` : ''
    ];
    outfitDesc = parts.filter(Boolean).join(", ");
  }

  let prompt = "";
  const styleDescription = `
    Target Style: High-fidelity 16-bit Anime Pixel Art (JRPG Style).
    Reference Aesthetic: Octopath Traveler, Stardew Valley (High Res Portraits), or owlboy.
    
    Character Specs:
    - Skin Tone: ${stats.skinTone}.
    - Hair Color: ${stats.hairColor}.
    - Hairstyle: ${stats.hairLength}.
    - Age: ${stats.age}.
    - Gender: ${stats.gender}.
    
    Outfit: ${outfitDesc}.
    
    Composition: Full body character sprite on a simple pastel solid background.
    Visual Details: Sharp pixels, clean distinct outlines, expressive eyes, detailed hair shading.
    Proportions: 3-4 heads tall (cute but not super deformed).
  `;

  const contents: any[] = [];

  if (stats.uploadedImage) {
      const base64Data = stats.uploadedImage.split(',')[1];
      contents.push({
          inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Data
          }
      });
      prompt = `Turn this person into a high-quality 16-bit anime pixel art character.\n${styleDescription}`;
  } else {
      prompt = `Create a high-quality 16-bit anime pixel art character.\n${styleDescription}`;
  }

  contents.push({ text: prompt });

  return retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_IMAGE,
        contents: { parts: contents },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      throw new Error("无法生成图片");
  }, 5000, 3); 
};

export const generateLandmarkImage = async (landmark: string, condition: string): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Anime style pixel art background of ${landmark}.
    Style: 16-bit SNES JRPG background, incredibly detailed, atmospheric lighting.
    Weather: ${condition}.
    Colors: Retro aesthetic, vibrant.
  `;
  
  return retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_IMAGE,
        contents: prompt,
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return "";
  }, 5000, 3);
}

export const generateAvatarVideo = async (avatarBase64: string, weather: WeatherData) => {
    if (!await (window as any).aistudio.hasSelectedApiKey()) {
      await (window as any).aistudio.openSelectKey();
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cleanBase64 = avatarBase64.split(',')[1];

    let actionPrompt = "Character breathing idly, hair waving in wind.";
    if (weather.isRainy) {
        actionPrompt = "Character holding umbrella in rain, pixel art style animation.";
    } else if (weather.isSunny) {
        actionPrompt = "Character smiling and looking around, sunny pixel art animation.";
    }

    const prompt = `
      High quality pixel art animation. 16-bit anime style.
      ${actionPrompt}
      Keep the character appearance EXACTLY consistent with the provided reference image.
      Background: ${weather.condition} in ${weather.locationName}.
    `;

    let operation = await ai.models.generateVideos({
        model: MODEL_VIDEO,
        prompt: prompt,
        image: {
            imageBytes: cleanBase64,
            mimeType: 'image/png' 
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9' 
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
