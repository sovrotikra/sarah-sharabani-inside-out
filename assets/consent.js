/* באנר הסכמה לעוגיות + טעינה מותנית של פיקסל מטא.
   הפיקסל נטען אך ורק לאחר הסכמה מפורשת.
   בדף התודה יש להוסיף לתגית הסקריפט את התכונה data-lead. */
(function () {
  'use strict';

  var KEY = 'cookie-consent';
  var PIXEL_ID = '1363210864831922';
  var script = document.currentScript;
  var isLead = script && script.hasAttribute('data-lead');

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function write(marketing) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        marketing: !!marketing, timestamp: new Date().toISOString(), version: 1
      }));
    } catch (e) {}
  }

  function loadPixel() {
    if (window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    if (isLead) window.fbq('track', 'Lead');
  }

  var CSS = ''
    + '.cc-bar{position:fixed;inset-inline:0;bottom:0;z-index:300;background:#fff;'
    + 'border-top:1px solid rgba(46,42,44,.14);box-shadow:0 -10px 30px rgba(46,42,44,.13);'
    + 'padding:16px clamp(14px,4vw,26px) calc(16px + env(safe-area-inset-bottom));'
    + 'font-family:Assistant,sans-serif;direction:rtl;text-align:right;}'
    + '.cc-in{max-width:900px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center;justify-content:space-between;}'
    + '.cc-txt{flex:1 1 340px;min-width:0;font-size:14.5px;line-height:1.6;color:#2E2A2C;margin:0;}'
    + '.cc-txt a{color:#C22C5C;font-weight:700;}'
    + '.cc-btns{display:flex;gap:9px;flex:0 0 auto;}'
    + '.cc-b{font-family:Heebo,sans-serif;font-weight:700;font-size:14.5px;border-radius:999px;'
    + 'padding:11px 22px;cursor:pointer;border:1.5px solid transparent;white-space:nowrap;}'
    + '.cc-yes{background:linear-gradient(135deg,#E63E70 0%,#C22C5C 100%);color:#fff;}'
    + '.cc-no{background:transparent;color:#2E2A2C;border-color:rgba(46,42,44,.2);}'
    + '.cc-no:hover{border-color:#2E2A2C;}'
    + '@media(max-width:560px){.cc-btns{width:100%;}.cc-b{flex:1;padding:12px 10px;}}';

  function banner() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'cc-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'הסכמה לשימוש בעוגיות');
    bar.innerHTML = ''
      + '<div class="cc-in">'
      + '<p class="cc-txt">אנחנו משתמשות בעוגיות של פייסבוק כדי למדוד את הפרסום שלנו. '
      + 'בלי הסכמתך לא ייאסף עלייך מידע שיווקי. '
      + '<a href="privacy.html" target="_blank" rel="noopener">מדיניות הפרטיות</a></p>'
      + '<div class="cc-btns">'
      + '<button type="button" class="cc-b cc-no">לא, תודה</button>'
      + '<button type="button" class="cc-b cc-yes">אני מסכימה</button>'
      + '</div></div>';

    function close() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
    bar.querySelector('.cc-yes').addEventListener('click', function () {
      write(true); loadPixel(); close();
    });
    bar.querySelector('.cc-no').addEventListener('click', function () {
      write(false); close();
    });
    document.body.appendChild(bar);
  }

  /* פתיחה מחדש מקישור בפוטר: <a href="#" data-cookie-settings> */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
    if (!t) return;
    e.preventDefault();
    try { localStorage.removeItem(KEY); } catch (err) {}
    if (!document.querySelector('.cc-bar')) banner();
  });

  var saved = read();
  if (saved === null) {
    if (document.body) banner();
    else document.addEventListener('DOMContentLoaded', banner);
  } else if (saved.marketing) {
    loadPixel();
  }
})();
