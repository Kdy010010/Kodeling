import { Body } from "./physics2d.js";
import { Transform } from "./transform.js";

export const TopDown = "TopDown";

export function TopDownPlugin({ speed=260 } = {}){
  return {
    onInit(engine){ engine.topdownDefaults = { speed }; },
    systems: [{
      update(world, ctx){
        const ids = world.query([TopDown, Transform, Body]);
        for(const id of ids){
          const t = world.get(id, TopDown);
          const b = world.get(id, Body);

          let mx=0,my=0;
          if(ctx.input.key("ArrowLeft") || ctx.input.key("a")) mx -= 1;
          if(ctx.input.key("ArrowRight") || ctx.input.key("d")) mx += 1;
          if(ctx.input.key("ArrowUp") || ctx.input.key("w")) my -= 1;
          if(ctx.input.key("ArrowDown") || ctx.input.key("s")) my += 1;

          mx += ctx.input.joy.vx;
          my += ctx.input.joy.vy;

          const l = Math.hypot(mx,my) || 1;
          mx/=l; my/=l;

          b.acc.x += mx * t.speed * 10;
          b.acc.y += my * t.speed * 10;
        }
      }
    }]
  };
}

export function addTopDown(world,id,opts={}){
  return world.add(id, TopDown, { speed: opts.speed ?? 260 });
}
