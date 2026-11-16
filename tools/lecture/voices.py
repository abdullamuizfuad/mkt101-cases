#!/usr/bin/env python3
"""Make the AI voice clips for a live lecture's sales call (Kokoro, an open-licence voice model; runs offline).
Setup once:  pip install kokoro-onnx soundfile   and download kokoro-v1.0.onnx + voices-v1.0.bin from
             https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0) into a folder MODEL_DIR. Needs ffmpeg.
Usage:       node tools/lecture/lines.mjs ch13 > /tmp/lines.json
             python3 tools/lecture/voices.py MODEL_DIR /tmp/lines.json lecture/ch13/audio
Only changed or missing lines are made again (a .txt next to each mp3 holds the text it was made from).
"Soneva Fushi" is spoken from a fixed phonetic spelling (So-NAY-vaa FOO-shee) so every clip says it the same way."""
import json, os, re, subprocess, sys, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = {'rep': 'bf_emma', 'A': 'am_michael', 'B': 'af_heart'}
FU = 'fˈuːʃiː'

def phon(k, text, lang):
    son = 'sˌoʊnˈeɪvɑː' if lang == 'en-us' else 'sˌəʊnˈeɪvɑː'
    out = ''
    for p in re.split(r'(Soneva Fushi|Soneva)', text):
        if p == 'Soneva Fushi': out += ' ' + son + ' ' + FU + ' '
        elif p == 'Soneva': out += ' ' + son + ' '
        elif p: out += k.tokenizer.phonemize(p.replace('’', "'"), lang)
    out = re.sub(r' +', ' ', out)
    return re.sub(r' ([.,?!])', r'\1', out).strip()

def main(model, lines, outdir):
    k = Kokoro(os.path.join(model, 'kokoro-v1.0.onnx'), os.path.join(model, 'voices-v1.0.bin'))
    os.makedirs(outdir, exist_ok=True)
    made = 0
    for L in json.load(open(lines, encoding='utf-8')):
        mp3, txt = os.path.join(outdir, L['key'] + '.mp3'), os.path.join(outdir, L['key'] + '.txt')
        sig = L['who'] + '|' + L['text']
        if os.path.exists(mp3) and os.path.exists(txt) and open(txt, encoding='utf-8').read() == sig: continue
        v = VOICE[L['who']]; lang = 'en-gb' if v[0] == 'b' else 'en-us'
        a, sr = k.create(phon(k, L['text'], lang), voice=v, is_phonemes=True, lang=lang)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: wav = f.name
        sf.write(wav, a, sr)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', '48k', mp3], check=True); os.remove(wav)
        open(txt, 'w', encoding='utf-8').write(sig); made += 1
    print(f'{made} clip(s) made in {outdir}')

if __name__ == '__main__':
    if len(sys.argv) != 4: sys.exit(__doc__)
    main(*sys.argv[1:])
