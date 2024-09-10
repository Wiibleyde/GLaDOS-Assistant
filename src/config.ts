import dotenv from "dotenv"

dotenv.config()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, GLADOS_HOME_GUILD, OWNER_ID, LOGS_WEBHOOK_URL, GOOGLE_API_KEY } = process.env

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GLADOS_HOME_GUILD || !OWNER_ID || !LOGS_WEBHOOK_URL) {
    throw new Error("Missing environment variables")
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    GLADOS_HOME_GUILD,
    OWNER_ID,
    LOGS_WEBHOOK_URL,
    GOOGLE_API_KEY
}