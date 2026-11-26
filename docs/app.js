const T = {
 en:{skip:'Skip to content',snooze1:'+1 day',snooze7:'+1 week',tag_study:'Study',tag_bills:'Bills',tag_health:'Health',tag_work:'Work',keys:'Shortcuts: / search, n paste, c calendar.',clearDone:'Clear',cleared:'Done cards cleared',dups:'duplicates skipped',s1t:'1. Paste',s1d:'Copy emails from any mail app and paste them here.',s2t:'2. Review',s2d:'Wared picks out deadlines, meetings and requests. You choose what to keep.',s3t:'3. Act',s3d:'Move cards on the board, then export to your calendar.',faq:'Wared never connects to your mailbox and has no server. Your cards are saved only in this browser.',importJson:'Import JSON',imported:'cards imported',badFile:'Could not read that file',loc:'Location',link:'Link',addCal:'Add to Google Calendar',dlIcs:'Download .ics',amount:'Amount',end:'Ends',search:'Search cards',overdue:'overdue',open:'open',undo:'Undo',deleted:'Card deleted',moveBack:'Move to previous column',moveNext:'Move to next column',brand:'Wared',tag:'Important emails, sorted',board:'Board',calendar:'Calendar',paste:'Paste emails',privacy:'Private by design: your text is processed in this page only. Nothing is uploaded or read from your inbox. Separate emails with a line of ---.',extract:'Extract cards',sample:'Try a sample',clearBoard:'Clear board',foot:'Free and open source (MIT). Data stays in your browser.',exportIcs:'Export .ics',exportJson:'Export JSON',
  todo:'To do',scheduled:'Scheduled',waiting:'Waiting',done:'Done',high:'High',medium:'Medium',low:'Low',skipped:'Skipped as noise',add:'Add',noDate:'No date',empty:'Nothing here yet. Paste some emails above.',save:'Save',del:'Delete',title:'Title',date:'Date',time:'Time',col:'Column',notes:'Notes',pri:'Priority',none:'No emails found.',calEmpty:'No dated items yet.',found:'cards found'},
 ar:{skip:'تخطى للمحتوى',snooze1:'+ يوم',snooze7:'+ أسبوع',tag_study:'دراسة',tag_bills:'فواتير',tag_health:'صحة',tag_work:'شغل',keys:'اختصارات: / بحث، n لصق، c تقويم.',clearDone:'مسح',cleared:'اتمسحت كروت تم',dups:'مكرر اتتخطى',s1t:'١. الصق',s1d:'انسخ الإيميلات من أي تطبيق بريد والصقها هنا.',s2t:'٢. راجع',s2d:'وارد بيلاقي المواعيد النهائية والاجتماعات والطلبات، وانت بتختار اللي يفضل.',s3t:'٣. نفّذ',s3d:'حرّك الكروت على اللوحة وبعدين صدّرها لتقويمك.',faq:'وارد مبيتصلش بصندوق بريدك ومعندوش سيرفر. الكروت بتتحفظ في متصفحك بس.',importJson:'استيراد JSON',imported:'كروت اتستوردت',badFile:'الملف مش مقروء',loc:'المكان',link:'الرابط',addCal:'أضف لتقويم جوجل',dlIcs:'نزّل .ics',amount:'المبلغ',end:'ينتهي',search:'ابحث في الكروت',overdue:'متأخر',open:'مفتوح',undo:'تراجع',deleted:'اتحذف الكارت',moveBack:'انقل للعمود السابق',moveNext:'انقل للعمود التالي',brand:'وارد',tag:'الإيميلات المهمة، متنظمة',board:'اللوحة',calendar:'التقويم',paste:'الصق الإيميلات',privacy:'الخصوصية أولاً: النص بيتعالج جوه الصفحة بس. مفيش حاجة بتترفع ولا بنقرا الإيميل بتاعك. افصل بين الإيميلات بسطر ---.',extract:'استخرج الكروت',sample:'جرب مثال',clearBoard:'امسح اللوحة',foot:'مجاني ومفتوح المصدر (MIT). بياناتك بتفضل في متصفحك.',exportIcs:'تصدير .ics',exportJson:'تصدير JSON',
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

const SAMPLE_AR = `من: شؤون الطلاب
الموضوع: عاجل: آخر موعد لتسجيل المواد
يرجى تأكيد تسجيل المواد قبل ٣ ديسمبر الساعة ٥ مساء.
---
من: مدير المشروع
الموضوع: اجتماع الفريق الأسبوعي
اجتماع يوم الأحد الساعة ١٠ صباحا في القاعة ٢. يرجى تجهيز تقرير الأسبوع.
---
من: المحاسبة
الموضوع: فاتورة رقم ٢٢٩١
يرجى دفع مبلغ ١٥٠٠ جنيه قبل ١٥ ديسمبر.
---
من: متجر
الموضوع: خصم ٥٠٪ لحد الليلة
عرض خاص، لإلغاء الاشتراك اضغط هنا.`;
function applyLang() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  $('#lang').textContent = lang === 'ar' ? 'English' : 'العربية';
  $('#src').placeholder = lang === 'ar' ? 'From: ...\nالموضوع: ...' : 'From: ...\nSubject: ...';
  render();
}
function relDay(c) {
  if (!c.date) return '';
  const days = Math.round((new Date(c.date + 'T00:00:00') - new Date(new Date().toDateString())) / 864e5);
  if (Math.abs(days) > 30) return '';
  return new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar-EG' : 'en', { numeric: 'auto' }).format(days, 'day');
}
function fmtDate(c) { if (!c.date) return t('noDate'); return new Date(c.date + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday:'short', day:'numeric', month:'short' }) + (c.time ? ' ' + c.time : ''); }
const say = m => { const l = $('#live'); l.textContent = ''; setTimeout(() => l.textContent = m, 30); };
function cardHTML(c) {
  const overdue = c.date && c.column !== 'done' && new Date(c.date + 'T23:59:59') < new Date();
  return `<div class="card ${c.priority}" draggable="true" tabindex="0" role="button" aria-label="${esc(c.title)}, ${t(c.priority)}, ${fmtDate(c)}" data-id="${c.id}"><b>${esc(c.title)}</b><small title="${esc(c.from)}">${esc(c.fromName || c.from)}</small><div><span class="badge">${t(c.priority)}</span>${c.tag ? '<span class="badge tg tg-' + c.tag + '">' + t('tag_' + c.tag) + '</span>' : ''}<span class="badge ${overdue ? 'due' : ''}">${fmtDate(c)}${relDay(c) ? ' · ' + relDay(c) : ''}</span>${c.amount ? '<span class="badge">' + esc(c.amount) + '</span>' : ''}${c.location ? '<span class="badge">📍 ' + esc(c.location) + '</span>' : ''}${c.link ? '<span class="badge">🔗</span>' : ''}${c.repeat ? '<span class="badge">↻</span>' : ''}</div><div class="mv"><button class="mvb" data-mv="-1" aria-label="${t('moveBack')}">${lang === 'ar' ? '›' : '‹'}</button><button class="mvb" data-mv="1" aria-label="${t('moveNext')}">${lang === 'ar' ? '‹' : '›'}</button></div></div>`;
}
const isOverdue = c => c.date && c.column !== 'done' && new Date(c.date + 'T23:59:59') < new Date();
const PR = { high: 0, medium: 1, low: 2 };
const byUrgency = (a, b) => (a.date || '9999').localeCompare(b.date || '9999') || PR[a.priority] - PR[b.priority];
function visible() {
  const q = ($('#q').value || '').toLowerCase().trim(), p = $('#pf').value;
  return cards.filter(c => (!p || c.priority === p) && (!q || (c.title + ' ' + c.from + ' ' + c.notes + ' ' + (c.tag ? t('tag_' + c.tag) + ' ' + c.tag : '')).toLowerCase().includes(q)));
}
function toast(msg, undoFn) {
  const el = $('#toast'); el.hidden = false; el.innerHTML = esc(msg) + (undoFn ? ' <button id="undoB">' + t('undo') + '</button>' : '');
  if (undoFn) $('#undoB').onclick = () => { undoFn(); el.hidden = true; };
  clearTimeout(toast.h); toast.h = setTimeout(() => el.hidden = true, 6000);
}
function render() {
  $('#how').hidden = cards.length > 0;
  $('#q').placeholder = t('search');
  const op = cards.filter(c => c.column !== 'done').length, od = cards.filter(isOverdue).length;
  $('#stats').innerHTML = cards.length ? op + ' ' + t('open') + (od ? ' · <b class="odue">' + od + ' ' + t('overdue') + '</b>' : '') : '';
  const b = $('#board');
  b.innerHTML = COLS.map(col => { const l = visible().filter(c => c.column === col).sort(byUrgency);
    return `<div class="col" data-col="${col}"><h3>${t(col)}<span>${l.length}</span>${col === 'done' && l.length ? `<button class="clr" id="clrDone">${t('clearDone')}</button>` : ''}</h3>${l.map(cardHTML).join('') || '<div class="empty">' + (cards.length ? '' : t('empty')) + '</div>'}</div>`; }).join('');
  if ($('#clrDone')) $('#clrDone').onclick = () => { const prev = cards.slice(); cards = cards.filter(c => c.column !== 'done'); save(); render(); toast(t('cleared'), () => { cards = prev; save(); render(); }); };
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
  renderCal();
}
let calM = new Date(); calM.setDate(1);
function renderCal() {
  const loc = lang === 'ar' ? 'ar-EG' : 'en-GB', y = calM.getFullYear(), m = calM.getMonth();
  const first = new Date(y, m, 1), start = (first.getDay() + (lang === 'ar' ? 1 : 6)) % 7; // week starts Saturday (ar) or Monday (en)
  const days = new Date(y, m + 1, 0).getDate(), today = ymd(new Date());
  const by = {}; cards.filter(c => c.date).forEach(c => (by[c.date] = by[c.date] || []).push(c));
  const wk = []; for (let i = 0; i < 7; i++) { const d = new Date(2026, 10, (lang === 'ar' ? 21 : 23) + i); wk.push(d.toLocaleDateString(loc, { weekday: 'short' })); }
  let cells = wk.map(w => `<div class="wd">${w}</div>`).join('') + '<div></div>'.repeat(start);
  for (let d = 1; d <= days; d++) {
    const k = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), l = by[k] || [];
    cells += `<div class="dc${k === today ? ' today' : ''}"><span class="dn">${d.toLocaleString(loc)}</span>${l.slice(0, 2).map(c => `<span class="ev ${c.priority}" title="${esc(c.title)}">${esc(c.title)}</span>`).join('')}${l.length > 2 ? `<span class="more">+${l.length - 2}</span>` : ''}</div>`;
  }
  const mine = cards.filter(c => c.date && c.date.startsWith(y + '-' + String(m + 1).padStart(2, '0'))).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  $('#cal').innerHTML = `<div class="calh"><button id="pm" aria-label="Previous month">${lang === 'ar' ? '›' : '‹'}</button><b>${calM.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</b><button id="nm" aria-label="Next month">${lang === 'ar' ? '‹' : '›'}</button></div><div class="grid">${cells}</div>` +
    (mine.length ? mine.map(c => `<div class="day"><div class="d">${fmtDate({ date: c.date })}</div><div class="it"><b>${esc(c.title)}</b> <small>${c.time || ''}${c.endTime ? '–' + c.endTime : ''}</small><br><small>${esc(c.from)}</small></div></div>`).join('') : `<div class="empty">${t('calEmpty')}</div>`);
  $('#pm').onclick = () => { calM = new Date(y, m - 1, 1); renderCal(); };
  $('#nm').onclick = () => { calM = new Date(y, m + 1, 1); renderCal(); };
}
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function gcal(c) {
  const d = c.date.replace(/-/g, '');
  let dates;
  if (c.time) { const s = c.time.replace(':', '') + '00', e = (c.endTime || String((+c.time.slice(0, 2) + 1) % 24).padStart(2, '0') + c.time.slice(3)).replace(':', '') + '00'; dates = d + 'T' + s + '/' + d + 'T' + e; }
  else { const n = new Date(c.date + 'T00:00:00'); n.setDate(n.getDate() + 1); dates = d + '/' + ymd(n).replace(/-/g, ''); }
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(c.title) + '&dates=' + dates + '&details=' + encodeURIComponent((c.from ? 'From: ' + c.from + '\n' : '') + (c.notes || '')) + (c.location ? '&location=' + encodeURIComponent(c.location) : '');
}
function openEdit(id) {
  const c = cards.find(x => x.id === id); if (!c) return;
  $('#edit').innerHTML = `<label>${t('title')}</label><input id="e1" value="${esc(c.title)}"><label>${t('date')}</label><input id="e2" type="date" value="${c.date || ''}"><label>${t('time')}</label><input id="e3" type="time" value="${c.time || ''}">
  <label>${t('col')}</label><select id="e4">${COLS.map(k => `<option value="${k}" ${k === c.column ? 'selected' : ''}>${t(k)}</option>`).join('')}</select>
  <label>${t('pri')}</label><select id="e5">${['high','medium','low'].map(k => `<option value="${k}" ${k === c.priority ? 'selected' : ''}>${t(k)}</option>`).join('')}</select>
  <label>${t('end')}</label><input id="e7" type="time" value="${c.endTime || ''}"><label>${t('loc')}</label><input id="e8" value="${esc(c.location)}"><label>${t('link')}</label><input id="e9" value="${esc(c.link)}" dir="ltr"><label>${t('notes')}</label><textarea id="e6" rows="3">${esc(c.notes)}</textarea>
  <div class="row"><button class="primary" value="ok">${t('save')}</button><button value="del" class="ghost">${t('del')}</button></div>${c.date ? `<div class="row"><a class="btnl" target="_blank" rel="noopener" href="${gcal(c)}">${t('addCal')}</a><button type="button" id="one" class="ghost">${t('dlIcs')}</button></div>` : ''}${c.link && /^https?:/.test(c.link) ? `<div class="row"><a class="btnl" target="_blank" rel="noopener noreferrer" href="${esc(c.link)}">${t('link')} ↗</a></div>` : ''}`;
  if (c.date) { const sn = document.createElement('div'); sn.className = 'row'; sn.innerHTML = `<button type="button" class="ghost" data-sn="1">${t('snooze1')}</button><button type="button" class="ghost" data-sn="7">${t('snooze7')}</button>`; $('#edit').appendChild(sn);
    sn.querySelectorAll('button').forEach(b => b.onclick = () => { const d = new Date(c.date + 'T00:00:00'); d.setDate(d.getDate() + +b.dataset.sn); c.date = ymd(d); save(); render(); $('#dlg').close(); say(c.title + ' ' + c.date); }); }
  if ($('#one')) $('#one').onclick = () => dl('wared-event.ics', 'text/calendar', Wared.toICS([c]));
  const dlg = $('#dlg'); dlg.showModal();
  $('#edit').onsubmit = e => { const v = e.submitter && e.submitter.value;
    if (v === 'del') { const idx = cards.indexOf(c); cards = cards.filter(x => x.id !== id); toast(t('deleted'), () => { cards.splice(idx, 0, c); save(); render(); }); }
    else if (v === 'ok') Object.assign(c, { title: $('#e1').value, date: $('#e2').value || null, time: $('#e3').value || null, column: $('#e4').value, priority: $('#e5').value, notes: $('#e6').value, endTime: $('#e7').value || null, location: $('#e8').value || null, link: $('#e9').value || null });
    save(); render(); };
}
$('#q').oninput = $('#pf').onchange = render;
$('#go').onclick = () => {
  pending = Wared.parseAll($('#src').value).map(p => ({ ...p, id: uid(), keep: p.column !== 'skip' }));
  const pv = $('#preview'); pv.hidden = false;
  if (!pending.length) { pv.innerHTML = `<div class="empty">${t('none')}</div>`; return; }
  pv.innerHTML = pending.map((p, i) => `<label class="pv"><input type="checkbox" data-i="${i}" ${p.keep ? 'checked' : ''}><span class="t"><b>${esc(p.title)}</b><small>${esc(p.from)} · ${t(p.priority)} · ${fmtDate(p)}${p.column === 'skip' ? ' · ' + t('skipped') : ''}</small></span></label>`).join('') + `<div class="row"><button class="primary" id="addAll">${t('add')}</button></div>`;
  pv.querySelectorAll('input').forEach(i => i.onchange = () => pending[+i.dataset.i].keep = i.checked);
  $('#addAll').onclick = () => { let dup = 0; pending.filter(p => p.keep).forEach(p => { if (cards.some(c => c.title.toLowerCase() === p.title.toLowerCase() && c.date === p.date)) { dup++; return; } delete p.keep; delete p.score; delete p.important; if (p.column === 'skip') p.column = 'todo'; cards.push(p); }); if (dup) toast(dup + ' ' + t('dups')); save(); say(pending.filter(p => p.keep !== undefined).length + ' ' + t('found')); pv.hidden = true; $('#src').value = ''; render(); };
};
$('#sample').onclick = () => { $('#src').value = lang === 'ar' ? SAMPLE_AR : SAMPLE; $('#go').click(); };
$('#clear').onclick = () => { if (confirm(lang === 'ar' ? 'مسح كل الكروت؟' : 'Remove all cards?')) { cards = []; save(); render(); } };
$('#lang').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('wared.lang', lang); applyLang(); };
function setView(v) { view = v; if (v === 'cal') { const up = cards.filter(c => c.date && c.date >= ymd(new Date())).sort((x, y) => x.date.localeCompare(y.date))[0]; if (up) calM = new Date(up.date.slice(0, 4), +up.date.slice(5, 7) - 1, 1); renderCal(); } $('#viewBoard').setAttribute('aria-pressed', v === 'board'); $('#viewCal').setAttribute('aria-pressed', v === 'cal'); $('#board').hidden = v !== 'board'; $('#cal').hidden = v !== 'cal'; $('#viewBoard').classList.toggle('on', v === 'board'); $('#viewCal').classList.toggle('on', v === 'cal'); }
$('#viewBoard').onclick = () => setView('board'); $('#viewCal').onclick = () => setView('cal');
function dl(name, type, data) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); }
$('#ics').onclick = () => dl('wared.ics', 'text/calendar', Wared.toICS(cards.filter(c => c.column !== 'done')));
$('#exp').onclick = () => dl('wared.json', 'application/json', JSON.stringify(cards, null, 2));
$('#theme').onclick = () => { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; localStorage.setItem('wared.theme', d); };
$('#imp').onclick = () => $('#impf').click();
$('#impf').onchange = async e => {
  try {
    const data = JSON.parse(await e.target.files[0].text()); if (!Array.isArray(data)) throw 0;
    const ids = new Set(cards.map(c => c.id)); let n = 0;
    data.forEach(x => { if (x && typeof x.title === 'string') { cards.push({ id: ids.has(x.id) || !x.id ? uid() : String(x.id), title: x.title.slice(0, 200), from: String(x.from || ''), priority: ['high', 'medium', 'low'].includes(x.priority) ? x.priority : 'low', column: COLS.includes(x.column) ? x.column : 'todo', date: /^\d{4}-\d{2}-\d{2}$/.test(x.date) ? x.date : null, time: /^\d{2}:\d{2}$/.test(x.time) ? x.time : null, endTime: /^\d{2}:\d{2}$/.test(x.endTime) ? x.endTime : null, notes: String(x.notes || ''), location: x.location ? String(x.location) : null, link: /^https?:\/\//.test(x.link) ? x.link : null, amount: x.amount ? String(x.amount) : null, kind: x.kind || 'task', repeat: ['DAILY','WEEKLY','MONTHLY'].includes(x.repeat) ? x.repeat : null, tag: ['study','bills','health','work'].includes(x.tag) ? x.tag : null }); n++; } });
    save(); render(); toast(n + ' ' + t('imported'));
  } catch (err) { toast(t('badFile')); }
  e.target.value = '';
};
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || $('#dlg').open) return;
  if (e.key === '/') { e.preventDefault(); $('#q').focus(); }
  else if (e.key === 'n') { e.preventDefault(); $('#src').focus(); }
  else if (e.key === 'c') setView(view === 'board' ? 'cal' : 'board');
});
applyLang();
