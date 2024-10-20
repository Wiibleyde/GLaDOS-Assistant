import { CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { successEmbed, errorEmbed } from "@/utils/embeds"
import { logger } from "@/index"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("addquestion")
    .setDescription("Permet d'ajouter une question au quiz")
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
            .setName("bad1")
            .setDescription("Mauvaise réponse 1")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("bad2")
            .setDescription("Mauvaise réponse 2")
            .setRequired(true)
        )
    .addStringOption(option =>
        option
            .setName("bad3")
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
            .addChoices({
                name: "Facile",
                value: "facile"
            }, {
                name: "Normal",
                value: "normal"
            }, {
                name: "Difficile",
                value: "difficile"
            })
            .setRequired(true)
        )

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true })
    const question = interaction.options.get("question")?.value as string
    const answer = interaction.options.get("answer")?.value as string
    const badAnswer1 = interaction.options.get("bad1")?.value as string
    const badAnswer2 = interaction.options.get("bad2")?.value as string
    const badAnswer3 = interaction.options.get("bad3")?.value as string
    const category = interaction.options.get("category")?.value as string
    const difficulty = interaction.options.get("difficulty")?.value as string

    const guildId = interaction.guildId
    if (!guildId) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de récupérer l'ID du serveur."))] })
        return
    }

    const userId = interaction.user.id
    if (!userId) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de récupérer l'ID de l'utilisateur."))] })
        return
    }

    try {
        await prisma.quizQuestions.create({
            data: {
                question,
                answer,
                badAnswer1,
                badAnswer2,
                badAnswer3,
                category,
                difficulty,
                guildId: guildId,
                author: {
                    connectOrCreate: {
                        where: {
                            userId: userId
                        },
                        create: {
                            userId: userId
                        }
                    }
                }
            }
        })
    } catch (error) {
        if ((error as any).code === "P2002") {
            return await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Cette question existe déjà *(Si vous souhaitez la supprimer, contactez un administrateur de GLaDOS)*."))] })
        }
        logger.error(`Erreur lors de l'ajout de la question : ${error}`)
        return await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de l'ajout de la question."))] })
    }

    await interaction.editReply({ embeds: [successEmbed(interaction, "Question ajoutée avec succès !")] })
}
