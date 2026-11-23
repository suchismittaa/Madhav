import {get,set,clear,keys} from 'idb-keyval';
import {useCallback,useSyncExternalStore} from 'react';

// Shared, persistent store. Every component that uses the same key sees the same value,
// so several buttons (e.g. one heart per verse) can update the same list without overwriting each other.
const cache=new Map();
function entry(key,init){
  let e=cache.get(key);
  if(e)return e;
  e={snap:{value:init,ready:false},subs:new Set(),queue:[],touched:false};
  cache.set(key,e);
  const done=x=>{
    let v=(x!==undefined&&x!==null)?x:e.snap.value;
    for(const f of e.queue)v=f(v);
    if(e.queue.length)set(key,v).catch(console.error);
    e.queue=[];
    e.snap={value:v,ready:true};
    e.subs.forEach(fn=>fn());
  };
  get(key).then(done).catch(()=>done(undefined));
  return e;
}
export function useStore(key,init){
  const e=entry(key,init);
  const snap=useSyncExternalStore(
    useCallback(fn=>{e.subs.add(fn);return()=>e.subs.delete(fn)},[e]),
    ()=>e.snap,
  );
  const update=useCallback(f=>{
    const fn=typeof f==='function'?f:()=>f;
    if(!e.snap.ready){e.queue.push(fn);return}   // wait until stored data has loaded, then apply in order
    const n=fn(e.snap.value);
    e.snap={value:n,ready:true};
    set(key,n).catch(console.error);
    e.subs.forEach(s=>s());
  },[e,key]);
  return [snap.value,update,snap.ready];
}
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export async function exportAll(){const o={};for(const k of await keys())o[k]=await get(k);return JSON.stringify(o,null,2)}
export const clearAll=()=>clear();
