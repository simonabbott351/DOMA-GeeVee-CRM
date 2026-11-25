# Photographer portal: build brief

Nov 25, 2026 · @Simon

## What we are building

A standalone, mobile-first portal for property photographers, reached by a private link, with no login. When an agent books a photographer for a listing in the CRM, the photographer gets an email and a text with a link to one job. On that page they confirm the booking or ask for another time, upload photos, floorplans, video and drone files, or paste a Pixieset gallery link, and see a delivery confirmation. The files land on the listing in the CRM, the agent gets an alert, and the listing's photography status moves from Booked to Confirmed to Delivered to Approved.

Why it is first. It is self-contained, it does not depend on the main CRM rebuild being finished, and it removes a real pain today: photographers emailing galleries, agents downloading and re-uploading, nobody knowing whether the shoot is confirmed. It is also the first supplier portal of several (stylists, signboards, conveyancers), so build it as a supplier portal with photography as the first job type.

What it is not. It is not part of the CRM's navigation, not a login for photographers, not a place that shows vendor details, price, agent notes or anything beyond the one job. It is a branded page with three things: the booking, the upload, the confirmation.

Read with this. The handover pack (DOMA with GeeVee: developer handover pack) for the rules of the house, the data model and the repo. The prototype's own supplier flow, referenced in section 2, is the behaviour to match.

## Scope

In scope for this build:

- A media job created from the listing's photography booking in the CRM, with a signed, expiring link.
- Invitation by email and SMS, resend from the CRM.
- The portal: booking screen (confirm or request another time), delivery screen (direct upload of photos, floorplans, video and drone, or a Pixieset link), confirmation screen.
- Upload progress per file, retry on failure, replacement uploads that keep the original.
- Files stored against the listing, organised by type, order preserved, hero image chosen by the agent.
- Status on the listing: Booked, Confirmed, Reschedule requested, Delivered, Approved.
- Alerts to the agent: confirmed, reschedule requested, delivered.
- An agent-side review in the listing's Photos tab: approve, reorder, pick the hero, request changes.

Out of scope: photographer accounts or logins, a supplier directory, invoicing and payment, editing tools, automatic import from Pixieset (the link is stored; import is a later feature), any other supplier type (design for it, do not build it).

What the prototype already does, and the developer should run before starting:

| In the prototype | Where | Keep |
| --- | --- | --- |
| Booking a photographer from the New Sale checklist, with a supplier email containing a link | js/cw-p-journey.js, the photos step; the email is an approval on Today | The booking data, the link in the email, nothing re-typed by the agent |
| The supplier page at /supplier/:token: the booking, Confirm this time, Suggest other times | js/cw-p-journey.js line 166 | The three choices and the plain wording |
| Delivery: Demo: deliver 12 photos puts named files on the listing, in order, and picks a hero | js/cw-p-journey2.js line 25, cwJnDeliver | Order preserved, hero chosen, Photos tab updated, agent told |
| The "What I did" card after delivery and the Tell the vendor the photo time text | js/cw-p-journey.js | The agent alert and the vendor text (approved by the agent, never sent by the portal) |
| A token-based public page pattern with no CRM navigation | js/cw-p-public.js, /s/:token | The pattern: one token, one job, nothing else reachable |

The pasted interactive prototype (Collings Property Media Portal: Secure invitation, 1 Booking, 2 Delivery, 3 Confirmation) is the screen design to follow. Where it and this brief differ, this brief wins on behaviour and the design wins on layout.

## The photographer's journey

One page, three steps, a progress line at the top (1 Booking, 2 Delivery, 3 Confirmation). Mobile first: photographers open this on a phone in the car. No login, no app. The link is the key.

1. Invitation. Email and SMS: "Collings Real Estate has booked you for 2/9 Bell Street, Coburg on Monday 26 October at 10:00am. Confirm or reschedule: \[link\]". The link opens the job directly.
2. Booking screen. Shows: who booked (agency and listing agent's name and phone), the property (address, type, bedrooms, bathrooms, car spaces, one exterior photo if the listing has one), the scheduled date and time in Melbourne time, the requested deliverables (photography, floorplan, video, drone, twilight, each as a chip), access notes the agent chose to share (for example "vendor home, knock", "lockbox code sent by text on the day"), and two buttons: Confirm booking and continue, Need to reschedule? Reschedule opens a sheet with three suggested slots the agent pre-approved or a free-text note; it never changes the booking itself, it asks the agent.
3. Delivery screen. Reached after confirming, or directly from a second link sent on the shoot day. Four drop zones or one picker: Photos, Floorplans, Video, Drone. Each file shows a thumbnail, a progress bar, done or failed, and Retry. A text field for a Pixieset gallery link and its PIN, stored privately. A note to the agent (optional). Deliver button, disabled until at least one file or a gallery link is present. Replacement upload: dropping a file with the same name as a delivered one creates version 2 and keeps version 1.
4. Confirmation screen. "Delivered to Collings Real Estate. 24 photos, 1 floorplan. The agent has been told." With: what was delivered, a button to add more files (same job, counted as a revision), and nothing else. No link back into anything.

States the page must handle: link expired (offer a one-tap request for a fresh link, which messages the agent), job cancelled by the agent (say so plainly), already delivered (show the confirmation with Add more), opened on desktop (same page, wider).

Tone. Plain words, short sentences, the agency's logo and colours, "Powered by DOMA" in the footer. No em dashes.

## The agent's side

Before. The agent books from the listing's New Sale checklist (the photos step on the journey strip): picks the supplier, the date and time, the deliverables, and the access notes to share. Nothing is typed twice; address and property facts come from the listing. The CRM creates the media job and the invitation. In DOMA the invitation is a send, so it is an approval on Today (waits for your tap) unless the agency sets supplier invitations to routine. Default for the first build: routine, with the invitation visible in the listing's activity.

During. The listing shows the job's status on the journey strip and in a Photography panel on the Photos tab: supplier, date, status, deliverables, the last event with its time. The agent can resend the invitation, change the date (which re-invites), cancel the job, or add a note the photographer will see.

Reschedule request. The agent gets an alert with the photographer's suggested times. Accepting one updates the booking, re-invites the photographer and, if the vendor was told the original time, drafts a new vendor text for approval. Declining asks the agent for alternative times to send back.

After delivery. Alert: "Photography delivered, 2/9 Bell Street, Coburg, 24 photos and 1 floorplan". The Photos tab shows the files in the delivered order with the first exterior as the suggested hero. The agent can reorder by drag, pick the hero, hide a photo from the listing without deleting it, approve the set (status Approved, which unblocks the go-live check for photos), or request changes (a note back to the photographer, status stays Delivered, the photographer's link reopens for a revision).

GeeVee's part, matching the prototype. On delivery GeeVee files the photos, picks the hero, updates the listing copy draft if it mentions rooms the photos show, and drafts the "your photos are in, here is the listing preview" text to the vendor for the agent's approval. These are the existing behaviours in cwJnDeliver; keep them.

## Job statuses

One status on the media job, shown the same way on the listing, the journey strip and the Office page. Every change writes an event with who, when and what.

| Status | Set by | When | What it unlocks |
| --- | --- | --- | --- |
| Booked | CRM | The agent saves the booking; the invitation is sent | The photographer's link works |
| Confirmed | Photographer | Confirm booking tapped | The vendor text with the photo time is drafted for the agent |
| Reschedule requested | Photographer | Need to reschedule submitted | The agent gets an alert with the suggested times; the booking is unchanged until the agent accepts |
| Booked (again) | Agent | The agent accepts a new time | A fresh invitation goes out; the old link still opens the job |
| Delivered | Photographer | Deliver tapped with at least one file or gallery link | The agent alert; files on the Photos tab; GeeVee's delivery steps |
| Changes requested | Agent | Request changes on the Photos tab | The photographer's link reopens for a revision; status returns to Delivered on the next upload |
| Approved | Agent | Approve on the Photos tab | The go-live check for photos passes |
| Cancelled | Agent | Cancel the job | The link shows a plain cancelled message; files already delivered stay on the listing |

Rules. A job is never moved backwards by the photographer. The agent can move it to any status except Confirmed and Delivered, which only the photographer's actions set. Approved is final; a later revision creates a new version of the files but leaves Approved in place unless the agent reopens it.

## Security and privacy

The link is the credential. It must be unguessable and scoped to one job.

- Token: at least 128 bits of randomness, stored hashed, looked up by hash. The URL is https://media.collings.com.au/j/{token} (final host to be decided). Never put the job id, listing id or address in the URL.
- Expiry: the link works until 14 days after the scheduled shoot, then shows an expired page with a one-tap "ask for a new link" that alerts the agent. Resend from the CRM issues a new token and revokes the old one.
- Rate limiting on the token endpoint and on uploads; lock a token after 20 failed lookups from one address.
- What the page can read: the job (status, date, time, deliverables, access notes the agent chose to share), the property's public facts (address, type, beds, baths, cars, one exterior photo), the agency name and logo, the listing agent's name and work phone.
- What the page can never read: vendor name or contact details, price or price instructions, agent notes, other jobs, other listings, anything in the CRM. Enforce this on the server with a dedicated read model for the portal, not by hiding fields in the client.
- Uploads go straight to object storage with short-lived signed upload URLs issued per file; the portal never proxies file bytes through the CRM. Files are private; the CRM serves them to agents through its own signed URLs.
- Pixieset links and PINs are stored encrypted at rest and shown only to agents with access to the listing.
- Every action from the portal (view, confirm, reschedule, upload, deliver) is logged with time, token id and IP, and appears on the listing's activity as the photographer's action.
- Virus scan on upload; accept only image, PDF, video and the floorplan formats listed in section 8; reject executables by content, not by extension.
- The portal is a separate deployable with its own domain and no session cookie shared with the CRM. A compromise of the portal gives nothing beyond that job's files.

## Data model and API

Records (names are suggestions; keep them consistent with the CRM's deal and document records in the handover pack).

| Record | Fields | Notes |
| --- | --- | --- |
| Supplier | id, name, type (photography), contact name, email, mobile, default deliverables, active | Seeded from the agency's current photographers; later a directory |
| MediaJob | id, listingId, supplierId, agentId, scheduledAt (Melbourne time, stored UTC), deliverables\[\], accessNotes (shared), status, statusAt, galleryUrl, galleryPin (encrypted), note from photographer, createdAt | One per booking; a rebooking after cancel is a new job |
| JobLink | id, jobId, tokenHash, createdAt, expiresAt, revokedAt, lastSeenAt, failedLookups | Several per job over time; only one live |
| MediaFile | id, jobId, listingId, type (photo, floorplan, video, drone), originalName, storageKey, bytes, width, height, checksum, order, version, replacesFileId, hidden, hero, uploadedAt, scanStatus | Order is the delivered order; version 2 points at version 1 |
| JobEvent | id, jobId, at, actor (agent id, or photographer via token id), kind (invited, viewed, confirmed, reschedule\_requested, rescheduled, uploaded, delivered, changes\_requested, approved, cancelled, resent), detail | Append only; mirrored into the listing activity and the audit trail |
| Notification | the CRM's own | Agent alerts; photographer email and SMS are sends with delivery status |

Portal API (served by the portal, authenticated by token only):

- GET /api/job/{token}: the portal read model (section 6). 404 for unknown or revoked, 410 for expired with the job's agent-contact action available.
- POST /api/job/{token}/confirm
- POST /api/job/{token}/reschedule with suggested times or a note
- POST /api/job/{token}/files/sign with name, type, bytes, checksum; returns a signed upload URL and a file id. Rejects unsupported types and files over the limit before any upload.
- POST /api/job/{token}/files/{fileId}/complete after the upload, which triggers the scan and thumbnail
- POST /api/job/{token}/gallery with url and pin
- POST /api/job/{token}/deliver with an optional note; requires at least one completed file or a gallery
- GET /api/job/{token}/files: the photographer's own uploads for this job with status, for progress and retry

CRM side (authenticated as the agent):

- Create, reschedule, cancel, resend for a job; list jobs for a listing.
- Files: list, reorder, set hero, hide, approve set, request changes.
- Webhook or internal event from the portal on confirm, reschedule, deliver, so the CRM writes the alert, the activity and GeeVee's delivery steps.

Time. Store UTC, display Australia/Melbourne everywhere on the portal, and say "Melbourne time" under the time as the design does.

## Files

- Accepted types: photos JPG, PNG, HEIC, TIFF; floorplans PDF, JPG, PNG, SVG; video MP4, MOV; drone the same as photos and video. Limits: 60 MB a photo, 50 MB a floorplan, 2 GB a video, 300 files a job. Say the limits on the page before the picker opens.
- Upload: direct to storage with a signed URL per file, parallel up to four at a time, resumable for video, progress per file, Retry on failure without re-selecting everything. A refresh must not lose completed uploads: the page re-reads its own file list from the job.
- Order: the order the photographer selected or dragged in the portal is the delivered order; store it as an integer on each file. Agents reorder in the CRM; the photographer's order is kept as deliveredOrder for reference.
- Hero: GeeVee suggests the first exterior photo (by filename hints such as front, facade, exterior, else the first file); the agent confirms or picks another. One hero per listing.
- Revisions: a file with the same original name as a delivered file becomes version 2 of that file, visible to the agent as "replaced" with version 1 kept and retrievable. A new name is a new file. Nothing uploaded is ever deleted by the portal.
- Processing on arrival: virus scan, EXIF read for dimensions and capture time, orientation fix, thumbnails at 400 and 1600 wide, web versions for the public listing page, originals untouched. Strip GPS from the web versions.
- Pixieset: store the gallery URL and PIN on the job, show them to the agent as "External gallery", and keep the job Delivered on a gallery alone. A later feature imports the gallery; do not build it now, but keep the field names ready (galleryUrl, galleryPin, galleryImportedAt).
- Retention: files live with the listing for its life and the agency's retention period, in Australian-region storage.
- The public listing page and the portals read only the web versions and only files not hidden.

## Notifications

| Event | To the photographer | To the agent |
| --- | --- | --- |
| Job booked | Email and SMS with the link. SMS: "Collings Real Estate booked you for 2/9 Bell Street, Coburg, Mon 26 Oct 10:00am. Confirm or reschedule: {link}" | Activity line on the listing |
| 24 hours before the shoot, not confirmed | Reminder SMS with the link | Alert: "Photographer has not confirmed 2/9 Bell Street" |
| Confirmed | Confirmation screen only | Alert plus the vendor text with the photo time drafted for approval |
| Reschedule requested | "Thanks, the agent will come back to you" on screen | Alert with the suggested times and Accept or Suggest other times |
| Rescheduled by the agent | New email and SMS with the time and the same link | Activity line; a new vendor text drafted if the vendor was told the old time |
| Shoot day, morning | SMS: "Today 10:00am at 2/9 Bell Street. Upload here when you are done: {link}" | None |
| Delivered | Confirmation screen | Alert: "Photography delivered, 2/9 Bell Street, Coburg, 24 photos and 1 floorplan"; Photos tab updated; GeeVee's delivery steps |
| Changes requested | Email and SMS with the agent's note and the link reopened | Activity line |
| Approved | None | Journey strip tick; go-live photo check passes |
| Cancelled | SMS: "The shoot at 2/9 Bell Street has been cancelled. The agent will be in touch." | Activity line |

Every message to the photographer names the agency and the listing agent and comes from the agency's sender. Photographer messages are transactional, not marketing, so no unsubscribe line is required, but "Reply STOP" handling must still work on the SMS gateway and set the supplier to no-SMS.

## Acceptance

Done means every line below passes on a phone (iPhone Safari and Android Chrome) and on desktop, with automated tests for the API and the security rules.

- [ ] Booking a photographer on a listing creates a job and sends the email and SMS within a minute, with a link that opens the job and nothing else.
- [ ] The booking screen shows the address, property facts, date and time in Melbourne time, deliverables, shared access notes and the agent's name and phone. It shows no vendor details, no price, no notes the agent did not share.
- [ ] Confirm sets Confirmed, writes the event, alerts the agent and drafts the vendor text for approval. Nothing is sent to the vendor by the portal.
- [ ] Need to reschedule sets Reschedule requested without changing the booking; the agent's accept re-invites; the old link still opens the job.
- [ ] Upload: 40 photos, 1 floorplan PDF and 1 video on a mobile connection, with progress per file; pulling the cable mid-upload shows failed files with Retry and loses nothing completed; a refresh shows the completed files.
- [ ] Deliver with files only, with a gallery link only, and with both. Deliver with nothing is impossible.
- [ ] Delivered files appear on the listing's Photos tab in the delivered order within a minute, with thumbnails, and the agent is alerted with the counts.
- [ ] Re-uploading a file with the same name creates version 2 and keeps version 1 visible to the agent.
- [ ] The agent can reorder, pick the hero, hide, approve and request changes; request changes reopens the link and the photographer sees the note.
- [ ] Expired, revoked, cancelled and unknown tokens each show the right page; a revoked token never opens the job; 20 bad lookups lock the address.
- [ ] An executable renamed .jpg is rejected; a file over the limit is refused before upload starts.
- [ ] Every portal action is on the listing's activity and in the audit trail with time and actor.
- [ ] Accessibility: every control has a name, focus is visible, the page works with a screen reader, contrast passes.
- [ ] Load: 50 concurrent photographers uploading 40 files each does not degrade the CRM.
- [ ] Brand: agency logo and colours from configuration, so a second agency is a config change.

## Build order

Five steps, each shippable on its own. One developer, about five weeks, plus a day of design on the three screens.

1. Job and link (week 1). Supplier and MediaJob records, token issue and revoke, the portal read model, the booking screen with Confirm and Reschedule, the agent-side panel on the listing, the events. Email and SMS invitation through the agency's gateway.
2. Upload (week 2). Signed uploads, progress and retry, type and size checks, scan and thumbnails, the delivery screen, Deliver, the agent alert, files on the Photos tab in order.
3. Agent review (week 3). Reorder, hero, hide, approve, request changes, revisions, the journey strip tick and the go-live check.
4. Hardening (week 4). Expiry and resend, rate limits, reminders (24 hours before, shoot morning), cancelled and expired pages, the audit trail, accessibility, load test.
5. Pilot (week 5). Two photographers the agency already uses, three real listings, the agent's feedback, then every photographer.

How it fits the main build. The portal is its own deployable and talks to the CRM through the job events and the file records. Build it against the current CRM's listing record now; when DOMA V2 lands, the same portal attaches to the new listing record through the same two interfaces. Keep the portal's read model and events as the contract and nothing in the portal will need to change.

## Open questions

For the product owner before week 1 starts.

- [ ] Which listing record does the pilot attach to: the current CRM's, or do we wait for DOMA V2? The brief assumes the current CRM.
- [ ] Domain for the portal (media.collings.com.au or a DOMA domain usable by other agencies later).
- [ ] Is the supplier invitation routine (sent on booking) or an approval on Today? The brief assumes routine.
- [ ] Which access notes may be shared with a photographer by default: lockbox code, alarm, pets, vendor home? The brief shares only what the agent ticks.
- [ ] Pixieset: store the link only for now, or import the gallery in the first build?
- [ ] File limits and retention: are 60 MB photos and 2 GB video enough for your photographers, and how long do originals stay?
- [ ] Photographer messages: email and SMS always, or let each supplier choose?
- [ ] Branding: Collings only for the pilot, or configurable from day one for other DOMA agencies?
