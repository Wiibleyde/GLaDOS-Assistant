import { ActivityType, Client, EmbedBuilder, Events, GatewayIntentBits, Partials } from "discord.js"
import { deployCommands, deployDevCommands } from "./deploy-commands"
import { errorEmbed } from "./utils/embeds"
import { config } from "./config"
import { buttons, commands, devCommands, modals } from "./commands"
import { logger } from "./utils/logger"
import { initRenameCache, renameCache } from "./commands/config/rename"
import { CronJob } from 'cron';
import { prisma } from "./utils/database"
import { checkOutdatedQuiz } from "./commands/fun/quiz"

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember
    ]
})

logger.initLevels()
initRenameCache()

client.once(Events.ClientReady, async () => {
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

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
        try {
            const { commandName } = interaction;
            if (commands[commandName as keyof typeof commands]) {
                commands[commandName as keyof typeof commands].execute(interaction)
            }
            if (devCommands[commandName as keyof typeof devCommands]) {
                devCommands[commandName as keyof typeof devCommands].execute(interaction)
            }
        } catch (error: Error | any) {
            logger.error(`Error while executing command: ${error.message}`)
            await interaction.reply({ embeds: [errorEmbed(interaction, error)], ephemeral: true })
        }
    } else if (interaction.isModalSubmit()) {
        if (modals[interaction.customId as keyof typeof modals]) {
            modals[interaction.customId as keyof typeof modals](interaction)
        }
    } else if (interaction.isButton()) {
        const customId = interaction.customId.split("--")[0]
        if (buttons[customId as keyof typeof buttons]) {
            buttons[customId as keyof typeof buttons](interaction)
        }
    }
})

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return
    const guildId = message.guild?.id
    if (!guildId) return
    let rename = renameCache.get(parseInt(guildId))
    if (!rename || rename.length === 0) {
        rename = client.user?.username
    } else {
        const guild = await prisma.config.findFirst({
            where: {
                guildId: parseInt(guildId),
                key: "botName"
            }
        })
        if (guild) {
            rename = guild.value
            renameCache.set(parseInt(guildId), rename)
        }
    }
    if (message.content.startsWith(`<@!${client.user?.id}>`) || message.content.startsWith(rename as string)) {
        const embed = new EmbedBuilder()
            .setTitle("GLaDOS intelligence 🧠")
            .setDescription(`Feature non implémentée... WIP`)
            .setColor(0xffffff)
            .setTimestamp()
            .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: client.user?.displayAvatarURL() });
        await message.channel.send({ embeds: [embed] })
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

// Cron job to checkOutdatedQuiz every 2 minutes
const quizCron = new CronJob('0 */2 * * * *', async () => {
    checkOutdatedQuiz()
})
quizCron.start()

client.login(config.DISCORD_TOKEN)