import { changeRadio } from "./hope/changeRadio";
import { handleAddRadio } from "./hope/handleAddRadio";
import { handleRemoveRadio } from "./hope/handleRemoveRadio";
import { handleMotusTry } from "./motus/handleMotusTry";
import { handleQuizButton } from "./quiz/handleQuizButton";
import { reportQuestionButton } from "./quiz/reportQuestionButton";

import { backButton } from "../commands/music/back";
import { loopButton } from "../commands/music/loop";
import { resumeAndPauseButton } from "../commands/music/pause";
import { skipButton } from "../commands/music/skip";

export const buttons = {
    handleQuizButton,
    reportQuestionButton,
    changeRadio,
    handleMotusTry,
    handleAddRadio,
    handleRemoveRadio,

    backButton,
    resumeAndPauseButton,
    skipButton,
    loopButton,
}