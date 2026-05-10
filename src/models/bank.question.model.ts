export interface BankQuestion {
    bank_id: number;
    question_id: number;
}

export type UserAnswerGrouped = {
    question_id: number;
    answer_id: number[];
    user_answer_text: string | null;
};

export type AnswerCorrectGrouped = {
    question_id: number;
    question_content: string;
    correct_answers: {
        answer_id: number;
        answer_content: string;
    }[];
};