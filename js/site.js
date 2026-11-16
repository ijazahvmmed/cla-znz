/* ANZ Landscaping — shared behaviour for both homepage options.
   Everything here is progressive: with scripts blocked or reduced motion on, the page is fully visible and usable. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduce;
  if (!animate) root.classList.remove('anim');
  root.dataset.ready = '1';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Navigation ---------- */
  var nav = $('.nav');
  var menuBtn = $('.menu-btn');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
    }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }
  function onScrollState() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScrollState();
  window.addEventListener('scroll', onScrollState, { passive: true });

  /* ---------- Before / after slider ---------- */
  $$('.ba').forEach(function (ba) {
    var input = $('input[type=range]', ba);
    if (!input) return;
    var set = function () { ba.style.setProperty('--pos', input.value + '%'); };
    input.addEventListener('input', set);
    set();
  });

  /* ---------- Quote form (preview only: nothing is sent yet) ---------- */
  $$('form[data-quote]').forEach(function (form) {
    var status = $('.form__status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (status) status.textContent = 'Design preview: the form is not connected yet, so nothing was sent.';
    });
  });

  /* ---------- Generated contour lines (Option B graphic) ---------- */
  $$('svg[data-contours]').forEach(function (svg) {
    var n = parseInt(svg.getAttribute('data-contours'), 10) || 9;
    var W = 800, H = 600, NS = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    for (var k = 0; k < n; k++) {
      var R = 26 + k * 30, d = '';
      for (var i = 0; i <= 180; i++) {
        var t = (i / 180) * Math.PI * 2;
        var r = R * (1 + 0.17 * Math.sin(3 * t + k * 0.45) + 0.09 * Math.sin(5 * t + 1.3 + k * 0.3) + 0.04 * Math.sin(9 * t + k));
        var x = W * 0.5 + r * Math.cos(t) * 1.3;
        var y = H * 0.5 + r * Math.sin(t);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d + 'Z');
      svg.appendChild(p);
    }
  });
  $$('[data-draw]').forEach(function (g) {
    $$('path,rect,circle,line,ellipse', g).forEach(function (s) { s.setAttribute('pathLength', '1'); });
  });

  /* ---------- Option B: sticky service photo that changes with the text ---------- */
  var layers = $$('.svc-media .layer');
  var counter = $('.svc-media [data-count]');
  var items = $$('.svc-item[data-svc]');
  if (layers.length && items.length && 'IntersectionObserver' in window) {
    var showSvc = function (idx) {
      layers.forEach(function (l, i) { l.classList.toggle('is-on', i <= idx); });
      if (counter) counter.textContent = '0' + (idx + 1);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) showSvc(parseInt(en.target.getAttribute('data-svc'), 10));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { io.observe(it); });
  }

  if (!animate) return;

  /* =====================================================================
     Motion layer (GSAP + ScrollTrigger + Lenis)
     ===================================================================== */
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // In-page links glide to their section
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      var offset = nav ? -(nav.offsetHeight - 1) : 0;
      if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.4 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
      if (target.focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    });
  });

  var EXPO = 'expo.out';

  /* ---------- First screen ---------- */
  function whenImageReady(img, cb) {
    var done = false;
    var go = function () { if (!done) { done = true; cb(); } };
    if (!img || (img.complete && img.naturalWidth)) return go();
    img.addEventListener('load', go);
    img.addEventListener('error', go);
    setTimeout(go, 1800);
  }

  var heroA = $('[data-hero="a"]');
  if (heroA) {
    var frameA = $('.hero__frame', heroA), imgA = $('img', frameA);
    gsap.set(frameA, { clipPath: 'inset(0% 46% 0% 46%)' });
    gsap.set(imgA, { scale: 1.45 });
    gsap.fromTo($$('h1 .line > span', heroA), { yPercent: 112, y: 0 }, { yPercent: 0, duration: 1.3, ease: EXPO, stagger: 0.12, delay: 0.1 });
    gsap.fromTo($$('[data-hero-fade]', heroA), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: 0.1, delay: 0.55 });
    whenImageReady(imgA, function () {
      gsap.to(frameA, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: 'expo.inOut', delay: 0.15 });
      gsap.to(imgA, { scale: 1.1, duration: 2.6, ease: EXPO, delay: 0.35 });
      gsap.fromTo(imgA, { yPercent: -4 }, { yPercent: 4, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: heroA, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  var heroB = $('[data-hero="b"]');
  if (heroB) {
    var imgB = $('.hero__bg img', heroB), slats = $$('.hero__slats i', heroB);
    gsap.set(imgB, { scale: 1.3 });
    whenImageReady(imgB, function () {
      gsap.to(slats, { yPercent: -101, duration: 1.5, ease: 'expo.inOut', stagger: { each: 0.09, from: 'center' } });
      gsap.to(imgB, { scale: 1.05, duration: 2.8, ease: EXPO, delay: 0.2 });
      gsap.fromTo($$('h1 .line > span', heroB), { yPercent: 112, y: 0 }, { yPercent: 0, duration: 1.4, ease: EXPO, stagger: 0.13, delay: 0.75 });
      gsap.fromTo($$('[data-hero-fade]', heroB), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: 0.1, delay: 1.25 });
      gsap.to('.hero__bg', { yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: heroB, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Scroll reveals ---------- */
  $$('[data-reveal="lines"]').forEach(function (el) {
    gsap.fromTo($$('.line > span', el), { yPercent: 112, y: 0 }, {
      yPercent: 0, duration: 1.2, ease: EXPO, stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  $$('[data-reveal="fade"]').forEach(function (el) {
    gsap.fromTo(el, { opacity: 0, y: 26 }, {
      opacity: 1, y: 0, duration: 1.1, ease: EXPO,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  function revealImage(el, st) {
    var img = $('img', el);
    var parallax = el.hasAttribute('data-parallax');
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: st });
    if (!img) return;
    gsap.fromTo(img, { scale: 1.35 }, { scale: parallax ? 1.12 : 1, duration: 2, ease: EXPO, scrollTrigger: st });
    if (parallax) {
      gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }
  $$('[data-reveal="img"]').forEach(function (el) {
    if (el.closest('[data-hscroll]')) return; // handled with the horizontal gallery below
    revealImage(el, { trigger: el, start: 'top 86%', once: true });
  });

  $$('[data-draw]').forEach(function (g) {
    gsap.fromTo($$('path,rect,circle,line,ellipse', g), { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.06,
      scrollTrigger: { trigger: g, start: 'top 85%', once: true }
    });
  });

  /* ---------- Option B: projects move sideways while the page scrolls ---------- */
  var hs = $('[data-hscroll]');
  if (hs) {
    var view = $('.hs__view', hs), track = $('.hs__track', hs), bar = $('.hs__bar i', hs);
    var cards = $$('[data-reveal="img"]', hs);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () {
      root.classList.add('hs-pin');
      var dist = function () { return Math.max(0, track.offsetWidth - document.documentElement.clientWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: view, start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; }
        }
      });
      cards.forEach(function (el) {
        // Cards already on screen when the gallery arrives open with the section; the rest open as they travel in.
        if (el.getBoundingClientRect().left < window.innerWidth) {
          revealImage(el, { trigger: view, start: 'top 62%', once: true });
        } else {
          revealImage(el, { trigger: el, containerAnimation: tween, start: 'left 94%', once: true });
        }
      });
      return function () { root.classList.remove('hs-pin'); gsap.set(track, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 899px)', function () {
      cards.forEach(function (el) {
        gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)' });
      });
    });
  }

  /* ---------- Subtle interactions ---------- */
  // Reading progress hairline
  var prog = document.createElement('div');
  prog.className = 'progress';
  prog.setAttribute('aria-hidden', 'true');
  document.body.appendChild(prog);
  gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // The header marks the section being read
  $$('.nav__links a[href^="#"]').forEach(function (link) {
    var sec = $(link.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) { link.classList.toggle('is-current', self.isActive); }
    });
  });

  // The before / after line sways once to show it can be dragged
  $$('.ba').forEach(function (ba) {
    var input = $('input[type=range]', ba);
    if (!input) return;
    var o = { v: 50 }, touched = false;
    var stop = function () { touched = true; };
    input.addEventListener('pointerdown', stop);
    input.addEventListener('keydown', stop);
    gsap.timeline({
      delay: 0.6,
      scrollTrigger: { trigger: ba, start: 'top 60%', once: true },
      onUpdate: function () {
        if (touched) return;
        input.value = o.v;
        ba.style.setProperty('--pos', o.v + '%');
      }
    })
      .to(o, { v: 61, duration: 0.9, ease: 'power2.inOut' })
      .to(o, { v: 41, duration: 1.1, ease: 'power2.inOut' })
      .to(o, { v: 50, duration: 0.8, ease: 'power2.inOut' });
  });

  // Mouse only: buttons lean a little toward the pointer, photographs and line drawings drift with it
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.btn').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.16);
        yTo((e.clientY - r.top - r.height / 2) * 0.26);
      });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });

    var drift = function (area, target, mx, my) {
      if (!area || !target) return;
      var xTo = gsap.quickTo(target, 'x', { duration: 1.3, ease: 'power3.out' });
      var yTo = gsap.quickTo(target, 'y', { duration: 1.3, ease: 'power3.out' });
      area.addEventListener('pointermove', function (e) {
        var r = area.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * -2 * mx);
        yTo(((e.clientY - r.top) / r.height - 0.5) * -2 * my);
      });
      area.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    };
    if (heroA) drift(heroA, $('.hero__frame img', heroA), 12, 4);
    if (heroB) drift(heroB, $('.hero__bg img', heroB), 10, 6);
    $$('.contours').forEach(function (c) { drift(c.closest('section'), c, 16, 10); });
    $$('.svc__plan svg').forEach(function (p) { drift(p.closest('.svc'), p, 7, 5); });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
