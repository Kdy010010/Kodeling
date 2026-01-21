import { uid } from "./util.js";

export class World {
  constructor(){
    this.entities = new Map(); // id -> {alive, comps: Map(type->data), tags:Set}
    this.systems = [];
  }

  create(tags=[]){
    const id = uid();
    this.entities.set(id, { id, alive:true, comps:new Map(), tags:new Set(tags) });
    return id;
  }

  kill(id){
    const e = this.entities.get(id);
    if(e) e.alive = false;
  }

  cleanup(){
    for(const [id,e] of this.entities){
      if(!e.alive) this.entities.delete(id);
    }
  }

  add(id, type, data){
    const e = this.entities.get(id);
    if(!e) return null;
    e.comps.set(type, data);
    return data;
  }

  get(id, type){
    return this.entities.get(id)?.comps.get(type) ?? null;
  }

  has(id, type){
    return this.entities.get(id)?.comps.has(type) ?? false;
  }

  tag(id, t){ this.entities.get(id)?.tags.add(t); }
  untag(id,t){ this.entities.get(id)?.tags.delete(t); }
  tagged(t){
    const out=[];
    for(const e of this.entities.values()) if(e.alive && e.tags.has(t)) out.push(e.id);
    return out;
  }

  query(types=[], { tagsAll=[], tagsAny=[] } = {}){
    const out=[];
    for(const e of this.entities.values()){
      if(!e.alive) continue;
      let ok=true;
      for(const t of types) if(!e.comps.has(t)) { ok=false; break; }
      if(!ok) continue;
      for(const t of tagsAll) if(!e.tags.has(t)) { ok=false; break; }
      if(!ok) continue;
      if(tagsAny.length){
        let any=false;
        for(const t of tagsAny) if(e.tags.has(t)){ any=true; break; }
        if(!any) ok=false;
      }
      if(!ok) continue;
      out.push(e.id);
    }
    return out;
  }

  use(system){
    this.systems.push(system);
    if(system.onAdd) system.onAdd(this);
    return this;
  }

  step(ctx){
    for(const s of this.systems) s.update?.(this, ctx);
    this.cleanup();
  }

  draw(ctx){
    // draw systems that implement draw
    for(const s of this.systems) s.draw?.(this, ctx);
  }
}
