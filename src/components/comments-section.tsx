import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { commentsQuery, currentUserQuery } from "@/lib/engagement";
import { supabase } from "@/integrations/supabase/client";

export function CommentsSection({ movieId, movieTitle }: { movieId: string; movieTitle: string }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const user = useQuery(currentUserQuery);
  const comments = useQuery(commentsQuery(movieId));
  const isAdmin = useQuery({
    queryKey: ["is-admin", user.data?.id],
    enabled: Boolean(user.data?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.data!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return Boolean(data);
    },
  });

  const post = useMutation({
    mutationFn: async () => {
      const userId = user.data?.id;
      const text = content.trim();
      if (!userId) throw new Error("Sign in to post a review.");
      if (!text) throw new Error("Write your review first.");
      const { error } = await supabase.from("comments").insert({ user_id: userId, movie_id: movieId, content: text });
      if (error) throw error;
    },
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["comments", movieId] });
      toast.success("Your review is live");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not post review"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", movieId] }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete review"),
  });

  return (
    <section aria-labelledby="reviews-heading" className="mt-12 border-t border-border/60 pt-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="crimson-gradient flex size-10 items-center justify-center rounded-md">
          <MessageCircle className="size-5 text-primary-foreground" />
        </span>
        <div>
          <h2 id="reviews-heading" className="font-display text-3xl">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {comments.data?.length ?? 0} {(comments.data?.length ?? 0) === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      {user.data ? (
        <form
          className="mb-8 rounded-xl border border-border/60 bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            post.mutate();
          }}
        >
          <label htmlFor="review-content" className="mb-2 block text-sm font-semibold text-foreground">
            Share your thoughts on {movieTitle}
          </label>
          <Textarea
            id="review-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a thoughtful review..."
            maxLength={1000}
            rows={4}
            required
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{content.length}/1000</span>
            <Button type="submit" disabled={post.isPending || !content.trim()}>
              <Send />
              Post Review
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-5">
          <p className="text-sm text-muted-foreground">Sign in to join the conversation.</p>
          <Button asChild>
            <Link to="/auth" search={{ redirect: `/movie/${movieId}` }}>Sign In / Sign Up</Link>
          </Button>
        </div>
      )}

      {comments.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      ) : comments.data?.length ? (
        <ul className="space-y-3">
          {comments.data.map((comment) => {
            const name = comment.profile?.display_name || "JANNAT FLIX member";
            return (
              <li key={comment.id} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 border border-border">
                    <AvatarImage src={comment.profile?.avatar_url || undefined} alt={`${name} avatar`} />
                    <AvatarFallback className="font-semibold text-primary">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{name}</span>
                      <time dateTime={comment.created_at} className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-body-foreground">{comment.content}</p>
                  </div>
                  {(user.data?.id === comment.user_id || isAdmin.data === true) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete review"
                      className="text-destructive hover:text-destructive"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(comment.id)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to share your thoughts.
        </p>
      )}
    </section>
  );
}