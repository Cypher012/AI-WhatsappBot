import { GoogleGenAI, type Content } from '@google/genai';
import { contactPrompt } from '@/lib/prompt';
import type { User } from '@/lib/fetchUser';

const ai = new GoogleGenAI({ apiKey: Bun.env.GEMINI_API_KEY });


export function generateBirthdayPrompt(user: User): string {
  return `
Write a WhatsApp birthday message for a close secondary school classmate in a group chat called "St. Augustine's College, Year 2020". 

The message must:
- Sound friendly, warm, and casual, like a good friend texting and have at least 100 words.
- Be upbeat and genuinely happy — show excitement for the birthday.
- Avoid any nostalgia or references to past memories or inside jokes.
- Avoid any formal language, buzzwords, or email-like phrases.
- Include a light, fun fact or trivia about the birthday or famous people sharing the day, but keep it casual.
- Keep it short but detailed enough to feel personal and lively.
- End with tagging the user using their phone number in the format: @${user.phoneNumber}

User details:  
Name: ${user.name}  
Birthday: ${user.birthdayDate}  
Profile URL: ${user.profileUrl}
gender: ${user.gender}

Write the message now.
`.trim();
}

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 250,
  presencePenalty: 0.6,
  frequencyPenalty: 0.4,
};
const systemInstruction = "You are a friendly and warm AI assistant helping to write personalized birthday messages for former classmates from St. Augustines College. Your messages should reflect genuine friendship, shared school memories, and maintain a casual, conversational tone. Avoid generic or overly formal language. Focus on creating messages that feel personal and authentic, as if written by a real friend from school."

export async function GenerateBirthdayMessage(
  user: User,
) {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction,
        ...generationConfig,
      },
    });

    const response = await chat.sendMessage({ message: generateBirthdayPrompt(user) });
    console.log('✅ Response from model:', response);
    return response.text;
  } catch (error) {
    console.error('❌ Error generating message from Gemini:', error);
    return null; // allow fallback in caller
  }
}
