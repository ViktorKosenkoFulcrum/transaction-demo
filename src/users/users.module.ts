import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserOrderEntity } from './entities/user-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserOrderEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
