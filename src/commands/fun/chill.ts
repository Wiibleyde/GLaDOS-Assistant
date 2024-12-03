import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";


export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("chill")
    .setDescription("Affiche un gif du mec chill");

export async function execute(interaction: CommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
        .setTitle("Chill")
        .setDescription("Gif du mec chill")
        .setImage("https://tenor.com/view/chill-guy-my-new-character-gif-2777893510283028272")

    await interaction.reply({ embeds: [embed], ephemeral: false })
}