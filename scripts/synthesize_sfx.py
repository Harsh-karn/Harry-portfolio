import math
import numpy as np
import scipy.signal
import wave
import subprocess
import os

SAMPLE_RATE = 44100
OUTPUT_DIR = "public/sounds"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_sparkle_sfx():
    # Cascading celestial bell harmonics (arpeggio upwards: E5, G#5, B5, E6, G#6, B6, E7)
    dur = 1.4
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    sig_l = np.zeros_like(t)
    sig_r = np.zeros_like(t)
    
    notes = [659.25, 830.61, 987.77, 1318.51, 1661.22, 1975.53, 2637.02]
    for i, freq in enumerate(notes):
        note_start = i * 0.08
        start_samp = int(note_start * SAMPLE_RATE)
        rem_len = len(t) - start_samp
        if rem_len <= 0:
            continue
        sub_t = t[:rem_len]
        # Shimmering chime tone
        decay = np.exp(-sub_t * 6.0)
        vibrato = 1.0 + 0.005 * np.sin(2 * np.pi * 12.0 * sub_t)
        tone = np.sin(2 * np.pi * freq * vibrato * sub_t) * decay
        tone += 0.4 * np.sin(2 * np.pi * freq * 2.75 * sub_t) * np.exp(-sub_t * 9.0)
        tone += 0.2 * np.sin(2 * np.pi * freq * 5.4 * sub_t) * np.exp(-sub_t * 14.0)
        
        # Pan across stereo field
        pan = 0.2 + 0.6 * (i / len(notes))
        sig_l[start_samp:] += tone * (1.0 - pan) * 0.45
        sig_r[start_samp:] += tone * pan * 0.45
        
    # Great hall reverb tail
    reverb_len = int(SAMPLE_RATE * 0.8)
    rt = np.linspace(0, 0.8, reverb_len)
    np.random.seed(123)
    ir = np.random.randn(reverb_len) * np.exp(-rt * 5.0)
    ir /= np.sum(np.abs(ir))
    wet_l = scipy.signal.fftconvolve(sig_l, ir, mode='full')[:len(t)]
    wet_r = scipy.signal.fftconvolve(sig_r, ir, mode='full')[:len(t)]
    
    out_l = sig_l * 0.75 + wet_l * 0.4
    out_r = sig_r * 0.75 + wet_r * 0.4
    peak = max(np.max(np.abs(out_l)), np.max(np.abs(out_r)), 1e-5)
    out_l = (out_l / peak) * 0.85
    out_r = (out_r / peak) * 0.85
    
    pcm_l = (out_l * 32767).astype(np.int16)
    pcm_r = (out_r * 32767).astype(np.int16)
    stereo = np.empty((len(pcm_l) * 2,), dtype=np.int16)
    stereo[0::2] = pcm_l
    stereo[1::2] = pcm_r
    
    wav_path = f"{OUTPUT_DIR}/temp_sparkle.wav"
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo.tobytes())
        
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-b:a", "192k", f"{OUTPUT_DIR}/magic_sparkle.mp3"], check=True)
    if os.path.exists(wav_path):
        os.remove(wav_path)
    print("Created magic_sparkle.mp3!")

def generate_whoosh_sfx():
    # Airy magical whoosh with sweeping resonant filter
    dur = 0.9
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    np.random.seed(456)
    noise = np.random.randn(len(t))
    
    # Bell-shaped amplitude envelope
    env = np.sin(np.pi * (t / dur)) ** 2
    
    # Sweeping bandpass filter from 300Hz -> 2200Hz -> 400Hz
    # Approximate with time-varying resonant frequencies
    f_center = 400 + 1800 * np.sin(np.pi * (t / dur))
    
    # Harmonic whistle undertone
    whistle = np.sin(2 * np.pi * f_center * t) * 0.15
    
    # Modulate noise
    mod_noise = noise * env * 0.6 + whistle * env
    
    # Stereo width
    pan_l = np.linspace(0.8, 0.2, len(t))
    pan_r = np.linspace(0.2, 0.8, len(t))
    out_l = mod_noise * pan_l
    out_r = mod_noise * pan_r
    
    peak = max(np.max(np.abs(out_l)), np.max(np.abs(out_r)), 1e-5)
    out_l = (out_l / peak) * 0.75
    out_r = (out_r / peak) * 0.75
    
    pcm_l = (out_l * 32767).astype(np.int16)
    pcm_r = (out_r * 32767).astype(np.int16)
    stereo = np.empty((len(pcm_l) * 2,), dtype=np.int16)
    stereo[0::2] = pcm_l
    stereo[1::2] = pcm_r
    
    wav_path = f"{OUTPUT_DIR}/temp_whoosh.wav"
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo.tobytes())
        
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-b:a", "192k", f"{OUTPUT_DIR}/spell_whoosh.mp3"], check=True)
    if os.path.exists(wav_path):
        os.remove(wav_path)
    print("Created spell_whoosh.mp3!")

def generate_pencil_sfx():
    # Tactile pencil sketching sound (hatching strokes on toothy paper, seamless loop)
    dur = 2.4
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    np.random.seed(789)
    noise = np.random.randn(len(t))
    
    # 8 rhythmic shading strokes (back and forth)
    stroke_rate = 8 / dur
    stroke_env = np.abs(np.sin(2 * np.pi * stroke_rate * t)) ** 1.5
    
    # Paper tooth resonant filter band (around 1200 - 3200 Hz)
    sos = scipy.signal.butter(4, [1000, 4000], btype='bandpass', fs=SAMPLE_RATE, output='sos')
    filtered_noise = scipy.signal.sosfilt(sos, noise)
    
    sig = filtered_noise * stroke_env * 0.4
    # Crossfade loop ends
    fade_len = int(SAMPLE_RATE * 0.1)
    sig[:fade_len] *= np.linspace(0, 1, fade_len)
    sig[-fade_len:] *= np.linspace(1, 0, fade_len)
    
    pcm = (sig / np.max(np.abs(sig) + 1e-5) * 0.7 * 32767).astype(np.int16)
    stereo = np.empty((len(pcm) * 2,), dtype=np.int16)
    stereo[0::2] = pcm
    stereo[1::2] = pcm
    
    wav_path = f"{OUTPUT_DIR}/temp_pencil.wav"
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo.tobytes())
        
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-b:a", "192k", f"{OUTPUT_DIR}/pencil.mp3"], check=True)
    if os.path.exists(wav_path):
        os.remove(wav_path)
    print("Created pencil.mp3!")

if __name__ == "__main__":
    generate_sparkle_sfx()
    generate_whoosh_sfx()
    generate_pencil_sfx()

