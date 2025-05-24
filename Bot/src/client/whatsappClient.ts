import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export const createClient = () => {
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './session',
      clientId: 'CLIENT_ID_KEY1',
    }),
    puppeteer: {
      headless: false,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('✅ Client authenticated!');
  });

  client.on('ready', async () => {
    console.log('✅ Client is ready!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Auth failed:', msg);
  });

  client.on('disconnected', (reason) => {
    console.log('❌ Client disconnected:', reason);
  });

  return client;
};
