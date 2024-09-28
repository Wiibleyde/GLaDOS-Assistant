import { ActivityType, Client, EmbedBuilder, Events, GatewayIntentBits, Partials, MessageType } from "discord.js"
import { deployCommands, deployDevCommands } from "./deploy-commands"
import { errorEmbed } from "./utils/embeds"
import { config } from "./config"
import { buttons, commands, devCommands, modals } from "./commands"
import { logger } from "./utils/logger"
import { CronJob } from 'cron'
import { prisma } from "./utils/database"
import { insertQuestionInDB } from "./commands/fun/quiz/quiz"
import { initAi, generateWithGoogle } from "./utils/intelligence"

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
            const { commandName } = interaction
            if (commands[commandName as keyof typeof commands]) {
                commands[commandName as keyof typeof commands].execute(interaction)
            }
            if (devCommands[commandName as keyof typeof devCommands]) {
                devCommands[commandName as keyof typeof devCommands].execute(interaction)
            }
            logger.info(`Commande </${commandName}:${interaction.commandId}>\n<@${interaction.user.id}> (${interaction.user.username}) dans <#${interaction.channelId}>`)
        } catch (error: Error | any) {
            logger.error(`Erreur commande : </${interaction.commandName}:${interaction.commandId}>\n<@${interaction.user.id}> (${interaction.user.username}) dans <#${interaction.channelId}> : ${error.message}`)
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
    if (!guildId) {
        logger.debug(`Message reçu en DM de <@${message.author.id}> : ${message.content}`)
        return
    }

    const channelId = message?.channel?.id
    if(!channelId) {
        logger.error(`Channel non trouvé pour le message de <@${message.author.id}> dans le serveur ${guildId}`)
        return
    }

    if (message.mentions.has(client.user?.id as string)) {
        // if(message.type === MessageType.Reply) {
        //     const contentOfReply = message.reference?.messageId ? await message.channel.messages.fetch(message.reference.messageId).then(msg => msg.content) : ''
        //     message.content = contentOfReply + message.content
        // }
        const aiReponse = await generateWithGoogle(channelId, message.content.replace(`<@${client.user?.id}> `, ''), message.author.id).catch(async (error) => {
            await message.channel.send(`Je ne suis pas en mesure de répondre à cette question pour le moment. ||(${error.message})||`)
            return
        }).then(async (response) => {
            return response
        })

        if (!aiReponse) return

        await message.channel.send(`${aiReponse}`)

        logger.info(`Réponse de l'IA à <@${message.author.id}> dans <#${channelId}> : ${aiReponse}`)
    }
})

// Cron job to wish happy birthday to users at 00:00 : 0 0 0 * * *, for the dev use every 10 seconds : '0,10,20,30,40,50 * * * * *'
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

process.on('SIGINT', async () => {
    logger.info('Ctrl-C détécté, déconnexion...')
    await prisma.$disconnect()
    await client.destroy()
    logger.info('Déconnecté, arrêt du bot...')
    process.exit(0)
})

initAi()

client.login(config.DISCORD_TOKEN)