import { Flashcard } from './flashcard.model';
// flashcard-deck.model.ts
export interface FlashcardDeck {
    flashcard_deck_id: number;
    title: string;
    description?: string | null;
    created_at: Date;
    flashcards?: Flashcard[];
    user_id: number | null;
  }