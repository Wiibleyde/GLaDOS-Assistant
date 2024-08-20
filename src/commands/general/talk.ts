import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { errorEmbed, successEmbed } from "../../utils/embeds"

export const data = new SlashCommandBuilder()
    .setName("talk")
    .setDescription("Parler avec le bot")
    .addStringOption(option => 
        option
            .setName("message")
            .setDescription("Le message à envoyer")
            .setRequired(true)
        )

export async function execute(interaction: CommandInteraction) {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const channel = interaction.channel
    const message = interaction.options.get("message")?.value as string

    if (!channel) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver le salon de discussion"))] })
        return
    }
    await channel.send(message)
    await interaction.editReply({ embeds: [successEmbed(interaction, "Message envoyé")] })
}