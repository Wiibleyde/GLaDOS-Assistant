import dotenv from "dotenv"

dotenv.config()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, GLADOS_HOME_GUILD } = process.env

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GLADOS_HOME_GUILD) {
    throw new Error("Missing environment variables")
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    GLADOS_HOME_GUILD,
}