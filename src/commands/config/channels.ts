import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { backSpace } from "@/utils/textUtils"
import { hasPermission } from "@/utils/permissionTester"

/**
 * Slash command configuration for the "channels" command.
 * This command allows users to configure various channels.
 *
 * @constant
 * @type {SlashCommandOptionsOnlyBuilder}
 * 
 * @property {string} name - The name of the command ("channels").
 * @property {string} description - A brief description of the command ("Configurer les salons").
 * 
 * @property {SlashCommandStringOption} action - The action to perform.
 * - "view": View the current configuration.
 * - "edit": Modify the current configuration.
 * 
 * @property {SlashCommandStringOption} key - The configuration key (optional).
 * - "birthdayChannel": Channel for birthdays.
 * - "quoteChannel": Channel for quotes.
 * 
 * @property {SlashCommandChannelOption} channel - The channel to configure (optional).
 * 
 * @property {Array<InteractionContextType>} contexts - The contexts in which this command can be used.
 * - InteractionContextType.Guild: The command can be used in a guild.
 * - InteractionContextType.PrivateChannel: The command can be used in a private channel.
 */
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

/**
 * Handles the execution of the configuration command for managing channels.
 * 
 * @param interaction - The command interaction object.
 * @returns A promise that resolves to void.
 * 
 * This function performs the following actions:
 * 1. Defers the reply to the interaction.
 * 2. Checks if the user has the required permissions to manage channels.
 * 3. Based on the action specified in the interaction options, it either:
 *    - Views the current channel configuration and sends it as a reply.
 *    - Edits the channel configuration by updating or creating a new entry in the database.
 * 
 * The function handles errors and sends appropriate error messages if:
 * - The user does not have the required permissions.
 * - No configuration is found when attempting to view.
 * - Required options (key and channel) are missing when attempting to edit.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!await hasPermission(interaction, [PermissionFlagsBits.ManageChannels], false)) {
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