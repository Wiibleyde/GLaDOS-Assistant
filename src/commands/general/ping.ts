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

export async function execute(interaction: CommandInteraction) {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })
    let status: string
    let color: number

    const memoryData: NodeJS.MemoryUsage = process.memoryUsage();
    const ping: number = interaction.client.ws.ping

    if (!firstResponse || ping <= 0) {
        status = "Pas normal !"
        color = 0xFF0000
    } else if (ping < PING_THRESHOLD.VERY_GOOD) {
        status = "Très bon"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.GOOD) {
        status = "Bon"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.CORRECT) {
        status = "Correct"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.WEAK) {
        status = "Faible"
        color = 0xFFA500
    } else if (ping < PING_THRESHOLD.BAD) {
        status = "Mauvais"
        color = 0xFF0000
    } else {
        status = "Très mauvais"
        color = 0xFF0000
    }

    const pingEmbed: EmbedBuilder = new EmbedBuilder()
        .setTitle("🏓 Pong !")
        .setDescription(`Le ping est de ${interaction.client.ws.ping}ms, ce qui est ${status}`)
        .addFields(
            { name: "Mémoire utilisée", value: `${Math.round(memoryData.heapUsed / 1024 / 1024)}MB`, inline: true },
            { name: "Mémoire totale", value: `${Math.round(memoryData.heapTotal / 1024 / 1024)}MB`, inline: true },
        )
        .setTimestamp()
        .setColor(color)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

    await interaction.editReply({ embeds: [pingEmbed] });
}
