import { Migration } from '@mikro-orm/migrations';

export class Migration20231209064144 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "user" add column "is_validate_email" boolean not null default false, add column "verification_code" varchar(64) null;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "is_validate_email";');
    this.addSql('alter table "user" drop column "verification_code";');
  }
}
