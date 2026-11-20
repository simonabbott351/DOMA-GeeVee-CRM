'use strict';
/* Voiceover (19 Nov 2026): a scripted narration that talks through the story and explains how the CRM works.
   Spoken with the browser's own voice (offline), shown as captions, paced so watch mode clicks only when the line is done,
   and printable as a script at /script for a presenter who would rather read it. Prefix cwVo. */
const CW_VO={
 open:'This is DOMA, the Collings CRM, rebuilt with GeeVee. Every page of the current CRM is here, on one record. The difference is GeeVee. It listens to the agent\'s calls and recaps, and does the work that follows: booking, drafting, filing, chasing, reporting. Anything that leaves the office, a text, an email, a document, a listing, waits for the agent to tap approve. Five chapters, about ten minutes.',
 ch:[
  'Chapter one. A call becomes a listing. A seller lead has come in from Facebook. The rule at Collings is simple: a new seller lead is always a call from the agent, inside twenty four hours. GeeVee never messages them first. Watch what one call does.',
  'Chapter two. Live by Saturday. Outside suppliers get a booking email they confirm from. Publishing leaves the office, so it sits behind the Victorian checklist and a protected approval. And the street hears about the listing the day it goes live.',
  'Chapter three. Saturday to sold. From the open home to the signed contract, nobody fills in a form. Buyers are ranked, offers are recorded from calls, the contract is filled from the result.',
  'Chapter four. The money. Where the agent lands this year, what closes the gap, and a database that works itself.',
  'Chapter five. The office. Where the week is leaking money, by agent, before it costs anything. And the end of the day in one tap.'],
 step:{
  0:'This is Today. The only list an agent needs. Everything GeeVee has prepared sits here in order: offers first, then replies, calls and approvals. Each card is a decision, not a form. The written offer is at the top because offers are urgent.',
  1:'Helen Vu enquired overnight. The clock shows the hours left under the twenty four hour rule. The agent calls her from DOMA, so GeeVee hears the call.',
  3:'After the appraisal, in the car, the agent tells GeeVee what was agreed. Price, commission, method, marketing budget, photo day. That recap is the whole data entry for a listing. GeeVee checks the ten percent price rule and fills in the sales authority.',
  4:'Documents to a vendor are protected. They wait on Today until the agent checks and approves. One tap, and it goes to Helen and Mark for electronic signing. GeeVee chases if it is not signed in time.',
  5:'This is what the vendor sees on their phone. The moment both sign, GeeVee files the authority, creates the listing, emails the photographer, and drafts the campaign and the Property Price Statement.',
  6:'The photographer confirms from the email. After the shoot they deliver from the same link. GeeVee files the photos, picks the hero image, writes the listing copy from the recorded facts, and picks three comparable sales for the price statement.',
  7:'Go live runs the Victorian checklist. Signed authority. Price statement with three comparables. Advertised price inside ten percent and not below the estimate. Vendor identity sighted. Photos. Approved copy. Then it waits for the agent. On approval it publishes, books the first open home, and sets the auction with a reserve reminder.',
  17:'The moment a listing goes live, GeeVee writes to the street. A letter to forty doors, a text to the owners who gave permission, a door knock booked before the open home, and the owners with selling signals put on Today as calls. Every appraisal that comes back is tracked to the listing that started it.',
  16:'Open home day. The buyers who enquired during the week are already on the list. At the door, the agent checks people in on a phone, or they scan the code. When the session closes, every warm buyer gets a text for approval, the vendor gets the numbers, and if two buyers raised the price, the price conversation goes on Today as a call.',
  8:'GeeVee ranks the buyers to call first: offers, enquiries, open home interest, portal views, and whether their finance is ready. An offer heard on a call becomes an offer record with its conditions. Presenting it to the vendor is a protected approval.',
  9:'The vendor\'s decision is dictated. Acceptance fills the Contract of Sale from the offer. Both parties sign on their phones. Sold: the contract is filed, deposit and settlement go in the diary, the sold price task is set under the seven day rule, and the buyers who missed out get a text.',
  19:'For an auction the law needs a bidders record and a reserve in writing. Bidders are registered with ID. The reserve letter goes to the vendor to sign. After the result, sold under the hammer flows straight into the contract. Passed in puts the negotiation on Today. No bids puts the vendor debrief on Today as a call.',
  10:'The forecast shows what is earned, booked and in the pipeline, against the agent\'s target. The gap becomes a number of appraisals, and a list of the owners most likely to say yes. Today is ordered by expected fee as well as urgency.',
  11:'Every owner gets a rhythm: a market update, an anniversary note, a what is it worth now. GeeVee watches for selling signals and turns the strong ones into calls. Touches go only to owners with permission evidence. Do not contact owners get nothing.',
  20:'The vendor has their own page. Views, enquiries, open home numbers, the next step, documents and reports. Offer amounts never show there. A question from the vendor lands on the agent\'s Today.',
  18:'The principal\'s page. Seller leads past twenty four hours. Live listings with no activity in a week. Approvals waiting more than a day. Compliance gaps. Slipped tasks. By agent. Every row opens the record, and GeeVee names who to talk to today.',
  12:'Seven of the same approval is one tap. Delegation is a sentence: ask Priya to call the open home buyers, remind me Friday. If it slips, it comes back to the agent.',
  21:'At five, close the day. What got done, what slipped moves to tomorrow, and tomorrow in order with travel time. Driving mode for the car. Keys for the desk.',
  2:'The night before, the appraisal pack is ready to print: comparable sales, price evidence inside the ten percent rule, the marketing plan, the checklist. Nothing was typed to make it.',
  13:'The weekly vendor report is written from the real campaign numbers. When the market says the price is wrong, GeeVee scripts the conversation. That is a call from the agent, never a message.',
  14:'Everything GeeVee does, the agent can do by hand. The current CRM asks forty one fields for a listing. This asks nine, in three short steps, and fills the rest from the property database.',
  15:'Everything that leaves DOMA is simulated in this prototype. This page is the build list: the phone line and transcription first, then permissions and the audit log, then the gateways, signing and portals.'},
 sub:{'1:3':'GeeVee is transcribing as they talk.','1:4':'GeeVee heard an appraisal for Thursday at two, a co-owner called Mark, a price expectation, and a text the agent promised. Untick anything wrong and save. The appraisal is booked with travel time, the pack is prepared, and the text goes to Today for approval.','3:3':'Saved. Internal work is done at once, with undo. The authority is on Today for approval.','5:2':'A typed signature, a tick, sign. Then the co-owner.','7:4':'All checks passed. Request go-live, then approve it from the bell.','8:1':'Jordan Park is first. An offer on an earlier call, open home interest, and finance pre-approved.','16:2':'HOT, warm or cold. That one tap decides who gets called tomorrow.','19:6':'Sold under the hammer. The contract, the diary and the under-bidders follow on their own.','21:0':'One tap closes the day.'},
 out:['That was two conversations and eight taps. The agent did not type a form.','Photos to portals in one approval, and forty neighbours written to. Every listing becomes the next appraisal.','No offer form, no contract typed, no buyer forgotten.','Prospecting that happens even on a busy week.','The principal sees the problem the morning it starts.'],
 end:'That is the story. Two calls, one recap, a handful of taps. Everything on one record. Nothing sent, signed or published without a tap. What it takes to build is on the Integrations page: the phone line and transcription first, then permissions and the audit log. Those two decide whether the rest is possible.'};
const cwVo={busy:false,key:'',text:'',timer:null,voice:null};
function cwVoVoice(){if(cwVo.voice)return cwVo.voice;try{const vs=speechSynthesis.getVoices();cwVo.voice=vs.find(v=>/en-AU/i.test(v.lang)&&/natural|neural|online/i.test(v.name))||vs.find(v=>/en-AU/i.test(v.lang))||vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}catch(e){}return cwVo.voice}
function cwVoSay(text,key){const st=cwStS();if(!text||key===cwVo.key)return;cwVo.key=key;cwVo.text=text;cwVoCaption();
 const speed=st.speed||1;const words=text.split(/\s+/).length;const ms=Math.max(1800,words*400/speed);clearTimeout(cwVo.timer);cwVo.busy=true;const finish=()=>{cwVo.busy=false;cwVo.endedAt=Date.now()};cwVo.timer=setTimeout(finish,ms);
 if(!st.voice||!window.speechSynthesis)return;try{speechSynthesis.cancel();const v=cwVoVoice();const parts=text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)||[text];let left=parts.length;
  for(const p of parts){const u=new SpeechSynthesisUtterance(p.trim());if(v)u.voice=v;u.rate=0.95*speed;u.pitch=1;u.onend=()=>{left--;if(left<=0){clearTimeout(cwVo.timer);setTimeout(finish,400)}};u.onerror=()=>{left--;if(left<=0)finish()};speechSynthesis.speak(u)}}catch(e){}}
function cwVoStop(){clearTimeout(cwVo.timer);cwVo.busy=false;try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}}
/* pause, resume, speed, skip, stop */
cwOn('cwStPause',()=>{const st=cwStS();st.paused=!st.paused;if(st.paused){try{if(window.speechSynthesis)speechSynthesis.pause()}catch(e){}clearTimeout(cwVo.timer)}else{let resumed=false;try{if(window.speechSynthesis&&speechSynthesis.paused){speechSynthesis.resume();resumed=true}}catch(e){}if(!resumed){cwVo.key='';cwVo.busy=false}}persist();cwVoBar()});
cwOn('cwStSpeed',v=>{const st=cwStS();st.speed=Number(v)||1;persist();cwVo.key='';cwVoStop();cwVoBar()});
cwOn('cwStSkip',()=>{const st=cwStS();cwVoStop();cwVo.key='';if(st.phase==='title'){doAction('cwStPlay');return}if(st.phase==='outcome'){doAction('cwStNextChapter');return}const {done}=cwWkSub();if(done)doAction('cwDmNext','1');else doAction('cwWkNext')});
function cwVoBar(){const st=cwStS();let el=document.getElementById('cw-vo-bar');if(!st.on){if(el)el.remove();return}if(!el){el=document.createElement('div');el.id='cw-vo-bar';el.className='cw-vo-bar';el.setAttribute('role','toolbar');el.setAttribute('aria-label','Demo controls');document.body.appendChild(el)}
 const sp=st.speed||1;const b=(label,action,id,cls)=>`<button type="button" class="cw-vo-btn ${cls||''}" data-action="${action}" data-id="${h(id||'')}">${label}</button>`;
 el.innerHTML=`${b(st.paused?ico('play','sm')+' Resume':'<b>II</b> Pause','cwStPause','',st.paused?'on':'')}<span class="cw-vo-sp">${b('Slower','cwStSpeed','0.7',sp<0.9?'on':'')}${b('Normal','cwStSpeed','1',sp>=0.9&&sp<1.2?'on':'')}${b('Faster','cwStSpeed','1.4',sp>=1.2?'on':'')}</span>${b('Skip','cwStSkip','','')}${b(ico('close','sm')+' Stop','cwStEnd','','stop')}<span class="cw-vo-hint">Space pauses</span>`}
document.addEventListener('keydown',e=>{const st=cwStS();if(!st.on)return;const t=e.target;if(t&&(['INPUT','TEXTAREA','SELECT'].includes(t.tagName)||t.isContentEditable))return;if(e.key===' '){e.preventDefault();doAction('cwStPause')}});
function cwVoCaption(){const st=cwStS();let el=document.getElementById('cw-vo-cap');if(!st.on||st.cap===false||!cwVo.text){if(el)el.style.display='none';return}if(!el){el=document.createElement('div');el.id='cw-vo-cap';el.className='cw-vo-cap';el.setAttribute('aria-live','polite');document.body.appendChild(el)}el.style.display='block';if(el.textContent!==cwVo.text)el.textContent=cwVo.text}
cwStStop=cwVoStop;cwStSay=function(){};
cwOn('cwStCap',()=>{const st=cwStS();st.cap=st.cap===false?true:false;persist();cwVoCaption();render()});
/* the tick: narrate, caption, and in watch mode click only when the line is finished */
cwStTick=function(){const st=cwStS();const s=cwDmS();document.body.classList.toggle('cw-story',!!st.on);document.body.classList.toggle('cw-story-card',!!st.on&&st.phase!=='play');document.body.classList.toggle('cw-story-paused',!!(st.on&&st.paused));if(!st.on){cwVoCaption();cwVoBar();return}
 if(!document.getElementById('cw-vo-bar'))cwVoBar();
 const tm=document.querySelector('.cw-st-time');if(tm)tm.textContent=cwStElapsed();
 const c=CW_STORY[st.ch];if(!c)return;const now=Date.now();const sp=st.speed||1;
 if(st.paused){cwVoCaption();return}
 if(st.phase==='title'){const first=st.ch===0&&!st.openSaid;cwVoSay((first?CW_VO.open+' ':'')+CW_VO.ch[st.ch],'ch:'+st.ch);if(first)st.openSaid=true;if(st.watch&&!cwVo.busy&&now-(cwVo.endedAt||0)>2000/sp&&now-(cwStTick.card||0)>1200){cwStTick.card=now;doAction('cwStPlay')}return}
 if(st.phase==='outcome'){cwVoSay('What just happened. '+c.out.join('. ')+'. '+(CW_VO.out[st.ch]||c.saved),'out:'+st.ch);if(st.watch&&!cwVo.busy&&now-(cwVo.endedAt||0)>4000/sp&&now-(cwStTick.card||0)>2500){cwStTick.card=now;doAction('cwStNextChapter')}return}
 if(st.phase==='end'){cwVoSay(CW_VO.end,'end');return}
 const {cur,done,i}=cwWkSub();
 const line=CW_VO.sub[s.step+':'+i];
 if(cur&&line)cwVoSay(line,'sub:'+s.step+':'+i);else if(CW_VO.step[s.step])cwVoSay(CW_VO.step[s.step],'st:'+s.step);
 if(!st.watch||ui.gvVoiceActive||cwVo.busy)return;
 if(now-(cwVo.endedAt||0)<1600/sp)return;
 if(now-(cwStTick.last||0)<(cur&&cur.kind==='note'?3600:3000)/sp)return;cwStTick.last=now;
 if(done){if(st.idx>=c.steps.length-1)doAction('cwStOutcome');else doAction('cwDmNext','1');return}
 if(!cur)return;
 if(cwWkStepDone(s.step)&&cwWkSub().i===0){doAction('cwWkForce');return}
 if(cur.until){let u=false;try{u=!!cur.until()}catch(e){}if(u)return}
 if(cur.kind==='go'){doAction('cwWkGo',cur.route);return}
 if(cur.kind==='type'){doAction('cwWkType');return}
 if(cur.kind==='note'){doAction(cur.fill?'cwWkFill':'cwWkNext');return}
 let el=cwWkFind(cur.find);if(el&&ui.modal&&!el.closest('#modal-layer'))el=document.querySelector('#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]');
 if(el){try{el.scrollIntoView({block:'center'})}catch(e){}el.click()}else if(now-(cwStTick.missAt||0)>6000){cwStTick.missAt=now;doAction('cwDmGo',String(s.step))}};
/* captions and the caption toggle in the panel strip */
{const prev=cwDmPanel;cwDmPanel=function(){let html=prev();const st=cwStS();if(!st.on||st.phase!=='play')return html;return html.replace('<button type="button" class="cw-dm-x" data-action="cwStVoice"',`<button type="button" class="cw-dm-x cw-vo-cc ${st.cap===false?'':'on'}" data-action="cwStCap" title="${st.cap===false?'Captions off':'Captions on'}" aria-label="${st.cap===false?'Turn captions on':'Turn captions off'}">CC</button><button type="button" class="cw-dm-x ${st.voice?'on':''}" data-action="cwStVoice"`)}}
/* reset the spoken keys when the chapter or step changes */
{const prevPlay=CW_ACT.cwStPlay;cwOn('cwStPlay',()=>{cwVoStop();cwVo.key='';return prevPlay()});const prevNextCh=CW_ACT.cwStNextChapter;cwOn('cwStNextChapter',()=>{cwVoStop();cwVo.key='';return prevNextCh()});const prevStart=CW_ACT.cwStStart;cwOn('cwStStart',m=>{cwVoStop();cwVo.key='';cwVo.text='';const r=prevStart(m);cwStS().openSaid=false;cwStS().cap=true;cwStS().paused=false;cwStS().speed=cwStS().speed||1;cwVoBar();return r});const prevEnd=CW_ACT.cwStEnd;cwOn('cwStEnd',()=>{cwVoStop();cwVo.text='';cwStS().paused=false;cwVoCaption();const r=prevEnd();cwVoBar();return r});const prevDeep=CW_ACT.cwStDeep;cwOn('cwStDeep',()=>{cwVoStop();cwVo.text='';const r=prevDeep();cwVoBar();return r})}
/* the printable script */
cwPage('/script',{title:'Demo script',group:'dash',noAI:true,render(){return `${cwHeader('Demo script','The voiceover, word for word, in case you would rather say it yourself. Chapter by chapter, step by step.',cwBtn(ico('file','sm')+' Print','cwDmPrint','','')+cwGoBtn('Start the demo','/start','primary'))}
 <div class="cw-dm-brief cw-vo-script"><section><h2>Opening</h2><p>${h(CW_VO.open)}</p></section>
 ${CW_STORY.map((c,i)=>`<section><h2>Chapter ${i+1}: ${h(c.t)}</h2><p>${h(CW_VO.ch[i])}</p>${c.steps.map(sIdx=>{const st=CW_DEMO_STEPS[sIdx];const subs=Object.entries(CW_VO.sub).filter(([k])=>k.startsWith(sIdx+':'));return `<h3>${h(st?.t||'Step '+(sIdx+1))}</h3><p>${h(CW_VO.step[sIdx]||'')}</p>${subs.map(([,t])=>`<p class="cw-vo-aside">${h(t)}</p>`).join('')}`}).join('')}<p><b>What just happened:</b> ${h(c.out.join('. '))}. ${h(CW_VO.out[i]||c.saved)}</p></section>`).join('')}
 <section><h2>Close</h2><p>${h(CW_VO.end)}</p></section></div>`}});
{const r=CW_ROUTES.find(x=>x.pattern==='/start');if(r){const prev=r.def.render;r.def.render=function(ctx){return prev(ctx).replace('Deep dive: all 22 steps','Deep dive: all 22 steps').replace('</p></div>\n <div class="cw-st-chapters">',`${cwGoBtn('Read the script','/script','sm ghost')}</p></div>\n <div class="cw-st-chapters">`)}}}
{const g=CW_GROUPS.find(x=>x.id==='dash');if(g&&!g.pages.some(p=>p[1]==='/script'))g.pages.push(['Demo script','/script'])}
if(window.speechSynthesis)try{speechSynthesis.onvoiceschanged=()=>{cwVo.voice=null}}catch(e){}
/* the voice stops the moment the page is closed, hidden or left, and never speaks on load */
{const hush=()=>{try{if(window.speechSynthesis){speechSynthesis.cancel();speechSynthesis.cancel()}}catch(e){}clearTimeout(cwVo.timer);cwVo.busy=false};
 window.addEventListener('pagehide',hush);window.addEventListener('beforeunload',hush);window.addEventListener('unload',hush);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();const st=cwStS();if(st.on&&!st.paused&&st.watch){st.paused=true;cwVo.key='';try{cwVoBar()}catch(e){}}}});
 hush()}
