export class Gfx {
  constructor(ctx){
    this.ctx = ctx;
  }
  clear(color="#0b0f1a", w, h){
    const c=this.ctx;
    c.setTransform(1,0,0,1,0,0);
    c.fillStyle=color;
    c.fillRect(0,0,w,h);
  }
  rect(x,y,w,h,fill="#fff",stroke=null){
    const c=this.ctx;
    c.fillStyle=fill;
    c.fillRect(x,y,w,h);
    if(stroke){ c.strokeStyle=stroke; c.strokeRect(x,y,w,h); }
  }
  circle(x,y,r,fill="#fff",stroke=null){
    const c=this.ctx;
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2);
    c.fillStyle=fill; c.fill();
    if(stroke){ c.strokeStyle=stroke; c.stroke(); }
  }
  line(x1,y1,x2,y2,color="rgba(255,255,255,.5)",w=2){
    const c=this.ctx;
    c.strokeStyle=color; c.lineWidth=w;
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
  }
  text(s,x,y,size=16,color="#fff"){
    const c=this.ctx;
    c.fillStyle=color;
    c.font=`${size}px system-ui`;
    c.fillText(s,x,y);
  }
}
