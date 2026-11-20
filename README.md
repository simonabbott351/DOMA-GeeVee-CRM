# DOMA V2 with GeeVee

AI-first real estate CRM prototype for Collings Real Estate. GeeVee listens to the agent's calls and does what follows: booking, drafting, filing, chasing, reporting. The agent approves anything that leaves DOMA with a tap. Victorian law (sale authorities, the Property Price Statement, vendor ID, auctions, the Residential Tenancies Act) and the approval tiers are built into every flow.

This is a working prototype in plain HTML, CSS and JavaScript. No framework, no build step to run it. Nothing is sent, signed or published; every outward action is simulated and marked as such.

## Run it

- Open `index.html` in Chrome, or
- `npm run serve` and open http://127.0.0.1:5500/ (live reload), or
- `npm run bundle` to produce the single-file demo `dist/DOMA_GeeVee_CRM.html`, which runs from anywhere, including email and USB.

State lives in `localStorage` under `doma-v2-phase2-integrated-v2`. "Reset for demo" on the Demo guide page loads the curated demo data.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The shell and the load order. |
| `css/base.css` | Styles of the base app. |
| `css/cw*.css` | Styles of each layer (`cw.css` first, then alphabetical). |
| `data/seed.js` | The shared record every page works on (people, deals, messages, tasks, GeeVee actions). |
| `data/legacy.js` | The 49 old CRM pages, compressed, shown read-only under Full CRM. Generated. |
| `data/specs.json` | The 168 screens of the current CRM with their routes and groups. |
| `js/app.js` | The base app: state, Today, Messages, calls, approvals, GeeVee chat, dialogs, routing. |
| `js/cw-core.js` | The CRM page framework: `cwPage` routes, `cwOn` actions, `cwModalDef` dialogs, tables, forms. |
| `js/cw-data.js`, `cw-data2.js` | Extends the record with CRM fields and richer dated sample data. |
| `js/cw-p-*.js` | One layer per area or feature, loaded in the order `index.html` lists. Later layers extend or replace earlier functions by name. |
| `js/start.js` | The first render. |
| `tools/` | `bundle.js` (one-file build), `check.js` (syntax and dash check). |
| `tests/` | Headless browser checks. See `tests/README.md`. |
| `docs/` | The architecture brief and notes for contributors. |

## How the layers work

Every file is a classic script sharing one global scope, in the order `index.html` lists them. A layer never edits an earlier file. It wraps:

```js
{const prev=today;today=function(){let html=prev(); /* change html */ return html}}
cwOn('myAction',id=>{ /* a new button handler */ });
cwPage('/my-page',{title:'My page',group:'perf',render(ctx){return cwHeader('My page','...')},ai(){return[]}});
cwModalDef('myDialog',id=>({title:'...',body:'...',foot:cwBtn('Close','close')}));
```

Anything that touches `state.cw` at load time must run inside a `render` wrapper, because `state.cw` is created by `cwEnsure()` on the first render.

## Rules of the house

- No en or em dashes anywhere in code or copy (`npm run check` refuses them). Use a comma, a colon or a full stop.
- Direct words. "Property Price Statement", never "Statement of Information". The database is owners and buyers, never "registered buyers".
- Approval tiers: A1 routine (done for you, logged), A2 waits for your tap, A3 protected (second look). A new seller lead is always a call. Nothing leaves DOMA without a tap.
- Every outward action is marked as simulated in the prototype.

## Demo

The Demo guide (`#/demo`) walks a presenter through 22 steps with an amber ring on the next click. `#/start` is the five-chapter story with a watch mode and voiceover. `#/script` is the printable narration. `#/ceo-brief` is a one-page summary.
