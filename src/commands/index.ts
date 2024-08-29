import * as ping from "./general/ping"
import * as info from "./general/info"
import * as talk from "./general/talk"
import * as quote from "./general/quote"
import * as birthday from "./general/birthday"
import * as help from "./general/help"

import * as channels from "./config/channels"
import * as rename from "./config/rename"

import * as cat from "./fun/cat"
import * as quiz from "./fun/quiz"

import { addBirthdayModal } from "./general/birthday"

import { handleQuizButton } from "./fun/quiz"

import * as logs from "./dev/logs"

export const commands = {
    ping,
    info,
    talk,
    birthday,
    channels,
    rename,
    quote,
    cat,
    quiz,
    help,
}

export const devCommands = {
    logs,
}

export const modals = {
    addBirthdayModal,
}

export const buttons = {
    handleQuizButton,
}