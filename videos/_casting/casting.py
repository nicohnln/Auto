import sys, os, time, numpy as np, soundfile as sf, librosa
sys.path.insert(0, '/home/user/Auto/.claude/skills/tiktok-was-waere-wenn/engine')
import orpheus_de as O
CH=["Stell dir vor, du wachst morgen auf … und über deinem Kopf läuft ein Countdown. <gasp> Bei jedem Menschen.",
    "Und ehrlich? <chuckle> Am Anfang denkst du noch: Ach, ist doch ewig hin.",
    "Aber dann siehst du deinen besten Freund … und bei ihm steht: drei Wochen. <sigh>"]
for v in ['thomas','max','jana']:
    t0=time.time(); parts=[]
    for i,c in enumerate(CH):
        y=O.synth(c,v,seed=7+i); idx=librosa.effects.split(y,top_db=40)
        if len(idx): y=y[max(0,idx[0][0]-1200):idx[-1][1]+2400]
        parts+= [y, np.zeros(int(0.35*O.SR),np.float32)]
    y=np.concatenate(parts); y=y/np.max(np.abs(y))*0.9
    sf.write(f'orpheus_{v}.wav',y,O.SR); print(v, f'{len(y)/O.SR:.1f}s in {time.time()-t0:.0f}s', flush=True)
