import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { prisma } from "@/utils/database"
import { client } from "@/index"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { backSpace } from "@/utils/textUtils"

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

/**
 * Defines the slash command for managing birthdays.
 * 
 * This command allows users to perform various actions related to birthdays:
 * - "Ajouter" (add): Add a new birthday.
 * - "Supprimer" (remove): Remove an existing birthday.
 * - "Voir mon anniversaire" (view): View the user's own birthday.
 * - "Voir les anniversaires" (list): View all birthdays.
 * 
 * @constant {SlashCommandOptionsOnlyBuilder} data - The slash command builder for the birthday command.
 */
export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
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

/**
 * Executes the appropriate birthday command based on the user's interaction.
 * 
 * @param interaction - The interaction object containing the command and options.
 * @returns A promise that resolves when the command execution is complete.
 * 
 * The function handles the following actions:
 * - "add": Adds a birthday.
 * - "remove": Removes a birthday.
 * - "view": Views a specific birthday.
 * - "list": Lists all birthdays.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
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

/**
 * Handles the interaction to add a birthday by displaying a modal for the user to input their birth date.
 * 
 * @param interaction - The command interaction that triggered this function.
 * @returns A promise that resolves when the modal is shown to the user.
 */
async function addBirthday(interaction: CommandInteraction): Promise<void> {
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

/**
 * Handles the submission of a modal to add or update a user's birthday.
 * 
 * @param interaction - The interaction object representing the modal submission.
 * @returns A promise that resolves when the interaction has been handled.
 * 
 * This function performs the following steps:
 * 1. Extracts the user and birthday date text from the interaction.
 * 2. Validates the date format and parses the day, month, and year.
 * 3. Creates a Date object from the parsed values and validates it.
 * 4. Checks if the user already has a birthday record in the database.
 * 5. Updates the existing record or creates a new one with the provided birthday date.
 * 6. Sends a success or error message as a reply to the interaction.
 */
export async function addBirthdayModal(interaction: ModalSubmitInteraction): Promise<void> {
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

/**
 * Removes the birthday entry for the user who initiated the interaction.
 * 
 * This function first defers the reply to the interaction, making it ephemeral.
 * It then checks if the user has a birthday entry in the database. If no entry is found,
 * it informs the user that no birthday is recorded. If an entry is found, it deletes the
 * birthday entry from the database and informs the user that the birthday has been removed.
 * 
 * @param interaction - The interaction object representing the command interaction.
 * @returns A promise that resolves when the operation is complete.
 */
async function removeBirthday(interaction: CommandInteraction): Promise<void> {
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

/**
 * Handles the interaction to view a user's birthday.
 * 
 * This function defers the reply to the interaction, fetches the user's birthday
 * from the database, and sends an embedded message with the birthday information.
 * If no birthday is found, it sends an appropriate message indicating that no
 * birthday is recorded.
 * 
 * @param interaction - The command interaction that triggered this function.
 * @returns A promise that resolves when the interaction reply is edited.
 */
async function viewBirthday(interaction: CommandInteraction): Promise<void> {
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
        await interaction.editReply({ content: "Aucune date d'anniversaire enregistrée" })
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

/**
 * Handles the interaction to list birthdays of users in a guild.
 * 
 * This function fetches the members of the guild, retrieves their birthdays from the database,
 * sorts them by month, and sends an embedded message listing the birthdays.
 * 
 * @param interaction - The command interaction that triggered this function.
 * @returns A promise that resolves when the interaction reply is edited.
 */
async function listBirthday(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true, fetchReply: true })
    if (!interaction.guildId) {
        await interaction.editReply({ content: "Impossible de récupérer les anniversaires" })
        return
    }
    const usersOnGuild = await client.guilds.fetch(interaction.guildId).then(guild => guild.members.fetch())
    const userIds = usersOnGuild.map(user => user.id)
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
            value: monthsBirthdays[month].join(backSpace) || "Aucun anniversaire"
        })
    }
    await interaction.editReply({ embeds: [embed] })
}