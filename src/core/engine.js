// Игровой движок: состояние, сложный процент, механика щита, индекс устойчивости

import { ECONOMY } from '../data/config.js';
import { EVENTS } from '../data/events.js';
import { MYTHS } from '../data/myths.js';

const BASE_INCOME = 900; // свободный доход в год, BYN

export function initialState() {
  return {
    age: ECONOMY.ageStart,
    capital: ECONOMY.startCapital,
    pot: 0,            // накопления ДНПС
    shield: 0,         // уровень страхового щита 0..3
    literacy: 0,
    dnpsMonthly: 0,    // ежемесячный взнос ДНПС
    incomeBonus: 0,    // прибавка к годовому доходу (повышение)
    debtAnnual: 0,     // обязательный платёж по кредиту в год
    debtYears: 0,      // сколько лет осталось платить
    stocks: 0,         // вложение в акции (1 — есть портфель)
    cardIndex: 0,      // индекс текущей карточки таймлайна
    mythResults: {},   // id мифа -> 1 (верно) | 0 (неверно)
    history: [{ age: ECONOMY.ageStart, capital: ECONOMY.startCapital, pot: 0 }],
    startedAt: Date.now()
  };
}

// Таймлайн: события + мифы, отсортированные по возрасту
export function buildTimeline() {
  const cards = [
    ...EVENTS.map((e) => ({ ...e, kind: 'event' })),
    ...MYTHS.map((m) => ({
      id: m.id, age: m.age, icon: 'bulb', kind: 'myth',
      title: m.mythTitle, question: m.question,
      options: m.options, explain: m.explain
    }))
  ];
  return cards.sort((a, b) => a.age - b.age);
}

// Сложный процент: проводим state через годы от текущего возраста до toAge
export function advanceYears(state, toAge) {
  const years = [];
  for (let year = state.age; year < toAge; year++) {
    let income = BASE_INCOME + state.incomeBonus;
    if (state.debtYears > 0) {
      income -= state.debtAnnual;
      state.debtYears -= 1;
    }
    if (income > 0) state.capital += income;

    // Взносы ДНПС: пополнение pot + возврат налогового вычета в капитал
    if (state.dnpsMonthly > 0) {
      const yearly = state.dnpsMonthly * 12;
      state.pot += yearly;
      state.capital += Math.round(yearly * ECONOMY.taxBack);
      state.pot = Math.round(state.pot * (1 + ECONOMY.pensionGrowth));
    }
    state.capital = Math.round(state.capital * (1 + ECONOMY.capitalGrowth));
    years.push(year + 1);
  }
  state.age = toAge;
  state.history.push({ age: state.age, capital: state.capital, pot: state.pot });
  return years;
}

// Применение эффектов выбранного варианта. Возвращает дельты для показа в UI
export function applyEffects(state, effects = {}) {
  const deltas = {};

  if (effects.capital) {
    state.capital += effects.capital;
    deltas.capital = effects.capital;
  }
  if (effects.pot) {
    state.pot += effects.pot;
    deltas.pot = effects.pot;
  }
  if (typeof effects.dnpsMonthly === 'number' && effects.dnpsMonthly !== state.dnpsMonthly) {
    deltas.dnpsMonthly = effects.dnpsMonthly - state.dnpsMonthly;
    state.dnpsMonthly = effects.dnpsMonthly;
  }
  if (effects.income) {
    state.incomeBonus += effects.income;
    deltas.income = effects.income;
  }
  if (effects.debtAnnual) {
    state.debtAnnual = effects.debtAnnual;
    state.debtYears = effects.debtYears || 1;
  }
  if (effects.stocks) {
    state.stocks += effects.stocks;
  }
  if (effects.shield) {
    const up = Math.max(0, effects.shield - state.shield);
    state.shield = Math.min(ECONOMY.maxShield, Math.max(state.shield, effects.shield));
    if (up > 0) deltas.shield = up;
  }
  if (effects.shieldCost) {
    state.capital -= effects.shieldCost;
    deltas.capital = (deltas.capital || 0) - effects.shieldCost;
  }
  if (typeof effects.literacy === 'number') {
    const before = state.literacy;
    state.literacy = Math.max(0, Math.min(ECONOMY.literacyMax, state.literacy + effects.literacy));
    if (state.literacy !== before) deltas.literacy = state.literacy - before;
  }
  // Урон: сначала поглощает щит, остаток идёт в капитал
  if (effects.dmg) {
    const absorbRate = ECONOMY.shieldAbsorb[state.shield] || 0;
    const absorbed = Math.round(effects.dmg * absorbRate);
    const hit = effects.dmg - absorbed;
    state.capital -= hit;
    deltas.dmg = -hit;
    deltas.absorbed = absorbed;
  }
  state.capital = Math.max(0, Math.round(state.capital));
  state.pot = Math.max(0, Math.round(state.pot));
  return deltas;
}

// Пенсия в месяц: «безопасная ставка изъятия» из накоплений ДНПС
export function pensionMonthly(state) {
  return Math.round((state.pot * ECONOMY.pensionFactor) / 12);
}

// Индекс финансовой устойчивости 0..100:
// капитал (с ДНПС) до 40 очков, пенсия до 25, щит до 20, грамотность до 15
export function computeIndex(state) {
  const total = state.capital + state.pot;
  const capScore = 40 * Math.min(1, total / ECONOMY.indexCapitalMax);
  const penScore = 25 * Math.min(1, pensionMonthly(state) / ECONOMY.indexPensionMax);
  const shieldScore = 20 * (state.shield / ECONOMY.maxShield);
  const litScore = 15 * (state.literacy / ECONOMY.literacyMax);
  return Math.round(capScore + penScore + shieldScore + litScore);
}

// Краткое описание результата для «Поделиться»
export function shareText(state, index, title, place) {
  return `«Стравита: Капитал жизни»: мой индекс финансовой устойчивости — ${index}/100 («${title.name}»), ${place}-е место из 100. Капитал к 65 годам: ${formatMoney(state.capital + state.pot)} BYN. Проверьте себя!`;
}

export function formatMoney(n) {
  return Math.round(n).toLocaleString('ru-RU');
}
