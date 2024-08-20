import { prisma } from "@/utils/database"

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
                },
                {
                    name: "TRACE"
                }
            ],
            skipDuplicates: true
        })
    }

    private getNowDate() {
        return new Date().toISOString()
    }

    public async info(...messageList: any[]) {
        const message = messageList.join(" ")
        console.log(`[INFO] ${this.getNowDate()} ${message}`)
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
        console.error(`[ERROR] ${this.getNowDate()} ${message}`)
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
        console.warn(`[WARN] ${this.getNowDate()} ${message}`)
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
        console.debug(`[DEBUG] ${this.getNowDate()} ${message}`)
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