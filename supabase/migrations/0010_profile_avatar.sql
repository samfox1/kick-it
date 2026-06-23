-- Store each user's chosen avatar URL (DiceBear notionists). Nullable: when unset the app
-- shows a deterministic default seeded from the user id.

alter table profiles add column avatar text;
