import * as socketIo from 'socket.io';
import * as http from 'http';

import { Inject, Service } from 'typedi';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { AuthService } from './AuthService';
import { UnauthorizedError } from 'routing-controllers';
import { RoomServiceImpl } from './controllers/RoomServiceImpl';
import { IRoomService } from '../interfaces/IRoomService';

interface IJoinRoomInfo {
  roomId: string;
  userId: string;
}

@Service()
export class SocketIoService {

  private initialized: boolean = false;
  private io: socketIo.Server;

  constructor(
    @Logger() private readonly logger: ILogger,
    @Inject(RoomServiceImpl) private readonly roomService: IRoomService,
    private readonly authService: AuthService
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

  /* Authorization middleware */

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

  /* Connection handlers
   * These functions handle the connections and disconnections of the clients
   * */

  // TODO: on start application automatically set sockets to correct room
  private readonly connectionHandler = (socket: socketIo.Socket) => {
    this.socketIoLog(`Client ${socket.id} with ip ${socket.handshake.address} connected.`);
    socket.on('room', this.handleJoinRoom(socket));
  };

  private readonly disconnectHandler = (socket: socketIo.Socket) => {
    this.socketIoLog(`Client ${socket.id} with ip ${socket.handshake.address} disconnected.`);
  };

  /* Socket handlers
   * These functions handle the individual socket communication
   */

  // TODO: emit errors on socket
  private readonly handleJoinRoom = (socket: socketIo.Socket) => async (info: IJoinRoomInfo) => {

    const isUserInRoom = this.roomService.isUserInRoom(info.userId);

    if (isUserInRoom) {
      socket.removeAllListeners('message');
      socket.leaveAll();
    }

    await this.roomService.addUserToRoom(info.roomId, info.userId);

    socket.join(info.roomId);

    socket.on('message', this.handleClientMessage(socket, info.roomId));
  };

  private readonly handleClientMessage = (socket: socketIo.Socket, roomId: string) => (message: any) => {
    socket.to(roomId).emit('message', message);
  };

}
