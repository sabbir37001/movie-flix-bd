import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { youtubeEmbed, type Movie } from "@/lib/jannat";

export function HeroSection({ movies }: { movies: Movie[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);

  const syncCurrent = useCallback((carouselApi: CarouselApi) => {
    if (carouselApi) setCurrent(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    syncCurrent(api);
    api.on("select", syncCurrent);
    api.on("reInit", syncCurrent);
    return () => {
      api.off("select", syncCurrent);
      api.off("reInit", syncCurrent);
    };
  }, [api, syncCurrent]);

  useEffect(() => {
    if (!api || movies.length < 2 || trailerMovie) return;
    const timer = window.setInterval(() => api.scrollNext(), 5000);
    return () => window.clearInterval(timer);
  }, [api, movies.length, trailerMovie]);

  const embed = youtubeEmbed(trailerMovie?.youtube_trailer_id ?? "");

  return (
    <section aria-label="Featured movies" className="relative">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="ml-0">
          {movies.map((movie, index) => (
            <CarouselItem key={movie.id} className="pl-0">
              <article className="relative h-[350px] w-full overflow-hidden sm:h-[55vh] md:h-[600px] lg:h-[70vh]">
                <img
                  src={movie.backdrop_url || movie.poster_url}
                  alt={`${movie.title} (${movie.release_year}) featured movie backdrop`}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="size-full object-cover"
                />
                <div className="hero-fade absolute inset-0" />
                <div className="hero-fade-side absolute inset-0" />

                <div className="absolute inset-0 flex items-end">
                  <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-16 sm:pb-14 md:px-20">
                    <p className="mb-1 text-[10px] font-bold tracking-[0.3em] text-primary uppercase sm:mb-2 sm:text-xs">
                      Featured
                    </p>
                    <h1 className="max-w-3xl truncate font-display text-4xl leading-none sm:text-6xl md:text-7xl">
                      {movie.title}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:mt-3 sm:gap-3 sm:text-sm">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Star className="size-3.5 fill-primary text-primary sm:size-4" />
                        {movie.rating}
                      </span>
                      <span>{movie.release_year}</span>
                      <span className="rounded-full bg-surface/80 px-2.5 py-0.5 text-xs font-semibold backdrop-blur sm:px-3 sm:py-1">
                        {movie.category}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:line-clamp-3 sm:text-base">
                      {movie.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                      <Button size="lg" className="h-11 px-5 text-sm sm:h-10 sm:px-8 sm:text-base" onClick={() => setTrailerMovie(movie)}>
                        <Play className="size-4 fill-current" />
                        Watch Trailer
                      </Button>
                      <Button asChild size="lg" variant="secondary" className="h-11 px-5 text-sm sm:h-10 sm:px-8 sm:text-base">
                        <a href={movie.gdrive_download_link} target="_blank" rel="noopener noreferrer">
                          <Download className="size-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>

        <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Previous featured movie"
              onClick={() => api?.scrollPrev()}
              disabled={movies.length < 2}
              className="absolute top-1/2 left-3 z-10 size-10 -translate-y-1/2 rounded-full border border-border/50 bg-surface/80 backdrop-blur-md sm:left-5 sm:size-12"
            >
              <ChevronLeft className="size-6" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Next featured movie"
              onClick={() => api?.scrollNext()}
              disabled={movies.length < 2}
              className="absolute top-1/2 right-3 z-10 size-10 -translate-y-1/2 rounded-full border border-border/50 bg-surface/80 backdrop-blur-md sm:right-5 sm:size-12"
            >
              <ChevronRight className="size-6" />
            </Button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-5 sm:gap-2" role="tablist" aria-label="Featured movies">
              {movies.map((movie, index) => (
                <Button
                  key={movie.id}
                  type="button"
                  variant="ghost"
                  size="icon"
                  role="tab"
                  aria-label={`Show ${movie.title}`}
                  aria-selected={current === index}
                  onClick={() => api?.scrollTo(index)}
                  className={`size-7 rounded-full p-0 hover:bg-transparent ${current === index ? "text-primary" : "text-muted-foreground"}`}
                >
                  <span
                    className={`size-2.5 rounded-full bg-current transition-transform duration-300 ${current === index ? "scale-125" : ""}`}
                  />
                </Button>
              ))}
            </div>
          </>
      </Carousel>

      <Dialog open={!!trailerMovie} onOpenChange={(open) => !open && setTrailerMovie(null)}>
        <DialogContent className="max-w-3xl border-border bg-card p-0">
          <DialogHeader className="px-5 pt-5 text-left">
            <DialogTitle className="font-display text-2xl">
              {trailerMovie?.title} — Trailer
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-muted">
            {embed && (
              <iframe
                src={`${embed}?autoplay=1`}
                title={`${trailerMovie?.title ?? "Movie"} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
