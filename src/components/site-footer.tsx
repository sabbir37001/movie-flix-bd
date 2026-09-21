import { Link } from "@tanstack/react-router";
import { Globe, MessageCircle, User } from "lucide-react";
import type { Settings } from "@/lib/jannat";
import { MovieRequestDialog } from "@/components/movie-request-dialog";

export function SiteFooter({ settings }: { settings: Settings | null }) {
  const whatsapp = (settings?.dev_whatsapp ?? "").replace(/[^\d+]/g, "");

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <h2 className="font-display text-2xl">
            JANNAT <span className="text-primary">FLIX</span>
          </h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Stream trailers and grab fast downloads for the latest movies, plus round-the-clock
            live channels.
          </p>
          <MovieRequestDialog variant="default" className="mt-2" />
        </div>

        <nav aria-label="Footer links" className="space-y-3">
          <h3 className="text-sm font-bold tracking-widest uppercase">Useful links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition-colors hover:text-primary">
                Admin panel
              </Link>
            </li>
            <li>
              <Link to="/dmca" className="transition-colors hover:text-primary">DMCA Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-primary">Terms of Service</Link>
            </li>
            <li>
              <Link to="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link>
            </li>
          </ul>
        </nav>

        <section aria-labelledby="developer-info" className="space-y-3 md:text-right">
          <h3 id="developer-info" className="text-sm font-bold tracking-widest uppercase">
            Developer info
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2 md:justify-end">
              <User className="size-4 text-primary" />
              {settings?.dev_name || "—"}
            </li>
            <li className="flex items-center gap-2 md:justify-end">
              <MessageCircle className="size-4 text-primary" />
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {settings?.dev_whatsapp}
                </a>
              ) : (
                "—"
              )}
            </li>
            <li className="flex items-center gap-2 md:justify-end">
              <Globe className="size-4 text-primary" />
              {settings?.dev_website ? (
                <a
                  href={settings.dev_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  Portfolio
                </a>
              ) : (
                "—"
              )}
            </li>
          </ul>
        </section>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} JANNAT FLIX. All rights reserved.
      </div>
    </footer>
  );
}
