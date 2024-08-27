import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Savoir si le bot est en ligne")

const PING_THRESHOLD = {
    VERY_GOOD: 50,
    GOOD: 100,
    CORRECT: 150,
    WEAK: 200,
    BAD: 500,
}

const pingImage = "./assets/img/ping.png"

export async function execute(interaction: CommandInteraction) {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })
    let status: string
    let color: number

    const memoryData: NodeJS.MemoryUsage = process.memoryUsage();
    const ping: number = interaction.client.ws.ping

    if (!firstResponse || ping <= 0) {
        status = "surprenant ! ⚫"
        color = 0xFFFFFF
    } else if (ping < PING_THRESHOLD.VERY_GOOD) {
        status = "très bon 🟢"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.GOOD) {
        status = "bon 🟢"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.CORRECT) {
        status = "correct 🟡"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.WEAK) {
        status = "faible 🟠"
        color = 0xFFA500
    } else if (ping < PING_THRESHOLD.BAD) {
        status = "mauvais 🔴"
        color = 0xFF0000
    } else {
        status = "très mauvais 🔴"
        color = 0xFF0000
    }

    const pingEmbed: EmbedBuilder = new EmbedBuilder()
        .setTitle("Ping")
        .setDescription(`Le ping est de ${interaction.client.ws.ping}ms, ce qui est ${status}`)
        .setTimestamp()
        .setColor(color)
        .setThumbnail("attachment://ping.png")
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

    await interaction.editReply({ embeds: [pingEmbed], files: [{ attachment: pingImage, name: "ping.png" }] })
}
