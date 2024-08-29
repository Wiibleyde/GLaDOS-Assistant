import { errorEmbed } from "@/utils/embeds"
import { CommandInteraction, SlashCommandBuilder } from "discord.js"

const catImgUrl = "https://api.thecatapi.com/v1/images/search"

export const data = new SlashCommandBuilder()
    .setName("cat")
    .setDescription("Affiche une image de chat")

export async function execute(interaction: CommandInteraction) {
    const response = await fetch(catImgUrl)
    const data = await response.json()
    const catImg = data[0].url

    if(!catImg) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de l'image de chat."))], ephemeral: true })
        return
    }

    await interaction.reply({ files: [catImg], ephemeral: true })
}