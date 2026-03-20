type Lang = "en" | "hi" | "mr";

const SUPPORTED_LANGS: Lang[] = ["en", "hi", "mr"];

export const toLocalizedText = (text: string): Record<Lang, string> => {
  const safeText = text?.trim() || "";

  return {
    en: safeText,
    hi: safeText,
    mr: safeText,
  };
};

export const toLocalizedFields = (
  fields: Record<string, string>
): Record<string, Record<Lang, string>> =>
  Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      SUPPORTED_LANGS.reduce<Record<Lang, string>>(
        (acc, lang) => {
          acc[lang] = value?.trim() || "";
          return acc;
        },
        { en: "", hi: "", mr: "" }
      ),
    ])
  );
