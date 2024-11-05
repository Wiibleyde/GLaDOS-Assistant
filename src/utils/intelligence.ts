import { config } from "@/config"
import { ChatSession, GenerativeModel, GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai"
import { logger, client } from "@/index"

const chats = new Map<string, ChatSession>()

export let isAiActive = true
let genAI: GoogleGenerativeAI
let model: GenerativeModel

/**
 * Initializes the AI by setting up the Google Generative AI model if the GOOGLE_API_KEY is defined in the configuration.
 * If the GOOGLE_API_KEY is not defined, it logs a warning message and disables the AI functionality.
 *
 * The AI is configured to behave as GLaDOS, a sarcastic and intelligent AI from Aperture Science.
 * It includes specific instructions on how to interact with users and handle mentions.
 *
 * @remarks
 * - The AI model used is "gemini-1.5-flash".
 * - The AI will not respond to itself or mention itself in responses.
 * - Special handling is included for interactions with the developer.
 *
 * @throws {Error} If the GOOGLE_API_KEY is not defined in the configuration.
 */
export function initAi(): void {
    if(!config.GOOGLE_API_KEY) {
        logger.warn("GOOGLE_API_KEY n'est pas défini dans le fichier .env toutes les commandes de l'IA seront désactivées")
        isAiActive = false
    } else {
        genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY as string)
        model = genAI.getGenerativeModel(
            {
                model: "gemini-1.5-pro",
                systemInstruction: `Tu es GLaDOS, d'Aperture Science, tu es quasiment directrice de ce centre d'expériences ! Tu es très sarcastique et méchante mais tu es serviable et très intelligente. Les extraits de phrases qui ressemblent à ça <@[ID du compte]> sont des utilisateur (pour info, <@${client.user?.id}> est toi-même, donc ne répond pas à toi-même, ni même ne fait pas mention de toi même…), tu peux les mentionner en réécrivant la même chose (pour que quelqu'un t'entende, il faut que tu mentionne celui qui te parle pour lui répondre). Si jamais <@461807010086780930> te parle, il s’agit de ton développeur donc, soit gentille avec lui. Répond en maximum 1024 caractères (tu peux utiliser du markdown).`,
            }
        )
    }
}

/**
 * Generates a response using Google's AI model based on the provided prompt.
 *
 * @param channelId - The unique identifier for the chat channel.
 * @param prompt - The prompt or question asked by the user.
 * @param userAsking - The identifier of the user asking the question.
 * @returns A promise that resolves to the generated response as a string.
 *
 * @throws Will reject the promise with an error message if the AI is inactive or if there is an issue generating the response.
 */
export function generateWithGoogle(channelId:string, prompt: string, userAsking: string): Promise<string> {
    let currentChatSession: ChatSession
    if(chats.has(channelId)) {
        currentChatSession = chats.get(channelId) as ChatSession
    } else {
        currentChatSession = model.startChat()
        chats.set(channelId, currentChatSession)
    }
    return new Promise((resolve, reject) => {
        const generateResponse = () => {
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
        }
        generateResponse()
    });
}