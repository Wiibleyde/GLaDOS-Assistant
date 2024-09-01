import { prisma } from "@/utils/database"

const resetColor = "\x1b[0m"

enum LogLevelColors {
    ERROR = "\x1b[31m",
    INFO = "\x1b[36m",
    WARN = "\x1b[33m",
    DEBUG = "\x1b[32m",
}

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

    public async info(...messageList: any[]) {
        const message = messageList.join(" ")
        console.log(LogLevelColors.INFO + `[INFO] ${this.getNowDate()} ${message}` + resetColor)
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

    public async error(...messageList: any[]) {
        const message = messageList.join(" ")
        console.error(LogLevelColors.ERROR + `[ERROR] ${this.getNowDate()} ${message}` + resetColor)
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

    public async warn(...messageList: any[]) {
        const message = messageList.join(" ")
        console.warn(LogLevelColors.WARN + `[WARN] ${this.getNowDate()} ${message}` + resetColor)
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

    public async debug(...messageList: any[]) {
        const message = messageList.join(" ")
        console.log(LogLevelColors.DEBUG + `[DEBUG] ${this.getNowDate()} ${message}` + resetColor)
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