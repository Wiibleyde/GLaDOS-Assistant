import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { prisma } from "@/utils/database";

const packageJson = require("../../../package.json");

const infoImage = "./assets/img/info.png";

export const data = new SlashCommandBuilder()
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

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true,fetchReply: true })

    switch (interaction.options.get("section")?.value) {
        case "bot":
            const version = packageJson.version
            const libs = Object.keys(packageJson.dependencies).join("\n")
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
        case "user":
            const user = interaction.user
            const dbUser = await prisma.globalUserData.findFirst({
                where: {
                    userId: parseInt(user.id)
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
        default:
            await interaction.editReply({ content: "Section inconnue" })
            break
    }
}
