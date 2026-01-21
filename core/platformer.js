import { Transform } from "./transform.js";
import { Body, Collider } from "./physics2d.js";

export const Platformer = "Platformer";

export function PlatformerPlugin({ speed=240, jump=520, coyote=0.08, jumpBuffer=0.10 } = {}){
  return {
    onInit(engine){
      engine.platformerDefaults = { speed, jump, coyote, jumpBuffer };
    },
    systems: [{
      update(world, ctx){
        const ids = world.query([Platformer, Transform, Body, Collider], { tagsAny:["player"] });
        for(const id of ids){
          const p = world.get(id, Platformer);
          const b = world.get(id, Body);
          const c = world.get(id, Collider);

          // timers
          p._coyote = Math.max(0, p._coyote - ctx.time.dt);
          p._buf = Math.max(0, p._buf - ctx.time.dt);

          const onGround = c.touch.down;
          if(onGround) p._coyote = p.coyote;

          // move input
          let mx = 0;
          if(ctx.input.key("ArrowLeft") || ctx.input.key("a")) mx -= 1;
          if(ctx.input.key("ArrowRight") || ctx.input.key("d")) mx += 1;
          mx += ctx.input.joy.vx;

          b.acc.x += mx * p.speed * 10;

          // jump buffer
          if(ctx.input.pressed(" ") || ctx.input.pressed("ArrowUp") || ctx.input.pressed("w")){
            p._buf = p.jumpBuffer;
          }
          if(p._buf > 0 && p._coyote > 0){
            p._buf = 0;
            p._coyote = 0;
            b.vel.y = -p.jump;
            ctx.events.emit("jump", { id });
          }
        }
      }
    }]
  };
}

export function addPlatformer(world, id, opts={}){
  const d = { speed:240, jump:520, coyote:0.08, jumpBuffer:0.10 };
  const p = { ...d, ...opts, _coyote:0, _buf:0 };
  return world.add(id, Platformer, p);
}
