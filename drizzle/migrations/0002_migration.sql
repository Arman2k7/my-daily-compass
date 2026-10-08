DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['daily_logs','meals','routine_checks','routine_tasks','workout_sets'] LOOP
  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN user_id SET DEFAULT ''ec33f8f8-83ab-4a2f-82c2-fcb479c8f9c5''::uuid', t);
  EXECUTE format('DROP POLICY IF EXISTS "own %s" ON public.%I', t, t);
  EXECUTE format('CREATE POLICY "open %s" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
END LOOP; END $$;