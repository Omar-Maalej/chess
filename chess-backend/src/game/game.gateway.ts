import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Chess } from 'chess.js';

@WebSocketGateway({cors : {
  origin: "http://localhost:5173",
}})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private games: Map<string, Chess> = new Map();

  @SubscribeMessage('createGame')
  handleCreateGame(@ConnectedSocket() client: Socket) {
    const gameId = this.generateGameId();
    const game = new Chess();
    this.games.set(gameId, game);
    client.join(gameId);
    client.emit('gameCreated', { gameId });
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(@MessageBody() gameId: string, @ConnectedSocket() client: Socket) {
    const game = this.games.get(gameId);
    console.log("game", gameId)
    if (game) {
      client.join(gameId);
      client.emit('gameJoined', { fen: game.fen(), gameId: gameId });
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    } else {
      client.emit('error', 'Invalid game ID');
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(@MessageBody() data: { gameId: string, move: any }, @ConnectedSocket() client: Socket) {
    const game = this.games.get(data.gameId);
    if (game) {
      game.move(data.move);
      const fen = game.fen();
      console.log('makeMove', data.move , data.gameId)
      this.server.to(data.gameId).emit('moveMade', { fen });
    } else {
      client.emit('error', 'Invalid game ID');
    }
  }

  private generateGameId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
