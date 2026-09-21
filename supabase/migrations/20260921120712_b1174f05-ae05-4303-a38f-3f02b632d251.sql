ALTER TABLE public.movies ADD COLUMN slug text;

WITH ranked AS (
  SELECT
    id,
    regexp_replace(
      regexp_replace(
        lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')),
        '(^-+|-+$)', '', 'g'
      ),
      '-+', '-', 'g'
    ) AS base_slug,
    row_number() OVER (
      PARTITION BY regexp_replace(
        regexp_replace(
          lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')),
          '(^-+|-+$)', '', 'g'
        ),
        '-+', '-', 'g'
      )
      ORDER BY created_at, id
    ) AS duplicate_number
  FROM public.movies
)
UPDATE public.movies AS movies
SET slug = CASE
  WHEN ranked.base_slug = '' THEN movies.id::text
  WHEN ranked.duplicate_number = 1 THEN ranked.base_slug
  ELSE ranked.base_slug || '-' || ranked.duplicate_number::text
END
FROM ranked
WHERE movies.id = ranked.id;

ALTER TABLE public.movies ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.movies ADD CONSTRAINT movies_slug_key UNIQUE (slug);