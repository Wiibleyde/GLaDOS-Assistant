import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction } from "discord.js"
import { prisma } from "@/utils/database"
import { logger } from "@/utils/logger"
import { client } from "@/index"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { log } from "console"

const color = 0xB58D47
const months = {
    1: "Janvier",
    2: "Février",
    3: "Mars",
    4: "Avril",
    5: "Mai",
    6: "Juin",
    7: "Juillet",
    8: "Août",
    9: "Septembre",
    10: "Octobre",
    11: "Novembre",
    12: "Décembre"
}

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
    const dateParts = birthdayDateText.split("/")
    if (dateParts.length !== 3) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Date invalide"))], ephemeral: true })
        return
    }
    const day = parseInt(dateParts[0]) + 1
    const month = parseInt(dateParts[1]) - 1
    const year = parseInt(dateParts[2])
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Date invalide"))], ephemeral: true })
        return
    }
    const birthdayDate = new Date(year, month, day)
    birthdayDate.setHours(0, 0, 0, 0)
    if (isNaN(birthdayDate.getTime())) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Date invalide"))], ephemeral: true })
        return
    }
    const birthday = await prisma.globalUserData.findFirst({
        where: {
            userId: user.id
        }
    })
    if (birthday) {
        await prisma.globalUserData.update({
            where: {
                uuid: birthday.uuid
            },
            data: {
                birthDate: birthdayDate
            }
        })
    } else {
        await prisma.globalUserData.create({
            data: {
                birthDate: birthdayDate,
                userId: user.id
            }
        })
    }
    await interaction.reply({ embeds: [successEmbed(interaction, "Anniversaire ajouté")], ephemeral: true })
}

async function removeBirthday(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const user = interaction.user
    const birthday = await prisma.globalUserData.findFirst({
        where: {
            userId: user.id
        }
    })
    if (!birthday) {
        await interaction.editReply({ content: "Vous n'avez pas d'anniversaire enregistré" })
        return
    }
    await prisma.globalUserData.delete({
        where: {
            uuid: birthday.uuid
        }
    })
    await interaction.editReply({ content: "Anniversaire supprimé" })
}

async function viewBirthday(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const user = interaction.user
    const birthday = await prisma.globalUserData.findFirst({
        where: {
            userId: user.id,
            birthDate: {
                not: null
            }
        }
    })
    if (!birthday) {
        await interaction.reply({ content: "Vous n'avez pas d'anniversaire enregistré", ephemeral: true })
        return
    }
    const birthdayDate = birthday.birthDate
    if (!birthdayDate) {
        await interaction.editReply({ content: "Aucune date d'anniversaire enregistrée" })
        return
    }
    const embed = new EmbedBuilder()
        .setTitle("Votre anniversaire")
        .setDescription(`Votre anniversaire est le ${birthdayDate.toLocaleDateString()}`)
        .setTimestamp()
        .setColor(color)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })
    await interaction.editReply({ embeds: [embed] })
}

async function listBirthday(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!interaction.guildId) {
        await interaction.editReply({ content: "Impossible de récupérer les anniversaires" })
        return
    }
    const usersOnGuild = await client.guilds.cache.get(interaction.guildId)
    const userIds = usersOnGuild?.members.cache.map(member => member.id)
    if (!userIds) {
        await interaction.editReply({ content: "Impossible de récupérer les anniversaires" })
        return
    }
    const birthdays = await prisma.globalUserData.findMany({
        where: {
            userId: {
                in: userIds
            },
            birthDate: {
                not: null
            }
        }
    })
    if (birthdays.length === 0) {
        await interaction.editReply({ content: "Aucun anniversaire enregistré" })
        return
    }
    birthdays.sort((a, b) => {
        if (a.birthDate && b.birthDate) {
            return a.birthDate.getMonth() - b.birthDate.getMonth();
        }
        return 0;
    });
    const monthsBirthdays: { [key: string]: string[] } = {}
    for(const month in months) {
        for(const birthday of birthdays) {
            if(birthday.birthDate?.getMonth() === parseInt(month as string) - 1) {
                if(!monthsBirthdays[month]) {
                    monthsBirthdays[month] = []
                }
                monthsBirthdays[month].push(`<@${birthday.userId}> - ${birthday.birthDate.toLocaleDateString()}`)
            }
        }
    }

    const embed = new EmbedBuilder()
        .setTitle("Anniversaires")
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })
    for(const month in monthsBirthdays) {
        embed.addFields({
            name: months[parseInt(month) as keyof typeof months],
            value: monthsBirthdays[month].join("\n") || "Aucun anniversaire"
        })
    }
    await interaction.editReply({ embeds: [embed] })
}