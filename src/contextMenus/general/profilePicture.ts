import { successEmbed } from "@/utils/embeds";
import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";

export const data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
    .setName("Récupèrer la photo de profil")
    //@ts-expect-error - This is a valid type
    .setType(ApplicationCommandType.User)

export async function execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.targetUser
    const userProfilePicture = author?.displayAvatarURL({ extension: "png", size: 1024 })

    await interaction.editReply({ embeds: [successEmbed(interaction, `Photo de profil de ${author?.toString()}: ${userProfilePicture}`)] })
}