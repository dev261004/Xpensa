export const formatCurrency = (amount, currency = "USD") => {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

export const formatDate = (date) => {
  if (!date) return "-";
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "-" : value.toLocaleDateString();
};

export const statusKey = (status) => (status || "Draft").toLowerCase().replace(/\s+/g, "-");
