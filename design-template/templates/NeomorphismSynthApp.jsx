import React, { useState, useEffect, useRef } from 'react';

// --- [1] Design Tokens & Styles ---
const COLORS = {
  base: '#E8EDF4',        
  shadowLight: 'rgba(255, 255, 255, 0.5)', 
  shadowDark: 'rgba(175, 185, 205, 0.18)', 
  accent: '#FF5E3A', 
  accentLoop: '#3A82FF', 
  textSub: '#9AA3B3',
  textMain: '#111317' // 더욱 선명한 블랙
};

const NEO_STYLES = {
  level0: { backgroundColor: COLORS.base, color: COLORS.textMain },
  level1: { 
    boxShadow: `20px 20px 60px ${COLORS.shadowDark}, -20px -20px 60px ${COLORS.shadowLight}`,
    borderRadius: '32px',
    backgroundColor: COLORS.base,
  },
  level2: { 
    boxShadow: `3px 3px 8px ${COLORS.shadowDark}, -3px -3px 8px ${COLORS.shadowLight}`,
  },
  flat: { 
    boxShadow: `0px 0px 0px ${COLORS.shadowDark}, 0px 0px 0px ${COLORS.shadowLight}`,
    backgroundColor: '#E4E9F1' 
  },
  // UI 그룹 등장용
  entrance: (isLoaded, delay = 0) => ({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 1s ease-out ${delay}s, transform 1s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`
  }),
  // 개별 요소가 평면(Plane) 아래에서 위로 솟아오르는 효과
  itemEntrance: (isLoaded, delay = 0) => ({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
    boxShadow: isLoaded 
      ? `3px 3px 8px ${COLORS.shadowDark}, -3px -3px 8px ${COLORS.shadowLight}`
      : `0px 0px 0px transparent, 0px 0px 0px transparent`,
    transition: `
      box-shadow 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s, 
      transform 1s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s, 
      opacity 1s ease-out ${delay}s
    `
  })
};

// --- [2] Web Audio API Engine ---
const AudioEngine = {
  ctx: null,
  masterGain: null,
  filter: null,
  analyser: null,
  delay: null, 
  delayFeedback: null,
  compressor: null, 
  noiseBuffer: null, 
  activeOscillators: {},
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.filter = this.ctx.createBiquadFilter();
      this.analyser = this.ctx.createAnalyser();
      this.delay = this.ctx.createDelay();
      this.delayFeedback = this.ctx.createGain();
      this.compressor = this.ctx.createDynamicsCompressor(); 
      
      this.analyser.fftSize = 256; // 해상도 상향
      this.delay.delayTime.value = 0.35; 

      this.filter.connect(this.compressor);
      this.filter.connect(this.delay);
      this.delay.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delay);
      this.delay.connect(this.compressor);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    }
  },

  updateParams(state) {
    if (!this.ctx) return;
    this.masterGain.gain.value = state.global.masterVolume;
    this.filter.type = 'lowpass';
    this.filter.frequency.setTargetAtTime(state.filter.cutoff, this.ctx.currentTime, 0.1);
    this.filter.Q.value = state.filter.resonance;
    this.delayFeedback.gain.value = state.effects.delay; 
  },

  playNote(freq, noteId, state) {
    if (!this.ctx) this.init();
    this.updateParams(state);
    
    if (this.activeOscillators[noteId]) this.stopNote(noteId, state);

    const { attack, sustain } = state.envelope;
    const now = this.ctx.currentTime;
    const envNode = this.ctx.createGain();
    
    envNode.gain.setValueAtTime(0, now);
    envNode.gain.linearRampToValueAtTime(1, now + attack);
    envNode.gain.linearRampToValueAtTime(sustain, now + attack + 0.1); 
    envNode.connect(this.filter);

    const oscillators = [];
    const oscMain = this.ctx.createOscillator();
    oscMain.type = state.oscillator.type;
    oscMain.frequency.value = freq;
    oscMain.detune.value = state.oscillator.detune;
    oscMain.connect(envNode);
    oscillators.push(oscMain);

    const oscUnison = this.ctx.createOscillator();
    oscUnison.type = state.oscillator.type;
    oscUnison.frequency.value = freq;
    oscUnison.detune.value = state.oscillator.detune + 12; 
    oscUnison.connect(envNode);
    oscillators.push(oscUnison);

    const oscSub = this.ctx.createOscillator();
    oscSub.type = 'sine'; 
    oscSub.frequency.value = freq / 2; 
    oscSub.connect(envNode);
    oscillators.push(oscSub);

    oscillators.forEach(osc => osc.start());
    this.activeOscillators[noteId] = { oscillators, envNode };
  },

  stopNote(noteId, state) {
    if (!this.activeOscillators[noteId] || !this.ctx) return;
    const { oscillators, envNode } = this.activeOscillators[noteId];
    const { release } = state.envelope;
    const now = this.ctx.currentTime;
    envNode.gain.cancelScheduledValues(now);
    envNode.gain.setValueAtTime(envNode.gain.value, now);
    envNode.gain.exponentialRampToValueAtTime(0.001, now + release);
    oscillators.forEach(osc => osc.stop(now + release));
    delete this.activeOscillators[noteId];
  },

  playDrum(type, state) {
    if (!this.ctx) this.init();
    this.updateParams(state);
    const now = this.ctx.currentTime;
    const vol = state.global.masterVolume;

    if (type === 'KICK') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.compressor);
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.1); 
      gain.gain.setValueAtTime(vol * 1.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.start(now); osc.stop(now + 1.0);
    } 
    else if (['SNR', 'HAT', 'OHAT'].includes(type)) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.compressor);

      if (type === 'SNR') {
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 2500;
          noiseGain.gain.setValueAtTime(vol * 1.2, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.connect(oscGain); oscGain.connect(this.compressor);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
          oscGain.gain.setValueAtTime(vol * 0.8, now);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'HAT') {
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.value = 8000;
          noiseGain.gain.setValueAtTime(vol * 0.6, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04); 
      } else if (type === 'OHAT') {
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.value = 6000;
          noiseGain.gain.setValueAtTime(vol * 0.5, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); 
      }
      noiseSource.start(now);
    }
  }
};

// --- [3] UI Components ---

// 3.1. Geometry Visualizer (더 역동적이고 선명한 블랙 테마)
const GeometryVisualizer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      const dataArray = new Uint8Array(128);
      if (AudioEngine.analyser) AudioEngine.analyser.getByteFrequencyData(dataArray);

      const centerX = width / 2;
      const centerY = height / 2;

      // 동심원 드로잉 로직 강화
      for (let i = 1; i <= 28; i++) {
        const rawValue = dataArray[i * 2] || 0;
        const audioValue = (rawValue / 255) ** 1.5; // 비선형 매핑으로 역동성 강화
        
        const baseRadius = i * 26;
        const dynamicRadius = baseRadius + (audioValue * 50); 
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, dynamicRadius), 0, 2 * Math.PI);
        
        // 점선 블랙 (감도에 따라 간격 가변)
        const dashBase = 2;
        const gapBase = 8 - (audioValue * 6);
        ctx.setLineDash([dashBase, Math.max(2, gapBase)]); 
        ctx.lineWidth = 1 + (audioValue * 2);
        
        // 선명한 블랙 적용 (투명도 페이드)
        const alpha = Math.max(0, 0.5 - (i / 35) + (audioValue * 0.3)); 
        ctx.strokeStyle = `rgba(17, 19, 23, ${alpha})`; 
        ctx.stroke();
      }

      // 중앙 블랙 펄스
      const centerRaw = dataArray[0] || 0;
      const centerPulse = (centerRaw / 255) * 30;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15 + centerPulse, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = COLORS.textMain; 
      ctx.stroke();

      // 기하학적 십자 가이드 (블랙)
      const dist = 30 + centerPulse;
      ctx.fillStyle = COLORS.textMain; 
      ctx.beginPath(); ctx.moveTo(centerX, centerY - dist); ctx.lineTo(centerX - 4, centerY - dist + 6); ctx.lineTo(centerX + 4, centerY - dist + 6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(centerX, centerY + dist); ctx.lineTo(centerX - 4, centerY + dist - 6); ctx.lineTo(centerX + 4, centerY + dist - 6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(centerX - dist, centerY); ctx.lineTo(centerX - dist + 6, centerY - 4); ctx.lineTo(centerX - dist + 6, centerY + 4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(centerX + dist, centerY); ctx.lineTo(centerX + dist - 6, centerY - 4); ctx.lineTo(centerX + dist - 6, centerY + 4); ctx.fill();
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="w-full h-80 relative overflow-hidden flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(175, 185, 205, 0.12)' }}>
       <canvas ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-none" />
    </div>
  );
};

// 3.2. Control Knob with Ring 
const ControlKnobRing = ({ label, value, min, max, onChange, unit = '', defaultValue, isLoaded, delay }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);

  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; 
  const strokeDashoffset = arcLength - (percentage * arcLength);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY; 
    const sensitivity = (max - min) / 150; 
    let newValue = startValue + (deltaY * sensitivity);
    newValue = Math.max(min, Math.min(max, newValue)); 
    onChange(newValue);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col items-center gap-6 relative group" style={NEO_STYLES.entrance(isLoaded, delay)}>
      <div className="absolute -top-8 text-[#5A6270] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono">
        {Math.round(value)}{unit}
      </div>
      <div className="w-24 h-24 relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(208, 214, 224, 0.25)" strokeWidth="4" strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" transform="rotate(-225 50 50)" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={COLORS.textMain} strokeWidth="4" strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-225 50 50)" style={{ transition: isDragging ? 'none' : 'stroke-dashoffset 0.1s' }} />
        </svg>
        <div className="w-14 h-14 rounded-full flex items-center justify-center cursor-ns-resize transition-all duration-150" 
          style={isDragging ? NEO_STYLES.flat : NEO_STYLES.itemEntrance(isLoaded, delay)} 
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onDoubleClick={() => defaultValue !== undefined && onChange(defaultValue)}
        >
          <div className="w-full h-full rounded-full absolute" style={{ transform: `rotate(${rotation}deg)` }}>
            <div className="w-1.5 h-1.5 mx-auto mt-2 rounded-full" style={{ backgroundColor: isDragging ? COLORS.textMain : COLORS.textSub, boxShadow: isDragging ? `0 0 8px ${COLORS.textMain}` : 'none' }} />
          </div>
        </div>
      </div>
      <span className="text-[10px] font-semibold tracking-[0.2em] text-[#5A6270] uppercase">{label}</span>
      <span className="text-[9px] font-mono text-[#9AA3B3] -mt-4">{Math.round(value)}{unit}</span>
    </div>
  );
};

// 3.3. Wave Pad Selector 
const WaveSelector = ({ type, onChange, isLoaded, delay }) => {
  const waves = [{ id: 'sine', label: 'SIN' }, { id: 'square', label: 'SQR' }, { id: 'sawtooth', label: 'SAW' }, { id: 'triangle', label: 'TRI' }];
  return (
    <div className="flex flex-col items-center gap-5" style={NEO_STYLES.entrance(isLoaded, delay)}>
      <span className="text-[10px] font-semibold tracking-[0.2em] text-[#5A6270] uppercase">OSC WAVE</span>
      <div className="grid grid-cols-2 gap-3">
        {waves.map((wave) => {
          const isActive = wave.id === type;
          return (
            <button key={wave.id} onClick={() => onChange(wave.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all outline-none select-none group" 
              style={isActive ? NEO_STYLES.flat : NEO_STYLES.itemEntrance(isLoaded, delay)}>
              <span className="text-[9px] font-bold tracking-widest uppercase transition-colors" style={{ color: isActive ? COLORS.accent : COLORS.textSub, textShadow: isActive ? `0 0 12px ${COLORS.accent}80` : 'none' }}>{wave.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 3.4. MIDI Pad 
const MidiPad = ({ noteName, freq, type, stateRef, onPadEvent, isLoaded, delay }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePlay = (fromUser = true) => {
    setIsPressed(true);
    if (type === 'DRUM') AudioEngine.playDrum(noteName, stateRef.current);
    else AudioEngine.playNote(freq, noteName, stateRef.current);
    if (fromUser && onPadEvent) onPadEvent('PLAY', noteName, freq, type);
  };

  const handleStop = (fromUser = true) => {
    setIsPressed(false);
    if (type !== 'DRUM') AudioEngine.stopNote(noteName, stateRef.current);
    if (fromUser && onPadEvent) onPadEvent('STOP', noteName, freq, type);
  };

  useEffect(() => {
    const customPlay = () => handlePlay(false);
    const customStop = () => handleStop(false);
    window.addEventListener(`pad-play-${noteName}`, customPlay);
    window.addEventListener(`pad-stop-${noteName}`, customStop);
    return () => {
      window.removeEventListener(`pad-play-${noteName}`, customPlay);
      window.removeEventListener(`pad-stop-${noteName}`, customStop);
    };
  }, [noteName]);

  const glowColor = type === 'DRUM' ? COLORS.textSub : COLORS.textMain;

  return (
    <button onPointerDown={() => handlePlay(true)} onPointerUp={() => handleStop(true)} onPointerLeave={() => handleStop(true)} 
      className="w-full aspect-square rounded-2xl relative transition-all duration-75 outline-none select-none flex flex-col items-center justify-center group" 
      style={isPressed ? NEO_STYLES.flat : NEO_STYLES.itemEntrance(isLoaded, delay)}
    >
      <span className={`text-[9px] font-bold tracking-widest uppercase transition-opacity ${isPressed ? 'opacity-0' : 'opacity-30 group-hover:opacity-100'}`} style={{ color: COLORS.textMain }}>{noteName}</span>
      {isPressed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full transition-all" style={{ backgroundColor: glowColor, boxShadow: `0 0 16px ${glowColor}, 0 0 32px ${glowColor}80` }} />
        </div>
      )}
    </button>
  );
};

// --- [4] Main App Component ---
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false); 
  const [synthState, setSynthState] = useState({
    oscillator: { type: 'triangle', detune: 0 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 1.5 },
    filter: { cutoff: 1200, resonance: 4 },
    effects: { delay: 0.3 }, 
    global: { masterVolume: 0.8, currentPreset: 'MULTILOOP PRO' }
  });

  const synthStateRef = useRef(synthState);
  useEffect(() => { synthStateRef.current = synthState; }, [synthState]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const [loops, setLoops] = useState([
    { id: 'A', status: 'empty', duration: 0, events: [] },
    { id: 'B', status: 'empty', duration: 0, events: [] },
    { id: 'C', status: 'empty', duration: 0, events: [] }
  ]);

  const [activeRecId, setActiveRecId] = useState(null); 
  const recordingStartTime = useRef(0);

  const handleSlotClick = (id) => {
    setLoops(prev => prev.map(loop => {
      if (loop.id !== id) return loop;
      if (loop.status === 'empty') {
        setActiveRecId(id);
        recordingStartTime.current = performance.now();
        return { ...loop, status: 'recording', events: [] };
      }
      if (loop.status === 'recording') {
        setActiveRecId(null);
        const duration = performance.now() - recordingStartTime.current;
        return { ...loop, status: 'recorded', duration: duration };
      }
      if (loop.status === 'recorded') return { ...loop, status: 'looping' };
      if (loop.status === 'looping') return { ...loop, status: 'recorded' };
      return loop;
    }));
  };

  const handleSlotClear = (id) => {
    setLoops(prev => prev.map(loop => loop.id === id ? { ...loop, status: 'empty', events: [], duration: 0 } : loop));
    if (activeRecId === id) setActiveRecId(null);
  };

  const handlePadEvent = (action, noteName, freq, type) => {
    if (activeRecId) {
      const timeOffset = performance.now() - recordingStartTime.current;
      setLoops(prev => prev.map(loop => 
        loop.id === activeRecId ? { ...loop, events: [...loop.events, { action, noteName, freq, type, timeOffset }] } : loop
      ));
    }
  };

  useEffect(() => {
    const timers = [];
    const intervals = [];
    loops.forEach(loop => {
      if (loop.status === 'looping' && loop.events.length > 0) {
        const runIteration = () => {
          loop.events.forEach(ev => {
            const t = setTimeout(() => {
              const eventName = ev.action === 'PLAY' ? `pad-play-${ev.noteName}` : `pad-stop-${ev.noteName}`;
              window.dispatchEvent(new CustomEvent(eventName));
            }, ev.timeOffset);
            timers.push(t);
          });
        };
        runIteration();
        const inv = setInterval(runIteration, loop.duration);
        intervals.push(inv);
      }
    });
    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [loops]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleSlotClick('A');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loops, activeRecId]);

  const updateState = (category, key, value) => {
    setSynthState(prev => {
      const newState = { ...prev, [category]: { ...prev[category], [key]: value } };
      AudioEngine.updateParams(newState);
      return newState;
    });
  };

  const pads = [
    { note: 'C3',  freq: 130.81, type: 'SYNTH' }, { note: 'Eb3', freq: 155.56, type: 'SYNTH' },
    { note: 'F3',  freq: 174.61, type: 'SYNTH' }, { note: 'G3',  freq: 196.00, type: 'SYNTH' },
    { note: 'Bb3', freq: 233.08, type: 'SYNTH' }, { note: 'C4',  freq: 261.63, type: 'SYNTH' },
    { note: 'Eb4', freq: 311.13, type: 'SYNTH' }, { note: 'F4',  freq: 349.23, type: 'SYNTH' },
    { note: 'G4',  freq: 392.00, type: 'SYNTH' }, { note: 'Bb4', freq: 466.16, type: 'SYNTH' },
    { note: 'C5',  freq: 523.25, type: 'SYNTH' }, { note: 'Eb5', freq: 622.25, type: 'SYNTH' },
    { note: 'KICK', freq: 0, type: 'DRUM' },      { note: 'SNR', freq: 0, type: 'DRUM' },
    { note: 'HAT',  freq: 0, type: 'DRUM' },      { note: 'OHAT', freq: 0, type: 'DRUM' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8EDF4] p-4 font-sans select-none overflow-hidden">
      <div 
        className="pt-10 pb-12 flex flex-col gap-10 relative overflow-hidden" 
        style={{ ...NEO_STYLES.level1, width: '100%', maxWidth: 900, minWidth: 320 }}
      >
        <div 
          className="flex items-center justify-between w-full px-12"
          style={NEO_STYLES.entrance(isLoaded, 0.2)}
        >
          <div className="text-[9px] font-bold tracking-[0.2em] text-[#9AA3B3] uppercase">Status: Online</div>
          <div className="text-[11px] font-bold tracking-[0.4em] text-[#5A6270]">01. {synthState.global.currentPreset}</div>
          <div className="text-[9px] font-bold tracking-[0.2em] text-[#9AA3B3] uppercase">SoftWave Eng V2</div>
        </div>

        <div className="w-full relative" style={NEO_STYLES.entrance(isLoaded, 0.35)}>
          <GeometryVisualizer />
          <div className="absolute bottom-4 w-full flex justify-center gap-16 text-[10px] font-bold tracking-[0.2em] uppercase pointer-events-none">
            <div><span className="text-[#9AA3B3]">CUTOFF: </span><span style={{color: COLORS.textMain}}>{Math.round(synthState.filter.cutoff)}Hz</span></div>
            <div><span className="text-[#9AA3B3]">RES: </span><span style={{color: COLORS.textMain}}>{synthState.filter.resonance}</span></div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex justify-between items-center px-12">
          <div className="w-1/4 flex items-start">
            <WaveSelector type={synthState.oscillator.type} onChange={(v) => updateState('oscillator', 'type', v)} isLoaded={isLoaded} delay={0.5} />
          </div>

          <div className="w-2/4 flex justify-center gap-6">
            {loops.map((loop, i) => (
              <div key={loop.id} className="flex flex-col items-center gap-4" style={NEO_STYLES.entrance(isLoaded, 0.6 + i * 0.1)}>
                <button 
                  onClick={() => handleSlotClick(loop.id)}
                  onDoubleClick={() => handleSlotClear(loop.id)}
                  className="w-20 h-20 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all outline-none relative overflow-hidden"
                  style={loop.status === 'looping' || loop.status === 'recording' ? NEO_STYLES.flat : NEO_STYLES.itemEntrance(isLoaded, 0.6 + i * 0.1)}
                >
                  <span className="text-[10px] font-bold tracking-widest text-[#5A6270]">LOOP {loop.id}</span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ 
                      backgroundColor: loop.status === 'recording' ? COLORS.accent : COLORS.textSub,
                      boxShadow: loop.status === 'recording' ? `0 0 8px ${COLORS.accent}` : 'none'
                    }} />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ 
                      backgroundColor: loop.status === 'looping' ? COLORS.accentLoop : (loop.status === 'recorded' ? COLORS.textMain : COLORS.textSub),
                      boxShadow: loop.status === 'looping' ? `0 0 8px ${COLORS.accentLoop}` : 'none'
                    }} />
                  </div>
                </button>
                <span className="text-[8px] text-[#9AA3B3] font-mono">{loop.status.toUpperCase()}</span>
              </div>
            ))}
          </div>

          <div className="w-1/4 flex justify-end gap-10">
            <ControlKnobRing label="DELAY" value={synthState.effects.delay * 100} min={0} max={100} onChange={(v) => updateState('effects', 'delay', v / 100)} defaultValue={30} unit="%" isLoaded={isLoaded} delay={0.8} />
            <ControlKnobRing label="OUTPUT" value={synthState.global.masterVolume * 100} min={0} max={100} onChange={(v) => updateState('global', 'masterVolume', v / 100)} defaultValue={80} unit="%" isLoaded={isLoaded} delay={0.9} />
          </div>
        </div>

        <div className="mt-4 px-12 w-full">
          <div className="grid grid-cols-8 gap-4 w-full">
            {pads.map((pad, index) => (
              <MidiPad 
                key={index} 
                noteName={pad.note} 
                freq={pad.freq} 
                type={pad.type} 
                stateRef={synthStateRef} 
                onPadEvent={handlePadEvent} 
                isLoaded={isLoaded}
                delay={1.1 + (index % 8) * 0.05}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
