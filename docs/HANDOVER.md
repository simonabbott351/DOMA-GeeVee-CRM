# DOMA with GeeVee: developer handover pack

Nov 25, 2026 · @Simon

## What you are building

DOMA is the CRM Collings Real Estate's agents will live in, and GeeVee is the assistant inside it. The prototype in the repo is the specification: every screen, rule, draft and outcome you need to match is in it, and the training videos show an agent's day end to end. Build the behaviour, not the pixels.

The product in one paragraph. An agent opens Today and sees a queue of cards in the order GeeVee recommends: offers first, then seller leads on the 24-hour clock, then approvals, replies and the rest. Each card is a decision. GeeVee has already done the preparation: it drafted the reply, filled the authority, picked the comparable sales, booked the travel time. The agent reads, taps, and the card disappears. Nothing leaves DOMA (a text, an email, a signing request, a listing) without that tap. Behind the queue sit the records: people, properties (called deals), messages, tasks, offers, open homes, documents, money and rentals.

How to read this pack. Sections 3 to 8 describe behaviour and are the contract. Section 9 says what GeeVee does on its own and what it waits for. Section 10 is the data model you will need to design properly; the prototype's JSON is a sketch of it. Section 11 lists the real systems the prototype fakes. Section 12 is the Victorian law the product must obey, verified on 24 November 2026. Sections 15 and 16 are how to run and test the prototype. Section 17 is what the product owner still has to decide.

Where things are. Repository: github.com/simonabbott351/DOMA-GeeVee-CRM (private). Run it by opening index.html, or build the single file with the bundle script. The audit of 24 November 2026 (docs/AUDIT-2026-11-24.md) lists what was found and fixed and what was deliberately left for you.

Vocabulary you must use. The document that accompanies a listing is the Property Price Statement, never Statement of Information. The marketing database is owners and buyers, never registered buyers. The three approval tiers are written as words: routine, waits for your tap, protected second look. Tenants are renters and landlords are rental providers in anything a renter sees.

## Scope of the first build

Build the agent's day first: Today, the listing journey, the sale journey, messages and approvals, the property and contact records, and the office view. Everything in the table below marked first build is in scope. The prototype also contains rentals, prospecting, campaigns, a public portal, a demo guide and a training story; those are later phases unless the product owner says otherwise.

| Area | Prototype has it | First build | Notes |
| --- | --- | --- | --- |
| Today queue, cards, approvals, push back, undo | Yes | Yes | Section 4 |
| Listing journey: lead, call, appraisal, pack, proposal, authority, photos, go-live | Yes | Yes | Section 5 |
| Sale journey: enquiries, open homes, offers, contract, sold, settlement, trust money | Yes | Yes | Section 6 |
| Messages: triage, drafts, auto-answers, call-only seller rule | Yes | Yes | Section 7 |
| Contacts and properties with activity, notes, documents, compliance | Yes | Yes | Section 10 |
| Office page, audit trail, commission, forecast, KPIs, leaderboard | Yes | Office, audit, commission | KPIs, leaderboard and analytics can follow |
| Roles: agent, principal, assistant | Yes | Yes | Section 13 |
| eSign (authority, contract, offer form, lease) | Simulated | Yes, with a real provider | Section 11 |
| Rentals (rent roll, arrears, renewals, inspections, jobs, applications, leases) | Yes | Phase 2 | Legal wording verified, flows audited |
| Prospecting, database, campaigns, market updates | Yes | Phase 2 | Spam Act rules apply from day one |
| Public pages (listing page, portal, signing pages) | Yes | Signing pages only | Portal later |
| GeeVee bar (typed and spoken requests) | Regex stand-in | Yes, with a language model | Section 9 |
| Demo guide, story, training films | Yes | No | Training material, not product |
| The 168 rebuilt pages of the old CRM | Yes | Only where a journey needs them | Most are reached from More tools; treat as reference for fields and tables |

How to use the prototype. Open it beside the ticket you are working on. Click through the journey, read the card text, the preview, the audit row and the record afterwards. Where this pack and the prototype disagree, the prototype is right for behaviour and this pack is right for rules and data. Where both are silent, ask (section 17).

What not to copy. The visual design is a working prototype's. A designer pass on eight screens (Today, call review, approval with preview, property page with the journey strip, open home session, Messages, Office, phone Today) is planned; build from a component library and design tokens, not from the prototype's CSS. Do not copy the demo data, the fictional comparables, the simulated sends, or localStorage persistence.

## Rules of the house

These are product decisions already made. Every screen, job and prompt must obey them. If a design choice would break one, stop and ask.

1. Nothing leaves DOMA without a tap. A text, an email, a letter, a signing request, a listing publish, a campaign send or a portal reply is an approval on Today first. GeeVee prepares; the agent taps.
2. Three tiers, written as words.
   - A1 routine, done for you: internal records, calendar entries, documents filed, tasks, travel time, audit rows. Applied at once, with Undo on a "What I did" card.
   - A2 waits for your tap: replies, confirmations, follow-ups, reports, texts, routine emails.
   - A3 protected, second look: anything with a price, a fee, a contract, an authority, a lease, a publish, an offer presented to a vendor, a proposal. Approval needs a second confirmation and is logged as such. Every path that approves an A3 item (Today, the preview, the bell, batch) shows the second look.
3. New seller leads are always a call from the agent. GeeVee drafts and sends nothing to a new seller lead. A typed instruction to GeeVee does not count as the call. The 24-hour rule: call within 24 hours, reminder at 20 hours, escalation to the principal at 24 hours, and the lead sits right after offers on Today until it is called.
4. Opted-out and do-not-contact people never get marketing. Every marketing message identifies the sender and carries an unsubscribe line (Spam Act). A rental applicant has no marketing permission until they give it.
5. Vendor matters, price, offers and negotiation always wait for the agent. GeeVee never accepts, declines or counters an offer; it records the vendor's instruction after the agent takes it.
6. GeeVee answers an enquiry on its own only when it can answer completely from verified records (for example the next open home time from the open home record). The answer is written into the conversation, the enquiry is marked answered, and the agent can see every automatic answer and switch the behaviour off.
7. What GeeVee did is always visible: a "What I did" card after every automatic run with Undo, and an audit trail that records who tapped, under which role, with the words at the time. Undo never deletes trail rows.
8. One source of truth per fact. One commission formula, one enquiry count, one draft per message, one snooze mechanism, one open home attendee list. If a number appears on two screens it comes from one function.
9. Say each thing once on screen. A card header carries the kind, the person or property and the urgency; the open card does not repeat them. No prototype disclaimers in the product.
10. Victorian law and terms as in section 12. Property Price Statement, three comparable sales, price range at most 10 percent wide and never below the estimate, reserve published 7 days before an auction, sold price published within 7 days of unconditional, vendor ID sighted before go-live, no bidder registration claim.
11. Plain, direct text. No em dashes or en dashes anywhere in the UI. No filler. Names keep their capitals.

## Today

Today is one queue. The header shows the size of the day counted from the queue itself (calls, approvals, offers, other). Five cards show by default; "View full queue" shows 25 at a time with "Show next 25". The right-hand column holds the diary, the money plan, owners worth a call, delegated work, vendor reports due and the office box for a principal.

Queue order, top to bottom:

1. Written offers awaiting a decision.
2. Record conflicts GeeVee blocked (a contact and property that do not match).
3. Seller leads on the 24-hour clock: new seller leads, escalated calls, listing opportunities for new-lead deals.
4. Protected approvals (A3).
5. Messages GeeVee classified as call-only (seller conversations).
6. Urgent messages.
7. Other approvals, replies and appraisal packs.
8. Other calls, reminders, listing rescues, engaged buyers, buyer matches.

Within a band, the item's own score and age decide. A pinned item goes first. Pushed-back items are hidden until their time and return at the top labelled "Back as asked". Acknowledgements ("thanks", "see you then", "5 works") are not cards; they are marked read and leave the queue. Withdrawn drafts (status starts with Withdrawn) never show; drafts the agent asked for carry an exempt flag and always show.

Card anatomy. Header: rank number, a kind badge (Offer urgent, Protected review, Approval, Seller enquiry, channel, Appraisal ready, Record conflict, Listing rescue, Buyer interest, Reminder), NEXT on the first card, the title, and a one-line excerpt that hides when the card is open. Title rules: an offer is "address · New offer"; an A3 action is named by what it is (Lease, Contract of Sale, Offer form, Authority, Go live, Offer, Neighbours, Campaign, Proposal) plus the person or property; a message is the person's name; an appraisal pack is the address. The open card shows the context (their message, the signing request, the offer facts), GeeVee's draft or suggestion, one primary action, secondary actions, a More menu (Ignore, Tomorrow, open the original), the push-back row (Push back an hour, Later today, Tomorrow), and "Why this?" which explains the ranking. Nothing in the open card repeats the header.

Approvals. Approve and send records the approval, writes the sent message into the conversation, marks the enquiry replied, writes an activity line on the property and the contact, and audits who tapped. Edit the words opens the exact text that will go; the edited text is what is sent. Preview shows the message as the recipient will see it (email with From, To, Subject, body and attachments; text with the STOP line check; a document with its pages and signers). Reject records the reason-free rejection and returns to Today. A3 items require the second look on every path. Batch approval ("Approve all N") groups A2 items of one type and template and covers visible drafts only.

Push back and undo. Push back an hour hides the card for an hour; Later today returns it at 3 pm or 5 pm; Tomorrow returns it at 8:30 am. The pushed-back list sits in the right column with "Now" and "Bring all back". Undo last restores the last demo decision for a minute and keeps the audit trail.

The GeeVee bar. At the bottom of every page, typed or spoken. It handles the day (what is on, who has not been called, overdue), calls, notes, reminders, tasks, texts and emails (drafted for approval, never sent), appraisal bookings, inspections, stage moves, offers (record, best and final, present, the vendor's decision), reports, settlement dates, money and navigation. A question never changes a record. A request it cannot do is answered with what it can do instead. Section 9 covers production.

## The listing journey

One property moves through these stages: New lead, Connected, Appraisal, Proposal, Authority, Listed (off market), For sale (on market), Sold, Settled, or Lost. The property page shows a journey strip with the step buttons and ticks (Lead called, Appraisal booked, Pack ready, Appraised, Authority sent, Signed, Listed, Photos, Campaign, Live). Each row below is one step: who or what triggers it, what GeeVee does, and the tier of anything that leaves DOMA.

| Step | Trigger | GeeVee does | Leaves DOMA | Tier |
| --- | --- | --- | --- | --- |
| Lead arrives | Portal, Meta, website, referral, call | Creates the person and the deal, starts the 24-hour clock, puts "Call X" on Today after offers | Nothing | A1 |
| 20 hours | Clock | Reminder notification to the agent | Nothing | A1 |
| 24 hours | Clock | Escalation notification to the principal; "Call X now (escalated)" task; lead stays with the agent | Nothing | A1 |
| The call | Agent calls from Today, the contact or Seller leads | Transcribes, summarises to the contact note, extracts what was agreed (appraisal time, expectation, opt-out, promises) for the agent to tick | Nothing | A1 |
| Call saved | Agent ticks and saves | Books the appraisal with travel time, moves the deal to Appraisal, marks the lead called, prepares the pack, sets a follow-up, drafts the confirmation text that was promised | Confirmation text | A2 |
| Returns | After the call | Back to the page the call started from, with a "What I did" card and Undo (which restores every record, including the contact's call status) |  |  |
| Appraisal pack | Appraisal booked | Builds the pack from the record and three recorded comparable sales (same or neighbouring suburb, similar bedrooms); range from the record, never invented | Printed or emailed by the agent | A2 |
| Visit | Diary event in the past | The "Appraisal ready" review card appears only after the visit, and is superseded when the deal moves on |  |  |
| Recap | Agent dictates or types the recap | Records the expectation, fee, method and timing; drafts the proposal; fills the authority from the recap and the record | Proposal email | A3 |
| Proposal approved | Agent's second look | Writes the send to the property and the contact, clears the risk, sets a chase task three days out | Email with the proposal attached | A3 |
| Authority | Recap or agent | Fills the Exclusive Sale Authority (parties, property, estimated selling price range, commission, marketing, method, period); the preview shows every field with its source and "to be completed" where blank; the Today approval refuses to send while required fields are blank | Signing request to the vendor | A3 |
| Vendor signs | Signing page | Records each signature; on completion files the signed authority, marks the compliance item, books photos, thanks the vendor, moves to Listed | Thank-you text | A2 |
| Vendor declines | Signing page | Marks the signer declined, closes the chase task, puts one next step on Today | Nothing | A1 |
| Photos | Supplier email | Confirms the shoot, delivers the photos to the record, picks the hero image | Supplier email, vendor text | A2 |
| Go-live checks | Journey strip | Vendor ID sighted (AML/CTF), price check (range within 10 percent, not below the estimate), Property Price Statement with three comparables and key features, Contract of Sale and Section 32 requested from the conveyancer, listing copy drafted | Conveyancer email | A2 |
| Go-live | All gates pass (distant comparables are a warning, not a block) | Publish card on Today; on approval publishes, withdraws any stale vendor texts, tells the vendor, drafts the Just listed campaign to matched buyers and the neighbour letter and texts | Listing, vendor text, campaign, letters, texts | A3 then A2 |

Gates that block go-live: no vendor ID sighted, price range fails the Victorian check, no Property Price Statement, no signed authority, no photos. The conveyancer email is addressed to the conveyancer named on the authority, never to the vendor.

The undo rule. Every automatic run keeps a snapshot taken before the base records change; "Undo everything" on the "What I did" card restores it and leaves an undo row in the trail.

## The sale journey

From a live listing to settled money. Open homes, enquiries and offers feed one property; the vendor sees one set of numbers.

| Step | Trigger | GeeVee does | Leaves DOMA | Tier |
| --- | --- | --- | --- | --- |
| Enquiry arrives | Portal, SMS, email, website | Links it to the property and the person, creates the enquiry record, classifies it (section 7), drafts the reply | Reply | A2 |
| Inspection request | Enquiry with a wanted time | Books into a session that matches the day and time asked for; if none matches, drafts a text offering a private inspection | Confirmation or offer text | A2 |
| Open home created | Agent or campaign | Session with day, start, end, status Upcoming | Nothing | A1 |
| Session opened | Agent at the door | Lists everyone who enquired, asked to inspect or registered as Expected. Expected people are not attendees. Arrived moves one into the attendees with a WARM default; the agent sets HOT, WARM, COLD or No interest, ticks contract requested, notes feedback | Nothing | A1 |
| Session closed | Agent | Drafts one post-visit text per attendee who gave permission (named by the day of the session, HOT buyers get a call promise), the open home report email for the vendor, the vendor's numbers text (groups through, hot, warm, contract requests, price pushback), ranks the buyers to call first; two or more price pushbacks put a price conversation on Today as a call | Texts, report, vendor text | A2 |
| Offer heard on a call | Agent records from the transcript or the recap | Reads amount, deposit, settlement, finance and conditions; records the offer; supersedes the buyer's earlier offer; flags an offer below the advertised range; puts one protected "Present offers to the vendor" card on Today that lists every live offer side by side | Nothing yet | A1 |
| Present to vendor | Agent's second look | Emails the vendor the offers side by side with deposit, settlement, finance, conditions and the advertised price, marking any below range; marks each offer presented | Vendor email | A3 |
| Best and final | Two or more live offers | Dialog with the deadline (local time, defaults to tomorrow 5 pm); texts every live buyer the same deadline; withdraws the present approval until the offers are in; puts the deadline on Today | Buyer texts | A2 |
| Vendor's decision | Agent records it after the call | Accept: courtesy text to the buyer, contract pre-filled (price, deposit, dates, purchaser), protected contract card. Counter: text to the buyer, call task. Decline: text to the buyer. Nothing is accepted, declined or countered without the vendor's instruction | Buyer text | A2 |
| Contract of Sale | Agent's second look | Sends for signing; the signing page and the demo signer refuse while the contract is an unapproved draft | Signing request | A3 |
| Both signed | Signing pages | Marks Sold at the price, files the signed contract, creates the settlement record (price, commission at the authority's rate, deposit due, finance due, settlement date), books deposit and settlement in the diary, cancels open homes, closes pre-sale tasks, texts the under-bidders about other homes, tells the vendor, publishes the sold price task (within 7 days of unconditional), drafts the just-sold neighbour letter and texts | Texts, letters | A2 |
| Auction | Campaign set to auction | Reserve published as a single figure 7 days before (restarts if changed); auction rules displayed 30 minutes before; a bidder list is Collings practice, not a legal requirement; sold under the hammer flows into the contract; passed in puts the negotiation on Today; no bids puts a vendor debrief call on Today | Reserve letter to the vendor | A3 |
| Money | Trust and money page | Marketing invoice from the budget on the authority (an estimate until one is recorded, and the email says so); deposit receipted into trust by the agent; commission and marketing deducted at settlement; referral fees recorded; the ledger balance is money held (deposits in, fees and invoices out) | Invoice email | A2 |
| Settled | Checklist complete | Marks Settled, thank-you emails, anniversary call, moves vendor and purchaser to past clients | Emails | A2 |

One commission everywhere: sold price times the fee on the authority, or the price guide times the fee until there is a sold price. One enquiry count everywhere: enquiry records plus conversations not already linked to one.

## Messages

Every inbound message (SMS, email, portal enquiry, website form) is a thread on one person, linked to one property where it can be. GeeVee classifies the latest client message and the thread lands on Today as one of four kinds.

| Classification | When | What the agent sees |
| --- | --- | --- |
| Call only | A seller conversation: thinking of selling, wants an appraisal, a current vendor on their own listing | No draft. "Call X. No message." with what DOMA knows before the call |
| Waits for you | Price, offers, negotiation, vendor matters, an opted-out sender, an unmatched sender, a building inspection or access request, anything GeeVee cannot answer completely | GeeVee's suggested reply, Edit, Approve and send, with the reason it did not send itself |
| Answered by GeeVee | Only when the answer comes completely from verified records: the next open home time from the open home record, or the Contract of Sale and Section 32 when the record says they are available and the listing is live | Not on Today. The reply is in the thread, the enquiry is marked answered, and the "GeeVee answered N enquiries" panel on Today lists each one with the records used and a switch to turn automatic replies off |
| Acknowledgement | "Thanks", "see you then", "5 works", a confirmation with no question | Not a card. Marked read |

The suggested reply answers the message that was sent, names the property, and uses facts from the record: the advertised range from the Property Price Statement, the next open home, the offer form as an attachment when it was asked for, other homes when the buyer asked for more. It is the same draft on Today, in the preview and on the Messages page. Approving appends it to the thread as an outbound message from the agent.

Texts. Every text GeeVee drafts carries the sender's name and "Reply STOP to opt out." The preview counts the characters and segments and flags a missing STOP line.

Search. Ctrl K searches people, properties, tasks, notes, messages (subject and every line of the thread), documents and drafts; every word typed must match; a message hit opens that thread on the Messages page.

Phone. On a phone the Messages page shows the list; selecting a conversation scrolls to the thread. The GeeVee bar sits above the bottom dock, never over it.

## Rentals, Office and the rebuilt pages

Rentals (phase 2). The rent roll lists every rental with rent, renter, rental provider, lease dates, bond and what is due. GeeVee checks the roll every morning and puts what is due on Today: arrears from 7 days (one notice per renter per week, the row says "Notice on Today"; once 14 days of rent is owed a notice to vacate with 14 days' notice can follow, drafted for the agent); renewals from 100 days before the lease end (a 4 percent rise by default, the email carries the 90 days' written notice the Act requires; the row then says "renewal offered, waiting on the renter" until a new lease is signed); routine inspections after the first three months and at most every six months, with at least 7 days' written notice, the booked date shown on the row; maintenance jobs with supplier booking (urgent repairs: the renter may arrange up to $2,500 under the Act); applications on the prescribed Residential Rental Application form, no rental bidding, the applicant created as a renter with no marketing permission and an email for signing; the lease filled from the application, approved by the agent (protected), then signed by the renter and the rental provider on their phones; bond of one month's rent lodged with the RTBA, or paid by the renter straight to the RTBA if they choose. Lease documents link to the rental, show no sale-authority fields, and list signers without an order when there is none.

Office (principal). Five numbers and the forecast bar; by agent; leaks this week (leads past 24 hours, quiet listings, approvals waiting more than 24 hours, compliance gaps on live listings, slipped tasks), every row opening the record; the audit trail (who did what, when, the words at the time; nothing deleted; Undo adds a row); trust and money; commission; the GCI forecast. The agent's own Today compares the agent's earned and booked commission with the agent's target, not the office's.

The rebuilt pages. The old CRM's 168 screens were rebuilt as reference pages reachable from More tools in seven groups: Properties, Leads and pipeline, Contacts, Communications, Performance and reports, Setup, Sign in and account. They define the fields and tables the records need (listing details, enquiries, buyer match, documents, compliance, campaigns, templates, eSign envelopes, KPIs, leaderboards, analytics, settings, agents and access). Build them only where a journey needs them; a page with no records shows an empty state that says what to do next, never zero-dollar columns.

## GeeVee in production

GeeVee is a set of playbooks run by a language model against the agent's own records, with the rules in section 3 enforced in code, not in the prompt. The prototype's regex matcher is a stand-in for the model; the playbooks are the contract.

What runs on its own (A1). Classifying inbound messages. Linking a message to a person and a property. Transcribing and summarising a call, extracting what was agreed. Booking an appraisal with travel time. Building the appraisal pack from recorded sales. Filling the authority, the contract, the offer form and the lease from the records. Picking the three most comparable sales. Writing listing copy as a draft. Drafting every reply, text, report, letter, campaign and invoice. Pre-registering expected buyers for an open home. Recording an offer from a transcript. Ranking the buyers to call. Running the 24-hour clock, the rent roll check and the compliance checks. Writing the audit trail and the "What I did" cards.

What waits for a tap (A2 and A3). Everything in the Leaves DOMA columns of sections 5 and 6. The model never calls a send, sign or publish tool; it creates an approval. The approval holds the exact text, recipient, attachments and tier.

What GeeVee answers alone. Only the two cases in section 7, and only when the records are complete. The model's answer is checked against the record (the open home exists and is upcoming; the Section 32 is recorded as available and the listing is live) before it goes. Everything else creates an approval.

The playbooks (one per intent). Day plan. Who has not been called. Call brief (why this call, talking points from the person's offers, enquiries and stage). Call recap (what was agreed, with a tick list for the agent). Appraisal booking. Appraisal pack. Proposal. Authority fill. Go-live checks. Reply draft. Inspection booking. Offer record. Present offers. Best and final. Vendor decision. Contract fill. Sold. Settlement checklist. Weekly vendor report. Open home close. Neighbour campaign. Buyer match. Rent roll check. Arrears, renewal, inspection, job, application, lease. Office leaks. Each playbook reads named records, writes named records, and returns a "What I did" list with Undo.

The GeeVee bar. Natural language in, one of the playbooks out, with the model asking one question when a request is ambiguous (which property, which person, what time). A question never changes a record. Advertised phrases in the product (the tours) must work.

Guardrails in code. Tier by action type (price, fee, contract, authority, lease, publish, offer presented, proposal = A3). Seller leads: no draft to an uncalled seller lead, ever. Opt-out: no marketing draft to an opted-out person. Spam Act: sender and unsubscribe on every marketing message, STOP on every text. Victorian price rules on every advertised price. The model cannot bypass any of these because the send path checks them, not the prompt.

Telemetry the product owner wants. Which cards were approved as drafted, edited, rejected or ignored; time from card to tap; auto-answers and whether the agent switched them off; undo rate per playbook. These numbers decide what GeeVee is allowed to do next.

## Data model

The prototype keeps one JSON state (people, deals, messages, tasks, actions, calls, activity, offers, settings, and a cw object with the layered records). Design a proper schema from this; the names below are the prototype's and are the vocabulary the screens use.

| Record | Key fields | Links | Notes |
| --- | --- | --- | --- |
| Person | name, role (seller, buyer, both, renter, rental provider), suburb, phone, email, source, owner (agent), consent (ok or opted out), callStatus, lastContact, tags, contactType | deals, messages, tasks, offers, attendances, notes, history, files, permission evidence, portal | Consent and permission evidence are first-class: who, when, how |
| Deal (property) | address, suburb, postcode, stage, guide (estimate), priceLow, priceHigh, fee, method, owner, source, active, risk, next, lastChange, type, beds, baths, cars, land, floor (internal area), soldPrice, listedAt, idVerified (by, at, doc) | vendor (person), purchasers, comps, priceEvents, activity, photos, docs (pps, contract, lease, report, other), openHomes, compliance, campaigns, enquiries | One property can hold several deals over time; a sale and a rental are separate records on the same address |
| Message | contactId, dealId, channel, subject, thread (from them or us, text, at, by), last, unread, time, triage, preparedReply | enquiry record, actions created from it | An outbound approval appends to the thread |
| Enquiry | dealId, contactId, type, source, received, comments, status (Pending, Replied, Answered, Processed), msgId, wants (requested time) | message | The enquiry count is enquiries plus unlinked conversations |
| Action (approval) | type (SMS, Email, Portal reply, Letter, eSign, Listing, Offer, Record update), title, subject, body, attachments, contactId or toName, dealId, tier (A1, A2, A3), status (Awaiting review, Reviewed, Rejected, Ignored, Withdrawn with reason, Scheduled review), created, reviewedAt, approvedBy, messageId, links to the agreement, campaign, offer, open home or rental it came from, an exempt flag | person, deal, message, agreement | Every send is an action; the audit trail derives from it |
| Offer | dealId, buyerId, vendorId, amount, deposit, finance, settlement, conditions, received, deadline, status (New, Presented, Superseded, Accepted, Declined, Countered, Withdrawn), presentedAt, history | deal, buyer, contract agreement | A buyer's new offer supersedes their last |
| Agreement (eSign) | kind (Authority, Contract, Offer form, Lease, Reserve), title, dealId or rental, status (Draft, In Progress, Completed, At Risk, Void), recipients (name, email, role, order, status), fields, formId and form values with their source, activity, pendingAction | deal or rental, the approval that sends it | Nothing can be signed while Draft or while its approval waits |
| Open home | dealId, day, start, end, status (Upcoming, Open, Closed, Cancelled), expected (pre-registered, not counted), attendees (temp HOT WARM COLD No interest, contract, notes, arrivedAt), smsDone, closedAt | deal, people | Only attendees count, text and report |
| Task | title, contactId, dealId, due, dueISO, priority, category (Call, Admin, Follow up), status, origin, assignee, doneAt | person, deal | Delegation returns a slipped task to the delegator's Today |
| Event (diary) | title, start, mins, where, kind (Appraisal, Inspection, Open home, Auction, Meeting, Phone), contactId, dealId |  | Travel time computed between physical stops; phone and video are not route stops |
| Settlement | dealId, price, commission, settles, status, buyerId, vendorId, contractAt, depositDue, depositAt, financeDue, checklist | deal, ledger | Commission is price times the authority's fee |
| Ledger and invoices | invoices (dealId, amount, est, status, items), ledger entries (kind, amount, dealId, by, at) | deal | Balance is deposits in less fees and invoices out |
| Rental | address, suburb, rent, renter, rental provider, leaseStart, leaseEnd, bond, lastPaidTo, inspections, jobs, status, arrearsNoticeAt, renewalAt | people, lease agreement | Phase 2 |
| Sale (comparable) | address, suburb, price, date, beds, baths, cars, land, internal, type | used by packs and the Property Price Statement | Needs a licensed sales data feed in production |
| Activity (audit) | type, title, details, when, at, by | everything | Append only; Undo adds, never removes |
| Campaign and template | name, subject, preview, body with merge tags, recipients, status, list, owner, unsubscribe footer | people lists, deals | Spam Act footer is not optional |
| Agent | name, role (agent, principal, assistant, admin), email, phone, access | everything by owner | Section 13 |

Identity. The prototype uses prefixed ids (C-1001, D-2006, M-4003, A-6003, O-701, OH-D-2006-2, AGR-1, EV-2, ST-D2-1). Keep stable ids across systems: the eSign provider, the SMS gateway and the portals will reference them.

## Integrations and what the prototype fakes

| Need | Prototype | Production |
| --- | --- | --- |
| SMS and email sending | Simulated; status becomes Reviewed, nothing leaves | A gateway with delivery status, inbound replies threaded to the person, STOP handling that sets consent |
| Portals (realestate.com.au, Domain, Collings site) | Publish is simulated; a public listing page is rendered locally | Listing publish and update, enquiry ingestion, Property Price Statement and sold price publication |
| eSign | Signing pages are local; signatures are typed or drawn in the prototype | A provider with envelopes, signer order, decline, audit certificate; DOMA holds the approval before any envelope is sent |
| Telephony and call transcription | A simulated call with example transcripts | Click to call from the card, recording with consent, transcription, the recap playbook on the transcript |
| Calendar | Internal diary with travel time by suburb | Two-way sync with the agent's calendar; real travel time from a maps service; route links exclude phone and video appointments |
| Comparable sales data | 20 seeded sales | A licensed sales feed with sold price, date, bedrooms, bathrooms, cars, internal area, land size |
| Vendor identity (AML/CTF) | A dialog records document type, who sighted it and when; no copy stored | An identity verification provider, with the record of who verified what and when kept in DOMA; required before estate agency services from 1 July 2026 |
| Trust accounting | A prototype ledger | The agency's trust accounting system is the source of truth; DOMA receipts and reconciles against it |
| Language model | Regex intent matcher and templates | The playbooks in section 9 on a hosted model, with the guardrails enforced by DOMA's send path |
| Rental bond lodgement | A task and a line in the lease | RTBA lodgement, including the renter's option to pay directly |
| Persistence | localStorage in the browser | A database with an append-only audit log, per-agency tenancy, roles |
| Notifications | In-app list and browser alerts | Push to phone, email digests to the principal |
| Documents | Generated text and print to PDF | A document store with versions; Property Price Statement, authority, contract, pack, report, invoice as real PDFs |

Demo data. Seventy people, forty deals, fifty-six threads, six offers and the rest are generated for a demo day. Do not migrate it. The real migration is from the current CRM (the 168 screens) and its export; the field mapping is in the rebuilt pages.

## Victorian compliance

Verified against Consumer Affairs Victoria on 24 November 2026. Each rule names where it bites in the product. Re-check before launch; the pages are consumer.vic.gov.au under estate agents (underquoting, auctions) and renting (new changes to rental laws).

| Rule | Since | Where in the product |
| --- | --- | --- |
| Property Price Statement replaces the Statement of Information. It lists the indicative selling price, the key features of the property (type, bedrooms, bathrooms, car spaces, internal built area, land size) and the three most comparable sales with the same features, address, price and date. Displayed with the advertised price online; physical advertising links to it | 1 October 2026 (auctions and fixed-date sales from 16 October 2026) | Go-live gate, the authority preview, the public listing page, the appraisal pack |
| Comparable means similar standard and condition, sold in the last 6 months and within 2 km in metropolitan Melbourne; if fewer than three exist the statement says why and lists the ones used | Unchanged | Comparable picker, go-live gate (distant comparables are a warning the agent must read) |
| The estimated selling price takes the three most comparable sales into account. A range is at most 10 percent wide and never below the estimate, the vendor's asking price or a written offer the vendor rejected on price; a rejected offer updates the indicative price | Unchanged, strengthened October 2026 | Price check on the property, authority preview, offer decline |
| The sold price is published in the Property Price Statement within 7 days of the sale going unconditional and kept public for 18 months; exemptions only for family or personal violence, applied for within 7 days | October 2026 | Sold flow creates the task; Office tracks it |
| Auction reserve published as a single dollar figure at least 7 days before the auction or fixed-date sale; online advertising updated within 1 business day; a change restarts the 7 days; no reserve published, no auction | 16 October 2026 | Auction campaign, reserve letter |
| Auction rules, the information statement, the Property Price Statement and the due diligence checklist displayed for at least 30 minutes before the auction; only the auctioneer makes vendor bids; bidders are identified on request. Victoria has no bidder registration requirement | Unchanged | Auction day page (the bidder list is Collings practice and is labelled so) |
| Vendor identity verified before providing estate agency services (AML/CTF tranche 2) | 1 July 2026 | Go-live gate, Office compliance gaps |
| Rent increase: 90 days' written notice; no rental bidding; no-fault evictions ended; most notices to vacate 90 days; unpaid rent: a notice to vacate once 14 days of rent is owed, with 14 days' notice | 25 November 2025 | Renewal offer, arrears flow |
| Prescribed Residential Rental Application form; only the information it allows; fees for applications and rent payments banned | 31 March 2026 and 13 October 2026 | Application dialog |
| Renter may pay the bond directly to the RTBA; refusing such a renter becomes an offence 1 June 2027 | 9 September 2026 | Lease and bond line |
| Bond claims notified in advance with evidence; two-yearly gas and electrical checks; annual smoke alarm checks; minimum standards met before advertising | 13 October 2026 and 25 November 2025 | Rentals phase 2 |
| Routine inspections: at least 7 days' written notice, not more than once every six months, not in the first three months | Unchanged | Inspection scheduling |
| Urgent repairs: the renter may arrange up to $2,500 if the rental provider does not act | Unchanged | Maintenance dialog |
| Spam Act: sender identified and an unsubscribe line on every marketing message; consent recorded with evidence | Unchanged | Campaigns, texts, permission evidence on the person |

Terms. Property Price Statement, never Statement of Information. Renter and rental provider in anything a renter reads. Owners and buyers, never registered buyers.

## Roles, permissions and the audit trail

| Role | Sees | Can approve | Cannot |
| --- | --- | --- | --- |
| Agent | Their own Today, people, properties, messages, deals, calendar, reports | A2 and A3 on their own records, with the second look on A3 | Office, audit trail, trust and money, commissions, KPIs, leaderboard, agents and access, forecast, analytics, view as |
| Principal | Everything, plus the office box on Today, Office, audit, trust, forecast, escalations | Everything | Nothing; every tap is still logged under their name |
| Personal assistant | The agent's Today and records | Nothing that leaves DOMA. Every approve button, including batch approval, becomes "Ask Caleb", which creates a task for the agent | Sends of any tier, signing, publishing |
| Admin | Setup, agents and access, integrations | As principal |  |

The audit trail is append-only. Each row carries who (the person who tapped, under the role in use; GeeVee for automatic runs), what, when, the words at the time, and the record it touched. Approvals, edits, rejections, ignores, undos, downloads and auto-answers are all rows. One row per decision; drafts are not duplicated. Undo adds a correction row and never removes one. Seeded or imported rows keep their original time. The principal exports it as CSV.

View as agent. In production, viewing as another agent filters every page to that agent's records and banners every page; nothing done while viewing is sent as them. The prototype shows the banner only and says so.

## Phone, accessibility and design

Phone first for the agent's day. Agents run Today, calls, approvals, previews, the open home session and messages from a phone at the door and in the car. At 390 px wide: no horizontal scroll on any page; the bottom dock (Today, Calls, Deals, Messages, More) stays reachable with the GeeVee bar above it; card menus, chips and toolbars stay inside the screen; selecting a conversation shows the thread; dialogs are sheets. The desktop layout is a two-column page with the diary and money plan on the right.

Accessibility. Every control is a button with a visible name or an aria-label; dialogs trap focus and close on Escape; the keyboard shortcuts on Today (Ctrl K search, J and K to move, A to approve) keep working; colour never carries meaning alone; axe-core reports zero serious or critical nodes on every page and dialog (the prototype's baseline).

Design. Build from design tokens (type scale, spacing, colour, radius) and a component set agreed with the designer. The design decisions worth keeping from the prototype: one list on Today; a card is a decision, not a form; the amber ring in the walkthrough; the three tiers as words; the journey strip on the property; preview before anything leaves; the "What I did" card with Undo. The eight screens to design properly: Today, the call review, an approval with its preview, the property page with the journey strip, the open home session, Messages, Office, and phone Today.

## Acceptance

Done means an agent can run the demo story on the real build and every rule in section 3 holds. The prototype ships with the checks that define its baseline; turn each into an acceptance test on the build.

| Check in the repo | What it proves | Baseline on the prototype |
| --- | --- | --- |
| tests/story-test.js | The five-chapter story (a call becomes a listing; live by Saturday; Saturday to sold; the money; the office) runs end to end by following the on-screen guide | 5 chapters, 0 stalls |
| tests/walk-test.js and jump-test.js | Every step of the walkthrough lands on the right control, in order and by jumping to it | 139 steps, 0 stuck, 0 misses |
| tests/trust-test.js | Preview, edit the words, approve from the preview, the second look on A3 | pass |
| tests/pushback-test.js | Push back an hour, later today, tomorrow, bring back, undo | pass |
| tests/ops-test.js | Offers (record, best and final, counter, accept), trust and invoices, roles, downloads, search, travel, rentals | pass |
| tests/e2e-listing.js, e2e-growth.js, e2e-manual.js, e2e-demo.js, e2e.js | The listing journey from call to campaign; money plan and delegation; manual forms; the demo kit | pass |
| tests/crawl.js --click | Every route renders and every safe button does something without an error | 168 of 169 (the root redirect is expected) |
| tests/mobile.js | 390 px: no overflow, nothing covered by the dock, dialogs usable | 0 problems on 170 pages |
| tests/kbd.js | Focus order, Escape, shortcuts | pass |
| tests/axe.js --modals | Accessibility on every page and dialog | 0 serious or critical nodes on 235 states |
| tests/action-audit.js | Every button's action has a handler | 0 missing |
| tools/check.js | Every script parses; no em or en dashes in the text | pass |

Add for the build: unit tests on the tier rules, the seller-lead rule, the opt-out rule, the Victorian price check, the enquiry count and the commission formula; contract tests on every integration; a load test on Today with 500 cards; and a legal review of every generated document against the current CAV forms before launch.

## Repo map and how to run

Run it. Clone the repository and open index.html in Chrome, or serve the folder (npm run serve, port 5500). The single-file build is npm run bundle, which writes dist/DOMA\_GeeVee\_CRM.html. The voice and film tools need Python with edge-tts and ffmpeg; the tests need puppeteer-core, axe-core and Chrome (see tests/README.md). Every file is a classic script sharing one scope; load order matters and is fixed in index.html.

| Path | What it is | Read it for |
| --- | --- | --- |
| js/app.js | The base app: state, Today, cards, approvals, messages, offers, calls, the legacy pages | Card anatomy, queue ranking, approval and reply handling, the auto-answer rules |
| js/cw-core.js | The page framework: routes, modals, forms, tables, the action dispatcher, the enquiry count | How pages and dialogs are built |
| js/cw-data.js, js/cw-data2.js | The layered demo data and the once-per-version data migrations | Which records exist and how they are shaped |
| js/cw-p-rules.js | The 24-hour seller-lead rule, reminders, escalation, the pipeline box | Section 5 |
| js/cw-p-journey.js, journey2.js, journey3.js | Call to appraisal to authority; photos to go-live; open homes to offers to sold to settled | Sections 5 and 6 |
| js/cw-p-trust.js | Preview before it goes, edit the words, push back, the size of the day, the tours | Section 4 |
| js/cw-p-ops.js | Audit trail, roles, search, travel, downloads, offers form and best and final, trust and money, alerts | Sections 6 and 13 |
| js/cw-p-language.js | The GeeVee bar's intent matcher and the call recap extraction | Section 9 |
| js/cw-p-esign.js, js/cw-p-public.js | Agreements, envelopes, forms, the signing pages | eSign behaviour |
| js/cw-p-contacts.js, properties.js, leads.js, comms.js, performance.js, admin.js | The rebuilt record pages | Fields and tables |
| js/cw-p-money.js, money2.js, growth.js | Open home day, neighbour campaigns, auction day, office leaks, batches, delegation, vendor reports | Sections 6 and 8 |
| js/cw-p-rentals.js | Rent roll, arrears, renewals, inspections, jobs, applications, leases | Section 8 |
| js/cw-p-walk.js, story.js, film.js, voice.js, demo.js | The walkthrough, the story, the training cut, narration, the demo kit | Not product |
| data/seed.js, data/legacy.js | Base seed and the old CRM's screen captures | Demo data only |
| docs/AUDIT-2026-11-24.md | The flow audit: found, fixed, left for the build | What was deliberately not done in the prototype |
| tests/, tools/ | The checks in section 15; check, bundle, voice, film |  |

Training films. Six MP4s in the product owner's "DOMA training videos" folder: an overview (7 minutes) and one film per chapter, with William's narration explaining each click and what GeeVee did from it. Watch chapter 1 and 3 before reading the code.

## Open decisions

For the product owner before or during the build. Each one changes scope or a rule.

- [ ] Phase 1 cut: is rentals in the first build or the second? The flows are audited and the wording is current, but it is a second product.
- [ ] Which eSign, SMS, telephony and identity providers? The design of approvals assumes DOMA holds the tap and the provider only executes.
- [ ] The language model: hosted where, with which data residency, and does the agency allow transcripts to leave the building?
- [ ] Auto-answers: on by default for every agent, or off until the agent switches them on? The prototype defaults to on with the panel and the switch visible.
- [ ] Batch approval: keep "Approve all N" for same-template A2 texts, or require one tap per message?
- [ ] The personal assistant role: can an assistant draft and send internal notes and tasks, or only ask?
- [ ] Commission at the authority's rate versus the office's standard rate when they differ; who can override and is it audited?
- [ ] Marketing invoices: never issue from an estimate, or allow an estimate clearly labelled until the budget is on the authority?
- [ ] The sold-price publication and the reserve publication: who is responsible, the agent or the office, and does DOMA publish or only remind?
- [ ] Delegation: when a delegated task slips, it returns to the delegator's Today. Does the principal see it too?
- [ ] Data migration from the current CRM: which records, how far back, and who owns consent evidence for imported contacts?
- [ ] The eight designed screens: who is the designer and when do the tokens land?

Questions the developers should ask early: how many agents and offices on day one; whether Today must work offline at an open home; retention periods for transcripts and audit rows; who signs off the generated documents against the CAV forms.
