import { Migration } from '@mikro-orm/migrations';

export class Migration20231229122539 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "game" drop column "theme";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "game" add column "theme" varchar(64) not null;');
  }

}
