barChart=function(c,data,color='#7b8794'){
  const [ctx,w,h]=resizeCanvas(c,+c.getAttribute('height')||240);
  const pad={l:48,r:46,t:28,b:46};
  const rawMin=Math.min(0,...data),rawMax=Math.max(0,...data);
  const range=Math.max(1,rawMax-rawMin);
  const min=rawMin<0?rawMin-range*.08:0;
  const max=rawMax+range*.10;
  const plotW=w-pad.l-pad.r,plotH=h-pad.t-pad.b,slot=plotW/data.length;
  const y=v=>pad.t+(max-v)/(max-min)*plotH,z=y(0);
  ctx.clearRect(0,0,w,h);
  ctx.font='10px sans-serif';
  ctx.fillStyle='#6b7280';
  ctx.textAlign='left';
  ctx.fillText('營業利潤（RMB bn）',pad.l,12);
  for(let i=0;i<=4;i++){
    const yy=pad.t+i*plotH/4;
    const val=max-(max-min)*i/4;
    ctx.strokeStyle='#e5e7eb';
    ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();
    ctx.fillStyle='#6b7280';ctx.textAlign='right';ctx.fillText(val.toFixed(0),pad.l-6,yy+3);
  }
  ctx.strokeStyle='#9ca3af';
  ctx.beginPath();ctx.moveTo(pad.l,z);ctx.lineTo(w-pad.r,z);ctx.stroke();
  data.forEach((v,i)=>{
    const bw=Math.max(4,slot*.58),x=pad.l+i*slot+(slot-bw)/2,yy=v>=0?y(v):z,bh=Math.abs(y(v)-z);
    ctx.fillStyle=color;ctx.fillRect(x,yy,bw,bh);
  });
  ctx.fillStyle='#6b7280';ctx.font='10px sans-serif';ctx.textAlign='center';
  hist.forEach((r,i)=>{if(i%2===0||hist.length<12)ctx.fillText(r[0],pad.l+i*slot+slot/2,h-16)});
};
draw();
