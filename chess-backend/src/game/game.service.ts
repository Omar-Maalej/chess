import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';
import { Game } from './game.interface';

const prefix = "CHESS_";

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();

  createGame(playerId: string): string {
    const gameId = prefix + this.generateGameId().toUpperCase();
    const game = new Chess(); 
    this.games.set(gameId, { game, id: gameId, players: [playerId] });
    return gameId;
  }

  joinGame(gameId: string, playerId: string): { success: boolean, fen?: string, message?: string } {
    const game = this.games.get(gameId);
    if (!game) return { success: false, message: 'Invalid game ID' };
    if (game.players.length === 2) return { success: false, message: 'Game is full' };
    game.players.push(playerId);
    return { success: true, fen: game.game.fen() };
  }

  makeMove(gameId: string, move: any): { success: boolean, fen?: string, message?: string } {
    const game = this.games.get(gameId);
    if (!game) return { success: false, message: 'Invalid game ID' };
    game.game.move(move);
    return { success: true, fen: game.game.fen() };
  }

  private generateGameId(): string {
    return Math.random().toString(36).substr(2, 7);
  }
}
