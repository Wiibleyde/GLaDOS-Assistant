import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from "discord.js"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { prisma } from "@/utils/database"

export const renameCache = new Map<number, string>()

export const data = new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Renommer le bot")
    .addStringOption(option =>
        option
            .setName("nom")
            .setDescription("Le nouveau nom du bot")
            .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction: CommandInteraction) {
    const firstResponse = await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const newName = interaction.options.get("nom")?.value as string
    if (!newName || newName.length === 0) {
        interaction.guild?.members.cache.get(interaction.client.user.id)?.setNickname("")
        await prisma.config.deleteMany({
            where: {
                guildId: parseInt(interaction.guildId?.toString() as string),
                key: "botName"
            }
        })
        renameCache.delete(parseInt(interaction.guildId?.toString() as string))
        await interaction.editReply({ embeds: [successEmbed(interaction, `Le nom du bot a été réinitialisé`)] })
    } else if (newName.length > 32) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Le nom du bot ne doit pas dépasser 32 caractères"))] })
    } else if (newName === interaction.client.user.username) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Le nom du bot ne peut pas être le même que le nom actuel"))] })
    } else {
        interaction.guild?.members.cache.get(interaction.client.user.id)?.setNickname(newName)
        await prisma.config.findFirst({
            where: {
                guildId: parseInt(interaction.guildId?.toString() as string),
                key: "botName"
            }
        }).then(async config => {
            if (config) {
                await prisma.config.update({
                    where: {
                        id: config.id
                    },
                    data: {
                        value: newName
                    }
                })
            } else {
                await prisma.config.create({
                    data: {
                        guildId: parseInt(interaction.guildId?.toString() as string),
                        key: "botName",
                        value: newName
                    }
                })
            }
            renameCache.set(parseInt(interaction.guildId?.toString() as string), newName)
        })
        await interaction.editReply({ embeds: [successEmbed(interaction, `Le nom du bot a été changé en ${newName}`)] })
    }
}

export async function initRenameCache() {
    const guilds = await prisma.config.findMany({
        where: {
            key: "botName"
        }
    })
    guilds.forEach(guild => {
        renameCache.set(Number(guild.guildId), guild.value)
    })
}