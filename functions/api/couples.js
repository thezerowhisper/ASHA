// functions/api/couples.js
// GET  /api/couples?fp_method=none&village=X  -> list eligible couples
// POST /api/couples                           -> register a new couple
// PATCH /api/couples                          -> update FP method adopted

import { requireAuth, jsonOk, jsonError } from "../_auth.js";

export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;
  const { env, request } = context;
  const url = new URL(request.url);
  const fpMethod = url.searchParams.get("fp_method");
  const village = url.searchParams.get("village");

  let query = `
    SELECT ec.*, aw.name as asha_worker_name
    FROM eligible_couples ec
    LEFT JOIN asha_workers aw ON aw.id = ec.asha_worker_id
    WHERE 1=1
  `;
  const binds = [];

  if (fpMethod) {
    query += " AND ec.fp_method = ?";
    binds.push(fpMethod);
  }
  if (village) {
    query += " AND ec.village = ?";
    binds.push(village);
  }
  query += " ORDER BY ec.marriage_date DESC";

  const result = await env.DB.prepare(query).bind(...binds).all();
  return jsonOk(result.results);
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;
  const { env, request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body");
  }

  const { husband_name, wife_name, wife_age, husband_age, marriage_date, village, address, phone, fp_method, notes } = body;
  if (!husband_name || !wife_name) return jsonError("Husband and wife name are required");

  const insert = await env.DB.prepare(
    `INSERT INTO eligible_couples (husband_name, wife_name, wife_age, husband_age, marriage_date, village, address, phone, fp_method, notes, asha_worker_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      husband_name,
      wife_name,
      wife_age || null,
      husband_age || null,
      marriage_date || null,
      village || null,
      address || null,
      phone || null,
      fp_method || "none",
      notes || null,
      auth.workerId
    )
    .run();

  return jsonOk({ id: insert.meta.last_row_id });
}

export async function onRequestPatch(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;
  const { env, request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body");
  }

  const { id, fp_method, notes } = body;
  if (!id) return jsonError("Couple id is required");

  await env.DB.prepare(`UPDATE eligible_couples SET fp_method = ?, notes = ? WHERE id = ?`)
    .bind(fp_method || "none", notes || null, id)
    .run();

  return jsonOk({ ok: true });
}
