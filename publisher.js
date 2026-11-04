"use strict";

const labels = {
  en: {news:"News", patch:"Patch Notes", journal:"Viking Rise Journal", newsSub:"Events, announcements and promo codes.", patchSub:"Highlights, maintenance times and the full list of changes.", archive:"Archive", search:"Search archive", empty:"No matching entries.", error:"The archive could not be loaded.", loading:"Loading…", home:"Back to home", major:"Highlights", new_features:"New features", optimizations:"Improvements", fixes:"Fixes", maintenance:"Maintenance (UTC)", local:"Local start", promo:"Promo code", expires:"Expires", expired:"Expired", copy:"Copy code", copied:"Copied", source:"Open source", language:"Language"},
  de: {news:"News", patch:"Patchnotes", journal:"Viking Rise Journal", newsSub:"Events, Ankündigungen und Promo-Codes.", patchSub:"Highlights, Wartungszeiten und alle Änderungen im Überblick.", archive:"Archiv", search:"Archiv durchsuchen", empty:"Keine passenden Beiträge.", error:"Das Archiv konnte nicht geladen werden.", loading:"Wird geladen…", home:"Zur Startseite", major:"Highlights", new_features:"Neuheiten", optimizations:"Verbesserungen", fixes:"Fehlerbehebungen", maintenance:"Wartung (UTC)", local:"Lokale Startzeit", promo:"Promo-Code", expires:"Gültig bis", expired:"Abgelaufen", copy:"Code kopieren", copied:"Kopiert", source:"Zur Quelle", language:"Sprache"},
  cn: {news:"新闻", patch:"更新说明", journal:"维京崛起资讯", newsSub:"活动、公告和兑换码。", patchSub:"更新亮点、维护时间和完整改动列表。", archive:"存档", search:"搜索存档", empty:"没有匹配的内容。", error:"无法加载存档。", loading:"正在加载…", home:"返回主页", major:"更新亮点", new_features:"新功能", optimizations:"优化", fixes:"修复", maintenance:"维护时间 (UTC)", local:"本地开始时间", promo:"兑换码", expires:"有效期至", expired:"已过期", copy:"复制兑换码", copied:"已复制", source:"查看来源", language:"语言"},
  ru: {news:"Новости", patch:"Патчноуты", journal:"Журнал Viking Rise", newsSub:"События, объявления и промокоды.", patchSub:"Главные изменения, время обслуживания и полный список обновлений.", archive:"Архив", search:"Поиск по архиву", empty:"Совпадений нет.", error:"Не удалось загрузить архив.", loading:"Загрузка…", home:"На главную", major:"Главное", new_features:"Нововведения", optimizations:"Улучшения", fixes:"Исправления", maintenance:"Обслуживание (UTC)", local:"Местное время начала", promo:"Промокод", expires:"Действует до", expired:"Истёк", copy:"Копировать код", copied:"Скопировано", source:"Открыть источник", language:"Язык"}
};

const isNews = document.body.dataset.page === "news";
const category = isNews ? "news" : "patch";
const byId = id => document.getElementById(id);
const entry = byId("entry");
const archive = byId("entries");
const search = byId("search");
const status = byId("status");
const language = byId("language");
const archiveToggle = document.querySelector(".archive-toggle");
const patchSections = ["major", "new_features", "optimizations", "fixes"];
const requestedLanguage = new URL(location.href).searchParams.get("lang");
const browserLanguage = navigator.language.split("-")[0];
let lang = [requestedLanguage, browserLanguage === "zh" ? "cn" : browserLanguage, "en"]
  .find(key => Object.hasOwn(labels, key));
let feed = [];
let selected;
let loadState = "loading";

function locale() {
  return lang === "cn" ? "zh-CN" : lang;
}

function element(tag, value = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}

function safeUrl(value, base) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, base);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {
    return null;
  }
  return null;
}

function formatText(container, value) {
  for (const part of String(value || "").split(/(https?:\/\/[^\s<>"']+|\*\*[^*\n]+\*\*)/g)) {
    const url = safeUrl(part);
    if (url) {
      const link = element("a", part);
      link.href = url;
      container.append(link);
    } else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      container.append(element("strong", part.slice(2, -2)));
    } else {
      container.append(part);
    }
  }
}

function picture(path, className) {
  const img = element("img", "", className);
  img.alt = "";
  img.decoding = "async";
  img.addEventListener("error", () => { img.src = "header-bg.jpg"; }, {once:true});
  img.src = safeUrl(path, document.baseURI) || "header-bg.jpg";
  return img;
}

function localized(item) {
  return item[lang] || item.en || {};
}

function title(item) {
  return (isNews ? localized(item).title : item.meta?.["title_" + lang] || item.meta?.title_en)
    || labels[lang][category];
}

function timestamp(item) {
  const value = item.meta?.start_timestamp;
  if (value === null || value === undefined || !String(value).trim()) return NaN;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return Math.abs(numeric) < 1e12 ? numeric * 1000 : numeric;
  return Date.parse(value);
}

function dateLabel(item) {
  if (isNews) return item.date || "";
  const date = timestamp(item);
  return Number.isFinite(date) ? new Intl.DateTimeFormat(locale(), {dateStyle:"medium", timeZone:"UTC"}).format(date) : "";
}

function renderPromo(body, item) {
  const promo = element("div", "", "promo");
  const info = element("div");
  const code = element("code", item.code);
  info.append(element("p", labels[lang].promo, "eyebrow"), code);
  if (typeof item.expiry === "string" && item.expiry.trim()) {
    const value = item.expiry.replace(/\s*\(?UTC\)?\s*$/i, "").trim();
    const hasYear = /\b\d{4}\b/.test(value);
    const hasTime = /\d:\d{2}/.test(value);
    const expiry = hasYear ? Date.parse(value + (hasTime ? " UTC" : " 23:59:59 UTC")) : NaN;
    const expired = Number.isFinite(expiry) && Date.now() > expiry;
    info.append(element("p", (expired ? labels[lang].expired + " · " : "") +
      labels[lang].expires + " " + item.expiry, "meta"));
  }
  const copy = element("button", labels[lang].copy);
  copy.type = "button";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(item.code);
      copy.textContent = labels[lang].copied;
      setTimeout(() => { copy.textContent = labels[lang].copy; }, 1800);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  promo.append(info, copy);
  body.append(promo);
}

function renderNews(body, item) {
  const content = element("div", "", "prose");
  formatText(content, localized(item).content);
  if (content.textContent.trim()) body.append(content);
  if (item.code) renderPromo(body, item);
  const source = safeUrl(item.link);
  if (source) {
    const link = element("a", labels[lang].source + " ↗", "source");
    link.href = source;
    const row = element("p");
    row.append(link);
    body.append(row);
  }
}

function strings(values) {
  return Array.isArray(values) ? values.filter(value => typeof value === "string" && value.trim()) : [];
}

function patchImages(meta) {
  return [...new Set([meta.image_url, ...strings(meta.image_urls), ...strings(meta.images)]
    .map(path => safeUrl(path, document.baseURI)).filter(Boolean))];
}

function appendList(parent, values) {
  const list = element("ul");
  for (const value of values) {
    const li = element("li");
    formatText(li, value);
    list.append(li);
  }
  if (list.children.length) parent.append(list);
}

function renderPatch(body, item, images) {
  const meta = item.meta || {};
  const date = timestamp(item);
  if (/\bUTC\b/i.test(meta.display_time || "")) {
    const panel = element("div", "", "maintenance");
    const utc = element("div");
    utc.append(element("p", labels[lang].maintenance, "eyebrow"), element("p", meta.display_time));
    panel.append(utc);
    if (Number.isFinite(date)) {
      const local = element("div");
      local.append(element("p", labels[lang].local, "eyebrow"),
        element("p", new Intl.DateTimeFormat(locale(), {dateStyle:"medium", timeStyle:"short"}).format(date)));
      panel.append(local);
    }
    body.append(panel);
  }
  const index = element("div", "", "patch-index");
  body.append(index);
  const data = localized(item);
  for (const key of patchSections) {
    const section = element("section", "", "patch-section");
    section.id = "section-" + key;
    const values = strings(data[key]);
    if (key === "major") {
      const highlights = element("div", "", "highlights");
      values.forEach((value, i) => {
        const card = element("div", "", "highlight");
        const detail = element("div");
        const line = element("p");
        formatText(line, value);
        detail.append(element("span", String(i + 1).padStart(2, "0"), "eyebrow"), line);
        // The first image is already the article's cover.
        if (i > 0 && images[i]) {
          const image = picture(images[i]);
          image.loading = "lazy";
          card.append(image);
        }
        card.append(detail);
        highlights.append(card);
      });
      if (highlights.children.length) section.append(highlights);
    } else if (key === "optimizations" && Array.isArray(data[key])) {
      appendList(section, values);
      for (const group of data[key]) {
        const items = strings(group?.items);
        if (!items.length) continue;
        const details = element("details");
        details.append(element("summary", group.title || labels[lang][key]));
        appendList(details, items);
        section.append(details);
      }
    } else {
      appendList(section, values);
    }
    if (!section.children.length) continue;
    const heading = element("h3", labels[lang][key]);
    heading.tabIndex = -1;
    section.prepend(heading);
    body.append(section);
    const link = element("a", labels[lang][key]);
    link.href = "#" + section.id;
    link.addEventListener("click", event => {
      event.preventDefault();
      heading.focus({preventScroll:true});
      section.scrollIntoView();
    });
    index.append(link);
  }
  if (!index.children.length) index.remove();
}

function renderEntry(item) {
  const body = element("div", "", "entry-body");
  const header = element("header");
  const heading = element("h2", title(item));
  heading.id = "entry-title";
  header.append(element("p", [labels[lang][category], dateLabel(item)].filter(Boolean).join(" · "), "eyebrow"), heading);
  body.append(header);
  const images = isNews ? [] : patchImages(item.meta || {});
  if (isNews) renderNews(body, item);
  else renderPatch(body, item, images);
  entry.replaceChildren(picture(isNews ? item.image : images[0], "cover"), body);
}

function fragment(item) {
  return "#" + encodeURIComponent(item.id);
}

function renderArchive() {
  const query = search.value.trim().toLocaleLowerCase(locale());
  const nodes = [];
  for (const item of feed) {
    const content = localized(item);
    const text = [title(item), dateLabel(item), item.code, content.content,
      isNews ? "" : JSON.stringify(Object.values(content))]
      .filter(Boolean).join(" ").toLocaleLowerCase(locale());
    if (!text.includes(query)) continue;
    const li = element("li");
    const link = element("a");
    link.href = fragment(item);
    if (item === selected) link.setAttribute("aria-current", "true");
    const meta = [dateLabel(item), item.code].filter(Boolean).join(" · ");
    if (meta) link.append(element("span", meta, "meta"));
    link.append(element("span", title(item)));
    link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      selectEntry(true);
    });
    li.append(link);
    nodes.push(li);
  }
  archive.replaceChildren(...nodes);
  byId("results").textContent = nodes.length ? "" : labels[lang].empty;
}

function selectEntry(focus = false) {
  selected = feed.find(item => fragment(item) === location.hash) || feed[0];
  if (!selected) return;
  renderEntry(selected);
  renderArchive();
  if (focus) {
    entry.focus({preventScroll:true});
    entry.scrollIntoView({block:"start"});
  }
}

function localize() {
  const text = labels[lang];
  document.documentElement.lang = locale();
  document.title = "Viking Rise · " + text[category];
  language.value = lang;
  language.setAttribute("aria-label", text.language);
  search.placeholder = text.search;
  for (const node of document.querySelectorAll("[data-text]")) node.textContent = text[node.dataset.text];
  for (const link of document.querySelectorAll(".top a, .footer a")) {
    const url = new URL(link.href);
    url.searchParams.set("lang", lang);
    link.href = url.href;
  }
  status.textContent = text[loadState] || "";
}

language.addEventListener("change", () => {
  lang = language.value;
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
  localize();
  selectEntry();
});
search.addEventListener("input", renderArchive);
archiveToggle.addEventListener("click", () => {
  const expanded = archiveToggle.getAttribute("aria-expanded") === "true";
  archiveToggle.setAttribute("aria-expanded", String(!expanded));
  if (!expanded) search.focus();
});
window.addEventListener("hashchange", () => selectEntry(Boolean(location.hash)));

async function start() {
  localize();
  try {
    const response = await fetch(isNews ? "news.json" : "patchnotes.json", {cache:"no-cache"});
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid archive");
    feed = data.filter(item => item?.id && (item.en || item[lang]));
    if (!isNews) feed.sort((a, b) => (timestamp(b) || 0) - (timestamp(a) || 0));
    loadState = feed.length ? "ready" : "empty";
    byId("layout").hidden = !feed.length;
    selectEntry(Boolean(location.hash));
  } catch (error) {
    console.error(error);
    loadState = "error";
    byId("layout").hidden = true;
  }
  localize();
}

start();
