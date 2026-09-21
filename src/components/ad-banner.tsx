import { useEffect, useRef } from "react";
import type { Ad } from "@/lib/jannat";

/**
 * Renders an ad slot.
 * - A custom banner image (with optional target link) takes priority.
 * - Otherwise any ad-network snippet (AdSense etc.) stored in `ad_code` is injected.
 * - Renders nothing at all when the slot is inactive or empty, so the layout never breaks.
 */
export function AdBanner({ ad, label }: { ad: Ad | undefined; label: string }) {
  const codeRef = useRef<HTMLDivElement>(null);
  const image = ad?.image_url?.trim() ?? "";
  const code = (ad as (Ad & { ad_code?: string }) | undefined)?.ad_code?.trim() ?? "";
  const shouldRenderCode = !!ad?.is_active && !image && !!code;

  useEffect(() => {
    const host = codeRef.current;
    if (!host || !shouldRenderCode) return;

    host.innerHTML = code;
    // Scripts injected via innerHTML don't execute; re-create them so networks load.
    const scripts = Array.from(host.querySelectorAll("script"));
    for (const old of scripts) {
      const script = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      script.text = old.text;
      old.replaceWith(script);
    }

    return () => {
      host.innerHTML = "";
    };
  }, [code, shouldRenderCode]);

  if (!ad || !ad.is_active) return null;
  if (!image && !code) return null;

  const shell =
    "block overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-[var(--shadow-card)]";

  return (
    <aside aria-label={label} className="mx-auto w-full max-w-7xl px-4">
      {image ? (
        <a
          href={ad.target_link || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={shell}
        >
          <img
            src={image}
            alt={`${label} banner — sponsored offer on JANNAT FLIX`}
            loading="lazy"
            className="h-24 w-full object-cover sm:h-32 md:h-40"
          />
        </a>
      ) : (
        <div className={`${shell} p-2`}>
          <div ref={codeRef} className="flex min-h-16 w-full items-center justify-center" />
        </div>
      )}
    </aside>
  );
}
