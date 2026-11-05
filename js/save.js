const KEY='english-quest-full-v1';
export function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&typeof x==='object')return x}catch{}return {coins:0,found:{},done:{},mastery:{},opened:0,position:{x:7,y:7}}}
export function save(state){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Could not save',e)}}
export function clear(){localStorage.removeItem(KEY)}
