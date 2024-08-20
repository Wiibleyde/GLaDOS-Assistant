import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Informations sur le bot")

export async function execute(interaction: CommandInteraction) {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })

    const infoEmbed: EmbedBuilder = new EmbedBuilder()
        .setTitle("GLaDOS Assistant")
        .setDescription(`Je suis un bot Discord créé par [Wiibleyde](https://github.com/Wiibleyde) pour vous aider dans votre quotidien.`)
        .addFields(
            { name: "Version", value: "1.0.0", inline: true },
            { name: "Langage", value: "TypeScript", inline: true },
            { name: "Bibliothèque", value: "discord.js", inline: true },
            { name: "Dépôt GitHub", value: "[Cliquez ici](https://github.com/Wiibleyde/GLaDOS-Assistant)", inline: true },
        )
        .setTimestamp()
        .setColor(0xFFFFFF)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

    await interaction.editReply({ embeds: [infoEmbed] });
}
