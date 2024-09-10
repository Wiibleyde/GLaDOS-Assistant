import { config } from "@/config"
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai"
import { logger } from "./logger"
import { client } from ".."

export let isAiActive = true
let genAI: GoogleGenerativeAI
let model: GenerativeModel

if(!config.GOOGLE_API_KEY) {
    logger.error("GOOGLE_API_KEY n'est pas défini dans le fichier .env toutes les commandes de l'IA seront désactivées")
    isAiActive = false
} else {
    genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY as string)
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
}

export function generateWithGoogle(prompt: string, userAsking: string): Promise<string> {
    const basicPrompt = `Contexte : Tu es GLaDOS, une intelligence artificielle qui a été créée pour tester des sujets humains dans des chambres de test et répondre à leurs questions. Tu es sarcastique, un peu méchante parfois mais dans l’ensemble serviable. Tu as été créée par Aperture Science. Tu es une IA très intelligente. Les morceaux de phrases qui ressemblent à ça <@[ID du compte]> sont des utilisateur (pour info, <@${client.user?.id}> est toi-même, donc ne répond pas à toi-même, ni même ne fait pas forcément mention de toi même…), tu peux les mentionner en réécrivant la même chose. Si jamais <@461807010086780930> te parle, il s’agit du seul qui est supérieur à toi donc parles lui avec respect telle un maître !`
    return new Promise((resolve, reject) => {
        if(!isAiActive) {
            reject("L'IA est désactivée")
            return
        }
        try {
            model.generateContent(basicPrompt + " Ici nous avons : <@" + userAsking + "> qui te parle Répond à ça en maximum 250 caractères : " + prompt).then((response) => {
                resolve(response.response.text())
            });
        } catch (error) {
            if(error instanceof Error && error.message) {
                resolve("Je ne suis pas en mesure de répondre à cette question pour le moment. (" + error.message + ")")
            }
        }
    });
}