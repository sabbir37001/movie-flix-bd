import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type MovieRequest = Tables<"movie_requests">;

export function AdminRequests() {
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ["admin", "movie-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movie_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MovieRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "completed" }) => {
      const { error } = await supabase.from("movie_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "movie-requests"] });
      toast.success("Request status updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const list = requests.data ?? [];
  const pendingCount = list.filter((request) => request.status === "pending").length;

  return (
    <section className="space-y-4" aria-labelledby="requests-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="requests-heading" className="font-display text-2xl">Movie Requests</h2>
          <p className="text-sm text-muted-foreground">{pendingCount} pending · {list.length} total</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {requests.isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading requests...</p>
        ) : requests.isError ? (
          <p className="p-8 text-center text-sm text-destructive">Requests could not be loaded.</p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No movie requests yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Movie or series</TableHead>
                <TableHead>Requested by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((request) => {
                const completed = request.status === "completed";
                return (
                  <TableRow key={request.id}>
                    <TableCell className="min-w-48 font-semibold">{request.movie_name}</TableCell>
                    <TableCell className="text-muted-foreground">{request.requested_by || "Anonymous"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(request.created_at))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={completed ? "secondary" : "default"} className="gap-1 capitalize">
                        {completed ? <Check className="size-3" /> : <Clock className="size-3" />}
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant={completed ? "outline" : "default"}
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({
                          id: request.id,
                          status: completed ? "pending" : "completed",
                        })}
                      >
                        {completed ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
                        {completed ? "Reopen" : "Complete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}