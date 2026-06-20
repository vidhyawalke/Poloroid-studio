import { useState, useCallback, useEffect } from 'react';

// Global mute state so it is shared across components
let globalMuted = false;
const listeners = new Set();

const updateMuteState = (muted) => {
  globalMuted = muted;
  listeners.forEach(listener => listener(muted));
};

export const useSound = () => {
  const [isMuted, setIsMuted] = useState(globalMuted);

  useEffect(() => {
    const handleMuteChange = (muted) => setIsMuted(muted);
    listeners.add(handleMuteChange);
    return () => {
      listeners.delete(handleMuteChange);
    };
  }, []);

  const toggleMute = useCallback(() => {
    updateMuteState(!globalMuted);
  }, []);

  const getAudioContext = () => {
    if (globalMuted) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    return new AudioContext();
  };

  // Synthesize a mechanical camera shutter click
  const playShutter = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Create shutter click sound with noise and oscillator
    const now = ctx.currentTime;
    
    // Noise Node for the shutter mechanism rattle
    const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter noise to sound mechanical and tight
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.Q.setValueAtTime(3, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    // Add a low metallic mirror-flap sound
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    // Trigger
    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.15);
    osc.stop(now + 0.15);
  }, []);

  // Synthesize a retro tape rip / sticker adhesive sound
  const playTape = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Washi tape tearing sound (rapid crackling / noise clicks)
    const bufferSize = ctx.sampleRate * 0.08; // 80ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Create crackling grain pattern
      data[i] = (Math.random() * 2 - 1) * (Math.sin(i / 10) > 0.8 ? 0.9 : 0.08);
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.08);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.08);
  }, []);

  // Synthesize a sliding paper sound (when adding a Polaroid card)
  const playSlide = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Soft friction sound using bandpass noise
    const bufferSize = ctx.sampleRate * 0.35; // 350ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.3);
    filter.Q.setValueAtTime(1.5, now);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.35);
  }, []);

  // Synthesize a chemical hiss (developing animation sound)
  const playDeveloping = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 2.2; // 2.2 seconds
    
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Soft pink/white noise with low-frequency rumble
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05 + Math.sin(i / 100) * 0.01;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Slow lowpass filter sweep mimicking chemical settling
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + duration);
  }, []);

  return {
    isMuted,
    toggleMute,
    playShutter,
    playTape,
    playSlide,
    playDeveloping,
  };
};
