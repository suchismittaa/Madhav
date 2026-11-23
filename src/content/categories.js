// Library categories. `glyph` is a Devanagari watermark used on the category card (no images needed).
// `art` names an entry in ../assets.js used as a small decoration on that category's pages.
export const CATEGORIES=[
{id:'krishna',name:'Krishna',glyph:'कृष्ण',art:'peacock',blurb:'Names, songs and hymns of Madhava, Govinda and Radha-vallabha.'},
{id:'vishnu',name:'Vishnu',glyph:'विष्णु',art:'lotusIvory',blurb:'Narayana mantras, the Sahasranama and prayers to Achyuta.'},
{id:'hanuman',name:'Hanuman',glyph:'हनुमान',art:'temple',blurb:'The Chalisa and the mantras of Anjaneya, servant of Rama.'},
{id:'shiva',name:'Shiva',glyph:'शिव',art:'moon',blurb:'Om Namah Shivaya, the Maha Mrityunjaya and the Panchakshara Stotram.'},
{id:'other',name:'Other Devotions',glyph:'ॐ',art:'lotusEmblem',blurb:'Gayatri, Durga and the sacred syllable Om.'},
];
export const catName=id=>CATEGORIES.find(c=>c.id===id)?.name||id;
