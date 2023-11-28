import { Injectable } from '@nestjs/common';

@Injectable()
export class FindFriendsUseCase {
  constructor() {}
  execute(id: string) {
    // find my friends id from friend table
    // friends id로 user table에서 user 정보를 가져온다.
    return [
      {
        id: '1',
        profileImage: 'http://localhost:8080/resources/cat_kickBoard.svg',
        name: 'OnlineUser1',
        currentState: 'on-line',
        introduction: "Hello, I'm User1. Nice to meet you!"
      },
      {
        id: '2',
        profileImage: 'http://localhost:8080/resources/sloth_health.svg',
        name: 'OfflineUser1',
        currentState: 'off-line',
        introduction: "Hello, I'm User2. Nice to meet you!"
      },
      {
        id: '3',
        profileImage: 'http://localhost:8080/resources/crocodile_health.svg',
        name: 'InGameUser3',
        currentState: 'in-game',
        introduction: "Hello, I'm User3. Nice to meet you!"
      },
      {
        id: '4',
        profileImage: 'http://localhost:8080/resources/dog_body.svg',
        name: 'OnlineUser4',
        currentState: 'on-line',
        introduction: "Hello, I'm User4. Nice to meet you!"
      },
      {
        id: '5',
        profileImage: 'http://localhost:8080/resources/dog_boxing.svg',
        name: 'User5',
        currentState: 'off-line',
        introduction: "Hello, I'm User5. Nice to meet you!"
      }
    ];
  }
}
