import { DateTimeType, Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../domain/user';

@Entity({ tableName: 'user' })
export class UserEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 32 })
  @Unique()
  intraId: string;
  
  @Property({ length: 32, nullable: true })
  @Unique()
  name: string;

  @Property({ length: 128 })
  profileImage: string;

  @Property()
  is2faEnabled: boolean;

  @Property({ length: 128, nullable: true })
  email: string;

  @Property({ default: '', length: 32 })
  currentStatus: string;

  @Property({ length: 128 })
  introduction: string;

  // @OneToMany(() => FriendEntity, (friend) => friend.friend)
  // @OneToMany(() => FriendEntity, (friend) => friend.my)
  // friends = new Collection<FriendEntity>(this);

  // @OneToMany(() => FriendRequestEntity, (request) => request.primaryUser)
  // @OneToMany(() => FriendRequestEntity, (request) => request.targetUser)
  // friendRequests = new Collection<FriendRequestEntity>(this);

  // @OneToMany(() => BannedUserEntity, (bannedUser) => bannedUser.primaryUser)
  // @OneToMany(() => BannedUserEntity, (bannedUser) => bannedUser.targetUser)
  // bannedUsers = new Collection<BannedUserEntity>(this);

  // @OneToMany(() => DmEntity, (dm) => dm.user1)
  // @OneToMany(() => DmEntity, (dm) => dm.user2)
  // dms = new Collection<DmEntity>(this);

  // @OneToMany(() => DmMessageEntity, (message) => message.participant)
  // dmMessages = new Collection<DmMessageEntity>(this);

  // @OneToMany(() => ChannelMessageEntity, (message) => message.participant)
  // channelMessages = new Collection<ChannelMessageEntity>(this);

  // @OneToMany(
  //   () => ChannelUserBannedEntity,
  //   (channelUserBanned) => channelUserBanned.user,
  // )
  // channelUserBanneds = new Collection<ChannelUserBannedEntity>(this);

  // @OneToMany(
  //   () => ChannelParticipantEntity,
  //   (channelParticipant) => channelParticipant.participant,)
  // channelParticipants = new Collection<ChannelParticipantEntity>(this);

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  static from(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.intraId = user.intraId;
    userEntity.name = user.name;
    userEntity.is2faEnabled = user.is2faEnabled;
    userEntity.email = user.email;

    return userEntity;
  }
}
