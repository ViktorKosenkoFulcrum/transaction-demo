import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserOrderEntity } from './entities/user-order.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserOrderEntity)
    private userOrderEntityRepository: Repository<UserOrderEntity>,
    private dataSource: DataSource,
  ) {}

  async create(user: Pick<UserEntity, 'balance'>) {
    return await this.usersRepository.save(user);
  }

  async incBalance(orderId: string, userId: number, amount: number) {
    const userOrder = await this.userOrderEntityRepository.findOneBy({
      originalId: orderId,
    });
    if (userOrder && userOrder.status === 'success') {
      throw new Error('duplication');
    }
    return await this.usersRepository.increment(
      {
        id: userId,
      },
      'balance',
      amount,
    );
  }

  async incBalanceTransaction(orderId: string, userId: number, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userOrder = await queryRunner.manager.findOneBy(UserOrderEntity, {
        originalId: orderId,
      });
      if (userOrder && userOrder.status === 'success') {
        throw new Error('duplication');
      }
      await queryRunner.manager.increment(
        UserEntity,
        {
          id: userId,
        },
        'balance',
        amount,
      );
      await queryRunner.manager.upsert(
        UserOrderEntity,
        {
          originalId: orderId,
          status: 'success',
        },
        ['originalId'],
      );

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
