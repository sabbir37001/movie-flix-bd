ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS ad_code text NOT NULL DEFAULT '';
INSERT INTO public.ads (position, image_url, target_link, is_active)
VALUES ('movie_detail', '', '', true)
ON CONFLICT (position) DO NOTHING;