import { errorEmbed } from "@/utils/embeds";
import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder, UserContextMenuCommandInteraction } from "discord.js";

export const data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
    .setName("Récupèrer la bannière")
    //@ts-expect-error - This is a valid type
    .setType(ApplicationCommandType.User) // ApplicationCommandType.User

export async function execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.targetUser

    const userBanner = author?.bannerURL({ size: 1024, extension: "png" })

    if (!userBanner) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("L'utilisateur n'a pas de bannière."))] })
        return
    }

    const embed = new EmbedBuilder()
        .setTitle("Bannière")
        .setImage(userBanner)
        .setColor(0x00ff00)
        .setTimestamp()
        .setFooter({ text: `Eve – Toujours prête à vous aider.`, iconURL: interaction.client.user.displayAvatarURL() })

    await interaction.editReply({ embeds: [embed] })
}