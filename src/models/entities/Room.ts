import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

export class Room {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  uuid: string;

  @ManyToOne(() => User, (user) => user.rooms)
  user: User;
}