import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LegalPage } from "@/components/legal-page";
import { settingsQuery } from "@/lib/jannat";

export const Route = createFileRoute("/dmca")({
  head: () => ({ meta: [
    { title: "DMCA Policy — JANNAT FLIX" },
    { name: "description", content: "Read the JANNAT FLIX copyright and DMCA notice process." },
    { property: "og:title", content: "DMCA Policy — JANNAT FLIX" },
    { property: "og:description", content: "Copyright policy and takedown notice information for JANNAT FLIX." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DmcaPage,
});

function DmcaPage() {
  const settings = useQuery(settingsQuery);
  return <LegalPage title="DMCA Policy" intro="JANNAT FLIX respects intellectual property rights and responds to valid copyright notices." settings={settings.data ?? null} sections={[
    { title: "Copyright concerns", paragraphs: ["If you believe content referenced on this website infringes your copyright, submit a written notice identifying the protected work, the material at issue, and the exact page where it appears."] },
    { title: "Required information", paragraphs: ["Your notice should include your name, contact information, a good-faith statement, a statement that the information is accurate, and your physical or electronic signature."] },
    { title: "Review process", paragraphs: ["We may remove or restrict access to material while reviewing a valid notice. Incomplete or misleading notices may not be actionable. This template is general information and is not legal advice."] },
  ]} />;
}