CREATE TABLE public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default 'ec33f8f8-83ab-4a2f-82c2-fcb479c8f9c5'::uuid,
  plan_date date not null,
  goals jsonb not null default '{"protein":120,"kcal":2500}'::jsonb,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, plan_date)
);

CREATE TABLE public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default 'ec33f8f8-83ab-4a2f-82c2-fcb479c8f9c5'::uuid,
  name text not null,
  category text not null default 'other',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

CREATE TABLE public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default 'ec33f8f8-83ab-4a2f-82c2-fcb479c8f9c5'::uuid,
  log_date date not null,
  weight_kg numeric,
  waist_cm numeric,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

GRANT ALL ON public.meal_plans TO anon, authenticated;
GRANT ALL ON public.grocery_items TO anon, authenticated;
GRANT ALL ON public.body_metrics TO anon, authenticated;
GRANT ALL ON public.meal_plans TO service_role;
GRANT ALL ON public.grocery_items TO service_role;
GRANT ALL ON public.body_metrics TO service_role;

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open meal_plans" ON public.meal_plans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open grocery_items" ON public.grocery_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open body_metrics" ON public.body_metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);