import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

const packageJson = require("../../../package.json");

const infoImage = "./assets/img/info.png";

export const data = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Informations sur le bot");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true,fetchReply: true });

    const version = packageJson.version;
    const libs = Object.keys(packageJson.dependencies).join("\n");
    const author = packageJson.author.name;

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
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.editReply({ embeds: [infoEmbed], files: [{ attachment: infoImage, name: "info.png" }] });
}
