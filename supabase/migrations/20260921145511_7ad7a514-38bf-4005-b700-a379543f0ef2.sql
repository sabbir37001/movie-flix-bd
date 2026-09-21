CREATE TABLE public.episodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id uuid NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  season_num integer NOT NULL DEFAULT 1,
  episode_num integer NOT NULL DEFAULT 1,
  episode_title text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (movie_id, season_num, episode_num)
);

GRANT SELECT ON public.episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Episodes are public" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Admins manage episodes" ON public.episodes FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER episodes_updated_at BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX episodes_movie_id_idx ON public.episodes (movie_id);