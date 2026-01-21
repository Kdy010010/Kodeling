export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export class Vec2 {
  constructor(x=0,y=0){this.x=x;this.y=y}
  set(x,y){this.x=x;this.y=y;return this}
  copy(v){this.x=v.x;this.y=v.y;return this}
  add(v){this.x+=v.x;this.y+=v.y;return this}
  sub(v){this.x-=v.x;this.y-=v.y;return this}
  mul(s){this.x*=s;this.y*=s;return this}
  len(){return Math.hypot(this.x,this.y)}
  norm(){const l=this.len()||1; this.x/=l; this.y/=l; return this}
  clone(){return new Vec2(this.x,this.y)}
  static dot(a,b){return a.x*b.x+a.y*b.y}
}

export const now = () => performance.now();
export const uid = (()=>{let i=1; return ()=>i++;})();

export function aabbOverlap(A,B){
  return !(A.x + A.w <= B.x || A.x >= B.x + B.w || A.y + A.h <= B.y || A.y >= B.y + B.h);
}

export function aabbResolve(A,B){
  // returns minimal translation to push A out of B (assuming overlap)
  const dx1 = (B.x + B.w) - A.x;
  const dx2 = (A.x + A.w) - B.x;
  const dy1 = (B.y + B.h) - A.y;
  const dy2 = (A.y + A.h) - B.y;
  const minX = Math.min(dx1, dx2);
  const minY = Math.min(dy1, dy2);
  if (minX < minY) return { x: (dx1 < dx2) ? dx1 : -dx2, y: 0 };
  return { x: 0, y: (dy1 < dy2) ? dy1 : -dy2 };
}
