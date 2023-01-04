import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(user: Pick<UserEntity, 'balance'>) {
    return await this.usersRepository.save(user);
  }

  async incBalance(userId: number, amount: number) {
    return await this.usersRepository.increment(
      {
        id: userId,
      },
      'balance',
      amount,
    );
  }
}
