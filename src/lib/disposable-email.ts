import disposableDomains from "disposable-domains";

const DISPOSABLE_DOMAIN_SET = new Set(
  disposableDomains.map((domain) => domain.toLowerCase()),
);

export function isDisposableEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return false;
  }

  return DISPOSABLE_DOMAIN_SET.has(domain);
}
