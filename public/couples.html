<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<title>Eligible couples — ASHA Register</title>
<link rel="stylesheet" href="/css/shared.css" />
</head>
<body>
<header class="app-header">
  <div class="brand">Eligible couples</div>
  <button class="link" onclick="logout()">Log out</button>
</header>

<main>
  <div class="filter-bar">
    <button data-filter="all" class="active">All</button>
    <button data-filter="none">No FP method</button>
  </div>
  <input id="search" placeholder="Search by name…" style="margin-bottom: 14px;" />
  <div id="list"></div>
</main>

<script src="/js/shared.js"></script>
<script>
  let all = [];
  let filterMode = "all";

  const fpLabels = {
    none: "No method",
    condom: "Condom",
    ocp: "OCP",
    iucd: "IUCD",
    injectable: "Injectable",
    sterilization_f: "Female sterilization",
    sterilization_m: "Male sterilization",
    other: "Other",
  };

  async function load() {
    const params = filterMode === "none" ? "fp_method=none" : "";
    all = await api(`couples?${params}`);
    render();
  }

  function render() {
    const q = document.getElementById("search").value.trim().toLowerCase();
    const filtered = q
      ? all.filter((c) => c.husband_name.toLowerCase().includes(q) || c.wife_name.toLowerCase().includes(q))
      : all;

    const list = document.getElementById("list");
    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state">No couples in this view yet.</div>`;
      return;
    }

    list.innerHTML = filtered
      .map((c) => {
        const noMethod = c.fp_method === "none";
        return `
        <div class="reg-row">
          <div class="row-top">
            <span class="name">${c.husband_name} &amp; ${c.wife_name}</span>
            <span class="tag ${noMethod ? "amber" : "ok"}">${fpLabels[c.fp_method] || c.fp_method}</span>
          </div>
          <div class="meta">${c.village || "no village"} · Married: ${fmtDate(c.marriage_date)}</div>
          <div class="meta">Ages: husband ${c.husband_age || "—"}, wife ${c.wife_age || "—"} · ASHA: ${c.asha_worker_name || "—"}</div>
        </div>`;
      })
      .join("");
  }

  document.querySelectorAll(".filter-bar button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-bar button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterMode = btn.dataset.filter;
      load();
    });
  });

  document.getElementById("search").addEventListener("input", render);

  (async () => {
    const me = await requireSession();
    if (!me) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("fp_method") === "none") {
      document.querySelector('[data-filter="none"]').click();
    } else {
      await load();
    }
    renderTabbar("couples");
  })();
</script>
</body>
</html>
