// Content index. All scripture and mantra content lives in this folder and follows ONE schema:
//
// Text = {
//   id            unique, stable string (used for favourites, bookmarks, reading progress)
//   title         display name
//   category      id from categories.js
//   kind          'mantra' | 'stotra' | 'scripture'
//   chantable     true if a Start Jaap button should be shown
//   keywords      extra search words and spellings
//   summary       one line shown on cards
//   explanation   short paragraph for the detail page
//   pronunciation optional guidance
//   source        where the text comes from
//   src           (merged in from ./provenance.js) { work, ref, edition, url, verification, note, checked }
//   status        { text: 'verified' | 'traditional' | 'needs-verification' | 'pending', note }
//   sections      [{ id, label?, group?, sa?, tr?, en?, note?, pending?, status? }]
// }
import {CATEGORIES,catName} from './categories.js';
import {MANTRAS_DATA} from './mantras.js';
import {STOTRAS_DATA} from './stotras.js';
import {HANUMAN_CHALISA} from './hanuman-chalisa.js';
import {VISHNU_SAHASRANAMA} from './vishnu-sahasranama.js';
import {SHIVA_PANCHAKSHARA} from './shiva.js';
import {provenanceFor,VERIFY_LABEL} from './provenance.js';

// Order inside each category follows the order requested for the library.
const ORDER=['mm-hare','mm-vasu','mm-krishnaya','mm-radhe','mm-govind-hare','madhurashtakam','govind-damodar',
 'mm-nara','vishnu-sahasranama','shantakaram','achyutam-keshavam',
 'hanuman-chalisa','mm-hanu','hanuman-ashtak','bajrang-baan','mm-hanu-gayatri',
 'mm-shiva','mm-mmj','shiva-panchakshara','mm-gayatri','mm-durga','mm-om'];
const all=[...MANTRAS_DATA,...STOTRAS_DATA,HANUMAN_CHALISA,VISHNU_SAHASRANAMA,SHIVA_PANCHAKSHARA];
export const TEXTS=all.map(t=>({...t,cat:catName(t.category),src:provenanceFor(t)})).sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id));
export {CATEGORIES,catName,VERIFY_LABEL};
export const textById=id=>TEXTS.find(t=>t.id===id);
// Multi-verse stotras and scriptures get the full / verse-by-verse reader; multi-line mantras are shown as one page.
export const isSectioned=t=>t.kind!=='mantra'&&t.sections.length>1;
export const hasContent=t=>t.sections.some(s=>!s.pending);
export const STATUS_LABEL={verified:'Verified text','traditional':'Traditional text','needs-verification':'Needs verification',pending:'Content pending'};
