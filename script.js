'use strict';

const CONFIG = {
  countdownTarget: '2026-11-14T18:00:00+05:00', // Barat: Saturday 14 Nov 2026, 6 PM
  scratchReveal: 0.45
};

/* 1. Cover: tap seal -> shine -> name plate -> reveal page */
(() => {
  const cover = document.getElementById('cover');
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    cover.classList.add('is-opening');
    setTimeout(() => {
      cover.classList.add('is-open');
      document.body.classList.remove('is-locked');
    }, 3400);
  };
  cover.addEventListener('click', start);
})();

/* 2. Countdown */
(() => {
  const target = new Date(CONFIG.countdownTarget).getTime();
  const get = (u) => document.querySelector(`[data-u="${u}"]`);
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const t = Math.max(0, target - Date.now());
    get('d').textContent = pad(Math.floor(t / 864e5));
    get('h').textContent = pad(Math.floor(t / 36e5) % 24);
    get('m').textContent = pad(Math.floor(t / 6e4) % 60);
    get('s').textContent = pad(Math.floor(t / 1e3) % 60);
  };
  tick();
  setInterval(tick, 1000);
})();

/* 3. Gold foil scratch card */
(() => {
  const wrap = document.getElementById('scratch');
  const c = document.getElementById('foil');
  const ctx = c.getContext('2d', { willReadFrequently: true });
  let down = false;

  function paint() {
    const { width: w, height: h } = wrap.getBoundingClientRect();
    c.width = w; c.height = h;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#d8b35c'); g.addColorStop(.5, '#f1dc95'); g.addColorStop(1, '#bf9a45');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(120,90,30,.22)'; ctx.lineWidth = 2;
    for (let x = -h; x < w; x += 10) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
    ctx.fillStyle = 'rgba(90,65,20,.75)';
    ctx.font = '600 15px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('S C R A T C H   H E R E', w / 2, h / 2 + 5);
  }
  function erase(e) {
    if (!down) return;
    const r = c.getBoundingClientRect();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 24, 0, Math.PI * 2);
    ctx.fill();
  }
  function cleared() {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let n = 0, t = 0;
    for (let i = 3; i < d.length; i += 64) { t++; if (d[i] === 0) n++; }
    return n / t;
  }
  c.addEventListener('pointerdown', (e) => { down = true; c.setPointerCapture(e.pointerId); erase(e); });
  c.addEventListener('pointermove', erase);
  c.addEventListener('pointerup', () => {
    down = false;
    if (cleared() > CONFIG.scratchReveal) c.style.opacity = 0;
  });
  paint();
})();

/* 4. Fade-in on scroll */
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((list) => {
    list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();