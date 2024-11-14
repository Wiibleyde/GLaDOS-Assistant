import { ActivityType, Client, EmbedBuilder, Events, GatewayIntentBits, MessageType, Partials } from "discord.js"
import { deployCommands, deployDevCommands } from "@/deploy-commands"
import { errorEmbed } from "@/utils/embeds"
import { config } from "@/config"
import { buttons, commands, devCommands, modals } from "@/commands"
import { Logger } from "@/utils/logger"
import { CronJob } from 'cron'
import { prisma } from "@/utils/database"
import { initAi, generateWithGoogle } from "@/utils/intelligence"
import { maintenance } from "@/commands/dev/maintenance"
import { backSpace } from "@/utils/textUtils"
import { isMessageQuizQuestion } from "@/commands/fun/quiz/quiz"
import { hasPermission } from "./utils/permissionTester"

export const logger = new Logger()

/**
 * Initializes a new instance of the Client with specified intents and partials.
 * 
 * The client is configured with the following intents:
 * - Guilds: Enables the bot to receive events related to guilds.
 * - GuildMessages: Enables the bot to receive events related to guild messages.
 * - GuildMembers: Enables the bot to receive events related to guild members.
 * - GuildVoiceStates: Enables the bot to receive events related to voice states in guilds.
 * - GuildMessageReactions: Enables the bot to receive events related to message reactions in guilds.
 * - GuildMessageTyping: Enables the bot to receive events related to typing in guilds.
 * - DirectMessages: Enables the bot to receive events related to direct messages.
 * - DirectMessageReactions: Enables the bot to receive events related to reactions in direct messages.
 * - DirectMessageTyping: Enables the bot to receive events related to typing in direct messages.
 * - MessageContent: Enables the bot to receive the content of messages.
 * 
 * The client is also configured with the following partials:
 * - User: Allows the bot to receive partial user objects.
 * - Channel: Allows the bot to receive partial channel objects.
 * - Message: Allows the bot to receive partial message objects.
 * - GuildMember: Allows the bot to receive partial guild member objects.
 */
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
            if(maintenance) {
                if(!await hasPermission(interaction, [], false)) {
                    await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Le bot est en maintenance, veuillez réessayer plus tard."))], ephemeral: true })
                    return
                }
            }
            const { commandName } = interaction
            if (commands[commandName as keyof typeof commands]) {
                commands[commandName as keyof typeof commands].execute(interaction)
            }
            if (devCommands[commandName as keyof typeof devCommands]) {
                devCommands[commandName as keyof typeof devCommands].execute(interaction)
            }
            logger.info(`Commande </${commandName}:${interaction.commandId}> par <@${interaction.user.id}> (${interaction.user.username}) dans <#${interaction.channelId}>`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: Error | any) {
            logger.error(`Erreur commande : </${interaction.commandName}:${interaction.commandId}>${backSpace}<@${interaction.user.id}> (${interaction.user.username}) dans <#${interaction.channelId}> : ${error.message}`)
            await interaction.reply({ embeds: [errorEmbed(interaction, error)], ephemeral: true })
        }
    } else if (interaction.isModalSubmit()) {
        const customId = interaction.customId.split("--")[0]
        if (modals[customId as keyof typeof modals]) {
            modals[customId as keyof typeof modals](interaction)
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
    if (!guildId) {
        logger.debug(`Message reçu en DM de <@${message.author.id}> : ${message.content}`)
        return
    }

    const channelId = message?.channel?.id
    if(!channelId) {
        logger.error(`Channel non trouvé pour le message de <@${message.author.id}> dans le serveur ${guildId}`)
        return
    }

    if (message.mentions.has(client.user?.id as string) && !message.mentions.everyone) {
        if(message.type === MessageType.Reply) {
            if(isMessageQuizQuestion(message.reference?.messageId as string)) {
                return
            }
            // const contentOfReply = message.reference?.messageId ? await message.channel.messages.fetch(message.reference.messageId).then(msg => msg.content) : ''
            // message.content = contentOfReply + message.content
        }
        message.channel.sendTyping()
        const aiReponse = await generateWithGoogle(channelId, message.content.replace(`<@${client.user?.id}> `, ''), message.author.id).catch((error) => {
            return "Je ne suis pas en mesure de répondre à cette question pour le moment. ||(" + error + ")|| (Conversation réinitialisée)"
        }).then((response) => {
            return response
        })

        if (aiReponse) {
            await message.channel.send(`${aiReponse}`)
            logger.info(`Réponse de l'IA à <@${message.author.id}> dans <#${channelId}> : ${aiReponse}`)
        }
    }
})

/**
 * A CronJob that runs daily at midnight to check for users' birthdays.
 * 
 * This job performs the following tasks:
 * 1. Retrieves the current date and extracts the day and month.
 * 2. Queries the database for users whose birthdays match the current day and month.
 * 3. Fetches all guilds the bot is a member of.
 * 4. For each user with a birthday, checks if the user is a member of each guild.
 * 5. If the user is a member of the guild, retrieves the guild's configuration to find the birthday channel.
 * 6. Sends a birthday message to the configured channel in the guild.
 * 
 * The birthday message includes:
 * - A title "Joyeux anniversaire !"
 * - A description mentioning the user and their age (if birth date is available)
 * - A color set to white
 * - A timestamp
 * - A footer with the bot's name and avatar
 * 
 * Logs errors if:
 * - The user is not found in the guild
 * - The birthday channel is not found in the guild configuration
 * - The birthday channel is not found in the guild
 */
const birthdayCron = new CronJob('0 0 0 * * *', async () => {
    const today = new Date()
    const todayDay = today.getDate()
    const todayMonth = today.getMonth() + 1

    const todayBirthdays: { uuid: string, userId: string, birthDate: Date | null, quizGoodAnswers: number, quizBadAnswers: number}[] = await prisma.$queryRaw`SELECT uuid, userId, birthDate, quizGoodAnswers, quizBadAnswers FROM GlobalUserData WHERE EXTRACT(DAY FROM birthDate) = ${todayDay} AND EXTRACT(MONTH FROM birthDate) = ${todayMonth}`

    const botGuilds = await client.guilds.fetch().then(guilds => guilds.map(guild => guild))
    for (const birthday of todayBirthdays) {
        for (const guild of botGuilds) {
            const usersOnGuild = await client.guilds.fetch(guild.id).then(guild => guild.members.fetch())
            const member = usersOnGuild.get(birthday.userId)
            if (member) {
                const guildConfig = await prisma.config.findFirst({
                    where: {
                        guildId: guild.id,
                        key: 'birthdayChannel'
                    }
                })
                if (guildConfig) {
                    const fullGuild = await client.guilds.fetch(guild.id)
                    const channel = fullGuild.channels.cache.get(guildConfig.value)
                    if (channel && channel.isTextBased()) {
                        const embed = new EmbedBuilder()
                            .setTitle("Joyeux anniversaire !")
                            .setDescription(`Joyeux anniversaire <@${birthday.userId}> (${birthday.birthDate ? new Date().getFullYear() - new Date(birthday.birthDate).getFullYear() : ''} ans) ! 🎉🎂`)
                            .setColor(0xffffff)
                            .setTimestamp()
                            .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: client.user?.displayAvatarURL() })
                        await channel.send({ embeds: [embed] })
                    } else {
                        logger.error(`Channel ${guildConfig.value} not found in guild ${guild.id}`)
                    }
                } else {
                    logger.error(`Channel not found in guild ${guild.id}`)
                }
            } else {
                logger.error(`Member ${birthday.userId} not found in guild ${guild.id}`)
            }
        }
    }
})
birthdayCron.start()

const possibleStatus: { name: string, type: ActivityType }[] = [
    { name: `le résultat des tests.`, type: ActivityType.Watching },
    { name: `vos demandes.`, type: ActivityType.Listening },
    { name: `votre aide.`, type: ActivityType.Competing },
    { name: `Aperture Science`, type: ActivityType.Watching },
]
const possibleHalloweenStatus: { name: string, type: ActivityType }[] = [
    { name: `la préparation des citrouilles. 🎃`, type: ActivityType.Competing },
    { name: `les fantômes... 👻`, type: ActivityType.Watching },
    { name: `Spooky Scary Skeletons`, type: ActivityType.Listening },
    { name: `les bonbons ou un sort ! 🍬`, type: ActivityType.Playing },
]
const possibleChristmasStatus: { name: string, type: ActivityType }[] = [
    { name: `l'emballage des cadeaux. 🎁`, type: ActivityType.Competing },
    { name: `les lutins. 🧝`, type: ActivityType.Watching },
    { name: `les chants de Noël`, type: ActivityType.Listening },
    { name: `le Père Noël. 🎅`, type: ActivityType.Playing },
]
let statusIndex = 0
const halloweenPeriod: { start: Date, end: Date } = {
    start: new Date(new Date().getFullYear(), 9, 24),
    end: new Date(new Date().getFullYear(), 10, 7)
}
const christmasPeriod: { start: Date, end: Date } = {
    start: new Date(new Date().getFullYear(), 11, 1),
    end: new Date(new Date().getFullYear(), 0, 1)
}

const areInPeriod = (period: { start: Date, end: Date }) => {
    const today = new Date()
    return today >= period.start && today <= period.end
}

/**
 * A CronJob that updates the bot's presence status every 10 seconds.
 * 
 * The status is determined based on the current period (e.g., Halloween, Christmas)
 * or a general status if no special period is active. If the bot is in maintenance mode,
 * it sets a specific maintenance status.
 * 
 * The statuses are cycled through from predefined lists of possible statuses.
 * 
 * @cron '0,10,20,30,40,50 * * * * *' - Runs every 10 seconds.
 * 
 * @async
 * @function
 * @returns {Promise<void>} - A promise that resolves when the presence is updated.
 */
const statusCron = new CronJob('0,10,20,30,40,50 * * * * *', async () => {
    if(maintenance) {
        await client.user?.setPresence({
            activities: [
                {
                    name: `la maintenance...`,
                    type: ActivityType.Competing
                }
            ]
        })
        return
    }
    let status: { name: string, type: ActivityType }
    if(areInPeriod(halloweenPeriod)) {
        status = possibleHalloweenStatus[statusIndex]
    } else if(areInPeriod(christmasPeriod)) {
        status = possibleChristmasStatus[statusIndex]
    } else {
        status = possibleStatus[statusIndex]
    }
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

process.on('SIGINT', async () => {
    logger.info('Ctrl-C détécté, déconnexion...')
    await prisma.$disconnect()
    await client.destroy()
    logger.info('Déconnecté, arrêt du bot...')
    process.exit(0)
})

initAi()

client.login(config.DISCORD_TOKEN)