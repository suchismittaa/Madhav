import {Link,useParams} from 'react-router-dom';
import {CATEGORIES} from '../../content/index.js';
import {VERSES} from '../../data';
import {useStore} from '../../store';
import {useAllTexts} from '../../library';
import {TextCard,JaapButton,FavBtn,Verse} from '../../components';
import {Deco,Ornament,ReadToggle,useReaderPrefs,NoLayerHint} from '../../ui';

const Back=()=><Link className="text-[.8125rem] underline" to="/library">← Library</Link>;

export default function Category(){
  const {cat}=useParams();const [texts]=useAllTexts();const [rd]=useStore('read',{});const [rp,setRp]=useReaderPrefs();
  if(cat==='gita')return <div className="space-y-3"><Back/>
    <header className="relative flex items-center gap-3 pr-1"><div className="flex-1"><h2 className="text-3xl">Bhagavad Gita</h2><p className="text-sm text-ink-soft">Verses of Krishna’s teaching to Arjuna.</p></div>
      <div className="shrink-0 overflow-hidden border border-[var(--line)] shadow-sm" style={{borderRadius:'999px 999px 10px 10px'}}><Deco a="krishnaFrame" h={96} style={{display:'block'}}/></div></header>
    <ReadToggle rp={rp} setRp={setRp} size={false}/><NoLayerHint rp={rp}/>
    <div className="space-y-2.5">{VERSES.map(v=><Verse key={v.id} v={v} full={false} rp={rp} compact/>)}</div></div>;
  const c=CATEGORIES.find(x=>x.id===cat);
  if(!c)return <p>Category not found. <Link className="underline" to="/library">Back to the library</Link></p>;
  const list=texts.filter(t=>t.category===c.id&&!t.custom),mine=texts.filter(t=>t.category===c.id&&t.custom);
  const row=t=><TextCard key={t.id} t={t} rd={rd} extra={<>{t.chantable&&<JaapButton id={t.id} label="Jaap" className="btn btn-sm"/>}<FavBtn id={t.id} compact name={t.title}/></>}/>;
  return <div className="space-y-3"><Back/>
    <header className="relative flex items-center gap-3"><div className="flex-1 min-w-0"><h2 className="text-3xl">{c.name}</h2><p className="text-sm text-ink-soft">{c.blurb}</p></div>
      {c.id==='krishna'?<Deco a="krishna" h={104}/>:<Deco a={c.art} h={c.id==='hanuman'?92:72}/>}</header>
    {c.id==='krishna'&&<div className="flex justify-center -my-1" aria-hidden="true"><Deco a="flute" w={96} op={.9}/></div>}
    <div className="space-y-2.5">{list.map(row)}</div>
    {mine.length>0&&<section className="space-y-2.5"><h3 className="text-xl">Your mantras</h3>{mine.map(row)}</section>}
    <Ornament/><p className="text-sm text-center"><Link className="underline" to="/library/custom/new">Add your own mantra</Link></p></div>}
