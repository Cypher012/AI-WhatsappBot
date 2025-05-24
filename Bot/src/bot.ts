import { clearProfileLock } from '@/lib/lockUtils';
import { createClient } from '@/client/whatsappClient';
import { setupMessageHandler } from '@/client/handler/messageHandler';
import { groupMessageHandler } from '@/client/handler/groupHandler';

console.log('Start WhatsApp client');

// Clean Chromium locks to avoid Puppeteer errors
clearProfileLock();

// Initialize client
const client = createClient();

// Setup message event handler
setupMessageHandler(client);
groupMessageHandler(client);
// Initialize WhatsApp client
client.initialize();

// Graceful shutdown on Ctrl+C
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await client.destroy();
  process.exit(0);
});
