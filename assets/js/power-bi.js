
(() => {
  const FILES = {
    fact_final: "assets/power-bi/fact_final.csv",
    fact_etapa: "assets/power-bi/fact_etapa.csv",
    fact_quesito_etapa: "assets/power-bi/fact_quesito_etapa.csv",
    dim_ano: "assets/power-bi/dim_ano.csv",
    dim_grupo: "assets/power-bi/dim_grupo.csv",
    dim_etapa: "assets/power-bi/dim_etapa.csv",
    dim_quesito: "assets/power-bi/dim_quesito.csv",
    dim_quadrilha: "assets/power-bi/dim_quadrilha.csv",
    theme: "assets/power-bi/linqdfe_theme_dark.json",
    measures: "assets/power-bi/measures_dax.txt",
    readme: "assets/power-bi/README_modelo.md",
    zip: "assets/power-bi/linqdfe_powerbi_pack.zip",
  };

  const el = {
    role: document.getElementById("powerbiRole"),
    tabs: document.getElementById("tabs"),
    viewAdmin: document.getElementById("viewAdmin"),
    viewPresidente: document.getElementById("viewPresidente"),
    chipFilters: document.getElementById("chipFilters"),
    clearChips: document.getElementById("clearChips"),
    filterGrupo: document.getElementById("filterGrupo"),
    filterAno: document.getElementById("filterAno"),
    filterEtapa: document.getElementById("filterEtapa"),
    filterQuesito: document.getElementById("filterQuesito"),
    filterQuadrilha: document.getElementById("filterQuadrilha"),
    toggleNormalizado: document.getElementById("toggleNormalizado"),
    resetFilters: document.getElementById("resetFilters"),
    exportCsv: document.getElementById("exportCsv"),
    filtersSummary: document.getElementById("filtersSummary"),
    toggleAdvanced: document.getElementById("toggleAdvanced"),
    filtersAdvanced: document.getElementById("filtersAdvanced"),
  };

  const formatter1 = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const formatter0 = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  function formatNumber(value, decimals = 1) {
    const n = typeof value === "number" ? value : parseLocaleNumber(value);
    if (!Number.isFinite(n)) return "—";
    return decimals === 0 ? formatter0.format(n) : formatter1.format(n);
  }

  function formatPercent(value) {
    const n = typeof value === "number" ? value : parseLocaleNumber(value);
    if (!Number.isFinite(n)) return "—";
    return `${formatter0.format(n)}%`;
  }

  function parseLocaleNumber(value) {
    if (value === null || value === undefined) return NaN;
    const raw = String(value).trim();
    if (!raw) return NaN;
    const hasComma = raw.includes(",");
    const hasDot = raw.includes(".");
    let normalized = raw;
    if (hasComma && hasDot) {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else if (hasComma) {
      normalized = raw.replace(",", ".");
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function metricValue(value, max, normalizado) {
    const n = typeof value === "number" ? value : parseLocaleNumber(value);
    if (!Number.isFinite(n)) return NaN;
    if (!normalizado) return n;
    if (!Number.isFinite(max) || max === 0) return NaN;
    return (n / max) * 100;
  }

  function metricLabel(value, max, normalizado) {
    return formatNumber(metricValue(value, max, normalizado));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function parseCSV(text) {
    const normalizedText = text.replace(/^\uFEFF/, "");
    const lines = normalizedText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const rows = [];
    const headerLine = lines.find((line) => line.trim() !== "");
    if (!headerLine) return { headers: [], rows: [] };

    const delimiter = detectDelimiter(headerLine);
    const parseLine = (line) => {
      const result = [];
      let value = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const next = line[i + 1];
        if (ch === '"') {
          if (inQuotes && next === '"') {
            value += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(value.trim());
          value = "";
        } else {
          value += ch;
        }
      }
      result.push(value.trim());
      return result;
    };

    const headers = parseLine(headerLine);
    let started = false;
    lines.forEach((line) => {
      if (!started) {
        if (line === headerLine) started = true;
        return;
      }
      if (!line.trim()) return;
      rows.push(parseLine(line));
    });

    return { headers, rows };
  }

  function detectDelimiter(line) {
    let comma = 0;
    let semicolon = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes) {
        if (ch === ",") comma += 1;
        if (ch === ";") semicolon += 1;
      }
    }
    return semicolon > comma ? ";" : ",";
  }

  function normalizeHeaders(headers) {
    const map = {
      ano: "Ano",
      grupo: "Grupo",
      quadrilha: "Quadrilha",
      etapa: "Etapa",
      quesito: "Quesito",
      notaqesitoetapa: "NotaQuesitoEtapa",
      notaqesito: "NotaQuesitoEtapa",
      notaq: "NotaQuesitoEtapa",
      totalfinal: "TotalFinal",
      rankfinal: "RankFinal",
      etapasparticipadas: "EtapasParticipadas",
      etapasnoano: "EtapasNoAno",
      participacaopct: "ParticipacaoPct",
      status: "Status",
      totaletapa: "TotalEtapa",
    };
    return headers.map((header) => {
      const key = normalizeText(header).replace(/\s+/g, "");
      return map[key] || header.trim();
    });
  }

  function buildRows(headers, rows) {
    const normalized = normalizeHeaders(headers);
    return rows.map((row) => {
      const obj = {};
      normalized.forEach((h, idx) => {
        obj[h] = row[idx] ?? "";
      });
      return obj;
    });
  }
  function normalizeGroup(grupo) {
    if (!grupo) return "";
    const raw = String(grupo).toUpperCase();
    if (raw.includes("ACESSO")) return "GRUPO DE ACESSO";
    if (raw.includes("ESPECIAL")) return "GRUPO ESPECIAL";
    return raw;
  }

  function fetchText(path) {
    return fetch(path, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    });
  }

  function makeApresentacaoKey(row) {
    return `${row.Ano}||${row.Grupo}||${row.Etapa}||${row.Quadrilha}`;
  }

  const DataStore = (() => {
    let loaded = false;
    let facts = { final: [], etapa: [], quesito: [] };
    let invalidIndex = new Map();

    async function loadAllCSVsOnce() {
      if (loaded) return facts;
      const [finalText, etapaText, quesitoText] = await Promise.all([
        fetchText(FILES.fact_final),
        fetchText(FILES.fact_etapa),
        fetchText(FILES.fact_quesito_etapa),
      ]);

      const final = parseCSV(finalText);
      const etapa = parseCSV(etapaText);
      const quesito = parseCSV(quesitoText);

      facts.final = buildRows(final.headers, final.rows);
      facts.etapa = buildRows(etapa.headers, etapa.rows);
      facts.quesito = buildRows(quesito.headers, quesito.rows);
      invalidIndex = buildInvalidPresentationIndex(facts.quesito);
      loaded = true;
      return facts;
    }

    function buildInvalidPresentationIndex(rows) {
      const summary = new Map();
      rows.forEach((row) => {
        const key = makeApresentacaoKey(row);
        if (!summary.has(key)) {
          summary.set(key, {
            Ano: row.Ano,
            Grupo: row.Grupo,
            Etapa: row.Etapa,
            Quadrilha: row.Quadrilha,
            minNota: NaN,
            invalidCount: 0,
            quesitosInvalidos: new Set(),
            hasPositive: false,
          });
        }
        const entry = summary.get(key);
        const nota = parseLocaleNumber(row.NotaQuesitoEtapa);
        if (Number.isFinite(nota) && nota > 0) {
          entry.hasPositive = true;
          return;
        }
        entry.invalidCount += 1;
        if (Number.isFinite(nota)) {
          entry.minNota = Number.isFinite(entry.minNota) ? Math.min(entry.minNota, nota) : nota;
        }
        if (row.Quesito) entry.quesitosInvalidos.add(row.Quesito);
      });

      const index = new Map();
      summary.forEach((entry, key) => {
        if (!entry.hasPositive && entry.invalidCount > 0) {
          const { hasPositive, ...rest } = entry;
          index.set(key, rest);
        }
      });
      return index;
    }

    function isApresentacaoValid(row) {
      const key = makeApresentacaoKey(row);
      return !invalidIndex.has(key);
    }

    function applyBaseFilters(row, filters) {
      const groupFilter = normalizeGroup(filters.grupo);
      if (groupFilter) {
        const rowGroup = normalizeGroup(row.Grupo);
        if (rowGroup && rowGroup !== groupFilter) return false;
      }
      if (filters.anos.length && row.Ano && !filters.anos.includes(row.Ano)) return false;
      if (filters.etapas.length && row.Etapa && !filters.etapas.includes(row.Etapa)) return false;
      if (filters.quesitos.length && row.Quesito && !filters.quesitos.includes(row.Quesito)) return false;
      if (filters.quadrilhas.length && row.Quadrilha && !filters.quadrilhas.includes(row.Quadrilha)) return false;
      return true;
    }

    function getCleanQuesitoRows(filters) {
      return facts.quesito.filter((row) => {
        if (!applyBaseFilters(row, filters)) return false;
        if (!isApresentacaoValid(row)) return false;
        const nota = parseLocaleNumber(row.NotaQuesitoEtapa);
        return Number.isFinite(nota) && nota > 0;
      });
    }

    function getCleanEtapaTotals(filters) {
      const quesitos = getCleanQuesitoRows(filters);
      const map = new Map();
      quesitos.forEach((row) => {
        const key = makeApresentacaoKey(row);
        const current = map.get(key) || {
          Ano: row.Ano,
          Grupo: row.Grupo,
          Etapa: row.Etapa,
          Quadrilha: row.Quadrilha,
          TotalEtapa: 0,
        };
        current.TotalEtapa += parseLocaleNumber(row.NotaQuesitoEtapa) || 0;
        map.set(key, current);
      });
      return Array.from(map.values());
    }

    function getCleanFinalTotals(filters) {
      const etapas = getCleanEtapaTotals(filters);
      const etapasNoAno = new Map();
      etapas.forEach((row) => {
        const key = `${row.Ano}||${row.Grupo}`;
        if (!etapasNoAno.has(key)) etapasNoAno.set(key, new Set());
        etapasNoAno.get(key).add(row.Etapa);
      });

      const map = new Map();
      etapas.forEach((row) => {
        const key = `${row.Ano}||${row.Grupo}||${row.Quadrilha}`;
        const current = map.get(key) || {
          Ano: row.Ano,
          Grupo: row.Grupo,
          Quadrilha: row.Quadrilha,
          TotalFinal: 0,
          EtapasParticipadas: 0,
          EtapasNoAno: 0,
          ParticipacaoPct: 0,
        };
        current.TotalFinal += parseLocaleNumber(row.TotalEtapa) || 0;
        current.EtapasParticipadas += 1;
        const etapasKey = `${row.Ano}||${row.Grupo}`;
        const totalEtapas = etapasNoAno.get(etapasKey)?.size || 0;
        current.EtapasNoAno = totalEtapas;
        current.ParticipacaoPct = totalEtapas ? (current.EtapasParticipadas / totalEtapas) * 100 : 0;
        map.set(key, current);
      });
      return Array.from(map.values());
    }

    function computeKPIs(filters) {
      const finals = getCleanFinalTotals(filters);
      const totals = finals.map((row) => parseLocaleNumber(row.TotalFinal)).filter(Number.isFinite);
      const max = totals.length ? Math.max(...totals) : NaN;
      const avg = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : NaN;
      const std = standardDeviation(totals);
      return { finals, totals, max, avg, std };
    }

    function getInvalidPresentations(filters) {
      const rows = Array.from(invalidIndex.values());
      return rows.filter((row) => applyBaseFilters(row, filters));
    }

    return {
      loadAllCSVsOnce,
      getCleanQuesitoRows,
      getCleanEtapaTotals,
      getCleanFinalTotals,
      computeKPIs,
      getInvalidPresentations,
      isApresentacaoValid,
    };
  })();
  function getPortalUser() {
    if (window.PORTAL_USER && typeof window.PORTAL_USER === "object") {
      return normalizeUser(window.PORTAL_USER);
    }
    if (window.currentUserData && typeof window.currentUserData === "object") {
      return normalizeUser(window.currentUserData);
    }
    if (window.portalUser && typeof window.portalUser === "object") {
      return normalizeUser(window.portalUser);
    }

    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key);
        if (!value) continue;
        if (!/portal|user|usuario|perfil|role|auth/i.test(key)) continue;
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
          const normalized = normalizeUser(parsed);
          if (normalized.role) return normalized;
        }
      }
    } catch (err) {
      // ignore
    }

    return { role: "admin" };
  }

  function normalizeUser(raw) {
    const papel = raw.papel || raw.role || raw.perfil || raw.tipo || raw.userRole || "";
    const role = /QUADRILHA_ADMIN|PRESIDENTE/i.test(papel)
      ? "presidente"
      : /LIGA_ADMIN|COMUNICACAO_ADMIN|ADMIN/i.test(papel)
      ? "admin"
      : raw.role === "presidente"
      ? "presidente"
      : "admin";

    const quadrilha =
      raw.quadrilha ||
      raw.quadrilhaNome ||
      raw.quadrilha_name ||
      raw.quadrilhaId ||
      raw.quadrilha_id ||
      raw.nomeQuadrilha ||
      raw.quadrilhaNomeCompleto ||
      raw.quadrilha_nome;

    return { role, quadrilha };
  }

  function buildFilterState(user) {
    return {
      grupo: "",
      anos: [],
      etapas: [],
      quesitos: [],
      quadrilhas: user.role === "presidente" && user.quadrilha ? [user.quadrilha] : [],
      normalizado: false,
      activeTab: "",
    };
  }

  function unique(values) {
    return Array.from(new Set(values.filter((v) => v !== undefined && v !== null && String(v).trim() !== "")));
  }

  function populateFilterOptions(rows, filters) {
    const anos = unique(rows.final.map((row) => row.Ano)).sort();
    const etapas = unique(rows.etapa.map((row) => row.Etapa)).sort();
    const quesitos = unique(rows.quesito.map((row) => row.Quesito)).sort();
    const quadrilhas = unique(rows.final.map((row) => row.Quadrilha)).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

    setMultiOptions(el.filterAno, anos, filters.anos);
    setMultiOptions(el.filterEtapa, etapas, filters.etapas);
    setMultiOptions(el.filterQuesito, quesitos, filters.quesitos);
    setMultiOptions(el.filterQuadrilha, quadrilhas, filters.quadrilhas);
  }

  function setMultiOptions(select, options, selected) {
    if (!select) return;
    const current = new Set(selected || []);
    select.innerHTML = options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("");
    Array.from(select.options).forEach((opt) => {
      opt.selected = current.has(opt.value);
    });
  }

  function readMulti(select) {
    return Array.from(select?.selectedOptions || []).map((opt) => opt.value);
  }

  function createSlicer({ mountId, selectEl, placeholder = "Todos", searchable = true }) {
    const mount = document.getElementById(mountId);
    if (!mount || !selectEl) return;

    mount.innerHTML = `
      <div class="slicer">
        <button type="button" class="slicer-btn">${escapeHtml(placeholder)}</button>
        <div class="slicer-pop" hidden>
          ${searchable ? `<input class="slicer-search" placeholder="Buscar...">` : ""}
          <div class="slicer-actions">
            <button type="button" class="btn btn-light btn-sm" data-all>Marcar tudo</button>
            <button type="button" class="btn btn-light btn-sm" data-none>Limpar</button>
          </div>
          <div class="slicer-list"></div>
        </div>
      </div>
    `;

    const btn = mount.querySelector(".slicer-btn");
    const pop = mount.querySelector(".slicer-pop");
    const list = mount.querySelector(".slicer-list");
    const search = mount.querySelector(".slicer-search");

    const options = Array.from(selectEl.options).map((opt) => ({
      value: opt.value,
      label: opt.textContent,
    }));

    const renderList = (term = "") => {
      const t = term.trim().toLowerCase();
      const filtered = t ? options.filter((opt) => opt.label.toLowerCase().includes(t)) : options;
      list.innerHTML = filtered
        .map((opt) => {
          const checked = Array.from(selectEl.selectedOptions).some((s) => s.value === opt.value);
          return `
            <label class="slicer-item">
              <input type="checkbox" value="${escapeHtml(opt.value)}" ${checked ? "checked" : ""}>
              <span>${escapeHtml(opt.label)}</span>
            </label>
          `;
        })
        .join("");
    };

    const updateButtonLabel = () => {
      const selected = Array.from(selectEl.selectedOptions).map((opt) => opt.value);
      btn.textContent = selected.length ? `${selected.length} selecionado(s)` : placeholder;
    };

    const syncSelectFromChecks = () => {
      const checked = Array.from(list.querySelectorAll("input[type=checkbox]:checked")).map((i) => i.value);
      Array.from(selectEl.options).forEach((opt) => {
        opt.selected = checked.includes(opt.value);
      });
      selectEl.dispatchEvent(new Event("change"));
      updateButtonLabel();
    };

    btn.addEventListener("click", () => {
      pop.hidden = !pop.hidden;
      if (!pop.hidden) {
        renderList(search ? search.value : "");
        updateButtonLabel();
      }
    });

    document.addEventListener("click", (event) => {
      if (!mount.contains(event.target)) pop.hidden = true;
    });

    list.addEventListener("change", syncSelectFromChecks);

    if (search) {
      search.addEventListener("input", () => renderList(search.value));
    }

    mount.querySelector("[data-all]").addEventListener("click", () => {
      Array.from(selectEl.options).forEach((opt) => {
        opt.selected = true;
      });
      selectEl.dispatchEvent(new Event("change"));
      renderList(search ? search.value : "");
      updateButtonLabel();
    });

    mount.querySelector("[data-none]").addEventListener("click", () => {
      Array.from(selectEl.options).forEach((opt) => {
        opt.selected = false;
      });
      selectEl.dispatchEvent(new Event("change"));
      renderList(search ? search.value : "");
      updateButtonLabel();
    });

    selectEl.addEventListener("change", updateButtonLabel);
    selectEl.addEventListener("slicer:update", updateButtonLabel);
    updateButtonLabel();
  }

  function syncChips(filters) {
    if (!el.chipFilters) return;
    const chips = [];
    if (filters.grupo) chips.push({ type: "grupo", value: filters.grupo, label: `Grupo: ${filters.grupo}` });
    filters.anos.forEach((value) => chips.push({ type: "ano", value, label: `Ano: ${value}` }));
    filters.etapas.forEach((value) => chips.push({ type: "etapa", value, label: `Etapa: ${value}` }));
    filters.quesitos.forEach((value) => chips.push({ type: "quesito", value, label: `Quesito: ${value}` }));
    filters.quadrilhas.forEach((value) =>
      chips.push({ type: "quadrilha", value, label: `Quadrilha: ${value}` })
    );
    if (filters.normalizado) chips.push({ type: "normalizado", value: "1", label: "Normalizado" });

    el.chipFilters.innerHTML = chips
      .map(
        (chip) => `
        <span class="chip">
          ${escapeHtml(chip.label)}
          <button type="button" data-chip-type="${escapeHtml(chip.type)}" data-chip-value="${escapeHtml(
          chip.value
        )}">×</button>
        </span>
      `
      )
      .join("");

    const summaryParts = [];
    if (filters.grupo) summaryParts.push(filters.grupo);
    if (filters.anos.length) summaryParts.push(`${filters.anos.length} ano(s)`);
    if (filters.etapas.length) summaryParts.push(`${filters.etapas.length} etapa(s)`);
    if (filters.quesitos.length) summaryParts.push(`${filters.quesitos.length} quesito(s)`);
    if (filters.quadrilhas.length) summaryParts.push(`${filters.quadrilhas.length} quadrilha(s)`);
    if (filters.normalizado) summaryParts.push("Normalizado");
    if (el.filtersSummary) {
      el.filtersSummary.textContent = summaryParts.length ? summaryParts.join(" • ") : "Sem filtros aplicados";
    }
  }

  function createTable({ headers, rows, search, rowDataKey, rowClass }) {
    const searchInput = search ? `<input class="search-input" data-search placeholder="Buscar...">` : "";
    const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
    const body = rows
      .map((row) => {
        const rowKey = rowDataKey ? row[rowDataKey] : "";
        const dataAttr = rowDataKey ? ` data-row-key="${escapeHtml(rowKey)}"` : "";
        const classAttr = rowClass ? ` class="${rowClass}"` : "";
        const tds = headers
          .map((h) => {
            const value = row[h];
            if (value && typeof value === "object" && value.raw !== undefined) {
              return `<td>${value.raw}</td>`;
            }
            return `<td>${escapeHtml(value ?? "")}</td>`;
          })
          .join("");
        return `<tr${classAttr}${dataAttr}>${tds}</tr>`;
      })
      .join("");

    return `
      ${searchInput}
      <div class="table-wrap">
        <table>
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  }

  function attachTableSearch(container) {
    const input = container.querySelector("[data-search]");
    const rows = Array.from(container.querySelectorAll("tbody tr"));
    if (!input) return;
    input.addEventListener("input", () => {
      const term = input.value.toLowerCase();
      rows.forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
      });
    });
  }

  function buildSparkline(values) {
    const nums = values.filter((v) => Number.isFinite(v));
    if (!nums.length) return "";
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min || 1;
    const points = nums.map((val, idx) => {
      const x = (idx / Math.max(nums.length - 1, 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    });
    return `
      <svg class="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline fill="none" stroke="#d32f2f" stroke-width="3" points="${points.join(" ")}" />
      </svg>
    `;
  }

  function buildBar(value, max) {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max === 0) return "";
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return `<div class="bar"><span style="width:${pct.toFixed(1)}%"></span></div>`;
  }

  function standardDeviation(values) {
    const nums = values.filter((v) => Number.isFinite(v));
    if (!nums.length) return NaN;
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const variance = nums.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / nums.length;
    return Math.sqrt(variance);
  }

  function ensureDrawer() {
    let drawer = document.getElementById("powerbiDrawer");
    if (!drawer) {
      drawer = document.createElement("div");
      drawer.id = "powerbiDrawer";
      drawer.className = "drawer";
      drawer.innerHTML = `
        <div class="drawer-header">
          <h3 class="drawer-title">Detalhe</h3>
          <button class="btn btn-light" type="button" data-drawer-close>Fechar</button>
        </div>
        <div class="drawer-body"></div>
      `;
      document.body.appendChild(drawer);
      drawer.querySelector("[data-drawer-close]").addEventListener("click", () => {
        drawer.classList.remove("is-open");
      });
    }
    return drawer;
  }

  function openDrawer(title, content) {
    const drawer = ensureDrawer();
    const titleEl = drawer.querySelector(".drawer-title");
    const bodyEl = drawer.querySelector(".drawer-body");
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = content;
    drawer.classList.add("is-open");
  }

  function renderLoading(target) {
    if (!target) return;
    target.innerHTML = `
      <div class="skeleton-grid">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
      <div class="skeleton" style="height:220px"></div>
    `;
  }
  function renderTabs(role, filters) {
    const adminTabs = [
      { id: "VisaoGeral", label: "Visão Geral" },
      { id: "Evolucao", label: "Evolução" },
      { id: "Quesitos", label: "Quesitos" },
      { id: "Etapas", label: "Etapas" },
      { id: "Comparar", label: "Comparar" },
      { id: "Auditoria", label: "Auditoria" },
      { id: "DataPack", label: "Data Pack" },
    ];

    const presidenteTabs = [
      { id: "MinhaQuadrilha", label: "Minha Quadrilha (360)" },
      { id: "Etapas", label: "Etapas" },
    ];

    const tabs = role === "admin" ? adminTabs : presidenteTabs;
    el.tabs.innerHTML = tabs.map((tab) => `<button class="tab" data-tab="${tab.id}">${tab.label}</button>`).join("");
    const first = filters.activeTab || tabs[0].id;
    filters.activeTab = first;
    setActiveTab(role, first);

    el.tabs.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.activeTab = btn.dataset.tab;
        setActiveTab(role, btn.dataset.tab);
        renderActiveTab(role, filters);
      });
    });
  }

  function setActiveTab(role, tabId) {
    el.tabs.querySelectorAll(".tab").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tab === tabId);
    });

    if (role === "admin") {
      document.querySelectorAll("#viewAdmin .tab-view").forEach((view) => {
        view.hidden = view.id !== `tabAdmin-${tabId}`;
      });
    } else {
      document.querySelectorAll("#viewPresidente .tab-view").forEach((view) => {
        view.hidden = view.id !== `tabPresidente-${tabId}`;
      });
    }
  }

  function renderActiveTab(role, filters) {
    if (role === "admin") {
      renderTabAdmin(filters);
    } else {
      renderTabPresidente(filters);
    }
  }

  function renderTabAdmin(filters) {
    const active = filters.activeTab;
    if (active === "VisaoGeral") return renderAdminVisaoGeral(filters);
    if (active === "Evolucao") return renderAdminEvolucao(filters);
    if (active === "Quesitos") return renderAdminQuesitos(filters);
    if (active === "Etapas") return renderAdminEtapas(filters);
    if (active === "Comparar") return renderAdminComparar(filters);
    if (active === "Auditoria") return renderAdminAuditoria(filters);
    if (active === "DataPack") return renderAdminDataPack();
  }

  function renderTabPresidente(filters) {
    const active = filters.activeTab;
    if (active === "MinhaQuadrilha") return renderMinhaQuadrilha360(filters);
    if (active === "Etapas") return renderEtapasDetalhado(filters);
  }

  function renderAdminVisaoGeral(filters) {
    const target = document.getElementById("tabAdmin-VisaoGeral");
    renderLoading(target);

    const { finals, totals, max, avg, std } = DataStore.computeKPIs(filters);
    const quadrilhasCount = unique(finals.map((row) => row.Quadrilha)).length;
    const etapasCount = unique(DataStore.getCleanEtapaTotals(filters).map((row) => row.Etapa)).length;
    const leader = finals.slice().sort((a, b) => b.TotalFinal - a.TotalFinal)[0];
    const gapTop = finals.length >= 5
      ? finals.slice().sort((a, b) => b.TotalFinal - a.TotalFinal)[0].TotalFinal -
        finals.slice().sort((a, b) => b.TotalFinal - a.TotalFinal)[4].TotalFinal
      : NaN;

    const displayAvg = metricLabel(avg, max, filters.normalizado);
    const displayMax = metricLabel(max, max, filters.normalizado);

    const rankingRows = finals
      .slice()
      .sort((a, b) => b.TotalFinal - a.TotalFinal)
      .map((row, idx) => ({
        Pos: idx + 1,
        Quadrilha: row.Quadrilha,
        "Total Final": metricLabel(row.TotalFinal, max, filters.normalizado),
        "% do Melhor": formatPercent((row.TotalFinal / (max || 1)) * 100),
        Etapas: row.EtapasParticipadas,
      }));

    target.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card"><h4>Quadrilhas</h4><strong>${formatNumber(quadrilhasCount, 0)}</strong></div>
        <div class="kpi-card"><h4>Etapas</h4><strong>${formatNumber(etapasCount, 0)}</strong></div>
        <div class="kpi-card"><h4>Média de totais</h4><strong>${displayAvg}</strong></div>
        <div class="kpi-card"><h4>Desvio padrão</h4><strong>${formatNumber(std)}</strong></div>
        <div class="kpi-card"><h4>Gap Top1-Top5</h4><strong>${formatNumber(gapTop)}</strong></div>
      </div>
      <div class="card">
        <h3 class="card-title">Ranking Geral</h3>
        ${createTable({
          headers: ["Pos", "Quadrilha", "Total Final", "% do Melhor", "Etapas"],
          rows: rankingRows,
          search: true,
          rowDataKey: "Quadrilha",
          rowClass: "is-clickable",
        })}
      </div>
      <div class="card">
        <h3 class="card-title">Insights rápidos</h3>
        <p class="muted">Líder atual: <strong>${leader ? escapeHtml(leader.Quadrilha) : "—"}</strong>. Total máximo: ${displayMax}.</p>
      </div>
    `;
    attachTableSearch(target);
    target.querySelectorAll("tbody tr[data-row-key]").forEach((row) => {
      row.addEventListener("click", () => {
        const quadrilha = row.getAttribute("data-row-key");
        renderQuadrilhaDrill(quadrilha, filters);
      });
    });
  }

  function renderAdminEvolucao(filters) {
    const target = document.getElementById("tabAdmin-Evolucao");
    renderLoading(target);

    const finals = DataStore.getCleanFinalTotals(filters);
    const byYear = finals.reduce((acc, row) => {
      acc[row.Ano] = acc[row.Ano] || [];
      acc[row.Ano].push(row.TotalFinal);
      return acc;
    }, {});

    const rows = Object.keys(byYear)
      .sort()
      .map((ano) => {
        const totals = byYear[ano];
        const avg = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : NaN;
        const max = totals.length ? Math.max(...totals) : NaN;
        return { Ano: ano, Media: avg, Maximo: max };
      });

    const maxMedia = rows.length ? Math.max(...rows.map((row) => row.Media)) : NaN;
    const maxMaximo = rows.length ? Math.max(...rows.map((row) => row.Maximo)) : NaN;
    const sparkValues = filters.normalizado
      ? rows.map((row) => metricValue(row.Media, maxMedia, true))
      : rows.map((row) => row.Media);

    target.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card"><h4>Série histórica</h4>${buildSparkline(sparkValues)}</div>
      </div>
      ${createTable({
        headers: ["Ano", "Média", "Máximo"],
        rows: rows.map((row) => ({
          Ano: row.Ano,
          "Média": metricLabel(row.Media, maxMedia, filters.normalizado),
          "Máximo": metricLabel(row.Maximo, maxMaximo, filters.normalizado),
        })),
        search: false,
      })}
    `;
  }

  function renderAdminQuesitos(filters) {
    const target = document.getElementById("tabAdmin-Quesitos");
    renderLoading(target);

    const quesitos = DataStore.getCleanQuesitoRows(filters);
    const grouped = quesitos.reduce((acc, row) => {
      acc[row.Quesito] = acc[row.Quesito] || [];
      acc[row.Quesito].push(parseLocaleNumber(row.NotaQuesitoEtapa));
      return acc;
    }, {});

    const rows = Object.keys(grouped)
      .map((key) => {
        const values = grouped[key].filter(Number.isFinite);
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
        return { Quesito: key, Media: avg };
      })
      .sort((a, b) => b.Media - a.Media);

    const max = rows.length ? Math.max(...rows.map((row) => row.Media)) : NaN;
    const tableRows = rows.map((row) => {
      const value = metricValue(row.Media, max, filters.normalizado);
      const barMax = filters.normalizado ? 100 : max;
      return {
        Quesito: row.Quesito,
        "Média": { raw: `${metricLabel(row.Media, max, filters.normalizado)} ${buildBar(value, barMax)}` },
      };
    });

    target.innerHTML = createTable({ headers: ["Quesito", "Média"], rows: tableRows, search: true });
    attachTableSearch(target);
  }

  function renderAdminEtapas(filters) {
    const target = document.getElementById("tabAdmin-Etapas");
    renderLoading(target);

    const etapas = DataStore.getCleanEtapaTotals(filters);
    const grouped = etapas.reduce((acc, row) => {
      acc[row.Etapa] = acc[row.Etapa] || [];
      acc[row.Etapa].push(parseLocaleNumber(row.TotalEtapa));
      return acc;
    }, {});

    const rows = Object.keys(grouped).map((key) => {
      const values = grouped[key].filter(Number.isFinite);
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
      return { Etapa: key, Media: avg };
    });

    const max = rows.length ? Math.max(...rows.map((row) => row.Media)) : NaN;
    target.innerHTML = createTable({
      headers: ["Etapa", "Média"],
      rows: rows.map((row) => ({
        Etapa: row.Etapa,
        "Média": metricLabel(row.Media, max, filters.normalizado),
      })),
      search: false,
    });
  }
  function renderAdminComparar(filters) {
    const target = document.getElementById("tabAdmin-Comparar");
    renderLoading(target);

    const finals = DataStore.getCleanFinalTotals(filters);
    const quadrilhas = unique(finals.map((row) => row.Quadrilha));
    const a = filters.compareA || quadrilhas[0] || "";
    const b = filters.compareB || quadrilhas[1] || "";
    filters.compareA = a;
    filters.compareB = b;

    const finalA = finals.filter((row) => row.Quadrilha === a);
    const finalB = finals.filter((row) => row.Quadrilha === b);

    const byYear = (rows) =>
      rows.reduce((acc, row) => {
        acc[row.Ano] = acc[row.Ano] || [];
        acc[row.Ano].push(row.TotalFinal);
        return acc;
      }, {});

    const seriesA = byYear(finalA);
    const seriesB = byYear(finalB);
    const years = unique([...Object.keys(seriesA), ...Object.keys(seriesB)]).sort();
    const lineA = years.map((year) => {
      const values = seriesA[year] || [];
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
    });
    const lineB = years.map((year) => {
      const values = seriesB[year] || [];
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
    });

    const maxLine = Math.max(...lineA.filter(Number.isFinite), ...lineB.filter(Number.isFinite), 0);
    const sparkA = buildSparkline(filters.normalizado ? lineA.map((v) => metricValue(v, maxLine, true)) : lineA);
    const sparkB = buildSparkline(filters.normalizado ? lineB.map((v) => metricValue(v, maxLine, true)) : lineB);

    const quesitos = DataStore.getCleanQuesitoRows(filters);
    const calcAvg = (rows) => {
      const grouped = rows.reduce((acc, row) => {
        acc[row.Quesito] = acc[row.Quesito] || [];
        acc[row.Quesito].push(parseLocaleNumber(row.NotaQuesitoEtapa));
        return acc;
      }, {});
      return Object.keys(grouped).map((key) => {
        const values = grouped[key].filter(Number.isFinite);
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
        return { Quesito: key, Media: avg };
      });
    };

    const avgA = calcAvg(quesitos.filter((row) => row.Quadrilha === a));
    const avgB = calcAvg(quesitos.filter((row) => row.Quadrilha === b));
    const quesitoKeys = unique([...avgA.map((r) => r.Quesito), ...avgB.map((r) => r.Quesito)]).sort();

    const deltaQuesito = quesitoKeys.map((key) => {
      const aRow = avgA.find((r) => r.Quesito === key);
      const bRow = avgB.find((r) => r.Quesito === key);
      const aVal = aRow ? aRow.Media : NaN;
      const bVal = bRow ? bRow.Media : NaN;
      const delta = Number.isFinite(aVal) && Number.isFinite(bVal) ? aVal - bVal : NaN;
      return {
        Quesito: key,
        [a || "A"]: formatNumber(aVal),
        [b || "B"]: formatNumber(bVal),
        Delta: formatNumber(delta),
      };
    });

    const etapas = DataStore.getCleanEtapaTotals(filters);
    const etapasA = etapas.filter((row) => row.Quadrilha === a);
    const etapasB = etapas.filter((row) => row.Quadrilha === b);
    const etapaKeys = unique([...etapasA.map((r) => r.Etapa), ...etapasB.map((r) => r.Etapa)]).sort();

    const deltaEtapa = etapaKeys.map((key) => {
      const aRows = etapasA.filter((r) => r.Etapa === key).map((r) => r.TotalEtapa);
      const bRows = etapasB.filter((r) => r.Etapa === key).map((r) => r.TotalEtapa);
      const aVal = aRows.length ? aRows.reduce((x, y) => x + y, 0) / aRows.length : NaN;
      const bVal = bRows.length ? bRows.reduce((x, y) => x + y, 0) / bRows.length : NaN;
      const delta = Number.isFinite(aVal) && Number.isFinite(bVal) ? aVal - bVal : NaN;
      return {
        Etapa: key,
        [a || "A"]: formatNumber(aVal),
        [b || "B"]: formatNumber(bVal),
        Delta: formatNumber(delta),
      };
    });

    target.innerHTML = `
      <div class="compare-controls">
        <div class="filter-group">
          <label>Quadrilha A</label>
          <select id="compareA">
            ${quadrilhas.map((q) => `<option value="${escapeHtml(q)}" ${q === a ? "selected" : ""}>${escapeHtml(q)}</option>`).join("")}
          </select>
        </div>
        <div class="filter-group">
          <label>Quadrilha B</label>
          <select id="compareB">
            ${quadrilhas.map((q) => `<option value="${escapeHtml(q)}" ${q === b ? "selected" : ""}>${escapeHtml(q)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card"><h4>${escapeHtml(a || "Quadrilha A")}</h4>${sparkA}</div>
        <div class="kpi-card"><h4>${escapeHtml(b || "Quadrilha B")}</h4>${sparkB}</div>
      </div>
      <div class="card">
        <h3 class="card-title">Delta por quesito</h3>
        ${createTable({ headers: ["Quesito", a || "A", b || "B", "Delta"], rows: deltaQuesito, search: true })}
      </div>
      <div class="card">
        <h3 class="card-title">Delta por etapa</h3>
        ${createTable({ headers: ["Etapa", a || "A", b || "B", "Delta"], rows: deltaEtapa, search: false })}
      </div>
    `;

    const selectA = target.querySelector("#compareA");
    const selectB = target.querySelector("#compareB");
    if (selectA) {
      selectA.addEventListener("change", () => {
        filters.compareA = selectA.value;
        renderAdminComparar(filters);
      });
    }
    if (selectB) {
      selectB.addEventListener("change", () => {
        filters.compareB = selectB.value;
        renderAdminComparar(filters);
      });
    }
  }

  function renderAdminAuditoria(filters) {
    const target = document.getElementById("tabAdmin-Auditoria");
    renderLoading(target);

    const invalids = DataStore.getInvalidPresentations(filters);
    const rows = invalids.map((row) => ({
      Ano: row.Ano,
      Grupo: row.Grupo,
      Etapa: row.Etapa,
      Quadrilha: row.Quadrilha,
      minNota: formatNumber(row.minNota),
      invalidCount: row.invalidCount,
      quesitosInvalidos: Array.from(row.quesitosInvalidos).join(", ") || "—",
    }));

    const byEtapa = invalids.reduce((acc, row) => {
      acc[row.Etapa] = (acc[row.Etapa] || 0) + 1;
      return acc;
    }, {});

    const topEtapas = Object.keys(byEtapa)
      .sort((a, b) => byEtapa[b] - byEtapa[a])
      .slice(0, 5)
      .map((key) => ({ Etapa: key, Invalidas: byEtapa[key] }));

    target.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card"><h4>Apresentações inválidas</h4><strong>${formatNumber(invalids.length, 0)}</strong></div>
        <div class="kpi-card"><h4>Etapas problemáticas</h4><strong>${formatNumber(topEtapas.length, 0)}</strong></div>
        <div class="kpi-card"><h4>Última atualização</h4><strong>${formatNumber(new Date().getHours(), 0)}h</strong></div>
      </div>
      <div class="card">
        <div class="tab-head">
          <h3 class="card-title">Apresentações inválidas</h3>
          <button class="btn btn-outline" id="exportAuditoria" type="button">Exportar CSV</button>
        </div>
        ${createTable({
          headers: ["Ano", "Grupo", "Etapa", "Quadrilha", "minNota", "invalidCount", "quesitosInvalidos"],
          rows,
          search: true,
        })}
      </div>
      <div class="card">
        <h3 class="card-title">Top etapas problemáticas</h3>
        ${createTable({ headers: ["Etapa", "Invalidas"], rows: topEtapas, search: false })}
      </div>
    `;
    attachTableSearch(target);

    const exportBtn = target.querySelector("#exportAuditoria");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        exportCSV(rows, "auditoria_invalidas.csv");
      });
    }
  }
  function renderAdminDataPack() {
    const target = document.getElementById("tabAdmin-DataPack");
    renderLoading(target);

    target.innerHTML = `
      <details class="card" open>
        <summary class="card-title">Downloads</summary>
        <div class="data-pack-actions">
          <a class="btn btn-primary" href="${FILES.zip}" id="downloadZip" download>Baixar pacote (zip)</a>
          <a class="btn btn-light" href="${FILES.theme}" download>Baixar tema (json)</a>
          <a class="btn btn-light" href="${FILES.measures}" download>Baixar medidas (txt)</a>
          <button class="btn btn-outline" id="copyMeasures" type="button">Copiar medidas DAX</button>
        </div>
        <div id="dataPackStatus" class="data-pack-grid"></div>
      </details>
      <details class="card">
        <summary class="card-title">Previews técnicos</summary>
        <div>
          <h4>Preview fact_final.csv</h4>
          <div id="previewFinal"></div>
        </div>
        <div style="margin-top:1rem;">
          <h4>Preview fact_quesito_etapa.csv</h4>
          <div id="previewQuesito"></div>
        </div>
      </details>
      <details class="card">
        <summary class="card-title">Como importar no Power BI</summary>
        <ol>
          <li>Importe os CSVs da pasta <code>/assets/power-bi/</code>.</li>
          <li>Defina tipos de dados (Ano como inteiro, notas como decimal).</li>
          <li>Crie relacionamentos entre dimensões e fatos.</li>
          <li>Importe o tema e cole as medidas.</li>
        </ol>
        <h4>Relacionamentos</h4>
        <ul>
          <li>dim_ano[Ano] -&gt; fact_final[Ano]</li>
          <li>dim_grupo[Grupo] -&gt; fact_final[Grupo]</li>
          <li>dim_quadrilha[Quadrilha] -&gt; fact_final[Quadrilha]</li>
          <li>dim_etapa[Etapa] -&gt; fact_etapa[Etapa]</li>
          <li>dim_quesito[Quesito] -&gt; fact_quesito_etapa[Quesito]</li>
          <li>dim_ano[Ano] -&gt; fact_etapa[Ano]</li>
          <li>dim_grupo[Grupo] -&gt; fact_etapa[Grupo]</li>
          <li>dim_quadrilha[Quadrilha] -&gt; fact_etapa[Quadrilha]</li>
          <li>dim_ano[Ano] -&gt; fact_quesito_etapa[Ano]</li>
          <li>dim_grupo[Grupo] -&gt; fact_quesito_etapa[Grupo]</li>
          <li>dim_quadrilha[Quadrilha] -&gt; fact_quesito_etapa[Quadrilha]</li>
          <li>dim_etapa[Etapa] -&gt; fact_quesito_etapa[Etapa]</li>
        </ul>
      </details>
      <div class="card">
        <h3 class="card-title">Checklist</h3>
        <div class="checklist">
          <label><input type="checkbox" data-checklist="modelo"> Modelo importado</label>
          <label><input type="checkbox" data-checklist="relacionamentos"> Relacionamentos conferidos</label>
          <label><input type="checkbox" data-checklist="tema"> Tema aplicado</label>
          <label><input type="checkbox" data-checklist="medidas"> Medidas DAX coladas</label>
        </div>
      </div>
    `;

    const downloadZip = document.getElementById("downloadZip");
    if (downloadZip) {
      checkFileExists(FILES.zip).then((exists) => {
        downloadZip.style.display = exists ? "inline-flex" : "none";
      });
    }

    const statusContainer = document.getElementById("dataPackStatus");
    if (statusContainer) {
      const files = [
        "fact_final",
        "fact_etapa",
        "fact_quesito_etapa",
        "dim_ano",
        "dim_grupo",
        "dim_etapa",
        "dim_quesito",
        "dim_quadrilha",
        "theme",
        "measures",
        "readme",
      ];

      Promise.allSettled(files.map((key) => fetchText(FILES[key]))).then((results) => {
        statusContainer.innerHTML = results
          .map((result, idx) => {
            const ok = result.status === "fulfilled";
            return `
              <div class="status-card">
                <strong>${escapeHtml(files[idx])}</strong>
                <div class="badge ${ok ? "ok" : "error"}">${ok ? "OK" : "ERRO"}</div>
              </div>
            `;
          })
          .join("");
      });
    }

    const previewFinal = document.getElementById("previewFinal");
    const previewQuesito = document.getElementById("previewQuesito");
    if (previewFinal) {
      const rows = DataStore.getCleanFinalTotals({ grupo: "", anos: [], etapas: [], quesitos: [], quadrilhas: [] })
        .slice(0, 20)
        .map((row) => ({
          Ano: row.Ano,
          Grupo: row.Grupo,
          Quadrilha: row.Quadrilha,
          TotalFinal: formatNumber(row.TotalFinal),
          Etapas: row.EtapasParticipadas,
        }));
      previewFinal.innerHTML = createTable({
        headers: ["Ano", "Grupo", "Quadrilha", "TotalFinal", "Etapas"],
        rows,
        search: false,
      });
    }

    if (previewQuesito) {
      const rows = DataStore.getCleanQuesitoRows({ grupo: "", anos: [], etapas: [], quesitos: [], quadrilhas: [] })
        .slice(0, 20)
        .map((row) => ({
          Ano: row.Ano,
          Grupo: row.Grupo,
          Quadrilha: row.Quadrilha,
          Etapa: row.Etapa,
          Quesito: row.Quesito,
          NotaQuesitoEtapa: formatNumber(row.NotaQuesitoEtapa),
        }));
      previewQuesito.innerHTML = createTable({
        headers: ["Ano", "Grupo", "Quadrilha", "Etapa", "Quesito", "NotaQuesitoEtapa"],
        rows,
        search: false,
      });
    }

    const copyBtn = document.getElementById("copyMeasures");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          const text = await fetchText(FILES.measures);
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = "Medidas copiadas";
          setTimeout(() => (copyBtn.textContent = "Copiar medidas DAX"), 2000);
        } catch (err) {
          alert("Não foi possível copiar as medidas.");
        }
      });
    }

    const checklistInputs = document.querySelectorAll("[data-checklist]");
    checklistInputs.forEach((input) => {
      const key = `powerbi_check_${input.dataset.checklist}`;
      input.checked = localStorage.getItem(key) === "true";
      input.addEventListener("change", () => {
        localStorage.setItem(key, input.checked ? "true" : "false");
      });
    });
  }

  function renderQuadrilhaDrill(quadrilha, filters) {
    if (!quadrilha) return;
    const localFilters = { ...filters, quadrilhas: [quadrilha] };
    const finals = DataStore.getCleanFinalTotals(localFilters);
    const totals = finals.map((row) => row.TotalFinal).filter(Number.isFinite);
    const max = totals.length ? Math.max(...totals) : NaN;
    const avg = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : NaN;
    const rank = finals
      .slice()
      .sort((a, b) => b.TotalFinal - a.TotalFinal)
      .findIndex((row) => row.Quadrilha === quadrilha) + 1;

    const etapas = DataStore.getCleanEtapaTotals(localFilters);
    const etapaRows = etapas.map((row) => ({
      Etapa: row.Etapa,
      Total: metricLabel(row.TotalEtapa, max, filters.normalizado),
    }));

    const quesitos = DataStore.getCleanQuesitoRows(localFilters);
    const grouped = quesitos.reduce((acc, row) => {
      acc[row.Quesito] = acc[row.Quesito] || [];
      acc[row.Quesito].push(parseLocaleNumber(row.NotaQuesitoEtapa));
      return acc;
    }, {});
    const quesitoRows = Object.keys(grouped).map((key) => {
      const values = grouped[key].filter(Number.isFinite);
      const avgQ = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
      return { Quesito: key, Media: avgQ };
    });
    const maxQ = quesitoRows.length ? Math.max(...quesitoRows.map((q) => q.Media)) : NaN;
    const topQ = quesitoRows.slice().sort((a, b) => b.Media - a.Media).slice(0, 3);
    const bottomQ = quesitoRows.slice().sort((a, b) => a.Media - b.Media).slice(0, 3);

    const content = `
      <div class="kpi-grid">
        <div class="kpi-card"><h4>Total final</h4><strong>${metricLabel(avg, max, filters.normalizado)}</strong></div>
        <div class="kpi-card"><h4>% do líder</h4><strong>${formatPercent((avg / (max || 1)) * 100)}</strong></div>
        <div class="kpi-card"><h4>Rank limpo</h4><strong>${rank || "—"}</strong></div>
        <div class="kpi-card"><h4>Consistência</h4><strong>${formatNumber(standardDeviation(etapas.map((r) => r.TotalEtapa)))}</strong></div>
      </div>
      <div class="card">
        <h3 class="card-title">Top 3 Quesitos</h3>
        <ul>${topQ.map((q) => `<li>${escapeHtml(q.Quesito)}: ${metricLabel(q.Media, maxQ, filters.normalizado)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3 class="card-title">Bottom 3 Quesitos</h3>
        <ul>${bottomQ.map((q) => `<li>${escapeHtml(q.Quesito)}: ${metricLabel(q.Media, maxQ, filters.normalizado)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3 class="card-title">Etapas</h3>
        ${createTable({ headers: ["Etapa", "Total"], rows: etapaRows, search: false })}
      </div>
    `;

    openDrawer(quadrilha, content);
  }

  function renderMinhaQuadrilha360(filters) {
    const target = document.getElementById("tabPresidente-MinhaQuadrilha");
    renderLoading(target);

    const finals = DataStore.getCleanFinalTotals(filters);
    const totals = finals.map((row) => row.TotalFinal).filter(Number.isFinite);
    const max = totals.length ? Math.max(...totals) : NaN;
    const avg = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : NaN;
    const etapas = DataStore.getCleanEtapaTotals(filters);

    const byYear = finals.reduce((acc, row) => {
      acc[row.Ano] = acc[row.Ano] || [];
      acc[row.Ano].push(row.TotalFinal);
      return acc;
    }, {});
    const years = Object.keys(byYear)
      .sort()
      .map((ano) => {
        const values = byYear[ano];
        const avgYear = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
        return { Ano: ano, Media: avgYear };
      });
    const maxYear = years.length ? Math.max(...years.map((row) => row.Media)) : NaN;
    const sparkValues = filters.normalizado
      ? years.map((row) => metricValue(row.Media, maxYear, true))
      : years.map((row) => row.Media);

    const quesitos = DataStore.getCleanQuesitoRows(filters);
    const grouped = quesitos.reduce((acc, row) => {
      acc[row.Quesito] = acc[row.Quesito] || [];
      acc[row.Quesito].push(parseLocaleNumber(row.NotaQuesitoEtapa));
      return acc;
    }, {});
    const quesitoRows = Object.keys(grouped).map((key) => {
      const values = grouped[key].filter(Number.isFinite);
      const avgQ = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
      return { Quesito: key, Media: avgQ };
    });
    const maxQ = quesitoRows.length ? Math.max(...quesitoRows.map((q) => q.Media)) : NaN;
    const topQ = quesitoRows.slice().sort((a, b) => b.Media - a.Media).slice(0, 3);
    const bottomQ = quesitoRows.slice().sort((a, b) => a.Media - b.Media).slice(0, 3);

    target.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card"><h4>Total final</h4><strong>${metricLabel(avg, max, filters.normalizado)}</strong></div>
        <div class="kpi-card"><h4>Etapas participadas</h4><strong>${formatNumber(etapas.length, 0)}</strong></div>
        <div class="kpi-card"><h4>Consistência</h4><strong>${formatNumber(standardDeviation(etapas.map((r) => r.TotalEtapa)))}</strong></div>
      </div>
      <div class="card">
        <h3 class="card-title">Evolução 2022–2025</h3>
        ${buildSparkline(sparkValues)}
      </div>
      <div class="card">
        <h3 class="card-title">Top Quesitos</h3>
        <ul>${topQ.map((q) => `<li>${escapeHtml(q.Quesito)}: ${metricLabel(q.Media, maxQ, filters.normalizado)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3 class="card-title">Quesitos com atenção</h3>
        <ul>${bottomQ.map((q) => `<li>${escapeHtml(q.Quesito)}: ${metricLabel(q.Media, maxQ, filters.normalizado)}</li>`).join("")}</ul>
      </div>
    `;
  }

  function renderEtapasDetalhado(filters) {
    const target = document.getElementById("tabPresidente-Etapas");
    renderLoading(target);

    const etapas = DataStore.getCleanEtapaTotals(filters);
    const etapasUnicas = unique(etapas.map((row) => row.Etapa));
    const etapaSelect = etapasUnicas.map((etapa) => `<option value="${escapeHtml(etapa)}">${escapeHtml(etapa)}</option>`).join("");

    target.innerHTML = `
      <div class="filter-group">
        <label>Etapa</label>
        <select id="presidenteEtapa">${etapaSelect}</select>
      </div>
      <div id="presidenteEtapaDetalhe"></div>
    `;

    const select = document.getElementById("presidenteEtapa");
    const detail = document.getElementById("presidenteEtapaDetalhe");

    const renderDetail = () => {
      const etapa = select.value;
      const totals = etapas.filter((row) => row.Etapa === etapa);
      const totalEtapa = totals.length
        ? totals.reduce((a, b) => a + b.TotalEtapa, 0) / totals.length
        : NaN;

      const quesitos = DataStore.getCleanQuesitoRows({ ...filters, etapas: [etapa] });
      const grouped = quesitos.reduce((acc, row) => {
        acc[row.Quesito] = acc[row.Quesito] || [];
        acc[row.Quesito].push(parseLocaleNumber(row.NotaQuesitoEtapa));
        return acc;
      }, {});
      const rows = Object.keys(grouped).map((key) => {
        const values = grouped[key].filter(Number.isFinite);
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
        return { Quesito: key, Nota: avg };
      });

      const groupAvg = DataStore.getCleanQuesitoRows({
        grupo: filters.grupo,
        anos: filters.anos,
        etapas: [etapa],
        quesitos: filters.quesitos,
        quadrilhas: [],
      });
      const groupedAvg = groupAvg.reduce((acc, row) => {
        acc[row.Quesito] = acc[row.Quesito] || [];
        acc[row.Quesito].push(parseLocaleNumber(row.NotaQuesitoEtapa));
        return acc;
      }, {});

      const finalRows = rows.map((row) => {
        const avgGroupVals = groupedAvg[row.Quesito] || [];
        const avgGroup = avgGroupVals.length
          ? avgGroupVals.reduce((a, b) => a + b, 0) / avgGroupVals.length
          : NaN;
        return {
          Quesito: row.Quesito,
          "Minha nota": formatNumber(row.Nota),
          "Média do grupo": formatNumber(avgGroup),
        };
      });

      const invalidPresentations = DataStore.getInvalidPresentations(filters).filter((r) => r.Etapa === etapa);
      const invalidMsg = invalidPresentations.length
        ? `<div class="alert warning">Sem nota válida — apresentação desconsiderada nos cálculos.</div>`
        : "";

      detail.innerHTML = `
        <div class="card">
          <h3 class="card-title">Total da etapa</h3>
          <strong>${formatNumber(totalEtapa)}</strong>
          ${invalidMsg}
        </div>
        <div class="card">
          <h3 class="card-title">Quesitos da etapa</h3>
          ${createTable({ headers: ["Quesito", "Minha nota", "Média do grupo"], rows: finalRows, search: false })}
        </div>
      `;
    };

    select.addEventListener("change", renderDetail);
    renderDetail();
  }

  function exportCSV(rows, filename = "dados_export.csv") {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(";")].concat(
      rows.map((row) => headers.map((h) => String(row[h] ?? "")).join(";"))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyFiltersFromUI(filters, role, user) {
    filters.grupo = el.filterGrupo?.value || "";
    filters.anos = readMulti(el.filterAno);
    filters.etapas = readMulti(el.filterEtapa);
    filters.quesitos = readMulti(el.filterQuesito);
    filters.quadrilhas = readMulti(el.filterQuadrilha);
    filters.normalizado = el.toggleNormalizado?.checked || false;

    if (role === "presidente" && user.quadrilha) {
      filters.quadrilhas = [user.quadrilha];
    }

    syncChips(filters);
  }

  async function checkFileExists(path) {
    try {
      const res = await fetch(path, { method: "HEAD" });
      return res.ok;
    } catch (err) {
      return false;
    }
  }

  function resolveQuadrilhaName(userQuadrilha, allQuadrilhas) {
    if (!userQuadrilha) return "";
    const userNorm = normalizeText(userQuadrilha);
    const exact = allQuadrilhas.find((q) => normalizeText(q) === userNorm);
    if (exact) return exact;
    const partial = allQuadrilhas.find((q) => normalizeText(q).includes(userNorm));
    return partial || userQuadrilha;
  }

  async function init() {
    const user = getPortalUser();
    const role = user.role || "admin";

    if (el.role) {
      el.role.textContent = role === "admin" ? "Perfil: Administrador" : "Perfil: Presidente";
    }

    if (role === "admin") {
      el.viewAdmin.hidden = false;
      el.viewPresidente.hidden = true;
      document.querySelectorAll(".admin-only").forEach((node) => (node.style.display = "block"));
    } else {
      el.viewAdmin.hidden = true;
      el.viewPresidente.hidden = false;
      document.querySelectorAll(".admin-only").forEach((node) => (node.style.display = "none"));
    }

    try {
      await DataStore.loadAllCSVsOnce();
    } catch (err) {
      alert("Falha ao carregar os dados. Se estiver em file://, use o Live Server.");
      return;
    }

    const filters = buildFilterState(user);
    const baseData = {
      final: DataStore.getCleanFinalTotals({ grupo: "", anos: [], etapas: [], quesitos: [], quadrilhas: [] }),
      etapa: DataStore.getCleanEtapaTotals({ grupo: "", anos: [], etapas: [], quesitos: [], quadrilhas: [] }),
      quesito: DataStore.getCleanQuesitoRows({ grupo: "", anos: [], etapas: [], quesitos: [], quadrilhas: [] }),
    };

    if (role === "presidente" && user.quadrilha) {
      const allQuadrilhas = unique(baseData.final.map((row) => row.Quadrilha));
      user.quadrilha = resolveQuadrilhaName(user.quadrilha, allQuadrilhas);
      filters.quadrilhas = [user.quadrilha];
    }

    populateFilterOptions(baseData, filters);

    createSlicer({ mountId: "slicerAno", selectEl: el.filterAno, placeholder: "Todos os anos" });
    createSlicer({ mountId: "slicerEtapa", selectEl: el.filterEtapa, placeholder: "Todas as etapas" });
    createSlicer({ mountId: "slicerQuesito", selectEl: el.filterQuesito, placeholder: "Todos os quesitos" });
    if (role === "admin") {
      createSlicer({ mountId: "slicerQuadrilha", selectEl: el.filterQuadrilha, placeholder: "Todas as quadrilhas" });
    }

    if (role === "presidente" && user.quadrilha) {
      el.filterQuadrilha?.setAttribute("disabled", "disabled");
      if (el.filterQuadrilha) {
        Array.from(el.filterQuadrilha.options).forEach((opt) => {
          opt.selected = opt.value === user.quadrilha;
        });
      }
    }

    renderTabs(role, filters);
    syncChips(filters);
    renderActiveTab(role, filters);

    const onFiltersChange = () => {
      applyFiltersFromUI(filters, role, user);
      renderActiveTab(role, filters);
    };

    [
      el.filterGrupo,
      el.filterAno,
      el.filterEtapa,
      el.filterQuesito,
      el.filterQuadrilha,
      el.toggleNormalizado,
    ].forEach((input) => {
      if (!input) return;
      input.addEventListener("change", onFiltersChange);
    });

    if (el.toggleAdvanced && el.filtersAdvanced) {
      el.toggleAdvanced.addEventListener("click", () => {
        const isHidden = el.filtersAdvanced.hasAttribute("hidden");
        if (isHidden) {
          el.filtersAdvanced.removeAttribute("hidden");
        } else {
          el.filtersAdvanced.setAttribute("hidden", "");
        }
      });
    }

    if (el.resetFilters) {
      el.resetFilters.addEventListener("click", () => {
        el.filterGrupo.value = "";
        el.filterAno.selectedIndex = -1;
        el.filterEtapa.selectedIndex = -1;
        el.filterQuesito.selectedIndex = -1;
        if (role === "admin") {
          el.filterQuadrilha.selectedIndex = -1;
        }
        if (el.toggleNormalizado) el.toggleNormalizado.checked = false;
        onFiltersChange();
        [el.filterAno, el.filterEtapa, el.filterQuesito, el.filterQuadrilha].forEach((input) => {
          if (input) input.dispatchEvent(new Event("slicer:update"));
        });
      });
    }

    if (el.clearChips) {
      el.clearChips.addEventListener("click", () => {
        el.resetFilters?.click();
      });
    }

    if (el.chipFilters) {
      el.chipFilters.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-chip-type]");
        if (!button) return;
        const type = button.dataset.chipType;
        const value = button.dataset.chipValue;
        const refreshSlicer = (selectEl) => {
          if (selectEl) selectEl.dispatchEvent(new Event("slicer:update"));
        };
        if (type === "grupo") {
          el.filterGrupo.value = "";
        } else if (type === "ano") {
          Array.from(el.filterAno.options).forEach((opt) => {
            if (opt.value === value) opt.selected = false;
          });
          refreshSlicer(el.filterAno);
        } else if (type === "etapa") {
          Array.from(el.filterEtapa.options).forEach((opt) => {
            if (opt.value === value) opt.selected = false;
          });
          refreshSlicer(el.filterEtapa);
        } else if (type === "quesito") {
          Array.from(el.filterQuesito.options).forEach((opt) => {
            if (opt.value === value) opt.selected = false;
          });
          refreshSlicer(el.filterQuesito);
        } else if (type === "quadrilha" && role === "admin") {
          Array.from(el.filterQuadrilha.options).forEach((opt) => {
            if (opt.value === value) opt.selected = false;
          });
          refreshSlicer(el.filterQuadrilha);
        } else if (type === "normalizado") {
          if (el.toggleNormalizado) el.toggleNormalizado.checked = false;
        }
        onFiltersChange();
      });
    }

    if (el.exportCsv) {
      el.exportCsv.addEventListener("click", () => {
        let rows = [];
        if (role === "admin") {
          if (filters.activeTab === "Auditoria") {
            rows = DataStore.getInvalidPresentations(filters).map((row) => ({
              Ano: row.Ano,
              Grupo: row.Grupo,
              Etapa: row.Etapa,
              Quadrilha: row.Quadrilha,
              minNota: row.minNota,
              invalidCount: row.invalidCount,
              quesitosInvalidos: Array.from(row.quesitosInvalidos).join(", "),
            }));
          } else if (filters.activeTab === "Etapas") {
            rows = DataStore.getCleanEtapaTotals(filters);
          } else if (filters.activeTab === "Quesitos") {
            rows = DataStore.getCleanQuesitoRows(filters);
          } else {
            rows = DataStore.getCleanFinalTotals(filters);
          }
        } else {
          rows = DataStore.getCleanFinalTotals(filters);
        }
        exportCSV(rows.slice(0, 1000));
      });
    }
  }

  init().catch((err) => {
    console.error("Erro ao carregar dashboard de dados:", err);
  });
})();
