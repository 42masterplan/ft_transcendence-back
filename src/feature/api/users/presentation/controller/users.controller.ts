import path from 'node:path';
import { MailService } from '../../../mail/mail.service';
import { UsersService } from '../../users.service';
import { TwoFactorEmailValidateDto } from '../dto/two-factor-email-validate.dto';
import { TwoFactorEmailDto } from '../dto/two-factor-email.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
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
    private readonly mailService: MailService,
  ) {}

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

  @UseGuards(AuthGuard('signIn'))
  @Put('two-factor-auth')
  async update2fa(@Request() req, @Body() twoFactorEmail: TwoFactorEmailDto) {
    //TODO: AuthGuard, Use cache to manage time
    //TODO: db: 이메일, 랜덤 코드, isValidateEmail false 저장

    if (!req.user.sub) throw new UnauthorizedException();

    const code = await this.usersService.createRandomCode(
      req.user.sub,
      twoFactorEmail.email,
    );

    this.mailService.sendMail(twoFactorEmail.email, code);
    return true;
  }

  @Post('two-factor-auth/validate')
  validate2fa(@Body() twoFactorEmailValidate: TwoFactorEmailValidateDto) {
    console.log(twoFactorEmailValidate.code);
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
