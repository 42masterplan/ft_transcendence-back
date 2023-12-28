import path from 'node:path';
import { BlockedUserUseCase } from '../../application/use-case/blocked-user.use-case';
import { FindBlockedUserUseCase } from '../../application/use-case/find-blocked-user.use-case';
import { UsersUseCase } from '../../application/use-case/users.use-case';
import { UsersService } from '../../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindBlockedUserViewModel } from '../view-models/users/find-blocked-user.vm';
import { FindUsersViewModel } from '../view-models/users/find-users.vm';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersUseCase: UsersUseCase,
    private readonly findBlockedUserUseCase: FindBlockedUserUseCase,
    private readonly blockedUserUseCase: BlockedUserUseCase,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async getAll(@Request() req, @Query('status') status: string) {
    const intraId = req.user.sub;
    if (
      status !== undefined &&
      status !== 'on-line' &&
      status !== 'off-line' &&
      status !== 'in-game'
    )
      return new BadRequestException();
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

  @UseGuards(AuthGuard('signIn'))
  @Put('')
  async updateOne(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user.sub) throw new UnauthorizedException();
    await this.usersService.updateOne(req.user.sub, updateUserDto);
  }

  @Delete('')
  quit() {
    return true;
  }

  @Get('is-duplicated-name')
  async isDuplicatedName(@Query('name') name: string) {
    const isDuplicated = await this.usersService.isDuplicatedName(name);
    return {
      isDuplicated: isDuplicated,
    };
  }

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
    }),
  )
  updateProfileImage(@UploadedFile() image: Express.Multer.File) {
    return {
      profileImage: image.path,
    };
  }

  @Put('game-setting')
  updateGameSetting(@Body('theme') theme: string) {
    console.log(theme);
    return true;
  }

  @Get('info')
  async getInfo(@Param(':id') id: string) {
    console.log(id);
    const user = await this.usersService.findOneByIntraId(id);
    return {
      id: '1',
      name: 'Seoyoo',
      profileImage: 'https://www.w3schools.com/howto/img_avatar.png',
      currentStatus: 'on-line',
      introduction: 'Hello, I am User1 and this is a very very very very long long long long long long introduction. ',
    }
  };

  @Get('rank')
  getRank(@Param(':id') id:string) {

    return {
      win: 10,
      lose: 5,
      tier: 'Silver'
    };
  }

  @Get('challenges')
  getChallenges(@Param(':id') id: string) {
    return [
      {
        name: 'Challenge1',
        description: 'This is challenge1',
        progressRate: 25,
        achieveRatio: 0.5
      },
      {
        name: 'Challenge2',
        description: 'This is challenge2',
        progressRate: 0,
        achieveRatio: 0.5
      },
      {
        name: 'Challenge3',
        description: 'This is challenge3',
        progressRate: 14,
        achieveRatio: 1
      },
      {
        name: 'Challenge4',
        description: 'This is challenge4',
        progressRate: 23,
        achieveRatio: 1
      },
      {
        name: 'Challenge5',
        description: 'This is challenge5',
        progressRate: 33,
        achieveRatio: 1
      },
      {
        name: 'Challenge6',
        description: 'This is challenge6',
        progressRate: 44,
        achieveRatio: 1
      },
      {
        name: 'Challenge7',
        description: 'This is challenge7',
        progressRate: 55,
        achieveRatio: 1
      },
      {
        name: 'Challenge8',
        description: 'This is challenge8',
        progressRate: 66,
        achieveRatio: 1
      },
      {
        name: 'Challenge9',
        description: 'This is challenge9',
        progressRate: 77,
        achieveRatio: 1
      },
      {
        name: 'Challenge10',
        description: 'This is challenge10',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge11',
        description: 'This is challenge11',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge12',
        description: 'This is challenge12',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge13',
        description: 'This is challenge13',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge14',
        description: 'This is challenge14',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge15',
        description: 'This is challenge15',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge16',
        description: 'This is challenge16',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge17',
        description: 'This is challenge17',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge18',
        description: 'This is challenge18',
        progressRate: 100,
        achieveRatio: 1
      },
      {
        name: 'Challenge19',
        description: 'This is challenge19',
        progressRate: 100,
        achieveRatio: 1
      }
    ]
  }
  
  @Get('matches')
  getMatch(@Param(':id') id: string) {
    console.log('matches');
    return [
      {
        createdAt: '2021-05-01',
        playerAName: 'User1',
        playerBName: 'User2',
        playerAScore: 0,
        playerBScore: 0,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-02',
        playerAName: 'User1',
        playerBName: 'User3',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-03',
        playerAName: 'User1',
        playerBName: 'User4',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-04',
        playerAName: 'User1',
        playerBName: 'User5',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-05',
        playerAName: 'User1',
        playerBName: 'User6',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-06',
        playerAName: 'User1',
        playerBName: 'User7',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-07',
        playerAName: 'User1',
        playerBName: 'User8',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-08',
        playerAName: 'User1',
        playerBName: 'User9',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-09',
        playerAName: 'User1',
        playerBName: 'User10',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-10',
        playerAName: 'User1',
        playerBName: 'User11',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-11',
        playerAName: 'User1',
        playerBName: 'User12',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-12',
        playerAName: 'User1',
        playerBName: 'User13',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-13',
        playerAName: 'User1',
        playerBName: 'User14',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-14',
        playerAName: 'User1',
        playerBName: 'User15',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-15',
        playerAName: 'User1',
        playerBName: 'User16',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-16',
        playerAName: 'User1',
        playerBName: 'User17',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-17',
        playerAName: 'User1',
        playerBName: 'User18',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-18',
        playerAName: 'User1',
        playerBName: 'User19',
        playerAScore: 5,
        playerBScore: 10,
		    gameId: 'blablabla'
      },
      {
        createdAt: '2021-05-19',
        playerAName: 'User1',
        playerBName: 'User20',
        playerAScore: 10,
        playerBScore: 5,
		    gameId: 'blablabla'
      }
    ];
  }

  @Get('game-history')
  getGameHistory(@Param(':id') id: string, @Query('page') page: number) {
    console.log('id:' + id);
    console.log('page:' + page);
    return [
      {
        createdAt: '2021-05-01',
        player1Name: 'User1',
        player2Name: 'User2',
        player1Score: 0,
        player2Score: 0,
      },
      {
        createdAt: '2021-05-02',
        player1Name: 'User1',
        player2Name: 'User3',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-03',
        player1Name: 'User1',
        player2Name: 'User4',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-04',
        player1Name: 'User1',
        player2Name: 'User5',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-05',
        player1Name: 'User1',
        player2Name: 'User6',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-06',
        player1Name: 'User1',
        player2Name: 'User7',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-07',
        player1Name: 'User1',
        player2Name: 'User8',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-08',
        player1Name: 'User1',
        player2Name: 'User9',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-09',
        player1Name: 'User1',
        player2Name: 'User10',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-10',
        player1Name: 'User1',
        player2Name: 'User11',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-11',
        player1Name: 'User1',
        player2Name: 'User12',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-12',
        player1Name: 'User1',
        player2Name: 'User13',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-13',
        player1Name: 'User1',
        player2Name: 'User14',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-14',
        player1Name: 'User1',
        player2Name: 'User15',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-15',
        player1Name: 'User1',
        player2Name: 'User16',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-16',
        player1Name: 'User1',
        player2Name: 'User17',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-17',
        player1Name: 'User1',
        player2Name: 'User18',
        player1Score: 10,
        player2Score: 5,
      },
      {
        createdAt: '2021-05-18',
        player1Name: 'User1',
        player2Name: 'User19',
        player1Score: 5,
        player2Score: 10,
      },
      {
        createdAt: '2021-05-19',
        player1Name: 'User1',
        player2Name: 'User20',
        player1Score: 10,
        player2Score: 5,
      },
    ];
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('myName')
  async getMyName(@Request() req) {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    return { name: user.name };
  }

  /* BLOCK */
  @UseGuards(AuthGuard('jwt'))
  @Get('block')
  async getBlockedUser(@Request() req) {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    const blocked = await this.findBlockedUserUseCase.execute(user.id);
    return blocked.map((block) => new FindBlockedUserViewModel(block));
    return [
      {
        id: '9',
        profileImage: 'http://localhost:8080/resources/koala_health.svg',
        name: 'User9',
        currentStatus: 'off-line',
        introduction: "Hello, I'm User9. Nice to meet you!",
      },
      {
        id: '10',
        profileImage: 'http://localhost:8080/resources/polarbear_ski.svg',
        name: 'User10',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User10. Nice to meet you!",
      },
      {
        id: '11',
        profileImage: 'http://localhost:8080/resources/rhino_health.svg',
        name: 'User11',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User11. Nice to meet you!",
      },
      {
        id: '12',
        profileImage: 'http://localhost:8080/resources/shark_health.svg',
        name: 'User12',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User12. Nice to meet you!",
      },
    ];
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('block')
  async block(@Request() req, @Body('id') targetId: string) {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    await this.blockedUserUseCase.block({ myId: user.id, targetId });

    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('block/:id')
  async unblock(@Request() req, @Param('id') targetId: string) {
    const intraId = req.user.sub;
    console.log('unblock');
    console.log(targetId);
    const user = await this.usersService.findOneByIntraId(intraId);
    await this.blockedUserUseCase.unblock({ myId: user.id, targetId });

    return true;
  }
}
