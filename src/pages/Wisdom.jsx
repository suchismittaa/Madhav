import {useState} from 'react';import {Link} from 'react-router-dom';import {FEELINGS,VERSES} from '../data';import {Verse} from '../components';
import {Deco,Ornament,ReadToggle,NoLayerHint,useReaderPrefs} from '../ui';
export default function Wisdom(){const [f,setF]=useState(null);const [i,setI]=useState(0);const [rp,setRp]=useReaderPrefs();
if(!f)return <div className="theme-amethyst space-y-3">
  <header className="textured-plum rounded-xl border border-[var(--line)] p-4 pr-28 overflow-hidden relative min-h-[130px] flex flex-col justify-center">
    <h2 className="text-3xl !text-cream-light">Seek His Wisdom</h2><p className="font-serif text-lg text-cream-deep leading-snug mt-1">What is on your heart today?</p>
    <div className="absolute right-3 bottom-0 overflow-hidden border border-[var(--gold)]" style={{borderRadius:'999px 999px 0 0'}} aria-hidden="true"><Deco a="krishnaPond" h={112} style={{display:'block'}}/></div></header>
  <div className="grid grid-cols-2 gap-2">{FEELINGS.map(([k,l])=><button key={k} className="card card-link block w-full !px-3 !py-2.5 text-left text-[.84rem] leading-snug min-h-[44px]" onClick={()=>{setF(k);setI(0)}}>{l}</button>)}</div></div>;
const pool=VERSES.filter(v=>v.themes.includes(f));const v=pool[i%pool.length];
return <div className="space-y-3 theme-amethyst"><button className="underline text-[.8125rem]" onClick={()=>setF(null)}>← Change feeling</button>
<h2 className="text-3xl">For the days when you feel {FEELINGS.find(x=>x[0]===f)[1].replace(/^I (feel |'m |need |can't |simply want to )?/,'').replace(/^My /,'')||'this way'}</h2>
<p className="text-sm text-ink-soft">Take a slow breath. Here is a verse from the Bhagavad Gita for you.</p>
<ReadToggle rp={rp} setRp={setRp} size={false}/><NoLayerHint rp={rp}/>
<Verse v={v} full={false} rp={rp} deco/>
<div className="card"><h3 className="text-lg">What this teaches us</h3><p className="text-sm">{v.why}</p></div>
<div className="card"><h3 className="text-lg">Reflect</h3><p className="text-sm">{v.reflect}</p></div>
<div className="card"><h3 className="text-lg">Carry this with you today</h3><p className="text-sm">{v.take}</p></div>
<p className="text-xs text-ink-mute">Verse text is scripture; the explanation and reflection are written by the app, not scripture.</p>
<div className="flex flex-wrap gap-2"><button className="btn2 btn-sm" onClick={()=>setI(i+1)}>Give me another verse</button><Link className="btn2 btn-sm" to="/library">Read more</Link><Link className="btn btn-sm" to={`/journey?tab=journal&verse=${v.id}`}>Write a reflection</Link></div></div>}
