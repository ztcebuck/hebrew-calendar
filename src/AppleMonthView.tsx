import React from 'react'
import { type DayInfo, type HebMonth } from './hebrew-calendar'
import { APPLE_MONTH_THEMES } from './apple-themes'

type EventEntry = {
  title: string
  note: string
  image: string
  birthday?: boolean
  name?: string
}
type EventMap = Record<string, EventEntry>

export function AppleMonthView({
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
  const theme = APPLE_MONTH_THEMES[month.key] ?? APPLE_MONTH_THEMES['Tishrei']

  return (
    <section
      style={{
        '--apple-accent': theme.accentColor,
        '--apple-soft': theme.accentSoft,
        '--apple-light': theme.accentLight,
      } as React.CSSProperties}
      className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white/80 backdrop-blur-2xl print:m-0 print:border-none print:rounded-none print:p-0 print:shadow-none print:h-full print:flex print:flex-col"
    >
      {/* Dynamic Apple Ambient Mesh Gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-all duration-700"
        style={{ backgroundImage: theme.meshGrad }}
      />

      {/* Optional seasonal photo backdrop (e.g. Tevet Jerusalem Snow) */}
      {theme.photo && (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${theme.photo})`,
            backgroundPosition: 'center 35%',
            opacity: theme.photoOpacity ?? 0.25,
          }}
        />
      )}

      {/* Apple Frosted Glass Glow Sheet */}
      <div className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-3xl" />

      {/* Month Header Banner */}
      <header className="relative z-10 flex flex-col gap-3 px-6 pt-6 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/50 print:pb-2 print:pt-3">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm text-2xl border border-white/60"
            style={{ backgroundColor: theme.accentLight }}
          >
            <span>{theme.icon}</span>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-none">
                {month.heName}
              </h2>
              <span className="rounded-full bg-zinc-900/5 border border-zinc-900/10 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                {month.gregSpan}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm font-medium text-zinc-500">
              {theme.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="screen-only flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onPrev}
            title="חודש קודם"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-xs border border-zinc-200 text-zinc-700 hover:bg-white hover:text-zinc-900 active:scale-95 transition-all"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            title="חודש הבא"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-xs border border-zinc-200 text-zinc-700 hover:bg-white hover:text-zinc-900 active:scale-95 transition-all"
          >
            ›
          </button>
        </div>
      </header>

      {/* Weekday Labels */}
      <div className="relative z-10 grid grid-cols-7 border-b border-zinc-200/50 px-4 py-2 text-center text-xs font-bold text-zinc-400 print:py-1">
        <span>ראשון</span>
        <span>שני</span>
        <span>שלישי</span>
        <span>רביעי</span>
        <span>חמישי</span>
        <span>שישי</span>
        <span className="text-emerald-700 font-extrabold">שבת קודש</span>
      </div>

      {/* Days Grid */}
      <div
        className="relative z-10 grid flex-1 grid-cols-7 gap-2 p-4 sm:p-5 print:gap-1 print:p-1"
        style={{ gridTemplateRows: `repeat(${numWeeks}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: lead }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-[1.35/1] rounded-2xl bg-zinc-100/30 border border-dashed border-zinc-200/40" />
        ))}

        {month.days.map((day) => {
          const entry = events[day.iso]
          const isSelected = day.iso === selectedIso
          return (
            <AppleDayCell
              key={day.iso}
              day={day}
              entry={entry}
              isSelected={isSelected}
              onPick={onPick}
            />
          )
        })}
      </div>
    </section>
  )
}

function AppleDayCell({
  day,
  entry,
  isSelected,
  onPick,
}: {
  day: DayInfo
  entry?: EventEntry
  isSelected: boolean
  onPick: (d: DayInfo) => void
}) {
  const hasImage = Boolean(entry?.image)
  const isBirthday = Boolean(entry?.birthday)

  return (
    <button
      onClick={() => onPick(day)}
      style={hasImage ? { backgroundImage: `url(${entry!.image})` } : undefined}
      className={`group relative flex aspect-[1.35/1] flex-col justify-between overflow-hidden rounded-2xl p-2 text-right transition-all duration-200 cursor-pointer select-none bg-cover bg-center active:scale-[0.97] hover:scale-[1.015] hover:shadow-lg focus:outline-none print:aspect-auto print:h-full print:p-1 ${
        hasImage
          ? 'border-white/50 shadow-md ring-1 ring-black/10'
          : day.isShabbat
            ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs hover:bg-emerald-50 hover:border-emerald-300'
            : day.isFestive
              ? 'bg-rose-50/75 border-rose-200/80 shadow-xs hover:bg-rose-50 hover:border-rose-300'
              : 'bg-white/80 border-zinc-200/70 shadow-xs hover:bg-white hover:border-zinc-300'
      } ${
        isSelected
          ? 'ring-2 ring-[var(--apple-accent)] ring-offset-2'
          : ''
      } ${
        day.isToday
          ? 'ring-2 ring-blue-500 ring-offset-2'
          : ''
      }`}
    >
      {/* Vignette Overlay for Photo cells */}
      {hasImage && (
        <span
          className={`absolute inset-0 transition-opacity ${
            isBirthday
              ? 'bg-gradient-to-t from-black/85 via-black/10 to-black/45'
              : 'bg-gradient-to-t from-black/80 via-black/20 to-black/40'
          }`}
        />
      )}

      {/* Top Bar: Date Numbers */}
      <div className="relative z-10 flex items-start justify-between">
        <span
          className={`text-base sm:text-lg font-black leading-none ${
            hasImage
              ? 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'
              : day.isShabbat
                ? 'text-emerald-800'
                : day.isFestive
                  ? 'text-rose-700'
                  : 'text-zinc-800'
          }`}
        >
          {day.heDay}
        </span>

        <span
          className={`text-[10px] font-semibold ${
            hasImage
              ? 'text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]'
              : 'text-zinc-400'
          }`}
        >
          {day.gregDay}
        </span>
      </div>

      {/* Middle: Holiday / Parsha / Candle Lighting */}
      <div className="relative z-10 my-0.5 flex flex-col gap-0.5">
        {day.holiday && (
          <span
            className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-[9px] sm:text-[9.5px] font-bold leading-tight ${
              hasImage
                ? 'bg-white/20 backdrop-blur-md text-white border border-white/40 shadow-xs [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]'
                : day.isFestive
                  ? 'bg-rose-500/15 text-rose-700 border border-rose-200'
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}
          >
            {day.holiday}
          </span>
        )}

        {day.parsha && (
          <span
            className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-[9px] sm:text-[9.5px] font-bold leading-tight ${
              hasImage
                ? 'bg-emerald-950/60 backdrop-blur-md text-emerald-200 border border-emerald-400/50'
                : 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
            }`}
          >
            {day.parsha}
          </span>
        )}

        {day.omerText && !day.holiday?.includes('עומר') && (
          <span
            className={`text-[9px] font-medium ${
              hasImage ? 'text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]' : 'text-zinc-400'
            }`}
          >
            {day.omerText}
          </span>
        )}
      </div>

      {/* Bottom: Birthday or Event Title Badge */}
      <div className="relative z-10 mt-auto flex flex-col">
        {entry?.title && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold leading-tight shadow-xs ${
              hasImage
                ? 'bg-black/50 backdrop-blur-md text-white border border-white/30 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]'
                : isBirthday
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
            }`}
          >
            {isBirthday && <span>🎂</span>}
            <span className="truncate">{entry.title}</span>
          </div>
        )}
      </div>
    </button>
  )
}
