import { EmbedBuilder, WebhookClient } from "discord.js"
import { prisma } from "@/utils/database"
import { config } from "@/config"
import { client } from ".."


const resetColor = "\x1b[0m"

enum LogLevelColors {
    ERROR = "\x1b[31m",
    INFO = "\x1b[36m",
    WARN = "\x1b[33m",
    DEBUG = "\x1b[32m",
}

const webhookClient = new WebhookClient({
    url: config.LOGS_WEBHOOK_URL
})

class Logger {
    public async initLevels() {
        await prisma.logLevel.createMany({
            data: [
                {
                    name: "ERROR"
                },
                {
                    name: "INFO"
                },
                {
                    name: "WARN"
                },
                {
                    name: "DEBUG"
                }
            ],
            skipDuplicates: true
        })
    }

    private getNowDate() {
        const now = new Date()
        return now.toLocaleString()
    }

    public async info(...messageList: Array<any>) {
        const message = messageList.join(" ")
        console.log(LogLevelColors.INFO + `[INFO] ${this.getNowDate()} ${message}` + resetColor)
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("INFO")
            .setDescription(message)
            .setTimestamp()
            .setColor(0x00FF00)
            .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
        webhookClient.send({
            options: {
                username: "GLaDOS INFO",
            },
            embeds: [embed]
        })
        await prisma.logs.create({
            data: {
                message,
                level: {
                    connect: {
                        name: "INFO"
                    }
                }
            }
        })
    }

    public async error(...messageList: Array<any>) {
        const message = messageList.join(" ")
        console.error(LogLevelColors.ERROR + `[ERROR] ${this.getNowDate()} ${message}` + resetColor)
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("ERROR")
            .setDescription(message)
            .setTimestamp()
            .setColor(0xFF0000)
            .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
        webhookClient.send({
            options: {
                username: "GLaDOS ERROR",
            },
            embeds: [embed]
        })
        await prisma.logs.create({
            data: {
                message,
                level: {
                    connect: {
                        name: "ERROR"
                    }
                }
            }
        })
    }

    public async warn(...messageList: Array<any>) {
        const message = messageList.join(" ")
        console.warn(LogLevelColors.WARN + `[WARN] ${this.getNowDate()} ${message}` + resetColor)
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("WARN")
            .setDescription(message)
            .setTimestamp()
            .setColor(0xFFA500)
            .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
        webhookClient.send({
            options: {
                username: "GLaDOS WARN",
            },
            embeds: [embed]
        })
        await prisma.logs.create({
            data: {
                message,
                level: {
                    connect: {
                        name: "WARN"
                    }
                }
            }
        })
    }

    public async debug(...messageList: Array<any>) {
        const message = messageList.join(" ")
        console.log(LogLevelColors.DEBUG + `[DEBUG] ${this.getNowDate()} ${message}` + resetColor)
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("DEBUG")
            .setDescription(message)
            .setTimestamp()
            .setColor(0x0000FF)
            .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
        webhookClient.send({
            options: {
                username: "GLaDOS DEBUG",
            },
            embeds: [embed]
        })
        await prisma.logs.create({
            data: {
                message,
                level: {
                    connect: {
                        name: "DEBUG"
                    }
                }
            }
        })
    }
}

export const logger = new Logger()