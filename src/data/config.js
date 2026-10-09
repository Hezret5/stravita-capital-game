// Конфигурация игры: бренд, ссылки на продукты «Стравиты», титулы, параметры экономики

export const BRAND = {
  name: 'Стравита',
  site: 'https://stravita.by',
  green: '#009639',
  blue: '#002F6C'
};

// Целевые ссылки (открываются в новой вкладке). Используются на финальном экране и в подсказках
export const LINKS = [
  {
    id: 'contract',
    title: 'Заключить договор онлайн',
    desc: 'Личный кабинет нового клиента',
    url: 'https://newclient.stravita.by/login/?next=/',
    primary: true
  },
  {
    id: 'calc',
    title: 'Калькулятор ДНПС',
    desc: 'Рассчитайте свою будущую пенсию',
    url: 'https://stravita.by/programmy-straxovaniya/dobrovolnoe-straxovanie-dopolnitelnoj-nakopitelnoj-pensii/#calculator'
  },
  {
    id: 'life',
    title: 'Страхование жизни',
    desc: 'Программы «Свой подход», «Все включено», «Мечтай смелее»',
    url: 'https://stravita.by/programmy-straxovaniya/straxovanie-zhizni/'
  },
  {
    id: 'kids',
    title: 'Детское страхование',
    desc: 'Программа «Для самых маленьких»',
    url: 'https://stravita.by/programmy-straxovaniya/detskoe-straxovanie/'
  },
  {
    id: 'pension',
    title: 'Пенсионное страхование (ДНПС)',
    desc: 'Дополнительная накопительная пенсия',
    url: 'https://stravita.by/programmy-straxovaniya/dobrovolnoe-straxovanie-dopolnitelnoj-nakopitelnoj-pensii/'
  },
  {
    id: 'tax',
    title: 'Налоговые льготы',
    desc: 'Возврат подоходного налога за взносы',
    url: 'https://stravita.by/customer-support/tax-exemptions/'
  }
];

// Титулы по индексу финансовой устойчивости
export const TITLES = [
  { min: 0, name: 'Новичок', note: 'Финансовый путь только начинается — и это нормально.' },
  { min: 35, name: 'Осторожный вкладчик', note: 'Вы умеете беречь деньги и не поддаваться соблазнам.' },
  { min: 55, name: 'Стравита-стратег', note: 'Вы думаете на шаг вперёд: защита плюс накопления.' },
  { min: 75, name: 'Мастер длинного горизонта', note: 'Сложный процент — ваш надёжный союзник.' },
  { min: 90, name: 'Легенда капитала', note: 'Капитал, защита и длинный горизонт — вы собрали всё воедино!' }
];

// Параметры экономики (сбалансированы для сессии 2–4 минуты)
export const ECONOMY = {
  startCapital: 500,          // стартовый капитал, BYN
  capitalGrowth: 0.05,        // доходность накоплений в год (5%)
  pensionGrowth: 0.07,        // доходность ДНПС в год (7%)
  taxBack: 0.13,              // возврат подоходного налога с взносов ДНПС (13%)
  pensionFactor: 0.05,        // «безопасная ставка изъятия» для расчёта пенсии в месяц
  maxShield: 3,               // максимальный уровень щита
  shieldAbsorb: [0, 0.35, 0.65, 0.9], // доля урона, которую поглощает щит
  literacyMax: 15,
  ageStart: 25,
  ageEnd: 65,
  // Оценка капитала для индекса: капитал+ДНПС, линейная шкала до 200 000 BYN
  indexCapitalMax: 200000,
  indexPensionMax: 800        // пенсия 800 BYN/мес даёт максимум очков
};

export function titleFor(index) {
  let t = TITLES[0];
  for (const item of TITLES) if (index >= item.min) t = item;
  return t;
}
