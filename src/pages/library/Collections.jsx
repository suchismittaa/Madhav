import {useState} from 'react';
import {Link,NavLink} from 'react-router-dom';
import {ArrowDown,ArrowUp,Plus,X,ListChecks} from 'lucide-react';
import {useStore} from '../../store';
import {useAllTexts,useMyMantras} from '../../library';
import {searchLibrary} from '../../search';
import {FavouritesList,JaapButton,TextCard} from '../../components';
import {Deco,useToast} from '../../ui';

function Tabs(){const cls=({isActive})=>`chip ${isActive?'on':''}`;
  return <nav aria-label="Library sections" className="hscroll"><NavLink end to="/library" className={cls}>Browse</NavLink>
    <NavLink to="/library/favourites" className={cls}>Favourites</NavLink><NavLink to="/library/my-mantras" className={cls}>My Mantras</NavLink></nav>}

export function Favourites(){return <div className="space-y-3"><h2 className="text-3xl">Favourites</h2><Tabs/><FavouritesList/></div>}

export function MyMantras(){
  const [my,setMy,ready]=useMyMantras();const [texts]=useAllTexts();const [rd]=useStore('read',{});const toast=useToast();
  const [adding,setAdding]=useState(false);const [q,setQ]=useState('');
  const items=my.map(id=>texts.find(t=>t.id===id)).filter(Boolean);
  const move=(i,d)=>setMy(p=>{const a=[...p],j=i+d;if(j<0||j>=a.length)return a;[a[i],a[j]]=[a[j],a[i]];return a});
  const pool=texts.filter(t=>!my.includes(t.id));
  const shown=q.trim()?searchLibrary(q,pool,[]).filter(r=>r.type==='text').map(r=>r.text):pool;
  return <div className="space-y-3"><h2 className="text-3xl">My Mantras</h2><Tabs/>
    <p className="text-sm text-ink-soft">Your personal collection. Reorder it, and start Jaap from any mantra.</p>
    {ready&&!items.length&&<div className="card flex items-center gap-3 text-ink-soft text-sm"><Deco a="orb" h={46}/><span>Your collection is empty. Add mantras from the library, or <Link className="underline" to="/library/custom/new">write your own</Link>.</span></div>}
    <ol className="space-y-2.5">{items.map((t,i)=><li key={t.id}><TextCard t={t} rd={rd} extra={<>
      {t.chantable&&<JaapButton id={t.id} label="Jaap" className="btn btn-sm"/>}
      <div className="flex"><button className="icon-btn !min-w-[30px] !min-h-[30px]" aria-label={`Move ${t.title} up`} disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp/></button>
        <button className="icon-btn !min-w-[30px] !min-h-[30px]" aria-label={`Move ${t.title} down`} disabled={i===items.length-1} onClick={()=>move(i,1)}><ArrowDown/></button>
        <button className="icon-btn !min-w-[30px] !min-h-[30px]" aria-label={`Remove ${t.title} from My Mantras`} onClick={()=>{setMy(p=>p.filter(x=>x!==t.id));toast('Removed from your collection.')}}><X/></button></div></>}/></li>)}</ol>
    <div className="flex flex-wrap gap-2"><button className="btn2 btn-sm" aria-expanded={adding} onClick={()=>setAdding(!adding)}><Plus/>{adding?'Done adding':'Add from the library'}</button>
      <Link className="btn2 btn-sm" to="/library/custom/new">Write your own mantra</Link></div>
    {adding&&<div className="card space-y-2.5"><input className="inp" type="search" aria-label="Search mantras to add" placeholder="Search to add" value={q} onChange={e=>setQ(e.target.value)}/>
      <ul className="divide-y divide-[var(--line-soft)] max-h-80 overflow-y-auto">{shown.map(t=><li key={t.id} className="flex items-center justify-between gap-3 py-1.5"><span><b className="font-serif text-lg">{t.title}</b><span className="block text-xs text-ink-mute">{t.cat}</span></span>
        <button className="btn2 btn-sm" aria-label={`Add ${t.title} to My Mantras`} onClick={()=>{setMy(p=>p.includes(t.id)?p:[...p,t.id]);toast('Mantra added to your collection.',{icon:ListChecks})}}><Plus/>Add</button></li>)}
        {!shown.length&&<li className="py-3 text-ink-mute text-sm">Nothing left to add.</li>}</ul></div>}
  </div>}
