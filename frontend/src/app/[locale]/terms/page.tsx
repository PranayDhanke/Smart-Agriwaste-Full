import LegalPage from "@/components/page/legal/LegalPage";

const sections = [
  {
    heading: "Acceptance of Terms",
    body: [
      "By accessing or using Smart Agriwaste, you agree to follow these Terms of Service and any applicable laws or platform guidelines.",
      "If you do not agree with these terms, you should not use the platform.",
    ],
  },
  {
    heading: "Use of the Platform",
    body: [
      "You agree to provide accurate account information and to use the platform only for lawful activities related to agricultural waste management, marketplace participation, and community engagement.",
      "You must not misuse the service, interfere with its operation, attempt unauthorized access, or submit false, harmful, or misleading content.",
    ],
  },
  {
    heading: "Listings, Orders, and User Responsibilities",
    body: [
      "Users are responsible for the accuracy of listings, pricing, availability, negotiations, and communication with other users. Smart Agriwaste may facilitate discovery and coordination, but it does not guarantee every transaction.",
      "Each user is responsible for complying with local laws, safety requirements, transportation obligations, and quality standards connected to their activities on the platform.",
    ],
  },
  {
    heading: "Suspension and Limitation of Liability",
    body: [
      "We may suspend or terminate accounts that violate these terms, create risk for other users, or harm the platform.",
      "To the fullest extent permitted by law, Smart Agriwaste is not liable for indirect losses, user disputes, or damages arising from third-party actions, failed transactions, or temporary service interruptions.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These Terms of Service describe the rules, responsibilities, and conditions for using Smart Agriwaste."
      lastUpdated="March 21, 2026"
      sections={sections}
    />
  );
}
