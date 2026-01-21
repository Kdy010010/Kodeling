import { Transform } from "./transform.js";
import { Body, Collider } from "./physics2d.js";
import { Vec2 } from "../core/util.js";

export const Gun = "Gun";
export const Bullet = "Bullet";
export const Health = "Health";

export function ShooterPlugin(){
  return {
    onInit(engine){
      engine.shooter = {
        spawnBullet(engine, {x,y,vx,vy,w=8,h=8,life=2,tags=["bullet"], damage=1, color="#ffd166"}){
          const id = engine.world.create(tags);
          engine.world.add(id, Transform, { pos:new Vec2(x,y), scale:new Vec2(1,1), rot:0 });
          engine.world.add(id, Body, { vel:new Vec2(vx,vy), acc:new Vec2(0,0), useGravity:false, drag:1, maxSpeed:2000 });
          engine.world.add(id, Collider, { w,h,ox:0,oy:0, solid:false, isTrigger:true, touch:{}, onTouch:null });
          engine.world.add(id, Bullet, { life, damage, color });
          return id;
        }
      };
    },
    systems: [{
      update(world, ctx){
        // guns
        const guns = world.query([Gun, Transform], { tagsAny:["player","enemy"] });
        for(const id of guns){
          const g = world.get(id, Gun);
          const t = world.get(id, Transform);

          g.cool -= ctx.time.dt;
          if(g.cool > 0) continue;

          const fire = g.auto
            ? true
            : (ctx.input.pressed(g.key) || ctx.input.key(g.key));

          if(!fire) continue;

          g.cool = 1 / Math.max(1e-6, g.rate);

          const dir = g.dirFn ? g.dirFn(id, ctx) : { x:1, y:0 };
          const l = Math.hypot(dir.x,dir.y) || 1;
          const nx = dir.x/l, ny = dir.y/l;

          // spread
          const ang = Math.atan2(ny,nx) + (Math.random()*2-1)*g.spread;
          const vx = Math.cos(ang)*g.bulletSpeed;
          const vy = Math.sin(ang)*g.bulletSpeed;

          ctx.engine.shooter.spawnBullet(ctx.engine, {
            x: t.pos.x + g.muzzleX,
            y: t.pos.y + g.muzzleY,
            vx, vy,
            w:g.bw, h:g.bh,
            life:g.life,
            tags:["bullet", ...(g.bulletTags||[])],
            damage:g.damage,
            color:g.color
          });

          if(g.sound) ctx.engine.play(g.sound, { volume:g.volume ?? 0.35 });
        }

        // bullets lifetime
        const bullets = world.query([Bullet]);
        for(const id of bullets){
          const b = world.get(id, Bullet);
          b.life -= ctx.time.dt;
          if(b.life <= 0) world.kill(id);
        }
      },
      draw(world, ctx){
        // draw bullets simple if no sprite
        const bullets = world.query([Bullet, Transform, Collider]);
        for(const id of bullets){
          const t = world.get(id, Transform);
          const c = world.get(id, Collider);
          const b = world.get(id, Bullet);
          ctx.gfx.rect(t.pos.x, t.pos.y, c.w, c.h, b.color);
        }
      }
    },{
      // collision damage (uses events "collision" from physics2d)
      update(world, ctx){
        // Listen once via engine.events; but simplest: do nothing here
      }
    }]
  };
}

export function addGun(world,id,{
  key=" ", rate=8, bulletSpeed=650, spread=0.06,
  muzzleX=12, muzzleY=12, bw=8,bh=8, life=2,
  damage=1, auto=false, bulletTags=[],
  color="#ffd166", sound=null, volume=0.35,
  dirFn=null
}={}){
  return world.add(id, Gun, {
    key, rate, bulletSpeed, spread, muzzleX, muzzleY, bw, bh, life, damage, auto,
    bulletTags, color, sound, volume, dirFn,
    cool:0
  });
}

export function addHealth(world,id,{ hp=3, max=hp }={}){
  return world.add(id, Health, { hp, max });
}
