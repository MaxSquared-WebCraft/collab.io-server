import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './Room';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  pwHash: string;

  @OneToMany(() => Room, (room) => room.user)
  rooms: Room[];
}