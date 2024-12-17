import { config } from "@/config";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

const url = "https://api.nasa.gov/planetary/apod"

// {"copyright":"\nJeff Horne & \nDrew Evans\n","date":"2024-12-17","explanation":"What excites the Heart Nebula? First, the large emission nebula on the upper left, catalogued as IC 1805, looks somewhat like a human heart.  The nebula glows brightly in red light emitted by its most prominent element, hydrogen, but this long-exposure image was also blended with light emitted by sulfur (yellow) and oxygen (blue).  In the center of the Heart Nebula are young stars from the open star cluster Melotte 15 that are eroding away several picturesque dust pillars with their atom-exciting energetic light and winds. The Heart Nebula is located about 7,500 light years away toward the constellation of Cassiopeia.  This wide field image shows much more, though, including the Fishhead Nebula just below the Heart, a supernova remnant on the lower left, and three planetary nebulas on the image right.  Taken over 57 nights, this image is so deep, though, that it clearly shows fainter long and complex filaments.","hdurl":"https://apod.nasa.gov/apod/image/2412/Heart_HorneEvans_4096.jpg","media_type":"image","service_version":"v1","title":"Near to the Heart Nebula","url":"https://apod.nasa.gov/apod/image/2412/Heart_HorneEvans_1080.jpg"}


interface ApodResponse {
    copyright: string
    date: string
    explanation: string
    hdurl: string
    media_type: string
    service_version: string
    title: string
    url: string
}


export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("apod")
    .setDescription("Astronomy Picture Of the Day")

export async function execute(interaction: CommandInteraction): Promise<void> {
    const response = await fetch(`${url}?api_key=${config.NASA_API_KEY}`)
    const data: ApodResponse = await response.json()

    const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setImage(data.hdurl)
        .setFooter({ text: `Eve – ©${data.copyright}`, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp()

    const secondEmbed = new EmbedBuilder()
        .setTitle("Explanation")
        .setDescription(data.explanation)
        .setTimestamp()
        .setFooter({ text: `Eve – ©${data.date}`, iconURL: interaction.client.user.displayAvatarURL() })

    await interaction.reply({ embeds: [embed, secondEmbed], ephemeral: true })
}

