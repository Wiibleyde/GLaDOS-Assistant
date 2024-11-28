import { errorEmbed, successEmbed } from "@/utils/embeds";
import { useQueue } from "discord-player";
import { ButtonInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("[Musique] Passer à la musique suivante")

export async function execute(interaction: CommandInteraction) {
    skip(interaction)
}

export function skipButton(interaction: ButtonInteraction) {
    skip(interaction)
}


async function skip(interaction:CommandInteraction|ButtonInteraction) {
    const queue = useQueue(interaction.guildId as string)

    if (!queue?.isPlaying()) return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Aucune musique n'est en cours de lecture."))], ephemeral: true })

    await queue.node.skip()

    await interaction.reply({ embeds: [successEmbed(interaction, "Musique suivante")], ephemeral: true })
}