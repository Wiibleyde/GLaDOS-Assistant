import { Message } from "discord.js";

const reminderRegex = /\b[ra]{1,2}p{1,2}e?l{1,2}e?\s*-?\s*moi\b/i;

export async function processHopeIntelligence(message: Message<boolean>) {
    if (reminderRegex.test(message.content)) {
        // Find the time to remind the user (it could be "dans 5 minutes", "dans 1h30", "dans 2 jours", etc.)
        if (message.content.includes("dans")) {
            // 
        }
    }
}