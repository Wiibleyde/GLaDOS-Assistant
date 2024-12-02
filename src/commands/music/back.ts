import { errorEmbed, successEmbed } from "@/utils/embeds";
import { useQueue } from "discord-player";
import { ButtonInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("back")
    .setDescription("[Musique] Revenir à la musique précédente")

export async function execute(interaction: CommandInteraction) {
    back(interaction)
}

export function backButton(interaction: ButtonInteraction) {
    back(interaction)
}

async function back(interaction: CommandInteraction|ButtonInteraction) {
    const queue = useQueue(interaction.guildId as string)

    if (!queue?.isPlaying()) return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Aucune musique n'est en cours de lecture."))], ephemeral: true })

    if (!queue.history.previousTrack) return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Il n'y a pas de musique précédente."))], ephemeral: true })

    await queue.history.back()

    await interaction.reply({ embeds: [successEmbed(interaction, "Musique précédente")] })
}
