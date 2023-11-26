import { Migration } from '@mikro-orm/migrations';

export class Migration20231126112103 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "channel" ("id" uuid not null, "name" varchar(64) not null, "status" varchar(32) not null, "password" varchar(32) null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "channel_pkey" primary key ("id"));');
    this.addSql('alter table "channel" add constraint "channel_name_unique" unique ("name");');

    this.addSql('create table "user" ("id" uuid not null, "intra_id" varchar(32) not null, "name" varchar(32) null, "profile_image" varchar(128) not null, "is2fa_enabled" boolean not null, "email" varchar(128) null, "current_status" varchar(32) not null default \'\', "introduction" varchar(128) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_intra_id_unique" unique ("intra_id");');
    this.addSql('alter table "user" add constraint "user_name_unique" unique ("name");');

    this.addSql('create table "friend_request" ("id" serial primary key, "is_accepted" boolean null default false, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "primary_user_id" uuid not null, "target_user_id" uuid not null);');

    this.addSql('create table "friend" ("id" serial primary key, "is_deleted" boolean not null default false, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "my_id" uuid not null, "friend_id" uuid not null);');

    this.addSql('create table "dm" ("user1_id" uuid not null, "user2_id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "dm_pkey" primary key ("user1_id", "user2_id"));');

    this.addSql('create table "dm_message" ("id" serial primary key, "content" varchar(512) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "participant_id" uuid not null, "dm_user1_id" uuid not null, "dm_user2_id" uuid not null);');

    this.addSql('create table "channel_user_banned" ("user_id" uuid not null, "channel_id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "channel_user_banned_pkey" primary key ("user_id", "channel_id"));');

    this.addSql('create table "channel_participant" ("participant_id" uuid not null, "channel_id" uuid not null, "role" varchar(64) not null, "chatable_at" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "channel_participant_pkey" primary key ("participant_id", "channel_id"));');

    this.addSql('create table "channel_message" ("id" uuid not null, "content" varchar(512) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "participant_id" uuid not null, "channel_id" uuid not null, constraint "channel_message_pkey" primary key ("id"));');

    this.addSql('create table "banned_user" ("id" serial primary key, "is_deleted" boolean not null default false, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "primary_user_id" uuid not null, "target_user_id" uuid not null);');

    this.addSql('alter table "friend_request" add constraint "friend_request_primary_user_id_foreign" foreign key ("primary_user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "friend_request" add constraint "friend_request_target_user_id_foreign" foreign key ("target_user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "friend" add constraint "friend_my_id_foreign" foreign key ("my_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "friend" add constraint "friend_friend_id_foreign" foreign key ("friend_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "dm" add constraint "dm_user1_id_foreign" foreign key ("user1_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "dm" add constraint "dm_user2_id_foreign" foreign key ("user2_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "dm_message" add constraint "dm_message_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "dm_message" add constraint "dm_message_dm_user1_id_dm_user2_id_foreign" foreign key ("dm_user1_id", "dm_user2_id") references "dm" ("user1_id", "user2_id") on update cascade;');

    this.addSql('alter table "channel_user_banned" add constraint "channel_user_banned_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_user_banned" add constraint "channel_user_banned_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');

    this.addSql('alter table "channel_participant" add constraint "channel_participant_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');

    this.addSql('alter table "channel_message" add constraint "channel_message_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_message" add constraint "channel_message_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');

    this.addSql('alter table "banned_user" add constraint "banned_user_primary_user_id_foreign" foreign key ("primary_user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "banned_user" add constraint "banned_user_target_user_id_foreign" foreign key ("target_user_id") references "user" ("id") on update cascade;');
  }

}
