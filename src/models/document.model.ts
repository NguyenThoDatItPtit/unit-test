export interface Document {
    document_id: number;
    title: string;
    link: string;
    embedding?: number[];
    created_at: Date;
    available: boolean;
    topic_id: number;
}
