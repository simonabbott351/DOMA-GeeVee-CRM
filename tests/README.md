# Tests

Headless browser checks used while the prototype was built. They need Node 18+, `npm i puppeteer-core axe-core` and Google Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` (edit the path at the top of each file for another machine).

Most take the page to test as the first argument: the single-file bundle (`dist/DOMA_GeeVee_CRM.html`) or `index.html`. Some take a folder for screenshots as the second.

| Script | What it checks |
|---|---|
| crawl.js | opens every route, reports console errors, missing pages and error notes; `--click` presses every safe button |
| action-audit.js | every `data-action` a button can carry has a handler |
| axe.js | accessibility (axe-core) on every page; `--modals` opens dialogs too; `--only /a,/b` |
| mobile.js | 390 px width: horizontal overflow, elements covered by the GeeVee bar, dialogs |
| phone-shots.js | 390 px screenshots of every main page for a visual pass |
| kbd.js | focus order and Escape in dialogs, keyboard shortcuts on Today |
| walk-test.js, jump-test.js | the demo guide: every step by following the amber ring; Take me there on each step |
| story-test.js, vo-controls.js | the five-chapter story in watch mode; voiceover controls |
| trust-test.js, pushback-test.js, ops-test.js | preview and edit, push back, audit, offers, money, roles, rentals |
| e2e-*.js | the listing journey, the demo kit, growth, listing wizard, manual forms |
