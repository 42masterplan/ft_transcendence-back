import { CreateChannelDto } from '../../presentation/gateway/dto/create-channel.dto';
import { Channel } from '../channel';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';

@Injectable()
export class ChannelRepository {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(ChannelEntity)
    private readonly repository: EntityRepository<ChannelEntity>,
  ) {}

  async findOneById(id: string): Promise<Channel> {
    console.log('repository: findOneById');
    const channel = await this.repository.findOne({ id: id });
    return this.toDomain(channel);
  }

  async findAllByStatus(status: string): Promise<Channel[]> {
    console.log('repository: getAllByStatus');
    const channels = await this.repository.find({ status: status });
    return channels.map((channel) => this.toDomain(channel));
  }

  async saveOne(createChannelDto: CreateChannelDto): Promise<Channel> {
    console.log('repository: saveChannel');
    const channel = this.repository.create(createChannelDto);
    await this.repository.getEntityManager().persistAndFlush(channel);
    return this.toDomain(channel);
  }

  async updateOne(channel: Channel): Promise<Channel> {
    console.log('repository: updateChannel');
    const entity = this.toEntity(channel);
    const newChannel = await this.repository.upsert(entity);
    await this.repository.getEntityManager().flush();
    return this.toDomain(newChannel);
  }

  async findPublicChannels(
    userId: string,
    myChannels: string[],
  ): Promise<Channel[]> {
    const channels = await this.repository.find({
      status: 'Public',
      isDeleted: false,
      id: { $nin: myChannels },
    });

    return channels.map((channel) => this.toDomain(channel));
  }

  private toDomain(entity: ChannelEntity): Channel {
    return new Channel({
      id: entity.id,
      name: entity.name,
      status: entity.status,
      password: entity.password,
      isDeleted: entity.isDeleted,
    });
  }

  private toEntity(domain: Channel): ChannelEntity {
    const entity = new ChannelEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.status = domain.status;
    entity.password = domain.password;
    entity.isDeleted = domain.isDeleted;
    return entity;
  }
}
