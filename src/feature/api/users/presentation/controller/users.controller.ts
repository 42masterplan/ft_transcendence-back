import path from 'node:path';
import { MailService } from '../../../mail/mail.service';
import { TwoFactorAuthUseCase } from '../../application/use-case/two-factor-auth.use-case';
import { UsersUseCase } from '../../application/use-case/users.use-case';
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
import * as bcrypt from 'bcrypt';
import { diskStorage } from 'multer';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,

    private readonly usersUseCase: UsersUseCase,
    private readonly twoFactorUseCase: TwoFactorAuthUseCase,
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

    if (!req.user.sub) throw new UnauthorizedException();

    const user = await this.usersService.findOneByIntraId(req.user.sub);
    const expiredDate = new Date();
    console.log(expiredDate);
    expiredDate.setMinutes(expiredDate.getMinutes() - 5);

    if (user.verificationCode !== null) {
      if (user.updatedAt <= expiredDate)
        await this.twoFactorUseCase.reset(req.user.sub);
      throw new BadRequestException('이미 인증 코드가 존재합니다.');
      //todo: 다시해주기
    }
    const code = await this.usersService.createRandomCode(
      req.user.sub,
      twoFactorEmail.email,
    );
    await this.mailService.sendMail(twoFactorEmail.email, code);
    return true;
  }

  @UseGuards(AuthGuard('signIn'))
  @Post('two-factor-auth/validate')
  async validate2fa(
    @Request() req,
    @Body() twoFactorEmailValidate: TwoFactorEmailValidateDto,
  ) {
    if (!req.user.sub) throw new UnauthorizedException();

    const user = await this.usersService.findOneByIntraId(req.user.sub);
    const expiredDate = new Date();
    expiredDate.setMinutes(expiredDate.getMinutes() - 5);

    if (user.isEmailValidated === true) return true;
    if (user.verificationCode === null || user.updatedAt <= expiredDate) {
      return false;
    }
    const isMatch = await bcrypt.compare(
      twoFactorEmailValidate.code.toString(),
      user.verificationCode,
    );
    if (isMatch) {
      await this.twoFactorUseCase.accept(req.user.sub);
    }
    return isMatch;
  }

  @Put('game-setting')
  updateGameSetting(@Body('theme') theme: string) {
    console.log(theme);
    return true;
  }

  @Get('info')
  getInfo(@Param(':id') id: string) {
    console.log(id);
    return {
      id: '1',
      name: 'Seoyoo',
      profileImage: 'http://localhost:8080/resources/crocodile_health.svg',
      currentStatus: 'on-line',
      introduction:
        'Hello, I am User1 and this is a very very very very long long long long long long introduction. ',
      rank: {
        win: 10,
        lose: 5,
        tier: 'Silver',
      },
      challenges: [
        {
          name: 'Challenge1',
          description: 'This is challenge1',
          progressRate: 25,
          achieveRatio: 0.5,
        },
        {
          name: 'Challenge2',
          description: 'This is challenge2',
          progressRate: 0,
          achieveRatio: 0.5,
        },
        {
          name: 'Challenge3',
          description: 'This is challenge3',
          progressRate: 14,
          achieveRatio: 1,
        },
        {
          name: 'Challenge4',
          description: 'This is challenge4',
          progressRate: 23,
          achieveRatio: 1,
        },
        {
          name: 'Challenge5',
          description: 'This is challenge5',
          progressRate: 33,
          achieveRatio: 1,
        },
        {
          name: 'Challenge6',
          description: 'This is challenge6',
          progressRate: 44,
          achieveRatio: 1,
        },
        {
          name: 'Challenge7',
          description: 'This is challenge7',
          progressRate: 55,
          achieveRatio: 1,
        },
        {
          name: 'Challenge8',
          description: 'This is challenge8',
          progressRate: 66,
          achieveRatio: 1,
        },
        {
          name: 'Challenge9',
          description: 'This is challenge9',
          progressRate: 77,
          achieveRatio: 1,
        },
        {
          name: 'Challenge10',
          description: 'This is challenge10',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge11',
          description: 'This is challenge11',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge12',
          description: 'This is challenge12',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge13',
          description: 'This is challenge13',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge14',
          description: 'This is challenge14',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge15',
          description: 'This is challenge15',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge16',
          description: 'This is challenge16',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge17',
          description: 'This is challenge17',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge18',
          description: 'This is challenge18',
          progressRate: 100,
          achieveRatio: 1,
        },
        {
          name: 'Challenge19',
          description: 'This is challenge19',
          progressRate: 100,
          achieveRatio: 1,
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
