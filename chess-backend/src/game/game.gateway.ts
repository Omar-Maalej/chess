import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Chess } from 'chess.js';

interface Game {
  id: string;
  game: Chess;
  players: string[];
}

@WebSocketGateway({cors : {
  origin: "http://localhost:5173",
}})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private games: Map<string, Game> = new Map();

  @SubscribeMessage('createGame')
  handleCreateGame(@ConnectedSocket() client: Socket) {
    const gameId = this.generateGameId();
    const game = new Chess();
    this.games.set(gameId, {game, id: gameId, players: [client.id]});
    client.join(gameId);
    client.emit('gameCreated', { gameId });
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(@MessageBody() gameId: string, @ConnectedSocket() client: Socket) {
    const {game, players }= this.games.get(gameId);
    console.log("game", gameId)
    console.log("players", players)
    if(players.length === 2){
      console.log("game is full", players)
      client.emit('error', 'Game is full');
      return;
    }
    if (game) {
      client.join(gameId);
      this.games.set(gameId, {game, id: gameId, players: [...players, client.id]});
      client.emit('gameJoined', { fen: game.fen(), gameId: gameId });
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    } else {
      client.emit('error', 'Invalid game ID');
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(@MessageBody() data: { gameId: string, move: any }, @ConnectedSocket() client: Socket) {
    const {game} = this.games.get(data.gameId);
    if (game) {
      game.move(data.move);
      const fen = game.fen();
      console.log('makeMove', data.move , data.gameId)
      this.server.to(data.gameId).emit('moveMade', { fen});
    } else {
      client.emit('error', 'Invalid game ID');
    }
  }

  private generateGameId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
