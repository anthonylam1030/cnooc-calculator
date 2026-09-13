(()=>{
  function drawDualTens(canvas,bars,line,barColor){
    const ratio=devicePixelRatio||1;
    const width=canvas.clientWidth||900;
    const height=+canvas.getAttribute('height')||330;
    canvas.width=width*ratio;
    canvas.height=height*ratio;
    const ctx=canvas.getContext('2d');
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const pad={l:48,r:46,t:20,b:46};
    const plotW=width-pad.l-pad.r;
    const plotH=height-pad.t-pad.b;
    const slot=plotW/hist.length;
    const leftMin=0,leftMax=60,rightMin=60,rightMax=120,steps=6;
    const yL=v=>pad.t+(leftMax-v)/(leftMax-leftMin)*plotH;
    const yR=v=>pad.t+(rightMax-v)/(rightMax-rightMin)*plotH;
    ctx.clearRect(0,0,width,height);
    ctx.font='10px sans-serif';
    ctx.fillStyle='#6b7280';
    ctx.strokeStyle='#e5e7eb';
    for(let i=0;i<=steps;i++){
      const y=pad.t+i*plotH/steps;
      const leftLabel=leftMax-i*10;
      const rightLabel=rightMax-i*10;
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();
      ctx.textAlign='right';ctx.fillText(String(leftLabel),pad.l-6,y+3);
      ctx.textAlign='left';ctx.fillText(String(rightLabel),width-pad.r+6,y+3);
    }
    bars.forEach((v,i)=>{
      const bw=Math.max(7,slot*.52),x=pad.l+i*slot+(slot-bw)/2,y=yL(v);
      ctx.fillStyle=barColor;ctx.fillRect(x,y,bw,pad.t+plotH-y);
    });
    ctx.strokeStyle='#a96d42';ctx.lineWidth=2.5;ctx.beginPath();
    line.forEach((v,i)=>{const x=pad.l+i*slot+slot/2,y=yR(v);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
    ctx.fillStyle='#a96d42';line.forEach((v,i)=>{const x=pad.l+i*slot+slot/2,y=yR(v);ctx.beginPath();ctx.arc(x,y,2.6,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle='#6b7280';ctx.textAlign='center';
    hist.forEach((r,i)=>{if(i%2===0||hist.length<12)ctx.fillText(r[0],pad.l+i*slot+slot/2,height-16)});
  }
  function redrawTens(){
    const group=document.querySelector('#groupBrent');
    const upstream=document.querySelector('#upstreamBrent');
    if(group) drawDualTens(group,hist.map(r=>r[5]),brent,'#2f5d8a');
    if(upstream) drawDualTens(upstream,hist.map(r=>r[1]),brent,'#347f6b');
  }
  setTimeout(redrawTens,0);
  window.addEventListener('resize',()=>{clearTimeout(window._axisTens);window._axisTens=setTimeout(redrawTens,140)});
})();
