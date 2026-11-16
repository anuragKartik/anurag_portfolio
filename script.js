(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Nav scroll ---
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ---
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Hero: staggered “boot” ---
  function bootHero() {
    var h = document.getElementById('hero');
    if (h) h.classList.add('hero--booted');
  }
  if (reduceMotion) {
    bootHero();
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(bootHero);
    });
  }

  // --- Compile terminal: lines one by one ---
  var compileOut = document.getElementById('compileOut');
  var compileState = document.getElementById('compileState');

  function setCompileState(text, isOk) {
    if (!compileState) return;
    compileState.textContent = text;
    compileState.classList.toggle('is-ok', isOk);
    compileState.classList.toggle('is-building', !isOk && text !== 'idle');
  }

  var introLines = [
    { t: '▶ npx @anurag-kartik/portfolio#build', c: 'cmd' },
    { t: "  … loading 'experience', 'projects' & static routes", c: 'out' },
    { t: '  … running parallel: react · graphql · kafka · aws', c: 'out' },
    { t: "  … generating responsive UI bundle — 12 chunks", c: 'out' }
  ];

  function addLine(t, c, withCursor) {
    if (!compileOut) return null;
    var div = document.createElement('div');
    div.className = 'compile-line compile-line--' + (c || 'out');
    if (withCursor) div.classList.add('compile-line--cursor');
    div.textContent = t;
    compileOut.appendChild(div);
    requestAnimationFrame(function () {
      div.classList.add('is-visible');
    });
    compileOut.scrollTop = compileOut.scrollHeight;
    return div;
  }

  function runProgressAndFinish(done) {
    if (!compileOut) {
      if (typeof done === 'function') done();
      return;
    }
    var steps = [12, 34, 56, 78, 100];
    var el = document.createElement('div');
    el.className = 'compile-line compile-line--out compile-line--cursor is-visible';
    compileOut.appendChild(el);

    var i = 0;
    function tick() {
      if (i >= steps.length) {
        el.classList.remove('compile-line--cursor', 'compile-line--out');
        el.classList.add('compile-line--ok');
        el.textContent = '  [▓▓▓▓▓▓▓▓▓▓] 100%  ·  emit success';
        compileOut.scrollTop = compileOut.scrollHeight;
        if (typeof done === 'function') {
          setTimeout(done, reduceMotion ? 0 : 320);
        }
        return;
      }
      var p = steps[i];
      var n = Math.round(p / 10);
      var bar = '';
      for (var b = 0; b < 10; b++) {
        bar += b < n ? '▓' : '░';
      }
      el.textContent = '  [' + bar + ']  ' + p + '%  ·  compiling';
      if (i === 0) el.classList.add('is-visible');
      i += 1;
      setTimeout(tick, reduceMotion ? 0 : 240);
    }
    tick();
  }

  function runCompileSequence() {
    if (!compileOut) return;
    if (reduceMotion) {
      setCompileState('ready', true);
      introLines.forEach(function (line) {
        addLine(line.t, line.c, false);
      });
      addLine('  [▓▓▓▓▓▓▓▓▓▓] 100%  ·  ok', 'ok', false);
      addLine('✓ build finished — 847ms — portfolio ready to ship', 'ok', false);
      return;
    }

    setCompileState('compiling', false);
    var i = 0;
    var delay = 0;

    function nextIntro() {
      if (i < introLines.length) {
        var line = introLines[i];
        addLine(line.t, line.c, false);
        i += 1;
        setTimeout(nextIntro, 400);
        return;
      }
      setTimeout(function () {
        runProgressAndFinish(finish);
      }, 200);
    }

    function finish() {
      if (!compileOut) return;
      addLine('✓ build successful — 847ms — you can scroll below', 'ok', false);
      setCompileState('ready', true);
    }

    nextIntro();
  }

  if (!reduceMotion) {
    setTimeout(runCompileSequence, 520);
  } else {
    setTimeout(runCompileSequence, 0);
  }

  // --- Scroll reveal ---
  var revealEls = document.querySelectorAll(
    '.section-title, .about-content, .timeline-item, .skill-group, .project-card, .edu-item, .achievements-list li, .contact-links'
  );
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // --- Footer year ---
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
