import { Authorized, BodyParam, CurrentUser, Delete, Get, JsonController, Post, QueryParam } from 'routing-controllers';
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
  @Delete('/id')
  public removeRoomById(@QueryParam('id') id: string): Promise<void> {
    return this.roomService.deleteRoomById(id);
  }

  @Authorized()
  @Delete('/name')
  public removeRoomByName(@QueryParam('name') name: string): Promise<void> {
    return this.roomService.deleteRoomByName(name);
  }

  @Authorized()
  @Get('/list')
  public listRooms(): Promise<Room[]> {
    return this.roomService.listRooms();
  }

  @Authorized()
  @Get('/id')
  public getRoomId(@QueryParam('name') roomName: string): Promise<string> {
    return this.roomService.getRoomId(roomName);
  }

  @Authorized()
  @Get('/users')
  public getRoomUsers(@QueryParam('roomId') roomId: string): Promise<User[]> {
    return this.roomService.getUsersFromRoom(roomId);
  }

}
