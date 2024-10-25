import { logger } from "@/index"
import { errorEmbed } from "@/utils/embeds"
import { CommandInteraction, SlashCommandBuilder } from "discord.js"

const dogImgUrl = "https://dog.ceo/api/breeds/image/random"

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("dog")
    .setDescription("Affiche une image de chien")

export async function execute(interaction: CommandInteraction) {
    const response = await fetch(dogImgUrl)
    const data = await response.json()
    const dogImg = data .message

    if(!dogImg) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de l'image de dog."))], ephemeral: true })
        return
    }

    await interaction.reply({ files: [dogImg], ephemeral: true })
}