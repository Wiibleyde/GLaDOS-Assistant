import { prisma } from "@/utils/database"
import { errorEmbed, successEmbed } from "@/utils/embeds"
import { backSpace } from "@/utils/textUtils"
import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, CacheType, TextChannel, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction } from "discord.js"
import { config } from "@/config"
import { logger } from "@/index"

const quizApiUrl = "https://quizzapi.jomoreschi.fr/api/v1/quiz?limit=1"

const quizes: Map<string, QuizType> = new Map()

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Affiche une question de quiz aléatoire")

export async function execute(interaction: CommandInteraction) {
    // const response = await fetch(quizApiUrl)
    // const data = await response.json()
    const questionCount = await prisma.quizQuestions.count()
    if(questionCount === 0) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Aucune question de quiz n'a été trouvée dans la base de données."))], ephemeral: true })
        return
    }
    const randomQuiz = await prisma.quizQuestions.findMany({
        take: 1,
        skip: Math.floor(Math.random() * questionCount),
        include: {
            author: true
        }
    })
    const quizJson = randomQuiz[0]
    const quiz: QuizType = {
        question: quizJson.question,
        answer: quizJson.answer,
        badAnswers: [quizJson.badAnswer1, quizJson.badAnswer2, quizJson.badAnswer3],
        category: quizJson.category,
        difficulty: quizJson.difficulty,
        createdAt: Date.now()
    }

    const invalidQuizTimestamp = quiz.createdAt + 3600000

    if(!quiz) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz."))], ephemeral: true })
        return
    }

    const shuffledAnswers = [quiz.answer, ...quiz.badAnswers].sort(() => Math.random() - 0.5)
    quiz.shuffleAnswers = shuffledAnswers

    const formattedCategory = quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1).replace(/_/g, " ")

    const embed = new EmbedBuilder()
        .setTitle("Question de quiz")
        .setDescription(`${'```'}${quiz.question}${'```'}${backSpace}1) ${'`'}${shuffledAnswers[0]}${'`'}${backSpace}2) ${'`'}${shuffledAnswers[1]}${'`'}${backSpace}3) ${'`'}${shuffledAnswers[2]}${'`'}${backSpace}4) ${'`'}${shuffledAnswers[3]}${'`'}`)
        .addFields(
            { name: "Catégorie / difficulté", value: `${formattedCategory} / ${quiz.difficulty}`, inline: true },
            { name: "Invalide", value: `<t:${Math.floor(invalidQuizTimestamp / 1000)}:R>`, inline: true },
        )
        .setColor(0x4B0082)
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir. Uuid : ${quizJson.uuid}`, iconURL: interaction.client.user.displayAvatarURL() });

    if(quizJson.author) {
        embed.addFields(
            { name: "Auteur", value: `<@${quizJson.author.userId}>`, inline: true }
        )
    } else {
        embed.addFields(
            { name: "Demandé par", value: `<@${interaction.user.id}>`, inline: true }
        )
    }

    const buttons = [
        new ButtonBuilder().setCustomId("handleQuizButton--1").setLabel("1").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--2").setLabel("2").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--3").setLabel("3").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--4").setLabel("4").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("reportQuestionButton").setLabel("Signaler une erreur").setStyle(ButtonStyle.Danger)
    ]

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)

    const channel = interaction.channel as TextChannel
    if(!channel) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de l'envoi de la question de quiz."))], ephemeral: true })
        return
    }

    const messageResponse = await channel.send({ embeds: [embed], components: [actionRow] })

    quizes.set(messageResponse.id, quiz)

    await interaction.reply({ content: "Question de quiz envoyée !", ephemeral: true })

    await prisma.quizQuestions.update({
        where: {
            uuid: quizJson.uuid
        },
        data: {
            lastTimeUsed: new Date()
        }
    })
}

export async function handleQuizButton(interaction: ButtonInteraction<CacheType>) {
    const message = interaction.message
    if(!message) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (message introuvable)."))], ephemeral: true })
        return
    }
    const quiz = quizes.get(message.id)
    if(!quiz) {
        const questionTxt = message.embeds[0].description?.split("```")[1]
        if(!questionTxt) {
            await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (description introuvable)."))], ephemeral: true })
            return
        }
        const question = await prisma.quizQuestions.findFirst({
            where: {
                question: questionTxt
            }
        })
        if(!question) {
            await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (question introuvable)."))], ephemeral: true })
            return
        }
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Quiz expiré (la réponse était: ||" + question.answer + "||)"))], ephemeral: true })
        return
    }

    if(quiz.createdAt + 3600000 < Date.now()) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Quiz expiré (la réponse était: ||" + quiz.answer + "||)"))], ephemeral: true })
        return
    }

    if(quiz.rightUsers && quiz.rightUsers.includes(interaction.user.id)) {
        await interaction.reply({ content: "Vous avez déjà répondu correctement à cette question !", ephemeral: true });
        return
    }
    if(quiz.wrongUsers && quiz.wrongUsers.includes(interaction.user.id)) {
        await interaction.reply({ content: "Vous avez déjà répondu incorrectement à cette question !", ephemeral: true });
        return
    }

    const answer = quiz.answer
    if(!quiz.shuffleAnswers) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération des réponses de la question de quiz."))], ephemeral: true })
        return
    }
    const userAnswer = quiz.shuffleAnswers[parseInt(interaction.customId.split("--")[1])-1]

    const buttons = [
        new ButtonBuilder().setCustomId("handleQuizButton--1").setLabel("1").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--2").setLabel("2").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--3").setLabel("3").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--4").setLabel("4").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("reportQuestionButton").setLabel("Signaler une erreur").setStyle(ButtonStyle.Danger)
    ]

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)

    if (userAnswer === answer) {
        quiz.rightUsers = quiz.rightUsers ? [...quiz.rightUsers, interaction.user.id] : [interaction.user.id]
        await interaction.reply({ content: "Bonne réponse !", ephemeral: true });
        const messageFields = message.embeds[0].fields;
        let found = false;
        for (const field of messageFields) {
            if (field.name === "Bonne(s) réponse(s)") {
                let finalField = "";
                for (const user of quiz.rightUsers) {
                    finalField = finalField + `${backSpace}<@${user}>`;
                }
                field.value = finalField;
                found = true;
                break;
            }
        }
        if (!found) {
            messageFields.push({ name: "Bonne(s) réponse(s)", value: quiz.rightUsers.map(user => `<@${user}>`).join(backSpace), inline: true });
        }
        const user = await prisma.globalUserData.findUnique({
            where: {
                userId: interaction.user.id
            }
        })
        if (!user) {
            await prisma.globalUserData.create({
                data: {
                    userId: interaction.user.id,
                    quizBadAnswers: 0,
                    quizGoodAnswers: 1
                }
            })
        } else {
            await prisma.globalUserData.update({
                where: {
                    userId: interaction.user.id
                },
                data: {
                    quizGoodAnswers: {
                        increment: 1
                    }
                }
            })
        }
        await message.edit({ embeds: [message.embeds[0]], components: [actionRow] })
    } else {
        quiz.wrongUsers = quiz.wrongUsers ? [...quiz.wrongUsers, interaction.user.id] : [interaction.user.id]
        await interaction.reply({ content: "Mauvaise réponse ! (La bonne réponse était: ||" + answer + "||)", ephemeral: true });
        const messageFields = message.embeds[0].fields;
        let found = false;
        for (const field of messageFields) {
            if (field.name === "Mauvaise(s) réponse(s)") {
                let finalField = "";
                for (const user of quiz.wrongUsers) {
                    finalField = finalField + `${backSpace}<@${user}>`;
                }
                field.value = finalField;
                found = true;
                break;
            }
        }
        if (!found) {
            messageFields.push({ name: "Mauvaise(s) réponse(s)", value: quiz.wrongUsers.map(user => `<@${user}>`).join(backSpace), inline: true });
        }
        const user = await prisma.globalUserData.findUnique({
            where: {
                userId: interaction.user.id
            }
        })
        if (!user) {
            await prisma.globalUserData.create({
                data: {
                    userId: interaction.user.id,
                    quizBadAnswers: 1,
                    quizGoodAnswers: 0
                }
            })
        } else {
            await prisma.globalUserData.update({
                where: {
                    userId: interaction.user.id
                },
                data: {
                    quizBadAnswers: {
                        increment: 1
                    }
                }
            })
        }
        await message.edit({ embeds: [message.embeds[0]], components: [actionRow] });
    }
}

export async function insertQuestionInDB() {
    const response = await fetch(quizApiUrl)
    const data = await response.json()
    const quizJson = data.quizzes[0]
    const quiz: QuizType = {
        question: quizJson.question,
        answer: quizJson.answer,
        badAnswers: quizJson.badAnswers,
        category: quizJson.category,
        difficulty: quizJson.difficulty,
        createdAt: Date.now()
    }

    try {
        await prisma.quizQuestions.create({
            data: {
                question: quiz.question,
                answer: quiz.answer,
                badAnswer1: quiz.badAnswers[0],
                badAnswer2: quiz.badAnswers[1],
                badAnswer3: quiz.badAnswers[2],
                category: quiz.category,
                difficulty: quiz.difficulty,
                guildId: "0",
            }
        })
    } catch (error: Error | any) {
        if (error.code === "P2002") {
            return
        } else {
            logger.error(`Erreur lors de l'insertion de la question de quiz dans la base de données : ${error.message}`)
        }
    }
}

export async function reportQuestionButton(interaction: ButtonInteraction<CacheType>) {
    const message = interaction.message
    if(!message) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (message introuvable)."))], ephemeral: true })
        return
    }
    const question = message.embeds[0].description?.split("```")[1]
    if(!question) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (description introuvable)."))], ephemeral: true })
        return
    }
    const quiz = await prisma.quizQuestions.findFirst({
        where: {
            question: question
        }
    })
    if(!quiz) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (question introuvable)."))], ephemeral: true })
        return
    }

    const modal = new ModalBuilder()
        .setCustomId("reportQuestionModal--" + quiz.uuid)
        .setTitle(quiz.uuid)

    const reportReason = new TextInputBuilder()
        .setCustomId("reportReason")
        .setPlaceholder("Raison du signalement")
        .setLabel("Raison du signalement")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reportReason)
    modal.addComponents(actionRow)

    await interaction.showModal(modal)
}

export async function reportQuestionModal(interaction: ModalSubmitInteraction) {
    const user = interaction.user
    const reportReason = interaction.fields.getTextInputValue("reportReason")
    const uuid = interaction.customId.split("--")[1]
    const question = await prisma.quizQuestions.findFirst({
        where: {
            uuid: uuid
        },
        include: {
            author: true
        }
    })
    if (!question) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Question introuvable"))], ephemeral: true })
        return
    }

    const channel = await interaction.client.channels.fetch(config.REPORT_CHANNEL) as TextChannel
    if (!channel) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Channel de report introuvable"))], ephemeral: true })
        return
    }

    const embed = new EmbedBuilder()
        .setTitle("Signalement de question de quiz")
        .setDescription(`UUID: ${uuid}${backSpace}`)
        .setColor(0xFF0000)
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    if (reportReason) {
        embed.addFields({
            name: "Raison du signalement",
            value: reportReason,
            inline: false
        })
        embed.addFields({
            name: "Question",
            value: '```' + question.question + '```',
            inline: false
        })
        embed.addFields({
            name: "Réponses",
            value: `Bonne réponse: ${"`"}${question.answer}${"`"}${backSpace}Mauvaises réponses: ${"`"}${question.badAnswer1}${"`"}, ${"`"}${question.badAnswer2}${"`"}, ${"`"}${question.badAnswer3}${"`"}`,
            inline: false
        })
        if(question.author) {
            embed.addFields({
                name: "Auteur",
                value: `<@${question.author.userId}>`,
                inline: false
            })
        } else {
            embed.addFields({
                name: "Auteur",
                value: `API`,
                inline: false
            })
        }
        embed.addFields({
            name: "Catégorie",
            value: question.category,
            inline: true
        })
        embed.addFields({
            name: "Difficulté",
            value: question.difficulty,
            inline: true
        })
    }

    await channel.send({ content: `<@${config.OWNER_ID}>, report de : <@${user.id}>`, embeds: [embed] })
    await interaction.reply({ embeds: [successEmbed(interaction, "Question signalée")], ephemeral: true })
}

export function isMessageQuizQuestion(messageId: string) {
    return quizes.has(messageId)
}