import { Vec2 } from "../core/util.js";

export const Transform = "Transform";

export function TransformPlugin(){
  return {
    onInit(engine){},
    systems: [{
      update(world, ctx){
        // ensure every entity has Transform if needed is user-driven (optional)
      }
    }]
  };
}

export function addTransform(world, id, {x=0,y=0, sx=1, sy=1, rot=0}={}){
  return world.add(id, Transform, { pos:new Vec2(x,y), scale:new Vec2(sx,sy), rot });
}
