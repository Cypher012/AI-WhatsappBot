import { Client, LocalAuth } from 'whatsapp-web.js';
import { type Content } from '@google/genai';
import { GenerateMessage } from '@/client/model';
import { findContactGroup } from '@/lib/contact';

export const setupMessageHandler = (client: Client) => {
  client.on('message', async (message) => {
    try {
      const { who, body } = {
        who: message.from,
        body: message.body,
      };

      const contactGroup = findContactGroup(who);

      if (!contactGroup) return;

      const chat = await client.getChatById(who);
      await chat.sendStateTyping();

      const messages = await chat.fetchMessages({ limit: 200 });

      const rawHistory: Content[] = messages.map((msg) => ({
        role: msg.fromMe ? 'model' : 'user',
        parts: [{ text: msg.body }],
      }));

      const filteredHistory: Content[] = [];

      for (let i = 0; i < rawHistory.length; i++) {
        const msg = rawHistory[i] as Content;
        const lastMsg = filteredHistory[filteredHistory.length - 1];

        if (lastMsg && lastMsg.role === msg.role) continue;

        filteredHistory.push(msg);
      }

      // Ensure the first message is from 'user'
      if (filteredHistory[0]?.role !== 'user') {
        filteredHistory.shift();
      }

      const generatedMessage = await GenerateMessage(
        filteredHistory,
        contactGroup,
        body
      );

      if (!generatedMessage) {
        console.error('❌ No response generated from Gemini');
        return;
      }

      client.sendMessage(who, generatedMessage.trim());
    } catch (error) {
      console.error('❌ Error in setupMessageHandler:', error);
    }
  });
};
