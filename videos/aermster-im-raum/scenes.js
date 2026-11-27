/* "Wenn du der Ärmste in einem Raum voller Millionäre bist" – Millionärs Edition Nr. 4, Mono-Stil, ohne Voice-over
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1150;
const pop=(k)=>E.outBack(clamp(k,0,1));
// Millionär: Person mit €-Münze über dem Kopf
const rich=(x,y,s,k=1,o={})=>mPerson(x,y,s,o)+(k>0?mCoin(x,y-250*s,0.7*s*pop(k),{fill:true}):'');
// Raum: Rahmen mit Tür
const room=(op=1)=>`<g opacity="${op}"><rect x="90" y="560" width="900" height="${GY-560}" rx="6" fill="none" stroke="${MW}" stroke-width="4" filter="url(#glowS)"/><rect x="860" y="${GY-250}" width="90" height="250" fill="none" stroke="${MG}" stroke-width="3"/><circle cx="872" cy="${GY-125}" r="5" fill="${MG}"/></g>`;
const bulb=(s=1,on=1)=>`<g transform="scale(${s})" ${on>0.5?'filter="url(#glow)"':''}><path d="M-34,-10 A40,40 0 1 1 34,-10 Q22,8 20,26 H-20 Q-22,8 -34,-10Z" fill="${on>0.5?MW:'#050505'}" stroke="${MW}" stroke-width="4"/><path d="M-16,36 H16 M-12,46 H12" stroke="${MW}" stroke-width="4" stroke-linecap="round"/></g>`;
const flag=(s=1)=>`<g transform="scale(${s})" filter="url(#glowS)"><path d="M0,0 V-110" stroke="${MW}" stroke-width="5"/><path d="M0,-110 L64,-90 L0,-70Z" fill="${MW}"/></g>`;

const SCENES={
hook(t,d,S,h){
  let s=room(E.out(h.p(t,0,0.4)));
  [[230,0.1],[400,0.25],[690,0.4]].forEach(([x,a])=>{ s+=rich(x,GY,0.85,h.p(t,a,a+0.4)); });
  s+=mPerson(545,GY,0.62,{lit:false,bob:-6*Math.abs(Math.sin(t*2))});
  s+=MCAPS(545,GY+50,'Du',{size:22,fill:MW,op:E.out(h.p(t,0.6,1))});
  return s;
},
why(t,d,S,h){
  const an=h.wt('anders'), k=h.p(t,an-0.1,an+0.4);
  let s=room(0.5);
  [[220,0],[370,0.15],[720,0.3],[860,0.45]].forEach(([x,a])=>{ s+=rich(x,GY,0.75,h.p(t,a,a+0.3)); });
  s+=mPerson(545,GY,0.8,{lit:k>0.5});
  [[220,-1],[370,-1],[720,1],[860,1]].forEach(([x])=>{ if(k>0) s+=`<line x1="${x}" y1="${GY-120}" x2="${lerp(x,545,k)}" y2="${lerp(GY-120,GY-170,k)}" stroke="${MG}" stroke-width="2" stroke-dasharray="6 8" opacity="${0.8*k}"/>`; });
  if(k>0) s+=G(mCloud(0,0,0.8,MT(0,-28,'Ganz anders',{size:38,w:700})+MT(0,16,'denken',{size:38,w:700})),{x:545,y:760,s:pop(k)});
  return s;
},
afford(t,d,S,h){
  const ue=h.wt('überlegen'), kL=E.out(h.p(t,0.05,0.4)), kR=E.out(h.p(t,ue-0.2,ue+0.3));
  let s=mDivider(540,430,1220)+mGround(GY,{x1:520})+mGround(GY,{x0:560});
  s+=MCAPS(270,470,'Du',{size:22,op:kL})+MCAPS(810,470,'Millionäre',{size:20,fill:MW,op:kR});
  s+=mPerson(270,GY,0.8,{lit:false,op:kL});
  s+=G(mCloud(0,0,0.74,MT(0,-30,'Kann ich mir',{size:34,w:600,fill:'#bdbdbd'})+MT(0,12,'das leisten?',{size:34,w:600,fill:'#bdbdbd'})),{x:270,y:760,s:kL});
  if(kR>0) s+=rich(810,GY,0.8,kR)+G(mCloud(0,0,0.74,MT(0,-30,'Wie kann ich',{size:34,w:700})+MT(0,12,'es mir leisten?',{size:34,w:700})),{x:810,y:760,s:kR});
  return s;
},
talk(t,d,S,h){
  const ge=h.wt('gehalt');
  let s=mDivider(540,430,1220);
  s+=MCAPS(270,500,'Du',{size:22})+MCAPS(810,500,'Millionäre',{size:20,fill:MW,op:E.out(h.p(t,h.wt('sie')-0.2,h.wt('sie')+0.2))});
  s+=mCard(270,800,300,300,G(MI.doc(1.4),{y:-30})+MCAPS(0,110,'Gehalt',{size:22}),{dim:true,s:0.9+0.1*pop(h.p(t,ge-0.3,ge+0.1))});
  [['investments','Investments',640],['unternehmen','Unternehmen',800],['möglichkeiten','Möglichkeiten',960]].forEach(([w,lab,y])=>{
    const tw=h.wt(w), k=h.p(t,tw-0.2,tw+0.2); if(k>0) s+=mPill(810,y,lab,{s:pop(k),size:24}); });
  return s;
},
head(t,d,S,h){
  const ko=h.wt('kopf'), k=h.p(t,ko-0.1,ko+0.3);
  let s=mGround(GY)+mSpot(540,GY,300,520,0.3+0.7*k)+mPerson(540,GY,1.4,{lit:k>0.5});
  s+=G(bulb(1.3,k),{x:540,y:GY-360-8*Math.sin(t*3),s:0.7+0.3*pop(h.p(t,0.1,0.5))});
  if(k>0) for(let i=0;i<8;i++){ const a=i*Math.PI/4; s+=`<line x1="${540+Math.cos(a)*80}" y1="${GY-380+Math.sin(a)*80}" x2="${540+Math.cos(a)*(80+30*k)}" y2="${GY-380+Math.sin(a)*(80+30*k)}" stroke="${MW}" stroke-width="4" stroke-linecap="round" opacity="${k}"/>`; }
  return s;
},
questions(t,d,S,h){
  const fr=h.wt('fragen');
  let s=mGround(GY)+mPerson(540,GY,1.0);
  const qs=[['Wie funktioniert das?',330,760],['Warum nicht ich?',760,680],['Was wäre möglich?',520,560]];
  qs.forEach(([q,x,y],i)=>{ const a=fr-0.3+i*0.4, k=h.p(t,a,a+0.35); if(k>0) s+=mPill(x,y,q,{s:pop(k),outline:i!==1,size:22}); });
  return s;
},
chances(t,d,S,h){
  const ch=h.wt('chancen'), k=h.p(t,ch-0.2,d-0.3);
  const lit=[[1,0],[4,1],[2,2],[5,3],[0,3],[3,4]];
  let s=mDots(540,780,7,6,110,(c,r)=>{ const idx=lit.findIndex(([a,b])=>a===c&&b===r); return idx>=0&&k>idx/lit.length; });
  lit.forEach(([c,r],i)=>{ const q=clamp((k-i/lit.length)*lit.length/0.6,0,1); if(q>0){ const x=540+(c-3)*110, y=780+(r-2.5)*110; s+=`<circle cx="${x}" cy="${y}" r="${22*E.outBack(q)}" fill="${MW}" filter="url(#glowS)"/>`; } });
  s+=mMagnifier(540+180*Math.sin(t*1.3),780+120*Math.cos(t*1.1),0.9);
  s+=mPill(540,470,'Chancen',{s:pop(h.p(t,ch-0.1,ch+0.3))});
  return s;
},
goals(t,d,S,h){
  const pl=h.wt('plötzlich'), un=h.wt('unerreichbar'), k=E.inOut(h.p(t,pl-0.2,un));
  let s=mGround(GY)+mPerson(260,GY,1.0);
  const fx=lerp(900,560,k), fy=lerp(620,GY,k), fs=lerp(0.4,1.3,k);
  s+=G(flag(1),{x:fx,y:fy,s:fs});
  if(k<0.98) s+=`<line x1="330" y1="${GY-60}" x2="${fx-20}" y2="${fy-20}" stroke="${MG}" stroke-width="2" stroke-dasharray="6 10"/>`;
  const done=t>un-0.1;
  s+=done?G(mPill(540,500,'Unerreichbar',{outline:true,op:0.5})+`<line x1="425" y1="500" x2="${425+230*E.out(h.p(t,un-0.1,un+0.3))}" y2="500" stroke="${MW}" stroke-width="5"/>`,{})+mPill(540,580,'Erreichbar',{s:pop(h.p(t,un,un+0.3))}):mPill(540,500,'Unerreichbar',{outline:true,op:E.out(h.p(t,0.2,0.6))});
  return s;
},
truth(t,d,S,h){
  const ni=h.wt('nicht'), k=h.p(t,ni,ni+0.35);
  let s=room(0.4)+rich(300,GY,0.85)+rich(780,GY,0.85);
  s+=mPerson(540,GY,0.9,{lit:false});
  if(k>0) s+=mX(540,GY-300,1.3*pop(k));
  return s;
},
act(t,d,S,h){
  const rows=[['zuhören','Zuhören'],['lernen','Lernen'],['handeln','Anders handeln']];
  let s='';
  rows.forEach(([w,lab],i)=>{ const tw=h.wt(w), k=h.p(t,tw-0.25,tw+0.15), y=560+i*190, last=i===2;
    s+=mCard(540,y,640,140,mCheck(-240,0,1.1*pop(k))+MT(-180,16,lab,{size:46,w:last?700:600,anchor:'start',fill:k>0?MW:'#555',glow:last&&k>0}),{dim:k<0.5,s:last&&k>0?1+0.03*h.pulse(t,'handeln',0.4):1}); });
  return s;
},
end1(t,d,S,h){
  const er=h.wt('erfolgreichste'), k=h.p(t,er-0.1,er+0.4);
  let s=room(0.6);
  [[250,0.1],[400,0.2],[690,0.3]].forEach(([x,a])=>{ s+=mPerson(x,GY,0.55,{lit:false,op:E.out(h.p(t,a,a+0.3))}); });
  s+=mPerson(545,GY,1.05)+(t>er-0.1?mCoin(545,GY-270,0.7*pop(k),{fill:true}):'');
  if(k>0) s+=mPill(545,480,'Der Erfolgreichste',{s:pop(k)})+mX(760,480,0.9*pop(h.p(t,er+0.3,er+0.6)));
  return s;
},
end2(t,d,S,h){
  let s=mGround(GY)+mSpot(540,GY,300,520)+mStage(540,GY,130)+mPerson(540,GY,1.05,{lit:false});
  [[250,0],[380,0.15],[710,0.3],[840,0.45]].forEach(([x,a])=>{ s+=rich(x,GY,0.95,h.p(t,0.2+a,0.6+a)); });
  return s;
},
};
