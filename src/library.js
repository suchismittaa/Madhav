// Shared library state and helpers (hooks over the persistent store).
import {useMemo} from 'react';
import {useStore} from './store';
import {TEXTS,catName} from './content/index.js';

export const CUSTOM_KEY='custom:mantras'; // [{id,title,category,sa,tr,en,notes,created}]
export const MY_KEY='my:mantras';          // ordered array of text ids (library or custom)
export const newId=()=>'cm-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export const verseFavId=(textId,secId)=>`${textId}#${secId}`;

export const useCustom=()=>useStore(CUSTOM_KEY,[]);
export const useMyMantras=()=>useStore(MY_KEY,[]);

// Custom mantras converted to the same schema as library texts.
export function customToText(c){
  const has=c.sa||c.tr||c.en;
  return {id:c.id,title:c.title,category:c.category||'other',cat:catName(c.category||'other'),kind:'mantra',chantable:true,custom:true,
    keywords:[],summary:c.notes?c.notes.slice(0,90):'Your own mantra',explanation:'',notes:c.notes||'',source:'Added by you',
    status:{text:'custom',note:'Written by you.'},src:{work:'Added by you',verification:'custom'},
    sections:has?[{id:'l1',sa:c.sa||'',tr:c.tr||'',en:c.en||''}]:[]};
}
export function useAllTexts(){
  const [custom,,ready]=useCustom();
  const texts=useMemo(()=>[...TEXTS,...custom.map(customToText)],[custom]);
  return [texts,ready];
}
export const jaapPath=id=>`/jaap?mantra=${encodeURIComponent(id)}`;

// Everything the Jaap screen can offer, grouped. Keeps older saved names (the previous string list) working.
export function useJaapOptions(){
  const [texts]=useAllTexts();const [my]=useMyMantras();const [legacy]=useStore('mantras',[]);
  return useMemo(()=>{
    const chant=texts.filter(t=>t.chantable);const byId=Object.fromEntries(chant.map(t=>[t.id,t]));
    const used=new Set();const groups=[];
    const mine=my.map(id=>byId[id]).filter(Boolean);
    if(mine.length){groups.push({label:'My Mantras',items:mine.map(t=>({id:t.id,name:t.title,text:t}))});mine.forEach(t=>used.add(t.id))}
    for(const label of [...new Set(chant.filter(t=>!t.custom).map(t=>t.cat))]){
      const items=chant.filter(t=>!t.custom&&t.cat===label&&!used.has(t.id));
      if(items.length)groups.push({label,items:items.map(t=>({id:t.id,name:t.title,text:t}))});
    }
    const cm=chant.filter(t=>t.custom&&!used.has(t.id));
    if(cm.length)groups.push({label:'Your mantras',items:cm.map(t=>({id:t.id,name:t.title,text:t}))});
    const known=new Set(chant.map(t=>t.title.toLowerCase()));
    const extra=['Krishna Naam',...legacy].filter((n,i,a)=>a.indexOf(n)===i&&!known.has(n.toLowerCase()));
    if(extra.length)groups.push({label:'Other',items:extra.map(n=>({id:'name:'+n,name:n}))});
    return groups;
  },[texts,my,legacy]);
}
export function findJaapItem(groups,id){for(const g of groups)for(const i of g.items)if(i.id===id)return i;return null}

export function sectionTitle(t,s){return s?.label?`${t.title} · ${s.label}`:t.title}

// Resolve a favourite id to something displayable.
export function resolveFav(id,texts,gita){
  if(id.includes('#')){
    const [tid,sid]=id.split('#');const t=texts.find(x=>x.id===tid);const s=t?.sections.find(x=>x.id===sid);
    return t&&s?{kind:'verse',id,text:t,section:s}:null;
  }
  const t=texts.find(x=>x.id===id);if(t)return {kind:'text',id,text:t};
  const v=gita.find(x=>x.id===id);if(v)return {kind:'gita',id,verse:v};
  return null;
}
