import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const previewCookie = "eat_in_preview";
export const previewSessionSeconds = 8 * 60 * 60;

export function equalSecret(actual: string, expected: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(actual), digest(expected));
}

export function createPreviewSession(password: string, now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + previewSessionSeconds}.${randomBytes(24).toString("hex")}`;
  const signature = createHmac("sha256", password)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function validPreviewSession(
  token: string | undefined,
  password: string,
  now = Date.now(),
) {
  if (!token || !/^\d{10}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(token))
    return false;
  const [expiry, nonce, signature] = token.split(".");
  const remaining = Number(expiry) - Math.floor(now / 1000);
  if (remaining <= 0 || remaining > previewSessionSeconds) return false;
  const expected = createHmac("sha256", password)
    .update(`${expiry}.${nonce}`)
    .digest("hex");
  return equalSecret(signature, expected);
}
