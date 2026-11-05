import { useEffect, useRef, useState } from 'react';

const COLORS = ['#ef4151', '#f5eee7', '#e7b958', '#a99af5', '#86cdb6', '#ff936f', '#d9e6ef', '#e8b3cf'];
const TARGETS = [
  '.site-header', '.hero-top', '.hero-title', '.hero-portrait', '.hero-intro', '.hero-side', '.hero-bottom',
  '.section-heading', '.portfolio-toolbar', '.project-card', '.brand-section', '.recognition', '.breakdown-copy',
  '.comparison', '.about-lead', '.studio-grid > *', '.process-row', '.quote-panel', '.experience-row',
  '.awards-panel', '.contact-grid', '.project-brief', '.footer',
];
const MAX_TARGETS = 64;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => value * value * (3 - 2 * value);

function collectTargets() {
  const elements = new Set();
  for (const selector of TARGETS) {
    for (const element of document.querySelectorAll(selector)) elements.add(element);
  }

  return [...elements]
    .map(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        element,
        top: rect.top + window.scrollY,
        visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 2 && rect.height > 2,
      };
    })
    .filter(item => item.visible)
    .sort((a, b) => a.top - b.top)
    .slice(0, MAX_TARGETS);
}

function pointOnBox(rect, distance) {
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const perimeter = 2 * (width + height);
  let left = ((distance % perimeter) + perimeter) % perimeter;
  if (left <= width) return { x: rect.left + left, y: rect.top, angle: 0 };
  left -= width;
  if (left <= height) return { x: rect.right, y: rect.top + left, angle: Math.PI / 2 };
  left -= height;
  if (left <= width) return { x: rect.right - left, y: rect.bottom, angle: Math.PI };
  left -= width;
  return { x: rect.left, y: rect.bottom - left, angle: -Math.PI / 2 };
}

function drawCursor(ctx, x, y, angle, color, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(scale, scale);
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(12, 10, 12, 0.92)';
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(2.2, 1);
  ctx.lineTo(7, -1);
  ctx.lineTo(8, 2);
  ctx.lineTo(3, 4);
  ctx.lineTo(6, 8);
  ctx.lineTo(3, 10);
  ctx.lineTo(0, 5);
  ctx.lineTo(-3, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTrace(ctx, rect, progress) {
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const perimeter = 2 * (width + height);
  let remaining = perimeter * progress;
  const corners = [
    [rect.left, rect.top], [rect.right, rect.top],
    [rect.right, rect.bottom], [rect.left, rect.bottom], [rect.left, rect.top],
  ];

  ctx.beginPath();
  ctx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 0; i < corners.length - 1 && remaining > 0; i++) {
    const [x1, y1] = corners[i];
    const [x2, y2] = corners[i + 1];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.min(length, remaining);
    const ratio = length ? step / length : 0;
    ctx.lineTo(x1 + (x2 - x1) * ratio, y1 + (y2 - y1) * ratio);
    remaining -= step;
  }
  ctx.strokeStyle = '#ef4151';
  ctx.lineWidth = 1.4;
  ctx.shadowColor = 'rgba(239, 65, 81, 0.65)';
  ctx.shadowBlur = 7;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (progress > 0.12) {
    const label = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    ctx.font = '600 10px Manrope, system-ui, sans-serif';
    const labelWidth = ctx.measureText(label).width + 12;
    const labelX = clamp(rect.left, 5, window.innerWidth - labelWidth - 5);
    const labelY = clamp(rect.bottom + 8, 22, window.innerHeight - 8);
    ctx.fillStyle = '#ef4151';
    ctx.fillRect(labelX, labelY, labelWidth, 18);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelX + 6, labelY + 9);
  }
}

function drawOrbit(ctx, time, progress) {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2 - 10;
  const radius = 30 + Math.sin(time / 470) * 5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(239, 65, 81, ${0.22 + progress * 0.22})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let i = 0; i < COLORS.length; i++) {
    const angle = time / 620 + (i / COLORS.length) * Math.PI * 2;
    drawCursor(ctx, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, angle, COLORS[i], 0.86);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f4eeeb';
  ctx.font = '700 13px Manrope, system-ui, sans-serif';
  ctx.fillText('RENANDO', x, y + 1);
  ctx.fillStyle = 'rgba(244, 238, 235, 0.5)';
  ctx.font = '600 8px Manrope, system-ui, sans-serif';
  ctx.letterSpacing = '0.24em';
  ctx.fillText(progress > 0.7 ? 'THE FINAL FRAME' : 'REBUILDING THE PORTFOLIO', x, y + 62);
}

export default function SwarmIntro({ enabled, blocked = false }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(enabled ? 'intro' : 'live');
  const cleanupRef = useRef(null);
  const soundRef = useRef(false);
  const audioRef = useRef(null);
  const speedRef = useRef(1);
  const autoStartRef = useRef(false);
  const [phase, setPhase] = useState(enabled ? 'intro' : 'live');
  const [runId, setRunId] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [sound, setSound] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!enabled || autoStartRef.current) return;
    autoStartRef.current = true;
    phaseRef.current = 'intro';
    setPhase('intro');
    setRunId(1);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      phaseRef.current = 'live';
      setPhase('live');
      return;
    }
    if (runId === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      phaseRef.current = 'live';
      setPhase('live');
      return;
    }

    let raf = 0;
    let stopped = false;
    let lastFrame = performance.now();
    let stageStarted = lastFrame;
    let buildElapsed = 0;
    let buildDuration = 9;
    let tasks = [];
    let maxScroll = 0;
    let prepared = false;
    let lastTask = -1;
    let lastHudUpdate = 0;
    let activeTask = -1;
    let resizeRatio = 1;
    let returnScroll = 0;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const pulses = [];
    const previousFocus = document.activeElement;
    const inertStates = [];

    const setStage = next => {
      phaseRef.current = next;
      setPhase(next);
      stageStarted = performance.now();
    };

    const resize = () => {
      resizeRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(window.innerWidth * resizeRatio);
      canvas.height = Math.round(window.innerHeight * resizeRatio);
      ctx.setTransform(resizeRatio, 0, 0, resizeRatio, 0, 0);
    };

    const scrollTo = top => window.scrollTo({ top, left: 0, behavior: 'instant' });

    const prepare = () => {
      if (prepared) return;
      prepared = true;
      tasks = collectTargets();
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      buildDuration = Math.max(7, Math.min(14, 4.2 + maxScroll / 540));
      setProgress({ done: 0, total: tasks.length });
    };

    const playTone = (frequency, delay = 0, length = 0.11) => {
      const audio = audioRef.current;
      if (!soundRef.current || !audio || audio.state !== 'running') return;
      const start = audio.currentTime + delay;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.025, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + length + 0.02);
    };

    const markBuilt = (done, total) => {
      if (done !== lastTask) {
        lastTask = done;
        if (done > 0) playTone(420 + (done % 7) * 48);
      }
      const now = performance.now();
      if (now - lastHudUpdate > 140 || done === total) {
        lastHudUpdate = now;
        setProgress({ done, total });
      }
    };

    const paintCover = opacity => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = clamp(opacity);
      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalAlpha = 1;
    };

    const drawBuild = (index, itemProgress) => {
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < index; i++) {
        const rect = tasks[i].element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) continue;
        ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
      }

      const item = tasks[index];
      if (item) {
        const rect = item.element.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth) {
          ctx.clearRect(rect.left, rect.top, rect.width, rect.height * ease(itemProgress));
          ctx.globalCompositeOperation = 'source-over';
          drawTrace(ctx, rect, itemProgress);
          const perimeter = Math.max(1, 2 * (rect.width + rect.height));
          for (let i = 0; i < COLORS.length; i++) {
            const point = pointOnBox(rect, (itemProgress * perimeter + (i / COLORS.length) * perimeter) % perimeter);
            drawCursor(ctx, point.x, point.y, point.angle, COLORS[i], 0.82 + (i % 3) * 0.08);
          }
          const scanY = rect.top + rect.height * ease(itemProgress);
          ctx.beginPath();
          ctx.moveTo(rect.left, scanY);
          ctx.lineTo(rect.right, scanY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    };

    const pulse = event => {
      if (phaseRef.current !== 'build') return;
      pulses.push({ x: event.clientX, y: event.clientY, at: performance.now() });
      if (pulses.length > 3) pulses.shift();
      playTone(760, 0, 0.07);
    };

    const preventScroll = event => event.preventDefault();
    const escape = event => {
      if (phaseRef.current === 'live') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        stopIntro();
      } else if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)
        && !(event.target instanceof Element && event.target.closest('button'))) {
        event.preventDefault();
      }
    };

    const stopIntro = () => {
      scrollTo(returnScroll);
      setStage('live');
      if (cleanupRef.current) cleanupRef.current();
    };

    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('keydown', escape, true);
      canvas.removeEventListener('pointerdown', pulse);
      for (const [element, wasInert] of inertStates) element.inert = wasInert;
      if (phaseRef.current !== 'live') scrollTo(returnScroll);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (cleanupRef.current === cleanup) cleanupRef.current = null;
    };
    cleanupRef.current = cleanup;

    const lockBackground = () => {
      for (const element of document.querySelectorAll('#root > *')) {
        if (element === canvas || element.classList.contains('swarm-intro-hud')) continue;
        inertStates.push([element, element.inert]);
        element.inert = true;
      }
    };

    const draw = now => {
      raf = 0;
      if (stopped || phaseRef.current === 'live') return;
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const stage = phaseRef.current;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (stage === 'intro') {
        const p = clamp((now - stageStarted) / 1250);
        paintCover(ease(clamp(p * 1.7)));
        drawOrbit(ctx, now, p);
        if (p >= 1) {
          prepare();
          buildElapsed = 0;
          markBuilt(0, tasks.length);
          setStage('build');
        }
      } else if (stage === 'build') {
        prepare();
        buildElapsed += dt * speedRef.current;
        const ratio = clamp(buildElapsed / buildDuration);
        const position = ratio * tasks.length;
        activeTask = Math.min(tasks.length - 1, Math.floor(position));
        const itemProgress = tasks.length ? (ratio >= 1 ? 1 : position - Math.floor(position)) : 1;
        const done = ratio >= 1 ? tasks.length : Math.floor(position);
        const firstY = tasks[activeTask]?.top || 0;
        const nextY = tasks[Math.min(activeTask + 1, tasks.length - 1)]?.top || firstY;
        const focusY = firstY + (nextY - firstY) * ease(itemProgress);
        const wantedScroll = clamp(focusY - window.innerHeight * 0.52, 0, maxScroll);
        const scrollStep = (maxScroll / buildDuration + 280) * dt * speedRef.current;
        const scrollDelta = clamp(wantedScroll - window.scrollY, -scrollStep, scrollStep);
        scrollTo(window.scrollY + scrollDelta);
        paintCover(1);
        drawBuild(activeTask, itemProgress);
        markBuilt(done, tasks.length);

        for (let i = pulses.length - 1; i >= 0; i--) {
          const age = (now - pulses[i].at) / 500;
          if (age >= 1) {
            pulses.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(pulses[i].x, pulses[i].y, 8 + age * 44, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 65, 81, ${(1 - age) * 0.5})`;
          ctx.lineWidth = 1.5 * (1 - age);
          ctx.stroke();
        }

        if (ratio >= 1) {
          buildElapsed = buildDuration;
          markBuilt(tasks.length, tasks.length);
          setStage('return');
        }
      } else if (stage === 'return') {
        const p = clamp((now - stageStarted) / 1050);
        scrollTo(returnScroll + maxScroll * (1 - ease(p)));
        paintCover(1);
        drawOrbit(ctx, now, 1);
        if (p >= 1) setStage('reveal');
      } else if (stage === 'reveal') {
        const p = clamp((now - stageStarted) / 900);
        paintCover(1 - ease(p));
        if (p >= 1) {
          scrollTo(returnScroll);
          setStage('live');
          cleanup();
          return;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    document.documentElement.style.scrollBehavior = 'auto';
    resize();
    returnScroll = 0;
    scrollTo(0);
    lockBackground();
    setStage('intro');
    window.addEventListener('resize', resize);
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('keydown', escape, true);
    canvas.addEventListener('pointerdown', pulse, { passive: true });
    raf = requestAnimationFrame(draw);

    return cleanup;
  }, [enabled, runId]);

  useEffect(() => () => {
    if (audioRef.current && audioRef.current.state !== 'closed') audioRef.current.close().catch(() => {});
  }, []);

  const skip = () => {
    if (phaseRef.current === 'live') return;
    phaseRef.current = 'live';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    cleanupRef.current?.();
    setPhase('live');
  };

  const replay = () => {
    if (!enabled) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    phaseRef.current = 'intro';
    setPhase('intro');
    setProgress({ done: 0, total: 0 });
    setRunId(id => id + 1);
  };

  const changeSpeed = () => {
    const speeds = [1, 1.5, 2];
    const next = speeds[(speeds.indexOf(speedRef.current) + 1) % speeds.length];
    speedRef.current = next;
    setSpeed(next);
  };

  const toggleSound = async () => {
    const next = !soundRef.current;
    soundRef.current = next;
    setSound(next);
    if (!next) {
      if (audioRef.current && audioRef.current.state === 'running') audioRef.current.suspend().catch(() => {});
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioRef.current || audioRef.current.state === 'closed') audioRef.current = new AudioContextClass();
      await audioRef.current.resume();
      const audio = audioRef.current;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.linearRampToValueAtTime(0.035, audio.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.17);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.18);
    } catch {
      soundRef.current = false;
      setSound(false);
    }
  };

  if (!enabled || blocked) return null;

  if (phase === 'live') {
    return runId > 0 ? <button className="swarm-replay" onClick={replay} aria-label="Replay the portfolio rebuild">↻ <span>REPLAY BUILD</span></button> : null;
  }

  return <>
    <canvas ref={canvasRef} className="swarm-intro-canvas" aria-hidden="true" />
    <div className="swarm-intro-hud" role="group" aria-label="Portfolio rebuild controls">
      <div className="swarm-hud-brand"><span className="swarm-hud-orbit"><i /></span><span><b>{phase === 'return' || phase === 'reveal' ? 'THE FINAL FRAME' : 'REBUILDING RENANDO'}</b><small>{phase === 'intro' ? 'Gathering the crew' : phase === 'build' ? `${progress.done} / ${progress.total} elements assembled` : 'Returning to the live portfolio'}</small></span></div>
      <div className="swarm-hud-progress" role="progressbar" aria-label="Portfolio rebuild progress" aria-valuemin={0} aria-valuemax={Math.max(1, progress.total)} aria-valuenow={progress.done}><i style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} /></div>
      <div className="swarm-hud-actions">
        {(phase === 'intro' || phase === 'build') && <button onClick={changeSpeed} title="Change build speed">{speed}×</button>}
        {(phase === 'intro' || phase === 'build') && <button onClick={toggleSound} title={sound ? 'Turn sound off' : 'Turn sound on'}>{sound ? 'SOUND ON' : 'SOUND OFF'}</button>}
        {(phase === 'intro' || phase === 'build') && <button className="swarm-skip" onClick={skip}>SKIP INTRO <span aria-hidden="true">↗</span></button>}
      </div>
    </div>
  </>;
}
