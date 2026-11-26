# Wared (وارد)

Turn important emails into kanban cards and calendar items. Paste emails, Wared finds what matters (deadlines, meetings, invoices, requests), ranks them, drops newsletters, and builds a board plus an `.ics` calendar file you can import anywhere.

**Privacy first.** Everything runs in your browser. Wared never connects to your inbox and uploads nothing. Cards live in localStorage. Export JSON or .ics any time.

- English and Arabic (RTL), including Arabic dates, digits and times
- Drag and drop board: To do, Scheduled, Waiting, Done
- Dates like `3 December 2026`, `Dec 3`, `tomorrow`, `Monday`, `in 3 days`, `5 pm`, `10:30`
- Priority from keywords, noise filter, review step before anything is added
- Calendar list and `.ics` export (Google, Apple, Outlook)

## Improvement log (10 rounds)
1. Parser: Arabic months and relative dates, email Date header as reference, time ranges, links, location, amounts, quoted replies stripped, calendar alarms
2. Accessibility: skip link, labels, focus rings, live announcements, keyboard cards, contrast, reduced motion
3. Mobile: snap-scroll columns, large touch targets, move buttons
4. Design: dark mode, gradient header, shadows, empty state, Arabic font stack
5. Search, priority filter, open/overdue stats, undo delete
6. Month-grid calendar with RTL week start
7. Richer cards, per-card .ics and Google Calendar link
8. Installable offline PWA, safe JSON import
9. Onboarding steps, privacy note, share metadata, Arabic sample
10. QA pass in a real browser, hidden-view bug fixed, more tests

## Honest limits
It uses rules, not an AI model, so unusual phrasing can be missed. You review and edit every card. Automatic inbox sync is not built: that needs an OAuth app and your explicit consent, and is on the roadmap as an opt-in Gmail add-on.

## Run
Open `docs/index.html`. Tests: `node test/parser.test.js`. MIT license.

## Research notes (existing tools surveyed)
- page2task (iamsherryshen), NavinColumbia/emailToTaskDev, Kambrian/ai-mail-to-calendar, tonimelisma/email-to-calendar, Email_Task_Agent: mostly AI-based or need Gmail/Thunderbird access and API keys.
- mail2task (EbyJK), EmailManager (rule-based spaCy): Python, rule-based extraction and priority, server side.
- chrono-node: the standard JS date parser, English-centric, so Wared ships its own small parser to handle Arabic dates and digits with zero dependencies.
Gap Wared fills: free, no account, no mailbox access, bilingual Arabic/English, paste-and-review with a kanban board and .ics export. Borrowed ideas: review-before-add (from the AI tools, to avoid wrong auto-created events) and rule-based priority scoring (from mail2task/EmailManager).
