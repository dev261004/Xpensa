import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const rateCache = new Map();
const TTL_MS = 1000 * 60 * 60;

export const convertCurrency = async ({ amount, from, to }) => {
  const source = from?.toUpperCase();
  const target = to?.toUpperCase();

  if (!source || !target) {
    throw new ApiError(400, "Currency conversion requires source and target currencies");
  }

  if (source === target) {
    return {
      convertedAmount: Number(Number(amount).toFixed(2)),
      convertedCurrency: target,
      conversionRate: 1,
      conversionDate: new Date(),
    };
  }

  const cached = rateCache.get(source);
  let rates = cached?.rates;
  let fetchedAt = cached?.fetchedAt || 0;

  if (!rates || Date.now() - fetchedAt > TTL_MS) {
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(source)}`,
      { timeout: 8000 }
    );
    rates = response.data?.rates || {};
    fetchedAt = Date.now();
    rateCache.set(source, { rates, fetchedAt });
  }

  const rate = Number(rates[target]);
  if (!rate) {
    throw new ApiError(422, `No currency conversion rate available for ${source} to ${target}`);
  }

  return {
    convertedAmount: Number((Number(amount) * rate).toFixed(2)),
    convertedCurrency: target,
    conversionRate: rate,
    conversionDate: new Date(fetchedAt),
  };
};
