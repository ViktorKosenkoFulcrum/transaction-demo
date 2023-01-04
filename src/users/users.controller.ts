import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-user-1')
  async createUser() {
    return await this.usersService.create({ balance: 0 });
  }
}
