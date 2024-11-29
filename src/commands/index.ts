import * as ping from "./general/ping"
import * as info from "./general/info"
import * as talk from "./general/talk"
import * as quote from "./general/quote"
import * as birthday from "./general/birthday"
import * as help from "./general/help"

import * as config from "./config/config"
import * as rename from "./config/rename"

import * as cat from "./fun/cat"
import * as dog from "./fun/dog"
import * as blague from "./fun/blague"

import * as quiz from "./fun/quiz/quiz"
import * as addquestion from "./fun/quiz/addquestion"
import * as quizstats from "./fun/quiz/quizstats"
import * as leaderboard from "./fun/quiz/leaderboard"

import * as createradio from "./hope/createradio"
import * as addradio from "./hope/addradio"
import * as removeradio from "./hope/removeradio"

import * as createcalendar from "./calendar/createcalendar"

import * as chaban from "./utils/chaban"

import { addBirthdayModal } from "./general/birthday"

import { handleQuizButton, reportQuestionButton, reportQuestionModal } from "./fun/quiz/quiz"

import { changeRadio, changeRadioModal } from "./hope/changeRadio"

import * as logs from "./dev/logs"
import * as debug from "./dev/debug"
import * as maintenance from "./dev/maintenance"

import * as back from "./music/back"
import * as clear from "./music/clear"
import * as filter from "./music/filter"
import * as pause from "./music/pause"
import * as play from "./music/play"
import * as resume from "./music/resume"
import * as skip from "./music/skip"
import * as loop from "./music/loop"
import * as syncedlyrics from "./music/syncedlyrics"
import * as queue from "./music/queue"
import * as nowplaying from "./music/nowplaying"
import * as remove from "./music/remove"
import * as stop from "./music/stop"

import { backButton } from "./music/back"
import { resumeAndPauseButton } from "./music/pause"
import { skipButton } from "./music/skip"
import { loopButton } from "./music/loop"

export const commands = {
    ping,
    info,
    talk,
    birthday,
    config,
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
    blague,

    // Calendar commands
    createcalendar,

    // Hope commands
    createradio,
    addradio,
    removeradio,

    // Music commands
    back,
    clear,
    filter,
    pause,
    play,
    resume,
    skip,
    loop,
    syncedlyrics,
    queue,
    nowplaying,
    remove,
    stop,
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
    changeRadio,
    backButton,
    resumeAndPauseButton,
    skipButton,
    loopButton,
}