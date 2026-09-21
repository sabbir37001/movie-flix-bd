CREATE TABLE public.movie_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_name text NOT NULL CHECK (char_length(btrim(movie_name)) BETWEEN 1 AND 200),
  requested_by text CHECK (requested_by IS NULL OR char_length(btrim(requested_by)) <= 120),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.movie_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.movie_requests TO authenticated;
GRANT ALL ON public.movie_requests TO service_role;

ALTER TABLE public.movie_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit movie requests"
ON public.movie_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

CREATE POLICY "Admins can view movie requests"
ON public.movie_requests
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update movie requests"
ON public.movie_requests
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete movie requests"
ON public.movie_requests
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX movie_requests_status_created_at_idx
ON public.movie_requests (status, created_at DESC);