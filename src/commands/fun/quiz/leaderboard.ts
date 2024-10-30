import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { client } from "@/index"

/**
 * Defines the slash command options for the "leaderboard" command.
 * This command displays the quiz leaderboard.
 * 
 * Command options:
 * - `type` (required): Specifies the type of leaderboard to display.
 *   - `ratio`: Leaderboard based on the ratio of correct answers.
 *   - `good`: Leaderboard based on the number of correct answers.
 *   - `bad`: Leaderboard based on the number of incorrect answers.
 */
export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Affiche le classement du quiz")
    .addStringOption(option =>
        option.setName("type")
            .setDescription("Type de classement")
            .setRequired(true)
            .addChoices({
                name: "Ratio",
                value: "ratio"
            },
            {
                name: "Bonnes réponses",
                value: "good"
            },
            {
                name: "Mauvaises réponses",
                value: "bad"
            }
        )
    )

/**
 * Executes the leaderboard command, which retrieves and displays the top 10 users
 * with the best quiz performance based on the specified type (ratio, good answers, or bad answers).
 *
 * @param {CommandInteraction} interaction - The interaction object representing the command invocation.
 * @returns {Promise<void>} A promise that resolves when the leaderboard has been sent as a reply.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    // Get the top 10 users with the best ratio
    const users = await prisma.globalUserData.findMany({
        select: {
            userId: true,
            quizGoodAnswers: true,
            quizBadAnswers: true
        }
    })

    users.filter(user => user.quizGoodAnswers + user.quizBadAnswers > 0)
    users.filter(user => user.userId !== client.user?.id)

    const type = interaction.options.get("type")?.value as string
    switch (type) {
        case "ratio":
            users.sort((a, b) => {
                return (b.quizGoodAnswers / (b.quizGoodAnswers + b.quizBadAnswers)) - (a.quizGoodAnswers / (a.quizGoodAnswers + a.quizBadAnswers))
            })
            break
        case "good":
            users.sort((a, b) => {
                return b.quizGoodAnswers - a.quizGoodAnswers
            })
            break
        case "bad":
            users.sort((a, b) => {
                return b.quizBadAnswers - a.quizBadAnswers
            })
            break
    }
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