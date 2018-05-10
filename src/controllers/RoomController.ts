import { Authorized, BodyParam, CurrentUser, Delete, Get, JsonController, Post, QueryParam } from 'routing-controllers';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { User } from '../models/entities/User';
import { RoomServiceImpl } from '../services/controllers/RoomServiceImpl';
import { Inject } from 'typedi';
import { IRoomService } from '../interfaces/IRoomService';

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
  ) {
    return this.roomService.createRoom(roomName, user);
  }

  @Get()
  public getRoomId(@QueryParam('name') roomName: string) {
    return this.roomService.getRoomId(roomName);
  }

  @Authorized()
  @Delete()
  public removeRoom(
    @CurrentUser() user: User,
    @BodyParam('name') roomName: string
  ) {
    return this.roomService.removeRoom(roomName, user);
  }

}
