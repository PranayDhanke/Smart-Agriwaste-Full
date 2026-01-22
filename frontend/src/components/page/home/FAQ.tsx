"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FAQ() {
  const t = useTranslations("faq");

  const faqData = t.raw("items");

  return (
    <div className="bg-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600">{t("subtitle")}</p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map(
            (item: { question: string; answer: string }, index: string) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-white shadow-sm hover:shadow-md transition"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-green-600 py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-green-50 rounded-2xl p-8 border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {t("cta.title")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("cta.description")}
          </p>
          <Link href="/community">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
