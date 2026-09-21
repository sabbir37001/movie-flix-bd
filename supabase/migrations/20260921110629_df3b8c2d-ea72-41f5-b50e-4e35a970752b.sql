ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS scrolling_notice text NOT NULL DEFAULT '';