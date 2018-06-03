import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { v4 as uuid } from 'uuid';

@Entity()
export class Room {

  @PrimaryColumn()
  uuid: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.room)
  users: User[];

  constructor(name: string) {
    this.name = name;
    this.uuid = uuid();
  }
}
