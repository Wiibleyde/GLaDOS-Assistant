import { PermissionUtils } from "@/utils/permissionTester"
import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js"
import { errorEmbed } from "@/utils/embeds"

export let maintenance: boolean = false

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("Passer le bot en mode maintenance")

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if(!await PermissionUtils.hasPermission(interaction, [PermissionFlagsBits.Administrator], true)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission d'utiliser cette commande."))] })
        return
    }
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
