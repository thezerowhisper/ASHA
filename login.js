// functions/api/dashboard.js
import { requireAuth, jsonOk } from "../_auth.js";

export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (auth.error) return auth.error;
  const { env } = context;

  const [activePreg, highRisk, infants, under5, couplesNoMethod, totalCouples, birthsThisMonth] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as n FROM pregnancies WHERE status = 'active'").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM pregnancies WHERE status = 'active' AND is_high_risk = 1").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM children WHERE (julianday('now') - julianday(dob))/365.25 <= 1").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM children WHERE (julianday('now') - julianday(dob))/365.25 <= 5").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM eligible_couples WHERE fp_method = 'none'").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM eligible_couples").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM children WHERE strftime('%Y-%m', dob) = strftime('%Y-%m', 'now')").first(),
  ]);

  return jsonOk({
    active_pregnancies: activePreg.n,
    high_risk_pregnancies: highRisk.n,
    infants_0_1: infants.n,
    children_0_5: under5.n,
    couples_no_method: couplesNoMethod.n,
    total_couples: totalCouples.n,
    births_this_month: birthsThisMonth.n,
  });
}
