import Dexie, { type EntityTable } from 'dexie';

export interface Deck {
  id: number;
  name: string;
  createdAt: number;
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: number;
  // SM-2 state
  easeFactor: number;   // 1.3 ~ 2.5+
  interval: number;     // days until next review
  repetitions: number;  // consecutive successful recalls
  dueAt: number;        // epoch ms, when card is next due
  lastReviewedAt: number | null;
}

class FlashcardDB extends Dexie {
  decks!: EntityTable<Deck, 'id'>;
  cards!: EntityTable<Card, 'id'>;

  constructor() {
    super('FlashcardDB');
    this.version(1).stores({
      decks: '++id, name, createdAt',
      cards: '++id, deckId, dueAt, createdAt',
    });
  }
}

export const db = new FlashcardDB();
