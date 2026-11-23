import {useEffect,useRef,useState} from 'react';
import {NavLink,Route,Routes,useLocation} from 'react-router-dom';
import {Home as HomeI,BookOpen,CircleDot,Sparkles,User} from 'lucide-react';
import {ReminderLayer} from './jaapTools';import {ToastProvider,ConfirmProvider,Deco} from './ui';
import Home from './pages/Home';import Library from './pages/Library';import Jaap from './pages/Jaap';import Wisdom from './pages/Wisdom';import Journey from './pages/Journey';

const nav=[['/','Home',HomeI],['/library','Library',BookOpen],['/jaap','Jaap',CircleDot],['/wisdom','Wisdom',Sparkles],['/journey','My Journey',User]];
const SPLASH_KEY='madhav:splash';

// Opening animation: ivory paper, a golden ring draws itself, the emblem settles in, the Madhav wordmark fades up, then everything dissolves.
// Shown once per browser session (not on every page change). Tap to skip. With reduced motion it is a brief, still fade.
function Splash({onDone}){
  const [leaving,setLeaving]=useState(false);
  useEffect(()=>{
    const calm=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t1=setTimeout(()=>setLeaving(true),calm?900:3000),t2=setTimeout(onDone,calm?1100:3750);
    return()=>{clearTimeout(t1);clearTimeout(t2)};
  },[onDone]);
  return <div className={`splash ${leaving?'leaving':''}`} data-testid="splash" role="presentation" aria-hidden="true" onClick={()=>{setLeaving(true);setTimeout(onDone,500)}}>
    <div className="splash-stage">
      <div className="splash-glow"/>
      <svg className="splash-ring" viewBox="0 0 220 220"><circle className="r1" cx="110" cy="110" r="105" transform="rotate(-90 110 110)"/><circle className="r2" cx="110" cy="110" r="97"/></svg>
      <img className="splash-emblem" src="/assets/madhav/emblem.webp" alt="" width="160" height="160"/>
    </div>
    <img className="splash-word" src="/assets/madhav/logo-wordmark.webp" alt="" width="170" height="59"/>
    <p className="splash-tag">Remember. Chant. Reflect. Return.</p>
  </div>;
}

// Scroll to the top when the person navigates to another page. Not on first load, so a reload keeps the reading position.
function ScrollTop(){const {pathname}=useLocation();const first=useRef(true);useEffect(()=>{if(first.current){first.current=false;return}window.scrollTo(0,0)},[pathname]);return null}

export default function App(){
  const [splash,setSplash]=useState(()=>{try{return !sessionStorage.getItem(SPLASH_KEY)}catch{return true}});
  const done=()=>{try{sessionStorage.setItem(SPLASH_KEY,'1')}catch{}setSplash(false)};
  useEffect(()=>{if(splash){try{sessionStorage.setItem(SPLASH_KEY,'1')}catch{}}},[splash]);
  const link=cls=>({isActive})=>`${cls} ${isActive?'is-active':''}`;
  return <ToastProvider><ConfirmProvider>
    {splash&&<Splash onDone={done}/>}
    <div className="min-h-screen">
      <ScrollTop/>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[120] focus:bg-cream-light focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
      <aside className="hidden md:flex flex-col w-60 textured-teal p-4 gap-1 fixed inset-y-0 z-30 border-r border-[var(--line)]" aria-label="Madhav">
        <div className="rounded-xl bg-cream-light/95 border border-[var(--line)] px-4 py-3 mb-2 flex justify-center"><Deco a="logo" w={132}/></div>
        <p className="text-xs text-cream-deep text-center mb-5 font-serif italic tracking-wide">Remember. Chant. Reflect. Return.</p>
        <nav aria-label="Primary" className="flex flex-col gap-1">{nav.map(([to,l,I])=><NavLink key={to} to={to} end={to==='/'} aria-label={l} className="side-link"><I aria-hidden="true"/>{l}</NavLink>)}</nav>
        <div className="mt-auto flex justify-center opacity-90"><Deco a="emblem" w={64}/></div>
      </aside>
      <main id="main" className="app-main"><ReminderLayer/>
        <Routes><Route path="/" element={<Home/>}/><Route path="/library/*" element={<Library/>}/><Route path="/jaap" element={<Jaap/>}/><Route path="/wisdom" element={<Wisdom/>}/><Route path="/journey" element={<Journey/>}/></Routes></main>
      <nav aria-label="Primary" className="bottom-nav md:hidden">{nav.map(([to,l,I])=><NavLink key={to} to={to} end={to==='/'} className="nav-item"><I aria-hidden="true"/><span>{l}</span></NavLink>)}</nav>
    </div></ConfirmProvider></ToastProvider>;
}
