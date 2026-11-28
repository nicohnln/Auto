/* "Millionäre kaufen sich etwas, das du nicht im Laden findest: Zeit" – Millionärs Edition Nr. 6, Mono-Stil, ohne Voice-over
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1150;
const pop=(k)=>E.outBack(clamp(k,0,1));
// Uhr mit drehenden Zeigern
const clock=(x,y,r,t,o={})=>{ const a1=t*(o.speed??1)*120, a2=t*(o.speed??1)*10;
  return `<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><circle r="${r}" fill="#050505" stroke="${o.dim?MG:MW}" stroke-width="${r*0.07}" ${o.dim?'':'filter="url(#glowS)"'}/>${[...Array(12)].map((_,i)=>`<path d="M0,${-r*0.82} V${-r*0.7}" stroke="${o.dim?MG:MW}" stroke-width="${r*0.04}" transform="rotate(${i*30})"/>`).join('')}<path d="M0,0 V${-r*0.62}" stroke="${o.dim?MG:MW}" stroke-width="${r*0.05}" stroke-linecap="round" transform="rotate(${a1})"/><path d="M0,0 V${-r*0.42}" stroke="${o.dim?MG:MW}" stroke-width="${r*0.07}" stroke-linecap="round" transform="rotate(${a2})"/><circle r="${r*0.07}" fill="${o.dim?MG:MW}"/></g>`; };
const gear=(x,y,r,rot,o={})=>{ const n=o.n||10; let d=''; for(let i=0;i<n*2;i++){ const a=i*Math.PI/n, a2=(i+1)*Math.PI/n, rr=i%2?r:r*1.22; d+=(i?'L':'M')+`${Math.cos(a)*rr},${Math.sin(a)*rr} L${Math.cos(a2)*rr},${Math.sin(a2)*rr} `; }
  return `<g transform="translate(${x},${y}) rotate(${rot})"><path d="${d}Z" fill="#050505" stroke="${MW}" stroke-width="4" stroke-linejoin="round" filter="url(#glowS)"/><circle r="${r*0.35}" fill="none" stroke="${MW}" stroke-width="4"/></g>`; };
const chartIcon=(s=1)=>`<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M-46,40 H46 M-46,40 V-44"/><path d="M-34,22 L-10,-2 L8,12 L40,-30"/><path d="M24,-30 H40 V-14"/></g>`;
const arrowR=(x,y,w,k=1)=>`<g opacity="${k}"><line x1="${x}" y1="${y}" x2="${x+w}" y2="${y}" stroke="${MW}" stroke-width="5"/><path d="M${x+w+4},${y} l-22,-14 v28Z" fill="${MW}"/></g>`;

const SCENES={
hook(t,d,S,h){
  const ze=h.wt('zeit'), k=h.p(t,ze-0.2,ze+0.4);
  let s=mGround(GY)+mPerson(280,GY,1.0);
  s+=clock(720,860,150*(0.85+0.15*pop(k)),t,{op:0.4+0.6*E.out(h.p(t,0.1,0.6))});
  for(let i=0;i<4;i++){ const p=((t*0.9)+i/4)%1; s+=mCoin(lerp(360,600,p),GY-260-Math.sin(p*Math.PI)*160,0.6,{op:(1-p)*0.9}); }
  return s;
},
two(t,d,S,h){
  const tw=h.wt('3000'), k=h.p(t,tw-0.2,tw+0.3);
  let s=mDivider(540,430,1220)+mGround(GY,{x1:520})+mGround(GY,{x0:560});
  s+=MCAPS(270,470,'Person A',{size:22,fill:MW})+MCAPS(810,470,'Person B',{size:22,fill:MW,op:E.out(h.p(t,0.3,0.7))});
  s+=mPerson(270,GY,1.0)+mPerson(810,GY,1.0,{op:E.out(h.p(t,0.3,0.7))});
  if(k>0) s+=mNumber(270,720,'pro Monat','3.000 €',{size:64,s:pop(k)})+mNumber(810,720,'pro Monat','3.000 €',{size:64,s:pop(k)});
  return s;
},
a(t,d,S,h){
  const gi=h.wt('gibt'), au=h.wt('aus');
  let s=mDivider(540,430,1220)+mGround(GY,{x1:520})+mGround(GY,{x0:560,op:0.3});
  s+=MCAPS(270,470,'Person A',{size:22,fill:MW})+MCAPS(810,470,'Person B',{size:22,op:0.3});
  s+=mPerson(270,GY,1.0)+mPerson(810,GY,1.0,{lit:false,op:0.3});
  for(let i=0;i<3;i++){ const p=((t*0.8)+i/3)%1; s+=mCoin(lerp(120,250,p),lerp(620,GY-220,p),0.55,{op:1-p}); }
  if(t>gi-0.2) for(let i=0;i<3;i++){ const p=((t*1.4)+i/3)%1; s+=mCoin(lerp(300,470,p),lerp(GY-220,640,p),0.55,{op:1-p}); }
  s+=MCAPS(270,GY+60,'Rest am Monatsende',{size:16,ls:3,op:E.out(h.p(t,au-0.2,au+0.2))})+MT(270,GY+130,'0 €',{size:56,w:700,glow:true,op:E.out(h.p(t,au-0.2,au+0.2))});
  return s;
},
b(t,d,S,h){
  const items=[['lernen',640,MI.cap(1.0),'Lernen'],['investieren',830,chartIcon(1.0),'Investieren'],['einnahmequellen',1020,MI.shop(0.85),'Einnahmequellen']];
  let s=mDivider(540,430,1220)+mGround(GY,{x1:520,op:0.3})+mGround(GY,{x0:560});
  s+=MCAPS(270,470,'Person A',{size:22,op:0.3})+MCAPS(810,470,'Person B',{size:22,fill:MW});
  s+=mPerson(270,GY,1.0,{lit:false,op:0.3})+mPerson(810,GY,1.0);
  // Icons rechts oben übereinander
  items.forEach(([w,y,art,lab],i)=>{ const tw=h.wt(w), k=h.p(t,tw-0.25,tw+0.2); if(k>0) s+=mCard(810,560+i*160,400,140,G(art,{x:-130})+MT(-62,10,lab,{size:26,w:600,anchor:'start'}),{s:pop(k)}); });
  return s;
},
diff(t,d,S,h){
  const ve=h.wt('verkauft'), k=h.p(t,ve-0.2,d);
  let s=mGround(GY)+mPerson(540,GY,0.9,{lit:false})+MCAPS(540,GY+50,'Person A',{size:20});
  const cyc=(t-ve)%1.2, kk=t>ve?clamp(cyc/0.8,0,1):0;
  s+=clock(280,760,110,t,{s:1-0.25*kk});
  s+=arrowR(420,760,200,E.out(h.p(t,ve-0.2,ve+0.2)));
  s+=MCAPS(280,930,'Zeit',{size:22,fill:MW})+MCAPS(800,930,'Geld',{size:22,fill:MW,op:E.out(h.p(t,ve,ve+0.3))});
  if(t>ve) s+=mCoin(800,760,2.2*(0.8+0.2*pop(kk)));
  return s;
},
system(t,d,S,h){
  const sc=h.wt('schritt'), sy=h.wt('system'), ge=h.wt('geld');
  let s=mGround(GY);
  // Schritt für Schritt: Blöcke stapeln
  for(let i=0;i<4;i++){ const k=h.p(t,sc-0.2+i*0.3,sc+0.1+i*0.3); if(k>0) s+=`<rect x="${560+i*0}" y="${GY-60-i*60}" width="300" height="56" rx="6" fill="#050505" stroke="${MW}" stroke-width="3" opacity="${k}" transform="translate(0,${(1-E.out(k))*-60})"/>`; }
  const gk=h.p(t,sy-0.2,sy+0.3);
  if(gk>0){ s+=G(gear(0,0,70,t*60),{x:650,y:GY-370,s:pop(gk)})+G(gear(0,0,50,-t*84+18,{n:8}),{x:775,y:GY-420,s:pop(gk)}); }
  if(t>ge-0.2) for(let i=0;i<3;i++){ const p=((t*0.9)+i/3)%1; s+=mCoin(lerp(860,960,p),GY-380+p*300-Math.sin(p*Math.PI)*80,0.6,{op:1-p*0.6}); }
  // Person B entspannt daneben
  s+=mPerson(280,GY,1.0)+MCAPS(280,GY+50,'Person B',{size:20,fill:MW});
  if(t>ge) s+=mPill(280,700,'Arbeitet nicht',{outline:true,s:pop(h.p(t,ge+0.3,ge+0.6))});
  return s;
},
value1(t,d,S,h){
  const we=h.wt('wertvoller'), k=E.inOut(h.p(t,we-0.3,we+0.4)), ang=-14*k;
  let s=mGround(GY);
  s+=`<path d="M500,${GY} H580 L540,${GY-40}Z M540,${GY-30} V${GY-420}" stroke="${MW}" stroke-width="5" fill="#050505"/>`;
  const L=[540-260*Math.cos(ang*Math.PI/180), GY-420-260*Math.sin(-ang*Math.PI/180)*-1], R=[540+260*Math.cos(ang*Math.PI/180), GY-420+260*Math.sin(-ang*Math.PI/180)*-1];
  s+=`<line x1="${L[0]}" y1="${GY-420-(-ang)*-4.5}" x2="${R[0]}" y2="${GY-420+(-ang)*-4.5}" stroke="${MW}" stroke-width="5"/>`;
  const ly=GY-420+ang*-4.5*-1, ry=GY-420-ang*-4.5*-1;
  s+=`<line x1="${L[0]}" y1="${GY-420-(-ang)*-4.5}" x2="${L[0]}" y2="${GY-420-(-ang)*-4.5+90}" stroke="${MG}" stroke-width="2"/><line x1="${R[0]}" y1="${GY-420+(-ang)*-4.5}" x2="${R[0]}" y2="${GY-420+(-ang)*-4.5+90}" stroke="${MG}" stroke-width="2"/>`;
  s+=clock(L[0],GY-420-(-ang)*-4.5+170,80,t*0.3);
  s+=G(MI.car(1.2),{x:R[0],y:GY-420+(-ang)*-4.5+160,op:0.8})+G(MI.watch(0.7),{x:R[0]+60,y:GY-420+(-ang)*-4.5+120,op:0.8});
  s+=MCAPS(L[0],GY+50,'Zeit',{size:22,fill:MW})+MCAPS(R[0],GY+50,'Luxus',{size:22});
  return s;
},
value2(t,d,S,h){
  const ge=h.wt('geld'), ei=h.wt('eine'), k1=h.p(t,ge-0.1,ge+0.3), k2=h.p(t,ei,ei+0.4);
  let s=mGround(GY);
  s+=mCoin(300,880,2.4*(0.6+0.4*pop(k1)),{op:0.3+0.7*k1});
  if(k1>0) s+=`<path d="M200,1010 A110,110 0 1 0 190,860" fill="none" stroke="${MW}" stroke-width="4" opacity="${k1}"/><path d="M190,840 l-14,26 h28Z" fill="${MW}" opacity="${k1}" transform="rotate(-30 190 860)"/>`;
  s+=clock(780,880,120,t*0.5,{op:0.3+0.7*E.out(h.p(t,ei-0.3,ei))});
  if(k2>0) s+=mX(880,770,1.3*pop(k2));
  s+=MCAPS(300,1070,'Kommt zurück',{size:20,op:k1})+MCAPS(780,1070,'Kommt nie zurück',{size:20,fill:MW,op:k2});
  return s;
},
question(t,d,S,h){
  const wi=h.wt('wie'), so=h.wt('sondern');
  let s=mGround(GY)+mPerson(540,GY,1.0);
  const k1=E.out(h.p(t,wi-0.2,wi+0.2)), k2=E.out(h.p(t,so-0.2,so+0.2));
  if(k1>0) s+=mCard(540,620,700,130,MT(0,14,'„Wie verdiene ich mehr Geld?“',{size:38,w:600,op:0.7})+(t>so?`<line x1="-300" y1="2" x2="${-300+600*E.out(h.p(t,so,so+0.4))}" y2="2" stroke="${MW}" stroke-width="5"/>`:''),{s:k1,dim:true});
  if(k2>0) s+=mCard(540,840,840,190,MT(0,-14,'„Wie verdiene ich Geld, ohne',{size:38,w:700,glow:true})+MT(0,40,'meine Lebenszeit zu verkaufen?“',{size:38,w:700,glow:true}),{s:k2});
  return s;
},
end(t,d,S,h){
  let s=mGround(GY)+mSpot(540,GY,300,520)+mStage(540,GY,140)+mPerson(540,GY,1.2);
  s+=clock(800,880,80,t*0.2,{op:E.out(h.p(t,0.3,0.8))})+G(mCheck(0,0,1.1),{x:870,y:800,op:E.out(h.p(t,h.wt('sondern'),h.wt('sondern')+0.4))});
  return s;
},
};
