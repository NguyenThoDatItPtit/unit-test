import { Question } from "./question.model";

export interface Bank {
    bank_id: number;
    description: string;
    topic_id: number;
    questions?: Question[];
    available: boolean;
    time_limit: number
}

export type DoBank = {
    question_id : number;
    user_answer : (string | number)[];
}