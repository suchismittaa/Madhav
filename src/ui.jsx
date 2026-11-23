// Shared UI kit: toasts, in-app confirm dialog, decorative images, compact reading toggle.
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {Check} from 'lucide-react';
import {ASSETS} from './assets';
import {useStore} from './store';

/* ---------- decorative image ---------- */
// Pass h (height in px) or w (width in px); the other side follows the artwork's own proportions.
export function Deco({a,h,w,className='',style,flip=false,op}){
  const x=ASSETS[a];if(!x)return null;
  const W=w||(h?Math.round(h*x.w/x.h):x.w),H=h||(w?Math.round(w*x.h/x.w):x.h);
  return <img src={x.src} alt="" aria-hidden="true" role="presentation" draggable="false" loading="lazy" decoding="async" width={W} height={H}
    className={`deco ${className}`} style={{width:W,height:H,transform:flip?'scaleX(-1)':undefined,opacity:op,...style}}/>;
}
// A fine lotus-border divider.
export function Ornament({className=''}){return <div aria-hidden="true" className={`flex justify-center my-3 ${className}`}><Deco a="lotusBorder" w={220} op={.9} style={{maxWidth:'70%',height:'auto'}}/></div>}

/* ---------- toasts ---------- */
const ToastCtx=createContext(()=>{});
export const useToast=()=>useContext(ToastCtx);
export function ToastProvider({children}){
  const [items,setItems]=useState([]);const last=useRef({m:'',t:0});
  const toast=useCallback((msg,o={})=>{
    const now=Date.now();if(last.current.m===msg&&now-last.current.t<900)return;last.current={m:msg,t:now};
    const id=now+Math.random();const Icon=o.icon||Check;
    setItems(l=>[...l.slice(-2),{id,msg,Icon,tone:o.tone}]);
    setTimeout(()=>setItems(l=>l.map(i=>i.id===id?{...i,out:true}:i)),o.ms||2600);
    setTimeout(()=>setItems(l=>l.filter(i=>i.id!==id)),(o.ms||2600)+320);
  },[]);
  return <ToastCtx.Provider value={toast}>{children}
    <div className="toast-wrap" role="status" data-testid="toasts">{items.map(({id,msg,Icon,tone,out})=><div key={id} className={`toast ${tone==='am'?'am':''} ${out?'out':''}`}><Icon aria-hidden="true"/><span>{msg}</span></div>)}</div></ToastCtx.Provider>;
}

/* ---------- confirm dialog (replaces window.confirm) ---------- */
const ConfirmCtx=createContext(async()=>true);
export const useConfirm=()=>useContext(ConfirmCtx);
export function ConfirmProvider({children}){
  const [q,setQ]=useState(null);const cancelRef=useRef(null);
  const ask=useCallback(o=>new Promise(res=>setQ({...o,res})),[]);
  const close=v=>{q?.res(v);setQ(null)};
  useEffect(()=>{if(!q)return;cancelRef.current?.focus();const k=e=>{if(e.key==='Escape')close(false)};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)});// eslint-disable-line
  return <ConfirmCtx.Provider value={ask}>{children}
    {q&&<div className="scrim" onClick={e=>e.target===e.currentTarget&&close(false)}><div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-b">
      <h3 id="dlg-t" className="text-xl">{q.title}</h3>{q.body&&<p id="dlg-b" className="text-sm text-ink-soft mt-1">{q.body}</p>}
      <div className="flex justify-end gap-2 mt-4"><button ref={cancelRef} className="btn2 btn-sm" onClick={()=>close(false)}>{q.cancel||'Keep'}</button>
        <button className="btn btn-sm" onClick={()=>close(true)}>{q.confirm||'Confirm'}</button></div></div></div>}
  </ConfirmCtx.Provider>;
}

/* ---------- reading preferences (shared by the scripture reader, Gita verses and Wisdom) ---------- */
export const READER_DEFAULTS={sa:true,tr:true,en:true,sz:17,mode:'full'};
export function useReaderPrefs(){const [p,set,ready]=useStore('reader:prefs',READER_DEFAULTS);return [{...READER_DEFAULTS,...p},fn=>set(old=>{const cur={...READER_DEFAULTS,...old};return typeof fn==='function'?fn(cur):fn}),ready]}
const LAYERS=[['sa','Original'],['tr','Transliteration'],['en','Meaning']];
// One compact horizontal row. It never wraps; on a very narrow phone it scrolls sideways (scrollbar hidden).
export function ReadToggle({rp,setRp,sectioned=false,mode,setMode,size=true}){
  return <div className="hscroll items-center" role="toolbar" aria-label="Reading options">
    <span className="seg" role="group" aria-label="Show">{LAYERS.map(([k,l])=><button key={k} aria-pressed={!!rp[k]} onClick={()=>setRp(p=>({...p,[k]:!p[k]}))}>{l}</button>)}</span>
    {size&&<span className="seg" role="group" aria-label="Text size"><button aria-label="Smaller text" onClick={()=>setRp(p=>({...p,sz:Math.max(14,p.sz-2)}))}>A−</button><button aria-label="Larger text" onClick={()=>setRp(p=>({...p,sz:Math.min(34,p.sz+2)}))}>A+</button></span>}
    {sectioned&&<span className="seg" role="group" aria-label="Reading mode">{[['full','Full reading'],['verse','Verse by verse']].map(([k,l])=><button key={k} aria-pressed={mode===k} onClick={()=>setMode(k)}>{l}</button>)}</span>}
  </div>;
}
export const NoLayerHint=({rp})=>(!rp.sa&&!rp.tr&&!rp.en)?<p className="text-xs text-amethyst mt-2" role="status">Switch on Original, Transliteration or Meaning to read the text.</p>:null;

/* ---------- tiny helpers ---------- */
export function useIsMounted(){const r=useRef(true);useEffect(()=>()=>{r.current=false},[]);return r}
export const cx=(...a)=>a.filter(Boolean).join(' ');
