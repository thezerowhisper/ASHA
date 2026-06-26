// functions/api/pregnancies.js
// GET  /api/pregnancies?status=active&high_risk=1&village=X   -> list with woman details
// POST /api/pregnancies  -> create woman (if new) + pregnancy record
// PATCH /api/pregnancies -> update pregnancy status / add visit

import { requireAuth, jsonOk, jsonError } from "../_auth.js";

export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "active";
  const highRiskOnly = url.searchParams.get("high_risk");
  const village = url.searchParams.get("village");

  let query = `
    SELECT p.id, p.lmp_date, p.edd, p.is_high_risk, p.risk_factors, p.status,
           p.registered_date, p.delivery_date, p.delivery_outcome,
           w.id as woman_id, w.name as woman_name, w.husband_name, w.age, w.village, w.phone,
           aw.name as asha_worker_name,
           CAST(julianday('now') - julianday(p.lmp_date) AS INTEGER) / 7 AS gestation_weeks
    FROM pregnancies p
    JOIN women w ON w.id = p.woman_id
    LEFT JOIN asha_workers aw ON aw.id = p.asha_worker_id
    WHERE p.status = ?
  `;
  const binds = [status];

  if (highRiskOnly === "1") {
    query += " AND p.is_high_risk = 1";
  }
  if (village) {
    query += " AND w.village = ?";
    binds.push(village);
  }
  query += " ORDER BY p.is_high_risk DESC, p.registered_date DESC";

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

  const {
    woman_id, // optional: reuse existing woman
    name,
    husband_name,
    age,
    village,
    address,
    phone,
    lmp_date,
    edd,
    is_high_risk,
    risk_factors,
  } = body;

  if (!lmp_date && !edd) return jsonError("LMP date or EDD is required");

  let finalWomanId = woman_id;

  if (!finalWomanId) {
    if (!name) return jsonError("Woman's name is required for a new entry");
    const insertWoman = await env.DB.prepare(
      `INSERT INTO women (name, husband_name, age, village, address, phone, asha_worker_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(name, husband_name || null, age || null, village || null, address || null, phone || null, auth.workerId)
      .run();
    finalWomanId = insertWoman.meta.last_row_id;
  }

  const insertPregnancy = await env.DB.prepare(
    `INSERT INTO pregnancies (woman_id, lmp_date, edd, is_high_risk, risk_factors, asha_worker_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(finalWomanId, lmp_date || null, edd || null, is_high_risk ? 1 : 0, risk_factors || null, auth.workerId)
    .run();

  return jsonOk({ id: insertPregnancy.meta.last_row_id, woman_id: finalWomanId });
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

  const { id, status, delivery_date, delivery_outcome, is_high_risk, risk_factors, visit } = body;
  if (!id) return jsonError("Pregnancy id is required");

  if (status) {
    await env.DB.prepare(
      `UPDATE pregnancies SET status = ?, delivery_date = ?, delivery_outcome = ? WHERE id = ?`
    )
      .bind(status, delivery_date || null, delivery_outcome || null, id)
      .run();
  }

  if (typeof is_high_risk !== "undefined") {
    await env.DB.prepare(`UPDATE pregnancies SET is_high_risk = ?, risk_factors = ? WHERE id = ?`)
      .bind(is_high_risk ? 1 : 0, risk_factors || null, id)
      .run();
  }

  if (visit) {
    await env.DB.prepare(
      `INSERT INTO pregnancy_visits (pregnancy_id, visit_date, bp, weight, hb, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, visit.visit_date || new Date().toISOString(), visit.bp || null, visit.weight || null, visit.hb || null, visit.notes || null, auth.workerId)
      .run();
  }

  return jsonOk({ ok: true });
}
