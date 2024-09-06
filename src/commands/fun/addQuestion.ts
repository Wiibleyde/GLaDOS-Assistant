import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { successEmbed, errorEmbed } from "@/utils/embeds"

export const data = new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Affiche une question de quiz aléatoire")
    .addStringOption(option =>
        option
            .setName("question")
            .setDescription("La question du quiz")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("answer")
            .setDescription("La réponse de la question")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("badAnswer1")
            .setDescription("Mauvaise réponse 1")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("badAnswer2")
            .setDescription("Mauvaise réponse 2")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("badAnswer3")
            .setDescription("Mauvaise réponse 3")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("category")
            .setDescription("La catégorie du quiz")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("difficulty")
            .setDescription("La difficulté du quiz")
            .setRequired(true)
        )

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true })
    const question = interaction.options.get("question")?.value as string
    const answer = interaction.options.get("answer")?.value as string
    const badAnswer1 = interaction.options.get("badAnswer1")?.value as string
    const badAnswer2 = interaction.options.get("badAnswer2")?.value as string
    const badAnswer3 = interaction.options.get("badAnswer3")?.value as string
    const category = interaction.options.get("category")?.value as string
    const difficulty = interaction.options.get("difficulty")?.value as string

    const guildId = interaction.guildId
    if (!guildId) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de récupérer l'ID du serveur."))] })
        return
    }

    await prisma.quizQuestions.create({
        data: {
            question,
            answer,
            badAnswer1,
            badAnswer2,
            badAnswer3,
            category,
            difficulty,
            guildId: guildId
        }
    })

    await interaction.editReply({ embeds: [successEmbed(interaction, "Question ajoutée avec succès !")] })
}
