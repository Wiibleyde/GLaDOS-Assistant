import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { prisma } from "@/utils/database"

export const data = new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Afficher les derniers logs du bot")

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const logs = await prisma.logs.findMany({
        take: 5,
        orderBy: {
            createdAt: "desc"
        },
        include: {
            level: true
        }
    })

    const embed = new EmbedBuilder()
        .setTitle("Logs")
        .setDescription("Les derniers logs du bot")
        .setColor(0xffffff)
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    logs.forEach(log => {
        embed.addFields(
            { name: `Niveau: ${log.level.name}`, value: log.message, inline: false },
        )
    })

    await interaction.editReply({ embeds: [embed]})
}

