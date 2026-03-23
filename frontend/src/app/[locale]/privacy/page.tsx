import LegalPage from "@/components/page/legal/LegalPage";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
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
      heading: messages.privacy.sections.informationCollected.heading,
      body: [
        messages.privacy.sections.informationCollected.body1,
        messages.privacy.sections.informationCollected.body2,
      ],
    },
    {
      heading: messages.privacy.sections.howWeUseInformation.heading,
      body: [
        messages.privacy.sections.howWeUseInformation.body1,
        messages.privacy.sections.howWeUseInformation.body2,
      ],
    },
    {
      heading: messages.privacy.sections.sharing.heading,
      body: [
        messages.privacy.sections.sharing.body1,
        messages.privacy.sections.sharing.body2,
      ],
    },
    {
      heading: messages.privacy.sections.choicesAndSecurity.heading,
      body: [
        messages.privacy.sections.choicesAndSecurity.body1,
        messages.privacy.sections.choicesAndSecurity.body2,
      ],
    },
  ];

  return (
    <LegalPage
      legalLabel={messages.common.badge}
      lastUpdatedLabel={messages.common.lastUpdated}
      title={messages.privacy.title}
      description={messages.privacy.description}
      lastUpdated={messages.privacy.lastUpdated}
      sections={sections}
    />
  );
}
