import { prisma } from '@/utils/database';
import { ActionRowBuilder, ButtonInteraction, CacheType, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import { creatEmbedForRadio } from './createradio';

/**
 * Handles the interaction for changing the radio frequency.
 * 
 * This function is triggered when a user interacts with a button to change the radio frequency.
 * It retrieves the radio frequency details from the database using the provided UUID and displays
 * a modal for the user to input the new frequency.
 * 
 * @param interaction - The interaction object representing the button interaction.
 * @returns A promise that resolves when the interaction is handled.
 * 
 * @throws Will reply with an error message if the radio frequency does not exist.
 */
export async function changeRadio(interaction: ButtonInteraction<CacheType>): Promise<void> {
    const radioUuid = interaction.customId.split("--")[1]
    const radioFrequencies = await prisma.radioFrequencies.findFirst({
        where: {
            uuid: radioUuid
        }
    })
    if (!radioFrequencies) {
        await interaction.reply({ content: "La radio demandée n'existe pas.", ephemeral: true })
        return
    }

    const modal = new ModalBuilder()
        .setCustomId("changeRadioModal--" + radioFrequencies.uuid)
        .setTitle("Changer la fréquence de la radio " + radioFrequencies.name)

    const frequency = new TextInputBuilder()
        .setCustomId("frequency")
        .setPlaceholder("0.0")
        .setLabel("Fréquence")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(frequency)
    modal.addComponents(actionRow)

    await interaction.showModal(modal)
}

/**
 * Handles the submission of a modal to change the radio frequency.
 * 
 * @param interaction - The interaction object representing the modal submission.
 * @returns A promise that resolves when the radio frequency has been successfully changed and the user has been notified.
 * 
 * This function performs the following steps:
 * 1. Retrieves the new frequency from the modal input.
 * 2. Extracts the radio UUID from the custom ID of the interaction.
 * 3. Fetches the radio frequencies associated with the given UUID from the database.
 * 4. If the radio frequencies do not exist, replies to the interaction with an error message.
 * 5. Updates the radio frequency in the database.
 * 6. Fetches the radio data associated with the given UUID from the database, including related bot message data and radio frequencies.
 * 7. If the radio data does not exist, replies to the interaction with an error message.
 * 8. Fetches the channel associated with the radio from the client.
 * 9. If the channel does not exist, replies to the interaction with an error message.
 * 10. Creates an embed, action row, and files for the radio using the `creatEmbedForRadio` function.
 * 11. Fetches the message associated with the radio from the channel.
 * 12. Edits the message with the new embed, action row, and files.
 * 13. Replies to the interaction with a success message.
 */
export async function changeRadioModal(interaction: ModalSubmitInteraction) {
    const frequency = interaction.fields.getTextInputValue("frequency")
    const radioUuid = interaction.customId.split("--")[1]
    const radioFrequencies = await prisma.radioFrequencies.findFirst({
        where: {
            uuid: radioUuid
        }
    })
    if (!radioFrequencies) {
        await interaction.reply({ content: "La radio demandée n'existe pas.", ephemeral: true })
        return
    }

    await prisma.radioFrequencies.updateMany({
        where: {
            uuid: radioUuid
        },
        data: {
            frequency: frequency
        }
    })

    const radioData = await prisma.radioData.findFirst({
        where: {
            RadioFrequencies: {
                some: {
                    uuid: radioUuid
                }
            }
        },
        include: {
            botMessageData: true,
            RadioFrequencies: true
        }
    })

    if (!radioData) {
        await interaction.reply({ content: "La radio demandée n'existe pas.", ephemeral: true })
        return
    }

    const channel = await interaction.client.channels.fetch(radioData.botMessageData.channelId) as TextChannel
    if (!channel) {
        await interaction.reply({ content: "Le salon de la radio n'existe pas.", ephemeral: true })
        return
    }

    const { embed, actionRow, files } = creatEmbedForRadio(interaction, radioData.displayName, radioData.RadioFrequencies)

    const message = await channel.messages.fetch(radioData.botMessageData.messageId)

    await message.edit({ embeds: [embed], components: [actionRow], files: files })

    await interaction.reply({ content: "Fréquence de la radio changée avec succès !", ephemeral: true })
}
