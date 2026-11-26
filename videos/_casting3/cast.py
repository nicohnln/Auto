import sys, os, numpy as np, soundfile as sf, librosa, torch
sys.path.insert(0,'/home/user/Auto/.claude/skills/tiktok-was-waere-wenn/engine')
TXT=sys.argv[1]
import orpheus_de as O
def trim(y,sr): iv=librosa.effects.split(y,top_db=40); return y[iv[0][0]:iv[-1][1]+int(0.1*sr)]
for name,temp in [('o_jana',0.6),('o_jana_ruhig',0.45)]:
    if not os.path.exists(name+'.wav'):
        y=trim(O.synth(TXT,'jana',temp=temp,seed=11),O.SR); sf.write(name+'.wav',y/np.max(np.abs(y))*0.9,O.SR); print('ok',name,flush=True)
# Referenz für Chatterbox: Jana mit anderem Text (~10 s), damit nur die Stimmfarbe übernommen wird
if not os.path.exists('jana_ref.wav'):
    y=trim(O.synth('Weißt du, was ich an Montagen mag? Eigentlich gar nichts. Aber der Kaffee ist gut, und die Woche fängt ehrlich gesagt immer gleich an.','jana',temp=0.5,seed=3),O.SR)
    sf.write('jana_ref.wav',y/np.max(np.abs(y))*0.9,O.SR); print('ok ref',flush=True)
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
m=ChatterboxMultilingualTTS.from_local('/home/user/models/chatterbox','cpu')
for name,ref in [('c_jana_stimme','jana_ref.wav'),('c_standard',None)]:
    if os.path.exists(name+'.wav'): continue
    torch.manual_seed(5)
    w=m.generate(TXT,language_id='de',audio_prompt_path=ref,exaggeration=0.45,cfg_weight=0.5) if ref else m.generate(TXT,language_id='de',exaggeration=0.45,cfg_weight=0.5)
    y=trim(w.squeeze(0).numpy(),m.sr); sf.write(name+'.wav',y/np.max(np.abs(y))*0.9,m.sr); print('ok',name,flush=True)
