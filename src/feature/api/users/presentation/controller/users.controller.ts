import { UsersService } from '../../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  getAll(@Query('status') status: string) {
    if (
      status !== undefined &&
      status !== 'on-line' &&
      status !== 'off-line' &&
      status !== 'in-game'
    )
      return new BadRequestException();
    return [
      {
        id: '1',
        profileImage: 'http://localhost:8080/resources/cat_kickBoard.svg',
        name: 'OnlineUser1',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User1. Nice to meet you!",
      },
      {
        id: '2',
        profileImage: 'http://localhost:8080/resources/sloth_health.svg',
        name: 'OfflineUser1',
        currentStatus: 'off-line',
        introduction: "Hello, I'm User2. Nice to meet you!",
      },
      {
        id: '3',
        profileImage: 'http://localhost:8080/resources/crocodile_health.svg',
        name: 'InGameUser3',
        currentStatus: 'in-game',
        introduction: "Hello, I'm User3. Nice to meet you!",
      },
      {
        id: '4',
        profileImage: 'http://localhost:8080/resources/dog_body.svg',
        name: 'OnlineUser4',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User4. Nice to meet you!",
      },
      {
        id: '5',
        profileImage: 'http://localhost:8080/resources/dog_boxing.svg',
        name: 'User5',
        currentStatus: 'off-line',
        introduction: "Hello, I'm User5. Nice to meet you!",
      },
      {
        id: '6',
        profileImage: 'http://localhost:8080/resources/dog_stateBoard.svg',
        name: 'User6',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User6. Nice to meet you!",
      },
      {
        id: '7',
        profileImage: 'http://localhost:8080/resources/gorilla_baseBall.svg',
        name: 'User7',
        currentStatus: 'in-game',
        introduction: "Hello, I'm User7. Nice to meet you!",
      },
      {
        id: '8',
        profileImage: 'http://localhost:8080/resources/kangaroo_boxing.svg',
        name: 'User8',
        currentStatus: 'on-line',
        introduction: "Hello, I'm User8. Nice to meet you!",
      },
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
    ].filter((user) =>
      status === undefined || status === null
        ? true
        : user.currentStatus === status,
    );
  }

  @Put('')
  saveOne(@Body() createUserDto: CreateUserDto) {
    return this.usersService.saveOne(createUserDto);
  }

  @Delete('')
  quit() {
    return true;
  }

  @Get('auth-callback')
  getAuthCode(@Query('code') code: string) {
    code;
    return {
      hasAccount: true,
      isTwoFactorEnabled: true,
    };
  }

  @Get('is-duplicated-name')
  hasDuplicateName(@Query('name') name: string) {
    console.log(name);
    return {
      isDuplicated: true,
    };
  }

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('profileImage'))
  updateProfile(@UploadedFile() profileImage: Express.Multer.File) {
    console.log(profileImage);
    return {
      profileImage: 'https://localhost:8080/resources/test.jpg',
    };
  }

  @Put('two-factor-auth')
  update2fa(@Body('email') twoFactorAuthEmail: string) {
    console.log(twoFactorAuthEmail);
    return true;
  }

  @Put('game-setting')
  updateGameSetting(@Body('theme') theme: string) {
    console.log(theme);
    return true;
  }

  @Get('info')
  getInfo(@Param(':id') id: string) {
    return {
      id: id,
      name: 'test',
      profileImage: 'https://localhost:8080/resources/test.jpg',
      currentStatus: 'on-line',
      introduction: 'Hello world!',
      rank: {
        win: 10,
        lose: 5,
        tier: 'silver',
      },
      challenges: [
        {
          name: 'Start',
          description: 'play one game',
          progressRate: 0,
          achieveRatio: 60,
          icon: 'https://localhost:8080/resources/test.jpg',
        },
      ],
    };
  }

  @Get('game-history')
  getGameHistory(@Param(':id') id: string, @Query('page') page: number) {
    console.log('id:' + id);
    console.log('page:' + page);
    return [
      {
        createdAt: new Date(),
        player1Name: 'test1',
        player2Name: 'test2',
        player1Score: 3,
        player2Score: 5,
      },
      {
        createdAt: new Date(),
        player1Name: 'test1',
        player2Name: 'test2',
        player1Score: 5,
        player2Score: 4,
      },
    ];
  }

  /* BLOCK */
  @Get('block')
  getBlockedUser() {
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

  @Post('block')
  block(@Body('id') id: string) {
    console.log(id);
    return true;
  }

  @Delete('block')
  unblock(@Param(':id') id: string) {
    console.log(id);
    return true;
  }
}
