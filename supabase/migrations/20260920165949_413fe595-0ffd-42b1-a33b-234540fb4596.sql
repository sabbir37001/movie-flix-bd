
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid,'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  poster_url text NOT NULL DEFAULT '',
  backdrop_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Action',
  youtube_trailer_id text NOT NULL DEFAULT '',
  gdrive_download_link text NOT NULL DEFAULT '',
  release_year integer NOT NULL DEFAULT 2025,
  rating numeric(3,1) NOT NULL DEFAULT 7.5,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.movies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movies TO authenticated;
GRANT ALL ON public.movies TO service_role;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movies are public" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Admins manage movies" ON public.movies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL UNIQUE,
  image_url text NOT NULL DEFAULT '',
  target_link text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ads are public" ON public.ads FOR SELECT USING (true);
CREATE POLICY "Admins manage ads" ON public.ads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_name text NOT NULL DEFAULT '',
  dev_whatsapp text NOT NULL DEFAULT '',
  dev_website text NOT NULL DEFAULT '',
  live_tv_1_title text NOT NULL DEFAULT 'Live Sports',
  live_tv_1_url text NOT NULL DEFAULT '',
  live_tv_2_title text NOT NULL DEFAULT 'Live News',
  live_tv_2_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are public" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.settings (dev_name, dev_whatsapp, dev_website, live_tv_1_title, live_tv_1_url, live_tv_2_title, live_tv_2_url)
VALUES ('Rupam', '+8801700000000', 'https://example.com', 'Live Sports', 'https://www.youtube.com/embed/live_stream?channel=UCqZQlzSHbVJrwrn5XvzrzcA', 'Live News', 'https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw');

INSERT INTO public.ads (position, image_url, target_link) VALUES
('top', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=70', 'https://example.com'),
('bottom', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=70', 'https://example.com');

INSERT INTO public.movies (title, description, poster_url, backdrop_url, category, youtube_trailer_id, gdrive_download_link, release_year, rating, is_featured) VALUES
('Crimson Horizon','A stranded crew races against a collapsing star to bring humanity home.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1920&q=75','Sci-Fi','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2025,8.6,true),
('Night Pursuit','A detective hunts a ghost of a criminal through a city that never sleeps.','https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=75','Thriller','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2024,7.9,false),
('Iron Verdict','One soldier, one city, one impossible order.','https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=75','Action','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2025,8.1,false),
('The Hollow House','A family inherits a home that remembers everyone who ever died in it.','https://images.unsplash.com/photo-1520637736862-4d197d17c55a?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1920&q=75','Horror','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2023,7.2,false),
('Paper Planes','Two strangers keep missing each other by one train, for ten years.','https://images.unsplash.com/photo-1512914890251-2f96a9b0bbcb?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1920&q=75','Romance','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2024,7.6,false),
('Office Hours','The worst startup in the world accidentally saves the economy.','https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=75','Comedy','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2025,6.9,false),
('Skyfall Valley','An expedition into uncharted mountains finds something older than maps.','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1920&q=75','Adventure','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2024,8.0,false),
('Lanterns','A hand-drawn tale of a girl who carries light to a village without sun.','https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=70','https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=75','Animation','dQw4w9WgXcQ','https://drive.google.com/file/d/EXAMPLE/view',2023,8.4,false);
