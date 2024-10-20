import { prisma } from '@/utils/database';
import { ActionRowBuilder, ButtonInteraction, CacheType, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import { creatEmbedForRadio } from './createradio';

export async function changeRadio(interaction: ButtonInteraction<CacheType>) {
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

    const { embed, actionRow } = creatEmbedForRadio(interaction, radioData.displayName, radioData.RadioFrequencies)

    const message = await channel.messages.fetch(radioData.botMessageData.messageId)

    await message.edit({ embeds: [embed], components: [actionRow] })

    await interaction.reply({ content: "Fréquence de la radio changée avec succès !", ephemeral: true })
}
