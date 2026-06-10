import tesseract from "tesseract.js";

const { recognize } = tesseract;

const categories = [
  { key: "Food", words: ["restaurant", "cafe", "coffee", "meal", "food", "dining"] },
  { key: "Travel", words: ["taxi", "uber", "flight", "rail", "hotel", "travel"] },
  { key: "Office", words: ["office", "stationery", "supplies", "printer"] },
  { key: "Software", words: ["software", "subscription", "license", "saas"] },
];

const findAmount = (text) => {
  const matches = [...text.matchAll(/(?:total|amount|paid|balance)?\s*(?:rs\.?|inr|usd|\$|eur|gbp)?\s*([0-9]+(?:[,][0-9]{3})*(?:\.[0-9]{1,2})?)/gi)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((value) => value > 0);

  return matches.length ? Math.max(...matches) : undefined;
};

const findDate = (text) => {
  const match = text.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/);
  if (!match) return undefined;
  const date = new Date(match[1]);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const inferCategory = (text) => {
  const lowered = text.toLowerCase();
  return categories.find((category) => category.words.some((word) => lowered.includes(word)))?.key || "Other";
};

export const extractReceiptData = async (filePath) => {
  const result = await recognize(filePath, "eng");
  const rawText = result.data?.text || "";
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    rawText,
    extracted: {
      amount: findAmount(rawText),
      date: findDate(rawText),
      description: lines.slice(0, 2).join(" - ") || "Receipt expense",
      category: inferCategory(rawText),
      vendor: lines[0],
    },
    processedAt: new Date(),
  };
};
