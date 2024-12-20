import { errorEmbed, successEmbed } from "@/utils/embeds";
import { useQueue } from "discord-player";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("pause")
    .setDescription("[Musique] Mettre en pause la musique")

export async function execute(interaction: CommandInteraction) {
    const queue = useQueue(interaction.guildId as string)

    if (!queue?.isPlaying()) return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Aucune musique n'est en cours de lecture."))], ephemeral: true })

    if (queue.node.isPaused()) return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Impossible de mettre en pause la musique."))], ephemeral: true })

    const success = queue.node.setPaused(true)

    if (!success) return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Impossible de mettre en pause la musique."))], ephemeral: true })

    await interaction.reply({ embeds: [successEmbed(interaction, "Musique mise en pause")], ephemeral: true })
}
