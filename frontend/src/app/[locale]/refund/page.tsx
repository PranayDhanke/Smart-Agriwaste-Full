import LegalPage from "@/components/page/legal/LegalPage";

const sections = [
  {
    heading: "General Refund Principles",
    body: [
      "Refund eligibility depends on the nature of the order, payment collected, and whether the issue relates to cancellation, non-delivery, duplicate payment, or a confirmed platform error.",
      "Refunds are reviewed case by case to ensure fair handling for both farmers and buyers.",
    ],
  },
  {
    heading: "When Refunds May Be Approved",
    body: [
      "A refund may be considered when a payment was charged incorrectly, the same order was paid more than once, the order cannot be fulfilled, or a dispute is resolved in favor of the requesting party after review.",
      "Supporting details such as order ID, payment proof, cancellation reason, and communication records may be required before a decision is made.",
    ],
  },
  {
    heading: "Non-Refundable Situations",
    body: [
      "Refunds may be denied when incorrect information was provided by the user, when a service has already been completed, or when the request falls outside the approved review period.",
      "Disagreements between users that do not involve a payment processing issue may require direct resolution unless platform intervention is necessary.",
    ],
  },
  {
    heading: "Processing Timelines",
    body: [
      "Approved refunds are typically initiated through the original payment method. Processing time can vary depending on the payment provider or bank.",
      "If you believe you are eligible for a refund, contact platform support with the relevant transaction details so the request can be reviewed promptly.",
    ],
  },
];

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="This Refund Policy explains how Smart Agriwaste reviews and processes refund requests related to orders and payments on the platform."
      lastUpdated="March 21, 2026"
      sections={sections}
    />
  );
}
