import { Transform } from "./transform.js";

export const Sprite = "Sprite";

export function SpritePlugin(){
  return {
    systems: [{
      draw(world, ctx){
        const { engine } = ctx;
        const ids = world.query([Transform, Sprite]);
        for(const id of ids){
          const t = world.get(id, Transform);
          const s = world.get(id, Sprite);
          const im = engine.assets.images.get(s.image);
          if(!im) continue;
          const x=t.pos.x, y=t.pos.y;
          const w=s.w ?? im.width, h=s.h ?? im.height;
          ctx.gfx.ctx.save();
          ctx.gfx.ctx.translate(x + w/2, y + h/2);
          ctx.gfx.ctx.rotate(t.rot || 0);
          ctx.gfx.ctx.scale(t.scale.x, t.scale.y);
          ctx.gfx.ctx.drawImage(im, -w/2, -h/2, w, h);
          ctx.gfx.ctx.restore();
        }
      }
    }]
  };
}

export function addSprite(world, id, {image, w=null, h=null}){
  return world.add(id, Sprite, { image, w, h });
}
