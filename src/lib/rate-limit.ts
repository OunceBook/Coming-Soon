type RateRecord = {
  count: number;
  resetAt: number;
};

const RATE_STORE = new Map<string, RateRecord>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
) {
  const now = Date.now();
  const current = RATE_STORE.get(key);

  if (!current || current.resetAt <= now) {
    RATE_STORE.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
  RATE_STORE.set(key, current);
  return true;
}
