import { Migration } from '@mikro-orm/migrations';

export class Migration20231126131819 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "banned_user" drop constraint "banned_user_primary_user_id_foreign";');
    this.addSql('alter table "banned_user" drop constraint "banned_user_target_user_id_foreign";');

    this.addSql('alter table "channel_message" drop constraint "channel_message_participant_id_foreign";');
    this.addSql('alter table "channel_message" drop constraint "channel_message_channel_id_foreign";');

    this.addSql('alter table "channel_participant" drop constraint "channel_participant_participant_id_foreign";');
    this.addSql('alter table "channel_participant" drop constraint "channel_participant_channel_id_foreign";');

    this.addSql('alter table "channel_user_banned" drop constraint "channel_user_banned_user_id_foreign";');
    this.addSql('alter table "channel_user_banned" drop constraint "channel_user_banned_channel_id_foreign";');

    this.addSql('alter table "dm" drop constraint "dm_user1_id_foreign";');
    this.addSql('alter table "dm" drop constraint "dm_user2_id_foreign";');

    this.addSql('alter table "dm_message" drop constraint "dm_message_participant_id_foreign";');
    this.addSql('alter table "dm_message" drop constraint "dm_message_dm_user1_id_dm_user2_id_foreign";');

    this.addSql('alter table "friend" drop constraint "friend_my_id_foreign";');
    this.addSql('alter table "friend" drop constraint "friend_friend_id_foreign";');

    this.addSql('alter table "friend_request" drop constraint "friend_request_primary_user_id_foreign";');
    this.addSql('alter table "friend_request" drop constraint "friend_request_target_user_id_foreign";');

    this.addSql('alter table "banned_user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "banned_user" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "banned_user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "banned_user" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "channel" alter column "id" drop default;');
    this.addSql('alter table "channel" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "channel" alter column "id" set default gen_random_uuid();');
    this.addSql('alter table "channel" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "channel" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "channel_message" alter column "id" drop default;');
    this.addSql('alter table "channel_message" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "channel_message" alter column "id" set default gen_random_uuid();');
    this.addSql('alter table "channel_message" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel_message" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "channel_message" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel_message" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "channel_participant" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel_participant" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "channel_participant" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel_participant" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "channel_user_banned" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel_user_banned" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "channel_user_banned" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel_user_banned" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "dm" add column "user1id" uuid not null, add column "user2id" uuid not null;');
    this.addSql('alter table "dm" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "dm" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "dm" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "dm" alter column "updated_at" set default current_timestamp;');
    this.addSql('alter table "dm" drop constraint "dm_pkey";');
    this.addSql('alter table "dm" drop column "user1_id";');
    this.addSql('alter table "dm" drop column "user2_id";');
    this.addSql('alter table "dm" add constraint "dm_pkey" primary key ("user1id", "user2id");');

    this.addSql('alter table "dm_message" add column "dm_id" uuid not null;');
    this.addSql('alter table "dm_message" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "dm_message" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "dm_message" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "dm_message" alter column "updated_at" set default current_timestamp;');
    this.addSql('alter table "dm_message" drop column "dm_user1_id";');
    this.addSql('alter table "dm_message" drop column "dm_user2_id";');

    this.addSql('alter table "friend" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "friend" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "friend" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "friend" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "friend_request" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "friend_request" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "friend_request" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "friend_request" alter column "updated_at" set default current_timestamp;');

    this.addSql('alter table "user" alter column "id" drop default;');
    this.addSql('alter table "user" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "user" alter column "id" set default gen_random_uuid();');
    this.addSql('alter table "user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "user" alter column "created_at" set default current_timestamp;');
    this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "user" alter column "updated_at" set default current_timestamp;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "channel" alter column "id" drop default;');
    this.addSql('alter table "channel" alter column "id" drop default;');
    this.addSql('alter table "channel" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "channel" alter column "created_at" drop default;');
    this.addSql('alter table "channel" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel" alter column "updated_at" drop default;');
    this.addSql('alter table "channel" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');

    this.addSql('alter table "user" alter column "id" drop default;');
    this.addSql('alter table "user" alter column "id" drop default;');
    this.addSql('alter table "user" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "user" alter column "created_at" drop default;');
    this.addSql('alter table "user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "user" alter column "updated_at" drop default;');
    this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');

    this.addSql('alter table "friend_request" alter column "created_at" drop default;');
    this.addSql('alter table "friend_request" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "friend_request" alter column "updated_at" drop default;');
    this.addSql('alter table "friend_request" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "friend_request" add constraint "friend_request_primary_user_id_foreign" foreign key ("primary_user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "friend_request" add constraint "friend_request_target_user_id_foreign" foreign key ("target_user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "friend" alter column "created_at" drop default;');
    this.addSql('alter table "friend" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "friend" alter column "updated_at" drop default;');
    this.addSql('alter table "friend" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "friend" add constraint "friend_my_id_foreign" foreign key ("my_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "friend" add constraint "friend_friend_id_foreign" foreign key ("friend_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "dm" add column "user1_id" uuid not null, add column "user2_id" uuid not null;');
    this.addSql('alter table "dm" alter column "created_at" drop default;');
    this.addSql('alter table "dm" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "dm" alter column "updated_at" drop default;');
    this.addSql('alter table "dm" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "dm" drop constraint "dm_pkey";');
    this.addSql('alter table "dm" add constraint "dm_user1_id_foreign" foreign key ("user1_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "dm" add constraint "dm_user2_id_foreign" foreign key ("user2_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "dm" drop column "user1id";');
    this.addSql('alter table "dm" drop column "user2id";');
    this.addSql('alter table "dm" add constraint "dm_pkey" primary key ("user1_id", "user2_id");');

    this.addSql('alter table "dm_message" add column "dm_user2_id" uuid not null;');
    this.addSql('alter table "dm_message" alter column "created_at" drop default;');
    this.addSql('alter table "dm_message" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "dm_message" alter column "updated_at" drop default;');
    this.addSql('alter table "dm_message" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "dm_message" rename column "dm_id" to "dm_user1_id";');
    this.addSql('alter table "dm_message" add constraint "dm_message_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "dm_message" add constraint "dm_message_dm_user1_id_dm_user2_id_foreign" foreign key ("dm_user1_id", "dm_user2_id") references "dm" ("user1_id", "user2_id") on update cascade;');

    this.addSql('alter table "channel_user_banned" alter column "created_at" drop default;');
    this.addSql('alter table "channel_user_banned" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel_user_banned" alter column "updated_at" drop default;');
    this.addSql('alter table "channel_user_banned" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel_user_banned" add constraint "channel_user_banned_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_user_banned" add constraint "channel_user_banned_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');

    this.addSql('alter table "channel_participant" alter column "created_at" drop default;');
    this.addSql('alter table "channel_participant" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel_participant" alter column "updated_at" drop default;');
    this.addSql('alter table "channel_participant" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_participant" add constraint "channel_participant_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');

    this.addSql('alter table "channel_message" alter column "id" drop default;');
    this.addSql('alter table "channel_message" alter column "id" drop default;');
    this.addSql('alter table "channel_message" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "channel_message" alter column "created_at" drop default;');
    this.addSql('alter table "channel_message" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "channel_message" alter column "updated_at" drop default;');
    this.addSql('alter table "channel_message" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "channel_message" add constraint "channel_message_participant_id_foreign" foreign key ("participant_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "channel_message" add constraint "channel_message_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;');

    this.addSql('alter table "banned_user" alter column "created_at" drop default;');
    this.addSql('alter table "banned_user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "banned_user" alter column "updated_at" drop default;');
    this.addSql('alter table "banned_user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "banned_user" add constraint "banned_user_primary_user_id_foreign" foreign key ("primary_user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "banned_user" add constraint "banned_user_target_user_id_foreign" foreign key ("target_user_id") references "user" ("id") on update cascade;');
  }

}
