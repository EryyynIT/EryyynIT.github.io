(function () {
  'use strict';
  // Inlined in each static page's head so locale changes precede content rendering.
  var routes = [
    { en: '/', ru: '/ru/' },
    { en: '/work/', ru: '/ru/work/' },
    { en: '/experience/', ru: '/ru/experience/' },
    { en: '/about/', ru: '/ru/about/' },
    { en: '/resume/', ru: '/ru/resume/' },
    { en: '/contact/', ru: '/ru/contact/' }
  ];
  var marker = '__eryyynit_language';
  var current = new URL(location.href);
  var pair = routes.find(function (route) { return route.en === current.pathname || route.ru === current.pathname; });
  if (!pair) return;
  var currentLanguage = current.pathname === pair.ru ? 'ru' : 'en';
  function supported(value) { return value === 'en' || value === 'ru'; }
  function stored(storage) {
    try { return window[storage].getItem('language'); } catch (_) { return null; }
  }
  function save(storage, value) {
    try {
      window[storage].setItem('language', value);
      return window[storage].getItem('language') === value;
    } catch (_) { return false; }
  }
  function savedPreference() {
    var saved = stored('localStorage');
    var session = stored('sessionStorage');
    // A readable but unwritable local store must not undo a newer manual choice.
    try {
      var stale = sessionStorage.getItem('language:local-fallback');
      if (stale !== null && stale === String(saved) && supported(session)) return session;
    } catch (_) { /* Session storage is optional. */ }
    if (supported(saved)) return saved;
    return supported(session) ? session : null;
  }
  function preferred() {
    var languages;
    try { languages = navigator.languages; } catch (_) { /* Use navigator.language below. */ }
    if (!languages || !languages.length) languages = [navigator.language];
    for (var i = 0; i < languages.length; i++) {
      var code = String(languages[i]).toLowerCase().split('-')[0];
      if (supported(code)) return code;
    }
    return 'en';
  }

  // With storage blocked, carry a manual choice to the next entry once, then
  // keep it in that entry's history state for reload/back, not in its visible URL.
  var explicit = current.searchParams.get(marker);
  var entryChoice = history.state && history.state[marker];
  if (current.searchParams.has(marker)) {
    var query = current.search.slice(1).split('&').filter(function (part) {
      try { return decodeURIComponent(part.split('=')[0].replace(/\+/g, ' ')) !== marker; }
      catch (_) { return true; }
    }).join('&');
    current.search = query ? '?' + query : '';
    var state = Object.assign({}, history.state);
    if (explicit === currentLanguage) {
      state[marker] = explicit;
      state[marker + ':previous'] = savedPreference();
    }
    history.replaceState(state, '', current.pathname + current.search + current.hash);
  }
  var savedChoice = savedPreference();
  var sameBlockedPreference = history.state && history.state[marker + ':previous'] === savedChoice;
  var manualEntry = explicit === currentLanguage || (entryChoice === currentLanguage && (!savedChoice || sameBlockedPreference));
  var choice = manualEntry ? currentLanguage : (savedChoice || preferred());
  if (choice !== currentLanguage) {
    location.replace(pair[choice] + current.search + current.hash);
    return;
  }

  window.EryyynLanguage = {
    prepareSwitch: function (link) {
      var target = link.lang;
      if (!supported(target)) return;
      var saved = save('localStorage', target);
      if (saved) {
        try {
          sessionStorage.removeItem('language');
          sessionStorage.removeItem('language:local-fallback');
        } catch (_) { /* Optional fallback. */ }
      } else {
        var previous = stored('localStorage');
        saved = save('sessionStorage', target);
        if (saved) {
          try { sessionStorage.setItem('language:local-fallback', String(previous)); } catch (_) { /* Optional metadata. */ }
        }
      }
      var destination = new URL(pair[target] + location.search + location.hash, location.origin);
      if (!saved) destination.search += (destination.search ? '&' : '?') + marker + '=' + target;
      link.href = destination.href;
    }
  };
})();
