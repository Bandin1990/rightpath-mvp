-- Convenience entry point for psql users.
-- The timestamped Supabase migration is the canonical, reviewable schema.
\ir ../supabase/migrations/20260801071932_initial_knowledge_schema.sql
\ir ../supabase/migrations/20260801074720_lock_down_public_schema.sql
\ir ../supabase/migrations/20260801095423_emergency_admin_console.sql
