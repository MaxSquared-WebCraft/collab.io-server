import { User } from '../models/entities/User';
import { Room } from '../models/entities/Room';

export interface IRoomService {
  createRoom: (roomName: string, currUser: User) => Promise<string>;
  listRooms: () => Promise<Room[]>;
  getRoomId: (roomName: string) => Promise<string>;
  removeRoom: (roomName: string, currUser: User) => Promise<void>;
}
