export interface CardType {
  id: number;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'finished';
