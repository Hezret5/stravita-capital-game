# -*- coding: utf-8 -*-
"""Генерация PDF-отчёта по игровому прототипу «Стравита: Капитал жизни»."""
import os
from PIL import Image
from fpdf import FPDF

ROOT = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(ROOT, 'shots')
OUT = os.path.join(ROOT, 'Отчет-Стравита-Капитал-жизни.pdf')

GREEN = (0, 150, 57)
BLUE = (0, 47, 108)
DARK = (30, 41, 59)
GRAY = (100, 116, 139)
LIGHT = (231, 236, 243)

ARIAL = r'C:\Windows\Fonts\arial.ttf'
ARIAL_BD = r'C:\Windows\Fonts\arialbd.ttf'


def crop_to_content(src, dst, tol=16, inset=4, bg=None):
    """Обрезает однотонные поля вокруг колонки приложения на скриншоте."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    px = im.load()
    if bg is None:
        bg = px[2, 2]

    def diff(c):
        return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2])

    mid_y, mid_x = h // 2, w // 2
    x0 = next((x for x in range(w) if diff(px[x, mid_y]) > tol), 0)
    x1 = next((x for x in range(w - 1, -1, -1) if diff(px[x, mid_y]) > tol), w - 1)
    y0 = next((y for y in range(h) if diff(px[mid_x, y]) > tol), 0)
    y1 = next((y for y in range(h - 1, -1, -1) if diff(px[mid_x, y]) > tol), h - 1)
    if x1 - x0 < w * 0.35:  # обрезка не удалась — оставляем как есть
        im.save(dst)
    else:
        im.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset)).save(dst)
    return dst


class PDF(FPDF):
    def brand_bar(self, page_label):
        self.set_fill_color(*GREEN)
        self.rect(0, 0, 210, 20, 'F')
        self.set_xy(12, 6)
        self.set_font('Arial', 'B', 12)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, 'СТРАВИТА · КАПИТАЛ ЖИЗНИ')
        self.set_font('Arial', '', 9)
        self.set_xy(120, 6.5)
        self.cell(78, 8, page_label, align='R')
        self.set_y(26)

    def h2(self, text):
        self.set_text_color(*BLUE)
        self.set_font('Arial', 'B', 12.5)
        self.set_x(12)
        self.cell(0, 7, text, new_x='LMARGIN', new_y='NEXT')
        self.ln(0.8)

    def para(self, text, size=10.5, color=DARK, style=''):
        self.set_text_color(*color)
        self.set_font('Arial', style, size)
        self.set_x(12)
        self.multi_cell(186, 5.4, text, align='L', new_x='LMARGIN', new_y='NEXT')
        self.ln(1.5)

    def bullets(self, items):
        self.set_text_color(*DARK)
        self.set_font('Arial', '', 10.2)
        for it in items:
            self.set_fill_color(*GREEN)
            y = self.get_y() + 1.5
            self.rect(14.5, y, 2.2, 2.2, 'F')
            self.set_x(19)
            self.multi_cell(179, 5.1, it, align='L', new_x='LMARGIN', new_y='NEXT')
            self.ln(0.7)
        self.ln(0.6)


def build():
    mobile = crop_to_content(os.path.join(SHOTS, 'mobile-game.png'),
                             os.path.join(SHOTS, 'mobile-game-crop.png'), bg=(51, 51, 51))
    start = crop_to_content(os.path.join(SHOTS, 'start.png'),
                            os.path.join(SHOTS, 'start-crop.png'))
    final = crop_to_content(os.path.join(SHOTS, 'final.png'),
                            os.path.join(SHOTS, 'final-crop.png'))

    pdf = PDF()
    pdf.add_font('Arial', '', ARIAL)
    pdf.add_font('Arial', 'B', ARIAL_BD)
    pdf.set_auto_page_break(True, margin=12)
    pdf.add_page()
    pdf.brand_bar('Отчёт о игровом прототипе · октябрь 2026')
    pdf.ln(8)

    pdf.set_text_color(*BLUE)
    pdf.set_font('Arial', 'B', 16.5)
    pdf.set_x(12)
    pdf.multi_cell(186, 7.6, '«Капитал жизни» — обучающая игра для клиентов «Стравиты»', align='L')
    pdf.ln(0.5)
    pdf.para('Краткий отчёт о проделанной работе: что за игра, как она устроена, '
             'что проверено и как её опубликовать. Всё написано простым языком.')

    pdf.h2('Суть проекта')
    pdf.para('Мы сделали игру-симулятор для сайта «Стравиты». Игрок проживает жизнь '
             'от 25 до 65 лет и принимает простые финансовые решения: копить или тратить, '
             'страховаться или рисковать, откладывать на пенсию сегодня или отложить на потом. '
             'Игра наглядно показывает, как работают накопления, страховая защита и сложный процент, '
             'и в конце приглашает игрока оформить реальные программы «Стравиты».')

    pdf.h2('Что сделано')
    pdf.bullets([
        'Игра проходит за 2–4 минуты: 19 карточек с решениями и 6 викторин-мифов.',
        'Четыре понятных показателя на экране: капитал, страховая защита, будущая пенсия, финансовая грамотность.',
        'Работают «правила жизни»: деньги растут по сложному проценту, страховка принимает удар на себя, '
        'кредиты уменьшают свободные деньги.',
        'В конце игрок получает индекс финансовой устойчивости (0–100), титул — от «Новичка» до «Легенды капитала» — '
        'и место среди 100 участников.',
        'Кнопка «Поделиться результатом» и 7 ссылок на страницы «Стравиты»: оформление договора онлайн, '
        'калькулятор пенсии, страхование жизни, детское страхование и налоговые льготы.',
        'Игра одинаково хорошо работает на телефоне (вертикальный экран) и на компьютере; '
        'её можно встроить в любую страницу сайта.',
        'Прогресс сохраняется только в браузере игрока — никакие личные данные не собираются.',
    ])

    pdf.h2('Как это выглядит')
    iw, ih = Image.open(start).size
    h = 88
    w = h * iw / ih
    pdf.image(start, x=(210 - w) / 2, w=w)
    pdf.set_text_color(*GRAY)
    pdf.set_font('Arial', '', 8.8)
    pdf.cell(0, 4, 'Стартовый экран: игрок видит, что его ждёт, и начинает партию одной кнопкой.', align='C')

    # ---------- страница 2 ----------
    pdf.add_page()
    pdf.brand_bar('Отчёт о игровом прототипе · страница 2')
    pdf.ln(10)

    pdf.h2('Что игрок запомнит: 6 мифов')
    pdf.bullets([
        '«Наличка безопаснее» — на самом деле деньги в договоре растут, а наличные съедает инфляция.',
        '«Страхование — только при несчастье» — на самом деле это «2 в 1»: накопление плюс защита.',
        '«Я молодой, мне рано думать о пенсии» — на самом деле чем раньше начнёшь, тем меньше платишь.',
        '«Досрочно заберу — верну всё» — на самом деле досрочное расторжение всегда в убыток.',
        '«Налоги всё съедят» — на самом деле взносы и выплаты налогом не облагаются, часть взносов возвращается.',
        '«Пенсия — вопрос после 50» — на самом деле главный союзник накоплений это время.',
    ])

    pdf.h2('Проверка в браузере')
    pdf.bullets([
        'Игра полностью пройдена от первой карточки до финала — все 19 карточек на месте, подсчёты верны.',
        'Проверены сохранение и продолжение игры, кнопка «Поделиться», все ссылки открываются в новой вкладке.',
        'Отдельно проверен вид на узком экране телефона — ничего не съезжает, кнопки удобно нажимать пальцем.',
        'Игра встроена в стороннюю страницу как «встроенное окно» — работает корректно.',
        'Вся игра весит около 0,2 МБ (допустимо было до 7 МБ) и открывается моментально даже на слабом интернете.',
        'Работает в свежих версиях Chrome, Safari, Firefox и Edge — на компьютере и на телефоне.',
    ])

    mw, mh = Image.open(mobile).size
    fw, fh = Image.open(final).size
    h_img = 82
    w_mob = h_img * mw / mh
    w_fin = h_img * fw / fh
    x0 = (210 - w_mob - 5 - w_fin) / 2
    y_img = pdf.get_y() + 1
    pdf.image(mobile, x=x0, y=y_img, w=w_mob)
    pdf.image(final, x=x0 + w_mob + 5, y=y_img, w=w_fin)
    pdf.set_y(y_img + h_img + 1.5)
    pdf.set_text_color(*GRAY)
    pdf.set_font('Arial', '', 8.8)
    pdf.cell(0, 4, 'Слева — вид на телефоне; справа — финальный экран с индексом устойчивости.', align='C')
    pdf.ln(4.5)

    pdf.h2('Технические данные в двух словах')
    pdf.bullets([
        'Игра не требует установки: открывается в браузере по обычной ссылке.',
        'Внешние серверы и базы данных не используются — игра полностью автономна.',
        'Пакет игры можно опубликовать на любом хостинге сайтов (например, GitHub Pages, Vercel или Netlify) — '
        'после этого игра будет доступна по постоянной ссылке.',
        'Игру можно вставить в страницу сайта «Стравиты» как встроенное окно.',
    ])

    pdf.set_auto_page_break(False)
    pdf.set_y(-16)
    pdf.set_draw_color(*LIGHT)
    pdf.line(12, pdf.get_y() - 2, 198, pdf.get_y() - 2)
    pdf.set_text_color(*GRAY)
    pdf.set_font('Arial', '', 8.5)
    pdf.cell(0, 5, 'ЗАО «Стравита» · stravita.by · Игровой прототип «Капитал жизни» · октябрь 2026', align='C')

    pdf.output(OUT)
    print('OK:', OUT, os.path.getsize(OUT), 'bytes')


if __name__ == '__main__':
    build()
