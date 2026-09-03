import {
  HDate,
  Sedra,
  Locale,
  gematriya,
  HebrewCalendar,
  flags,
} from '@hebcal/core'

export const HEBREW_YEAR = 5787

const strip = (s: string) => Locale.hebrewStripNikkud(s)

export type DayInfo = {
  iso: string // gregorian YYYY-MM-DD, used as event key
  date: Date
  hDay: number
  heDay: string // gematria, e.g. "כ״ה"
  heMonth: string // Hebrew month name
  gregDay: number
  weekday: number // 0 = Sunday, 6 = Shabbat
  holiday?: string
  holidays: string[] // all holidays that fall on the day
  isShabbat: boolean
  isYomTov: boolean
  isCholHamoed: boolean
  isChanukah: boolean
  isFestive: boolean // Yom Tov, Chol HaMoed or Chanukah — gets a bold highlight
  isToday: boolean
  omer?: number // day of the Omer count, 1..49
  omerText?: string // e.g. "ה׳ בעומר"
  parsha?: string // Hebrew parsha for a Shabbat, e.g. "בראשית"
}

export type HebMonth = {
  key: string // english month name, stable id
  index: number // 1-based position in the year
  heName: string
  gregSpan: string
  season: Season
  days: DayInfo[]
}

export type Season = 'autumn' | 'winter' | 'spring' | 'summer'

// Calendar-order month numbers starting at Tishrei (7), wrapping to Elul (6).
function monthOrder(year: number): number[] {
  const total = HDate.monthsInYear(year) // 13 in a leap year such as 5787
  const order: number[] = []
  for (let m = 7; m <= total; m++) order.push(m)
  for (let m = 1; m <= 6; m++) order.push(m)
  return order
}

const HE_MONTHS = new Intl.DateTimeFormat('he', { month: 'short', day: 'numeric' })

function seasonFor(index: number): Season {
  // index 1 = Tishrei
  if (index <= 2) return 'autumn'
  if (index <= 6) return 'winter'
  if (index <= 9) return 'spring'
  return 'summer'
}

export function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export function buildYear(): HebMonth[] {
  const year = HEBREW_YEAR
  const todayIso = isoOf(new Date())
  const sedra = new Sedra(year, true) // true = Israel schedule
  const order = monthOrder(year)
  const omerStart = new HDate(16, 'Nisan', year).abs() // 1st day of the Omer
  const chanukahStart = new HDate(25, 9, year).abs() // 25 Kislev — Day 1 (נר א׳)

  return order.map((m, i) => {
    const days: DayInfo[] = []
    const dim = HDate.daysInMonth(m, year)
    const firstHd = new HDate(1, m, year)
    const heName = strip(Locale.gettext(firstHd.getMonthName(), 'he'))

    for (let d = 1; d <= dim; d++) {
      const hd = new HDate(d, m, year)
      const date = hd.greg()
      const weekday = hd.getDay()
      const isShabbat = weekday === 6

      // Holidays for the day (Israel schedule). Keep the full list, but order
      // real Yamim Tovim before Rosh Chodesh / Mevarchim so the primary reads right.
      // Keep only traditional Jewish/Hebrew holidays; drop modern Israeli
      // national days (Yom HaAtzmaut, Yom HaZikaron, Yom HaShoah, Yom
      // Yerushalayim, etc.), which hebcal marks with the MODERN_HOLIDAY flag.
      // Chanukah calculation based on Hebrew dates (day begins at sunset):
      // Day 1 (נר א׳) is on 25 Kislev, running 8 days through 2 Tevet (נר ח׳ / זאת חנוכה).
      const chanukahOffset = hd.abs() - chanukahStart
      const isChanukah = chanukahOffset >= 0 && chanukahOffset < 8

      // Holidays for the day (Israel schedule). Keep the full list, but order
      // real Yamim Tovim before Rosh Chodesh / Mevarchim so the primary reads right.
      // Keep only traditional Jewish/Hebrew holidays; drop modern Israeli
      // national days (Yom HaAtzmaut, Yom HaZikaron, Yom HaShoah, Yom
      // Yerushalayim, etc.), which hebcal marks with the MODERN_HOLIDAY flag.
      const evs = (HebrewCalendar.getHolidaysOnDate(hd, true) || []).filter((e) => {
        if ((e.getFlags() & flags.MODERN_HOLIDAY) !== 0) return false
        const desc = e.getDesc()
        // Drop Hebcal's default Chanukah events so our exact Hebrew-date based ones take over
        if (/Chanukah/i.test(desc)) return false
        // Drop minor observances the user doesn't want on the calendar.
        if (/^Ta'anit BeHaB$/.test(desc)) return false
        if (/^Yom Kippur Katan\b/.test(desc)) return false
        if (/^Chag HaBanot$/.test(desc)) return false
        if (/^Rosh Hashana LaBehemot$/.test(desc)) return false
        return true
      })

      // Purim in Adar II (14 = Purim, 15 = Shushan Purim) and Lag BaOmer (18 Iyyar)
      // are given festive color treatment like Yamim Tovim.
      const isPurim = m === 13 && (d === 14 || d === 15)
      const isLagBaOmer = m === 2 && d === 18

      const isYomTov = evs.some((e) => (e.getFlags() & flags.CHAG) !== 0)
      const isCholHamoed = evs.some((e) => (e.getFlags() & flags.CHOL_HAMOED) !== 0)
      const isFestive = isYomTov || isCholHamoed || isChanukah || isPurim || isLagBaOmer
      const holidays = evs
        .slice()
        .sort((a, b) => (b.getFlags() & flags.CHAG) - (a.getFlags() & flags.CHAG))
        .map((e) => strip(e.renderBrief('he')).replace(/\s*\d{3,4}\s*$/, ''))

      if (isChanukah) {
        const CHANUKAH_NAMES = [
          'חנוכה: נר א׳',
          'חנוכה: נר ב׳',
          'חנוכה: נר ג׳',
          'חנוכה: נר ד׳',
          'חנוכה: נר ה׳',
          'חנוכה: נר ו׳',
          'חנוכה: נר ז׳',
          'חנוכה: נר ח׳ (זאת חנוכה)',
        ]
        holidays.unshift(CHANUKAH_NAMES[chanukahOffset])
      }

      const holiday = holidays[0]

      // Parsha on Shabbat
      let parsha: string | undefined
      if (isShabbat) {
        const look = sedra.lookup(hd)
        if (look && !look.chag && look.parsha?.length) {
          parsha = look.parsha
            .map((p: string) => strip(Locale.gettext(p, 'he')))
            .join('־')
        }
      }

      // Omer count (16 Nisan → 5 Sivan)
      const omerNum = hd.abs() - omerStart + 1
      const omer = omerNum >= 1 && omerNum <= 49 ? omerNum : undefined
      // On Lag BaOmer (omer 33), holiday already displays 'ל״ג בעומר' so omit duplicate omerText
      const omerText = omer && omer !== 33 ? `${gematriya(omer)} בעומר` : undefined

      const iso = isoOf(date)
      days.push({
        iso,
        date,
        hDay: d,
        heDay: gematriya(d),
        heMonth: heName,
        gregDay: date.getDate(),
        weekday,
        holiday,
        holidays,
        isShabbat,
        isYomTov,
        isCholHamoed,
        isChanukah,
        isFestive,
        isToday: iso === todayIso,
        omer,
        omerText,
        parsha,
      })
    }

    const first = days[0].date
    const last = days[days.length - 1].date
    const gregSpan = `${HE_MONTHS.format(first)} – ${HE_MONTHS.format(last)} ${last.getFullYear()}`

    return {
      key: firstHd.getMonthName(),
      index: i + 1,
      heName,
      gregSpan,
      season: seasonFor(i + 1),
      days,
    }
  })
}
