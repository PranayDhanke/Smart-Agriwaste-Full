import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Recycle, Users, Globe } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("home");
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Hero / Intro */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-700">{t("about.title")}</h1>
          <p className="mx-auto max-w-2xl text-gray-600">{t("about.subtitle")}</p>
        </section>

        {/* Mission & Vision */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-700">{t("about.mission.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("about.mission.body")}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-700">{t("about.vision.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("about.vision.body")}</p>
            </CardContent>
          </Card>
        </section>

        {/* Core Features */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-bold text-green-700">
            {t("about.features.heading")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Recycle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("about.features.smart.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("about.features.smart.description")}</p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("about.features.market.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("about.features.market.description")}</p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("about.features.eco.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("about.features.eco.description")}</p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("about.features.sustain.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("about.features.sustain.description")}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-2xl bg-green-100 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-green-700 mb-3">{t("about.cta.title")}</h2>
          <p className="mx-auto max-w-2xl text-gray-700 mb-6">{t("about.cta.subtitle")}</p>
          <Link href="/marketplace">
            <button className="rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700">{t("about.cta.button")}</button>
          </Link>
        </section>
      </div>
    </main>
  )
}
