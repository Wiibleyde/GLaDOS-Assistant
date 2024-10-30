import { prisma } from "@/utils/database";
import { errorEmbed, successEmbed } from "@/utils/embeds";
import { hasPermission } from "@/utils/permissionTester";
import { RadioFrequencies } from "@prisma/client";
import { SlashCommandOptionsOnlyBuilder, SlashCommandBuilder, CommandInteraction, EmbedBuilder, TextChannel, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, ButtonInteraction, ModalSubmitInteraction, APIEmbedField } from "discord.js";

export const radioImage = "./assets/img/radio.png"

/**
 * Slash command configuration for creating a radio message.
 * 
 * This command allows users to create a message for the radio service.
 * 
 * @constant
 * @type {SlashCommandOptionsOnlyBuilder}
 * 
 * @property {string} name - The name of the command, set to "createradio".
 * @property {string} description - A brief description of the command.
 * @property {SlashCommandStringOption} options - The options for the command.
 * @property {string} options.nom - The name of the service, required.
 */
export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("createradio")
    .setDescription("Créer un message pour la radio")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Nom du service")
            .setRequired(true)
    )

/**
 * Executes the command to create or update a radio configuration.
 *
 * @param interaction - The command interaction object.
 * @returns A promise that resolves to void.
 *
 * This function performs the following steps:
 * 1. Checks if the user has the required permissions.
 * 2. Retrieves the guild ID and service name from the interaction options.
 * 3. Checks if a radio configuration already exists for the guild.
 * 4. If the radio configuration does not exist, it creates a new one and sends a message to the channel.
 * 5. If the radio configuration exists, it updates the existing message in the channel.
 * 6. Sends a success reply to the interaction.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    if (!await hasPermission(interaction, [PermissionFlagsBits.Administrator], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission de changer la configuration."))] })
        return
    }
    const guildId = interaction.guildId as string
    const serviceName = interaction.options.get("nom")?.value as string
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
        } else { /* empty */ }
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