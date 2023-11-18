import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  serialize,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FriendEntity } from './friend.entity';
import { FriendRequestEntity } from './friendRequest.entity';
import { BannedUserEntity } from './bannedUser.entity';
import { DmEntity } from './dm.entity';
import { DmMessageEntity } from './dmMessage.entity';
import { ChannelMessageEntity } from '../../channel/infrastructure/channelMessage.entity';
import { ChannelBannedUserEntity } from '../../channel/infrastructure/channelBannedUser.entity';
import { ChannelParticipantEntity } from '../../channel/infrastructure/channelParticipant.entity';

@Entity({ tableName: 'user' })
export class UserEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 32 })
  intraId: string;

  @Property({ length: 32 })
  name: string;

  @Property({ length: 128 })
  profileImage: string;

  @Property()
  is2faEnabled: boolean;

  @Property({ default: '', length: 128 })
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
  //   () => ChannelBannedUserEntity,
  //   (channelBannedUser) => channelBannedUser.user,
  // )
  // channelBannedUsers = new Collection<ChannelBannedUserEntity>(this);

  @OneToMany(
    () => ChannelParticipantEntity,
    (channelParticipant) => channelParticipant.participant,
  )
  channelParticipants = new Collection<ChannelParticipantEntity>(this);
}
