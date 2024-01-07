import { CreateChannelDto } from '../../presentation/gateway/dto/create-channel.dto';
import { Channel } from '../channel';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';

@Injectable()
export class ChannelRepository {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly repository: EntityRepository<ChannelEntity>,
  ) {}

  async findOneById(id: string): Promise<Channel> {
    console.log('repository: findOneById');
    const channel = await this.repository.findOne({ id: id, isDeleted: false });
    if (!channel) return;
    return this.toDomain(channel);
  }

  async findOneByName(name: string): Promise<Channel> {
    console.log('repository: findOneByName');
    const channel = await this.repository.findOne({
      name: name,
      isDeleted: false,
    });
    if (!channel) return;
    return this.toDomain(channel);
  }

  async findAllByStatus(status: string): Promise<Channel[]> {
    console.log('repository: getAllByStatus');
    const channels = await this.repository.find({ status: status });
    return channels.map((channel) => this.toDomain(channel));
  }

  async saveOne(createChannelDto: CreateChannelDto): Promise<Channel> {
    console.log('repository: saveChannel');
    let flag = false;
    let channel: ChannelEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        if (entityManager.count(ChannelEntity, { name: createChannelDto.name }))
          return;
        channel = await entityManager.create(ChannelEntity, createChannelDto);
        if (!channel) return;
        await entityManager.persist(channel);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(channel);
  }

  async updateOne(channel: Channel): Promise<Channel> {
    console.log('repository: updateChannel');
    let flag = false;
    let newChannel: ChannelEntity;
    const entity: ChannelEntity = this.toEntity(channel);
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        newChannel = await entityManager.upsert(ChannelEntity, entity);
        if (!newChannel) return;
        await entityManager.persist(channel);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(newChannel);
  }

  async findPublicChannels(myChannels: string[]): Promise<Channel[]> {
    const channels = await this.repository.find({
      status: 'Public',
      isDeleted: false,
      id: { $nin: myChannels },
    });

    return channels.map((channel) => this.toDomain(channel));
  }

  private toDomain(entity: ChannelEntity): Channel {
    if (!entity) return null;
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
