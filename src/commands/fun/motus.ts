import { client } from "@/index";
import { errorEmbed } from "@/utils/embeds";
import { games, GameState, getRandomWord, MotusGame, TryReturn } from "@/utils/motus";
import { ActionRowBuilder, ButtonInteraction, CommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("motus")
    .setDescription("Lance une partie de Motus.")

export async function execute(interaction: CommandInteraction) {
    const word = await getRandomWord();
    const game = new MotusGame(word, interaction.user.id);

    const embedResult = await game.getEmbed();

    const channel = interaction.channel as TextChannel;
    if (!channel) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver le salon de jeu."))], ephemeral: true });
    }

    const message = await channel.send({ embeds: [embedResult.embed], components: embedResult.components, files: embedResult.attachments });

    games.set(message.id, game);
}

export async function handleMotusTry(interaction: ButtonInteraction) {
    const message = interaction.message;
    const game = games.get(message.id);

    if (!game) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Partie de Motus terminée ou inexistante."))], ephemeral: true });
    }

    if(game.state !== GameState.PLAYING) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("La partie de Motus est déjà terminée."))], ephemeral: true });
    }

    const wordLength = game.wordLength;

    const modal = new ModalBuilder()
        .setCustomId("handleMotusTryModal--"+message.id)
        .setTitle("Essai Motus")

    const textInput = new TextInputBuilder()
        .setLabel(`Entrez un mot de ${wordLength} lettres`)
        .setPlaceholder("Mot")
        .setCustomId("motusTry")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(wordLength)
        .setMinLength(wordLength)
        .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}

export async function handleMotusTryModal(interaction: ModalSubmitInteraction) {
    const messageId = interaction.customId.split("--")[1];
    const game = games.get(messageId);

    if (!interaction.channel) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Impossible de trouver le salon de jeu."))], ephemeral: true });
    }
    const message = await client.channels.fetch(interaction.channel.id).then(channel => (channel as TextChannel).messages.fetch(messageId));


    if (!game) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("Aucune partie de Motus en cours."))], ephemeral: true });
    }

    if(game.state !== GameState.PLAYING) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error("La partie de Motus est déjà terminée."))], ephemeral: true });
    }

    const wordLength = game.wordLength;
    const word = interaction.fields.getTextInputValue("motusTry");

    if (word.length !== wordLength) {
        return await interaction.reply({ embeds: [errorEmbed(interaction, new Error(`Le mot doit contenir ${wordLength} lettres.`))], ephemeral: true });
    }

    const result = game.tryAttempt(word, interaction.user.id);

    if (result === TryReturn.WIN) {
        game.endGame(GameState.WON);
    } else if (result === TryReturn.LOSE) {
        game.endGame(GameState.LOST);
    }

    const embedResult = await game.getEmbed();

    if (embedResult.components.length > 0) {
        await message.edit({ embeds: [embedResult.embed], components: embedResult.components });
    } else {
        await message.edit({ embeds: [embedResult.embed], components: [] });
    }

    if (game.state !== GameState.PLAYING) {
        games.delete(message.id);
    }

    await interaction.reply({ content: "Essai enregistré.", ephemeral: true });
}