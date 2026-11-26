/* Szenen für "Was wäre, wenn es 1000 Jahre regnen würde?" – Mono-Stil (Schwarz/Weiß/Glow)
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1160; // Bodenlinie
function water(level,t,o={}){ // Wasserfläche von unten bis y=level, weiße Wellenlinie
  let d=`M-20,1300 L-20,${level}`; for(let x=-20;x<=1100;x+=30) d+=` L${x},${level+Math.sin(x*0.025+t*3)*7}`; d+=' L1100,1300Z';
  let w=''; for(let x=-20;x<=1100;x+=30) w+=(x===-20?'M':' L')+`${x},${level+Math.sin(x*0.025+t*3)*7}`;
  return `<path d="${d}" fill="#fff" opacity="${o.op??0.1}"/><path d="${w}" stroke="${MW}" stroke-width="3" fill="none" filter="url(#glowS)"/>`; }
function dinoLine(x,y,s=1,t=0){ const nk=Math.sin(t*1.4)*5; return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#glowS)"><path d="M-260,-40 Q-120,-30 -60,-120 Q20,-180 120,-130 Q150,-115 160,-110 Q210,${-250+nk} 250,${-330+nk} Q270,${-350+nk} 300,${-340+nk} Q310,${-320+nk} 280,${-310+nk} Q250,${-280+nk} 205,-110 Q220,-80 200,-60 L200,0 L160,0 L150,-50 L60,-50 L50,0 L10,0 L0,-60 Q-80,-50 -260,-40Z" fill="#050505" stroke="${MW}" stroke-width="5" stroke-linejoin="round"/><circle cx="284" cy="${-332+nk}" r="6" fill="${MW}"/></g>`; }
function stilt(s=1){ return `<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4"><path d="M-36,-10 V-40 L0,-64 L36,-40 V-10Z"/><path d="M-28,-10 V40 M28,-10 V40 M-28,20 L28,0"/><path d="M-50,30 Q-25,22 0,30 T50,30" opacity=".7"/></g>`; }
function dam(s=1){ return `<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4"><path d="M-50,40 L-30,-40 H30 L50,40Z"/><path d="M-70,-10 Q-60,-16 -50,-10" opacity=".7"/><path d="M-80,10 Q-68,4 -56,10" opacity=".7"/></g>`; }
function pump(s=1,t=0){ return `<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4"><rect x="-34" y="-20" width="68" height="50" rx="8"/><circle cx="0" cy="5" r="14" transform="rotate(${t*200})"/><path d="M34,0 H60 V-36" /><path d="M60,-36 q4,${10+Math.sin(t*10)*4} 8,0" opacity=".8"/></g>`; }

const SCENES={
hook(t,d,S,h){
  return mRain(t,1)+mGround(GY)+mSpot(540,GY,300,700)+mStage(540,GY,140)+mPerson(540,GY,1.35,{bob:Math.sin(t*2)*2});
},
day1(t,d,S,h){
  const re=h.wt('regenschirm'), k=E.outBack(h.p(t,re-0.2,re+0.2));
  let s=mRain(t,0.8)+mGround(GY);
  [[200,0.8],[860,0.8],[380,0.6],[700,0.6]].forEach(([x,sc],i)=>{ s+=mPerson(x,GY,sc,{lit:false,op:0.8})+G(MI.umbrella(1),{x,y:GY-200*sc-40,s:sc*0.9,op:0.5}); });
  s+=mSpot(540,GY,260,640,0.8)+mPerson(540,GY,1.25);
  if(k>0) s+=G(MI.umbrella(1),{x:540,y:GY-250,s:1.25*k});
  return s;
},
flood(t,d,S,h){
  const lv=GY-60*E.inOut(h.p(t,0.2,d-0.3));
  let s=mRain(t,0.9)+G(MI.house(1),{x:540,y:GY-120,s:5})+mGround(GY);
  s+=`<rect x="460" y="${GY-110}" width="160" height="110" fill="none" stroke="${MW}" stroke-width="3" stroke-dasharray="8 8" opacity=".6"/>`+MCAPS(540,GY+50,'Keller',{size:20});
  s+=water(lv,t,{op:0.12});
  return s;
},
flood2(t,d,S,h){
  const lv=GY-300*E.inOut(h.p(t,0.2,d-0.3));
  let s=mRain(t,1)+mGround(GY);
  [[200,3],[540,4],[880,3]].forEach(([x,sc])=>s+=G(MI.house(1),{x,y:GY-30*sc,s:sc}));
  s+=water(lv,t,{op:0.14});
  for(let i=0;i<3;i++){ const p=((t*0.6)+i/3)%1; s+=`<ellipse cx="540" cy="${lv+6}" rx="${40+p*260}" ry="${6+p*20}" fill="none" stroke="${MW}" stroke-width="2" opacity="${0.4*(1-p)}"/>`; }
  return s;
},
adapt(t,d,S,h){
  const items=[['dämme',220,dam(1.2),'Dämme'],['pumpen',540,pump(1.3,t),'Pumpen'],['stelzen',860,stilt(1.4),'Stelzen']];
  let s=mRain(t,0.6)+mGround(GY);
  items.forEach(([w,x,art,lab])=>{ const tw=h.wt(w), k=E.outBack(h.p(t,tw-0.15,tw+0.2)); if(k<=0) return;
    s+=mCard(x,700,250,300,G(art,{y:-30})+MCAPS(0,110,lab,{size:22,fill:MW}),{s:k})+mCheck(x+95,580,0.9*k); });
  s+=mPerson(540,GY,0.9,{bob:0});
  return s;
},
problem(t,d,S,h){
  const so=h.wt('sonne'), k=h.p(t,so-0.3,so+0.4);
  let s=mRain(t,0.8)+mGround(GY);
  s+=G(MI.sun(1),{x:540,y:720,s:3.2,op:1-0.75*k});
  s+=G(MI.cloudIcon(1),{x:lerp(140,470,E.out(k)),y:690,s:2.2})+G(MI.cloudIcon(1),{x:lerp(940,610,E.out(k)),y:760,s:2});
  if(t>so) s+=mX(540,1000,1.6*E.outBack(h.p(t,so,so+0.3)));
  s+=mPerson(540,GY,0.8,{lit:false});
  return s;
},
food(t,d,S,h){
  const w=E.inOut(h.p(t,0.2,d-0.3));
  let s=mRain(t,0.7)+mGround(GY);
  for(let i=0;i<7;i++){ const x=150+i*130, wi=clamp(w*1.4-i*0.06,0,1); s+=G(MI.plant(1,wi),{x,y:GY-40,s:1.5,op:1-0.5*wi}); }
  s+=mPerson(540,GY,0.7,{lit:false,op:0.7});
  return s;
},
mood(t,d,S,h){
  const wi=h.wt('winter'), k=h.p(t,0,wi);
  let s=mRain(t,0.6)+mGround(GY);
  [[200,0.75],[880,0.75],[360,0.6],[720,0.6]].forEach(([x,sc])=>s+=mPerson(x,GY,sc,{lit:false,op:0.6}));
  s+=mPerson(540,GY,1.25,{lit:false,col:lerp(1,0,k)>0.5?'#bcbcbc':'#9a9a9a'});
  let rain=''; for(let i=0;i<10;i++){ const r=rng(i+3); const p=((t*1.8)+r())%1; rain+=`<line x1="${-120+r()*240}" y1="${30+p*90}" x2="${-124+r()*240}" y2="${50+p*90}" stroke="${MW}" stroke-width="3" opacity="${0.8*(1-p)}"/>`; }
  s+=G(mCloud(0,0,1,MCAPS(0,-20,'Grau',{size:30,fill:MW}),{tail:false})+rain,{x:540,y:GY-410,s:0.75+0.25*E.outBack(h.p(t,0.05,0.4))});
  return s;
},
catch(t,d,S,h){
  const ne=h.wt('neun'), k=h.p(t,ne-1.2,ne+0.2);
  let s=G(MI.cloudIcon(1),{x:540,y:620,s:3.2});
  for(let i=0;i<14;i++){ const r=rng(i+9); const p=((t*1.2)+r())%1; s+=G(MI.drop(1,true),{x:420+r()*240,y:760+p*220,s:0.25,op:1-p}); }
  for(let i=0;i<9;i++){ const on=i<Math.round(9*E.out(k)); const x=540+(i-4)*96;
    s+=`<rect x="${x-38}" y="1050" width="76" height="76" rx="12" fill="${on?MW:'#050505'}" stroke="${MW}" stroke-width="3" ${on?'filter="url(#glowS)"':''}/>`+MT(x,1100,i+1,{size:30,w:700,fill:on?'#000':MW}); }
  s+=MCAPS(540,1180,'Tage Regen',{size:20});
  return s;
},
carnian(t,d,S,h){
  const di=h.wt('dinosaurier'), mi=h.wt('million'), km=h.p(t,0.2,mi);
  let s=mRain(t,0.5*(1-h.p(t,di,di+1)))+mGround(GY);
  s+=mTimeline(540,520,820,['−233 Mio.','−200','−150','−100','−50','heute'],0.0+0*km);
  s+=`<rect x="${130}" y="500" width="${60*E.out(km)}" height="40" rx="8" fill="${MW}" opacity=".85" filter="url(#glowS)"/>`+MCAPS(160,480,'1 Mio. Jahre Regen',{size:16,anchor:'start',fill:MW,op:E.out(km)});
  const kd=E.outBack(h.p(t,di-0.3,di+0.2)); if(kd>0) s+=G(dinoLine(0,0,1.1,t),{x:470,y:GY,s:kd});
  return s;
},
end(t,d,S,h){
  const stop=h.p(t,0,h.wt('zeigt')+0.5);
  return mRain(t,1-stop)+mGround(GY)+mSpot(540,GY,320,760,0.6+0.4*stop)+mStage(540,GY,150)+mPerson(540,GY,1.4);
},
};
