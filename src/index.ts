import { ActivityType, Client, EmbedBuilder } from "discord.js"
import { deployCommands, deployDevCommands } from "./deploy-commands"
import { config } from "./config"
import { commands, devCommands, modals } from "./commands"
import { logger } from "./utils/logger"
import { CronJob } from 'cron';
import { prisma } from "./utils/database"

export const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
})

logger.initLevels()

client.once("ready", async () => {
    client.user?.setPresence({
        activities: [
            {
                name: `le démarrage...`,
                type: ActivityType.Watching
            }
        ]
    })
    await deployCommands()
    const devGuild = config.GLADOS_HOME_GUILD
    await deployDevCommands(devGuild)
    logger.info(`Connecté en tant que ${client.user?.tag}!`)
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

// Cron job to wish happy birthday to users at 00:00
const birthdayCron = new CronJob('0 0 0 * * *', async () => {
    const todayBirthdays = await prisma.birthdays.findMany({
        where: {
            date: new Date()
        }
    })
    const botGuilds = client.guilds.cache
    for (const birthday of todayBirthdays) {
        for (const guild of botGuilds) {
            const guildId = guild[0]
            const guildObj = guild[1]
            const member = await guildObj.members.fetch(birthday.userId.toString()).catch(() => null)
            if (member) {
                const channelId = await prisma.config.findFirst({
                    where: {
                        guildId: parseInt(guildId),
                        key: 'birthdayChannel'
                    }
                })
                if (channelId) {
                    const channel = guildObj.channels.cache.get(channelId.value)
                    if (channel && channel.isTextBased()) {
                        const embed = new EmbedBuilder()
                            .setTitle("Joyeux anniversaire !")
                            .setDescription(`Joyeux anniversaire <@${birthday.userId}> (${new Date().getFullYear() - new Date(birthday.date).getFullYear()} ans) ! 🎉🎂`)
                            .setColor(0xffffff)
                            .setTimestamp()
                            .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: client.user?.displayAvatarURL() });
                        await channel.send({ embeds: [embed] })
                    } else {
                        logger.error(`Channel ${channelId.value} not found in guild ${guildId}`)
                    }
                } else {
                    logger.error(`Channel not found in guild ${guildId}`)
                }
            }
        }
    }
})
birthdayCron.start()

const possibleStatus: Array<{ name: string, type: ActivityType }> = [
    { name: `le résultat des tests.`, type: ActivityType.Watching },
    { name: `vos demandes.`, type: ActivityType.Listening },
    { name: `votre aide.`, type: ActivityType.Competing },
    { name: `Aperture Science`, type: ActivityType.Watching },
]
let statusIndex = 0

// Cron job to update bot status 10 seconds
const statusCron = new CronJob('0,10,20,30,40,50 * * * * *', async () => {
    const status = possibleStatus[statusIndex]
    await client.user?.setPresence({
        activities: [
            {
                name: status.name,
                type: status.type
            }
        ]
    })
    statusIndex++
    if (statusIndex >= possibleStatus.length) {
        statusIndex = 0
    }
})
statusCron.start()

client.login(config.DISCORD_TOKEN)