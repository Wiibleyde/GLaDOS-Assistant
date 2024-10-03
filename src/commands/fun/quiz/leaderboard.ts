import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { prisma } from "@/utils/database"

export const data = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Affiche le classement du quiz")

export async function execute(interaction: CommandInteraction) {
    // Get the top 10 users with the best ratio
    const users = await prisma.globalUserData.findMany({
        select: {
            userId: true,
            quizGoodAnswers: true,
            quizBadAnswers: true
        }
    })

    // Sort the users by the ratio of good answers (and the most good answers)
    users.sort((a, b) => {
        const ratioA = a.quizGoodAnswers / (a.quizGoodAnswers + a.quizBadAnswers)
        const ratioB = b.quizGoodAnswers / (b.quizGoodAnswers + b.quizBadAnswers)
        return ratioB - ratioA
    })

    const embed = new EmbedBuilder()
        .setTitle("Classement du quiz")
        .setDescription("Top 10 des meilleurs joueurs du quiz")
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    users.forEach((user, index) => {
        embed.addFields({
            name: `#${index + 1} Ratio: ${(user.quizGoodAnswers / (user.quizGoodAnswers + user.quizBadAnswers) * 100).toFixed(2)}%`,
            value: `<@${user.userId}> Bonnes réponses: ${user.quizGoodAnswers} | Mauvaises réponses: ${user.quizBadAnswers}`
        })
    })

    await interaction.reply({ embeds: [embed], ephemeral: true })
}