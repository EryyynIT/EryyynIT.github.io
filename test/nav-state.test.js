/* Headless contract test for the route-aware language switcher in js/main.js.

   The switcher itself is browser behavior (DOM, scroll, sessionStorage), so
   this test statically verifies the architecture contract instead of running
   it in a browser:

   - ROUTES maps pageType -> language -> route; switching language never
     crosses page context (home <-> home, resume <-> resume).
   - The documented helper functions exist: getPageType, getPreferredLanguage,
     getCurrentViewportState, detectCurrentSection, buildLocalizedUrl,
     saveViewportState, restoreViewportState.
   - Viewport state is written to sessionStorage (never localStorage).
   - The switcher builds its target from ROUTES and the current viewport state
     instead of a single hardcoded "/ru/" redirect.
   - Restore consumes the state once (no repeated scroll-jacking on reload).
*/
'use strict';
const fs = require('fs');

const mainJs = fs.readFileSync('js/main.js', 'utf8');

/* --- Route mapping: the exact matrix from the task --- */
const routesChecks = {
  'home.en -> /': /home:\s*\{\s*en:\s*'\/'/.test(mainJs),
  'home.ru -> /ru/': /home:\s*\{\s*en:\s*'\/',\s*ru:\s*'\/ru\/'/.test(mainJs),
  'resume.en -> /resume/': /resume:\s*\{\s*en:\s*'\/resume\/'/.test(mainJs),
  'resume.ru -> /ru/resume/': /resume:\s*\{\s*en:\s*'\/resume\/',\s*ru:\s*'\/ru\/resume\/'/.test(mainJs)
};

/* --- Key behaviors --- */
const behaviorChecks = {
  'viewport state uses sessionStorage': /sessionStorage\.setItem\(VIEWPORT_STATE_KEY/.test(mainJs),
  'viewport state is read via sessionStorage': /sessionStorage\.getItem\(VIEWPORT_STATE_KEY/.test(mainJs),
  'viewport state is cleared (consumed once)': /sessionStorage\.removeItem\(VIEWPORT_STATE_KEY/.test(mainJs),
  'switcher builds URL from ROUTES + viewport state':
    /window\.location\.href\s*=\s*buildLocalizedUrl\(targetLang,\s*state,\s*!saved\)/.test(mainJs),
  'no hardcoded /ru/ redirect':
    !/location(?:\.href)?\s*=\s*["']\/ru\//.test(mainJs) && !mainJs.includes('window.location = "/ru/"'),
  'restore waits for fonts.ready': mainJs.includes('document.fonts.ready'),
  'hash update uses replaceState (no history entry)': mainJs.includes('history.replaceState(null, \'\', \'#\' + state.sectionId)')
};

/* --- Required helper functions (task §25) --- */
const REQUIRED_FUNCTIONS = [
  'getPageType',
  'getPreferredLanguage',
  'getCurrentViewportState',
  'detectCurrentSection',
  'buildLocalizedUrl',
  'saveViewportState',
  'restoreViewportState'
];

const results = {
  routes: routesChecks,
  behaviors: behaviorChecks,
  functions: REQUIRED_FUNCTIONS.map((f) => ({ name: f, present: mainJs.includes('function ' + f) }))
};
console.log(JSON.stringify(results, null, 2));

let pass = true;
Object.entries(routesChecks).forEach(([k, v]) => {
  if (!v) { pass = false; console.error('FAIL [route]:', k); }
});
Object.entries(behaviorChecks).forEach(([k, v]) => {
  if (!v) { pass = false; console.error('FAIL [behavior]:', k); }
});
REQUIRED_FUNCTIONS.forEach((f) => {
  if (!mainJs.includes('function ' + f)) { pass = false; console.error('FAIL [function]:', f); }
});

if (!pass) process.exit(1);
console.log('\n✓ ROUTE-AWARE LANGUAGE SWITCHER CONTRACT PASSED');
