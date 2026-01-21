import { Transform } from "./transform.js";
import { Collider } from "./physics2d.js";

export const Tilemap = "Tilemap";

export function TilemapPlugin(){
  return {
    onInit(engine){
      engine.tile = {
        solid: (v)=>v===1,
        palette: new Map([
          [0, "rgba(255,255,255,.03)"],
          [1, "rgba(255,255,255,.10)"],
          [2, "rgba(122,167,255,.22)"],
          [3, "rgba(255,107,154,.22)"],
        ])
      };
    },
    systems: [{
      draw(world, ctx){
        const ids = world.query([Tilemap]);
        for(const id of ids){
          const tm = world.get(id, Tilemap);
          const col = world.get(id, Collider);
          const t = world.get(id, Transform);

          const ox = t?.pos.x ?? 0;
          const oy = t?.pos.y ?? 0;
          const ts = tm.tileSize;

          for(let y=0;y<tm.h;y++){
            for(let x=0;x<tm.w;x++){
              const v = tm.data[y][x] ?? 0;
              if(v===0 && !tm.drawEmpty) continue;
              const fill = ctx.engine.tile.palette.get(v) ?? "rgba(255,255,255,.05)";
              ctx.gfx.rect(ox + x*ts, oy + y*ts, ts, ts, fill, tm.grid ? "rgba(255,255,255,.04)" : null);
            }
          }
        }
      }
    }]
  };
}

export function addTilemap(world,id,{ w,h,tileSize=32,data=null, drawEmpty=false, grid=false }){
  if(!data){
    data = Array.from({length:h},()=>Array.from({length:w},()=>0));
  }
  return world.add(id, Tilemap, { w,h,tileSize,data, drawEmpty, grid });
}
