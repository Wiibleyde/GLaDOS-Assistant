import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { prisma } from "@/utils/database"

export const data: SlashCommandBuilder = new SlashCommandBuilder()
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

    // Sort the users by the ratio of good answers (and take attention to the number of questions answered (to avoid a user with 1 good answer and 0 bad answer to be first))
    users.sort((a, b) => {
        return (b.quizGoodAnswers / (b.quizGoodAnswers + b.quizBadAnswers)) - (a.quizGoodAnswers / (a.quizGoodAnswers + a.quizBadAnswers))
    })
    users.splice(10)

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