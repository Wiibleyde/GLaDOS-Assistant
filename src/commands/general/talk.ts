import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, TextChannel } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { logger } from "@/index"
import { hasPermission } from "@/utils/permissionTester"

/**
 * Defines the slash command "talk" which allows users to send a message using the bot.
 * 
 * @constant
 * @type {SlashCommandOptionsOnlyBuilder}
 * 
 * @property {string} name - The name of the command, set to "talk".
 * @property {string} description - A brief description of the command, set to "Parler avec en utilisant bot".
 * 
 * @property {SlashCommandStringOption} options.message - The message to send.
 * @property {string} options.message.name - The name of the option, set to "message".
 * @property {string} options.message.description - A brief description of the option, set to "Le message à envoyer".
 * @property {boolean} options.message.required - Indicates if the option is required, set to true.
 * 
 * @property {SlashCommandStringOption} options.mp - The ID of the person to send the message to.
 * @property {string} options.mp.name - The name of the option, set to "mp".
 * @property {string} options.mp.description - A brief description of the option, set to "ID de la personne".
 * @property {boolean} options.mp.required - Indicates if the option is required, set to false.
 */
export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("talk")
    .setDescription("Parler avec en utilisant bot")
    .addStringOption(option =>
        option
            .setName("message")
            .setDescription("Le message à envoyer")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("mp")
            .setDescription("ID de la personne")
            .setRequired(false)
    )

/**
 * Executes the command to send a message either to a specific user or to the current channel.
 * 
 * @param interaction - The command interaction object containing the options and context.
 * @returns A promise that resolves when the command execution is complete.
 * 
 * The function performs the following steps:
 * 1. Defers the reply to the interaction to allow for asynchronous processing.
 * 2. Retrieves the message and member (if any) from the interaction options.
 * 3. If a member is specified, attempts to fetch the user and send them the message via direct message.
 * 4. If no member is specified, sends the message to the current channel.
 * 5. Handles errors by editing the reply with an appropriate error message.
 * 6. Finally, edits the reply to indicate that the message was sent successfully.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })

    if(!await hasPermission(interaction, [PermissionFlagsBits.ManageMessages], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission d'utiliser cette commande."))] })
        return
    }

    const message = interaction.options.get("message")?.value as string
    const member = interaction.options.get("mp")?.value as string

    if (member) {
        const user = await interaction.client.users.fetch(member)
        if (!user) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver l'utilisateur"))] })
            return
        }
        try {
            await user.send(message)
        } catch (error) {
            logger.error(error)
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible d'envoyer le message"))] })
            return
        }
    } else {
        const channel = interaction.channel as TextChannel
        if (!channel) {
            await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver le salon de discussion"))] })
            return
        }
        await channel.send(message)
    }
    await interaction.editReply({ embeds: [successEmbed(interaction, "Message envoyé")] })
}