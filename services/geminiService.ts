import { GoogleGenAI } from "@google/genai";
import { AspectRatio, UploadedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageFromPrompt = async (
  prompt: string,
  aspectRatio: AspectRatio = AspectRatio.Square,
  referenceImage?: UploadedImage | null
): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // Add reference image if provided
    if (referenceImage) {
      parts.push({
        inlineData: {
          data: referenceImage.data,
          mimeType: referenceImage.mimeType
        }
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    // Iterate through parts to find the image data
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        throw new Error(`Generation failed: ${error.message}`);
    }
    throw new Error("An unexpected error occurred during image generation.");
  }
};
