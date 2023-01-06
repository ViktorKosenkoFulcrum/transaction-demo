import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserOrderEntity } from './entities/user-order.entity';
import { UserBalanceEntity } from './entities/user-balance.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserOrderEntity)
    private userOrderEntityRepository: Repository<UserOrderEntity>,
    @InjectRepository(UserBalanceEntity)
    private userBalanceEntityRepository: Repository<UserBalanceEntity>,
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
    await this.userOrderEntityRepository.upsert(
      {
        originalId: orderId,
        status: 'success',
      },
      ['originalId'],
    );
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
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const userOrder = await queryRunner.manager.findOneBy(UserOrderEntity, {
        originalId: orderId,
      });
      if (userOrder && userOrder.status === 'success') {
        throw new Error('duplication');
      }
      await queryRunner.manager.upsert(
        UserOrderEntity,
        {
          originalId: orderId,
          status: 'success',
        },
        ['originalId'],
      );
      await queryRunner.manager.increment(
        UserEntity,
        {
          id: userId,
        },
        'balance',
        amount,
      );
      // const user = await queryRunner.manager.findOneBy(UserEntity, {
      //   id: userId,
      // });
      // await queryRunner.manager.update(
      //   UserEntity,
      //   {
      //     id: userId,
      //   },
      //   {
      //     balance: user.balance + amount,
      //   },
      // );

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

  async saveBalance(orderId: string, userId: number, amount: string) {
    await this.userBalanceEntityRepository.insert({
      originalId: orderId,
      status: 'success',
      amount,
      userId,
    });
  }

  async saveBalanceTransaction(
    orderId: string,
    userId: number,
    amount: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      await queryRunner.manager.insert(UserBalanceEntity, {
        originalId: orderId,
        status: 'success',
        amount,
        userId,
      });
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
