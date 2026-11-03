import os
import math
import numpy as np
import scipy.signal
import wave
import subprocess

SAMPLE_RATE = 44100
OUTPUT_DIR = "public/sounds"
SCRATCH_DIR = "public/sounds"
os.makedirs(OUTPUT_DIR, exist_ok=True)

NOTE_FREQS = {
    'E2': 82.41, 'B2': 123.47, 'E3': 164.81, 'G3': 196.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F#6': 1479.98, 'G6': 1567.98, 'B6': 1975.53
}

# Celesta note synthesizer (modal bell synthesis with chime harmonics and physical mallet strike)
def synth_celesta_note(freq, duration, velocity=0.85):
    # Total sound duration including natural ring decay
    total_len = max(duration + 1.8, 2.4)
    t = np.linspace(0, total_len, int(SAMPLE_RATE * total_len), endpoint=False)
    
    # Celesta physical bar inharmonic modal ratios:
    # 1.0 (fundamental), 2.756 (first overtone), 5.404 (second overtone), 8.933 (chime sparkle)
    # Plus sub-octave warmth
    partials = [
        (1.0, 1.0, 1.8),       # f0
        (2.756, 0.42, 0.9),     # 1st overtone
        (5.404, 0.18, 0.5),     # 2nd overtone
        (8.933, 0.08, 0.25),    # bell sparkle
        (0.5, 0.12, 1.4),       # warm undertone
        (2.0, 0.22, 1.2)        # octave overtone
    ]
    
    signal = np.zeros_like(t)
    for ratio, amp, decay_rate in partials:
        p_freq = freq * ratio
        # Avoid aliasing above Nyquist
        if p_freq < SAMPLE_RATE * 0.45:
            decay = np.exp(-t * (4.2 / decay_rate))
            signal += amp * np.sin(2 * np.pi * p_freq * t) * decay
            
    # Mallet felt strike transient (soft click of celesta hammer)
    strike_t = np.linspace(0, 0.015, int(SAMPLE_RATE * 0.015), endpoint=False)
    strike = np.sin(2 * np.pi * 3200 * strike_t) * np.exp(-strike_t * 350)
    signal[:len(strike)] += strike * 0.15
    
    # Soft attack envelope to prevent clicks
    attack_samples = int(SAMPLE_RATE * 0.006)
    if len(signal) > attack_samples:
        signal[:attack_samples] *= np.linspace(0, 1, attack_samples)
        
    return signal * velocity

# Warm ambient string pad synthesizer
def synth_string_pad(freq, duration, amp=0.22):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    # Warm rich saw/sine blend with subtle vibrato
    vibrato = 1.0 + 0.003 * np.sin(2 * np.pi * 4.8 * t)
    sig = np.sin(2 * np.pi * freq * vibrato * t) * 0.6
    sig += np.sin(2 * np.pi * freq * 2 * vibrato * t) * 0.25
    sig += np.sin(2 * np.pi * freq * 3 * t) * 0.12
    sig += np.sin(2 * np.pi * freq * 0.5 * t) * 0.35 # warm cello bass
    
    # Slow gentle swell envelope
    attack = int(SAMPLE_RATE * 1.2)
    release = int(SAMPLE_RATE * 1.5)
    env = np.ones_like(t)
    if len(t) > attack + release:
        env[:attack] = np.linspace(0, 1, attack)
        env[-release:] = np.linspace(1, 0, release)
    return sig * env * amp

print("Synthesizer engines ready.")

def generate_hedwig_track():
    # Meter: 3/8, dotted quarter = 1 beat (~0.62 sec)
    BEAT = 0.62
    EIGHTH = BEAT / 3.0  # ~0.207s
    
    # Hedwig's Theme Score: (note_name, duration_in_eighths)
    # Part 1 (Solo opening)
    melody_1 = [
        ('B4', 1.0),
        ('E5', 3.0),
        ('G5', 1.0),
        ('F#5', 1.0),
        ('E5', 2.0),
        ('B5', 3.0),
        ('A5', 6.0),
        ('F#5', 6.0),
        
        ('E5', 3.0),
        ('G5', 1.0),
        ('F#5', 1.0),
        ('D#5', 2.0),
        ('F5', 3.0),
        ('B4', 6.0),
        
        ('B4', 1.0),
        ('E5', 3.0),
        ('G5', 1.0),
        ('F#5', 1.0),
        ('E5', 2.0),
        ('B5', 3.0),
        ('D6', 2.0),
        ('C#6', 1.0),
        ('C6', 6.0),
        
        ('G#5', 1.5),
        ('C6', 2.0),
        ('B5', 1.0),
        ('Bb5', 1.0),
        ('Bb4', 2.0),
        ('G5', 3.0),
        ('E5', 8.0)
    ]
    
    # Part 2 (Lush soaring reprise with higher octave sparkles)
    melody_2 = [
        ('G5', 1.0),
        ('B5', 3.0),
        ('G5', 3.0),
        ('B5', 3.0),
        ('G5', 3.0),
        ('C6', 3.0),
        ('B5', 2.0),
        ('Bb5', 1.0),
        ('F#5', 6.0),
        
        ('G5', 1.0),
        ('B5', 2.0),
        ('Bb5', 1.0),
        ('Bb4', 3.0),
        ('B4', 1.0),
        ('B5', 6.0),
        
        ('G5', 1.0),
        ('B5', 3.0),
        ('G5', 3.0),
        ('B5', 3.0),
        ('G5', 3.0),
        ('D6', 3.0),
        ('C#6', 2.0),
        ('C6', 1.0),
        ('G#5', 6.0),
        
        ('G#5', 1.5),
        ('C6', 2.0),
        ('B5', 1.0),
        ('Bb5', 1.0),
        ('Bb4', 2.0),
        ('G5', 3.0),
        ('E5', 9.0)
    ]
    
    total_eighths = sum(d for _, d in melody_1) + sum(d for _, d in melody_2) + 12
    total_seconds = total_eighths * EIGHTH + 5.0 # Ringout tail
    total_samples = int(SAMPLE_RATE * total_seconds)
    
    left_channel = np.zeros(total_samples, dtype=np.float64)
    right_channel = np.zeros(total_samples, dtype=np.float64)
    
    # --- 1. MELODY TRACK ---
    current_time = 1.0 # start with 1s magical silence
    
    all_notes = melody_1 + [('REST', 4.0)] + melody_2
    for note, dur_eighths in all_notes:
        note_dur = dur_eighths * EIGHTH
        if note != 'REST' and note in NOTE_FREQS:
            freq = NOTE_FREQS[note]
            vel = 0.82 + 0.12 * math.sin(current_time * 0.8) # gentle musical expression
            tone = synth_celesta_note(freq, note_dur, velocity=vel)
            
            # Subtle stereo panning (slight wandering music box)
            pan = 0.5 + 0.15 * math.sin(current_time * 0.5)
            start_sample = int(current_time * SAMPLE_RATE)
            end_sample = min(start_sample + len(tone), total_samples)
            actual_len = end_sample - start_sample
            
            left_channel[start_sample:end_sample] += tone[:actual_len] * (1.0 - pan) * 1.4
            right_channel[start_sample:end_sample] += tone[:actual_len] * pan * 1.4
            
            # Add delicate sparkling octave chime on high notes
            if '6' in note or note in ['B5', 'A5']:
                oct_freq = freq * 2.0
                if oct_freq < 3800:
                    oct_tone = synth_celesta_note(oct_freq, note_dur * 0.5, velocity=0.22)
                    oct_end = min(start_sample + len(oct_tone), total_samples)
                    oct_len = oct_end - start_sample
                    left_channel[start_sample:oct_end] += oct_tone[:oct_len] * 0.2
                    right_channel[start_sample:oct_end] += oct_tone[:oct_len] * 0.2
                    
        current_time += note_dur
        
    # --- 2. AMBIENT STRING PADS & MYSTICAL DRONES ---
    # Low E minor atmospheric pads (E2, B2, E3, G3)
    pad_sections = [
        (0.5, 22.0, 'E2', 'B2'),
        (22.0, 20.0, 'E2', 'G3'),
        (42.0, 24.0, 'E2', 'B3'),
        (66.0, 22.0, 'E2', 'C4'),
        (88.0, 28.0, 'E2', 'B2')
    ]
    for start_t, pad_dur, n1, n2 in pad_sections:
        start_samp = int(start_t * SAMPLE_RATE)
        end_samp = min(start_samp + int(pad_dur * SAMPLE_RATE), total_samples)
        dur = (end_samp - start_samp) / SAMPLE_RATE
        if dur > 0.5:
            pad1 = synth_string_pad(NOTE_FREQS[n1], dur, amp=0.18)
            pad2 = synth_string_pad(NOTE_FREQS[n2], dur, amp=0.14)
            left_channel[start_samp:end_samp] += (pad1 + pad2 * 0.7)
            right_channel[start_samp:end_samp] += (pad1 * 0.7 + pad2)
            
    # --- 3. REVERB & CATHEDRAL ACOUSTIC (Algorithmic impulse response) ---
    print("Applying Great Hall stereo convolution reverb...")
    reverb_len = int(SAMPLE_RATE * 2.6) # 2.6s reverb tail
    rt = np.linspace(0, 2.6, reverb_len)
    
    # Decay envelope: exponential decay + random diffuse reflections
    np.random.seed(42)
    ir_l = (np.random.randn(reverb_len) * 0.8) * np.exp(-rt * 2.2)
    ir_r = (np.random.randn(reverb_len) * 0.8) * np.exp(-rt * 2.2)
    
    # Early reflections
    for delay_ms, gain in [(18, 0.4), (32, 0.35), (48, 0.28), (72, 0.22), (110, 0.18)]:
        d_samp = int(delay_ms * 0.001 * SAMPLE_RATE)
        if d_samp < reverb_len:
            ir_l[d_samp] += gain
            ir_r[d_samp + 8] += gain
            
    # Normalize impulse response
    ir_l /= np.sum(np.abs(ir_l))
    ir_r /= np.sum(np.abs(ir_r))
    
    # Convolve with wet/dry mix
    wet_l = scipy.signal.fftconvolve(left_channel, ir_l, mode='full')[:total_samples]
    wet_r = scipy.signal.fftconvolve(right_channel, ir_r, mode='full')[:total_samples]
    
    dry_mix = 0.72
    wet_mix = 0.38
    final_l = left_channel * dry_mix + wet_l * wet_mix
    final_r = right_channel * dry_mix + wet_r * wet_mix
    
    # Normalize to -1.0 dB peak (prevent clipping)
    peak = max(np.max(np.abs(final_l)), np.max(np.abs(final_r)), 1e-6)
    target_peak = 0.88
    final_l = (final_l / peak) * target_peak
    final_r = (final_r / peak) * target_peak
    
    # Convert to 16-bit PCM stereo
    pcm_l = (final_l * 32767).astype(np.int16)
    pcm_r = (final_r * 32767).astype(np.int16)
    
    stereo_pcm = np.empty((len(pcm_l) * 2,), dtype=np.int16)
    stereo_pcm[0::2] = pcm_l
    stereo_pcm[1::2] = pcm_r
    
    wav_path = f"{SCRATCH_DIR}/harry_potter_theme.wav"
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo_pcm.tobytes())
        
    print(f"Master WAV generated: {wav_path} (Duration: {total_seconds:.1f}s)")
    
    # Export to MP3 and OGG via FFmpeg
    mp3_path = f"{OUTPUT_DIR}/harry_potter_theme.mp3"
    ogg_path = f"{OUTPUT_DIR}/harry_potter_theme.ogg"
    legacy_ogg = f"{OUTPUT_DIR}/cfl_turningpages-belem-breeze-487596.ogg"
    
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-b:a", "192k", mp3_path], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-c:a", "libvorbis", "-q:a", "6", ogg_path], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-c:a", "libvorbis", "-q:a", "6", legacy_ogg], check=True)
    
    print("Exported to harry_potter_theme.mp3, harry_potter_theme.ogg, and updated background ogg!")

if __name__ == "__main__":
    generate_hedwig_track()
