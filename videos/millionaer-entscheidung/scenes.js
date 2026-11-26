/* "Du bist vielleicht nur eine einzige Entscheidung davon entfernt …" – Millionärs Edition Nr. 1, Mono-Stil
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1150, LX=300, RX=780;
const eur=v=>fmtVal(v,'int')+' €';
function lottoCard(s=1,o={}){ let g=`<g transform="scale(${s})"><rect x="-90" y="-120" width="180" height="240" rx="12" fill="#050505" stroke="${MW}" stroke-width="3" filter="url(#glowS)"/>`+MT(0,-82,'LOTTO',{size:26,w:700})+MCAPS(0,-58,'6 aus 49',{size:12,ls:2});
  for(let r=0;r<7;r++)for(let c=0;c<7;c++){ const x=-60+c*20, y=-36+r*20; g+=`<rect x="${x-7}" y="${y-7}" width="14" height="14" fill="none" stroke="#777" stroke-width="1.5"/>`; }
  [[1,2],[4,1],[2,4],[5,5],[0,6],[6,3]].forEach(([c,r])=>{ const x=-60+c*20, y=-36+r*20; g+=`<path d="M${x-6},${y-6} L${x+6},${y+6} M${x+6},${y-6} L${x-6},${y+6}" stroke="${MW}" stroke-width="2.5"/>`; });
  return g+'</g>'; }
function coinStack(x,y,n,s=1){ let g=''; for(let i=0;i<n;i++) g+=`<rect x="${x-34*s}" y="${y-(i+1)*12*s}" width="${68*s}" height="${10*s}" rx="${5*s}" fill="#050505" stroke="${MW}" stroke-width="2.5" ${i===n-1?'filter="url(#glowS)"':''}/>`; return g; }
function curve(x0,y0,w,hh,k,growth,o={}){ let d=''; const N=60; for(let i=0;i<=N;i++){ const f=i/N; if(f>k) break; const v=(Math.pow(growth,f)-1)/(growth-1); d+=(i?' L':'M')+`${x0+f*w},${y0-v*hh}`; }
  return `<path d="${d}" stroke="${o.col||MW}" stroke-width="${o.sw||5}" fill="none" stroke-linecap="round" ${o.dim?'opacity=".45"':'filter="url(#glowS)"'}/>`; }

const SCENES={
hook(t,d,S,h){ return mGround(GY)+mSpot(540,GY,300,700)+mStage(540,GY,140)+mPerson(540,GY,1.35); },
lotto(t,d,S,h){
  const lo=h.wt('lottoschein'), k=E.outBack(h.p(t,lo-0.2,lo+0.2));
  let s=mGround(GY)+mPerson(540,GY,1.0,{lit:false});
  if(k>0) s+=G(lottoCard(1)+mX(0,0,2.2,{r:40,sw:6}),{x:540,y:760,s:k*1.4});
  return s;
},
two(t,d,S,h){
  const k1=E.out(h.p(t,h.wt('zwei')-0.2,h.wt('zwei')+0.3)), kv=E.out(h.p(t,h.wt('verdienen')-0.2,h.wt('verdienen')+0.3));
  let s=mGround(GY)+mDivider(540,560,1250);
  s+=mPerson(LX,GY,1.1,{op:k1})+mPerson(RX,GY,1.1,{op:k1});
  s+=mNumber(LX,800,'Alter','25',{size:70,op:E.out(h.p(t,h.wt('fünfundzwanzig')-0.2,h.wt('fünfundzwanzig')+0.2))})+mNumber(RX,800,'Alter','25',{size:70,op:E.out(h.p(t,h.wt('fünfundzwanzig')-0.2,h.wt('fünfundzwanzig')+0.2))});
  s+=mPill(LX,620,'Gleiches Gehalt',{s:kv,op:kv})+mPill(RX,620,'Gleiches Gehalt',{s:kv,op:kv});
  return s;
},
later(t,d,S,h){
  const k=E.outBack(h.p(t,0.2,0.6));
  let s=mGround(GY)+mDivider(540,560,1250)+mPerson(LX,GY,1.1)+mPerson(RX,GY,1.1,{lit:false,op:0.5});
  s+=G(mCloud(0,0,0.9,MT(0,-14,'Später.',{size:44,w:700})),{x:LX,y:760,s:k});
  return s;
},
now(t,d,S,h){
  const hu=h.wt('hundert'), n=Math.floor(clamp((t-hu)*3,0,8));
  let s=mGround(GY)+mDivider(540,560,1250)+mPerson(LX,GY,1.1,{lit:false,op:0.5})+mPerson(RX,GY,1.1);
  s+=mSpot(RX,GY,240,620,E.out(h.p(t,0,0.5)));
  s+=mNumber(RX,700,'Jeden Monat','100 €',{size:76,op:E.out(h.p(t,hu-0.2,hu+0.2))});
  s+=coinStack(RX+130,GY,n,1);
  return s;
},
tenyears(t,d,S,h){
  const er=h.wt('erste'), k=h.p(t,0.1,er+0.3);
  let s=mTimeline(540,700,820,['25','30','35','45','55','65'],null);
  s+=`<rect x="130" y="${746}" width="${820*E.out(k)}" height="14" rx="7" fill="${MW}" filter="url(#glowS)"/>`+MCAPS(130,790,'Zweiter: ab 25',{size:18,anchor:'start',fill:MW});
  const k2=h.p(t,er-0.1,d); s+=`<rect x="${130+820*0.4}" y="${640}" width="${820*0.6*E.out(k2)}" height="14" rx="7" fill="#9a9a9a"/>`+MCAPS(130+820*0.4,620,'Erster: ab 35',{size:18,anchor:'start',fill:'#bdbdbd',op:E.out(k2)});
  s+=mGround(GY)+mPerson(LX,GY,1.0,{lit:false})+mPerson(RX,GY,1.0);
  return s;
},
result(t,d,S,h){
  const e1=h.wt('erste'), z2=h.wt('zweite'), k1=E.inOut(h.p(t,e1,z2-0.3)), k2=E.inOut(h.p(t,z2,d-0.3));
  let s=mGround(GY)+mDivider(540,520,1250);
  s+=mPerson(LX,GY,1.0,{lit:false})+mPerson(RX,GY,1.0)+mSpot(RX,GY,240,600,k2);
  s+=mNumber(LX,720,'Erster',eur(121997*k1),{size:62})+mNumber(RX,720,'Zweiter',eur(262481*k2),{size:62});
  s+=MCAPS(540,1240,'Beispiel: 100 € / Monat · 7 % p. a. · keine Garantie',{size:16,ls:2,fill:'#8a8a8a'});
  return s;
},
double(t,d,S,h){
  const dp=h.wt('doppelte'), k=h.p(t,0.1,dp+0.3);
  let s=`<line x1="150" y1="1050" x2="930" y2="1050" stroke="#555" stroke-width="2"/><line x1="150" y1="1050" x2="150" y2="560" stroke="#555" stroke-width="2"/>`;
  s+=curve(150+780*0.25,1050,780*0.75,200,E.inOut(k),6,{dim:true})+curve(150,1050,780,440,E.inOut(k),11);
  s+=MCAPS(940,1090,'65',{size:18,anchor:'end'})+MCAPS(150,1090,'25',{size:18,anchor:'start'});
  const kd=E.outBack(h.p(t,dp-0.1,dp+0.3)); if(kd>0) s+=mPill(540,520,'× 2,15',{s:kd*1.4});
  return s;
},
reason(t,d,S,h){
  const ta=h.wt('talent'), gl=h.wt('glück'), tg=h.wt('tag');
  let s=mGround(GY);
  [['Talent',300,ta],['Glück',780,gl]].forEach(([lab,x,tw])=>{ const k=E.out(h.p(t,tw-0.2,tw+0.2)); if(k>0) s+=mCard(x,700,300,150,MT(0,14,lab,{size:44,w:700,op:0.7})+(t>tw+0.1?`<line x1="-110" y1="2" x2="${-110+220*E.out(h.p(t,tw+0.1,tw+0.4))}" y2="2" stroke="${MW}" stroke-width="5"/>`:''),{s:k,dim:true}); });
  const kt=E.outBack(h.p(t,tg-0.2,tg+0.2)); if(kt>0) s+=mCard(540,940,340,170,MCAPS(0,-36,'Ein Tag',{size:20,fill:MW})+MT(0,34,'Tag 1',{size:64,w:700,glow:true}),{s:kt});
  return s;
},
end(t,d,S,h){ return mGround(GY)+mSpot(540,GY,320,760)+mStage(540,GY,150)+mPerson(540,GY,1.4); },
};
