import { BlockedUser } from '../../blocked-user';

export interface BlockedUserRepository {
  findManyByMyId(myId: string): Promise<BlockedUser[]>;
  block({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<BlockedUser>;
  unblock({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<BlockedUser>;
  alreadyBlock({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<boolean>;
}

export const BlockedUserRepository = Symbol('BLOCKED_USER_REPOSITORY');
