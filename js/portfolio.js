(function () {
  'use strict';
  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  var ru = root.lang === 'ru';
  // A saved choice applies when returning to the language-neutral root URL.
  try {
    if (location.pathname === '/' && localStorage.getItem('lang') === 'ru') {
      location.replace('/ru/' + location.search + location.hash);
    }
  } catch (e) { /* storage may be unavailable */ }
  function update(theme) {
    root.dataset.theme = theme;
    var dark = theme === 'dark';
    button.setAttribute('aria-label', ru ? 'Тёмная тема' : 'Dark theme');
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('title', ru ? (dark ? 'Включить светлую тему' : 'Включить тёмную тему') : (dark ? 'Switch to light theme' : 'Switch to dark theme'));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#111d1b' : '#f5f7f5';
  }
  update(root.dataset.theme || 'light');
  button.addEventListener('click', function () {
    var theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    update(theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage may be unavailable */ }
  });
  var language = document.querySelector('.language');
  language.href += location.search + location.hash;
  language.addEventListener('click', function () {
    try { localStorage.setItem('lang', ru ? 'en' : 'ru'); } catch (e) { /* storage may be unavailable */ }
  });
})();
