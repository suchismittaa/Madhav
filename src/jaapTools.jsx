// Jaap helpers (bead sound, screen wake lock) and the gentle-reminder system.
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {X,Download,BellRing} from 'lucide-react';
import {useStore,today} from './store';
import {Deco,useToast} from './ui';

export const DEFAULT_PREFS={vib:true,tapAnywhere:true,sound:false,awake:true};

// ---- soft bead sound (Web Audio, no files) -------------------------------------------------
let ctx;
export function beep(kind='bead'){
  try{
    ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')ctx.resume();
    const t=ctx.currentTime;
    const tone=(f,dur,vol,delay=0)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+delay);
      g.gain.setValueAtTime(0.0001,t+delay);g.gain.exponentialRampToValueAtTime(vol,t+delay+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+delay+dur);
      o.connect(g);g.connect(ctx.destination);o.start(t+delay);o.stop(t+delay+dur+0.05)};
    if(kind==='bead'){tone(660,0.14,0.09);tone(990,0.08,0.025)}          // short wooden "tok"
    else{tone(528,1.6,0.11);tone(792,1.4,0.05,0.02);tone(1056,1.0,0.025,0.04)} // gentle bell for a completed mala or goal
  }catch{/* audio unavailable: ignore */}
}

// ---- keep the screen awake while a session is active ---------------------------------------
export function useWakeLock(active){
  const [state,setState]=useState('off'); // 'on' | 'off' | 'unsupported'
  useEffect(()=>{
    if(!active){setState('off');return}
    if(!navigator.wakeLock?.request){setState('unsupported');return}
    let lock=null,dead=false;
    const get=async()=>{try{lock=await navigator.wakeLock.request('screen');if(!dead)setState('on');lock.addEventListener?.('release',()=>{if(!dead)setState('off')})}catch{if(!dead)setState('off')}};
    const vis=()=>{if(document.visibilityState==='visible'&&(!lock||lock.released))get()};
    get();document.addEventListener('visibilitychange',vis);
    return()=>{dead=true;document.removeEventListener('visibilitychange',vis);try{lock?.release?.()}catch{}};
  },[active]);
  return state;
}

// ============================ GENTLE REMINDERS ============================
// Four optional reminders, all OFF until the person turns them on. Messages are warm and never mention missed days.
// A web app cannot wake a phone that has Madhav closed, so reminders work in two honest ways:
//   1. while Madhav is open: a quiet card in the app (and a system notification if the browser permission was granted);
//   2. while it is closed: "Add to my calendar" exports a daily calendar event the phone's own calendar will ring.
export const REMINDERS=[
  {id:'morning',label:'Morning moment',field:'Morning reminder',time:'06:30',art:'sunrise',to:'/',cta:'Begin',
   msgs:['Your morning moment with Madhav is waiting.','Begin your day with a little remembrance.']},
  {id:'jaap',label:'Daily jaap',field:'Daily jaap reminder',time:'07:30',art:'diya',to:'/jaap',cta:'Begin jaap',
   msgs:['Would you like to spend a few moments in naam jap today?','A few quiet moments of jaap, whenever you feel ready.']},
  {id:'evening',label:'Evening pause',field:'Evening reminder',time:'19:30',art:'moon',to:'/journey?tab=journal',cta:'Open journal',
   msgs:['Pause for the day. Sit with a little peace.','Let the day settle. A quiet moment is here for you.']},
  {id:'reading',label:'Reading',field:'Reading reminder',time:'20:30',art:'book',to:'/library',cta:'Open library',
   msgs:['Your reading journey is waiting whenever you feel ready.','A verse or two, whenever you feel ready.']},
];
const DEFAULT_REMINDERS={...Object.fromEntries(REMINDERS.map(r=>[r.id,{on:false,time:r.time,last:''}])),quiet:{on:true,start:'22:00',end:'06:00'}};
const mins=t=>{const [h,m]=(t||'00:00').split(':').map(Number);return h*60+(m||0)};
const WINDOW=8*60; // a reminder stays visible for 8 hours after its time, then simply rests until tomorrow
const dayNo=()=>Math.floor(Date.now()/864e5);
export const pickMsg=r=>r.msgs[dayNo()%r.msgs.length];
export function inQuiet(q,d=new Date()){
  if(!q?.on)return false;const n=d.getHours()*60+d.getMinutes(),a=mins(q.start),b=mins(q.end);
  return a===b?false:(a<b?n>=a&&n<b:n>=a||n<b);
}
export function useReminders(){
  const [r,setR,ready]=useStore('reminders:v2',null);const [legacy,,lready]=useStore('jaap:reminder',null);
  // Carry an older single "daily jaap reminder" over, once.
  useEffect(()=>{if(ready&&lready&&r===null){const base=structuredClone(DEFAULT_REMINDERS);if(legacy?.on)base.jaap={on:true,time:legacy.time||base.jaap.time,last:legacy.last||''};setR(base)}},[ready,lready,r,legacy,setR]);
  const cfg=r?{...DEFAULT_REMINDERS,...r,quiet:{...DEFAULT_REMINDERS.quiet,...r.quiet}}:DEFAULT_REMINDERS;
  return [cfg,setR,ready&&r!==null];
}
export const notifyState=()=>typeof Notification==='undefined'?'unsupported':Notification.permission; // granted | denied | default | unsupported

export function icsText(cfg){
  const d=new Date(),pad=n=>String(n).padStart(2,'0');
  const day=`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const ev=REMINDERS.filter(r=>cfg[r.id]?.on).flatMap(r=>{const [h,m]=(cfg[r.id].time||r.time).split(':');const msg=pickMsg(r);
    return ['BEGIN:VEVENT',`UID:${r.id}-reminder@madhav`,`DTSTAMP:${stamp}`,`DTSTART:${day}T${h}${m}00`,'DURATION:PT15M','RRULE:FREQ=DAILY',`SUMMARY:${r.label} (Madhav)`,`DESCRIPTION:${msg}`,
      'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY',`DESCRIPTION:${msg}`,'END:VALARM','END:VEVENT']});
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Madhav//Gentle Reminders//EN',...ev,'END:VCALENDAR'].join('\r\n');
}
function downloadIcs(cfg){const b=new Blob([icsText(cfg)],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='madhav-reminders.ics';a.click()}

// Mounted once in the app shell. Shows at most one quiet card at a time and sends one system notification per reminder per day.
export function ReminderLayer(){
  const [cfg,setCfg,ready]=useReminders();const [ses]=useStore('jaap:sessions',[]);const [cur]=useStore('jaap:current',null);
  const [done]=useStore('done',{});const [rd]=useStore('read',{});
  const [now,setNow]=useState(Date.now());const [hidden,setHidden]=useState({});
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),20000);const v=()=>setNow(Date.now());document.addEventListener('visibilitychange',v);return()=>{clearInterval(t);document.removeEventListener('visibilitychange',v)}},[]);
  const d=new Date(now),n=d.getHours()*60+d.getMinutes(),td=today();
  const jaapToday=ses.some(s=>s.date===td&&s.count>0)||(cur&&cur.count>0);
  const readToday=Object.values(rd).some(x=>x.at&&new Date(x.at).toDateString()===d.toDateString());
  const practiced=(done[td]||[]).length>0;
  const satisfied={jaap:jaapToday,reading:readToday,morning:practiced||jaapToday,evening:false};
  const quiet=inQuiet(cfg.quiet,d);
  const due=ready?REMINDERS.filter(r=>{const c=cfg[r.id];return c.on&&!quiet&&n>=mins(c.time)&&n<mins(c.time)+WINDOW&&!satisfied[r.id]}):[];
  const dueKey=due.map(r=>r.id).join();
  useEffect(()=>{
    if(!due.length)return;
    const fresh=due.filter(r=>cfg[r.id].last!==td);if(!fresh.length)return;
    setCfg(x=>({...x,...Object.fromEntries(fresh.map(r=>[r.id,{...x[r.id],last:td}]))}));
    fresh.forEach(r=>{(async()=>{try{
      if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
      const opts={body:pickMsg(r),icon:'/icon-192.png',tag:'madhav-'+r.id,data:{url:r.to}};
      const reg=await navigator.serviceWorker?.getRegistration?.();
      if(reg?.showNotification)reg.showNotification('Madhav',opts);else new Notification('Madhav',opts);
    }catch{/* notifications unavailable */}})()});
  },[dueKey]); // eslint-disable-line
  const show=due.find(r=>!hidden[r.id]);
  if(!show)return null;
  return <div className="card flex items-center gap-3 mb-3 !py-2.5 card-am" role="status" data-testid="reminder-banner">
    <Deco a={show.art} h={34}/>
    <span className="flex-1 text-sm leading-snug">{pickMsg(show)}</span>
    <Link className="btn btn-sm" to={show.to}>{show.cta}</Link>
    <button className="icon-btn" aria-label="Dismiss reminder" onClick={()=>setHidden(h=>({...h,[show.id]:true}))}><X/></button></div>;
}

// ---- Jaap settings (Jaap setup screen and My Journey > Settings) -------------------------------
export function JaapSettings(){
  const [p0,setP]=useStore('prefs',DEFAULT_PREFS);const p={...DEFAULT_PREFS,...p0};
  const set=k=>e=>setP({...p0,[k]:e.target.checked});
  const Row=({k,label,hint})=><label className="flex gap-3 items-start"><input className="mt-0.5" type="checkbox" checked={!!p[k]} onChange={set(k)}/><span className="text-sm">{label}{hint&&<span className="block text-xs text-ink-mute">{hint}</span>}</span></label>;
  return <div className="space-y-2.5 text-left" data-testid="jaap-settings">
    <Row k="tapAnywhere" label="Tap anywhere to count" hint="Count with a tap on any empty part of the screen, not only the round button."/>
    <Row k="vib" label="Vibration on each count"/>
    <Row k="sound" label="Soft bead sound" hint="A quiet tone on each bead and a bell on every 108th and at your goal."/>
    <Row k="awake" label="Keep screen on during a session" hint="Uses your browser’s screen wake lock where it is available."/>
  </div>;
}

// ---- Gentle reminders settings (My Journey > Settings) ---------------------------------------
export function ReminderSettings(){
  const [cfg,setCfg]=useReminders();const toast=useToast();const [msg,setMsg]=useState('');const [perm,setPerm]=useState(notifyState());
  const set=(id,patch)=>setCfg(x=>({...x,[id]:{...(x?.[id]||DEFAULT_REMINDERS[id]),...patch}}));
  const toggle=async(r,on)=>{
    setMsg('');
    if(on&&perm==='default'){try{const res=await Notification.requestPermission();setPerm(res)}catch{}}
    const st=notifyState();setPerm(st);
    if(on&&st==='denied')setMsg('Notifications are blocked for this site, so Madhav will show a gentle card inside the app instead. Use “Add to my calendar” for a reminder that works while the app is closed.');
    if(on&&st==='unsupported')setMsg('This browser cannot show notifications, so Madhav will show a gentle card inside the app. Use “Add to my calendar” for a reminder that works while the app is closed.');
    set(r.id,{on,last:''});toast(on?`${r.label} reminder is on.`:`${r.label} reminder is off.`,{icon:BellRing});
  };
  const permText={granted:'Notifications are allowed.',denied:'Notifications are blocked in your browser settings.',default:'Your browser will ask permission when you turn on your first reminder.',unsupported:'This browser cannot show notifications.'}[perm];
  return <div className="space-y-2.5" data-testid="reminder-settings">
    <p className="text-xs text-ink-mute">Choose only what feels welcoming. Everything starts off, and reminders never say you missed anything. {permText}</p>
    {REMINDERS.map(r=>{const c=cfg[r.id];return <div key={r.id} className="flex items-center gap-3 rounded-[10px] border border-[var(--line-soft)] bg-cream-light/50 px-3 py-2">
      <label className="flex-1 min-w-0 flex gap-2.5 items-start"><input className="mt-0.5" type="checkbox" aria-label={r.field} checked={!!c.on} onChange={e=>toggle(r,e.target.checked)}/>
        <span className="text-sm leading-tight">{r.field}<span className="block text-[.6875rem] text-ink-mute mt-0.5 leading-snug">{r.msgs[0]}</span></span></label>
      <input className="inp !w-[5.8rem] !min-h-[34px] !py-1 !px-2 !text-[.9rem]" type="time" aria-label={`Time for ${r.label}`} value={c.time} onChange={e=>set(r.id,{time:e.target.value||r.time,last:''})}/></div>})}
    <div className="rounded-[10px] border border-[var(--line-soft)] bg-cream-light/50 px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
      <label className="flex gap-2.5 items-center flex-1 min-w-[10rem]"><input type="checkbox" aria-label="Quiet hours" checked={!!cfg.quiet.on} onChange={e=>setCfg(x=>({...x,quiet:{...cfg.quiet,on:e.target.checked}}))}/><span className="text-sm">Quiet hours<span className="block text-xs text-ink-mute">No reminders during this time.</span></span></label>
      <span className="flex items-center gap-1.5 text-xs text-ink-mute"><input className="inp !w-[6rem] !min-h-[34px] !py-1 !text-[.9rem]" type="time" aria-label="Quiet hours start" value={cfg.quiet.start} onChange={e=>setCfg(x=>({...x,quiet:{...cfg.quiet,start:e.target.value||'22:00'}}))}/>to
        <input className="inp !w-[6rem] !min-h-[34px] !py-1 !text-[.9rem]" type="time" aria-label="Quiet hours end" value={cfg.quiet.end} onChange={e=>setCfg(x=>({...x,quiet:{...cfg.quiet,end:e.target.value||'06:00'}}))}/></span></div>
    <button className="btn2 btn-sm" type="button" onClick={()=>{if(!REMINDERS.some(r=>cfg[r.id].on))toast('Turn on a reminder first, then add it to your calendar.',{tone:'am'});else{downloadIcs(cfg);toast('Calendar file downloaded.',{icon:Download})}}}><Download/>Add to my calendar</button>
    <p className="text-xs text-ink-mute">While Madhav is open you will see a quiet card (and a notification if allowed). A web app cannot wake your phone when it is closed, so for that, add the daily events to your calendar.</p>
    {msg&&<p className="text-sm text-amethyst" role="status">{msg}</p>}
  </div>;
}
