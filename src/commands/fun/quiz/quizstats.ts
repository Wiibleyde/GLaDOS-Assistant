import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { prisma } from "@/utils/database"

export const data = new SlashCommandBuilder()
    .setName("quizstats")
    .setDescription("Affiche les statistiques du quiz")

export async function execute(interaction: CommandInteraction) {
    const userData = await prisma.globalUserData.findFirst({
        where: {
            userId: interaction.user.id
        }
    })
    if (!userData) {
        await interaction.reply({ content: "Vous n'avez pas encore joué au quiz", ephemeral: true })
        return
    }

    const nbQuestions = userData.quizGoodAnswers + userData.quizBadAnswers
    if (nbQuestions === 0) {
        await interaction.reply({ content: "Vous n'avez pas encore joué au quiz", ephemeral: true })
        return
    }
    const ratio = userData.quizGoodAnswers / nbQuestions * 100
    const embed = new EmbedBuilder()
        .setTitle("Statistiques du quiz")
        .setDescription(`Vous avez répondu à ${nbQuestions} questions.`)
        .addFields({
            name: "Bonnes réponses",
            value: `${userData.quizGoodAnswers}`,
            inline: true
        },
        {
            name: "Mauvaises réponses",
            value: `${userData.quizBadAnswers}`,
            inline: true
        },
        {
            name: "Ratio de bonnes réponses",
            value: `${ratio.toFixed(2)}%`,
            inline: true
        })
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });
    if (ratio < 50) {
        embed.setColor("#FF0000")
    } else if (ratio < 75) {
        embed.setColor("#FFA500")
    } else {
        embed.setColor("#00FF00")
    }

    await interaction.reply({ embeds: [embed], ephemeral: true })
}