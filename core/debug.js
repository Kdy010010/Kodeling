import { Transform } from "./transform.js";
import { Collider } from "./physics2d.js";

export function DebugPlugin(){
  return {
    onInit(engine){
      engine.debug = { showColliders:false, showJoy:true };
      window.addEventListener("keydown",(e)=>{
        if(e.key==="F1") engine.debug.showColliders = !engine.debug.showColliders;
      });
    },
    systems: [{
      draw(world, ctx){
        const eng = ctx.engine;

        // collider boxes
        if(eng.debug.showColliders){
          const ids = world.query([Transform, Collider]);
          for(const id of ids){
            const t = world.get(id, Transform);
            const c = world.get(id, Collider);
            ctx.gfx.rect(t.pos.x + c.ox, t.pos.y + c.oy, c.w, c.h, "rgba(0,0,0,0)", "rgba(255,255,255,.25)");
          }
        }

        // joystick visual (screen-space)
        if(eng.debug.showJoy && eng.input.joy.active){
          const j = eng.input.joy;
          const c = ctx.gfx.ctx;
          c.setTransform(eng._view.scale,0,0,eng._view.scale, eng._view.offsetX, eng._view.offsetY);
          c.globalAlpha = 0.75;
          c.strokeStyle = "rgba(160,190,255,.75)";
          c.lineWidth = 2;
          c.beginPath(); c.arc(j.baseX, j.baseY, 42, 0, Math.PI*2); c.stroke();
          c.beginPath(); c.arc(j.baseX + j.vx*42, j.baseY + j.vy*42, 18, 0, Math.PI*2); c.stroke();
          c.globalAlpha = 1;
        }
      }
    }]
  };
}
