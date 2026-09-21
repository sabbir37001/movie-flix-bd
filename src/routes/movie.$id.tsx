import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Play, Star } from "lucide-react";
import { episodeCode, episodesQuery, groupBySeason, type Episode } from "@/lib/jannat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { adsQuery, gdrivePreview, getDirectDownloadLink, seasonEpisodeLabel, settingsQuery, youtubeEmbed, type Movie, type Settings } from "@/lib/jannat";
import { AdBanner } from "@/components/ad-banner";
import { useQuery } from "@tanstack/react-query";
import { WatchlistButton } from "@/components/watchlist-button";
import { CommentsSection } from "@/components/comments-section";

const SITE = "https://jannat-flix-stream.lovable.app";

export const Route = createFileRoute("/movie/$id")({
  loader: async ({ params }): Promise<{ movie: Movie }> => {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { movie: data };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Movie unavailable — JANNAT FLIX" }, { name: "robots", content: "noindex" }] };
    }
    const m = loaderData.movie;
    const title = `Watch/Download ${m.title} - JANNAT FLIX`;
    const description = `${m.title} (${m.release_year}) — ${m.description ?? ""}`.slice(0, 300);
    const url = `${SITE}/movie/${params.id}`;
    const image = m.backdrop_url || m.poster_url;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${m.title}, ${m.title} download, ${m.category} movies, ${m.release_year} movies, watch ${m.title} online, JANNAT FLIX`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.movie" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            name: m.title,
            description: m.description,
            image: m.poster_url,
            genre: m.category,
            dateCreated: String(m.release_year),
            aggregateRating: m.rating
              ? { "@type": "AggregateRating", ratingValue: m.rating, bestRating: 10, ratingCount: 1 }
              : undefined,
          }),
        },
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const { movie } = Route.useLoaderData();
  const settings = useQuery(settingsQuery);
  const ads = useQuery(adsQuery);
  const episodes = useQuery(episodesQuery(movie.id));
  const [selected, setSelected] = useState<Episode | null>(null);
  const embed = youtubeEmbed(movie.youtube_trailer_id);
  const [playerOpen, setPlayerOpen] = useState(false);

  const seasons = groupBySeason(episodes.data ?? []);
  const hasEpisodes = seasons.length > 0;
  const activeEpisode = selected ?? (hasEpisodes ? (seasons[0]?.[1]?.[0] ?? null) : null);
  const sourceLink = activeEpisode?.video_url || movie.gdrive_download_link;
  const drivePreview = gdrivePreview(sourceLink);
  const downloadLink = getDirectDownloadLink(sourceLink);
  // Prefer the Google Drive stream; fall back to the YouTube trailer.
  const watchSrc = drivePreview || embed;
  const watchIsDrive = Boolean(drivePreview);
  const playerLabel = activeEpisode
    ? `${movie.title} — ${episodeCode(activeEpisode.season_num, activeEpisode.episode_num)}`
    : watchIsDrive
      ? `${movie.title} — Full Movie`
      : `${movie.title} — Trailer`;

  function playEpisode(ep: Episode) {
    setSelected(ep);
    setPlayerOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to movies
        </Link>

        <article className="grid gap-8 md:grid-cols-[260px_1fr]">
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="card-shadow w-full rounded-xl border border-border/50 object-cover"
          />
          <div>
            <h1 className="font-display text-4xl sm:text-5xl">{movie.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Star className="size-4 fill-primary text-primary" />
                {movie.rating}
              </span>
              <span>{movie.release_year}</span>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">
                {movie.category}
              </span>
              {seasonEpisodeLabel(movie.season, movie.episode) && (
                <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {seasonEpisodeLabel(movie.season, movie.episode)}
                </span>
              )}
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">{movie.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="glow-shadow"
                onClick={() => setPlayerOpen(true)}
                disabled={!watchSrc}
              >
                <Play className="size-4 fill-current" />
                {activeEpisode
                  ? `Play ${episodeCode(activeEpisode.season_num, activeEpisode.episode_num)}`
                  : "Watch Now"}
              </Button>
              {downloadLink && (
                <Button asChild size="lg" variant="secondary">
                  <a href={downloadLink} target="_blank" rel="noopener noreferrer">
                    <Download className="size-4" />
                    Download
                  </a>
                </Button>
              )}
              <WatchlistButton movieId={movie.id} />
            </div>
          </div>
        </article>

        {hasEpisodes && (
          <section aria-labelledby="episodes-heading" className="mt-10">
            <h2 id="episodes-heading" className="mb-4 font-display text-2xl">
              Episodes
            </h2>
            <div className="space-y-6">
              {seasons.map(([season, list]) => (
                <div key={season}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Season {season}
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {list.map((ep) => {
                      const isActive = activeEpisode?.id === ep.id;
                      return (
                        <li key={ep.id}>
                          <button
                            type="button"
                            onClick={() => playEpisode(ep)}
                            aria-current={isActive ? "true" : undefined}
                            className={`card-shadow flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                              isActive
                                ? "border-primary/60 bg-primary/10"
                                : "border-border/50 bg-card hover:bg-surface"
                            }`}
                          >
                            <span className="shrink-0 rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                              {episodeCode(ep.season_num, ep.episode_num)}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {ep.episode_title || `Episode ${ep.episode_num}`}
                            </span>
                            <Play className="size-4 shrink-0 fill-current text-primary" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {embed && (
          <section aria-labelledby="trailer-heading" className="mt-10">
            <h2 id="trailer-heading" className="mb-4 font-display text-2xl">
              Official Trailer
            </h2>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-muted">
              <iframe
                src={embed}
                title={`${movie.title} trailer`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          </section>
        )}

        <div className="mt-10 -mx-4">
          <AdBanner
            ad={ads.data?.find((a) => a.position === "movie_detail")}
            label="Movie page advertisement"
          />
        </div>
        <CommentsSection movieId={movie.id} movieTitle={movie.title} />
      </main>
      <SiteFooter settings={(settings.data as Settings | null) ?? null} />

      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl border-border/50 bg-background p-3 sm:p-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              {playerLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-border/50 bg-muted">
            {playerOpen && watchSrc && (
              <iframe
                src={watchSrc}
                title={`${playerLabel} player`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
