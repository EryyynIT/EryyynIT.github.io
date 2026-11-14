(function () {
  'use strict';
  var root = document.documentElement;
  var ru = root.lang === 'ru';
  var themeButton = document.getElementById('theme-toggle');
  var menu = document.getElementById('menu');
  var nav = document.getElementById('navigation');
  var media = window.matchMedia('(max-width:820px)');

  function setTheme(theme) {
    root.dataset.theme = theme;
    var dark = theme === 'dark';
    // A toggle keeps one state label; aria-pressed announces whether it is on.
    var label = ru ? 'Тема: тёмный режим' : 'Theme: dark mode';
    themeButton.setAttribute('aria-label', label);
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.title = label;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#111a18' : '#f5f7f6';
  }
  setTheme(root.dataset.theme || 'light');
  themeButton.hidden = false;
  themeButton.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* Storage is optional. */ }
  });

  function setMenu(open, returnFocus) {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? menu.dataset.closeLabel : menu.dataset.openLabel;
    if (returnFocus) menu.focus();
  }
  menu.hidden = false;
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    setMenu(open, false);
    if (open) nav.querySelector('a').focus();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a') && media.matches) setMenu(false, false);
  });
  media.addEventListener('change', function (event) {
    if (!event.matches) {
      var focusedMenu = document.activeElement === menu;
      setMenu(false, false);
      if (focusedMenu) nav.querySelector('a').focus();
    }
  });
  // Collapse navigation only after its controls are wired; a failed script leaves links usable.
  root.classList.add('js');

  var language = document.querySelector('.language');
  language.href += location.search + location.hash;
  var print = document.getElementById('print');
  if (print) print.addEventListener('click', function () { window.print(); });
})();
