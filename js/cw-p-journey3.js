'use strict';
/* Listing to sale, sale to settlement, settlement to referral (17 Nov 2026). Prefix cwJ3.
   Same rules as the listing journey: internal work (records, offers register, calendar, tasks, documents) is applied at once
   with Undo on a "What I did" card. Texts and emails go to Today as A2 approvals. Presenting an offer to the vendor and
   sending the Contract of Sale are protected (A3). Opted-out people never get marketing. */
function cwJ3S(){const c=state.cw;c.j3??={past:{},touches:{}};c.j3.past??={};c.j3.touches??={};return c.j3}
function cwJ3X(d){const x=cwDX(d);x.j3??={};return x.j3}
function cwJ3Offers(d){return (state.offers||[]).filter(o=>o.dealId===d.id)}
function cwJ3Live(o){return !/declin|withdraw|reject|not chosen|not proceed|too low|supersed/i.test(String(o.status))}
function cwJ3WithdrawPresent(d,why){for(const a of state.actions.filter(a=>a.j3==='present'&&a.dealId===d.id&&a.status==='Awaiting review')){a.status='Withdrawn';a.jnHandled=true;a.withdrawnWhy=why}}
function cwJ3Agr(d){const id=cwJ3X(d).contractId;const A=state.cw.esign.agreements;return A.find(a=>a.id===id)||A.find(a=>a.kind==='Contract'&&a.dealId===d.id&&a.j3==='contract')||null}
function cwJ3Settle(d){return (state.cw.settlements||[]).find(s=>s.dealId===d.id&&s.j3)||(state.cw.settlements||[]).find(s=>s.dealId===d.id)||null}
function cwJ3Days(s,def){const m=String(s||'').match(/(\d+)/);return m?Number(m[1]):def}
function cwJ3Sale(d){return ['For sale','Sold'].includes(d.stage)||!!cwDX(d).j3}
function cwJ3First(p){return cwJnFirst(p)}
function cwJ3Terms(o){return [o.deposit?o.deposit+' deposit':'',o.settlement?o.settlement+' settlement':'',o.finance||'',o.conditions||''].filter(Boolean).join(' · ')}
const cwJ3Me=()=>(CW_ME||'Caleb Richards').split(' ')[0];

/* ---------- 1a. Buyers to call first ---------- */
function cwJ3Buyers(d){const map=new Map();const add=(pid,score,why)=>{if(!pid||pid===d.contactId)return;const p=findP(pid);if(!p||cwPX(p).trashed)return;const e=map.get(pid)||{p,score:0,why:[]};e.score+=score;if(why&&!e.why.includes(why))e.why.push(why);map.set(pid,e)};
 for(const o of cwJ3Offers(d))add(o.buyerId,cwJ3Live(o)?100:20,(cwJ3Live(o)?'Offer of ':'Earlier offer of ')+cwMoney(o.amount)+' ('+String(o.status).toLowerCase()+')');
 for(const e of state.cw.enquiries.filter(e=>e.dealId===d.id&&e.contactId))add(e.contactId,50,e.type+' '+cwDate(e.received)+(e.comments?': "'+String(e.comments).slice(0,70)+'"':''));
 for(const m of state.messages.filter(m=>m.dealId===d.id&&m.contactId))add(m.contactId,45,'Enquired by '+m.channel+(m.unread?' (unread)':''));
 for(const o of state.cw.openHomes.filter(o=>o.dealId===d.id))for(const a of o.attendees||[]){if(!a.contactId)continue;const t=a.temp||'';add(a.contactId,t==='HOT'?40:t==='WARM'?30:t==='No Interest'?0:12,'At the open home '+cwDate(o.day)+(t?' ('+t+')':'')+(a.contract?', asked for the contract':'')+(a.notes?': '+a.notes:''))}
 if(typeof gvxMatchBuyers==='function')for(const m of gvxMatchBuyers(d))for(const w of m.why)if(/viewed|saved|mentioned/i.test(w))add(m.p.id,/viewed/i.test(w)?15:5,w);
 const called=cwJ3X(d).called||{};
 return [...map.values()].map(e=>({...e,out:cwOptedOut(e.p),calledAt:called[e.p.id]||''})).sort((a,b)=>b.score-a.score)}
cwModalDef('j3Buyers',id=>{const d=findD(id);if(!d)return{title:'Buyers to call'};const list=cwJ3Buyers(d);
 return{title:'Buyers to call first: '+d.address,eyebrow:'Ranked by signals: offer, enquiry, open home interest, portal views',wide:'large',
  body:list.length?`<div class="cw-j3-buyers">${list.map((e,i)=>`<div class="list-row"><div class="number-circle" style="${i<3?'background:#e4f4f5;color:#076b73':''}">${i+1}</div><div class="list-main"><strong>${h(e.p.name)}</strong> <span class="tiny muted">${h(e.p.phone||'')}</span> ${e.calledAt?tag('Called '+cwDate(e.calledAt),'green'):''}${e.out?tag('Opted out: call only, no marketing','red'):''}<div class="sub">${e.why.map(w=>h(w)).join(' · ')}</div></div><div class="cw-row">${cwBtn(ico('phone','sm')+' Call','cwJ3Call',d.id+'|'+e.p.id,'sm primary')}${cwBtn('Open','cwJnOpen','/contacts/'+e.p.id,'sm')}</div></div>`).join('')}</div><p class="hint" style="margin-top:10px">Offers rank above enquiries, enquiries above open home check-ins, then portal views. GeeVee records who you have called.</p>`:cwEmpty('No buyer signals yet','Enquiries, open home check-ins and offers on this property feed this list.'),
  foot:cwBtn('Close','close','','primary')}});
cwOn('cwJ3BuyersOpen',id=>{ui.gvChatOpen=false;cwModal('j3Buyers',id)});
cwOn('cwJ3Call',id=>{const [did,pid]=id.split('|');const d=findD(did),p=findP(pid);if(!d||!p)return;const j=cwJ3X(d);(j.called??={})[pid]=cwNowISO();j.buyersCalledAt??=cwNowISO();cwPropActivity(d,'Called '+p.name+' from the buyers-to-call list');persist();ui.gvChatOpen=false;openCall(pid)});

/* after an open home session closes: post-visit texts (A2, opted-out excluded), vendor report (A2), buyers ranked */
function cwJ3AfterOpenHome(o){const d=findD(o.dealId);if(!d)return;const p=findP(d.contactId),x=cwDX(d);cwJnSnap();const done=[];o.smsDone??={};let n=0,skip=0;
 for(const a of o.attendees||[]){if(o.smsDone[a.id]||!a.temp||a.temp==='No Interest')continue;const b=findP(a.contactId);if(!b||cwOptedOut(b)||!b.phone){skip++;continue}
  addAction({type:'SMS',title:'Post-visit text to '+b.name,body:`Hi ${cwJ3First(b)}, thanks for coming through ${d.address} today.${a.contract?' The contract is on its way.':''}${a.temp==='HOT'?' I will call you tomorrow about next steps.':' Any questions, just reply.'} ${cwJ3Me()}, Collings. Reply STOP to opt out.`,contactId:b.id,dealId:d.id,tier:'A2',j3:'postVisit'});o.smsDone[a.id]=true;n++}
 if(n)done.push(['Drafted '+n+' post-visit text'+(n>1?'s':'')+(skip?' ('+skip+' skipped: opted out or no mobile)':'')+'. They are on Today for approval','/app/today']);
 else done.push(['No post-visit texts to draft'+(skip?' ('+skip+' attendee'+(skip>1?'s':'')+' opted out or without a mobile)':''),'/open-home/'+o.id]);
 const att=o.attendees||[],hot=att.filter(a=>a.temp==='HOT').length,warm=att.filter(a=>a.temp==='WARM').length,contracts=att.filter(a=>a.contract).length,offers=cwJ3Offers(d).filter(cwJ3Live),fb=att.filter(a=>a.notes).map(a=>a.name+': '+a.notes);
 const enq=state.cw.enquiries.filter(e=>e.dealId===d.id).length+state.messages.filter(m=>m.dealId===d.id).length;
 if(p&&!cwOptedOut(p)){addAction({type:'Email',title:'Open home report to '+p.name+': '+d.address,body:`Hi ${cwJ3First(p)},\n\nHere is the report from today's open home at ${d.address}.\n\nGroups through: ${att.length}\nHot: ${hot}. Warm: ${warm}.\nContracts requested: ${contracts}\nWritten offers so far: ${offers.length}${offers.length?' (best '+cwMoney(Math.max(...offers.map(z=>z.amount)))+')':''}\nOnline views: ${x.views||0}. Enquiries: ${enq}.\n\nBuyer feedback:\n${fb.length?fb.map(f=>'- '+f).join('\n'):'- No specific feedback recorded.'}\n\nI will call you tomorrow to talk it through.\n\n${d.owner||CW_ME}\nCollings Real Estate`,contactId:p.id,dealId:d.id,tier:'A2',j3:'vendorReport'});done.push(['Drafted the open home report for '+p.name+'. It is on Today for approval','/app/today'])}
 const top=cwJ3Buyers(d).filter(b=>!b.out).slice(0,3);
 if(top.length){if(!state.tasks.some(t=>t.status==='Open'&&t.dealId===d.id&&/buyers to call first/i.test(t.title)))addTask({title:'Call the buyers to call first for '+d.address,contactId:top[0].p.id,dealId:d.id,due:'Tomorrow',priority:'High',category:'Call',origin:'GeeVee ranked them after the open home: '+top.map(b=>b.p.name).join(', ')});done.push(['Ranked the buyers to call first: '+top.map(b=>b.p.name).join(', '),'/properties/'+d.id+'?tab=enquiries'])}
 cwJ3X(d).lastOpenHomeAt=cwNowISO();
 audit('auto','Open home closed at '+d.address+': GeeVee did the follow-up',done.map(z=>z[0]).join('. '));
 const id=cwJnCard('After the open home at '+d.address,done,{dealId:d.id,contactId:p?.id});persist();ui.modal={type:'cw',name:'jnDid',arg:id};render()}
{const prev=CW_ACT.cwCtOhClose;if(prev)cwOn('cwCtOhClose',id=>{const o=cwCtOh(id);const was=o?.status;prev(id);if(o&&was!=='Closed'&&o.status==='Closed'&&findD(o.dealId)&&cwJ3Sale(findD(o.dealId)))cwJ3AfterOpenHome(o)})}

/* ---------- 1b. Offers captured from a buyer call ---------- */
function cwJ3ParseOffer(text){const l=String(text||'').toLowerCase().replace(/\$\s*/g,'');if(!/offer|bid|pay|go to|put in|will give/.test(l))return null;
 const m=l.match(/(?:offer(?:s|ed|ing)?|bid|pay|go(?: up)? to|put in|will give)\s+(?:of\s+|at\s+|you\s+|them\s+)?(\d+(?:[.,]\d+)*)\s*(m|million|k|thousand)?\b/)||l.match(/\b(\d+(?:[.,]\d+)*)\s*(m|million|k)\b/);
 if(!m)return null;const raw=m[1].includes(',')?m[1].replace(/,/g,''):m[1];const amount=cwJnMoney(raw,m[2]==='thousand'?'k':m[2]);if(!(amount>=100000))return null;
 const st=l.match(/(\d+)[ -]day settlement|settlement (?:in|of|at) (\d+) days?|(\d+) days? settlement|settle in (\d+) days?/);const settlement=st?(st[1]||st[2]||st[3]||st[4])+' days':'';
 const dp=l.match(/(\d+)\s*(?:%|percent|per cent)\s*deposit|deposit (?:of )?(\d+)\s*(?:%|percent|per cent)/);const deposit=dp?(dp[1]||dp[2])+'%':'';
 let finance='';if(/subject to finance|finance clause|finance condition|need finance|finance approval/.test(l)){const fd=l.match(/finance[^.]{0,40}?(\d+)\s*days?|(\d+)\s*days?[^.]{0,30}?(?:finance|approval)/);finance='Subject to finance · '+((fd&&(fd[1]||fd[2]))||14)+' days'}else if(/unconditional|cash buyer|no finance|finance (?:is )?approved|pre-?approved/.test(l))finance='Unconditional finance';
 const cond=[];if(/building (?:and pest )?inspection|pest inspection/.test(l))cond.push('Building and pest inspection within 7 days');if(/subject to (?:the )?sale of/.test(l))cond.push('Subject to the sale of their property');if(/contract review|solicitor|conveyancer to check/.test(l))cond.push('Subject to contract review');
 return{amount,settlement,deposit,finance,conditions:cond.join('; ')}}
function cwJ3DealForBuyer(text,p){const ok=d=>d&&!cwDX(d).trashed&&cwJ3Sale(d)&&d.stage!=='Sold'&&d.contactId!==p.id;
 const found=text&&typeof gvxFindDeal==='function'?gvxFindDeal(String(text)):null;if(ok(found))return found;
 const ids=[...(state.offers||[]).filter(o=>o.buyerId===p.id).map(o=>o.dealId),...state.messages.filter(m=>m.contactId===p.id&&m.dealId).map(m=>m.dealId),...state.cw.enquiries.filter(e=>e.contactId===p.id&&e.dealId).map(e=>e.dealId),...state.cw.openHomes.filter(o=>(o.attendees||[]).some(a=>a.contactId===p.id)).map(o=>o.dealId),...(state.buyerActivity||[]).filter(b=>b.contactId===p.id).map(b=>b.dealId)].filter(Boolean);
 for(const id of ids){const d=findD(id);if(ok(d))return d}return null}
const cwJ3Ctx={deal:null};
function cwJ3ExampleCall(b,d){const first=cwJ3First(b),v=findP(d.contactId);return `Caleb: Hi ${first}, it's Caleb from Collings. You wanted to talk about ${d.address}?\n${first}: Yes. We've been through twice and we're ready to make an offer.\nCaleb: Great. What are you thinking?\n${first}: We'll offer 1.05 with 60 day settlement, 10% deposit, subject to finance. Our bank says 14 days for approval.\nCaleb: Understood. Any other conditions?\n${first}: A building and pest inspection in the first week. And can you send me the contract and Section 32 today?\nCaleb: I'll put it to ${v?cwJ3First(v):'the vendor'} in writing today and send the contract through. Thanks ${first}.`}
const cwJ3PrevExtract=cwJnExtractCall;
cwJnExtractCall=function(text,p,d){let items=cwJ3PrevExtract(text,p,d);if(!p||!['buyer','both'].includes(p.role))return items;const o=cwJ3ParseOffer(text);if(!o)return items;const deal=cwJ3Ctx.deal||cwJ3DealForBuyer(text,p);if(!deal)return items;
 items=items.filter(i=>!['appraisal','appraisalTask','pack','expect','timeframe','followUp','confirmSms','coOwner'].includes(i.k));
 items.unshift({k:'offer',t:'Record the offer: '+cwMoney(o.amount)+' on '+deal.address,s:(cwJ3Terms(o)||'Terms to confirm')+'. Saved to the offer register. Presenting it to '+cwPName(deal.contactId)+' goes to Today as a protected approval.',offer:o,dealId:deal.id});
 if(/send (?:me |us |through |over )?(?:the )?contract|section 32/.test(String(text).toLowerCase()))items.splice(1,0,{k:'contractReq',t:'Buyer asked for the contract and Section 32',s:'GeeVee drafts the email for your approval.',dealId:deal.id});
 return items};
const cwJ3PrevExample=cwJnExampleTranscript;
cwJnExampleTranscript=function(p,d){if(p&&['buyer','both'].includes(p.role)){const deal=cwJ3DealForBuyer('',p);if(deal)return cwJ3ExampleCall(p,deal)}return cwJ3PrevExample(p,d)};
function cwJ3RecordOffer(d,b,o,source){const x=cwDX(d),v=findP(d.contactId),done=[];
 const offer={id:cwId('O'),dealId:d.id,buyerId:b.id,vendorId:d.contactId,amount:o.amount,guideAtReceipt:d.guide,deposit:o.deposit||'10%',finance:o.finance||'To confirm',settlement:o.settlement||'To confirm',conditions:o.conditions||'',received:'Just now',deadline:'Tomorrow 5:00pm',status:'New',history:['Captured by GeeVee from '+source],source:'Call transcript',at:cwNowISO(),j3:true};
 let sup=0;for(const z of cwJ3Offers(d).filter(z=>z.buyerId===b.id&&cwJ3Live(z))){z.status='Superseded';(z.history??=[]).push('Superseded by a new offer of '+cwMoney(o.amount)+' '+cwDateTime(new Date()));sup++}
 (state.offers??=[]).unshift(offer);cwJ3X(d).offerAt??=cwNowISO();(cwJ3X(d).called??={})[b.id]=cwNowISO();cwJ3X(d).buyersCalledAt??=cwNowISO();
 (cwPX(b).notes??=[]).unshift({id:cwId('CN'),text:'Offer on '+d.address+': '+cwMoney(o.amount)+' · '+cwJ3Terms(offer),kind:'Offer',by:'GeeVee',at:cwNowISO()});cwContactHistory(b,'Offer of '+cwMoney(o.amount)+' on '+d.address+' recorded from a call','GeeVee');
 cwPropActivity(d,'Offer recorded from a call: '+cwMoney(o.amount)+' from '+b.name,'GeeVee');
 done.push(['Recorded '+b.name+'\'s offer of '+cwMoney(o.amount)+' ('+[offer.deposit+' deposit',offer.settlement+' settlement',offer.finance].join(', ')+') in the offer register'+(sup?'. Their earlier offer is superseded':''),'/properties/'+d.id+'?tab=enquiries']);
 if(x.priceLow&&o.amount<x.priceLow)done.push(['The offer is below the advertised range '+cwPrice(d)+'. GeeVee flags it in the note to the vendor','/properties/'+d.id+'?tab=compliance']);
 const others=cwJ3Offers(d).filter(z=>z.id!==offer.id&&cwJ3Live(z));const vn=v?.name||'the vendor';
 const body=`${b.name} offers ${cwMoney(o.amount)} for ${d.address}, ${d.suburb}. Deposit ${offer.deposit}. Settlement ${offer.settlement}. ${offer.finance}.${offer.conditions?' Conditions: '+offer.conditions+'.':''} Advertised: ${cwPrice(d)}.${others.length?' Other live offers: '+others.map(z=>cwPName(z.buyerId)+' '+cwMoney(z.amount)).join(', ')+'.':''} Approve to present every offer to ${vn} in writing. GeeVee drafts the email for you.`;
 const pend=state.actions.find(a=>a.j3==='present'&&a.dealId===d.id&&a.status==='Awaiting review');
 if(pend){pend.title='Present '+(others.length+1)+' offers on '+d.address+' to '+vn;pend.body=body;pend.j3Offer=offer.id;done.push(['Added it to the "Present offers to '+vn+'" approval already on Today (protected)','/app/today'])}
 else{addAction({type:'Offer',title:'Present '+b.name+'\'s offer of '+cwMoney(o.amount)+' to '+vn,body,contactId:v?.id||'',dealId:d.id,tier:'A3',j3:'present',j3Offer:offer.id});done.push(['"Present offer to '+vn+'" is on Today as a protected approval','/app/today'])}
 state.cw.notifications.unshift({id:cwId('NT'),title:'Offer received: '+d.address,body:b.name+' offered '+cwMoney(o.amount)+'. Present it from Today.',kind:'OFFER',priority:'High',read:false,at:cwNowISO(),route:'/properties/'+d.id+'?tab=enquiries'});
 return{offer,done}}
const cwJ3PrevApply=cwJnApplyCall;
cwJnApplyCall=function(items,p,d,transcript){const id=cwJ3PrevApply(items,p,d,transcript);const card=cwJnS().cards.find(c=>c.id===id);if(!card||!p)return id;
 const it=items.find(i=>i.k==='offer'&&i.on!==false);
 if(it){const deal=findD(it.dealId);if(deal){const r=cwJ3RecordOffer(deal,p,it.offer,'the call with '+p.name+' on '+cwDateTime(new Date()));card.items.push(...r.done);card.dealId=deal.id}}
 const cr=items.find(i=>i.k==='contractReq'&&i.on!==false);
 if(cr){const deal=findD(cr.dealId);if(deal){if(!cwOptedOut(p)){addAction({type:'Email',title:'Send the Contract of Sale and Section 32 to '+p.name,body:`Hi ${cwJ3First(p)},\n\nThanks for your interest in ${deal.address}, ${deal.suburb}. The Contract of Sale and Section 32 are attached. Have your conveyancer look them over and call me with any questions.\n\n${CW_ME}\nCollings Real Estate`,contactId:p.id,dealId:deal.id,tier:'A2'});card.items.push(['Drafted the contract email to '+p.name+'. It is on Today for approval','/app/today'])}else card.items.push([p.name+' has opted out, so the contract request is a task for you','/tasks']);if(cwOptedOut(p))addTask({title:'Send the contract and Section 32 to '+p.name+' ('+deal.address+')',contactId:p.id,dealId:deal.id,due:'Today',priority:'High',category:'Admin',origin:'Asked on the call'})}}
 return id};
/* record an offer from the property strip or Ask GeeVee */
cwModalDef('j3Offer',id=>{const d=findD(id);if(!d)return{title:'Record an offer'};const buyers=cwJ3Buyers(d);const cands=[...buyers.map(e=>e.p),...cwContacts().filter(p=>['buyer','both'].includes(p.role)&&!buyers.some(e=>e.p.id===p.id))].filter(p=>p.id!==d.contactId);
 return{title:'Record an offer from a call: '+d.address,eyebrow:'Paste the transcript or dictate the recap. GeeVee reads the terms',wide:'large',
  body:`<label class="form-label" for="j3-buyer">Buyer</label><select id="j3-buyer" class="field full" aria-label="Buyer">${cands.map(p=>{const e=buyers.find(z=>z.p.id===p.id);return `<option value="${h(p.id)}">${h(p.name)}${e?' · '+h(e.why[0]||''):''}</option>`}).join('')}</select>
  <label class="form-label" for="j3-offer-text" style="margin-top:10px">Call transcript or recap</label><textarea id="j3-offer-text" class="field textarea full" style="min-height:120px" placeholder="For example: they'll offer 1.05 with 60 day settlement, 10% deposit, subject to finance"></textarea>
  <div class="cw-row" style="margin-top:8px">${cwBtn(ico('play','sm')+' Insert example call','cwJ3OfferEx',d.id,'sm')}<span class="tiny muted">Amount, settlement, deposit, finance and conditions are read from what was said. Presenting to the vendor goes to Today as a protected approval.</span></div>`,
  foot:cwBtn('Cancel','close')+(cands.length?cwBtn('Save and let GeeVee do it','cwJ3OfferSave',d.id,'primary'):'')}});
cwOn('cwJ3OfferOpen',id=>{ui.gvChatOpen=false;cwModal('j3Offer',id)});
cwOn('cwJ3OfferEx',id=>{const d=findD(id);const p=findP(document.getElementById('j3-buyer')?.value);const t=document.getElementById('j3-offer-text');if(d&&p&&t){t.value=cwJ3ExampleCall(p,d);t.focus()}});
cwOn('cwJ3OfferSave',id=>{const d=findD(id);const p=findP(document.getElementById('j3-buyer')?.value);const text=(document.getElementById('j3-offer-text')?.value||'').trim();if(!d||!p)return;
 if(!text)return toast('Paste the call or type what the buyer said.');const o=cwJ3ParseOffer(text);if(!o)return toast('GeeVee could not find an offer amount. Say "they will offer 1.05" or similar.');
 cwJ3Ctx.deal=d;let items;try{items=cwJnExtractCall(text,p,null)}finally{cwJ3Ctx.deal=null}
 if(!items.some(i=>i.k==='offer'))items.unshift({k:'offer',t:'Record the offer',s:'',offer:o,dealId:d.id});
 const cid=cwJnApplyCall(items,p,null,text);persist();ui.modal={type:'cw',name:'jnDid',arg:cid};render()});

/* ---------- 1c. Presenting and the vendor decision ---------- */
function cwJ3OffersEmail(d,v,offers){const x=cwDX(d);const best=Math.max(...offers.map(o=>o.amount));
 return `Hi ${cwJ3First(v)},\n\nHere are the written offers on ${d.address}, ${d.suburb}, side by side.\n\n${offers.map((o,i)=>`${i+1}. ${cwPName(o.buyerId)}: ${cwMoney(o.amount)}${o.amount===best?' (highest)':''}\n   Deposit ${o.deposit||'to confirm'}. Settlement ${o.settlement||'to confirm'}. ${o.finance||'Finance to confirm'}.${o.conditions?' Conditions: '+o.conditions+'.':' No other conditions.'}`).join('\n\n')}\n\nAdvertised price: ${cwPrice(d)}.${x.expect?' Your expectation at the appraisal: '+cwMoney(x.expect)+'.':''}\n\nYou can accept one, counter, or reject. Nothing is binding until contracts are exchanged. Call me and I will record your decision.\n\n${d.owner||CW_ME}\nCollings Real Estate`}
function cwJ3Presented(d,offerId){const v=findP(d.contactId);const now=cwNowISO();const offers=cwJ3Offers(d).filter(cwJ3Live);
 for(const o of offers){if(!o.presentedAt){if(o.status==='New')o.status='Presented';o.presentedAt=now;(o.history??=[]).push('Presented to '+(v?.name||'the vendor')+' '+cwDateTime(now))}}
 cwJ3X(d).presentedAt=now;cwJ3WithdrawPresent(d,'All live offers were presented together');
 if(v&&offers.length)addAction({type:'Email',title:'Offers on '+d.address+' for '+v.name+' to consider ('+offers.length+' side by side)',body:cwJ3OffersEmail(d,v,offers),contactId:v.id,dealId:d.id,tier:'A2',j3:'vendorOffers'});
 const top=offers.slice().sort((a,b)=>b.amount-a.amount)[0];
 if(!state.tasks.some(t=>t.status==='Open'&&t.dealId===d.id&&/decision on the offers/i.test(t.title)))addTask({title:'Record '+(v?cwJ3First(v):'the vendor')+'\'s decision on the offers for '+d.address,contactId:v?.id||'',dealId:d.id,due:'Tomorrow',priority:'High',category:'Call',origin:'GeeVee · after presenting. Dictate the recap, for example "'+(v?cwJ3First(v):'Vendor')+' accepts '+(top?cwPName(top.buyerId).split(' ')[0]:'the buyer')+'\'s offer".'});
 cwPropActivity(d,offers.length+' offer'+(offers.length===1?'':'s')+' presented to the vendor in writing','GeeVee');
 state.cw.notifications.unshift({id:cwId('NT'),title:'Offers presented: '+d.address,body:'The email with every offer side by side is on Today. Record the decision when '+(v?cwJ3First(v):'the vendor')+' calls back.',kind:'OFFER',priority:'High',read:false,at:now,route:'/properties/'+d.id+'?tab=enquiries'});
 audit('auto','Offers presented for '+d.address,'Vendor email drafted (A2). Decision task added.')}
function cwJ3ParseDecision(text,d){const l=String(text||'').toLowerCase();const offers=cwJ3Offers(d).filter(cwJ3Live);const r={kind:'',offer:null,amount:0,tooLow:false};
 const cm=l.match(/counter(?:s|ed|ing)?(?:[ -]offer)?[^.\d]{0,30}?\$?(\d+(?:[.,]\d+)*)\s*(m|million|k)?/);
 if(cm){r.kind='counter';r.amount=cwJnMoney(cm[1].includes(',')?cm[1].replace(/,/g,''):cm[1],cm[2])}
 else if(/reject|declin|too low|knock(?:ed|s)? (?:it |them )?back|not enough|won'?t (?:take|accept)|no to|said no/.test(l))r.kind='reject';
 else if(/accept|take(?:s|n)? (?:it|the offer|that)|go(?:es|ing)? with|happy with|agree(?:s|d)? to|will sell to|sell to/.test(l))r.kind='accept';
 r.tooLow=/too low|not enough|insult|low ?ball|below (?:what|the)/.test(l);
 const named=offers.map(x=>({x,p:findP(x.buyerId)})).filter(z=>z.p).find(z=>{const parts=z.p.name.toLowerCase().split(' ');return parts.some(w=>w.length>2&&new RegExp('\\b'+w.replace(/[^a-z]/g,'')+"(?:'s|s)?\\b").test(l))});
 if(named)r.offer=named.x;
 else{const am=l.match(/(?:offer (?:of|at) )\$?(\d+(?:[.,]\d+)*)\s*(m|million|k)?/);if(am){const a=cwJnMoney(am[1].replace(/,/g,''),am[2]);r.offer=offers.find(o=>Math.abs(o.amount-a)<2500)||null}}
 if(!r.offer&&offers.length){r.offer=offers.length===1?offers[0]:offers.slice().sort((a,b)=>b.amount-a.amount)[0]}
 return r}
function cwJ3MakeContract(d,o,b,v){const A=state.cw.esign.agreements;let agr=A.find(a=>a.kind==='Contract'&&a.dealId===d.id&&a.status==='Draft');
 if(!agr){agr={id:cwId('AGR'),title:'Contract of Sale - '+d.address,kind:'Contract',dealId:d.id,status:'Draft',created:cwNowISO(),recipients:[],fields:[],activity:[],formId:'COS-'+d.id};A.unshift(agr)}
 agr.j3='contract';agr.recipients=[];agr.fields=[];agr.status='Draft';delete agr.j3Sold;
 const mk=(p,role,order)=>{const r={id:cwId('RC'),contactId:p?.id||'',name:p?.name||role,email:p?.email||'',role,order,status:'Not sent'};agr.recipients.push(r);return r};
 const r1=mk(b,'Purchaser',1),r2=mk(v,'Vendor',2);
 agr.fields.push({id:cwId('FD'),type:'Signature',recipient:r1.id,page:9,label:'Purchaser',required:true},{id:cwId('FD'),type:'Signature',recipient:r2.id,page:9,label:'Vendor',required:true});
 state.cw.esign.forms??={};delete state.cw.esign.forms[agr.formId];
 if(typeof cwEsCosVals==='function'){const f=cwEsCosVals(agr);f.depositDue=cwLocalDay(new Date(Date.now()+864e5));f.settleDate=cwLocalDay(new Date(Date.now()+cwJ3Days(o.settlement,60)*864e5));f.price=o.amount;f.deposit=o.deposit;f.settlement=o.settlement;f.finance=o.finance;f.inspection=o.conditions||'';f.buyerName=b.name;f.buyerEmail=b.email||'';f.buyerPhone=b.phone||'';f._pre=[...new Set([...(f._pre||[]),'price','deposit','settlement','finance','depositDue','settleDate','buyerName'])];f._offer=o.id}
 agr.prefilled=['Property','Vendor','Purchaser','Price','Deposit','Settlement','Finance','Conditions'];
 (agr.activity??=[]).unshift({at:cwNowISO(),what:'Filled by GeeVee from the accepted offer: '+cwMoney(o.amount)+', '+o.deposit+' deposit, settlement '+o.settlement+', '+o.finance+(o.conditions?', '+o.conditions:'')});
 cwJ3X(d).contractId=agr.id;
 const act=addAction({type:'eSign',title:'Send the Contract of Sale for '+d.address+' to '+b.name+' and '+(v?.name||'the vendor')+' for signing',body:`Contract of Sale for ${d.address}, ${d.suburb}. Price ${cwMoney(o.amount)}. Deposit ${o.deposit}. Settlement ${o.settlement}. ${o.finance}.${o.conditions?' Conditions: '+o.conditions+'.':''} Purchaser ${b.name}. Vendor ${v?.name||'to confirm'}. Every field is filled from the accepted offer and the property record. Check price, deposit, settlement and special conditions, then approve to send it for electronic signing.`,contactId:v?.id||'',dealId:d.id,tier:'A3',j3:'contract',j3Agr:agr.id,purpose:'Signing request'});
 agr.pendingAction=act.id;agr.activity.unshift({at:cwNowISO(),what:'Prepared for signing. Waiting for the agent\'s approval on Today (protected). Nothing has been sent.'});
 return agr}
function cwJ3ApplyDecision(d,dec,text){const x=cwDX(d),v=findP(d.contactId),o=dec.offer,b=o?findP(o.buyerId):null;cwJnSnap();const done=[];const now=cwNowISO();
 if(v){(cwPX(v).notes??=[]).unshift({id:cwId('CN'),text:'Vendor decision on '+d.address+' (dictated):\n'+text,kind:'Offer',by:'GeeVee',at:now});done.push(['Saved the recap to '+v.name,'/contacts/'+v.id+'?tab=notes'])}
 if(dec.kind==='accept'&&o&&b){
  o.status='Accepted';o.acceptedAt=now;(o.history??=[]).push('Accepted by '+(v?.name||'the vendor')+' '+cwDateTime(now));const j=cwJ3X(d);j.acceptedAt=now;j.acceptedOffer=o.id;cwJ3WithdrawPresent(d,'An offer was accepted');x.status='Under Contract';x.purchasers??=[];if(!x.purchasers.includes(b.id))x.purchasers.push(b.id);
  done.push(['Recorded '+(v?.name||'the vendor')+'\'s acceptance of '+b.name+'\'s offer of '+cwMoney(o.amount)+'. First acceptance wins','/properties/'+d.id+'?tab=enquiries']);
  let nc=0,courtesy=0;for(const z of cwJ3Offers(d).filter(z=>z.id!==o.id&&cwJ3Live(z))){z.status='Not chosen';(z.history??=[]).push('Not chosen. The vendor accepted another offer '+cwDateTime(now));nc++;const bp=findP(z.buyerId);if(bp&&!cwOptedOut(bp)&&bp.phone){addAction({type:'SMS',title:'Courtesy text to '+bp.name+' (offer not chosen)',body:`Hi ${cwJ3First(bp)}, thank you for your offer on ${d.address}. The vendor has accepted another offer. Sorry it did not work out this time. I will keep you in mind for similar homes. ${cwJ3Me()}, Collings. Reply STOP to opt out.`,contactId:bp.id,dealId:d.id,tier:'A2',j3:'notChosen'});courtesy++}}
  if(nc)done.push([nc+' other offer'+(nc>1?'s':'')+' marked "Not chosen"'+(courtesy?'. '+courtesy+' courtesy text'+(courtesy>1?'s':'')+' drafted for your approval':''),'/app/today']);
  const agr=cwJ3MakeContract(d,o,b,v);done.push(['Filled in the Contract of Sale from the accepted offer. Sending it to '+b.name+' and '+(v?.name||'the vendor')+' is on Today as a protected approval','/esign/contract-of-sale/'+agr.id]);
  if(!cwOptedOut(b)&&b.phone){addAction({type:'SMS',title:'Tell '+b.name+' the offer is accepted',body:`Hi ${cwJ3First(b)}, good news. ${v?cwJ3First(v):'The vendor'} has accepted your offer of ${cwMoney(o.amount)} on ${d.address}. The contract is coming for electronic signing. Nothing is final until both parties sign. ${cwJ3Me()}, Collings.`,contactId:b.id,dealId:d.id,tier:'A2'});done.push(['Drafted the good-news text to '+b.name+'. It is on Today for approval','/app/today'])}
  cwPropActivity(d,'Offer accepted: '+b.name+' at '+cwMoney(o.amount)+'. Under contract once signed','GeeVee');cwContactHistory(b,'Offer accepted on '+d.address,'GeeVee');
 }else if(dec.kind==='counter'&&o&&b){
  if(!dec.amount){done.push(['Counter offer heard but no figure. Say "counter at 1.08"','/properties/'+d.id+'?tab=enquiries'])}
  else{o.status='Countered at '+cwMoney(dec.amount);o.counter=dec.amount;o.counteredAt=now;(o.history??=[]).push('Vendor countered at '+cwMoney(dec.amount)+' '+cwDateTime(now));cwJ3X(d).counterAt=now;
   done.push(['Recorded the counter offer of '+cwMoney(dec.amount)+' to '+b.name+' (their offer stays live)','/properties/'+d.id+'?tab=enquiries']);
   if(!cwOptedOut(b)&&b.phone){addAction({type:'SMS',title:'Counter offer to '+b.name+': '+cwMoney(dec.amount),body:`Hi ${cwJ3First(b)}, ${v?cwJ3First(v):'the vendor'} has considered your offer on ${d.address} and would sell at ${cwMoney(dec.amount)} on the same terms. Can you let me know by 5pm tomorrow? ${cwJ3Me()}, Collings.`,contactId:b.id,dealId:d.id,tier:'A2',j3:'counter'});done.push(['Drafted the counter offer text to '+b.name+'. It is on Today for approval','/app/today'])}
   addTask({title:'Call '+b.name+' about the counter offer of '+cwMoney(dec.amount)+' ('+d.address+')',contactId:b.id,dealId:d.id,due:'Today',priority:'High',category:'Call',origin:'GeeVee · vendor countered'});done.push(['Set a call to '+b.name+' about the counter','/tasks']);
   cwPropActivity(d,'Vendor countered '+b.name+' at '+cwMoney(dec.amount),'GeeVee')}
 }else if(dec.kind==='reject'&&o&&b){
  o.status=dec.tooLow?'Rejected as too low':'Rejected';o.rejectedAt=now;(o.history??=[]).push((dec.tooLow?'Rejected as too low ':'Rejected ')+cwDateTime(now));
  done.push(['Recorded the rejection of '+b.name+'\'s offer of '+cwMoney(o.amount)+(dec.tooLow?' as too low':''),'/properties/'+d.id+'?tab=enquiries']);
  if(dec.tooLow){x.priceEvents??=[];x.priceEvents.unshift({at:now,what:'Vendor rejected an offer of '+cwMoney(o.amount)+' as too low. The advertised price may not go below this figure (Victorian underquoting rules)',value:cwMoney(o.amount)});const j=cwJ3X(d);j.floor=Math.max(j.floor||0,o.amount);done.push(['Price event recorded: the advertised price may not go below '+cwMoney(o.amount),'/properties/'+d.id+'?tab=compliance']);
   if(x.priceLow&&x.priceLow<o.amount){addTask({title:'Review the advertised price for '+d.address+' (starts below a rejected offer of '+cwMoney(o.amount)+')',contactId:v?.id||'',dealId:d.id,due:'Today',priority:'Urgent',category:'Admin',origin:'Victorian underquoting rule: a price rejected as too low sets the floor for advertising'});done.push(['Advertised price '+cwPrice(d)+' starts below the rejected offer. Urgent task added to review it','/tasks'])}}
  if(!cwOptedOut(b)&&b.phone){addAction({type:'SMS',title:'Courtesy text to '+b.name+' (offer declined)',body:`Hi ${cwJ3First(b)}, thank you for your offer on ${d.address}. ${v?cwJ3First(v):'The vendor'} has decided not to accept it${dec.tooLow?' at that level':''}. If you would like to revisit your offer, call me any time. ${cwJ3Me()}, Collings. Reply STOP to opt out.`,contactId:b.id,dealId:d.id,tier:'A2',j3:'declined'});done.push(['Drafted a courtesy text to '+b.name+'. It is on Today for approval','/app/today'])}
  cwPropActivity(d,'Offer from '+b.name+' rejected'+(dec.tooLow?' as too low':''),'GeeVee');
 }
 state.tasks.filter(t=>t.status==='Open'&&t.dealId===d.id&&/decision on the offers/i.test(t.title)).forEach(t=>t.status='Done');
 audit('auto','Vendor decision recorded for '+d.address,done.map(z=>z[0]).join('. '));
 return cwJnCard('Vendor decision on '+d.address,done,{dealId:d.id,contactId:v?.id})}
cwModalDef('j3Decision',id=>{const d=findD(id);if(!d)return{title:'Vendor decision'};const v=findP(d.contactId);const offers=cwJ3Offers(d).filter(cwJ3Live);const top=offers.slice().sort((a,b)=>b.amount-a.amount)[0];const bf=top?cwPName(top.buyerId).split(' ')[0]:'Jordan';const vf=v?cwJ3First(v):'Vendor';const accepted=cwJ3X(d).acceptedAt;
 return{title:'Record '+vf+'\'s decision: '+d.address,eyebrow:'Dictate or type the recap. GeeVee does the rest',wide:'large',
  body:`${offers.length?`<div class="cw-j3-offers">${offers.map(o=>`<div class="list-row"><div class="number-circle">${ico('file','sm')}</div><div class="list-main"><strong>${h(cwPName(o.buyerId))}: ${cwMoney(o.amount)}</strong><div class="sub">${h(cwJ3Terms(o)||'Terms to confirm')}</div></div>${tag(o.status,/accept/i.test(o.status)?'green':/present/i.test(o.status)?'teal':/counter/i.test(o.status)?'yellow':'')}</div>`).join('')}</div>`:cwNote('No live offers on this property. Record one from a buyer call first.','warn')}
  ${accepted?cwNote('An offer was already accepted. First acceptance wins; further recaps are saved as notes only.','info'):''}
  <textarea id="j3-decision" class="field textarea full" style="min-height:90px;margin-top:10px" placeholder="For example: ${h(vf)} accepts ${h(bf)}'s offer" aria-label="Vendor decision recap"></textarea>
  <div class="cw-row" style="margin-top:8px">${cwBtn('Example: accept','cwJ3DecEx',d.id+'|accept','sm')}${cwBtn('Example: counter','cwJ3DecEx',d.id+'|counter','sm')}${cwBtn('Example: reject as too low','cwJ3DecEx',d.id+'|reject','sm')}</div>
  <p class="hint" style="margin-top:8px">Accept: first acceptance wins, other buyers get a courtesy text (for your approval) and the Contract of Sale is filled in. Counter: the buyer gets the counter in writing (for your approval). Rejected as too low: recorded as a price event, the advertised price may not go below it.</p>`,
  foot:cwBtn('Cancel','close')+(offers.length?cwBtn('Save and let GeeVee do it','cwJ3DecSave',d.id,'primary'):'')}});
cwOn('cwJ3DecisionOpen',id=>{ui.gvChatOpen=false;cwModal('j3Decision',id)});
cwOn('cwJ3DecEx',id=>{const [did,kind]=id.split('|');const d=findD(did);if(!d)return;const v=findP(d.contactId);const offers=cwJ3Offers(d).filter(cwJ3Live);const top=offers.slice().sort((a,b)=>b.amount-a.amount)[0];const bf=top?cwPName(top.buyerId).split(' ')[0]:'the buyer';const vf=v?cwJ3First(v):'The vendor';
 const t=document.getElementById('j3-decision');if(!t)return;const c=top?(Math.round(top.amount*1.03/1e4)*1e4/1e6).toFixed(2):'1.08';
 t.value=kind==='accept'?vf+' accepts '+bf+'\'s offer.':kind==='counter'?vf+' wants to counter '+bf+' at '+c+' on the same terms.':vf+' rejected '+bf+'\'s offer as too low.';t.focus()});
cwOn('cwJ3DecSave',id=>{const d=findD(id);if(!d)return;const text=(document.getElementById('j3-decision')?.value||'').trim();if(!text)return toast('Type or dictate what the vendor decided.');
 const dec=cwJ3ParseDecision(text,d);if(!dec.kind)return toast('GeeVee could not tell whether the vendor accepted, countered or rejected. Say "accepts", "counter at" or "rejected as too low".');
 if(!dec.offer)return toast('No live offer to apply that to.');if(dec.kind==='counter'&&!dec.amount)return toast('Say the counter figure, for example "counter at 1.08".');
 if(dec.kind==='accept'&&cwJ3X(d).acceptedAt)return toast('An offer was already accepted on '+d.address+'. First acceptance wins.');
 const cid=cwJ3ApplyDecision(d,dec,text);persist();ui.modal={type:'cw',name:'jnDid',arg:cid};render()});

/* approvals: present (A3), contract send (A3), vendor offers email (A2) */
const cwJ3PrevSync=cwJnSyncApprovals;
cwJnSyncApprovals=function(){cwJ3PrevSync();let changed=false;
 for(const a of state.actions.filter(a=>a.j3&&!a.jnHandled)){const d=findD(a.dealId);const ok=/reviewed|approved|sent/i.test(a.status),no=/reject|ignored|withdrawn/i.test(a.status);if(!ok&&!no)continue;a.jnHandled=true;changed=true;
  if(a.j3==='present'&&d){if(ok)cwJ3Presented(d,a.j3Offer);else{const o=(state.offers||[]).find(z=>z.id===a.j3Offer);if(o)(o.history??=[]).push('Not presented. The agent did not approve it on Today.');cwPropActivity(d,'Offer not presented (declined on Today)')}}
  else if(a.j3==='contract'&&d){const agr=state.cw.esign.agreements.find(g=>g.id===a.j3Agr);if(agr){if(ok&&agr.status==='Draft'){agr.status='In Progress';agr.sentAt=cwNowISO();(agr.recipients||[]).forEach(r=>{if(r.status==='Not sent')r.status='Sent'});(agr.activity??=[]).unshift({at:cwNowISO(),what:'Approved on Today by '+CW_ME+'. Sent to '+agr.recipients.map(r=>r.name).join(' and ')+' for electronic signing (simulated).'});delete agr.pendingAction;cwJ3X(d).contractSentAt=cwNowISO();
    state.cw.notifications.unshift({id:cwId('NT'),title:'Contract of Sale sent for signing: '+d.address,body:'Both parties sign on their own device. Demo: open the signing page from the property.',kind:'ESIGN',priority:'Normal',read:false,at:cwNowISO(),route:'/esign/document/'+agr.id});audit('esign','Contract of Sale sent for signing: '+d.address,'Approved by the agent (A3). Simulated send.')}
   else if(no){(agr.activity??=[]).unshift({at:cwNowISO(),what:'Not sent. The agent did not approve it on Today.'});delete agr.pendingAction}}}
  else if(a.j3==='vendorOffers'&&d&&ok)cwJ3X(d).vendorEmailAt=cwNowISO();}
 if(changed)persist()};

/* ---------- 1d. Contract signed by both: sold ---------- */
function cwJ3Reminder(d,key,title,when,p){addTask({title,contactId:p?.id||'',dealId:d.id,due:cwDate(when),dueISO:cwLocalDay(when),priority:'High',category:'Admin',origin:'GeeVee · settlement checklist',j3:key})}
function cwJ3Sold(agr){agr.j3Sold=true;const d=findD(agr.dealId);if(!d)return;const x=cwDX(d),j=cwJ3X(d),v=findP(d.contactId);const o=(state.offers||[]).find(z=>z.id===j.acceptedOffer)||cwJ3Offers(d).find(z=>/accept/i.test(z.status))||null;const b=o?findP(o.buyerId):findP((agr.recipients||[]).find(r=>r.role==='Purchaser')?.contactId);cwJnSnap();const done=[];const now=new Date();
 const price=o?.amount||x.soldPrice||d.guide;
 if(typeof cwLdSetStage==='function')cwLdSetStage(d,'Sold','contract signed by both parties');x.status='Sold';x.visibility=false;x.soldPrice=price;x.soldAt=cwLocalDay(now);j.soldAt=now.toISOString();x.priceEvents??=[];x.priceEvents.unshift({at:now.toISOString(),what:'Sold (contract signed by both parties)',value:cwMoney(price)});d.compliance??={};d.compliance['Contract of Sale + Section 32']=true;if(b){x.purchasers??=[];if(!x.purchasers.includes(b.id))x.purchasers.push(b.id)}
 x.docs??={pps:[],contract:[],lease:[],report:[],other:[]};(x.docs.contract??=[]).push({id:cwId('DOC'),name:'Signed Contract of Sale - '+d.address+'.pdf',size:'signed copy',at:now.toISOString(),by:'GeeVee',category:'Contracts'});
 done.push(['Marked '+d.address+' sold for '+cwMoney(price)+' and filed the signed contract','/properties/'+d.id+'?tab=documents']);
 const finDays=o&&/subject to finance/i.test(o.finance)?cwJ3Days(o.finance,14):0;const unc=new Date(now.getTime()+finDays*864e5);const ppsDue=new Date(unc.getTime()+7*864e5);
 addTask({title:'Publish the sold price in the Property Price Statement within 7 days of unconditional: '+d.address,contactId:v?.id||'',dealId:d.id,due:cwDate(ppsDue),dueISO:cwLocalDay(ppsDue),priority:'High',category:'Admin',origin:'Victorian rule. Expected unconditional '+cwDate(unc)+(finDays?' when finance is approved':'')+'.',j3:'pps'});done.push(['Task: publish the sold price in the Property Price Statement within 7 days of unconditional (due '+cwDate(ppsDue)+')','/tasks']);
 const depDue=new Date(now.getTime()+864e5);const setDay=new Date(now.getTime()+cwJ3Days(o?.settlement,60)*864e5);setDay.setHours(12,0,0,0);
 state.cw.events.push({id:cwId('EV'),title:'Deposit due: '+d.address,start:depDue.toISOString(),mins:30,where:'Trust account',kind:'Deposit',dealId:d.id,contactId:b?.id||'',j3:'deposit'},{id:cwId('EV'),title:'Settlement: '+d.address,start:setDay.toISOString(),mins:60,where:cwAddr(d),kind:'Settlement',dealId:d.id,contactId:v?.id||'',j3:'settlement'});
 done.push(['Deposit due '+cwDate(depDue)+' and settlement '+cwDate(setDay)+' are in the calendar','/calendar']);
 const fin=finDays?new Date(now.getTime()+finDays*864e5):null;const insp=o&&/inspection/i.test(o.conditions||'')?new Date(now.getTime()+7*864e5):null;
 state.cw.settlements??=[];let st=state.cw.settlements.find(s=>s.dealId===d.id);if(!st){st={id:cwId('ST'),dealId:d.id};state.cw.settlements.push(st)}
 Object.assign(st,{price,commission:Math.round(price*(d.fee||1.85)/100),settles:cwLocalDay(setDay),buyerId:b?.id||'',vendorId:v?.id||'',status:'Pending',contractAt:now.toISOString(),depositDue:cwLocalDay(depDue),financeDue:fin?cwLocalDay(fin):'',inspectionDue:insp?cwLocalDay(insp):'',checklist:{deposit:false,finance:!fin,inspection:!insp,settlementDate:true},j3:true});
 done.push(['Settlement record: '+cwMoney(st.commission)+' commission at '+(d.fee||1.85)+'% when it settles on '+cwDate(setDay),'/properties/'+d.id]);
 cwJ3Reminder(d,'deposit','Confirm the '+(o?.deposit||'10%')+' deposit for '+d.address+' is in the trust account',depDue,v);
 if(fin)cwJ3Reminder(d,'finance','Finance condition date for '+d.address+': confirm '+(b?.name||'the buyer')+'\'s approval',fin,b);
 if(insp)cwJ3Reminder(d,'inspection','Building inspection for '+d.address+': confirm it is done and satisfactory',insp,b);
 cwJ3Reminder(d,'settlementDate','Settlement day: '+d.address+'. Keys, commission and the thank-you',setDay,v);
 done.push(['Settlement checklist with reminders on Today: deposit'+(fin?', finance condition date':'')+(insp?', building inspection':'')+', settlement day','/tasks']);
 let cc=0;for(const c of state.cw.comms.campaigns.filter(c=>c.dealId===d.id&&!['Sent','Cancelled'].includes(c.status))){c.status='Cancelled';cc++}
 for(const a of state.actions.filter(a=>a.dealId===d.id&&a.status==='Awaiting review'&&a.jn==='campaign')){a.status='Withdrawn';a.jnHandled=true}
 let oc=0;for(const oh of state.cw.openHomes.filter(oh=>oh.dealId===d.id&&['Upcoming','Open'].includes(oh.status))){oh.status='Cancelled';oc++}
 x.openHomes=(x.openHomes||[]).filter(oh=>Date.parse(oh.day)<now.getTime());
 state.cw.events=state.cw.events.filter(e=>!(e.dealId===d.id&&['Open home','Auction'].includes(e.kind)&&Date.parse(e.start)>now.getTime()));
 done.push(['Cancelled '+oc+' upcoming open home'+(oc===1?'':'s')+(cc?' and '+cc+' campaign'+(cc>1?'s':''):'')+'. Portals now show Sold','/inspections']);
 let m=0;for(const e of cwJ3Buyers(d).filter(e=>e.p.id!==b?.id&&!e.out&&e.p.phone).slice(0,5)){addAction({type:'SMS',title:'Other homes for '+e.p.name+' ('+d.address+' sold)',body:`Hi ${cwJ3First(e.p)}, ${d.address} has sold. We have other homes coming up in ${d.suburb} and nearby that may suit you. Want me to send them through? ${cwJ3Me()}, Collings. Reply STOP to opt out.`,contactId:e.p.id,dealId:d.id,tier:'A2',j3:'otherHomes'});m++}
 if(m)done.push(['Drafted "we have other homes" texts to '+m+' buyer'+(m>1?'s':'')+' who missed out. They are on Today for approval','/app/today']);
 if(v&&!cwOptedOut(v)&&v.phone)addAction({type:'SMS',title:'Tell '+v.name+' the contract is signed',body:`Hi ${cwJ3First(v)}, both parties have signed. ${d.address} is sold for ${cwMoney(price)}. Deposit due ${cwDate(depDue)}, settlement ${cwDate(setDay)}. I will keep you posted at each step. ${cwJ3Me()}, Collings.`,contactId:v.id,dealId:d.id,tier:'A2'});
 state.tasks.filter(t=>t.status==='Open'&&t.dealId===d.id&&/decision on the offers|buyers to call first|after open home|counter offer/i.test(t.title)).forEach(t=>t.status='Done');
 state.cw.notifications.unshift({id:cwId('NT'),title:'Sold: '+d.address+' for '+cwMoney(price),body:'Contract signed by both parties. Settlement '+cwDate(setDay)+'. Checklist and reminders are on Today.',kind:'SOLD',priority:'High',read:false,at:now.toISOString(),route:'/properties/'+d.id});
 cwJ3WithdrawPresent(d,'Sold');
 audit('auto','Sold: '+d.address,done.map(z=>z[0]).join('. '));
 const id=cwJnCard(d.address+' is sold',done,{dealId:d.id,contactId:v?.id});persist();setTimeout(()=>{ui.modal={type:'cw',name:'jnDid',arg:id};render()},0)}
const cwJ3PrevRender=render;
render=function(){try{if(state.cw){for(const a of state.cw.esign.agreements)if(a.j3==='contract'&&a.status==='Completed'&&!a.j3Sold)cwJ3Sold(a)}}catch(e){console.warn('journey3',e)}return cwJ3PrevRender()};

/* ---------- 2. Sale to settlement ---------- */
const CW_J3_CHK=[['deposit','Deposit received in the trust account','depositDue'],['finance','Finance approved (condition date)','financeDue'],['inspection','Building inspection done and satisfactory','inspectionDue'],['settlementDate','Settlement date confirmed with both conveyancers','settles']];
cwModalDef('j3Settle',id=>{const d=findD(id);const st=d?cwJ3Settle(d):null;if(!d||!st)return{title:'Settlement checklist',body:cwEmpty('No settlement record yet','It is created when the contract is signed by both parties.'),foot:cwBtn('Close','close','','primary')};const b=findP(st.buyerId),v=findP(st.vendorId||d.contactId);const c=st.checklist||(st.checklist={deposit:false,finance:true,inspection:true,settlementDate:true});const allOk=CW_J3_CHK.every(([k])=>c[k]);const settled=st.status==='Settled';
 return{title:'Sale to settlement: '+d.address,eyebrow:'Sold '+cwMoney(st.price||cwDX(d).soldPrice||0)+' · settles '+cwDate(st.settles)+' · commission '+cwMoney(st.commission),wide:'large',
  body:`${cwKV([['Purchaser',b?cwLink(h(b.name),'/contacts/'+b.id):''],['Vendor',v?cwLink(h(v.name),'/contacts/'+v.id):''],['Contract signed',st.contractAt?cwDateTime(st.contractAt):''],['Status',tag(st.status||'Pending',settled?'green':'yellow')]])}
  <div class="cw-j3-chk">${CW_J3_CHK.map(([k,l,dk])=>`<div class="list-row"><div class="number-circle" style="${c[k]?'background:#e7f6eb;color:#217e50':'background:#fff3df;color:#a86a15'}">${ico(c[k]?'check':'calendar','sm')}</div><div class="list-main"><strong>${h(l)}</strong><div class="sub">${st[dk]?(k==='settlementDate'?'Settles ':'Due ')+cwDate(st[dk]):'Not a condition of this contract'}${c[k]&&st['doneAt_'+k]?' · done '+cwDate(st['doneAt_'+k]):''}</div></div>${settled?tag('Done','green'):cwBtn(c[k]?'Undo':'Mark done','cwJ3Chk',d.id+'|'+k,c[k]?'sm ghost':'sm primary')}</div>`).join('')}</div>
  ${settled?cwNote('<b>Settled '+cwDate(st.settledAt)+'.</b> Commission '+cwMoney(st.commission)+' recorded. The thank-you and review request are on Today, the anniversary call is set, and both parties are in the Past clients list.','ok'):allOk?cwNote('<b>Everything is ticked.</b> On settlement day, mark it settled and GeeVee records the commission and starts the repeat and referral work.','ok'):cwNote('GeeVee reminds you of each item as a task on Today. Tick them here as they happen. Finance approved means the sale is unconditional and the 7-day clock for the sold price starts.','info')}`,
  foot:cwBtn('Close','close')+(settled?'':cwBtn(ico('zap','sm')+' Settlement day: mark settled (demo)','cwJ3Settled',d.id,'primary'))}});
cwOn('cwJ3SettleOpen',id=>{ui.gvChatOpen=false;cwModal('j3Settle',id)});
cwOn('cwJ3Chk',id=>{const [did,k]=id.split('|');const d=findD(did);const st=d?cwJ3Settle(d):null;if(!st)return;st.checklist??={};st.checklist[k]=!st.checklist[k];st['doneAt_'+k]=st.checklist[k]?cwNowISO():'';const t=state.tasks.find(t=>t.dealId===d.id&&t.j3===k);if(t)t.status=st.checklist[k]?'Done':'Open';
 const label=CW_J3_CHK.find(z=>z[0]===k)[1];cwPropActivity(d,label+(st.checklist[k]?': done':': reopened'));
 if(k==='finance'&&st.checklist[k]&&!st.unconditionalAt){st.unconditionalAt=cwNowISO();const due=new Date(Date.now()+7*864e5);const pt=state.tasks.find(t=>t.dealId===d.id&&t.j3==='pps'&&t.status==='Open');if(pt){pt.due=cwDate(due);pt.dueISO=cwLocalDay(due);pt.origin='Victorian rule. Unconditional '+cwDate(new Date())+'. Sold price due in the Property Price Statement by '+cwDate(due)+'.'}}
 persist();cwModal('j3Settle',did)});
function cwJ3Settled(d){const st=cwJ3Settle(d);if(!st||st.status==='Settled')return;const x=cwDX(d),j=cwJ3X(d),v=findP(st.vendorId||d.contactId),b=findP(st.buyerId);cwJnSnap();const done=[];const now=new Date();
 st.status='Settled';st.settledAt=now.toISOString();st.checklist??={};for(const [k] of CW_J3_CHK){if(!st.checklist[k]){st.checklist[k]=true;st['doneAt_'+k]=st.settledAt}}j.settledAt=st.settledAt;x.settledAt=cwLocalDay(now);
 done.push(['Marked the sale settled. Commission '+cwMoney(st.commission)+' recorded against '+d.address,'/properties/'+d.id]);
 state.tasks.filter(t=>t.status==='Open'&&t.dealId===d.id&&t.j3&&t.j3!=='pps').forEach(t=>t.status='Done');
 cwPropActivity(d,'Settled. Commission '+cwMoney(st.commission),'GeeVee');
 for(const [p,role] of [[v,'vendor'],[b,'buyer']]){if(!p)continue;if(cwOptedOut(p)){done.push([p.name+' has opted out, so no thank-you or review request was drafted','/contacts/'+p.id]);continue}
  const first=cwJ3First(p);const body=role==='vendor'?`Hi ${first},\n\nCongratulations, ${d.address} settled today. Thank you for trusting Collings with the sale.\n\nIf you have a minute, a short Google review helps other ${d.suburb} families find us: [review link]\n\nI will check in around this time next year to see how things are going. If anyone you know is thinking of selling, I would love an introduction.\n\n${d.owner||CW_ME}\nCollings Real Estate\nTo stop these emails, reply unsubscribe.`:`Hi ${first},\n\nCongratulations, ${d.address} is yours as of today. Thank you for choosing a Collings home.\n\nIf you have a minute, a short Google review helps other buyers find us: [review link]\n\nI will check in around this time next year to see how you have settled in.\n\n${d.owner||CW_ME}\nCollings Real Estate\nTo stop these emails, reply unsubscribe.`;
  addAction({type:'Email',title:'Thank '+p.name+' and ask for a review ('+role+', '+d.address+')',body,contactId:p.id,dealId:d.id,tier:'A2',j3:'review'});done.push(['Drafted a thank-you and review request to '+p.name+'. It is on Today for approval','/app/today'])}
 j.reviewAt=now.toISOString();
 const ann=new Date(now);ann.setFullYear(ann.getFullYear()+1);
 addTask({title:'Anniversary call: '+(v?.name||'the vendor')+(b?' and '+b.name:'')+', one year since '+d.address+' settled',contactId:v?.id||b?.id||'',dealId:d.id,due:cwDate(ann),dueISO:cwLocalDay(ann),priority:'Normal',category:'Call',origin:'GeeVee · repeat and referral. Ask how they are going and whether anyone they know is thinking of selling.',j3:'anniversary'});done.push(['Set the 12-month anniversary call for '+cwDate(ann),'/tasks']);
 const lists=state.cw.comms.lists??=[];let L=lists.find(l=>/^past clients$/i.test(l.name));if(!L){L={id:cwId('LS'),name:'Past clients',contactIds:[],auto:false,j3:true};lists.push(L)}
 const added=[];for(const p of [v,b].filter(Boolean)){if(!L.contactIds.includes(p.id))L.contactIds.push(p.id);cwJ3S().past[p.id]={dealId:d.id,role:p===v?'Vendor':'Purchaser',settledAt:st.settledAt};cwJ3S().touches[p.id]=st.settledAt;cwContactHistory(p,'Added to Past clients: '+d.address+' settled','GeeVee');added.push(p.name)}
 x.purchasers??=[];if(b&&!x.purchasers.includes(b.id))x.purchasers.push(b.id);
 if(added.length)done.push(['Added '+added.join(' and ')+' to the Past clients list','/communications?tab=lists']);
 state.cw.notifications.unshift({id:cwId('NT'),title:'Settled: '+d.address,body:'Commission '+cwMoney(st.commission)+'. Thank-you and review request on Today. Anniversary call set.',kind:'SETTLED',priority:'High',read:false,at:now.toISOString(),route:'/properties/'+d.id});
 audit('auto','Settled: '+d.address,done.map(z=>z[0]).join('. '));
 const id=cwJnCard(d.address+' has settled',done,{dealId:d.id,contactId:v?.id});persist();ui.modal={type:'cw',name:'jnDid',arg:id};render()}
cwOn('cwJ3Settled',id=>{const d=findD(id);if(!d)return;if(!cwJ3Settle(d))return toast('No settlement record yet.');cwJ3Settled(d)});

/* ---------- 3. Settlement to referral: Today card ---------- */
function cwJ3PastClients(){const L=(state.cw.comms.lists||[]).find(l=>/^past clients$/i.test(l.name));const ids=new Set(L?.contactIds||[]);if(typeof cwCmPastList==='function')cwCmPastList().forEach(p=>ids.add(p.id));return [...ids].map(findP).filter(p=>p&&!cwPX(p).trashed)}
function cwJ3LastTouch(p){const t=cwJ3S().touches[p.id];const hist=(cwPX(p).history||[]).filter(e=>/call|text|email|check-in|update|touch|review|thank/i.test(e.what||'')).map(e=>Date.parse(e.at)).filter(n=>n>0);return Math.max(t?Date.parse(t):0,...hist,0)}
function cwJ3PastDeal(p){const past=cwJ3S().past[p.id];if(past&&findD(past.dealId))return{d:findD(past.dealId),role:past.role};const d=cwProps().find(d=>d.stage==='Sold'&&(d.contactId===p.id||(cwDX(d).purchasers||[]).includes(p.id)));return d?{d,role:d.contactId===p.id?'Vendor':'Purchaser'}:null}
function cwJ3TodayAside(){const all=cwJ3PastClients();if(!all.length)return '';const due=all.map(p=>({p,last:cwJ3LastTouch(p)})).filter(z=>!z.last||Date.now()-z.last>90*864e5).sort((a,b)=>a.last-b.last);
 return `<div class="gv-aside-mini cw-j3-aside"><b>✦ Repeat and referral</b><small class="muted">${all.length} past client${all.length===1?'':'s'}. ${due.length?due.length+' due a touch (no contact in 90 days).':'Everyone has been contacted in the last 90 days.'}</small>${due.slice(0,4).map(z=>{const pd=cwJ3PastDeal(z.p);return `<div class="cw-j3-past"><span><b>${h(z.p.name)}</b><small>${pd?h(pd.role+', '+pd.d.address):'Past client'}${z.last?' · last touch '+cwDate(z.last):' · no touch recorded'}</small></span><span class="cw-row">${cwBtn(ico('phone','sm'),'call',z.p.id,'sm ghost')}${cwOptedOut(z.p)?tag('Opted out','red'):cwBtn('Draft update','cwJ3Touch',z.p.id,'sm')}</span></div>`}).join('')}<div style="margin-top:8px">${cwGoBtn('Past clients list','/communications?tab=past_clients','sm ghost')}</div></div>`}
cwOn('cwJ3Touch',id=>{const p=findP(id);if(!p)return;if(cwOptedOut(p))return toast(p.name+' has opted out. Call them instead.');const pd=cwJ3PastDeal(p);const sub=pd?.d.suburb||p.suburb||'your area';const sale=state.cw.sales.find(s=>s.suburb===sub);
 addAction({type:'Email',title:'Market update to past client '+p.name,body:`Hi ${cwJ3First(p)},\n\nIt has been a while since ${pd?pd.d.address:'we worked together'}${pd?' '+(pd.role==='Vendor'?'sold':'became yours'):''}. I hope all is well.\n\nA quick note on ${sub}: ${sale?sale.address+' sold recently for '+cwMoney(sale.price)+'.':'prices have held up well this year.'} If you ever want to know what your home is worth now, or know someone thinking of selling, I am happy to help.\n\n${CW_ME}\nCollings Real Estate\nTo stop these emails, reply unsubscribe.`,contactId:p.id,dealId:pd?.d.id||'',tier:'A2',j3:'touch'});
 cwJ3S().touches[p.id]=cwNowISO();cwContactHistory(p,'Past client update drafted by GeeVee','GeeVee');cwPersist('Update to '+p.name+' is on Today for approval.')});
const cwJ3PrevToday=today;
today=function(){const html=cwJ3PrevToday();const i=html.lastIndexOf('</aside>');return i<0?html:html.slice(0,i)+cwJ3TodayAside()+html.slice(i)};

/* ---------- steps and strip ---------- */
const cwJ3PrevSteps=cwJnSteps;
cwJnSteps=function(d){const j=cwJ3PrevSteps(d);if(!cwJ3Sale(d))return j;const x=cwDX(d),s=cwJ3X(d),v=findP(d.contactId);const offers=cwJ3Offers(d),live=offers.filter(cwJ3Live),acc=offers.find(o=>/accept/i.test(o.status));const agr=cwJ3Agr(d);const st=cwJ3Settle(d);
 j.steps.push(['Buyers called',!!s.buyersCalledAt],['Offer received',offers.length>0],['Presented',offers.some(o=>o.presentedAt)||!!s.presentedAt],['Accepted',!!acc],['Contract signed',agr?.status==='Completed'],['Sold',d.stage==='Sold'],['Settled',st?.status==='Settled'],['Review requested',!!s.reviewAt]);
 const pendPresent=state.actions.find(a=>a.j3==='present'&&a.dealId===d.id&&a.status==='Awaiting review'),pendContract=state.actions.find(a=>a.j3==='contract'&&a.dealId===d.id&&a.status==='Awaiting review');
 const vf=v?cwJ3First(v):'the vendor';
 if(st?.status==='Settled')j.next='Settled '+cwDate(st.settledAt)+'. Thank-you and review request drafted. Anniversary call set.';
 else if(d.stage==='Sold')j.next='Sold for '+cwMoney(x.soldPrice||st?.price||0)+'.'+(st?' Settles '+cwDate(st.settles)+'. Work through the settlement checklist.':'');
 else if(agr?.status==='In Progress')j.next='Contract sent. Waiting on '+(agr.recipients||[]).filter(r=>r.status!=='Signed').map(r=>r.name).join(' and ')+' to sign.';
 else if(pendContract)j.next='The Contract of Sale is on Today for your approval (protected).';
 else if(acc)j.next='Offer accepted by '+vf+'. The contract is being prepared.';
 else if(pendPresent)j.next='"Present offer to '+vf+'" is on Today for your approval (protected).';
 else if(live.some(o=>o.presentedAt))j.next='Offers presented to '+vf+'. Record the decision when they call back.';
 else if(live.length)j.next=live.length+' offer'+(live.length>1?'s':'')+' to present to '+vf+'. Approve it on Today.';
 else if(!s.buyersCalledAt){const top=cwJ3Buyers(d).filter(b=>!b.out).slice(0,2).map(b=>b.p.name);j.next='Live. Call the buyers to call first'+(top.length?': '+top.join(', '):'')+'.'}
 else j.next=x.auctionAt?'Live. Auction '+cwDateTime(x.auctionAt)+'. Enquiries, open homes and offers feed Today.':'Live. Enquiries, open homes and offers feed Today.';
 j.j3={offers,agr,st};return j};
const cwJ3PrevStrip=cwJnStrip;
cwJnStrip=function(d){const html=cwJ3PrevStrip(d);if(!cwJ3Sale(d))return html;const x=cwDX(d),j=cwJnSteps(d),s=cwJ3X(d);const agr=j.j3?.agr,st=j.j3?.st,live=(j.j3?.offers||[]).filter(cwJ3Live);const pendContract=agr&&agr.status==='Draft'&&state.actions.some(a=>a.j3==='contract'&&a.dealId===d.id&&a.status==='Awaiting review');
 let btns='';
 if(d.stage!=='Sold'){btns+=cwBtn(ico('phone','sm')+' Buyers to call','cwJ3BuyersOpen',d.id,s.buyersCalledAt?'sm':'sm primary');btns+=cwBtn(ico('mic','sm')+' Record offer from call','cwJ3OfferOpen',d.id,'sm');if(live.length&&!s.acceptedAt)btns+=cwBtn('Record vendor decision','cwJ3DecisionOpen',d.id,'sm primary')}
 if(agr&&agr.status==='In Progress')btns+=cwGoBtn('Buyer signing page (demo)','/esign/sign/'+agr.id,'sm primary');
 else if(agr&&agr.status==='Draft'&&!pendContract&&s.acceptedAt)btns+=cwGoBtn('Contract of Sale','/esign/contract-of-sale/'+agr.id,'sm');
 if(st&&(d.stage==='Sold'||st.j3))btns+=cwBtn(ico('check','sm')+' Settlement checklist','cwJ3SettleOpen',d.id,d.stage==='Sold'&&st.status!=='Settled'?'sm primary':'sm');
 if(html)return html.replace('</div></div><div class="cw-jn-steps">',btns+'</div></div><div class="cw-jn-steps">');
 let steps=j.steps;const li=steps.findIndex(z=>z[0]==='Live');if(!(x.jnAppraisalEvent||x.jnRecapAt||x.jnAuthority)&&li>=0)steps=steps.slice(li);
 return `<section class="cw-jn-strip"><div class="cw-row between"><div><span class="gv-eyebrow">GEEVEE · SALE JOURNEY</span><b>${h(j.next||'')}</b></div><div class="cw-row">${btns}</div></div><div class="cw-jn-steps">${steps.map(([n,ok],i)=>`<span class="cw-jn-step ${ok?'done':''}">${ok?ico('check','sm'):`<i>${i+1}</i>`}${h(n)}</span>`).join('')}</div></section>`};

/* ---------- Ask GeeVee ---------- */
const cwJ3PrevChat=gvChatAnswer;
gvChatAnswer=function(q){const l=q.toLowerCase();const deal=typeof gvxFindDeal==='function'?gvxFindDeal(l):null;
 const m=l.match(/who (?:should|do|can|will|shall) (?:i|we) (?:call|ring|phone)(?: first| next)?(?: about| for| on| re| regarding)? (.+)/);
 if(m){const d=deal&&cwJ3Sale(deal)?deal:null;
  if(d&&d.stage==='Sold'){const st=cwJ3Settle(d);const b=st&&findP(st.buyerId);return{text:d.address+' is sold'+(b?' to '+b.name:'')+(st?.status==='Settled'?' and settled.':st?'. It settles '+cwDate(st.settles)+'. The buyers who missed out have "other homes" texts on Today for your approval.':'.'),actions:[...(st&&st.status!=='Settled'?[{label:'Settlement checklist',type:'cwJ3SettleOpen',id:d.id}]:[]),{label:'Open '+d.address,type:'cwGo',id:'/properties/'+d.id}]}}
  if(d){const list=cwJ3Buyers(d);if(!list.length)return{text:'No buyer signals on '+d.address+' yet. Enquiries, open home check-ins and offers feed the list.',actions:[{label:'Open '+d.address,type:'cwGo',id:'/properties/'+d.id}]};
   const top=list.slice(0,3);return{text:'Call these first for '+d.address+':\n'+top.map((e,i)=>(i+1)+'. '+e.p.name+(e.out?' (opted out: call only)':'')+': '+e.why.slice(0,2).join('; ')).join('\n')+(list.length>3?'\n'+(list.length-3)+' more on the full list.':''),actions:[{label:'Call '+cwJ3First(top[0].p),type:'cwJ3Call',id:d.id+'|'+top[0].p.id},{label:'Full list',type:'cwJ3BuyersOpen',id:d.id}]}}}
 if(/record (?:an? |the |a new )?offer|log (?:an? )?offer|new offer from|offer from a call/.test(l)){const forSale=cwProps().filter(x=>x.stage==='For sale');
  if(deal&&cwJ3Sale(deal)&&deal.stage!=='Sold')return{text:'Tell me what the buyer said and I will record the offer on '+deal.address+', then put "Present offer to vendor" on Today for your approval.',actions:[{label:'Record offer on '+deal.address,type:'cwJ3OfferOpen',id:deal.id}]};
  return{text:'Which property is the offer on? Pick one, then paste the call or dictate the recap.',actions:forSale.slice(0,4).map(x=>({label:x.address,type:'cwJ3OfferOpen',id:x.id}))}}
 if(/what offers|which offers|any offers|offers (?:do we have|are there|have we got|so far)|offers on /.test(l)&&deal){const os=cwJ3Offers(deal);
  if(!os.length)return{text:'No written offers on '+deal.address+' yet.',actions:[{label:'Record offer from call',type:'cwJ3OfferOpen',id:deal.id}]};
  return{text:os.length+' offer'+(os.length>1?'s':'')+' on '+deal.address+':\n'+os.map(o=>'- '+cwPName(o.buyerId)+': '+cwMoney(o.amount)+', '+[o.deposit?o.deposit+' deposit':'',o.settlement?o.settlement+' settlement':'',o.finance].filter(Boolean).join(', ')+' ('+o.status+')').join('\n')+'\nAdvertised: '+cwPrice(deal)+'.',actions:[...(os.some(cwJ3Live)&&deal.stage!=='Sold'&&!cwJ3X(deal).acceptedAt?[{label:'Record vendor decision',type:'cwJ3DecisionOpen',id:deal.id}]:[]),{label:'Offers tab',type:'cwGo',id:'/properties/'+deal.id+'?tab=enquiries'}]}}
 return cwJ3PrevChat(q)};
