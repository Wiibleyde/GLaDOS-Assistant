import * as ping from "./general/ping"
import * as info from "./general/info"
import * as talk from "./general/talk"
import * as quote from "./general/quote"
import * as birthday from "./general/birthday"
import * as help from "./general/help"

import * as channels from "./config/channels"
import * as rename from "./config/rename"

import * as cat from "./fun/cat"

import * as quiz from "./fun/quiz/quiz"
import * as addquestion from "./fun/quiz/addquestion"
import * as quizstats from "./fun/quiz/quizstats"

import { addBirthdayModal } from "./general/birthday"

import { handleQuizButton } from "./fun/quiz/quiz"

import * as logs from "./dev/logs"
import * as debug from "./dev/debug"

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
    addquestion,
    quizstats,
}

export const devCommands = {
    logs,
    debug,
}

export const modals = {
    addBirthdayModal,
}

export const buttons = {
    handleQuizButton,
}