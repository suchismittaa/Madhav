import {Link,useSearchParams} from 'react-router-dom';
import {Heart,ListChecks,Plus,Search as SearchIcon,X,BookOpen} from 'lucide-react';
import {CATEGORIES} from '../../content/index.js';
import {VERSES} from '../../data';
import {useStore} from '../../store';
import {useAllTexts,useMyMantras,useCustom} from '../../library';
import {searchLibrary,fieldLabel} from '../../search';
import {TextCard,Verse,JaapButton,FavBtn} from '../../components';
import {Deco,Ornament} from '../../ui';

function Results({q,texts,rd}){
  const res=searchLibrary(q,texts,VERSES);
  if(!res.length)return <div className="card text-ink-soft text-sm" role="status">Nothing found for “{q}”. Try a name such as “Hanuman”, a Sanskrit word, or a word from the meaning, like “protection”.</div>;
  return <div className="space-y-2.5" role="region" aria-label="Search results"><p className="text-xs text-ink-mute" role="status">{res.length} result{res.length===1?'':'s'}</p>
  {res.map(r=>{
    if(r.type==='gita')return <Verse key={r.verse.id} v={r.verse} full={false} compact/>;
    if(r.type==='text')return <TextCard key={r.text.id} t={r.text} rd={rd} extra={<>{r.text.chantable&&<JaapButton id={r.text.id} label="Jaap" className="btn btn-sm"/>}</>}/>;
    const s=r.section;
    return <div key={r.text.id+s.id} className="card">
      <Link className="underline text-sm" to={`/library/${r.text.id}?mode=verse&v=${s.id}`}>{r.text.title} · {s.label}</Link>
      <span className="text-xs text-ink-mute ml-2">Matched in {fieldLabel(r.field).toLowerCase()}</span>
      {s.sa&&<p className="deva text-[1.05rem] whitespace-pre-line mt-1.5">{s.sa}</p>}
      {s.en&&<p className="font-serif mt-1">{s.en}</p>}
      <div className="mt-2"><FavBtn id={`${r.text.id}#${s.id}`}/></div></div>;
  })}</div>;
}

export default function Index(){
  const [sp,setSp]=useSearchParams();const q=sp.get('q')||'';
  const [texts]=useAllTexts();const [rd]=useStore('read',{});const [favs]=useStore('favs',[]);const [my]=useMyMantras();const [custom]=useCustom();
  const setQ=v=>setSp(v?{q:v}:{},{replace:true});
  const last=Object.entries(rd).filter(([id,r])=>r.at&&r.pos>0&&!r.done&&texts.some(t=>t.id===id)).sort((a,b)=>b[1].at-a[1].at)[0];
  const lt=last&&texts.find(t=>t.id===last[0]);const ls=lt?.sections[last[1].pos];
  return <div className="space-y-3.5">
    <header><h2 className="text-3xl">Sacred Library</h2><p className="text-sm text-ink-soft">Mantras, prayers and scriptures to read, keep and chant.</p></header>
    <div className="relative"><SearchIcon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"/>
      <input className="inp !pl-9 !pr-10" type="search" aria-label="Search the library" placeholder="Search name, Sanskrit or meaning" value={q} onChange={e=>setQ(e.target.value)}/>
      {q&&<button className="absolute right-0.5 top-1/2 -translate-y-1/2 icon-btn" aria-label="Clear search" onClick={()=>setQ('')}><X/></button>}</div>
    {q.trim()?<Results q={q} texts={texts} rd={rd}/>:<>
    {lt&&<Link to={`/library/${lt.id}?mode=verse&v=${ls?.id}`} className="card card-link card-gold flex items-center gap-3 !py-2.5">
      <Deco a="book" h={34}/><span className="min-w-0"><span className="text-xs text-ink-mute block">Continue reading</span><b className="font-serif text-xl leading-tight block truncate">{lt.title}</b>
      <span className="text-xs text-ink-soft">{ls?.label} · {Math.round((last[1].pos+1)/lt.sections.length*100)}% read</span></span></Link>}
    <div className="grid grid-cols-2 gap-2.5">
      <Link to="/library/favourites" className="card card-link flex items-center gap-2.5 !py-2.5"><Heart className="text-amethyst" style={{width:20,height:20}}/><span><b className="block font-serif text-lg leading-tight">Favourites</b><span className="text-xs text-ink-mute">{favs.length} saved</span></span></Link>
      <Link to="/library/my-mantras" className="card card-link flex items-center gap-2.5 !py-2.5"><ListChecks className="text-amethyst" style={{width:20,height:20}}/><span><b className="block font-serif text-lg leading-tight">My Mantras</b><span className="text-xs text-ink-mute">{my.length} in collection</span></span></Link></div>
    <section aria-label="Categories" className="grid grid-cols-2 gap-2.5">
      {CATEGORIES.map(c=>{const n=texts.filter(t=>t.category===c.id&&!t.custom),j=texts.filter(t=>t.category===c.id&&t.chantable).length;
        return <Link key={c.id} to={`/library/category/${c.id}`} className="shelf"><span className="glyph" aria-hidden="true">{c.glyph}</span>
          <h3>{c.name}</h3><p className="text-[.75rem] text-ink-soft mt-0.5 leading-snug line-clamp-2">{c.blurb}</p>
          <p className="text-[.6875rem] text-ink-mute mt-1.5">{n.length} text{n.length===1?'':'s'} · {j} to chant</p></Link>})}
      <Link to="/library/category/gita" className="shelf"><span className="glyph" aria-hidden="true">गीता</span>
        <h3>Bhagavad Gita</h3><p className="text-[.75rem] text-ink-soft mt-0.5 leading-snug line-clamp-2">Verses of Krishna’s teaching to Arjuna.</p><p className="text-[.6875rem] text-ink-mute mt-1.5">{VERSES.length} verses</p></Link></section>
    <Ornament/>
    <section className="space-y-2.5"><div className="flex items-center justify-between"><h3 className="text-xl">Your mantras</h3>
      <Link className="btn2 btn-sm" to="/library/custom/new"><Plus/>Add your own</Link></div>
      {custom.length===0?<p className="text-[.8125rem] text-ink-mute">Add a mantra of your own, with its text, meaning and notes. It will be ready to chant in Jaap.</p>
       :texts.filter(t=>t.custom).map(t=><TextCard key={t.id} t={t} rd={rd} extra={<JaapButton id={t.id} label="Jaap" className="btn btn-sm"/>}/>)}</section></>}
  </div>}
