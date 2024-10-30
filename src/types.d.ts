interface QuizType {
    question: string
    answer: string
    badAnswers: string[]
    category: string
    difficulty: string
    createdAt: number
    shuffleAnswers?: string[]
    rightUsers?: string[]
    wrongUsers?: string[]
}

interface Modules {
    name: string
    status: StatusEnum
}

interface Status {
    bot: StatusEnum
    modules: Modules[]
}