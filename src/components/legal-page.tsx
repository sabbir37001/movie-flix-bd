import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Settings } from "@/lib/jannat";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export function LegalPage({
  title,
  intro,
  sections,
  settings,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
  settings: Settings | null;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16">
        <header className="border-b border-border pb-8">
          <p className="text-sm font-bold uppercase text-primary">JANNAT FLIX Legal</p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{intro}</p>
          <p className="mt-4 text-xs text-muted-foreground">Last updated: September 21, 2026</p>
        </header>
        <article className="divide-y divide-border">
          {sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}