/* =========================================================
   Pinky & Shivam · Shubh Vivah
   ========================================================= */
(() => {
  const body = document.body;
  const intro = document.getElementById('intro');
  const openBtn = document.getElementById('openBtn');
  const music = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicBtn');
  const pages = [...document.querySelectorAll('.page')];

  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- Gold leaf sprigs in the corners ---------- */
  const svgEl = (parent, tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };
  // a curved stem (quadratic bezier) with leaves alternating along it
  function sprig(svg, p0, p1, p2, leaves, size) {
    svgEl(svg, 'path', { d: `M${p0} Q${p1} ${p2}` });
    const [x0, y0] = p0.split(',').map(Number);
    const [x1, y1] = p1.split(',').map(Number);
    const [x2, y2] = p2.split(',').map(Number);
    for (let i = 0; i < leaves; i++) {
      const t = 0.12 + (i / (leaves - 1)) * 0.82;
      const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
      const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1);
      const dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1);
      const ang = Math.atan2(dy, dx) * 180 / Math.PI + (i % 2 ? 42 : -42);
      const s = size * (1 - t * 0.35);
      const off = i % 2 ? 1 : -1;
      const lx = x + Math.cos((ang * Math.PI) / 180) * s;
      const ly = y + Math.sin((ang * Math.PI) / 180) * s;
      svgEl(svg, 'ellipse', {
        cx: lx.toFixed(1), cy: ly.toFixed(1), rx: s.toFixed(1), ry: (s * 0.45).toFixed(1),
        transform: `rotate(${ang.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})`,
      });
      if (i % 3 === 1) svgEl(svg, 'circle', { cx: (x - off * 5).toFixed(1), cy: (y + off * 5).toFixed(1), r: 2.2 });
    }
  }
  // every page gets a sprig in two opposite corners
  pages.forEach(page => {
    ['tl', 'br'].forEach(pos => {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 220 220');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('sprig', `sprig-${pos}`);
      page.prepend(svg);
    });
  });
  document.querySelectorAll('.sprig').forEach(svg => {
    sprig(svg, '6,6', '120,10', '214,70', 9, 13);
    sprig(svg, '6,6', '12,110', '64,210', 8, 12);
    sprig(svg, '6,6', '70,60', '120,130', 6, 10);
  });

  const sparkles = document.getElementById('sparkles');
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${10 + Math.random() * 85}%`;
    s.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
    sparkles.appendChild(s);
  }

  /* ---------- Laurel wreath around the hero monogram ---------- */
  const wreath = document.getElementById('wreath');
  [-1, 1].forEach(side => {
    // each half runs from the bottom (100°) round to near the top (250°)
    const R = 88, from = 100, to = 248, leaves = 15;
    const pt = deg => [side * R * Math.cos(deg * Math.PI / 180), R * Math.sin(deg * Math.PI / 180)];
    const [ax, ay] = pt(from), [bx, by] = pt(to);
    svgEl(wreath, 'path', { d: `M${ax.toFixed(1)} ${ay.toFixed(1)} A${R} ${R} 0 0 ${side > 0 ? 1 : 0} ${bx.toFixed(1)} ${by.toFixed(1)}` });
    for (let i = 0; i < leaves; i++) {
      const deg = from + (i / (leaves - 1)) * (to - from);
      const [x, y] = pt(deg);
      const out = i % 2 ? 1 : -1;            // alternate outside / inside the ring
      const tangent = side > 0 ? deg + 90 : 90 - deg;
      const ang = tangent + out * 35 * side;
      const s = 11 - i * 0.33;
      const lx = x + Math.cos(ang * Math.PI / 180) * s;
      const ly = y + Math.sin(ang * Math.PI / 180) * s;
      svgEl(wreath, 'ellipse', {
        cx: lx.toFixed(1), cy: ly.toFixed(1), rx: s.toFixed(1), ry: (s * 0.42).toFixed(1),
        transform: `rotate(${ang.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})`,
      });
    }
    const [tx, ty] = pt(to + 6);
    svgEl(wreath, 'circle', { cx: tx.toFixed(1), cy: ty.toFixed(1), r: 2.6 });
  });

  /* ---------- Intro: open the envelope ---------- */
  document.getElementById('pages').scrollTo(0, 0);
  openBtn.addEventListener('click', () => {
    if (intro.classList.contains('opening')) return;
    intro.classList.add('opening');          // seal lifts, flap folds back
    tryMusic();
    setTimeout(() => intro.classList.add('flap-behind'), 450);
    setTimeout(() => intro.classList.add('letter-out'), 800);   // card slides out
    setTimeout(() => {
      intro.classList.add('done');           // fade into the site
      body.classList.remove('locked');
      startPetals(window.innerWidth < 600 ? 35 : 60);
    }, 2200);
    setTimeout(() => showPage(currentIndex()), 2600);
    setTimeout(() => intro.classList.add('gone'), 3300);
  });

  /* ---------- Optional music (add music.mp3 next to index.html) ---------- */
  function tryMusic() {
    music.volume = 0.5;
    music.play()
      .then(() => { musicBtn.hidden = false; musicBtn.classList.add('playing'); })
      .catch(() => { /* no music file or blocked — keep button hidden */ });
  }
  musicBtn.addEventListener('click', () => {
    if (music.paused) { music.play(); musicBtn.classList.add('playing'); }
    else { music.pause(); musicBtn.classList.remove('playing'); }
  });

  /* ---------- Pages: one per scroll, info appears one-by-one ---------- */
  const STEP = 0.22;   // seconds between each item on a page
  const FIRST = 0.15;  // delay before the first item
  let active = -1;

  function showPage(i) {
    if (body.classList.contains('locked') || i === active) return;
    if (active > -1) hidePage(active);
    active = i;
    pages[i].querySelectorAll('.reveal').forEach((el, n) => {
      el.classList.remove('out');
      el.style.transitionDelay = `${FIRST + n * STEP}s`;
      el.classList.add('in');
    });
    dots.forEach((d, n) => d.classList.toggle('active', n === i));
    body.classList.toggle('last-page', i === pages.length - 1);
  }

  function hidePage(i) {
    pages[i].querySelectorAll('.reveal').forEach(el => {
      el.classList.add('out');
      el.classList.remove('in');
    });
  }

  const currentIndex = () => {
    const mid = window.innerHeight / 2;
    let best = 0;
    pages.forEach((p, n) => {
      const r = p.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) best = n;
    });
    return best;
  };

  const pageObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) showPage(pages.indexOf(e.target));
    });
  }, { threshold: 0.55 });
  pages.forEach(p => pageObserver.observe(p));

  /* ---------- Side dots + next button ---------- */
  const dotsNav = document.getElementById('dots');
  const dots = pages.map((p, n) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', p.dataset.label || `Page ${n + 1}`);
    b.addEventListener('click', () => p.scrollIntoView({ behavior: 'smooth' }));
    dotsNav.appendChild(b);
    return b;
  });
  document.getElementById('nextHint').addEventListener('click', () => {
    const next = pages[Math.min(currentIndex() + 1, pages.length - 1)];
    next.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Keyboard (desktop) ---------- */
  window.addEventListener('keydown', (e) => {
    if (body.classList.contains('locked')) return;
    const keysNext = ['ArrowDown', 'PageDown', ' '];
    const keysPrev = ['ArrowUp', 'PageUp'];
    if (!keysNext.includes(e.key) && !keysPrev.includes(e.key)) return;
    e.preventDefault();
    const i = currentIndex() + (keysNext.includes(e.key) ? 1 : -1);
    if (pages[i]) pages[i].scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Falling petals ---------- */
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  const colors = ['#ffffff', '#dfe7c6', '#b9c48a', '#8e9c50', '#f1f5e4'];
  let petals = [], W = 0, H = 0, running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const makePetal = (top) => ({
    x: Math.random() * W,
    y: top ? -20 - Math.random() * H : Math.random() * H,
    s: 6 + Math.random() * 8,
    vy: 0.6 + Math.random() * 1.1,
    vx: -0.3 + Math.random() * 0.6,
    rot: Math.random() * Math.PI * 2,
    vr: -0.02 + Math.random() * 0.04,
    sway: Math.random() * Math.PI * 2,
    c: colors[(Math.random() * colors.length) | 0],
  });

  function startPetals(burst) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < burst; i++) petals.push(makePetal(true));
    petals.maxCount = W < 600 ? 16 : 32;
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.quadraticCurveTo(p.s * 0.8, 0, 0, p.s);
    ctx.quadraticCurveTo(-p.s * 0.8, 0, 0, -p.s);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.sway += 0.02;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.sway) * 0.5;
      p.rot += p.vr;
      if (p.y > H + 20) {
        if (petals.length > petals.maxCount) petals.splice(i, 1);
        else Object.assign(p, makePetal(false), { y: -20 });
        continue;
      }
      drawPetal(p);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Countdown ---------- */
  const target = new Date(2026, 10, 25, 0, 0, 0).getTime(); // 25 Nov 2026
  const end = new Date(2026, 10, 30, 23, 59, 59).getTime();
  const pad = n => String(n).padStart(2, '0');
  const el = id => document.getElementById(id);
  function updateCountdown() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    if (now >= target) {
      el('cd-note').textContent = now <= end
        ? 'The celebrations have begun! 🙏'
        : 'Thank you for your blessings 🙏';
    }
    const d = Math.floor(diff / 864e5); diff %= 864e5;
    const h = Math.floor(diff / 36e5); diff %= 36e5;
    const m = Math.floor(diff / 6e4); diff %= 6e4;
    const s = Math.floor(diff / 1e3);
    el('cd-d').textContent = pad(d);
    el('cd-h').textContent = pad(h);
    el('cd-m').textContent = pad(m);
    el('cd-s').textContent = pad(s);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- Share ---------- */
  document.getElementById('shareBtn').addEventListener('click', async () => {
    const data = {
      title: 'Pinky & Shivam · Shubh Vivah',
      text: 'You are cordially invited to the wedding celebrations of Pinky Ojha & Shivam Ojha · 25–30 November 2026',
      url: location.href,
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch (_) {}
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(data.text + '\n' + data.url), '_blank');
    }
  });
})();
