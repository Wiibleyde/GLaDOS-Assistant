import * as quote from "./general/quote"

import * as profilePicture from "./general/profilePicture"

export const contextMessageMenus = {
    "Créer un citation": quote
}

export const contextUserMenus = {
    "Récupèrer la photo de profil": profilePicture
}

export const contextMenus = {
    ...contextMessageMenus,
    ...contextUserMenus
}