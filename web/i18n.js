/* Trend Detective — languages.
 *
 * English is the source: fixed text is read from the page itself, generated
 * text is passed in by app.js as the fallback. This file only holds the other
 * languages. Method names (Mann–Kendall, Sen, Benjamini–Hochberg), dataset
 * names and the challenge title stay as published.
 *
 * Choice order: ?lang= in the address, then the last choice on this device,
 * then the browser's language, then English.
 */
(() => {
  "use strict";

  const ZH = {
    "nav.story": "故事", "nav.audit": "审计", "nav.map-section": "探索", "nav.sites": "站点", "nav.probe": "实时检验", "nav.method": "方法",

    "hero.kicker": "2026 NASA Space Apps 挑战赛 · Be An Earth System Trend Detective!",
    "hero.l1": "趋势来自", "hero.l2": "地球，", "hero.l3": "还是来自<em>样本？</em>",
    "hero.lede": "我们检验了 NASA 再分析数据中的 80 个气候趋势，做了错误发现率校正，然后审计了我们自己最好的那个故事。它没有通过。这个工具展示了原因。",
    "hero.cta1": "跟随证据 <span aria-hidden=\"true\">↓</span>", "hero.cta2": "观看影片 · 30 秒",
    "hero.logo": "官方活动标识 · 未作修改", "hero.scroll": "向下滚动",

    "s1.kicker": "01 · 一个地方",
    "s1.h": "达卡变凉了，<br>降雨却<em>增加了。</em>",
    "s1.cap1": "每十年 · 气温 · p = 0.012", "s1.cap2": "每十年 · 降雨量 · p &lt; 0.001",
    "s1.body": "在 35 年的 MERRA-2 数据里，这是一对醒目的趋势，也正是会登上标题的那种结果：雨更多，气温更低。于是我们问：别的地方也是这样吗？",

    "s2.kicker": "02 · 四十个站点",
    "s2.h": "八十次检验。<br><em>一次校正。</em>",
    "s2.r1": "个站点", "s2.r2": "个趋势接受检验", "s2.r2s": "Mann–Kendall + Sen 斜率，每个站点两个变量",
    "s2.r3": "个看起来显著", "s2.r3s": "原始 p &lt; 0.05", "s2.r4": "个通过校正",
    "s2.k1": "12 个我们挑选的地点", "s2.k2": "固定 20° 网格上的 28 个点",

    "s3.kicker": "03 · 审计",
    "s3.h": "然后我们审计了<em>自己。</em>",
    "s3.cap": "Spearman ρ：降雨趋势与气温趋势",
    "s3.body": "在我们挑选的 12 个站点上，变湿的地方变凉了。在没有人挑选的 28 个网格点上，这种关系消失了。规律在我们的样本里，不在地球上。",

    "s4.kicker": "04 · 探索",
    "s4.h": "四十个点。<em>转动地球，点击任意一个。</em>",
    "s4.globe": "地球", "s4.flat": "平面",
    "s4.hint": "颜色表示每十年的 Sen 斜率。变淡的点在 5% 水平上不显著。拖动可转动地球。",
    "s4.sel": "所选站点", "s4.l1": "年值", "s4.l3": "悬停图表，或用 ← → 逐年查看",

    "s5.kicker": "05 · 每个站点",
    "s5.h": "按变化排序，<em>不显著的也保留。</em>",
    "th.site": "站点", "th.region": "地区", "th.dec": "每十年", "th.verdict": "结论",

    "s6.kicker": "06 · 实时检验",
    "s6.h": "在一个<em>我们从未挑选的点</em>上运行检验。",
    "s6.meta": "输入坐标或选择一个城市。页面会实时获取 NASA POWER 月度数据，并完全在你的浏览器中运行同样的 Mann–Kendall 检验和 Sen 斜率。每次运行只向 power.larc.nasa.gov 发送一个请求。",
    "s6.run": "运行检验", "s6.status": "选择一个点，然后运行检验。",
    "city.Tokyo": "东京", "city.Nairobi": "内罗毕", "city.São Paulo": "圣保罗", "city.Cairo": "开罗", "city.Chicago": "芝加哥", "city.Perth": "珀斯",
    "p.range": "请输入 −90 到 90 之间的纬度和 −180 到 180 之间的经度。",
    "p.fetch": "正在获取 NASA POWER 月度点数据…",
    "p.none": "该点没有完整年份的数据（开阔水域或冰盖）。请换一个点。",
    "p.done": "{lat}°、{lon}° 的实时结果：由同一个 NASA POWER 月度点 API（MERRA-2）在你的浏览器中计算得出。",
    "p.note": "单独一次新检验没有多重比较族，因此直接报告原始 p；本页的 FDR 校正针对的是预先计算的 80 个站点检验。再分析数值是模式估计，不是温度计读数。",
    "p.fail": "无法连接 NASA POWER（{e}）。上方预先计算的 40 个站点结果不受影响。",
    "p.sig": "显著（原始 p）",

    "f.kicker": "方法与致谢", "f.h1": "方法", "f.h2": "数据与致谢", "f.h3": "AI 使用声明",
    "f.p1": "年值来自 NASA POWER 月度点数据（MERRA-2 再分析），1991–2025 年。趋势用 Mann–Kendall 检验（双侧，结值校正）和 Sen 斜率，在 <code>ingest.py</code> 中计算。多重比较用 Benjamini–Hochberg 方法控制。显著的趋势是变化的证据，而不是对变化的解释：再分析的网格值是模式估计，不是温度计读数，而且 35 年对于区分趋势和多年代际周期来说并不长。",
    "f.p2": "<a href=\"https://power.larc.nasa.gov/docs/services/api/temporal/monthly/\" target=\"_blank\" rel=\"noopener\">NASA POWER 月度点 API</a>（MERRA-2，AG 社区）· <code>T2M</code>、<code>PRECTOTCORR</code>。地球影像：NASA Blue Marble 与 Black Marble（NASA Earth Observatory）。地图轮廓：Natural Earth 1:110m（公有领域）。方法：Mann (1945)；Kendall (1975)；Sen (1968)；Benjamini &amp; Hochberg (1995)。",
    "f.p3": "NASA 和 NASA Space Apps Challenge 标识为官方活动标识，未作修改，仅用于标明所参加的挑战。挑战：<em>Be An Earth System Trend Detective!</em>",
    "f.p4": "<strong>DeepSeek V4.1 Flash Fast</strong> 在团队的指导和审核下，用于分析流程、<code>ingest.py</code>、网页演示以及文稿初稿。本页的每个数字都来自在公开数据上运行已提交的代码；没有任何图表、统计量或结论由语言模型生成。统计方法（Mann–Kendall、Sen 斜率、Benjamini–Hochberg）均为已发表的标准方法，由团队选定并审核。",
    "f.base": "2026 NASA Space Apps 挑战赛 · aini 团队", "f.top": "回到顶部 ↑",

    "var.t2m.label": "2 米气温", "var.t2m.short": "气温", "var.t2m.units": "°C",
    "var.precip.label": "降水量", "var.precip.short": "降水", "var.precip.units": "毫米/年",
    "u.mm": "毫米", "u.decade": "十年", "u.perDecade": "每十年",
    "ax.y": "气温趋势（°C 每十年）", "ax.x": "降水趋势（% 每十年）",
    "sc.rho": "Spearman ρ：挑选站点 {a}（n={na}）· 网格 {b}（n={nb}）· 全部 {c}",
    "sc.note": "每个点代表一个站点。{na} 个挑选的站点，{nb} 个系统网格点，同样的 {y} 年。变淡的点：气温趋势在 5% 水平上不显著。",
    "sc.chip": "{b} 个趋势中有 {a} 个通过 FDR（q = {q}）",
    "strip.split": "{a} 个挑选 · {b} 个网格",
    "strip.rho": "挑选站点 <b>{a}</b>（n={na}）→ 网格 <i>{b}</i>（n={nb}）",
    "read.collapse": "我们在 {na} 个挑选的站点中发现了这种关系：ρ = {a}。在没有人挑选的 {nb} 个网格点上，它是 {b}。这就是选择偏差的样子：规律在我们对地点的选择里，不在地球上。我们报告的是审计，而不是标题。",
    "read.holds": "在 {n} 个站点中，降雨趋势与气温趋势方向相反（Spearman ρ = {c}），并且这种关系在两个子集中都成立，所以它并不只是因为我们看了哪些地方。",
    "read.null": "在 {n} 个站点中，降雨趋势与气温趋势没有很强的关联（Spearman ρ = {c}）。应当如实报告这个零结果，而不是去找一个故事。",
    "tip.rain": "降雨", "tip.temp": "气温", "tip.trend": "趋势", "tip.vs": "相对趋势",
    "v.fdr": "通过 FDR", "v.raw": "仅原始 p", "v.ns": "不显著",
    "vd.fdr": "显著 · 通过 FDR", "vd.raw": "显著 · 仅原始 p",
    "live": "{y} 年：{v} {u}，相对趋势 {d}。",
    "meta.years": "{n} 个完整年份",
    "st.slope": "Sen 斜率", "st.rel": "相对趋势", "st.na": "不适用", "st.ratio": "仅适用于比例尺度", "st.p": "Mann–Kendall p", "st.delta": "首个 → 最后一个十年",
    "dir.up": "上升", "dir.down": "下降", "grade.flat": "基本持平", "grade.about": "约 {m} {u}",
    "read.sig": "{name}呈{dir}趋势，每十年{grade}。按 Mann–Kendall 检验（p = {p}），如此一致的变化不太可能是偶然；第一个十年平均为 {a} {u}，最后一个十年为 {b} {u}。{note}",
    "read.ns": "{name}没有显示出该检验能与偶然区分开的趋势（p = {p}）；拟合斜率为每十年{grade}。{note}请注意“没有趋势的证据”和“有证据表明没有趋势”的区别：一个模式网格 35 年的数据不足以支持后一种说法。",
    "table.note": "{v} · 按每十年变化的绝对值排序 · n = {n} 个站点",
    "table.notePct": "{v} · 按每十年百分比变化的绝对值排序 · n = {n} 个站点",

    "region.Alaska": "阿拉斯加", "region.Amazon": "亚马孙", "region.Arctic": "北极", "region.Central Australia": "澳大利亚中部",
    "region.East Africa": "东非", "region.Mediterranean": "地中海", "region.North America": "北美", "region.North Atlantic": "北大西洋",
    "region.Sahel": "萨赫勒", "region.South Asia": "南亚", "region.Southern Africa": "南部非洲", "region.Systematic grid": "系统网格",
    "site.los-angeles": "洛杉矶，美国", "site.mau-forest": "茅森林，肯尼亚", "site.manaus": "马瑙斯，巴西", "site.nuuk": "努克，格陵兰",
    "site.niamey": "尼亚美，尼日尔", "site.dhaka": "达卡，孟加拉国", "site.alice-springs": "艾丽斯斯普林斯，澳大利亚", "site.reykjavik": "雷克雅未克，冰岛",
    "site.athens": "雅典，希腊", "site.chennai": "金奈，印度", "site.anchorage": "安克雷奇，美国", "site.cape-town": "开普敦，南非",
    "note.grid": "这是一个网格点，不是挑选的地点：它在看到任何数据之前就已选定。",
    "note.los-angeles": "团队所在的城市。沿海盆地，背后是沙漠。",
    "note.mau-forest": "土地覆盖项目中的那片地貌。高原上的森林孤岛。",
    "note.manaus": "亚马孙中部。这里重要的变量是降雨，而不是气温。",
    "note.nuuk": "在这里，平均值的微小变化会带动大量的冰。",
    "note.niamey": "萨赫勒的干旱与恢复是趋势检测的经典案例。",
    "note.dhaka": "季风的时间和总量，落在一片会泛滥的三角洲上。",
    "note.alice-springs": "干旱的内陆。是湿润地区趋势的良好对照。",
    "note.reykjavik": "受海洋调节的高纬度地区，位于大西洋中脊。",
    "note.athens": "夏季变干是这里最受关注的问题。",
    "note.chennai": "班加罗尔的邻居，位于孟加拉湾季风的边缘。",
    "note.anchorage": "高纬度变暖，在美国本土。",
    "note.cape-town": "南半球的地中海气候。",
  };

  const RU = {
    "nav.story": "История", "nav.audit": "Аудит", "nav.map-section": "Глобус", "nav.sites": "Точки", "nav.probe": "Живой тест", "nav.method": "Метод",

    "hero.kicker": "NASA Space Apps Challenge 2026 · Be An Earth System Trend Detective!",
    "hero.l1": "Это тренд", "hero.l2": "планеты", "hero.l3": "или <em>выборки?</em>",
    "hero.lede": "Мы проверили 80 климатических трендов в данных реанализа NASA, сделали поправку на ложные открытия, а затем проверили собственную лучшую историю. Она не выдержала проверки. Этот инструмент показывает почему.",
    "hero.cta1": "К доказательствам <span aria-hidden=\"true\">↓</span>", "hero.cta2": "Смотреть фильм · 30 с",
    "hero.logo": "официальная символика события · без изменений", "hero.scroll": "Листайте",

    "s1.kicker": "01 · Одно место",
    "s1.h": "В Дакке похолодало,<br>а дождей стало <em>больше.</em>",
    "s1.cap1": "за десятилетие · температура воздуха · p = 0.012", "s1.cap2": "за десятилетие · осадки · p &lt; 0.001",
    "s1.body": "Яркая пара трендов за 35 лет данных MERRA-2. Именно такой результат попадает в заголовки: больше дождей, прохладнее воздух. Поэтому мы спросили, повторяется ли это где-нибудь ещё.",

    "s2.kicker": "02 · Сорок точек",
    "s2.h": "Восемьдесят тестов.<br><em>Одна поправка.</em>",
    "s2.r1": "точек", "s2.r2": "трендов проверено", "s2.r2s": "Mann–Kendall + наклон Сена, две переменные на точку",
    "s2.r3": "выглядят значимыми", "s2.r3s": "исходное p &lt; 0.05", "s2.r4": "выдерживают поправку",
    "s2.k1": "12 мест, которые выбрали мы", "s2.k2": "28 точек на фиксированной сетке 20°",

    "s3.kicker": "03 · Аудит",
    "s3.h": "Затем мы проверили <em>самих себя.</em>",
    "s3.cap": "ρ Спирмена: тренд осадков и тренд температуры",
    "s3.body": "В 12 точках, которые выбрали мы, там, где стало влажнее, стало прохладнее. В 28 точках сетки, которые никто не выбирал, эта связь исчезает. Закономерность была в нашей выборке, а не в планете.",

    "s4.kicker": "04 · Глобус",
    "s4.h": "Сорок точек. <em>Вращайте глобус, выберите любую.</em>",
    "s4.globe": "Глобус", "s4.flat": "Карта",
    "s4.hint": "Цвет показывает наклон Сена за десятилетие. Бледные точки не значимы на уровне 5%. Перетаскивайте, чтобы повернуть глобус.",
    "s4.sel": "Выбранная точка", "s4.l1": "Годовое значение", "s4.l3": "Наведите курсор или листайте ← →",

    "s5.kicker": "05 · Все точки",
    "s5.h": "По величине изменения, <em>включая незначимые.</em>",
    "th.site": "Точка", "th.region": "Регион", "th.dec": "За десятилетие", "th.verdict": "Вывод",

    "s6.kicker": "06 · Живой тест",
    "s6.h": "Запустите тест <em>в точке, которую мы не выбирали.</em>",
    "s6.meta": "Введите координаты или выберите город. Страница загружает месячные данные NASA POWER и выполняет тот же тест Mann–Kendall и расчёт наклона Сена прямо в вашем браузере. Один запрос к power.larc.nasa.gov за запуск.",
    "s6.run": "Запустить", "s6.status": "Выберите точку и нажмите «Запустить».",
    "city.Tokyo": "Токио", "city.Nairobi": "Найроби", "city.São Paulo": "Сан-Паулу", "city.Cairo": "Каир", "city.Chicago": "Чикаго", "city.Perth": "Перт",
    "p.range": "Введите широту от −90 до 90 и долготу от −180 до 180.",
    "p.fetch": "Загружаем месячные данные NASA POWER…",
    "p.none": "В этой точке нет полных лет данных (открытая вода или ледяной щит). Попробуйте другую точку.",
    "p.done": "Результат для {lat}°, {lon}°: рассчитан в вашем браузере по тому же месячному API NASA POWER (MERRA-2).",
    "p.note": "У одиночного нового теста нет семейства множественных сравнений, поэтому исходное p приводится как есть; поправка FDR на этой странице относится к 80 заранее рассчитанным тестам. Значения реанализа являются модельными оценками, а не показаниями термометров.",
    "p.fail": "Не удалось связаться с NASA POWER ({e}). Заранее рассчитанные результаты по 40 точкам выше не затронуты.",
    "p.sig": "значимо (исходное p)",

    "f.kicker": "Метод и источники", "f.h1": "Метод", "f.h2": "Данные и источники", "f.h3": "Использование ИИ",
    "f.p1": "Годовые значения получены из месячных точечных данных NASA POWER (реанализ MERRA-2) за 1991–2025 годы. Тренд оценивается тестом Mann–Kendall (двусторонним, с поправкой на совпадения) и наклоном Сена; расчёт выполняет <code>ingest.py</code>. Множественные сравнения контролируются методом Benjamini–Hochberg. Значимый тренд свидетельствует об изменении, но не объясняет его: ячейки сетки реанализа являются модельными оценками, а не показаниями термометров, а 35 лет мало, чтобы отличить тренд от многодесятилетнего цикла.",
    "f.p2": "<a href=\"https://power.larc.nasa.gov/docs/services/api/temporal/monthly/\" target=\"_blank\" rel=\"noopener\">Месячный точечный API NASA POWER</a> (MERRA-2, сообщество AG) · <code>T2M</code>, <code>PRECTOTCORR</code>. Изображения Земли: NASA Blue Marble и Black Marble (NASA Earth Observatory). Контуры карты: Natural Earth 1:110m (общественное достояние). Методы: Mann (1945); Kendall (1975); Sen (1968); Benjamini &amp; Hochberg (1995).",
    "f.p3": "NASA и логотип NASA Space Apps Challenge являются официальной символикой события; они использованы без изменений и только для указания на конкурс. Задание: <em>Be An Earth System Trend Detective!</em>",
    "f.p4": "<strong>DeepSeek V4.1 Flash Fast</strong> использовался под руководством и контролем команды для конвейера анализа, <code>ingest.py</code>, веб-демо и первых черновиков текста. Каждое число на этой странице получено запуском опубликованного кода на открытых данных; ни один график, показатель или вывод не создан языковой моделью. Статистические методы (Mann–Kendall, наклон Сена, Benjamini–Hochberg) являются стандартными опубликованными методами, которые выбрала и проверила команда.",
    "f.base": "NASA Space Apps Challenge 2026 · Команда aini", "f.top": "Наверх ↑",

    "var.t2m.label": "Температура воздуха на высоте 2 м", "var.t2m.short": "Температура", "var.t2m.units": "°C",
    "var.precip.label": "Осадки", "var.precip.short": "Осадки", "var.precip.units": "мм/год",
    "u.mm": "мм", "u.decade": "10 лет", "u.perDecade": "за десятилетие",
    "ax.y": "Тренд температуры (°C за десятилетие)", "ax.x": "Тренд осадков (% за десятилетие)",
    "sc.rho": "ρ Спирмена: выбранные {a} (n={na}) · сетка {b} (n={nb}) · все {c}",
    "sc.note": "Одна точка на графике соответствует одному месту. Выбранных мест: {na}, точек систематической сетки: {nb}, одни и те же {y} лет. Бледные точки: тренд температуры не значим на уровне 5%.",
    "sc.chip": "{a} из {b} трендов выдерживают FDR (q = {q})",
    "strip.split": "выбранных: {a} · на сетке: {b}",
    "strip.rho": "выбранные <b>{a}</b> (n={na}) → сетка <i>{b}</i> (n={nb})",
    "read.collapse": "Мы нашли эту связь в выбранных нами местах (их {na}): ρ = {a}. В точках сетки, которые никто не выбирал (их {nb}), она равна {b}. Так выглядит эффект отбора: закономерность была в нашем выборе мест, а не в планете. Мы сообщаем результат аудита, а не заголовок.",
    "read.holds": "По всем точкам (их {n}) тренд осадков и тренд температуры направлены в противоположные стороны (ρ Спирмена = {c}), и связь сохраняется в обеих подвыборках, то есть дело не только в том, куда мы смотрели.",
    "read.null": "По всем точкам (их {n}) тренд осадков и тренд температуры слабо связаны (ρ Спирмена = {c}). Этот нулевой результат нужно сообщить как есть, а не подбирать под него историю.",
    "tip.rain": "осадки", "tip.temp": "темп.", "tip.trend": "тренд", "tip.vs": "к тренду",
    "v.fdr": "выдерживает FDR", "v.raw": "только исходное p", "v.ns": "не значимо",
    "vd.fdr": "значимо · выдерживает FDR", "vd.raw": "значимо · только исходное p",
    "live": "{y}: {v} {u}, {d} относительно тренда.",
    "meta.years": "полных лет: {n}",
    "st.slope": "Наклон Сена", "st.rel": "Относительный тренд", "st.na": "н/д", "st.ratio": "только для шкалы отношений", "st.p": "p Mann–Kendall", "st.delta": "Первое → последнее десятилетие",
    "dir.up": "рост", "dir.down": "снижение", "grade.flat": "практически нулевой", "grade.about": "около {m} {u} за десятилетие",
    "read.sig": "{name}: {dir}, наклон {grade}. По тесту Mann–Kendall (p = {p}) столь устойчивое изменение вряд ли случайно; среднее за первое десятилетие составило {a} {u}, за последнее {b} {u}. {note}",
    "read.ns": "{name}: тест не отличает тренд от случайности (p = {p}); подобранный наклон {grade}. {note} Обратите внимание на разницу между «нет свидетельств тренда» и «есть свидетельства отсутствия тренда»: 35 лет одной модельной ячейки сетки недостаточно для второго утверждения.",
    "table.note": "{v} · по абсолютному изменению за десятилетие · n = {n}",
    "table.notePct": "{v} · по абсолютному процентному изменению за десятилетие · n = {n}",

    "region.Alaska": "Аляска", "region.Amazon": "Амазония", "region.Arctic": "Арктика", "region.Central Australia": "Центральная Австралия",
    "region.East Africa": "Восточная Африка", "region.Mediterranean": "Средиземноморье", "region.North America": "Северная Америка", "region.North Atlantic": "Северная Атлантика",
    "region.Sahel": "Сахель", "region.South Asia": "Южная Азия", "region.Southern Africa": "Юг Африки", "region.Systematic grid": "Систематическая сетка",
    "site.los-angeles": "Лос-Анджелес, США", "site.mau-forest": "Лес Мау, Кения", "site.manaus": "Манаус, Бразилия", "site.nuuk": "Нуук, Гренландия",
    "site.niamey": "Ниамей, Нигер", "site.dhaka": "Дакка, Бангладеш", "site.alice-springs": "Алис-Спрингс, Австралия", "site.reykjavik": "Рейкьявик, Исландия",
    "site.athens": "Афины, Греция", "site.chennai": "Ченнаи, Индия", "site.anchorage": "Анкоридж, США", "site.cape-town": "Кейптаун, ЮАР",
    "note.grid": "Это точка сетки, а не выбранное место: она была задана до того, как мы увидели данные.",
    "note.los-angeles": "Родной город команды. Прибрежная котловина, за которой начинается пустыня.",
    "note.mau-forest": "Ландшафт из проекта о земельном покрове. Остров горного леса.",
    "note.manaus": "Центральная Амазония. Здесь важны осадки, а не температура.",
    "note.nuuk": "Здесь небольшое изменение среднего сдвигает много льда.",
    "note.niamey": "Засуха в Сахеле и восстановление после неё стали классическим примером поиска трендов.",
    "note.dhaka": "Сроки и объём муссона в дельте, которую затапливает.",
    "note.alice-springs": "Засушливые внутренние районы. Хороший контроль для трендов влажных регионов.",
    "note.reykjavik": "Высокие широты со смягчающим влиянием океана, Срединно-Атлантический хребет.",
    "note.athens": "Главный вопрос здесь: становится ли лето суше.",
    "note.chennai": "Сосед Бангалора, на краю муссона Бенгальского залива.",
    "note.anchorage": "Потепление в высоких широтах на территории США.",
    "note.cape-town": "Средиземноморский климат в Южном полушарии.",
  };

  const DICT = { en: null, zh: ZH, ru: RU };
  const HTML_LANG = { en: "en", zh: "zh-Hans", ru: "ru" };

  const pick = () => {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && fromUrl in DICT) return fromUrl;
    try { const saved = localStorage.getItem("td-lang"); if (saved && saved in DICT) return saved; } catch (e) { /* private mode */ }
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("zh") ? "zh" : nav.startsWith("ru") ? "ru" : "en";
  };

  let lang = pick();
  const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : text);

  // Generated text: app.js passes the English as the fallback.
  const t = (key, en, vars) => {
    const d = DICT[lang];
    return fill(d && key in d ? d[key] : en, vars);
  };

  // Fixed text: the page's own English is remembered the first time through.
  const apply = () => {
    document.documentElement.lang = HTML_LANG[lang];
    document.documentElement.dataset.lang = lang;
    const d = DICT[lang];
    for (const node of [...document.querySelectorAll("[data-i18n]")]) {
      if (node.__en === undefined) { node.__en = node.innerHTML; node.__shown = node.innerHTML; }
      if (node.innerHTML !== node.__shown) continue;        // something else has written here since (the probe's status line)
      const key = node.dataset.i18n;
      node.innerHTML = d && key in d ? d[key] : node.__en;
      node.__shown = node.innerHTML;
    }
    for (const button of document.querySelectorAll("#lang-toggle button")) {
      const on = button.dataset.lang === lang;
      button.classList.toggle("on", on);
      button.setAttribute("aria-pressed", String(on));
    }
  };

  const set = (next) => {
    if (!(next in DICT) || next === lang) return;
    lang = next;
    try { localStorage.setItem("td-lang", lang); } catch (e) { /* private mode */ }
    apply();
    document.dispatchEvent(new CustomEvent("td:lang", { detail: { lang } }));
  };

  window.I18N = { t, set, apply, get lang() { return lang; } };

  for (const button of document.querySelectorAll("#lang-toggle button")) {
    button.addEventListener("click", () => set(button.dataset.lang));
  }
  apply();
  // The probe adds its city buttons while the page is still loading.
  document.addEventListener("DOMContentLoaded", apply);
})();
