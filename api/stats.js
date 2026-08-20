// דשבורד צפיות מוגן בסיסמה.
// קורא נתונים חיים מ-Vercel Web Analytics בכל טעינה.
//
// משתני סביבה נדרשים (מוגדרים בלוח הבקרה של Vercel, לא בקוד):
//   VERCEL_ANALYTICS_TOKEN - Personal Access Token בהיקף הצוות
//   STATS_PASSWORD         - הסיסמה לכניסה לדשבורד

const TEAM = 'team_86XFW383kEKVo1LyoCP4wVD2';
const PROJ = 'prj_umBAfm0rFU1ed1jPZVpJWjfxIxra';

const PAGE_LABELS = {
  '/': 'דף הנחיתה',
  '/schedule.html': 'לוח המפגשים',
  '/toda.html': 'דף תודה',
};
const DEVICE_LABELS = { mobile: 'נייד', desktop: 'מחשב', tablet: 'טאבלט' };
const COUNTRY_LABELS = { IL: 'ישראל', US: 'ארצות הברית', GB: 'בריטניה' };

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function iso(d) {
  return new Date(d).toISOString().slice(0, 11) + '00:00:00.000Z';
}

async function api(path, params) {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const q = new URLSearchParams({ teamId: TEAM, projectId: PROJ, ...params });
  const res = await fetch('https://api.vercel.com' + path + '?' + q, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) throw new Error('Vercel API ' + res.status);
  return res.json();
}

function range(days) {
  const now = Date.now();
  return { since: iso(now - days * 864e5), until: iso(now + 864e5) };
}

async function count(days) {
  const r = await api('/v1/query/web-analytics/visits/count', range(days));
  const d = r.data || {};
  return { visitors: d.visitors || 0, pageviews: d.pageviews || 0 };
}

async function agg(by, days, limit = 12) {
  const r = await api('/v1/query/web-analytics/visits/aggregate', { by, limit, ...range(days) });
  return (r.data || []).map((row) => ({
    key: row[by] === undefined || row[by] === null || row[by] === '' ? 'ישיר' : String(row[by]),
    visitors: row.visitors || 0,
    pageviews: row.pageviews || 0,
  }));
}

function table(rows, head, labels, empty) {
  if (!rows.length) return '<p class="empty">' + esc(empty) + '</p>';
  const top = Math.max(...rows.map((r) => r.visitors)) || 1;
  const body = rows
    .map((r) => {
      const name = (labels && labels[r.key]) || r.key;
      const w = ((100 * r.visitors) / top).toFixed(1);
      return (
        '<tr><td><span class="bar" style="width:' + w + '%"></span>' +
        '<span class="lbl">' + esc(name) + '</span></td>' +
        '<td class="num">' + r.visitors + '</td><td class="num">' + r.pageviews + '</td></tr>'
      );
    })
    .join('');
  return (
    '<table><thead><tr><th>' + esc(head) +
    '</th><th>מבקרות</th><th>צפיות</th></tr></thead><tbody>' + body + '</tbody></table>'
  );
}

function chart(rows) {
  if (!rows.length) return '<p class="empty">אין עדיין נתונים יומיים</p>';
  const sorted = rows.slice().sort((a, b) => (a.key < b.key ? -1 : 1));
  const top = Math.max(...sorted.map((r) => r.visitors)) || 1;
  return (
    '<div class="chart">' +
    sorted
      .map((r) => {
        const h = Math.max(3, Math.round((100 * r.visitors) / top));
        const d = r.key.length >= 10 ? r.key.slice(8, 10) + '.' + r.key.slice(5, 7) : r.key;
        return '<div class="b"><span style="height:' + h + '%" title="' + r.visitors + '"></span><i>' + esc(d) + '</i></div>';
      })
      .join('') +
    '</div>'
  );
}

const STYLE = `
:root{--coral:#E63E70;--coral-deep:#C22C5C;--coral-tint:#FCE4EB;--ink:#2E2A2C;--ink-soft:#75686B;--paper:#FFFCF9;--line:rgba(46,42,44,.12);--radius:22px}
*{box-sizing:border-box}
body{margin:0;font-family:'Assistant',sans-serif;color:var(--ink);background:var(--paper);direction:rtl;text-align:right;line-height:1.7;font-size:17px;-webkit-font-smoothing:antialiased}
h1,h2{font-family:'Heebo',sans-serif;margin:0;font-weight:800;letter-spacing:-.01em}
.wrap{max-width:900px;margin:0 auto;padding:clamp(26px,5vw,48px) clamp(18px,5vw,32px) 60px}
.head{text-align:center;margin-bottom:26px}
.head h1{font-size:clamp(26px,5vw,36px)}
.stamp{color:var(--ink-soft);font-size:14px;margin-top:8px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
@media(max-width:640px){.kpis{grid-template-columns:1fr 1fr}}
.kpi{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:20px 16px;text-align:center;box-shadow:0 2px 16px rgba(46,42,44,.06)}
.kpi .n{font-family:'Heebo',sans-serif;font-weight:900;font-size:34px;color:var(--coral-deep);line-height:1.1}
.kpi .t{font-size:13px;color:var(--ink-soft);margin-top:6px}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:clamp(16px,3vw,24px);margin-bottom:16px;box-shadow:0 2px 16px rgba(46,42,44,.06)}
.card h2{font-size:19px;margin-bottom:14px}
table{width:100%;border-collapse:collapse}
th{text-align:right;font-size:12.5px;color:var(--ink-soft);font-weight:600;padding-bottom:8px;border-bottom:1px solid var(--line)}
th:not(:first-child),td.num{text-align:left;width:78px}
td{padding:9px 0;border-bottom:1px solid var(--line);font-size:15px;position:relative}
tr:last-child td{border-bottom:none}
td.num{font-variant-numeric:tabular-nums;font-weight:700}
.bar{position:absolute;right:0;top:6px;bottom:6px;background:var(--coral-tint);border-radius:6px;z-index:0}
.lbl{position:relative;z-index:1;padding-inline-start:8px}
.empty{color:var(--ink-soft);font-size:15px;margin:0;padding:10px 0}
.chart{display:flex;align-items:flex-end;gap:4px;height:150px;padding-top:10px}
.chart .b{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}
.chart .b span{width:100%;max-width:22px;background:linear-gradient(180deg,var(--coral) 0%,var(--coral-deep) 100%);border-radius:5px 5px 0 0;display:block}
.chart .b i{font-size:9.5px;color:var(--ink-soft);font-style:normal;margin-top:5px;white-space:nowrap}
.note{background:var(--coral-tint);border-radius:14px;padding:12px 16px;font-size:14.5px;color:var(--coral-deep);margin-top:20px}
.login{max-width:380px;margin:14vh auto;background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:32px 26px;text-align:center;box-shadow:0 2px 16px rgba(46,42,44,.06)}
.login h1{font-size:24px;margin-bottom:6px}
.login p{color:var(--ink-soft);font-size:15px;margin:0 0 18px}
.login input{width:100%;height:50px;border:1.5px solid var(--line);border-radius:14px;padding:0 16px;font-family:'Assistant',sans-serif;font-size:16px;text-align:center;outline:none}
.login input:focus{border-color:var(--coral)}
.login button{width:100%;height:50px;margin-top:12px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--coral) 0%,var(--coral-deep) 100%);color:#fff;font-family:'Heebo',sans-serif;font-weight:800;font-size:16px;cursor:pointer}
.err{color:var(--coral-deep);font-size:14px;margin-top:12px}
`;

function shell(title, inner) {
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
<style>${STYLE}</style></head><body>${inner}</body></html>`;
}

function loginPage(failed) {
  return shell('כניסה לדשבורד', `<form class="login" method="GET">
    <h1>דשבורד צפיות</h1>
    <p>הכניסי סיסמה כדי לצפות בנתונים</p>
    <input type="password" name="p" placeholder="סיסמה" autofocus autocomplete="current-password">
    <button type="submit">כניסה</button>
    ${failed ? '<p class="err">סיסמה שגויה</p>' : ''}
  </form>`);
}

export default async function handler(req, res) {
  const expected = process.env.STATS_PASSWORD;
  const url = new URL(req.url, 'http://x');
  const given = url.searchParams.get('p');

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!expected) {
    return res.status(500).send(shell('שגיאת הגדרה',
      '<div class="login"><h1>חסרה הגדרה</h1><p>משתנה הסביבה STATS_PASSWORD לא מוגדר בוורסל.</p></div>'));
  }
  if (given === null) return res.status(200).send(loginPage(false));
  if (given !== expected) return res.status(401).send(loginPage(true));

  if (!process.env.VERCEL_ANALYTICS_TOKEN) {
    return res.status(500).send(shell('שגיאת הגדרה',
      '<div class="login"><h1>חסרה הגדרה</h1><p>משתנה הסביבה VERCEL_ANALYTICS_TOKEN לא מוגדר בוורסל.</p></div>'));
  }

  try {
    const [c7, c30, days, paths, refs, devs, ctry] = await Promise.all([
      count(7), count(30), agg('day', 30, 31), agg('requestPath', 30),
      agg('referrerHostname', 30), agg('deviceType', 30), agg('country', 30),
    ]);
    const stamp = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' });

    return res.status(200).send(shell('דשבורד צפיות', `<div class="wrap">
      <div class="head"><h1>דשבורד צפיות</h1>
        <p class="stamp">הכשרת Inside Out · נכון ל-${esc(stamp)}</p></div>
      <div class="kpis">
        <div class="kpi"><div class="n">${c7.visitors}</div><div class="t">מבקרות · 7 ימים</div></div>
        <div class="kpi"><div class="n">${c7.pageviews}</div><div class="t">צפיות · 7 ימים</div></div>
        <div class="kpi"><div class="n">${c30.visitors}</div><div class="t">מבקרות · 30 יום</div></div>
        <div class="kpi"><div class="n">${c30.pageviews}</div><div class="t">צפיות · 30 יום</div></div>
      </div>
      <div class="card"><h2>מבקרות לפי יום</h2>${chart(days)}</div>
      <div class="card"><h2>איזה דף נצפה</h2>${table(paths, 'דף', PAGE_LABELS, 'אין עדיין נתונים')}</div>
      <div class="card"><h2>מאיפה הגיעו</h2>${table(refs, 'מקור', { 'ישיר': 'כניסה ישירה' }, 'אין עדיין מקורות תנועה')}</div>
      <div class="card"><h2>מכשיר</h2>${table(devs, 'מכשיר', DEVICE_LABELS, 'אין עדיין נתונים')}</div>
      <div class="card"><h2>מדינה</h2>${table(ctry, 'מדינה', COUNTRY_LABELS, 'אין עדיין נתונים')}</div>
      <p class="note">הנתונים מתעדכנים בכל טעינה של הדף. תקופות שלפני הפעלת המעקב אינן קיימות.</p>
    </div>`));
  } catch (e) {
    return res.status(502).send(shell('שגיאה',
      '<div class="login"><h1>לא הצלחנו למשוך נתונים</h1><p>' + esc(e.message) + '</p></div>'));
  }
}
