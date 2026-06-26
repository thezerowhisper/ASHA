// functions/_auth.js
// Lightweight PIN-based session auth, shared by all /api/* functions.
// Session token = HMAC-signed worker id + expiry, stored in an HttpOnly cookie.

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPin(pin, salt) {
  return hmac(salt, pin);
}

export async function makeSessionToken(env, workerId) {
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 14; // 14 days
  const payload = `${workerId}.${expiry}`;
  const sig = await hmac(env.SESSION_SECRET, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(env, token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [workerId, expiry, sig] = parts;
  const expected = await hmac(env.SESSION_SECRET, `${workerId}.${expiry}`);
  if (expected !== sig) return null;
  if (Date.now() > Number(expiry)) return null;
  return Number(workerId);
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAuth(context) {
  const token = getCookie(context.request, "asha_session");
  const workerId = await verifySessionToken(context.env, token);
  if (!workerId) {
    return { error: jsonError("Not logged in", 401) };
  }
  return { workerId };
}

export function jsonOk(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

export function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
