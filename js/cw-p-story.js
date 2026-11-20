'use strict';
/* Story mode (19 Nov 2026): the demo as five chapters around the live product. A start screen, a title card per chapter,
   the same guided clicks, an outcome card per chapter, a watch mode that performs the clicks itself, optional narration,
   and the noise hidden while it runs. The 22-step guide stays as the deep dive. Prefix cwSt. */
const CW_STORY=[
 {t:'A call becomes a listing',promise:'The agent makes two calls and one recap. GeeVee does everything in between.',num:'8 taps',numSub:'from seller lead to signed authority',mins:4,steps:[0,1,3,4,5],
  out:['The appraisal booked from the call, with travel time and the pack ready to print','The sales authority filled in from one dictated recap, approved in one protected tap','Both vendors signed on their phones; the listing, the photographer booking, the campaign and the price statement followed on their own'],saved:'About three hours of admin per listing, and nothing typed twice.'},
 {t:'Live by Saturday',promise:'Photos to the portals in one protected approval. The street hears about it the same day.',num:'40 doors',numSub:'written to the day it goes live',mins:3,steps:[6,7,17],
  out:['Photos filed, hero picked, listing copy written and three comparables chosen when the photographer delivered','The Victorian checklist passed before publishing: authority, price statement, 10% rule, vendor ID','The first open home booked, and 40 neighbours written to with a door knock before it'],saved:'Every listing becomes the next appraisal.'},
 {t:'Saturday to sold',promise:'Every buyer ranked, every offer in writing, the contract filled from the result.',num:'0 forms',numSub:'between the open home and the signed contract',mins:4,steps:[16,8,9,19],
  out:['The week\'s enquirers pre-registered at the door; the vendor texted the numbers an hour after close','An offer heard on a call recorded with its conditions and presented in writing','Accepted, contract filled and signed, sold; or at auction: bidders record, reserve signed, sold under the hammer, under-bidders texted'],saved:'No offer form, no contract typed, no buyer forgotten.'},
 {t:'The money',promise:'Where the agent lands this year, what closes the gap, and who to call first.',num:'1 number',numSub:'the gap, as appraisals and names',mins:2,steps:[10,11,20],
  out:['The forecast turns the gap to target into a number of appraisals and a ranked list of owners','The database works itself: a rhythm for every owner and a call when a selling signal shows','The vendor sees their own campaign and asks questions without a phone call'],saved:'Prospecting that happens even on a busy week.'},
 {t:'The office',promise:'Where the week is leaking, by agent, before it costs anything.',num:'5 leaks',numSub:'checked every day',mins:2,steps:[18,12,21],
  out:['Seller leads past 24 hours, quiet listings, approvals waiting, compliance gaps and slipped tasks, each row opening the record','Seven of the same approval in one tap; delegation in a sentence','The day closed: what got done, what moved, tomorrow in order'],saved:'The principal sees the problem the morning it starts.'}];
function cwStS(){const s=cwDmS();s.story??={on:false,ch:0,phase:'title',idx:0,watch:false,voice:false,startedAt:'',done:false};return s.story}
let cwStPrevPanel=cwDmPanel,cwStTimer=null,cwStSpoken='';
function cwStChapterOf(step){return CW_STORY.findIndex(c=>c.steps.includes(step))}
function cwStElapsed(){const st=cwStS();if(!st.startedAt)return '0:00';const s=Math.max(0,Math.round((Date.now()-Date.parse(st.startedAt))/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function cwStSay(text){const st=cwStS();if(!st.on||!st.voice||!window.speechSynthesis||!text||text===cwStSpoken)return;cwStSpoken=text;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const v=speechSynthesis.getVoices().find(x=>/en-AU/i.test(x.lang))||speechSynthesis.getVoices().find(x=>/en-GB|en-US/i.test(x.lang));if(v)u.voice=v;u.rate=1.02;speechSynthesis.speak(u)}catch(e){}}
function cwStStop(){try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}}
/* start and flow */
cwOn('cwStStart',mode=>{const s=cwDmS();const st=cwStS();cwDmReset();Object.assign(cwStS(),{on:true,ch:0,phase:'title',idx:0,watch:mode==='watch',voice:mode==='watch',startedAt:cwNowISO(),done:false});cwDmS().on=true;cwDmS().collapsed=false;persist();render();void s;void st});
cwOn('cwStChapter',i=>{const st=cwStS();st.ch=Number(i)||0;st.phase='title';st.idx=0;persist();render()});
cwOn('cwStPlay',()=>{const st=cwStS();const c=CW_STORY[st.ch];if(!c)return;st.phase='play';st.idx=0;const s=cwDmS();s.on=true;s.collapsed=false;s.sub=0;persist();cwStSpoken='';doAction('cwDmGo',String(c.steps[0]))});
cwOn('cwStWatch',()=>{const st=cwStS();st.watch=true;st.voice=true;persist();if(st.phase==='title')doAction('cwStPlay');else render()});
cwOn('cwStDrive',()=>{const st=cwStS();st.watch=false;persist();cwStStop();render()});
cwOn('cwStVoice',()=>{const st=cwStS();st.voice=!st.voice;if(!st.voice)cwStStop();persist();render()});
cwOn('cwStOutcome',()=>{const st=cwStS();st.phase='outcome';persist();cwStStop();ui.modal=null;render()});
cwOn('cwStNextChapter',()=>{const st=cwStS();if(st.ch>=CW_STORY.length-1){st.phase='end';st.done=true;persist();render();return}st.ch++;st.phase='title';st.idx=0;persist();render()});
cwOn('cwStEnd',()=>{const st=cwStS();st.on=false;st.watch=false;cwStStop();cwDmS().on=false;persist();navigate('today')});
cwOn('cwStDeep',()=>{const st=cwStS();st.on=false;st.watch=false;cwStStop();cwDmS().on=true;persist();cwGo('/demo')});
/* next and back inside a chapter */
{const prevNext=CW_ACT.cwDmNext;cwOn('cwDmNext',d=>{const st=cwStS();if(!st.on||st.phase!=='play')return prevNext(d);const c=CW_STORY[st.ch];const n=st.idx+Number(d);if(n<0)return;if(n>=c.steps.length){doAction('cwStOutcome');return}st.idx=n;cwDmS().sub=0;persist();doAction('cwDmGo',String(c.steps[n]))});
 const prevGo=CW_ACT.cwDmGo;cwOn('cwDmGo',i=>{const st=cwStS();if(st.on&&st.phase==='play'){const c=CW_STORY[st.ch];const k=c.steps.indexOf(Number(i));if(k>=0)st.idx=k}return prevGo(i)});
 const prevToggle=CW_ACT.cwDmToggle;cwOn('cwDmToggle',()=>{const st=cwStS();const s=cwDmS();if(st.on){s.collapsed=!s.collapsed;persist();render();return}if(!s.on){cwGo('/start');return}return prevToggle()});
 const prevOff=CW_ACT.cwDmOff;cwOn('cwDmOff',()=>{const st=cwStS();if(st.on){st.on=false;st.watch=false;cwStStop()}return prevOff()})}
/* in story mode the fast-forward follows the story order, not the step numbers */
{const prevPrep=cwWkPrep;cwWkPrep=function(i){const st=cwStS();if(!st.on||st.phase!=='play')return prevPrep(i);const c=CW_STORY[st.ch];const k=c?c.steps.indexOf(Number(i)):-1;const order=[];for(let x=0;x<st.ch;x++)order.push(...CW_STORY[x].steps);if(c&&k>0)order.push(...c.steps.slice(0,k));
 let n=0;for(const s of order){try{if(cwWkEnsure(s))n++}catch(e){console.warn('story prep',s,e)}}if(n){persist();setTimeout(()=>{if(ui.modal&&ui.modal.type==='cw'&&ui.modal.name==='jnDid'){ui.modal=null;render()}},60)}return n}}
/* the start screen */
cwPage('/start',{title:'Start the demo',group:'dash',bare:true,noAI:true,render(){return `<div class="cw-st-start"><div class="cw-st-hero"><span class="gv-eyebrow">COLLINGS · DOMA V2 WITH GEEVEE</span><h1>The CRM that does the work between conversations.</h1><p>Every screen of the current Collings CRM, rebuilt on one record, with GeeVee listening to the agent's calls and doing what follows: booking, drafting, filing, chasing, reporting. Agents approve things and go to appointments.</p>
 <div class="cw-st-nums"><div><b>2 calls, 1 recap</b><span>from a seller lead to a signed authority. Eight taps.</span></div><div><b>7 days</b><span>from signed to live, with the street written to on the day.</span></div><div><b>24 hours</b><span>every seller lead called, or it goes to the principal.</span></div></div>
 <div class="cw-st-cta">${cwBtn(ico('play','sm')+' Watch the story (10 min)','cwStStart','watch','primary big')}${cwBtn(ico('mic','sm')+' Drive it yourself','cwStStart','drive','big')}</div>
 <p class="cw-st-foot">Five chapters. You can take over or pause at any point. ${cwBtn('Deep dive: all 22 steps','cwStDeep','','sm ghost')}</p></div>
 <div class="cw-st-chapters">${CW_STORY.map((c,i)=>`<button type="button" class="cw-st-chip" data-action="cwStJump" data-id="${i}"><i>${i+1}</i><span><b>${h(c.t)}</b><small>${h(c.promise)}</small></span><em>${c.mins} min</em></button>`).join('')}</div></div>`}});
cwOn('cwStJump',i=>{const st=cwStS();if(!st.on){cwDmReset();Object.assign(cwStS(),{on:true,watch:false,voice:false,startedAt:cwNowISO(),done:false})}Object.assign(cwStS(),{ch:Number(i)||0,phase:'title',idx:0});cwDmS().on=true;cwDmS().collapsed=false;persist();render()});
{const g=CW_GROUPS.find(x=>x.id==='dash');if(g&&!g.pages.some(p=>p[1]==='/start'))g.pages.push(['Start the demo','/start'])}
/* cards and the panel */
function cwStCard(){const st=cwStS();const c=CW_STORY[st.ch];if(!c)return '';
 if(st.phase==='title')return `<div class="cw-st-overlay" role="dialog" aria-label="Chapter ${st.ch+1}"><div class="cw-st-card"><span class="cw-st-k">CHAPTER ${st.ch+1} OF ${CW_STORY.length} · ABOUT ${c.mins} MIN</span><h1>${h(c.t)}</h1><p class="cw-st-promise">${h(c.promise)}</p><div class="cw-st-num"><b>${h(c.num)}</b><span>${h(c.numSub)}</span></div><div class="cw-st-acts">${cwBtn(ico('play','sm')+(st.watch?' Watch this chapter':' Start this chapter'),st.watch?'cwStWatch':'cwStPlay','','primary big')}${st.watch?cwBtn('Drive it myself','cwStPlay','','big'):cwBtn('Watch it for me','cwStWatch','','big')}</div><div class="cw-st-small">${st.ch>0?cwBtn('Previous chapter','cwStChapter',String(st.ch-1),'sm ghost'):''}${cwBtn('Skip chapter','cwStNextChapter','','sm ghost')}${cwBtn('Exit','cwStEnd','','sm ghost')}</div></div></div>`;
 if(st.phase==='outcome')return `<div class="cw-st-overlay" role="dialog" aria-label="What just happened"><div class="cw-st-card"><span class="cw-st-k">CHAPTER ${st.ch+1} · WHAT JUST HAPPENED</span><h1>${h(c.t)}</h1><ul class="cw-st-out">${c.out.map(o=>`<li>${ico('check','sm')}<span>${h(o)}</span></li>`).join('')}</ul><p class="cw-st-saved">${h(c.saved)}</p><div class="cw-st-acts">${cwBtn((st.ch>=CW_STORY.length-1?'Finish':'Next chapter: '+CW_STORY[st.ch+1].t)+' '+ico('arrow','sm'),'cwStNextChapter','','primary big')}${cwBtn('Replay this chapter','cwStPlay','','big')}</div><div class="cw-st-small">${cwBtn('Exit','cwStEnd','','sm ghost')}</div></div></div>`;
 if(st.phase==='end')return `<div class="cw-st-overlay" role="dialog" aria-label="The end"><div class="cw-st-card"><span class="cw-st-k">THAT IS THE STORY · ${cwStElapsed()}</span><h1>Two calls, one recap, a handful of taps.</h1><ul class="cw-st-out">${CW_STORY.map(x=>`<li>${ico('check','sm')}<span><b>${h(x.t)}.</b> ${h(x.saved)}</span></li>`).join('')}</ul><p class="cw-st-saved">Everything you clicked is on one record. Nothing was sent, signed or published; every one of those waited for a tap.</p><div class="cw-st-acts">${cwGoBtn(ico('file','sm')+' The one-page brief','/ceo-brief','primary big')}${cwBtn('Deep dive: all 22 steps','cwStDeep','','big')}</div><div class="cw-st-small">${cwBtn('Back to Today','cwStEnd','','sm ghost')}${cwBtn('Start again','cwStStart','drive','sm ghost')}</div></div></div>`;
 return ''}
cwDmPanel=function(){const st=cwStS();if(!st.on)return cwStPrevPanel();const s=cwDmS();const c=CW_STORY[st.ch];if(!c)return cwStPrevPanel();
 if(st.phase!=='play')return cwStCard();
 let html=cwStPrevPanel();if(s.collapsed)return html.replace('Demo guide · Step','Chapter '+(st.ch+1)+' · step').replace(/of \d+<\/button>/,'of '+c.steps.length+'</button>');
 const strip=`<div class="cw-st-strip"><div class="cw-st-strip-top"><span class="gv-eyebrow">CHAPTER ${st.ch+1} OF ${CW_STORY.length} · ${h(c.t.toUpperCase())}</span><span class="cw-st-time">${cwStElapsed()}</span></div><div class="cw-st-bar">${c.steps.map((x,i)=>`<i class="${i<st.idx?'done':i===st.idx?'now':''}"></i>`).join('')}</div><div class="cw-st-mode">${st.watch?`<span class="cw-st-live">${ico('play','sm')} Watching</span>${cwBtn('Drive from here','cwStDrive','','sm')}`:cwBtn(ico('play','sm')+' Watch it for me','cwStWatch','','sm')}<button type="button" class="cw-dm-x" data-action="cwStVoice" title="${st.voice?'Narration on':'Narration off'}" aria-label="${st.voice?'Turn narration off':'Turn narration on'}">${ico('mic','sm')}</button></div></div>`;
 html=html.replace(/<span class="gv-eyebrow">DEMO GUIDE · STEP \d+ OF \d+<\/span>/,'<span class="gv-eyebrow">STEP '+(st.idx+1)+' OF '+c.steps.length+'</span>');
 html=html.replace('<b>','<b class="cw-st-h">').replace(/<aside class="cw-dm-panel([^"]*)">/,'<aside class="cw-dm-panel$1 cw-st-panel">').replace(/(<aside class="cw-dm-panel[^>]*>)/,'$1'+strip);
 html=html.replace(/data-action="cwDmNext" data-id="1"[^>]*>[^<]*<\/button>/,m=>st.idx>=c.steps.length-1?m.replace(/>[^<]*<\/button>$/,'>See what happened</button>'):m);
 return html};
/* watch mode: perform the current sub-step at a readable pace, narrate */
function cwStTick(){const st=cwStS();const s=cwDmS();document.body.classList.toggle('cw-story',!!st.on);document.body.classList.toggle('cw-story-card',!!st.on&&st.phase!=='play');if(!st.on)return;
 const tm=document.querySelector('.cw-st-time');if(tm)tm.textContent=cwStElapsed();
 if(st.phase==='title')cwStSay('Chapter '+(st.ch+1)+'. '+CW_STORY[st.ch].t+'. '+CW_STORY[st.ch].promise);
 else if(st.phase==='outcome')cwStSay('What just happened. '+CW_STORY[st.ch].out.join('. ')+'. '+CW_STORY[st.ch].saved);
 if(st.phase!=='play')return;
 const {cur,done,i}=cwWkSub();const c=CW_STORY[st.ch];
 if(cur)cwStSay(cur.t);else if(done)cwStSay(i>=1?'Done. Next.':'');
 if(!st.watch||ui.gvVoiceActive)return;
 const now=Date.now();if(now-(cwStTick.last||0)<(cur&&cur.kind==='note'?3600:2200))return;cwStTick.last=now;
 if(done){if(st.idx>=c.steps.length-1)doAction('cwStOutcome');else doAction('cwDmNext','1');return}
 if(!cur)return;
 if(cwWkStepDone(s.step)&&cwWkSub().i===0){doAction('cwWkForce');return}
 if(cur.until){let u=false;try{u=!!cur.until()}catch(e){}if(u)return}
 if(cur.kind==='go'){doAction('cwWkGo',cur.route);return}
 if(cur.kind==='type'){doAction('cwWkType');return}
 if(cur.kind==='note'){doAction(cur.fill?'cwWkFill':'cwWkNext');return}
 let el=cwWkFind(cur.find);if(el&&ui.modal&&!el.closest('#modal-layer'))el=document.querySelector('#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]');
 if(el){try{el.scrollIntoView({block:'center'})}catch(e){}el.click()}else if(now-(cwStTick.missAt||0)>6000){cwStTick.missAt=now;doAction('cwDmGo',String(s.step))}}
cwStTimer=setInterval(()=>{try{cwStTick()}catch(e){console.warn('story',e)}},250);
/* quiet while the story runs */
{const prevToast=toast;toast=function(msg,...rest){if(cwStS().on&&/Earlier steps were applied|Reviewed in demo|Approved in the demo/.test(String(msg||'')))return;return prevToast(msg,...rest)}}
{const prevShell=shell;shell=function(){let html=prevShell();const st=cwStS();if(st.on)html=html.replace('<span> Demo guide</span>','<span> Story</span>');else html=html.replace('<span> Demo guide</span>','<span> Demo</span>');return html}}
/* the brief opens with the five chapters */
{const r=CW_ROUTES.find(x=>x.pattern==='/ceo-brief');if(r){const prev=r.def.render;r.def.render=function(ctx){const html=prev(ctx);return html.replace('<div class="cw-dm-brief">','<div class="cw-dm-brief"><section><h2>The story in five chapters</h2><ol>'+CW_STORY.map(c=>'<li><b>'+h(c.t)+'.</b> '+h(c.promise)+' <i>'+h(c.saved)+'</i></li>').join('')+'</ol></section>')}}}
/* the deep dive page points at the story */
{const r=CW_ROUTES.find(x=>x.pattern==='/demo');if(r){const prev=r.def.render;r.def.render=function(ctx){return prev(ctx).replace('<div class="cw-dm-steps">',cwNote('<b>Presenting?</b> Use the five-chapter story: a start screen, a title card per chapter, the same clicks, and a watch mode that performs them for you. This page is the deep dive. '+cwGoBtn('Open the story','/start','sm primary'),'info')+'<div class="cw-dm-steps">')}}}
