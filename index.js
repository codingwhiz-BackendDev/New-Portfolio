/* ═══════════════════════════════════════════════════════════════════
   ALEX MORGAN — PORTFOLIO  |  script.js
   All interactions, animations, canvas, cursor, typing, etc.
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── UTILS ──────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/* ─── 1. PRELOADER ───────────────────────────────────────────────── */
(function initPreloader() {
  const preloader = $('#preloader');
  const fill      = preloader && $('.preloader-fill', preloader);
  const text      = preloader && $('.preloader-text', preloader);

  const steps = [
    { pct: 20, msg: 'Loading assets...' },
    { pct: 50, msg: 'Preparing layout...' },
    { pct: 75, msg: 'Firing up canvas...' },
    { pct: 100, msg: 'Ready.' },
  ];

  let i = 0;
  const run = () => {
    if (!preloader || i >= steps.length) return;
    const { pct, msg } = steps[i++];
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = msg;
    if (pct < 100) {
      setTimeout(run, 300 + Math.random() * 200);
    } else {
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.removeProperty('overflow');
        // Start hero entrance
        $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
          if (isInViewport(el)) el.classList.add('visible');
        });
      }, 500);
    }
  };

  document.body.style.overflow = 'hidden';
  setTimeout(run, 200);
})();

/* ─── 2. BACKGROUND CANVAS PARTICLES ────────────────────────────── */
(function initCanvas() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animFrame;

  const colors = ['rgba(91,141,246,', 'rgba(124,92,191,', 'rgba(136,174,255,'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function buildParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => new Particle());
  }

  // Draw subtle connecting lines between nearby particles
  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91,141,246,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(loop);
  }

  resize();
  buildParticles();
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildParticles(); }, 200);
  });
})();

/* ─── 3. CUSTOM CURSOR ───────────────────────────────────────────── */
(function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursor-follower');
  if (!cursor || !follower) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = -100, my = -100, fx = -100, fy = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  let rafRunning = false;
  const tick = () => {
    cursor.style.left   = mx + 'px';
    cursor.style.top    = my + 'px';
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(tick);
  };
  tick();

  // Hover state on interactive elements
  const targets = 'a, button, [role="button"], .project-card, .skill-icon-card, input, textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(targets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(targets)) document.body.classList.remove('cursor-hover');
  });
})();

/* ─── 4. THEME TOGGLE ────────────────────────────────────────────── */
(function initTheme() {
  const toggle = $('#theme-toggle');
  const html   = document.documentElement;
  const saved  = localStorage.getItem('portfolio-theme');
  if (saved) html.setAttribute('data-theme', saved);

  toggle && toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
})();

/* ─── 5. NAVBAR ──────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = $('#navbar');
  const burger = $('#nav-burger');
  const mobile = $('#nav-mobile');
  if (!navbar) return;

  // Shrink on scroll
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    highlightNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  burger && burger.addEventListener('click', () => {
    const open = burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', open);
    mobile && mobile.classList.toggle('open', open);
    mobile && mobile.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('no-scroll', open);
  });

  // Close mobile on link click
  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      burger && burger.classList.remove('active');
      burger && burger.setAttribute('aria-expanded', false);
      mobile && mobile.classList.remove('open');
      mobile && mobile.setAttribute('aria-hidden', true);
      document.body.classList.remove('no-scroll');
    });
  });

  // Active section highlight
  function highlightNav() {
    const sections = $$('section[id]');
    const scrollY  = window.scrollY + 120;
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop) current = s.id;
    });
    $$('.nav-link').forEach(link => {
      const active = link.dataset.section === current;
      link.classList.toggle('active', active);
    });
  }
})();

/* ─── 6. TYPING ANIMATION ────────────────────────────────────────── */
(function initTyping() {
  const el = $('#typing-text');
  if (!el) return;

  const phrases = [
    'scalable backends.',
    'robust REST APIs.',
    'Django applications.',
    'automation tools.',
    'things that matter.',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false, pausing = false;

  const PAUSE_AFTER_TYPE  = 2200;
  const PAUSE_AFTER_DEL   = 400;
  const TYPE_SPEED_BASE   = 70;
  const DEL_SPEED_BASE    = 40;
  const SPEED_JITTER      = 30;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (pausing) return;

    if (!deleting) {
      // Typing
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);

      if (charIdx === phrase.length) {
        pausing = true;
        setTimeout(() => { pausing = false; deleting = true; tick(); }, PAUSE_AFTER_TYPE);
        return;
      }
    } else {
      // Deleting
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);

      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pausing = true;
        setTimeout(() => { pausing = false; tick(); }, PAUSE_AFTER_DEL);
        return;
      }
    }

    const speed = deleting
      ? DEL_SPEED_BASE + Math.random() * SPEED_JITTER
      : TYPE_SPEED_BASE + Math.random() * SPEED_JITTER;

    setTimeout(tick, speed);
  }

  setTimeout(tick, 800);
})();

/* ─── 7. STAT COUNTER ────────────────────────────────────────────── */
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const step  = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ─── 8. SCROLL REVEAL + INTERSECTION OBSERVER ───────────────────── */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - 60 && rect.bottom > 0;
}

(function initScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');
  const skillFills = $$('.skill-bar-fill');
  const counters   = $$('.stat-number[data-count]');
  const alreadyAnimated = new WeakSet();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || alreadyAnimated.has(entry.target)) return;
      const el = entry.target;

      // Reveal animation
      if (el.classList.contains('reveal-up') ||
          el.classList.contains('reveal-left') ||
          el.classList.contains('reveal-right')) {
        el.classList.add('visible');
        alreadyAnimated.add(el);
      }

      // Skill bars
      if (el.classList.contains('skill-bar-fill')) {
        const w = el.dataset.width || '0';
        el.style.width = w + '%';
        alreadyAnimated.add(el);
      }

      // Stat counters
      if (el.dataset.count) {
        animateCounter(el, parseInt(el.dataset.count));
        alreadyAnimated.add(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
  skillFills.forEach(el => observer.observe(el));
  counters.forEach(el => observer.observe(el));
})();

/* ─── 9. PROJECTS FILTER ─────────────────────────────────────────── */
(function initProjectsFilter() {
  const buttons = $$('.filter-btn');
  const cards   = $$('.project-card');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      cards.forEach((card, i) => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.classList.remove('hide');
          card.style.animationDelay = (i * 0.08) + 's';
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
})();

/* ─── 10. TESTIMONIALS SLIDER ────────────────────────────────────── */
(function initTestimonials() {
  const track    = $('#testimonials-track');
  const prevBtn  = $('#testi-prev');
  const nextBtn  = $('#testi-next');
  const dotsWrap = $('#testi-dots');
  if (!track) return;

  const cards = $$('.testimonial-card', track);
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap && dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100 / cards.length}%)`;

    const dots = $$('.testi-dot', dotsWrap);
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  // Swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });

  resetAuto();
})();

/* ─── 11. CONTACT FORM ───────────────────────────────────────────── */
(function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = $('button[type="submit"]', form);
    if (btn) {
      const origText = btn.querySelector('.btn-text').textContent;
      btn.querySelector('.btn-text').textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        btn.querySelector('.btn-text').textContent = origText;
        btn.disabled = false;
        form.reset();
        if (success) {
          success.removeAttribute('hidden');
          setTimeout(() => success.setAttribute('hidden', ''), 4000);
        }
      }, 1500);
    }
  });
})();

/* ─── 12. SMOOTH SCROLL ──────────────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h-sm')) || 60;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ─── 13. FOOTER YEAR ────────────────────────────────────────────── */
(function setYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ─── 14. PARALLAX HERO ──────────────────────────────────────────── */
(function initParallax() {
  const hero = $('#hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const card = $('.hero-card', hero);

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight) return;
    const factor = scrollY * 0.3;
    if (card) card.style.transform = `perspective(1000px) rotateY(-5deg) rotateX(3deg) translateY(${factor * 0.15}px)`;
  }, { passive: true });

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    if (card) {
      card.style.transform = `perspective(1000px) rotateY(${cx * 8}deg) rotateX(${-cy * 5}deg)`;
    }
  });
  hero.addEventListener('mouseleave', () => {
    if (card) card.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(3deg)';
  });
})();

/* ─── 15. BUTTON RIPPLE ──────────────────────────────────────────── */
(function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .filter-btn, .testi-btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      left: ${x}px; top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      transform: scale(0);
      animation: ripple-anim 0.5s ease-out forwards;
      pointer-events: none;
    `;

    // Ensure relative positioning
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  // Inject keyframe if not already there
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-anim {
        to { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ─── 16. PROJECT CARD TILT ──────────────────────────────────────── */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-cy * 5}deg) rotateY(${cx * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ─── 17. KEYBOARD ACCESSIBILITY ─────────────────────────────────── */
(function initKeyboard() {
  // Allow project cards to be activated with Enter/Space
  $$('.project-card[tabindex]').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = card.querySelector('.project-link');
        if (link) link.click();
      }
    });
  });
})();

/* ─── 18. LAZY IMAGE LOADING ─────────────────────────────────────── */
(function initLazyLoad() {
  const images = $$('img[data-src]');
  if (!images.length) return;

  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imgObserver.unobserve(img);
    });
  }, { rootMargin: '200px' });

  images.forEach(img => imgObserver.observe(img));
})();

/* ─── 19. SECTION ENTRANCE GRADIENT PULSE ────────────────────────── */
(function initSectionGlow() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = $$('section[id]');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Just a visual cue; let CSS handle transitions
    });
  }, { threshold: 0.2 });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ─── 20. ABOUT SECTION — SKILL PILLS STAGGER ────────────────────── */
(function initPillStagger() {
  const pills = $$('.pill');
  pills.forEach((pill, i) => {
    pill.style.transitionDelay = `${i * 0.05}s`;
  });
})();

/* ─── 21. PAGE LOAD COMPLETE ─────────────────────────────────────── */
window.addEventListener('load', () => {
  // Final visibility pass after all assets loaded
  $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    if (isInViewport(el)) el.classList.add('visible');
  });
});

console.log('%c👋 Hi there!', 'font-family: monospace; font-size: 18px; color: #5b8df6;');
console.log('%cPortfolio by Emmanuel Oluyemi — Built with pure HTML, CSS & JS 🇳🇬', 'font-family: monospace; font-size: 12px; color: #8fa0bb;');