import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserOrderEntity } from './entities/user-order.entity';
import { UserBalanceEntity } from './entities/user-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserOrderEntity, UserBalanceEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
