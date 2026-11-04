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
  $('footer').textContent = t(UI.footer);
  $('footMail').textContent = CONTACT.email;
  $('footMail').href = `mailto:${CONTACT.email}`;
  $('year').textContent = new Date().getFullYear();
  $('viewerClose').setAttribute('aria-label', t(UI.close));
}

function renderFilters() {
  const count = id => (id === 'all' ? APPS.length : APPS.filter(a => a.cat === id).length);
  $('filters').innerHTML = CATS.map(c => `
    <button data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(t(c.t))}<span>${count(c.id)}</span></button>`).join('');
}

function imgFor(app) {
  const set = IMAGES[app.id];
  return set ? 'img/' + set[lang] : '';
}

function renderGrid() {
  const list = APPS.filter(a => cat === 'all' || a.cat === cat);
  $('grid').innerHTML = list.map(a => {
    const name = esc(t(a.n));
    const live = a.link ? `
      <a class="try" href="${a.link}" target="_blank" rel="noopener">${esc(t(UI.live))} <span aria-hidden="true">↗</span></a>
      ${a.sleeps ? `<small class="sleep">${esc(t(UI.sleepNote))}</small>` : ''}` : '';
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

const viewer = $('viewer');
$('grid').addEventListener('click', e => {
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
