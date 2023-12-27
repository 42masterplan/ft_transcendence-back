import { DmMessageRepository } from '../domain/repositories/dm-message.repository';
import { DmRepository } from '../domain/repositories/dm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmUseCases {
  constructor(
    private readonly dmRepository: DmRepository,
    private readonly dmMessageRepository: DmMessageRepository,
  ) {}

  async getDmMessages(dmId: string) {
    return this.dmMessageRepository.findAllByDmId(dmId);
  }

  async newMessage({ dmId, content, participantId }) {
    return this.dmMessageRepository.saveOne({ dmId, content, participantId });
  }
}
