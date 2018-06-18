import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { Room } from '../models/entities/Room';

@Service()
@EntityRepository(Room)
export class RoomRepository extends Repository<Room> {

  findOneByNameWitUsers(roomName: string): Promise<Room> {
    return this.findOne({ name: roomName }, { relations: ['users'] });
  }

  findOneByIdWithUsers(roomId: string): Promise<Room> {
    return this.findOne({ uuid: roomId }, { relations: ['users'] });
  }
}
