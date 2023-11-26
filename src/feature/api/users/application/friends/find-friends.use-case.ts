import { Injectable } from '@nestjs/common';

@Injectable()
export class FindFriendsUseCase {
  constructor() {}
  execute(id: string) {
    // find my friends id from friend table
    // friends id로 user table에서 user 정보를 가져온다.
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
}
