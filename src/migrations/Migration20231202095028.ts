import { Migration } from '@mikro-orm/migrations';

export class Migration20231202095028 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "friend_request" alter column "is_accepted" type boolean using ("is_accepted"::boolean);',
    );
    this.addSql(
      'alter table "friend_request" alter column "is_accepted" set default null;',
    );
    this.addSql(
      'create index "friend_request_primary_user_id_target_user_id_index" on "friend_request" ("primary_user_id", "target_user_id");',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "friend_request" alter column "is_accepted" type boolean using ("is_accepted"::boolean);',
    );
    this.addSql(
      'alter table "friend_request" alter column "is_accepted" set default false;',
    );
    this.addSql(
      'drop index "friend_request_primary_user_id_target_user_id_index";',
    );
  }
}
