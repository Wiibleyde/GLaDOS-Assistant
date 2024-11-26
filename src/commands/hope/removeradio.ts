import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, CommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { prisma } from "@/utils/database"
import { creatEmbedForRadio } from "./createradio"
import { hasPermission } from "@/utils/permissionTester"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("removeradio")
    .setDescription("Supprimer une radio")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Nom de la radio")
            .setRequired(true)
    )

/**
 * Executes the command to remove a radio from the configuration.
 * 
 * @param interaction - The command interaction object.
 * @returns A promise that resolves when the command execution is complete.
 * 
 * @remarks
 * This function performs the following steps:
 * 1. Defers the reply to the interaction.
 * 2. Checks if the user has the necessary permissions.
 * 3. Retrieves the radio data from the database.
 * 4. Checks if the specified radio exists.
 * 5. Deletes the radio frequency from the database.
 * 6. Updates the radio data and the corresponding message in the channel.
 * 7. Sends a success message to the user.
 * 
 * If any step fails, an error message is sent to the user.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!await hasPermission(interaction, [PermissionFlagsBits.Administrator], false)) {
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

    const { embed, actionRow, files } = creatEmbedForRadio(interaction, newRadioData.displayName, newRadioData.RadioFrequencies)

    const message = await channel.messages.fetch(newRadioData.botMessageData.messageId)

    await message.edit({ embeds: [embed], components: [actionRow], files: files })

    await interaction.editReply({ embeds: [successEmbed(interaction, "La radio a été supprimée")] })
}