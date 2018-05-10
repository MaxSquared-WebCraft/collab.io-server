import { Service, Token } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../interfaces/ILogger';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Room } from '../../models/entities/Room';
import { v4 as uuid } from 'uuid';
import { IRoomService } from '../../interfaces/IRoomService';
import { User } from '../../models/entities/User';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Repository } from 'typeorm';

export const RoomServiceImpl = new Token<RoomService>();

@Service(RoomServiceImpl)
export class RoomService implements IRoomService {

  constructor(
    @Logger() private readonly logger: ILogger,
    @OrmRepository(Room) private readonly roomRepository: Repository<Room>
  ) {
    this.logger.verbose('Initializing Room service');
  }

  public async createRoom(roomName: string, user: User): Promise<string> {

    this.logger.verbose(`Creating room with name ${roomName}`);

    if (!user) throw new NotFoundError('User not found');

    const newRoom = new Room();
    newRoom.name = roomName;
    newRoom.uuid = uuid();
    newRoom.user = user;

    await this.roomRepository.save(newRoom);

    return newRoom.uuid;
  }

  public async getRoomId(roomName: string): Promise<string> {
    const room = await this.roomRepository.findOne({ name: roomName });
    if (!room) throw new NotFoundError(`Room with name '${roomName}' not found.`);
    return room.uuid;
  }

  public async removeRoom(roomName: string, currUser: User): Promise<void> {

    const room = await this.roomRepository.findOne({ name: roomName }, { relations: ['user'] });

    if (!room) throw new NotFoundError(`Room with name '${roomName}' not found.`);
    if (room.user.id !== currUser.id) throw new UnauthorizedError('You can only remove your own rooms.');

    await this.roomRepository.remove(room);
  }

}
