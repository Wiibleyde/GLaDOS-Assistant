import * as ping from "./general/ping"
import * as info from "./general/info"
import * as talk from "./general/talk"
import * as quote from "./general/quote"
import * as birthday from "./general/birthday"
import * as help from "./general/help"

import * as channels from "./config/channels"
import * as rename from "./config/rename"

import * as cat from "./fun/cat"
import * as dog from "./fun/dog"

import * as quiz from "./fun/quiz/quiz"
import * as addquestion from "./fun/quiz/addquestion"
import * as quizstats from "./fun/quiz/quizstats"
import * as leaderboard from "./fun/quiz/leaderboard"

import * as createradio from "./hope/createradio"
import * as addradio from "./hope/addradio"
import * as removeradio from "./hope/removeradio"

import * as chaban from "./utils/chaban"

import { addBirthdayModal } from "./general/birthday"

import { handleQuizButton, reportQuestionButton, reportQuestionModal } from "./fun/quiz/quiz"

import { changeRadio, changeRadioModal } from "./hope/changeRadio"

import * as logs from "./dev/logs"
import * as debug from "./dev/debug"
import * as maintenance from "./dev/maintenance"

export const commands = {
    ping,
    info,
    talk,
    birthday,
    channels,
    rename,
    quote,
    cat,
    dog,
    quiz,
    help,
    addquestion,
    quizstats,
    leaderboard,
    chaban,

    // Hope commands
    createradio,
    addradio,
    removeradio
}

export const devCommands = {
    logs,
    debug,
    maintenance
}

export const modals = {
    addBirthdayModal,
    reportQuestionModal,
    changeRadioModal,
}

export const buttons = {
    handleQuizButton,
    reportQuestionButton,
    changeRadio
}