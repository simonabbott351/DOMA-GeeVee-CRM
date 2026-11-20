# Contributing

1. Edit the file for the area (see README layout). New features go in a new `js/cw-p-<name>.js` plus `css/cw-<name>.css`, added to `index.html` after the last layer and before `js/start.js`.
2. `npm run check` before every commit: every script must parse, no en or em dashes.
3. `node tests/crawl.js index.html` must report every page ok. Run `tests/axe.js` and `tests/mobile.js` when you touch layout.
4. `npm run bundle` to refresh the single-file demo when you need to send it to someone.
5. Keep the writing rules: short sentences, no filler, the terminology in the README.
