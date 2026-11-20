'use strict';
/* Walkthrough (18 Nov 2026): the demo guide dims the screen and rings the exact thing to click next.
   Each demo step is broken into sub-steps. A click on the ringed element ticks it off. The panel stays lit.
   Prefix cwWk. Sub-step kinds: click (ring it, advance on click), type (Ask GeeVee), note (look, then Got it),
   go (a button in the panel opens a page). "fill" lets the panel do the typing. "until" auto-advances. */
const CW_WK_M={in:'#modal-layer'};
const CW_WK=[
 /* 1 Today */
 [{kind:'note',t:'The written offer sits at the top because offers are urgent. Each card is a decision: approve, edit, ignore or snooze.',find:{sel:'.gv-day-items .gv-compact-item'}},
  {kind:'note',t:'On the right: the diary, your money plan, owners worth a call, and a vendor report due.',find:{sel:'.gv-day-aside'}},
  {kind:'type',t:'Ask GeeVee "what\'s on today".',value:"what's on today",find:{sel:'#gv-dock-text'}}],
 /* 2 Seller lead */
 [{kind:'click',t:'Click Call next to Helen Vu.',find:{in:'.cw-main',text:/^Call$/,row:/Helen Vu/}},
  {kind:'click',t:'Click Start simulated call.',find:{...CW_WK_M,sel:'[data-action="startCall"]'}},
  {kind:'click',t:'Click Play example conversation.',find:{...CW_WK_M,text:/Play example conversation/}},
  {kind:'click',t:'Click Finish & review.',find:{...CW_WK_M,sel:'[data-action="finishCall"]'}},
  {kind:'click',t:'Read what GeeVee heard. Untick anything wrong, then click Save and let GeeVee do it.',find:{...CW_WK_M,text:/Save and let GeeVee do it/}},
  {kind:'click',t:'This is what GeeVee did. Click Looks right.',find:{...CW_WK_M,text:/Looks right/},until:()=>!ui.modal}],
 /* 3 Pack */
 [{kind:'click',t:'Click the appraisal at 44 Smith Street.',find:{sel:'.cw-cal-e',text:/44 Smith/}},
  {kind:'click',t:'Click Print pack. It opens in a new tab.',find:{...CW_WK_M,text:/Print pack/}},
  {kind:'click',t:'Close the appointment.',find:{...CW_WK_M,sel:'#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]'},until:()=>!ui.modal}],
 /* 4 Recap */
 [{kind:'click',t:'Click Record recap on the journey strip.',find:{in:'.cw-jn-strip',text:/Record recap/}},
  {kind:'click',t:'Click Insert example recap.',find:{text:/Insert example recap/}},
  {kind:'click',t:'Click Save recap & prepare follow-up.',find:{text:/Save recap/}},
  {kind:'click',t:'GeeVee lists what it did. Click Looks right.',find:{...CW_WK_M,text:/Looks right/},until:()=>!ui.modal}],
 /* 5 Approve authority */
 [{kind:'click',t:'Click the bell, top right.',find:{sel:'[data-action="openApprovals"]'}},
  {kind:'click',t:'Click Review on "Send the sales authority to Helen Vu for signing".',find:{...CW_WK_M,text:/^Review$/,row:/^Send the sales authority/i}},
  {kind:'click',t:'Click Approve.',find:{...CW_WK_M,sel:'[data-action="approveAction"]'}},
  {kind:'click',t:'Close the approvals.',find:{...CW_WK_M,sel:'#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]'},until:()=>!ui.modal}],
 /* 6 Vendors sign */
 [{kind:'click',t:'Click Vendor signing page (demo) on the journey strip.',find:{in:'.cw-jn-strip',text:/Vendor signing page/}},
  {kind:'click',t:'Choose Type.',find:{sel:'.tabs button',text:/^Type$/}},
  {kind:'note',t:'Type "Helen Vu" and tick the box.',find:{sel:'#cw-sign-typed'},fill:[['#cw-sign-typed','Helen Vu'],['#cw-sign-agree',true]]},
  {kind:'click',t:'Click Sign.',find:{text:/^Sign$/},pre:()=>document.getElementById('cw-sign-typed')?.value&&document.getElementById('cw-sign-agree')?.checked},
  {kind:'note',t:'Now Mark Vu: type "Mark Vu" and tick the box.',find:{sel:'#cw-sign-typed'},fill:[['#cw-sign-typed','Mark Vu'],['#cw-sign-agree',true]]},
  {kind:'click',t:'Click Sign.',find:{text:/^Sign$/},pre:()=>document.getElementById('cw-sign-typed')?.value&&document.getElementById('cw-sign-agree')?.checked},
  {kind:'click',t:'Both signed. GeeVee did the next five things. Click Looks right.',find:{...CW_WK_M,text:/Looks right/},until:()=>!ui.modal}],
 /* 7 Photographer */
 [{kind:'click',t:'Click Supplier email (demo) on the journey strip.',find:{in:'.cw-jn-strip',text:/Supplier email/}},
  {kind:'click',t:'This is the photographer\'s email. Click Confirm this time.',find:{text:/Confirm this time/}},
  {kind:'click',t:'After the shoot they deliver from the same page. Click Demo: deliver 12 photos.',find:{text:/deliver 12 photos/}},
  {kind:'click',t:'Click Open the property.',find:{...CW_WK_M,text:/Open the property/},until:()=>!ui.modal&&/properties\/D-2016/.test(location.hash)}],
 /* 8 Go live */
 [{kind:'click',t:'Click Go live on the journey strip.',find:{in:'.cw-jn-strip',text:/Go live/}},
  {kind:'click',t:'Click Record ID sighted.',find:{...CW_WK_M,text:/Record ID sighted/}},
  {kind:'click',t:'Click Save.',find:{...CW_WK_M,text:/^Save$/}},
  {kind:'click',t:'Click Use GeeVee\'s draft.',find:{...CW_WK_M,text:/Use GeeVee/}},
  {kind:'click',t:'All checks passed. Click Request go-live.',find:{...CW_WK_M,text:/Request go-live/}},
  {kind:'click',t:'Click the bell, top right.',find:{sel:'[data-action="openApprovals"]'}},
  {kind:'click',t:'Click Review on "Publish 44 Smith Street".',find:{...CW_WK_M,text:/^Review$/,row:/^Publish 44 Smith/i}},
  {kind:'click',t:'Click Approve.',find:{...CW_WK_M,sel:'[data-action="approveAction"]'}},
  {kind:'click',t:'Close the approvals.',find:{...CW_WK_M,sel:'#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]'},until:()=>!ui.modal},
  {kind:'click',t:'Click Public listing to see what buyers see.',find:{in:'.cw-jn-strip',text:/Public listing/}}],
 /* 9 Offer */
 [{kind:'click',t:'Click Buyers to call on the journey strip.',find:{in:'.cw-jn-strip',text:/Buyers to call/}},
  {kind:'click',t:'Click Call next to Jordan Park.',find:{...CW_WK_M,text:/^Call$/,row:/Jordan Park/}},
  {kind:'click',t:'Click Start simulated call.',find:{...CW_WK_M,sel:'[data-action="startCall"]'}},
  {kind:'click',t:'Click Play example conversation.',find:{...CW_WK_M,text:/Play example conversation/}},
  {kind:'click',t:'Click Finish & review.',find:{...CW_WK_M,sel:'[data-action="finishCall"]'}},
  {kind:'click',t:'Click Save and let GeeVee do it.',find:{...CW_WK_M,text:/Save and let GeeVee do it/}},
  {kind:'click',t:'The offer is recorded. Click Looks right.',find:{...CW_WK_M,text:/Looks right/},until:()=>!ui.modal}],
 /* 10 Present, accept, contract */
 [{kind:'click',t:'Click the bell, top right.',find:{sel:'[data-action="openApprovals"]'}},
  {kind:'click',t:'Click Review on "Present offer to vendor".',find:{...CW_WK_M,text:/^Review$/,row:/^Present .*offer/i}},
  {kind:'click',t:'Click Approve.',find:{...CW_WK_M,sel:'[data-action="approveAction"]'}},
  {kind:'click',t:'Close the approvals.',find:{...CW_WK_M,sel:'#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]'},until:()=>!ui.modal},
  {kind:'go',t:'Open 9 Rose Avenue.',route:'/properties/D-2006',until:()=>/properties\/D-2006/.test(location.hash)},
  {kind:'click',t:'Click Record vendor decision on the journey strip.',find:{in:'.cw-jn-strip',text:/Record vendor decision/}},
  {kind:'click',t:'Click Example: accept, or type "Hannah accepts Jordan\'s offer".',find:{...CW_WK_M,text:/Example: accept/}},
  {kind:'click',t:'Click Save and let GeeVee do it.',find:{...CW_WK_M,text:/Save and let GeeVee do it/}},
  {kind:'click',t:'The contract is filled in. Click Looks right.',find:{...CW_WK_M,text:/Looks right/},until:()=>!ui.modal},
  {kind:'click',t:'Click the bell, top right.',find:{sel:'[data-action="openApprovals"]'}},
  {kind:'click',t:'Click Review on the Contract of Sale.',find:{...CW_WK_M,text:/^Review$/,row:/^Send the Contract of Sale/i}},
  {kind:'click',t:'Click Approve.',find:{...CW_WK_M,sel:'[data-action="approveAction"]'}},
  {kind:'click',t:'Close the approvals.',find:{...CW_WK_M,sel:'#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]'},until:()=>!ui.modal},
  {kind:'click',t:'Click Buyer signing page (demo) on the journey strip.',find:{in:'.cw-jn-strip',text:/signing page/}},
  {kind:'click',t:'Choose Type.',find:{sel:'.tabs button',text:/^Type$/}},
  {kind:'note',t:'Sign as Jordan Park: type the name and tick the box.',find:{sel:'#cw-sign-typed'},fill:[['#cw-sign-typed','Jordan Park'],['#cw-sign-agree',true]]},
  {kind:'click',t:'Click Sign.',find:{text:/^Sign$/},pre:()=>document.getElementById('cw-sign-typed')?.value&&document.getElementById('cw-sign-agree')?.checked},
  {kind:'note',t:'Now sign as Hannah Wells.',find:{sel:'#cw-sign-typed'},fill:[['#cw-sign-typed','Hannah Wells'],['#cw-sign-agree',true]]},
  {kind:'click',t:'Click Sign.',find:{text:/^Sign$/},pre:()=>document.getElementById('cw-sign-typed')?.value&&document.getElementById('cw-sign-agree')?.checked},
  {kind:'click',t:'Sold. Click Looks right.',find:{...CW_WK_M,text:/Looks right/},until:()=>!ui.modal}],
 /* 11 Forecast */
 [{kind:'click',t:'Click Change target.',find:{in:'.cw-main',text:/Change target|Set target/}},
  {kind:'note',t:'Try another number, then Save target.',find:{...CW_WK_M,sel:'input'},until:()=>!ui.modal},
  {kind:'note',t:'The plan: how many appraisals close the gap, and the owners most likely to say yes. Below it, Protect what you have.',find:{sel:'.cw-main .card',text:/Protect what you have/}},
  {kind:'type',t:'Ask GeeVee "how am I tracking".',value:'how am I tracking',find:{sel:'#gv-dock-text'}}],
 /* 12 Database journey */
 [{kind:'click',t:'Read the signals under Kurt Bauer, then click Add as lead.',find:{in:'.cw-main',text:/Add as lead/,row:/Kurt Bauer/}},
  {kind:'click',t:'Click Looks right.',find:{...CW_WK_M,text:/Looks right|^Close$/},until:()=>!ui.modal},
  {kind:'click',t:'Click the Due a touch tab.',find:{in:'.cw-main',text:/Due a touch/}},
  {kind:'click',t:'Click Draft all due touches.',find:{text:/Draft all due touches/}}],
 /* 13 Batches and delegation */
 [{kind:'click',t:'At the top of Today: five inspection confirmations ready. Click Approve all.',find:{in:'.cw-gr-batch',text:/Approve all/}},
  {kind:'type',t:'Ask GeeVee: "ask Priya to call the open home buyers for 9 Rose Avenue, remind me Friday".',value:'ask Priya to call the open home buyers for 9 Rose Avenue, remind me Friday',find:{sel:'#gv-dock-text'}},
  {kind:'note',t:'The Delegated card on the right. A slipped task comes back to your Today.',find:{sel:'.gv-day-aside .gv-aside-mini',text:/Delegated/}}],
 /* 14 Vendor report */
 [{kind:'click',t:'Click Vendor report on the journey strip.',find:{in:'.cw-jn-strip',text:/Vendor report/}},
  {kind:'click',t:'Read it. When the market says the price is wrong, GeeVee scripts the call. Click Send for approval.',find:{...CW_WK_M,text:/Send for approval/}}],
 /* 15 By hand */
 [{kind:'note',t:'Type "14 Grant Street, Preston" as the address.',find:{sel:'[data-cwform="nl1"] [name="address"]'},fill:[['[data-cwform="nl1"] [name="address"]','14 Grant Street, Preston']]},
  {kind:'click',t:'GeeVee found it in the database. Click Use these details.',find:{text:/Use these details/}},
  {kind:'click',t:'Click Next.',find:{in:'.cw-main',text:/^Next$/}},
  {kind:'note',t:'Choose On market listing and enter 1,000,000 to 1,100,000.',find:{sel:'[data-cwform="nl2"]'},fill:[['[data-cwform="nl2"] [name="ltype"]','On market listing'],['[data-cwform="nl2"] [name="low"]','1000000'],['[data-cwform="nl2"] [name="high"]','1100000']]},
  {kind:'click',t:'Click Next.',find:{in:'.cw-main',text:/^Next$/}},
  {kind:'click',t:'Click Create listing.',find:{text:/Create listing/}},
  {kind:'click',t:'Nine fields, not 41. Click Looks right.',find:{...CW_WK_M,text:/Looks right|^Close$/},until:()=>!ui.modal}],
 /* 16 Integrations */
 [{kind:'note',t:'Read the table and the order to build them.',find:{sel:'.cw-main table'}}]
];

/* ---------- state ---------- */
function cwWkSub(){const s=cwDmS();const list=CW_WK[s.step]||[];const i=Math.min(s.sub||0,list.length);return{list,i,cur:list[i]||null,done:i>=list.length}}
let cwWkEl=null,cwWkMissAt=0,cwWkScrollKey='',cwWkScrollAt=0,cwWkTimer=null,cwWkDodgeKey='',cwWkSnapKey='',cwWkLiftKey='';
function cwWkRefresh(){const p=document.querySelector('.cw-dm-panel,.cw-dm-pill');if(!p)return;const t=document.createElement('div');t.innerHTML=cwDmPanel();const n=t.querySelector('.cw-dm-panel,.cw-dm-pill');if(n){if(p.classList.contains('cw-wk-dodge'))n.classList.add('cw-wk-dodge');p.replaceWith(n)}}
function cwWkKey(){const s=cwDmS();return s.step+':'+cwWkSub().i}
function cwWkAdvance(from){if(from&&from!==cwWkKey())return;const s=cwDmS();const {list,i}=cwWkSub();s.sub=Math.min(list.length,i+1);cwWkMissAt=0;cwWkEl=null;persist();cwWkRefresh()}
cwOn('cwWkNext',()=>cwWkAdvance());
cwOn('cwWkRestart',()=>{const s=cwDmS();s.sub=0;persist();doAction('cwDmGo',String(s.step))});
cwOn('cwWkForce',()=>{const s=cwDmS();s.forceStep=s.step;persist();cwWkRefresh()});
cwOn('cwWkToggle',()=>{const s=cwDmS();s.walk=s.walk===false?true:false;persist();cwWkRefresh()});
cwOn('cwWkGo',r=>{const s=cwDmS();s.sub=Math.min((CW_WK[s.step]||[]).length,(s.sub||0)+1);persist();ui.modal=null;ui.gvChatOpen=false;if(r==='/app/today')navigate('today');else cwGo(r)});
cwOn('cwWkFill',()=>{const {cur}=cwWkSub();if(!cur||!cur.fill)return;for(const [sel,val] of cur.fill){const el=document.querySelector(sel);if(!el)continue;if(el.type==='checkbox')el.checked=!!val;else if(el.type==='radio'){const r=document.querySelector(sel+'[value="'+String(val).replace(/"/g,'\\"')+'"]');if(r)r.checked=true;else el.checked=true}else el.value=val;const tgt=el.type==='radio'?(document.querySelector(sel+'[value="'+String(val).replace(/"/g,'\\"')+'"]')||el):el;tgt.dispatchEvent(new Event('input',{bubbles:true}));tgt.dispatchEvent(new Event('change',{bubbles:true}))}cwWkAdvance()});
cwOn('cwWkType',()=>{const {cur}=cwWkSub();if(!cur||cur.kind!=='type')return;const el=document.getElementById('gv-dock-text');if(el)el.value=cur.value;ui.gvChatDraft=cur.value;cwWkAdvance();doAction('gvSendChat')});
/* ---------- every step stands on its own: jumping ahead fast-forwards the earlier steps' outcomes ---------- */
function cwWkEnsure(k){const D16=findD('D-2016'),P16=D16?findP(D16.contactId):null,x16=D16?cwDX(D16):null,R=findD('D-2006');let changed=false;
 const approve=pred=>{const a=state.actions.find(a=>a.status==='Awaiting review'&&pred(a));if(a){a.status='Reviewed · not sent';a.approvedBy=CW_ME+' · demo guide';a.reviewedAt=cwNowISO();cwJnSyncApprovals();changed=true}return a};
 const sign=agr=>{if(!agr||agr.status==='Completed')return;(agr.recipients||[]).forEach(r=>{r.status='Signed';r.signedAt=cwNowISO();r.method='Typed'});agr.status='Completed';(agr.activity??=[]).unshift({at:cwNowISO(),what:'All parties signed. Document completed (demo guide).'});changed=true};
 switch(k){
  case 1:if(D16&&P16&&!x16.jnAppraisalEvent){const t=cwJnExampleTranscript(P16,D16);cwJnApplyCall(cwJnExtractCall(t,P16,D16),P16,D16,t);changed=true}break;
  case 3:if(D16&&P16&&!x16.jnRecapAt){const t=cwJnExampleRecap(P16,D16);cwJnApplyRecap(P16,D16,cwJnParseRecap(t),t);changed=true}break;
  case 4:approve(a=>a.jn==='authority'&&a.dealId==='D-2016');break;
  case 5:{const agr=x16&&state.cw.esign.agreements.find(g=>g.id===x16.jnAuthority);if(agr&&agr.status!=='Completed'){sign(agr);D16.compliance??={};D16.compliance['Signed sales authority']=true;if(!agr.jnListed)cwJnListed(agr)}}break;
  case 6:{const b=x16&&cwJnS().bookings.find(z=>z.id===x16.jnBooking);if(b){if(!['Confirmed','Photos delivered'].includes(b.status)){CW_ACT.cwJnSupOk(b.id);changed=true}if(!x16.jnPhotosAt){cwJnDeliver(b,null);changed=true}}}break;
  case 7:if(D16&&x16.jnPhotosAt&&!['For sale','Sold'].includes(D16.stage)){if(!x16.idVerified)x16.idVerified={at:cwNowISO(),by:CW_ME,doc:"Driver's licence",owners:(P16?.name||'')+(x16.coOwner?' and '+x16.coOwner:'')};if(!x16.descApproved){if(x16.descDraft)x16.description=x16.descDraft;x16.descApproved=true}if((x16.comps||[]).length<3){x16.comps=cwJnComps(D16);if(x16.comps.length>=3){D16.compliance??={};D16.compliance['Pricing / comparable-sales evidence']=true}}
   if(!state.actions.some(a=>a.jn==='golive'&&a.dealId==='D-2016'))CW_ACT.cwJnGoLiveRequest('D-2016');approve(a=>a.jn==='golive'&&a.dealId==='D-2016');changed=true}break;
  case 8:if(R){const b=findP('C-1005');if(b&&!(state.offers||[]).some(o=>o.dealId==='D-2006'&&o.j3)){const o=cwJ3ParseOffer(cwJ3ExampleCall(b,R));if(o){cwJ3RecordOffer(R,b,o,'the demo guide');changed=true}}}break;
  case 9:if(R&&R.stage!=='Sold'){approve(a=>a.j3==='present'&&a.dealId==='D-2006');const j=cwJ3X(R);const o=cwJ3Offers(R).filter(cwJ3Live).sort((a,b)=>b.amount-a.amount)[0];if(o&&!j.acceptedAt){cwJ3ApplyDecision(R,{kind:'accept',offer:o},'Hannah accepts the offer (demo guide)');changed=true}approve(a=>a.j3==='contract'&&a.dealId==='D-2006');const agr=cwJ3Agr(R);if(agr&&agr.status!=='Completed'){sign(agr);if(!agr.j3Sold)cwJ3Sold(agr)}}break;
  default:break}
 return changed}
function cwWkPrep(i){let n=0;for(let k=0;k<i;k++){try{if(cwWkEnsure(k))n++}catch(e){console.warn('walk prep',k,e)}}if(n){persist();setTimeout(()=>{if(ui.modal&&ui.modal.type==='cw'&&ui.modal.name==='jnDid'){ui.modal=null;render()}toast('Earlier steps were applied to the demo data so this step is ready to click.')},60)}return n}
/* a step already played in this data (its first thing to click is gone) */
function cwWkStepDone(i){if(cwDmS().forceStep===i)return false;try{const D16=findD('D-2016'),x16=D16?cwDX(D16):null,R=findD('D-2006');const agr=x16&&state.cw.esign.agreements.find(g=>g.id===x16.jnAuthority);
 switch(i){case 1:return !!x16?.jnAppraisalEvent;case 3:return !!x16?.jnRecapAt;case 4:return !!agr&&agr.status!=='Draft';case 5:return agr?.status==='Completed';case 6:return !!x16?.jnPhotosAt;case 7:return !!D16&&['For sale','Sold'].includes(D16.stage);case 8:return (state.offers||[]).some(o=>o.dealId==='D-2006'&&o.j3);case 9:return R?.stage==='Sold';case 12:return typeof cwGrBatches==='function'&&!cwGrBatches().length;default:return false}}catch(e){return false}}
/* step changes reset the sub-step; jumping to a step prepares the data it needs */
{const prevGo=CW_ACT.cwDmGo;cwOn('cwDmGo',i=>{const s=cwDmS();if(s.step!==Number(i))s.sub=0;cwWkEl=null;cwWkMissAt=0;cwWkPrep(Number(i)||0);return prevGo(i)});
 const prevNext=CW_ACT.cwDmNext;cwOn('cwDmNext',d=>{cwDmS().sub=0;cwWkEl=null;return prevNext(d)})}

/* ---------- finding the thing to click ---------- */
function cwWkNorm(s){return (s||'').replace(/\s+/g,' ').trim()}
function cwWkFind(f){if(!f)return null;const root=f.in?document.querySelector(f.in):document;if(!root)return null;const sel=f.sel||'[data-action],button,a,input,textarea,select';let els;try{els=[...root.querySelectorAll(sel)]}catch(e){return null}
 for(const el of els){if(!el.getClientRects().length)continue;if(!f.panel&&el.closest('.cw-dm-panel,.cw-wk-spot'))continue;
  if(f.text&&!f.text.test(cwWkNorm(el.innerText||el.value||el.getAttribute('aria-label')||'')))continue;
  if(f.row){const r=el.closest('.list-row,tr,.cw-pcard,.card,article,.gv-compact-item,.cw-jn-mini,.cw-gr-batch-row,.cw-cal-d');if(!r)continue;const head=r.querySelector('h3,h2,strong,.list-main');if(!f.row.test(cwWkNorm((head||r).innerText)))continue}
  return el}return null}
function cwWkZ(el){let z=0;for(let a=el;a&&a!==document.body;a=a.parentElement){const v=parseInt(getComputedStyle(a).zIndex,10);if(!isNaN(v)&&v>z)z=v}return z}
function cwWkSpot(){let s=document.getElementById('cw-wk-spot');if(!s){s=document.createElement('div');s.id='cw-wk-spot';s.className='cw-wk-spot';s.setAttribute('aria-hidden','true');s.innerHTML='<div class="cw-wk-ring"></div><div class="cw-wk-tip"></div>';document.body.appendChild(s)}return s}
function cwWkPulse(el){for(const b of document.querySelectorAll('.cw-wk-pulse'))if(b!==el)b.classList.remove('cw-wk-pulse');if(el)el.classList.add('cw-wk-pulse')}
function cwWkTick(){const s=cwDmS();const spot=cwWkSpot();const miss=document.querySelector('.cw-wk-miss');
 const hide=()=>{spot.style.display='none'};const panel=document.querySelector('.cw-dm-panel');
 document.body.classList.toggle('cw-wk-on',!!(s.on&&!s.collapsed&&panel));
 if(!s.on||s.collapsed||s.walk===false){hide();cwWkPulse(null);return}
 const {cur,done,i:si}=cwWkSub();
 if(done||(si===0&&cwWkStepDone(s.step))){hide();cwWkPulse(document.querySelector('.cw-dm-panel [data-action="cwDmNext"][data-id="1"]'));return}
 if(cur.until){let u=false;try{u=!!cur.until()}catch(e){}if(u){cwWkAdvance();return}}
 if(cur.kind==='go'){hide();cwWkPulse(document.querySelector('.cw-dm-panel [data-action="cwWkGo"]'));return}
 let el=cwWkFind(cur.find);let blocked=false;
 /* a dialog the step did not ask for is in the way: ring its close button instead */
 if(el&&ui.modal&&!el.closest('#modal-layer')){const x=document.querySelector('#modal-layer .dialog-foot [data-action="close"], #modal-layer [data-action="close"]');if(x){el=x;blocked=true}}
 if(!el){hide();cwWkEl=null;if(!cwWkMissAt)cwWkMissAt=Date.now();const late=Date.now()-cwWkMissAt>1800;if(miss)miss.classList.toggle('on',late);cwWkPulse(late?document.querySelector('.cw-dm-panel [data-action="cwDmGo"]'):null);return}
 cwWkMissAt=0;if(miss)miss.classList.remove('on');cwWkPulse(null);
 let r=el.getBoundingClientRect();const key=s.step+':'+cwWkSub().i;const off=r.top<70||r.bottom>window.innerHeight-110;
 if((key!==cwWkScrollKey||(off&&Date.now()-cwWkScrollAt>900))&&getComputedStyle(el).position!=='fixed'&&!el.closest('.top')){cwWkScrollKey=key;cwWkScrollAt=Date.now();try{el.scrollIntoView({block:r.height>window.innerHeight*0.7?'start':'center',behavior:'instant'})}catch(e){}r=el.getBoundingClientRect()}
 /* clipped inside a scrolling box (a wide table): bring it into view */
 if(Date.now()-cwWkScrollAt>600){for(let a=el.parentElement;a&&a!==document.body;a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==='auto'||o==='scroll'||o==='hidden'){const b=a.getBoundingClientRect();if(r.left<b.left-1||r.right>b.right+1){cwWkScrollAt=Date.now();try{el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})}catch(e){}r=el.getBoundingClientRect()}break}}}
 cwWkEl=el;const pad=6;const fresh=spot.style.display==='none'||cwWkSnapKey!==key;if(fresh){spot.classList.add('cw-wk-snap');cwWkSnapKey=key;requestAnimationFrame(()=>requestAnimationFrame(()=>spot.classList.remove('cw-wk-snap')))}
 spot.style.display='block';spot.style.left=(r.left-pad)+'px';spot.style.top=(r.top-pad)+'px';spot.style.width=(r.width+pad*2)+'px';spot.style.height=(r.height+pad*2)+'px';
 const z=cwWkZ(el);spot.style.zIndex=String(Math.max(65,Math.min(96,z+1)));
 /* if the guide panel itself covers the target, the panel moves to the other side for this sub-step */
 if(panel){if(cwWkDodgeKey&&cwWkDodgeKey!==key){panel.classList.remove('cw-wk-dodge');cwWkDodgeKey=''}
  const u=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  if(u&&!el.contains(u)){if(u.closest('.cw-dm-panel')&&!panel.classList.contains('cw-wk-dodge')){panel.classList.add('cw-wk-dodge');cwWkDodgeKey=key}
   else if(u.closest('#toast')){const t=document.getElementById('toast');if(t)t.style.display='none'}
   else if(u.closest('.gv-assistant-bar')){document.body.classList.add('cw-wk-lift');cwWkLiftKey=key}}
  if(cwWkLiftKey&&cwWkLiftKey!==key){document.body.classList.remove('cw-wk-lift');cwWkLiftKey=''}}
 const tip=spot.querySelector('.cw-wk-tip');const lead=blocked?'Close this first':cur.kind==='type'?'Type here':cur.kind==='note'?'Look here':'Click here';tip.innerHTML='<b>'+lead+'</b><span>'+h(blocked?'Then: '+cur.t:cur.kind==='type'?'"'+cur.value+'"':cur.t)+'</span>';tip.classList.toggle('above',r.bottom+90>window.innerHeight);tip.classList.toggle('flip',r.left+320>window.innerWidth)}
function cwWkStart(){if(cwWkTimer)return;cwWkTimer=setInterval(()=>{try{cwWkTick()}catch(e){console.warn('walk',e)}},150)}
cwWkStart();
/* the ring follows the page while it scrolls or resizes */
{let raf=0;const follow=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;try{cwWkTick()}catch(e){}})};document.addEventListener('scroll',follow,true);window.addEventListener('resize',follow)}
/* a click on the ringed element ticks the sub-step off */
document.addEventListener('click',e=>{const s=cwDmS();if(!s.on||s.collapsed||s.walk===false)return;const {cur}=cwWkSub();if(!cur)return;const t=e.target;if(!t||!t.closest)return;
 const key=cwWkKey();
 let hit=cur.kind==='click'&&cwWkEl&&cwWkEl.contains(t);
 if(cur.kind==='click'&&!hit){const el=cwWkFind(cur.find);if(el&&el.contains(t))hit=true;else if(cwWkEl&&cwWkEl.dataset){const b=t.closest('[data-action]');if(b&&b.dataset.action===cwWkEl.dataset.action&&(b.dataset.id||'')===(cwWkEl.dataset.id||''))hit=true}}
 if(hit){if(cur.pre){let ok=false;try{ok=!!cur.pre()}catch(x){}if(!ok)return}setTimeout(()=>cwWkAdvance(key),350)}
 else if(cur.kind==='type'&&t.closest('[data-action="gvSendChat"]')&&(document.getElementById('gv-dock-text')?.value||'').trim())setTimeout(()=>cwWkAdvance(key),350)},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target?.id!=='gv-dock-text')return;const s=cwDmS();const {cur}=cwWkSub();if(s.on&&!s.collapsed&&cur&&cur.kind==='type'&&(e.target.value||'').trim()){const key=cwWkKey();setTimeout(()=>cwWkAdvance(key),350)}},true);

/* ---------- the panel: sub-steps, buttons, recovery ---------- */
cwDmPanel=function(){const s=cwDmS();if(!s.on)return '';const i=s.step,st=CW_DEMO_STEPS[i];if(!st)return '';
 if(s.collapsed)return `<button type="button" class="cw-dm-pill" data-action="cwDmCollapse" aria-label="Open the demo guide">${ico('play','sm')} Demo guide · Step ${i+1} of ${CW_DEMO_STEPS.length}</button>`;
 const {list,i:k,cur,done}=cwWkSub();const next=CW_DEMO_STEPS[i+1];const already=!done&&k===0&&cwWkStepDone(i);
 const win=list.map((x,j)=>({x,j})).filter(({j})=>j>=k-1&&j<=k+2);
 const items=win.map(({x,j})=>`<li class="${j<k?'done':j===k?'now':''}"><i>${j<k?'✓':j+1}</i><span>${h(x.t)}</span></li>`).join('');
 let acts='';
 if(cur){if(cur.kind==='note')acts+=cwBtn(cur.fill?'Fill it in for me':'Got it, next',cur.fill?'cwWkFill':'cwWkNext','','sm primary');
  if(cur.kind==='type')acts+=cwBtn('Type it for me','cwWkType','','sm primary');
  if(cur.kind==='go')acts+=cwBtn(h(cur.t.replace(/\.$/,'')),'cwWkGo',cur.route,'sm primary');
  acts+=`<button type="button" class="cw-wk-skip" data-action="cwWkNext">Skip</button>`}
 return `<style>@media (min-width:1150px){.main-inner{padding-right:390px}}</style><aside class="cw-dm-panel cw-wk" aria-label="Demo guide"><div class="cw-dm-head"><span class="gv-eyebrow">DEMO GUIDE · STEP ${i+1} OF ${CW_DEMO_STEPS.length}</span><div class="cw-row" style="gap:4px"><button type="button" class="cw-dm-x" data-action="cwWkToggle" title="${s.walk===false?'Guide ring off':'Guide ring on'}" aria-label="${s.walk===false?'Turn the guide ring on':'Turn the guide ring off'}">${ico('eye','sm')}</button><button type="button" class="cw-dm-x" data-action="cwDmCollapse" aria-label="Collapse">−</button><button type="button" class="cw-dm-x" data-action="cwDmOff" aria-label="Hide the guide">×</button></div></div>
 <b>${h(st.t)}</b><p>${h(st.intro)}</p>
 ${done?`<div class="cw-wk-done">✓ Step ${i+1} done.${next?' Next: '+h(next.t):' That is the whole story.'}</div>`:already?`<div class="cw-wk-done already">✓ Already done in this demo data (you played it earlier). Click Next step, or Reset for demo to replay it from the start.</div><div class="cw-wk-acts"><button type="button" class="cw-wk-skip" data-action="cwWkForce">Show the steps anyway</button></div>`:`<div class="cw-wk-count">${k} of ${list.length} done</div><ol class="cw-wk-list">${items}</ol><div class="cw-wk-acts">${acts}</div><div class="cw-wk-miss">Not on this page? Click Take me there, or <button type="button" class="cw-wk-skip" data-action="cwWkRestart">restart this step</button>.</div>`}
 <div class="cw-dm-look">${ico('eye','sm')}<span>${h(st.look[0])}</span></div>
 <div class="cw-row between" style="margin-top:10px"><div class="cw-row" style="gap:6px">${cwBtn('Back','cwDmNext','-1','sm')}${cwBtn(next?'Next step':'Finish','cwDmNext','1','sm primary')}</div>${cwBtn('Take me there','cwDmGo',String(i),'sm ghost')}</div></aside>`};
