// PayMe amount unit: tiins. 1 UZS = 100 tiins.
export const UZS_TO_TIINS = 100;

export function buildPaymeUrl(orderNumber: string, amountUzs: number): string {
  const merchantId = process.env.PAYME_MERCHANT_ID!;
  const isTest = process.env.PAYME_TEST === "true";

  const appUrl = (process.env.NEXTAUTH_URL || "https://artlavka.uz").replace(/\/$/, "");
  const callbackUrl = `${appUrl}/cart`;

  const amountTiins = amountUzs * UZS_TO_TIINS;
  const params = `m=${merchantId};ac.order_id=${orderNumber};a=${amountTiins};c=${callbackUrl}`;
  const encoded = Buffer.from(params).toString("base64");

  const base = isTest ? "https://test.paycom.uz" : "https://checkout.paycom.uz";
  return `${base}/${encoded}`;
}

// PayMe sends Basic auth: "Paycom:<PAYME_KEY>"
export function verifyPaymeAuth(authHeader: string | null | undefined): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return false;
    const login = decoded.slice(0, colonIdx);
    const password = decoded.slice(colonIdx + 1);
    const key = process.env.PAYME_KEY;
    return login === "Paycom" && !!key && password === key;
  } catch {
    return false;
  }
}

export const PaymeErrors = {
  PARSE_ERROR: -32700,
  METHOD_NOT_FOUND: -32601,
  INVALID_AMOUNT: -31001,
  ORDER_NOT_FOUND: -31050,
  ORDER_NOT_PAYABLE: -31051,
  ALREADY_PAID: -31052,
  TRANSACTION_NOT_FOUND: -31003,
  TRANSACTION_CANCELLED: -31007,
  TRANSACTION_ALREADY_PERFORMED: -31060,
  AUTH_FAILED: -32504,
} as const;
