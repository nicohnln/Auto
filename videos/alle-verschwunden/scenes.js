/* Szenen für "Was wäre, wenn alle Menschen außer dir plötzlich verschwinden?"
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};           // "Du": gleiche Figur im ganzen Video
const youHead=(x,y,s,mood='neutral',r=0)=>G(`<circle r="60" fill="${PAL.skin}"/><path d="M-60,-4 Q-64,-74 0,-72 Q60,-72 62,-6 Q40,-40 0,-44 Q-34,-42 -60,-4Z" fill="${ME.hairC}"/>`+
  (mood==='sleep'?`<path d="M-32,4 q12,8 24,0 M8,4 q12,8 24,0" stroke="#1b1b2b" stroke-width="5" fill="none" stroke-linecap="round"/>`:
   `<circle cx="-20" cy="2" r="13" fill="#fff"/><circle cx="20" cy="2" r="13" fill="#fff"/><circle cx="-18" cy="3" r="6" fill="#1b1b2b"/><circle cx="22" cy="3" r="6" fill="#1b1b2b"/>`)+
  (mood==='shock'?`<ellipse cx="0" cy="34" rx="9" ry="11" fill="#5a2430"/>`:`<path d="M-10,32 h20" stroke="#7a3b3b" stroke-width="5" stroke-linecap="round"/>`),{x,y,s,r});
const road=(y=1180)=>`<rect x="0" y="${y-120}" width="1080" height="260" fill="#1a1d38"/><rect x="0" y="${y-130}" width="1080" height="14" fill="#2f3566"/>${[0,1,2,3,4,5].map(i=>`<rect x="${i*200+20}" y="${y+2}" width="110" height="12" rx="6" fill="#c9cdf0" opacity=".5"/>`).join('')}`;

const SCENES={
wake(t,d,S,h){
  const st=h.wt('still'), awake=t>h.wt('morgen'), k=h.p(t,0,d);
  let s=`<defs><linearGradient id="sun" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffc27a" stop-opacity=".9"/><stop offset="1" stop-color="#7a8cff"/></linearGradient></defs>`;
  s+=`<rect x="150" y="420" width="330" height="380" rx="10" fill="url(#sun)"/>`;
  s+=`<g clip-path="url(#win)"><clipPath id="win"><rect x="150" y="420" width="330" height="380"/></clipPath>${[0,1,2].map(i=>`<rect x="${170+i*100}" y="${640-i*40}" width="80" height="${160+i*40}" fill="#5560a8"/>`).join('')}</g>`;
  s+=`<rect x="150" y="420" width="330" height="380" rx="10" fill="none" stroke="${PAL.purpleD}" stroke-width="22"/><rect x="306" y="420" width="18" height="380" fill="${PAL.purpleD}"/><rect x="150" y="600" width="330" height="18" fill="${PAL.purpleD}"/>`;
  s+=`<path d="M480,430 L980,980 L560,980 L330,800Z" fill="#ffd98a" opacity="${0.08+0.06*k}"/>`;
  s+=`<rect x="110" y="880" width="60" height="300" rx="14" fill="${PAL.wood}"/><rect x="120" y="1010" width="820" height="90" rx="20" fill="#d9dbf0"/><ellipse cx="270" cy="1000" rx="110" ry="40" fill="#f3f4fb"/>`;
  s+=youHead(280,950,1,awake?'neutral':'sleep',-18+(awake?12*E.outBack(h.p(t,h.wt('morgen'),h.wt('morgen')+0.3)):0));
  s+=`<rect x="330" y="960" width="620" height="150" rx="40" fill="#5867d6"/><rect x="330" y="960" width="620" height="34" rx="17" fill="#6c7ae0"/>`;
  // Geräuschpegel: flache Linie
  const kp=E.outBack(h.p(t,st-0.1,st+0.25));
  if(kp>0) s+=panel(760,540,380,170,T(-160,-48,'UMGEBUNG',{size:20,font:'Mono',w:700,fill:'#8d93bd',anchor:'start'})+T(160,-48,'0 dB',{size:20,font:'Mono',w:700,fill:PAL.blue,anchor:'end'})+
    `<rect x="-160" y="14" width="320" height="10" rx="5" fill="${PAL.blue}" opacity=".35"/><line x1="-160" y1="19" x2="160" y2="19" stroke="${PAL.blue}" stroke-width="5"/>`,{s:kp,col:PAL.blue});
  return s;
},
phone(t,d,S,h){
  const ni=h.wt('niemand'), ma=h.wt('mama'), gone=t>ni-0.05;
  const rows=[['Mama','gestern, 23:58',PAL.pink],['Lena','gestern, 22:41','#4ea8ff'],['Jonas','gestern, 21:17','#38f27e'],['Oma','gestern, 19:02','#ffd23f'],['Kevin','gestern, 18:30','#ff9b42']];
  let inner=T(0,-330,'CHATS',{size:32,fill:'#fff'})+T(-200,-376,'07:34',{size:20,font:'Mono',w:500,fill:'#8d93bd',anchor:'start'});
  rows.forEach(([n,last,c],i)=>{ const y=-270+i*118, hi=i===0&&t>ma-0.05, k=E.outBack(h.p(t,0.05+i*0.08,0.35+i*0.08));
    inner+=G(`<rect x="-200" y="0" width="400" height="100" rx="16" fill="${hi?'#3a1f45':'#1f2450'}" ${hi?`stroke="${PAL.pink}" stroke-width="4"`:''}/><circle cx="-148" cy="50" r="32" fill="${c}"/>${T(-148,62,n[0],{size:30,fill:'#141836'})}
      ${T(-100,42,n,{size:30,anchor:'start'})}${T(-100,78,'zuletzt online '+last,{size:18,font:'Mono',w:500,fill:hi?'#ffb3d6':'#8d93bd',anchor:'start'})}
      <circle cx="170" cy="50" r="10" fill="${gone?'#555a80':PAL.green}"/>`,{y,op:clamp(k,0,1),x:(1-k)*300}); });
  const kb=E.outBack(h.p(t,ni-0.05,ni+0.25));
  if(kb>0) inner+=G(`<rect x="-130" y="-34" width="260" height="68" rx="34" fill="${PAL.red}"/>`+T(0,14,'0 ONLINE',{size:34,font:'Mono',w:700}),{y:330,s:kb});
  return hand(380,1150,1.1)+phone(540,780,460,840,inner)+`<ellipse cx="300" cy="1020" rx="40" ry="68" fill="${PAL.skin}" transform="rotate(18,300,1020)"/>`;
},
street(t,d,S,h){
  const tu=h.wt('türen'), mo=h.wt('motor'), blink=Math.floor(t*2)%2;
  let s=skyline(1060,0.05,7,{min:300,var:380})+road(1180);
  s+=trafficLight(860,760,1,'g',blink);
  s+=car(330,1150,0.95,'#ff5d73',{r:-6,door:t>tu,lights:true})+car(760,1210,0.95,'#4ea8ff',{flip:true,r:8,door:t>tu+0.25});
  if(t>mo-0.1) for(let i=0;i<5;i++){ const p=((t*0.9)+i/5)%1; s+=`<circle cx="${150-p*140}" cy="${1110-p*90}" r="${16+p*40}" fill="#c9cdf0" opacity="${(1-p)*0.5}"/>`; }
  // du, klein, kommst ins Bild
  const w=E.out(h.p(t,0,1.2));
  s+=person({x:lerp(-80,560,w),y:1260,s:0.55,...ME,mood:t>tu?'shock':'neutral',look:-1,bob:-Math.abs(Math.sin(t*9))*8*(1-w)});
  return s;
},
alone(t,d,S,h){
  const ni=h.wt('niemand'), di=h.wt('dir'), fade=h.p(t,ni,di);
  let s=spotlight(540,780,460,.6)+globe(540,780,300,t);
  const r=rng(77); let dots='';
  for(let i=0;i<220;i++){ const a=r()*Math.PI*2, rr=Math.sqrt(r())*270, x=540+Math.cos(a)*rr, y=780+Math.sin(a)*rr*0.95, th=r();
    const op=clamp((th-fade)*6,0,1); if(op>0) dots+=`<circle cx="${x}" cy="${y}" r="4.5" fill="${PAL.pink}" opacity="${op}"/>`; }
  s+=dots;
  const kd=h.p(t,di-0.2,di+0.2);
  s+=`<circle cx="600" cy="700" r="${7+3*Math.sin(t*6)}" fill="${PAL.yellow}" filter="url(#glowS)"/>`;
  if(kd>0){ for(let i=0;i<3;i++){ const p=((t-di)*0.8+i/3)%1; s+=ring(600,700,20+p*140,PAL.yellow,(1-p)*0.7*kd,4); }
    s+=G(`<rect x="-60" y="-28" width="120" height="44" rx="10" fill="#141836" stroke="${PAL.yellow}" stroke-width="3"/>`+T(0,4,'DU',{size:26,font:'Mono',w:700,fill:PAL.yellow}),{x:700,y:620,s:E.outBack(kd)}); }
  return s;
},
freedom(t,d,S,h){
  const be=h.wt('beste'), jump=t>be?Math.abs(Math.sin((t-be)*7))*-55*Math.exp(-(t-be)*0.7):0, up=E.outBack(h.p(t,be-0.1,be+0.2));
  let s='';
  for(let i=0;i<12;i++){ const a=i*30+t*12; s+=`<path d="M540,620 L${540+Math.cos(a*Math.PI/180)*900},${620+Math.sin(a*Math.PI/180)*900} L${540+Math.cos((a+9)*Math.PI/180)*900},${620+Math.sin((a+9)*Math.PI/180)*900}Z" fill="${PAL.yellow}" opacity=".05"/>`; }
  s+=`<circle cx="540" cy="620" r="110" fill="${PAL.yellow}" opacity=".9" filter="url(#glow)"/>`+skyline(1080,0.1,9,{min:150,var:260,col:'#2a3060'});
  s+=`<rect x="0" y="1080" width="1080" height="200" fill="#1d2146"/>`;
  s+=person({x:540,y:1220,s:1.05,...ME,mood:t>h.wt('ehrlich')?'happy':'neutral',armL:lerp(14,150,up),armR:lerp(-14,-150,up),bob:jump});
  return s;
},
free(t,d,S,h){
  const g0=h.wt('gratis',0), g1=h.wt('gratis',1), su=h.wt('suite');
  let s='';
  const cart=`<g transform="translate(0,20)"><path d="M-90,-60 h30 l30,100 h110 l24,-70 h-150" stroke="#c9cdf0" stroke-width="10" fill="none" stroke-linejoin="round"/><circle cx="-20" cy="60" r="14" fill="#c9cdf0"/><circle cx="80" cy="60" r="14" fill="#c9cdf0"/>
    <rect x="-30" y="-60" width="36" height="46" rx="6" fill="#ffd23f"/><rect x="12" y="-74" width="32" height="60" rx="6" fill="#ff5d73"/><rect x="50" y="-56" width="40" height="42" rx="6" fill="#4ea8ff"/></g>`;
  const tv=`<rect x="-110" y="-80" width="220" height="140" rx="12" fill="#1b1e3a" stroke="#c9cdf0" stroke-width="6"/><rect x="-96" y="-66" width="192" height="112" rx="6" fill="${PAL.blue}" opacity=".6"/><rect x="-40" y="62" width="80" height="12" fill="#c9cdf0"/>
    <rect x="130" y="-60" width="56" height="110" rx="12" fill="#1b1e3a" stroke="#c9cdf0" stroke-width="5" transform="translate(-40,10) scale(.7)"/>`;
  const bed=`<rect x="-140" y="-10" width="280" height="70" rx="14" fill="#f3f4fb"/><rect x="-150" y="-80" width="40" height="150" rx="10" fill="${PAL.wood}"/><ellipse cx="-80" cy="-14" rx="44" ry="20" fill="#fff"/><rect x="-60" y="-24" width="190" height="50" rx="14" fill="#c43a5a"/>`+T(0,-60,'★★★★★',{size:40,fill:PAL.yellow});
  [[h.wt('supermarkt'),300,520,cart,'SUPERMARKT',g0],[h.wt('elektroladen'),780,520,tv,'ELEKTRO',g1],[su-0.4,540,930,bed,'SUITE',null]].forEach(([ti,x,y,art,lab,gt])=>{
    const k=E.outBack(h.p(t,ti-0.05,ti+0.3)); if(k<=0) return;
    let inner=art+T(0,130,lab,{size:26,font:'Mono',w:700,fill:'#8d93bd'});
    if(gt!==null){ const ks=h.p(t,gt-0.05,gt+0.2); if(ks>0) inner+=G(stamp('GRATIS',PAL.green,0.55,-12),{s:lerp(2.2,1,E.outBack(ks)),op:clamp(ks*3,0,1)}); }
    else if(t>su){ for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, p=h.p(t,su,su+0.8); inner+=`<circle cx="${Math.cos(a)*(100+p*120)}" cy="${Math.sin(a)*(60+p*80)}" r="${8*(1-p)+2}" fill="${PAL.yellow}" opacity="${1-p}"/>`; } }
    s+=panel(x,y,x===540?520:400,300,inner,{s:k,col:x===540&&t>su?PAL.yellow:'#353b6e'}); });
  return s;
},
dark(t,d,S,h){
  const au=h.wt('aus'), off=h.p(t,au-0.15,au+0.5);
  let s=moon(820,470,58);
  const r=rng(31); let sky='', x=-20;
  while(x<1100){ const w=110+r()*90, hh=300+r()*420, cx=x+w/2; const thr=cx/1080; const lit=off>thr?0.02:0.75;
    sky+=house(cx,1150,w,hh,lit,Math.floor(r()*999)); x+=w+6; }
  s+=sky+`<rect x="0" y="1150" width="1080" height="120" fill="#11132a"/>`;
  if(off>0&&off<1) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="${0.25*Math.sin(off*Math.PI)}"/>`;
  return s;
},
grid(t,d,S,h){
  const ab=h.wt('ab'), du=h.wt('dunkel'), on=1-h.p(t,ab-0.2,ab+0.6), dark=h.p(t,du-0.2,du+0.5);
  let s=powerPlant(380,1000,1,t,on)+pylon(820,1000,1)+pylon(1010,980,0.8);
  s+=`<path d="M750,700 Q860,760 970,740 M880,700 Q960,750 1060,740" stroke="#6c7090" stroke-width="4" fill="none"/>`;
  s+=`<rect x="0" y="1000" width="1080" height="260" fill="#14172f"/>`;
  const kw=E.outBack(h.p(t,ab-0.25,ab+0.05));
  if(kw>0) s+=G(`<rect x="-230" y="-50" width="460" height="100" rx="14" fill="#2a0d18" stroke="${PAL.red}" stroke-width="5"/>`+T(0,14,'AUTO-ABSCHALTUNG',{size:38,font:'Mono',w:700,fill:PAL.red}),{x:540,y:460,s:kw*(Math.floor(t*4)%2?1:0.98)});
  if(dark>0) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#02030a" opacity="${0.6*dark}"/>`+globe(540,760,200,t,{night:dark*0.95}).replace('<g transform','<g opacity="'+dark+'" transform');
  return s;
},
water(t,d,S,h){
  const ro=h.wt('röcheln'), pu=h.wt('pumpen'), flow=1-h.p(t,ro-0.6,ro);
  let s=spotlight(540,760,420,.5)+`<rect x="160" y="980" width="760" height="40" rx="16" fill="#9aa0c0"/><path d="M240,1020 h600 l-40,140 h-520z" fill="#6c7090"/>`;
  s+=faucet(540,560,1.6);
  const spx=540+2*1.6*65-50, spy=560+1.6*94;
  if(flow>0) s+=`<rect x="${spx-24*flow}" y="${spy}" width="${48*flow}" height="${980-spy}" fill="${PAL.blue}" opacity=".75"/>`;
  else for(let i=0;i<3;i++){ const p=((t-ro)*1.3+i/3)%1; if(t-ro<1.2) s+=`<circle cx="${spx+Math.sin(i*5)*6}" cy="${spy+p*(980-spy)}" r="9" fill="${PAL.blue}" opacity="${1-p*0.5}"/>`; }
  const kp=E.outBack(h.p(t,pu-0.1,pu+0.25));
  if(kp>0){ const ang=lerp(60,-60,h.p(t,pu,pu+0.8));
    s+=panel(830,470,240,240,`<circle r="80" fill="#141836" stroke="#c9cdf0" stroke-width="6"/><rect x="-4" y="-70" width="8" height="70" rx="4" fill="${PAL.red}" transform="rotate(${-ang})"/>`+T(0,58,'0 BAR',{size:24,font:'Mono',w:700,fill:PAL.red})+T(0,-90,'PUMPE',{size:20,font:'Mono',w:700,fill:'#8d93bd'}),{s:kp,col:PAL.red}); }
  return s;
},
candle(t,d,S,h){
  const al=h.wt('allein');
  let s=`<circle cx="540" cy="880" r="520" fill="#ff9b42" opacity=".06" filter="url(#blur8)"/>`;
  s+=person({x:540,y:1180,s:1.05,...ME,mood:t>al?'sad':'neutral',armL:30,armR:-38,blink:(t%2.6)>2.45});
  s+=`<rect x="120" y="1000" width="840" height="40" rx="10" fill="${PAL.wood}"/><rect x="170" y="1040" width="30" height="200" fill="${PAL.woodD}"/><rect x="880" y="1040" width="30" height="200" fill="${PAL.woodD}"/>`;
  s+=tinCan(420,1000,0.9,'RAVIOLI')+`<rect x="460" y="890" width="10" height="120" rx="5" fill="#c9cdf0" transform="rotate(20,465,950)"/>`;
  s+=candle(720,1000,1.2,t,1);
  if(t>al) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="${0.35*h.p(t,al,al+0.8)}"/>`+candle(720,1000,1.2,t,1).replace(/opacity="0\.\d+"/,'opacity=".2"');
  return s;
},
dogs(t,d,S,h){
  const hu=h.wt('hunde'), hh=h.wt('hunderte');
  let s=moon(540,500,70)+skyline(1050,0.0,12,{min:260,var:300,col:'#1c1426'})+`<rect x="0" y="1050" width="1080" height="220" fill="#120c18"/>`;
  const r=rng(19); const n=t<hh?Math.floor(h.p(t,hu-0.1,hu+0.2)*3):3+Math.floor(h.p(t,hh,hh+1.5)*14);
  for(let i=0;i<n;i++){ const x=80+r()*920, y=1080+r()*150, sc=0.55+r()*0.5; s+=dog(x+Math.sin(t*3+i)*6,y,sc,'#07040b',PAL.yellow,{flip:r()<0.5}); }
  for(let i=0;i<Math.min(n,8);i++){ const rr=rng(100+i); s+=`<circle cx="${100+rr()*880}" cy="${700+rr()*250}" r="4" fill="${PAL.red}" opacity="${0.5+0.5*Math.sin(t*5+i)}" filter="url(#glowS)"/>`; }
  return s;
},
twist(t,d,S,h){
  const ge=h.wt('gefährlich'), hu=h.wt('hunger'), ho=h.wt('hunde');
  let s='';
  const kq=E.outBack(h.p(t,0.05,0.35));
  s+=G(T(0,120,'?',{size:360,fill:PAL.red,filter:'glow'}),{x:540,y:620,s:kq*(1+0.05*Math.sin(t*5)),op:t>hu-0.2?0.25:1});
  const items=[[hu,300,tinCan(0,70,1,'LEER','#6c7090')],[ho,780,dog(0,60,1.1,'#c9cdf0',null)]];
  items.forEach(([ti,x,art])=>{ const k=E.outBack(h.p(t,ti-0.15,ti+0.15)); if(k<=0) return;
    s+=panel(x,880,380,330,art+bigX(0,0,1,PAL.red,h.p(t,ti+0.05,ti+0.35)),{s:k}); });
  return s;
},
silence(t,d,S,h){
  const ei=h.wt('einsamkeit'), k=h.p(t,0,d), close=h.p(t,ei-0.1,ei+0.8);
  let s=`<ellipse cx="540" cy="1150" rx="${260-80*close}" ry="${50-15*close}" fill="#fff" opacity=".08"/><path d="M${540-120+40*close},0 L${540+120-40*close},0 L${540+260-80*close},1150 L${540-260+80*close},1150Z" fill="#fff" opacity=".05"/>`;
  s+=person({x:540,y:1150,s:0.55-0.1*close,...ME,mood:'sad',look:0});
  s+=G(`<line x1="-300" y1="0" x2="300" y2="0" stroke="${PAL.blue}" stroke-width="4" opacity=".6"/>`+T(-300,-24,'GERÄUSCHE',{size:18,font:'Mono',w:700,fill:'#8d93bd',anchor:'start'})+T(300,-24,'0 dB',{size:18,font:'Mono',w:700,fill:PAL.blue,anchor:'end'}),{x:540,y:520,op:1-0.5*k});
  if(close>0) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="${0.35*close}"/>`;
  return s;
},
science(t,d,S,h){
  const fz=h.wt('fünfzehn'), kd=E.outBack(h.p(t,0.05,0.35));
  let s=G(`<rect x="-170" y="-110" width="340" height="220" rx="16" fill="#f3f4fb"/>`+T(0,-56,'STUDIE',{size:34,fill:'#22264a'})+
    [0,1,2].map(i=>`<rect x="-130" y="${-24+i*30}" width="${i%2?200:260}" height="12" rx="6" fill="#b9bdd6"/>`).join('')+T(0,90,'EINSAMKEIT',{size:26,fill:PAL.pink}),{x:540,y:530,s:kd,r:-3});
  const cnt=Math.round(15*E.inOut(h.p(t,0.3,fz)));
  for(let i=0;i<cnt;i++){ const col=i%5, row=Math.floor(i/5), x=290+col*125, y=800+row*110, hot=t>fz;
    s+=`<g transform="translate(${x},${y}) rotate(-20)"><rect x="-55" y="-11" width="110" height="22" rx="4" fill="#f3e2b8"/><rect x="-55" y="-11" width="34" height="22" rx="4" fill="#d9a35a"/><rect x="53" y="-11" width="6" height="22" fill="${hot?PAL.red:'#888'}" ${hot?'filter="url(#glowS)"':''}/></g>`; }
  if(t>fz) for(let i=0;i<6;i++){ const p=((t-fz)*0.6+i/6)%1; s+=`<circle cx="${320+i*100+Math.sin(p*7+i)*20}" cy="${760-p*200}" r="${10+p*26}" fill="#c9cdf0" opacity="${(1-p)*0.25}"/>`; }
  return s;
},
talk(t,d,S,h){
  const la=h.wt('laut'), st=h.wt('stimme');
  let s=spotlight(400,900,420,.5);
  const talking=Math.abs(Math.sin(t*14))>0.4;
  s+=person({x:360,y:1180,s:1.05,...ME,mood:talking?'shock':'neutral',look:1,armR:-40});
  const lines=[[h.wt('irgendwann'),'Na?'],[la,'HALLO?!'],[st,'…hallo?']];
  lines.forEach(([ti,txt],i)=>{ const k=E.outBack(h.p(t,ti,ti+0.3)); if(k<=0) return;
    const echo=i===2;
    s+=G(bubble(0,0,300,120,T(0,18,txt,{size:i===1?52:44,fill:'#22264a'}),echo?0.45:1),{x:720+(echo?40:0),y:470+i*190,s:k*(i===1?1.1:1)}); });
  s+=waveform(720,1080,380,t,talking?1:0.15,PAL.pink);
  return s;
},
roof(t,d,S,h){
  const pl=h.wt('plötzlich');
  let s=moon(820,440,60);
  const r=rng(4); for(let i=0;i<40;i++) s+=`<circle cx="${r()*1080}" cy="${380+r()*300}" r="${1.5+r()*2}" fill="#fff" opacity="${0.4+0.4*Math.sin(t*2+i)}"/>`;
  s+=skyline(1000,0.04,22,{min:200,var:260,col:'#232a5a'});
  s+=`<rect x="80" y="1000" width="920" height="300" fill="#252a52"/><rect x="60" y="990" width="960" height="24" rx="6" fill="#30365f"/>`;
  // du von hinten auf der Dachkante
  s+=`<g transform="translate(540,1000)"><rect x="-64" y="-180" width="128" height="170" rx="44" fill="${ME.shirt}"/><circle cx="0" cy="-250" r="62" fill="${ME.hairC}"/><rect x="-40" y="-14" width="30" height="80" rx="12" fill="#2a2f57"/><rect x="10" y="-14" width="30" height="80" rx="12" fill="#2a2f57"/></g>`;
  const blink=t>pl&&Math.floor(t*6)%2;
  s+=walkie(700,985,0.28,{on:blink,led:PAL.red});
  return s;
},
radio(t,d,S,h){
  const kn=h.wt('knackt'), sh=t>kn&&t<kn+0.6?Math.sin(t*90)*8:0;
  let s=spotlight(540,780,420,.7);
  const scr=`<g transform="translate(0,-95)">${waveform(0,0,140,t,t>kn?1.2:0.3,'#38f27e',3)}</g>`;
  s+=walkie(540+sh,960,1.5,{on:Math.floor(t*8)%2,led:PAL.red,screen:scr,r:sh*0.3});
  for(let i=0;i<3;i++){ const p=((t*1.2)+i/3)%1; s+=ring(450,650,30+p*200,PAL.red,(1-p)*0.5,4); }
  return s;
},
voice(t,d,S,h){
  const je=h.wt('jemand');
  let s=spotlight(540,780,480,.8);
  const talking=t<h.wt('hallo')+0.6||(t>h.wt('ist')-0.05&&t<je+0.5);
  const scr=`<g transform="translate(0,-95)">${waveform(0,0,140,t,talking?1.4:0.2,'#38f27e',5)}</g>`;
  s+=walkie(540,960,1.5,{on:1,led:PAL.green,screen:scr});
  for(let i=0;i<4;i++){ const p=((t*0.9)+i/4)%1; s+=ring(450,650,30+p*300,PAL.pink,(1-p)*(talking?0.7:0.2),5); }
  if(t>je) s+=G(T(0,0,'?',{size:200,fill:PAL.yellow,filter:'glow'}),{x:860,y:560,s:E.outBack(h.p(t,je,je+0.3)),op:0.9});
  return s;
},
};
