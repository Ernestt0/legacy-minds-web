(function () {
  var header = document.querySelector('.header');
  var DARK = '.dark, .footer, .hero, .ph-bg';
  var ticking = false;
  function onScroll() {
    ticking = false;
    if (!header) return;
    var solid = window.scrollY > 24;
    header.classList.toggle('solid', solid);
    // Tono de la cápsula según la sección que pasa por detrás
    var dark = true, y = 42;
    var els = document.elementsFromPoint ? document.elementsFromPoint(window.innerWidth / 2, y) : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (header.contains(el) || el.closest('.chat')) continue;
      dark = !!el.closest(DARK);
      break;
    }
    header.classList.toggle('on-dark', dark);
    header.classList.toggle('on-light', !dark);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onScroll();

  // Menú móvil
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    document.body.classList.toggle('lock', open);
    var b = document.querySelector('.burger');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.querySelectorAll('[data-open-drawer]').forEach(function (el) {
    el.addEventListener('click', function () { setDrawer(true); });
  });
  document.querySelectorAll('[data-close-drawer]').forEach(function (el) {
    el.addEventListener('click', function () { setDrawer(false); });
  });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  // Submenú de Servicios (táctil y teclado)
  var hm = document.querySelector('.has-menu > button');
  if (hm) hm.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = hm.parentNode.classList.toggle('open');
    hm.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.has-menu.open').forEach(function (m) {
      if (!m.contains(e.target)) m.classList.remove('open');
    });
  });

  // Interruptor de chat: alterna entre WhatsApp y WeChat
  var chat = document.getElementById('chat');
  if (chat) {
    var wcBtn = chat.querySelector('.cs-opt.wc');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hold = false;
    function setCh(ch) { chat.classList.toggle('wc', ch === 'wc'); }
    function setQr(open) {
      chat.classList.toggle('open', open);
      wcBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) setCh('wc');
    }
    chat.querySelectorAll('.cs-opt').forEach(function (o) {
      o.addEventListener('pointerenter', function () { hold = true; setCh(o.getAttribute('data-ch')); });
      o.addEventListener('focus', function () { hold = true; setCh(o.getAttribute('data-ch')); });
      o.addEventListener('pointerleave', function () { hold = false; });
      o.addEventListener('blur', function () { hold = false; });
    });
    wcBtn.addEventListener('click', function (e) { e.stopPropagation(); setQr(!chat.classList.contains('open')); });
    chat.querySelector('[data-chat-close]').addEventListener('click', function () { setQr(false); });
    document.addEventListener('click', function (e) { if (!chat.contains(e.target)) setQr(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setQr(false); });
    if (!reduceMotion) setInterval(function () {
      if (hold || document.hidden || chat.classList.contains('open')) return;
      setCh(chat.classList.contains('wc') ? 'wa' : 'wc');
    }, 3400);
  }

  // Luz que sigue al cursor en las tarjetas oscuras
  document.querySelectorAll('.fc').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Selector de idioma: recordar la elección del visitante
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('lml-lang', a.getAttribute('lang')); } catch (e) {}
    });
  });

  // Tarjetas: en pantallas táctiles se abren al tocar
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  document.querySelectorAll('.xc').forEach(function (card) {
    card.addEventListener('click', function () {
      if (canHover) return;
      var open = !card.classList.contains('open');
      document.querySelectorAll('.xc.open').forEach(function (c) { if (c !== card) c.classList.remove('open'); });
      card.classList.toggle('open', open);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('open'); }
    });
  });

  // "¿Qué incluye?": un punto activo a la vez, en bucle, sincronizado con la foto
  var reduceM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.checks').forEach(function (list) {
    var lis = list.querySelectorAll('li'); if (!lis.length) return;
    var split = list.closest('.split');
    var cap = split && split.querySelector('.vt-cap');
    var DUR = 3400, k = 0, timer = null, visible = false, hold = false;
    list.style.setProperty('--dur', DUR / 1000 + 's');
    function show(n) {
      k = n;
      lis.forEach(function (li, i) { li.classList.toggle('on', i === n); });
      if (cap) {
        cap.classList.add('swap');
        setTimeout(function () {
          cap.querySelector('b').textContent = lis[n].querySelector('b').textContent;
          cap.classList.remove('swap');
        }, 220);
      }
    }
    function tick() { if (!hold && visible && !document.hidden) show((k + 1) % lis.length); }
    function run() { clearInterval(timer); if (!reduceM) timer = setInterval(tick, DUR); }
    lis.forEach(function (li, i) {
      li.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; hold = true; list.classList.add('hold'); show(i); });
      li.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse') return; hold = false; list.classList.remove('hold'); show(i); run(); });
      li.addEventListener('click', function () { show(i); run(); });
    });
    show(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var was = visible; visible = en[0].isIntersecting;
        if (visible && !was) { show(k); run(); }
      }, { threshold: 0.3 }).observe(list);
    } else { visible = true; run(); }
  });

  // Año actual en el pie
  document.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  // Aparición al hacer scroll
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();

/* Google Analytics con consentimiento (Ley 1581 de 2012) */
(function () {
  var GA = 'G-00P0QZTNF9', KEY = 'lml-cookies';
  var en = document.documentElement.lang === 'en';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA; document.head.appendChild(s);
    gtag('js', new Date()); gtag('config', GA, { anonymize_ip: true });
  }
  function track(name, params) { if (loaded) gtag('event', name, params || {}); }
  // Clics que indican interés de contacto
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a,button'); if (!a) return;
    var href = a.getAttribute('href') || '';
    var where = a.closest('header') ? 'menu' : a.closest('footer') ? 'pie' : a.closest('.chat') ? 'chat' : (a.closest('section') || {}).id || 'pagina';
    if (/cal\.com/.test(href)) track('agendar_cita', { ubicacion: where });
    else if (/wa\.me|whatsapp/.test(href)) track('contacto_whatsapp', { ubicacion: where });
    else if (a.matches('.cs-opt.wc,[data-wechat]')) track('contacto_wechat', { ubicacion: where });
    else if (/^mailto:/.test(href)) track('contacto_correo', { ubicacion: where });
    else if (/^tel:/.test(href)) track('contacto_telefono', { ubicacion: where });
  }, true);
  var choice = get();
  if (choice === 'si') { load(); return; }
  if (choice === 'no') return;
  var t = en
    ? { m: 'We use analytics cookies to understand how visitors use this site and improve it. You can accept or reject them.', a: 'Accept', r: 'Reject' }
    : { m: 'Usamos cookies de analítica para entender cómo se usa el sitio y mejorarlo. Puedes aceptarlas o rechazarlas.', a: 'Aceptar', r: 'Rechazar' };
  var b = document.createElement('div');
  b.className = 'cookie'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-live', 'polite'); b.setAttribute('aria-label', en ? 'Cookies' : 'Aviso de cookies');
  b.innerHTML = '<span class="cookie-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.5A9 9 0 1 1 11.5 3a3 3 0 0 0 3.5 3.5 3 3 0 0 0 3.5 3.5 3 3 0 0 0 2.5 2.5z"/><path d="M8.5 9.5h.01M15.5 15.5h.01M9 15h.01M12 12h.01"/></svg></span><p>' + t.m + '</p><div class="cookie-btns"><button type="button" class="cookie-no">' + t.r + '</button><button type="button" class="cookie-si">' + t.a + '</button></div>';
  document.body.appendChild(b); document.body.classList.add('has-cookie');
  requestAnimationFrame(function () { setTimeout(function () { b.classList.add('in'); }, 600); });
  function close(v) { set(v); b.classList.remove('in'); document.body.classList.remove('has-cookie'); setTimeout(function () { b.remove(); }, 450); if (v === 'si') load(); }
  b.querySelector('.cookie-si').addEventListener('click', function () { close('si'); });
  b.querySelector('.cookie-no').addEventListener('click', function () { close('no'); });
})();
