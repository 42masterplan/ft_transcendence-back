import { Migration } from '@mikro-orm/migrations';

export class Migration20231205131234 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "channel" add column "is_deleted" boolean not null default false;',
    );

    this.addSql(
      'alter table "channel_user_banned" add column "is_deleted" boolean not null default false;',
    );

    this.addSql(
      'alter table "user" add column "is_deleted" boolean not null default false;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel" drop column "is_deleted";');

    this.addSql('alter table "channel_user_banned" drop column "is_deleted";');

    this.addSql('alter table "user" drop column "is_deleted";');
  }
}
