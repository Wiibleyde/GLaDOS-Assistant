import { prisma } from "@/utils/database";
import { SlashCommandOptionsOnlyBuilder, SlashCommandBuilder, CommandInteraction, EmbedBuilder, TextChannel, ButtonBuilder, ButtonStyle } from "discord.js";


export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("createRadio")
    .setDescription("Créer un message pour la radio")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Nom du service")
            .setRequired(true)
    )

export async function execute(interaction: CommandInteraction) {
    const guildId = interaction.guildId as string
    const serviceName = interaction.options.get("nom")?.value as string
    const isRadioExist = await prisma.radioData.findFirst({
        where: {
            botMessageData: {
                guildId: guildId
            }
        }
    })
    if (!isRadioExist) {
        const channel = interaction.channel as TextChannel
        const embed = new EmbedBuilder()
            .setTitle(`Radio de ${serviceName}`)
            .setDescription("Voici les radios disponibles")
            .setColor("Aqua")
            .setTimestamp()
            .setFooter({ text: "Radio" })

        const message = await channel.send({ embeds: [embed] })

        await prisma.radioData.create({
            data: {
                internalName: formatInternalName(serviceName),
                displayName: serviceName,
                RadioFrequencies: {
                    createMany: {
                        data: [
                            {
                                frequency: "0.0",
                            }
                        ]
                    }
                },
                botMessageData: {
                    create: {
                        guildId: guildId,
                        messageId: message.id,
                        channelId: channel.id
                    }
                }
            }
        })
    }
}

function formatInternalName(serviceName: string) {
    return serviceName.toLowerCase().replace(" ", "_")
}

/**
 * Radio
 * Effectif
 * Dossier formation
 */