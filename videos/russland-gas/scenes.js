/* Szenen für "Was wäre, wenn Deutschland wieder Gas aus Russland importieren würde?"
   Ausgewogen: Vorteile und Risiken, Fakten mit Jahreszahl. (t, d, S, h) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};
const tag=(txt,col,w=300)=>`<rect x="${-w/2}" y="-36" width="${w}" height="72" rx="16" fill="#141836" stroke="${col}" stroke-width="5"/>`+T(0,14,txt,{size:30,font:'Mono',w:700,fill:col});
const GAS='#4ea8ff';
function flame(x,y,s=1,t=0,col=GAS,on=1){ const f=1+0.1*Math.sin(t*20); return on<=0?'':`<g transform="translate(${x},${y}) scale(${s*on})"><path d="M0,${-90*f} C40,-50 50,-10 0,20 C-50,-10 -40,-50 0,${-90*f}Z" fill="${col}" filter="url(#glowS)"/><path d="M0,${-50*f} C18,-30 22,-6 0,10 C-22,-6 -18,-30 0,${-50*f}Z" fill="#dff1ff"/></g>`; }
// stilisierte Karte: Deutschland links, Ostsee Mitte, Russland rechts (keine exakten Grenzen)
function balticMap(t,flow=1,o={}){
  let g=`<rect x="60" y="430" width="960" height="640" rx="30" fill="#0f2a4a"/>`;
  g+=`<path d="M60,700 C160,640 240,720 300,760 C340,900 260,1000 200,1070 L60,1070Z" fill="#2b3a6e"/>`+T(150,960,'DEUTSCHLAND',{size:24,font:'Mono',w:700,fill:PAL.yellow});
  g+=`<path d="M1020,430 L820,430 C760,520 800,620 760,700 C820,800 760,940 840,1070 L1020,1070Z" fill="#4a2a3a"/>`+T(915,900,'RUSSLAND',{size:24,font:'Mono',w:700,fill:'#ff8fa3'});
  g+=`<path d="M380,430 C420,520 520,560 560,500 C600,440 640,430 660,430Z" fill="#2a3560"/>`+T(560,700,'OSTSEE',{size:26,font:'Mono',w:700,fill:'#8fb8e8',op:.8});
  const path='M800,760 C680,820 520,840 300,780';
  g+=`<path d="${path}" stroke="#6c7090" stroke-width="18" fill="none" stroke-linecap="round"/><path d="${path}" stroke="#9aa0c0" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  if(flow>0) g+=`<path d="${path}" stroke="${o.col||GAS}" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="20 30" stroke-dashoffset="${t*120}" opacity="${flow}" filter="url(#glowS)"/>`;
  return g; }
function pie(x,y,r,pct,k,col=PAL.red){ const a=2*Math.PI*pct/100*k, x1=x+r*Math.sin(a), y1=y-r*Math.cos(a), big=pct*k>50?1:0;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#2a3060"/>`+(k>0?`<path d="M${x},${y} L${x},${y-r} A${r},${r} 0 ${big} 1 ${x1},${y1}Z" fill="${col}"/>`:'')+`<circle cx="${x}" cy="${y}" r="${r*0.45}" fill="#141836"/>`; }
function factory(x,y,s=1,t=0,smoke=1){ let g=`<g transform="translate(${x},${y}) scale(${s})"><path d="M-220,0 V-160 L-140,-110 V-160 L-60,-110 V-160 L20,-110 V-200 H80 V-110 H220 V0Z" fill="#3b4180"/>`;
  [[-180,-120],[-100,-120],[-20,-120]].forEach(([wx,wy])=>g+=`<rect x="${wx}" y="${wy+40}" width="50" height="40" rx="4" fill="#ffd98a" opacity=".85"/>`);
  for(let i=0;i<4;i++){ const p=((t*0.4)+i/4)%1; g+=`<circle cx="${50+Math.sin(p*6+i)*12}" cy="${-210-p*200}" r="${20+p*40}" fill="#c9cdf0" opacity="${(1-p)*0.5*smoke}"/>`; }
  return g+'</g>'; }
function euFlag(x,y,s=1,t=0){ let g=`<g transform="translate(${x},${y}) scale(${s})"><rect x="-200" y="-130" width="400" height="260" rx="10" fill="#1f3b9a"/>`;
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2-Math.PI/2; g+=T(Math.cos(a)*90,Math.sin(a)*90+12,'★',{size:34,fill:'#ffd23f'}); }
  return g+'</g>'; }
function valve(x,y,s=1,rot=0,col='#c9cdf0'){ return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-200" y="-24" width="400" height="48" rx="12" fill="#6c7090"/><rect x="-14" y="-90" width="28" height="70" fill="#8a8fb0"/>
  <g transform="translate(0,-100) rotate(${rot})"><circle r="56" fill="none" stroke="${col}" stroke-width="14"/><path d="M-56,0 H56 M0,-56 V56" stroke="${col}" stroke-width="10"/></g></g>`; }

const SCENES={
hook(t,d,S,h){
  const g=h.wt('gas'), flow=h.p(t,g-0.3,g+0.4);
  let s=balticMap(t,flow);
  s+=flame(300,700,0.7*E.outBack(h.p(t,g,g+0.4)),t);
  return s;
},
cheap(t,d,S,h){
  const fa=h.wt('fallen'), bi=h.wt('billiger');
  let s=`<path d="M200,1000 L200,700 L420,520 L640,700 L640,1000Z" fill="#2b3360"/><rect x="380" y="850" width="90" height="150" fill="#4b2f1a"/><rect x="240" y="740" width="110" height="90" fill="#ffd98a" opacity=".85"/>`;
  s+=G(`<rect x="-90" y="-40" width="180" height="80" rx="10" fill="#d9dbf0"/>`+[0,1,2,3,4].map(i=>`<rect x="${-80+i*34}" y="-34" width="22" height="68" rx="6" fill="#b9bdd6"/>`).join('')+flame(0,-60,0.4,t,PAL.yellow),{x:540,y:960});
  s+=person({x:820,y:1200,s:0.85,...ME,mood:'happy'});
  const k=E.outBack(h.p(t,fa-0.1,fa+0.3));
  if(k>0) s+=G(`<path d="M0,-120 V80 M-60,20 L0,90 L60,20" stroke="${PAL.green}" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowS)"/>`+T(0,150,'PREISE',{size:30,font:'Mono',w:700,fill:PAL.green}),{x:840,y:560,s:k});
  if(t>bi) for(let i=0;i<5;i++){ const p=h.p(t,bi+i*0.1,bi+i*0.1+0.6); s+=G(coin(0.18,'€',Math.cos(t*6+i)),{x:300+i*60,y:520-p*40,op:p}); }
  return s;
},
industry(t,d,S,h){
  const au=h.wt('ausland'), hi=h.wt('hier'), leave=h.p(t,au-0.2,au+0.5)*(1-h.p(t,hi-0.4,hi));
  let s=factory(540+leave*260,1000,1.2,t,1);
  if(leave>0.05) s+=G(`<path d="M0,0 H160 M110,-40 L160,0 L110,40" stroke="${PAL.red}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`+T(80,80,'AUSLAND?',{size:28,font:'Mono',w:700,fill:PAL.red}),{x:760,y:560,op:leave});
  const kh=E.outBack(h.p(t,hi-0.05,hi+0.25)); if(kh>0) s+=G(stamp('BLEIBT',PAL.green,0.8,-10),{x:540,y:620,s:lerp(2,1,kh)});
  return s;
},
price(t,d,S,h){
  const pr=h.wt('preis');
  let s=G(`<path d="M-160,-90 H100 L200,0 L100,90 H-160Z" fill="#f3e2b8"/><circle cx="-110" cy="0" r="22" fill="#141836"/>`+T(40,26,'? €',{size:80,fill:'#22264a'}),{x:540,y:760,s:E.outBack(h.p(t,0.05,0.35))*(1+0.06*h.pulse(t,'preis',0.5)),r:-8});
  if(t>pr) for(let i=0;i<3;i++){ const p=((t-pr)*0.8+i/3)%1; s+=ring(540,760,240+p*200,PAL.red,(1-p)*0.5,4); }
  return s;
},
history(t,d,S,h){
  const k=E.inOut(h.p(t,0.3,d-0.4));
  let s=pie(540,760,280,55,k);
  s+=T(540,780,`${Math.round(55*k)} %`,{size:80,fill:'#fff'});
  if(k>0.9){ s+=G(tag('RUSSLAND',PAL.red,260),{x:830,y:520,s:0.8}); s+=G(tag('ANDERE',GAS,240),{x:250,y:1080,s:0.8}); }
  return s;
},
decision(t,d,S,h){
  const an=h.wt('angriff'), en=h.wt('entschied'), ni=h.wt('gestoppt');
  let s=balticMap(t,1-h.p(t,en,en+0.8),{col:GAS});
  s+=`<rect x="60" y="430" width="960" height="640" rx="30" fill="#000" opacity="${0.25*h.p(t,an,an+0.5)}"/>`;
  // zweite Leitung (Nord Stream 2) parallel
  s+=`<path d="M800,800 C680,860 520,880 300,820" stroke="#6c7090" stroke-width="14" fill="none" stroke-linecap="round" opacity=".9"/>`+T(560,900,'NORD STREAM 2',{size:22,font:'Mono',w:700,fill:'#c9cdf0'});
  const ks=h.p(t,ni-0.2,ni+0.15); if(ks>0) s+=G(stamp('GESTOPPT',PAL.red,0.95,-10),{x:560,y:820,s:lerp(2.2,1,E.outBack(ks)),op:clamp(ks*3,0,1)});
  const ke=E.outBack(h.p(t,en-0.1,en+0.25)); if(ke>0) s+=G(tag('WEG VOM RUSSISCHEN GAS',PAL.yellow,560),{x:540,y:520,s:ke*0.85});
  return s;
},
crisis(t,d,S,h){
  const k=E.inOut(h.p(t,0.2,d-0.3)), we=h.wt('weniger');
  let s=`<rect x="140" y="440" width="800" height="560" rx="20" fill="#141836" stroke="#353b6e" stroke-width="4"/>`;
  for(let i=1;i<5;i++) s+=`<line x1="160" y1="${440+i*112}" x2="920" y2="${440+i*112}" stroke="#262b55" stroke-width="3"/>`;
  let dd='M170,960'; const N=60; for(let i=1;i<=N;i++){ const f=i/N; if(f>k) break; const v=f<0.55?20+f*60:20+33+(f-0.55)/0.45*(320*Math.pow((f-0.55)/0.45,1.6)); dd+=` L${170+f*740},${960-v*1.45}`; }
  s+=`<path d="${dd}" stroke="${PAL.red}" stroke-width="8" fill="none" stroke-linejoin="round" filter="url(#glowS)"/>`;
  s+=T(170,1040,'2021',{size:22,font:'Mono',w:700,fill:'#8d93bd',anchor:'start'})+T(910,1040,'AUG 2022',{size:22,font:'Mono',w:700,fill:'#8d93bd',anchor:'end'});
  s+=valve(540,1150,0.6,-t*120*h.p(t,we-0.2,we+0.6),'#c9cdf0');
  return s;
},
pipes(t,d,S,h){
  const ex=h.wt('explosionen'), ei=h.wt('eine'), k=h.p(t,ex-0.1,ex+0.5);
  let s=`<rect x="60" y="440" width="960" height="700" rx="30" fill="#0b2340"/>`;
  for(let i=0;i<14;i++){ const r=rng(i+2); const p=((t*0.3)+r())%1; s+=`<circle cx="${100+r()*880}" cy="${1120-p*680}" r="${4+r()*6}" fill="#8fb8e8" opacity="${0.3*(1-p)}"/>`; }
  const labs=['NS1 · A','NS1 · B','NS2 · A','NS2 · B'];
  [0,1,2,3].forEach(i=>{ const x=210+i*220, broken=i<3, kk=broken?k:0;
    s+=`<g transform="translate(${x},800)"><circle r="85" fill="#6c7090"/><circle r="62" fill="#0b2340"/>`;
    if(broken) s+=`<path d="M-90,-30 L-20,10 L-50,40 L30,60 L90,20" stroke="#0b2340" stroke-width="${16*kk}" fill="none"/>`+(kk>0?`<circle r="${100*kk}" fill="${PAL.red}" opacity="${0.25*(1-kk)}"/>`:'');
    s+=`</g>`+T(x,940,labs[i],{size:22,font:'Mono',w:700,fill:'#c9cdf0'});
    if(!broken && t>ei) s+=`<circle cx="${x}" cy="800" r="100" fill="none" stroke="${PAL.yellow}" stroke-width="6" opacity="${0.6+0.4*Math.sin(t*6)}"/>`+T(x,1010,'INTAKT',{size:24,font:'Mono',w:700,fill:PAL.yellow});
    if(broken && kk>0.5) s+=T(x,1010,'ZERSTÖRT',{size:22,font:'Mono',w:700,fill:PAL.red,op:kk});
  });
  return s;
},
eu(t,d,S,h){
  const st=h.wt('stoppen');
  let s=euFlag(540,640,1.3,t);
  const k=E.outBack(h.p(t,h.wt('2027')-0.2,h.wt('2027')+0.2)); if(k>0) s+=G(tag('ENDE 2027',PAL.yellow,300),{x:540,y:940,s:k});
  const ks=h.p(t,st-0.05,st+0.2); if(ks>0) s+=G(stamp('STOPP',PAL.red,0.8,-12),{x:540,y:1080,s:lerp(2,1,E.outBack(ks))});
  return s;
},
sides(t,d,S,h){
  const be=h.wt('befürworter'), kr=h.wt('kritiker');
  const k1=E.outBack(h.p(t,be-0.1,be+0.25)), k2=E.outBack(h.p(t,kr-0.1,kr+0.25));
  let s='';
  if(k1>0) s+=panel(280,780,440,640,factory(0,120,0.75,t)+flame(0,-170,0.6,t,PAL.green)+T(0,260,'BILLIGE',{size:34,fill:PAL.green})+T(0,300,'ENERGIE',{size:34,fill:PAL.green}),{s:k1,col:PAL.green});
  if(k2>0) s+=panel(800,780,440,640,valve(0,60,0.7,Math.sin(t*3)*30,PAL.red)+`<path d="M-90,-170 q90,-70 180,0" stroke="${PAL.red}" stroke-width="14" fill="none"/>`+T(0,-120,'✋',{size:70,fill:PAL.red})+T(0,260,'ERPRESS-',{size:34,fill:PAL.red})+T(0,300,'BAR',{size:34,fill:PAL.red}),{s:k2,col:PAL.red});
  return s;
},
end(t,d,S,h){
  const un=h.wt('unabhängigkeit'), tilt=Math.sin(t*1.6)*8*(1-0.5*h.p(t,un,un+1));
  let s=`<g transform="translate(540,820) rotate(${tilt})"><rect x="-340" y="-10" width="680" height="20" rx="10" fill="#c9cdf0"/>
    <line x1="-300" y1="0" x2="-300" y2="120" stroke="#8a8fb0" stroke-width="5"/><line x1="300" y1="0" x2="300" y2="120" stroke="#8a8fb0" stroke-width="5"/>
    <g transform="translate(-300,${120})"><path d="M-110,0 H110 L80,40 H-80Z" fill="#8a8fb0"/>${flame(0,-10,0.8,t,PAL.yellow)}</g>
    <g transform="translate(300,${120})"><path d="M-110,0 H110 L80,40 H-80Z" fill="#8a8fb0"/><path d="M0,-130 L70,-100 V-40 Q70,0 0,20 Q-70,0 -70,-40 V-100Z" fill="${GAS}" filter="url(#glowS)" transform="translate(0,0)"/></g></g>`;
  s+=`<path d="M540,830 L490,1180 H590Z" fill="#6c7090"/>`;
  s+=T(240,1080,'BILLIGES GAS',{size:28,font:'Mono',w:700,fill:PAL.yellow})+T(840,1080,'UNABHÄNGIG',{size:28,font:'Mono',w:700,fill:GAS});
  if(t>un) s+=G(T(0,70,'?',{size:220,fill:'#fff',filter:'glow'}),{x:540,y:520,s:E.outBack(h.p(t,un,un+0.3))});
  return s;
},
};
