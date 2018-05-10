import { User } from '../models/entities/User';

export interface IRoomService {
  createRoom: (roomName: string, currUser: User) => Promise<string>;
  getRoomId: (roomName: string) => Promise<string>;
  removeRoom: (roomName: string, currUser: User) => Promise<void>;
}
