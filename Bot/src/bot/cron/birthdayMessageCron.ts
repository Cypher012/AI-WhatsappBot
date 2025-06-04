import cron from 'node-cron';
import { SockType } from "@/bot";
import getUsers from "@/bot/lib/fetchUser";
import { GenerateBirthdayMessage } from "@/bot/models/birthdayMessage";

export function testingCron(sock: SockType) {
    // Runs every day at 12:00 PM
    const job = cron.schedule('0 12 * * *', async () => {
        try {
            const jid = "120363400270745236@g.us";
            const users = await getUsers();

            const today = new Date();
            const currentMonth = today.getMonth() + 1; // 0-based index (0 = Jan)
            const currentDate = today.getDate();   // 1-based

            await Promise.all(users.map(async (user) => {
                try {
                    const birthday = new Date(user.birthdayDate);
                    const birthdayMonth = birthday.getMonth() + 1; // 0-based
                    const birthdayDay = birthday.getDate();    // 1-based

                    // If today isn't the user's birthday, skip
                    if (birthdayMonth !== currentMonth || birthdayDay !== currentDate) {
                        return;
                    }

                    const contactId = `${user.phoneNumber}@c.us`;
                    const caption = await GenerateBirthdayMessage(user);

                    if (!caption) {
                        console.error('❌ No response generated from Gemini');
                        return;
                    }

                    const mentions = [contactId + "@s.whatsapp.net"];

                    await sock.sendMessage(jid, {
                        image: { url: user.profileUrl },
                        caption,
                        mentions,
                    });
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
