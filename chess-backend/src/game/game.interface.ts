import { Chess } from 'chess.js';

export interface Game {
  id: string;
  game: Chess;
  players: string[];
}
