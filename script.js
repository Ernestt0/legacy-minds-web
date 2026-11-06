(function () {
  var header = document.querySelector('.header');
  var keepSolid = document.body.getAttribute('data-top') === 'light';

  function onScroll() {
    if (header) header.classList.toggle('solid', keepSolid || window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
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

  // Botón "Chatea con nosotros": menú con WhatsApp y QR de WeChat
  var chat = document.getElementById('chat');
  if (chat) {
    var chatBtn = chat.querySelector('.chat-btn');
    function setChat(open) {
      chat.classList.toggle('open', open);
      if (!open) chat.classList.remove('qr');
      chatBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    chatBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setChat(!chat.classList.contains('open'));
    });
    chat.querySelector('[data-wechat]').addEventListener('click', function () { chat.classList.add('qr'); });
    chat.querySelector('[data-wechat-back]').addEventListener('click', function () { chat.classList.remove('qr'); });
    document.addEventListener('click', function (e) { if (!chat.contains(e.target)) setChat(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setChat(false); });
  }

  // Globo del chat: mensajes que rotan en sincronía con el ícono
  var chatEl = document.getElementById('chat');
  var tip = chatEl && chatEl.querySelector('.chat-tip');
  var tipTxt = tip && tip.querySelector('.tip-txt');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (tipTxt && !reduceMotion) {
    var isEn = document.documentElement.lang === 'en';
    var msgs = isEn
      ? [['Questions? Chat with us!', false], ['Message us on WhatsApp', false], ['or on WeChat', true]]
      : [['¿Dudas? ¡Chatea con nosotros!', false], ['Escríbenos por WhatsApp', false], ['o por WeChat', true]];
    var k = 0;
    function write(text) {
      tipTxt.innerHTML = '';
      text.split('').forEach(function (c, i) {
        var s = document.createElement('span');
        s.className = c === ' ' ? 'sp' : 'ch';
        if (c !== ' ') { s.textContent = c; s.style.animationDelay = (i * 28) + 'ms'; }
        tipTxt.appendChild(s);
      });
    }
    write(msgs[0][0]);
    setInterval(function () {
      if (chatEl.classList.contains('open') || document.hidden) return;
      k = (k + 1) % msgs.length;
      tip.classList.add('out');
      setTimeout(function () {
        tip.classList.remove('out');
        write(msgs[k][0]);
        chatEl.classList.toggle('wc', msgs[k][1]);
      }, 300);
    }, 3200);
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
