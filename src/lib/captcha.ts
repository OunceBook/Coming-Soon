type CaptchaResult = {
  ok: boolean;
  reason?: string;
};

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function shouldEnforceCaptcha() {
  return process.env.NODE_ENV === "production" || process.env.ENFORCE_CAPTCHA === "true";
}

export async function verifyTurnstileToken(
  token: string | undefined,
  clientIp?: string,
): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return shouldEnforceCaptcha()
      ? { ok: false, reason: "captcha_not_configured" }
      : { ok: true };
  }

  if (!token) {
    return { ok: false, reason: "captcha_missing" };
  }

  const payload = new URLSearchParams({
    secret,
    response: token,
  });

  if (clientIp && clientIp !== "unknown") {
    payload.append("remoteip", clientIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    if (!response.ok) {
      return { ok: false, reason: "captcha_http_error" };
    }

    const data = (await response.json()) as TurnstileResponse;

    if (!data.success) {
      return {
        ok: false,
        reason: data["error-codes"]?.join(",") || "captcha_invalid",
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "captcha_request_failed" };
  }
}
