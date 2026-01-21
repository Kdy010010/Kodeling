import { Vec2 } from "../core/util.js";

export function PathfindingPlugin(){
  return {
    onInit(engine){
      engine.path = {
        astar(grid, start, goal, passable=(v)=>v===0){
          const W = grid[0].length, H = grid.length;
          const key = (x,y)=>`${x},${y}`;
          const inb = (x,y)=>x>=0&&y>=0&&x<W&&y<H;

          const open = new Map();
          const came = new Map();
          const g = new Map();
          const f = new Map();

          const h = (a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

          const sK = key(start.x,start.y);
          open.set(sK, {x:start.x,y:start.y});
          g.set(sK, 0);
          f.set(sK, h(start,goal));

          while(open.size){
            // pick lowest f
            let curK=null, cur=null, best=Infinity;
            for(const [k,n] of open){
              const fv = f.get(k) ?? Infinity;
              if(fv < best){ best=fv; curK=k; cur=n; }
            }
            if(!cur) break;

            if(cur.x===goal.x && cur.y===goal.y){
              // reconstruct
              const path = [new Vec2(cur.x,cur.y)];
              while(came.has(curK)){
                curK = came.get(curK);
                const [x,y] = curK.split(",").map(Number);
                path.push(new Vec2(x,y));
              }
              path.reverse();
              return path;
            }

            open.delete(curK);

            const nbrs = [
              {x:cur.x+1,y:cur.y},{x:cur.x-1,y:cur.y},
              {x:cur.x,y:cur.y+1},{x:cur.x,y:cur.y-1},
            ];
            for(const nb of nbrs){
              if(!inb(nb.x,nb.y)) continue;
              if(!passable(grid[nb.y][nb.x])) continue;

              const nbK = key(nb.x,nb.y);
              const tg = (g.get(curK) ?? Infinity) + 1;
              if(tg < (g.get(nbK) ?? Infinity)){
                came.set(nbK, curK);
                g.set(nbK, tg);
                f.set(nbK, tg + h(nb,goal));
                if(!open.has(nbK)) open.set(nbK, nb);
              }
            }
          }
          return null;
        }
      };
    }
  };
}
