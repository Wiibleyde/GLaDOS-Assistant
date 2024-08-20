import { Client } from "discord.js"
import { deployCommands, deployDevCommands } from "./deploy-commands"
import { config } from "./config"
import { commands, devCommands } from "./commands"
import { logger } from "./utils/logger"

export const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
})

logger.initLevels()

client.once("ready", () => {
    deployCommands()
    const devGuild = config.GLADOS_HOME_GUILD
    deployDevCommands(devGuild)
})

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction)
    }
    if (devCommands[commandName as keyof typeof devCommands]) {
        devCommands[commandName as keyof typeof devCommands].execute(interaction)
    }

})

client.login(config.DISCORD_TOKEN)