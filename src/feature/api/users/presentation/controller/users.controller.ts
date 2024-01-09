import path from 'node:path';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { JwtSignInGuard } from '../../../auth/jwt/jwt-sign-in.guard';
import { GameWithPlayerUseCase } from '../../../game/application/game-with-player.use-case';
import { AchievementUseCase } from '../../application/use-case/achievement.use-case';
import { BlockedUserUseCase } from '../../application/use-case/blocked-user.use-case';
import { FindBlockedUserUseCase } from '../../application/use-case/find-blocked-user.use-case';
import { UsersUseCase } from '../../application/use-case/users.use-case';
import { UsersService } from '../../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindBlockedUserViewModel } from '../view-models/users/find-blocked-user.vm';
import { FindUsersViewModel } from '../view-models/users/find-users.vm';
import { MatchViewModel } from '../view-models/users/match.vm';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotAcceptableException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly usersUseCase: UsersUseCase,
    private readonly findBlockedUserUseCase: FindBlockedUserUseCase,
    private readonly blockedUserUseCase: BlockedUserUseCase,
    private readonly gameWithPlayerUseCase: GameWithPlayerUseCase,
    private readonly achievementUseCase: AchievementUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(@Request() req, @Query('status') status: string) {
    this.logger.log('get all users');
    const intraId = req.user.sub;
    if (
      status !== undefined &&
      status !== 'on-line' &&
      status !== 'off-line' &&
      status !== 'in-game'
    )
      throw new BadRequestException('Invalid status');
    const usersExceptMe = (await this.usersUseCase.findAll()).filter(
      (user) => user.intraId !== intraId,
    );
    const users = usersExceptMe.map((user) => new FindUsersViewModel(user));

    return users.filter((user) =>
      status === undefined || status === null
        ? true
        : user.currentStatus === status,
    );
  }

  @UseGuards(JwtSignInGuard)
  @Put('')
  async updateOne(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log('update my info');
    await this.usersUseCase.updateOne(req.user.sub, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('')
  quit() {
    return true;
  }

  @UseGuards(JwtSignInGuard)
  @Get('is-duplicated-name')
  async isDuplicatedName(@Request() req, @Query('name') name: string) {
    this.logger.log('check is duplicated name');
    const isDuplicated = await this.usersService.isDuplicatedName(
      name,
      req.user.sub,
    );
    return {
      isDuplicated: isDuplicated,
    };
  }

  @UseGuards(JwtSignInGuard)
  @Post('profile-image')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: 'resources/',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = path.extname(file.originalname);
          const newFileName = `image-${uniqueSuffix}${fileExtension}`;
          callback(null, newFileName);
        },
      }),
      limits: {
        fileSize: 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/svg+xml',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new NotAcceptableException(
              'Invalid file type. Only JPEG, PNG, SVG, and GIF are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  updateProfileImage(@UploadedFile() image: Express.Multer.File) {
    this.logger.log('upload profile image');
    if (!image) return;
    return {
      profileImage: image.path,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('info/:name')
  async getInfo(@Param('name') name: string) {
    this.logger.log('get user info');
    const user = await this.usersUseCase.findOneByName(name);
    if (!user) throw new NotFoundException('There is no such user.');
    return {
      id: user.id,
      name: user.name,
      profileImage: user.profileImage,
      currentStatus: user.currentStatus,
      introduction: user.introduction,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('rank/:name')
  async getRank(@Param('name') name: string) {
    this.logger.log('get user rank');
    const user = await this.usersUseCase.findOneByName(name);
    if (!user) throw new NotFoundException('There is no such user.');
    const gameStat = await this.gameWithPlayerUseCase.getPlayerGameStat(name);
    return {
      win: gameStat.win,
      lose: gameStat.lose,
      tier: user.tier,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('challenges/:name')
  async getChallenges(@Param('name') name: string): Promise<any> {
    this.logger.log('get user challenges');
    const user = await this.usersUseCase.findOneByName(name);
    if (!user) throw new NotFoundException('There is no such user.');
    const achieves = await this.achievementUseCase.findAllByUserId(user.id);
    return achieves;
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches/:name')
  async getMatch(@Param('name') name: string) {
    this.logger.log('get user matches');
    const user = await this.usersUseCase.findOneByName(name);
    if (!user) throw new NotFoundException('There is no such user.');
    const games = await this.gameWithPlayerUseCase.findGamesWithPlayer(name);
    return games.map((game) => new MatchViewModel(game));
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-name')
  async getMyName(@Request() req) {
    this.logger.log('get my name');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    return { name: user.name };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-info')
  async getMyInfo(@Request() req) {
    this.logger.log('get my info');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    return {
      name: user.name,
      profileImage: user.profileImage,
      introduction: user.introduction,
      is2faEnabled: user.is2faEnabled,
    };
  }

  /* BLOCK */
  @UseGuards(JwtAuthGuard)
  @Get('block')
  async getBlockedUser(@Request() req) {
    this.logger.log('get blocked user');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    const blocked = await this.findBlockedUserUseCase.execute(user.id);
    return blocked.map((block) => new FindBlockedUserViewModel(block));
  }

  @UseGuards(JwtAuthGuard)
  @Post('block')
  async block(@Request() req, @Body('id') targetId: string) {
    this.logger.log('block user');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    await this.blockedUserUseCase.block({ myId: user.id, targetId });

    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('block/:id')
  async unblock(@Request() req, @Param('id') targetId: string) {
    this.logger.log('unblock user');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    await this.blockedUserUseCase.unblock({ myId: user.id, targetId });

    return true;
  }
}
