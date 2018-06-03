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
  userId: number;
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
  private readonly handleJoinRoom = (socket: socketIo.Socket) => async (jsonInfo: string) => {

    const info: IJoinRoomInfo = JSON.parse(jsonInfo);

    const userRoom = await this.roomService.getRoomFromUser(info.userId);

    if (!!userRoom) {

      if (userRoom.uuid !== info.roomId) {
        this.socketIoLog(`Removing user with id ${info.userId} from room ${info.roomId}`);
        await this.roomService.removeUserFromRoom(userRoom.uuid, info.userId);
      }

      this.socketIoLog('Removing all listeners, leaving all rooms');
      socket.removeAllListeners('message');
      socket.leaveAll();
    }

    await this.roomService.addUserToRoom(info.roomId, info.userId);

    this.socketIoLog(`Joining room ${info.roomId}, registering message handler`);

    socket.join(info.roomId);
    socket.on('message', this.handleClientMessage(socket, info.roomId));
  };

  private readonly handleClientMessage = (socket: socketIo.Socket, roomId: string) => (message: any) => {
    this.socketIoLog(`Sending message ${message} to room ${roomId}`);
    socket.to(roomId).emit('message', message);
  };

}
