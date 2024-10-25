import { CommandInteraction, SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { hasPermission } from "@/utils/permissionTester"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Renommer le bot")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Le nouveau nom du bot")
            .setRequired(false)
    )
    .setContexts([
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!await hasPermission(interaction, [PermissionFlagsBits.ManageChannels], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission de changer le nom du bot"))] })
        return
    }
    const newName = interaction.options.get("nom")?.value as string
    if (!newName || newName.length === 0) {
        interaction.guild?.members.cache.get(interaction.client.user.id)?.setNickname("")
        await interaction.editReply({ embeds: [successEmbed(interaction, `Le nom du bot a été réinitialisé`)] })
    } else if (newName.length > 32) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Le nom du bot ne doit pas dépasser 32 caractères"))] })
    } else if (newName === interaction.client.user.username) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Le nom du bot ne peut pas être le même que le nom actuel"))] })
    } else {
        interaction.guild?.members.cache.get(interaction.client.user.id)?.setNickname(newName)
        await interaction.editReply({ embeds: [successEmbed(interaction, `Le nom du bot a été changé en ${newName}`)] })
    }
}
