export const UI = "UI";

export function UIPlugin(){
  return {
    onInit(engine){
      engine.ui = {
        items: [],
        clear(){ engine.ui.items.length=0; },
        text(x,y,s,{size=16,color="#fff"}={}){
          engine.ui.items.push({type:"text",x,y,s,size,color});
        },
        button(x,y,w,h,label,{onClick=null}={}){
          engine.ui.items.push({type:"btn",x,y,w,h,label,onClick,hot:false});
        }
      };
    },
    systems: [{
      update(world, ctx){
        const ui = ctx.engine.ui;
        if(!ui) return;
        const m = ctx.input.mouse;

        for(const it of ui.items){
          if(it.type!=="btn") continue;
          it.hot = (m.x>=it.x && m.x<=it.x+it.w && m.y>=it.y && m.y<=it.y+it.h);
          if(it.hot && m.pressed){
            it.onClick?.();
          }
        }
      },
      draw(world, ctx){
        const ui = ctx.engine.ui;
        if(!ui) return;

        // UI는 화면 좌표(카메라 영향 X)로 그리려면 transform reset:
        const c = ctx.gfx.ctx;
        const eng = ctx.engine;
        c.setTransform(eng._view.scale,0,0,eng._view.scale, eng._view.offsetX, eng._view.offsetY);

        for(const it of ui.items){
          if(it.type==="text"){
            ctx.gfx.text(it.s, it.x, it.y, it.size, it.color);
          } else if(it.type==="btn"){
            ctx.gfx.rect(it.x,it.y,it.w,it.h, it.hot?"rgba(122,167,255,.25)":"rgba(255,255,255,.08)", "rgba(255,255,255,.18)");
            ctx.gfx.text(it.label, it.x+10, it.y+it.h*0.68, 14, "#e9eefc");
          }
        }
      }
    }]
  };
}
