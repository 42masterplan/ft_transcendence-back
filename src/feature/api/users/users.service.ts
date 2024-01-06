import { AchievementUseCase } from './application/use-case/achievement.use-case';
import { UsersUseCase } from './application/use-case/users.use-case';
import { User } from './domain/user';
import { CreateUserDto } from './presentation/dto/create-user.dto';
import { UpdateUserDto } from './presentation/dto/update-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersUseCase: UsersUseCase,
    private readonly achievementUseCase: AchievementUseCase,
  ) {}

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersUseCase.createOne(createUserDto);
    if (!user) throw new NotFoundException('There is no such user.');
    await this.achievementUseCase.initAchievementStatus(user.id);
    return user;
  }

  async isDuplicatedName(name: string, intraId: string): Promise<boolean> {
    const user = await this.usersUseCase.findOneByName(name);
    if (user && user.intraId !== intraId) return true;
    await this.usersUseCase.updateOne(intraId, new UpdateUserDto({ name }));
    return false;
  }
}
