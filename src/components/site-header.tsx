import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Clapperboard, LogIn, LogOut, Search, ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORIES } from "@/lib/jannat";
import { currentUserQuery, profileQuery } from "@/lib/engagement";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  category?: string;
  onCategoryChange?: (value: string) => void;
}

export function SiteHeader({
  search = "",
  onSearchChange,
  category = "All",
  onCategoryChange,
}: SiteHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const user = useQuery(currentUserQuery);
  const profile = useQuery(profileQuery(user.data?.id));
  const displayName = profile.data?.display_name || "My Account";

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="crimson-gradient glow-shadow flex size-9 items-center justify-center rounded-md">
            <Clapperboard className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl leading-none tracking-wide sm:text-3xl">
            JANNAT <span className="text-primary">FLIX</span>
          </span>
        </Link>

        <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
          <div className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              readOnly={!onSearchChange}
              placeholder="Search movies, genres, years..."
              aria-label="Search movies"
              className="h-10 rounded-full border-border bg-surface pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="order-2 ml-auto sm:order-3">
          {user.isLoading ? (
            <span className="block size-9 animate-pulse rounded-full bg-surface" />
          ) : user.data ? (
            <div ref={accountMenuRef} className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="max-w-40 rounded-full px-2 sm:px-3"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                  <Avatar className="size-6">
                    <AvatarImage src={profile.data?.avatar_url || undefined} alt={`${displayName} avatar`} />
                    <AvatarFallback className="text-xs text-primary">{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden truncate sm:inline">{displayName}</span>
              </Button>
              {accountOpen && (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
                >
                  <p className="truncate px-3 py-2 text-sm font-semibold">{displayName}</p>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    to="/watchlist"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                  >
                    <Bookmark className="size-4" />My Watchlist
                  </Link>
                  <Link
                    to="/admin"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                  >
                    <ShieldCheck className="size-4" />Admin
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <Button
                    type="button"
                    role="menuitem"
                    variant="ghost"
                    onClick={() => signOut()}
                    className="h-auto w-full justify-start rounded-md px-3 py-2 font-normal"
                  >
                    <LogOut className="size-4" />Sign Out
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to="/auth" search={{ redirect: "/" }}>
                <LogIn />
                <span className="hidden sm:inline">Sign In / Sign Up</span>
                <User className="sm:hidden" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <nav aria-label="Movie categories" className="mx-auto w-full max-w-7xl px-4 pb-3">
        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {CATEGORIES.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => onCategoryChange?.(item)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
                  category === item
                    ? "crimson-gradient text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
