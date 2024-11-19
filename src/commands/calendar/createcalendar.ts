import { client, logger } from "@/index";
import { prisma } from "@/utils/database";
import { errorEmbed } from "@/utils/embeds";
import { hasPermission } from "@/utils/permissionTester";
import { CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, TextChannel } from "discord.js";
import { CalendarComponent, CalendarResponse, sync } from 'node-ical';

const icalMap = new Map<string, CalendarResponse>() // Map<guildId, CalendarResponse>

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("createcalendar")
    .setDescription("Créer un calendrier (1 par serveur)")
    .addStringOption(option =>
        option
            .setName("url")
            .setDescription("URL du calendrier")
            .setRequired(true)
    )

export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    if (!await hasPermission(interaction, [PermissionFlagsBits.ManageEvents], false)) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Vous n'avez pas la permission de changer la configuration."))] })
        return
    }

    const url = interaction.options.get("url")?.value as string

    if(await prisma.guildData.count({where: {AND: [{guildId: interaction.guildId as string},{calendarUrl: url}]}})) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Ce calendrier est déjà enregistré."))] })
        return
    }

    await prisma.guildData.upsert({
        where: {
            guildId: interaction.guildId as string
        },
        update: {
            calendarUrl: url
        },
        create: {
            guildId: interaction.guildId as string,
            calendarUrl: url
        }
    })

    await updateGuildCalendar(interaction.guildId as string)

    const calendar = icalMap.get(interaction.guildId as string);
    if (!calendar) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Calendrier introuvable."))] });
        return;
    }
    const nextEvent = findNextEvent(calendar);
    if (!nextEvent) {
        await interaction.editReply({ embeds: [errorEmbed(interaction, new Error("Aucun événement à venir trouvé."))] });
        return;
    }
    await upsertCalendarMessage(interaction.guildId as string, interaction.channelId, null, nextEvent);

    await interaction.editReply({ content: `Calendrier créé avec succès !` })
}

async function downloadCalendar(url: string): Promise<CalendarResponse> {
    const ics = await fetch(url).then(res => res.text())
    return sync.parseICS(ics)
}

async function updateGuildCalendar(guildId: string) {
    const guildData = await prisma.guildData.findFirst({
        where: {
            AND: [
                {
                    guildId
                },
                {
                    calendarUrl: {
                        not: null
                    }
                }
            ]
        },
        select: {
            calendarUrl: true
        }
    })

    if(!guildData) return
    if (guildData.calendarUrl) {
        const calendar = await downloadCalendar(guildData.calendarUrl)
        if(!calendar) {
            logger.error(`Failed to download calendar for guild ${guildId}`)
            return
        }
        icalMap.set(guildId, calendar)
    } else {
        icalMap.delete(guildId)
        logger.warn(`Previous calendar for guild ${guildId} was deleted.`)
    }
}

export async function initCalendars() {
    const guilds = await prisma.guildData.findMany({
        where: {
            calendarUrl: {
                not: null
            }
        },
        select: {
            guildId: true
        }
    })
    for (const guild of guilds) {
        await updateGuildCalendar(guild.guildId)
    }
}

export async function updateCalendars() {
    const guilds = await prisma.guildData.findMany({
        where: {
            calendarUrl: {
                not: null
            },
        },
        select: {
            guildId: true,
            CalendarMessageData: {
                select: {
                    channelId: true,
                    messageId: true
                }
            }
        }
    })
    for (const guild of guilds) {
        upsertCalendarMessage(guild.guildId, guild.CalendarMessageData?.channelId as string, guild.CalendarMessageData?.messageId ?? null, findNextEvent(icalMap.get(guild.guildId) as CalendarResponse) as MCalendarComponent)
    }
}

const exemptedEvents = ["Férié", "Vacances", "Jour férié"]

/*{
    "type": "VEVENT",
    "params": [],
    "categories": [
        "HYPERPLANNING"
    ],
    "dtstamp": "2024-11-19T11:33:16.000Z",
    "uid": "Ferie-13-BONNELL_Nathan-Index-Education",
    "start": "2025-08-14T22:00:00.000Z",
    "datetype": "date",
    "end": "2025-08-15T22:00:00.000Z",
    "summary": {
        "params": {
            "LANGUAGE": "fr"
        },
        "val": "Férié"
    },
    "method": "PUBLISH"
}*/

type MCalendarComponent = CalendarComponent & {
    summary?: {
        val: string
    },
    start: string | Date,
    end: string | Date,
}

function findNextEvent(calendar: CalendarResponse): MCalendarComponent | null {
    let nextEvent: CalendarComponent | null = null
    let nextEventTime: number = Infinity
    const now = new Date().getTime()
    Object.keys(calendar).forEach(key => {
        const event = calendar[key] as MCalendarComponent
        const eventStart = new Date(event.start).getTime()
        if (event.summary?.val && !exemptedEvents.includes(event.summary.val)) {
            if (eventStart > now && eventStart < nextEventTime) {
                nextEvent = event
                nextEventTime = eventStart
            }
        }
    })
    logger.debug(`Next event: ${JSON.stringify(nextEvent)}`)
    return nextEvent
}

function prepareEmbed(nextEvent: MCalendarComponent): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("Prochain événement")
        .setColor(0x00FF00)
        .setDescription(`**${nextEvent.summary?.val}**`)
        .addFields({
            name: "Début",
            value: `<t:${Math.floor(new Date(nextEvent.start).getTime() / 1000)}:R>`, 
            inline: true
        }, {
            name: "Fin",
            value: `<t:${Math.floor(new Date(nextEvent.end).getTime() / 1000)}:R>`,
            inline: true
        })
        .setTimestamp()
        .setFooter({ text: `GLaDOS Assistant - Pour vous servir.`, iconURL: client.user?.displayAvatarURL() })
    return embed
}

async function upsertCalendarMessage(guildId: string, channelId: string, messageId: string | null, nextEvent: MCalendarComponent): Promise<void> {
    if (messageId) {
        const message = await client.channels.fetch(channelId).then(channel => (channel as TextChannel).messages.fetch(messageId))
        await message.edit({ embeds: [prepareEmbed(nextEvent)] })
    } else {
        const message = await client.channels.fetch(channelId).then(channel => (channel as TextChannel).send({ embeds: [prepareEmbed(nextEvent)] }))
        await prisma.guildData.update({
            where: {
                guildId
            },
            data: {
                CalendarMessageData: {
                    create: {
                        guildId: guildId,
                        channelId: channelId,
                        messageId: message.id,
                    }
                }
            }
        })
    }
}
