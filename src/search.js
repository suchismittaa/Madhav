// Library search: name, category, Sanskrit (Devanagari), transliteration, English meaning, keywords.
// Roman text is folded (diacritics and common spelling variants removed) so "krishna" finds "Kṛṣṇa",
// "shiva" finds "Śiva", and "chalisa" finds "Cālīsā".
const MAP={ṛ:'ri',ṝ:'ri',ṣ:'sh',ś:'sh',ṇ:'n',ṅ:'n',ñ:'n',ṭ:'t',ḍ:'d',ṁ:'m',ṃ:'m',ḥ:'h',ā:'a',ī:'i',ū:'u',ḷ:'l',ē:'e',ō:'o'};
export const fold=s=>(s||'').toLowerCase().replace(/[ṛṝṣśṇṅñṭḍṁṃḥāīūḷēō]/g,c=>MAP[c]||c)
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u0900-\u097f\s]/g,' ').replace(/\s+/g,' ').trim();
// "loose" form: tolerant of spelling differences (ch/c, sh/s, double letters, v/w, ee/i, oo/u)
export const loose=s=>fold(s).replace(/ee/g,'i').replace(/oo/g,'u').replace(/w/g,'v').replace(/h/g,'').replace(/(.)\1+/g,'$1');
const dev=s=>(s||'').replace(/[\u0964\u0965\u0966-\u096f]/g,' ').replace(/\s+/g,' ').trim();

function prep(item){ // cache folded fields on the item
  if(item._p)return item._p;
  const f={};
  for(const [k,v] of Object.entries(item.fields))f[k]={s:fold(v),l:loose(v),d:dev(v)};
  return item._p=f;
}
const WEIGHT={title:10,category:6,keywords:7,tr:4,sa:4,en:3,summary:2};
// Returns the best score for a query against an item, plus the field that matched.
function scoreItem(item,tokens){
  const p=prep(item);let total=0,best=null,bestW=0;
  for(const tok of tokens){
    const ft=fold(tok),lt=loose(tok),dt=dev(tok);let hit=0,hitField=null;
    for(const [k,w] of Object.entries(WEIGHT)){
      const f=p[k];if(!f)continue;
      const m=(ft&&f.s.includes(ft))||(dt&&/[\u0900-\u097f]/.test(dt)&&f.d.includes(dt))?1:(lt&&f.l.includes(lt)?0.6:0);
      if(m&&w*m>hit){hit=w*m;hitField=k}
    }
    if(!hit)return null;               // every word must match somewhere
    total+=hit;if(hit>bestW){bestW=hit;best=hitField}
  }
  return {score:total,field:best};
}
const FIELD_LABEL={title:'Name',category:'Category',keywords:'Also known as',tr:'Transliteration',sa:'Sanskrit',en:'Meaning',summary:'Description'};
export const fieldLabel=k=>FIELD_LABEL[k]||k;

// texts: array of Text objects (library + custom). gita: array of Gita verses.
export function searchLibrary(q,texts,gita=[]){
  const tokens=q.trim().split(/\s+/).filter(Boolean);
  if(!tokens.length)return [];
  const out=[];
  for(const t of texts){
    const whole={fields:{title:t.title,category:t.cat||t.category,keywords:(t.keywords||[]).join(' '),summary:t.summary||'',
      tr:t.sections.map(s=>s.tr).join(' '),sa:t.sections.map(s=>s.sa).join(' '),en:t.sections.map(s=>s.en).join(' ')}};
    t._whole=t._whole||whole;
    const r=scoreItem(t._whole,tokens);
    if(r)out.push({type:'text',text:t,score:r.score+(t.custom?0:0.1),field:r.field});
    if(t.kind!=='mantra'&&t.sections.length>1){ // find individual verses inside long texts
      for(const s of t.sections){
        if(s.pending)continue;
        s._i=s._i||{fields:{title:s.label||'',tr:s.tr||'',sa:s.sa||'',en:s.en||''}};
        const rs=scoreItem(s._i,tokens);
        if(rs&&(rs.field!=='title'))out.push({type:'section',text:t,section:s,score:rs.score-1,field:rs.field});
      }
    }
  }
  for(const v of gita){
    v._i=v._i||{fields:{title:`Bhagavad Gita ${v.ch}.${v.v}`,category:'Bhagavad Gita',tr:v.tr,sa:v.sa,en:v.en+' '+(v.why||'')}};
    const r=scoreItem(v._i,tokens);if(r)out.push({type:'gita',verse:v,score:r.score-1,field:r.field});
  }
  return out.sort((a,b)=>b.score-a.score);
}
