import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Community() {
  const t = useTranslations("community");

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Intro Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-700">{t("intro.title")}</h1>
          <p className="mx-auto max-w-2xl text-gray-600">{t("intro.subtitle")}</p>
          <Link href={"/community/chats"}>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              {t("intro.joinButton")}
            </Button>
          </Link>
        </section>

        {/* Community Benefits */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-green-700 text-center">
            {t("benefits.heading")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("benefits.connect.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("benefits.connect.description")}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("benefits.share.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("benefits.share.description")}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{t("benefits.learn.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t("benefits.learn.description")}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
