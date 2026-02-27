import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const BOT_NAME = "ЗемляБот";
const BOT_AVATAR = "🌍";

interface Message {
  id: number;
  from: "bot" | "user";
  text?: string;
  isTyping?: boolean;
  buttons?: Button[][];
  card?: CardData;
}

interface Button {
  label: string;
  action: string;
  emoji?: string;
}

interface CardData {
  title: string;
  subtitle?: string;
  value?: string;
  unit?: string;
  facts: string[];
  color: string;
}

const SECTIONS: Record<string, { title: string; emoji: string; color: string; intro: string; facts: string[]; subButtons: Button[][] }> = {
  biosphere: {
    title: "Биосфера",
    emoji: "🌿",
    color: "#4ade80",
    intro: "Биосфера — оболочка Земли, где существует жизнь. Охватывает нижние слои атмосферы, всю гидросферу и верхние слои литосферы.",
    facts: [
      "На Земле описано более **8,7 миллиона** видов живых организмов",
      "Общая биомасса составляет **≈550 Гт углерода**",
      "Глубочайшая жизнь обнаружена на **12 км** под поверхностью океана",
      "Растения производят около **120 млрд тонн** органики в год",
      "Биосфера существует уже более **3,8 миллиарда лет**",
    ],
    subButtons: [
      [{ label: "Растительный мир", action: "bio_plants", emoji: "🌱" }, { label: "Животный мир", action: "bio_animals", emoji: "🦁" }],
      [{ label: "Микроорганизмы", action: "bio_micro", emoji: "🦠" }, { label: "Угрозы биосфере", action: "bio_threats", emoji: "⚠️" }],
    ],
  },
  hydrosphere: {
    title: "Гидросфера",
    emoji: "🌊",
    color: "#38bdf8",
    intro: "Гидросфера — водная оболочка Земли, включающая Мировой океан, ледники, реки, озёра и подземные воды.",
    facts: [
      "**97,5%** всей воды на Земле — солёная, лишь 2,5% — пресная",
      "Мировой океан занимает **70,8%** поверхности планеты",
      "Средняя глубина океана составляет **3 800 м**",
      "Максимальная глубина — **11 034 м** (Марианская впадина)",
      "В океанах растворено около **50 квинтильонов тонн** солей",
    ],
    subButtons: [
      [{ label: "Мировой океан", action: "hydro_ocean", emoji: "🌊" }, { label: "Ледники", action: "hydro_glaciers", emoji: "🧊" }],
      [{ label: "Реки и озёра", action: "hydro_rivers", emoji: "🏞️" }, { label: "Круговорот воды", action: "hydro_cycle", emoji: "♻️" }],
    ],
  },
  history: {
    title: "История Земли",
    emoji: "⏳",
    color: "#fb923c",
    intro: "История Земли насчитывает около 4,54 миллиарда лет и делится на геологические эоны, эры и периоды.",
    facts: [
      "Возраст Земли — **4,54 ± 0,05 миллиарда лет**",
      "Луна образовалась ~**4,5 млрд лет** назад в результате столкновения с Тейей",
      "Первые одноклеточные появились **3,8–3,5 млрд** лет назад",
      "Кислородная революция произошла **2,4 млрд** лет назад",
      "Эпоха динозавров длилась **186 миллионов лет** (мезозой)",
    ],
    subButtons: [
      [{ label: "Архей и Протерозой", action: "hist_early", emoji: "🔬" }, { label: "Эра динозавров", action: "hist_dino", emoji: "🦕" }],
      [{ label: "Ледниковые периоды", action: "hist_ice", emoji: "❄️" }, { label: "Появление человека", action: "hist_human", emoji: "👤" }],
    ],
  },
  atmosphere: {
    title: "Атмосфера",
    emoji: "🌬️",
    color: "#a78bfa",
    intro: "Атмосфера — газовая оболочка Земли, удерживаемая гравитацией. Простирается до ~10 000 км.",
    facts: [
      "Атмосфера состоит на **78,09% из азота** и **20,95% из кислорода**",
      "Общая масса атмосферы — **5,15 × 10¹⁸ кг**",
      "Озоновый слой расположен на высоте **15–35 км**",
      "Температура в мезосфере опускается до **−90°C**",
      "В термосфере температура достигает **+2000°C** и выше",
    ],
    subButtons: [
      [{ label: "Слои атмосферы", action: "atm_layers", emoji: "📊" }, { label: "Озоновый слой", action: "atm_ozone", emoji: "🔵" }],
      [{ label: "Парниковый эффект", action: "atm_greenhouse", emoji: "🌡️" }, { label: "Погода и ветер", action: "atm_weather", emoji: "🌪️" }],
    ],
  },
  geology: {
    title: "Геология",
    emoji: "⛰️",
    color: "#f59e0b",
    intro: "Геология изучает твёрдую оболочку Земли — литосферу, её состав, строение и историю формирования.",
    facts: [
      "Земля состоит из **коры, мантии, внешнего и внутреннего ядра**",
      "Температура в центре Земли достигает **~6 000°C**",
      "Самый высокий вулкан от дна: Мауна-Кеа — **10 203 м**",
      "Тектонические плиты движутся со скоростью **2–10 см** в год",
      "Самый старый минерал — циркон возрастом **4,4 млрд лет**",
    ],
    subButtons: [
      [{ label: "Строение Земли", action: "geo_structure", emoji: "🔴" }, { label: "Тектоника плит", action: "geo_plates", emoji: "🗺️" }],
      [{ label: "Вулканизм", action: "geo_volcanoes", emoji: "🌋" }, { label: "Землетрясения", action: "geo_quakes", emoji: "📳" }],
    ],
  },
  climate: {
    title: "Климат",
    emoji: "🌡️",
    color: "#f43f5e",
    intro: "Климат — многолетний режим погоды, характерный для данной местности. Определяется множеством факторов.",
    facts: [
      "Средняя температура поверхности Земли — **+15°C**",
      "Самая высокая температура: **+56,7°C** (Долина Смерти, 1913)",
      "Самая низкая температура: **−89,2°C** (Антарктида, 1983)",
      "С 1880 г. средняя температура выросла на **≈1,1°C**",
      "CO₂ достиг **420 ppm** — максимум за 3 миллиона лет",
    ],
    subButtons: [
      [{ label: "Климатические зоны", action: "cli_zones", emoji: "🗺️" }, { label: "Изменение климата", action: "cli_change", emoji: "📈" }],
      [{ label: "Течения и климат", action: "cli_currents", emoji: "🌊" }, { label: "Климат в цифрах", action: "cli_stats", emoji: "📊" }],
    ],
  },
};

const SUB_FACTS: Record<string, { title: string; text: string }> = {
  bio_plants: { title: "🌱 Растительный мир", text: "На Земле насчитывается около **390 000 видов растений**. Леса занимают ~31% суши и поглощают **2,6 млрд тонн CO₂** ежегодно. Самое старое дерево — сосна Мафусаил в США: **4 855 лет**." },
  bio_animals: { title: "🦁 Животный мир", text: "Описано более **1 млн видов животных**, из них ~950 тыс. — насекомые. Самое крупное животное — синий кит (до **33 м** и **190 тонн**). Самое быстрое — сокол-сапсан (**389 км/ч** в пике)." },
  bio_micro: { title: "🦠 Микроорганизмы", text: "На Земле существует около **10³⁰ бактерий** — их суммарная масса превышает массу всех растений и животных вместе взятых. В одном грамме почвы — до **1 миллиарда** бактерий." },
  bio_threats: { title: "⚠️ Угрозы биосфере", text: "Текущие темпы вымирания видов в **1 000 раз** превышают естественный фон. Человечество уничтожило **83% дикой фауны** с момента цивилизации. Площадь лесов сократилась на **46%** за всю историю." },
  hydro_ocean: { title: "🌊 Мировой океан", text: "Тихий океан занимает **165,2 млн км²** — больше, чем все континенты вместе. Атлантический расширяется на **1,5 см** в год. Изучено лишь **5–20%** дна Мирового океана." },
  hydro_glaciers: { title: "🧊 Ледники", text: "Ледники хранят **69%** всей пресной воды Земли. Антарктический щит содержит лёд толщиной до **4 776 м**. При полном таянии уровень океана поднимется на **65–70 м**." },
  hydro_rivers: { title: "🏞️ Реки и озёра", text: "Самая длинная река — **Нил (6 853 км)**. Самая полноводная — **Амазонка**: несёт 20% всей речной воды Земли. Байкал — глубочайшее озеро мира (**1 642 м**) и **20%** мировых запасов пресной воды." },
  hydro_cycle: { title: "♻️ Круговорот воды", text: "Ежегодно испаряется около **577 000 км³** воды. Среднее время пребывания воды в атмосфере — **8–10 дней**. Подземные воды составляют **30%** всей пресной воды и формируются тысячелетиями." },
  hist_early: { title: "🔬 Архей и Протерозой", text: "Архейский эон (4–2,5 млрд лет назад) — эпоха первых прокариот и кратонов. Протерозой (2,5–541 млн лет) — появление эукариот, первых многоклеточных и кислородной атмосферы." },
  hist_dino: { title: "🦕 Эра динозавров", text: "Мезозойская эра (252–66 млн лет назад): триас, юра и мел. Крупнейший динозавр — **Аргентинозавр** (до 40 м, ~100 тонн). Вымирание произошло из-за астероида диаметром **~10 км**." },
  hist_ice: { title: "❄️ Ледниковые периоды", text: "За последние 2,6 млн лет Земля пережила около **50 ледниковых циклов**. Последний максимум — **21 000 лет назад**. Тогда ледники покрывали **30%** суши." },
  hist_human: { title: "👤 Появление человека", text: "Homo sapiens появился в Африке около **300 000 лет назад**. Массовое расселение началось ~**70 000 лет** назад. Первые города появились **~5 500 лет** назад." },
  atm_layers: { title: "📊 Слои атмосферы", text: "Тропосфера (0–12 км) — погода и **80% массы**. Стратосфера (12–50 км) — озоновый слой. Мезосфера (50–85 км) — сгорают метеориты. Термосфера (85–700 км) — полярное сияние. Экзосфера — переход в космос." },
  atm_ozone: { title: "🔵 Озоновый слой", text: "Озоновый слой поглощает **97–99%** ультрафиолета Солнца. «Озоновая дыра» достигла максимума в **2000 году** (29,9 млн км²). Благодаря Монреальскому протоколу 1987 г. слой постепенно восстанавливается." },
  atm_greenhouse: { title: "🌡️ Парниковый эффект", text: "Без парникового эффекта средняя температура Земли была бы **−18°C**. Основные газы: водяной пар (50%), CO₂ (20%), озон (7%), метан. Антропогенный эффект усиливает естественный." },
  atm_weather: { title: "🌪️ Погода и ветер", text: "Самый сильный ветер зафиксирован на г. Вашингтон: **372 км/ч** (1934). Ураган 5-й категории — свыше **250 км/ч**. Молния нагревает воздух до **30 000°C** — в 5 раз горячее поверхности Солнца." },
  geo_structure: { title: "🔴 Строение Земли", text: "Кора: **5–70 км**. Мантия: **2 900 км**, 500–4 000°C. Внешнее ядро: жидкое железо, **2 200 км**. Внутреннее ядро: твёрдое, радиус **1 220 км**, температура ~**6 000°C**." },
  geo_plates: { title: "🗺️ Тектоника плит", text: "Литосфера разделена на **7 крупных и ~20 малых** плит. Гималаи растут на **~5 мм** в год — столкновение Индийской и Евразийской плит. Атлантический океан расширяется на **2,5 см** ежегодно." },
  geo_volcanoes: { title: "🌋 Вулканизм", text: "На Земле около **1 500 потенциально активных** вулканов. Сильнейшее историческое извержение — Тамбора (1815): **160 км³** материала. Ежегодно происходит **50–60 извержений**. 80% — подводные." },
  geo_quakes: { title: "📳 Землетрясения", text: "Ежегодно регистрируется **~500 000 землетрясений**, ~100 000 ощутимы людьми. Сильнейшее — Чилийское 1960 г. (магнитуда **9,5**). Наибольшая активность — Тихоокеанское огненное кольцо." },
  cli_zones: { title: "🗺️ Климатические зоны", text: "По классификации Кёппена выделяют **5 основных групп**: тропический, сухой, умеренный, континентальный, полярный. Умеренный климат занимает **~25% суши** — самая большая зона." },
  cli_change: { title: "📈 Изменение климата", text: "С 1880 г. температура выросла на **1,1°C**. 2023 год стал **самым жарким** за всю историю измерений. МГЭИК прогнозирует рост на **1,5–4,5°C** к 2100 г. при нынешних темпах выбросов." },
  cli_currents: { title: "🌊 Течения и климат", text: "Гольфстрим переносит **30 млн м³/с** — в 20 раз больше всех рек мира. Без него Европа была бы холоднее на **5–10°C**. Эль-Ниньо меняет климат на **⅓ планеты** каждые 2–7 лет." },
  cli_stats: { title: "📊 Климат в цифрах", text: "Максимум: **+56,7°C** (Долина Смерти, 1913). Минимум: **−89,2°C** (ст. Восток, 1983). Среднегодовые осадки на Земле: **~1 000 мм**. Самое влажное место: Мауасинрам, Индия — **11 870 мм/год**." },
};

function parseBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold" style={{ color: "#60a5fa" }}>{part}</strong>
      : part
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot w-2 h-2 rounded-full bg-tg-subtext block"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function BotBubble({ msg, onButton }: { msg: Message; onButton: (action: string, label: string) => void }) {
  return (
    <div className="flex gap-2 mb-3 animate-bubble">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-1 border border-white/10"
        style={{ background: "hsl(215,20%,18%)" }}>
        {BOT_AVATAR}
      </div>
      <div className="max-w-[85%]">
        {msg.isTyping ? (
          <div className="rounded-2xl rounded-tl-sm px-4 py-2 border border-white/5" style={{ background: "hsl(220,22%,18%)" }}>
            <TypingIndicator />
          </div>
        ) : (
          <>
            {msg.card ? (
              <div className="rounded-2xl rounded-tl-sm border border-white/5 overflow-hidden" style={{ background: "hsl(220,22%,18%)" }}>
                <div className="px-4 pt-3 pb-2 border-l-2" style={{ borderColor: msg.card.color }}>
                  <div className="font-cormorant text-lg font-semibold leading-snug text-tg-text">{msg.card.title}</div>
                  {msg.card.subtitle && (
                    <div className="text-xs font-ibm mt-0.5 text-tg-subtext">{msg.card.subtitle}</div>
                  )}
                </div>
                <div className="px-4 pb-3 pt-1 space-y-1.5">
                  {msg.card.facts.map((f, i) => (
                    <div key={i} className="text-sm font-ibm leading-relaxed flex gap-2 text-tg-text">
                      <span className="text-tg-subtext mt-0.5 flex-shrink-0">·</span>
                      <span>{parseBold(f)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5" style={{ background: "hsl(220,22%,18%)" }}>
                <p className="text-sm font-ibm text-tg-text leading-relaxed whitespace-pre-line">{parseBold(msg.text || "")}</p>
              </div>
            )}

            {msg.buttons && msg.buttons.length > 0 && (
              <div className="mt-1.5 space-y-1.5">
                {msg.buttons.map((row, ri) => (
                  <div key={ri} className="flex gap-1.5">
                    {row.map((btn) => (
                      <button
                        key={btn.action}
                        onClick={() => onButton(btn.action, btn.label)}
                        className="tg-btn flex-1 text-xs font-ibm font-medium px-3 py-2 rounded-xl border border-tg-divider text-tg-text text-center transition-all"
                        style={{ background: "hsl(220,22%,22%)" }}
                      >
                        {btn.emoji && <span className="mr-1">{btn.emoji}</span>}
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-3 animate-bubble">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 border border-blue-400/20"
        style={{ background: "hsl(207,70%,22%)" }}>
        <p className="text-sm font-ibm text-tg-text leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

const WELCOME_BUTTONS: Button[][] = [
  [
    { label: "Биосфера", action: "section_biosphere", emoji: "🌿" },
    { label: "Гидросфера", action: "section_hydrosphere", emoji: "🌊" },
    { label: "История", action: "section_history", emoji: "⏳" },
  ],
  [
    { label: "Атмосфера", action: "section_atmosphere", emoji: "🌬️" },
    { label: "Геология", action: "section_geology", emoji: "⛰️" },
    { label: "Климат", action: "section_climate", emoji: "🌡️" },
  ],
  [
    { label: "🔍 Поиск по базе знаний", action: "search_mode", emoji: "" },
  ],
];

let msgId = 0;
function newId() { return ++msgId; }

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = newId();
    setTimeout(() => {
      setMessages([{
        id,
        from: "bot",
        text: "Добро пожаловать в энциклопедию нашей планеты.\n\nЯ — ЗемляБот. Здесь вы найдёте научные данные, факты и статистику о Земле. Выберите раздел для изучения:",
        buttons: WELCOME_BUTTONS,
      }]);
    }, 400);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addBotTyping() {
    const id = newId();
    setMessages((prev) => [...prev, { id, from: "bot", isTyping: true }]);
    return id;
  }

  function replaceBotTyping(typingId: number, msg: Omit<Message, "id" | "from">) {
    setMessages((prev) =>
      prev.map((m) => m.id === typingId ? { ...m, isTyping: false, ...msg } : m)
    );
  }

  function addUserMsg(text: string) {
    setMessages((prev) => [...prev, { id: newId(), from: "user", text }]);
  }

  function handleButton(action: string, label: string) {
    if (action === "search_mode") {
      addUserMsg("🔍 Поиск по базе знаний");
      const typingId = addBotTyping();
      setTimeout(() => {
        setSearchMode(true);
        replaceBotTyping(typingId, {
          text: "Введите ключевое слово для поиска по базе знаний.\n\nПримеры: «вулкан», «температура», «кит», «ледник», «кислород»...",
        });
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 700);
      return;
    }

    if (action === "back_main") {
      addUserMsg("← Главное меню");
      setSearchMode(false);
      const typingId = addBotTyping();
      setTimeout(() => {
        replaceBotTyping(typingId, {
          text: "Выберите раздел для изучения:",
          buttons: WELCOME_BUTTONS,
        });
      }, 500);
      return;
    }

    if (action.startsWith("section_")) {
      const key = action.replace("section_", "");
      const section = SECTIONS[key];
      if (!section) return;
      addUserMsg(`${section.emoji} ${section.title}`);
      const typingId = addBotTyping();
      setTimeout(() => {
        replaceBotTyping(typingId, {
          card: {
            title: `${section.emoji} ${section.title}`,
            subtitle: "Ключевые факты и данные",
            facts: section.facts,
            color: section.color,
          },
          buttons: [
            ...section.subButtons,
            [{ label: "← Главное меню", action: "back_main", emoji: "" }],
          ],
        });
      }, 900);
      return;
    }

    const sub = SUB_FACTS[action];
    if (sub) {
      addUserMsg(label);
      const typingId = addBotTyping();
      setTimeout(() => {
        replaceBotTyping(typingId, {
          text: sub.text,
          buttons: [[
            { label: "← Главное меню", action: "back_main", emoji: "🌍" },
          ]],
        });
      }, 800);
    }
  }

  function doSearch(query: string) {
    if (!query.trim()) return;
    addUserMsg(`🔍 "${query}"`);
    setInputValue("");
    const q = query.toLowerCase();

    const allFacts: { key: string; title: string; text: string }[] = [
      ...Object.entries(SECTIONS).flatMap(([, s]) =>
        s.facts.map((f) => ({ key: s.title, title: `${s.emoji} ${s.title}`, text: f }))
      ),
      ...Object.entries(SUB_FACTS).map(([k, v]) => ({ key: k, title: v.title, text: v.text })),
    ];

    const results = allFacts.filter(
      (f) => f.text.toLowerCase().includes(q) || f.title.toLowerCase().includes(q)
    ).slice(0, 5);

    const typingId = addBotTyping();
    setTimeout(() => {
      if (results.length === 0) {
        replaceBotTyping(typingId, {
          text: `По запросу «${query}» ничего не найдено.\n\nПопробуйте другое слово.`,
          buttons: [[
            { label: "🔍 Новый поиск", action: "search_mode", emoji: "" },
            { label: "← Главное меню", action: "back_main", emoji: "🌍" },
          ]],
        });
      } else {
        const lines = results.map((r, i) =>
          `${i + 1}. **${r.title}**\n   ${r.text.replace(/\*\*/g, "").slice(0, 90)}...`
        ).join("\n\n");
        replaceBotTyping(typingId, {
          text: `Найдено результатов: **${results.length}**\n\n${lines}`,
          buttons: [[
            { label: "🔍 Новый поиск", action: "search_mode", emoji: "" },
            { label: "← Главное меню", action: "back_main", emoji: "🌍" },
          ]],
        });
      }
    }, 900);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || !searchMode) return;
    doSearch(inputValue);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "hsl(215,20%,8%)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0"
        style={{ background: "hsl(220,22%,12%)" }}>
        <div className="w-10 h-10 rounded-full border border-blue-400/20 flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,211,238,0.2))" }}>
          🌍
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-ibm font-semibold text-sm" style={{ color: "hsl(210,18%,88%)" }}>{BOT_NAME}</div>
          <div className="text-xs font-ibm" style={{ color: "hsl(215,12%,52%)" }}>Академическая энциклопедия планеты</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          <span className="text-xs font-ibm" style={{ color: "hsl(215,12%,52%)" }}>online</span>
        </div>
      </div>

      {/* Subtitle bar */}
      <div className="text-center py-1.5 border-b border-white/5 flex-shrink-0" style={{ background: "hsl(220,22%,10%)" }}>
        <span className="text-xs font-ibm-mono tracking-widest uppercase" style={{ color: "hsl(215,12%,35%)" }}>
          Terra · Scientific Database · v1.0
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.map((msg) =>
          msg.from === "bot"
            ? <BotBubble key={msg.id} msg={msg} onButton={handleButton} />
            : <UserBubble key={msg.id} text={msg.text || ""} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/5 px-3 py-2.5" style={{ background: "hsl(220,22%,12%)" }}>
        {searchMode ? (
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border border-white/10"
              style={{ background: "hsl(220,22%,18%)" }}>
              <Icon name="Search" size={15} className="flex-shrink-0" style={{ color: "hsl(215,12%,52%)" }} />
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ключевое слово для поиска..."
                className="flex-1 bg-transparent outline-none text-sm font-ibm"
                style={{ color: "hsl(210,18%,88%)" }}
              />
            </div>
            <button
              type="submit"
              className="w-10 h-10 rounded-xl flex items-center justify-center tg-btn flex-shrink-0"
              style={{ background: "hsl(207,75%,45%)" }}
            >
              <Icon name="Send" size={16} className="text-white" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1">
            <Icon name="Info" size={13} style={{ color: "hsl(215,12%,40%)" }} />
            <span className="text-xs font-ibm" style={{ color: "hsl(215,12%,40%)" }}>
              Нажимайте на кнопки выше для навигации
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
