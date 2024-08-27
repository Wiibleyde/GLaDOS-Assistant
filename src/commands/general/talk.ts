import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"

export const data = new SlashCommandBuilder()
    .setName("talk")
    .setDescription("Parler avec en utilisant bot")
    .addStringOption(option =>
        option
            .setName("message")
            .setDescription("Le message à envoyer")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("mp")
            .setDescription("ID de la personne")
            .setRequired(false)
    )

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const message = interaction.options.get("message")?.value as string
    const member = interaction.options.get("mp")?.value as string

    if (member) {
        const user = await interaction.client.users.fetch(member)
        if (!user) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver l'utilisateur"))] })
            return
        }
        await user.send(message)
    } else {
        const channel = interaction.channel
        if (!channel) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver le salon de discussion"))] })
            return
        }
        await channel.send(message)
    }
    await interaction.editReply({ embeds: [successEmbed(interaction, "Message envoyé")] })
}