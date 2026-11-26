/* Szenen für "Was wäre, wenn die Erde plötzlich stehen bleibt?"
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};
const tag=(txt,col,w=300)=>`<rect x="${-w/2}" y="-36" width="${w}" height="72" rx="16" fill="#141836" stroke="${col}" stroke-width="5"/>`+T(0,14,txt,{size:30,font:'Mono',w:700,fill:col});
const speedLines=(x,y,w,n,t,col='#c9cdf0',seed=1)=>{ const r=rng(seed); let g=''; for(let i=0;i<n;i++){ const yy=y+(r()-0.5)*w, L=80+r()*160, p=((t*3+r())%1); g+=`<rect x="${x-p*600}" y="${yy}" width="${L}" height="6" rx="3" fill="${col}" opacity="${0.5*(1-p)}"/>`; } return g; };
function gauge(x,y,r,val,max,col=PAL.yellow){ // Tacho: Bogen von -120° (unten links) über oben bis +120° (unten rechts)
  const pt=a=>[r*Math.sin(a*Math.PI/180),-r*Math.cos(a*Math.PI/180)];
  const a=-120+240*clamp(val/max,0,1), [sx,sy]=pt(-120), [ex,ey]=pt(120), [vx,vy]=pt(a);
  let g=`<g transform="translate(${x},${y})"><path d="M${sx},${sy} A${r},${r} 0 1 1 ${ex},${ey}" stroke="#2f3566" stroke-width="26" fill="none" stroke-linecap="round"/>`;
  if(a>-119) g+=`<path d="M${sx},${sy} A${r},${r} 0 ${a+120>180?1:0} 1 ${vx},${vy}" stroke="${col}" stroke-width="26" fill="none" stroke-linecap="round" filter="url(#glowS)"/>`;
  g+=`<rect x="-6" y="${-r+30}" width="12" height="${r-30}" rx="6" fill="#fff" transform="rotate(${a})"/><circle r="22" fill="#fff"/>`+T(0,r*0.62,'KM/H',{size:30,font:'Mono',w:700,fill:'#8d93bd'});
  return g+'</g>'; }
function house1(x,y,s=1,r=0){ return `<g transform="translate(${x},${y}) scale(${s}) rotate(${r})"><path d="M-70,0 V-90 L0,-150 L70,-90 V0Z" fill="#d9a35a"/><path d="M-84,-84 L0,-160 L84,-84" stroke="#b1263a" stroke-width="18" fill="none"/><rect x="-20" y="-60" width="40" height="60" fill="#4b2f1a"/><rect x="-56" y="-76" width="28" height="26" fill="#bfe3ff"/></g>`; }
function tree(x,y,s=1,bend=0){ return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-8,0 Q${bend*0.4},-80 ${bend},-150" stroke="#6b4a2a" stroke-width="18" fill="none" stroke-linecap="round"/><ellipse cx="${bend*1.1}" cy="-180" rx="70" ry="55" fill="#2f9a5b" transform="rotate(${bend*0.4},${bend},-180)"/></g>`; }
function dinosaur(x,y,s=1,t=0){ const nk=Math.sin(t*1.5)*6; return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-260,-40 Q-120,-30 -60,-120 Q20,-180 120,-130 Q180,-100 200,-60 L200,0 L160,0 L150,-50 L60,-50 L50,0 L10,0 L0,-60 Q-80,-50 -260,-40Z" fill="#3f9a6a"/>
  <path d="M150,-110 Q210,${-250+nk} 250,${-330+nk} Q270,${-350+nk} 300,${-340+nk} Q310,${-320+nk} 280,${-310+nk} Q250,${-280+nk} 200,-120Z" fill="#3f9a6a"/><circle cx="${286}" cy="${-334+nk}" r="6" fill="#0e2a1a"/>
  ${[-30,40,120].map(px=>`<rect x="${px}" y="-60" width="26" height="60" rx="8" fill="#2f7a52"/>`).join('')}</g>`; }

const SCENES={
hook(t,d,S,h){
  const dr=h.wt('drehen'), frozen=Math.min(t,dr), jolt=t>dr&&t<dr+0.3?Math.sin((t-dr)*80)*10:0;
  let s=spotlight(540,780,460,.6)+G(globe(0,0,300,frozen*2.5),{x:540+jolt,y:780});
  if(t>dr){ const k=E.outBack(h.p(t,dr,dr+0.3)); s+=ring(540,780,330,PAL.red,0.8*k,10)+G(tag('STOPP',PAL.red,220),{x:540,y:420,s:k}); }
  else s+=`<path d="M300,450 A330,330 0 0 1 780,450" stroke="${PAL.blue}" stroke-width="8" fill="none" stroke-dasharray="20 18" stroke-dashoffset="${-t*60}"/><path d="M770,430 l30,22 l-36,12z" fill="${PAL.blue}"/>`;
  return s;
},
speed(t,d,S,h){
  const v=1000*E.inOut(h.p(t,0.3,d-0.4));
  let s=G(globe(0,0,170,t*2.5),{x:300,y:560})+`<circle cx="300" cy="490" r="10" fill="${PAL.yellow}" filter="url(#glowS)"/>`+T(300,780,'DU',{size:26,font:'Mono',w:700,fill:PAL.yellow});
  s+=gauge(700,880,230,v,1700);
  s+=T(700,1050,Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'),{size:70,fill:'#fff'});
  return s;
},
stop(t,d,S,h){
  const ni=h.wt('nicht'), fly=E.in(h.p(t,ni-0.1,ni+0.9));
  let s=`<rect x="0" y="1060" width="1080" height="200" fill="#1a1d38"/>`+skyline(1060,0.3,8,{min:180,var:240});
  if(t>ni) s+=speedLines(900,780,400,14,t,'#fff',3);
  s+=person({x:420+fly*900,y:1220-fly*300,s:1,...ME,mood:t>ni?'shock':'neutral',armL:lerp(14,140,fly),armR:lerp(-14,-120,fly),tilt:fly*50});
  return s;
},
fling(t,d,S,h){
  const items=[['menschen',figure(0,0,0.9,'#ff7aa8',null)],['autos',car(0,0,0.55,'#4ea8ff')],['häuser',house1(0,0,0.9)]];
  let s=`<rect x="0" y="1100" width="1080" height="160" fill="#1a1d38"/>`+speedLines(1000,760,700,20,t,'#c9cdf0',5);
  const rr=rng(17); for(let i=0;i<9;i++){ const sp=380+rr()*300, ph=rr()*1400, x=((t*sp+ph)%1400)-200, y=560+rr()*480; // lose Dinge fliegen von Anfang an
    s+=G(i%3===0?trash(0,0,0.35,0):i%3===1?box(0,0,0.5,['#c98f4e','#ff5d73','#4ea8ff'][i%3]):`<rect x="-30" y="-8" width="60" height="16" rx="4" fill="#c9cdf0"/><rect x="-6" y="-40" width="12" height="40" fill="#8a8fb0"/>`,{x,y,r:t*200+i*40}); }
  s+=G(`<path d="M0,0 H200 M140,-50 L200,0 L140,50" stroke="${PAL.red}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`+T(100,90,'OSTEN',{size:34,font:'Mono',w:700,fill:PAL.red}),{x:760,y:470,s:E.outBack(h.p(t,h.wt('osten')-0.1,h.wt('osten')+0.2))});
  items.forEach(([w,art],i)=>{ const tw=h.wt(w); if(t<tw-0.2) return; const p=(t-tw+0.2); const x=-150+p*700, y=[880,980,1000][i]-Math.sin(Math.min(p,1.4)*2)*120;
    s+=G(art,{x:x%1300,y,r:p*200*(i===1?1:0.6)}); });
  return s;
},
wind(t,d,S,h){
  const st=h.wt('sturm'), k=h.p(t,0,st), sw=Math.sin(t*9)*6;
  let s=`<rect x="0" y="1080" width="1080" height="180" fill="#1a1d38"/>`;
  for(let i=0;i<5;i++) s+=tree(150+i*200,1080,1,lerp(10,140,E.out(k))+sw);
  s+=speedLines(1080,700,700,26,t*1.5,'#9fb0ff',9);
  [['HURRIKAN','~300 KM/H',PAL.yellow,300,470],['DIESER STURM','~1.000 KM/H',PAL.red,780,470]].forEach(([a,b,col,x,y],i)=>{ const kk=E.outBack(h.p(t,h.wt('hurrikan')-0.2+i*0.25,h.wt('hurrikan')+0.1+i*0.25)); if(kk>0) s+=panel(x,y,360,170,T(0,-14,a,{size:26,font:'Mono',w:700,fill:'#c9cdf0'})+T(0,42,b,{size:42,fill:col}),{s:kk,col}); });
  return s;
},
waves(t,d,S,h){
  const we=h.wt('wellen'), k=E.inOut(h.p(t,we-0.6,we+1.0));
  let s=skyline(1100,0.5,13,{min:200,var:300})+`<rect x="0" y="1100" width="1080" height="160" fill="#1a1d38"/>`;
  const top=1100-k*700; let wv=`M-20,1300 L-20,${top}`; for(let x=-20;x<=1100;x+=40) wv+=` L${x},${top+Math.sin(x*0.02+t*4)*30-(x>700?(x-700)*0.4*k:0)}`; wv+=' L1100,1300Z';
  s+=`<path d="${wv}" fill="#2f6fd6" opacity=".85"/><path d="${wv}" fill="none" stroke="#bfe3ff" stroke-width="8" opacity=".8"/>`;
  return s;
},
daynight(t,d,S,h){
  const ja=h.wt('jahr'), so=h.wt('sonne'), na=h.wt('nacht');
  let s=G(globe(0,0,260,0,{night:0.85}),{x:540,y:700});
  s+=`<circle cx="120" cy="700" r="80" fill="${PAL.yellow}" filter="url(#glow)"/>`+`<path d="M200,700 H260" stroke="${PAL.yellow}" stroke-width="6" stroke-dasharray="10 10"/>`;
  const k=E.outBack(h.p(t,ja-0.1,ja+0.25)); if(k>0) s+=G(tag('1 TAG = 1 JAHR',PAL.red,400),{x:540,y:1040,s:k});
  if(t>so) s+=G(tag('6 MONATE SONNE',PAL.yellow,380),{x:300,y:420,s:E.outBack(h.p(t,so,so+0.25))*0.8});
  if(t>na) s+=G(tag('6 MONATE NACHT',PAL.blue,380),{x:780,y:420,s:E.outBack(h.p(t,na,na+0.25))*0.8});
  return s;
},
oceans(t,d,S,h){
  const k=E.inOut(h.p(t,0.3,h.wt('kontinent')+0.3)), ko=h.wt('kontinent');
  let s=`<g transform="translate(540,760)"><clipPath id="gl"><circle r="300"/></clipPath><circle r="300" fill="#3a6a3a"/><g clip-path="url(#gl)">`;
  const band=300*(1-k*0.75); // Wasser zieht sich zu den Polen zurück
  s+=`<rect x="-310" y="-310" width="620" height="${310-band*0.35}" fill="#2f6fd6"/><rect x="-310" y="${band*0.35}" width="620" height="${310-band*0.35}" fill="#2f6fd6"/>`;
  s+=`<rect x="-310" y="${-band*0.35}" width="620" height="${band*0.7}" fill="#2f6fd6" opacity="${1-k}"/>`;
  s+=[[-150,-120,90,60],[60,-60,120,70],[-60,110,80,50],[170,150,60,40]].map(([cx,cy,rx,ry])=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3a8a4a"/>`).join('');
  s+=`</g><circle r="300" fill="none" stroke="#9fb0ff" stroke-width="4" opacity=".5"/></g>`;
  [['NORDPOL',-1],['SÜDPOL',1]].forEach(([l,sg])=>{ s+=T(540,760+sg*360+(sg<0?-10:30),l,{size:24,font:'Mono',w:700,fill:'#8fb8e8'}); for(let i=0;i<3;i++){ const p=((t*0.8)+i/3)%1; s+=`<path d="M${400+i*140},${760+sg*(60+p*180)} l0,${sg*30}" stroke="#bfe3ff" stroke-width="6" opacity="${(1-p)*k}"/>`; } });
  if(t>ko) s+=G(tag('NEUER KONTINENT',PAL.green,400),{x:540,y:760,s:E.outBack(h.p(t,ko,ko+0.3))*0.85});
  return s;
},
twist(t,d,S,h){
  const la=h.wt('langsamer');
  let s=G(T(0,80,'?',{size:300,fill:PAL.pink,filter:'glow'}),{x:540,y:720,s:E.outBack(h.p(t,0.05,0.35)),op:1-h.p(t,la-0.3,la)});
  const k=E.outBack(h.p(t,la-0.1,la+0.25)); if(k>0) s+=G(globe(0,0,220,t*0.5),{x:540,y:740,s:k})+G(tag('BREMST',PAL.red,240),{x:540,y:1040,s:k});
  return s;
},
dino(t,d,S,h){
  const di=h.wt('dinosaurier');
  let s=`<rect x="0" y="1080" width="1080" height="180" fill="#2a2a1a"/>`+`<circle cx="860" cy="480" r="80" fill="#ffb347" opacity=".9" filter="url(#glow)"/>`;
  s+=G(dinosaur(0,0,1.2,t),{x:470,y:1080,s:E.outBack(h.p(t,di-0.2,di+0.2))});
  s+=G(clockFace(0,0,90,11,30,PAL.green),{x:220,y:520});
  s+=T(220,660,'23:30',{size:40,font:'Mono',w:700,fill:PAL.green});
  return s;
},
end(t,d,S,h){
  const un=h.wt('unterwegs');
  let s=spotlight(540,780,460,.6)+G(globe(0,0,290,t*2.5),{x:540,y:780});
  s+=G(figure(0,0,0.45,PAL.purple,null),{x:540,y:478});
  s+=`<path d="M300,450 A330,330 0 0 1 780,450" stroke="${PAL.yellow}" stroke-width="8" fill="none" stroke-dasharray="20 18" stroke-dashoffset="${-t*60}"/>`;
  if(t>un) s+=G(tag('1.000 KM/H',PAL.yellow,300),{x:540,y:1130,s:E.outBack(h.p(t,un,un+0.3))});
  return s;
},
};
