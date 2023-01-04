import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { IncBalanceDto } from './dto/inc.balance.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-user-1')
  async createUser() {
    return await this.usersService.create({ balance: 0 });
  }

  @Post('inc-balance')
  async incBalance(
    @Body() { userId, amount, isTransaction, id }: IncBalanceDto,
  ) {
    if (isTransaction) {
      return await this.usersService.incBalanceTransaction(id, userId, amount);
    }
    return await this.usersService.incBalance(userId, amount);
  }
}
