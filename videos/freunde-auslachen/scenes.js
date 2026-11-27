/* "Wenn deine Freunde dich für deine Träume auslachen" – Millionärs Edition Nr. 5, Mono-Stil, ohne Voice-over
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1150;
const pop=(k)=>E.outBack(clamp(k,0,1));
const rich=(x,y,s,k=1,o={})=>mPerson(x,y,s,o)+(k>0?mCoin(x,y-250*s,0.7*s*pop(k),{fill:true}):'');
const flag=(s=1)=>`<g transform="scale(${s})" filter="url(#glowS)"><path d="M0,0 V-110" stroke="${MW}" stroke-width="5"/><path d="M0,-110 L64,-90 L0,-70Z" fill="${MW}"/></g>`;
const haha=(x,y,k,t,i)=>k>0?MT(x,y+Math.sin(t*14+i)*6,'HA HA',{size:30,w:700,fill:MG,op:k}):'';
// Sprechblase (Rechteck mit Spitze nach unten)
const sBubble=(x,y,txt,o={})=>{ const w=o.w||Math.max(220,txt.length*20+60), hh=84;
  return `<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><path d="M${-w/2},${-hh/2} H${w/2} V${hh/2} H${(o.tx||0)+16} L${o.tx||0},${hh/2+26} L${(o.tx||0)-6},${hh/2} H${-w/2}Z" fill="#050505" stroke="${o.dim?'#8c8c8c':MW}" stroke-width="3" stroke-linejoin="round"/>${MT(0,12,txt,{size:34,w:600,fill:o.dim?'#bdbdbd':MW})}</g>`; };
const arrowUp=(x,y,k)=>k>0?`<g transform="translate(${x},${y-40*k})" opacity="${k}" filter="url(#glowS)"><path d="M0,-30 L22,0 H8 V30 H-8 V0 H-22Z" fill="${MW}"/></g>`:'';

const SCENES={
hook(t,d,S,h){
  const au=h.wt('auslachen'), k=h.p(t,au-0.1,au+0.3);
  let s=mGround(GY)+mSpot(540,GY,240,480,0.6)+mPerson(540,GY,1.1,{lit:k<0.5,col:k>0.5?MG:undefined});
  s+=G(mCloud(0,0,0.8,G(flag(0.75),{y:40,x:-22})),{x:540,y:720,s:pop(h.p(t,0.1,0.5)),op:1-0.5*k});
  [[220,0],[340,1],[740,2],[860,3]].forEach(([x,i])=>{ s+=mPerson(x,GY,0.7,{lit:false,bob:k>0?-Math.abs(Math.sin(t*12+i))*8:0}); s+=haha(x,GY-230,k,t,i); });
  return s;
},
tell(t,d,S,h){
  const mi=h.wt('millionär'), k=h.p(t,mi-0.1,mi+0.35);
  let s=mGround(GY)+mPerson(300,GY,1.0);
  [[640,0.1],[780,0.2],[920,0.3]].forEach(([x,a])=>{ s+=mPerson(x,GY,0.75,{lit:false,op:E.out(h.p(t,a,a+0.3))}); });
  s+=sBubble(330,760,'Ich werde Millionär.',{s:pop(k),tx:-40,w:520});
  return s;
},
dream(t,d,S,h){
  const items=[['unternehmen',230,MI.shop(1.2),'Unternehmen'],['finanziell',540,MI.safe(1.1,0.7),'Finanziell frei'],['leben',850,MI.sun(1.3),'Traumleben']];
  let s='';
  items.forEach(([w,x,art,lab])=>{ const tw=h.wt(w), k=E.out(h.p(t,tw-0.25,tw+0.2));
    s+=mCard(x,760,270,320,G(art,{y:-30})+MCAPS(0,120,lab,{size:18,ls:3,fill:MW}),{s:0.85+0.15*pop(k),op:0.15+0.85*k}); });
  s+=MCAPS(540,520,'Dein Traum',{size:22,fill:MW});
  return s;
},
laugh(t,d,S,h){
  const q=[['träum','„Träum weiter.“',300,560],['das','„Das schaffst du nicht.“',700,700],['bleib','„Bleib auf dem Boden.“',360,840]];
  let s=mGround(GY)+mPerson(540,GY,0.9,{lit:false});
  [[200,0],[880,1]].forEach(([x,i])=>{ s+=mPerson(x,GY,0.75,{lit:false,bob:-Math.abs(Math.sin(t*10+i))*6}); });
  q.forEach(([w,txt,x,y],i)=>{ const tw=h.wt(w), k=h.p(t,tw-0.15,tw+0.25); if(k>0) s+=sBubble(x,y,txt,{s:pop(k),dim:true,tx:i%2?-80:80}); });
  return s;
},
doubt(t,d,S,h){
  const k=E.inOut(h.p(t,0.2,d-0.4));
  let s=mGround(GY)+mPerson(540,GY,1.1-0.35*k,{lit:false,op:1-0.3*k});
  s+=G(mCloud(0,0,0.6,MT(0,24,'?',{size:110,w:700,fill:MG})),{x:540,y:lerp(720,820,k),s:0.7+0.3*k});
  s+=mPill(540,520,'Selbstzweifel',{outline:true,op:E.out(h.p(t,0.6,1.0))});
  return s;
},
understand(t,d,S,h){
  const ni=h.wt('nie'), k=h.p(t,ni-0.1,ni+0.3);
  let s=mGround(GY)+mPerson(260,GY,1.0);
  // Couch mit Freunden
  s+=`<path d="M560,${GY} V${GY-90} H960 V${GY} M540,${GY-90} V${GY-150} Q540,${GY-170} 560,${GY-170} H960 Q980,${GY-170} 980,${GY-150} V${GY-90}" fill="none" stroke="${MG}" stroke-width="4"/>`;
  [640,760,880].forEach(x=>{ s+=mPerson(x,GY-90,0.55,{lit:false}); });
  s+=G(flag(0.9),{x:900,y:620})+`<line x1="740" y1="${GY-200}" x2="880" y2="660" stroke="${MG}" stroke-width="2" stroke-dasharray="6 10" opacity=".6"/>`;
  if(k>0) s+=mPill(760,520,'Nie versucht',{s:pop(k)});
  return s;
},
push(t,d,S,h){
  const gr=h.wt('größer'), k=E.inOut(h.p(t,gr-0.3,d-0.3));
  let s=mGround(GY)+mSpot(540,GY,280,560,0.4+0.6*k);
  [[220,0],[360,0.15],[720,0.3],[860,0.45]].forEach(([x,a])=>{ s+=rich(x,GY,0.8,h.p(t,a,a+0.4)); s+=arrowUp(x,GY-300,h.p(t,gr-0.3+a*0.5,gr+a*0.5)); });
  s+=mPerson(540,GY,0.8+0.5*k);
  return s;
},
surround(t,d,S,h){
  const rows=[['herausfordern','Fordern dich heraus'],['glauben','Glauben an dich']];
  let s='';
  rows.forEach(([w,lab],i)=>{ const tw=h.wt(w), k=h.p(t,tw-0.25,tw+0.15), y=640+i*200, last=i===1;
    s+=mCard(540,y,700,150,mCheck(-270,0,1.1*pop(k))+MT(-210,16,lab,{size:46,w:last?700:600,anchor:'start',fill:k>0?MW:'#555',glow:last&&k>0}),{dim:k<0.5}); });
  s+=MCAPS(540,500,'Dein Umfeld sollte',{size:22,fill:MW});
  return s;
},
end1(t,d,S,h){
  const ke=h.wt('keine'), k=h.p(t,ke-0.1,ke+0.35);
  let s=mGround(GY)+mPerson(540,GY,1.0);
  s+=G(mCloud(0,0,0.8,G(flag(0.75),{y:40,x:-22})),{x:540,y:720});
  [[230,0],[370,1],[710,2],[850,3]].forEach(([x,i])=>{ s+=mPerson(x,GY,0.7,{lit:false,op:1-0.6*k}); });
  if(k>0) s+=mPill(540,500,'Freunde, die verstehen',{outline:true,op:0.8})+`<line x1="${350}" y1="500" x2="${350+380*E.out(k)}" y2="500" stroke="${MW}" stroke-width="5"/>`;
  return s;
},
end2(t,d,S,h){
  let s=mGround(GY)+mSpot(540,GY,300,520)+mStage(540,GY,140)+mPerson(540,GY,1.2);
  [[230,0],[370,0.15],[710,0.3],[850,0.45]].forEach(([x,a])=>{ s+=rich(x,GY,0.85,h.p(t,0.2+a,0.6+a)); });
  return s;
},
};
