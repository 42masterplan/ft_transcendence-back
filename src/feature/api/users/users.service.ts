import { AchievementUseCase } from './application/use-case/achievement.use-case';
import { UsersUseCase } from './application/use-case/users.use-case';
import { User } from './domain/user';
import { CreateUserDto } from './presentation/dto/create-user.dto';
import { UpdateUserDto } from './presentation/dto/update-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersUseCase: UsersUseCase,
    private readonly achievementUseCase: AchievementUseCase,
  ) {}

  async updateOne(intraId: string, updateUserDto: UpdateUserDto) {
    return await this.usersUseCase.updateOne(intraId, updateUserDto);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersUseCase.createOne(createUserDto);
    await this.achievementUseCase.initAchievementStatus(user.id);
    return user;
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    return await this.usersUseCase.findOneByIntraId(intraId);
  }

  async isDuplicatedName(name: string, intraId: string): Promise<boolean> {
    const user = await this.usersUseCase.findOneByName(name);
    if (user && user.intraId !== intraId) return true;
    return false;
  }
}
