(function () {
  var root = document.documentElement;
  var THEME_KEY = 'levetf-theme';

  // theme
  try {
    if (localStorage.getItem(THEME_KEY) === 'dark') root.setAttribute('data-theme', 'dark');
  } catch (e) {}
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark';
      if (dark) { root.removeAttribute('data-theme'); try { localStorage.setItem(THEME_KEY, 'light'); } catch (e) {} }
      else { root.setAttribute('data-theme', 'dark'); try { localStorage.setItem(THEME_KEY, 'dark'); } catch (e) {} }
    });
  }

  // reading progress
  var bar = document.querySelector('.reading');
  if (bar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }, { passive: true });
  }

  // back to top
  var top = document.querySelector('.to-top');
  if (top) {
    window.addEventListener('scroll', function () {
      top.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // sidebar scrollspy
  var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  // search
  var modal = document.getElementById('searchModal');
  var input = document.getElementById('searchInput');
  var list = document.getElementById('searchResults');
  var openBtn = document.getElementById('searchOpen');
  var index = window.__SEARCH_INDEX__ || [];
  var baseTag = document.querySelector('base');
  var base = (baseTag || location.pathname.indexOf('/chapters/') < 0) ? '' : '../';
  var active = -1;

  function items() {
    return list ? Array.prototype.slice.call(list.querySelectorAll('a')) : [];
  }
  function markActive() {
    items().forEach(function (a, i) { a.classList.toggle('active', i === active); });
    var cur = items()[active];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }
  function openSearch() {
    if (!modal) return;
    modal.classList.add('open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    if (input) { input.value = ''; input.focus(); render(''); }
  }
  function closeSearch() {
    if (!modal) return;
    modal.classList.remove('open');
    if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); }
  }
  function render(q) {
    if (!list) return;
    var s = q.trim().toLowerCase();
    var rows = s ? index.filter(function (it) {
      return (it.t + ' ' + it.h + ' ' + it.x).toLowerCase().indexOf(s) >= 0;
    }).slice(0, 12) : index.slice(0, 8);
    active = -1;
    if (!rows.length) {
      list.innerHTML = '<li class="search-empty">見つかりませんでした。章名（SOX、用語集など）や別の表記でも試してください。</li>';
      return;
    }
    list.innerHTML = rows.map(function (it) {
      return '<li><a href="' + base + it.u + '"><div class="t">' + it.t + '</div><div class="s">' + it.h + '</div></a></li>';
    }).join('');
  }

  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });
  if (input) {
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      var links = items();
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && links.length) {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        markActive();
      } else if (e.key === 'Enter' && active >= 0 && links[active]) {
        e.preventDefault();
        location.href = links[active].getAttribute('href');
      }
    });
  }
  if (modal) modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = [input].concat(items()).filter(Boolean);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    var el = document.activeElement || {};
    var tag = (el.tagName || '').toUpperCase();
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !el.isContentEditable) { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeSearch();
  });
})();
