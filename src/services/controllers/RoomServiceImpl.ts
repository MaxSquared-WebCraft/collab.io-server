import { Service, Token } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../interfaces/ILogger';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Room } from '../../models/entities/Room';
import { IRoomService } from '../../interfaces/IRoomService';
import { User } from '../../models/entities/User';
import { NotFoundError } from 'routing-controllers';
import { UserRepository } from '../../repositories/UserRepository';
import { RoomRepository } from '../../repositories/RoomRepository';

export const RoomServiceImpl = new Token<RoomService>();

@Service(RoomServiceImpl)
export class RoomService implements IRoomService {

  constructor(
    @Logger() private readonly logger: ILogger,
    @InjectRepository() private readonly roomRepository: RoomRepository,
    @InjectRepository() private readonly userRepository: UserRepository
  ) {
    this.logger.verbose('Initializing Room service');
  }

  private async fetchUserByIdWithRoom(userId: number, suppressError?: boolean): Promise<User> {
    const user = await this.userRepository.findOneByIdWithRoom(userId);
    if (suppressError) this.logger.verbose('suppressing errors in fetchUserByIdWithRoom.');
    if (!user && !suppressError) throw new NotFoundError(`User with id ${userId} not found`);
    return user;
  }

  private async fetchRoomByIdWithUsers(roomId: string, suppressError?: boolean): Promise<Room> {
    const room = await this.roomRepository.findOneByIdWithUsers(roomId);
    if (suppressError) this.logger.verbose('suppressing errors in fetchRoomByIdWithUsers.');
    if (!room && !suppressError) throw new NotFoundError(`Room with id ${roomId} not found`);
    return room;
  }

  private async fetchRoomByNameWithUsers(roomName: string, suppressError?: boolean): Promise<Room> {
    const room = await this.roomRepository.findOneByNameWitUsers(roomName);
    if (suppressError) this.logger.verbose('suppressing errors in fetchRoomByNameWithUsers.');
    if (!room && !suppressError) throw new NotFoundError(`Room with name ${roomName} not found`);
    return room;
  }

  /* Rest only methods */

  public async createRoom(roomName: string): Promise<Room> {
    this.logger.verbose(`Creating room with name ${roomName}`);
    const newRoom = new Room(roomName);
    const room = await this.roomRepository.save(newRoom);
    room.users = [];
    return room;
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

  public getRoomByName(roomName: string): Promise<Room> {
    return this.fetchRoomByNameWithUsers(roomName);
  }

  public async getUsersFromRoom(roomId: string): Promise<User[]> {
    const room = await this.fetchRoomByIdWithUsers(roomId);
    return room.users;
  }

  public async deleteRoomById(roomId: string): Promise<void> {
    const room = await this.fetchRoomByIdWithUsers(roomId);
    room.users = [];
    await this.roomRepository.save(room);
    await this.roomRepository.remove(room);
  }

  public async deleteRoomByName(name: string): Promise<void> {
    const room = await this.fetchRoomByNameWithUsers(name);
    room.users = [];
    await this.roomRepository.save(room);
    await this.roomRepository.remove(room);
  }

  /* Other service methods */

  public async addUserToRoom(roomId: string, userId: number, suppressError?: boolean): Promise<void> {
    const user = await this.fetchUserByIdWithRoom(userId, suppressError);
    const room = await this.fetchRoomByIdWithUsers(roomId, suppressError);
    this.logger.verbose('add user', user, 'to room', room);
    const userExistsInRoom = !!room.users.find((u) => u.id === userId);
    if (!userExistsInRoom) {
      room.users.push(user);
      await this.roomRepository.save(room);
    }
  }

  public async removeUserFromRoom(roomId: string, userId: number): Promise<void> {
    const user = await this.fetchUserByIdWithRoom(userId);
    const room = await this.fetchRoomByIdWithUsers(roomId);
    room.users = room.users.filter((actUser) => actUser.id !== user.id);
    if (room.users.length > 0) {
      await this.roomRepository.save(room);
    } else {
      user.room = null;
      await this.userRepository.save(user);
      await this.roomRepository.delete(room);
    }
  }

  public async getRoomFromUser(userId: number, suppressError?: boolean): Promise<Room> {
    this.logger.verbose(`Getting room from user with id ${userId}`);
    const user = await this.fetchUserByIdWithRoom(userId, suppressError);
    return user ? user.room : null;
  }
}
