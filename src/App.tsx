import React, { useEffect, useMemo, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { buildYear, type DayInfo, type HebMonth } from './hebrew-calendar'
import { birthdayEvents } from './family-birthdays'
import chanukiahImg from './imports/image.png'
import sukkahImg from './imports/image-5.png'

/* ─── Personal events ─── */
type EventEntry = {
  title: string
  note: string
  image: string
  birthday?: boolean
  name?: string
}
type EventMap = Record<string, EventEntry>
const STORAGE_KEY = 'hebcal-5787-events'

function loadEvents(): EventMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function downscaleImage(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('image decode failed'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(String(reader.result))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

const CELL_ASPECT = 1.4

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function centerCropArea(img: HTMLImageElement, aspect: number): Area {
  let w = img.width
  let h = w / aspect
  if (h > img.height) {
    h = img.height
    w = h * aspect
  }
  return { x: (img.width - w) / 2, y: (img.height - h) / 2, width: w, height: h }
}

async function getCroppedDataUrl(src: string, area: Area | null, maxDim = 1600): Promise<string> {
  const img = await loadImage(src)
  const a = area ?? centerCropArea(img, CELL_ASPECT)
  const sx = Math.max(0, Math.min(a.x, img.width))
  const sy = Math.max(0, Math.min(a.y, img.height))
  const sw = Math.max(1, Math.min(a.width, img.width - sx))
  const sh = Math.max(1, Math.min(a.height, img.height - sy))
  const scale = Math.min(1, maxDim / Math.max(sw, sh))
  const w = Math.max(1, Math.round(sw * scale))
  const h = Math.max(1, Math.round(sh * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return src
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.85)
}

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת']

/* ─── Per-month visual identity ─── */
type MonthTheme = {
  accent: string
  accentSoft: string
  shabbat: string
  gold: string
  photo?: string       // Unsplash photo URL unique to this month (optional — some months stay photo-free)
  photoStyle?: React.CSSProperties // optional per-month background position/size/filter overrides
  paperOpacity: number // how much paper overlay covers the photo (0–1)
  tintGrad: string     // additional accent-colored tint layer
  stripeGrad: string   // top stripe gradient
}

function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=1400&h=900&fit=crop&auto=format`
}

const MONTH_THEMES: Record<string, MonthTheme> = {
  // תשרי — High Holidays, pomegranate garnet
  Tishrei: {
    accent: '#8B1A1A',
    accentSoft: '#B84A3A',
    shabbat: '#2D5A28',
    gold: '#A8842F',
    photo: sukkahImg, // decorated sukkah with table and fruit — Sukkot
    photoStyle: {
      backgroundSize: '120%',
      backgroundPosition: 'center 30%',
      filter: 'blur(2px)',
    },
    paperOpacity: 0.62,
    tintGrad:
      'radial-gradient(ellipse at 50% 20%, rgba(168,132,47,0.20) 0%, transparent 58%), radial-gradient(ellipse at 75% 78%, rgba(139,26,26,0.16) 0%, transparent 60%)',
    stripeGrad: 'linear-gradient(to left, #8B1A1A, #C04A3A)',
  },
  // חשון — First rains, autumn water
  Cheshvan: {
    accent: '#7A3A1A',
    accentSoft: '#A06040',
    shabbat: '#3A2850',
    gold: '#8A6A2A',
    photo: unsplash('1517964101322-a4cfaaf56e5b'), // autumn leaves on water
    paperOpacity: 0.78,
    tintGrad: 'linear-gradient(150deg, rgba(122,58,26,0.12) 0%, transparent 52%)',
    stripeGrad: 'linear-gradient(to left, #7A3A1A, #9A5A30)',
  },
  // כסלו — Hanukkah, candlelight and cobalt
  Kislev: {
    accent: '#1A3A8B',
    accentSoft: '#3A5AB8',
    shabbat: '#6A2A10',
    gold: '#C8A030',
    photo: chanukiahImg, // lit chanukiah — Hanukkah
    photoStyle: {
      backgroundSize: '138%',
      backgroundPosition: 'center 40%',
      filter: 'blur(4px)',
    },
    paperOpacity: 0.6,
    tintGrad:
      'radial-gradient(ellipse at 50% 82%, rgba(26,58,139,0.40) 0%, transparent 64%), radial-gradient(ellipse at 50% 30%, rgba(200,160,48,0.30) 0%, transparent 52%), radial-gradient(ellipse at 15% 12%, rgba(200,160,48,0.20) 0%, transparent 55%)',
    stripeGrad: 'linear-gradient(to left, #0A1A6B, #2A4AB8)',
  },
  // טבת — Coldest month, frost and ice
  Tevet: {
    accent: '#3A4A6A',
    accentSoft: '#5A6A8A',
    shabbat: '#1A4A3A',
    gold: '#7A8A6A',
    photo: unsplash('1632307941173-5d541ea1d940'), // misty grey forest, rain in the air
    photoStyle: {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'grayscale(0.35) blur(1px)',
    },
    paperOpacity: 0.6,
    tintGrad:
      'linear-gradient(to bottom, rgba(40,52,78,0.34) 0%, rgba(58,74,106,0.16) 50%, rgba(58,74,106,0.08) 100%)',
    stripeGrad: 'linear-gradient(to left, #2A3A5A, #4A5A7A)',
  },
  // שבט — Tu BiShvat, almond blossom
  "Sh'vat": {
    accent: '#2A6A3A',
    accentSoft: '#4A8A5A',
    shabbat: '#4A2A6A',
    gold: '#8A9A3A',
    photo: unsplash('1775733083011-e56f19895d16'), // new green leaves budding in sunlight — Tu BiShvat
    paperOpacity: 0.72,
    tintGrad: 'radial-gradient(ellipse at 50% 0%, rgba(42,106,58,0.20) 0%, transparent 60%)',
    stripeGrad: 'linear-gradient(to left, #1A5A2A, #3A8A4A)',
  },
  // אדר א׳ — Quiet transition, misty forest
  'Adar I': {
    accent: '#8A6A20',
    accentSoft: '#A88A40',
    shabbat: '#3A285A',
    gold: '#C8A030',
    photo: unsplash('1769766114916-7ef448a4cb9d'), // misty forest
    paperOpacity: 0.80,
    tintGrad: 'linear-gradient(168deg, rgba(138,106,32,0.12) 0%, transparent 52%)',
    stripeGrad: 'linear-gradient(to left, #6A4A10, #A88030)',
  },
  // אדר ב׳ — Purim, festive confetti violet
  'Adar II': {
    accent: '#6A1A9A',
    accentSoft: '#8A3ABA',
    shabbat: '#1A5A3A',
    gold: '#C87A20',
    photo: unsplash('1513151233558-d860c5398176'), // colorful confetti
    paperOpacity: 0.75,
    tintGrad: 'radial-gradient(ellipse at 62% 40%, rgba(106,26,154,0.18) 0%, transparent 58%)',
    stripeGrad: 'linear-gradient(to left, #4A0A7A, #8A2ABA)',
  },
  // ניסן — Pesach, wildflower meadow
  Nisan: {
    accent: '#7A5030',
    accentSoft: '#9A7050',
    shabbat: '#2A4A2A',
    gold: '#A87A30',
    photo: unsplash('1608250364712-127c3e77d3ea'), // pink wildflower field
    paperOpacity: 0.78,
    tintGrad: 'linear-gradient(to top, rgba(122,80,48,0.10) 0%, transparent 52%)',
    stripeGrad: 'linear-gradient(to left, #5A3010, #9A6A3A)',
  },
  // אייר — Omer, Yom Haatzmaut — photo-free, soft spring teal
  Iyyar: {
    accent: '#1A6E78',
    accentSoft: '#3E9298',
    shabbat: '#5A2838',
    gold: '#8AA24A',
    photo: unsplash('1507019658682-2924f9dbd499'), // night bonfire — Lag BaOmer
    photoStyle: {
      backgroundSize: '150%',
      backgroundPosition: 'center 88%',
      filter: 'blur(3px)',
    },
    paperOpacity: 0.6,
    tintGrad:
      'radial-gradient(ellipse at 50% 92%, rgba(216,130,26,0.34) 0%, transparent 58%), radial-gradient(ellipse at 82% 16%, rgba(26,110,120,0.16) 0%, transparent 56%)',
    stripeGrad: 'linear-gradient(to left, #0F5A62, #2E8A90)',
  },
  // סיון — Shavuot, wheat harvest golden
  Sivan: {
    accent: '#2A6020',
    accentSoft: '#4A8A40',
    shabbat: '#4A3A10',
    gold: '#8A9A2A',
    photo: unsplash('1646684662890-a5076aef9010'), // wheat field blue sky
    paperOpacity: 0.80,
    tintGrad: 'linear-gradient(138deg, rgba(42,96,32,0.12) 0%, transparent 55%)',
    stripeGrad: 'linear-gradient(to left, #1A4810, #3A7A28)',
  },
  // תמוז — Summer heat, golden hour
  Tamuz: {
    accent: '#8A6010',
    accentSoft: '#AA8030',
    shabbat: '#5A2020',
    gold: '#D4A020',
    photo: unsplash('1566568626594-699f661c7168'), // tree mountain golden hour
    paperOpacity: 0.76,
    tintGrad: 'radial-gradient(ellipse at 50% -8%, rgba(138,96,16,0.18) 0%, transparent 52%)',
    stripeGrad: 'linear-gradient(to left, #6A4000, #AA8010)',
  },
  // אב — Tisha B׳Av, ancient olive groves
  Av: {
    accent: '#2A2020',
    accentSoft: '#5A4040',
    shabbat: '#20203A',
    gold: '#7A6A4A',
    photo: unsplash('1552423310-ba74b8de5e6f'), // green/olive trees
    paperOpacity: 0.82,
    tintGrad: 'linear-gradient(to bottom, rgba(42,32,32,0.20) 0%, transparent 60%)',
    stripeGrad: 'linear-gradient(to left, #100808, #3A2A2A)',
  },
  // אלול — Return, soft sunlight orange haze
  Elul: {
    accent: '#8A5A20',
    accentSoft: '#AA7A40',
    shabbat: '#3A3A20',
    gold: '#C09030',
    photo: unsplash('1751487285172-6f2a8fe3afda'), // soft sunlight orange haze
    paperOpacity: 0.78,
    tintGrad: 'radial-gradient(ellipse at 32% 72%, rgba(138,90,32,0.15) 0%, transparent 58%)',
    stripeGrad: 'linear-gradient(to left, #6A3A10, #AA7A30)',
  },
}

/* ─── App ─── */
export default function App() {
  const months = useMemo(buildYear, [])
  const [events, setEvents] = useState<EventMap>(loadEvents)
  const birthdays = useMemo(() => birthdayEvents(), [])
  const shownEvents = useMemo<EventMap>(() => {
    const merged: EventMap = { ...birthdays }
    for (const [iso, entry] of Object.entries(events)) {
      const b = birthdays[iso]
      merged[iso] = b ? { ...b, ...entry } : entry
    }
    return merged
  }, [birthdays, events])

  const todayLocation = useMemo(() => {
    for (let mi = 0; mi < months.length; mi++) {
      const d = months[mi].days.find((day) => day.isToday)
      if (d) return { monthIdx: mi, iso: d.iso }
    }
    return null
  }, [months])

  const [monthIdxState, setMonthIdxState] = useState<number | null>(null)
  const monthIdx = monthIdxState ?? todayLocation?.monthIdx ?? 0
  const [selectedIso, setSelectedIso] = useState<string | null>(() => todayLocation?.iso ?? null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [printAll, setPrintAll] = useState(false)

  useEffect(() => {
    const handleAfterPrint = () => setPrintAll(false)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const handlePrintSingle = () => {
    setPrintAll(false)
    setTimeout(() => window.print(), 60)
  }

  const handlePrintAll = () => {
    setPrintAll(true)
    setTimeout(() => window.print(), 180)
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [events])

  const month = months[monthIdx]
  const selectedDay: DayInfo = month.days.find((d) => d.iso === selectedIso) ?? month.days[0]

  const saveEvent = (iso: string, entry: EventEntry) =>
    setEvents((prev) => ({ ...prev, [iso]: entry }))
  const deleteEvent = (iso: string) =>
    setEvents((prev) => {
      const next = { ...prev }
      delete next[iso]
      return next
    })

  const goto = (idx: number) => {
    const next = (idx + months.length) % months.length
    const targetDays = months[next].days
    const sameDay = targetDays.find((d) => d.hDay === selectedDay.hDay) ?? targetDays[0]
    setMonthIdxState(next)
    setSelectedIso(sameDay.iso)
  }

  return (
    <div dir="rtl" className="min-h-screen w-full">
      <Masthead onPrintMonth={handlePrintSingle} onPrintAll={handlePrintAll} />
      <MonthTabs months={months} current={monthIdx} onSelect={goto} />

      {storageError && (
        <div className="screen-only mx-auto max-w-[1360px] px-5 pt-3">
          <p className="rounded-lg border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)]">
            אחסון הדפדפן מלא — ייתכן שהתמונה גדולה מדי ולא נשמרה. נסו תמונה קטנה יותר.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-[1360px] px-5 py-3 print:m-0 print:max-w-none print:p-0">
        {printAll ? (
          <div>
            {months.map((m, idx) => (
              <div key={m.key} className="print-page">
                <MonthPage
                  month={m}
                  events={shownEvents}
                  selectedIso={selectedIso}
                  onPrev={() => goto(idx - 1)}
                  onNext={() => goto(idx + 1)}
                  onPick={(d) => {
                    setSelectedIso(d.iso)
                    setEditorOpen(true)
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="print-page">
            <MonthPage
              key={month.key}
              month={month}
              events={shownEvents}
              selectedIso={selectedDay.iso}
              onPrev={() => goto(monthIdx - 1)}
              onNext={() => goto(monthIdx + 1)}
              onPick={(d) => {
                setSelectedIso(d.iso)
                setEditorOpen(true)
              }}
            />
          </div>
        )}
      </main>

      {editorOpen && (
        <EventModal
          day={selectedDay}
          entry={shownEvents[selectedDay.iso]}
          onClose={() => setEditorOpen(false)}
          onSave={(e) => {
            saveEvent(selectedDay.iso, e)
            setEditorOpen(false)
          }}
          onDelete={() => {
            deleteEvent(selectedDay.iso)
            setEditorOpen(false)
          }}
        />
      )}

      <footer className="screen-only mx-auto max-w-[1360px] px-5 pb-5">
        <div className="border-t border-[var(--line)] pt-3 text-center text-sm text-[var(--ink-soft)]">
          <span className="font-display">לוח שנה תשפ״ז</span> · שנה מעוברת · מותאם להדפסת A4
        </div>
      </footer>
    </div>
  )
}

/* ─── Masthead ─── */
function Masthead({
  onPrintMonth,
  onPrintAll,
}: {
  onPrintMonth: () => void
  onPrintAll: () => void
}) {
  return (
    <header className="screen-only mx-auto max-w-[1360px] px-5 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ink)] pb-2">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-4xl leading-none font-black text-[var(--ink)]">תשפ״ז</h1>
          <p className="font-display text-sm tracking-[0.3em] text-[var(--accent)] uppercase">
            לוח השנה העברי
          </p>
          <span className="hidden text-sm text-[var(--ink-soft)] sm:inline">
            ספטמבר 2026 – ספטמבר 2027
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrintMonth}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <span>🖨️</span>
            <span>הדפסת חודש זה (A4)</span>
          </button>
          <button
            onClick={onPrintAll}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--paper)] shadow-xs transition-colors hover:bg-[var(--accent-soft)]"
          >
            <span>📚</span>
            <span>הדפסת כל השנה (13 חודשים ל-PDF)</span>
          </button>
        </div>
      </div>
    </header>
  )
}

/* ─── Month tabs ─── */
function MonthTabs({
  months,
  current,
  onSelect,
}: {
  months: HebMonth[]
  current: number
  onSelect: (i: number) => void
}) {
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [current])

  return (
    <nav className="screen-only sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center gap-2 overflow-x-auto px-5 py-3">
        {months.map((m, i) => {
          const theme = MONTH_THEMES[m.key]
          const isActive = i === current
          return (
            <button
              key={m.key}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(i)}
              style={
                isActive && theme
                  ? {
                      borderColor: theme.accent,
                      backgroundColor: theme.accent,
                      color: 'var(--paper)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    }
                  : undefined
              }
              className={`font-display shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                isActive
                  ? 'shadow-sm'
                  : 'border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink-soft)] hover:border-[var(--accent-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {m.heName}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ─── Month page ─── */
function MonthPage({
  month,
  events,
  selectedIso,
  onPrev,
  onNext,
  onPick,
}: {
  month: HebMonth
  events: EventMap
  selectedIso: string
  onPrev: () => void
  onNext: () => void
  onPick: (d: DayInfo) => void
}) {
  const lead = month.days[0].weekday
  const numWeeks = Math.ceil((lead + month.days.length) / 7)
  const theme = MONTH_THEMES[month.key] ?? MONTH_THEMES['Tishrei']

  return (
    <section
      style={
        {
          '--accent': theme.accent,
          '--accent-soft': theme.accentSoft,
          '--shabbat': theme.shabbat,
          '--gold': theme.gold,
          '--fest': '#3d7ab5',
        } as React.CSSProperties
      }
      className="animate-fade-in relative overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_24px_64px_-32px_rgba(34,32,27,0.5)] print:m-0 print:border-none print:rounded-none print:p-0 print:shadow-none print:h-full print:flex print:flex-col"
    >
      {/* Layer 1: unique photo background (omitted for photo-free months) */}
      {theme.photo && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.photo})`, ...theme.photoStyle }}
        />
      )}
      {/* Layer 2: paper-toned overlay — tints photo to the warm archival palette */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--paper)', opacity: theme.paperOpacity }}
      />
      {/* Layer 3: per-month accent color wash for extra identity */}
      <div className="absolute inset-0" style={{ backgroundImage: theme.tintGrad }} />
      {/* Layer 4: typographic watermark */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-black leading-none"
        style={{
          fontSize: 'clamp(90px, 15vw, 200px)',
          color: theme.accent,
          opacity: 0.055,
          letterSpacing: '-0.02em',
        }}
      >
        {month.heName}
      </span>

      {/* Top accent stripe */}
      <div
        className="relative h-1.5 w-full shrink-0"
        style={{ background: theme.stripeGrad }}
      />

      <div className="relative flex flex-1 flex-col p-4 sm:p-5 print:p-2 print:h-full print:justify-between">
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between print:mb-1 shrink-0">
          <button
            onClick={onPrev}
            aria-label="החודש הקודם"
            className="screen-only grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)]/70 text-xl text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--paper)]"
          >
            ›
          </button>
          <div className="w-full text-center">
            <h2 className="font-display text-4xl font-black leading-none text-[var(--ink)] sm:text-5xl print:text-3xl">
              {month.heName}
            </h2>
            <p className="mt-1 text-xs tracking-widest text-[var(--ink-soft)] print:text-[10px]">{month.gregSpan}</p>
          </div>
          <button
            onClick={onNext}
            aria-label="החודש הבא"
            className="screen-only grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)]/70 text-xl text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--paper)]"
          >
            ‹
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 print:gap-1 shrink-0">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`font-display py-1 text-center text-sm font-semibold print:py-0 print:text-[11px] ${
                i === 6 ? 'text-[var(--shabbat)]' : 'text-[var(--ink-soft)]'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          style={{ gridTemplateRows: `repeat(${numWeeks}, minmax(0, 1fr))` }}
          className="mt-1.5 grid grid-cols-7 gap-1.5 sm:gap-2 print:mt-1 print:gap-1 print:flex-1"
        >
          {Array.from({ length: lead }).map((_, i) => (
            <div key={`lead-${i}`} className="aspect-[1.4/1] print:aspect-auto print:h-full" />
          ))}
          {month.days.map((day) => (
            <DayCell
              key={day.iso}
              day={day}
              entry={events[day.iso]}
              selected={day.iso === selectedIso}
              onPick={onPick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Day cell ─── */
function DayCell({
  day,
  entry,
  selected,
  onPick,
}: {
  day: DayInfo
  entry?: EventEntry
  selected: boolean
  onPick: (d: DayInfo) => void
}) {
  const hasImage = !!entry?.image
  const isBirthday = !!entry?.birthday
  const ariaLabel = [
    `${day.heDay} ${day.heMonth}`,
    day.isShabbat ? 'שבת' : '',
    day.holiday ?? '',
    day.parsha ? `פרשת ${day.parsha}` : '',
    day.omerText ?? '',
    entry?.title ?? '',
    day.isToday ? 'היום' : '',
  ]
    .filter(Boolean)
    .join(', ')

  const restBg = day.isFestive
    ? 'bg-[var(--fest)]/15'
    : day.isShabbat
      ? 'bg-[var(--shabbat)]/8'
      : 'bg-[var(--paper-2)]/80'

  return (
    <button
      onClick={() => onPick(day)}
      aria-label={ariaLabel}
      aria-current={day.isToday ? 'date' : undefined}
      style={hasImage ? { backgroundImage: `url(${entry!.image})` } : undefined}
      className={`group relative flex aspect-[1.4/1] print:aspect-auto print:h-full flex-col overflow-hidden rounded-lg border bg-cover bg-center p-1.5 print:p-1 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(34,32,27,0.5)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus:outline-none print:shadow-none print:transform-none ${
        selected
          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)] print:ring-0 print:border-[var(--line)]'
          : day.isToday
            ? 'border-[var(--gold)] ring-2 ring-[var(--gold)] print:ring-0 print:border-[var(--gold)]'
            : isBirthday
              ? 'border-[var(--gold)]/80 ring-1 ring-[var(--gold)]/60 print:ring-0'
              : day.isFestive
                ? 'border-[var(--fest)] ring-1 ring-[var(--fest)]/60 print:ring-0'
                : day.isShabbat
                  ? 'border-[var(--shabbat)]/35'
                  : 'border-[var(--line)]'
      } ${hasImage ? '' : restBg}`}
    >
      {hasImage && (
        <span
          className={`absolute inset-0 ${
            isBirthday
              ? 'bg-gradient-to-t from-black/85 via-black/5 to-black/45'
              : 'bg-gradient-to-t from-black/80 via-black/25 to-black/35'
          }`}
        />
      )}

      <span className="relative flex items-start justify-between">
        <span
          className={`font-display flex items-center gap-1 text-base leading-none font-bold sm:text-lg print:text-sm ${
            hasImage ? 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]' : day.isShabbat ? 'text-[var(--shabbat)]' : 'text-[var(--ink)]'
          }`}
        >
          {day.heDay}
          {day.isToday && (
            <span className="screen-only rounded-full bg-[var(--gold)] px-1 py-px text-[7px] font-medium text-white sm:text-[8px]">
              היום
            </span>
          )}
        </span>
        <span
          className={`text-[9px] leading-none sm:text-[10px] print:text-[8px] font-medium ${
            hasImage ? 'text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]' : 'text-[var(--ink-soft)]'
          }`}
        >
          {day.gregDay}
        </span>
      </span>

      {day.isShabbat && day.holiday && day.parsha && (
        <span
          className={`relative mt-0.5 text-[10px] leading-tight font-medium print:text-[8px] print:mt-0 ${
            hasImage ? 'text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]' : 'text-[var(--shabbat)]'
          }`}
        >
          {day.parsha}
        </span>
      )}

      {(day.holiday || day.parsha) && (
        <span
          className={`relative mt-0.5 line-clamp-2 text-[10px] leading-tight print:text-[8px] print:mt-0 ${
            day.isFestive ? 'font-bold' : 'font-medium'
          } ${
            hasImage
              ? day.isFestive
                ? 'text-sky-300 font-bold [text-shadow:0_1px_3px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,0.9)]'
                : 'text-amber-200 font-bold [text-shadow:0_1px_3px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,0.9)]'
              : day.isFestive
                ? 'text-[var(--fest)]'
                : day.holiday
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--shabbat)]'
          }`}
        >
          {day.holiday ?? day.parsha}
        </span>
      )}

      {day.omerText && !day.holiday?.includes('עומר') && (
        <span
          className={`relative mt-0.5 text-[9px] leading-tight sm:text-[10px] print:text-[7px] print:mt-0 ${
            hasImage ? 'text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]' : 'text-[var(--ink-soft)]'
          }`}
        >
          {day.omerText}
        </span>
      )}

      <span className="relative mt-auto flex flex-col justify-end gap-0.5 pt-0.5 print:gap-0 print:pt-0">
        {entry?.title && (
          <span
            className={`line-clamp-2 text-[9px] leading-tight font-bold sm:text-[10px] print:text-[8px] ${
              hasImage ? 'text-white drop-shadow-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]' : 'text-[var(--accent)]'
            }`}
          >
            {entry.title}
          </span>
        )}
        {entry?.note && !isBirthday && (
          <span
            className={`line-clamp-2 text-[8px] leading-tight sm:text-[9px] print:text-[7px] ${
              hasImage ? 'text-white/90 drop-shadow-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]' : 'text-[var(--ink-soft)]'
            }`}
          >
            {entry.note}
          </span>
        )}
        {!entry?.title && !entry?.note && (
          <span className="screen-only self-end text-sm leading-none text-transparent transition-colors group-hover:text-[var(--accent-soft)]">
            ＋
          </span>
        )}
      </span>
    </button>
  )
}

/* ─── Event modal ─── */
function EventModal({
  day,
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  day: DayInfo
  entry?: EventEntry
  onClose: () => void
  onSave: (e: EventEntry) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(entry?.title ?? '')
  const [note, setNote] = useState(entry?.note ?? '')
  const [image, setImage] = useState(entry?.image ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const [cropSrc, setCropSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const areaPixels = useRef<Area | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (cropSrc ? setCropSrc('') : onClose())
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, cropSrc])

  const startCrop = (src: string) => {
    setCropSrc(src)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    areaPixels.current = null
  }

  const onFile = async (file?: File) => {
    if (!file) return
    try {
      startCrop(await downscaleImage(file, 1600))
    } catch {
      /* ignore unreadable files */
    }
  }

  const applyCrop = async () => {
    try {
      setImage(await getCroppedDataUrl(cropSrc, areaPixels.current))
    } catch {
      setImage(cropSrc)
    }
    setCropSrc('')
  }

  const canSave = !cropSrc && !!(title.trim() || note.trim() || image)

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[var(--ink)]/45 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`אירוע אישי · ${day.heDay} ${day.heMonth}`}
        className="animate-fade-in relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[var(--line)] px-6 py-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-[var(--accent)] uppercase">
              {day.holiday ?? (day.parsha ? `פרשת ${day.parsha}` : 'אירוע אישי')}
            </p>
            <h3 className="font-display mt-1 text-3xl font-bold text-[var(--ink)]">
              {day.heDay} {day.heMonth}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="סגירה"
            className="grid h-8 w-8 place-items-center rounded-full text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {cropSrc ? (
            <div>
              <div className="relative aspect-[1.35/1] w-full overflow-hidden rounded-lg bg-black">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={CELL_ASPECT}
                  objectFit="cover"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, px) => (areaPixels.current = px)}
                  onCropAreaChange={(_, px) => (areaPixels.current = px)}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-[var(--ink-soft)]">זום</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1 flex-1 accent-[var(--accent)]"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={applyCrop}
                  className="flex-1 rounded-lg bg-[var(--accent)] py-2 text-sm font-medium text-[var(--paper)] transition-colors hover:bg-[var(--accent-soft)]"
                >
                  חיתוך ושמירה
                </button>
                <button
                  onClick={() => setCropSrc('')}
                  className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                >
                  ביטול
                </button>
              </div>
            </div>
          ) : image ? (
            <div>
              <div
                className="h-44 w-full overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--paper-2)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => startCrop(image)}
                  className="flex-1 rounded-lg border border-[var(--line)] py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-soft)]"
                >
                  חיתוך מחדש
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 rounded-lg border border-[var(--line)] py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-soft)]"
                >
                  החלפת תמונה
                </button>
                <button
                  onClick={() => setImage('')}
                  className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  הסרה
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-44 w-full items-center justify-center rounded-lg border-2 border-dashed border-[var(--line)] bg-[var(--paper-2)] transition-colors hover:border-[var(--accent-soft)]"
            >
              <span className="text-center text-sm text-[var(--ink-soft)]">
                <span className="font-display block text-2xl text-[var(--accent-soft)]">＋</span>
                הוסיפו תמונה של המאורע
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת האירוע (למשל: יום הולדת)"
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent-soft)]"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="מה קרה ביום הזה?"
            className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent-soft)]"
          />
        </div>

        <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-4">
          <div>
            {entry && (
              <button
                onClick={() => {
                  if (window.confirm('האם למחוק את האירוע והתמונה?')) {
                    onDelete()
                  }
                }}
                className="text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
              >
                מחיקה
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              ביטול
            </button>
            <button
              onClick={() => onSave({ title: title.trim(), note: note.trim(), image })}
              disabled={!canSave}
              className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--paper)] transition-all hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              שמירה
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
