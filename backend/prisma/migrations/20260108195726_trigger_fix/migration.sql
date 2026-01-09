-- cos nie moglo przejsc wczesniej wiec jeszcze raz tworzymy trigger aktualizujacy updatedAt przy update celu

--moje debuggery w pgadminie
-- SELECT migration_name, finished_at
-- FROM "_prisma_migrations"
-- ORDER BY finished_at DESC NULLS LAST;





-- SELECT n.nspname AS schema, c.relname AS table, t.tgname
-- FROM pg_trigger t
-- JOIN pg_class c ON c.oid = t.tgrelid
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE NOT t.tgisinternal
--   AND c.relname = 'Goal';



-- SELECT to_regclass('public."Goal"') AS goal_table;


-- SELECT tgname
-- FROM pg_trigger
-- WHERE tgrelid = 'public."Goal"'::regclass
--   AND NOT tgisinternal;



CREATE OR REPLACE FUNCTION set_goal_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_goal_set_updated_at ON public."Goal";

CREATE TRIGGER trg_goal_set_updated_at
BEFORE UPDATE ON public."Goal"
FOR EACH ROW
EXECUTE FUNCTION set_goal_updated_at();
