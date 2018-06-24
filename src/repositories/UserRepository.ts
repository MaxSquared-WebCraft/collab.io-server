import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/entities/User';
import { IToken } from '../models/Token';
import { Service } from 'typedi';

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  public findOneByNameWithPwHash(name: string) {
    return this
      .createQueryBuilder('user')
      .select('user.pwHash')
      .addSelect('user.id')
      .addSelect('user.name')
      .where('user.name = :name', { name })
      .getOne();
  }

  public findOneByTokenWithPwHash(token: IToken) {
    return this.findOneByNameWithPwHash(token.name);
  }

  public findOneByIdWithRoom(userId: number) {
    return this.findOne(userId, { relations: ['room'] });
  }
}
