import * as quote from "./message/quote"

import * as profilePicture from "./user/profilePicture"

const contextMessageMenus = {
    "Créer un citation": quote
}

const contextUserMenus = {
    "Récupèrer la photo de profil": profilePicture
}


export { contextMessageMenus, contextUserMenus }