import sys, os, numpy as np, soundfile as sf, librosa, torch
sys.path.insert(0,'/home/user/Auto/.claude/skills/tiktok-was-waere-wenn/engine')
TXT=sys.argv[1]
import orpheus_de as O
for name,v,temp in [('A_thomas','thomas',0.6),('B_thomas_ruhig','thomas',0.45),('C_max','max',0.5)]:
    if os.path.exists(name+'.wav'): continue
    y=O.synth(TXT,v,temp=temp,seed=11); iv=librosa.effects.split(y,top_db=40); y=y[iv[0][0]:iv[-1][1]+2400]
    sf.write(name+'.wav',y/np.max(np.abs(y))*0.9,O.SR); print('ok',name,flush=True)
if not os.path.exists('D_chatterbox.wav'):
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    m=ChatterboxMultilingualTTS.from_local('/home/user/models/chatterbox','cpu'); torch.manual_seed(5)
    w=m.generate(TXT,language_id='de',audio_prompt_path='/home/user/models/thorsten/refs/neutral.wav',exaggeration=0.45,cfg_weight=0.5)
    y=w.squeeze(0).numpy(); iv=librosa.effects.split(y,top_db=40); y=y[iv[0][0]:iv[-1][1]+2400]; sf.write('D_chatterbox.wav',y/np.max(np.abs(y))*0.9,m.sr); print('ok D',flush=True)
