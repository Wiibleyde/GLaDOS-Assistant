import { CommandInteraction, SlashCommandBuilder, TextBasedChannel } from "discord.js"
import Jimp from "jimp"
import { prisma } from "@/utils/database"
import { successEmbed, errorEmbed } from "@/utils/embeds"

const background = "assets/img/quote.png"
const smoke = "assets/img/smoke.png"
const fontPath = "assets/fonts/Ubuntu.fnt"

export const data = new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Créer une citation")
    .addStringOption(option =>
        option
            .setName("citation")
            .setDescription("La citation")
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName("auteur")
            .setDescription("L'auteur de la citation")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("contexte")
            .setDescription("[Optionnel] Le contexte de la citation")
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName("date")
            .setDescription("[Optionnel] La date de la citation")
            .setRequired(false)
    )

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const quote = interaction.options.get("citation")?.value as string
    const author = interaction.options.get("auteur")?.user
    const context = interaction.options.get("contexte")?.value as string
    const date = interaction.options.get("date")?.value as string || new Date().toLocaleDateString()
    let channelWhereToPost = null
    if (interaction.guildId != null) {
        channelWhereToPost = await prisma.config.findFirst({
            where: {
                guildId: interaction.guildId,
                key: "quoteChannel"
            }
        })
    }
    let channel: TextBasedChannel
    if (channelWhereToPost) {
        channel = interaction.guild?.channels.cache.get(channelWhereToPost.value) as TextBasedChannel
    } else {
        channel = interaction.channel as TextBasedChannel
    }

    const userProfilePicture = author?.displayAvatarURL({ extension: "png", size: 1024 })

    const image = await Jimp.read(background)
    const jimpQuoteFont = await Jimp.loadFont(fontPath)
    const otherThingsFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    const contextFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

    if (userProfilePicture) {
        const maxPictureHeight = image.bitmap.height - 18
        const profilePicture = await Jimp.read(userProfilePicture)
        profilePicture.opacity(0.3)
        image.composite(profilePicture.resize(Jimp.AUTO, maxPictureHeight), 11, 9)
    }

    if(!author) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("L'auteur de la citation n'a pas été trouvé"))] })
        return
    }

    await prisma.quote.create({
        data: {
            quote: quote,
            author: {
                connectOrCreate: {
                    where: {
                        userId: author?.id
                    },
                    create: {
                        userId: author?.id,
                    }
                }
            },
            context: context,
            guildId: interaction.guildId ?? "0",
            createdAt: interaction.options.get("date")?.value as string || new Date().toISOString()
        }
    })

    const smokeImage = await Jimp.read(smoke)
    image.composite(smokeImage.resize(image.bitmap.width, Jimp.AUTO), 0, image.bitmap.height - smokeImage.bitmap.height)

    const maxQuoteWidth = image.bitmap.width - 550
    const quoteYPosition = (image.bitmap.height - Jimp.measureTextHeight(jimpQuoteFont, quote, maxQuoteWidth)) / 2
    image.print(jimpQuoteFont, 350, quoteYPosition, '"' + quote + '"', maxQuoteWidth)
    if(context) {
        const maxContextWidth = image.bitmap.width - 550
        const contextYPosition = quoteYPosition + Jimp.measureTextHeight(jimpQuoteFont, '"' + quote + '"', maxQuoteWidth) + 20
        image.print(contextFont, 350, contextYPosition, context, maxContextWidth)
    }
    const authorXPosition = image.bitmap.width - 40 - Jimp.measureText(otherThingsFont, "@"+author?.displayName + " - " + date || "Anonyme - " + date)
    image.print(otherThingsFont, authorXPosition, 360, "@"+author?.displayName + " - " + date || "Anonyme - " + date)

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

    const messageSent = await channel.send({ files: [buffer], content: `"${quote}" - ${author?.toString() ?? "Anonyme"} - ${date} ${context ? `\n${context}` : ""}` })
    await interaction.editReply({ embeds: [successEmbed(interaction, `Citation créée et envoyée ${messageSent.url}`)] })
}