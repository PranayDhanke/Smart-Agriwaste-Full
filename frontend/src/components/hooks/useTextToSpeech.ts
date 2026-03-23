"use client";

export function useTextToSpeech() {

  const speak = (
    text: string,
    lang: "en" | "hi" | "mr" = "en"
  ) => {

    if (!window.speechSynthesis) {
      alert("Speech not supported");
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(text);

    const voices =
      window.speechSynthesis.getVoices();

    // Language mapping
    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      mr: "mr-IN",
    };

    const targetLang =
      langMap[lang] || "en-IN";

    // ⭐ Smart Voice Selection
    let selectedVoice =
      voices.find((voice) =>
        voice.lang.includes(targetLang)
      );

    // ⭐ Fallback Logic
    if (!selectedVoice && lang === "mr") {
      selectedVoice =
        voices.find(v => v.lang.includes("hi")) ||
        voices.find(v => v.lang.includes("en"));
    }

    if (!selectedVoice && lang === "hi") {
      selectedVoice =
        voices.find(v => v.lang.includes("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = targetLang;

    // Stop previous speech
    window.speechSynthesis.cancel();

    // Speak
    window.speechSynthesis.speak(utterance);

  };

  return { speak };
}