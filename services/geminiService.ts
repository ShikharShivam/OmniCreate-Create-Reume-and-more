import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, FormFillResult } from "../types";

export const generateResume = async (userProfile: string): Promise<ResumeData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";
  
  const prompt = `Create a professional resume JSON for a user with this profile description: "${userProfile}".
  Ensure the tone is professional. Infer missing details if reasonable, or leave generic placeholders like "[City]".
  The output must be strictly JSON matching this structure:
  {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "summary": "string",
    "experience": [{"role": "string", "company": "string", "period": "string", "details": ["string"]}],
    "education": [{"degree": "string", "school": "string", "year": "string"}],
    "skills": ["string"]
  }`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                period: { type: Type.STRING },
                details: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                school: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ResumeData;
};

export const generatePosterImage = async (prompt: string, aspectRatio: "1:1" | "9:16" | "16:9" = "1:1"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-image-preview"; // Using high quality model for posters

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: `Create a high-quality, effective, and attractive poster design. Description: ${prompt}. Ensure text is legible if requested.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K" // Standard good quality
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const fillFormSmartly = async (formText: string, userData: string): Promise<FormFillResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `You are a smart form filling assistant.
  User Data Context: "${userData}"
  
  Form Content to Fill:
  "${formText}"
  
  Task:
  1. Identify fields in the "Form Content".
  2. Fill them using "User Data".
  3. Return a JSON object with:
     - "filledText": A string representation of the form with answers filled in.
     - "fields": A key-value map of identified fields and their filled values.
  
  If information is missing, use reasonable placeholders or "[Missing Info]".`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          filledText: { type: Type.STRING },
          fields: {
             type: Type.OBJECT,
             properties: {}, // Allow dynamic keys
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as FormFillResult;
};