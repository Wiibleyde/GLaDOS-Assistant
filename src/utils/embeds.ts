import { EmbedBuilder, CommandInteraction } from "discord.js"

export function errorEmbed(interaction: CommandInteraction, error: Error): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("Erreur :warning:")
        .setDescription(error.message)
        .setColor(0xFF0000)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })
}

export function successEmbed(interaction: CommandInteraction, message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("Succès !")
        .setDescription(message)
        .setColor(0x00FF00)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })
}