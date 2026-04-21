/* ============ Corespec shared scripts v5 — premium interactions ============ */
(function () {
  'use strict';

  // ---------- Typewriter ----------
  function typewriter(el, opts) {
    opts = opts || {};
    var typeMs  = opts.typeMs  || 85;
    var eraseMs = opts.eraseMs || 38;
    var holdMs  = opts.holdMs  || 1800;
    var words = (el.dataset.words || '').split(',').map(function (w) { return w.trim(); }).filter(Boolean);
    if (words.length < 2) return;
    var longest = words.reduce(function (a, b) { return a.length >= b.length ? a : b; });
    if (!el.style.getPropertyValue('--tw-min')) {
      el.style.setProperty('--tw-min', (longest.length + 1) + 'ch');
    }
    var wi = 0;
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    async function loop() {
      while (true) {
        var next = words[(wi + 1) % words.length];
        var current = el.textContent;
        for (var i = current.length; i >= 0; i--) { el.textContent = current.slice(0, i); await wait(eraseMs); }
        for (var j = 1; j <= next.length; j++) { el.textContent = next.slice(0, j); await wait(typeMs); }
        wi = (wi + 1) % words.length;
        await wait(holdMs);
      }
    }
    loop();
  }

  // ---------- Type-in on reveal ----------
  function typeInto(el, opts) {
    opts = opts || {};
    var text = el.getAttribute('data-type') || '';
    var speed = opts.speed || 25;
    el.classList.add('typing');
    el.textContent = '';
    var i = 0;
    function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed + Math.random() * 18);
      } else {
        el.classList.remove('typing');
        var author = el.parentElement && el.parentElement.querySelector('.testimonial-author');
        if (author) setTimeout(function () { author.classList.add('shown'); }, 100);
      }
    }
    step();
  }
  function initTypeIn() {
    var els = document.querySelectorAll('[data-type]');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-type') || ''; });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        typeInto(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ---------- Sequential step flow ----------
  function initStepsFlow() {
    document.querySelectorAll('.steps-flow').forEach(function (flow) {
      if (!('IntersectionObserver' in window)) { flow.classList.add('run'); return; }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { flow.classList.add('run'); obs.unobserve(flow); }
        });
      }, { threshold: 0.20 });
      obs.observe(flow);
    });
  }

  // ---------- Scroll reveal ----------
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var delay = parseInt(e.target.dataset.delay || 0, 10);
          setTimeout(function () { e.target.classList.add('in-view'); }, delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -32px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  // ---------- Stagger grid ----------
  function initStaggerGrids() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.stagger-grid').forEach(function (g) { g.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.stagger-grid').forEach(function (g) { io.observe(g); });
  }

  // ---------- Counter ----------
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var final  = el.dataset.final  || '';
        var duration = parseInt(el.dataset.duration || 1600, 10);
        var start = performance.now();
        function tick(now) {
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.floor(target * eased);
          var display = val >= 1000 ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k' : String(val);
          el.textContent = display + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = final || (target >= 1000 ? (target / 1000).toFixed(0) + 'k' : target) + suffix;
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ---------- Active nav ----------
  function initActiveNav() {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('nav a[href], .drawer a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href && href === path) a.classList.add('is-active');
    });
  }

  // ---------- Nav shrink on scroll ----------
  function initNavShrink() {
    var nav = document.querySelector('nav.fixed');
    if (!nav) return;
    nav.style.transition = 'transform .3s ease, box-shadow .3s ease, background-color .3s ease';
    var onScroll = function () {
      if (window.scrollY > 32) {
        nav.classList.add('shadow-2xl');
        nav.style.transform = 'scale(.985)';
        nav.style.backgroundColor = 'rgba(255,255,255,.97)';
      } else {
        nav.classList.remove('shadow-2xl');
        nav.style.transform = '';
        nav.style.backgroundColor = '';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Services dropdown (click-to-open, stays open) ----------
  function initServicesDropdown() {
    var wrappers = document.querySelectorAll('nav .relative.group');
    wrappers.forEach(function (wrapper) {
      var btn = wrapper.querySelector('button');
      var panel = wrapper.querySelector('div');
      if (!btn || !panel) return;

      var isOpen = false;

      // Force inline styles — these beat any CSS group-hover rule
      panel.style.transition = 'opacity .22s ease, transform .22s ease';
      panel.style.opacity    = '0';
      panel.style.transform  = 'translateY(8px)';
      panel.style.pointerEvents = 'none';

      function open() {
        panel.style.opacity    = '1';
        panel.style.transform  = 'translateY(0)';
        panel.style.pointerEvents = 'auto';
        btn.setAttribute('aria-expanded', 'true');
        isOpen = true;
      }
      function close() {
        panel.style.opacity    = '0';
        panel.style.transform  = 'translateY(8px)';
        panel.style.pointerEvents = 'none';
        btn.setAttribute('aria-expanded', 'false');
        isOpen = false;
      }

      // Toggle on button click
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        isOpen ? close() : open();
      });

      // Navigate on link click (browser handles navigation, panel hides naturally)
      panel.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { close(); });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) close();
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    });
  }

  // ---------- Mobile drawer ----------
  function initDrawer() {
    var btn = document.getElementById('menu-btn');
    var drawer = document.getElementById('mobile-drawer');
    if (!btn || !drawer) return;
    function toggle(open) {
      drawer.classList[open ? 'add' : 'remove']('open');
      document.body.style.overflow = open ? 'hidden' : '';
      drawer.setAttribute('aria-hidden', !open);
    }
    btn.addEventListener('click', function () { toggle(!drawer.classList.contains('open')); });
    drawer.querySelectorAll('[data-drawer-close]').forEach(function (el) {
      el.addEventListener('click', function () { toggle(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  // ---------- Parallax helper on [data-parallax] ----------
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    var ticking = false;
    function update() {
      var y = window.scrollY;
      els.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.08;
        var rect = el.getBoundingClientRect();
        // Only parallax when element is in viewport proximity
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          el.style.transform = 'translateY(' + (y * speed * -1) + 'px)';
        }
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  // ---------- Page progress bar ----------
  function initProgressBar() {
    // Create bar
    var bar = document.createElement('div');
    bar.id = 'page-progress';
    document.body.prepend(bar);
    var ticking = false;
    function update() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? (window.scrollY / docH * 100) : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  // ---------- Card tilt micro-interaction ----------
  function initCardTilt() {
    var cards = document.querySelectorAll('.card-white, .card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        var maxTilt = 4;
        card.style.transform = 'perspective(800px) rotateY(' + (dx * maxTilt) + 'deg) rotateX(' + (-dy * maxTilt) + 'deg) translateY(-4px)';
        card.style.transition = 'transform .1s ease';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform .3s ease, box-shadow .25s ease, border-color .25s ease';
      });
    });
  }

  // ---------- Smooth hash links ----------
  function initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---------- Image lazy load enhancement ----------
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return; // native lazy already works
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    if (!imgs.length || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var img = e.target;
          if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '300px 0px' });
    imgs.forEach(function (img) { obs.observe(img); });
  }

  // ---------- FAQ accordion keyboard ----------
  function initFAQ() {
    document.querySelectorAll('details.faq summary').forEach(function (s) {
      s.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          s.parentElement.toggleAttribute('open');
        }
      });
    });
  }

  // ---------- Button ripple effect ----------
  function initRipple() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var ripple = document.createElement('span');
        ripple.style.cssText = [
          'position:absolute', 'width:' + size + 'px', 'height:' + size + 'px',
          'border-radius:50%', 'background:rgba(255,255,255,0.3)',
          'left:' + (e.clientX - rect.left - size/2) + 'px',
          'top:'  + (e.clientY - rect.top  - size/2) + 'px',
          'transform:scale(0)', 'pointer-events:none',
          'animation:ripple-out .55s ease-out forwards'
        ].join(';');
        // ensure btn is relative
        var pos = getComputedStyle(btn).position;
        if (pos === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
      });
    });
    // inject keyframe once
    if (!document.getElementById('ripple-kf')) {
      var style = document.createElement('style');
      style.id = 'ripple-kf';
      style.textContent = '@keyframes ripple-out { to { transform: scale(3); opacity: 0; } }';
      document.head.appendChild(style);
    }
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-words]').forEach(function (el) { typewriter(el); });
    initReveal();
    initStaggerGrids();
    initStepsFlow();
    initTypeIn();
    initCounters();
    initActiveNav();
    initNavShrink();
    initServicesDropdown();
    initDrawer();
    initParallax();
    initProgressBar();
    initSmoothLinks();
    initLazyImages();
    initFAQ();
    initRipple();
    // Card tilt only on non-touch devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      initCardTilt();
    }
  });
})();
