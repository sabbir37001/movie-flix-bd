import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Clapperboard, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Sign In or Sign Up — JANNAT FLIX" },
      { name: "description", content: "Sign in to save movies and join discussions on JANNAT FLIX." },
      { property: "og:title", content: "Sign In or Sign Up — JANNAT FLIX" },
      { property: "og:description", content: "Create your JANNAT FLIX account to build a watchlist and review movies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            display_name: data.user.user_metadata["display_name"] || email.split("@")[0] || "Movie Fan",
            avatar_url: data.user.user_metadata["avatar_url"] || "",
          },
          { onConflict: "id", ignoreDuplicates: true },
        );
        if (profileError) throw profileError;
        if (search.redirect?.startsWith("/movie/")) {
          const id = search.redirect.slice("/movie/".length);
          navigate({ to: "/movie/$id", params: { id } });
        } else if (search.redirect === "/watchlist") {
          navigate({ to: "/watchlist" });
        } else {
          navigate({ to: "/" });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: displayName.trim(), avatar_url: avatarUrl.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/" });
        } else {
          toast.success("Check your email to confirm your account.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card-shadow w-full max-w-sm rounded-2xl bg-card p-7">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <span className="crimson-gradient flex size-9 items-center justify-center rounded-md">
            <Clapperboard className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl">
            JANNAT <span className="text-primary">FLIX</span>
          </span>
        </Link>
        <h1 className="font-display text-3xl">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Save your favorites and join the conversation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={60}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar-url">Avatar image URL <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Button>
        <div className="mt-4 border-t border-border pt-4 text-center">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
            <ShieldCheck className="size-3.5" /> Admin access
          </Link>
        </div>
      </div>
    </main>
  );
}
