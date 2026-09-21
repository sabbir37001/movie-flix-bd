import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Movie = Database["public"]["Tables"]["movies"]["Row"];
export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type Episode = Database["public"]["Tables"]["episodes"]["Row"];

/** Episodes for one series post, ordered by season then episode number. */
export const episodesQuery = (movieId: string) => ({
  queryKey: ["episodes", movieId],
  queryFn: async (): Promise<Episode[]> => {
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("movie_id", movieId)
      .order("season_num", { ascending: true })
      .order("episode_num", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

/** Groups episodes into [seasonNumber, episodes] pairs, seasons ascending. */
export function groupBySeason(episodes: Episode[]): [number, Episode[]][] {
  const map = new Map<number, Episode[]>();
  for (const ep of episodes) {
    const list = map.get(ep.season_num) ?? [];
    list.push(ep);
    map.set(ep.season_num, list);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

/** Pads an episode label like "S01 E05". */
export function episodeCode(season: number, episode: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `S${pad(season)} E${pad(episode)}`;
}

export const CATEGORIES = [
  "All",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Horror",
  "Comedy",
  "Romance",
  "Thriller",
  "Animation",
  "Drama",
  "HINDI DUBBED MOVIE",
  "Hindi Dubbed Series",
] as const;

export const SECTIONED_CATEGORIES = ["HINDI DUBBED MOVIE", "Hindi Dubbed Series"] as const;

export type CategoryPageConfig = {
  slug: string;
  label: string;
  category?: string;
  excludeSectioned?: boolean;
};

export const CATEGORY_PAGES: CategoryPageConfig[] = [
  { slug: "latest", label: "Latest Movies", excludeSectioned: true },
  { slug: "all", label: "All Movies" },
  ...CATEGORIES.filter((category) => category !== "All").map((category) => ({
    slug: category
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    label: category,
    category,
  })),
];

export function categoryPageFor(category: string): CategoryPageConfig {
  if (category === "All") return { slug: "latest", label: "Latest Movies", excludeSectioned: true };
  return (
    CATEGORY_PAGES.find((page) => page.category === category) ?? {
      slug: "all",
      label: "All Movies",
    }
  );
}

/** Compact badge text like "S1 : E5", or "" when neither value is set. */
export function seasonEpisodeBadge(season?: string | null, episode?: string | null): string {
  const s = (season ?? "").trim();
  const e = (episode ?? "").trim();
  const short = (value: string, prefix: string) => {
    const num = value.match(/\d+/)?.[0];
    return num ? `${prefix}${num}` : value;
  };
  const parts = [s ? short(s, "S") : "", e ? short(e, "E") : ""].filter(Boolean);
  return parts.join(" : ");
}

/** Full label like "Season 1 - Episode 5", or "" when neither value is set. */
export function seasonEpisodeLabel(season?: string | null, episode?: string | null): string {
  const parts = [(season ?? "").trim(), (episode ?? "").trim()].filter(Boolean);
  return parts.join(" - ");
}

export const moviesQuery = {
  queryKey: ["movies"],
  queryFn: async (): Promise<Movie[]> => {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const adsQuery = {
  queryKey: ["ads"],
  queryFn: async (): Promise<Ad[]> => {
    const { data, error } = await supabase.from("ads").select("*");
    if (error) throw error;
    return data ?? [];
  },
};

export const settingsQuery = {
  queryKey: ["settings"],
  queryFn: async (): Promise<Settings | null> => {
    const { data, error } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },
};

/** Turns a full YouTube URL or a bare video id into an embeddable URL. */
export function youtubeEmbed(idOrUrl: string): string {
  const value = (idOrUrl ?? "").trim();
  if (!value) return "";
  if (value.startsWith("http")) {
    if (value.includes("/embed/") || value.includes("live_stream")) return value;
    try {
      const url = new URL(value);
      const id = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : value;
    } catch {
      return value;
    }
  }
  return `https://www.youtube.com/embed/${value}`;
}

/** Extracts the file id from a Google Drive share link, or "" if it isn't one. */
function gdriveFileId(link: string): string {
  const match = link.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  return match?.[1] ?? "";
}

/** Converts a Google Drive share link into a direct download URL; non-Drive links pass through unchanged. */
export function getDirectDownloadLink(url: string): string {
  const value = (url ?? "").trim();
  if (!value) return "";
  const fileId = gdriveFileId(value);
  if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}`;
  return value;
}

/** Converts a Google Drive share link into an embeddable preview URL. */
export function gdrivePreview(link: string): string {
  const value = (link ?? "").trim();
  if (!value) return "";
  if (value.includes("/preview")) return value;
  const match = value.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return "";
}
