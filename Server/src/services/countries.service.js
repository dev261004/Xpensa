import axios from "axios";

let countriesCache = null;
let cachedAt = 0;
const TTL_MS = 1000 * 60 * 60 * 12;

const fallbackCountries = [
  { name: "India", currency: "INR", currencyName: "Indian rupee", currencySymbol: "₹" },
  { name: "United States", currency: "USD", currencyName: "United States dollar", currencySymbol: "$" },
  { name: "United Kingdom", currency: "GBP", currencyName: "British pound", currencySymbol: "£" },
  { name: "Germany", currency: "EUR", currencyName: "Euro", currencySymbol: "€" },
  { name: "France", currency: "EUR", currencyName: "Euro", currencySymbol: "€" },
  { name: "Australia", currency: "AUD", currencyName: "Australian dollar", currencySymbol: "$" },
  { name: "Canada", currency: "CAD", currencyName: "Canadian dollar", currencySymbol: "$" },
  { name: "Singapore", currency: "SGD", currencyName: "Singapore dollar", currencySymbol: "$" },
];

export const getCountries = async () => {
  if (countriesCache && Date.now() - cachedAt < TTL_MS) {
    return countriesCache;
  }

  try {
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,currencies", {
      timeout: 8000,
    });

    countriesCache = response.data
      .map((country) => {
        const currencyCode = Object.keys(country.currencies || {})[0] || "USD";
        return {
          name: country.name?.common,
          currency: currencyCode,
          currencyName: country.currencies?.[currencyCode]?.name || currencyCode,
          currencySymbol: country.currencies?.[currencyCode]?.symbol || currencyCode,
        };
      })
      .filter((country) => country.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn("Country API unavailable, using fallback country list:", error.message);
    countriesCache = fallbackCountries;
  }

  cachedAt = Date.now();
  return countriesCache;
};

export const getCurrencyForCountry = async (countryName) => {
  const countries = await getCountries();
  return countries.find((country) => country.name === countryName)?.currency || "USD";
};
