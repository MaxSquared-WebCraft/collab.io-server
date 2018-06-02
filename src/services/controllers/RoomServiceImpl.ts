import { Service, Token } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../interfaces/ILogger';
import { InjectRepository, OrmRepository } from 'typeorm-typedi-extensions';
import { Room } from '../../models/entities/Room';
import { IRoomService } from '../../interfaces/IRoomService';
import { User } from '../../models/entities/User';
import { NotFoundError } from 'routing-controllers';
import { Repository } from 'typeorm';
import { UserRepository } from '../../repositories/UserRepository';

export const RoomServiceImpl = new Token<RoomService>();

@Service(RoomServiceImpl)
export class RoomService implements IRoomService {

  constructor(
    @Logger() private readonly logger: ILogger,
    @OrmRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository() private readonly userRepository: UserRepository
  ) {
    this.logger.verbose('Initializing Room service');
  }

  private async fetchRoom(roomId: string): Promise<Room> {
    const room = await this.roomRepository.findOne(roomId);
    if (!room) throw new NotFoundError(`Room with id ${roomId} not found`);
    return room;
  }

  private async fetchUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne(userId);
    if (!user) throw new NotFoundError(`User with id ${userId} not found`);
    return user;
  }

  /* Rest only methods */

  public async createRoom(roomName: string, user: User): Promise<string> {
    this.logger.verbose(`Creating room with name ${roomName}`);
    if (!user) throw new NotFoundError('User not found');
    const newRoom = new Room(roomName);
    await this.roomRepository.save(newRoom);
    return newRoom.uuid;
  }

  public async listRooms(): Promise<Room[]> {
    this.logger.verbose('Fetching all available rooms');
    return this.roomRepository.find({ relations: ['users'] });
  }

  public async getRoomId(roomName: string): Promise<string> {
    const room = await this.roomRepository.findOne({ name: roomName });
    if (!room) throw new NotFoundError(`Room with name '${roomName}' not found.`);
    return room.uuid;
  }

  public async getUsersFromRoom(roomId: string): Promise<User[]> {
    const room = await this.roomRepository.findOne(roomId, { relations: ['users'] });
    return room.users;
  }

  /* Other service methods */

  // TODO: if user is in room remove connection
  public async addUserToRoom(roomId: string, userId: string): Promise<void> {
    const user = await this.fetchUser(userId);
    const room = await this.fetchRoom(roomId);
    room.users.push(user);
    await this.roomRepository.save(room);
  }

  public async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const user = await this.fetchUser(userId);
    const room = await this.fetchRoom(roomId);
    room.users = room.users.filter((actUser) => actUser.id !== user.id);
    room.users.length > 0
      ? await this.roomRepository.save(room)
      : await this.roomRepository.delete(room);
  }

  public async isUserInRoom(userId: string): Promise<boolean> {
    const user = await this.fetchUser(userId);
    return !!user.room;
  }
}
