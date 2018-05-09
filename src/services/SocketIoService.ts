import * as io from 'socket.io';
import * as http from 'http';

import { Service } from 'typedi';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { Connection } from 'typeorm';
import { OrmConnection } from 'typeorm-typedi-extensions';
import { AuthService } from './AuthService';
import { UnauthorizedError } from 'routing-controllers';
import Socket = SocketIO.Socket;
import Server = SocketIO.Server;

@Service()
export class SocketIoService {

  private initialized: boolean = false;
  private io: Server;

  constructor(
    @OrmConnection() private readonly connection: Connection,
    @Logger() private readonly logger: ILogger,
    private readonly authService: AuthService,
  ) { }

  public initialize(server: http.Server) {
    this.logger.verbose('[socket.io]: Initializing socketIo');
    this.io = io(server, { serveClient: false });
    this.io.use(this.authorizeSocketConnection);
    this.io.on('connect', this.connectionHandler('connected'));
    this.io.on('disconnect', this.connectionHandler('disconnected'));
    this.initialized = true;
  }

  private readonly connectionHandler = (action: string) => (socket: Socket) => {
    this.logger.verbose(`[socket.io]: Client with ip ${socket.handshake.address} ${action}`);
  };

  private readonly authorizeSocketConnection = async (socket: Socket, next) => {

    this.logger.verbose('[socket.io]: Authorizing incomming connection');

    const token = socket.handshake.query.auth;
    const data = await this.authService.verifyToken(token);

    if (!data) {
      this.logger.verbose('[socket.io]: Client not authorized');
      next(new UnauthorizedError());
    } else {
      this.logger.verbose('[socket.io]: Client successfully authorized');
      next();
    }
  };

  public emit(event: string, message?) {
    if (!this.initialized) throw new Error('[socket.io]: SocketIo not initialized yet');
    this.logger.verbose(`[socket.io]: Emitting event [${event}]`, message);
    this.io.emit(event, message);
  }

}
