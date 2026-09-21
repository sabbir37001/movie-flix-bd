import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { currentUserQuery, watchlistIdsQuery } from "@/lib/engagement";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
  movieId: string;
  compact?: boolean;
  className?: string;
};

export function WatchlistButton({ movieId, compact = false, className }: WatchlistButtonProps) {
  const queryClient = useQueryClient();
  const user = useQuery(currentUserQuery);
  const userId = user.data?.id;
  const watchlist = useQuery(watchlistIdsQuery(userId));
  const saved = watchlist.data?.includes(movieId) ?? false;

  const toggle = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in to save movies.");
      if (saved) {
        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", userId)
          .eq("movie_id", movieId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("watchlist").insert({ user_id: userId, movie_id: movieId });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlist-ids", userId] });
      await queryClient.invalidateQueries({ queryKey: ["watchlist-movies", userId] });
      toast.success(saved ? "Removed from your watchlist" : "Added to your watchlist");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update watchlist"),
  });

  if (!userId) {
    return (
      <Button
        asChild
        variant={compact ? "secondary" : "outline"}
        size={compact ? "icon" : "lg"}
        className={cn(compact && "rounded-full bg-background/80 backdrop-blur", className)}
      >
        <Link to="/auth" search={{ redirect: `/movie/${movieId}` }} aria-label="Sign in to add to watchlist">
          <Bookmark />
          {!compact && "Add to Watchlist"}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : compact ? "secondary" : "outline"}
      size={compact ? "icon" : "lg"}
      className={cn(compact && "rounded-full backdrop-blur", className)}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={saved}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate()}
    >
      <Bookmark className={cn(saved && "fill-current")} />
      {!compact && (saved ? "In Watchlist" : "Add to Watchlist")}
    </Button>
  );
}