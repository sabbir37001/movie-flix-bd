import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_PAGES } from "@/lib/jannat";

const SITE = "https://jannat-flix-stream.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabase.from("movies").select("id, updated_at");
        const urls = [
          `<url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          `<url><loc>${SITE}/dmca</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
          `<url><loc>${SITE}/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
          `<url><loc>${SITE}/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
          ...CATEGORY_PAGES.map(
            (category) =>
              `<url><loc>${SITE}/category/${category.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          ),
          ...(data ?? []).map(
            (m) =>
              `<url><loc>${SITE}/movie/${m.id}</loc><lastmod>${new Date(
                m.updated_at ?? Date.now(),
              ).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
          ),
        ].join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
