import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { episodeCode, episodesQuery, groupBySeason } from "@/lib/jannat";

type Draft = {
  season_num: number;
  episode_num: number;
  episode_title: string;
  video_url: string;
};

/** Admin editor: list, add and delete the episodes of one series post. */
export function EpisodeManager({ movieId }: { movieId: string }) {
  const queryClient = useQueryClient();
  const episodes = useQuery(episodesQuery(movieId));
  const [draft, setDraft] = useState<Draft>({
    season_num: 1,
    episode_num: 1,
    episode_title: "",
    video_url: "",
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["episodes", movieId] });

  const add = useMutation({
    mutationFn: async (value: Draft) => {
      const { error } = await supabase.from("episodes").insert({ movie_id: movieId, ...value });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Episode added");
      setDraft((d) => ({ ...d, episode_num: d.episode_num + 1, episode_title: "", video_url: "" }));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Episode removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = groupBySeason(episodes.data ?? []);

  return (
    <div className="space-y-5">
      {grouped.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No episodes yet. Add the first one below.
        </p>
      )}

      {grouped.map(([season, list]) => (
        <div key={season} className="space-y-2">
          <h4 className="font-display text-lg">Season {season}</h4>
          <ul className="space-y-2">
            {list.map((ep) => (
              <li
                key={ep.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
              >
                <span className="shrink-0 rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                  {episodeCode(ep.season_num, ep.episode_num)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {ep.episode_title || `Episode ${ep.episode_num}`}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ep.video_url || "No video link"}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="ml-auto shrink-0"
                  onClick={() => remove.mutate(ep.id)}
                  disabled={remove.isPending}
                  aria-label={`Delete ${episodeCode(ep.season_num, ep.episode_num)}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Season number</Label>
          <Input
            type="number"
            min={1}
            value={draft.season_num}
            onChange={(e) => setDraft({ ...draft, season_num: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Episode number</Label>
          <Input
            type="number"
            min={1}
            value={draft.episode_num}
            onChange={(e) => setDraft({ ...draft, episode_num: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Episode title (optional)</Label>
          <Input
            value={draft.episode_title}
            onChange={(e) => setDraft({ ...draft, episode_title: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Video link (Google Drive or streaming URL)</Label>
          <Input
            value={draft.video_url}
            onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={() => add.mutate(draft)} disabled={add.isPending}>
            <Plus className="size-4" />
            {add.isPending ? "Adding..." : "Add episode"}
          </Button>
        </div>
      </div>
    </div>
  );
}
