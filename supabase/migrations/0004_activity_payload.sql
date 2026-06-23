-- The feed is an immutable activity log. Store the fully-denormalized FeedItem as a snapshot
-- so feed cards render without joins and without per-viewer score ambiguity (the score/name/
-- author are frozen as they were when the activity happened). Columns (kind/actor/spot/rank)
-- stay for querying + RLS; payload carries the display shape.

alter table activity add column payload jsonb not null default '{}';
