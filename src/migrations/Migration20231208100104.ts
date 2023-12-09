import { Migration } from '@mikro-orm/migrations';

export class Migration20231208100104 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "channel_participant" add column "is_deleted" boolean not null default false;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel_participant" drop column "is_deleted";');
  }
}
