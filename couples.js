// functions/api/children.js
// GET  /api/children?max_age=1        -> children 0-1yr (or max_age=5 for 0-5yr)
// POST /api/children                  -> register a birth
// PATCH /api/children                 -> add a growth/immunization visit

import { requireAuth, jsonOk, jsonError } from "../_auth.js";

export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;
  const { env, request } = context;
  const url = new URL(request.url);
  const maxAge = Number(url.searchParams.get("max_age") || 5);
  const village = url.searchParams.get("village");

  let query = `
    SELECT c.id, c.name, c.dob, c.gender, c.birth_weight, c.village,
           w.name as mother_name, w.phone as mother_phone,
           aw.name as asha_worker_name,
           (julianday('now') - julianday(c.dob)) / 365.25 AS age_years,
           CAST((julianday('now') - julianday(c.dob)) / 30.44 AS INTEGER) AS age_months,
           (SELECT COUNT(*) FROM child_visits cv WHERE cv.child_id = c.id) AS visit_count,
           (SELECT MAX(visit_date) FROM child_visits cv WHERE cv.child_id = c.id) AS last_visit
    FROM children c
    LEFT JOIN women w ON w.id = c.mother_id
    LEFT JOIN asha_workers aw ON aw.id = c.asha_worker_id
    WHERE (julianday('now') - julianday(c.dob)) / 365.25 <= ?
  `;
  const binds = [maxAge];

  if (village) {
    query += " AND c.village = ?";
    binds.push(village);
  }
  query += " ORDER BY c.dob DESC";

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

  const { mother_id, name, dob, gender, birth_weight, village } = body;
  if (!dob) return jsonError("Date of birth is required");

  const insert = await env.DB.prepare(
    `INSERT INTO children (mother_id, name, dob, gender, birth_weight, village, asha_worker_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(mother_id || null, name || null, dob, gender || null, birth_weight || null, village || null, auth.workerId)
    .run();

  // If this birth closes out an active pregnancy for the mother, mark it delivered.
  if (mother_id) {
    await env.DB.prepare(
      `UPDATE pregnancies SET status = 'delivered', delivery_date = ?, delivery_outcome = 'live_birth'
       WHERE woman_id = ? AND status = 'active'`
    )
      .bind(dob, mother_id)
      .run();
  }

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

  const { id, visit } = body;
  if (!id || !visit) return jsonError("Child id and visit details are required");

  await env.DB.prepare(
    `INSERT INTO child_visits (child_id, visit_date, weight, height, immunization, notes, recorded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, visit.visit_date || new Date().toISOString(), visit.weight || null, visit.height || null, visit.immunization || null, visit.notes || null, auth.workerId)
    .run();

  return jsonOk({ ok: true });
}
