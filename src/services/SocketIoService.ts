import * as socketIo from 'socket.io';
import * as http from 'http';

import { Service } from 'typedi';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { AuthService } from './AuthService';
import { UnauthorizedError } from 'routing-controllers';

@Service()
export class SocketIoService {

  private initialized: boolean = false;
  private io: socketIo.Server;
  private clientMap: Map<string, string> = new Map<string, string>();

  constructor(
    @Logger() private readonly logger: ILogger,
    private readonly authService: AuthService,
  ) { }

  private socketIoLog(message: string, ...args: any[]): void {
    this.logger.verbose(`[socket.io]: ${message}`, ...args);
  }

  public initialize(server: http.Server) {
    this.socketIoLog('Initializing socketIo');
    this.io = socketIo(server, { serveClient: false });
    this.io.use(this.authorizeSocketConnection);
    this.io.on('connect', this.connectionHandler);
    this.io.on('disconnect', this.disconnectHandler);
    this.initialized = true;
  }

  private readonly handleJoinRoom = (socket: socketIo.Socket) => (room: string) => {

    const currentRoom: string = this.clientMap.get(socket.id);

    if (currentRoom && currentRoom !== room) {
      this.socketIoLog(`Client ${socket.id} leaves current room ${currentRoom}`);
      socket.leave(currentRoom);
    }

    this.socketIoLog(`Client ${socket.id} joins room ${room}`);

    this.clientMap.set(socket.id, room);
    socket.join(room);
  };

  private readonly handleClientMessage = (socket: socketIo.Socket) => (message: any) => {
    const currentRoom: string = this.clientMap.get(socket.id);
    if (currentRoom) socket.to(currentRoom).emit('message', message);
  };

  private readonly connectionHandler = (socket: socketIo.Socket) => {
    this.socketIoLog(`Client ${socket.id} with ip ${socket.handshake.address} connected.`);
    socket.on('room', this.handleJoinRoom(socket));
    socket.on('message', this.handleClientMessage(socket));
  };

  private readonly disconnectHandler = (socket: socketIo.Socket) => {
    this.socketIoLog(`Client ${socket.id} with ip ${socket.handshake.address} disconnected.`);
  };

  private readonly authorizeSocketConnection = async (socket: socketIo.Socket, next) => {

    this.socketIoLog('Authorizing incomming connection');

    const token = socket.handshake.query.auth;
    const data = await this.authService.verifyToken(token);

    this.logger.debug('token', token);

    if (!data) {
      this.socketIoLog('Client not authorized');
      next(new UnauthorizedError());
    } else {
      this.socketIoLog('Client successfully authorized');
      next();
    }
  };

}
