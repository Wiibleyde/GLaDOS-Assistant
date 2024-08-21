import * as ping from "./general/ping"
import * as info from "./general/info"
import * as talk from "./general/talk"

import * as birthday from "./birthday/birthday"
import { addBirthdayModal } from "./birthday/birthday"

import * as logs from "./dev/logs"

export const commands = {
    ping,
    info,
    talk,
    birthday,
}

export const devCommands = {
    logs,
}

export const modals = {
    addBirthdayModal,
}