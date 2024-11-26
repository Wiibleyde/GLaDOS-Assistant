import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { prisma } from "@/utils/database";
import { backSpace } from "@/utils/textUtils";

import packageJson from "../../../package.json";

const infoImage = "./assets/img/info.png";

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Affiche des informations sur le bot / l'utilisateur")
    .addStringOption(option =>
        option
            .setName("section")
            .setDescription("La section à afficher")
            .addChoices({
                name: "Info sur le bot",
                value: "bot"
            }, {
                name: "Utilisateur",
                value: "user"
            })
            .setRequired(true)
    );

/**
 * Executes the command based on the interaction provided.
 * 
 * @param interaction - The interaction object representing the command interaction.
 * @returns A promise that resolves when the command execution is complete.
 * 
 * The function handles different sections of the command:
 * - "bot": Provides information about the bot including version, language, author, libraries, and GitHub repository.
 * - "user": Provides information about the user from the database including birthday, quiz good answers, and quiz bad answers.
 * - default: Responds with "Section inconnue" if the section is not recognized.
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true,fetchReply: true })

    switch (interaction.options.get("section")?.value) {
        case "bot": {
            const version = packageJson.version
            const libs = Object.keys(packageJson.dependencies).join(backSpace)
            const author = packageJson.author.name

            const infoEmbed: EmbedBuilder = new EmbedBuilder()
                .setTitle("GLaDOS Assistant")
                .setDescription(`GLaDOS Assistant est un bot Discord pour vous servir !`)
                .addFields(
                    { name: "Version", value: version, inline: true },
                    { name: "Langage", value: "TypeScript", inline: true },
                    { name: "Auteur", value: author, inline: true },
                    { name: "Bibliothèques", value: libs, inline: false },
                    { name: "Dépôt GitHub", value: "[Cliquez ici](https://github.com/Wiibleyde/GLaDOS-Assistant)", inline: true }
                )
                .setThumbnail("attachment://info.png")
                .setTimestamp()
                .setColor(0xffffff)
                .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

            await interaction.editReply({ embeds: [infoEmbed], files: [{ attachment: infoImage, name: "info.png" }] })
            break
        }
        case "user": {
            const user = interaction.user
            const dbUser = await prisma.globalUserData.findFirst({
                where: {
                    userId: user.id
                }
            })
            if (!dbUser) {
                await interaction.editReply({ content: "Vous n'avez pas d'informations enregistrées" })
                return
            }
            const birthday = dbUser.birthDate ? dbUser.birthDate.toLocaleDateString() : "Non défini"
            const quizGoodAnswers = dbUser.quizGoodAnswers
            const quizBadAnswers = dbUser.quizBadAnswers
            const embed = new EmbedBuilder()
                .setTitle("Vos informations")
                .setDescription(`Toutes les informations vous concernant dans la base de données`)
                .addFields(
                    { name: "Anniversaire", value: `${birthday}`, inline: true },
                    { name: "Bonnes réponses au quiz", value: `${quizGoodAnswers}`, inline: true },
                    { name: "Mauvaises réponses au quiz", value: `${quizBadAnswers}`, inline: true }
                )
                .setTimestamp()
                .setColor(0xffffff)
                .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() })

            await interaction.editReply({ embeds: [embed] })
            break
        }
        default: {
            await interaction.editReply({ content: "Section inconnue" })
            break
        }
    }
}
