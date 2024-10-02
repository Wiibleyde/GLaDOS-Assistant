import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js"

export let maintenance: boolean = false

export const data = new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("Passer le bot en mode maintenance")

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    maintenance = !maintenance
    let color: number = maintenance ? 0xff0000 : 0x00ff00
    const embed = new EmbedBuilder()
        .setTitle("Maintenance")
        .setDescription(`Le bot est maintenant en mode ${maintenance ? "maintenance" : "normal"}`)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.editReply({ embeds: [embed] })
}
