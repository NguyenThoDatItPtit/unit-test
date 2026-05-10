import { Answer, CreateAnswerInput } from "./answer.model";

export interface Question {
  question_id: number;
  question_name: string;
  question_content: string;
  available?: boolean;
  answers: Answer[];
  source? : string;
  type_question: number;
  images?: []
}


export type CreateQuestionPayload = {
  question_name: string;
  question_content: string;
  available?: boolean;
  source?: string;
  type_question?: number;
  point_type?: number;
  images?: [];
  answers: CreateAnswerInput[];
};

export type CorrectAnswerInfo = {
  type_question: number;
  correct_answers: number[];
  correct_text?: string;
};
