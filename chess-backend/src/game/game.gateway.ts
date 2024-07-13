import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: "http://localhost:5173" } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('createGame')
  handleCreateGame(@ConnectedSocket() client: Socket) {
    const gameId = this.gameService.createGame(client.id);
    client.join(gameId);
    client.emit('gameCreated', { gameId });
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(@MessageBody() gameId: string, @ConnectedSocket() client: Socket) {
    console.log('joinGame', gameId);
    const result = this.gameService.joinGame(gameId, client.id);
    if (result.success) {
      client.join(gameId);
      client.emit('gameJoined', { fen: result.fen, gameId });
    } else {
      client.emit('error', result.message);
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(@MessageBody() data: { gameId: string, move: any }, @ConnectedSocket() client: Socket) {
    const result = this.gameService.makeMove(data.gameId, data.move);
    if (result.success) {
      this.server.to(data.gameId).emit('moveMade', { fen: result.fen });
    } else {
      client.emit('error', result.message);
    }
  }
}
