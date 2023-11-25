import { Migration } from '@mikro-orm/migrations';

export class Migration20231125072050 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_channel_id_id_foreign";');
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_participant_id_id_foreign";');

    this.addSql('alter table "channel_participant" add column "participant_id" uuid not null, add column "channel_id" uuid not null;');
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_pkey";');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');
    this.addSql('alter table "channel_participant" drop column "participant_id_id";');
    this.addSql('alter table "channel_participant" drop column "channel_id_id";');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_pkey" primary key ("participant_id", "channel_id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_participant_id_foreign";');
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_channel_id_foreign";');

    this.addSql('alter table "channel_participant" add column "participant_id_id" uuid not null default null, add column "channel_id_id" uuid not null default null;');
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_pkey";');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_participant_id_id_foreign" foreign key ("participant_id_id") references "user" ("id") on update cascade on delete no action;');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_channel_id_id_foreign" foreign key ("channel_id_id") references "channel" ("id") on update cascade on delete no action;');
    this.addSql('alter table "channel_participant" drop column "participant_id";');
    this.addSql('alter table "channel_participant" drop column "channel_id";');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_pkey" primary key ("participant_id_id", "channel_id_id");');
  }

}
