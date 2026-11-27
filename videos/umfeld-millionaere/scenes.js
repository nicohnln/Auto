/* "Wenn du mit 2 Millionären abhängst, wirst du der 3." – Millionärs Edition Nr. 3, Mono-Stil, ohne Voice-over
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1150;
const pop=(k)=>E.outBack(clamp(k,0,1));
// Millionär: Person mit kleiner €-Münze über dem Kopf
const rich=(x,y,s,k=1,o={})=>mPerson(x,y,s,o)+(k>0?mCoin(x,y-250*s,0.75*s*pop(k),{fill:true}):'');
const flag=(s=1)=>`<g transform="scale(${s})" filter="url(#glowS)"><path d="M0,0 V-110" stroke="${MW}" stroke-width="5"/><path d="M0,-110 L64,-90 L0,-70Z" fill="${MW}"/></g>`;
const calIcon=(s=1)=>`<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4" stroke-linejoin="round"><rect x="-44" y="-36" width="88" height="80" rx="8"/><path d="M-44,-14 H44 M-24,-48 V-26 M24,-48 V-26"/><path d="M-24,4 h12 M-6,4 h12 M12,4 h12 M-24,24 h12 M-6,24 h12"/></g>`;
const chartIcon=(s=1)=>`<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M-46,40 H46 M-46,40 V-44"/><path d="M-34,22 L-10,-2 L8,12 L40,-30"/><path d="M24,-30 H40 V-14"/></g>`;

const SCENES={
hook(t,d,S,h){
  const dr=h.wt('dritte'), k=h.p(t,dr-0.1,dr+0.4);
  let s=mGround(GY)+mSpot(540,GY,260,520,0.3+0.7*k)+rich(250,GY,1.0,h.p(t,0.2,0.6))+rich(830,GY,1.0,h.p(t,0.4,0.8));
  s+=mPerson(540,GY,1.1,{lit:k>0.5,op:0.6+0.4*k});
  if(k>0) s+=mCoin(540,GY-280,0.85*pop(k),{fill:true})+MCAPS(540,GY+60,'Nr. 3',{size:22,fill:MW,op:k});
  return s;
},
why(t,d,S,h){
  const dw=h.wt('denkweise'), k=h.p(t,dw-0.1,dw+0.4);
  let s=mGround(GY);
  [[200,0.15],[360,0.3],[720,0.45],[880,0.6]].forEach(([x,a])=>{ s+=mPerson(x,GY,0.75,{lit:false,op:E.out(h.p(t,a,a+0.3))}); });
  s+=mPerson(540,GY,1.1);
  s+=G(mCloud(0,0,0.85,MT(0,10,'Denkweise',{size:40,w:700})),{x:540,y:720,s:pop(k)});
  // Linien vom Umfeld zum Kopf
  if(k>0) [200,360,720,880].forEach(x=>{ s+=`<line x1="${x}" y1="${GY-140}" x2="${lerp(x,540,k)}" y2="${lerp(GY-140,GY-200,k)}" stroke="${MG}" stroke-width="2" stroke-dasharray="6 8" opacity="${0.8*k}"/>`; });
  return s;
},
talk(t,d,S,h){
  const mi=h.wt('millionäre'), kL=E.out(h.p(t,0.05,0.4)), kR=E.out(h.p(t,mi-0.2,mi+0.3));
  let s=mDivider(540,430,1220)+mGround(GY,{x1:520})+mGround(GY,{x0:560});
  s+=MCAPS(270,470,'Alte Freunde',{size:20,op:kL})+MCAPS(810,470,'Millionäre',{size:20,fill:MW,op:kR});
  [190,350].forEach(x=>{ s+=mPerson(x,GY,0.7,{lit:false,op:kL}); });
  s+=G(mCloud(0,0,0.72,MT(0,-30,'Alles ist',{size:36,w:600,fill:'#bdbdbd'})+MT(0,14,'so teuer …',{size:36,w:600,fill:'#bdbdbd'})),{x:270,y:740,s:kL});
  if(kR>0){ [730,890].forEach(x=>{ s+=rich(x,GY,0.7,kR); });
    s+=G(mCloud(0,0,0.72,MT(0,-30,'Neue',{size:36,w:700})+MT(0,14,'Einnahmen',{size:36,w:700})),{x:810,y:740,s:kR}); }
  return s;
},
plan(t,d,S,h){
  const si=h.wt('sie'), kL=E.out(h.p(t,0.05,0.4)), kR=E.out(h.p(t,si-0.2,si+0.3));
  let s=mDivider(540,430,1220);
  s+=MCAPS(270,500,'Andere',{size:20,op:kL})+MCAPS(810,500,'Millionäre',{size:20,fill:MW,op:kR});
  s+=mCard(270,780,320,360,G(MI.sun(1.2),{y:-40})+MCAPS(0,120,'Wochenende',{size:22}),{dim:true,op:kL,s:0.9+0.1*kL});
  if(kR>0) s+=mCard(810,780,320,360,G(chartIcon(1.4),{y:-40})+MCAPS(0,112,'Nächstes',{size:18,ls:3,fill:MW})+MCAPS(0,140,'Geschäft',{size:18,ls:3,fill:MW}),{s:0.9+0.1*kR,op:kR});
  return s;
},
questions(t,d,S,h){
  const fr=h.wt('fragen');
  let s=mGround(GY)+mSpot(540,GY,240,460)+mPerson(540,GY,1.1);
  const qs=[['Was ist möglich?',330,720],['Wie baue ich das auf?',760,640],['Von wem lerne ich?',560,520]];
  qs.forEach(([q,x,y],i)=>{ const a=fr-0.3+i*0.35, k=h.p(t,a,a+0.35); if(k>0) s+=mPill(x,y,q,{s:pop(k),outline:i!==1,size:22}); });
  return s;
},
see(t,d,S,h){
  const pr=h.wt('probleme'), k=h.p(t,0.2,0.8), kp=h.p(t,pr-0.1,pr+0.3);
  let s=mGround(GY)+mPerson(260,GY,1.0);
  s+=mCard(700,620,440,130,MT(0,16,'Problem',{size:48,w:600,fill:'#8c8c8c'})+(kp>0?`<line x1="-110" y1="0" x2="${-110+220*E.out(kp)}" y2="0" stroke="${MW}" stroke-width="5"/>`:''),{dim:true});
  s+=mCard(700,860,500,150,MT(0,18,'Möglichkeit',{size:56,w:700,glow:true}),{s:pop(k)});
  s+=mMagnifier(900+14*Math.sin(t*1.6),980+10*Math.cos(t*1.6),0.8);
  return s;
},
goals(t,d,S,h){
  const no=h.wt('normal'), steps=5, sw=130, sh=70, x0=200, y0=GY;
  const k=E.inOut(h.p(t,0.2,no+0.2)), pos=k*(steps-1);
  let s=mGround(GY);
  let path=`M${x0},${y0}`; for(let i=0;i<steps;i++){ path+=` V${y0-(i+1)*sh} H${x0+(i+1)*sw}`; }
  s+=`<path d="${path} V${y0}" fill="none" stroke="${MW}" stroke-width="4" filter="url(#glowS)"/>`;
  s+=G(flag(1.1),{x:x0+steps*sw-40,y:y0-steps*sh});
  const i=Math.floor(pos), f=pos-i, px=x0+sw*(i+0.5)+sw*f, py=y0-(i+1)*sh-Math.sin(f*Math.PI)*30;
  s+=mPerson(px,py,0.6);
  const ok=t>no-0.1;
  s+=ok?mPill(540,520,'Normal',{s:pop(h.p(t,no-0.1,no+0.25))}):mPill(540,520,'Unmöglich',{outline:true,op:E.out(h.p(t,0.3,0.7))});
  return s;
},
truth(t,d,S,h){
  const ni=h.wt('nicht'), k=h.p(t,ni,ni+0.35);
  let s=mGround(GY)+rich(260,GY,0.95)+rich(820,GY,0.95);
  s+=mPerson(540,GY,1.05,{lit:false});
  if(k>0) s+=mX(540,GY-330,1.4*pop(k));
  return s;
},
act(t,d,S,h){
  const rows=[['gewohnheiten','Gewohnheiten übernehmen'],['lernen','Von ihnen lernen'],['handeln','Selbst handeln']];
  let s='';
  rows.forEach(([w,lab],i)=>{ const tw=h.wt(w), k=h.p(t,tw-0.25,tw+0.15), y=560+i*190, last=i===2;
    s+=mCard(540,y,760,140,mCheck(-300,0,1.1*pop(k))+MT(-240,14,lab,{size:42,w:last?700:600,anchor:'start',fill:k>0?MW:'#555',glow:last&&k>0}),{dim:k<0.5,s:last&&k>0?1+0.03*h.pulse(t,'handeln',0.4):1}); });
  return s;
},
invest(t,d,S,h){
  const so=h.wt('sondern'), k=h.p(t,so-0.1,so+0.4);
  let s=mGround(GY);
  s+=mCoin(540-260*E.inOut(k),GY-160,2.2,{op:1-0.6*k});
  if(k>0.05) s+=mX(540-260*E.inOut(k)+60,GY-230,0.9*pop(k));
  if(k>0) [[600,0.8],[720,0.95],[840,0.8]].forEach(([x,sc],i)=>{ s+=mPerson(x,GY,sc,{op:E.out(h.p(t,so+i*0.15,so+i*0.15+0.3))}); });
  return s;
},
end(t,d,S,h){
  const r=E.out(h.p(t,0.2,1.2));
  let s=mGround(GY)+mSpot(540,GY,300,520)+mStage(540,GY,140)+mPerson(540,GY,1.25);
  [[230,0],[380,0.2],[700,0.4],[850,0.6]].forEach(([x,a])=>{ s+=mPerson(x,GY,0.75,{op:0.35+0.65*E.out(h.p(t,0.2+a,0.6+a)),lit:x>500}); });
  return s;
},
};
