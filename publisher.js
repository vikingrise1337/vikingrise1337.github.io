"use strict";

// Shared extras for the existing News and Patch Notes pages.
const VikingPublisher = (() => {
  const labels = {
    en: {news:"News", patch:"Patch Notes", codes:"Gift codes", active:"Active codes", unknown:"Expiry unknown", expired:"Expired codes", none:"No codes in this section.", article:"Read announcement", expires:"Expires", copy:"Copy code", copied:"Copied", share:"Copy article link", shared:"Link copied", next:"Next maintenance", ongoing:"Maintenance in progress"},
    de: {news:"News", patch:"Patchnotes", codes:"Geschenkcodes", active:"Aktive Codes", unknown:"Ablaufdatum unbekannt", expired:"Abgelaufene Codes", none:"Hier gibt es gerade keine Codes.", article:"Zur Ankündigung", expires:"Gültig bis", copy:"Code kopieren", copied:"Kopiert", share:"Beitragslink kopieren", shared:"Link kopiert", next:"Nächste Wartung", ongoing:"Wartung läuft"},
    cn: {news:"新闻", patch:"更新说明", codes:"兑换码", active:"有效兑换码", unknown:"有效期未知", expired:"已过期兑换码", none:"此处暂无兑换码。", article:"查看公告", expires:"有效期至", copy:"复制兑换码", copied:"已复制", share:"复制文章链接", shared:"链接已复制", next:"下次维护", ongoing:"维护进行中"},
    ru: {news:"Новости", patch:"Патчноуты", codes:"Промокоды", active:"Активные промокоды", unknown:"Срок действия неизвестен", expired:"Истёкшие промокоды", none:"Здесь пока нет промокодов.", article:"Открыть объявление", expires:"Действует до", copy:"Копировать код", copied:"Скопировано", share:"Копировать ссылку", shared:"Ссылка скопирована", next:"Следующее обслуживание", ongoing:"Идёт обслуживание"}
  };

  function node(tag, text = "", classes = "") {
    const element = document.createElement(tag);
    element.textContent = text;
    if (classes) element.className = classes;
    return element;
  }

  function escapeHtml(value) {
    const entities = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"};
    return String(value ?? "").replace(/[&<>"']/g, char => entities[char]);
  }

  function safeUrl(value, base) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, base);
      if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.href;
    } catch {
      return null;
    }
    return null;
  }

  function expiryTimestamp(raw) {
    if (typeof raw !== "string") return NaN;
    const value = raw.trim().replace(/\s*\(?UTC\)?\s*$/i, "");
    const iso = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T, ]+\s*(\d{1,2}):(\d{2})(?::(\d{2}))?Z?)?$/i.exec(value);
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:[, ]+\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(value);
    if (!iso && !us) return NaN;
    const [, y, m, d, hour = 23, minute = 59, explicitSecond] = iso ||
      [null, us[3].length === 2 ? "20" + us[3] : us[3], us[1], us[2], ...us.slice(4)];
    const dateOnly = !iso?.[4] && !us?.[4];
    const second = explicitSecond ?? (dateOnly ? 59 : 0);
    const date = new Date(Date.UTC(+y, +m - 1, +d, +hour, +minute, +second, dateOnly ? 999 : 0));
    if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d ||
        +hour > 23 || +minute > 59 || +second > 59) return NaN;
    return date.getTime();
  }

  function articleUrl(page, id, lang) {
    const url = new URL(page, location.href);
    url.searchParams.set("lang", lang);
    url.hash = encodeURIComponent(id);
    return url.href;
  }

  function fragmentId() {
    try {
      return decodeURIComponent(location.hash.slice(1));
    } catch {
      return "";
    }
  }

  function copyControl(value, label, success) {
    const wrap = node("div", "", "vr-copy");
    const button = node("button", label, "vr-button");
    button.type = "button";
    const field = node("input");
    field.readOnly = true;
    field.hidden = true;
    field.value = value;
    field.setAttribute("aria-label", label);
    let reset;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);
        button.textContent = success;
        clearTimeout(reset);
        reset = setTimeout(() => { button.textContent = label; }, 1800);
      } catch {
        field.hidden = false;
        field.focus();
        field.select();
      }
    });
    wrap.append(button, field);
    return wrap;
  }

  function shareControl(page, id, lang) {
    const text = labels[lang];
    return copyControl(articleUrl(page, id, lang), text.share, text.shared);
  }

  function mountGifts(container, entries, lang) {
    const text = labels[lang];
    const seen = new Set();
    const gifts = [];
    for (const item of entries) {
      const code = typeof item?.code === "string" ? item.code.trim() : "";
      if (!code || seen.has(code.toUpperCase())) continue;
      seen.add(code.toUpperCase());
      gifts.push({item, code, expiry:expiryTimestamp(item.expiry)});
    }
    let previous;
    function render() {
      const now = Date.now();
      const active = gifts.filter(gift => gift.expiry > now).sort((a, b) => a.expiry - b.expiry);
      const unknown = gifts.filter(gift => !Number.isFinite(gift.expiry));
      const expired = gifts.filter(gift => gift.expiry <= now).sort((a, b) => b.expiry - a.expiry);
      const current = JSON.stringify(active.map(gift => gift.code));
      if (current === previous) return;
      previous = current;
      const sections = [];
      for (const [items, title, group] of [[active, text.active, "active"], [unknown, text.unknown, "unknown"], [expired, text.expired, "expired"]]) {
        if (!items.length && group !== "active") continue;
        const details = group === "expired";
        const section = node(details ? "details" : "section", "", "vr-gift-group glass-card");
        section.dataset.group = group;
        section.append(node(details ? "summary" : "h2", title + " · " + items.length));
        if (!items.length) section.append(node("p", text.none, "vr-muted"));
        const grid = node("div", "", "vr-gift-grid");
        for (const {item, code, expiry} of items) {
          const card = node("div", "", "vr-gift promo-box");
          const link = node("a", text.article + " ↗");
          link.href = articleUrl("news.html", item.id, lang);
          card.append(node("code", code), node("p", Number.isFinite(expiry) ?
            text.expires + " " + item.expiry : text.unknown, "vr-muted"),
            copyControl(code, text.copy, text.copied), link);
          grid.append(card);
        }
        section.append(grid);
        sections.push(section);
      }
      container.replaceChildren(...sections);
    }
    render();
    const timer = setInterval(render, 15000);
    window.addEventListener("focus", render);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", render);
    };
  }

  function maintenanceWindow(item) {
    const start = Math.floor(Date.parse(item.meta?.start_timestamp) / 60000) * 60000;
    // Date ranges also occur on event updates. Require matching UTC clock times.
    const time = /(?:^|\s)(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})\s*\(?UTC\)?\s*$/i.exec(item.meta?.display_time || "");
    if (!time || !Number.isFinite(start)) return null;
    const [startHour, startMinute, endHour, endMinute] = time.slice(1).map(Number);
    const date = new Date(start);
    if (startHour !== date.getUTCHours() || startMinute !== date.getUTCMinutes() ||
        endHour > 23 || endMinute > 59) return null;
    const duration = (endHour * 60 + endMinute - startHour * 60 - startMinute + 1440) % 1440;
    return duration ? {item, start, end:start + duration * 60000} : null;
  }

  function mountMaintenance(container, entries, getLang) {
    const windows = entries.filter(item => item?.id).map(maintenanceWindow).filter(Boolean)
      .sort((a, b) => a.start - b.start);
    let previous;
    function render() {
      const now = Date.now();
      const current = windows.find(window => window.end > now);
      const lang = getLang();
      const ongoing = current && current.start <= now;
      const key = current ? JSON.stringify([current.item.id, current.start, current.end, ongoing, lang]) : "";
      if (key === previous) return;
      previous = key;
      container.hidden = !current;
      if (!current) return;
      const text = labels[lang];
      const title = ongoing ? text.ongoing : text.next;
      const locale = lang === "cn" ? "zh-CN" : lang;
      const formatter = new Intl.DateTimeFormat(locale, {dateStyle:"medium", timeStyle:"short"});
      const body = node("div");
      body.append(node("strong", title), node("p", formatter.formatRange(current.start, current.end)));
      const link = node("a", text.patch + " ↗", "vr-button");
      link.href = articleUrl("updates.html", current.item.id, lang);
      container.setAttribute("aria-label", title);
      container.replaceChildren(body, link);
    }
    render();
    if (windows.some(window => window.end > Date.now())) {
      setInterval(render, 15000);
      window.addEventListener("focus", render);
    }
    return render;
  }

  async function fetchFeed(path) {
    const response = await fetch(path, {cache:"no-cache"});
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid feed");
    return data;
  }

  return {labels, escapeHtml, safeUrl, expiryTimestamp, fragmentId, shareControl, mountGifts, mountMaintenance, fetchFeed};
})();
