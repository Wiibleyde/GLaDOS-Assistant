import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { logger } from "@/utils/logger"

export const data = new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Afficher les derniers logs du bot")

export async function execute(interaction: CommandInteraction) {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })

}

