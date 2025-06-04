import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason, proto,
} from 'baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import {testingCron} from "@/bot/cron/birthdayMessageCron"

import IHistorySyncNotification = proto.Message.IHistorySyncNotification;

export type SockType = ReturnType<typeof makeWASocket>;

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    shouldSyncHistoryMessage: (msg: IHistorySyncNotification) => true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on(
    'connection.update',
    async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log('connection closed. reconnecting:', shouldReconnect);
        if (shouldReconnect) {
          startBot();
        }
      }

      if (connection === 'open') {
        console.log('✅ Connected to WhatsApp!');

        const job = testingCron(sock)
        job.start()

        // Fetch groups after connection
        // const groups = await sock.groupFetchAllParticipating();
        //
        // for (const groupId in groups) {
        //   const group = groups[groupId];
        //   console.log("Group: ",{
        //     groupId: group.id,
        //     subject: group.subject,
        //     participants: group.participants.length,
        //   })
        // }
      }
    }
  );

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
      const job = testingCron(sock)
      job.start()
  });
}

const groups = [
  {
    groupId: "120363317459800650@g.us",
    subject: "SAC 19/20 (PRF)",
    participants: 19,
  },
  {
    groupId: "120363400270745236@g.us",
    subject: "Testing Bot",
    participants: 3,
  }
]