import { Transform } from "./transform.js";
import { Vec2, clamp } from "../core/util.js";

export const ParticleEmitter = "ParticleEmitter";
export const Particle = "Particle";

export function ParticlesPlugin(){
  return {
    systems: [{
      update(world, ctx){
        // emitters
        const ems = world.query([ParticleEmitter, Transform]);
        for(const id of ems){
          const e = world.get(id, ParticleEmitter);
          const t = world.get(id, Transform);
          e.acc += ctx.time.dt * e.rate;
          while(e.acc >= 1){
            e.acc -= 1;
            const pid = world.create(["particle"]);
            const ang = (Math.random()*2-1)*e.spread + e.angle;
            const sp = e.speed * (0.6 + Math.random()*0.8);
            world.add(pid, Transform, { pos:new Vec2(t.pos.x, t.pos.y), scale:new Vec2(1,1), rot:0 });
            world.add(pid, Particle, {
              vel:new Vec2(Math.cos(ang)*sp, Math.sin(ang)*sp),
              life: e.life*(0.6+Math.random()*0.8),
              r: e.r*(0.6+Math.random()*0.8),
              color: e.color
            });
          }
        }

        // particles
        const ps = world.query([Particle, Transform]);
        for(const id of ps){
          const p = world.get(id, Particle);
          const t = world.get(id, Transform);
          p.life -= ctx.time.dt;
          if(p.life <= 0){ world.kill(id); continue; }
          t.pos.x += p.vel.x * ctx.time.dt;
          t.pos.y += p.vel.y * ctx.time.dt;
          p.vel.mul(p.drag ?? 0.92);
        }
      },
      draw(world, ctx){
        const ps = world.query([Particle, Transform]);
        for(const id of ps){
          const p = world.get(id, Particle);
          const t = world.get(id, Transform);
          ctx.gfx.circle(t.pos.x, t.pos.y, Math.max(1,p.r), p.color);
        }
      }
    }]
  };
}

export function addEmitter(world,id,{
  rate=20, life=0.4, speed=220, angle=0, spread=Math.PI,
  r=3, color="rgba(255,255,255,.7)"
}={}){
  return world.add(id, ParticleEmitter, { rate, life, speed, angle, spread, r, color, acc:0 });
}
