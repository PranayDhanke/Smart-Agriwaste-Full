import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Agriwaste",
  description:
    "A platform for sustainable agriculture waste management and community collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}
