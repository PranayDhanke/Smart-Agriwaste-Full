import axios from "axios";

type Lang = "en" | "hi" | "mr";

const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT!;
const key = process.env.AZURE_TRANSLATOR_KEY!;
const region = process.env.AZURE_TRANSLATOR_REGION!;

type langType = {
  text: string;
  to: Lang;
};

export async function translateText(
  text: string,
  targets: Lang[]
): Promise<Record<Lang, string>> {
  const translations: Record<Lang, string> = {
    en: "",
    hi: "",
    mr: "",
  };

  if (!text || !text.trim()) return translations;

  const targetArray: Lang[] = Array.isArray(targets) ? targets : [targets];

  const response = await axios.post(`${endpoint}/translate`, [{ text }], {
    params: {
      "api-version": "3.0",
      to: targetArray.join(","),
    },
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": region,
      "Content-Type": "application/json",
    },
  });

  const detectedLang: Lang = response.data[0].detectedLanguage?.language;

  response.data[0].translations.forEach((t: langType) => {
    translations[t.to] = t.text;
  });

  if (detectedLang && translations[detectedLang] === "") {
    translations[detectedLang] = text;
  }

  return translations;
}
