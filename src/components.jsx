import {Link} from 'react-router-dom';
import {Heart,CircleDot,ListPlus,ListChecks,Bookmark,ExternalLink} from 'lucide-react';
import {useStore} from './store';
import {VERSES} from './data';
import {STATUS_LABEL} from './content/index.js';
import {useAllTexts,useMyMantras,resolveFav,jaapPath,sectionTitle} from './library';
import {Deco,useToast} from './ui';

export function useFavs(){const [f,setF]=useStore('favs',[]);return [f,id=>setF(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])]}
export function FavBtn({id,compact=false,name,verse=false}){const [f,t]=useFavs();const toast=useToast();const on=f.includes(id);
  const go=()=>{t(id);toast(on?'Removed from your favourites.':(verse?'Verse saved to your favourites.':'Saved to your favourites.'),{icon:Heart,tone:on?undefined:'am'})};
  if(compact)return <button className="icon-btn" aria-pressed={on} aria-label={`${on?'Remove from favourites':'Save to favourites'}${name?': '+name:''}`} onClick={go}><Heart fill={on?'#48204F':'none'}/></button>;
  return <button className="btn2 btn-sm" aria-pressed={on} onClick={go}><Heart fill={on?'#48204F':'none'}/>{on?(verse?'Verse saved':'Saved'):(verse?'Save verse':'Save')}</button>}

export const SourceLink=({src,label='Source'})=>src?.url?<a className="inline-flex items-center gap-1 underline text-xs text-gold-text normal-case tracking-normal" href={src.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={13}/>{label}</a>:null;

// A Bhagavad Gita verse. `rp` (reader prefs) lets the person hide Original / Transliteration / Meaning; Home passes nothing and shows all three.
export function Verse({v,full=true,rp,compact=false,deco=false}){
  const o=rp||{sa:true,tr:true,en:true};
  return <div className={`card ${deco?'framed':''}`}>
    {deco&&<Deco a="peacock" h={52} className="watermark" style={{right:10,top:8,opacity:.16,transform:'rotate(14deg)'}}/>}
    <p className="text-[.65rem] tracking-[.1em] uppercase text-ink-mute mb-2 flex items-center justify-between gap-2"><span>Bhagavad Gita {v.ch}.{v.v}</span><SourceLink src={v.src}/></p>
    {o.sa&&<p className={`deva whitespace-pre-line ${compact?'text-[1.06rem]':'text-[1.2rem]'}`} lang="sa">{v.sa}</p>}
    {o.tr&&<p className="italic text-ink-soft mt-2 whitespace-pre-line text-[.84rem] leading-snug">{v.tr}</p>}
    {o.en&&<p className={`font-serif mt-2 leading-snug ${compact?'text-[1.05rem]':'text-[1.18rem]'}`}>{v.en}</p>}
    {full&&<p className="text-[.8125rem] text-ink-soft mt-2">{v.why}</p>}
    <div className="mt-3"><FavBtn id={v.id}/></div></div>}

export function StatusBadge({status,quiet=false}){const k=status?.text;
  if(!k||k==='custom')return k==='custom'?<span className="badge badge-custom">Your mantra</span>:null;
  if(quiet&&k==='traditional')return null;
  return <span className={`badge badge-${k}`}>{STATUS_LABEL[k]}</span>}

export function JaapButton({id,label='Start Jaap',className='btn'}){
  return <Link to={jaapPath(id)} className={className}><CircleDot/>{label}</Link>}

export function MyBtn({id}){const [my,setMy]=useMyMantras();const toast=useToast();const on=my.includes(id);
  return <button className="btn2 btn-sm" aria-pressed={on} onClick={()=>{setMy(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);toast(on?'Removed from your collection.':'Mantra added to your collection.',{icon:ListChecks})}}>
    {on?<ListChecks/>:<ListPlus/>}{on?'In My Mantras':'Add to My Mantras'}</button>}

const KIND={mantra:'Mantra',stotra:'Stotra',scripture:'Scripture'};
export const kindLabel=k=>KIND[k]||'Text';

// One text as a list card. `extra` renders action buttons that sit beside the link (never inside it).
export function TextCard({t,rd,extra}){const r=rd?.[t.id]||{};
  return <div className="card flex gap-2 items-stretch !p-0 overflow-hidden">
    <Link to={`/library/${t.id}`} className="flex-1 min-w-0 px-3.5 py-3 block hover:bg-cream-deep/30 transition-colors">
      <span className="text-xs text-ink-mute">{kindLabel(t.kind)} · {t.cat}</span>
      <h3 className="text-xl leading-tight">{t.title}{r.done&&<span aria-label="completed"> ✓</span>}{r.bm&&<Bookmark size={14} className="inline ml-1 -mt-1 text-amethyst" aria-label="bookmarked"/>}</h3>
      {t.summary&&<p className="text-[.8125rem] text-ink-soft mt-0.5 line-clamp-2">{t.summary}</p>}
      <div className="mt-1.5 flex flex-wrap gap-1"><StatusBadge status={t.status} quiet/></div></Link>
    {extra&&<div className="flex flex-col justify-center items-end gap-1.5 pr-2.5 py-2 shrink-0">{extra}</div>}</div>}

// Favourites list, used by the Library and by My Journey.
export function FavouritesList(){const [f]=useFavs();const [texts,ready]=useAllTexts();const [rd]=useStore('read',{});
  const items=f.map(id=>resolveFav(id,texts,VERSES)).filter(Boolean);
  if(!ready)return <p className="text-ink-mute text-sm">Loading…</p>;
  if(!items.length)return <div className="card flex items-center gap-3"><Deco a="lotusIvory" h={44}/><p className="text-ink-mute text-sm">Nothing saved yet. Tap the heart on any mantra, verse or text to keep it here.</p></div>;
  const group=k=>items.filter(i=>i.kind===k);
  return <div className="space-y-5">
    {group('text').length>0&&<section className="space-y-2.5"><h3 className="text-xl">Mantras and texts</h3>{group('text').map(i=><TextCard key={i.id} t={i.text} rd={rd}
      extra={<>{i.text.chantable&&<JaapButton id={i.id} label="Jaap" className="btn btn-sm"/>}<FavBtn id={i.id} compact name={i.text.title}/></>}/>)}</section>}
    {group('verse').length>0&&<section className="space-y-2.5"><h3 className="text-xl">Saved verses</h3>{group('verse').map(i=><div key={i.id} className="card">
      <Link className="underline text-sm" to={`/library/${i.text.id}?mode=verse&v=${i.section.id}`}>{sectionTitle(i.text,i.section)}</Link>
      {i.section.sa&&<p className="deva text-[1.05rem] whitespace-pre-line mt-2">{i.section.sa}</p>}
      {i.section.en&&<p className="font-serif mt-1">{i.section.en}</p>}
      <div className="mt-2.5 flex flex-wrap gap-2">{i.text.chantable&&<JaapButton id={i.text.id} label="Start Jaap" className="btn2 btn-sm"/>}<FavBtn id={i.id}/></div></div>)}</section>}
    {group('gita').length>0&&<section className="space-y-2.5"><h3 className="text-xl">Bhagavad Gita</h3>{group('gita').map(i=><Verse key={i.id} v={i.verse} full={false} compact/>)}</section>}</div>}
