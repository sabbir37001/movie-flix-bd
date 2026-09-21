import { Radio } from "lucide-react";
import { youtubeEmbed, type Settings } from "@/lib/jannat";

function Channel({ title, url }: { title: string; url: string }) {
  const embed = youtubeEmbed(url);
  return (
    <article className="card-shadow overflow-hidden rounded-xl bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex size-2 animate-pulse rounded-full bg-primary" />
        <h3 className="font-display text-xl">{title}</h3>
      </div>
      <div className="aspect-video w-full bg-muted">
        {embed ? (
          <iframe
            src={embed}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No live stream set
          </div>
        )}
      </div>
    </article>
  );
}

export function LiveTV({ settings }: { settings: Settings | null }) {
  return (
    <section aria-labelledby="live-tv-heading" className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-center gap-2">
        <Radio className="size-5 text-primary" />
        <h2 id="live-tv-heading" className="font-display text-3xl">
          Live TV
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Channel
          title={settings?.live_tv_1_title || "Live Sports"}
          url={settings?.live_tv_1_url || ""}
        />
        <Channel
          title={settings?.live_tv_2_title || "Live News"}
          url={settings?.live_tv_2_url || ""}
        />
      </div>
    </section>
  );
}
