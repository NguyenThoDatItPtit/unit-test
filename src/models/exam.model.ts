import { Question } from "./question.model";

export interface Exam {
    exam_id: number;
    exam_name: string;
    create_at: Date;
    questions?: Question[];
    time_limit: number;
    topic_id: number;
    exam_schedule_id: number;
    available: boolean;
    description: string;
    subject_name?: string
}

export type DoExam = {
    question_id: number;
    user_answer: (number | string)[];
};

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

type CorrectAnswerInfo = {
    type_question: number;
    correct_answers: number[];
    correct_text?: string;
  };