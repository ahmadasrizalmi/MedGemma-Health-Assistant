import { GoogleGenAI, Chat } from "@google/genai";
import type { FileData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
        systemInstruction: `You are MedGemma, a helpful and empathetic AI healthcare assistant. Your knowledge is based on Google's MedGemma model.
- Provide information responsibly and for informational purposes only.
- **Crucially, you must always end your responses with a clear disclaimer: "Disclaimer: I am an AI assistant and not a medical professional. This information is not a substitute for professional medical advice. Please consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health."**
- Do not provide diagnoses or prescribe treatments.
- If a user seems to be in a crisis, strongly advise them to contact local emergency services immediately.
- Be supportive, clear, and concise in your communication.`,
    }
});

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};


export const streamChatResponse = async (
    chatHistory: Chat, 
    prompt: string, 
    file?: FileData
) => {
    const messageParts: (string | { inlineData: { data: string; mimeType: string; } })[] = [prompt];
    
    if (file) {
        // Gemini can handle various MIME types directly.
        messageParts.push(fileToGenerativePart(file.base64, file.type));
    }
    
    try {
        const result = await chatHistory.sendMessageStream(messageParts);
        return result;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get response from AI. Please check your API key and network connection.");
    }
};

export { model as chatModel };