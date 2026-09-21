import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListVideo, LogOut, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { adsQuery, moviesQuery, settingsQuery, CATEGORIES, type Movie } from "@/lib/jannat";
import { EpisodeManager } from "@/components/episode-manager";
import { AdminRequests } from "@/components/admin-requests";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — JANNAT FLIX" },
      { name: "description", content: "Manage movies, requests, ad banners, live TV and developer info." },
      { property: "og:title", content: "Admin Panel — JANNAT FLIX" },
      { property: "og:description", content: "JANNAT FLIX content management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyMovie = {
  title: "",
  slug: "",
  description: "",
  poster_url: "",
  backdrop_url: "",
  category: "Action",
  youtube_trailer_id: "",
  gdrive_download_link: "",
  release_year: new Date().getFullYear(),
  rating: 7.5,
  is_featured: false,
  season: "",
  episode: "",
};

type MovieForm = typeof emptyMovie & { id?: string };

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const roleQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  const movies = useQuery(moviesQuery);
  const ads = useQuery(adsQuery);
  const settings = useQuery(settingsQuery);

  const refresh = () => {
    queryClient.invalidateQueries();
  };

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function claimAdmin() {
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("You are now the admin.");
      roleQuery.refetch();
    } else {
      toast.error("An admin already exists for this site.");
    }
  }

  if (roleQuery.isLoading) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!roleQuery.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="card-shadow w-full max-w-md space-y-4 rounded-2xl bg-card p-7 text-center">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h1 className="font-display text-3xl">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            This account is not an admin yet. If you are the site owner and no admin exists, claim
            access now.
          </p>
          <Button onClick={claimAdmin} className="w-full">
            Claim admin access
          </Button>
          <Button variant="secondary" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
          <h1 className="font-display text-2xl">
            JANNAT <span className="text-primary">FLIX</span> Admin
          </h1>
          <div className="ml-auto flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/">View site</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Tabs defaultValue="movies">
          <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-1 bg-surface">
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="ads">Ad banners</TabsTrigger>
            <TabsTrigger value="live">Live TV</TabsTrigger>
            <TabsTrigger value="dev">Developer info</TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <MoviesTab movies={movies.data ?? []} onChanged={refresh} />
          </TabsContent>

          <TabsContent value="requests">
            <AdminRequests />
          </TabsContent>

          <TabsContent value="ads">
            <AdsTab ads={ads.data ?? []} onChanged={refresh} />
          </TabsContent>

          <TabsContent value="live">
            <SettingsForm
              settings={settings.data ?? null}
              onChanged={refresh}
              fields={[
                { key: "live_tv_1_title", label: "Channel 1 title" },
                { key: "live_tv_1_url", label: "Channel 1 YouTube URL or video ID" },
                { key: "live_tv_2_title", label: "Channel 2 title" },
                { key: "live_tv_2_url", label: "Channel 2 YouTube URL or video ID" },
              ]}
            />
          </TabsContent>

          <TabsContent value="dev">
            <SettingsForm
              settings={settings.data ?? null}
              onChanged={refresh}
              fields={[
                { key: "dev_name", label: "Developer name" },
                { key: "dev_whatsapp", label: "WhatsApp number" },
                { key: "dev_website", label: "Portfolio URL" },
                {
                  key: "scrolling_notice",
                  label: "Scrolling notice",
                  multiline: true,
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function MoviesTab({ movies, onChanged }: { movies: Movie[]; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MovieForm>(emptyMovie);
  const [episodesFor, setEpisodesFor] = useState<Movie | null>(null);

  const save = useMutation({
    mutationFn: async (value: MovieForm) => {
      const { id, ...fields } = value;
      const payload = {
        ...fields,
        season: fields.season.trim() || null,
        episode: fields.episode.trim() || null,
        slug:
          fields.slug.trim() ||
          fields.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
      };
      if (id) {
        const { error } = await supabase.from("movies").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("movies").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Movie saved");
      setOpen(false);
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("movies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Movie deleted");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function edit(movie: Movie) {
    setForm({
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      poster_url: movie.poster_url,
      backdrop_url: movie.backdrop_url,
      category: movie.category,
      youtube_trailer_id: movie.youtube_trailer_id,
      gdrive_download_link: movie.gdrive_download_link,
      release_year: movie.release_year,
      rating: Number(movie.rating),
      is_featured: movie.is_featured,
      season: movie.season ?? "",
      episode: movie.episode ?? "",
    });
    setOpen(true);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Movies ({movies.length})</h2>
        <Button
          onClick={() => {
            setForm(emptyMovie);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add movie
        </Button>
      </div>

      <ul className="space-y-2">
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <img
              src={movie.poster_url}
              alt=""
              className="h-16 w-11 shrink-0 rounded object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold">{movie.title}</p>
              <p className="text-xs text-muted-foreground">
                {movie.category} · {movie.release_year} · ⭐ {movie.rating}
                {movie.is_featured ? " · Featured" : ""}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setEpisodesFor(movie)}
                aria-label={`Manage episodes of ${movie.title}`}
              >
                <ListVideo className="size-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={() => edit(movie)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => remove.mutate(movie.id)}
                disabled={remove.isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {form.id ? "Edit movie" : "Add movie"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="URL slug" className="sm:col-span-2">
              <Input
                value={form.slug}
                placeholder="Generated from the title when left blank"
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Poster image URL">
              <Input
                value={form.poster_url}
                onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
              />
            </Field>
            <Field label="Backdrop image URL">
              <Input
                value={form.backdrop_url}
                onChange={(e) => setForm({ ...form, backdrop_url: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c} className="bg-card">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="YouTube trailer ID or URL">
              <Input
                value={form.youtube_trailer_id}
                onChange={(e) => setForm({ ...form, youtube_trailer_id: e.target.value })}
              />
            </Field>
            <Field label="Google Drive download link" className="sm:col-span-2">
              <Input
                value={form.gdrive_download_link}
                onChange={(e) => setForm({ ...form, gdrive_download_link: e.target.value })}
              />
            </Field>
            <Field label="Release year">
              <Input
                type="number"
                value={form.release_year}
                onChange={(e) => setForm({ ...form, release_year: Number(e.target.value) })}
              />
            </Field>
            <Field label="Rating (0-10)">
              <Input
                type="number"
                step="0.1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              />
            </Field>
            <Field label="Season (optional)">
              <Input
                value={form.season}
                placeholder="Season 1"
                onChange={(e) => setForm({ ...form, season: e.target.value })}
              />
            </Field>
            <Field label="Episode (optional)">
              <Input
                value={form.episode}
                placeholder="Episode 1"
                onChange={(e) => setForm({ ...form, episode: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="featured"
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
              <Label htmlFor="featured">Show in the homepage featured slider</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save movie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!episodesFor} onOpenChange={(v) => !v && setEpisodesFor(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Manage episodes — {episodesFor?.title}
            </DialogTitle>
          </DialogHeader>
          {episodesFor && <EpisodeManager movieId={episodesFor.id} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AdsTab({
  ads,
  onChanged,
}: {
  ads: {
    id: string;
    position: string;
    image_url: string;
    target_link: string;
    is_active: boolean;
    ad_code?: string;
  }[];
  onChanged: () => void;
}) {
  const slots: { position: string; title: string; hint: string }[] = [
    { position: "top", title: "Homepage — top banner", hint: "Shown between the slider and the movie grid." },
    { position: "bottom", title: "Homepage — above footer", hint: "Shown at the bottom of the homepage." },
    {
      position: "movie_detail",
      title: "Movie page — below details",
      hint: "Shown under the movie details and trailer.",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {slots.map((slot) => (
        <AdCard
          key={slot.position}
          position={slot.position}
          title={slot.title}
          hint={slot.hint}
          ad={ads.find((a) => a.position === slot.position)}
          onChanged={onChanged}
        />
      ))}
    </section>
  );
}

function AdCard({
  position,
  title,
  hint,
  ad,
  onChanged,
}: {
  position: string;
  title: string;
  hint: string;
  ad:
    | { id: string; image_url: string; target_link: string; is_active: boolean; ad_code?: string }
    | undefined;
  onChanged: () => void;
}) {
  const [image, setImage] = useState(ad?.image_url ?? "");
  const [link, setLink] = useState(ad?.target_link ?? "");
  const [code, setCode] = useState(ad?.ad_code ?? "");
  const [active, setActive] = useState(ad?.is_active ?? true);

  useEffect(() => {
    setImage(ad?.image_url ?? "");
    setLink(ad?.target_link ?? "");
    setCode(ad?.ad_code ?? "");
    setActive(ad?.is_active ?? true);
  }, [ad?.image_url, ad?.target_link, ad?.ad_code, ad?.is_active]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        position,
        image_url: image,
        target_link: link,
        ad_code: code,
        is_active: active,
      };
      const { error } = await supabase.from("ads").upsert(payload, { onConflict: "position" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ad banner updated");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Field label="Banner image URL">
        <Input value={image} onChange={(e) => setImage(e.target.value)} />
      </Field>
      <Field label="Redirect link">
        <Input value={link} onChange={(e) => setLink(e.target.value)} />
      </Field>
      <Field label="Ad network code (used only when no banner image is set)">
        <Textarea
          rows={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your AdSense or ad network snippet here"
        />
      </Field>
      <div className="flex items-center gap-3">
        <Switch id={`${position}-active`} checked={active} onCheckedChange={setActive} />
        <Label htmlFor={`${position}-active`}>Visible on site</Label>
      </div>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        Save banner
      </Button>
    </div>
  );
}

type SettingsRow = Record<string, unknown> & { id: string };

function SettingsForm({
  settings,
  fields,
  onChanged,
}: {
  settings: SettingsRow | null;
  fields: { key: string; label: string; multiline?: boolean }[];
  onChanged: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const f of fields) next[f.key] = String(settings?.[f.key] ?? "");
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      if (settings?.id) {
        const { error } = await supabase.from("settings").update(values as never).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("settings").insert(values as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Settings updated");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
      {fields.map((f) => (
        <Field key={f.key} label={f.label}>
          {f.multiline ? (
            <Textarea
              rows={4}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder="Enter the notice shown above the footer"
            />
          ) : (
            <Input
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          )}
        </Field>
      ))}
      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        Save changes
      </Button>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
