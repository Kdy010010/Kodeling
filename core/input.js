import { clamp } from "./util.js";

export class Input {
  constructor(canvas, getView){
    this._keys = new Map();
    this._pressed = new Set();
    this._released = new Set();

    this.mouse = { x:0, y:0, down:false, pressed:false, released:false };
    this.joy = { active:false, id:null, baseX:0, baseY:0, x:0, y:0, vx:0, vy:0, dead:0.12 };

    const toView = (clientX, clientY) => {
      const { rect, offsetX, offsetY, scale } = getView();
      const px = (clientX - rect.left) * (canvas.width / rect.width);
      const py = (clientY - rect.top) * (canvas.height / rect.height);
      return { x: (px - offsetX) / scale, y: (py - offsetY) / scale };
    };

    window.addEventListener("keydown",(e)=>{
      if(!this._keys.get(e.key)) this._pressed.add(e.key);
      this._keys.set(e.key,true);
    });
    window.addEventListener("keyup",(e)=>{
      this._keys.set(e.key,false);
      this._released.add(e.key);
    });

    canvas.addEventListener("pointerdown",(e)=>{
      canvas.setPointerCapture(e.pointerId);
      const p = toView(e.clientX, e.clientY);
      this.mouse.x=p.x; this.mouse.y=p.y;
      this.mouse.down=true; this.mouse.pressed=true;

      if(p.x < getView().W * 0.45){
        this.joy.active=true;
        this.joy.id=e.pointerId;
        this.joy.baseX=p.x; this.joy.baseY=p.y;
        this.joy.x=p.x; this.joy.y=p.y;
      }
    },{passive:true});

    canvas.addEventListener("pointermove",(e)=>{
      const p = toView(e.clientX, e.clientY);
      this.mouse.x=p.x; this.mouse.y=p.y;

      if(this.joy.active && e.pointerId===this.joy.id){
        this.joy.x=p.x; this.joy.y=p.y;
        const dx = p.x - this.joy.baseX;
        const dy = p.y - this.joy.baseY;
        const maxR = 80;
        let nx = clamp(dx / maxR, -1, 1);
        let ny = clamp(dy / maxR, -1, 1);
        const mag = Math.hypot(nx,ny);
        const dead = this.joy.dead;
        if(mag < dead){ this.joy.vx=0; this.joy.vy=0; }
        else{
          const s = (mag - dead) / (1 - dead);
          this.joy.vx = (nx / mag) * s;
          this.joy.vy = (ny / mag) * s;
        }
      }
    },{passive:true});

    const up=(e)=>{
      const p = toView(e.clientX, e.clientY);
      this.mouse.x=p.x; this.mouse.y=p.y;
      this.mouse.down=false; this.mouse.released=true;

      if(this.joy.active && e.pointerId===this.joy.id){
        this.joy.active=false; this.joy.id=null;
        this.joy.vx=0; this.joy.vy=0;
      }
    };
    canvas.addEventListener("pointerup",up,{passive:true});
    canvas.addEventListener("pointercancel",up,{passive:true});
  }

  key(k){ return !!this._keys.get(k); }
  pressed(k){ return this._pressed.has(k); }
  released(k){ return this._released.has(k); }

  frameReset(){
    this._pressed.clear();
    this._released.clear();
    this.mouse.pressed=false;
    this.mouse.released=false;
  }
}
