import { Migration } from '@mikro-orm/migrations';

export class Migration20231229084234 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "game" ("id" serial primary key, "theme" varchar(64) not null, "is_ladder" boolean not null default false);');

    this.addSql('create table "player_score" ("player_id" uuid not null, "game_id" int not null, "value" int not null, "status" varchar(32) not null, constraint "player_score_pkey" primary key ("player_id", "game_id"));');

    this.addSql('create table "player_tier" ("id" uuid not null, "name" varchar(32) not null, "exp" int not null, constraint "player_tier_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "game" cascade;');

    this.addSql('drop table if exists "player_score" cascade;');

    this.addSql('drop table if exists "player_tier" cascade;');
  }

}
