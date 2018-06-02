import { Authorized, BodyParam, CurrentUser, Get, JsonController, Post, QueryParam } from 'routing-controllers';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { User } from '../models/entities/User';
import { RoomServiceImpl } from '../services/controllers/RoomServiceImpl';
import { Inject } from 'typedi';
import { IRoomService } from '../interfaces/IRoomService';
import { Room } from '../models/entities/Room';

@JsonController('/room')
export class RoomController {

  constructor(
    @Logger() private readonly logger: ILogger,
    @Inject(RoomServiceImpl) private readonly roomService: IRoomService
  ) {
    this.logger.verbose('Initializing Room controller');
  }

  @Authorized()
  @Post()
  public addRoom(
    @CurrentUser() user: User,
    @BodyParam('name') roomName: string
  ): Promise<string> {
    return this.roomService.createRoom(roomName, user);
  }

  @Authorized()
  @Get('/list')
  public listRooms(): Promise<Room[]> {
    return this.roomService.listRooms();
  }

  @Authorized()
  @Get()
  public getRoomId(@QueryParam('name') roomName: string): Promise<string> {
    return this.roomService.getRoomId(roomName);
  }

  @Authorized()
  @Get()
  public getRoomUsers(@QueryParam('roomId') roomId: string): Promise<User[]> {
    return this.roomService.getUsersFromRoom(roomId);
  }

}
