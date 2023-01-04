import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserTransactionEntity } from './entities/user-transaction.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserTransactionEntity)
    private userTransactionRepository: Repository<UserTransactionEntity>,
    private dataSource: DataSource,
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

  async incBalanceTransaction(
    transactionId: string,
    userId: number,
    amount: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const userTransaction = await queryRunner.manager.findOneBy(
        UserTransactionEntity,
        { originalId: transactionId },
      );
      if (userTransaction && userTransaction.status === 'success') {
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
        UserTransactionEntity,
        {
          originalId: transactionId,
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
