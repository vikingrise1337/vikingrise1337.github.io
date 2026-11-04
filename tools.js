import {resources, planTroops, planUpgrades, compareBonuses, planGathering} from "./tool-math.js?v=1";

const languages = ["en", "de", "cn", "ru"];
const words = {
  language:["Language","Sprache","语言","Язык"],
  tools:["Player tools","Spielerwerkzeuge","玩家工具","Инструменты игрока"],
  intro:["Plan troops, upgrades, equipment and gathering with your in-game values.","Plane Truppen, Ausbau, Ausrüstung und Sammelmärsche mit deinen Spielwerten.","使用游戏内数值规划部队、升级、装备与采集。","Планируйте войска, улучшения, снаряжение и сбор по значениям из игры."],
  foot:["Unofficial fan tools for Viking Rise.","Inoffizielle Fan-Werkzeuge für Viking Rise.","Viking Rise 非官方玩家工具。","Неофициальные инструменты сообщества Viking Rise."],
  troops:["Troops & events","Truppen & Events","部队与活动","Войска и события"],
  upgrades:["Buildings & research","Bau & Forschung","建造与研究","Здания и исследования"],
  builds:["Jewels & mounts","Juwelen & Reittiere","宝石与坐骑","Самоцветы и ездовые животные"],
  gather:["Gathering","Rohstoffe sammeln","资源采集","Сбор ресурсов"],
  troopIntro:["Enter one sample batch from the game. Use the same tier and bonuses as your planned batch.","Übernimm einen Beispieldurchlauf aus dem Spiel. Truppenstufe und Boni müssen zu deinem geplanten Durchlauf passen.","输入游戏中一批部队的数值。样本的兵阶和加成应与计划一致。","Введите данные одной партии из игры. Уровень войск и бонусы должны совпадать с вашим планом."],
  upgradeIntro:["Add the steps and prerequisites shown in the game. Give the same prerequisite the same name and level to count it once.","Füge die im Spiel angezeigten Schritte und Voraussetzungen hinzu. Gleiche Voraussetzungen mit identischem Namen und Stufe werden einmal gezählt.","添加游戏中显示的步骤和前置条件。名称和等级相同的前置条件仅计算一次。","Добавьте этапы и требования из игры. Одинаковые требования с тем же названием и уровнем учитываются один раз."],
  buildIntro:["Compare two setups. Enter the displayed bonuses and record skill effects separately.","Vergleiche zwei Zusammenstellungen. Trage angezeigte Boni ein und halte Fertigkeitseffekte separat fest.","比较两套配置。输入显示的加成，技能效果单独记录。","Сравните две сборки. Введите указанные бонусы, а эффекты навыков запишите отдельно."],
  gatherIntro:["Compare the resources on a tile with your squad load. Use the collection time shown for that amount.","Vergleiche die Rohstoffe auf einem Feld mit deiner Trupptraglast. Übernimm die angezeigte Sammelzeit für diese Menge.","比较资源点储量与部队负载。输入游戏显示的对应采集时间。","Сравните запасы клетки с грузоподъёмностью отряда. Используйте время сбора указанного количества."],
  durationHint:["Enter times as hours:minutes or hours:minutes:seconds, such as 48:30.","Zeiten als Stunden:Minuten oder Stunden:Minuten:Sekunden eingeben, z. B. 48:30.","时间格式为小时:分钟或小时:分钟:秒，例如 48:30。","Время вводится как часы:минуты или часы:минуты:секунды, например 48:30."],
  missingHint:["Leave unknown values blank. Enter 0 for a known zero. Totals and limits use the values you entered.","Unbekannte Werte frei lassen. Eine bekannte Null als 0 eingeben. Summen und Grenzen beruhen auf deinen Eingaben.","未知值留空；确定为零时输入 0。总量和限制按已输入的数值计算。","Неизвестные значения оставьте пустыми. Если значение равно нулю, введите 0. Итоги используют введённые данные."],
  zeroCosts:["Blank resource costs count as zero.","Leere Rohstoffkosten zählen als null.","未填写的资源费用按零计算。","Пустые поля стоимости считаются нулём."],
  estimate:["Estimates use proportional scaling. Game rounding and changing bonuses may affect results.","Die Schätzung rechnet proportional hoch. Rundung und wechselnde Boni im Spiel können das Ergebnis beeinflussen.","估算按比例计算。游戏中的取整及加成变化可能影响结果。","Расчёт пропорциональный. Округление и смена бонусов в игре могут повлиять на результат."],
  addedBonuses:["Totals add the entered lines with the same label and unit. Conditional effects are listed separately.","Summiert werden eingegebene Zeilen mit gleichem Namen und gleicher Einheit. Bedingte Effekte stehen separat.","仅合计名称和单位相同的加成。触发效果单独显示。","Суммируются строки с одинаковым названием и единицей. Условные эффекты указаны отдельно."],
  calculate:["Calculate","Berechnen","计算","Рассчитать"],
  example:["Load example","Beispiel laden","载入示例","Загрузить пример"],
  exampleNote:["Example with fictional values.","Beispiel mit frei gewählten Werten.","示例使用虚构数值。","Пример с условными значениями."],
  result:["Result","Ergebnis","结果","Результат"],
  action:["Action","Aktion","操作","Действие"],
  train:["Train","Trainieren","训练","Обучить"],
  heal:["Heal","Heilen","治疗","Лечить"],
  promote:["Promote","Befördern","晋升","Повысить"],
  tier:["Troop tier","Truppenstufe","兵阶","Уровень войск"],
  fromTier:["Current tier","Ausgangsstufe","当前兵阶","Текущий уровень"],
  tierOrder:["Choose a higher tier for promotion.","Wähle für die Beförderung eine höhere Zielstufe.","请选择更高的晋升兵阶。","Выберите более высокий уровень для повышения."],
  sample:["Sample batch","Beispieldurchlauf","样本批次","Пробная партия"],
  batch:["Troops in sample","Truppen im Beispiel","样本兵数","Войск в образце"],
  duration:["Duration","Dauer","时长","Длительность"],
  might:["Power change in sample","Machtänderung im Beispiel","样本战力变化","Изменение мощи в образце"],
  costs:["Resources for the sample","Rohstoffe fürs Beispiel","样本资源消耗","Ресурсы на образец"],
  plan:["Your plan","Dein Plan","你的计划","Ваш план"],
  target:["Target troop count","Zielanzahl Truppen","目标兵数","Целевое число войск"],
  capacity:["Troops per batch","Truppen pro Durchlauf","每批兵数","Войск в партии"],
  time:["Time until deadline","Zeit bis Event-Ende","剩余时间","Время до окончания"],
  boosts:["Available speedups","Verfügbare Beschleuniger","可用加速","Доступные ускорения"],
  stock:["Resources in stock","Rohstoffbestand","资源库存","Запасы ресурсов"],
  food:["Food","Nahrung","食物","Еда"],
  wood:["Wood","Holz","木材","Дерево"],
  stone:["Stone","Stein","石料","Камень"],
  gold:["Gold","Gold","金币","Золото"],
  crystals:["Dragon crystals","Drachenkristalle","龙晶","Кристаллы дракона"],
  maximum:["Estimated maximum","Geschätztes Maximum","预计上限","Расчётный максимум"],
  limited:["Limited by","Begrenzt durch","限制因素","Ограничение"],
  totalTime:["Total time","Gesamtdauer","总时长","Общее время"],
  remaining:["After speedups","Nach Beschleunigern","使用加速后","После ускорений"],
  batches:["Batches","Durchläufe","批次数","Партий"],
  totalMight:["Power change","Machtänderung","战力变化","Изменение мощи"],
  shortage:["Missing for target","Für das Ziel fehlt","目标缺口","Не хватает до цели"],
  overTime:["Remaining time exceeds the deadline.","Die Restdauer überschreitet das Event-Ende.","剩余时长超过截止时间。","Оставшееся время превышает срок."],
  moreLimits:["Enter a target, a deadline or a stock amount with a matching sample cost.","Gib ein Ziel, ein Event-Ende oder einen Bestand mit passenden Beispielkosten ein.","输入目标、截止时间，或填写有样本成本的资源库存。","Введите цель, срок или запас ресурса с указанной стоимостью."],
  step:["Upgrade step","Ausbauschritt","升级步骤","Этап улучшения"],
  addStep:["Add step","Schritt hinzufügen","添加步骤","Добавить этап"],
  name:["Name and target level","Name und Zielstufe","名称和目标等级","Название и целевой уровень"],
  kind:["Category","Kategorie","类别","Категория"],
  build:["Construction","Bau","建造","Строительство"],
  research:["Research","Forschung","研究","Исследования"],
  buildBoost:["Construction speedups","Bau-Beschleuniger","建造加速","Ускорения строительства"],
  researchBoost:["Research speedups","Forschungs-Beschleuniger","研究加速","Ускорения исследований"],
  remove:["Remove","Entfernen","删除","Удалить"],
  counted:["Steps counted","Berechnete Schritte","计入步骤","Учтено этапов"],
  shared:["Duplicate steps skipped","Doppelte Schritte übersprungen","已跳过重复步骤","Пропущено повторов"],
  conflict:["Conflicting values for the same step","Unterschiedliche Werte für denselben Schritt","同一步骤存在不同数值","Разные значения для одного этапа"],
  bonus:["Bonus or skill","Bonus oder Fertigkeit","加成或技能","Бонус или навык"],
  addBonus:["Add bonus","Bonus hinzufügen","添加加成","Добавить бонус"],
  equipment:["Setup","Zusammenstellung","配置","Сборка"],
  a:["Setup A","Variante A","配置 A","Сборка A"],
  b:["Setup B","Variante B","配置 B","Сборка B"],
  source:["Source","Quelle","来源","Источник"],
  jewel:["Jewel","Juwel","宝石","Самоцвет"],
  mount:["Mount","Reittier","坐骑","Ездовое животное"],
  effect:["Effect name","Name des Effekts","效果名称","Название эффекта"],
  value:["Value","Wert","数值","Значение"],
  unit:["Unit","Einheit","单位","Единица"],
  points:["Points","Punkte","点数","Очки"],
  note:["Skill text or trigger condition","Fertigkeitstext oder Auslösebedingung","技能说明或触发条件","Описание навыка или условие срабатывания"],
  difference:["Difference B − A","Differenz B − A","差值 B − A","Разница B − A"],
  notes:["Skills and conditions","Fertigkeiten und Bedingungen","技能与条件","Навыки и условия"],
  bonusRequired:["Enter a bonus value or a skill description.","Gib einen Bonuswert oder einen Fertigkeitstext ein.","请输入加成数值或技能说明。","Введите значение бонуса или описание навыка."],
  amount:["Resources on the tile","Rohstoffe auf dem Feld","资源点储量","Ресурсов в клетке"],
  load:["Squad load","Trupptraglast","部队负载","Грузоподъёмность"],
  outbound:["Travel to tile","Hinweg","去程","Путь к клетке"],
  gathering:["Collection time","Sammelzeit","采集时间","Время сбора"],
  inbound:["Return travel","Rückweg","返程","Обратный путь"],
  collected:["Collected per trip","Pro Marsch gesammelt","每趟采集量","Собрано за поход"],
  left:["Left on the tile","Bleibt auf dem Feld","资源点剩余","Остаток в клетке"],
  trips:["Trips to clear the tile","Märsche bis das Feld leer ist","采空所需趟数","Походов до опустошения"],
  cycle:["Round trip","Dauer inkl. Wege","往返总时间","Время полного похода"],
  perHour:["Resources per hour for this trip","Rohstoffe pro Stunde für diesen Marsch","本趟每小时资源量","Ресурсов в час для этого похода"],
  positiveTime:["Enter a duration greater than zero.","Gib eine Dauer größer als null ein.","请输入大于零的时长。","Введите время больше нуля."],
  guide:["Practical tips","Tipps fürs Spiel","实用技巧","Советы по игре"],
  tip1:["Match the hero to the resource. Start with Varka for wood or gold and Sheila for food or stone, then check which talents your hero has unlocked.","Passe den Helden an den Rohstoff an. Schau bei Holz oder Gold zuerst auf Varka und bei Nahrung oder Stein auf Sheila. Prüfe, welche Talente dein Held freigeschaltet hat.","根据资源选择英雄。木材或金币可先考虑瓦尔卡，食物或石料可先考虑希拉，再查看已解锁的天赋。","Подбирайте героя под ресурс. Для дерева и золота проверьте Варку, для еды и камня — Шейлу. Учитывайте открытые таланты."],
  tip2:["If your squad cannot empty a tile, compare it with a smaller nearby tile. Include the return journey when comparing yield per hour.","Wenn dein Trupp ein Feld nicht leeren kann, vergleiche es mit einem kleineren Feld in der Nähe. Rechne beim Ertrag pro Stunde auch den Rückweg ein.","如果部队采不空资源点，可以比较附近较小的资源点。算每小时收益时记得加上返程。","Если отряд не может опустошить клетку, сравните её с ближайшей клеткой меньшего уровня. В расчёте дохода в час учитывайте обратный путь."],
  tip3:["Check the in-game preview inside your tribe territory. Use that collection time in the calculator to include your current bonuses.","Schau dir die Vorschau im Stammesgebiet an. Übernimm die dort angezeigte Sammelzeit in den Rechner, damit deine aktuellen Boni einfließen.","查看部落领地内的游戏预览。输入显示的采集时间，计算就会反映当前加成。","Проверьте предварительный расчёт на территории племени. Введите показанное время, чтобы учесть действующие бонусы."],
  references:["References","Quellen","参考资料","Источники"],
  days:["d","T","天","д"], hours:["h","h","小时","ч"], minutes:["min","min","分","мин"], seconds:["s","s","秒","с"]
};

const langIndex = Math.max(0, languages.indexOf(new URLSearchParams(location.search).get("lang")));
const lang = languages[langIndex];
const locale = lang === "cn" ? "zh-CN" : lang;
const numberFormat = new Intl.NumberFormat(locale, {maximumFractionDigits:2});
const t = key => words[key][langIndex];

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text != null) el.textContent = text;
  if (className) el.className = className;
  return el;
}

function button(text, handler, className) {
  const el = node("button", text, className);
  el.type = "button";
  el.addEventListener("click", handler);
  return el;
}

function field(grid, key, kind, options = {}) {
  const label = node("label", null, "field");
  const input = node(kind === "select" ? "select" : kind === "textarea" ? "textarea" : "input");
  if (kind === "select") {
    for (const [value, name] of options.choices) {
      const choice = node("option", name);
      choice.value = value;
      input.append(choice);
    }
  } else if (kind === "number") {
    input.type = "number";
    input.min = options.min ?? 0;
    input.max = options.max ?? 1e12;
    input.step = options.step ?? 1;
  } else if (kind === "time") {
    input.type = "text";
    input.pattern = "[0-9]{1,7}:[0-5][0-9](:[0-5][0-9])?";
    input.placeholder = "0:00";
    input.title = t("durationHint");
  } else {
    input.maxLength = kind === "textarea" ? 500 : 100;
  }
  if (options.required) input.required = true;
  if (options.value != null) input.value = options.value;
  label.append(node("span", t(key)), input);
  grid.append(label);
  return input;
}

function fieldset(parent, legend) {
  const section = node("fieldset");
  const grid = node("div", null, "field-grid");
  section.append(node("legend", t(legend)), grid);
  parent.append(section);
  return {section, grid};
}

function hint(parent, key) {
  parent.append(node("p", t(key), "hint"));
}

function numeric(input) {
  return input.value === "" ? null : input.valueAsNumber;
}

function seconds(input) {
  if (!input.value) return null;
  const [h, m, s = 0] = input.value.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function duration(value) {
  let seconds = BigInt(value);
  const pieces = [];
  for (const [size, unit] of [[86400n,"days"],[3600n,"hours"],[60n,"minutes"],[1n,"seconds"]]) {
    const amount = seconds / size;
    if (amount > 0n) pieces.push(numberFormat.format(amount) + " " + t(unit));
    seconds %= size;
  }
  return pieces.join(" ") || "0 " + t("seconds");
}

function readResources(fields, blank = null) {
  return Object.fromEntries(resources.map(key => [key, numeric(fields[key]) ?? blank]));
}

function resourceFields(grid) {
  return Object.fromEntries(resources.map(key => [key, field(grid, key, "number")]));
}

function stats(parent, values) {
  if (!values.length) return;
  const list = node("dl", null, "result-grid");
  for (const [label, value] of values) {
    const cell = node("div");
    cell.append(node("dt", label), node("dd", value));
    list.append(cell);
  }
  parent.append(list);
}

function resourceStats(result) {
  return resources.filter(key => result[key] != null).map(key => [t(key), numberFormat.format(result[key])]);
}

function setValues(fields, values) {
  for (const [key, value] of Object.entries(values)) fields[key].value = value;
}

function calculator(parent, calculate, sample) {
  const form = node("form");
  const result = node("section", null, "results");
  result.hidden = true;
  result.setAttribute("aria-live", "polite");
  const sampleNote = node("p", t("exampleNote"), "hint");
  sampleNote.hidden = true;
  const actions = node("div", null, "form-actions");
  const submit = node("button", t("calculate"));
  submit.type = "submit";
  actions.append(submit, button(t("example"), () => {
    sample();
    sampleNote.hidden = false;
    form.requestSubmit();
  }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    result.replaceChildren(node("h3", t("result")));
    result.hidden = false;
    calculate(result);
  });
  form.addEventListener("input", () => { sampleNote.hidden = true; });
  parent.append(form, result);
  return {form, finish:() => form.append(actions, sampleNote)};
}

function references(parent, links) {
  const details = node("details", null, "tool-refs");
  const list = node("ul");
  details.append(node("summary", t("references")), list);
  for (const [title, href] of links) {
    const item = node("li");
    const link = node("a", title);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.append(link);
    list.append(item);
  }
  parent.append(details);
}

function troops(parent) {
  const {form, finish} = calculator(parent, result => {
    const durationSeconds = seconds(sampleFields.duration);
    if (!durationSeconds) return hint(result, "positiveTime");
    const action = sampleFields.action.value;
    const tier = sampleFields.tier.value;
    const fromTier = sampleFields.fromTier.value;
    if (action === "promote" && Number(fromTier) >= Number(tier)) return hint(result, "tierOrder");
    const target = numeric(planFields.target);
    const deadline = seconds(planFields.time);
    const plan = planTroops({
      batch:numeric(sampleFields.batch), duration:durationSeconds, target,
      capacity:numeric(planFields.capacity), might:numeric(sampleFields.might),
      costs:readResources(costFields), stocks:readResources(stockFields), time:deadline, boosts:seconds(planFields.boosts) ?? 0
    });
    if (plan.maximum == null && target == null) return hint(result, "moreLimits");
    if (plan.maximum != null) stats(result, [
      [t("maximum"), numberFormat.format(plan.maximum)],
      [t("limited"), plan.limiting.map(t).join(" · ")]
    ]);
    if (target != null) {
      stats(result, [
        [t("action"), t(action) + (action === "promote" ? " T" + fromTier + " → T" : " T") + tier],
        [t("totalTime"), duration(plan.totalTime)],
        [t("remaining"), duration(plan.afterBoosts)],
        ...(plan.batches == null ? [] : [[t("batches"), numberFormat.format(plan.batches)]]),
        ...(plan.power == null ? [] : [[t("totalMight"), numberFormat.format(plan.power)]])
      ]);
      stats(result, resourceStats(plan.totals));
      if (Object.keys(plan.short).length) {
        result.append(node("h3", t("shortage")));
        stats(result, resourceStats(plan.short));
      }
      if (deadline != null && plan.afterBoosts > BigInt(deadline)) hint(result, "overTime");
    }
    hint(result, "estimate");
  }, () => {
    setValues(sampleFields, {action:"train", tier:"7", batch:1000, duration:"10:00", might:10000});
    syncAction();
    setValues(planFields, {target:5000, capacity:2000, time:"24:00", boosts:"12:00"});
    setValues(costFields, {food:350000, wood:250000, stone:150000, gold:100000, crystals:0});
    setValues(stockFields, {food:4000000, wood:4000000, stone:800000, gold:500000, crystals:0});
  });
  hint(form, "durationHint");
  const {grid:sample} = fieldset(form, "sample");
  const tiers = Array.from({length:10}, (_, index) => [String(index + 1), "T" + (index + 1)]);
  const sampleFields = {
    action:field(sample, "action", "select", {choices:["train","heal","promote"].map(key => [key,t(key)])}),
    fromTier:field(sample, "fromTier", "select", {choices:tiers.slice(0, -1)}),
    tier:field(sample, "tier", "select", {choices:tiers}),
    batch:field(sample, "batch", "number", {min:1, required:true}),
    duration:field(sample, "duration", "time", {required:true}),
    might:field(sample, "might", "number", {min:-1e12})
  };
  function syncAction() {
    sampleFields.fromTier.closest("label").hidden = sampleFields.action.value !== "promote";
  }
  sampleFields.action.addEventListener("change", syncAction);
  syncAction();
  const costFields = resourceFields(fieldset(form, "costs").grid);
  const {grid:plan} = fieldset(form, "plan");
  const planFields = {
    target:field(plan, "target", "number", {min:1}), capacity:field(plan, "capacity", "number", {min:1}),
    time:field(plan, "time", "time"), boosts:field(plan, "boosts", "time")
  };
  const stockFields = resourceFields(fieldset(form, "stock").grid);
  hint(form, "missingHint");
  finish();
  references(parent, [["CNETDEV · Viking Rise player tools", "https://cnetdev.com/docs"]]);
}

function addRow(list, legend, populate) {
  const {section, grid} = fieldset(list, legend);
  const fields = populate(grid);
  section.append(button(t("remove"), () => {
    const previous = section.previousElementSibling || section.nextElementSibling;
    section.remove();
    (previous?.querySelector("input, select") || list.nextElementSibling)?.focus();
  }, "remove-row"));
  return fields;
}

function upgrades(parent) {
  const rows = new WeakMap();
  const {form, finish} = calculator(parent, result => {
    const steps = [];
    for (const section of list.children) {
      const row = rows.get(section);
      const name = row.name.value.trim();
      if (!name) {
        row.name.value = "";
        row.name.reportValidity();
        return;
      }
      steps.push({kind:row.kind.value, name, duration:seconds(row.duration), costs:readResources(row.costs, 0)});
    }
    if (!steps.length) return hint(result, "addStep");
    const plan = planUpgrades(steps, {build:seconds(buildBoost) ?? 0, research:seconds(researchBoost) ?? 0});
    if (plan.conflict) {
      result.append(node("p", t("conflict") + " · " + plan.conflict));
      return;
    }
    stats(result, [[t("counted"), plan.count], [t("shared"), plan.shared]]);
    stats(result, resourceStats(plan.totals));
    for (const kind of ["build", "research"]) {
      result.append(node("h3", t(kind)));
      stats(result, [[t("totalTime"), duration(plan.durations[kind])], [t("remaining"), duration(plan.remaining[kind])]]);
    }
  }, () => {
    list.replaceChildren();
    const shared = {name:"Academy · 12", kind:"build", duration:"03:00", costs:{food:120000,wood:110000}};
    addStep(shared);
    addStep(shared);
    addStep({name:"Economy · 4", kind:"research", duration:"02:00", costs:{wood:50000,stone:25000}});
    buildBoost.value = "01:00";
    researchBoost.value = "00:30";
  });
  hint(form, "durationHint");
  const list = node("div", null, "row-list");
  form.append(list);
  function addStep(values) {
    const fields = addRow(list, "step", grid => ({
      kind:field(grid, "kind", "select", {choices:["build","research"].map(key => [key,t(key)])}),
      name:field(grid, "name", "text", {required:true}), duration:field(grid, "duration", "time", {required:true}),
      costs:resourceFields(grid)
    }));
    rows.set(list.lastElementChild, fields);
    if (values) {
      setValues(fields, {kind:values.kind, name:values.name, duration:values.duration});
      setValues(fields.costs, values.costs);
    }
    return fields;
  }
  addStep();
  form.append(button(t("addStep"), () => addStep().name.focus()));
  const {grid} = fieldset(form, "boosts");
  const buildBoost = field(grid, "buildBoost", "time");
  const researchBoost = field(grid, "researchBoost", "time");
  hint(form, "zeroCosts");
  finish();
  references(parent, [
    ["Viking Rise Info Hub · Upgrade planner", "https://vikingriseinfo.com/pages/calculator?tab=building"],
    ["CNETDEV · Research budget planner", "https://cnetdev.com/research"]
  ]);
}

function builds(parent) {
  const rows = new WeakMap();
  const {form, finish} = calculator(parent, result => {
    const bonuses = [];
    for (const section of list.children) {
      const fields = rows.get(section);
      const value = numeric(fields.value);
      const effect = fields.effect.value.trim();
      const note = fields.note.value.trim();
      if (!effect) {
        fields.effect.value = "";
        fields.effect.reportValidity();
        return;
      }
      if (value == null && !note) return hint(result, "bonusRequired");
      bonuses.push({build:fields.build.value, source:fields.source.value, effect, unit:fields.unit.value, value, note});
    }
    if (!bonuses.length) return hint(result, "addBonus");
    const stats = compareBonuses(bonuses.filter(row => !row.note));
    if (stats.length) {
      const table = node("table", null, "build-results");
      const heading = table.createTHead().insertRow();
      for (const key of ["effect","a","b","difference"]) {
        const th = node("th", t(key));
        th.scope = "col";
        heading.append(th);
      }
      const body = table.createTBody();
      for (const stat of stats) {
        const row = body.insertRow();
        const format = value => numberFormat.format(value) + (stat.unit === "%" ? "%" : " " + t("points"));
        for (const text of [stat.effect, format(stat.a), format(stat.b), format(stat.difference)]) {
          row.insertCell().textContent = text;
        }
      }
      result.append(table);
    }
    const conditional = bonuses.filter(row => row.note);
    if (conditional.length) {
      const notes = node("ul", null, "build-notes");
      for (const row of conditional) {
        const value = row.value == null ? "" : numberFormat.format(row.value) + (row.unit === "%" ? "%" : " " + t("points"));
        notes.append(node("li", [t(row.build), t(row.source), row.effect, value, row.note].filter(Boolean).join(" · ")));
      }
      result.append(node("h3", t("notes")), notes);
    }
    hint(result, "addedBonuses");
  }, () => {
    list.replaceChildren();
    addBonus({build:"a",source:"jewel",effect:"Attack",value:5,unit:"%"});
    addBonus({build:"a",source:"mount",effect:"Attack",value:2,unit:"%"});
    addBonus({build:"b",source:"mount",effect:"Attack",value:8,unit:"%"});
    addBonus({build:"b",source:"mount",effect:"Skill",note:"Only when rallying."});
  });
  const list = node("div", null, "row-list");
  form.append(list);
  function addBonus(values) {
    const fields = addRow(list, "bonus", grid => ({
      build:field(grid, "equipment", "select", {choices:["a","b"].map(key => [key,t(key)])}),
      source:field(grid, "source", "select", {choices:["jewel","mount"].map(key => [key,t(key)])}),
      effect:field(grid, "effect", "text", {required:true}),
      value:field(grid, "value", "number", {min:-1e9,max:1e9,step:0.01}),
      unit:field(grid, "unit", "select", {choices:[["%","%"],["points",t("points")]]}),
      note:field(grid, "note", "textarea")
    }));
    rows.set(list.lastElementChild, fields);
    if (values) setValues(fields, values);
    return fields;
  }
  addBonus();
  form.append(button(t("addBonus"), () => addBonus().effect.focus()));
  finish();
  references(parent, [["Viking Rise Singularity · Jewel and mount builders", "https://vikingrisesingularity.com/"]]);
}

function gathering(parent) {
  const {form, finish} = calculator(parent, result => {
    const values = {
      amount:numeric(fields.amount), load:numeric(fields.load),
      outbound:seconds(fields.outbound) ?? 0, gathering:seconds(fields.gathering), inbound:seconds(fields.inbound) ?? 0
    };
    if (!values.gathering) return hint(result, "positiveTime");
    const plan = planGathering(values);
    stats(result, ["collected","left","trips","cycle","perHour"].map(key => [
      t(key), key === "cycle" ? duration(plan[key]) : numberFormat.format(plan[key])
    ]));
  }, () => setValues(fields, {amount:800000,load:500000,outbound:"00:08",gathering:"02:15",inbound:"00:08"}));
  hint(form, "durationHint");
  const {grid} = fieldset(form, "gather");
  const fields = {
    amount:field(grid, "amount", "number", {min:1,required:true}), load:field(grid, "load", "number", {min:1,required:true}),
    outbound:field(grid, "outbound", "time"), gathering:field(grid, "gathering", "time", {required:true}),
    inbound:field(grid, "inbound", "time")
  };
  finish();
  const guide = node("section", null, "results");
  guide.append(node("h3", t("guide")));
  const tips = node("ol");
  for (const key of ["tip1","tip2","tip3"]) tips.append(node("li", t(key)));
  guide.append(tips);
  parent.append(guide);
  references(parent, [
    ["MedievalFun · How to get more resources", "https://medievalfun.com/how-to-get-more-resources-in-viking-rise/"],
    ["Steam · Gathering Simulator", "https://steamcommunity.com/sharedfiles/filedetails/?id=3252562897"]
  ]);
}

const tools = {
  troops:["⚔", "troopIntro", troops],
  upgrades:["⚒", "upgradeIntro", upgrades],
  builds:["◆", "buildIntro", builds],
  gather:["❧", "gatherIntro", gathering]
};
const panels = new Map();
const links = new Map();
const panelHost = document.getElementById("tool-panel");
const nav = document.getElementById("tool-list");
document.documentElement.lang = locale;
document.title = "Viking Rise · " + t("tools");
document.getElementById("home-link").href = "index.html?lang=" + lang;
for (const el of document.querySelectorAll("[data-text]")) el.textContent = t(el.dataset.text);
nav.setAttribute("aria-label", t("tools"));
const language = document.getElementById("tool-language");
language.value = lang;
language.addEventListener("change", () => {
  const url = new URL(location.href);
  url.searchParams.set("lang", language.value);
  location.assign(url);
});

for (const [key, [icon]] of Object.entries(tools)) {
  const link = node("a");
  const mark = node("span", icon, "tool-icon");
  mark.setAttribute("aria-hidden", "true");
  link.append(mark, node("span", t(key)));
  link.href = "#" + key;
  nav.append(link);
  links.set(key, link);
}

function showTool() {
  const hash = location.hash.slice(1);
  const key = Object.hasOwn(tools, hash) ? hash : "troops";
  if (!panels.has(key)) {
    const [, intro, render] = tools[key];
    const panel = node("section", null, "panel");
    const title = node("h2", t(key));
    title.id = "heading-" + key;
    panel.setAttribute("aria-labelledby", title.id);
    panel.append(title, node("p", t(intro)));
    render(panel);
    panelHost.append(panel);
    panels.set(key, panel);
  }
  for (const [id, panel] of panels) panel.hidden = id !== key;
  for (const [id, link] of links) {
    if (id === key) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

window.addEventListener("hashchange", showTool);
showTool();
