import { Megaphone } from "lucide-react";

export function ScrollingNotice({ notice }: { notice?: string | null | undefined }) {
  const text = notice?.trim();

  if (!text) return null;

  return (
    <aside
      aria-label="Site announcement"
      className="relative flex min-h-14 items-center overflow-hidden border-y border-border/50 bg-card/80 shadow-lg backdrop-blur-sm"
    >
      <div className="relative z-10 flex min-h-14 shrink-0 items-center border-r border-border/50 bg-card/95 px-4 shadow-lg sm:px-6">
        <Megaphone className="size-5 text-primary" aria-hidden="true" />
        <span className="sr-only">Announcement:</span>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="notice-marquee-track w-max">
          <p className="notice-marquee-copy py-3.5 pl-8 pr-16 font-bengali text-lg font-semibold leading-relaxed tracking-normal text-foreground sm:text-xl">
            {text}
          </p>
          <p
            aria-hidden="true"
            className="notice-marquee-copy py-3.5 pl-8 pr-16 font-bengali text-lg font-semibold leading-relaxed tracking-normal text-foreground sm:text-xl"
          >
            {text}
          </p>
        </div>
      </div>
    </aside>
  );
}