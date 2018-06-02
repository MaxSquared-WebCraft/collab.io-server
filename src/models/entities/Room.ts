import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { v4 as uuid } from 'uuid';

@Entity()
export class Room {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  uuid: string;

  @OneToMany(() => User, (user) => user.room)
  users: User[];

  constructor(name: string) {
    this.name = name;
    this.uuid = uuid();
  }
}
