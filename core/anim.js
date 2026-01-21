import { Transform } from "./transform.js";

export const Anim = "Anim";

export function AnimPlugin(){
  return {
    systems: [{
      update(world, ctx){
        const ids = world.query([Anim]);
        for(const id of ids){
          const a = world.get(id, Anim);
          if(!a.playing) continue;
          a.t += ctx.time.dt;
          const frameTime = 1 / Math.max(1, a.fps);
          while(a.t >= frameTime){
            a.t -= frameTime;
            a.frame++;
            if(a.frame >= a.frames){
              if(a.loop) a.frame = 0;
              else { a.frame = a.frames-1; a.playing=false; }
            }
          }
        }
      },
      draw(world, ctx){
        const { engine } = ctx;
        const ids = world.query([Transform, Anim]);
        for(const id of ids){
          const t = world.get(id, Transform);
          const a = world.get(id, Anim);
          const im = engine.assets.images.get(a.sheet);
          if(!im) continue;

          const fx = a.frame % a.cols;
          const fy = Math.floor(a.frame / a.cols);
          const sx = fx * a.fw;
          const sy = fy * a.fh;

          ctx.gfx.ctx.save();
          ctx.gfx.ctx.translate(t.pos.x + a.w/2, t.pos.y + a.h/2);
          ctx.gfx.ctx.rotate(t.rot || 0);
          ctx.gfx.ctx.scale(t.scale.x, t.scale.y);
          ctx.gfx.ctx.drawImage(im, sx, sy, a.fw, a.fh, -a.w/2, -a.h/2, a.w, a.h);
          ctx.gfx.ctx.restore();
        }
      }
    }]
  };
}

export function addAnim(world,id,{
  sheet, fw, fh, cols,
  frames, fps=10, loop=true,
  w=fw, h=fh
}){
  return world.add(id, Anim, { sheet, fw, fh, cols, frames, fps, loop, w, h, frame:0, t:0, playing:true });
}
