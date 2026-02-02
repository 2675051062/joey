
import { GoogleGenAI } from "@google/genai";
import { JOEY_STYLE_PROMPT } from "../constants";
import { JoeyConfig } from "../types";

export const generateJoeyImage = async (config: JoeyConfig, referenceImageBase64?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a new illustration of the character Joey. 
    Character Identity: Joey the Schnauzer dog.
    Base Style: ${JOEY_STYLE_PROMPT}.
    Additional Style Details: ${config.styleDescription || 'None'}.
    Action: ${config.action}.
    Clothing: ${config.clothing}.
    Accessory: ${config.accessory}.
    Scene: ${config.scene || 'Simple solid light colored background'}.
    Maintain high consistency with the character's facial features and proportions from the reference image. 
    Ensure thick, clean black outlines and vibrant flat colors.`;

  const contents: any = {
    parts: [
      { text: prompt }
    ]
  };

  if (referenceImageBase64 && referenceImageBase64.length > 100) {
    contents.parts.unshift({
      inlineData: {
        mimeType: 'image/png',
        data: referenceImageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio as any || "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("API 未返回图像数据");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
