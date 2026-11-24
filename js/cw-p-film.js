'use strict';
/* Recorded voice, the film cut and the training cut (20 Nov 2026).
   The story plays recorded narration (audio/<voice>/*.mp3, listed in data/vo-audio.js) instead of the browser's speech
   engine, and falls back to the engine when a line has no recording.
   Two cuts of the five chapters: the film cut (one line per step, about seven minutes) and the training cut (every
   click explained in the agent's own terms, a visible cursor, one video per chapter). Prefix cwFm. */
function cwVoHash(t){let x=5381;const s=String(t).replace(/\s+/g,' ').trim();for(let i=0;i<s.length;i++)x=((x*33)^s.charCodeAt(i))>>>0;return x.toString(36)}
function cwVoRec(text){const m=window.DOMA_VO;if(!m||!m.voices)return null;const v=m.voices[m.voice]||m.voices[Object.keys(m.voices)[0]];if(!v)return null;const r=v.lines[cwVoHash(text)];return r?{file:v.base+r.file,ms:r.ms}:null}
const cwVoA={el:null};
{const prev=cwVoSay;cwVoSay=function(text,key){const st=cwStS();if(!text||key===cwVo.key)return;const rec=cwVoRec(text);
 if(/^record/.test(st.film||'')){cwVo.key=key;cwVo.text=text;cwVoCaption();clearTimeout(cwVo.timer);cwVo.busy=true;const ms=rec?rec.ms:Math.max(1800,text.split(/\s+/).length*400);console.log('VO|'+cwVoHash(text)+'|'+Math.round(performance.now())+'|'+ms);cwVo.timer=setTimeout(()=>{cwVo.busy=false;cwVo.endedAt=Date.now()},ms+400);return}
 if(!rec||!st.voice)return prev(text,key);
 cwVo.key=key;cwVo.text=text;cwVoCaption();clearTimeout(cwVo.timer);cwVo.busy=true;const sp=st.speed||1;
 try{if(cwVoA.el){cwVoA.el.pause()}const a=new Audio(rec.file);a.playbackRate=sp;a.preload='auto';cwVoA.el=a;
  const finish=()=>{if(cwVoA.el!==a)return;cwVo.busy=false;cwVo.endedAt=Date.now()};
  const fallback=()=>{if(cwVoA.el!==a)return;cwVoA.el=null;clearTimeout(cwVo.timer);cwVo.key='';prev(text,key)};
  a.onended=()=>setTimeout(finish,350);a.onerror=fallback;cwVo.timer=setTimeout(finish,rec.ms/sp+2500);
  const p=a.play();if(p&&p.catch)p.catch(fallback)}catch(e){cwVoA.el=null;cwVo.key='';return prev(text,key)}}}
{const prev=cwVoStop;cwVoStop=function(){prev();if(cwVoA.el){try{cwVoA.el.pause()}catch(e){}cwVoA.el=null}};cwStStop=cwVoStop}
{const prev=CW_ACT.cwStPause;cwOn('cwStPause',()=>{const r=prev();const st=cwStS();if(cwVoA.el){try{if(st.paused)cwVoA.el.pause();else cwVoA.el.play()}catch(e){}}return r})}
{const hush=()=>{if(cwVoA.el){try{cwVoA.el.pause()}catch(e){}}};window.addEventListener('pagehide',hush);window.addEventListener('beforeunload',hush);document.addEventListener('visibilitychange',()=>{if(document.hidden)hush()})}

/* ---------- the film cut: one line per step ---------- */
const CW_FILM={
 open:'This is DOMA, the Collings CRM, rebuilt around GeeVee. GeeVee listens to the agent\'s calls and does the work that follows. Nothing leaves the office without the agent\'s tap. Five chapters, about seven minutes.',
 ch:['Chapter one. A call becomes a listing.','Chapter two. Live by Saturday.','Chapter three. Saturday to sold.','Chapter four. The money.','Chapter five. The office.'],
 steps:[[0,1,3,4,5],[6,7,17],[16,8,9],[10,11],[18,12,21]],
 step:{
  0:'This is Today. One list, in order: offers, replies, calls, approvals. Each card is a decision, not a form.',
  1:'Helen Vu enquired overnight. A new seller lead is always a call from the agent, inside twenty four hours. GeeVee listens to the call and books the appraisal from it.',
  3:'After the appraisal, the agent dictates the recap. Price, commission, method, marketing. GeeVee fills in the sales authority and checks the ten percent price rule.',
  4:'Documents to a vendor are protected. The agent checks the authority and approves it. It goes to Helen and Mark to sign on their phones.',
  5:'This is what the vendor sees. The moment both sign, GeeVee files it, creates the listing, books the photographer and drafts the campaign.',
  6:'The photographer confirms from the email and delivers from the same link. GeeVee files the photos, writes the copy and picks three comparable sales.',
  7:'Go live runs the Victorian checklist, then waits for the agent. On approval it publishes, books the first open home and sets the auction.',
  17:'The street hears about it the same day. A letter to forty doors, texts to owners with permission, and a door knock before the open home.',
  16:'Open home day. Enquirers are already on the list. Check people in at the door, mark them hot, warm or cold. Close the session and the follow-ups go to Today.',
  8:'GeeVee ranks the buyers to call. An offer heard on a call becomes an offer record. Presenting it to the vendor is a protected approval.',
  9:'The vendor\'s decision is dictated. The contract fills itself from the offer, both parties sign, and the sale is filed with deposit and settlement in the diary.',
  10:'The forecast shows earned, booked and pipeline against target, and turns the gap into a number of appraisals.',
  11:'Every owner gets a rhythm, and selling signals become calls. Only owners with permission are contacted.',
  18:'The principal\'s page. Leads past twenty four hours, quiet listings, approvals waiting, compliance gaps. By agent. Every row opens the record.',
  12:'Seven of the same approval is one tap. Delegation is a sentence.',
  21:'At five, close the day. What got done, what moved, and tomorrow in order.'},
 sub:{},
 out:['Two calls, one recap, eight taps. No form typed.','Photos to portals in one approval, and the street written to.','No offer form, no contract typed, no buyer forgotten.','Prospecting that runs on a busy week.','The principal sees the problem the morning it starts.'],
 end:'That is DOMA with GeeVee. Everything on one record. Nothing sent, signed or published without a tap.'};

/* ---------- the training cut: every click explained, in the agent's own terms ---------- */
const CW_TRAIN={
 open:'Welcome to DOMA with GeeVee. These five short videos show you how to use it, click by click. The amber ring and the cursor show you where to click, and the words at the bottom tell you why. Nothing leaves DOMA without your tap.',
 ch:['Chapter one. A call becomes a listing. You will take a seller lead from a phone call to a signed sales authority, without typing a form.',
  'Chapter two. Live by Saturday. You will book the photographer, pass the go-live checklist, and let GeeVee tell the street.',
  'Chapter three. Saturday to sold. You will run an open home, record an offer from a call, and get from acceptance to a signed contract.',
  'Chapter four. The money. You will set your target, see what closes the gap, and let your database work for you.',
  'Chapter five. The office. For principals: where the week is leaking money. Then batch approvals, delegation, and closing your day.'],
 steps:[[0,1,3,4,5],[6,7,17],[16,8,9],[10,11],[18,12,21]],
 step:{
  0:'This is Today, your home page. Everything GeeVee has prepared sits here in order. Start at the top and work down. You never have to go looking.',
  1:'A seller lead has come in from Facebook overnight. At Collings a new seller lead is always a call from you, inside twenty four hours. GeeVee never messages them first. The clock on the card shows the hours left.',
  3:'You have done the appraisal and you are back in the car. Instead of typing, you tell GeeVee what was agreed. That recap is the whole data entry for a listing.',
  4:'Anything that leaves DOMA waits for you. Routine work is done for you and logged. Messages wait for your tap. Documents to a client are protected and get a second look.',
  5:'This is what the vendor sees on their phone: the authority, a signature box, and nothing else. Let us sign as Helen and Mark to see what follows.',
  6:'Outside suppliers get a booking email with a link. They confirm from it, and later they deliver from it. You do not chase them.',
  7:'Publishing leaves the office, so it sits behind the Victorian checklist and a protected approval. You cannot go live with something missing.',
  17:'Every listing is a prospecting event. The day a listing goes live, GeeVee writes to the street for you. This page shows the campaign.',
  16:'Open home day. The buyers who enquired during the week are already on the list. At the door you check people in on your phone, or they scan the code.',
  8:'GeeVee ranks the buyers to call first: offers, enquiries, open home interest, portal views, and whether their finance is ready. You just call the top of the list.',
  9:'From here to a signed contract nobody fills in a form. You present, the vendor decides, and the contract fills itself from the offer.',
  10:'The forecast shows what you have earned, what is booked, and what is in the pipeline, against your target. The gap becomes a number of appraisals.',
  11:'Your database works itself. Every owner gets a rhythm: a market update, an anniversary note, a what is it worth now. GeeVee watches for selling signals and turns the strong ones into calls.',
  18:'For principals. This page shows where the office is leaking money this week, before it costs anything.',
  12:'Two habits that save an hour a day: approve the same thing in one tap, and delegate in a sentence.',
  21:'At five, close the day in one tap.'},
 sub:{
  '0:0':'The written offer sits at the top because offers are urgent. Every card is a decision: approve, edit, ignore, or push it back an hour, to later today, or to tomorrow.',
  '0:1':'On the right: your diary, your money plan, owners worth a call, and a vendor report that is due. The same record feeds all of it.',
  '0:2':'You can ask GeeVee anything in plain words. Watch: we type what\'s on today into the bar at the bottom, and GeeVee answers from your own diary and list.',
  '1:0':'Click Call next to Helen Vu. Calling from inside DOMA matters: GeeVee hears the call, so it can do the follow-up for you.',
  '1:1':'The call screen shows who she is, her property and what she asked. Click Start simulated call. In production this dials her number.',
  '1:2':'In this prototype we play an example conversation so you can hear what GeeVee listens for. Click Play example conversation.',
  '1:3':'The call is done. Click Finish and review. GeeVee has been listening and will show you what it heard before it does anything.',
  '1:4':'This is the review. GeeVee heard an appraisal for Thursday at two, a co-owner called Mark, a price expectation, and a text you promised. Untick anything that is wrong. Then click Save and let GeeVee do it.',
  '1:5':'If anything on this card is wrong, Undo everything puts every record back. Click Looks right.',
  '3:0':'Open the property and find the journey strip, the green band under the photo. It shows where this listing is up to and what comes next. Click Record recap.',
  '3:1':'You would dictate here: price, commission, method, marketing budget, photo day. Click Insert example recap to see a typical one.',
  '3:2':'Click Save recap and prepare follow-up. GeeVee checks the advertised price against the ten percent rule and fills in the sales authority from the recap.',
  '3:3':'Documents to a vendor never go without your tap. Click Looks right.',
  '4:0':'The bell, top right, holds everything waiting for you. Click it.',
  '4:1':'Each item shows who it goes to and the words or the document. Preview shows exactly what the vendor will see. Click Review on Send the sales authority to Helen Vu.',
  '4:2':'Read it. This is a protected approval, so you confirm you have checked this exact version. Click Approve. The authority goes to Helen and Mark to sign on their phones, and GeeVee chases them if it is not signed in time.',
  '4:3':'Close the approvals. The listing journey moves on by itself.',
  '5:0':'Click Vendor signing page on the journey strip. In production this is the link in Helen\'s text.',
  '5:1':'Choose Type. A typed name is a valid electronic signature.',
  '5:2':'Type Helen Vu and tick the box that says she has read the document.',
  '5:3':'Click Sign.',
  '5:4':'Now the co-owner. Type Mark Vu and tick the box.',
  '5:5':'Click Sign.',
  '5:6':'You did none of that. Click Looks right.',
  '6:0':'Click Supplier email on the journey strip to see what the photographer received.',
  '6:1':'This is their page: the booking, the address, the time. Click Confirm this time, as the photographer would.',
  '6:2':'After the shoot they deliver from the same page. Click Demo: deliver twelve photos.',
  '6:3':'Click Open the property to see all of that on the listing.',
  '7:0':'Click Go live on the journey strip.',
  '7:1':'One check is missing: the vendor\'s identity. Click Record ID sighted.',
  '7:2':'Record who sighted which document and when. DOMA never stores a copy of the document. Click Save.',
  '7:3':'The listing copy needs your approval. Read GeeVee\'s draft, change any word you like, then click Use GeeVee\'s draft.',
  '7:4':'All checks passed: signed authority, price statement with three comparables, price inside ten percent, vendor ID, photos, copy. Click Request go-live. It goes to your bell as a protected approval.',
  '7:5':'Click the bell.',
  '7:6':'Click Review on Publish 44 Smith Street.',
  '7:7':'Click Approve. GeeVee publishes to the portals, books the first open home for Saturday, sets the auction and queues the campaign.',
  '7:8':'Close the approvals.',
  '7:9':'Click Public listing to see what buyers see on the portal.',
  '17:0':'Doors on the street, letters drafted, texts to the owners who gave permission, the door knock booked before the open home, and the appraisals that came from it.',
  '17:1':'When you knock, you record each door here. Click Spoke on a row.',
  '17:2':'An owner who is not on file can become a lead at the door. Click + Lead.',
  '17:3':'Name and mobile. That is all GeeVee needs.',
  '17:4':'Click Create lead. It goes on Today as a call, and if it becomes an appraisal, it is tracked back to this listing.',
  '17:5':'Click Looks right.',
  '16:0':'Click Open session on 84 Albert Street.',
  '16:1':'These buyers enquired this week and are expected, but not counted until they arrive. Tap Arrived as each one comes through the door, then mark them hot, warm or cold. That one tap decides who gets called tomorrow.',
  '16:2':'Click HOT on that attendee.',
  '16:3':'When the last person leaves, click Close session.',
  '16:4':'Click Looks right.',
  '8:0':'Click Buyers to call on the journey strip.',
  '8:1':'Jordan Park is first: an offer on an earlier call, open home interest, and finance pre-approved. Click Call next to Jordan Park.',
  '8:2':'Click Start simulated call.',
  '8:3':'Click Play example conversation. Listen for the offer: the amount, the deposit, finance, settlement.',
  '8:4':'Click Finish and review.',
  '8:5':'GeeVee heard the offer and its conditions. Check them, then click Save and let GeeVee do it.',
  '8:6':'Click Looks right.',
  '9:0':'Click the bell.',
  '9:1':'Click Review on Present offer to vendor. GeeVee has written every live offer side by side for Hannah.',
  '9:2':'Click Approve. The offers go to Hannah in writing, and a task to record her decision goes on your Today.',
  '9:3':'Close the approvals.',
  '9:4':'Open 9 Rose Avenue.',
  '9:5':'Hannah has called back. Click Record vendor decision on the journey strip.',
  '9:6':'You dictate the decision in plain words. Click Example: accept, or type Hannah accepts Jordan\'s offer.',
  '9:7':'Click Save and let GeeVee do it.',
  '9:8':'Click Looks right.',
  '9:9':'Click the bell.',
  '9:10':'Click Review on the Contract of Sale.',
  '9:11':'Click Approve. It goes to both parties to sign.',
  '9:12':'Close the approvals.',
  '9:13':'Click Buyer signing page on the journey strip to see what Jordan receives.',
  '9:14':'Choose Type.',
  '9:15':'Sign as Jordan Park: type the name and tick the box.',
  '9:16':'Click Sign.',
  '9:17':'Now the vendor. Sign as Hannah Wells.',
  '9:18':'Click Sign.',
  '9:19':'Sold. Click Looks right.',
  '10:0':'Click Change target.',
  '10:1':'Try another number, then Save target. Everything below recalculates.',
  '10:2':'The plan: how many appraisals close the gap, and the owners most likely to say yes, ranked by their signals. Below it, Protect what you have: the listings at risk.',
  '10:3':'You can ask GeeVee how am I tracking at any time, from any page.',
  '11:0':'Read the signals under Kurt Bauer: marked hot, says they are selling within months, recent sales nearby. Click Add as lead.',
  '11:1':'Click Looks right.',
  '11:2':'Click the Due a touch tab. These owners are due their next contact.',
  '11:3':'Click Draft all due touches. GeeVee writes each one. They go to Today for your approval, and only owners with permission evidence get one.',
  '18:0':'Five numbers: seller leads past twenty four hours, live listings with no activity in a week, approvals waiting more than a day, compliance gaps, and the forecast against the office target.',
  '18:1':'Click By agent to see the same numbers per person, and who to talk to today.',
  '18:2':'Click Leaks this week to go back to the list.',
  '18:3':'Every row opens the record. Click Open, Review or Compliance on any row and you are looking at the actual listing or approval.',
  '12:0':'At the top of Today, a batch of five texts is ready, all the same template. Preview one if you like, then click Approve all. One tap, five sends, each still logged on its own.',
  '12:1':'Now type to GeeVee: ask Priya to call the open home buyers for 9 Rose Avenue, remind me Friday. GeeVee assigns the task and sets your reminder.',
  '12:2':'The Delegated card on the right tracks it. If Priya\'s task slips, it comes back to your Today.',
  '21:0':'Click Close my day.',
  '21:1':'Read it, then click Looks right.'},
 /* spoken after the click lands, with the result on screen: what GeeVee did from that action */
 after:{
  '0:2':'GeeVee answered from your own diary and list. You can ask it anything the same way: what is on today, how am I tracking, who should I call.',
  '1:4':'From that one call, GeeVee did this work for you. It saved the transcript and a summary to Helen\'s record. It booked the appraisal for Thursday at two with travel time. It prepared the appraisal pack, ready to print. It recorded Mark as a co-owner. It saved her price expectation and time frame as facts. It drafted the confirmation text you promised and put it on Today for your approval. And it set a follow-up call for two days later. You typed nothing.',
  '1:5':'Nothing went to Helen. The text waits on Today until you tap it. And Undo is always there if GeeVee heard something wrong.',
  '3:2':'From that recap, GeeVee recorded the price, commission, method, marketing budget and photo day on the listing. It checked the advertised price against the ten percent rule. It filled in the exclusive sale authority, every field, from the recap and the property record. And it put the authority on Today as a protected approval.',
  '4:2':'With that tap, GeeVee sent the authority to Helen and Mark for electronic signing, logged who approved which version, and set itself a reminder to chase if it is not signed in three days.',
  '5:5':'The moment the second signature landed, GeeVee did five things. It filed the signed authority under compliance. It created the listing and kept it off market until the campaign is approved. It emailed Northside Property Photography to book the shoot. It drafted the just listed email campaign and the Property Price Statement from the authority price and three comparables. And it drafted a thank you text to Helen for your approval.',
  '6:1':'GeeVee put the shoot in your diary and told you. No email back and forth.',
  '6:2':'From that delivery, GeeVee filed the twelve photos on the listing, picked the hero image, wrote the listing copy from the facts on record, chose three comparable sales for the price statement, and marked the listing ready for the go-live checklist.',
  '7:2':'GeeVee recorded the identity check against the listing in the compliance file: who sighted what, and when.',
  '7:7':'With that tap, GeeVee published to realestate.com.au, Domain and the Collings site, published the Property Price Statement, booked the first open home for Saturday at eleven, set the auction date with a reserve reminder, queued the campaign email for your approval, texted Helen that she is live, and wrote to the street. You will see that next.',
  '17:4':'GeeVee created the owner, put the call on Today with the twenty four hour clock running, and linked the lead to this listing, so if it becomes an appraisal, this campaign gets the credit.',
  '16:2':'GeeVee moves hot buyers to the top of tomorrow\'s calls and checks whether their finance is ready.',
  '16:3':'When you closed the session, GeeVee drafted a post-visit text to every buyer who gave permission, wrote the open home report for the vendor, texted the vendor the numbers, and ranked the buyers to call first. Only the people you marked as arrived count: nobody who stayed home gets a text or a mention in the vendor report. When buyers push back on price, the price conversation goes on Today as a call from you.',
  '8:5':'From that call, GeeVee recorded Jordan\'s offer of one million fifty thousand with the deposit, finance and settlement terms. It checked it against the other live offers. It drafted the email presenting every offer to Hannah side by side. And it put that on Today as a protected approval.',
  '9:2':'GeeVee emailed the offers to Hannah in writing, marked each offer as presented, and set a task on your Today to record her decision tomorrow.',
  '9:7':'From Hannah\'s decision, GeeVee marked Jordan\'s offer accepted and the others not chosen, filled in the Contract of Sale from the offer, price, deposit, settlement and conditions, and put the contract on Today as a protected approval.',
  '9:11':'GeeVee sent the contract to Jordan and Hannah for signing, with the Section 32, and logged the version you approved.',
  '9:18':'The moment both signed, GeeVee marked the listing sold, filed the contract, put the deposit due date and the settlement date in your diary, set the sold price task under the seven day rule, and drafted a text to the buyers who missed out, for your approval.',
  '10:1':'GeeVee recalculated the gap, the number of appraisals it takes to close it, and the owners most likely to say yes.',
  '11:0':'GeeVee created the seller lead, started the twenty four hour clock, and put the call on Today with the signals as your brief.',
  '11:3':'GeeVee wrote each market update, anniversary note and worth-now message from the owner\'s own history, and put them on Today for your approval. Owners without permission evidence were left out.',
  '12:0':'Five texts in one tap. Each one is still logged on its own record, with your name and the time.',
  '12:1':'GeeVee created the task for Priya, set your reminder for Friday, and will bring the task back to your Today if it slips.',
  '21:0':'GeeVee marked what got done, moved the slipped tasks to tomorrow, and built tomorrow in order with travel time between appointments.'},
 out:['What you did: one call, one recap, one approval, and the vendors signed. GeeVee booked, prepared, filled and filed.',
  'What you did: confirmed a photographer, passed the checklist, approved go-live. GeeVee published, booked the open home and wrote to the street.',
  'What you did: ran an open home, took an offer on a call, approved the presentation and the contract. No form typed.',
  'What you did: set a target and added one lead. GeeVee turned the gap into a plan and drafted the due touches.',
  'What you did: read the office in one screen, approved five in one tap, delegated in a sentence, and closed the day.'],
 end:'That is DOMA with GeeVee. Start every day at the top of Today. Call from DOMA so GeeVee hears you. Tell it what was agreed. Tap approve on what leaves. Everything else, it does.'};

const cwFm={saved:null,wk:null,curEl:null,curAt:0,lastKey:null,afterPending:null,afterSaid:{}};
function cwFmCut(mode){return /train/.test(mode||'')?CW_TRAIN:CW_FILM}
function cwFmApply(mode){const cut=cwFmCut(mode);if(cwFm.saved&&cwFm.saved.cut===cut)return;if(cwFm.saved)cwFmRestore();
 cwFm.saved={cut,steps:CW_STORY.map(c=>c.steps),out:CW_STORY.map(c=>c.out),saved:CW_STORY.map(c=>c.saved),vo:{open:CW_VO.open,ch:CW_VO.ch,step:CW_VO.step,sub:CW_VO.sub,out:CW_VO.out,end:CW_VO.end}};
 CW_STORY.forEach((c,i)=>{c.steps=cut.steps[i];c.out=[cut.out[i].replace(/\.$/,'')];c.saved=''});CW_VO.open=cut.open;CW_VO.ch=cut.ch;CW_VO.step=cut.step;CW_VO.sub=cut.sub;CW_VO.out=['','','','',''];CW_VO.end=cut.end}
function cwFmRestore(){const s=cwFm.saved;if(!s)return;CW_STORY.forEach((c,i)=>{c.steps=s.steps[i];c.out=s.out[i];c.saved=s.saved[i]});Object.assign(CW_VO,s.vo);cwFm.saved=null}
/* the film cut halves the gaps between clicks and skips the pure "look here" notes; the training cut keeps them */
function cwFmTighten(){if(cwFm.wk)return;cwFm.wk=CW_WK.slice();CW_WK.forEach((subs,i)=>{if(Array.isArray(subs))CW_WK[i]=subs.filter(s=>s.kind!=='note'||s.fill||s.until)})}
function cwFmLoosen(){if(!cwFm.wk)return;cwFm.wk.forEach((subs,i)=>{CW_WK[i]=subs});cwFm.wk=null}
/* a visible cursor that travels to the next target before the click */
function cwFmCursor(){let c=document.getElementById('cw-fm-cursor');if(!c){c=document.createElement('div');c.id='cw-fm-cursor';c.setAttribute('aria-hidden','true');c.innerHTML='<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 3l14 9-6 1.5L16 20l-2.5 1-3-6.5L6 18z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';document.body.appendChild(c)}return c}
function cwFmCursorTick(st){const c=cwFmCursor();if(!st.on||!st.film||st.phase!=='play'||!st.watch){c.style.display='none';cwFm.curEl=null;return}
 const {cur}=cwWkSub();let el=cur&&cur.find?cwWkFind(cur.find):null;if(el&&ui.modal&&!el.closest('#modal-layer'))el=document.querySelector('#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]');
 if(!el){c.style.display='none';cwFm.curEl=null;return}
 const r=el.getBoundingClientRect();if(!r.width){c.style.display='none';return}
 const x=r.left+Math.min(r.width-8,Math.max(10,r.width*0.6)),y=r.top+r.height*0.62;
 if(c.style.display==='none'){c.style.transition='none';c.style.left=(x-60)+'px';c.style.top=(y+40)+'px';c.style.display='block';void c.offsetWidth;c.style.transition=''}
 if(el!==cwFm.curEl){cwFm.curEl=el;cwFm.curAt=Date.now();const sp=(st.speed||1)*(st.pace||1);cwStTick.last=Date.now()+900-3000/sp}
 c.style.left=x+'px';c.style.top=y+'px'}
document.addEventListener('click',e=>{const st=cwStS();if(!st.on||!st.film)return;const c=document.getElementById('cw-fm-cursor');if(c&&c.style.display!=='none'){c.classList.remove('click');void c.offsetWidth;c.classList.add('click')}},true);
/* after a click lands, the training cut explains what GeeVee did from it, with the result on screen, before the next click */
function cwFmAfterTick(st){if(!st.on||!/train/.test(st.film||'')||st.phase!=='play'||st.paused)return false;const cut=cwFm.saved&&cwFm.saved.cut;if(!cut||!cut.after)return false;
 const s=cwDmS();const {i}=cwWkSub();const key=s.step+':'+i;
 if(cwFm.lastKey&&cwFm.lastKey!==key){const line=cut.after[cwFm.lastKey];if(line&&!cwFm.afterSaid[cwFm.lastKey]){cwFm.afterSaid[cwFm.lastKey]=1;cwFm.afterPending={key:cwFm.lastKey,line,at:Date.now(),started:false}}}
 cwFm.lastKey=key;const ap=cwFm.afterPending;if(!ap)return false;
 if(!ap.started){if(Date.now()-ap.at<900)return true;ap.started=true;cwVoSay(ap.line,'after:'+ap.key);return true}
 if(cwVo.busy||Date.now()-(cwVo.endedAt||0)<1400/((st.speed||1)*(st.pace||1)))return true;
 cwFm.afterPending=null;cwStTick.last=Date.now();return false}
{const prev=cwStTick;cwStTick=function(){const st=cwStS();const cut=st.on&&st.film&&st.film!=='record-full';if(cut)cwFmApply(st.film);if(!cut&&cwFm.saved)cwFmRestore();document.body.classList.toggle('cw-film-record',!!(st.on&&/^record/.test(st.film||'')));
 if(st.on&&st.film&&st.phase==='outcome'&&st.stopAfter!==undefined&&st.ch===st.stopAfter&&cwVo.key==='out:'+st.ch&&!cwVo.busy&&Date.now()-(cwVo.endedAt||0)>2500){doAction('cwStEnd');return}
 if(cwFmAfterTick(st)){cwVoCaption();try{cwFmCursorTick(st)}catch(e){}return}
 const r=prev();try{cwFmCursorTick(cwStS())}catch(e){}return r}}
/* modes: short (film cut, recorded voice) · train (training cut, recorded voice) · record / record-train / record-full (silent, logged for tools/film.js).
   An optional chapter: "record-train|3" starts at chapter 3 and ends after its outcome card. */
cwOn('cwStFilm',arg=>{const [mode,chap]=String(arg||'short').split('|');const m=/^(record|record-train|record-full|train|short)$/.test(mode)?mode:'short';
 doAction('cwStStart','watch');const st=cwStS();st.film=m;if(m!=='record-full')cwFmApply(m);
 const train=/train/.test(m);st.pace=train?1.25:2;if(!train)cwFmTighten();else cwFmLoosen();
 if(chap!==undefined&&chap!==''){const ch=Math.max(0,Math.min(CW_STORY.length-1,Number(chap)-1));if(ch>0){doAction('cwStJump',String(ch));if(CW_ACT.cwStWatch)doAction('cwStWatch');cwStS().watch=true}st.stopAfter=ch}else delete st.stopAfter;
 cwFm.lastKey=null;cwFm.afterPending=null;cwFm.afterSaid={};cwVoStop();cwVo.key='';cwVo.text='';cwVo.said={};persist();render()});
{const prev=CW_ACT.cwStEnd;cwOn('cwStEnd',()=>{const r=prev();const st=cwStS();st.pace=1;st.film='';delete st.stopAfter;cwFmRestore();cwFmLoosen();try{cwFmCursor().style.display='none'}catch(e){}return r})}
{const prev=CW_ACT.cwStStart;cwOn('cwStStart',m=>{const st=cwStS();if(!cwFm.saved)st.film='';return prev(m)})}
{const r=CW_ROUTES.find(x=>x.pattern==='/start');if(r){const prev=r.def.render;r.def.render=function(ctx){return prev(ctx).replace('<div class="cw-st-chapters">',`<div class="cw-st-film">${cwBtn(ico('play','sm')+' Learn it click by click (5 videos)','cwStFilm','train','')}${cwBtn(ico('play','sm')+' Watch the short version (7 min)','cwStFilm','short','')}<span class="tiny muted">${window.DOMA_VO&&window.DOMA_VO.voices?'Recorded narration.':'Browser voice. Recorded narration needs the audio folder.'}</span></div><div class="cw-st-chapters">`)}}}
