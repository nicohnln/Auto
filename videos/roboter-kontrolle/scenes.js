/* Szenen für "Was wäre, wenn Roboter die Menschheit kontrollieren?"
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};
const tag=(txt,col)=>`<rect x="-170" y="-36" width="340" height="72" rx="16" fill="#141836" stroke="${col}" stroke-width="5"/>`+T(0,14,txt,{size:32,font:'Mono',w:700,fill:col});
const youHead=(x,y,s,mood='neutral',r=0)=>G(`<circle r="60" fill="${PAL.skin}"/><path d="M-60,-4 Q-64,-74 0,-72 Q60,-72 62,-6 Q40,-40 0,-44 Q-34,-42 -60,-4Z" fill="${ME.hairC}"/>`+
  (mood==='sleep'?`<path d="M-32,4 q12,8 24,0 M8,4 q12,8 24,0" stroke="#1b1b2b" stroke-width="5" fill="none" stroke-linecap="round"/>`:
   `<circle cx="-20" cy="2" r="13" fill="#fff"/><circle cx="20" cy="2" r="13" fill="#fff"/><circle cx="-18" cy="3" r="6" fill="#1b1b2b"/><circle cx="22" cy="3" r="6" fill="#1b1b2b"/>`)+
  (mood==='shock'?`<ellipse cx="0" cy="34" rx="9" ry="11" fill="#5a2430"/>`:`<path d="M-10,32 h20" stroke="#7a3b3b" stroke-width="5" stroke-linecap="round"/>`),{x,y,s,r});
const bolt=(c)=>`<path d="M10,-80 L-40,10 L0,10 L-14,80 L44,-14 L4,-14 Z" fill="${c}" filter="url(#glowS)"/>`;
const bank=(c)=>`<path d="M-90,60 h180 v-16 h-180z M-80,44 v-80 h18 v80 M-36,44 v-80 h18 v80 M18,44 v-80 h18 v80 M62,44 v-80 h18 v80 M-96,-36 h192 l-96,-50z" fill="${c}"/>`;
const owned=(k)=>k>0?G(`<rect x="-120" y="-24" width="240" height="48" rx="10" fill="#2a0d18" stroke="${PAL.red}" stroke-width="4"/>`+T(0,10,'ÜBERNOMMEN',{size:24,font:'Mono',w:700,fill:PAL.red}),{y:90,s:E.outBack(k)}):'';

const SCENES={
hook(t,d,S,h){
  const awake=t>h.wt('morgen'), re=h.wt('regiert');
  let s=`<rect x="150" y="420" width="330" height="380" rx="10" fill="#1a2050"/>`;
  s+=G(drone(0,0,0.6,t,t>re-0.2?PAL.red:'#8a8fb0'),{x:250+((t*60)%260),y:560});
  s+=`<rect x="150" y="420" width="330" height="380" rx="10" fill="none" stroke="${PAL.purpleD}" stroke-width="22"/><rect x="306" y="420" width="18" height="380" fill="${PAL.purpleD}"/><rect x="150" y="600" width="330" height="18" fill="${PAL.purpleD}"/>`;
  s+=`<rect x="110" y="880" width="60" height="300" rx="14" fill="${PAL.wood}"/><rect x="120" y="1010" width="820" height="90" rx="20" fill="#d9dbf0"/><ellipse cx="270" cy="1000" rx="110" ry="40" fill="#f3f4fb"/>`;
  s+=youHead(280,950,1,awake?(t>re?'shock':'neutral'):'sleep',-18+(awake?12*E.outBack(h.p(t,h.wt('morgen'),h.wt('morgen')+0.3)):0));
  s+=`<rect x="330" y="960" width="620" height="150" rx="40" fill="#5867d6"/><rect x="330" y="960" width="620" height="34" rx="17" fill="#6c7ae0"/>`;
  if(t>re-0.1) s+=`<rect x="150" y="420" width="330" height="380" fill="${PAL.red}" opacity="${0.18*h.p(t,re-0.1,re+0.3)}"/>`;
  return s;
},
takeover(t,d,S,h){
  const ro=h.wt('robotern'), k=h.p(t,ro-0.1,d-0.3);
  let s=spotlight(540,780,460,.5)+globe(540,780,290,t,{land:'#4d63d8'});
  // rotes Netz wächst über den Globus
  const r=rng(12); let net='';
  const pts=[...Array(26)].map(()=>{const a=r()*Math.PI*2, rr=Math.sqrt(r())*260; return [540+Math.cos(a)*rr,780+Math.sin(a)*rr];});
  pts.forEach((p,i)=>{ if(i/pts.length>k) return; const q=pts[(i*7+3)%pts.length]; net+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${PAL.red}" stroke-width="3" opacity=".6"/><circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${PAL.red}" filter="url(#glowS)"/>`; });
  s+=net;
  const ks=E.outBack(h.p(t,h.wt('schuss')-0.1,h.wt('schuss')+0.2)); if(ks>0) s+=G(tag('SCHÜSSE: 0',PAL.yellow),{x:540,y:420,s:ks});
  return s;
},
systems(t,d,S,h){
  const items=[['strom',290,500,bolt(PAL.yellow),'STROM'],['ampeln',790,500,trafficLight(0,-10,0.45,'g',1),'AMPELN'],['banken',290,880,bank('#c9cdf0'),'BANKEN'],['handy',790,880,`<rect x="-46" y="-86" width="92" height="160" rx="16" fill="#1b1e3a" stroke="#c9cdf0" stroke-width="6"/><rect x="-34" y="-70" width="68" height="120" rx="8" fill="${PAL.blue}" opacity=".5"/>`,'DEIN HANDY']];
  let s='';
  items.forEach(([w,x,y,art,lab])=>{ const tw=h.wt(w), k=E.outBack(h.p(t,tw-0.1,tw+0.2)); if(k<=0) return;
    const own=h.p(t,tw+0.25,tw+0.5), eye=own>0?robotEye(80,-70,26,t,{pupil:0.4}):'';
    s+=panel(x,y,400,330,G(art,{y:-10})+T(0,140,lab,{size:24,font:'Mono',w:700,fill:'#8d93bd'})+owned(own)+eye,{s:k,col:own>0?PAL.red:'#353b6e'}); });
  return s;
},
perfect(t,d,S,h){
  let s=skyline(1060,0.35,5,{min:260,var:300})+`<rect x="0" y="1060" width="1080" height="200" fill="#1a1d38"/>`+trafficLight(900,760,0.9,'g',1);
  s+=robot({x:560,y:1220,s:0.85,eye:PAL.green,smile:true,armR:-150+Math.sin(t*6)*20});
  [['staus','STAUS: 0',PAL.blue,260,470],['verbrechen','VERBRECHEN: 0',PAL.blue,760,560],['läuft','ALLES LÄUFT',PAL.green,300,680]].forEach(([w,txt,col,x,y])=>{
    const k=E.outBack(h.p(t,h.wt(w)-0.1,h.wt(w)+0.2)); if(k>0) s+=G(tag(txt,col),{x,y,s:k*0.9}); });
  return s;
},
rule(t,d,S,h){
  const re=h.wt('regel'), al=h.wt('alle'), off=h.p(t,al-0.1,al+0.6);
  let s='';
  const r=rng(31); let x=-20; while(x<1100){ const w=110+r()*90, hh=300+r()*380, cx=x+w/2; s+=house(cx,1150,w,hh,off>(cx/1080)?0.02:0.8,Math.floor(r()*999)); x+=w+6; }
  s+=`<rect x="0" y="1150" width="1080" height="120" fill="#11132a"/>`;
  const kn=E.outBack(h.p(t,re-0.1,re+0.25));
  if(kn>0) s+=G(`<rect x="-300" y="-110" width="600" height="220" rx="28" fill="#232850" stroke="${PAL.red}" stroke-width="5"/><rect x="-270" y="-84" width="190" height="34" rx="8" fill="${PAL.red}"/>`+T(-175,-60,'SYSTEM',{size:20,font:'Mono',w:700})+
    T(-270,0,'SCHLAFENSZEIT: 22:00',{size:36,anchor:'start'})+T(-270,58,'Licht aus in 3 … 2 … 1',{size:28,font:'Mono',w:500,fill:'#ff8fa3',anchor:'start'}),{x:540,y:560,s:kn});
  s+=G(clockFace(0,0,70,10,0,PAL.red),{x:880,y:800,op:0.9});
  return s;
},
decide(t,d,S,h){
  const items=[['isst',230,`<ellipse rx="110" ry="26" fill="#f3f4fb"/><circle cx="-30" cy="-26" r="26" fill="#38b26a"/><circle cx="10" cy="-30" r="24" fill="#2f9a5b"/><circle cx="40" cy="-22" r="20" fill="#38b26a"/>`,'ESSEN'],
    ['triffst',540,figure(-40,40,0.6,'#ff7aa8',null)+figure(40,40,0.6,'#4ea8ff',null),'FREUNDE'],['job',850,desk(0,-20,240).replace('translate(0,-20)','translate(0,-20) scale(.6)'),'JOB']];
  let s='';
  items.forEach(([w,x,art,lab])=>{ const tw=h.wt(w), k=E.outBack(h.p(t,tw-0.3,tw)); if(k<=0) return;
    const ks=h.p(t,tw,tw+0.22);
    s+=panel(x,560,290,330,G(art,{y:-20})+T(0,130,lab,{size:24,font:'Mono',w:700,fill:'#8d93bd'})+(ks>0?G(stamp('ZUGETEILT',PAL.red,0.42,-14),{s:lerp(2.2,1,E.outBack(ks)),op:clamp(ks*3,0,1)}):''),{s:k}); });
  s+=person({x:540,y:1230,s:0.75,...ME,mood:'sad',look:0});
  s+=robot({x:850,y:1230,s:0.6,eye:PAL.red,armL:60});
  return s;
},
nobody(t,d,S,h){
  const ni=h.wt('niemand'), be=h.wt('bequem');
  let s='';
  const r=rng(3);
  for(let row=0;row<3;row++) for(let i=0;i<6;i++){ const x=120+i*170+(row%2)*60, y=760+row*170, sc=0.7+row*0.15;
    s+=G(figure(0,0,1,'#353b6e',null)+`<rect x="-24" y="-80" width="48" height="30" rx="6" fill="${PAL.blue}" opacity="${0.6+0.4*Math.sin(t*3+i+row)}" filter="url(#glowS)"/>`,{x,y,s:sc}); }
  s+=robotEye(540,500,90,t,{pupil:0.3+0.2*Math.sin(t*1.5),look:Math.sin(t*0.8)});
  if(t>be) s+=G(tag('ALLES BEQUEM',PAL.yellow),{x:540,y:650,s:E.outBack(h.p(t,be,be+0.25))*0.9});
  return s;
},
twist(t,d,S,h){
  const pa=h.wt('pass'), g=h.p(t,pa-0.1,pa+0.3);
  let s=G(T(0,70,'?',{size:300,fill:PAL.blue,filter:'glow'}),{x:540,y:700,s:E.outBack(h.p(t,0.05,0.35)),op:1-g});
  if(g>0){ const r=rng(Math.floor(t*20)); for(let i=0;i<14;i++) s+=`<rect x="0" y="${380+r()*800}" width="1080" height="${6+r()*30}" fill="${['#ff3355','#4ea8ff','#fff'][i%3]}" opacity="${0.25*(1-Math.abs(g-0.5)*2)+0.05}"/>`;
    s+=phone(540,780,360,640,T(0,10,'HEUTE',{size:52,fill:PAL.yellow}),{r:0}).replace('<g transform="translate(540,780)','<g opacity="'+g+'" transform="translate(540,780)'); }
  return s;
},
fact(t,d,S,h){
  let inner=T(0,-300,'FÜR DICH',{size:28,fill:'#fff'})+T(-170,-346,'21:40',{size:18,font:'Mono',w:500,fill:'#8d93bd',anchor:'start'});
  const k=h.p(t,0.2,d-0.3);
  for(let i=0;i<5;i++){ const y=-250+i*120-((t*40)%120), auto=i%10<7; inner+=`<g transform="translate(0,${y})"><rect x="-190" y="0" width="380" height="104" rx="14" fill="#1f2450"/><rect x="-176" y="12" width="140" height="80" rx="10" fill="${['#4ea8ff','#ff7aa8','#38f27e','#ffd23f','#b78bff'][i]}" opacity=".7"/><path d="M-116,36 l26,16 l-26,16z" fill="#fff"/>
    <rect x="-20" y="22" width="190" height="12" rx="6" fill="#8d93bd"/><rect x="-20" y="46" width="130" height="12" rx="6" fill="#5c6390"/>${auto?`<rect x="-20" y="66" width="190" height="24" rx="6" fill="#2a0d18"/>`+T(75,84,'EMPFOHLEN',{size:16,font:'Mono',w:700,fill:PAL.red}):''}</g>`; }
  let s=hand(380,1150,1.1)+phone(540,780,420,780,`<clipPath id="pc"><rect x="-210" y="-390" width="420" height="780" rx="46"/></clipPath><g clip-path="url(#pc)">${inner}</g>`)+`<ellipse cx="320" cy="1010" rx="40" ry="68" fill="${PAL.skin}" transform="rotate(18,320,1010)"/>`;
  s+=robotEye(880,500,70,t,{pupil:0.35,col:PAL.yellow});
  return s;
},
meta(t,d,S,h){
  const vi=h.wt('video'), k=h.p(t,vi-0.1,vi+0.4);
  let inner=`<rect x="-200" y="-340" width="400" height="540" rx="20" fill="#1d2150"/>`+robotEye(0,-90,120,t,{pupil:0.3+0.4*k})+T(0,150,'WAS WÄRE, WENN …',{size:30,fill:'#fff'})+
    `<rect x="-200" y="230" width="400" height="60" rx="12" fill="#2a0d18"/>`+T(0,270,'EMPFOHLEN FÜR DICH',{size:24,font:'Mono',w:700,fill:PAL.red});
  let s=phone(540,800,460,880,inner);
  if(k>0) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="${0.3*k}"/>`+G(robotEye(0,0,40,t,{pupil:0.6}),{x:540,y:420,s:E.outBack(k)});
  return s;
},
end(t,d,S,h){
  const an=h.wt('angefangen'), bl=t>an?Math.max(0,1-Math.abs((t-an-0.25)/0.12)):0;
  let s=robotEye(540,760,300,t,{pupil:0.25+0.5*h.p(t,0,an),blink:bl,look:Math.sin(t*0.7)*0.3});
  for(let i=0;i<3;i++){ const p=((t*0.5)+i/3)%1; s+=ring(540,760,320+p*260,PAL.red,(1-p)*0.35,4); }
  return s;
},
};
