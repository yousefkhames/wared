const assert = require('assert'); const P = require('../docs/parser.js');
const now = new Date(2026, 10, 26); // Thu 26 Nov 2026
const s = `From: dean@uni.edu
Subject: Exam registration deadline
Please confirm your registration by 3 December 2026 at 5 pm.
---
From: shop@deals.com
Subject: 50% off sale ends tonight
Unsubscribe here
---
From: boss@work.com
Subject: Team meeting
Meeting on Monday at 10:30 in room 4.`;
const r = P.parseAll(s, now);
assert.strictEqual(r.length, 3);
assert.strictEqual(r[0].date, '2026-12-03'); assert.strictEqual(r[0].time, '17:00'); assert.strictEqual(r[0].priority, 'high');
assert.strictEqual(r[1].column, 'skip');
assert.strictEqual(r[2].kind, 'event'); assert.strictEqual(r[2].date, '2026-11-30'); assert.strictEqual(r[2].time, '10:30');
const ar = P.parseEmail('الموضوع: اجتماع الفريق\nاجتماع يوم الخميس الساعة ٣ مساء', now);
assert.strictEqual(ar.kind, 'event'); assert.strictEqual(ar.time, '15:00');
const ics = P.toICS(r.filter(x => x.date).map((x, i) => ({ ...x, id: 'c' + i })), now);
assert(ics.includes('BEGIN:VEVENT') && ics.includes('DTSTART:20261203T170000'));
const r2 = P.parseEmail('Date: Mon, 7 Dec 2026 09:00:00\nSubject: Call\nCall tomorrow from 2 to 3 pm. Join https://zoom.us/j/123 Location: Room 5\n\nOn Sun, someone wrote:\n> old stuff 1 Jan', now);
assert.strictEqual(r2.date, '2026-12-08'); assert.strictEqual(r2.time, '14:00'); assert.strictEqual(r2.endTime, '15:00');
assert(r2.link.includes('zoom.us')); assert.strictEqual(r2.location, 'Room 5');
assert.strictEqual(P.findDate('بحلول ١٠ ديسمبر', now).getDate(), 10);
assert.strictEqual(P.findDate('end of month', now).getDate(), 30);
const r3 = P.parseEmail('Subject: Invoice\nPlease pay EGP 1,500 by 15 Dec 2026. Also see https://meet.google.com/abc-defg', now);
assert.strictEqual(r3.date, '2026-12-15'); assert(r3.amount.includes('1,500')); assert(r3.link.includes('meet.google.com'));
const ar2 = P.parseEmail('الموضوع: فاتورة\nيرجى دفع ١٥٠٠ جنيه قبل ١٥ ديسمبر', now);
assert.strictEqual(ar2.date, '2026-12-15');
assert.strictEqual(P.parseEmail('Subject: Hello\nJust saying hi', now).priority, 'low');
assert.deepStrictEqual(P.findTime('اجتماع الساعة ٣:٣٠ م'), { h: 15, min: 30 });
assert.deepStrictEqual(P.findTime('الساعة ١٠ صباحا'), { h: 10, min: 0 });
assert.deepStrictEqual(P.findTime('الساعة ٢ ظهرا'), { h: 14, min: 0 });
assert.strictEqual(P.parseEmail('From: "Dr. Mona" <mona@x.edu>\nSubject: Hi\nbody', now).fromName, 'Dr. Mona');
const longIcs = P.toICS([{ id: 'x', title: 'A'.repeat(200), date: '2026-12-01', from: '', notes: '' }], now);
assert(longIcs.split('\r\n').every(l => l.length <= 75)); assert(longIcs.endsWith('\r\n'));
assert.strictEqual(P.findDate('due in 2 weeks', now).getDate(), 10);
assert.strictEqual(P.findDate('بعد ٣ ايام', now).getDate(), 29);
assert.strictEqual(P.findDate('payment on the 5th', now).getMonth(), 11);
const outlook = `From: A <a@x.com>
Sent: Monday, December 7, 2026 9:00 AM
Subject: First
Please submit tomorrow.
From: B <b@x.com>
Sent: Monday, December 7, 2026 10:00 AM
Subject: Second
Meeting Friday at 4 pm.`;
const o = P.parseAll(outlook, now); assert.strictEqual(o.length, 2); assert.strictEqual(o[0].date, '2026-12-08');
const fwd = P.parseAll('From: me@x.com\nSubject: Fwd: Deadline\n---------- Forwarded message ---------\nFrom: boss@x.com\nSubject: Deadline\nSubmit by 12 Dec 2026', now);
assert.strictEqual(fwd.length, 1);
assert.strictEqual(P.parseEmail('Subject: Invoice\npay the bill', now).tag, 'bills');
assert.strictEqual(P.parseEmail('الموضوع: امتحان\nامتحان الغد', now).tag, 'study');
assert.strictEqual(P.parseEmail('Subject: Standup\nStandup every Monday at 9:00', now).repeat, 'WEEKLY');
assert.strictEqual(P.parseEmail('الموضوع: اجتماع\nاجتماع كل أسبوع', now).repeat, 'WEEKLY');
assert(P.toICS([{ id: 'r', title: 'S', date: '2026-12-07', repeat: 'WEEKLY', from: '', notes: '' }], now).includes('RRULE:FREQ=WEEKLY'));
console.log('all tests passed');
