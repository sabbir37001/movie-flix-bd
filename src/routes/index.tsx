import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Film } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/hero-section";
import { AdBanner } from "@/components/ad-banner";
import { MovieCard } from "@/components/movie-card";
import { LiveTV } from "@/components/live-tv";
import { ScrollingNotice } from "@/components/scrolling-notice";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  adsQuery,
  categoryPageFor,
  moviesQuery,
  SECTIONED_CATEGORIES,
  settingsQuery,
} from "@/lib/jannat";

const HOME_SECTION_LIMIT = 10;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JANNAT FLIX — Watch Trailers & Download Latest HD Movies Free" },
      {
        name: "description",
        content:
          "JANNAT FLIX is a free movie streaming and download hub: watch HD trailers, download the latest Action, Sci-Fi, Horror, Comedy and Drama movies, plus 24/7 live sports and news TV.",
      },
      {
        name: "keywords",
        content:
          "movie download, watch movies online, free HD movies, latest movies, action movies, sci-fi movies, horror movies, movie trailers, live tv, live sports streaming, JANNAT FLIX",
      },
      { property: "og:title", content: "JANNAT FLIX — Movies, Trailers & Live TV" },
      {
        property: "og:description",
        content:
          "Browse the newest movies by genre, watch trailers instantly and download in HD, plus 24/7 live channels.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://jannat-flix-stream.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "JANNAT FLIX — Movies, Trailers & Live TV" },
      {
        name: "twitter:description",
        content: "Watch trailers, download HD movies and stream live sports and news on JANNAT FLIX.",
      },
    ],
    links: [{ rel: "canonical", href: "https://jannat-flix-stream.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "JANNAT FLIX",
          url: "https://jannat-flix-stream.lovable.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://jannat-flix-stream.lovable.app/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const movies = useQuery(moviesQuery);
  const ads = useQuery(adsQuery);
  const settings = useQuery(settingsQuery);

  const list = movies.data ?? [];
  const featuredMovies = useMemo(() => {
    const selected = list.filter((movie) => movie.is_featured);
    return selected.length > 0 ? selected : list.slice(0, 5);
  }, [list]);

  const hindiDubbedMovies = useMemo(
    () => list.filter((movie) => movie.category === "HINDI DUBBED MOVIE"),
    [list],
  );

  const hindiDubbedSeries = useMemo(
    () => list.filter((movie) => movie.category === "Hindi Dubbed Series"),
    [list],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((m) => {
      const belongsInLatest =
        category === m.category || !SECTIONED_CATEGORIES.includes(m.category as (typeof SECTIONED_CATEGORIES)[number]);
      const matchesCategory = category === "All" || m.category === category;
      const matchesSearch =
        !term ||
        m.title.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term) ||
        String(m.release_year).includes(term);
      return belongsInLatest && matchesCategory && matchesSearch;
    });
  }, [list, search, category]);

  const activeCategoryPage = categoryPageFor(category);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />

      <main>
        {movies.isLoading ? (
          <Skeleton className="h-[60vh] w-full rounded-none" />
        ) : featuredMovies.length > 0 ? (
          <HeroSection movies={featuredMovies} />
        ) : null}

        <div className="py-8">
          <AdBanner ad={ads.data?.find((a) => a.position === "top")} label="Top advertisement" />
        </div>

        <section aria-labelledby="latest-heading" className="mx-auto w-full max-w-7xl px-4">
          <div className="mb-5 flex items-center gap-2">
            <Film className="size-5 text-primary" />
            <h2 id="latest-heading" className="font-display text-3xl">
              {category === "All" ? "Latest Movies" : category}
            </h2>
            <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">
              {filtered.length} titles
            </span>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
              <Link to="/category/$slug" params={{ slug: activeCategoryPage.slug }}>
                View All
                <ArrowRight />
              </Link>
            </Button>
          </div>

          {movies.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-2/3 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl bg-card p-10 text-center text-sm text-muted-foreground">
              No movies match your search yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {filtered.slice(0, HOME_SECTION_LIMIT).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {!movies.isLoading && category === "All" && hindiDubbedMovies.length > 0 ? (
          <section
            aria-labelledby="hindi-dubbed-heading"
            className="mx-auto w-full max-w-7xl px-4 pt-12"
          >
            <div className="mb-5 flex items-center gap-2">
              <Film className="size-5 text-primary" />
              <h2 id="hindi-dubbed-heading" className="font-display text-3xl">
                HINDI DUBBED MOVIE
              </h2>
              <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">
                {hindiDubbedMovies.length} titles
              </span>
              <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
                <Link to="/category/$slug" params={{ slug: "hindi-dubbed-movie" }}>
                  View All
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {hindiDubbedMovies.slice(0, HOME_SECTION_LIMIT).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        ) : null}

        {!movies.isLoading && category === "All" && hindiDubbedSeries.length > 0 ? (
          <section
            aria-labelledby="hindi-series-heading"
            className="mx-auto w-full max-w-7xl px-4 pt-12"
          >
            <div className="mb-5 flex items-center gap-2">
              <Film className="size-5 text-primary" />
              <h2 id="hindi-series-heading" className="font-display text-3xl">
                Hindi Dubbed Series
              </h2>
              <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">
                {hindiDubbedSeries.length} titles
              </span>
              <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
                <Link to="/category/$slug" params={{ slug: "hindi-dubbed-series" }}>
                  View All
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {hindiDubbedSeries.slice(0, HOME_SECTION_LIMIT).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        ) : null}



        <LiveTV settings={settings.data ?? null} />

        <div className="pb-10">
          <AdBanner
            ad={ads.data?.find((a) => a.position === "bottom")}
            label="Bottom advertisement"
          />
        </div>
      </main>

      <ScrollingNotice notice={settings.data?.scrolling_notice} />
      <SiteFooter settings={settings.data ?? null} />
    </div>
  );
}
