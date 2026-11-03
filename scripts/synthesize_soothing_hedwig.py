import math
import numpy as np
import scipy.signal
import wave
import subprocess
import os

SAMPLE_RATE = 44100
OUTPUT_DIR = "public/sounds"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Note frequencies (Hz) in standard A440 tuning
NOTE_FREQS = {
    'E2': 82.41, 'B2': 123.47, 'E3': 164.81, 'G3': 196.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
    'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
    'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
    'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51,
    'F#6': 1479.98, 'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53
}

def synth_pure_celesta(freq, duration_sec, velocity=0.8):
    """
    Synthesizes an ultra-soothing, crystal-clear celesta / music box bell tone.
    - Zero white noise or static.
    - Dual detuned sines for rich chorus warmth (+-0.35 Hz).
    - Delicate harmonic overtone structure.
    - Smooth Hann cosine attack (no clicks or pop).
    """
    # Natural ring duration
    ring_dur = max(duration_sec + 2.2, 3.2)
    num_samples = int(SAMPLE_RATE * ring_dur)
    t = np.linspace(0, ring_dur, num_samples, endpoint=False)
    
    # 1. Dual detuned fundamental for lush acoustic chorus
    detune = 0.35
    f1 = freq - detune
    f2 = freq + detune
    decay_fund = np.exp(-t / 1.55)
    fundamental = (np.sin(2 * np.pi * f1 * t) + np.sin(2 * np.pi * f2 * t)) * 0.5 * decay_fund
    
    # 2. Warm sub-octave body
    sub_decay = np.exp(-t / 1.1)
    sub = np.sin(2 * np.pi * (freq * 0.5) * t) * 0.12 * sub_decay
    
    # 3. Soft 2nd harmonic (octave sparkle)
    oct_decay = np.exp(-t / 0.85)
    octave = np.sin(2 * np.pi * (freq * 2.0) * t) * 0.16 * oct_decay
    
    # 4. Very delicate 3rd harmonic (bell shimmer)
    third_decay = np.exp(-t / 0.45)
    third = np.sin(2 * np.pi * (freq * 3.0) * t) * 0.04 * third_decay
    
    tone = fundamental + sub + octave + third
    
    # Smooth Hann attack envelope over 16ms (removes any click/tick)
    attack_samples = int(SAMPLE_RATE * 0.016)
    if len(tone) > attack_samples:
        attack_ramp = 0.5 * (1.0 - np.cos(np.pi * np.linspace(0, 1, attack_samples)))
        tone[:attack_samples] *= attack_ramp
        
    return tone * velocity

def apply_clean_cathedral_reverb(left, right):
    """
    Pure algorithmic Schroeder stereo delay network.
    Contains ZERO random noise. Produces lush, soothing, shimmering cathedral space.
    """
    total_len = len(left)
    out_l = np.copy(left)
    out_r = np.copy(right)
    
    # Multi-tap stereo delay times (in seconds)
    comb_delays_l = [0.031, 0.049, 0.071, 0.103, 0.147, 0.211]
    comb_delays_r = [0.037, 0.053, 0.079, 0.111, 0.157, 0.223]
    gains =         [0.42,  0.36,  0.31,  0.25,  0.19,  0.14]
    
    wet_l = np.zeros(total_len)
    wet_r = np.zeros(total_len)
    
    for d, g in zip(comb_delays_l, gains):
        delay_s = int(d * SAMPLE_RATE)
        if delay_s < total_len:
            wet_l[delay_s:] += left[:-delay_s] * g
            # Low-pass reflection dampening
            wet_l[delay_s * 2:] += left[:-delay_s * 2] * (g * 0.45)
            
    for d, g in zip(comb_delays_r, gains):
        delay_s = int(d * SAMPLE_RATE)
        if delay_s < total_len:
            wet_r[delay_s:] += right[:-delay_s] * g
            wet_r[delay_s * 2:] += right[:-delay_s * 2] * (g * 0.45)
            
    # Cross-feedback
    cross = 0.12
    final_l = left * 0.85 + wet_l * 0.45 + wet_r * cross
    final_r = right * 0.85 + wet_r * 0.45 + wet_l * cross
    
    return final_l, final_r

def generate_soothing_hedwig():
    print("Synthesizing perfectly aligned, pure celesta Hedwig's Theme...")
    
    # Tempo: 3/8 meter, eighth note = 0.385s (~52 BPM dotted quarter)
    EIGHTH = 0.385
    
    # Score notation: (note_name, duration_in_eighth_beats)
    # 1.0 = eighth note, 2.0 = quarter note, 3.0 = dotted quarter, 6.0 = dotted half
    
    # Part 1 (Main Theme - 26 bars perfectly aligned in 3/8)
    part_1 = [
        # Bar 0 (pickup)
        ('REST', 2.0), ('B4', 1.0),
        # Bar 1
        ('E5', 3.0),
        # Bar 2
        ('G5', 1.0), ('F#5', 2.0),
        # Bar 3
        ('E5', 2.0), ('B5', 1.0),
        # Bar 4 & 5 (tied dotted half)
        ('A5', 6.0),
        # Bar 6 & 7 (tied dotted half)
        ('F#5', 6.0),
        
        # Bar 8
        ('E5', 3.0),
        # Bar 9
        ('G5', 1.0), ('F#5', 2.0),
        # Bar 10
        ('D#5', 2.0), ('F5', 1.0),
        # Bar 11 & 12 (tied dotted half)
        ('B4', 6.0),
        
        # Bar 13 (pickup)
        ('REST', 2.0), ('B4', 1.0),
        # Bar 14
        ('E5', 3.0),
        # Bar 15
        ('G5', 1.0), ('F#5', 2.0),
        # Bar 16
        ('E5', 2.0), ('B5', 1.0),
        # Bar 17
        ('D6', 3.0),
        # Bar 18
        ('C#6', 2.0), ('C6', 1.0),
        # Bar 19 & 20 (tied dotted half)
        ('G#5', 6.0),
        
        # Bar 21
        ('C6', 2.0), ('B5', 1.0),
        # Bar 22
        ('Bb5', 2.0), ('Bb4', 1.0),
        # Bar 23
        ('G5', 3.0),
        # Bar 24, 25, 26 (peaceful resolution root held)
        ('E5', 9.0)
    ]
    
    # Part 2 (Soaring B-Section - 26 bars in 3/8)
    part_2 = [
        # Bar 27 (pickup)
        ('REST', 2.0), ('G5', 1.0),
        # Bar 28
        ('B5', 2.0), ('G5', 1.0),
        # Bar 29
        ('B5', 2.0), ('G5', 1.0),
        # Bar 30
        ('B5', 2.0), ('C6', 1.0),
        # Bar 31
        ('B5', 2.0), ('Bb5', 1.0),
        # Bar 32 & 33
        ('F#5', 6.0),
        
        # Bar 34 (pickup)
        ('REST', 2.0), ('G5', 1.0),
        # Bar 35
        ('B5', 2.0), ('Bb5', 1.0),
        # Bar 36
        ('Bb4', 2.0), ('B4', 1.0),
        # Bar 37 & 38
        ('B5', 6.0),
        
        # Bar 39 (pickup)
        ('REST', 2.0), ('G5', 1.0),
        # Bar 40
        ('B5', 2.0), ('G5', 1.0),
        # Bar 41
        ('B5', 2.0), ('G5', 1.0),
        # Bar 42
        ('D6', 2.0), ('C#6', 1.0),
        # Bar 43
        ('C6', 2.0), ('G#5', 1.0),
        # Bar 44 & 45
        ('G#5', 6.0),
        
        # Bar 46
        ('C6', 2.0), ('B5', 1.0),
        # Bar 47
        ('Bb5', 2.0), ('Bb4', 1.0),
        # Bar 48
        ('G5', 3.0),
        # Bar 49, 50, 51, 52 (lullaby peaceful outro)
        ('E5', 12.0)
    ]
    
    total_eighths = sum(beats for _, beats in part_1) + sum(beats for _, beats in part_2) + 6.0
    total_seconds = total_eighths * EIGHTH + 4.0
    total_samples = int(SAMPLE_RATE * total_seconds)
    
    left = np.zeros(total_samples, dtype=np.float64)
    right = np.zeros(total_samples, dtype=np.float64)
    
    # --- RENDER MELODY ---
    current_time = 0.8 # gentle opening pause
    full_score = part_1 + [('REST', 4.0)] + part_2
    
    for note, beats in full_score:
        dur = beats * EIGHTH
        if note != 'REST' and note in NOTE_FREQS:
            freq = NOTE_FREQS[note]
            # Expressive velocity curve (gentle swell on high notes)
            vel = 0.72 + 0.12 * math.sin(current_time * 0.4)
            if '6' in note:
                vel *= 0.88 # soften highest octaves
            tone = synth_pure_celesta(freq, dur, velocity=vel)
            
            # Subtle stereo positioning (gentle acoustic motion)
            pan = 0.5 + 0.12 * math.sin(current_time * 0.6)
            start_s = int(current_time * SAMPLE_RATE)
            end_s = min(start_s + len(tone), total_samples)
            actual_len = end_s - start_s
            
            left[start_s:end_s] += tone[:actual_len] * (1.0 - pan)
            right[start_s:end_s] += tone[:actual_len] * pan
            
        current_time += dur
        
    # --- RENDER DEEP WARM SOOTHING ACOUSTIC DRONE ---
    # Pure velvety low strings / organ pedal: E2 (82.4Hz) and B2 (123.5Hz)
    t_full = np.linspace(0, total_seconds, total_samples, endpoint=False)
    drone_e = np.sin(2 * np.pi * 82.41 * t_full)
    drone_b = np.sin(2 * np.pi * 123.47 * t_full) * 0.65
    drone_oct = np.sin(2 * np.pi * 164.81 * t_full) * 0.35
    raw_drone = (drone_e + drone_b + drone_oct) * 0.09
    
    # 4-pole Butterworth low-pass filter at 260 Hz to ensure ZERO buzz, only warm velvet depth
    sos = scipy.signal.butter(4, 260, btype='lowpass', fs=SAMPLE_RATE, output='sos')
    warm_drone = scipy.signal.sosfilt(sos, raw_drone)
    
    # Very slow gentle breathing volume envelope (swell every 12 seconds)
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * (1.0 / 12.0) * t_full)
    warm_drone *= swell
    
    # Fade in / fade out drone
    fade_in = int(SAMPLE_RATE * 3.0)
    fade_out = int(SAMPLE_RATE * 4.0)
    warm_drone[:fade_in] *= np.linspace(0, 1, fade_in)
    warm_drone[-fade_out:] *= np.linspace(1, 0, fade_out)
    
    left += warm_drone * 0.5
    right += warm_drone * 0.5
    
    # --- APPLY CLEAN DELAY DIFFUSION REVERB ---
    rev_l, rev_r = apply_clean_cathedral_reverb(left, right)
    
    # Normalize peak to -1.5 dB (clean headroom, absolutely zero digital clipping)
    peak = max(np.max(np.abs(rev_l)), np.max(np.abs(rev_r)), 1e-5)
    target = 0.78
    final_l = (rev_l / peak) * target
    final_r = (rev_r / peak) * target
    
    # Seamless loop crossfade at the very ends
    cross_len = int(SAMPLE_RATE * 1.5)
    final_l[-cross_len:] = final_l[-cross_len:] * np.linspace(1, 0, cross_len)
    final_r[-cross_len:] = final_r[-cross_len:] * np.linspace(1, 0, cross_len)
    final_l[:cross_len] = final_l[:cross_len] * np.linspace(0, 1, cross_len)
    final_r[:cross_len] = final_r[:cross_len] * np.linspace(0, 1, cross_len)
    
    # Export to PCM WAV
    pcm_l = (final_l * 32767).astype(np.int16)
    pcm_r = (final_r * 32767).astype(np.int16)
    stereo = np.empty((len(pcm_l) * 2,), dtype=np.int16)
    stereo[0::2] = pcm_l
    stereo[1::2] = pcm_r
    
    wav_path = f"{OUTPUT_DIR}/soothing_hedwig.wav"
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo.tobytes())
        
    mp3_path = f"{OUTPUT_DIR}/harry_potter_theme.mp3"
    ogg_path = f"{OUTPUT_DIR}/harry_potter_theme.ogg"
    legacy_ogg = f"{OUTPUT_DIR}/cfl_turningpages-belem-breeze-487596.ogg"
    
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-b:a", "192k", mp3_path], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-c:a", "libvorbis", "-q:a", "6", ogg_path], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-c:a", "libvorbis", "-q:a", "6", legacy_ogg], check=True)
    
    if os.path.exists(wav_path):
        os.remove(wav_path)
        
    print(f"Master output rendered! Total duration: {total_seconds:.1f}s")

if __name__ == "__main__":
    generate_soothing_hedwig()

