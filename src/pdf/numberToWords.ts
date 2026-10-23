const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function chunkToWords(n: number): string {
  // Handles 0–999
  const parts: string[] = [];

  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds > 0) {
    parts.push(`${ones[hundreds]} Hundred`);
  }

  if (rest > 0) {
    if (rest < 20) {
      parts.push(ones[rest]);
    } else {
      const t = Math.floor(rest / 10);
      const o = rest % 10;
      parts.push(o > 0 ? `${tens[t]}-${ones[o]}` : tens[t]);
    }
  }

  return parts.join(" ");
}

/**
 * Convert a number into English words (short scale: thousand, million, billion).
 * Returns "Zero" for 0.
 */
export function numberToWords(amount: number): string {
  const n = Math.floor(Math.abs(amount));

  if (n === 0) return "Zero";

  const groups: Array<{ value: number; label: string }> = [
    { value: 1_000_000_000, label: "Billion" },
    { value: 1_000_000, label: "Million" },
    { value: 1_000, label: "Thousand" },
    { value: 1, label: "" },
  ];

  const parts: string[] = [];

  let remaining = n;
  for (const { value, label } of groups) {
    const chunk = Math.floor(remaining / value);
    if (chunk > 0) {
      const words = chunkToWords(chunk);
      parts.push(label ? `${words} ${label}` : words);
      remaining -= chunk * value;
    }
  }

  return parts.join(" ");
}

/**
 * "Forty One Thousand Uganda Shillings Only"
 */
export function amountInWords(amount: number): string {
  const n = Math.floor(amount);
  const words = numberToWords(n);
  return `${words} Uganda Shillings Only`;
}
