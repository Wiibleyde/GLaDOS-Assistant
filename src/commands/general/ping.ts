import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"

/**
 * Command data for the "ping" command.
 * This command is used to check if the bot is online.
 * 
 * @constant {SlashCommandBuilder} data - The command builder for the "ping" command.
 */
export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Savoir si le bot est en ligne")

/**
 * An object representing different ping thresholds.
 * 
 * The thresholds are categorized as follows:
 * - `VERY_GOOD`: Ping less than or equal to 50ms.
 * - `GOOD`: Ping less than or equal to 100ms.
 * - `CORRECT`: Ping less than or equal to 150ms.
 * - `WEAK`: Ping less than or equal to 200ms.
 * - `BAD`: Ping less than or equal to 500ms.
 */
const PING_THRESHOLD = {
    VERY_GOOD: 50,
    GOOD: 100,
    CORRECT: 150,
    WEAK: 200,
    BAD: 500,
}

const pingImage = "./assets/img/ping.png"

/**
 * Executes the ping command, which provides the bot's current status including ping, memory usage, and uptime.
 *
 * @param interaction - The interaction object that triggered the command.
 * @returns A promise that resolves when the reply has been edited with the ping information.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })
    let status: string
    let color: number

    const memoryData: NodeJS.MemoryUsage = process.memoryUsage();
    const ping: number = interaction.client.ws.ping

    if (!firstResponse || ping <= 0) {
        status = "Surprenant ! ⚫"
        color = 0xFFFFFF
    } else if (ping < PING_THRESHOLD.VERY_GOOD) {
        status = "Très bon 🟢"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.GOOD) {
        status = "Bon 🟢"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.CORRECT) {
        status = "Correct 🟡"
        color = 0x00FF00
    } else if (ping < PING_THRESHOLD.WEAK) {
        status = "Faible 🟠"
        color = 0xFFA500
    } else if (ping < PING_THRESHOLD.BAD) {
        status = "Mauvais 🔴"
        color = 0xFF0000
    } else {
        status = "Très mauvais 🔴"
        color = 0xFF0000
    }

    const pingEmbed: EmbedBuilder = new EmbedBuilder()
        .setTitle("Ping")
        .setDescription("Status du bot")
        .addFields(
            { name: "Ping", value: `${ping}ms / ${status}`, inline: true },
            { name: "Mémoire", value: `${(memoryData.heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
            { name: "Uptime", value: `${(process.uptime() / 60).toFixed(2)} minutes`, inline: true }
        )
        .setTimestamp()
        .setColor(color)
        .setThumbnail("attachment://ping.png")
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

    await interaction.editReply({ embeds: [pingEmbed], files: [{ attachment: pingImage, name: "ping.png" }] })
}
