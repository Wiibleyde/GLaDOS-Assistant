import dotenv from "dotenv"

dotenv.config()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, GLADOS_HOME_GUILD, OWNER_ID, LOGS_WEBHOOK_URL, GOOGLE_API_KEY, REPORT_CHANNEL } = process.env

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GLADOS_HOME_GUILD || !OWNER_ID || !LOGS_WEBHOOK_URL || !REPORT_CHANNEL) {
    throw new Error("Missing environment variables")
}

/**
 * Configuration object for the GLaDOS Assistant application.
 * 
 * @property {string} DISCORD_TOKEN - The token used to authenticate with the Discord API.
 * @property {string} DISCORD_CLIENT_ID - The client ID of the Discord application.
 * @property {string} GLADOS_HOME_GUILD - The ID of the home guild (server) for the GLaDOS Assistant.
 * @property {string} OWNER_ID - The ID of the owner of the bot.
 * @property {string} LOGS_WEBHOOK_URL - The URL of the webhook used for logging.
 * @property {string} GOOGLE_API_KEY - The API key used to authenticate with Google services.
 * @property {string} REPORT_CHANNEL - The ID of the channel where reports are sent.
 */
export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    GLADOS_HOME_GUILD,
    OWNER_ID,
    LOGS_WEBHOOK_URL,
    GOOGLE_API_KEY,
    REPORT_CHANNEL
}