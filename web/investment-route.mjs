export function normalizeInvestmentSectionKey(sectionKey) {
  const normalizedSectionKey = String(sectionKey || "").trim().toLowerCase();
  const sectionKeyMap = {
    doviz: "fx",
    fx: "fx",
    borsa: "stock",
    stock: "stock",
    fon: "fund",
    fund: "fund",
    altin: "gold",
    gold: "gold",
    mevduat: "silver",
    gumus: "silver",
    silver: "silver",
  };
  return sectionKeyMap[normalizedSectionKey] || "";
}
