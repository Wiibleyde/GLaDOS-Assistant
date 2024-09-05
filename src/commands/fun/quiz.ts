import { prisma } from "@/utils/database"
import { errorEmbed } from "@/utils/embeds"
import { logger } from "@/utils/logger"
import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, CacheType } from "discord.js"

const quizApiUrl = "https://quizzapi.jomoreschi.fr/api/v1/quiz?limit=1"

const quizes: Map<number, QuizType> = new Map()

export const data = new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Affiche une question de quiz aléatoire")

export async function execute(interaction: CommandInteraction) {
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
        .setDescription(`**${quiz.question}**\n\n1) ${shuffledAnswers[0]}\n2) ${shuffledAnswers[1]}\n3) ${shuffledAnswers[2]}\n4) ${shuffledAnswers[3]}`)
        .addFields(
            { name: "Catégorie / difficulté", value: `${formattedCategory} / ${quiz.difficulty}`, inline: true },
            { name: "Invalide", value: `<t:${Math.floor(invalidQuizTimestamp / 1000)}:R>`, inline: true },
            { name: "Demandé par", value: `<@${interaction.user.id}>`, inline: true }
        )
        .setColor(0x4B0082)
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    const buttons = [
        new ButtonBuilder().setCustomId("handleQuizButton--1").setLabel("1").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--2").setLabel("2").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--3").setLabel("3").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("handleQuizButton--4").setLabel("4").setStyle(ButtonStyle.Primary)
    ]

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)

    const channel = interaction.channel
    if(!channel) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de l'envoi de la question de quiz."))], ephemeral: true })
        return
    }

    const messageResponse = await channel.send({ embeds: [embed], components: [actionRow] })

    quizes.set(parseInt(messageResponse.id), quiz)

    await interaction.reply({ content: "Question de quiz envoyée !", ephemeral: true })
}

export async function handleQuizButton(interaction: ButtonInteraction<CacheType>) {
    const message = interaction.message
    if(!message) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Une erreur est survenue lors de la récupération de la question de quiz (message introuvable)."))], ephemeral: true })
        return
    }
    const quiz = quizes.get(parseInt(message.id))
    if(!quiz) {
        await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Quiz expiré (les quiz sont valide pendant 1h après leur création)."))], ephemeral: true })
        return
    }

    if(quiz.createdAt + 3600000 < Date.now()) {
        await interaction.reply({ content: "Le quiz est expiré !", ephemeral: true });
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
        new ButtonBuilder().setCustomId("handleQuizButton--4").setLabel("4").setStyle(ButtonStyle.Primary)
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
                    finalField = finalField + `\n<@${user}>`;
                }
                field.value = finalField;
                found = true;
                break;
            }
        }
        if (!found) {
            messageFields.push({ name: "Bonne(s) réponse(s)", value: quiz.rightUsers.map(user => `<@${user}>`).join("\n"), inline: true });
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
                    finalField = finalField + `\n<@${user}>`;
                }
                field.value = finalField;
                found = true;
                break;
            }
        }
        if (!found) {
            messageFields.push({ name: "Mauvaise(s) réponse(s)", value: quiz.wrongUsers.map(user => `<@${user}>`).join("\n"), inline: true });
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

export function checkOutdatedQuiz() {
    const now = Date.now()
    quizes.forEach((quiz, key) => {
        if(now - quiz.createdAt > 3600000) {
            quizes.delete(key)
        }
    })
}