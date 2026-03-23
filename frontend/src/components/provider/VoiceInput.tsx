"use client";

import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { Button } from "../ui/button";
import { useLocale } from "next-intl";

export default function VoiceInput({
  onText,
}: {
  onText: (text: string) => void;
}) {
  const locale = useLocale();

  const { startListening, listening } = useVoiceInput(onText, locale);

  return (
    <Button
      type="button"
      size="icon"
      variant={listening ? "destructive" : "outline"}
      onClick={startListening}
    >
      {listening ? <MicOff /> : <Mic />}
    </Button>
  );
}
