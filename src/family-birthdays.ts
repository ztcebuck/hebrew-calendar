import { HDate, Locale, gematriya } from '@hebcal/core'
import { HEBREW_YEAR, isoOf } from './hebrew-calendar'

import batyaPhoto from './assets/family/batya.jpg'
import yankiPhoto from './assets/family/yanki.jpg'
import batshevaRutPhoto from './assets/family/batsheva_rut.jpg'
import chaimPhoto from './assets/family/chaim.jpg'
import yehuditPhoto from './assets/family/yehudit.jpg'
import rivkiPhoto from './assets/family/rivki.jpg'
import leahPhoto from './assets/family/leah.jpg'
import elazarPhoto from './assets/family/elazar.jpg'
import shifraPhoto from './assets/family/shifra.jpg'
import chaviPhoto from './assets/family/chavi.jpg'
import batshevaPhoto from './assets/family/batsheva.jpg'
import chayaPhoto from './assets/family/chaya.jpg'
import zeeviPhoto from './assets/family/zeevi.jpg'

/* ----------------------------------------------------------------------------
 * Family birthdays.
 *
 * Stored by HEBREW day + month rather than by Gregorian date, so they resolve
 * to the right cell in any year the calendar is built for.
 * -------------------------------------------------------------------------- */

const NISAN = 1
const SIVAN = 3
const ELUL = 6
const TISHREI = 7
const KISLEV = 9
const TEVET = 10
const SHEVAT = 11

export type Birthday = {
  name: string
  day: number
  month: number
  photo: string
}

export const FAMILY_BIRTHDAYS: Birthday[] = [
  { name: 'חוי', day: 2, month: TISHREI, photo: chaviPhoto },
  { name: 'יענקי', day: 23, month: TISHREI, photo: yankiPhoto },
  { name: 'אלעזר', day: 3, month: KISLEV, photo: elazarPhoto },
  { name: 'חיה', day: 14, month: TEVET, photo: chayaPhoto },
  { name: 'בת שבע', day: 18, month: TEVET, photo: batshevaPhoto },
  { name: 'שיפי', day: 27, month: TEVET, photo: shifraPhoto },
  { name: 'בת שבע רות', day: 17, month: SHEVAT, photo: batshevaRutPhoto },
  { name: 'לאה', day: 18, month: SHEVAT, photo: leahPhoto },
  { name: 'בתיה', day: 26, month: NISAN, photo: batyaPhoto },
  { name: 'חיים', day: 3, month: SIVAN, photo: chaimPhoto },
  { name: 'רבקי', day: 17, month: SIVAN, photo: rivkiPhoto },
  { name: 'זאבי', day: 4, month: ELUL, photo: zeeviPhoto },
  { name: 'יהודית', day: 26, month: ELUL, photo: yehuditPhoto },
]

export type BirthdayEntry = {
  title: string
  note: string
  image: string
  /** Marks the entry as a built-in birthday rather than a user-created event. */
  birthday: true
  name: string
}

/** e.g. "יז בסיון" */
function hebrewDateLabel(hd: HDate, day: number): string {
  const month = Locale.hebrewStripNikkud(Locale.gettext(hd.getMonthName(), 'he'))
  return `${gematriya(day)} ב${month}`
}

/**
 * The birthdays as an event map keyed by Gregorian ISO date, ready to merge
 * into the calendar's events for the given Hebrew year.
 */
export function birthdayEvents(year: number = HEBREW_YEAR): Record<string, BirthdayEntry> {
  const map: Record<string, BirthdayEntry> = {}
  for (const b of FAMILY_BIRTHDAYS) {
    try {
      const hd = new HDate(b.day, b.month, year)
      map[isoOf(hd.greg())] = {
        title: `יום הולדת ${b.name}`,
        note: `יום הולדת ${b.name} · ${hebrewDateLabel(hd, b.day)}`,
        image: b.photo,
        birthday: true,
        name: b.name,
      }
    } catch {
      // A date that does not exist in this year is simply skipped rather than
      // taking down the whole calendar.
    }
  }
  return map
}
