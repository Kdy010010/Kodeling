import { World } from "./ecs.js";
import { Input } from "./input.js";
import { Gfx } from "./gfx.js";
import { Events } from "./events.js";
import { clamp, lerp, now } from "./util.js";

export class Engine {
  constructor(canvas, { width=960, height=540, bg="#0b0f1a", pixelPerfect=false } = {}){
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d",{alpha:false});
    this.gfx = new Gfx(this.ctx);

    this.W = width; this.H = height;
    this.bg = bg;
    this.pixelPerfect = pixelPerfect;

    this.world = new World();
    this.events = new Events();

    this.camera = { x:0, y:0, zoom:1 };
    this.time = { t:0, dt:0, fps:0 };

    this._view = { rect:null, offsetX:0, offsetY:0, scale:1, W:this.W, H:this.H };

    this.input = new Input(canvas, ()=>this._view);

    this.assets = { images:new Map(), sounds:new Map() };

    this._resize();
    window.addEventListener("resize", ()=>this._resize(), {passive:true});
  }

  use(plugin){
    plugin?.onInit?.(this);
    if(plugin?.systems){
      for(const sys of plugin.systems) this.world.use(sys);
    }
    return this;
  }

  scene(name, fn){
    if(!this._scenes) this._scenes = new Map();
    this._scenes.set(name, fn);
    return this;
  }

  go(name){
    const fn = this._scenes?.get(name);
    if(!fn) throw new Error(`Scene not found: ${name}`);
    // new World for clean scene
    this.world = new World();
    // keep events/input/assets/camera
    fn(this);
    this._sceneName = name;
    return this;
  }

  async loadImages(dict){
    const entries = Object.entries(dict||{});
    await Promise.all(entries.map(([k,url])=>new Promise((res,rej)=>{
      const im=new Image();
      im.onload=()=>{this.assets.images.set(k,im); res();};
      im.onerror=()=>rej(new Error(`Image load fail: ${k}`));
      im.src=url;
    })));
  }

  async loadSounds(dict){
    const entries = Object.entries(dict||{});
    await Promise.all(entries.map(([k,url])=>new Promise((res,rej)=>{
      const a=new Audio();
      a.oncanplaythrough=()=>{this.assets.sounds.set(k,a); res();};
      a.onerror=()=>rej(new Error(`Sound load fail: ${k}`));
      a.src=url; a.load();
    })));
  }

  play(name,{volume=0.7,rate=1}={}){
    const a=this.assets.sounds.get(name);
    if(!a) return;
    const inst=a.cloneNode();
    inst.volume=Math.max(0,Math.min(1,volume));
    inst.playbackRate=rate;
    inst.play().catch(()=>{});
  }

  start(){
    let last = now();
    const loop = (t)=>{
      const dt = clamp((t-last)/1000, 0, 0.05);
      last = t;
      this.time.t += dt;
      this.time.dt = dt;
      this.time.fps = lerp(this.time.fps, 1/Math.max(dt,1e-6), 0.08);

      this.input.frameReset();

      // update systems
      this.world.step(this._ctx());

      // draw
      this.gfx.clear(this.bg, this.canvas.width, this.canvas.height);
      this._beginCamera();
      this.world.draw(this._ctx(true));
      this._endCamera();

      // HUD
      this.ctx.setTransform(1,0,0,1,0,0);
      this.ctx.fillStyle="rgba(255,255,255,.75)";
      this.ctx.font="12px system-ui";
      this.ctx.fillText(`Kodeling v1 | scene=${this._sceneName??"-"} | ents=${this.world.entities.size} | fps≈${this.time.fps.toFixed(0)}`, 12, 18);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _ctx(isDraw=false){
    return {
      engine:this,
      input:this.input,
      events:this.events,
      assets:this.assets,
      camera:this.camera,
      time:this.time,
      gfx:this.gfx,
      view:this._view,
      isDraw
    };
  }

  _resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = window.innerWidth, cssH = window.innerHeight;

    const scale = Math.min(cssW/this.W, cssH/this.H);
    const realW = Math.floor(cssW*dpr);
    const realH = Math.floor(cssH*dpr);

    this.canvas.width = realW;
    this.canvas.height = realH;

    const viewW = this.W*scale*dpr;
    const viewH = this.H*scale*dpr;

    const offsetX = Math.floor((realW - viewW)/2);
    const offsetY = Math.floor((realH - viewH)/2);

    this._view.rect = this.canvas.getBoundingClientRect();
    this._view.offsetX = offsetX;
    this._view.offsetY = offsetY;
    this._view.scale = scale*dpr;
    this._view.W = this.W;
    this._view.H = this.H;

    this.ctx.imageSmoothingEnabled = !this.pixelPerfect;
  }

  _beginCamera(){
    const { offsetX, offsetY, scale } = this._view;
    const { x, y, zoom } = this.camera;
    this.ctx.setTransform(scale*zoom,0,0,scale*zoom, offsetX - x*scale*zoom, offsetY - y*scale*zoom);
    if(this.pixelPerfect) this.ctx.imageSmoothingEnabled=false;
  }
  _endCamera(){ this.ctx.setTransform(1,0,0,1,0,0); }
}
