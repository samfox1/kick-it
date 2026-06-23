-- Attendees become a denormalized snapshot on the hang: an immutable record of who was
-- there, decoupled from whether each member is a real account. Replaces the hang_attendees
-- join table (and its policies), which required every attendee to exist as a profile.

alter table hangs add column attendees jsonb not null default '[]';

drop policy if exists attendees_read on hang_attendees;
drop policy if exists attendees_write on hang_attendees;
drop table if exists hang_attendees;
