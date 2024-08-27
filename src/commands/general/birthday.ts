import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction } from "discord.js"
import { prisma } from "@/utils/database"
import { logger } from "@/utils/logger"
import { client } from "@/index"

const color = 0xB58D47

export const data = new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Gestion des anniversaires")
    .addStringOption(option =>
        option
            .setName("action")
            .setDescription("L'action à effectuer")
            .addChoices({
                name: "Ajouter",
                value: "add"
            }, {
                name: "Supprimer",
                value: "remove"
            }, {
                name: "Voir mon anniversaire",
                value: "view"
            }, {
                name: "Voir les anniversaires",
                value: "list"
            })
            .setRequired(true)
    )

export async function execute(interaction: CommandInteraction) {
    switch (interaction.options.get("action")?.value) {
        case "add":
            await addBirthday(interaction)
            break
        case "remove":
            await removeBirthday(interaction)
            break
        case "view":
            await viewBirthday(interaction)
            break
        case "list":
            await listBirthday(interaction)
            break
    }
}

async function addBirthday(interaction: CommandInteraction) {
    const modal = new ModalBuilder()
        .setCustomId("addBirthdayModal")
        .setTitle("Ajouter un anniversaire")

    const birthdayDate = new TextInputBuilder()
        .setCustomId("birthday")
        .setPlaceholder("JJ/MM/AAAA")
        .setLabel("Date de naissance (Format: JJ/MM/AAAA)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(birthdayDate)
    modal.addComponents(actionRow)

    await interaction.showModal(modal)
}

export async function addBirthdayModal(interaction: ModalSubmitInteraction) {
    const user = interaction.user
    const birthdayDateText = interaction.fields.getTextInputValue("birthday")
    // date is valid (format: DD/MM/YYYY)
    const dateParts = birthdayDateText.split("/")
    if (dateParts.length !== 3) {
        await interaction.editReply({ content: "Date invalide" })
        return
    }
    const day = parseInt(dateParts[0])
    const month = parseInt(dateParts[1])
    const year = parseInt(dateParts[2])
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        await interaction.editReply({ content: "Date invalide" })
        return
    }
    const birthdayDate = new Date(year, month - 1, day)
    birthdayDate.setHours(0, 0, 0, 0)
    if (isNaN(birthdayDate.getTime())) {
        await interaction.editReply({ content: "Date invalide" })
        return
    }
    const birthday = await prisma.birthdays.findFirst({
        where: {
            userId: parseInt(user.id)
        }
    })
    if (birthday) {
        await prisma.birthdays.update({
            where: {
                id: birthday.id
            },
            data: {
                date: birthdayDate
            }
        })
    } else {
        await prisma.birthdays.create({
            data: {
                date: birthdayDate,
                userId: parseInt(user.id)
            }
        })
    }
    await interaction.reply({ content: "Anniversaire ajouté", ephemeral: true })
}

async function removeBirthday(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const user = interaction.user
    const birthday = await prisma.birthdays.findFirst({
        where: {
            userId: parseInt(user.id)
        }
    })
    if (!birthday) {
        await interaction.editReply({ content: "Vous n'avez pas d'anniversaire enregistré" })
        return
    }
    await prisma.birthdays.delete({
        where: {
            id: birthday.id
        }
    })
    await interaction.editReply({ content: "Anniversaire supprimé" })
}

async function viewBirthday(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const user = interaction.user
    const birthday = await prisma.birthdays.findFirst({
        where: {
            userId: parseInt(user.id)
        }
    })
    if (!birthday) {
        await interaction.reply({ content: "Vous n'avez pas d'anniversaire enregistré", ephemeral: true })
        return
    }
    const birthdayDate = birthday.date
    const embed = new EmbedBuilder()
        .setTitle("Votre anniversaire")
        .setDescription(`Votre anniversaire est le ${birthdayDate.toLocaleDateString()}`)
        .setTimestamp()
        .setColor(color)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })
    await interaction.editReply({ embeds: [embed] })
}

async function listBirthday(interaction: CommandInteraction) {
    logger.debug("listBirthday")
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!interaction.guildId) {
        await interaction.editReply({ content: "Impossible de récupérer les anniversaires" })
        return
    }
    const usersOnGuild = await client.guilds.cache.get(interaction.guildId)
    const userIds = usersOnGuild?.members.cache.map(member => parseInt(member.id))
    if (!userIds) {
        await interaction.editReply({ content: "Impossible de récupérer les anniversaires" })
        return
    }
    const birthdays = await prisma.birthdays.findMany({
        where: {
            userId: {
                in: userIds
            }
        }
    })
    logger.debug(birthdays)
    if (birthdays.length === 0) {
        await interaction.editReply({ content: "Aucun anniversaire enregistré" })
        return
    }
    birthdays.sort((a, b) => a.date.getMonth() - b.date.getMonth())
    const embeds = birthdays.map(birthday => {
        const birthdayDate = birthday.date
        return new EmbedBuilder()
            .setTitle("Anniversaires")
            .setDescription(`<@${birthday.userId}> - ${birthdayDate.toLocaleDateString()}`)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })
    })

    await interaction.editReply({ embeds })
}