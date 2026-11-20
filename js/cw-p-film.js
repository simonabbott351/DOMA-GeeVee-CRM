'use strict';
/* Recorded voice and the film cut (20 Nov 2026). The story plays recorded narration (audio/<voice>/*.mp3, listed in
   data/vo-audio.js) instead of the browser's speech engine, and falls back to the engine when a line has no recording.
   The film cut is a shorter story (about six minutes) with one line per step, used for the recorded film and as
   "Watch the short version" on the start page. Prefix cwFm. */
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
{const prev=cwVoVoice;cwVoVoice=function(){return prev()};void prev}

/* ---------- the film cut ---------- */
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
 out:['Two calls, one recap, eight taps. No form typed.','Photos to portals in one approval, and the street written to.','No offer form, no contract typed, no buyer forgotten.','Prospecting that runs on a busy week.','The principal sees the problem the morning it starts.'],
 outLead:'What just happened.',
 end:'That is DOMA with GeeVee. Everything on one record. Nothing sent, signed or published without a tap.'};
const cwFm={saved:null};
function cwFmApply(){if(cwFm.saved)return;cwFm.saved={steps:CW_STORY.map(c=>c.steps),out:CW_STORY.map(c=>c.out),saved:CW_STORY.map(c=>c.saved),vo:{open:CW_VO.open,ch:CW_VO.ch,step:CW_VO.step,sub:CW_VO.sub,out:CW_VO.out,end:CW_VO.end}};
 CW_STORY.forEach((c,i)=>{c.steps=CW_FILM.steps[i];c.out=[CW_FILM.out[i].replace(/\.$/,'')];c.saved=''});CW_VO.open=CW_FILM.open;CW_VO.ch=CW_FILM.ch;CW_VO.step=CW_FILM.step;CW_VO.sub={};CW_VO.out=['','','','',''];CW_VO.end=CW_FILM.end}
function cwFmRestore(){const s=cwFm.saved;if(!s)return;CW_STORY.forEach((c,i)=>{c.steps=s.steps[i];c.out=s.out[i];c.saved=s.saved[i]});Object.assign(CW_VO,s.vo);cwFm.saved=null}
/* in the film cut the outcome card reads "What just happened. <one line>" */
{const prev=cwStTick;cwStTick=function(){const st=cwStS();const cut=st.on&&st.film&&st.film!=='record-full';if(cut&&!cwFm.saved)cwFmApply();if(!cut&&cwFm.saved)cwFmRestore();document.body.classList.toggle('cw-film-record',!!(st.on&&/^record/.test(st.film||'')));return prev()}}
/* modes: short (the cut, recorded voice), record (the cut, silent, logs each line for tools/film.js), record-full (whole story, silent, logged) */
/* recording: the narration keeps its real length, but the gaps between clicks halve and the pure "look here" notes are skipped */
function cwFmTighten(){if(cwFm.wk)return;cwFm.wk=CW_WK.slice();CW_WK.forEach((subs,i)=>{if(Array.isArray(subs))CW_WK[i]=subs.filter(s=>s.kind!=='note'||s.fill||s.until)})}
function cwFmLoosen(){if(!cwFm.wk)return;cwFm.wk.forEach((subs,i)=>{CW_WK[i]=subs});cwFm.wk=null}
cwOn('cwStFilm',mode=>{const m=mode==='record'||mode==='record-full'?mode:'short';doAction('cwStStart','watch');const st=cwStS();st.film=m;if(m!=='record-full')cwFmApply();st.pace=2;cwFmTighten();cwVoStop();cwVo.key='';cwVo.text='';persist();render()});
{const prev=CW_ACT.cwStEnd;cwOn('cwStEnd',()=>{const r=prev();const st=cwStS();st.pace=1;st.film='';cwFmRestore();cwFmLoosen();return r})}
{const prev=CW_ACT.cwStStart;cwOn('cwStStart',m=>{const st=cwStS();if(!cwFm.saved)st.film='';return prev(m)})}
{const r=CW_ROUTES.find(x=>x.pattern==='/start');if(r){const prev=r.def.render;r.def.render=function(ctx){return prev(ctx).replace('<div class="cw-st-chapters">',`<div class="cw-st-film">${cwBtn(ico('play','sm')+' Watch the short version (7 min)','cwStFilm','short','')}<span class="tiny muted">${window.DOMA_VO&&window.DOMA_VO.voices?'Recorded narration.':'Browser voice. Recorded narration needs the audio folder.'}</span></div><div class="cw-st-chapters">`)}}}
