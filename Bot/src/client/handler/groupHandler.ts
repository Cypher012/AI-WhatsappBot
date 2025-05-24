import { Client, MessageMedia } from 'whatsapp-web.js';
import { type Content } from '@google/genai';
import { GenerateMessage } from '@/client/model';
import { testingCron } from '@/client/cron/birthdayCron';
import path from 'path';

const testing_groupID = '120363400270745236@g.us';
const sac_groupID = '120363319207474832@g.us';
const mavericks_groupID = '120363162253874495@g.us';

export const groupMessageHandler = (client: Client) => {
  client.on('ready', async () => {
    const imagePath = path.resolve(
      __dirname,
      '../../assets/images/pelumi-compressed.jpg'
    );
    const media = MessageMedia.fromFilePath(imagePath);
    const contactId = '2348163113001@c.us';
    const testing_groupID = '120363400270745236@g.us';
    const contact = await client.getContactById(contactId);
    const text = `Happy Birthday, Pelumi! 🎉🎂🥳 @${contact.id.user}`;
    const job = testingCron(client, testing_groupID, media, text, [contactId]);
    job.start();
  });
};
