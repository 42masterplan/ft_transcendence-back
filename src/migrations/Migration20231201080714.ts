import { Migration } from '@mikro-orm/migrations';

export class Migration20231201080714 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "channel_participant" alter column "chatable_at" type timestamptz(0) using ("chatable_at"::timestamptz(0));');
    this.addSql('alter table "channel_participant" alter column "chatable_at" set default current_timestamp;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel_participant" alter column "chatable_at" drop default;');
    this.addSql('alter table "channel_participant" alter column "chatable_at" type varchar(255) using ("chatable_at"::varchar(255));');
  }

}
