import {useState} from 'react';import {Link} from 'react-router-dom';
import {Check,Plus,Trash2,Pencil,CircleDot,BookOpen,Sparkles,PenLine} from 'lucide-react';
import {useStore,today} from '../store';import {dailyVerse} from '../data';import {FavBtn,SourceLink} from '../components';
import {Deco,useToast} from '../ui';

const ACTIONS=[['/jaap','Start Jaap',CircleDot],['/library','Read Scripture',BookOpen],['/wisdom','Seek Wisdom',Sparkles],['/journey?tab=journal','Write Journal',PenLine]];
const DEFAULT_PRACTICES=[{id:'p1',name:'Hanuman Chalisa'},{id:'p2',name:'Krishna Naam Jaap'},{id:'p3',name:'Read Bhagavad Gita'},{id:'p4',name:'Evening prayer'}];

export default function Home(){
  const [pr,setPr]=useStore('practices',DEFAULT_PRACTICES);
  const [done,setDone]=useStore('done',{});const [ses]=useStore('jaap:sessions',[]);
  const [edit,setEdit]=useState(false);const [nm,setNm]=useState('');const toast=useToast();
  const d=today();const dn=done[d]||[];const v=dailyVerse();
  const tog=p=>{const was=dn.includes(p.id);setDone(x=>({...x,[d]:(x[d]||[]).includes(p.id)?x[d].filter(y=>y!==p.id):[...(x[d]||[]),p.id]}));
    if(!was)toast(dn.length+1>=pr.length&&pr.length>1?'Every practice for today is complete.':'Your practice has been saved.')};
  const add=()=>{const n=nm.trim();if(!n)return;setPr(x=>[...x,{id:'p'+Date.now(),name:n}]);setNm('');toast('Practice added to your list.')};
  const jaap=ses.filter(s=>s.date===d).reduce((a,s)=>a+s.count,0);
  return <div className="space-y-3.5">
    <header className="flex items-end justify-between gap-3">
      <div><Deco a="logo" h={30} className="mb-1.5"/><h2 className="text-3xl leading-tight">Welcome back</h2><p className="text-sm text-ink-soft -mt-0.5">Whenever you are ready, He is here.</p></div>
    </header>

    <section className="card relative overflow-hidden" aria-labelledby="practice-h">
      <Deco a="lotusBud" h={58} className="watermark" style={{right:8,top:4,opacity:.55}}/>
      <div className="flex justify-between items-center"><h3 id="practice-h" className="text-xl">Today’s Practice</h3>
        <button className="inline-flex items-center gap-1 text-xs text-amethyst underline min-h-[28px] pr-1 relative z-10" onClick={()=>setEdit(!edit)}>{edit?'Done':<><Pencil size={12}/>Edit</>}</button></div>
      <ul className="mt-1.5">{pr.map((p,i)=><li key={p.id} className={`flex items-center gap-2.5 py-[7px] ${i?'border-t border-[var(--line-soft)]':''}`}>
        <button className="check" aria-label={`Mark ${p.name} ${dn.includes(p.id)?'incomplete':'complete'}`} aria-pressed={dn.includes(p.id)} onClick={()=>tog(p)}>{dn.includes(p.id)&&<Check/>}</button>
        <span className={`flex-1 text-[.9rem] ${dn.includes(p.id)?'line-through text-ink-mute':''}`}>{p.name}</span>
        {edit&&<button className="icon-btn !min-w-[30px] !min-h-[30px]" aria-label={`Remove ${p.name}`} onClick={()=>{setPr(x=>x.filter(y=>y.id!==p.id));toast('Practice removed.')}}><Trash2 style={{width:16,height:16}}/></button>}</li>)}
        {!pr.length&&<li className="py-2 text-ink-mute text-sm">No practices yet. Tap Edit to add one.</li>}</ul>
      {edit&&<div className="flex gap-2 mt-2"><input className="inp" aria-label="New practice" placeholder="Add a practice" value={nm} onChange={e=>setNm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}/>
        <button className="btn !px-3" aria-label="Add practice" onClick={add}><Plus/></button></div>}
    </section>

    <nav aria-label="Quick actions" className="grid grid-cols-4 gap-2">{ACTIONS.map(([to,l,I])=>
      <Link key={to} to={to} className="card card-link !px-1 !py-2.5 flex flex-col items-center gap-1 text-center"><I className="text-gold-text" style={{width:20,height:20}} aria-hidden="true"/><span className="block text-[.6875rem] leading-[1.15] font-medium">{l}</span></Link>)}</nav>

    <section aria-labelledby="wisdom-h">
      <div className="card framed !px-4 !py-3.5">
        <p id="wisdom-h" className="text-[.65rem] tracking-[.1em] uppercase text-ink-mute flex items-center justify-between gap-2 pl-5"><span>Today’s Wisdom · Gita {v.ch}.{v.v}</span><SourceLink src={v.src}/></p>
        <p className="deva text-[1.08rem] whitespace-pre-line mt-1.5" lang="sa">{v.sa}</p>
        <p className="italic text-ink-soft text-[.78rem] leading-snug whitespace-pre-line mt-1">{v.tr}</p>
        <p className="font-serif text-[1.05rem] leading-snug mt-1.5">{v.en}</p>
        <p className="text-[.78rem] text-ink-soft mt-1.5 border-t border-[var(--line-soft)] pt-1.5"><span className="text-amethyst font-medium">Reflect:</span> {v.reflect}</p>
        <div className="mt-2"><FavBtn id={v.id}/></div>
      </div></section>
    <p className="text-xs text-ink-mute text-center">Today: <b>{jaap}</b> names chanted · <b>{dn.length}</b> of {pr.length} practices complete</p>
  </div>}
