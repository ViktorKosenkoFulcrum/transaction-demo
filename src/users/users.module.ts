import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserTransactionEntity } from './entities/user-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserTransactionEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
