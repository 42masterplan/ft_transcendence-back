import { DmMessage } from '../domain/dm-message';
import { DmMessageRepository } from '../domain/repositories/dm-message.repository';
import { DmRepository } from '../domain/repositories/dm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmUsecase {
  constructor(
    private readonly dmRepository: DmRepository,
    private readonly dmMessageRepository: DmMessageRepository,
  ) {}

  async getDmMessages(user1Id: string, user2Id: string): Promise<DmMessage[]> {
    const dm = await this.dmRepository.findOneByUserIds(user1Id, user2Id);
    return await this.dmMessageRepository.findAllByDmId(dm.id);
  }

  async getDmIdByUserIds(user1Id: string, user2Id: string): Promise<string> {
    const dm = await this.dmRepository.findOneByUserIds(user1Id, user2Id);
    return dm.id;
  }

  async saveNewMessage({ dmId, content, participantId }) {
    return this.dmMessageRepository.saveOne({ dmId, content, participantId });
  }

  async getRecieverId(dmId: string, senderId: string): Promise<string> {
    const dm = await this.dmRepository.findOneById(dmId);
    if (dm.user1Id === senderId) return dm.user2Id;
    else return dm.user1Id;
  }
}
