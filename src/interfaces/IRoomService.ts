import { User } from '../models/entities/User';
import { Room } from '../models/entities/Room';

export interface IRoomService {

  /* Rest only methods */

  createRoom: (roomName: string, currUser: User) => Promise<string>;
  listRooms: () => Promise<Room[]>;
  getRoomId: (roomName: string) => Promise<string>;
  getUsersFromRoom: (roomId: string) => Promise<User[]>;

  /* Other service methods */

  addUserToRoom: (roomId: string, userId: number) => Promise<void>;
  removeUserFromRoom: (roomId: string, userId: number) => Promise<void>;
  getRoomFromUser: (userId: number) => Promise<Room>;
}
