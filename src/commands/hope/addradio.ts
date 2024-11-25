import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, CommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { prisma } from "@/utils/database"
import { creatEmbedForRadio } from "./createradio"
import { hasPermission } from "@/utils/permissionTester"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("addradio")
    .setDescription("Ajouter une radio")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Nom de la radio")
            .setRequired(true)
    )

/**
 * Executes the command to add a radio frequency to the server's radio configuration.
 * 
 * @param interaction - The command interaction object.
 * 
 * @remarks
 * This function performs the following steps:
 * 1. Defers the reply to the interaction.
 * 2. Checks if the user has the necessary permissions.
 * 3. Retrieves the guild ID and radio name from the interaction options.
 * 4. Checks if a radio configuration already exists for the guild.
 * 5. Validates if a radio with the same name or frequency already exists.
 * 6. Updates the radio configuration with the new frequency.
 * 7. Fetches the updated radio configuration and updates the corresponding message in the channel.
 * 8. Sends a success or error message based on the outcome.
 * 
 * @throws Will throw an error if the user does not have the required permissions.
 * @throws Will throw an error if a radio with the same name or frequency already exists.
 * @throws Will throw an error if the radio configuration or the channel cannot be found.
 */
export async function execute(interaction: CommandInteraction) {
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
    if (isRadioExist) {
        const existingRadio = await prisma.radioFrequencies.findFirst({
            where: {
                radioDataUuid: isRadioExist.uuid,
                name: radioName
            }
        })
        if (existingRadio) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Une radio avec ce nom existe déjà."))] })
            return
        }

        const existingFrequency = await prisma.radioFrequencies.findFirst({
            where: {
                radioDataUuid: isRadioExist.uuid,
                frequency: "0.0"
            }
        })
        if (existingFrequency) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Une radio avec cette fréquence existe déjà."))] })
            return
        }

        await prisma.radioData.update({
            where: {
                uuid: isRadioExist.uuid
            },
            data: {
                RadioFrequencies: {
                    create: {
                        frequency: "0.0",
                        name: radioName
                    }
                }
            }
        })

        const updatedRadio = await prisma.radioData.findFirst({
            where: {
                uuid: isRadioExist.uuid
            },
            select: {
                botMessageData: true,
                RadioFrequencies: true,
                displayName: true
            }
        })
        if (!updatedRadio) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver la radio sur ce serveur"))] })
            return
        }

        const channel = await interaction.client.channels.fetch(isRadioExist.botMessageData.channelId) as TextChannel
        if (!channel) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver le salon de discussion"))] })
            return
        }

        const { embed, actionRow, files } = creatEmbedForRadio(interaction, updatedRadio.displayName, updatedRadio.RadioFrequencies)

        const message = await channel.messages.fetch(isRadioExist.botMessageData.messageId)

        await message.edit({ embeds: [embed], components: [actionRow], files: files })

        await interaction.editReply({ embeds: [successEmbed(interaction, "La radio a été ajoutée")] })
    } else {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver la radio sur ce serveur"))] })
    }
}