import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LegalPage } from "@/components/legal-page";
import { settingsQuery } from "@/lib/jannat";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — JANNAT FLIX" },
    { name: "description", content: "Terms governing use of the JANNAT FLIX website and services." },
    { property: "og:title", content: "Terms of Service — JANNAT FLIX" },
    { property: "og:description", content: "Review the terms for accessing and using JANNAT FLIX." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: TermsPage,
});

function TermsPage() {
  const settings = useQuery(settingsQuery);
  return <LegalPage title="Terms of Service" intro="These terms describe the rules that apply when you access or use JANNAT FLIX." settings={settings.data ?? null} sections={[
    { title: "Acceptable use", paragraphs: ["Use the website lawfully and do not attempt to disrupt, misuse, reverse engineer, or gain unauthorized access to any part of the service."] },
    { title: "Third-party content", paragraphs: ["Some videos, downloads, advertisements, or links may be provided by third parties. Their availability, accuracy, safety, and terms remain the responsibility of those providers."] },
    { title: "Availability and changes", paragraphs: ["Features and content may change or become unavailable without notice. The service is provided as available, without guarantees of uninterrupted access."] },
    { title: "Account responsibility", paragraphs: ["You are responsible for maintaining the confidentiality of your account credentials and for activity performed through your account."] },
  ]} />;
}