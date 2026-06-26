/* shared.css — ASHA Register
   Design notes: system fonts only (no webfont fetch — many entries happen on
   2G/3G in the field). High-contrast, large tap targets, calm clinical palette.
   Teal = primary action / healthy. Amber = needs attention. Terracotta = high risk. */

:root {
  --bg: #f7f8f6;
  --surface: #ffffff;
  --ink: #1c2622;
  --ink-soft: #5b6a63;
  --line: #dfe5e0;
  --teal: #1b6b63;
  --teal-dark: #124d47;
  --amber: #b9842c;
  --amber-bg: #fbf1de;
  --risk: #b34530;
  --risk-bg: #fbe9e5;
  --ok-bg: #e9f3ee;
  --radius: 10px;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", sans-serif;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.45;
}

a { color: var(--teal-dark); }

.app-header {
  background: var(--teal-dark);
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header .brand {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.2px;
}

.app-header .brand .sub {
  display: block;
  font-weight: 400;
  font-size: 0.75rem;
  opacity: 0.8;
}

.app-header button.link {
  background: none;
  border: none;
  color: #fff;
  opacity: 0.85;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 4px;
}

main {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 90px; /* leave room for bottom nav */
}

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 14px;
}

h1, h2, h3 { margin: 0 0 12px; line-height: 1.25; }
h1 { font-size: 1.3rem; }
h2 { font-size: 1.1rem; }
h3 { font-size: 0.95rem; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 12px 0 4px;
  color: var(--ink-soft);
}

input, select, textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: var(--ink);
  font-family: var(--font);
}

input:focus, select:focus, textarea:focus {
  outline: 2px solid var(--teal);
  outline-offset: 1px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}
.checkbox-row input { width: auto; }
.checkbox-row label { margin: 0; font-weight: 500; }

button.primary {
  width: 100%;
  background: var(--teal);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 13px 16px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 18px;
  cursor: pointer;
}
button.primary:active { background: var(--teal-dark); }
button.primary:disabled { opacity: 0.5; }

button.secondary {
  width: 100%;
  background: #fff;
  color: var(--teal-dark);
  border: 1px solid var(--teal);
  border-radius: 8px;
  padding: 11px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
}

.error-msg {
  background: var(--risk-bg);
  color: var(--risk);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 10px;
  display: none;
}
.error-msg.show { display: block; }

.toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--teal-dark);
  color: #fff;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
  z-index: 50;
}
.toast.show { opacity: 1; }

/* Bottom tab nav */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--line);
  display: flex;
  z-index: 10;
}
.tabbar a {
  flex: 1;
  text-align: center;
  padding: 10px 4px 8px;
  font-size: 0.72rem;
  color: var(--ink-soft);
  text-decoration: none;
}
.tabbar a .icon { display: block; font-size: 1.25rem; margin-bottom: 2px; }
.tabbar a.active { color: var(--teal-dark); font-weight: 700; }

/* Register list rows */
.reg-row {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 10px;
}
.reg-row .row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.reg-row .name { font-weight: 700; font-size: 1rem; }
.reg-row .meta { font-size: 0.82rem; color: var(--ink-soft); margin-top: 2px; }

.tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
}
.tag.risk { background: var(--risk-bg); color: var(--risk); }
.tag.amber { background: var(--amber-bg); color: var(--amber); }
.tag.ok { background: var(--ok-bg); color: var(--teal-dark); }

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.filter-bar button {
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
}
.filter-bar button.active {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px;
  text-align: center;
}
.stat-card .num { font-size: 1.7rem; font-weight: 800; color: var(--teal-dark); }
.stat-card .num.warn { color: var(--risk); }
.stat-card .lbl { font-size: 0.78rem; color: var(--ink-soft); margin-top: 2px; }

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--ink-soft);
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
