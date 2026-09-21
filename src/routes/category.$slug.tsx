import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Film } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_PAGES,
  categoryPageFor,
  moviesQuery,
  SECTIONED_CATEGORIES,
  settingsQuery,
} from "@/lib/jannat";

const SITE = "https://jannat-flix-stream.lovable.app";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const page = CATEGORY_PAGES.find((item) => item.slug === params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const label = loaderData?.label ?? "Movie Category";
    const title = `${label} — Watch & Download on JANNAT FLIX`;
    const description = `Browse all ${label} titles on JANNAT FLIX. Watch trailers, stream movies and find direct downloads.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: loaderData
        ? [{ rel: "canonical", href: `${SITE}/category/${loaderData.slug}` }]
        : [],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const page = Route.useLoaderData();
  const navigate = useNavigate({ from: "/category/$slug" });
  const [search, setSearch] = useState("");
  const movies = useQuery(moviesQuery);
  const settings = useQuery(settingsQuery);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (movies.data ?? []).filter((movie) => {
      const matchesPage = page.category
        ? movie.category === page.category
        : page.excludeSectioned
          ? !SECTIONED_CATEGORIES.includes(movie.category as (typeof SECTIONED_CATEGORIES)[number])
          : true;
      const matchesSearch =
        !term ||
        movie.title.toLowerCase().includes(term) ||
        movie.category.toLowerCase().includes(term) ||
        String(movie.release_year).includes(term);
      return matchesPage && matchesSearch;
    });
  }, [movies.data, page, search]);

  const headerCategory = page.category ?? "All";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        search={search}
        onSearchChange={setSearch}
        category={headerCategory}
        onCategoryChange={(nextCategory) => {
          const destination = categoryPageFor(nextCategory);
          navigate({ to: "/category/$slug", params: { slug: destination.slug } });
        }}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
          <Link to="/">
            <ArrowLeft />
            Home
          </Link>
        </Button>

        <header className="mb-7 flex flex-wrap items-end gap-3 border-b border-border/60 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="crimson-gradient flex size-10 shrink-0 items-center justify-center rounded-md">
              <Film className="size-5 text-primary-foreground" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-none sm:text-5xl">{page.label}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Complete collection</p>
            </div>
          </div>
          <span className="ml-auto text-sm font-semibold text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "title" : "titles"}
          </span>
        </header>

        {movies.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="aspect-2/3 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-border/50 bg-card p-10 text-center text-sm text-muted-foreground">
            No titles match your search.
          </p>
        ) : (
          <section aria-label={`${page.label} titles`} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </section>
        )}
      </main>

      <SiteFooter settings={settings.data ?? null} />
    </div>
  );
}