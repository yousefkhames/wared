const T = {
 en:{skip:'Skip to content',moveBack:'Move to previous column',moveNext:'Move to next column',brand:'Wared',tag:'Important emails, sorted',board:'Board',calendar:'Calendar',paste:'Paste emails',privacy:'Private by design: your text is processed in this page only. Nothing is uploaded or read from your inbox. Separate emails with a line of ---.',extract:'Extract cards',sample:'Try a sample',clearBoard:'Clear board',foot:'Free and open source (MIT). Data stays in your browser.',exportIcs:'Export .ics',exportJson:'Export JSON',
  todo:'To do',scheduled:'Scheduled',waiting:'Waiting',done:'Done',high:'High',medium:'Medium',low:'Low',skipped:'Skipped as noise',add:'Add',noDate:'No date',empty:'Nothing here yet. Paste some emails above.',save:'Save',del:'Delete',title:'Title',date:'Date',time:'Time',col:'Column',notes:'Notes',pri:'Priority',none:'No emails found.',calEmpty:'No dated items yet.',found:'cards found'},
 ar:{skip:'تخطى للمحتوى',moveBack:'انقل للعمود السابق',moveNext:'انقل للعمود التالي',brand:'وارد',tag:'الإيميلات المهمة، متنظمة',board:'اللوحة',calendar:'التقويم',paste:'الصق الإيميلات',privacy:'الخصوصية أولاً: النص بيتعالج جوه الصفحة بس. مفيش حاجة بتترفع ولا بنقرا الإيميل بتاعك. افصل بين الإيميلات بسطر ---.',extract:'استخرج الكروت',sample:'جرب مثال',clearBoard:'امسح اللوحة',foot:'مجاني ومفتوح المصدر (MIT). بياناتك بتفضل في متصفحك.',exportIcs:'تصدير .ics',exportJson:'تصدير JSON',
  todo:'المطلوب',scheduled:'مجدول',waiting:'بانتظار',done:'تم',high:'عالية',medium:'متوسطة',low:'منخفضة',skipped:'اتتجاهل (إعلانات)',add:'أضف',noDate:'بدون تاريخ',empty:'مفيش حاجة لسه. الصق إيميلات فوق.',save:'حفظ',del:'حذف',title:'العنوان',date:'التاريخ',time:'الوقت',col:'العمود',notes:'ملاحظات',pri:'الأولوية',none:'مفيش إيميلات.',calEmpty:'مفيش عناصر بتاريخ.',found:'كروت'}
};
const COLS = ['todo','scheduled','waiting','done'];
const $ = s => document.querySelector(s);
let lang = localStorage.getItem('wared.lang') || (navigator.language || '').startsWith('ar') ? 'ar' : 'en';
if (localStorage.getItem('wared.lang')) lang = localStorage.getItem('wared.lang');
let cards = JSON.parse(localStorage.getItem('wared.cards') || '[]');
let pending = [], view = 'board';
const t = k => T[lang][k] || k;
const save = () => localStorage.setItem('wared.cards', JSON.stringify(cards));
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const SAMPLE = `From: registrar@university.edu
Subject: Action required: course registration deadline
Please confirm your course registration by 3 December 2026 at 5 pm or your seats will be released.
---
From: manager@company.com
Subject: Weekly sync meeting
Team meeting on Monday at 10:30. Please prepare the sprint summary.
---
From: client@acme.com
Subject: Invoice 2291 payment
Please pay the attached invoice by 10 Dec 2026. We are awaiting your confirmation.
---
From: deals@shop.example
Subject: 50% off, sale ends tonight
Unsubscribe from this newsletter anytime.
---
من: د. منى
الموضوع: اجتماع المشروع
اجتماع يوم الخميس الساعة ٣ مساء، يرجى تأكيد الحضور.`;

function applyLang() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  $('#lang').textContent = lang === 'ar' ? 'English' : 'العربية';
  $('#src').placeholder = lang === 'ar' ? 'From: ...\nالموضوع: ...' : 'From: ...\nSubject: ...';
  render();
}
function fmtDate(c) { if (!c.date) return t('noDate'); return new Date(c.date + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday:'short', day:'numeric', month:'short' }) + (c.time ? ' ' + c.time : ''); }
const say = m => { const l = $('#live'); l.textContent = ''; setTimeout(() => l.textContent = m, 30); };
function cardHTML(c) {
  const overdue = c.date && c.column !== 'done' && new Date(c.date + 'T23:59:59') < new Date();
  return `<div class="card ${c.priority}" draggable="true" tabindex="0" role="button" aria-label="${esc(c.title)}, ${t(c.priority)}, ${fmtDate(c)}" data-id="${c.id}"><b>${esc(c.title)}</b><small>${esc(c.from)}</small><div><span class="badge">${t(c.priority)}</span><span class="badge ${overdue ? 'due' : ''}">${fmtDate(c)}</span></div><div class="mv"><button class="mvb" data-mv="-1" aria-label="${t('moveBack')}">${lang === 'ar' ? '›' : '‹'}</button><button class="mvb" data-mv="1" aria-label="${t('moveNext')}">${lang === 'ar' ? '‹' : '›'}</button></div></div>`;
}
function render() {
  const b = $('#board');
  b.innerHTML = COLS.map(col => { const l = cards.filter(c => c.column === col);
    return `<div class="col" data-col="${col}"><h3>${t(col)}<span>${l.length}</span></h3>${l.map(cardHTML).join('') || '<div class="empty">' + (cards.length ? '' : t('empty')) + '</div>'}</div>`; }).join('');
  b.querySelectorAll('.card').forEach(el => {
    el.addEventListener('dragstart', e => e.dataTransfer.setData('text', el.dataset.id));
    el.querySelectorAll('.mvb').forEach(bt => bt.addEventListener('click', e => { e.stopPropagation(); const c = cards.find(x => x.id === el.dataset.id); const i = COLS.indexOf(c.column) + +bt.dataset.mv; if (i >= 0 && i < COLS.length) { c.column = COLS[i]; save(); render(); say(c.title + ' → ' + t(c.column)); } }));
    el.addEventListener('click', () => openEdit(el.dataset.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEdit(el.dataset.id); } });
  });
  b.querySelectorAll('.col').forEach(el => {
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', e => { e.preventDefault(); const c = cards.find(x => x.id === e.dataTransfer.getData('text')); if (c) { c.column = el.dataset.col; save(); render(); } });
  });
  const dated = cards.filter(c => c.date).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  $('#cal').innerHTML = dated.length ? dated.map(c => `<div class="day"><div class="d">${fmtDate({ date: c.date })}</div><div class="it"><b>${esc(c.title)}</b> <small>${c.time || ''}</small><br><small>${esc(c.from)}</small></div></div>`).join('') : `<div class="empty">${t('calEmpty')}</div>`;
}
function openEdit(id) {
  const c = cards.find(x => x.id === id); if (!c) return;
  $('#edit').innerHTML = `<label>${t('title')}</label><input id="e1" value="${esc(c.title)}"><label>${t('date')}</label><input id="e2" type="date" value="${c.date || ''}"><label>${t('time')}</label><input id="e3" type="time" value="${c.time || ''}">
  <label>${t('col')}</label><select id="e4">${COLS.map(k => `<option value="${k}" ${k === c.column ? 'selected' : ''}>${t(k)}</option>`).join('')}</select>
  <label>${t('pri')}</label><select id="e5">${['high','medium','low'].map(k => `<option value="${k}" ${k === c.priority ? 'selected' : ''}>${t(k)}</option>`).join('')}</select>
  <label>${t('notes')}</label><textarea id="e6" rows="3">${esc(c.notes)}</textarea>
  <div class="row"><button class="primary" value="ok">${t('save')}</button><button value="del" class="ghost">${t('del')}</button></div>`;
  const dlg = $('#dlg'); dlg.showModal();
  $('#edit').onsubmit = e => { const v = e.submitter && e.submitter.value;
    if (v === 'del') cards = cards.filter(x => x.id !== id);
    else if (v === 'ok') Object.assign(c, { title: $('#e1').value, date: $('#e2').value || null, time: $('#e3').value || null, column: $('#e4').value, priority: $('#e5').value, notes: $('#e6').value });
    save(); render(); };
}
$('#go').onclick = () => {
  pending = Wared.parseAll($('#src').value).map(p => ({ ...p, id: uid(), keep: p.column !== 'skip' }));
  const pv = $('#preview'); pv.hidden = false;
  if (!pending.length) { pv.innerHTML = `<div class="empty">${t('none')}</div>`; return; }
  pv.innerHTML = pending.map((p, i) => `<label class="pv"><input type="checkbox" data-i="${i}" ${p.keep ? 'checked' : ''}><span class="t"><b>${esc(p.title)}</b><small>${esc(p.from)} · ${t(p.priority)} · ${fmtDate(p)}${p.column === 'skip' ? ' · ' + t('skipped') : ''}</small></span></label>`).join('') + `<div class="row"><button class="primary" id="addAll">${t('add')}</button></div>`;
  pv.querySelectorAll('input').forEach(i => i.onchange = () => pending[+i.dataset.i].keep = i.checked);
  $('#addAll').onclick = () => { pending.filter(p => p.keep).forEach(p => { delete p.keep; delete p.score; delete p.important; if (p.column === 'skip') p.column = 'todo'; cards.push(p); }); save(); say(pending.filter(p => p.keep !== undefined).length + ' ' + t('found')); pv.hidden = true; $('#src').value = ''; render(); };
};
$('#sample').onclick = () => { $('#src').value = SAMPLE; $('#go').click(); };
$('#clear').onclick = () => { if (confirm(lang === 'ar' ? 'مسح كل الكروت؟' : 'Remove all cards?')) { cards = []; save(); render(); } };
$('#lang').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('wared.lang', lang); applyLang(); };
function setView(v) { view = v; $('#viewBoard').setAttribute('aria-pressed', v === 'board'); $('#viewCal').setAttribute('aria-pressed', v === 'cal'); $('#board').hidden = v !== 'board'; $('#cal').hidden = v !== 'cal'; $('#viewBoard').classList.toggle('on', v === 'board'); $('#viewCal').classList.toggle('on', v === 'cal'); }
$('#viewBoard').onclick = () => setView('board'); $('#viewCal').onclick = () => setView('cal');
function dl(name, type, data) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); }
$('#ics').onclick = () => dl('wared.ics', 'text/calendar', Wared.toICS(cards.filter(c => c.column !== 'done')));
$('#exp').onclick = () => dl('wared.json', 'application/json', JSON.stringify(cards, null, 2));
$('#theme').onclick = () => { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; localStorage.setItem('wared.theme', d); };
applyLang();
