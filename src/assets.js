// Madhav asset map. Every supplied artwork has one name and one intended use.
// Files live in /public/assets/madhav (optimised WebP, transparent where the original was; see scripts/optimize-assets.py).
// Use <Deco a="name" h={40}/> from ui.jsx: it renders a decorative, non-interactive, correctly proportioned image.
const A=(file,w,h,use)=>({src:`/assets/madhav/${file}.webp`,w,h,use});
export const ASSETS={
  logo:        A('logo-wordmark',900,311,'Madhav calligraphic wordmark (image, never retyped): splash, Home header, desktop sidebar plaque'),
  emblem:      A('emblem',720,720,'Circular Madhav emblem: splash, About card, app icons (favicon, PWA, apple-touch)'),
  krishna:     A('krishna-standing',349,700,'Krishna with flute and peacock feather: Krishna category header'),
  krishnaPond: A('krishna-pond',428,760,'Krishna by the lotus pond: Wisdom landing'),
  krishnaFrame:A('krishna-frame',428,760,'Framed Krishna watercolour: Bhagavad Gita section header'),
  lotusIvory:  A('lotus-ivory',640,458,'Ivory lotus: Vishnu category art, empty states'),
  lotusPink:   A('lotus-pink',640,438,'Pink lotus: Journal saved / Journey empty states'),
  lotusBud:    A('lotus-bud',355,600,'Lotus bud: Home, Today’s Practice accent'),
  petals:      A('lotus-petals',640,436,'Scattered petals: session complete screen'),
  lotusEmblem: A('lotus-emblem',504,520,'Lotus emblem: Other Devotions art, Wisdom divider'),
  lotusBorder: A('lotus-border',1100,98,'Slim lotus border: section divider'),
  lotusVine:   A('lotus-vine',1100,299,'Golden lotus vine: page header flourish (Library, Journey, Wisdom)'),
  lotusWater:  A('lotus-water',900,352,'Lotus on water: Journey overview header'),
  sunrise:     A('lotus-sunrise',800,377,'Golden lotus sunrise: morning reminder art'),
  peacock:     A('peacock-feather',323,560,'Peacock feather: Krishna content, verse cards'),
  flute:       A('krishna-flute',800,525,'Krishna’s flute with feather: Krishna category divider'),
  diya:        A('diya',477,520,'Diya: Jaap reminder, evening ritual'),
  diyaTwin:    A('diya-twin',700,368,'Twin diyas: Reminders settings header, journal'),
  temple:      A('temple',449,600,'Temple: Hanuman category art, desktop sidebar'),
  moon:        A('moon',560,481,'Crescent moon: Shiva category art, evening reminder art'),
  arch:        A('arch-frame',431,640,'Mughal arch: Wisdom landing frame'),
  hands:       A('offering-hands',640,514,'Offering hands: jaap complete screen, prayer'),
  quill:       A('quill',386,520,'Quill and ink: Journal header'),
  book:        A('lotus-book',640,546,'Lotus book: reading reminder art, Gita section'),
  orb:         A('jewel-orb',519,520,'Teal jewel orb: My Mantras empty state'),
  gem:         A('gem-teal',360,357,'Teal gemstone with gold veins: the Guru (sumeru) bead of the mala'),
  // CSS-only (see index.css): tex-ivory (page paper), tex-teal (navigation), tex-plum + tex-amethyst (Wisdom panels), corner-tl (ornamental corners)
};
export const asset=n=>ASSETS[n];
