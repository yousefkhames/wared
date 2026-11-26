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
console.log('all tests passed');
