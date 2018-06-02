import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/entities/User';
import { IToken } from '../models/Token';
import { Service } from 'typedi';

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  findByToken(token: IToken) {
    return this.findOne({ name: token.name });
  }
}
