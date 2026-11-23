import {useState} from 'react';import {useSearchParams} from 'react-router-dom';import {Trash2,Download} from 'lucide-react';
import {useStore,today,exportAll,clearAll} from '../store';import {VERSES} from '../data';import {FavouritesList} from '../components';
import {JaapSettings,ReminderSettings} from '../jaapTools';import {Deco,Ornament,useToast,useConfirm} from '../ui';

const TYPES=['Free writing','Gratitude','Prayer','Daily reflection','Scripture reflection'],MOODS=['','Peaceful','Grateful','Sad','Anxious','Hopeful'];
function Journal({verse}){const [es,setEs]=useStore('journal',[]);const [q,setQ]=useState('');const [id,setId]=useState(null);const [f,setF]=useState({type:TYPES[0],mood:'',text:'',verse:verse||''});
  const toast=useToast();const confirm=useConfirm();
  const save=()=>{if(!f.text.trim())return;setEs(p=>id?p.map(e=>e.id===id?{...e,...f}:e):[{id:Date.now(),date:today(),...f},...p]);setId(null);setF({type:TYPES[0],mood:'',text:'',verse:''});toast('Your reflection has been saved.')};
  return <div className="space-y-3"><div className="card space-y-2 relative">
    <Deco a="quill" h={46} className="watermark" style={{right:8,top:6,opacity:.75}}/>
    <p className="font-serif text-lg pr-14">Dear Madhav…</p>
    <select className="inp" aria-label="Type" value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
    <textarea className="inp" style={{minHeight:112}} aria-label="Entry" placeholder="Dear Madhav… What is on my heart?" value={f.text} onChange={e=>setF({...f,text:e.target.value})}/>
    <div className="grid grid-cols-2 gap-2"><select className="inp" aria-label="Mood" value={f.mood} onChange={e=>setF({...f,mood:e.target.value})}>{MOODS.map(m=><option key={m} value={m}>{m||'Mood (optional)'}</option>)}</select>
    <select className="inp" aria-label="Linked verse" value={f.verse} onChange={e=>setF({...f,verse:e.target.value})}><option value="">Link a verse (optional)</option>{VERSES.map(v=><option key={v.id} value={v.id}>Gita {v.ch}.{v.v}</option>)}</select></div>
    <button className="btn w-full" onClick={save}>{id?'Update entry':'Save entry'}</button></div>
  <input className="inp" aria-label="Search journal" placeholder="Search entries" value={q} onChange={e=>setQ(e.target.value)}/>
  {!es.length&&<div className="card flex items-center gap-3"><Deco a="lotusPink" h={40}/><p className="text-sm text-ink-mute">Your reflections will rest here, private to this device.</p></div>}
  {es.filter(e=>e.text.toLowerCase().includes(q.toLowerCase())).map(e=><div key={e.id} className="card card-am"><p className="text-xs text-ink-mute">{e.date} · {e.type}{e.mood&&` · ${e.mood}`}{e.verse&&` · Gita ${e.verse.replace('bg-','').replace('-','.')}`}</p><p className="whitespace-pre-wrap my-1.5 text-sm">{e.text}</p>
    <button className="underline text-[.8125rem] mr-4" onClick={()=>{setId(e.id);setF({type:e.type,mood:e.mood,text:e.text,verse:e.verse});window.scrollTo(0,0)}}>Edit</button>
    <button aria-label="Delete entry" className="align-middle" onClick={async()=>{if(await confirm({title:'Delete this entry?',body:'This cannot be undone.',confirm:'Delete',cancel:'Keep it'}))setEs(p=>p.filter(x=>x.id!==e.id))}}><Trash2 size={15}/></button></div>)}</div>}
function Favs(){return <FavouritesList/>}
function Overview(){const [ses]=useStore('jaap:sessions',[]);const [done]=useStore('done',{});const [je]=useStore('journal',[]);const [rd]=useStore('read',{});const [sel,setSel]=useState(today());
  const days=Array.from({length:35},(_,i)=>{const d=new Date(Date.now()-(34-i)*864e5);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`});
  const act=d=>ses.some(s=>s.date===d)||(done[d]||[]).length||je.some(e=>e.date===d);const ss=ses.filter(s=>s.date===sel);
  const dp=new Set([...ses.map(s=>s.date),...Object.keys(done).filter(k=>done[k].length),...je.map(e=>e.date)]).size;
  return <div className="space-y-3"><div className="grid grid-cols-4 gap-2 text-center">{[['Total jaap',ses.reduce((a,s)=>a+s.count,0)],['Sessions',ses.length],['Texts read',Object.values(rd).filter(r=>r.done).length],['Days practiced',dp]].map(([l,n])=><div key={l} className="card !px-1 !py-2"><p className="text-2xl font-serif leading-none">{n}</p><p className="text-[.625rem] text-ink-mute mt-1 leading-tight">{l}</p></div>)}</div>
  <div className="card"><p className="mb-1.5 text-[.8125rem] text-ink-soft">Last 5 weeks. Tap a day.</p><div className="grid grid-cols-7 gap-1">{days.map(d=><button key={d} aria-label={d} aria-pressed={sel===d} onClick={()=>setSel(d)} className={`h-8 rounded-md text-[.6875rem] border ${act(d)?'bg-gold border-gold-dark text-ink':'bg-cream-deep/60 border-transparent text-ink-mute'} ${sel===d?'ring-2 ring-amethyst':''}`}>{+d.slice(8)}</button>)}</div></div>
  <div className="card"><h3 className="text-lg">{sel}</h3>{ss.map(s=><p key={s.id} className="text-sm">{s.mantra}: {s.count}/{s.goal}</p>)}<p className="text-[.8125rem] text-ink-soft">Practices completed: {(done[sel]||[]).length} · Journal entries: {je.filter(e=>e.date===sel).length}</p></div>
  <div className="flex justify-center" aria-hidden="true"><Deco a="lotusWater" w={170} op={.85}/></div></div>}
function Settings(){const toast=useToast();const confirm=useConfirm();
  return <div className="space-y-3">
    <section className="card space-y-2"><h3 className="text-xl">Jaap</h3><JaapSettings/></section>
    <section className="card space-y-2 relative overflow-hidden"><Deco a="diyaTwin" h={30} className="watermark" style={{right:10,top:10}}/><h3 className="text-xl">Gentle reminders</h3><ReminderSettings/></section>
    <section className="card space-y-2"><h3 className="text-xl">Your data</h3>
      <div className="flex flex-wrap gap-2"><button className="btn2 btn-sm" onClick={async()=>{const b=new Blob([await exportAll()],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='madhav-data.json';a.click();toast('Your data has been exported.',{icon:Download})}}><Download/>Export my data</button>
      <button className="btn btn-sm" onClick={async()=>{if(await confirm({title:'Delete all your Madhav data?',body:'This removes everything stored on this device. It cannot be undone.',confirm:'Delete everything',cancel:'Keep my data'})){await clearAll();location.reload()}}}>Clear all data</button></div></section>
    <section className="card flex items-center gap-3"><Deco a="emblem" h={48}/><p className="text-[.8125rem] text-ink-soft">Madhav v1. All data stays on this device. <span className="font-serif italic">Remember. Chant. Reflect. Return.</span></p></section></div>}
export default function Journey(){const [sp,setSp]=useSearchParams();const tab=sp.get('tab')||'overview';
return <div className="space-y-3"><h2 className="text-3xl">My Journey</h2><div className="hscroll">{[['overview','Overview'],['journal','Journal'],['favs','Favourites'],['settings','Settings']].map(([k,l])=><button key={k} aria-pressed={tab===k} className="chip" onClick={()=>setSp({tab:k})}>{l}</button>)}</div>
{tab==='overview'&&<Overview/>}{tab==='journal'&&<Journal verse={sp.get('verse')}/>}{tab==='favs'&&<Favs/>}{tab==='settings'&&<Settings/>}</div>}
