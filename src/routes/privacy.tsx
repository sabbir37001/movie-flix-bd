import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LegalPage } from "@/components/legal-page";
import { settingsQuery } from "@/lib/jannat";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — JANNAT FLIX" },
    { name: "description", content: "Learn how JANNAT FLIX handles account, usage, and request information." },
    { property: "og:title", content: "Privacy Policy — JANNAT FLIX" },
    { property: "og:description", content: "Privacy information for visitors and account holders using JANNAT FLIX." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const settings = useQuery(settingsQuery);
  return <LegalPage title="Privacy Policy" intro="This policy explains the basic information JANNAT FLIX may process when you use the website." settings={settings.data ?? null} sections={[
    { title: "Information you provide", paragraphs: ["We may process account details, public profile information, comments, watchlist choices, and movie requests that you submit."] },
    { title: "How information is used", paragraphs: ["Information is used to operate accounts, personalize saved content, display community reviews, respond to movie requests, protect the service, and improve the website."] },
    { title: "Third-party services", paragraphs: ["Embedded players, downloads, advertisements, and external links may be governed by their providers’ privacy practices. Review those policies before sharing information with them."] },
    { title: "Your choices", paragraphs: ["You may remove your own watchlist items and reviews through available controls. Contact the site operator for other privacy questions or requests."] },
  ]} />;
}