import { useState } from "react";
import { Film, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const requestSchema = z.object({
  movieName: z.string().trim().min(1, "Enter a movie or series name.").max(200),
  requestedBy: z.string().trim().max(120).optional(),
});

export function MovieRequestDialog({
  variant = "outline",
  className,
}: {
  variant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [movieName, setMovieName] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = requestSchema.safeParse({ movieName, requestedBy });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your request and try again.");
      return;
    }

    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase.from("movie_requests").insert({
      movie_name: result.data.movieName,
      requested_by: result.data.requestedBy || null,
      status: "pending",
    });
    setSubmitting(false);

    if (insertError) {
      setError("Your request could not be submitted. Please try again.");
      return;
    }

    setMovieName("");
    setRequestedBy("");
    setOpen(false);
    toast.success("Movie request submitted");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={cn("rounded-full", className)}>
          <Film className="size-4" />
          Request a Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Request a Movie</DialogTitle>
          <DialogDescription>
            Tell us what you would like to watch next. Series requests are welcome too.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="request-movie-name">Movie or series name</Label>
            <Input
              id="request-movie-name"
              value={movieName}
              onChange={(event) => setMovieName(event.target.value)}
              placeholder="Example: The Batman"
              maxLength={200}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-name">Your name (optional)</Label>
            <Input
              id="request-name"
              value={requestedBy}
              onChange={(event) => setRequestedBy(event.target.value)}
              placeholder="How should we credit your request?"
              maxLength={120}
            />
          </div>
          {error ? <p role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              <Send className="size-4" />
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}