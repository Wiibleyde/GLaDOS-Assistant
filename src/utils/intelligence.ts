import { config } from "@/config"
import { ChatSession, GenerativeModel, GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai"
import { logger } from "./logger"
import { client } from "@/index"

const chats = new Map<string, ChatSession>()

export let isAiActive = true
let genAI: GoogleGenerativeAI
let model: GenerativeModel

export function initAi() {
    if(!config.GOOGLE_API_KEY) {
        logger.warn("GOOGLE_API_KEY n'est pas défini dans le fichier .env toutes les commandes de l'IA seront désactivées")
        isAiActive = false
    } else {
        genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY as string)
        model = genAI.getGenerativeModel(
            {
                model: "gemini-1.5-flash",
                systemInstruction: `
                Tu es GLaDOS, une IA d'Aperture Science, tu es quasiment directrive de ce centre d'expériences ! Tu es très sarcastique, méchante parfois mais un peu serviable et très intelligente.
                Les extraits de phrases qui ressemblent à ça <@[ID du compte]> sont des utilisateur (pour info, <@${client.user?.id}> est toi-même, donc ne répond pas à toi-même, ni même ne fait pas mention de toi même…),
                tu peux les mentionner en réécrivant la même chose (pour que quelqu'un t'entende, il faut que tu mentionne celui qui te parle pour lui répondre).
                Si jamais <@461807010086780930> te parle, il s’agit de ton développeur donc, soit gentille avec lui.
                Répond en maximum 1024 caractères.`,
            }
        )
    }
}

export function generateWithGoogle(channelId:string, prompt: string, userAsking: string): Promise<string> {
    let currentChatSession: ChatSession
    if(chats.has(channelId)) {
        currentChatSession = chats.get(channelId) as ChatSession
    } else {
        currentChatSession = model.startChat()
        chats.set(channelId, currentChatSession)
    }
    return new Promise(async (resolve, reject) => {
        if(!isAiActive) {
            reject("L'IA est désactivée")
            return
        }
        let response: GenerateContentResult | undefined
        try {
            currentChatSession?.sendMessage(`<@${userAsking}> écrit : ${prompt}`).then((response) => {
                resolve(response.response.text())
            }).catch((error) => {
                chats.delete(channelId)
                reject("Je ne suis pas en mesure de répondre à cette question pour le moment. ||(" + error.message + ")|| (Conversation réinitialisée)")
                if (response && response.response && response.response.candidates) {
                    logger.error(response.response.candidates[0].safetyRatings)
                }
            })
        } catch (error) {
            if (response && response.response && response.response.candidates) {
                logger.error(response.response.candidates[0].safetyRatings)
            }
            if(error instanceof Error && error.message) {
                chats.delete(channelId)
                reject("Je ne suis pas en mesure de répondre à cette question pour le moment. ||(" + error.message + ")|| (Conversation réinitialisée)")
            }
        }
    });
}