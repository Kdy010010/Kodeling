export function SavePlugin({ prefix="kodeling" } = {}){
  return {
    onInit(engine){
      engine.save = {
        set(key, val){
          localStorage.setItem(`${prefix}:${key}`, JSON.stringify(val));
        },
        get(key, def=null){
          const s = localStorage.getItem(`${prefix}:${key}`);
          if(!s) return def;
          try { return JSON.parse(s); } catch { return def; }
        },
        del(key){ localStorage.removeItem(`${prefix}:${key}`); }
      };
    }
  };
}
