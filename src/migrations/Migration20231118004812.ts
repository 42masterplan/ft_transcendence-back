import { Migration } from '@mikro-orm/migrations';

export class Migration20231118004812 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "channel_message" alter column "id" drop default;');
    this.addSql('alter table "channel_message" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "channel_message" alter column "id" drop default;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel_message" alter column "id" type text using ("id"::text);');

    this.addSql('alter table "channel_message" alter column "id" type int using ("id"::int);');
    this.addSql('create sequence if not exists "channel_message_id_seq";');
    this.addSql('select setval(\'channel_message_id_seq\', (select max("id") from "channel_message"));');
    this.addSql('alter table "channel_message" alter column "id" set default nextval(\'channel_message_id_seq\');');
  }

}
