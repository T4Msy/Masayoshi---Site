/* ============================================================
   MSY — MASAYOSHI | script.js
   ============================================================ */

'use strict';

/* ─── CUSTOM CURSOR ──────────────────────────────────────── */
(function initCursor() {
  const cursor = document.querySelector('.cursor');
  const ring   = document.querySelector('.cursor-ring');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;

    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    ring.style.left   = rx + 'px';
    ring.style.top    = ry + 'px';

    raf = requestAnimationFrame(animateCursor);
  }

  animateCursor();
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();

/* ─── NAV: SCROLL STATE ──────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── MOBILE MENU ────────────────────────────────────────── */
(function initMobileMenu() {
  const burger  = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const closeBtn   = document.querySelector('.nav-mobile-close');

  if (!burger || !mobileMenu) return;

  function open() {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    burger.querySelector('span:nth-child(1)').style.transform = 'rotate(45deg) translate(5px, 5px)';
    burger.querySelector('span:nth-child(2)').style.opacity = '0';
    burger.querySelector('span:nth-child(3)').style.transform = 'rotate(-45deg) translate(5px, -5px)';
  }

  function close() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    burger.querySelector('span:nth-child(1)').style.transform = '';
    burger.querySelector('span:nth-child(2)').style.opacity = '';
    burger.querySelector('span:nth-child(3)').style.transform = '';
  }

  burger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? close() : open();
  });

  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  if (closeBtn) closeBtn.addEventListener('click', close);
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ─── HERO CANVAS (particle grid) ───────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, pts, raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = [];
    const cols = Math.ceil(W / 80) + 1;
    const rows = Math.ceil(H / 80) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pts.push({
          x: c * 80,
          y: r * 80,
          ox: c * 80,
          oy: r * 80,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        });
      }
    }
  }

  let mouse = { x: W/2, y: H/2 };
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      const dx = p.x - p.ox, dy = p.y - p.oy;
      if (Math.abs(dx) > 12) p.vx *= -1;
      if (Math.abs(dy) > 12) p.vy *= -1;

      const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
      const a = Math.max(0, 1 - dist / 200) * 0.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,30,58,${0.12 + a * 0.5})`;
      ctx.fill();
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(196,30,58,${(1 - d/100) * 0.08})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();

/* ─── TYPEWRITER (hero) ──────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typeTarget');
  if (!el) return;

  const phrases = [
    'TECNOLOGIA',
    'ESTRATÉGIA',
    'INOVAÇÃO',
    'LIDERANÇA',
    'EVOLUÇÃO',
  ];

  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];

    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }

    setTimeout(type, deleting ? 60 : 110);
  }

  setTimeout(type, 1200);
})();

/* ─── COUNTERS ───────────────────────────────────────────── */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const step   = 16;
      const steps  = dur / step;
      let cur = 0;
      const inc = target / steps;

      const interval = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.round(cur) + suffix;
        if (cur >= target) clearInterval(interval);
      }, step);

      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
})();

/* ─── STRUCTURE LAYER TABS ───────────────────────────────── */
(function initLayerTabs() {
  const items = document.querySelectorAll('.layer-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
})();

/* ─── LOGIN SYSTEM ───────────────────────────────────────── */
(function initLogin() {
  const form      = document.getElementById('loginForm');
  const dashboard = document.getElementById('dashboard');
  const errorMsg  = document.getElementById('loginError');
  if (!form) return;

  const membros = {
    "T4":             { senha: "@Masayoshi369", cargo: "Fundador · Líder Supremo",  foto: "https://i.imgur.com/IoRPDt6.jpg" },
    "Hariany":        { senha: "@Masayoshi369", cargo: "Secretária",                foto: "https://imgur.com/sM1AHfP.jpg" },
    "Xitter":         { senha: "Dcba136!",      cargo: "Coordenador Geral",         foto: "https://i.imgur.com/lS03Aba.jpeg" },
    "Pepeu":          { senha: "@Masayoshi369", cargo: "VideoMaker · Publicidade",  foto: "https://i.imgur.com/b3s2PaN.jpg" },
    "Flausino":       { senha: "@Masayoshi369", cargo: "Tesoureiro",                foto: "https://i.imgur.com/UF6876L.jpg" },
    "Vastag":         { senha: "@Masayoshi369", cargo: "Supervisor de Execução",    foto: "https://i.imgur.com/D8PKARh.jpg" },
    "Matheus Lucas":  { senha: "@Masayoshi369", cargo: "Membro",                   foto: "https://i.imgur.com/Fc2PxgR.jpeg" },
    "Marcos Flausino":{ senha: "@Masayoshi369", cargo: "Membro",                   foto: "https://i.imgur.com/QzWDXF4.jpg" },
    "Ph":             { senha: "@Masayoshi369", cargo: "Designer Oficial",          foto: "https://imgur.com/95tBUXI.jpg" },
    "Mariana":        { senha: "@Masayoshi369", cargo: "Membro",                   foto: "https://i.imgur.com/q3Q0ppS.jpeg" },
    "Naíra":          { senha: "@Masayoshi369", cargo: "Redatora Oficial",          foto: "https://i.imgur.com/54VaUYm.jpg" },
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const user  = document.getElementById('loginUser').value.trim();
    const pass  = document.getElementById('loginPass').value;
    const m     = membros[user];

    if (m && m.senha === pass) {
      errorMsg.style.display = 'none';
      document.getElementById('accessWrap').style.display = 'none';
      dashboard.style.display = 'block';

      document.getElementById('profName').textContent  = user;
      document.getElementById('profRole').textContent  = m.cargo;
      const pic = document.getElementById('profPic');
      pic.style.backgroundImage = `url(${m.foto})`;
    } else {
      errorMsg.style.display = 'block';
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 600);
    }
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      dashboard.style.display = 'none';
      document.getElementById('accessWrap').style.display = 'flex';
      form.reset();
    });
  }
})();

/* ─── ACTIVE NAV LINK ────────────────────────────────────── */
(function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') && path.includes(a.getAttribute('href').replace('../', '').replace('index.html', ''))) {
      a.classList.add('active');
    }
  });
})();

/* shake keyframe via JS (fallback) */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)}
    60%{transform:translateX(-5px)}
    80%{transform:translateX(5px)}
  }
  .shake { animation: shake 0.5s ease; }
`;
document.head.appendChild(shakeStyle);
