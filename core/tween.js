import { clamp } from "../core/util.js";

export const Tween = "Tween";

export function TweenPlugin(){
  return {
    onInit(engine){
      engine.tween = {
        to(obj, key, to, dur=0.4, ease="out"){
          const from = obj[key];
          const id = engine.world.create(["tween"]);
          engine.world.add(id, Tween, { obj, key, from, to, dur, t:0, ease });
          return id;
        }
      };
    },
    systems: [{
      update(world, ctx){
        const ids = world.query([Tween]);
        for(const id of ids){
          const tw = world.get(id, Tween);
          tw.t += ctx.time.dt;
          const u = clamp(tw.t / Math.max(1e-6, tw.dur), 0, 1);
          const e = ease(u, tw.ease);
          tw.obj[tw.key] = tw.from + (tw.to - tw.from) * e;
          if(u >= 1) world.kill(id);
        }
      }
    }]
  };
}

function ease(t, kind){
  if(kind==="linear") return t;
  if(kind==="in") return t*t;
  if(kind==="out") return 1 - (1-t)*(1-t);
  if(kind==="inout"){
    return t<0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
  }
  return 1 - (1-t)*(1-t); // default out
}
