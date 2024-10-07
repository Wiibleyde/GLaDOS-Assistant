type QuizType = {
    question: string
    answer: string
    badAnswers: Array<string>
    category: string
    difficulty: string
    createdAt: number
    shuffleAnswers?: Array<string>
    rightUsers?: Array<string>
    wrongUsers?: Array<string>
}


type Modules = {
    name: string
    status: StatusEnum
}

type Status = {
    bot: StatusEnum
    modules: Modules[]
}