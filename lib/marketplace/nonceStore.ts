/**
 * In-memory nonce store for marketplace download authentication.
 * Nonces are single-use and expire after 5 minutes.
 */
const NONCE_TTL_MS = 5 * 60 * 1000;
const store = new Map<string, number>();

export function createNonce(): string {
  const now = Date.now();
  Array.from(store.entries()).forEach(([nonce, expiresAt]) => {
    if (expiresAt < now) store.delete(nonce);
  });
  const nonce = crypto.randomUUID();
  store.set(nonce, now + NONCE_TTL_MS);
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  const expiresAt = store.get(nonce);
  store.delete(nonce);
  if (!expiresAt || Date.now() > expiresAt) return false;
  return true;
}
