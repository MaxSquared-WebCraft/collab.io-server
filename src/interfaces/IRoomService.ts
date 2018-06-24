import { User } from '../models/entities/User';
import { Room } from '../models/entities/Room';

export interface IRoomService {

  /* Rest only methods */

  createRoom: (roomName: string) => Promise<Room>;
  listRooms: () => Promise<Room[]>;
  getRoomId: (roomName: string) => Promise<string>;
  getRoomByName: (roomName: string) => Promise<Room>;
  getUsersFromRoom: (roomId: string) => Promise<User[]>;
  deleteRoomById: (roomId: string) => Promise<void>;
  deleteRoomByName: (roomName: string) => Promise<void>;

  /* Other service methods */

  addUserToRoom: (roomId: string, userId: number, suppressError?: boolean) => Promise<void>;
  removeUserFromRoom: (roomId: string, userId: number) => Promise<void>;
  getRoomFromUser: (userId: number, suppressError?: boolean) => Promise<Room>;
}
