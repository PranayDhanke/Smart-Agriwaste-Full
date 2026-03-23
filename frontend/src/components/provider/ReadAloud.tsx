"use client";

import { Volume2 } from "lucide-react";
import { Button } from "../ui/button";
import { useLocale } from "next-intl";
import { useTextToSpeech } from "../hooks/useTextToSpeech";

export default function ReadAloud({
  text,
}: {
  text: string;
}) {
  const { speak } = useTextToSpeech();
  const locale = useLocale();

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={() =>
        speak(text, locale as "en" | "hi" | "mr")
      }
    >
      <Volume2 className="w-4 h-4" />
    </Button>
  );
}