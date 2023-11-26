import {
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
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'node:path';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put('')
  async updateOne(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user.sub)
      throw new UnauthorizedException();
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: 'resources/',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const newFileName = `image-${uniqueSuffix}${fileExtension}`;
        callback(null, newFileName);
      },
    }),
    limits: {
      fileSize: 1024 * 1024,
    }
  }))
  updateProfileImage(@UploadedFile() image: Express.Multer.File) {
    return {
      profileImage: image.path,
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
        id: 'randomUuid',
        name: 'test1',
        profileImage: 'https://localhost:8080/resources/test.jpg',
        currentState: 'on-line',
        introduction: 'Hello world!',
      },
      {
        id: 'randomUuid2',
        name: 'test2',
        profileImage: 'https://localhost:8080/resources/test.jpg',
        currentState: 'off-line',
        introduction: 'Bye world!',
      },
    ];
  }

  @Post('block')
  block(@Param(':id') id: string) {
    console.log(id);
    return true;
  }
}
