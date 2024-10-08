import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { commands } from "@/commands/index";
import { backSpace } from "@/utils/textUtils";

interface Command {
    data: {
        description: string;
    }
}
interface Commands {
    [key: string]: Command;
}

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes");

export async function execute(interaction: CommandInteraction) {
    const typedCommands: Commands = commands;
    const commandsList = Object.keys(typedCommands).map((key: string) => {return `**/${key}** : ${typedCommands[key].data.description}`;}).join(backSpace)

    const helpEmbed = new EmbedBuilder()
        .setTitle("Liste des commandes")
        .setDescription(commandsList)
        .setColor(0x4B0082)
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}