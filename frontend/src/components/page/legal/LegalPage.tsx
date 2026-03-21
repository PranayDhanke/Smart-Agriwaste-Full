type LegalSection = {
  heading: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Legal
          </p>
          <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {title}
          </h1>
          <p className="mb-4 text-base leading-7 text-slate-600">
            {description}
          </p>
          <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                {section.heading}
              </h2>
              <div className="space-y-3 text-sm leading-7 text-slate-600 md:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
