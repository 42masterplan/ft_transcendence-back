import { TwoFactorAuthUseCase } from '../../../auth/application/use-case/two-factor-auth.use-case';
import { TIER } from '../../../game/presentation/type/tier.enum';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UsersUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
    private readonly twoFactorAuthUseCase: TwoFactorAuthUseCase,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<User> {
    return this.repository.findOneById(id);
  }

  async findOneByName(name: string): Promise<User> {
    return this.repository.findOneByName(name);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    return this.repository.findOneByIntraId(intraId);
  }

  async updateOne(
    intraId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.repository.updateOne(intraId, updateUserDto);
    if (updateUserDto.is2faEnabled && user.email && user.isEmailValidated) {
      await this.twoFactorAuthUseCase.validate2fa(intraId);
    }
    return await this.repository.findOneByIntraId(intraId);
  }

  async updateStatusByIntraId(intraId: string, status: string): Promise<User> {
    return await this.repository.updateStatusByIntraId(intraId, status);
  }

  async updateStatusById(intraId: string, status: string): Promise<User> {
    return await this.repository.updateStatusById(intraId, status);
  }

  async updateTierAndExp(id: string, exp: number): Promise<User> {
    const user = await this.repository.findOneById(id);
    let newExp: number = user.exp + exp;
    let newTier: TIER;
    if (newExp < 0) {
      if (user.tier === TIER.Bronze) {
        newTier = TIER.Bronze;
        newExp = 0;
      } else if (user.tier === TIER.Silver) {
        newTier = TIER.Bronze;
        newExp += 100;
      } else if (user.tier === TIER.Gold) {
        newTier = TIER.Silver;
        newExp += 100;
      } else {
        newTier = TIER.Gold;
        newExp += 100;
      }
    } else if (newExp >= 100) {
      if (user.tier === TIER.Bronze) {
        newTier = TIER.Silver;
        newExp -= 100;
      } else if (user.tier === TIER.Silver) {
        newTier = TIER.Gold;
        newExp -= 100;
      } else if (user.tier === TIER.Gold) {
        newTier = TIER.Platinum;
        newExp -= 100;
      } else {
        newTier = TIER.Platinum;
        newExp = 100;
      }
    } else {
      newTier = user.tier;
    }
    return await this.repository.updateTierAndExp(id, newTier, newExp);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.repository.createOne(createUserDto);
    } catch (e) {
      throw new ConflictException(e, 'Create user failed.');
    }
  }

  async resetTwoFactorAuthValidation(intraId: string): Promise<void> {
    await this.repository.resetTwoFactorAuthValidation(intraId);
  }

  async isTwoFactorAuthEnabled(intraId: string): Promise<boolean> {
    intraId;
    return true;
    // return await this.repository.isTw;
  }
}
