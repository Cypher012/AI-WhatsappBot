import { GoogleGenAI, type Content } from '@google/genai';
import { contactPrompt } from '@/lib/prompt';

const ai = new GoogleGenAI({ apiKey: Bun.env.GEMINI_API_KEY });

const getPromptByGroup = (groupName: string): string => {
  switch (groupName) {
    case 'family_elder_contact':
      return contactPrompt.familyElderPrompt;
    case 'guy_friends':
      return contactPrompt.guyFriendsPrompt;
    case 'female_friends':
      return contactPrompt.girlFriendsPrompt;
    default:
      return contactPrompt.defaultPrompt;
  }
};

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 250,
  presencePenalty: 0.6,
  frequencyPenalty: 0.4,
};

export async function GenerateMessage(
  historyList: Content[],
  contactGroup: string,
  message: string
) {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history: historyList,
      config: {
        systemInstruction: getPromptByGroup(contactGroup),
        ...generationConfig,
      },
    });

    const response = await chat.sendMessage({ message });
    console.log('✅ Response from model:', response);
    return response.text;
  } catch (error) {
    console.error('❌ Error generating message from Gemini:', error);
    return null; // allow fallback in caller
  }
}
