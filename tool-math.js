export const resources = ["food", "wood", "stone", "gold", "crystals"];

function proportional(amount, count, batch, roundUp = false) {
  const total = BigInt(amount) * BigInt(count);
  const divisor = BigInt(batch);
  return (total + (roundUp ? divisor - 1n : 0n)) / divisor;
}

export function planTroops({batch, duration, capacity, target, costs, stocks, time, boosts, might}) {
  const constraints = [];
  for (const resource of resources) {
    const stock = stocks[resource];
    const cost = costs[resource];
    if (stock != null && cost > 0) {
      constraints.push([resource, proportional(stock, batch, cost)]);
    }
  }
  if (time != null) constraints.push(["time", proportional(time + boosts, batch, duration)]);
  const maximum = constraints.reduce((min, [, value]) => min == null || value < min ? value : min, null);
  const limiting = constraints.filter(([, value]) => value === maximum).map(([key]) => key);
  const totals = {};
  const short = {};
  if (target != null) {
    for (const resource of resources) {
      const cost = costs[resource];
      const stock = stocks[resource];
      if (cost == null) continue;
      totals[resource] = proportional(cost, target, batch, true);
      if (stock != null && totals[resource] > BigInt(stock)) {
        short[resource] = totals[resource] - BigInt(stock);
      }
    }
  }
  const totalTime = target == null ? null : proportional(duration, target, batch, true);
  return {
    maximum, limiting, totals, short, totalTime,
    afterBoosts: totalTime == null ? null : (totalTime > BigInt(boosts) ? totalTime - BigInt(boosts) : 0n),
    batches: target == null || capacity == null ? null : proportional(1, target, capacity, true),
    power: target == null || might == null ? null : proportional(might, target, batch)
  };
}

function normalized(text) {
  return text.trim().replace(/\s+/g, " ").normalize("NFKC").toLowerCase();
}

export function planUpgrades(rows, boosts) {
  const unique = new Map();
  const totals = Object.fromEntries(resources.map(key => [key, 0n]));
  const durations = {build:0n, research:0n};
  for (const row of rows) {
    const key = row.kind + "|" + normalized(row.name);
    const previous = unique.get(key);
    if (previous) {
      if (previous.duration !== row.duration || resources.some(r => previous.costs[r] !== row.costs[r])) {
        return {conflict:row.name};
      }
      continue;
    }
    unique.set(key, row);
    durations[row.kind] += BigInt(row.duration);
    for (const resource of resources) totals[resource] += BigInt(row.costs[resource]);
  }
  const remaining = {};
  for (const kind of ["build", "research"]) {
    const left = durations[kind] - BigInt(boosts[kind]);
    remaining[kind] = left > 0n ? left : 0n;
  }
  return {totals, durations, remaining, count:unique.size, shared:rows.length - unique.size};
}

export function compareBonuses(rows) {
  const totals = new Map();
  for (const row of rows) {
    if (row.value == null) continue;
    const key = normalized(row.effect) + "|" + row.unit;
    if (!totals.has(key)) totals.set(key, {effect:row.effect, unit:row.unit, a:0, b:0});
    totals.get(key)[row.build] += Math.round(row.value * 100);
  }
  return Array.from(totals.values(), stat => ({
    effect:stat.effect, unit:stat.unit, a:stat.a / 100, b:stat.b / 100, difference:(stat.b - stat.a) / 100
  }));
}

export function planGathering({amount, load, outbound, gathering, inbound}) {
  const collected = Math.min(amount, load);
  const cycle = outbound + gathering + inbound;
  return {
    collected, left:amount - collected, trips:Math.ceil(amount / load),
    cycle, perHour:Math.floor(collected * 3600 / cycle)
  };
}
