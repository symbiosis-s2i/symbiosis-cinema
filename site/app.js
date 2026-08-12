/* Symbiosis OS — interaction layer.

   A direct port of the component the design shipped inside Claude
   Design's runtime. Same behaviours, same easing, same thresholds; the
   class became an IIFE, `this.props` became constants, and the two
   responsive `display` toggles moved into real media queries in
   styles.css so the header does not have to wait for JavaScript to know
   how wide the window is.

   Everything below degrades: with this file absent the page is still
   readable, still navigable, and still has all 22 sections in the
   markup. */

(function () {
  'use strict';

  var root = document.querySelector('[data-sym-root]');
  if (!root) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */

  var META = {
    bg: {
      title: 'Symbiosis OS — AI платформа за бизнес растеж | 100+ AI модела в едно | Sell 2 Inspire',
      desc: 'Symbiosis OS обединява AI видео създаване (Cinema), кампанийни страници с AI търсене, продажби, клиенти, оферти и проекти в една система. Над 100 AI модела без допълнителни абонаменти.'
    },
    en: {
      title: 'Symbiosis OS — the AI platform for business growth | 100+ AI models in one | Sell 2 Inspire',
      desc: 'Symbiosis OS brings AI video production (Cinema), AI-search campaign pages, sales, clients, proposals and projects into one system. Over 100 AI models, no extra subscriptions.'
    }
  };

  var lang = 'bg';

  function swap(next) {
    var dict = window.I18N && window.I18N[next];
    lang = next;
    document.documentElement.lang = next;

    if (dict) {
      // textContent, not innerHTML: the dictionary is content, and none of
      // these strings carry markup.
      // document, not root: the skip link sits outside the design's own
      // wrapper, and scoping this to the wrapper left it in Bulgarian.
      document.querySelectorAll('[data-i]').forEach(function (el) {
        var v = dict[el.getAttribute('data-i')];
        if (typeof v === 'string') el.textContent = v;
      });
      // alt text and aria-labels are content too. The reference translated
      // neither, so a screen reader in English still heard Bulgarian.
      document.querySelectorAll('[data-ia]').forEach(function (el) {
        var spec = el.getAttribute('data-ia').split(':');
        var v = dict[spec[1]];
        if (typeof v === 'string') el.setAttribute(spec[0], v);
      });
    }

    var meta = META[next];
    if (meta) {
      document.title = meta.title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', meta.desc);
      var og = document.querySelector('meta[property="og:title"]');
      if (og) og.setAttribute('content', meta.title);
      var ogd = document.querySelector('meta[property="og:description"]');
      if (ogd) ogd.setAttribute('content', meta.desc);
    }

    root.querySelectorAll('[data-sym-lang]').forEach(function (b) {
      var on = b.getAttribute('data-sym-lang') === next;
      b.style.background = on ? '#f6f6f9' : 'transparent';
      b.style.color = on ? '#08080a' : '#88889a';
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    try { localStorage.setItem('sym-lang', next); } catch (e) { /* private mode */ }
  }

  /* ---------- menu ---------- */

  var menu = root.querySelector('[data-sym-menu]');
  var burger = root.querySelector('[data-act="toggleMenu"]');
  var menuOpen = false;

  function setMenu(open) {
    if (!menu) return;
    menuOpen = open;
    menu.style.display = open ? 'flex' : 'none';
    document.body.style.overflow = open ? 'hidden' : '';
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function toggleMenu() { setMenu(!menuOpen); }

  if (menu) {
    menu.setAttribute('aria-hidden', 'true');
    // Any link inside the panel is a navigation; the panel should not
    // stay over the destination.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      setMenu(false);
      if (burger) burger.focus();
    }
  });

  // The panel is fixed and full-bleed; leaving it open across the
  // breakpoint hides a desktop header behind it.
  var wide = window.matchMedia('(min-width: 1180px)');
  var onWide = function (m) { if (m.matches && menuOpen) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else wide.addListener(onWide);

  /* ---------- declarative actions ---------- */

  var ACTIONS = {
    setBG: function () { swap('bg'); },
    setEN: function () { swap('en'); },
    toggleMenu: toggleMenu
  };

  root.querySelectorAll('[data-act]').forEach(function (el) {
    var fn = ACTIONS[el.getAttribute('data-act')];
    if (!fn) return;
    el.addEventListener('click', function (e) {
      if (el.tagName === 'BUTTON') e.preventDefault();
      fn(e);
    });
  });

  /* ---------- reveal on scroll ---------- */

  function initReveal() {
    var els = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    // Hiding the content first and revealing it on intersection is only
    // safe if the reveal can actually run. Without IntersectionObserver,
    // or with reduced motion asked for, the page stays as authored.
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.filter = 'blur(6px)';
      el.style.willChange = 'opacity, transform, filter';
    });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.getAttribute('data-reveal-d') || '0', 10);
        el.style.transition =
          'opacity .8s cubic-bezier(.2,.7,.2,1) ' + d + 'ms, ' +
          'transform .9s cubic-bezier(.2,.7,.2,1) ' + d + 'ms, ' +
          'filter .8s ease ' + d + 'ms';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.filter = 'blur(0px)';
        // willChange is a promise to the compositor, not a decoration —
        // leaving it set on 110 elements keeps 110 layers alive.
        window.setTimeout(function () { el.style.willChange = 'auto'; }, 1200 + d);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- scroll-driven chrome ---------- */

  function initScroll() {
    var bar = root.querySelector('[data-sym-progress]');
    var nav = root.querySelector('[data-sym-nav]');
    var glow = root.querySelector('[data-sym-glow]');
    var raf = 0;

    var tick = function () {
      raf = 0;
      var y = window.scrollY || 0;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      if (nav) {
        var on = y > 24;
        nav.style.background = on ? 'rgba(8,8,10,0.86)' : 'rgba(8,8,10,0.55)';
        nav.style.borderBottomColor = on ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)';
        nav.style.paddingTop = on ? '10px' : '14px';
        nav.style.paddingBottom = on ? '10px' : '14px';
      }
      if (glow && !reduceMotion && y < 1400) {
        glow.style.transform = 'translateX(-50%) translateY(' + (y * 0.16) + 'px)';
      }
    };

    window.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    tick();
  }

  /* ---------- animated score dial ---------- */

  function initDials() {
    var dials = Array.prototype.slice.call(root.querySelectorAll('[data-dial]'));
    if (!dials.length) return;

    var paint = function (el, value) {
      var num = el.querySelector('[data-dial-num]');
      var deg = (value / 100) * 360;
      el.style.background =
        'conic-gradient(#ff9b4a 0deg,#7a4dff ' + deg + 'deg,rgba(255,255,255,0.07) ' + deg + 'deg)';
      if (num) num.textContent = String(Math.round(value));
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      dials.forEach(function (d) { paint(d, parseInt(d.getAttribute('data-dial') || '0', 10)); });
      return;
    }

    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        o.unobserve(el);
        var target = parseInt(el.getAttribute('data-dial') || '0', 10);
        var start = performance.now();
        var step = function (now) {
          var p = Math.min(1, (now - start) / 1400);
          paint(el, target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    dials.forEach(function (d) { obs.observe(d); });
  }

  /* ---------- animated ratio bars ---------- */

  function initBars() {
    var bars = Array.prototype.slice.call(root.querySelectorAll('[data-bar]'));
    if (!bars.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      bars.forEach(function (b) { b.style.width = b.getAttribute('data-bar') + '%'; });
      return;
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        o.unobserve(en.target);
        en.target.style.width = en.target.getAttribute('data-bar') + '%';
      });
    }, { threshold: 0.5 });
    bars.forEach(function (b) { obs.observe(b); });
  }

  /* ---------- Cinema slate: sticky card follows the active step ---------- */

  function initSlate() {
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-step]'));
    var num = root.querySelector('[data-slate-num]');
    var title = root.querySelector('[data-slate-title]');
    var body = root.querySelector('[data-slate-body]');
    if (!steps.length || !num || !title || !body) return;

    var rails = Array.prototype.slice.call(root.querySelectorAll('[data-slate-rail]'));
    var active = -1;

    var setActive = function (i) {
      if (i === active || i < 0) return;
      active = i;
      var el = steps[i];
      var t = el.querySelector('[data-step-title]');
      var b = el.querySelector('[data-step-body]');
      num.textContent = String(i + 1).padStart(2, '0');
      if (t) title.textContent = t.textContent;
      if (b) body.textContent = b.textContent;

      if (!reduceMotion) {
        [num, title, body].forEach(function (n) {
          n.style.transition = 'none';
          n.style.opacity = '0';
          n.style.transform = 'translateY(7px)';
          requestAnimationFrame(function () {
            n.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(.2,.7,.2,1)';
            n.style.opacity = '1';
            n.style.transform = 'translateY(0)';
          });
        });
      }

      rails.forEach(function (r, ri) {
        r.style.background = ri <= i ? '#8aa6ff' : 'rgba(255,255,255,0.1)';
      });
      steps.forEach(function (s, si) {
        var on = si === i;
        var last = si === steps.length - 1;
        s.style.borderColor = on
          ? 'rgba(138,166,255,0.45)'
          : (last ? 'rgba(138,166,255,0.28)' : 'rgba(255,255,255,0.08)');
        if (!last) s.style.background = on ? '#101018' : '#0c0c11';
      });
    };

    setActive(0);
    if (!('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (en) {
        if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
      });
      if (best) setActive(steps.indexOf(best.target));
    }, { rootMargin: '-42% 0px -42% 0px', threshold: [0, 0.4, 1] });

    steps.forEach(function (s) { obs.observe(s); });
  }

  /* ---------- FAQ: single-open accordion ---------- */

  function initFaq() {
    var faq = document.getElementById('faq');
    if (!faq) return;
    var items = Array.prototype.slice.call(faq.querySelectorAll('details'));

    items.forEach(function (d) {
      var mark = d.querySelector('summary > span:last-child');
      if (mark) mark.style.transition = 'transform .3s cubic-bezier(.2,.7,.2,1), color .3s, border-color .3s';
      d.addEventListener('toggle', function () {
        if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
        items.forEach(function (o) {
          var m = o.querySelector('summary > span:last-child');
          if (!m) return;
          m.style.transform = o.open ? 'rotate(135deg)' : 'rotate(0deg)';
          m.style.borderColor = o.open ? 'rgba(138,166,255,0.5)' : 'rgba(255,255,255,0.14)';
        });
      });
    });
  }

  /* ---------- numbers that count up ----------
     The page already animates its score dial and grows its ratio bars; the
     large figures were the one place a number simply appeared. Each one
     reads its own text when it first comes into view, so whatever the
     language switch left there is what it counts to. */

  function initCounters() {
    var els = Array.prototype.slice.call(root.querySelectorAll('[data-count]'));
    if (!els.length) return;

    // "1 200" -> prefix "", digits "1 200", suffix ""; "−70%" -> "−", "70", "%"
    var split = function (text) {
      var m = text.match(/^(\D*?)([\d][\d   ]*)(.*)$/);
      if (!m) return null;
      var raw = m[2];
      var n = parseInt(raw.replace(/[^\d]/g, ''), 10);
      if (!isFinite(n)) return null;
      // keep whatever separator the copy used, at the same position
      var sep = raw.match(/[   ]/);
      return { pre: m[1], n: n, suf: m[3], sep: sep ? sep[0] : '', grouped: !!sep };
    };

    var render = function (p, v) {
      var s = String(v);
      if (p.grouped && s.length > 3) s = s.slice(0, s.length - 3) + p.sep + s.slice(s.length - 3);
      return p.pre + s + p.suf;
    };

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        o.unobserve(el);
        var parts = split((el.textContent || '').trim());
        if (!parts) return;
        var final = el.textContent;
        var start = performance.now();
        var step = function (now) {
          var t = Math.min(1, (now - start) / 1100);
          var e = 1 - Math.pow(1 - t, 3);
          el.textContent = render(parts, Math.round(parts.n * e));
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = final;   // restore the exact original string
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- tile rows arrive in sequence ----------
     A row of eight cards landing as one block reads as a slab. The reveal
     moves onto the children, staggered, and capped so the last card is
     never more than a third of a second behind the first. */

  function initCascade() {
    root.querySelectorAll('[data-cascade]').forEach(function (row) {
      var kids = Array.prototype.slice.call(row.children);
      if (kids.length < 2) { row.setAttribute('data-reveal', '1'); return; }
      var stepMs = Math.min(60, Math.round(340 / kids.length));
      kids.forEach(function (kid, i) {
        if (kid.hasAttribute('data-reveal')) return;
        kid.setAttribute('data-reveal', '1');
        if (i) kid.setAttribute('data-reveal-d', String(i * stepMs));
      });
    });
  }

  /* ---------- the pointer spotlight ----------
     One delegated listener rather than eighty. The card only needs to know
     where the cursor is inside it; CSS paints the rest. */

  function initSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    var current = null;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('[data-spot]');
      if (!card) { current = null; return; }
      if (card !== current) current = card;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ---------- boot ---------- */

  initCascade();
  initReveal();
  initCounters();
  initSpotlight();
  initScroll();
  initDials();
  initBars();
  initSlate();
  initFaq();

  // An explicit ?lang= is a deliberate request and outranks whatever this
  // browser stored last time; otherwise the hreflang alternates would do
  // nothing for a returning visitor.
  var initial = null;
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'bg') initial = q;
  else { try { initial = localStorage.getItem('sym-lang'); } catch (e) { /* private mode */ } }
  if (initial === 'en') swap('en');
})();
