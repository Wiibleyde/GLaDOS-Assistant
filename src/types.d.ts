type QuizType = {
    question: string
    answer: string
    badAnswers: Array<string>
    category: string
    difficulty: string
    createdAt: number
    shuffleAnswers?: Array<string>
    alreadyAnswered?: Array<number>
}