import LegalPage from "@/components/page/legal/LegalPage";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const { locale: requestedLocale } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const messagesByLocale = {
    en: (await import("@/messages/legal/en.json")).default,
    hi: (await import("@/messages/legal/hi.json")).default,
    mr: (await import("@/messages/legal/mr.json")).default,
  };
  const messages = messagesByLocale[locale];

  const sections = [
    {
      heading: messages.terms.sections.acceptance.heading,
      body: [
        messages.terms.sections.acceptance.body1,
        messages.terms.sections.acceptance.body2,
      ],
    },
    {
      heading: messages.terms.sections.platformUse.heading,
      body: [
        messages.terms.sections.platformUse.body1,
        messages.terms.sections.platformUse.body2,
      ],
    },
    {
      heading: messages.terms.sections.responsibilities.heading,
      body: [
        messages.terms.sections.responsibilities.body1,
        messages.terms.sections.responsibilities.body2,
      ],
    },
    {
      heading: messages.terms.sections.liability.heading,
      body: [
        messages.terms.sections.liability.body1,
        messages.terms.sections.liability.body2,
      ],
    },
  ];

  return (
    <LegalPage
      legalLabel={messages.common.badge}
      lastUpdatedLabel={messages.common.lastUpdated}
      title={messages.terms.title}
      description={messages.terms.description}
      lastUpdated={messages.terms.lastUpdated}
      sections={sections}
    />
  );
}
