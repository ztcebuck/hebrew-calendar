import jerusalemSnowImg from './assets/jerusalem-snow.jpg'

export type AppleMonthTheme = {
  key: string
  heName: string
  tagline: string
  icon: string
  accentColor: string
  accentSoft: string
  accentLight: string
  meshGrad: string
  cardGlassBg: string
  photo?: string
  photoOpacity?: number
}

export const APPLE_MONTH_THEMES: Record<string, AppleMonthTheme> = {
  // תשרי — High Holidays, Royalty & Renewal
  Tishrei: {
    key: 'Tishrei',
    heName: 'תשרי',
    tagline: 'חודש החגים וההתחדשות · ראש השנה וסוכות',
    icon: '🍎',
    accentColor: '#E11D48', // Rose Ruby
    accentSoft: '#BE123C',
    accentLight: '#FFE4E6',
    meshGrad:
      'radial-gradient(at 15% 15%, rgba(225,29,72,0.18) 0%, transparent 55%), radial-gradient(at 85% 20%, rgba(245,158,11,0.18) 0%, transparent 50%), radial-gradient(at 50% 90%, rgba(225,29,72,0.08) 0%, transparent 60%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // חשון — First autumn rains, tranquil and contemplative
  Cheshvan: {
    key: 'Cheshvan',
    heName: 'חשון',
    tagline: 'חודש הגשמים, היורה וההתכנסות',
    icon: '🌧️',
    accentColor: '#0D9488', // Deep Teal
    accentSoft: '#0F766E',
    accentLight: '#CCFBF1',
    meshGrad:
      'radial-gradient(at 20% 15%, rgba(13,148,136,0.18) 0%, transparent 50%), radial-gradient(at 80% 80%, rgba(59,130,246,0.16) 0%, transparent 50%), radial-gradient(at 50% 30%, rgba(99,102,241,0.08) 0%, transparent 60%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // כסלו — Festival of Lights, Menorah radiance
  Kislev: {
    key: 'Kislev',
    heName: 'כסלו',
    tagline: 'חג האורים, הניסים ואור החנוכה',
    icon: '🕎',
    accentColor: '#2563EB', // Sapphire Blue & Amber Flame
    accentSoft: '#1D4ED8',
    accentLight: '#DBEAFE',
    meshGrad:
      'radial-gradient(at 50% 12%, rgba(245,158,11,0.24) 0%, transparent 45%), radial-gradient(at 15% 85%, rgba(37,99,235,0.20) 0%, transparent 55%), radial-gradient(at 85% 40%, rgba(217,119,6,0.14) 0%, transparent 50%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // טבת — Winter in Jerusalem, snow over the citadel
  Tevet: {
    key: 'Tevet',
    heName: 'טבת',
    tagline: 'חורף ירושלמי, שלג על החומות ומגדל דוד',
    icon: '❄️',
    accentColor: '#0284C7', // Glacier Sky Blue
    accentSoft: '#0369A1',
    accentLight: '#E0F2FE',
    meshGrad:
      'radial-gradient(at 25% 15%, rgba(2,132,199,0.18) 0%, transparent 50%), radial-gradient(at 85% 85%, rgba(180,83,9,0.12) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(56,189,248,0.10) 0%, transparent 60%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.78)',
    photo: jerusalemSnowImg,
    photoOpacity: 0.35,
  },

  // שבט — Tu BiShvat & Almond Blossoms
  "Sh'vat": {
    key: "Sh'vat",
    heName: 'שבט',
    tagline: 'ראש השנה לאילנות ופריחת השקדיות',
    icon: '🌸',
    accentColor: '#059669', // Emerald Spring
    accentSoft: '#047857',
    accentLight: '#D1FAE5',
    meshGrad:
      'radial-gradient(at 15% 20%, rgba(5,150,105,0.18) 0%, transparent 50%), radial-gradient(at 85% 15%, rgba(244,63,94,0.16) 0%, transparent 45%), radial-gradient(at 60% 85%, rgba(16,185,129,0.10) 0%, transparent 55%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // אדר א׳ — Leap Month, Tranquil Lavender
  'Adar I': {
    key: 'Adar I',
    heName: 'אדר א׳',
    tagline: 'חודש העיבור, שלווה והכנה לאדר ב׳',
    icon: '✨',
    accentColor: '#7C3AED', // Amethyst Violet
    accentSoft: '#6D28D9',
    accentLight: '#EDE9FE',
    meshGrad:
      'radial-gradient(at 35% 15%, rgba(124,58,237,0.18) 0%, transparent 50%), radial-gradient(at 75% 75%, rgba(99,102,241,0.14) 0%, transparent 45%), radial-gradient(at 15% 80%, rgba(167,139,250,0.12) 0%, transparent 50%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // אדר ב׳ — Purim Joy & Celebration
  'Adar II': {
    key: 'Adar II',
    heName: 'אדר ב׳',
    tagline: 'מרבים בשמחה, פורים ושושן פורים',
    icon: '🎭',
    accentColor: '#9333EA', // Royal Purim Magenta
    accentSoft: '#7E22CE',
    accentLight: '#F3E8FF',
    meshGrad:
      'radial-gradient(at 20% 25%, rgba(192,38,211,0.22) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(245,158,11,0.20) 0%, transparent 45%), radial-gradient(at 50% 80%, rgba(147,51,234,0.14) 0%, transparent 55%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // ניסן — Month of Spring & Passover Freedom
  Nisan: {
    key: 'Nisan',
    heName: 'ניסן',
    tagline: 'חג הפסח, חודש האביב וזמן חירותנו',
    icon: '🍷',
    accentColor: '#EA580C', // Spring Sunrise Coral
    accentSoft: '#C2410C',
    accentLight: '#FFEDD5',
    meshGrad:
      'radial-gradient(at 25% 15%, rgba(234,88,12,0.20) 0%, transparent 50%), radial-gradient(at 75% 75%, rgba(202,138,4,0.16) 0%, transparent 45%), radial-gradient(at 50% 50%, rgba(249,115,22,0.10) 0%, transparent 60%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // אייר — Lag BaOmer bonfire & Omer counting
  Iyyar: {
    key: 'Iyyar',
    heName: 'אייר',
    tagline: 'ספירת העומר והילולת ל״ג בעומר',
    icon: '🔥',
    accentColor: '#D97706', // Warm Ember Gold
    accentSoft: '#B45309',
    accentLight: '#FEF3C7',
    meshGrad:
      'radial-gradient(at 50% 85%, rgba(220,38,38,0.20) 0%, transparent 50%), radial-gradient(at 20% 20%, rgba(8,145,178,0.18) 0%, transparent 45%), radial-gradient(at 80% 30%, rgba(217,119,6,0.16) 0%, transparent 50%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // סיון — Shavuot, Torah & Wheat Harvest
  Sivan: {
    key: 'Sivan',
    heName: 'סיון',
    tagline: 'חג השבועות, מתן תורה וקציר חיטים',
    icon: '🌾',
    accentColor: '#65A30D', // Golden Wheat Green
    accentSoft: '#4D7C0F',
    accentLight: '#ECFCCB',
    meshGrad:
      'radial-gradient(at 35% 15%, rgba(180,83,9,0.20) 0%, transparent 50%), radial-gradient(at 80% 75%, rgba(101,163,13,0.18) 0%, transparent 45%), radial-gradient(at 20% 70%, rgba(37,99,235,0.10) 0%, transparent 50%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // תמוז — Midsummer Golden Hours
  Tamuz: {
    key: 'Tamuz',
    heName: 'תמוז',
    tagline: 'ימי הקיץ והשמש הזוהרת',
    icon: '☀️',
    accentColor: '#C2410C', // Terracotta Amber
    accentSoft: '#9A3412',
    accentLight: '#FFEDD5',
    meshGrad:
      'radial-gradient(at 20% 20%, rgba(194,65,12,0.20) 0%, transparent 50%), radial-gradient(at 80% 80%, rgba(217,119,6,0.18) 0%, transparent 45%), radial-gradient(at 50% 50%, rgba(245,158,11,0.10) 0%, transparent 60%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // אב — Tu B'Av & Consolation (נחמו)
  Av: {
    key: 'Av',
    heName: 'אב',
    tagline: 'נחמה, קירוב לבבות וט״ו באב',
    icon: '🍇',
    accentColor: '#4F46E5', // Twilight Indigo
    accentSoft: '#4338CA',
    accentLight: '#E0E7FF',
    meshGrad:
      'radial-gradient(at 45% 15%, rgba(79,70,229,0.20) 0%, transparent 50%), radial-gradient(at 85% 80%, rgba(225,29,72,0.16) 0%, transparent 45%), radial-gradient(at 15% 70%, rgba(99,102,241,0.12) 0%, transparent 50%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },

  // אלול — Mercy, Forgiveness & Shofar Dawn
  Elul: {
    key: 'Elul',
    heName: 'אלול',
    tagline: 'ימי הרחמים והסליחות, קול שופר והתעוררות',
    icon: '📯',
    accentColor: '#0284C7', // Celestial Blue & Dawn Gold
    accentSoft: '#0369A1',
    accentLight: '#E0F2FE',
    meshGrad:
      'radial-gradient(at 30% 15%, rgba(2,132,199,0.18) 0%, transparent 50%), radial-gradient(at 70% 75%, rgba(217,119,6,0.16) 0%, transparent 45%), radial-gradient(at 50% 40%, rgba(14,165,233,0.10) 0%, transparent 55%)',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
  },
}
