import LegalPage from "@/components/page/legal/LegalPage";

const sections = [
  {
    heading: "Information We Collect",
    body: [
      "We may collect the details you provide while using Smart Agriwaste, including your name, contact information, account details, location, and information related to waste listings, orders, or negotiations.",
      "We may also collect technical information such as device type, browser details, log data, and usage activity to keep the platform secure and improve performance.",
    ],
  },
  {
    heading: "How We Use Information",
    body: [
      "We use your information to create and manage accounts, connect farmers and buyers, process activity on the platform, provide support, and communicate important service updates.",
      "Information may also be used for analytics, fraud prevention, legal compliance, and improving product features that help agricultural waste management workflows.",
    ],
  },
  {
    heading: "Sharing of Information",
    body: [
      "We may share limited information with service providers, technical partners, or other users when it is necessary to operate core features such as authentication, communication, delivery coordination, or payments.",
      "We do not sell your personal information. We may disclose data when required by law, to protect users, or to enforce our platform policies.",
    ],
  },
  {
    heading: "Your Choices and Data Security",
    body: [
      "You can review or update certain profile details from your account. If you want us to delete your account data or have a privacy concern, please contact the platform support team.",
      "We use reasonable safeguards to protect stored data, but no online system can guarantee absolute security. You should also keep your login credentials secure.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This Privacy Policy explains how Smart Agriwaste collects, uses, and protects information when you use the platform."
      lastUpdated="March 21, 2026"
      sections={sections}
    />
  );
}
