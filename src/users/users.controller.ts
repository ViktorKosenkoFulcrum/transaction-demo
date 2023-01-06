import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { IncBalanceDto } from './dto/inc.balance.dto';
import { QueryFailedErrorFilter } from './filters/query-failed-error.filter';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-user-1')
  async createUser() {
    return await this.usersService.create({ balance: 0 });
  }

  @UseFilters(QueryFailedErrorFilter)
  @Post('inc-balance')
  async incBalance(
    @Body() { userId, amount, isTransaction, id }: IncBalanceDto,
  ) {
    if (isTransaction) {
      return await this.usersService.incBalanceTransaction(id, userId, amount);
    }
    return await this.usersService.incBalance(id, userId, amount);
  }

  @UseFilters(QueryFailedErrorFilter)
  @Post('save-balance')
  async saveBalance(@Body() { userId, amount, id }: IncBalanceDto) {
    return await this.usersService.saveBalance(id, userId, amount.toString());
  }
}
