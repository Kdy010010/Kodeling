import { Vec2, aabbOverlap, aabbResolve } from "../core/util.js";
import { Transform } from "./transform.js";

export const Body = "Body";
export const Collider = "Collider";

export function Physics2D({ gravity=0, iterations=2, worldBounds=null } = {}){
  return {
    onInit(engine){
      engine.physics = { gravity, iterations, worldBounds };
    },
    systems: [{
      update(world, ctx){
        const { engine } = ctx;
        const g = engine.physics?.gravity ?? 0;

        // integrate
        const movers = world.query([Transform, Body]);
        for(const id of movers){
          const t = world.get(id, Transform);
          const b = world.get(id, Body);

          b.vel.y += (b.useGravity ? g : 0) * ctx.time.dt;
          b.vel.x += b.acc.x * ctx.time.dt;
          b.vel.y += b.acc.y * ctx.time.dt;

          // drag
          b.vel.x *= b.drag;
          b.vel.y *= b.drag;

          // clamp speed
          const sp = Math.hypot(b.vel.x, b.vel.y);
          if(sp > b.maxSpeed){
            const s = b.maxSpeed / sp;
            b.vel.x *= s; b.vel.y *= s;
          }

          t.pos.x += b.vel.x * ctx.time.dt;
          t.pos.y += b.vel.y * ctx.time.dt;

          // reset acc
          b.acc.set(0,0);

          // bounds
          if(engine.physics.worldBounds){
            const B=engine.physics.worldBounds;
            t.pos.x = Math.max(B.x, Math.min(B.x+B.w, t.pos.x));
            t.pos.y = Math.max(B.y, Math.min(B.y+B.h, t.pos.y));
          }
        }

        // collider/collision (naive, modular)
        // sets collision flags + resolves dynamic vs solid
        const cols = world.query([Transform, Collider]);
        for(const id of cols){
          const c = world.get(id, Collider);
          c.touch = { left:false,right:false,up:false,down:false };
        }

        // broad: n^2 (small games OK; later spatial hash plugin 가능)
        for(let it=0; it<(engine.physics.iterations||1); it++){
          for(let i=0;i<cols.length;i++){
            const aId = cols[i];
            const aT = world.get(aId, Transform);
            const aC = world.get(aId, Collider);
            const aB = world.get(aId, Body);

            for(let j=i+1;j<cols.length;j++){
              const bId = cols[j];
              const bT = world.get(bId, Transform);
              const bC = world.get(bId, Collider);
              const bB = world.get(bId, Body);

              const A = { x:aT.pos.x + aC.ox, y:aT.pos.y + aC.oy, w:aC.w, h:aC.h };
              const B = { x:bT.pos.x + bC.ox, y:bT.pos.y + bC.oy, w:bC.w, h:bC.h };
              if(!aabbOverlap(A,B)) continue;

              // emit collision event
              ctx.events.emit("collision", { a:aId, b:bId });

              // resolve only if one is dynamic and other is solid
              const aDyn = !!aB && aC.solid;
              const bDyn = !!bB && bC.solid;

              if(aDyn && (!bB) && bC.solid){
                const mtv = aabbResolve(A,B);
                aT.pos.x += mtv.x; aT.pos.y += mtv.y;
                if(mtv.x>0) aC.touch.left=true;
                if(mtv.x<0) aC.touch.right=true;
                if(mtv.y>0) aC.touch.up=true;
                if(mtv.y<0) aC.touch.down=true;
                if(mtv.x) aB.vel.x=0;
                if(mtv.y) aB.vel.y=0;
                aC.onTouch?.(aId, bId, mtv, ctx);
              } else if(bDyn && (!aB) && aC.solid){
                const mtv = aabbResolve(B,A);
                bT.pos.x += mtv.x; bT.pos.y += mtv.y;
                if(mtv.x>0) bC.touch.left=true;
                if(mtv.x<0) bC.touch.right=true;
                if(mtv.y>0) bC.touch.up=true;
                if(mtv.y<0) bC.touch.down=true;
                if(mtv.x) bB.vel.x=0;
                if(mtv.y) bB.vel.y=0;
                bC.onTouch?.(bId, aId, mtv, ctx);
              } else {
                // dynamic vs dynamic? optional: separate both
                if(aB && bB && aC.solid && bC.solid){
                  const mtv = aabbResolve(A,B);
                  aT.pos.x += mtv.x * 0.5; aT.pos.y += mtv.y * 0.5;
                  bT.pos.x -= mtv.x * 0.5; bT.pos.y -= mtv.y * 0.5;
                }
              }
            }
          }
        }
      }
    }]
  };
}

export function addBody(world, id, { useGravity=true, drag=0.88, maxSpeed=800 } = {}){
  return world.add(id, Body, { vel:new Vec2(0,0), acc:new Vec2(0,0), useGravity, drag, maxSpeed });
}

export function addCollider(world, id, { w=16,h=16, ox=0,oy=0, solid=true, isTrigger=false, onTouch=null } = {}){
  return world.add(id, Collider, {
    w,h,ox,oy, solid, isTrigger, onTouch,
    touch:{left:false,right:false,up:false,down:false}
  });
}
