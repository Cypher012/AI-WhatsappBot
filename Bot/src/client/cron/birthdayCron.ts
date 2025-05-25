
import cron from 'node-cron';
import { Client, MessageMedia } from 'whatsapp-web.js';
import getUsers from "@/lib/fetchUser"
import { GenerateBirthdayMessage } from '@/client/models/birthdayMessage';
const people = [
  { name: 'Alice', birthday: '07-21' },
  { name: 'Bob', birthday: '12-05' },
  { name: 'Charlie', birthday: '07-21' },
];


export function BirthDayMessageCron(client: Client) {
  const job = cron.schedule('*/2 * * * *', async () => {
    try {
      const users = await getUsers();

      await Promise.all(users.map(async (user) => {
        try {
          const media = await MessageMedia.fromUrl(user.profileUrl);
          const contactId = `${user.phoneNumber}@c.us`;
          const testing_groupID = '120363400270745236@g.us';
          // const contact = await client.getContactById(contactId);
          const caption = await GenerateBirthdayMessage(user);

          if (!caption) {
            console.error('❌ No response generated from Gemini');
            return;
          }
          
          const mentions = [contactId]; // ✅ Use contact not string
          
          await client.sendMessage(
            testing_groupID,
            media,
            { caption, mentions }
          );
        } catch (err) {
          console.error(`Error sending message to ${user.name}:`, err);
        }
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  });

  return job;
}

function getTodayDate() {
  const date = new Date().toISOString();
  let todayStr = date.split('T')[0] as string;
  todayStr = todayStr.replace(/\d{4}-/gm, '');
  console.log('todayStr: ', todayStr);
  const birthdayToday = people.filter((person) => person.birthday === todayStr);
  if (birthdayToday.length > 0) {
    birthdayToday.forEach((person) => {
      console.log(`Happy Birthday, ${person.name}!`);
    });
  } else {
    console.log('No birthdays today.');
  }
}
