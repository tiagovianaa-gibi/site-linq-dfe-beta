import { loadJSON } from "./shared.js";

const DATA_PATH = "data/calendario-temporada-2026.json";

function sortByDate(events) {
  return [...events].sort((a, b) => {
    const da = new Date(a.dateStart || 0).getTime();
    const db = new Date(b.dateStart || 0).getTime();
    return da - db;
  });
}

function createEventItem(event) {
  const li = document.createElement("li");

  const time = document.createElement("time");
  time.dateTime = event.dateStart || "";
  time.textContent = event.period || "";
  li.appendChild(time);

  const h3 = document.createElement("h3");
  const isCircuito = event.tag === "Circuito";
  const cleanedTitle = isCircuito
    ? String(event.title || "").replace(/\s-\s[^-]+(?=\s-\s(?:\d|Final))/u, "")
    : event.title || "";
  h3.textContent = cleanedTitle;
  li.appendChild(h3);

  if (Array.isArray(event.details)) {
    event.details.forEach((line) => {
      const p = document.createElement("p");
      p.className = "card-text";
      p.textContent = line;
      li.appendChild(p);
    });
  }

  const meta = document.createElement("div");
  meta.className = "timeline-meta";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = event.badge || event.tag || "";
  meta.appendChild(badge);

  if (event.tag && event.tag !== "Circuito") {
    const tag = document.createElement("span");
    tag.className = "badge badge-outline";
    tag.textContent = event.tag;
    meta.appendChild(tag);
  }

  if (!isCircuito) {
    const loc = document.createElement("span");
    loc.textContent = `Local: ${event.location || "A confirmar"}`;
    meta.appendChild(loc);
  }

  li.appendChild(meta);
  return li;
}

function renderList(container, events) {
  if (!container) return;
  container.innerHTML = "";
  if (!events.length) {
    const empty = document.createElement("li");
    empty.textContent = "Nenhum evento encontrado para este filtro.";
    container.appendChild(empty);
    return;
  }
  events.forEach((event) => container.appendChild(createEventItem(event)));
}

function renderCircuitOnly(allEvents) {
  const container = document.querySelector("#circuitoTimelineList");
  if (!container) return;
  const circuitoEvents = sortByDate(allEvents).filter((event) => event.tag === "Circuito");
  renderList(container, circuitoEvents);
}

function renderTemporada(allEvents) {
  const list = document.querySelector("#temporadaTimelineList");
  const chips = document.querySelector("#temporadaTagFilters");
  if (!list || !chips) return;

  const events = sortByDate(allEvents);
  const tags = [...new Set(events.map((event) => event.tag).filter(Boolean))];
  let activeTag = "all";

  const update = () => {
    const filtered = activeTag === "all" ? events : events.filter((event) => event.tag === activeTag);
    renderList(list, filtered);
    chips.querySelectorAll("[data-tag]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tag") === activeTag);
    });
  };

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "filter-btn active";
  allBtn.setAttribute("data-tag", "all");
  allBtn.textContent = "Todos";
  allBtn.addEventListener("click", () => {
    activeTag = "all";
    update();
  });
  chips.appendChild(allBtn);

  tags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.setAttribute("data-tag", tag);
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      activeTag = tag;
      update();
    });
    chips.appendChild(btn);
  });

  update();
}

async function initSeasonCalendar() {
  const data = await loadJSON(DATA_PATH);
  const events = Array.isArray(data?.events) ? data.events : [];
  if (!events.length) return;

  renderCircuitOnly(events);
  renderTemporada(events);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSeasonCalendar, { once: true });
} else {
  initSeasonCalendar();
}
