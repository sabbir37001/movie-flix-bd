import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];

export const currentUserQuery = {
  queryKey: ["current-user"],
  queryFn: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },
  staleTime: 60_000,
};

export const profileQuery = (userId?: string) => ({
  queryKey: ["profile", userId],
  enabled: Boolean(userId),
  queryFn: async (): Promise<Profile | null> => {
    if (!userId) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const watchlistIdsQuery = (userId?: string) => ({
  queryKey: ["watchlist-ids", userId],
  enabled: Boolean(userId),
  queryFn: async (): Promise<string[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("watchlist")
      .select("movie_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item) => item.movie_id);
  },
});

export type CommentWithProfile = Comment & { profile: Profile | null };

export const commentsQuery = (movieId: string) => ({
  queryKey: ["comments", movieId],
  queryFn: async (): Promise<CommentWithProfile[]> => {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const userIds = [...new Set((comments ?? []).map((comment) => comment.user_id))];
    if (userIds.length === 0) return [];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);
    if (profilesError) throw profilesError;
    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    return (comments ?? []).map((comment) => ({
      ...comment,
      profile: profileMap.get(comment.user_id) ?? null,
    }));
  },
});