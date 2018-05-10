import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/entities/User';
import { Token } from '../models/Token';
import { Service } from 'typedi';

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  findByToken(token: Token) {
    return this.findOne({ name: token.name });
  }
}
