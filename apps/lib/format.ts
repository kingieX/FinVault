// Naira Currency format
export function formatCurrency(amount: number) {
  return `₦${Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// DOllar Currency format
export function formatDollarCurrency(amount: number) {
  return `$${Number(amount).toLocaleString("en-USD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined) {
    return "N/A";
  }

  const absNum = Math.abs(num);

  if (absNum >= 1.0e12) {
    return (num / 1.0e12).toFixed(2) + "T";
  }
  if (absNum >= 1.0e9) {
    return (num / 1.0e9).toFixed(2) + "B";
  }
  if (absNum >= 1.0e6) {
    return (num / 1.0e6).toFixed(2) + "M";
  }
  if (absNum >= 1.0e3) {
    return (num / 1.0e3).toFixed(2) + "K";
  }

  return num.toString();
}
