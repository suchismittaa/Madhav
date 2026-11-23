# Madhav assets
Originals are 65 MB of PNG; `scripts/optimize-assets.py` produces the 2.7 MB of WebP in `public/assets/madhav/`. Four originals (pink lotus, jewel orb, temple, twin diyas) had a fake checkerboard "transparency" baked into the pixels, and the emblem had a grey linen fringe around the circle. The script cuts these out properly. The full map with intended use of every file is in `src/assets.js`.

| Asset | Used in |
|---|---|
| logo-wordmark | splash, Home header, desktop sidebar (kept as the supplied image, not retyped) |
| emblem | splash, About card, favicon / PWA / apple-touch icons, desktop sidebar |
| krishna-standing + krishna-flute | Krishna category |
| krishna-pond | Wisdom landing (arch crop) |
| krishna-frame | Bhagavad Gita section header (arch crop) |
| lotus-ivory / lotus-emblem / temple / moon | Vishnu / Other Devotions / Hanuman / Shiva category art; moon also the evening reminder |
| lotus-bud | Today's Practice accent |
| lotus-pink | Journal empty state |
| lotus-petals + offering-hands | Jaap completion screen |
| lotus-border | section dividers |
| lotus-water | My Journey overview |
| lotus-sunrise / diya / moon / lotus-book | morning / jaap / evening / reading reminder cards |
| diya-twin | Gentle reminders header |
| peacock-feather | Gita verse cards (faint corner) |
| quill | Journal composer |
| jewel-orb | My Mantras empty state |
| gem-teal | the Guru bead of the mala |
| corner-tl (cropped from the Mughal corner frame, mirrored in CSS) | Today's Wisdom, reader, setup cards |
| tex-ivory | page paper |
| tex-teal | bottom navigation and desktop sidebar |
| tex-plum | Wisdom hero panel |
| tex-amethyst | reserved: not used in this version (plum trellis is used for the Wisdom hero instead) |
| arch-frame | reserved: not used. I tried framing the Krishna art in it but its opening is too small for text; the arch crops are done with CSS instead |
