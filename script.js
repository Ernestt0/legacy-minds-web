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
