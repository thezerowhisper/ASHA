# ASHA Register

A small Cloudflare Pages + D1 app for ASHA workers to log daily/weekly records of:

- Pregnancies, with a **high-risk flag** and ANC visit tracking
- Newborns/children, viewable as **0–1 yr** or **0–5 yr** registers
- **Eligible couples** (newly married), tracking family planning method adopted

Built to match your existing stack: Pages Functions for the API, D1 for storage,
simple per-worker PIN login (same pattern as the clinic expense tracker).

## 1. Create the D1 database

```bash
wrangler d1 create asha-register
```

Copy the `database_id` it prints into `wrangler.toml`.

## 2. Apply the schema

```bash
wrangler d1 execute asha-register --remote --file=./schema.sql
```

(Drop `--remote` to test against a local D1 first.)

## 3. Set secrets

Two secrets are needed — a session-signing secret and a PIN-hashing salt.
Generate random strings and set them as Pages environment variables/secrets
(Cloudflare dashboard → Pages project → Settings → Environment variables,
or via `wrangler pages secret put`):

```bash
wrangler pages secret put SESSION_SECRET
wrangler pages secret put PIN_SALT
```

## 4. Add your ASHA workers

PINs are stored as HMAC hashes (never plaintext). Generate a hash locally:

```bash
node scripts/hash-pin.js "<the PIN_SALT you set above>" "1234"
```

Then insert the worker, using the printed hash:

```bash
wrangler d1 execute asha-register --remote --command \
  "INSERT INTO asha_workers (name, village, pin_hash) VALUES ('Sandeep Kaur', 'Golewala', 'PASTE_HASH_HERE')"
```

Repeat for each ASHA worker. Names are how they log in, so make sure they're
unique and the worker knows the exact spelling.

## 5. Deploy

```bash
wrangler pages deploy public --project-name=asha-register
```

Or connect the repo to Cloudflare Pages in the dashboard for git-based deploys
(same as your other Pages projects) — build output directory is `public`,
no build command needed (it's plain HTML/JS).

## How it's organized

```
public/             Static frontend (login, dashboard, entry form, 3 registers)
functions/api/      Pages Functions — the backend API
functions/_auth.js  Shared PIN-hash + session-token helpers
schema.sql          D1 table definitions
scripts/hash-pin.js Local helper for generating PIN hashes
```

### Data model
- `women` — pregnancy register's parent record (name, husband, village)
- `pregnancies` + `pregnancy_visits` — one row per pregnancy, with `is_high_risk`
  flag and free-text `risk_factors`; visits logged separately for ANC history
- `children` + `child_visits` — birth record + growth/immunization visits.
  Age buckets (0–1yr, 0–5yr) are computed on the fly from `dob`, not stored
- `eligible_couples` — newly married couples register, with `fp_method`
  tracked so you can filter "no method adopted yet" at a glance

### Notes
- All API routes require a logged-in session (`asha_session` cookie, HttpOnly).
- The frontend deliberately skips webfonts — it's built for ASHA workers
  filling this in on 2G/3G in the field, so it only uses system fonts and
  keeps payloads small.
- No PII leaves Cloudflare's network — D1 + Pages Functions run in the same
  account as your other tools.

## Possible next steps
- CSV export per register (for monthly reporting to PHC/block office)
- Visit-overdue reminders (the children register already flags >30 days
  since last visit in amber — could extend to SMS via a Worker cron)
- A simple admin page to add/deactivate ASHA workers without the CLI
