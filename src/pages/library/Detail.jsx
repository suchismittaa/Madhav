import {useCallback,useEffect,useRef,useState} from 'react';
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom';
import {Bookmark,CheckCircle2,ChevronLeft,ChevronRight,Pencil,Trash2,ExternalLink} from 'lucide-react';
import {useStore} from '../../store';
import {STATUS_LABEL,VERIFY_LABEL,CATEGORIES,hasContent,isSectioned} from '../../content/index.js';
import {useAllTexts,useCustom,useMyMantras,verseFavId} from '../../library';
import {FavBtn,JaapButton,MyBtn,StatusBadge,kindLabel} from '../../components';
import {Deco,ReadToggle,NoLayerHint,useReaderPrefs,useToast,useConfirm} from '../../ui';

// Shows only the layers the reader has switched on. Prose (English only) entries always show their text.
function Lines({s,o,center}){
  const prose=!s.sa&&!s.tr;const al=center?'text-center':'';
  return <>
    {o.sa&&s.sa&&<p lang="sa" className={`deva whitespace-pre-line ${al}`} style={{fontSize:'1.22em'}}>{s.sa}</p>}
    {o.tr&&s.tr&&<p className={`italic text-ink-soft whitespace-pre-line mt-2.5 leading-relaxed ${al}`} style={{fontSize:'.92em'}}>{s.tr}</p>}
    {(o.en||prose)&&s.en&&<p className={`font-serif mt-2.5 leading-snug ${al}`} style={{fontSize:'1.06em'}}>{s.en}</p>}
    {s.note&&<p className="text-xs text-ink-mute mt-2.5 italic">{s.note}</p>}
  </>;
}
function Pending({s}){return <div className="rounded-[10px] border border-dashed border-ink-mute p-4 text-ink-soft"><b className="font-serif text-xl block">{s.label}</b><p className="text-sm mt-1">Content pending. {s.note}</p></div>}

function SectionedReader({t,rp,setRp}){
  const [sp,setSp]=useSearchParams();const [rd,setRd,ready]=useStore('read',{});const toast=useToast();
  const r=rd[t.id]||{};const n=t.sections.length;
  const urlIdx=sp.get('v')?t.sections.findIndex(s=>s.id===sp.get('v')):-1;
  const mode=sp.get('mode')||rp.mode||'full';
  const cur=Math.min(n-1,Math.max(0,urlIdx>=0?urlIdx:(r.pos||0)));
  const posRef=useRef(cur);const timer=useRef(null);const [live,setLive]=useState(cur);
  useEffect(()=>setLive(cur),[cur]);
  const savePos=useCallback(i=>setRd(x=>x[t.id]?.pos===i?x:{...x,[t.id]:{...x[t.id],pos:i,at:Date.now()}}),[t.id,setRd]);
  const setMode=m=>{setRp(p=>({...p,mode:m}));setSp(m==='verse'?{mode:'verse',v:t.sections[posRef.current]?.id}:{mode:'full'},{replace:true})};
  const goTo=i=>setSp({mode:'verse',v:t.sections[Math.min(n-1,Math.max(0,i))].id},{replace:true});
  const bmToggle=sid=>{const had=(r.vbm||[]).includes(sid);setRd(x=>{const c=x[t.id]||{},v=c.vbm||[];return {...x,[t.id]:{...c,vbm:v.includes(sid)?v.filter(y=>y!==sid):[...v,sid]}}});toast(had?'Bookmark removed.':'Bookmark saved.',{icon:Bookmark})};

  useEffect(()=>{posRef.current=cur;if(ready&&mode==='verse')savePos(cur)},[cur,mode,ready,savePos]);
  useEffect(()=>{if(mode!=='verse')return;
    const k=e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='ArrowRight')goTo(cur+1);if(e.key==='ArrowLeft')goTo(cur-1)};
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)});
  useEffect(()=>{if(mode!=='full')return;
    if(urlIdx>=0)setTimeout(()=>document.getElementById('s-'+t.sections[urlIdx].id)?.scrollIntoView(),0);
    let raf=0;
    const onScroll=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;
      const els=[...document.querySelectorAll('[data-sec]')];let at=0;
      els.forEach((el,i)=>{if(el.getBoundingClientRect().top<window.innerHeight*0.4)at=i});
      posRef.current=at;setLive(at);clearTimeout(timer.current);timer.current=setTimeout(()=>savePos(at),600)})};
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{window.removeEventListener('scroll',onScroll);clearTimeout(timer.current);cancelAnimationFrame(raf)}},[mode]); // eslint-disable-line
  const shown=mode==='full'?live:cur;const s=t.sections[shown];const pct=Math.round((shown+1)/n*100);
  const o=rp;const bm=r.vbm||[];
  return <>
    <ReadToggle rp={rp} setRp={setRp} sectioned mode={mode} setMode={setMode}/>
    <NoLayerHint rp={rp}/>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-[.8125rem] text-ink-soft">Go to
        <select className="inp !w-auto !min-h-[34px] !py-1 !text-[.9rem]" aria-label="Go to verse" value={cur} onChange={e=>{const i=+e.target.value;mode==='verse'?goTo(i):document.getElementById('s-'+t.sections[i].id)?.scrollIntoView({behavior:'smooth'})}}>
          {t.sections.map((x,i)=><option key={x.id} value={i}>{bm.includes(x.id)?'🔖 ':''}{x.label||x.id}</option>)}</select></label>
      {r.pos>0&&mode==='full'&&<button className="btn2 btn-sm" onClick={()=>document.getElementById('s-'+t.sections[r.pos].id)?.scrollIntoView({behavior:'smooth'})}>Continue from {t.sections[r.pos]?.label}</button>}</div>
    {bm.length>0&&<div className="mt-2 hscroll items-center" aria-label="Bookmarked verses"><span className="text-xs text-ink-soft">Bookmarks:</span>
      {bm.map(id=>{const i=t.sections.findIndex(x=>x.id===id);return i<0?null:<button key={id} className="badge badge-verified" onClick={()=>goTo(i)}>{t.sections[i].label}</button>})}</div>}
    <p className="mt-3 text-[.8125rem] text-ink-soft" role="status" aria-live="polite">{s.label} · {shown+1} of {n} · {pct}% read</p>
    <div className="progress mt-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Reading progress"><i style={{width:pct+'%'}}/></div>

    {mode==='verse'?<div className="mt-3 space-y-3">
      <div className="page framed" style={{fontSize:rp.sz}} data-testid="verse-card">
        {s.group&&<p className="text-xs text-ink-mute text-center mb-3">{s.group}</p>}
        {s.pending?<Pending s={s}/>:<Lines s={s} o={o} center/>}</div>
      <div className="flex gap-2"><button className="btn2 flex-1" disabled={cur===0} onClick={()=>goTo(cur-1)}><ChevronLeft/>Previous verse</button>
        <button className="btn flex-1" disabled={cur===n-1} onClick={()=>goTo(cur+1)}>Next verse<ChevronRight/></button></div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button className={`${bm.includes(s.id)?'btn':'btn2'} btn-sm`} aria-pressed={bm.includes(s.id)} onClick={()=>bmToggle(s.id)}><Bookmark/>{bm.includes(s.id)?'Verse bookmarked':'Bookmark verse'}</button>
        {!s.pending&&<FavBtn id={verseFavId(t.id,s.id)} verse/>}</div>
    </div>
    :<>
      <div className="fixed top-0 inset-x-0 md:left-60 h-1 bg-cream-deep z-40" aria-hidden="true"><div className="h-1 bg-gold" style={{width:pct+'%'}}/></div>
      <div className="fixed right-3 z-30 rounded-full bg-ink text-cream-light text-xs px-3 py-1 shadow pointer-events-none border border-[var(--line)]" style={{bottom:'calc(var(--nav-h) + var(--safe-b) + 10px)'}} aria-hidden="true">{s.label} · {pct}%</div>
      <div className="page mt-3" style={{fontSize:rp.sz}} data-testid="full-reading">
        {t.sections.map((x,i)=><section key={x.id} id={'s-'+x.id} data-sec={x.id} className="stanza scroll-mt-4">
          {x.group&&(i===0||t.sections[i-1].group!==x.group)&&<h3 className="text-center font-serif text-amethyst mb-3" style={{fontSize:'1.2em'}}>{x.group}</h3>}
          {x.label&&x.group==='Chaupai'&&<p className="text-xs text-ink-mute text-center mb-2">{x.label}</p>}
          {x.pending?<Pending s={x}/>:<Lines s={x} o={o} center/>}
          {!x.pending&&<div className="flex justify-center mt-2" style={{fontSize:16}}>
            <button className="icon-btn" aria-pressed={bm.includes(x.id)} aria-label={`${bm.includes(x.id)?'Remove bookmark':'Bookmark'}: ${x.label}`} onClick={()=>bmToggle(x.id)}><Bookmark fill={bm.includes(x.id)?'#48204F':'none'}/></button>
            <FavBtn id={verseFavId(t.id,x.id)} compact name={x.label}/></div>}
        </section>)}</div></>}
  </>;
}

function SimpleReader({t,rp,setRp}){
  return <>
    <ReadToggle rp={rp} setRp={setRp}/><NoLayerHint rp={rp}/>
    <div className="page framed mt-3" style={{fontSize:rp.sz}} data-testid="reading">
      {t.sections.length?t.sections.map(s=><div key={s.id} className="stanza">{s.label&&<p className="text-xs text-ink-mute text-center mb-2">{s.label}</p>}<Lines s={s} o={rp} center/></div>)
      :<p className="text-center text-ink-mute">No text added yet. Edit this mantra to add its text.</p>}</div></>;
}

// Where the text comes from and how far it has been checked, with a link to verify it.
function SourceCard({t}){
  const s=t.src;if(!s||s.verification==='custom')return null;
  return <section className="card mt-5 space-y-1.5 card-am" aria-labelledby="src-h" data-testid="source-card">
    <h3 id="src-h" className="text-xl">Source and verification</h3>
    <dl className="text-[.8125rem] text-ink-soft space-y-1">
      <div><dt className="inline font-semibold text-ink">Source: </dt><dd className="inline">{s.work}{s.ref&&` · ${s.ref}`}</dd></div>
      {s.edition&&<div><dt className="inline font-semibold text-ink">Edition or repository: </dt><dd className="inline">{s.edition}</dd></div>}
      <div><dt className="inline font-semibold text-ink">Status: </dt><dd className="inline"><span className={`badge badge-${s.verification}`}>{VERIFY_LABEL[s.verification]}</span>{s.checked&&<span className="text-xs text-ink-mute"> · checked {s.checked}</span>}</dd></div>
      {s.note&&<div><dt className="inline font-semibold text-ink">Notes: </dt><dd className="inline">{s.note}</dd></div>}</dl>
    {s.url&&<a className="btn2 btn-sm" href={s.url} target="_blank" rel="noopener noreferrer"><ExternalLink/>Open the source to verify</a>}
    <p className="text-[.6875rem] text-ink-mute">Madhav does not present its transliteration or English meanings as a published translation. They are concise renderings for readers; check the source for scholarly work.</p>
  </section>;
}

export default function Detail(){
  const {id}=useParams();const nav=useNavigate();const toast=useToast();const confirm=useConfirm();
  const [texts,ready]=useAllTexts();const t=texts.find(x=>x.id===id);
  const [rp,setRp]=useReaderPrefs();const [rd,setRd]=useStore('read',{});
  const [,setCustom]=useCustom();const [,setMy]=useMyMantras();const [,setFavs]=useStore('favs',[]);
  if(!t)return ready?<p>Not found. <Link className="underline" to="/library">Back to the library</Link></p>:<p className="text-sm text-ink-mute">Loading…</p>;
  const r=rd[id]||{};const set=p=>setRd(x=>({...x,[id]:{...x[id],...p}}));
  const sectioned=isSectioned(t),content=hasContent(t),st=t.status?.text;
  const art=CATEGORIES.find(c=>c.id===t.category)?.art;
  const remove=async()=>{if(!await confirm({title:`Delete “${t.title}”?`,body:'This cannot be undone.',confirm:'Delete',cancel:'Keep it'}))return;
    setCustom(p=>p.filter(c=>c.id!==id));setMy(p=>p.filter(x=>x!==id));setFavs(p=>p.filter(x=>x!==id&&!x.startsWith(id+'#')));
    setRd(x=>{const n={...x};delete n[id];return n});toast('Mantra deleted.');nav('/library/my-mantras')};
  return <div className="pb-4">
    <Link className="text-[.8125rem] underline" to={t.custom?'/library':`/library/category/${t.category}`}>← {t.custom?'Library':t.cat}</Link>
    <div className="relative mt-1.5">
      {art&&!t.custom&&<Deco a={art} h={58} className="watermark" style={{right:0,top:0,opacity:.85}}/>}
      <h2 className="text-3xl leading-tight pr-16">{t.title}</h2>
      <p className="text-[.8125rem] text-ink-mute mt-0.5">{kindLabel(t.kind)} · {t.cat}</p>
      <div className="flex flex-wrap gap-1 mt-1.5"><StatusBadge status={t.status}/></div></div>
    {t.summary&&!t.custom&&<p className="text-sm text-ink-soft mt-2">{t.summary}</p>}
    <div className="flex flex-wrap gap-2 mt-3">
      {t.chantable&&<JaapButton id={t.id} className="btn btn-sm"/>}<FavBtn id={id}/><MyBtn id={id}/>
      {t.custom&&<><Link className="btn2 btn-sm" to={`/library/custom/${id}/edit`}><Pencil/>Edit</Link><button className="btn2 btn-sm" onClick={remove}><Trash2/>Delete</button></>}</div>

    <div className="mt-4">
    {t.custom&&!t.sections.length?<SimpleReader t={t} rp={rp} setRp={setRp}/>
     :!content?<div className="card space-y-2"><p className="font-serif text-xl">Content pending verification</p>
        <p className="text-sm text-ink-soft">{t.status?.note} The page is ready, and the text will appear here once a verified edition is added.</p></div>
     :sectioned?<SectionedReader t={t} rp={rp} setRp={setRp}/>:<SimpleReader t={t} rp={rp} setRp={setRp}/>}</div>

    {t.notes&&<section className="card mt-5"><h3 className="text-xl">Your notes</h3><p className="whitespace-pre-wrap mt-1 text-sm">{t.notes}</p></section>}
    {!t.custom&&<section className="card mt-5 space-y-2"><h3 className="text-xl">About this text</h3>
      {t.explanation&&<p className="text-sm">{t.explanation}</p>}
      {t.pronunciation&&<details><summary className="cursor-pointer underline text-[.8125rem]">Pronunciation guidance</summary><p className="text-[.8125rem] text-ink-soft mt-1.5">{t.pronunciation}</p></details>}
      <p className="text-[.8125rem] text-ink-soft"><b>{STATUS_LABEL[st]}.</b> {t.status?.note}</p></section>}
    {!t.custom&&<SourceCard t={t}/>}

    <div className="flex flex-wrap gap-2 mt-5" aria-label="Reading status">
      <button className={`${r.bm?'btn':'btn2'} btn-sm`} aria-pressed={!!r.bm} onClick={()=>{set({bm:!r.bm});toast(r.bm?'Bookmark removed.':'Bookmark saved.',{icon:Bookmark})}}><Bookmark/>Bookmark</button>
      <button className={`${r.done?'btn':'btn2'} btn-sm`} aria-pressed={!!r.done} onClick={()=>{set({done:!r.done});if(!r.done)toast('One more step in your reading journey.',{icon:CheckCircle2})}}><CheckCircle2/>{r.done?'Completed':'Mark completed'}</button></div>
  </div>;
}
