// functions/api/login.js
// POST { name, pin } -> sets session cookie, returns worker info

import { hashPin, makeSessionToken, jsonOk, jsonError } from "../_auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body");
  }

  const { name, pin } = body;
  if (!name || !pin) return jsonError("Name and PIN are required");

  const row = await env.DB.prepare(
    "SELECT id, name, pin_hash, active FROM asha_workers WHERE name = ? COLLATE NOCASE"
  )
    .bind(name.trim())
    .first();

  if (!row || !row.active) return jsonError("Worker not found or inactive", 401);

  const computed = await hashPin(pin, env.PIN_SALT);
  if (computed !== row.pin_hash) return jsonError("Incorrect PIN", 401);

  const token = await makeSessionToken(env, row.id);

  return jsonOk(
    { id: row.id, name: row.name },
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `asha_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`,
      },
    }
  );
}
