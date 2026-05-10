export interface Answer {
        answer_id: number;
        question_id: number;
        answer_content: string;
        is_correct: boolean;
        images?: string
}

export type CreateAnswerInput = {
        answer_content: string;
        is_correct: boolean;
        images?: string[];
};