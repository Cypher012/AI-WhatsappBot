import { Client, MessageMedia } from 'whatsapp-web.js';
import { type Content } from '@google/genai';
import { GenerateMessage } from '@/client/models/messageReply';
import { BirthDayMessageCron } from '@/client/cron/birthdayCron';
import path from 'path';

const testing_groupID = '120363400270745236@g.us';
const sac_groupID = '120363319207474832@g.us';
const mavericks_groupID = '120363162253874495@g.us';

export const groupMessageHandler = (client: Client) => {
  client.on('ready', async () => {
    const job = BirthDayMessageCron(client);
    job.start();
  });
};
