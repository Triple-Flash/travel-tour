/**
 * lib/payos.ts
 * PayOS singleton factory.
 * Only used by data/mutations/payments.ts — never import in app/ layer.
 */
import { PayOS } from "@payos/node";

const globalForPayOS = globalThis as unknown as {
  payos: PayOS | undefined;
};

function createPayOS(): PayOS {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error(
      "Missing PayOS credentials. Set PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY in .env"
    );
  }

  return new PayOS({ clientId, apiKey, checksumKey });
}

export const payos: PayOS =
  globalForPayOS.payos ?? createPayOS();

if (process.env.NODE_ENV !== "production") {
  globalForPayOS.payos = payos;
}
