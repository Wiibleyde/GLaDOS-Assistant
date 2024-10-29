import { logger } from "@/index";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

const url = `https://opendata.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/previsions_pont_chaban/exports/json?lang=fr&timezone=Europe%2FBerlin`

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("chaban")
    .setDescription("Informations sur le pont Chaban-Delmas");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true, fetchReply: true });
    const data = await downloadJsonFile(url);
    const sortedData = data.sort((a: { date_passage: string | number | Date; }, b: { date_passage: string | number | Date; }) => new Date(a.date_passage).getTime() - new Date(b.date_passage).getTime()).reverse();
    const record = sortedData[0];

    const [endHour, endMinute] = record.re_ouverture_a_la_circulation.split(":");
    const [startHour, startMinute] = record.fermeture_a_la_circulation.split(":");

    const closureStart = new Date().setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    const closureEnd = new Date().setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const now = Date.now();
    const isClosedNow = now >= closureStart && now <= closureEnd;
    const isNextClosureToday = now < closureStart;

    const embed = new EmbedBuilder()
        .setTitle("Pont Chaban-Delmas")
        .setDescription(`Le pont est actuellement ${isClosedNow ? "fermé" : "ouvert"}.`);

    if (isClosedNow) {
        embed.setColor("Red");
        embed.addFields({
            name: "Ouverture",
            value: `<t:${Math.floor(closureEnd / 1000)}:R>`
        });
    } else if (isNextClosureToday) {
        embed.setColor("Yellow");
        embed.addFields({
            name: "Prochaine fermeture demain !",
            value: `<t:${Math.floor(closureStart / 1000)}:R>`
        });
    } else {
        embed.setColor("Green");
        if(new Date(closureStart).getTime() > now) {
            embed.addFields({
                name: "Prochaine fermeture",
                value: `<t:${Math.floor(closureStart / 1000)}:R>`
            });
        } else {
            embed.addFields({
                name: "Prochaine fermeture",
                value: "Aucune fermeture prévue."
            });
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

function downloadJsonFile(url: string): Promise<Array<any>> {
    return fetch(url)
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            logger.error(`Failed to fetch Chaban-Delmas data: ${error}`);
            return [];
        });
}