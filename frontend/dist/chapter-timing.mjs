export const TRANSITION_MS=1800;
export function transitionValue(from,to,elapsed,duration=TRANSITION_MS){
 const t=Math.max(0,Math.min(1,elapsed/duration));
 return {value:from+(to-from)*(t*t*(3-2*t)),done:t===1};
}
