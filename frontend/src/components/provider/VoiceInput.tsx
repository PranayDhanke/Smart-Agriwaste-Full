"use client";

import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { Button } from "../ui/button";

export default function VoiceInput({
  onText,
}: {
  onText: (text: string) => void;
}) {
  const { startListening, listening } = useVoiceInput(onText);

  return (
    <Button
      size="icon"
      variant={listening ? "destructive" : "outline"}
      onClick={startListening}
    >
      {listening ? <MicOff /> : <Mic />}
    </Button>
  );
}
