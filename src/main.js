// Главный модуль: экраны, игровой цикл, переходы

import { ECONOMY, LINKS, titleFor } from './data/config.js';
import { BOTS, placeFor } from './data/bots.js';
import {
  initialState, buildTimeline, advanceYears, applyEffects,
  pensionMonthly, computeIndex, shareText, formatMoney
} from './core/engine.js';
import {
  saveGame, loadGame, clearGame, trackStart, trackComplete, trackCta
} from './core/storage.js';
import { icon } from './ui/icons.js';
import './styles.css';

const app = document.getElementById('app');
const TIMELINE = buildTimeline();

let state = null;
let phase = 'card';        // card | feedback
let feedback = null;       // { deltas, text, correct, myth }
let currentCard = null;    // карточка текущего хода (в фазе feedback visibleCard не вызываем)

// Логотип «Стравиты» (стилизованный график в зелёном квадрате)
const LOGO_SVG = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
  <rect width="32" height="32" rx="7" fill="#009639"/>
  <path d="M8 22V10l8 6 8-6v12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function header(home = false) {
  return `
  <header class="topbar">
    <a class="brand" href="https://stravita.by" target="_blank" rel="noopener noreferrer" aria-label="Перейти на сайт Стравита">
      ${LOGO_SVG}
      <span class="brand-name">СТРАВИТА</span>
    </a>
    ${home ? '' : `<span class="topbar-tag">Капитал жизни</span>`}
  </header>`;
}

function fmtDelta(v) {
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return sign + formatMoney(Math.abs(v));
}

// ---------- ЭКРАН: СТАРТ ----------

function renderStart() {
  const saved = loadGame();
  app.innerHTML = `
  <div class="screen start-screen">
    ${header(true)}
    <main class="start-body">
      <div class="start-hero">
        ${LOGO_SVG}
        <h1 class="game-title">Капитал&nbsp;жизни</h1>
        <p class="start-sub">Финансовая игра от «Стравиты»: проживите 40&nbsp;лет — с&nbsp;25 до&nbsp;65&nbsp;— и&nbsp;проверьте, как&nbsp;работают накопления, защита и&nbsp;сложный процент.</p>
      </div>
      <ul class="start-points">
        <li>${icon('chart-up')} Принимайте решения — капитал, щит и пенсия изменяются сразу</li>
        <li>${icon('bulb')} Разберите 6 популярных мифов о деньгах и пенсии</li>
        <li>${icon('award')} Получите индекс устойчивости, титул и место в рейтинге</li>
      </ul>
      <div class="start-actions">
        <button class="btn btn-primary btn-lg" id="btn-start">${icon('play')} Начать игру</button>
        ${saved && saved.cardIndex > 0 ? `<button class="btn btn-ghost" id="btn-continue">${icon('refresh')} Продолжить (возраст ${saved.age})</button>` : ''}
      </div>
      <p class="start-note">Игра занимает 2–4 минуты. Данные не собираются, прогресс хранится только в вашем браузере.</p>
    </main>
    <footer class="start-footer">
      <a href="https://stravita.by" target="_blank" rel="noopener noreferrer">stravita.by ${icon('external')}</a>
    </footer>
  </div>`;

  document.getElementById('btn-start').onclick = () => {
    clearGame();
    state = initialState();
    trackStart();
    saveGame(state);
    renderGame();
  };
  const cont = document.getElementById('btn-continue');
  if (cont) cont.onclick = () => {
    state = loadGame();
    trackStart();
    renderGame();
  };
}

// ---------- ЭКРАН: ИГРА (HUD + карточка) ----------

function sparkline(history) {
  const w = 320, h = 56, pad = 2;
  const pts = history.map((p) => p.capital + p.pot);
  const max = Math.max(...pts, 100);
  const step = (w - pad * 2) / Math.max(pts.length - 1, 1);
  const coords = pts.map((v, i) => `${(pad + i * step).toFixed(1)},${(h - pad - (v / max) * (h - pad * 2)).toFixed(1)}`);
  const line = coords.join(' ');
  const area = `M${pad},${h - pad} L${coords.join(' L')} L${(pad + (pts.length - 1) * step).toFixed(1)},${h - pad} Z`;
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="График роста капитала">
    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#009639" stop-opacity="0.35"/><stop offset="1" stop-color="#009639" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#sg)"/>
    <polyline points="${line}" fill="none" stroke="#009639" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function hud(cardNumber, totalCards) {
  const s = state;
  const progress = ((s.age - ECONOMY.ageStart) / (ECONOMY.ageEnd - ECONOMY.ageStart)) * 100;
  const shieldDots = [1, 2, 3].map((i) => `<i class="dot ${s.shield >= i ? 'on' : ''}"></i>`).join('');
  return `
  <section class="hud">
    <div class="hud-row">
      <div class="hud-age"><strong>${s.age}</strong> лет</div>
      <div class="hud-progress"><div class="bar"><i style="width:${progress}%"></i></div>
        <span class="hud-count">Карточка ${cardNumber} из ${totalCards}</span></div>
      <button class="btn-icon" id="btn-reset" aria-label="Начать заново">${icon('refresh')}</button>
    </div>
    <div class="res-grid">
      <div class="res" title="Капитал">${icon('wallet')}<div><b>${formatMoney(s.capital)}</b><span>капитал, BYN</span></div></div>
      <div class="res" title="Страховой щит">${icon('shield')}<div><b class="dots">${shieldDots}</b><span>защита</span></div></div>
      <div class="res" title="Пенсия по ДНПС">${icon('coins')}<div><b>${formatMoney(pensionMonthly(s))}</b><span>пенсия, BYN/мес</span></div></div>
      <div class="res" title="Финансовая грамотность">${icon('book')}<div><b>${s.literacy}<i class="lite">/${ECONOMY.literacyMax}</i></b><span>грамотность</span></div></div>
    </div>
    ${sparkline(s.history)}
  </section>`;
}

function deltaChips(deltas) {
  if (!deltas) return '';
  const chips = [];
  const chip = (label, val, cls) => `<span class="chip ${cls}">${label} <b>${fmtDelta(val)}</b></span>`;
  if (deltas.capital) chips.push(chip('Капитал', deltas.capital, deltas.capital > 0 ? 'up' : 'down'));
  if (deltas.pot) chips.push(chip('ДНПС', deltas.pot, 'up'));
  if (deltas.dmg) chips.push(chip('Урон по капиталу', deltas.dmg, 'down'));
  if (deltas.absorbed) chips.push(`<span class="chip shielded">${icon('shield')} Щит поглотил <b>${formatMoney(deltas.absorbed)} BYN</b></span>`);
  if (deltas.shield) chips.push(`<span class="chip up">${icon('shieldPlus')} Защита ур.${state.shield}</span>`);
  if (deltas.dnpsMonthly) chips.push(`<span class="chip up">Взнос ДНПС <b>${deltas.dnpsMonthly > 0 ? '+' : ''}${deltas.dnpsMonthly} BYN/мес</b></span>`);
  if (deltas.income) chips.push(`<span class="chip up">Доход <b>${fmtDelta(deltas.income)} BYN/год</b></span>`);
  if (deltas.literacy) chips.push(chip('Грамотность', deltas.literacy, deltas.literacy > 0 ? 'up' : 'down'));
  return chips.length ? `<div class="chips">${chips.join('')}</div>` : '';
}

function contextLink(id) {
  const map = {
    'dnps-offer': 'pension', 'life-insurance': 'life', 'myth-taxes': 'tax',
    'myth-pension-50': 'pension', 'myth-cash': 'calc', 'myth-early-withdraw': 'tax'
  };
  const link = LINKS.find((l) => l.id === map[id]);
  if (!link) return '';
  return `<a class="ctx-link" href="${link.url}" target="_blank" rel="noopener noreferrer" data-cta>${link.title} ${icon('external')}</a>`;
}

function visibleCard() {
  while (state.cardIndex < TIMELINE.length) {
    const card = TIMELINE[state.cardIndex];
    if (!card.condition || card.condition(state)) return card;
    state.cardIndex += 1;
  }
  return null;
}

function renderGame() {
  // В фазе feedback карточка уже выбрана: visibleCard() может безвозвратно
  // перескочить condition-карточку (например, «Биржа» после продажи акций)
  if (phase === 'card') {
    const card = visibleCard();
    if (!card) return renderFinal();
    currentCard = card;
  }
  const card = currentCard;

  const cardsPassed = state.cardIndex;
  const mythNum = TIMELINE.slice(0, state.cardIndex + 1).filter((c) => c.kind === 'myth').length;

  app.innerHTML = `
  <div class="screen game-screen">
    ${header()}
    ${hud(cardsPassed + 1, TIMELINE.length)}
    <main class="card-zone">
      <article class="event-card ${phase === 'feedback' ? 'resolved' : ''}">
        <div class="event-icon ${card.kind === 'myth' ? 'myth' : ''}">${icon(card.icon)}</div>
        <h2 class="event-title">${card.title}</h2>
        ${phase === 'card' ? `
          <p class="event-text">${card.question || card.text}</p>
          <div class="options" role="group" aria-label="Варианты ответа">
            ${card.options.map((o, i) => `
              <button class="btn option" data-i="${i}">
                <span class="opt-key">${['А', 'Б', 'В'][i]}</span>${o.text}
              </button>`).join('')}
          </div>` : `
          <div class="feedback ${feedback.correct === false ? 'bad' : feedback.correct === true ? 'good' : ''}">
            ${feedback.correct === true ? `<div class="verdict">${icon('award')} Верно!</div>` : ''}
            ${feedback.correct === false ? `<div class="verdict bad">${icon('bulb')} Не совсем</div>` : ''}
            <p class="fb-text">${feedback.text}</p>
            ${feedback.explain ? `<p class="fb-explain">${feedback.explain}</p>` : ''}
            ${deltaChips(feedback.deltas)}
            ${feedback.mythId ? contextLink(feedback.mythId) : contextLink(card.id)}
            <button class="btn btn-primary btn-lg" id="btn-next">Дальше ${icon('arrowUp')}</button>
          </div>`}
        ${card.kind === 'myth' && phase === 'card' ? `<span class="myth-badge">Миф ${mythNum} из 6</span>` : ''}
      </article>
    </main>
  </div>`;

  wireGame(card);
}

function wireGame(card) {
  document.getElementById('btn-reset').onclick = confirmReset;

  if (phase === 'card') {
    app.querySelectorAll('.option').forEach((btn) => {
      btn.onclick = () => chooseOption(card, card.options[Number(btn.dataset.i)]);
    });
  } else {
    document.getElementById('btn-next').onclick = nextCard;
  }
}

function chooseOption(card, option) {
  if (card.kind === 'myth') {
    const correct = !!option.correct;
    state.mythResults[card.id] = correct ? 1 : 0;
    const litDelta = correct ? 2 : 0;
    const deltas = applyEffects(state, { literacy: litDelta });
    feedback = {
      text: option.feedback,
      explain: card.explain,
      correct,
      deltas,
      mythId: card.id
    };
  } else {
    const deltas = applyEffects(state, option.effects);
    feedback = { text: option.feedback, deltas, correct: null };
  }
  phase = 'feedback';
  saveGame(state);
  renderGame();
}

function nextCard() {
  feedback = null;
  phase = 'card';
  // Продвигаем время до возраста следующей карточки (сложный процент)
  const next = (() => {
    let i = state.cardIndex + 1;
    while (i < TIMELINE.length && TIMELINE[i].condition && !TIMELINE[i].condition(state)) i += 1;
    return i;
  })();
  if (next < TIMELINE.length) {
    advanceYears(state, TIMELINE[next].age);
    state.cardIndex = next;
    saveGame(state);
    renderGame();
  } else {
    advanceYears(state, ECONOMY.ageEnd);
    state.cardIndex = TIMELINE.length;
    saveGame(state);
    renderFinal();
  }
}

function confirmReset() {
  if (app.querySelector('.confirm-pop')) return;
  const pop = document.createElement('div');
  pop.className = 'confirm-pop';
  pop.setAttribute('role', 'alertdialog');
  pop.innerHTML = `
    <div class="confirm-box">
      <p>Начать заново? Текущий прогресс будет сброшен.</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" data-x>Отмена</button>
        <button class="btn btn-danger" data-ok>Начать заново</button>
      </div>
    </div>`;
  pop.querySelector('[data-x]').onclick = () => pop.remove();
  pop.querySelector('[data-ok]').onclick = () => {
    pop.remove();
    clearGame();
    state = initialState();
    trackStart();
    saveGame(state);
    phase = 'card'; feedback = null; currentCard = null;
    renderGame();
  };
  app.appendChild(pop);
}

// ---------- ЭКРАН: ФИНАЛ ----------

function gauge(index) {
  const r = 54, c = 2 * Math.PI * r, off = c * (1 - index / 100);
  const color = index >= 75 ? '#009639' : index >= 55 ? '#009639' : index >= 35 ? '#F5A623' : '#D64545';
  return `<svg class="gauge" viewBox="0 0 128 128" role="img" aria-label="Индекс устойчивости ${index} из 100">
    <circle cx="64" cy="64" r="${r}" fill="none" stroke="#E7ECF3" stroke-width="10"/>
    <circle cx="64" cy="64" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 64 64)"/>
    <text x="64" y="60" text-anchor="middle" class="gauge-num">${index}</text>
    <text x="64" y="80" text-anchor="middle" class="gauge-cap">из 100</text>
  </svg>`;
}

function ratingBlock(place, index) {
  const around = BOTS.map((b) => ({ ...b, me: false }));
  const meRow = { id: 'me', score: index, name: 'Вы', me: true };
  const full = [...around, meRow].sort((a, b) => b.score - a.score);
  const myPos = full.findIndex((r) => r.me);
  const slice = full.slice(Math.max(0, myPos - 2), myPos + 3);
  return `
  <div class="rating">
    <h3 class="block-title">${icon('crown')} Рейтинг: ${place}-е место из 100</h3>
    <ol class="rating-list">
      ${slice.map((r) => `
        <li class="${r.me ? 'me' : ''}">
          <span class="r-place">${full.indexOf(r) + 1}</span>
          <span class="r-name">${r.name}</span>
          <span class="r-score">${r.score}</span>
        </li>`).join('')}
    </ol>
  </div>`;
}

function renderFinal() {
  clearGame();
  trackComplete();

  const index = computeIndex(state);
  const place = placeFor(index);
  const title = titleFor(index);
  const pension = pensionMonthly(state);
  const correctMyths = Object.values(state.mythResults).filter(Boolean).length;
  const text = shareText(state, index, title, place);

  app.innerHTML = `
  <div class="screen final-screen">
    ${header()}
    <main class="final-body">
      <div class="final-hero">
        ${icon(title.min >= 75 ? 'crown' : 'award')}
        <h1 class="final-title">${title.name}</h1>
        <p class="final-note">${title.note}</p>
      </div>

      <div class="final-gauge">${gauge(index)}
        <span class="gauge-label">Индекс финансовой устойчивости</span>
      </div>

      <div class="final-stats">
        <div class="fstat">${icon('wallet')}<b>${formatMoney(state.capital + state.pot)} BYN</b><span>итоговый капитал</span></div>
        <div class="fstat">${icon('coins')}<b>${formatMoney(pension)} BYN/мес</b><span>пассивный доход</span></div>
        <div class="fstat">${icon('shield')}<b>уровень ${state.shield}</b><span>страховая защита</span></div>
        <div class="fstat">${icon('bulb')}<b>${correctMyths} из 6</b><span>мифов разобрано</span></div>
      </div>

      ${sparkline(state.history)}
      ${ratingBlock(place, index)}

      <div class="share-row">
        <button class="btn btn-ghost" id="btn-share">${icon('share')} Поделиться результатом</button>
      </div>

      <section class="cta-block">
        <h2 class="block-title">Ваша реальная «Капитал жизни» начинается здесь</h2>
        <p class="cta-note">В игре вы увидели, как работают накопления и защита. В «Стравите» это делают реальные программы — с гарантированной доходностью и страховкой.</p>
        <a class="btn btn-primary btn-lg" href="${LINKS[0].url}" target="_blank" rel="noopener noreferrer" data-cta>${icon('shieldPlus')} ${LINKS[0].title}</a>
        <div class="links-grid">
          ${LINKS.slice(1).map((l) => `
            <a class="link-card" href="${l.url}" target="_blank" rel="noopener noreferrer" data-cta>
              <b>${l.title}</b><span>${l.desc}</span>
              <span class="link-go">${icon('external')}</span>
            </a>`).join('')}
        </div>
      </section>

      <button class="btn btn-ghost" id="btn-again">${icon('refresh')} Играть снова</button>
    </main>
    <footer class="start-footer">ЗАО «Стравита» · <a href="https://stravita.by" target="_blank" rel="noopener noreferrer" data-cta>stravita.by</a></footer>
  </div>`;

  document.getElementById('btn-share').onclick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Стравита: Капитал жизни', text }); } catch (e) { /* отмена */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast('Результат скопирован в буфер обмена');
      } catch (e) { toast(text); }
    }
  };
  document.getElementById('btn-again').onclick = confirmReset;
  app.querySelectorAll('[data-cta]').forEach((a) => {
    a.addEventListener('click', trackCta, { once: true });
  });
}

// Всплывающее уведомление
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.remove(), 3500);
}

renderStart();
