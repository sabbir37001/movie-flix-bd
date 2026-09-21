import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { currentUserQuery, watchlistIdsQuery } from "@/lib/engagement";
import { moviesQuery, settingsQuery } from "@/lib/jannat";

export const Route = createFileRoute("/_authenticated/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist — JANNAT FLIX" },
      { name: "description", content: "Your saved movies and series on JANNAT FLIX." },
      { property: "og:title", content: "My Watchlist — JANNAT FLIX" },
      { property: "og:description", content: "Your saved movies and series on JANNAT FLIX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const user = useQuery(currentUserQuery);
  const ids = useQuery(watchlistIdsQuery(user.data?.id));
  const movies = useQuery(moviesQuery);
  const settings = useQuery(settingsQuery);
  const saved = (movies.data ?? []).filter((movie) => ids.data?.includes(movie.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
          <Link to="/"><ArrowLeft />Home</Link>
        </Button>
        <header className="mb-7 flex items-center gap-3 border-b border-border/60 pb-5">
          <span className="crimson-gradient flex size-10 items-center justify-center rounded-md">
            <Bookmark className="size-5 fill-primary-foreground text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-4xl sm:text-5xl">My Watchlist</h1>
            <p className="text-sm text-muted-foreground">Your saved movies and series</p>
          </div>
        </header>
        {movies.isLoading || ids.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="aspect-2/3 rounded-xl" />)}
          </div>
        ) : saved.length ? (
          <section aria-label="Saved movies" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {saved.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <Bookmark className="mx-auto size-9 text-primary" />
            <h2 className="mt-3 font-display text-2xl">Your watchlist is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Save a title and it will appear here.</p>
            <Button asChild className="mt-5"><Link to="/">Browse Movies</Link></Button>
          </div>
        )}
      </main>
      <SiteFooter settings={settings.data ?? null} />
    </div>
  );
}