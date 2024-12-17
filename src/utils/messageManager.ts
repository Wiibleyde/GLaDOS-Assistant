/* eslint-disable no-useless-escape */
const quoiRegexs = [
    // Quoi
    /qu+o+i+[\ ?]*\?*$/,
    /qu+o+i+[\ +]*\?*$/,

    // Koa
    /ko+a+[\ ?]*\?*$/,
    /ko+a+[\ +]*\?*$/
]

export const possibleResponses = [
    {
        response: "Feur.",
        probability: 80
    },
    {
        response: "coubeh.",
        probability: 10
    },
    {
        response: "drilatère.",
        probability: 10
    }
]


export function detectFeur(message: string): boolean {
    for (const regex of quoiRegexs) {
        if (regex.test(message.toLowerCase())) {
            return true
        }
    }
    return false
}

export function generateResponse(): string {
    const random = Math.random() * 100
    let cumulativeProbability = 0
    for (const response of possibleResponses) {
        cumulativeProbability += response.probability
        if (random <= cumulativeProbability) {
            return response.response
        }
    }
    return "Feur."
}