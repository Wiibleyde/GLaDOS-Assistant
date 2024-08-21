import { Client } from "discord.js"
import { deployCommands, deployDevCommands } from "./deploy-commands"
import { config } from "./config"
import { commands, devCommands, modals } from "./commands"
import { logger } from "./utils/logger"
// import { CronJob } from 'cron';

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
    if (interaction.isCommand()) {
        const { commandName } = interaction;
        if (commands[commandName as keyof typeof commands]) {
            commands[commandName as keyof typeof commands].execute(interaction)
        }
        if (devCommands[commandName as keyof typeof devCommands]) {
            devCommands[commandName as keyof typeof devCommands].execute(interaction)
        }
    } else if (interaction.isModalSubmit()) {
        if (modals[interaction.customId as keyof typeof modals]) {
            modals[interaction.customId as keyof typeof modals](interaction)
        }
    }
})

// const job = new CronJob('0 0 0 * * *', () => {
//     logger.info('Cron job every day at midnight')
//     // Add your cron job code here
// })

client.login(config.DISCORD_TOKEN)