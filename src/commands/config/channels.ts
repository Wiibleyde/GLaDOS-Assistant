import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { backSpace } from "@/utils/textUtils"
import { PermissionUtils } from "@/utils/permissionTester"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("channels")
    .setDescription("Configurer les salons")
    .addStringOption(option =>
        option
            .setName("action")
            .setDescription("L'action à effectuer")
            .addChoices({
                name: "Voir la configuration",
                value: "view"
            }, {
                name: "Modifier la configuration",
                value: "edit"
            })
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("key")
            .setDescription("Clé de configuration")
            .setRequired(false)
            .addChoices({
                name: "Salon des anniversaires",
                value: "birthdayChannel"
            }, {
                name: "Salon des citations",
                value: "quoteChannel"
            })
    )
    .addChannelOption(option =>
        option
            .setName("channel")
            .setDescription("Salon")
            .setRequired(false)
    )
    .setContexts([
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const user = interaction.guild?.members.cache.get(interaction.client.user.id)
    if (!await PermissionUtils.hasPermission(interaction, [PermissionFlagsBits.ManageChannels], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission de changer la configuration."))] })
        return
    }
    switch (interaction.options.get("action")?.value) {
        case "view": {
            const serverConfig = await prisma.config.findMany({
                where: {
                    guildId: interaction.guildId?.toString() as string
                }
            })
            if (serverConfig.length === 0) {
                await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Aucune configuration trouvée."))] })
                return
            }
            const responseEmbed = new EmbedBuilder()
                .setTitle("Configuration des salons")
                .setColor(0x00FF00)
                .setDescription(serverConfig.map(config => `**${config.key}**: <#${config.value}>`).join(backSpace))
                .setTimestamp()
                .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

            await interaction.editReply({ embeds: [responseEmbed] })
            break
        }
        case "edit": {
            const key = interaction.options.get("key")?.value as string
            const channel = interaction.options.get("channel")?.value as string
            if (!key || !channel) {
                await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Veuillez fournir une clé et un salon."))] })
                return
            }
            const existingConfig = await prisma.config.findFirst({
                where: {
                    guildId: interaction.guildId?.toString() as string,
                    key
                }
            })
            if (existingConfig) {
                await prisma.config.update({
                    where: {
                        uuid: existingConfig.uuid
                    },
                    data: {
                        value: channel
                    }
                })
            } else {
                await prisma.config.create({
                    data: {
                        guildId: interaction.guildId?.toString() as string,
                        key,
                        value: channel
                    }
                })
            }
            await interaction.editReply({ embeds: [successEmbed(interaction, "Configuration mise à jour.")] })
            break
        }
    }
}