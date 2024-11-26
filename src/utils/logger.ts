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

/**
 * The `Logger` class provides methods for logging messages at various levels (INFO, ERROR, WARN, DEBUG).
 * It supports logging to the console, sending logs to a Discord webhook, and storing logs in a database.
 * 
 * @remarks
 * - The logging behavior can be customized through the `logInDb` and `logInDiscord` properties.
 * - The class uses Prisma for database interactions and Discord.js for sending webhook messages.
 * 
 * @example
 * ```typescript
 * const logger = new Logger(true, true);
 * await logger.info("This is an informational message");
 * await logger.error("This is an error message");
 * await logger.warn("This is a warning message");
 * await logger.debug("This is a debug message");
 * ```
 * 
 * @public
 */
export class Logger {
    logInDb: boolean = true
    logInDiscord: boolean = true

    /**
     * Creates an instance of the logger utility.
     * 
     * @param logInDb - Determines whether to log messages in the database. Defaults to `true`.
     * @param logInDiscord - Determines whether to log messages in Discord. Defaults to `true`.
     */
    constructor(logInDb: boolean = true, logInDiscord: boolean = true) {
        this.logInDb = logInDb
        this.logInDiscord = logInDiscord
    }

    /**
     * Initializes the log levels in the database.
     * 
     * This method creates multiple log levels (ERROR, INFO, WARN, DEBUG) in the database
     * using Prisma's `createMany` method. If any of these log levels already exist, 
     * they will be skipped due to the `skipDuplicates` option.
     * 
     * @returns {Promise<void>} A promise that resolves when the log levels have been initialized.
     */
    public async initLevels(): Promise<void> {
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

    /**
     * Gets the current date and time as a localized string.
     *
     * @returns {string} The current date and time in a locale-specific format.
     */
    private getNowDate(): string {
        const now = new Date()
        return now.toLocaleString()
    }

    /**
     * Logs an informational message to the console, optionally to Discord and a database.
     *
     * @param {...Array<unknown>} messageList - The list of messages to log.
     * @returns {Promise<void>} A promise that resolves when the logging is complete.
     *
     * Logs the message to the console with an "INFO" level tag and a timestamp.
     * If `logInDiscord` is true, sends the log message to a Discord webhook.
     * If `logInDb` is true, stores the log message in the database.
     */
    public async info(...messageList: unknown[]): Promise<void> {
        const message = messageList.join(" ")
        console.log(LogLevelColors.INFO + `[INFO] ${this.getNowDate()} ${message}` + resetColor)
        if(this.logInDiscord) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle("INFO")
                .setDescription(message)
                .setTimestamp()
                .setColor(0x00FF00)
                .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
            webhookClient.send({
                username: "GLaDOS INFO",
                avatarURL: client.user?.displayAvatarURL(),
                embeds: [embed]
            })
        }
        if(this.logInDb) {
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
    }

    /**
     * Logs an error message to the console, optionally sends it to a Discord webhook, and stores it in a database.
     * 
     * @param {...Array<unknown>} messageList - The list of messages to log.
     * @returns {Promise<void>} A promise that resolves when the logging is complete.
     * 
     * @remarks
     * - The message is joined into a single string with spaces.
     * - The log is printed to the console with an error level.
     * - If `logInDiscord` is true, the message is sent to a Discord webhook with an embed.
     * - If `logInDb` is true, the message is stored in a database using Prisma.
     */
    public async error(...messageList: unknown[]): Promise<void> {
        const message = messageList.join(" ")
        console.error(LogLevelColors.ERROR + `[ERROR] ${this.getNowDate()} ${message}` + resetColor)
        if(this.logInDiscord) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle("ERROR")
                .setDescription(message)
                .setTimestamp()
                .setColor(0xFF0000)
                .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
            webhookClient.send({
                username: "GLaDOS ERROR",
                avatarURL: client.user?.displayAvatarURL(),
                embeds: [embed]
            })
        }
        if(this.logInDb) {
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
    }

    /**
     * Logs a warning message to the console, optionally sends it to Discord and/or saves it to the database.
     * 
     * @param {...unknown[]} messageList - The list of messages to log.
     * @returns {Promise<void>} A promise that resolves when the logging is complete.
     * 
     * @remarks
     * - The message is joined into a single string with spaces.
     * - If `logInDiscord` is true, the message is sent to a Discord webhook.
     * - If `logInDb` is true, the message is saved to the database.
     * 
     * @example
     * ```typescript
     * await logger.warn("This is a warning message", "with additional context");
     * ```
     */
    public async warn(...messageList: unknown[]): Promise<void> {
        const message = messageList.join(" ")
        console.warn(LogLevelColors.WARN + `[WARN] ${this.getNowDate()} ${message}` + resetColor)
        if(this.logInDiscord) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle("WARN")
                .setDescription(message)
                .setTimestamp()
                .setColor(0xFFA500)
                .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
            webhookClient.send({
                username: "GLaDOS WARN",
                avatarURL: client.user?.displayAvatarURL(),
                embeds: [embed]
            })
        }
        if(this.logInDb) {
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
    }

    /**
     * Logs a debug message to the console, optionally to Discord via a webhook, and optionally to a database.
     * 
     * @param {...Array<unknown>} messageList - The list of messages to be logged.
     * @returns {Promise<void>} A promise that resolves when the logging is complete.
     * 
     * @remarks
     * - The message is joined into a single string with spaces.
     * - If `logInDiscord` is true, the message is sent to a Discord webhook.
     * - If `logInDb` is true, the message is logged into a database.
     */
    public async debug(...messageList: unknown[]): Promise<void> {
        const message = messageList.join(" ")
        console.log(LogLevelColors.DEBUG + `[DEBUG] ${this.getNowDate()} ${message}` + resetColor)
        if(this.logInDiscord) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle("DEBUG")
                .setDescription(message)
                .setTimestamp()
                .setColor(0x0000FF)
                .setFooter({ text: `GLaDOS Assistant - Webhook log`, iconURL: client.user?.displayAvatarURL() })
            webhookClient.send({
                username: "GLaDOS DEBUG",
                avatarURL: client.user?.displayAvatarURL(),
                embeds: [embed]
            })
        }
        if(this.logInDb) {
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
}
