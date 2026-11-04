/* Portfolio page: language switch (ar / fr / en), app cards, filters, picture viewer. */
'use strict';

const LANGS = ['ar', 'fr', 'en'];
const LANG_KEY = 'syntrix.lang';
let lang = pickLang();
let cat = 'all';

function pickLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(q)) return q;
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (e) { /* storage blocked */ }
  const nav = (navigator.language || 'ar').slice(0, 2);
  return LANGS.includes(nav) ? nav : 'ar';
}
const I = () => LANGS.indexOf(lang);
const t = arr => arr[I()];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function setLang(l) {
  lang = l;
  try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ }
  render();
}

function render() {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t(UI.title);
  document.querySelector('meta[name=description]').content = t(UI.metaDesc);
  document.querySelectorAll('.langs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));

  const ids = ['#work', '#services', '#process', '#contact'];
  $('nav').innerHTML = t(UI.nav).map((label, i) => `<a href="${ids[i]}">${esc(label)}</a>`).join('');

  $('eyebrow').textContent = t(UI.eyebrow);
  $('heroTitle').innerHTML = t(UI.heroTitle);            // own text, contains <em>
  $('heroSub').textContent = t(UI.heroSub);
  $('ctaMain').textContent = t(UI.ctaMain);
  $('ctaWork').textContent = t(UI.ctaWork);
  $('promises').innerHTML = UI.promises.map(p => `<li>${esc(t(p))}</li>`).join('');
  const statVals = [APPS.length, 3, 3];
  $('stats').innerHTML = UI.stats.map((s, i) =>
    `<div><dt>${statVals[i]}</dt><dd>${esc(t(s[0]))}</dd></div>`).join('');

  $('workTitle').textContent = t(UI.workTitle);
  $('workSub').textContent = t(UI.workSub);
  renderFilters();
  renderGrid();

  $('servicesTitle').textContent = t(UI.servicesTitle);
  $('servicesList').innerHTML = SERVICES.map(s => `
    <article class="svc"><span class="e" aria-hidden="true">${s.e}</span>
      <h3>${esc(t(s.t))}</h3><p>${esc(t(s.d))}</p></article>`).join('');

  $('processTitle').textContent = t(UI.processTitle);
  $('steps').innerHTML = STEPS.map((s, i) => `
    <li><span class="n">${i + 1}</span><h3>${esc(t(s.t))}</h3><p>${esc(t(s.d))}</p></li>`).join('');

  $('contactTitle').textContent = t(UI.contactTitle);
  $('contactSub').textContent = t(UI.contactSub);
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t(UI.mailSubject))}`;
  $('mailBtn').href = mail;
  $('mailBtn').textContent = '✉  ' + t(UI.mailBtn);
  $('mailText').textContent = CONTACT.email;
  $('copyBtn').textContent = t(UI.copy);
  const wa = $('waBtn');
  wa.hidden = !CONTACT.whatsapp;
  if (CONTACT.whatsapp) {
    wa.href = `https://wa.me/${CONTACT.whatsapp}`;
    wa.textContent = t(UI.waBtn);
  }
  const soc = [['facebook', 'fb', 'Facebook'], ['youtube', 'yt', 'YouTube']].filter(([k]) => SOCIAL[k]);
  $('social').innerHTML = soc.length ? `<span>${esc(t(UI.followUs))}:</span> ` + soc.map(([k, c, label]) =>
    `<a class="soc-link ${c}" href="${SOCIAL[k]}" target="_blank" rel="noopener">${label}</a>`).join('') : '';
  $('footer').textContent = t(UI.footer);
  $('footMail').textContent = CONTACT.email;
  $('footMail').href = `mailto:${CONTACT.email}`;
  $('year').textContent = new Date().getFullYear();
  $('viewerClose').setAttribute('aria-label', t(UI.close));
}

const inCat = (a, id) => id === 'all' || (id === 'apk' ? !!a.apk : a.cat === id);
const mb = n => (n < 10 ? n.toFixed(1) : Math.round(n)) + ' MB';

function renderFilters() {
  const count = id => APPS.filter(a => inCat(a, id)).length;
  $('filters').innerHTML = CATS.map(c => `
    <button data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(t(c.t))}<span>${count(c.id)}</span></button>`).join('');
}

function imgFor(app) {
  const set = IMAGES[app.id];
  return set ? 'img/' + set[lang] : '';
}

function renderGrid() {
  const list = APPS.filter(a => inCat(a, cat));
  $('grid').innerHTML = list.map(a => {
    const name = esc(t(a.n));
    const apk = a.apk ? `
      <button class="apk" data-apk="${a.id}" type="button"><span aria-hidden="true">⬇</span> ${esc(t(UI.apkBtn))}
        <small>${mb(a.apk.mb)}</small></button>` : '';
    const live = (a.link ? `
      <a class="try" href="${a.link}" target="_blank" rel="noopener">${esc(t(UI.live))} <span aria-hidden="true">↗</span></a>
      ${a.sleeps ? `<small class="sleep">${esc(t(UI.sleepNote))}</small>` : ''}` : '') + apk;
    return `
    <article class="card" data-cat="${a.cat}">
      <button class="shot" data-img="${imgFor(a)}" aria-label="${esc(t(UI.enlarge))}: ${name}">
        <img src="${imgFor(a)}" alt="${name}" loading="lazy" width="1024" height="500">
        ${a.link ? `<span class="badge">● ${esc(t(UI.liveBadge))}</span>` : ''}
      </button>
      <div class="card-body">
        <h3>${name}</h3>
        <p>${esc(t(a.d))}</p>
        <div class="chips">${a.plat.map(p => `<span>${esc(p)}</span>`).join('')}</div>
        ${live ? `<div class="live">${live}</div>` : ''}
      </div>
    </article>`;
  }).join('');
}

// ---------------------------------------------------------------- events
document.querySelector('.langs').addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (b) setLang(b.dataset.lang);
});
$('filters').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  cat = b.dataset.cat;
  renderFilters();
  renderGrid();
});

// ---------------------------------------------------------------- APK download + follow window
const FOLLOW_KEY = 'syntrix.follow';
function followState() {
  try { return Object.assign({ fb: false, yt: false }, JSON.parse(localStorage.getItem(FOLLOW_KEY)) || {}); }
  catch (e) { return { fb: false, yt: false }; }
}
let follow = followState();
let gateApp = null;
let skipped = false;
const needFb = () => !!SOCIAL.facebook;
const needYt = () => !!SOCIAL.youtube;
const unlocked = () => skipped || ((!needFb() || follow.fb) && (!needYt() || follow.yt));

function saveFollow() { try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(follow)); } catch (e) { /* ignore */ } }

function renderGate() {
  const a = gateApp;
  if (!a) return;
  $('gateImg').src = imgFor(a);
  $('gateApp').textContent = t(a.n);
  $('gateMeta').textContent = `APK · ${mb(a.apk.mb)} · ${t(UI.android)}`;
  const gated = needFb() || needYt();
  $('gateFollow').hidden = !gated;
  $('gateTitle').textContent = t(UI.gateTitle);
  $('gateSub').textContent = t(UI.gateSub);
  const fb = $('fbBtn'), yt = $('ytBtn');
  fb.hidden = !needFb(); yt.hidden = !needYt();
  fb.href = SOCIAL.facebook || '#'; yt.href = SOCIAL.youtube || '#';
  fb.innerHTML = `<span class="ic" aria-hidden="true">f</span>${esc(t(UI.fbBtn))}<span class="ok" aria-hidden="true">${follow.fb ? '✓' : ''}</span>`;
  yt.innerHTML = `<span class="ic" aria-hidden="true">▶</span>${esc(t(UI.ytBtn))}<span class="ok" aria-hidden="true">${follow.yt ? '✓' : ''}</span>`;
  fb.classList.toggle('done', follow.fb);
  yt.classList.toggle('done', follow.yt);
  const open = unlocked();
  $('gateThanks').hidden = !(gated && open && !skipped);
  $('gateThanks').textContent = t(UI.thanks);
  const dl = $('dlBtn');
  dl.hidden = !open;
  dl.href = APK_BASE + a.apk.file;
  dl.textContent = `⬇  ${t(UI.apkBtn)} · ${mb(a.apk.mb)}`;
  $('skipBtn').hidden = !(GATE.skip && !open);
  $('skipBtn').textContent = t(UI.skip);
  $('howTitle').textContent = t(UI.howTitle);
  $('howSteps').innerHTML = UI.howSteps.map(s => `<li>${esc(t(s))}</li>`).join('');
}

function openGate(id) {
  gateApp = APPS.find(a => a.id === id);
  if (!gateApp || !gateApp.apk) return;
  skipped = false;
  renderGate();
  $('gate').showModal();
}
$('fbBtn').addEventListener('click', () => { follow.fb = true; saveFollow(); setTimeout(renderGate, 300); });
$('ytBtn').addEventListener('click', () => { follow.yt = true; saveFollow(); setTimeout(renderGate, 300); });
$('skipBtn').addEventListener('click', () => { skipped = true; renderGate(); });
$('gateClose').addEventListener('click', () => $('gate').close());
$('gate').addEventListener('click', e => { if (e.target === $('gate')) $('gate').close(); });

const viewer = $('viewer');
$('grid').addEventListener('click', e => {
  const apkBtn = e.target.closest('[data-apk]');
  if (apkBtn) { openGate(apkBtn.dataset.apk); return; }
  const b = e.target.closest('.shot');
  if (!b || !b.dataset.img) return;
  $('viewerImg').src = b.dataset.img;
  $('viewerImg').alt = b.querySelector('img').alt;
  viewer.showModal();
});
$('viewerClose').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });

$('copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(CONTACT.email);
  } catch (e) {
    const r = document.createRange();
    r.selectNodeContents($('mailText'));
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    return;
  }
  $('copyBtn').textContent = t(UI.copied);
  setTimeout(() => { $('copyBtn').textContent = t(UI.copy); }, 1800);
});

render();
