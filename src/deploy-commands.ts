import { Guild, REST, Routes } from "discord.js"
import { config } from "./config"
import { commands, devCommands } from "./commands"
import { logger } from "@/utils/logger"
import { client } from "."

const commandsData = Object.values(commands).map((command) => command.data)
const devCommandsData = Object.values(devCommands).map((command) => command.data)

const rest = new REST().setToken(config.DISCORD_TOKEN)

export async function deployCommands() {
    try {
        logger.info("Chargement des commandes globales...")

        await rest.put(
            Routes.applicationCommands(config.DISCORD_CLIENT_ID),
            {
                body: commandsData,
            }
        );

        logger.info("Commandes chargées avec succès !");
    } catch (error) {
        logger.error(error as string)
    }
}

export async function deployDevCommands(guildId: string) {
    try {
        logger.info("Chargement des commandes pour la guilde...")

        await rest.put(
            Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
            {
                body: devCommandsData,
            }
        );

        const guild = client.guilds.cache.get(guildId)
        logger.debug("Guilds cache", JSON.stringify(client.guilds.cache))
        if (!guild) {
            logger.error(`Impossible de trouver la guilde ${guildId}`)
            return
        }
        logger.info("Commandes chargées avec succès pour la guilde :", guild.name, guild.id)
    } catch (error) {
        logger.error(error as string)
    }
}