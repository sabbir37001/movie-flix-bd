import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import { seasonEpisodeBadge, type Movie } from "@/lib/jannat";
import { WatchlistButton } from "@/components/watchlist-button";

export function MovieCard({ movie }: { movie: Movie }) {
  const episodeBadge = seasonEpisodeBadge(movie.season, movie.episode);
  return (
    <article className="relative">
      <Link
        to="/movie/$id"
        params={{ id: movie.id }}
        aria-label={`Watch or download ${movie.title} (${movie.release_year})`}
        className="card-shadow group block w-full overflow-hidden rounded-xl border border-border/50 bg-card text-left transition-[transform,background-color,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none motion-reduce:transform-none"
      >
        <div className="relative aspect-2/3 overflow-hidden bg-muted">
          <img
            src={movie.poster_url}
            alt={`${movie.title} (${movie.release_year}) ${movie.category} movie poster`}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transform-none"
          />
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-bold backdrop-blur">
            <Star className="size-3 fill-primary text-primary" />
            {movie.rating}
          </span>
          {episodeBadge && (
            <span className="absolute top-2 right-2 rounded-full border border-primary/40 bg-primary/85 px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary-foreground backdrop-blur">
              {episodeBadge}
            </span>
          )}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/75 to-background/10 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="crimson-gradient glow-shadow absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 size-5 fill-primary-foreground text-primary-foreground" />
            </span>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-primary text-primary" />
                  {movie.rating}
                </span>
                <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
                <span>{movie.release_year}</span>
              </p>
              <p className="line-clamp-3 text-xs leading-relaxed text-body-foreground">
                {movie.description}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-1 p-3">
          <h3 className="truncate font-display text-lg leading-tight">{movie.title}</h3>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{movie.release_year}</span>
            <span className="size-1 rounded-full bg-primary" />
            <span className="truncate">{movie.category}</span>
          </p>
        </div>
      </Link>
      <WatchlistButton
        movieId={movie.id}
        compact
        className="absolute right-2 bottom-12 z-10 size-9 border border-border/70 shadow-md"
      />
    </article>
  );
}
