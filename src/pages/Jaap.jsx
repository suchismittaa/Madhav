import {useState,useEffect,useRef,memo} from 'react';import {Link,useSearchParams} from 'react-router-dom';import {Undo2,Pause,Play,RotateCcw,Check,X,Settings2} from 'lucide-react';
import {useStore,today} from '../store';import {useCustom,useJaapOptions,findJaapItem,newId} from '../library';import {JaapSettings,beep,useWakeLock,DEFAULT_PREFS} from '../jaapTools';
import {Deco,useToast,useConfirm} from '../ui';

const fmt=ms=>{const m=Math.round(ms/60000);return m<1?'under a minute':m+' min'};
const GOALS=[11,21,51,108,1008,'custom'];

/* ---------------------------------------------------------------------------------------------------
   The mala. N beads on a thread, plus ONE Guru (sumeru) bead at the top, which is a marker and is never counted.
   One tap = one bead. When the last bead is reached the mala is complete; you turn it round instead of crossing the Guru bead.
   remaining beads: jewel teal | counted beads: antique gold | current bead: larger, gold with an amethyst ring and a soft glow
--------------------------------------------------------------------------------------------------- */
const C=130,CY=140,R=100;
const Mala=memo(function Mala({count,n}){
  const m=count>0&&count%n===0?n:count%n;           // beads counted in this round
  const r=Math.max(2.2,Math.min(8,Math.PI*R/(n+1)*.78));
  const slot=i=>{const a=(-90+(i+1)*360/(n+1))*Math.PI/180;return [C+R*Math.cos(a),CY+R*Math.sin(a)]};
  const [gx,gy]=[C,CY-R];
  const beads=[];
  for(let i=0;i<n;i++){const [x,y]=slot(i);const done=i<m,cur=i===m-1&&count>0;
    beads.push(<circle key={i} className={`mala-bead ${cur?'cur':''}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r} fill={done?'url(#bGold)':'url(#bTeal)'} stroke={cur?'#48204F':'none'} strokeWidth={cur?.7:0}/>)}
  const cu=m>0?slot(m-1):null;
  return <svg viewBox="0 0 260 270" className="w-full h-full" role="img" aria-label={`${m} of ${n} beads counted in this round. The Guru bead at the top is not counted.`}>
    <defs>
      <radialGradient id="bTeal" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#4D959D"/><stop offset=".55" stopColor="#004C56"/><stop offset="1" stopColor="#00303A"/></radialGradient>
      <radialGradient id="bGold" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#F5E2AE"/><stop offset=".55" stopColor="#C5A15B"/><stop offset="1" stopColor="#8A6A28"/></radialGradient>
      <radialGradient id="glow"><stop offset="0" stopColor="#C5A15B" stopOpacity=".55"/><stop offset="1" stopColor="#C5A15B" stopOpacity="0"/></radialGradient>
    </defs>
    <circle cx={C} cy={CY} r={R} fill="none" stroke="#C5A15B" strokeOpacity=".55" strokeWidth=".8"/>
    <circle cx={C} cy={CY} r={R-16} fill="none" stroke="#C5A15B" strokeOpacity=".18" strokeWidth=".6" strokeDasharray="1 4"/>
    {cu&&<circle cx={cu[0]} cy={cu[1]} r={r*4} fill="url(#glow)"/>}
    {beads}
    {/* Guru bead: the supplied teal gemstone, with a small amethyst tassel */}
    <g aria-hidden="true">
      <line x1={gx} y1={gy-8} x2={gx} y2={gy-22} stroke="#C5A15B" strokeWidth="1.2"/>
      <path d={`M${gx-4} ${gy-22} L${gx+4} ${gy-22} L${gx+5.5} ${gy-37} L${gx-5.5} ${gy-37}Z`} fill="#48204F"/>
      <circle cx={gx} cy={gy-22} r="2.4" fill="#C5A15B"/>
      <circle cx={gx} cy={gy} r="12.5" fill="#C5A15B" opacity=".22"/>
      <image href="/assets/madhav/gem-teal.webp" x={gx-11} y={gy-11} width="22" height="22" preserveAspectRatio="xMidYMid meet"/>
    </g>
  </svg>});

export default function Jaap(){
  const [cur,setCur,ready]=useStore('jaap:current',null);const [ses,setSes]=useStore('jaap:sessions',[]);const [prefs]=useStore('prefs',DEFAULT_PREFS);
  const [,setCustom]=useCustom();const [sp,setSp]=useSearchParams();const groups=useJaapOptions();
  const [choice,setM]=useState(null);const [goal,setG]=useState(108);const [custom,setCu]=useState('');const [newM,setNM]=useState('');const [view,setV]=useState('count');
  const toast=useToast();const confirm=useConfirm();const resumed=useRef(false);
  const [,tick]=useState(0);useEffect(()=>{const t=setInterval(()=>tick(x=>x+1),30000);return()=>clearInterval(t)},[]);
  const param=sp.get('mantra');const flat=groups.flatMap(g=>g.items);
  const sel=findJaapItem(groups,choice)||findJaapItem(groups,param)||flat[0]||null;
  const lookup=id=>findJaapItem(groups,id)||flat.find(i=>i.name===id);
  const live=!!cur&&!(cur.count>=cur.goal&&!cur.cont)&&!cur.paused&&prefs.awake!==false;const wl=useWakeLock(live);
  // An interrupted session is kept on this device; say so once when the person comes back to it.
  useEffect(()=>{if(ready&&cur&&cur.count>0&&!resumed.current){resumed.current=true;toast(`Welcome back. ${cur.count} of ${cur.goal} so far.`)}},[ready]); // eslint-disable-line
  if(!ready)return <p className="text-sm text-ink-mute">Loading…</p>;

  const save=(done)=>{setSes(s=>[...s,{id:Date.now(),mantra:cur.mantra,count:cur.count,goal:cur.goal,date:today(),duration:Date.now()-cur.start,completed:done}]);setCur(null);toast(done?'Your Jaap session is complete.':'Your Jaap session has been saved.')};
  const total=ses.filter(s=>s.date===today()).reduce((a,s)=>a+s.count,0);
  const preview=t=>t&&t.kind==='mantra'&&t.sections.length?t.sections:null;

  /* ------------------------------- setup ------------------------------- */
  if(!cur){const g=goal==='custom'?Math.min(100000,Math.floor(+custom)||0):goal;const pv=preview(sel?.text);
    return <div className="space-y-3.5"><h2 className="text-3xl">Jaap</h2>
      <label className="block text-[.8125rem] text-ink-soft">Mantra<select className="inp mt-1" value={sel?.id||''} onChange={e=>setM(e.target.value)}>{groups.map(gr=><optgroup key={gr.label} label={gr.label}>{gr.items.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>)}</select></label>
      {sel?.text&&<div className="card text-center space-y-0.5 framed !py-3.5" data-testid="jaap-mantra"><p className="font-serif text-[1.3rem] leading-tight">{sel.name}</p>
        {pv&&pv.map(x=><div key={x.id}>{x.sa&&<p className="deva text-[1.02rem] whitespace-pre-line" lang="sa">{x.sa}</p>}{x.tr&&<p className="italic text-ink-soft text-[.78rem]">{x.tr}</p>}</div>)}
        <p className="text-xs pt-1"><Link className="underline" to={`/library/${sel.id}`}>Read in the library</Link></p></div>}
      <div className="flex gap-2"><input className="inp" aria-label="New custom mantra" placeholder="Create a custom mantra" value={newM} onChange={e=>setNM(e.target.value)}/><button className="btn2" onClick={()=>{const n=newM.trim();if(n){const id=newId();setCustom(c=>[...c,{id,title:n,category:'other',sa:'',tr:'',en:'',notes:'',created:Date.now()}]);setM(id);setNM('');toast('Mantra added to your collection.')}}}>Add</button></div>
      <div><p className="text-[.8125rem] text-ink-soft mb-1.5">Goal</p>
        <div role="group" aria-label="Target count" className="hscroll">{GOALS.map(x=><button key={x} aria-pressed={goal===x} className="chip" onClick={()=>setG(x)}>{x==='custom'?'Custom':x}</button>)}</div>
        {goal==='custom'&&<input className="inp mt-2" type="number" min="1" max="100000" inputMode="numeric" aria-label="Custom target" placeholder="How many?" value={custom} onChange={e=>setCu(e.target.value)}/>}</div>
      <details className="card !py-2.5"><summary className="cursor-pointer font-serif text-lg flex items-center gap-2"><Settings2 style={{width:16,height:16}} aria-hidden="true"/>Jaap settings</summary><div className="mt-2.5"><JaapSettings/></div></details>
      <button className="btn w-full" disabled={!g||!sel} onClick={()=>setCur({mantra:sel.name,mantraId:sel.id,goal:g,count:0,start:Date.now(),paused:false,cont:false})}>Begin jaap</button>
      <p className="text-xs text-ink-mute text-center">The Guru bead at the top of the mala is a marker and is not counted.</p>
      <p className="text-[.8125rem] text-ink-soft">Today’s total: {total} · <button className="underline" onClick={()=>setV(view==='hist'?'count':'hist')}>{view==='hist'?'Hide':'Show'} history</button></p>
      {view==='hist'&&<ul className="space-y-2">{[...ses].reverse().map(s=><li key={s.id} className="card !py-2 text-[.8125rem]"><b>{s.mantra}</b><br/>{s.date} · {s.count}/{s.goal} · {fmt(s.duration)} · {s.completed?'complete':'saved early'}</li>)}{!ses.length&&<li className="text-ink-mute text-sm">No sessions yet.</li>}</ul>}</div>}

  /* ------------------------------- session complete ------------------------------- */
  const done=cur.count>=cur.goal&&!cur.cont;
  if(done)return <div className="card text-center space-y-2.5 relative overflow-hidden framed !py-6">
    <Deco a="petals" w={190} className="watermark" style={{left:'50%',top:-6,marginLeft:-95,opacity:.55}}/>
    <Deco a="hands" h={84} className="mx-auto relative"/>
    <h2 className="text-3xl relative">Your jaap is complete.</h2><p className="font-serif text-xl relative">{cur.mantra}</p><p className="text-sm text-ink-soft relative">{cur.count} of {cur.goal} · {fmt(Date.now()-cur.start)} · {today()}</p>
    <div className="flex flex-col gap-2 pt-1 relative"><button className="btn" onClick={()=>save(true)}>Finish</button><button className="btn2" onClick={()=>setCur({...cur,cont:true})}>Continue chanting</button><button className="btn2" onClick={()=>save(true)}>Start another session</button></div></div>;

  /* ------------------------------- counting ------------------------------- */
  const n=cur.goal<108?cur.goal:108;
  const tap=()=>{if(cur.paused||done)return;const k=cur.count+1,bell=k%108===0||k===cur.goal;
    if(prefs.vib!==false&&navigator.vibrate)navigator.vibrate(bell?[30,50,30]:15);if(prefs.sound===true)beep(bell?'bell':'bead');
    setCur(c=>(c.count>=c.goal&&!c.cont)?c:{...c,count:c.count+1});   // never moves more than one bead per tap
    if(k===cur.goal&&!cur.cont)toast('Your Jaap session is complete.',{tone:'am'})};
  const onZone=e=>{const t=e.target;if(t.closest('[data-notap]'))return;if(!t.closest('[data-tap]')&&(prefs.tapAnywhere===false||t.closest('button,a,select,input,label,summary,details')))return;tap()};
  const finish=()=>cur.count>0?save(cur.count>=cur.goal):setCur(null);
  const other=param&&findJaapItem(groups,param);const conflict=other&&other.id!==cur.mantraId&&other.name!==cur.mantra;const cpv=preview(lookup(cur.mantraId||cur.mantra)?.text);
  const mala=Math.floor(Math.max(0,cur.count-1)/n)+1,malas=Math.ceil(cur.goal/n);
  return <div className="text-center space-y-2.5 select-none touch-manipulation" style={{minHeight:'calc(100dvh - var(--nav-h) - var(--safe-b) - 36px)'}} onClick={onZone} data-testid="tap-zone">
    {conflict&&<div className="card space-y-2" role="status" data-notap="1"><p className="text-sm">A jaap of <b>{cur.mantra}</b> is in progress. Switch to <b>{other.name}</b>?</p>
      <div className="flex gap-2 justify-center flex-wrap"><button className="btn btn-sm" onClick={()=>cur.count>0?save(cur.count>=cur.goal):setCur(null)}>Save and switch</button><button className="btn2 btn-sm" onClick={()=>setSp({},{replace:true})}>Keep counting</button></div></div>}
    <header><h2 className="text-2xl font-serif leading-tight">{cur.mantra}</h2>{cpv&&<div>{cpv.slice(0,2).map(x=><p key={x.id} className="deva text-[.98rem] whitespace-pre-line text-ink-soft leading-snug" lang="sa">{x.sa}</p>)}</div>}</header>
    <div className="relative mx-auto" style={{width:'min(78vw,17.5rem)',aspectRatio:'260/270'}}>
      <Mala count={cur.count} n={n}/>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-[9%] pointer-events-none">
        <p className="text-[2.6rem] font-serif leading-none text-teal" aria-live="polite">{cur.count}</p>
        <p className="text-xs text-ink-soft mt-1">of {cur.goal}</p>
        {malas>1&&<p className="text-[.6875rem] text-gold-text mt-0.5">Mala {Math.min(mala,malas)} of {malas}</p>}</div></div>
    {malas>1&&<div className="progress mx-auto max-w-[17rem]" role="progressbar" aria-label="Jaap goal progress" aria-valuemin={0} aria-valuemax={cur.goal} aria-valuenow={cur.count}><i style={{width:Math.min(100,cur.count/cur.goal*100)+'%'}}/></div>}
    <button data-tap="1" disabled={cur.paused} aria-label="Count one repetition" className="tap-orb">{cur.paused?'Paused':'Tap'}</button>
    <p className="text-[.6875rem] text-ink-mute" data-testid="tap-hint">{prefs.tapAnywhere===false?'Tap the circle to count':'Tap anywhere to count'}{prefs.awake!==false&&wl==="on"&&' · Screen stays on'}{prefs.awake!==false&&wl==="unsupported"&&' · This browser cannot keep the screen on'}</p>
    <div className="flex justify-center gap-1.5 flex-wrap">
      <button className="btn2 btn-sm" onClick={()=>setCur(c=>({...c,count:Math.max(0,c.count-1)}))}><Undo2/>Undo</button>
      <button className="btn2 btn-sm" onClick={()=>setCur(c=>({...c,paused:!c.paused}))}>{cur.paused?<><Play/>Resume</>:<><Pause/>Pause</>}</button>
      <button className="btn2 btn-sm" disabled={cur.count===0} onClick={async()=>{if(await confirm({title:'Reset the count?',body:`This sets ${cur.count} back to 0 for this session.`,confirm:'Reset',cancel:'Keep counting'}))setCur(c=>({...c,count:0,cont:false}))}}><RotateCcw/>Reset</button>
      <button className="btn btn-sm" onClick={finish}><Check/>Finish</button>
      <button className="btn2 btn-sm" onClick={async()=>{if(await confirm({title:'Cancel this session?',body:'Your count will not be saved.',confirm:'Cancel session',cancel:'Keep counting'}))setCur(null)}}><X/>Cancel</button></div>
  </div>}
