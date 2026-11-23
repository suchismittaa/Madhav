import {useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {CATEGORIES} from '../../content/index.js';
import {useCustom,useMyMantras,newId} from '../../library';
import {useToast} from '../../ui';

const EMPTY={title:'',category:'other',sa:'',tr:'',en:'',notes:''};
export default function CustomForm(){
  const {id}=useParams();const nav=useNavigate();const toast=useToast();const editing=!!id;
  const [list,setList,ready]=useCustom();const [,setMy]=useMyMantras();
  const [f,setF]=useState(EMPTY);const [addMy,setAddMy]=useState(true);const [err,setErr]=useState('');const [loaded,setLoaded]=useState(!editing);
  useEffect(()=>{if(editing&&ready&&!loaded){const c=list.find(x=>x.id===id);if(c)setF({...EMPTY,...c});setLoaded(true)}},[editing,ready,loaded,list,id]);
  if(editing&&ready&&loaded&&!list.some(x=>x.id===id))return <p>This mantra was not found. <Link className="underline" to="/library">Back to the library</Link></p>;
  const ch=k=>e=>setF({...f,[k]:e.target.value});
  const save=e=>{e.preventDefault();const title=f.title.trim();
    if(!title){setErr('Give your mantra a name.');return}
    const clean={...f,title,sa:f.sa.trim(),tr:f.tr.trim(),en:f.en.trim(),notes:f.notes.trim()};
    if(editing){setList(p=>p.map(c=>c.id===id?{...c,...clean}:c));toast('Your changes have been saved.')}
    else{const nid=newId();setList(p=>[...p,{id:nid,...clean,created:Date.now()}]);if(addMy)setMy(p=>[...p,nid]);toast('Mantra added to your collection.');nav(`/library/${nid}`);return}
    nav(`/library/${id}`)};
  return <form onSubmit={save} className="space-y-3" noValidate>
    <Link className="text-[.8125rem] underline" to={editing?`/library/${id}`:'/library'}>← {editing?'Back to mantra':'Library'}</Link>
    <h2 className="text-3xl">{editing?'Edit mantra':'Add your own mantra'}</h2>
    <label className="field"><span>Name</span><input className="inp" required aria-invalid={!!err} value={f.title} onChange={ch('title')} placeholder="For example, Om Shri Ganeshaya Namah"/></label>
    {err&&<p className="text-amethyst text-sm" role="alert">{err}</p>}
    <label className="field"><span>Category</span><select className="inp" value={f.category} onChange={ch('category')}>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className="field"><span>Sanskrit or original text</span><textarea className="inp deva !min-h-[84px]" lang="sa" value={f.sa} onChange={ch('sa')}/></label>
    <label className="field"><span>Transliteration</span><textarea className="inp !min-h-[72px]" value={f.tr} onChange={ch('tr')}/></label>
    <label className="field"><span>Meaning</span><textarea className="inp !min-h-[72px]" value={f.en} onChange={ch('en')}/></label>
    <label className="field"><span>Personal notes</span><textarea className="inp !min-h-[72px]" value={f.notes} onChange={ch('notes')}/></label>
    {!editing&&<label className="flex items-center gap-2"><input type="checkbox" checked={addMy} onChange={e=>setAddMy(e.target.checked)}/>Add to My Mantras</label>}
    <div className="flex gap-2"><button className="btn" type="submit">{editing?'Save changes':'Save mantra'}</button><Link className="btn2" to={editing?`/library/${id}`:'/library'}>Cancel</Link></div>
  </form>}
