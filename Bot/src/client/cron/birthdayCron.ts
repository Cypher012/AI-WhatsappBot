// import { cron, Patterns } from '@elysiajs/cron';
import cron from 'node-cron';
import { Client, MessageMedia } from 'whatsapp-web.js';

const people = [
  { name: 'Alice', birthday: '07-21' },
  { name: 'Bob', birthday: '12-05' },
  { name: 'Charlie', birthday: '07-21' },
];

export function testingCron(
  client: Client,
  who: string,
  image: MessageMedia,
  body: string,
  mentions: string[] = []
) {
  const job = cron.schedule('40 22 * * *', () => {
    client.sendMessage(who, image, { caption: body, mentions });
  });

  // const job = cron.schedule('0 0 * * *', () => {
  //   getTodayDate();
  // });

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
