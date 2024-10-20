import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, CommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { PermissionUtils } from "@/utils/permissionTester"
import { prisma } from "@/utils/database"
import { creatEmbedForRadio } from "./createradio"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("removeradio")
    .setDescription("Supprimer une radio")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Nom de la radio")
            .setRequired(true)
    )

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!await PermissionUtils.hasPermission(interaction, [PermissionFlagsBits.Administrator], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission de changer la configuration."))] })
        return
    }
    const guildId = interaction.guildId as string
    const radioName = interaction.options.get("nom")?.value as string
    const isRadioExist = await prisma.radioData.findFirst({
        where: {
            botMessageData: {
                guildId: guildId
            }
        },
        select: {
            botMessageData: true,
            RadioFrequencies: true,
            uuid: true,
            displayName: true
        }
    })
    if(!isRadioExist) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("La radio n'existe pas."))] })
        return
    }
    const radio = isRadioExist.RadioFrequencies.find(radio => radio.name === radioName)
    if(!radio) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("La radio n'existe pas."))] })
        return
    }
    await prisma.radioFrequencies.delete({
        where: {
            frequency_radioDataUuid: {
                frequency: radio.frequency,
                radioDataUuid: radio.radioDataUuid
            }
        }
    })

    const newRadioData = await prisma.radioData.findFirst({
        where: {
            uuid: isRadioExist.uuid
        },
        select: {
            botMessageData: true,
            RadioFrequencies: true,
            uuid: true,
            displayName: true
        }
    })
    if(!newRadioData) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("La radio n'existe pas."))] })
        return
    }

    const channel = await interaction.client.channels.fetch(newRadioData.botMessageData.channelId) as TextChannel
    if (!channel) {
        await interaction.reply({ content: "Le salon de la radio n'existe pas.", ephemeral: true })
        return
    }

    const { embed, actionRow } = creatEmbedForRadio(interaction, newRadioData.displayName, newRadioData.RadioFrequencies)

    const message = await channel.messages.fetch(newRadioData.botMessageData.messageId)

    await message.edit({ embeds: [embed], components: [actionRow] })

    await interaction.editReply({ embeds: [successEmbed(interaction, "La radio a été supprimée")] })
}