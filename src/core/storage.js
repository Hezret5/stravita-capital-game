// Сохранение прогресса и внутренней статистики KPI в LocalStorage.
// Внешние БД и серверы не используются (требование ТЗ).

const SAVE_KEY = 'stravita-save-v1';
const STATS_KEY = 'stravita-stats-v1';

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* приватный режим — играем без сохранения */ }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function clearGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// Внутренняя статистика: старты, завершения, клики по CTA (для оценки KPI)
export function readStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || { started: 0, completed: 0, ctaClicks: 0 };
  } catch (e) {
    return { started: 0, completed: 0, ctaClicks: 0 };
  }
}

function writeStats(stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {}
}

export function trackStart() {
  const s = readStats();
  s.started += 1;
  writeStats(s);
}

export function trackComplete() {
  const s = readStats();
  s.completed += 1;
  writeStats(s);
}

export function trackCta() {
  const s = readStats();
  s.ctaClicks += 1;
  writeStats(s);
}
