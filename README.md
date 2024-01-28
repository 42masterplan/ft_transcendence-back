<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


# Amazing Pong 🏓
> *Project Duration: Aug, 2023 ~ Jan, 2024*
* A graduation project of 42Seoul (`ft_transcendence`)
* Online RealTime Chatting & Pong Game Service

## Table Of Contents
- [ENGLISH Introduction](#about-our-projects)
- [KOREAN Introduction](#프로젝트-소개)
- [Project Architecture Diagrams & Stacks](#diagrams)
- [Screenshots](#service-screenshots)

## About our projects
**ft_transcendence (Amazing Pong)** is the graduation project of 42 Seoul, and it is a project that covers all the things we have learned so far in 42.

Our team not only met the requirements required by the subject, but also provided notification functions to provide a high user experience, and above all, we wrote the code by trying to properly deal with exceptions that may occur on the server.  

As a result, it became a project with a high degree of completion, receiving an `Outstanding Project` in two of the three peer evaluations.

## Features
* You can enjoy the **real-time Pong game** with other online users.

* Using 42 api, it provides login function through **42 intra account**.

* The user has an individual **profile**.
    * User can set and modify a unique nickname and profile picture.
    * User can set up a two-step authentication through an email address.
    * In the profile, user can see the progress of each user's challenge and game history.

* Provides **social** functionality between users.
    * User can add, delete, and block friends.
    * One-on-one DM is possible between friends.
    * User can't see messages from friends that user blocked.

* It provides a **channel** function that allows you to chat with other users.
    * User can create public channels, password channels, and private channels.
    * Participants in the channel have roles such as Owner, Administrator, and User.
    * Owner and Administrator can expel, mute, or ban users from the channel.
    * Owner can designate the Administrator and manage the users who are in the channel.
    * You can go to another user's profile and apply for a game in the channel.

* **Notify** friend requests and game applications.
    * The user may check and accept/reject a new notification on the screen.

---

## 프로젝트 소개
**ft_transcendence(Amazing Pong)** 은 42서울의 수료를 위한 마지막 과제로써, 그간 배워왔던 것들을 총망라한 최종 프로젝트이다.

우리 팀은 서브젝트에서 요구하는 조건을 만족하는 것에 그치지 않고, 높은 사용자 경험을 제공하기 위해 알림 기능 등을 제공하였으며, 무엇보다 서버에서 일어날 수 있는 예외사항들을 올바르게 처리할 수 있도록 노력하여 코드를 작성하였다.  

그 결과, 세 번의 동료 평가 중 두 번의 평가에서 `Outstanding Project`를 받으며 높은 완성도를 자랑할 수 있는 프로젝트가 되었다.


## 기능 목록
* 온라인 상의 다른 유저들과 **실시간 Pong 게임**을 즐길 수 있다.

* 42 api를 이용하여, **42 intra 계정**을 통한 로그인 기능을 제공한다.

* 유저는 개개인의 **프로필**을 가진다.
    * 유저는 고유한 닉네임과, 프로필 사진을 설정 및 수정할 수 있다.
    * 이메일 주소를 통한 2단계 인증 설정을 할 수 있다.
    * 프로필에서는 각 유저의 도전 과제 진행상황, 게임 전적을 볼 수 있다.

* 유저 간 **소셜** 기능을 제공한다.
    * 친구 추가 및 삭제, 차단이 가능하다.
    * 친구 간에는 1:1 DM이 가능하다.
    * 유저가 차단한 친구의 메시지는 보이지 않는다.

* 다른 유저들과 채팅이 가능한 **채널** 기능을 제공한다.
    * 공개 채널, 비밀번호 채널, 비공개 채널이 존재한다.
    * 채널의 참가자는 Owner, Administrator, User라는 role을 가지고 있다.
    * Owner와 Administrator는 채널에서 사용자를 추방, 뮤트, 밴할 수 있다.
    * Owner는 Administrator를 지정할 수 있으며, 채널에서 밴 된 사용자들을 관리할 수 있다.
    * 채널 인터페이스에서 다른 사용자의 프로필로 이동 혹은 게임 신청이 가능하다.

* 친구 요청 및 게임 신청에 대해서 **알림**을 제공한다.
    * 사용자는 화면 상에서 새로 온 알림을 확인 및 수락/거절할 수 있다.

---

## Diagrams
### Architecture
To be updated 📋

### ERD
![ft_transcendance drawio](https://github.com/42masterplan/ft_transcendence-back/assets/71981659/dcc9a11e-ed82-43db-97f8-d310a99363d0)

## Stacks
### Frontend
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white"> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white"> <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?style=for-the-badge&logo=Tailwind CSS&logoColor=white"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white">

### Backend
<img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=NestJS&logoColor=white"> <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=Socket.io&logoColor=white"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white"> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white">

## Service Screenshots
|Screen|Screen|
|:---:|:---:|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/f64ea575-d279-4a45-8ee2-9a9dc4e11ab1" width="450"/>|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/63bfbe45-a4e0-4a17-842b-4d8b5d8c85bf" width="450"/>|
|**Initial Screen**|**Sign In**|
|Redirects to 42 OAuth to login.|User can set up nicknames,<br/>profile images, and status messages.|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/30db8e6b-c5a1-4573-9ac9-1dec2f30bce2" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/cf611c0a-30a3-4454-aa8b-569cae7955af" width="450">|
|**Set Up 2fa Email**|**Profile**|
|Enforce mandatory email verification<br/> for 2fa during the sign-up process.|Provides user information, including tiers and game records.|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/bb67de35-1570-405e-b095-44dd9a48c7ae" height="300">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/edd98576-8274-440a-9602-7aae78125902" width="450">|
|**Update User Info**|**Social**|
|Change nicknames, profile images,<br/> and status messages.|Check user status,<br/>add, delete, or ban friends.|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/c144be9b-e1a9-4492-a4eb-80e0d91b362a" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/b4da9744-f4d8-4914-8879-e7f25ba43a8b" width="450">|
|**Ladder Game**|**Normal Game 1**|
|Random matchmaking based on tiers<br/>: Tier adjustments based on the game result.|Initiate game request to a specified opponent<br/>: Game theme selectable.|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/714d33b6-cfd0-4e2d-b2fa-0b4983533925" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/c84040fd-8971-4438-8205-31af149c90b1" width="450">|
|**Normal Game 2**|**Normal Game 3**|
|Select opponents from friends list.|Requesting game.|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/21af69f8-ed67-4aae-84a6-ee825c27567e" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/21d234e0-9943-4b63-adce-138ba935886c" width="450">|
|**Waiting Game**|**Game**|
|Start after a 5-second countdown.|Match lasts for 2 minutes.<br/>Win by scoring 10 points.<br/>In case of a tie, deuce occurs.<br/> If a user leaves, it results in a forfeit.|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/aebc0558-4a76-4dde-8dad-2b4aaa4d21c1" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/60da60fd-2e4a-41a6-a56f-42760feb10b4" width="450">|
|**Game Result**|**List of Participating Channels**|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/6aa4c038-2eab-46df-9033-9f212bdb584f" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/67a441bf-69e2-46e1-be0a-c32e5d7446f4" width="450">|
|**List of Public Channels**|**Create Channel**|
||Set channel visibility (Public/Private), <br/>channel name and password<br/>Invite Friends|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/1a5c7936-c388-405e-acd9-01280b87915a" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/b157e364-ea99-41c3-81e4-ff1334e70197" width="450">|
|**Channel: User**|**Channel: Admin**|
|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/718be6c0-7130-4373-b0c3-758f1b86949e" width="450">|<img src="https://github.com/42masterplan/ft_transcendence-back/assets/71981659/65f4d8cd-1868-44f3-b8d1-bd94c5bfee0b" width="450">|
|**Channel: Admin - setting**|**DM**|


## License

Nest is [MIT licensed](LICENSE).
