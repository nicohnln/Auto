/* Szenen für "Was wäre, wenn man das Bewusstsein eines Menschen in einen Computer übertragen könnte?"
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};
const tag=(txt,col)=>`<rect x="-150" y="-36" width="300" height="72" rx="16" fill="#141836" stroke="${col}" stroke-width="5"/>`+T(0,14,txt,{size:32,font:'Mono',w:700,fill:col});
const CY='#4ee8ff';
// Gesicht aus Pixeln (digitales Du); mood: neutral|happy|think|shock
function pixelFace(x,y,s,t,mood='neutral',col=CY){
  const r=rng(4); let g=`<g transform="translate(${x},${y}) scale(${s})">`;
  for(let i=0;i<220;i++){ const a=r()*Math.PI*2, rr=Math.sqrt(r())*150, px=Math.cos(a)*rr*0.85, py=Math.sin(a)*rr; const fl=0.35+0.45*Math.abs(Math.sin(t*3+i));
    g+=`<rect x="${(Math.round(px/12)*12).toFixed(0)}" y="${(Math.round(py/12)*12).toFixed(0)}" width="10" height="10" fill="${col}" opacity="${fl*0.45}"/>`; }
  g+=`<ellipse rx="128" ry="160" fill="none" stroke="${col}" stroke-width="5" opacity=".9" filter="url(#glowS)"/>`;
  const blink=(t%3.2)>3.05;
  g+=blink?`<path d="M-62,-20 h40 M22,-20 h40" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`:`<rect x="-62" y="-36" width="40" height="${mood==='shock'?40:30}" rx="6" fill="${col}" filter="url(#glowS)"/><rect x="22" y="-36" width="40" height="${mood==='shock'?40:30}" rx="6" fill="${col}" filter="url(#glowS)"/>`;
  const m={neutral:`<rect x="-36" y="62" width="72" height="10" rx="5" fill="${col}"/>`,happy:`<path d="M-50,52 q50,46 100,0" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>`,
    think:`<path d="M-30,66 q30,-14 60,4" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>`,shock:`<ellipse cy="70" rx="20" ry="26" fill="none" stroke="${col}" stroke-width="9"/>`}[mood];
  return g+m+'</g>'; }
function monitor(x,y,w,hh,inner,s=1){ return `<g transform="translate(${x},${y}) scale(${s})"><rect x="${-w/2-16}" y="${-hh/2-16}" width="${w+32}" height="${hh+32}" rx="24" fill="#1b1e3a" stroke="#353b6e" stroke-width="6"/>
  <rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="12" fill="#061226"/><rect x="-40" y="${hh/2+16}" width="80" height="60" fill="#2a2f57"/><rect x="-120" y="${hh/2+70}" width="240" height="18" rx="9" fill="#353b6e"/>
  <clipPath id="mon${x}${y}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="12"/></clipPath><g clip-path="url(#mon${x}${y})">${inner}${[...Array(Math.floor(hh/8))].map((_,i)=>`<rect x="${-w/2}" y="${-hh/2+i*8}" width="${w}" height="2" fill="#000" opacity=".18"/>`).join('')}</g></g>`; }
function labTable(x,y,o={}){ // Liege mit Person + Scanner-Helm
  const lying=`<g transform="translate(${x-140},${y-40}) rotate(-90)">${o.headOnly?'':''}</g>`;
  let g=`<rect x="${x-300}" y="${y}" width="600" height="40" rx="14" fill="#c9cdf0"/><rect x="${x-260}" y="${y+40}" width="30" height="200" fill="#8a8fb0"/><rect x="${x+230}" y="${y+40}" width="30" height="200" fill="#8a8fb0"/>`;
  g+=`<rect x="${x-190}" y="${y-60}" width="400" height="66" rx="30" fill="${ME.shirt}"/><circle cx="${x-230}" cy="${y-34}" r="52" fill="${PAL.skin}"/>`;
  g+=o.awake?`<circle cx="${x-246}" cy="${y-44}" r="9" fill="#fff"/><circle cx="${x-214}" cy="${y-44}" r="9" fill="#fff"/><circle cx="${x-246}" cy="${y-42}" r="4.5" fill="#1b1b2b"/><circle cx="${x-214}" cy="${y-42}" r="4.5" fill="#1b1b2b"/><ellipse cx="${x-230}" cy="${y-14}" rx="8" ry="10" fill="#5a2430"/>`
    :`<path d="M${x-256},${y-42} q10,7 20,0 M${x-224},${y-42} q10,7 20,0" stroke="#1b1b2b" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  g+=`<path d="M${x-292},${y-50} Q${x-292},${y-110} ${x-230},${y-112} Q${x-168},${y-110} ${x-168},${y-50}" fill="#5c6390" stroke="#8a8fb0" stroke-width="5"/>`;
  g+=`<path d="M${x-230},${y-112} C${x-230},${y-300} ${x+40},${y-260} ${x+120},${y-380}" stroke="#353b6e" stroke-width="10" fill="none"/>`;
  if(o.pulse) g+=`<circle cx="${x-230}" cy="${y-112}" r="12" fill="${CY}" filter="url(#glowS)" opacity="${o.pulse}"/>`;
  return g; }
function flyDraw(x,y,s=1,t=0){ const fl=Math.sin(t*40)*10; return `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="-70" cy="-40" rx="90" ry="40" fill="#c9e8ff" opacity=".55" transform="rotate(${-25+fl},-10,-10)"/><ellipse cx="70" cy="-40" rx="90" ry="40" fill="#c9e8ff" opacity=".55" transform="rotate(${25-fl},10,-10)"/>
  <ellipse cx="0" cy="40" rx="44" ry="80" fill="#8a5a2c"/>${[0,1,2,3].map(i=>`<rect x="-44" y="${10+i*24}" width="88" height="8" fill="#5a3a1a"/>`).join('')}
  <ellipse cx="0" cy="-40" rx="40" ry="34" fill="#6b4a2a"/><circle cx="0" cy="-90" r="34" fill="#7a5a32"/><circle cx="-24" cy="-96" r="20" fill="#d62f45"/><circle cx="24" cy="-96" r="20" fill="#d62f45"/>
  ${[-1,1].map(sd=>[0,1,2].map(i=>`<path d="M${sd*30},${-40+i*22} l${sd*70},${30+i*10} l${sd*20},${40}" stroke="#3a2a1a" stroke-width="6" fill="none"/>`).join('')).join('')}</g>`; }
function brainShape(x,y,s=1,col='#ff7aa8',op=0.25){ return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-250,40 C-300,-80 -200,-230 -60,-230 C10,-300 160,-270 210,-170 C300,-140 310,10 240,70 C230,150 120,190 40,160 C-20,210 -150,190 -170,130 C-260,130 -280,90 -250,40Z" fill="${col}" opacity="${op}" stroke="${col}" stroke-width="6"/>
  <path d="M-40,-220 C-60,-120 20,-80 -20,20 M100,-240 C80,-160 160,-120 120,-40 M-180,-120 C-120,-80 -160,0 -100,40 M60,40 C120,60 180,20 220,60" stroke="${col}" stroke-width="5" fill="none" opacity=".7"/></g>`; }
function neurons(cx,cy,n,rx,ry,t,col,k=1,seed=1){ const r=rng(seed); let g='';
  for(let i=0;i<n;i++){ const a=r()*Math.PI*2, rr=Math.sqrt(r()), x=cx+Math.cos(a)*rr*rx, y=cy+Math.sin(a)*rr*ry; if(i/n>k) continue;
    g+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${2+r()*2.5}" fill="${col}" opacity="${0.4+0.5*Math.abs(Math.sin(t*2+i))}"/>`; }
  return g; }

const SCENES={
hook(t,d,S,h){
  const co=h.wt('computer'), up=h.p(t,h.wt('augen'),co), k=h.p(t,co-0.1,co+0.4);
  let s=`<rect x="0" y="380" width="1080" height="820" fill="#101436" opacity=".5"/>`;
  s+=labTable(540,1000,{pulse:0.5+0.5*Math.sin(t*8)});
  // Datenstrom vom Helm zum Monitor
  for(let i=0;i<10;i++){ const p=((t*1.2+i/10)%1)*up; if(up<=0) break; const bx=310+(660-310)*p, by=888-(888-560)*p-Math.sin(p*Math.PI)*120; s+=`<rect x="${bx}" y="${by}" width="14" height="14" fill="${CY}" opacity="${0.8*(1-p)}" filter="url(#glowS)"/>`; }
  s+=monitor(760,540,300,220,(k>0?G(pixelFace(0,0,0.55,t,'shock'),{op:k}):T(0,14,`${Math.round(up*100)} %`,{size:56,font:'Mono',w:700,fill:CY})),0.95);
  return s;
},
digital(t,d,S,h){
  const he=h.wt('herzschlag'), de=h.wt('denkst'), al=h.wt('alles');
  let s=monitor(540,660,560,440,pixelFace(0,0,1.15,t,t>de?'neutral':'think'));
  const k=E.outBack(h.p(t,he-0.1,he+0.2));
  if(k>0) s+=G(heartLine(0,0,320,t,PAL.red,0).replace(/<path d="[^"]*" stroke="#ff3355" stroke-width="5"/,'<path d="M-160,0 L160,0" stroke="#ff3355" stroke-width="5"'),{x:540,y:1060,s:k});
  if(t>al) for(let i=0;i<6;i++){ const p=h.p(t,al+i*0.08,al+i*0.08+0.6), a=i/6*Math.PI*2; s+=G(`<rect x="-46" y="-36" width="92" height="72" rx="6" fill="#f3f4fb"/><rect x="-38" y="-28" width="76" height="46" fill="${['#4ea8ff','#ff7aa8','#38f27e','#ffd23f','#b78bff','#ff9b42'][i]}" opacity=".7"/>`,{x:540+Math.cos(a)*lerp(420,330,p),y:660+Math.sin(a)*lerp(380,300,p),s:E.outBack(p)*0.9,r:(i-3)*6}); }
  return s;
},
power(t,d,S,h){
  let s=monitor(540,620,520,420,pixelFace(0,0,1.05,t,t>h.wt('ehrlich')?'happy':'neutral',PAL.green));
  [['müde','MÜDE: NIE',PAL.blue,250,1000],['krank','KRANK: NIE',PAL.pink,830,1000],['alt','ALT: NIE',PAL.yellow,540,1110]].forEach(([w,txt,col,x,y])=>{
    const k=E.outBack(h.p(t,h.wt(w)-0.1,h.wt(w)+0.2)); if(k>0) s+=G(tag(txt,col),{x,y,s:k*0.85}); });
  return s;
},
speed(t,d,S,h){
  const se=h.wt('sekunde'), sp=h.wt('sprache');
  let s=monitor(540,640,520,420,pixelFace(0,0,1.0,t,'happy'));
  const kb=h.p(t,0.1,se);
  for(let i=0;i<10;i++){ const p=((t*2.5+i/10)%1); if(t>se+0.4) break; s+=G(`<rect x="-40" y="-52" width="80" height="104" rx="4" fill="#f3f4fb"/>`+[0,1,2,3].map(j=>`<rect x="-28" y="${-36+j*20}" width="56" height="6" fill="#b9bdd6"/>`).join(''),{x:lerp(80,440,p),y:1000-p*300,r:p*40,s:1-p*0.6,op:1-p}); }
  s+=G(`<rect x="-200" y="-22" width="400" height="44" rx="22" fill="#141836" stroke="${PAL.yellow}" stroke-width="4"/><rect x="-194" y="-16" width="${388*kb}" height="32" rx="16" fill="${PAL.yellow}"/>`+T(0,64,`BUCH ${Math.round(kb*100)} %`,{size:26,font:'Mono',w:700,fill:PAL.yellow}),{x:540,y:1000});
  ['Hola!','Bonjour!','Ciao!','Merhaba!','Hej!'].forEach((w,i)=>{ const k=E.outBack(h.p(t,sp+i*0.12,sp+i*0.12+0.25)); if(k>0) s+=G(bubble(0,0,200,90,T(0,14,w,{size:34,fill:'#22264a'})),{x:[170,900,150,910,540][i],y:[430,430,760,760,1140][i],s:k*0.85}); });
  return s;
},
question(t,d,S,h){
  const fr=h.wt('frage');
  let s=monitor(540,640,520,420,pixelFace(0,0,1.0,t,'think'));
  const k=E.outBack(h.p(t,fr-0.1,fr+0.3)); if(k>0) s+=G(T(0,80,'?',{size:240,fill:PAL.yellow,filter:'glow'}),{x:880,y:420,s:k*(1+0.06*Math.sin(t*5))});
  return s;
},
body(t,d,S,h){
  const wa=h.wt('wacht'), awake=t>wa;
  let s=`<rect x="0" y="380" width="1080" height="820" fill="#101436" opacity=".5"/>`+spotlight(400,950,380,.6);
  s+=labTable(540,1000,{awake});
  s+=monitor(820,520,260,190,pixelFace(0,0,0.5,t,awake?'shock':'neutral'),0.9);
  if(awake) for(let i=0;i<3;i++){ const p=((t-wa)*0.8+i/3)%1; s+=ring(310,960,60+p*160,PAL.pink,(1-p)*0.6,4); }
  return s;
},
two(t,d,S,h){
  const zw=h.wt('zwei'), or=h.wt('original');
  let s=person({x:280,y:1200,s:1,...ME,mood:t>or?'angry':'shock',look:1,armR:-40});
  s+=monitor(780,800,320,300,pixelFace(0,0,0.75,t,t>or?'shock':'neutral'),1);
  const k=E.outBack(h.p(t,or-0.1,or+0.25));
  if(k>0){ s+=G(bubble(0,0,360,110,T(0,16,'ICH BIN ECHT!',{size:40,fill:PAL.red})),{x:300,y:470,s:k}); s+=G(bubble(0,0,360,110,T(0,16,'NEIN, ICH!',{size:40,fill:PAL.red})),{x:780,y:470,s:E.outBack(h.p(t,or+0.15,or+0.4))}); }
  if(t>zw) s+=T(540,820,'=',{size:120,fill:PAL.yellow,op:E.out(h.p(t,zw,zw+0.3)),filter:'glow'});
  return s;
},
twist(t,d,S,h){
  const sc=h.wt('schon'), g=h.p(t,sc-0.1,sc+0.3);
  let s=G(T(0,80,'?',{size:300,fill:PAL.blue,filter:'glow'}),{x:540,y:720,s:E.outBack(h.p(t,0.05,0.35)),op:1-g});
  if(g>0){ const r=rng(Math.floor(t*20)); for(let i=0;i<12;i++) s+=`<rect x="0" y="${380+r()*800}" width="1080" height="${6+r()*30}" fill="${['#ff3355','#4ee8ff','#fff'][i%3]}" opacity="${0.25*(1-Math.abs(g-0.5)*2)+0.04}"/>`;
    s+=G(tag('HEUTE',PAL.yellow),{x:540,y:760,s:E.outBack(g)*1.3}); }
  return s;
},
fly(t,d,S,h){
  const k=E.inOut(h.p(t,0.3,d-0.4)), ka=h.wt('kartiert');
  let s=`<circle cx="540" cy="760" r="330" fill="${PAL.green}" opacity=".06" filter="url(#blur8)"/>`+flyDraw(540,780,1.6,t);
  s+=neurons(540,640,500,90,60,t,PAL.yellow,k,3);
  if(t>ka) s+=G(stamp('KOMPLETT',PAL.green,0.8,-12),{x:540,y:1080,s:lerp(2,1,E.outBack(h.p(t,ka,ka+0.25)))});
  return s;
},
human(t,d,S,h){
  const mi=h.wt('milliarden'), k=h.p(t,mi-0.3,mi+0.6);
  let s=brainShape(540,820,1.35,PAL.pink,0.12+0.1*k);
  s+=neurons(540,770,120+Math.round(1600*k),330,250,t,PAL.pink,1,8);
  s+=G(flyDraw(0,0,0.25,t)+`<circle r="70" fill="none" stroke="${PAL.yellow}" stroke-width="4"/>`,{x:200,y:470,op:1-k*0.5});
  s+=T(200,580,'FLIEGE',{size:22,font:'Mono',w:700,fill:PAL.yellow,op:1-k*0.5});
  return s;
},
end(t,d,S,h){
  const du=h.wt('du');
  let s=`<clipPath id="lh"><rect x="0" y="0" width="540" height="1920"/></clipPath><clipPath id="rh"><rect x="540" y="0" width="540" height="1920"/></clipPath>`;
  s+=`<g clip-path="url(#lh)">${person({x:540,y:1250,s:1.7,...ME,mood:'neutral',legs:false})}</g>`;
  s+=`<g clip-path="url(#rh)"><rect x="540" y="380" width="540" height="880" fill="#061226" opacity=".9"/>${pixelFace(540,600,1.2,t,'neutral')}</g>`;
  s+=`<line x1="540" y1="380" x2="540" y2="1220" stroke="#fff" stroke-width="4" opacity="${0.5+0.5*Math.sin(t*6)}"/>`;
  if(t>du) s+=G(T(0,80,'?',{size:260,fill:PAL.red,filter:'glow'}),{x:540,y:470,s:E.outBack(h.p(t,du,du+0.3))});
  return s;
},
};
