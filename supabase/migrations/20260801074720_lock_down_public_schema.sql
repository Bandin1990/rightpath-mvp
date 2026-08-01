-- The built-in PUBLIC role grants privileges inherited by anon/authenticated.
-- Revoke from PUBLIC as well as the application roles for defense in depth.
revoke all on schema public from public, anon, authenticated;
revoke all on all tables in schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
