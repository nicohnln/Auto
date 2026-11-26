/* "Der größte Denkfehler, der dich dein Leben lang arm hält" – Millionärs Edition Nr. 2, Mono-Stil, ohne Voice-over
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const GY=1150;
const eur=v=>fmtVal(v,'int')+' €';
const diamond=(s=1)=>`<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4" stroke-linejoin="round"><path d="M-40,-14 L-24,-36 H24 L40,-14 L0,40Z"/><path d="M-40,-14 H40 M-12,-36 L0,-14 L12,-36 M-14,-14 L0,40 L14,-14"/></g>`;
const wallet=(s=1)=>`<g transform="scale(${s})" fill="none" stroke="${MW}" stroke-width="4" stroke-linejoin="round"><rect x="-60" y="-40" width="120" height="80" rx="12"/><path d="M20,-14 H60 V14 H20 Q8,14 8,0 Q8,-14 20,-14Z"/><circle cx="26" cy="0" r="4" fill="${MW}"/></g>`;
const minus=(x,y,k)=>k>0?`<g transform="translate(${x},${y}) scale(${E.outBack(k)})"><circle r="22" fill="${MW}" filter="url(#glowS)"/><rect x="-10" y="-3" width="20" height="6" fill="#000"/></g>`:'';
function lines2(k){ // Einkommen und Ausgaben wachsen gemeinsam
  const x0=170,y0=1080,w=740,hh=420; let a='',b='';
  for(let i=0;i<=40;i++){ const f=i/40; if(f>k) break; const v=f*0.9+0.08*Math.sin(f*9); a+=(i?' L':'M')+`${x0+f*w},${y0-v*hh}`; b+=(i?' L':'M')+`${x0+f*w},${y0-(v-0.03)*hh}`; }
  return `<line x1="${x0}" y1="${y0}" x2="${x0+w}" y2="${y0}" stroke="#555" stroke-width="2"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0-hh-40}" stroke="#555" stroke-width="2"/>
    <path d="${a}" stroke="${MW}" stroke-width="6" fill="none" filter="url(#glowS)"/><path d="${b}" stroke="#8c8c8c" stroke-width="6" fill="none" stroke-dasharray="14 10"/>`; }

const SCENES={
hook(t,d,S,h){ return mGround(GY)+mSpot(540,GY,300,560)+mStage(540,GY,140)+mPerson(540,GY,1.35); },
belief(t,d,S,h){
  const pr=h.wt('problem'), k=E.outBack(h.p(t,0.1,0.5));
  let s=mGround(GY)+mPerson(540,GY,1.1);
  s+=G(mCloud(0,0,1,MT(0,-30,'Mehr Gehalt',{size:38,w:700})+MT(0,20,'= reich',{size:38,w:700})),{x:540,y:640,s:k});
  if(t>pr) s+=mX(760,560,1.6*E.outBack(h.p(t,pr,pr+0.3)))+mPill(540,420,'Das Problem',{s:E.outBack(h.p(t,pr,pr+0.3))});
  return s;
},
salary(t,d,S,h){
  const st=[['3000',3000],['4000',4000],['5000',5000]]; let v=0, n=0;
  st.forEach(([w,val],i)=>{ if(t>=h.wt(w)-0.1){ v=val; n=i+1; } });
  let s=mGround(GY)+mPerson(540,GY,1.1)+mSpot(540,GY,260,640,0.5+0.2*n);
  if(n) s+=mNumber(540,640,'Dein Gehalt',eur(v),{size:96,s:1+0.04*h.pulse(t,st[n-1][0],0.3)});
  [0,1,2].forEach(i=>{ if(i<n) s+=mCoin(780,GY-40-i*60,0.9); });
  return s;
},
what(t,d,S,h){ return mGround(GY)+mPerson(540,GY,1.0,{lit:false})+G(MT(0,70,'?',{size:260,w:700,glow:true}),{x:540,y:640,s:E.outBack(h.p(t,0.05,0.35))*(1+0.05*Math.sin(t*6))}); },
spend(t,d,S,h){
  const items=[['auto',230,MI.car(1.5),'Auto'],['wohnung',540,MI.house(1.6),'Wohnung'],['luxus',850,diamond(1.4),'Luxus']];
  let s=mGround(GY)+mPerson(540,GY,0.9,{lit:false});
  items.forEach(([w,x,art,lab])=>{ const tw=h.wt(w), k=E.out(h.p(t,tw-0.2,tw+0.2));
    s+=mCard(x,720,250,280,G(art,{y:-20,op:0.3+0.7*k})+MCAPS(0,110,lab,{size:22,fill:MW,op:0.3+0.7*k}),{s:0.94+0.06*k,dim:k<0.5})+minus(x+100,600,h.p(t,tw,tw+0.3)); });
  return s;
},
zero(t,d,S,h){
  const ni=h.wt('nichts'), k=h.p(t,ni,ni+0.4);
  let s=mGround(GY)+mPerson(540,GY,1.0,{lit:false})+G(wallet(1.8),{x:540,y:800,s:1+0.06*h.pulse(t,'nichts',0.4)});
  if(k>0) s+=mX(650,740,1.2*E.outBack(k));
  return s;
},
grow(t,d,S,h){
  const k=E.inOut(h.p(t,0.1,d-0.3)), mi=h.wt('mitgewachsen');
  let s=lines2(k)+MCAPS(910,1120,'Zeit',{size:18,anchor:'end'});
  s+=MCAPS(190,560,'Einkommen',{size:20,anchor:'start',fill:MW,op:E.out(h.p(t,0.2,0.6))});
  if(t>mi-0.3) s+=MCAPS(190,600,'Ausgaben',{size:20,anchor:'start',fill:'#9a9a9a',op:E.out(h.p(t,mi-0.3,mi+0.1))})+mPill(540,470,'Am Ende: 0 €',{s:E.outBack(h.p(t,mi,mi+0.3))});
  return s;
},
question(t,d,S,h){
  const ni=h.wt('nicht'), so=h.wt('sondern');
  let s=mGround(GY)+mPerson(540,GY,1.0);
  const k1=E.out(h.p(t,ni-0.2,ni+0.2)), k2=E.out(h.p(t,so-0.2,so+0.2));
  if(k1>0) s+=mCard(540,620,700,130,MT(0,14,'„Wie verdiene ich mehr?“',{size:40,w:600,op:0.7})+(t>so?`<line x1="-300" y1="2" x2="${-300+600*E.out(h.p(t,so,so+0.4))}" y2="2" stroke="${MW}" stroke-width="5"/>`:''),{s:k1,dim:true});
  if(k2>0) s+=mCard(540,820,760,150,MT(0,16,'„Wie arbeitet mein Geld für mich?“',{size:40,w:700,glow:true}),{s:k2});
  return s;
},
proof(t,d,S,h){
  const k=h.p(t,0.3,d-0.4), months=Math.round(120*E.inOut(k));
  let s=mGround(GY)+mPerson(380,GY,1.1)+mSpot(380,GY,240,600);
  s+=G(MI.safe(1,clamp(E.inOut(k),0,1)),{x:720,y:GY-130,s:1.8});
  for(let i=0;i<4;i++){ const p=((t*1.4)+i/4)%1; s+=mCoin(lerp(470,690,p),GY-200-Math.sin(p*Math.PI)*120,0.6,{op:1-p*0.5}); }
  s+=MCAPS(540,1230,`Monat ${months} von 120`,{size:18,fill:'#9a9a9a'});
  return s;
},
turn(t,d,S,h){
  const so=h.wt('sondern'), k=h.p(t,so-0.2,d);
  let s=mGround(GY)+mPerson(400,GY,1.1)+G(MI.safe(1,0.3+0.6*E.inOut(k)),{x:700,y:GY-120,s:1.6});
  for(let i=0;i<3;i++){ const p=((t*1.2)+i/3)%1; if(t>so) s+=mCoin(lerp(480,660,p),GY-180-Math.sin(p*Math.PI)*90,0.55,{op:1-p*0.5}); }
  return s;
},
end(t,d,S,h){ return mGround(GY)+mSpot(540,GY,320,560)+mStage(540,GY,150)+mPerson(540,GY,1.4); },
};
