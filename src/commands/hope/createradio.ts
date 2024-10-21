import { logger } from "@/index";
import { prisma } from "@/utils/database";
import { errorEmbed, successEmbed } from "@/utils/embeds";
import { PermissionUtils } from "@/utils/permissionTester";
import { RadioFrequencies } from "@prisma/client";
import { SlashCommandOptionsOnlyBuilder, SlashCommandBuilder, CommandInteraction, EmbedBuilder, TextChannel, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, ButtonInteraction, ModalSubmitInteraction, APIEmbedField } from "discord.js";

export const radioImage = "./assets/img/radio.png"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("createradio")
    .setDescription("Créer un message pour la radio")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Nom du service")
            .setRequired(true)
    )

export async function execute(interaction: CommandInteraction) {
    if (!await PermissionUtils.hasPermission(interaction, [PermissionFlagsBits.Administrator], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission de changer la configuration."))] })
        return
    }
    const guildId = interaction.guildId as string
    const serviceName = interaction.options.get("nom")?.value as string
    logger.debug(`Prisma: ${prisma}`)
    const isRadioExist = await prisma.radioData.findFirst({
        where: {
            botMessageData: {
                guildId: guildId
            }
        },
        select: {
            botMessageData: true,
            RadioFrequencies: true,
            uuid: true
        }
    })
    if (!isRadioExist) {
        const radioData = await prisma.radioData.create({
            data: {
                internalName: formatInternalName(serviceName),
                displayName: serviceName,
                RadioFrequencies: {
                    createMany: {
                        data: [
                            {
                                frequency: "0.0",
                                name: serviceName
                            }
                        ]
                    }
                },
                botMessageData: {
                    create: {
                        guildId: guildId,
                        messageId: "",
                        channelId: ""
                    }
                }
            },
            include: {
                RadioFrequencies: true
            }
        })

        const channel = interaction.channel as TextChannel

        const { embed, actionRow, files } = creatEmbedForRadio(interaction, serviceName, radioData.RadioFrequencies)

        const message = await channel.send({ embeds: [embed], components: [actionRow], files: files })

        await prisma.radioData.update({
            where: {
                uuid: radioData.uuid
            },
            data: {
                botMessageData: {
                    update: {
                        messageId: message.id,
                        channelId: channel.id
                    }
                }
            }
        })

        await interaction.reply({ embeds: [successEmbed(interaction, `La radio du ${serviceName} a été créée avec succès !`)], ephemeral: true })
    } else {
        const channel = await interaction.guild?.channels.fetch(isRadioExist.botMessageData.channelId);
        if (channel && channel.isTextBased()) {
            const oldMessage = await channel.messages.fetch(isRadioExist.botMessageData.messageId);
            if (oldMessage) {
                await oldMessage.delete();
                const newChannel = interaction.channel as TextChannel
                const { embed, actionRow, files } = creatEmbedForRadio(interaction, serviceName, isRadioExist.RadioFrequencies)

                const message = await newChannel.send({ embeds: [embed], components: [actionRow], files: files })

                await prisma.radioData.update({
                    where: {
                        uuid: isRadioExist.uuid
                    },
                    data: {
                        botMessageData: {
                            update: {
                                messageId: message.id,
                                channelId: channel.id
                            }
                        }
                    }
                })

                await interaction.reply({ embeds: [successEmbed(interaction, `La radio du ${serviceName} a été mise à jour avec succès !`)], ephemeral: true })
            }
        } else {
        }
    }
}

function formatInternalName(serviceName: string) {
    return serviceName.toLowerCase().replace(" ", "_")
}

function createFieldsForRadios(radios: RadioFrequencies[]): Array<APIEmbedField> {
    return radios.map(radio => {
        return {
            name: `Radio ${radio.name}`,
            value: `Fréquence : ${radio.frequency}`,
            inline: true
        }
    })
}

function createButtonsForRadios(radios: RadioFrequencies[]): Array<ButtonBuilder> {
    return radios.map((radio) => {
        return new ButtonBuilder().setCustomId(`changeRadio--${radio.uuid}`).setLabel(`Changer la radio ${radio.name}`).setStyle(ButtonStyle.Primary)
    })
}

export function creatEmbedForRadio(interaction: CommandInteraction|ButtonInteraction|ModalSubmitInteraction, name: string, radio: RadioFrequencies[]): { embed: EmbedBuilder, actionRow: ActionRowBuilder<ButtonBuilder>, files?:  { attachment: string, name: string }[] } {
    const embed = new EmbedBuilder()
        .setTitle(`Radio du ${name}`)
        .setDescription('Voici les radios disponibles')
        .setColor("Aqua")
        .setTimestamp()
        .setThumbnail("attachment://radio.png")
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    const fields: APIEmbedField[] = createFieldsForRadios(radio)
    embed.addFields(fields)

    const buttons = createButtonsForRadios(radio)

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)

    const files = [{ attachment: radioImage, name: "radio.png" }]

    return { embed, actionRow, files }
}

/** Trucs à faire pour Hope :
 * Effectif
 * Dossier formation
 */