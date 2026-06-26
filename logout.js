// functions/api/me.js
import { requireAuth, jsonOk } from "../_auth.js";

export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;

  const row = await context.env.DB.prepare(
    "SELECT id, name, village FROM asha_workers WHERE id = ?"
  )
    .bind(auth.workerId)
    .first();

  return jsonOk(row || null);
}
