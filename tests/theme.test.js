const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', '6pwaServiceWorker.html'), 'utf8');

function expect(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exitCode = 1;
  } else {
    console.log('PASS:', message);
  }
}

(async () => {
  // create a JSDOM instance and prepare stubs (we will execute the inline script manually)
  // Provide small stubs for localStorage and matchMedia before scripts run
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    resources: 'usable',
    beforeParse(window) {
      // small in-memory localStorage implementation
      window.localStorage = (function () {
        const store = {};
        return {
          getItem(k) {
            return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
          },
          setItem(k, v) {
            store[k] = String(v);
          },
          removeItem(k) {
            delete store[k];
          },
          clear() {
            Object.keys(store).forEach((k) => delete store[k]);
          },
        };
      })();

      window.matchMedia = (query) => {
        return {
          matches: false,
          media: query,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
        };
      };
    },
  });
  const { window } = dom;

  // Extract the inline script content from the HTML and evaluate it inside the window
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) throw new Error('Could not find inline script in HTML for tests');
  const scriptContent = scriptMatch[1];

  // ensure inline script sees `localStorage` and `matchMedia` as globals
  dom.window.eval('localStorage = window.localStorage; matchMedia = window.matchMedia;');
  // evaluate the app script inside the jsdom window
  dom.window.eval(scriptContent);

  // a little wait for any queued microtasks
  await new Promise((r) => setTimeout(r, 50));

  // test 1: no stored theme initially -> getStoredTheme() should return null
  window.localStorage.removeItem('darkMode');
  expect(window.getStoredTheme() === null, 'getStoredTheme returns null when not set');

  // test 2: applyTheme(true) should add dark class and set button to sun icon
  window.applyTheme(true);
  expect(window.document.body.classList.contains('dark'), 'body has .dark after applyTheme(true)');
  expect(window.document.getElementById('darkBtn').textContent.trim() === '☀️', 'darkBtn shows sun when dark');

  // test 3: toggleDark should flip theme and persist user choice
  const before = window.document.body.classList.contains('dark');
  window.toggleDark();
  const after = window.document.body.classList.contains('dark');
  expect(before !== after, 'toggleDark flips .dark state');
  expect(window.localStorage.getItem('darkMode') !== null, 'toggleDark persisted darkMode');

  // test 4: setStoredTheme and getStoredTheme interplay
  window.setStoredTheme(false);
  expect(window.getStoredTheme() === false, 'getStoredTheme returns false after setStoredTheme(false)');

  console.log('\nDone — if you saw any FAIL messages above, review changes.');
})();
