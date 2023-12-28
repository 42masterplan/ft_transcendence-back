import { Dm } from '../domain/dm';
import { DmMessage } from '../domain/dm-message';
import { DmMessageRepository } from '../domain/repositories/dm-message.repository';
import { DmRepository } from '../domain/repositories/dm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmUseCase {
  constructor(
    private readonly dmRepository: DmRepository,
    private readonly dmMessageRepository: DmMessageRepository,
  ) {}

  async createDm(user1Id: string, user2Id: string): Promise<Dm> {
    if (user1Id > user2Id) [user1Id, user2Id] = [user2Id, user1Id];
    const dm = await this.dmRepository.findOneByUserIds({ user1Id, user2Id });
    if (dm) return dm;
    return this.dmRepository.saveOne({ user1Id, user2Id });
  }

  async getDmMessages(
    user1Id: string,
    user2Id: string,
  ): Promise<{ dmId: string; messages: DmMessage[] }> {
    if (user1Id > user2Id) [user1Id, user2Id] = [user2Id, user1Id];
    const dm = await this.dmRepository.findOneByUserIds({ user1Id, user2Id });
    return {
      dmId: dm.id,
      messages: await this.dmMessageRepository.findAllByDmId(dm.id),
    };
  }

  async saveNewMessage({ dmId, content, participantId }) {
    return this.dmMessageRepository.saveOne({ dmId, content, participantId });
  }

  async getReceiverId(dmId: string, senderId: string): Promise<string> {
    const dm = await this.dmRepository.findOneById(dmId);
    if (dm.user1Id === senderId) return dm.user2Id;
    else return dm.user1Id;
  }
}
