// Wared parser: runs fully in the browser. No network, no inbox access.
(function (root) {
  const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11,
    january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
  const AR_MONTHS = {'يناير':0,'فبراير':1,'مارس':2,'أبريل':3,'ابريل':3,'مايو':4,'يونيو':5,'يوليو':6,'أغسطس':7,'اغسطس':7,'سبتمبر':8,'أكتوبر':9,'اكتوبر':9,'نوفمبر':10,'ديسمبر':11};
  const DAYS = { sun:0,mon:1,tue:2,tues:2,wed:3,thu:4,thur:4,thurs:4,fri:5,sat:6,
    sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6 };
  const AR_DAYS = { 'الأحد':0,'الاثنين':1,'الإثنين':1,'الثلاثاء':2,'الأربعاء':3,'الخميس':4,'الجمعة':5,'السبت':6 };
  const HIGH = /\b(urgent|asap|deadline|due|overdue|action required|final notice|immediately|reminder|invoice|payment|interview|offer|exam|submit|confirm|rsvp)\b|عاجل|مطلوب|موعد نهائي|تسليم|فاتورة|دفع|مقابلة|امتحان|تأكيد/i;
  const MEET = /\b(meeting|call|interview|appointment|webinar|zoom|meet|session|lecture|exam|demo)\b|اجتماع|مقابلة|موعد|محاضرة|امتحان|مكالمة/i;
  const WAIT = /\b(waiting for|awaiting|pending|will get back|follow up)\b|بانتظار|في انتظار/i;
  const NOISE = /\b(unsubscribe|newsletter|promotion|% off|sale ends|no-?reply)\b|عرض خاص|خصم/i;

  const toEn = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  function splitEmails(text) {
    text = text.replace(/\r/g, '').trim();
    if (!text) return [];
    let parts = text.split(/\n\s*(?:-{3,}|={3,}|_{3,})\s*\n/);
    if (parts.length === 1) {
      const lines = text.split('\n'); const out = []; let cur = []; let sawSubject = false, prev = '';
      lines.forEach(l => {
        if (/^(?:From|من)\s*:/i.test(l) && sawSubject && !/forwarded message|original message|رسالة محولة/i.test(prev)) { out.push(cur.join('\n')); cur = []; sawSubject = false; }
        if (/^(?:Subject|الموضوع)\s*:/i.test(l)) sawSubject = true;
        cur.push(l); if (l.trim()) prev = l;
      });
      out.push(cur.join('\n'));
      if (out.length > 1) parts = out;
    }
    return parts.map(p => p.trim()).filter(Boolean);
  }

  function header(block, names) {
    const m = block.match(new RegExp('^(?:' + names + ')\\s*:\\s*(.+)$', 'im'));
    return m ? m[1].trim() : '';
  }

  function findTime(t) {
    t = toEn(t);
    const rg = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|until|till)\s*\d{1,2}(?::\d{2})?\s*(am|pm)\b/i);
    if (rg) { let h = +rg[1] % 12; if (/p/i.test(rg[3] || rg[4])) h += 12; return { h, min: +(rg[2] || 0) }; }
    let m = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i);
    if (m) { let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12; return { h, min: +(m[2] || 0) }; }
    m = t.match(/(?:الساعة\s*)?(\d{1,2})(?::(\d{2}))?\s*(مساء|مساءً|م|ظهرا|ظهراً|صباحا|صباحاً|ص)(?![\u0600-\u06FF])/) || t.match(/الساعة\s*(\d{1,2})(?::(\d{2}))?()/);
    if (m) { let h = +m[1]; const ap = m[3] || ''; if (/^(مساء|مساءً|م)$/.test(ap) && h < 12) h += 12; else if (/^(ظهرا|ظهراً)$/.test(ap) && h < 6) h += 12; else if (/^(صباحا|صباحاً|ص)$/.test(ap) && h === 12) h = 0; return { h, min: +(m[2] || 0) }; }
    m = t.match(/\b(?:at|@|الساعة)\s*(\d{1,2}):(\d{2})\b/i) || t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (m) return { h: +m[1], min: +m[2] };
    return null;
  }

  function findDate(t, now) {
    t = toEn(t);
    let m = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = t.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2}|\d{2})\b/);
    if (m) { let y = +m[3]; if (y < 100) y += 2000; return new Date(y, +m[2] - 1, +m[1]); }
    m = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b(?:,?\s+(20\d{2}))?/i);
    let mo, dd, yy;
    if (m) { dd = +m[1]; mo = MONTHS[m[2].toLowerCase()]; yy = m[3] ? +m[3] : null; }
    else {
      m = t.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s+(20\d{2}))?/i);
      if (m) { mo = MONTHS[m[1].toLowerCase()]; dd = +m[2]; yy = m[3] ? +m[3] : null; }
    }
    if (mo !== undefined) {
      let y = yy || now.getFullYear(); let d = new Date(y, mo, dd);
      if (!yy && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)) d = new Date(y + 1, mo, dd);
      return d;
    }
    for (const k in AR_MONTHS) { const r = t.match(new RegExp('(\\d{1,2})\\s*' + k)); if (r) { let d = new Date(now.getFullYear(), AR_MONTHS[k], +r[1]); if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)) d = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()); return d; } }
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (/\bend of (the )?month\b|آخر الشهر|نهاية الشهر/i.test(t)) return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (/\bnext week\b|الأسبوع القادم|الاسبوع الجاي/i.test(t)) { base.setDate(base.getDate() + 7); return base; }
    if (/بعد بكرة|بعد غد/.test(t)) { base.setDate(base.getDate() + 2); return base; }
    if (/\beod\b|\bend of (the )?day\b/i.test(t)) return base;
    if (/\b(today|tonight)\b|اليوم/i.test(t)) return base;
    if (/\btomorrow\b|بكرة|غدا|غداً/i.test(t)) { base.setDate(base.getDate() + 1); return base; }
    m = t.match(/\b(?:next\s+|this\s+|on\s+|by\s+)?(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i);
    let wd = m ? DAYS[m[1].toLowerCase()] : undefined;
    if (wd === undefined) for (const k in AR_DAYS) if (t.includes(k)) { wd = AR_DAYS[k]; break; }
    if (wd !== undefined) {
      let diff = (wd - base.getDay() + 7) % 7; if (diff === 0) diff = 7;
      base.setDate(base.getDate() + diff); return base;
    }
    m = t.match(/\bin\s+(\d+)\s+weeks?\b/i) || t.match(/بعد\s*(\d+)\s*(?:اسابيع|أسابيع|اسبوع|أسبوع)/);
    if (m) { base.setDate(base.getDate() + 7 * +m[1]); return base; }
    m = t.match(/بعد\s*(\d+)\s*(?:ايام|أيام|يوم)/);
    if (m) { base.setDate(base.getDate() + +m[1]); return base; }
    m = t.match(/\bthe\s+(\d{1,2})(?:st|nd|rd|th)\b/i);
    if (m && +m[1] >= 1 && +m[1] <= 31) { let d = new Date(now.getFullYear(), now.getMonth(), +m[1]); if (d < base) d = new Date(now.getFullYear(), now.getMonth() + 1, +m[1]); return d; }
    m = t.match(/\bin\s+(\d+)\s+days?\b/i);
    if (m) { base.setDate(base.getDate() + +m[1]); return base; }
    return null;
  }

  function actionLines(body) {
    const lines = body.split('\n').map(l => l.trim()).filter(l => l && !/^(from|to|cc|date|subject|من|إلى|الموضوع)\s*:/i.test(l));
    const verbs = /\b(please|submit|send|review|confirm|reply|pay|attend|complete|sign|bring|prepare|register|schedule|join|call|finish|upload|fill)\b|يرجى|من فضلك|ارسل|أرسل|راجع|أكد|ادفع|سلم|سلّم/i;
    return lines.filter(l => verbs.test(l)).slice(0, 3);
  }

  function stripQuoted(block) {
    const cut = block.search(/^\s*(?:-{2,}\s*Original Message\s*-{2,}|On .{5,80} wrote:|في .{5,60} كتب.*:)\s*$/im);
    if (cut > 0) block = block.slice(0, cut);
    return block.split('\n').filter(l => !/^\s*>/.test(l)).join('\n');
  }
  function headerDate(block) {
    const v = header(block, 'Date|Sent|التاريخ'); if (!v) return null;
    const d = new Date(v); return isNaN(d) ? null : d;
  }
  function extras(all) {
    const link = (all.match(/https?:\/\/(?:[\w.-]*(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com|webex\.com)[^\s)>\]]*)/i) || [])[0] || null;
    const loc = (toEn(all).match(/(?:location|venue|room|المكان|القاعة|قاعة)\s*:?\s*([^\n.,;]{2,40})/i) || [])[1];
    const amt = (toEn(all).match(/(?:\$|USD|EGP|EUR|£|€)\s?\d[\d,]*(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?(?:USD|EGP|EUR|جنيه|ج\.م)/i) || [])[0] || null;
    return { link, location: loc ? loc.trim() : null, amount: amt };
  }
  function findEnd(t) {
    t = toEn(t);
    const m = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|until|till)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (!m) return null;
    let h = +m[4] % 12; if (/p/i.test(m[6])) h += 12; return { h, min: +(m[5] || 0) };
  }
  const TAGS = [['study', /\b(exam|assignment|lecture|course|professor|semester|homework|grade|university|campus)\b|امتحان|محاضرة|مادة|جامعة|دكتور|تسليم/i],
    ['bills', /\b(invoice|payment|bill|receipt|subscription|rent|tax)\b|فاتورة|دفع|إيجار|ايجار|اشتراك/i],
    ['health', /\b(doctor|clinic|appointment|prescription|lab|hospital)\b|دكتور|عيادة|تحليل|مستشفى/i],
    ['work', /\b(meeting|project|client|sprint|report|deadline|manager|team)\b|اجتماع|مشروع|عميل|تقرير|فريق/i]];
  function findTag(all) { for (const [k, r] of TAGS) if (r.test(all)) return k; return null; }
  function findRepeat(all) {
    if (/\bevery\s+(day|morning|night)\b|\bdaily\b|كل يوم|يوميا|يومياً/i.test(all)) return 'DAILY';
    if (/\bevery\s+(week|mon|tue|wed|thu|fri|sat|sun)|\bweekly\b|كل أسبوع|كل اسبوع|أسبوعيا|اسبوعيا|كل (?:يوم )?(?:الأحد|الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت)/i.test(all)) return 'WEEKLY';
    if (/\bevery\s+month\b|\bmonthly\b|كل شهر|شهريا|شهرياً/i.test(all)) return 'MONTHLY';
    return null;
  }
  function parseEmail(block, now) {
    block = stripQuoted(block);
    now = headerDate(block) || now || new Date();
    const subject = header(block, 'Subject|الموضوع') || block.split('\n').find(l => l.trim() && !/^(from|to|date|من)\s*:/i.test(l)) || 'Untitled';
    const from = header(block, 'From|من');
    const body = block.replace(/^(subject|from|to|cc|date|sent|الموضوع|من|إلى)\s*:.*$/gim, '').trim();
    const all = subject + '\n' + body;
    let score = 0; const why = [];
    if (HIGH.test(all)) { score += 2; why.push('keyword'); }
    if (MEET.test(all)) { score += 1; why.push('meeting'); }
    const date = findDate(all, now);
    if (date) { score += 1; why.push('date'); }
    if (NOISE.test(all)) { score -= 3; why.push('noise'); }
    const kind = MEET.test(all) && date ? 'event' : WAIT.test(all) ? 'waiting' : 'task';
    const tm = findTime(all);
    let priority = 'low';
    if (score >= 3) priority = 'high'; else if (score >= 1) priority = 'medium';
    let column = score <= -1 ? 'skip' : kind === 'waiting' ? 'waiting' : kind === 'event' ? 'scheduled' : 'todo';
    const actions = actionLines(body);
    return {
      title: subject.replace(/^(re|fwd?)\s*:\s*/i, '').slice(0, 120),
      from, fromName: (from.replace(/<[^>]*>/g, '').replace(/["']/g, '').trim() || from), kind, priority, column, score,
      date: date ? ymd(date) : null,
      time: tm ? pad(tm.h) + ':' + pad(tm.min) : null,
      why,
      tag: findTag(all),
      repeat: findRepeat(all),
      notes: actions.join('\n'),
      endTime: (e => e ? pad(e.h) + ':' + pad(e.min) : null)(findEnd(all)),
      ...extras(all),
      important: score >= 1
    };
  }

  function parseAll(text, now) { return splitEmails(text).map(b => parseEmail(b, now)); }

  function icsEscape(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function toICS(cards, now, opts) {
    const rem = (opts && opts.reminder !== undefined) ? opts.reminder : 30;
    now = now || new Date();
    const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wared//EN', 'CALSCALE:GREGORIAN'];
    cards.filter(c => c.date).forEach(c => {
      const d = c.date.replace(/-/g, '');
      out.push('BEGIN:VEVENT', 'UID:' + c.id + '@wared.local', 'DTSTAMP:' + stamp);
      if (c.time) {
        const [h, m] = c.time.split(':').map(Number); const [eh, em] = c.endTime ? c.endTime.split(':').map(Number) : [(h + 1) % 24, m];
        out.push('DTSTART:' + d + 'T' + pad(h) + pad(m) + '00', 'DTEND:' + d + 'T' + pad(eh) + pad(em) + '00');
      } else {
        const nx = new Date(c.date + 'T00:00:00'); nx.setDate(nx.getDate() + 1);
        out.push('DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + ymd(nx).replace(/-/g, ''));
      }
      if (c.repeat) out.push('RRULE:FREQ=' + c.repeat);
      if (c.location) out.push('LOCATION:' + icsEscape(c.location));
      if (rem > 0) out.push('BEGIN:VALARM', 'TRIGGER:-PT' + rem + 'M', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(c.title), 'END:VALARM');
      out.push('SUMMARY:' + icsEscape(c.title), 'DESCRIPTION:' + icsEscape((c.from ? 'From: ' + c.from + '\n' : '') + (c.link ? 'Link: ' + c.link + '\n' : '') + (c.notes || '')), 'END:VEVENT');
    });
    out.push('END:VCALENDAR');
    const fold = l => { if (l.length <= 73) return l; const parts = []; let r = l; parts.push(r.slice(0, 73)); r = r.slice(73); while (r.length) { parts.push(' ' + r.slice(0, 72)); r = r.slice(72); } return parts.join('\r\n'); };
    return out.map(fold).join('\r\n') + '\r\n';
  }

  const api = { splitEmails, parseEmail, parseAll, toICS, findDate, findTime };
  if (typeof module !== 'undefined') module.exports = api; else root.Wared = api;
})(typeof window !== 'undefined' ? window : globalThis);
