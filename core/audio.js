export function AudioPlugin(){
  return {
    onInit(engine){
      engine.audio = {
        async load(sounds){ await engine.loadSounds(sounds); },
        play(name, opt){ engine.play(name,opt); }
      };
    }
  };
}
