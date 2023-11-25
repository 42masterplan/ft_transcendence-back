import { Migration } from '@mikro-orm/migrations';

export class Migration20231125081428 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "channel" add constraint "channel_name_unique" unique ("name");');

    this.addSql('alter table "user" add constraint "user_intra_id_unique" unique ("intra_id");');
    this.addSql('alter table "user" add constraint "user_name_unique" unique ("name");');

    this.addSql('alter table "dm" drop column "user1id";');
    this.addSql('alter table "dm" drop column "user2id";');

    this.addSql('alter table "dm_message" drop column "dm_id";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel" drop constraint "channel_name_unique";');

    this.addSql('alter table "user" drop constraint "user_intra_id_unique";');
    this.addSql('alter table "user" drop constraint "user_name_unique";');

    this.addSql('alter table "dm" add column "user1id" uuid not null, add column "user2id" uuid not null;');

    this.addSql('alter table "dm_message" add column "dm_id" uuid not null;');
  }

}
