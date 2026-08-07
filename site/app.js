/* Symbiosis OS — interaction layer.
   Three jobs: the playhead scrub (the page's one authored moment),
   the language swap, and the mobile menu. Everything degrades to
   working HTML with this file absent. */

(function () {
  'use strict';

  /* ---------- playhead scrub ---------- */

  var scrub = document.getElementById('scrub');
  var head = document.getElementById('head');
  var read = document.getElementById('read');
  var tl = document.getElementById('tl');

  if (scrub && head && tl) {
    var blocks = Array.prototype.slice.call(tl.querySelectorAll('.tl__block'));

    var gutter = function () {
      return getComputedStyle(tl).getPropertyValue('--lane-gutter').trim() || '0px';
    };

    var sync = function () {
      var v = +scrub.value;
      // The percentage is of the TRACK, not the whole lane: the lane-name
      // column is fixed, so the travel is (100% - gutter). Adding v% of the
      // full width instead ran the head past the track's right edge at 100.
      var g = gutter();
      head.style.left = 'calc(' + g + ' + (100% - ' + g + ') * ' + (v / 100) + ')';
      // Exactly one block is lit — the one the playhead is currently over.
      // Lighting every passed block at once floods the instrument and loses
      // the comp's image of the head landing on a single event.
      var active = null;
      blocks.forEach(function (b) {
        if (+b.getAttribute('data-at') <= v) active = b;
      });
      blocks.forEach(function (b) {
        b.classList.toggle('tl__block--lit', b === active);
      });
      if (read) read.textContent = active ? active.textContent : '—';
    };

    scrub.addEventListener('input', sync);
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------- vertical restack ----------
     Below 640px a horizontal timeline squeezes its labels into
     nothing, so the lanes become a vertical sequence instead. The
     class drives it; the blocks' inline percentage widths are
     overridden in CSS rather than rewritten here. */

  var stackQuery = window.matchMedia('(max-width: 640px)');
  var allTimelines = Array.prototype.slice.call(document.querySelectorAll('.tl'));
  var applyStack = function (mq) {
    // EVERY timeline restacks, not just the hero's. Scoping this to #tl left
    // the comparison timelines horizontal on a phone with all eight blocks
    // clipped — the exact condition the surface brief marked blocking.
    allTimelines.forEach(function (t) { t.classList.toggle('tl--stack', mq.matches); });
    if (!tl) return;
    // The scrub stays: in stacked mode the playhead is gone but the range
    // still lights each event in turn, so the STORY survives on a phone.
    if (scrub) scrub.dispatchEvent(new Event('input'));
  };
  if (stackQuery.addEventListener) stackQuery.addEventListener('change', applyStack);
  else stackQuery.addListener(applyStack);
  applyStack(stackQuery);

  /* ---------- mobile menu ---------- */

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('hdr__nav--open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    // Escape closes it and returns focus to the control that opened it.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        burger.focus();
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ---------- language ---------- */

  var META = {
    bg: {
      title: 'Symbiosis — съдържание, което носи клиенти. Система, която ги затваря.',
      desc: 'Symbiosis свързва съдържанието, клиентите, офертите и приходите ви в една система. Продукт на Sell 2 Inspire.'
    },
    en: {
      title: 'Symbiosis — content that brings clients in. A system that closes them.',
      desc: 'Symbiosis connects your content, clients, proposals and revenue in one system. A Sell 2 Inspire product.'
    }
  };

  var setLang = function (lang) {
    var dict = window.I18N && window.I18N[lang];
    document.documentElement.lang = lang;

    if (dict) {
      var nodes = document.querySelectorAll('[data-i]');
      for (var i = 0; i < nodes.length; i++) {
        var v = dict[nodes[i].getAttribute('data-i')];
        if (typeof v === 'string') nodes[i].innerHTML = v;
      }
      // data-ia="attr:key" — aria-labels and alt text are content too
      var attrNodes = document.querySelectorAll('[data-ia]');
      for (var k = 0; k < attrNodes.length; k++) {
        var spec = attrNodes[k].getAttribute('data-ia').split(':');
        var av = dict[spec[1]];
        if (typeof av === 'string') attrNodes[k].setAttribute(spec[0], av);
      }
    }

    var meta = META[lang];
    if (meta) {
      document.title = meta.title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', meta.desc);
      var og = document.querySelector('meta[property="og:title"]');
      if (og) og.setAttribute('content', meta.title);
    }

    var btns = document.querySelectorAll('.lang button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-pressed', btns[j].getAttribute('data-lang') === lang ? 'true' : 'false');
    }

    try { localStorage.setItem('sym-lang', lang); } catch (err) { /* private mode */ }
    if (scrub) scrub.dispatchEvent(new Event('input'));
  };

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  // An explicit ?lang= in the URL is a deliberate request and outranks
  // whatever this browser stored last time; otherwise the hreflang
  // alternates would silently do nothing for any returning visitor.
  var initial = null;
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'bg') {
    initial = q;
  } else {
    try { initial = localStorage.getItem('sym-lang'); } catch (err) { /* private mode */ }
  }
  if (initial && initial !== 'bg') setLang(initial);
})();
