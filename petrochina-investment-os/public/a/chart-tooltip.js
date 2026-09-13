(()=>{
  const tooltip=document.createElement('div');
  tooltip.id='chartTooltip';
  Object.assign(tooltip.style,{
    position:'fixed',zIndex:'9999',display:'none',pointerEvents:'none',
    background:'rgba(17,24,39,.96)',color:'#fff',padding:'10px 12px',
    borderRadius:'10px',boxShadow:'0 8px 24px rgba(0,0,0,.2)',
    font:'12px/1.5 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    minWidth:'180px',whiteSpace:'nowrap'
  });
  document.body.appendChild(tooltip);

  const configs={
    groupBrent:{label:'扣非盈利',values:()=>hist.map(r=>r[5]),color:'#2f5d8a'},
    upstreamBrent:{label:'上游營業利潤',values:()=>hist.map(r=>r[1]),color:'#347f6b'}
  };

  function hide(){tooltip.style.display='none';}
  function moveTooltip(ev){
    const gap=14;
    let left=ev.clientX+gap,top=ev.clientY+gap;
    tooltip.style.display='block';
    const box=tooltip.getBoundingClientRect();
    if(left+box.width>window.innerWidth-8) left=ev.clientX-box.width-gap;
    if(top+box.height>window.innerHeight-8) top=ev.clientY-box.height-gap;
    tooltip.style.left=Math.max(8,left)+'px';
    tooltip.style.top=Math.max(8,top)+'px';
  }

  function attach(canvasId){
    const canvas=document.getElementById(canvasId),cfg=configs[canvasId];
    if(!canvas||!cfg)return;
    const show=(ev)=>{
      const rect=canvas.getBoundingClientRect();
      const x=ev.clientX-rect.left,y=ev.clientY-rect.top;
      const width=canvas.clientWidth||rect.width;
      const height=+canvas.getAttribute('height')||330;
      const pad={l:48,r:46,t:20,b:46};
      const plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b;
      if(x<pad.l||x>width-pad.r||y<pad.t||y>pad.t+plotH){hide();return;}
      const slot=plotW/hist.length;
      const idx=Math.max(0,Math.min(hist.length-1,Math.floor((x-pad.l)/slot)));
      const quarter=hist[idx][0],bar=cfg.values()[idx],oil=brent[idx];
      tooltip.innerHTML=`<div style="font-weight:700;font-size:13px;margin-bottom:4px">${quarter}</div>`+
        `<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cfg.color};margin-right:6px"></span>${cfg.label}: <b>RMB ${bar.toFixed(2)}bn</b></div>`+
        `<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#a96d42;margin-right:6px"></span>Brent: <b>US$${oil.toFixed(2)}/bbl</b></div>`;
      moveTooltip(ev);
    };
    canvas.style.cursor='crosshair';
    canvas.addEventListener('pointermove',show);
    canvas.addEventListener('pointerdown',show);
    canvas.addEventListener('pointerleave',hide);
    canvas.addEventListener('pointercancel',hide);
  }
  attach('groupBrent');
  attach('upstreamBrent');
})();
