# Wared (وارد)

Turn important emails into kanban cards and calendar items. Paste emails, Wared finds what matters (deadlines, meetings, invoices, requests), ranks them, drops newsletters, and builds a board plus an `.ics` calendar file you can import anywhere.

**Privacy first.** Everything runs in your browser. Wared never connects to your inbox and uploads nothing. Cards live in localStorage. Export JSON or .ics any time.

- English and Arabic (RTL), including Arabic dates, digits and times
- Drag and drop board: To do, Scheduled, Waiting, Done
- Dates like `3 December 2026`, `Dec 3`, `tomorrow`, `Monday`, `in 3 days`, `5 pm`, `10:30`
- Priority from keywords, noise filter, review step before anything is added
- Calendar list and `.ics` export (Google, Apple, Outlook)

## Honest limits
It uses rules, not an AI model, so unusual phrasing can be missed. You review and edit every card. Automatic inbox sync is not built: that needs an OAuth app and your explicit consent, and is on the roadmap as an opt-in Gmail add-on.

## Run
Open `docs/index.html`. Tests: `node test/parser.test.js`. MIT license.
