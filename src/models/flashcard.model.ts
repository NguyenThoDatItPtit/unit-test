// flashcard-status.type.ts
export type FlashcardStatus = "pending" | "done" | "miss";

// flashcard.model.ts
export interface Flashcard {
  flashcard_id: number;
  front: string;
  back?: string | null;
  example?: string | null;
  created_at: Date;
  status: FlashcardStatus;
  flashcard_deck_id?: number | null;
}

