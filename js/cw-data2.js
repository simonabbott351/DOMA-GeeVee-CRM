'use strict';
/* Data layer 2: enriches the sample record once so the prototype reads like a working office.
   Runs after cwEnsure (same render wrapper pattern as cw-data.js). Applies once per CW_D2_VERSION (state.cw.d2).
   Bump CW_D2_VERSION when the seed changes so existing browsers upgrade.
   Rules: scalars are filled only when empty or still at the seeded default (checked against SEED where it exists);
   arrays only receive entries whose ids are not already present. Nothing a user changed is overwritten.
   Also makes the Analytics, Commissions and Agent analytics date ranges change their totals by wrapping cwPfPortal and cwPfStats. */
const CW_D2_VERSION=2;
const D2_AG={caleb:CW_ME,sam:'Sam Taylor',dan:'Daniel Reid',priya:'Priya Shah',alex:'Alex Morgan'};

/* ---------- helpers ---------- */
function d2At(daysAgo,hh=9,mm=0){const d=new Date();d.setDate(d.getDate()-daysAgo);d.setHours(hh,mm,0,0);return d.toISOString()}
function d2Hours(h){return new Date(Date.now()-h*3600e3).toISOString()}
function d2Day(daysAgo){return cwLocalDay(new Date(Date.now()-daysAgo*864e5))}
function d2Time(iso){return new Date(iso).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'}).replace(/\s/g,'').toLowerCase()}
function d2When(iso){const d=new Date(iso),now=new Date();if(isNaN(d))return '';const y=new Date(now);y.setDate(y.getDate()-1);const day=cwLocalDay(d);if(day===cwLocalDay(now))return 'Today, '+d2Time(iso);if(day===cwLocalDay(y))return 'Yesterday, '+d2Time(iso);if((now-d)/864e5<6)return d.toLocaleDateString('en-AU',{weekday:'short'})+' '+d2Time(iso);return d.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+', '+d2Time(iso)}
function d2Short(iso){const d=new Date(iso),now=new Date();if(isNaN(d))return '';const y=new Date(now);y.setDate(y.getDate()-1);const day=cwLocalDay(d);if(day===cwLocalDay(now))return d2Time(iso);if(day===cwLocalDay(y))return 'Yesterday';if((now-d)/864e5<6)return d.toLocaleDateString('en-AU',{weekday:'short'})+' '+d2Time(iso);return d.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}
/* parse the seed's loose "when" strings into an ISO time; idx spaces entries that share a label */
function d2ParseWhen(s,idx=0){s=String(s||'');const t=s.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)/i);let hh=9,mm=0;if(t){hh=Number(t[1])%12+(/pm/i.test(t[3])?12:0);mm=Number(t[2])}
 const d=new Date();if(/yesterday/i.test(s))d.setDate(d.getDate()-1);else if(/just now/i.test(s))return new Date(Date.now()-(idx+1)*7*60e3).toISOString();
 else{const wd=s.match(/\b(mon|tue|wed|thu|fri|sat|sun)/i);if(wd){const want=['sun','mon','tue','wed','thu','fri','sat'].indexOf(wd[1].toLowerCase());let back=(d.getDay()-want+7)%7;if(!back)back=7;d.setDate(d.getDate()-back)}
 else if(!/today/i.test(s)&&!t){d.setDate(d.getDate()-1-idx%5)}}
 d.setHours(hh,mm,0,0);return d.toISOString()}
function d2Empty(v){return v==null||v===''||(Array.isArray(v)&&!v.length)}
function d2Fill(o,k,v){if(d2Empty(o[k]))o[k]=typeof v==='function'?v():v;return o[k]}
function d2Add(arr,item){if(arr.some(x=>x.id===item.id))return false;arr.push(item);return true}
function d2SortDesc(arr,k='at'){arr.sort((a,b)=>(Date.parse(b[k])||0)-(Date.parse(a[k])||0));return arr}
function d2Fmt(t,v){return t.replace(/\{(\w+)\}/g,(m,k)=>v[k]!==undefined?v[k]:m)}
const d2SeedP=id=>typeof SEED!=='undefined'?(SEED.people||[]).find(p=>p.id===id):null;
const d2SeedD=id=>typeof SEED!=='undefined'?(SEED.deals||[]).find(d=>d.id===id):null;
const d2SeedM=id=>typeof SEED!=='undefined'?(SEED.messages||[]).find(m=>m.id===id):null;
const d2First=p=>String(p?.name||'').split(' ')[0];
const d2Agent=d=>findP(d.contactId)?.owner||d.owner||CW_ME;
const d2AgentRec=name=>state.cw.agents.find(a=>a.name===name)||state.cw.agents[0];
function d2Buyers(){return state.people.filter(p=>p.role!=='seller'&&p.consent==='ok'&&!cwPX(p).trashed)}
/* n distinct buyers for a record, deterministic, never the vendor */
function d2PickBuyers(key,n,notId){const pool=d2Buyers().filter(p=>p.id!==notId);const out=[];let i=cwHash(key)%pool.length;let step=1+cwHash(key+'s')%5;let guard=0;while(out.length<n&&guard++<60){const p=pool[i%pool.length];if(!out.includes(p))out.push(p);i+=step}return out}
function d2Range(x){return cwMoney(x.priceLow)+' to '+cwMoney(x.priceHigh)}
function d2LiveDeals(){return cwProps().filter(d=>['For sale','Listed'].includes(d.stage))}
function d2Season(k){return ['in autumn','before Christmas','in the new year','after the school holidays'][k%4]}

/* ---------- 2. agents: give Daniel, Priya, Alex and Sam real work ---------- */
const D2_VENDOR_AGENT={'C-1059':D2_AG.dan,'C-1033':D2_AG.dan,'C-1023':D2_AG.priya,'C-1042':D2_AG.priya,'C-1053':D2_AG.alex,'C-1017':D2_AG.alex};
const D2_CONTACT_AGENT={'C-1005':CW_ME,'C-1001':CW_ME,'C-1006':CW_ME,'C-1021':CW_ME,'C-1008':D2_AG.alex,'C-1028':D2_AG.alex,'C-1032':D2_AG.alex,'C-1051':D2_AG.alex,'C-1056':D2_AG.alex,'C-1041':D2_AG.alex,'C-1057':D2_AG.alex};
const D2_SOLD=[
 {id:'D-2101',n:1,agent:D2_AG.caleb,address:'17 Hawker Street',suburb:'Preston',postcode:3072,guide:1250000,sold:1285000,fee:1.85,daysAgo:38,settleIn:22,beds:3,baths:1,cars:1,land:520,type:'House',method:'Auction',source:'Referral',buyer:'C-1019',vendor:{id:'C-1101',name:'Teresa Kowalski',phone:'0411 320 118',email:'teresa.kowalski@example.test',note:'Downsizing to a unit in Reservoir. Settles late this month.'}},
 {id:'D-2102',n:2,agent:D2_AG.dan,address:'42 Dundas Street',suburb:'Thornbury',postcode:3071,guide:1380000,sold:1412000,fee:1.95,daysAgo:24,settleIn:36,beds:3,baths:2,cars:2,land:465,type:'House',method:'Private Sale',source:'Past appraisal',buyer:'C-1027',vendor:{id:'C-1102',name:'Bruno Carvalho',phone:'0421 774 902',email:'bruno.carvalho@example.test',note:'Moving to Geelong for work. Wanted a quick private sale.'}},
 {id:'D-2103',n:3,agent:D2_AG.priya,address:'5/16 Cramer Street',suburb:'Preston',postcode:3072,guide:600000,sold:618000,fee:2.0,daysAgo:52,settleIn:-8,beds:2,baths:1,cars:1,land:'',type:'Unit',method:'Private Sale',source:'Website',buyer:'C-1044',vendor:{id:'C-1103',name:'Ingrid Halvorsen',phone:'0433 018 455',email:'ingrid.halvorsen@example.test',note:'Investor selling one of two units. Keen to hear about the second one in autumn.'}},
 {id:'D-2104',n:4,agent:D2_AG.alex,address:'28 Westgarth Street',suburb:'Northcote',postcode:3070,guide:1700000,sold:1735000,fee:1.85,daysAgo:17,settleIn:43,beds:4,baths:2,cars:1,land:540,type:'House',method:'Auction',source:'Referral',buyer:'C-1034',vendor:{id:'C-1104',name:'Dimitri Pappas',phone:'0407 661 230',email:'dimitri.pappas@example.test',note:'Family home of 30 years. Referred by his daughter, a past buyer.'}},
 {id:'D-2105',n:5,agent:D2_AG.alex,address:'61 Separation Street',suburb:'Fairfield',postcode:3078,guide:1150000,sold:1190000,fee:1.9,daysAgo:66,settleIn:14,beds:3,baths:1,cars:1,land:410,type:'House',method:'Private Sale',source:'Website',buyer:'C-1051',vendor:{id:'C-1105',name:'Carol Whitfield',phone:'0418 905 377',email:'carol.whitfield@example.test',note:'Sold to buy in Eltham. Asked us to appraise the Eltham purchase in two years.'}},
 {id:'D-2106',n:6,agent:D2_AG.sam,address:'9 Gooch Street',suburb:'Thornbury',postcode:3071,guide:1500000,sold:1560000,fee:1.85,daysAgo:45,settleIn:15,beds:3,baths:2,cars:2,land:490,type:'House',method:'Auction',source:'Past appraisal',buyer:'C-1008',vendor:{id:'C-1106',name:'Robert Ashworth',phone:'0402 338 716',email:'robert.ashworth@example.test',note:'Long-time client of Sam. Sold under the hammer with four bidders.'}}
];
function cwD2SetOwner(p,agent){const s=d2SeedP(p.id);if(s&&p.owner!==s.owner)return;const old=p.owner;if(old===agent)return;p.owner=agent;const x=cwPX(p);if(!x.agent||x.agent===old)x.agent=agent;
 d2Add(x.history,{id:'H-D2-own-'+p.id,at:d2At(30+cwHash(p.id)%20,9,15),by:D2_AG.sam,what:'Assigned to '+agent+(old?' (was '+old+')':'')})}
function cwD2SetDealOwner(d,agent){const s=d2SeedD(d.id);if(s&&d.owner!==s.owner)return;const old=d.owner;d.owner=agent;const x=cwDX(d);if(!x.agents.length||x.agents[0]===old)x.agents[0]=agent;
 for(const o of x.openHomes||[])if(o.agent===old)o.agent=agent;for(const o of state.cw.openHomes)if(o.dealId===d.id&&o.agent===old)o.agent=agent;for(const n of x.notes||[])if(n.by===old&&/^Imported/.test(n.text))n.by=agent}
function cwD2MakeSold(s){let p=findP(s.vendor.id);if(!p){p={id:s.vendor.id,legacyId:'CNT-'+(2700+s.n),name:s.vendor.name,role:'seller',suburb:s.suburb,phone:s.vendor.phone,email:s.vendor.email,source:s.source,owner:s.agent,lastContact:cwDate(d2At(s.daysAgo-3)),note:s.vendor.note,consent:'ok',callStatus:'contacted',tags:['Past client']};state.people.push(p)}
 cwPX(p);let d=findD(s.id);if(!d){d={id:s.id,legacyId:'PR-'+(5200+s.n),contactId:s.vendor.id,propertyId:'P-'+(3200+s.n),address:s.address,suburb:s.suburb,state:'VIC',postcode:s.postcode,stage:'Sold',guide:s.guide,fee:s.fee,owner:s.agent,source:s.source,why:'Sold result confirmed',next:'Settlement',risk:'',compliance:{'Signed sales authority':true,'Property Price Statement':true,'Pricing / comparable-sales evidence':true,'Contract of Sale + Section 32':true,'Due diligence checklist available':true},lastChange:s.daysAgo+' days ago',buyerMatches:0,active:false};state.deals.push(d)}
 const x=cwDX(d);Object.assign(x,{beds:s.beds,baths:s.baths,cars:s.cars,land:s.land,type:s.type,status:'Sold',method:s.method,agents:[s.agent],purchasers:[s.buyer],soldPrice:s.sold,soldAt:d2Day(s.daysAgo),listedAt:d2At(s.daysAgo+32),dom:32,views:180+cwHash(s.id)%220,saves:4+cwHash(s.id)%9,visibility:false});
 x.priceLow=s.guide;x.priceHigh=s.guide+Math.floor(s.guide*0.1/5000)*5000;x.description=x.headline+' at '+s.address+', '+s.suburb+'. '+s.beds+' bedrooms, '+s.baths+' bathroom'+(s.baths>1?'s':'')+' and '+s.cars+' car space'+(s.cars>1?'s':'')+(s.land?' on about '+s.land+' m²':'')+'. Sold by '+s.agent+'.';
 const settles=d2Day(-s.settleIn);d2Add(state.cw.settlements,{id:'ST-D2-'+s.id,dealId:s.id,commission:Math.round(s.sold*s.fee/100),settles,at:x.soldAt,agent:s.agent})}
function cwD2Agents(){
 for(const [pid,agent] of Object.entries(D2_CONTACT_AGENT)){const p=findP(pid);if(p)cwD2SetOwner(p,agent)}
 for(const [pid,agent] of Object.entries(D2_VENDOR_AGENT)){const p=findP(pid);if(!p)continue;cwD2SetOwner(p,agent);for(const d of state.deals.filter(d=>d.contactId===pid))cwD2SetDealOwner(d,agent)}
 for(const s of D2_SOLD)cwD2MakeSold(s);
 /* the three seeded sales get a sold price, a date and a settlement */
 for(const [id,days,price] of [['D-2011',11,1476000],['D-2018',2,884000],['D-2029',13,1702000]]){const d=findD(id);if(!d||d.stage!=='Sold')continue;const x=cwDX(d);d2Fill(x,'soldPrice',price);d2Fill(x,'soldAt',d2Day(days));x.listedAt=d2At(days+35);x.dom=35;if(!x.views)x.views=160+cwHash(id)%200;if(!x.saves)x.saves=3+cwHash(id)%8;
  if(!state.cw.settlements.some(s=>s.dealId===id))state.cw.settlements.push({id:'ST-D2-'+id,dealId:id,commission:Math.round(price*d.fee/100),settles:d2Day(-(60-days)),at:x.soldAt,agent:d2Agent(d)})}
 for(const s of state.cw.settlements){const d=findD(s.dealId);if(d){d2Fill(s,'at',cwDX(d).soldAt||d2At(10));d2Fill(s,'agent',d2Agent(d))}}
}

/* ---------- 3. seller leads: every state of the 24-hour rule ---------- */
const D2_LEAD_HOURS={'D-2001':2,'D-2016':3,'D-2002':21,'D-2025':26,'D-2030':30};
function cwD2Leads(){
 for(const [id,hrs] of Object.entries(D2_LEAD_HOURS)){const d=findD(id);if(!d||d.stage!=='New lead')continue;const x=cwDX(d);if(x.called||x.slAction)continue;x.leadAt=d2Hours(hrs);delete x.reminded;delete x.escalated;delete x.escalatedAt;
  const s=d2SeedD(id);if(s&&d.lastChange===s.lastChange)d.lastChange=hrs<24?hrs+' hours ago':'1 days ago';
  if(hrs<24){state.tasks=state.tasks.filter(t=>!(t.dealId===id&&/escalated/i.test(t.origin||'')));state.cw.notifications=state.cw.notifications.filter(n=>!(n.kind==='ESCALATED'&&(n.body||'').includes(d.address)))}}
 for(const d of state.deals){const x=cwDX(d),k=cwHash(d.id);if(d.stage==='Connected')d2Fill(x,'leadAt',d2At(12+k%30,10,20));if(['Appraisal','Proposal','Authority'].includes(d.stage))d2Fill(x,'appraisalAt',d2At(3+k%25,11,0));if(d.stage==='Lost')d2Fill(x,'lostAt',d2At(10+k%40,15,0))}
}

/* ---------- 5. properties ---------- */
const D2_PHOTO_NAMES=['front-facade','entry-hall','living-room','kitchen','dining','main-bedroom','bedroom-two','bedroom-three','bathroom','ensuite','backyard','deck','garage','street-view','floor-plan','study'];
const D2_ATT_NOTES=['Liked the layout, wants the Section 32.','Second visit, bringing parents next time.','Thought the price guide was high.','Needs to sell first.','Asked about the school zone.','Pre-approved, wants to buy before Christmas.','Walked through quickly, no questions.','Asked about the roof age and the heating.','Interested if the vendor would take an early settlement.','Wants a building inspection before offering.'];
const D2_ENQ_TEXT=['Is the property still available? Could we see it this weekend?','What is the price guide? The listing says contact agent.','Could you send the Section 32 and the Property Price Statement?','Is the vendor open to offers before the auction?','Are pets allowed under the body corporate rules?','We are pre-approved and ready to move quickly. Can we do a private inspection?','What are the council rates and is there a heritage overlay?','Can you tell me about the school zones for this address?'];
const D2_ENQ_SRC=['realestate.com.au','Domain','Buyer Portal','Website'];
function d2Slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function cwD2Comps(d){const x=cwDX(d);if(x.comps.length)return;const near=CW_NEAR[d.suburb]||[];const S=state.cw.sales;const same=S.filter(s=>s.suburb===d.suburb),nb=S.filter(s=>near.includes(s.suburb)&&!same.includes(s)),rest=S.filter(s=>!same.includes(s)&&!nb.includes(s)).sort((a,b)=>Math.abs(a.price-d.guide)-Math.abs(b.price-d.guide));
 const picks=[...same.map(s=>[s,'Same suburb, sold '+cwDate(s.date)]),...nb.map(s=>[s,'Nearby in '+s.suburb+', similar home']),...rest.map(s=>[s,'Closest recent sale by price'])].slice(0,3);
 x.comps=picks.map(([s,why])=>[s.address+', '+s.suburb,s.price,why]);if(x.comps.length>=3&&d.compliance&&!d.compliance['Pricing / comparable-sales evidence'])d.compliance['Pricing / comparable-sales evidence']=true}
function cwD2PriceEvents(d){const x=cwDX(d);if(x.priceEvents.length>2)return;const listed=Date.parse(x.listedAt)||Date.now()-30*864e5;const at=days=>new Date(listed+days*864e5).toISOString();const range=d2Range(x);const ev=[];
 ev.push({id:'PE-D2-'+d.id+'-1',at:at(-5),what:'Estimated selling price in the signed authority',value:range});ev.push({id:'PE-D2-'+d.id+'-2',at:at(-3),what:'Indicative price in the Property Price Statement',value:range});
 if(d.stage==='For sale'||d.stage==='Sold')ev.push({id:'PE-D2-'+d.id+'-3',at:at(0),what:'Advertised price published to the portals',value:range});
 if(d.stage==='For sale'&&x.dom>35)ev.push({id:'PE-D2-'+d.id+'-4',at:at(28),what:'Advertised price reviewed with the vendor, no change',value:range});
 if(d.stage==='Sold'&&x.soldAt){if(x.method==='Auction')ev.push({id:'PE-D2-'+d.id+'-5',at:new Date(Date.parse(x.soldAt)-7*864e5).toISOString(),what:'Reserve disclosed as a single figure',value:cwMoney(x.priceLow)});ev.push({id:'PE-D2-'+d.id+'-6',at:new Date(Date.parse(x.soldAt)+9*3600e3).toISOString(),what:'Sold',value:cwMoney(x.soldPrice||d.guide)})}
 const keep=x.priceEvents.filter(e=>!ev.some(n=>n.what===e.what));x.priceEvents=d2SortDesc([...keep,...ev])}
function cwD2Docs(d){const x=cwDX(d),listed=Date.parse(x.listedAt)||Date.now()-20*864e5,at=days=>new Date(listed+days*864e5).toISOString(),by=d2Agent(d),a=d.address;const live=d.stage==='For sale',listedOff=d.stage==='Listed',sold=d.stage==='Sold',appr=['Appraisal','Proposal','Authority'].includes(d.stage);
 const put=(cat,id,name,size,days,who)=>{if(!x.docs[cat].some(f=>f.id===id||f.name===name))x.docs[cat].push({id,name,size,at:at(days),by:who||by})};
 if(live||sold){put('pps','DOC-D2-'+d.id+'-pps','Property Price Statement - '+a+'.pdf','214 KB',-3);put('contract','DOC-D2-'+d.id+'-cos','Contract of Sale and Section 32 - '+a+'.pdf','1.6 MB',-4);d.compliance['Property Price Statement']=true;d.compliance['Contract of Sale + Section 32']=true}
 if(live||sold||listedOff){put('other','DOC-D2-'+d.id+'-auth','Signed Exclusive Sale Authority - '+a+'.pdf','388 KB',-6);put('other','DOC-D2-'+d.id+'-id','Vendor ID sighted record - '+a+'.pdf','96 KB',-6);d.compliance['Signed sales authority']=true;x.idSighted=x.idSighted||{by,at:at(-6),doc:'Drivers licence'}}
 if(live)put('report','DOC-D2-'+d.id+'-bp','Building and pest report - '+a+'.pdf','2.1 MB',-2);
 if(live||sold)d.compliance['Due diligence checklist available']=true;
 if(sold)put('contract','DOC-D2-'+d.id+'-signed','Contract of Sale (signed) - '+a+'.pdf','1.7 MB',32);
 if(appr){put('report','DOC-D2-'+d.id+'-ar','Appraisal report - '+a+'.pdf','640 KB',-1);if(d.stage!=='Appraisal')put('other','DOC-D2-'+d.id+'-prop','Listing proposal - '+a+'.pdf','1.1 MB',0);if(d.stage==='Authority')put('other','DOC-D2-'+d.id+'-draft','Exclusive Sale Authority (unsigned) - '+a+'.pdf','380 KB',1)}
 if(d.stage==='Lost')put('report','DOC-D2-'+d.id+'-ar','Appraisal report - '+a+'.pdf','620 KB',-1)}
function cwD2Photos(d){const x=cwDX(d);if(x.photos.length)return;const k=cwHash(d.id);let n=0;if(['For sale','Listed','Sold'].includes(d.stage))n=6+k%7;else if(d.stage==='Lost')n=4;else if(['Appraisal','Proposal','Authority'].includes(d.stage))n=2;if(!n)return;
 const slug=d2Slug(d.address);const names=n===2?['appraisal-visit-front','appraisal-visit-living']:D2_PHOTO_NAMES.slice(0,n);const at=Date.parse(x.listedAt)||Date.now();
 x.photos=names.map((nm,i)=>({id:'PH-D2-'+d.id+'-'+(i+1),name:String(i+1).padStart(2,'0')+'-'+slug+'-'+nm+'.jpg',at:new Date(at-2*864e5+i*60e3).toISOString()}))}
function cwD2OpenHomes(d){if(d.stage!=='For sale')return;const x=cwDX(d),k=cwHash(d.id);const past=(x.openHomes||[]).filter(o=>Date.parse(o.day)<Date.now()).sort((a,b)=>Date.parse(a.day)-Date.parse(b.day));if(!past.length)return;const base=past[0];
 const mk=(id,dayISO)=>{const o={id,dealId:d.id,day:dayISO,start:base.start,end:base.end,agent:base.agent||d2Agent(d),second:'',status:'Closed',attendees:[]};if(!state.cw.openHomes.some(z=>z.id===id))state.cw.openHomes.push(o);if(!x.openHomes.some(z=>z.id===id))x.openHomes.push({id,day:dayISO,start:o.start,end:o.end,agent:o.agent,second:''});return state.cw.openHomes.find(z=>z.id===id)};
 const sessions=[mk('OH-D2-'+d.id+'-1',new Date(Date.parse(base.day)-7*864e5).toISOString()),mk('OH-D2-'+d.id+'-2',new Date(Date.parse(base.day)-14*864e5).toISOString()),state.cw.openHomes.find(z=>z.id===base.id)].filter(Boolean);
 sessions.forEach((o,si)=>{const want=si===2?Math.max(o.attendees.length,3+k%3):3+(k+si*3)%6;const have=new Set(o.attendees.map(a=>a.contactId));const picks=d2PickBuyers(o.id,want+2,d.contactId).filter(p=>!have.has(p.id));let i=0;
  while(o.attendees.length<want&&i<picks.length){const p=picks[i++];const h=cwHash(o.id+p.id);o.attendees.push({id:'AT-D2-'+o.id+'-'+i,contactId:p.id,name:p.name,phone:p.phone,email:p.email,temp:['HOT','WARM','WARM','COLD','No Interest'][h%5],notes:h%3?D2_ATT_NOTES[h%D2_ATT_NOTES.length]:'',contract:h%4===0,hasProperty:h%6===0})}
  if(!x.activity.some(a=>a.id==='PA-D2-oh-'+o.id))x.activity.push({id:'PA-D2-oh-'+o.id,at:new Date(Date.parse(o.day)+45*60e3).toISOString(),by:o.agent,what:'Open home closed with '+o.attendees.length+' attendees'})})}
function cwD2Enquiries(d){if(!['For sale','Listed'].includes(d.stage))return;const x=cwDX(d),k=cwHash(d.id);const n=2+k%2;const buyers=d2PickBuyers('enq'+d.id,n,d.contactId);
 buyers.forEach((p,i)=>{const id='EQ-D2-'+d.id+'-'+(i+1);const days=1+(k+i*9)%28;const h=cwHash(id);d2Add(state.cw.enquiries,{id,type:i===1&&h%2?'Inspection Request':'Buyer Enquiry',received:d2At(days,8+(k+i)%10,(k*3+i*11)%60),contactId:p.id,dealId:d.id,agent:d2Agent(d),source:D2_ENQ_SRC[h%4],status:days>10?'Processed':'Pending',comments:D2_ENQ_TEXT[h%D2_ENQ_TEXT.length]})});
 x.enquiries=Math.max(x.enquiries||0,state.cw.enquiries.filter(e=>e.dealId===d.id).length+state.messages.filter(m=>m.dealId===d.id).length)}
function cwD2PropNotes(d){const x=cwDX(d),k=cwHash(d.id),by=d2Agent(d),p=findP(d.contactId);const v={vendor:p?.name||'the vendor',first:d2First(p)||'the vendor',beds:x.beds,type:x.type.toLowerCase(),range:d2Range(x),method:x.method.toLowerCase(),season:d2Season(k),source:d.source,n:3+k%6,low:cwShort(x.priceLow*0.97),sold:cwMoney(x.soldPrice||d.guide),buyer:cwPName(x.purchasers[0])||'The purchaser',comp1:x.comps[0]?.[0]||'18 Frederick Street',comp2:x.comps[1]?.[0]||'7 Marshall Street',mkt:cwShort(4200+k%3000)};
 let pool;const S=d.stage;
 if(S==='New lead')pool=[['General','GeeVee','Lead received from {source}. New seller leads are a call from the agent within 24 hours.']];
 else if(S==='Connected')pool=[['Vendor',by,'Spoke to {first}. Thinking of selling {season}, wants an appraisal first.'],['Marketing',by,'Sent the Collings introduction pack and three recent sales by email.'],['General',by,'{first} asked for an evening appointment. Partner works late.']];
 else if(['Appraisal','Proposal','Authority'].includes(S))pool=[['Vendor',by,'Appraisal visit done. {beds} bed {type}, well kept. Estimate {range}.'],['Price',by,'Comparable sales pulled: {comp1} and {comp2}. Vendor expects the top of the range.'],['Marketing',by,'Proposal sent: {method}, four week campaign, marketing {mkt}.'],['Vendor',by,'{first} wants to talk to one more agency before deciding. Follow up Thursday.']];
 else if(['Listed','For sale'].includes(S))pool=[['Marketing',by,'Photos and copy approved by {first}.'],['Buyer feedback',by,'Open home feedback: {n} groups through, two asked for the contract.'],['Price',by,'Buyer price feedback sits around {low}. Vendor holding for now.'],['Vendor',by,'{first} wants a campaign report every Monday.'],['Marketing',by,'Board up, brochure delivered to the house.']];
 else if(S==='Sold')pool=[['General',by,'Sold by {method} for {sold}. {buyer} is the purchaser.'],['General',by,'Deposit paid, contract exchanged. Conveyancers notified.'],['Vendor',by,'Settlement booked. Final inspection with the buyer the day before.'],['Marketing','GeeVee','Sold price published in the Property Price Statement within 7 days of unconditional.']];
 else pool=[['Vendor',by,'{first} listed with another agency. Keep in touch for the next one.'],['General',by,'Follow up in six months with a market update.']];
 const n=S==='New lead'?1:Math.min(pool.length,2+k%4);const base=Date.parse(x.listedAt)||Date.now()-20*864e5;
 for(let i=0;i<n;i++){const [kind,who,text]=pool[(k+i)%pool.length];d2Add(x.notes,{id:'N-D2-'+d.id+'-'+i,text:d2Fmt(text,v),kind,by:who,at:new Date(base-(n-i)*3*864e5+(9+i)*3600e3).toISOString()})}
 d2SortDesc(x.notes)}
function cwD2PropActivity(d){const x=cwDX(d),by=d2Agent(d),listed=Date.parse(x.listedAt)||Date.now()-20*864e5,at=days=>new Date(listed+days*864e5+10*3600e3).toISOString();
 const add=(key,days,what,who)=>d2Add(x.activity,{id:'PA-D2-'+d.id+'-'+key,at:at(days),by:who||by,what});
 add('imp',-45,'Record imported from the current CRM','Import');
 if(['Appraisal','Proposal','Authority','Listed','For sale','Sold'].includes(d.stage))add('appr',-9,'Appraisal booked with '+(cwPName(d.contactId)));
 if(['Proposal','Authority','Listed','For sale','Sold'].includes(d.stage))add('prop',-7,'Listing proposal sent');
 if(['Listed','For sale','Sold'].includes(d.stage))add('auth',-6,'Exclusive Sale Authority signed. Vendor ID sighted (AML/CTF)');
 if(['For sale','Sold'].includes(d.stage)){add('pps',-3,'Property Price Statement uploaded');add('live',0,'Listing published to realestate.com.au, Domain and Collings')}
 if(d.stage==='Sold'&&x.soldAt){x.activity.push({id:'PA-D2-'+d.id+'-sold',at:new Date(Date.parse(x.soldAt)+12*3600e3).toISOString(),by,what:'Marked sold for '+cwMoney(x.soldPrice||d.guide)})}
 if(d.stage==='Lost')add('lost',2,'Withdrawn: vendor chose another agency');
 if(d.stage==='New lead')x.activity.push({id:'PA-D2-'+d.id+'-lead',at:x.leadAt||at(0),by:'GeeVee',what:'Seller lead received from '+d.source+'. Call within 24 hours'});
 d2SortDesc(x.activity)}
function cwD2Properties(){for(const d of state.deals){const x=cwDX(d);if(x.trashed)continue;cwD2Photos(d);cwD2Docs(d);if(['For sale','Listed','Sold'].includes(d.stage)){cwD2Comps(d);cwD2PriceEvents(d)}cwD2OpenHomes(d);cwD2Enquiries(d);cwD2PropNotes(d);cwD2PropActivity(d)}}

/* ---------- 9. messages: threads of 2 to 5 dated entries, sender role and question agree ---------- */
const D2_T_BUYER=[
 ['Inspection times for {addr}',['Hi, is {addr} open this weekend? We can only do Saturday morning.','Hi {first}, yes, Saturday {time} to {time2}. I will be there, come and say hello. {agent}, Collings','Great, we will be there. Is the Section 32 ready to send?','Sent just now. Your conveyancer can call me with any questions.','Thanks. We will let you know after Saturday.']],
 ['Price guide for {addr}',['What is the price guide on {addr}? The listing says contact agent.','Hi {first}, the Property Price Statement shows {price}. Happy to send it through.','Please do. Is the vendor open to offers before the auction?','They will consider a written offer. I can send the offer form.','Send it through, we will talk it over tonight.']],
 ['Section 32 for {addr}',['Could you send the Section 32 for {addr} before we inspect?','Sent just now, {first}. Let me know if your conveyancer has questions.','Thanks. We also want a building inspection, can we arrange access Thursday?','Thursday 2pm works. I will meet the inspector there.','Perfect, booked.']],
 ['Pre-approval update',['We have pre-approval for {pmax} now and are looking in {suburb}.','Good news {first}. {addr} may suit, do you want the details?','Yes please, and anything else with {beds} bedrooms under that figure.','Two more are coming up next week. I will text you first.','Thanks, weekends are best for inspections.']],
 ['Offer on {addr}',['We would like to make an offer on {addr}. What does the vendor need?','Hi {first}, a written offer with price, deposit, settlement and any conditions. I can send the form.','Send it through, we will have it back tonight.','Received. I will present it to the vendor in the morning.','Thanks, we are keen on this one.']],
 ['Looking in {suburb}',['I am looking for a {beds} bedroom home around {pmax} in {suburb}. Anything coming up?','Hi {first}, two homes may suit. Can I text you the details?','Yes, text is fine. Weekends are best for inspections.','Done. The first open is Saturday {time}.','See you there.']]];
const D2_T_SELLER={
 lead:['Appraisal for {addr}',['Hello, could someone call me about an appraisal for {addr}? Thinking of selling {season}.','Hi {first}, happy to help. {agent} will call you today to find a time to come through.','Thanks. Afternoons are best, after 3.','Noted, after 3. Talk soon.','Great.']],
 proposal:['Following up on your proposal',['Thanks for sending the proposal for {addr}. Can we talk about the marketing budget?','Of course {first}. I can take you through the options and trim where it makes sense. Does tomorrow at 5 suit?','5 works. My partner will join the call.','Booked for 5. I will bring the comparable sales too.','Thanks, see you then.']],
 timing:['When to list {addr}',['We are still deciding when to list {addr}. What is the market doing in {suburb}?','Hi {first}, the last three sales near you went {trend}. I will send the figures.','Please do. Can you also tell us what an auction would cost?','Sent, with the auction and private sale options side by side.','Got it, we will read it tonight.']],
 authority:['Authority for {addr}',['We got the authority through. Before we sign, how long is the exclusive period?','Hi {first}, 90 days exclusive, then 60 days continuing. Happy to walk through any clause.','OK. Can we sign it on Thursday when you are here?','Thursday is fine. Bring photo ID, I need to sight it before we go live.','Will do.']],
 open:['Open home this Saturday',['Are there any inspections booked for {addr} this weekend? We need to be out.','Hi {first}, Saturday {time} to {time2}, I will be there from 15 minutes before.','Thanks. The dog will be at my sister\'s place.','Perfect. I will text you the numbers afterwards.','Thanks.']],
 campaign:['Campaign update for {addr}',['How did the open home go on Saturday? Any feedback on the price?','Hi {first}, {n} groups through, two asked for the contract. I will call you tonight with the detail.','Good. Call after 7 please.','After 7 it is.','Thanks.']],
 sold:['Settlement for {addr}',['Just checking what we need to do before settlement on {addr}.','Hi {first}, your conveyancer handles the transfer. We do the final inspection with the buyer the day before.','Thanks, and do we need to leave the keys with you?','Yes, drop them to the office on the morning of settlement.','Will do.']],
 lost:['Market update',['We went with another agency for {addr} but would still like your market updates.','Of course {first}. I will keep you on the monthly {suburb} update.','Thanks, and good luck with the spring listings.','Appreciated. Call me any time.','Will do.']]};
function d2Trend(d){const S=state.cw.sales.filter(s=>s.suburb===d.suburb||(CW_NEAR[d.suburb]||[]).includes(s.suburb));if(S.length<2)return 'between '+cwShort(d.guide*0.95)+' and '+cwShort(d.guide*1.05);const p=S.map(s=>s.price).sort((a,b)=>a-b);return 'between '+cwShort(p[0])+' and '+cwShort(p[p.length-1])}
const D2_STAGE_RANK={'For sale':9,Listed:8,Authority:7,Proposal:6,Appraisal:5,Connected:4,'New lead':3,Sold:2,Lost:1};
function d2OwnDeal(p){return state.deals.filter(d=>d.contactId===p.id).sort((a,b)=>(D2_STAGE_RANK[b.stage]||0)-(D2_STAGE_RANK[a.stage]||0))[0]||null}
/* earlier versions gave sellers threads about other people's listings; put those back to the seed so they are re-templated below */
function cwD2Repoint(){state.messages.forEach(m=>{const p=findP(m.contactId),d=m.dealId?findD(m.dealId):null,seed=d2SeedM(m.id);if(!p||!d||!seed||p.role!=='seller'||d.contactId===p.id)return;Object.assign(m,structuredClone(seed))})}
function cwD2Messages(){const live=d2LiveDeals();state.messages.forEach((m,i)=>{const seed=d2SeedM(m.id);const p=findP(m.contactId);if(!p)return;const k=cwHash(m.id);
  const changed=seed&&(m.last!==seed.last||m.subject!==seed.subject||(m.thread||[]).length!==(seed.thread||[]).length);
  if(!seed||changed){d2Fill(m,'at',d2ParseWhen(m.time,i));(m.thread||[]).forEach((t,j)=>{d2Fill(t,'at',new Date(Date.parse(m.at)-((m.thread.length-1-j)*5*3600e3)).toISOString())});return}
  let d=m.dealId?findD(m.dealId):null;const asSeller=p.role==='seller'||(p.role==='both'&&d&&d.contactId===p.id);
  if(asSeller&&(!d||d.contactId!==p.id)){d=d2OwnDeal(p);m.dealId=d?d.id:''}
  if(!asSeller&&(!d||d.contactId===p.id))d=cwPick(m.id,live)||d;
  const x=d?cwDX(d):null;const oh=d?state.cw.openHomes.filter(o=>o.dealId===d.id).sort((a,b)=>Date.parse(b.day)-Date.parse(a.day)):[];const next=oh.find(o=>Date.parse(o.day)>Date.now())||oh[0];const closed=oh.find(o=>o.status==='Closed');
  const agent=asSeller?(p.owner||CW_ME):(d?d2Agent(d):p.owner||CW_ME);const pr=cwPX(p).prefs||{};
  const v={addr:d?d.address:'our place in '+p.suburb,first:d2First(p),agent:agent.split(' ')[0],suburb:d?d.suburb:p.suburb,time:next?.start||'11:00am',time2:next?.end||'11:30am',price:x?d2Range(x):'',pmax:cwShort(pr.priceMax||900000),beds:pr.beds||3,season:d2Season(k),trend:d?d2Trend(d):'well',n:closed?closed.attendees.length:9};
  let tpl;if(asSeller){const S=d?d.stage:'';tpl=D2_T_SELLER[!d?(k%2?'lead':'timing'):['New lead','Connected'].includes(S)?'lead':S==='Appraisal'?'timing':S==='Proposal'?'proposal':S==='Authority'?'authority':S==='Listed'?'campaign':S==='For sale'?(k%2?'open':'campaign'):S==='Sold'?'sold':'lost']}
  else tpl=D2_T_BUYER[k%D2_T_BUYER.length];
  const len=[2,3,3,4,5][k%5];const lines=tpl[1].slice(0,len);m.subject=d2Fmt(tpl[0],v);
  const daysAgo=i%6===0?0:i%6===1?1:2+(k%9);const endAt=d2At(daysAgo,8+(k%10),(k*7)%60);m.at=endAt;
  m.thread=lines.map((t,j)=>{const at=new Date(Date.parse(endAt)-(lines.length-1-j)*(3+k%5)*3600e3).toISOString();return{from:j%2?'us':'them',text:d2Fmt(t,v),when:d2When(at),at}});
  const lastT=m.thread[m.thread.length-1];m.last=lastT.text;m.time=d2Short(endAt);if(lastT.from==='us')m.unread=false;
  if(d&&!asSeller&&m.dealId!==d.id)m.dealId=d.id;
  for(const e of state.cw.enquiries.filter(e=>e.msgId===m.id)){if(e.comments===seed.last)e.comments=m.last;e.received=m.at;if(m.dealId&&e.dealId!==m.dealId)e.dealId=m.dealId}})}

/* ---------- 4. contacts: notes, reminders, links, files, history, portal ---------- */
const D2_CT_FULL=['C-1001','C-1002','C-1003','C-1005','C-1006','C-1007','C-1008','C-1010','C-1012','C-1013','C-1015','C-1016','C-1017','C-1019','C-1021','C-1023','C-1026','C-1027','C-1028','C-1031','C-1033','C-1037','C-1039','C-1042','C-1044','C-1046','C-1048','C-1052','C-1053','C-1059'];
const D2_PORTAL=['C-1007','C-1016','C-1028','C-1031','C-1039','C-1044','C-1052','C-1005','C-1019','C-1027'];
const D2_N_SELLER=[['Contact','Called about timing. Thinking of selling {season}, wants to know what {suburb} is doing first.'],['Appointment','Appraisal walk-through booked. Bring the {suburb} comparable sales and the campaign options.'],['Action Required','Asked for the marketing costs in writing before deciding. Send the proposal by email.'],['Follow Up','Partner needs to be on the next call. Prefers evenings after 6.'],['Review','Reviewed the proposal together. Leaning towards auction, wants a four week campaign.']];
const D2_N_BUYER=[['Contact','Pre-approved to {pmax}. Looking in {suburbs}, needs {beds} bedrooms and a yard.'],['Review','Inspected {addr}. Liked the kitchen, worried about the main road.'],['Action Required','Send the Section 32 for {addr} and the open home times for Saturday.'],['Appointment','Second viewing of {addr} booked with the parents. Wants a building inspection first.'],['Follow Up','Call back after the weekend. Renting until March so no rush on settlement.']];
const D2_BANKS=['ANZ','NAB','Bank Australia','Bendigo Bank','ME Bank','CommBank'];
function cwD2Contact(p,full){const x=cwPX(p),k=cwHash(p.id),agent=p.owner||CW_ME,buyer=cwCtIsBuyer(p)&&p.role!=='seller';const own=state.deals.find(d=>d.contactId===p.id);const live=d2LiveDeals().filter(d=>d.contactId!==p.id);const pick=cwPick(p.id+'l',live)||live[0];const pr=x.prefs||{};
 const v={first:d2First(p),suburb:p.suburb,suburbs:(pr.suburbs||[p.suburb]).join(' and '),pmax:cwShort(pr.priceMax||900000),beds:pr.beds||3,addr:(buyer?pick:own||pick)?.address||'the property',season:d2Season(k),agent};
 /* history: three dated entries for everyone */
 d2Add(x.history,{id:'H-D2-'+p.id+'-1',at:d2At(45+k%10,10,30),by:agent,what:'Contact details confirmed by phone'});
 d2Add(x.history,{id:'H-D2-'+p.id+'-2',at:d2At(20+k%7,14,5),by:'GeeVee',what:p.consent==='ok'?'Marketing consent recorded: '+(x.permission?.evidence||'enquiry recorded in the CRM'):'Opt-out recorded. Excluded from all marketing'});
 d2Add(x.history,{id:'H-D2-'+p.id+'-3',at:d2At(2+k%5,9,40),by:buyer?'GeeVee':agent,what:buyer?'Buyer preferences updated from an enquiry':'Property record linked: '+v.addr});
 if(x.portal||D2_PORTAL.includes(p.id)){if(!x.portal&&buyer)x.portal=true;d2Fill(x,'portalAt',d2At(20+k%100,19,10));if(!x.searches)x.searches=2+k%6;if(!x.saved)x.saved=1+k%4;if(!x.sessions)x.sessions=3+k%7;d2Fill(x,'lastSeen',d2At(k%6,20,15))}
 if(!full)return;
 const pool=buyer?D2_N_BUYER:D2_N_SELLER;const n=2+k%3;for(let i=0;i<n;i++){const [kind,text]=pool[(k+i)%pool.length];d2Add(x.notes,{id:'CN-D2-'+p.id+'-'+i,text:d2Fmt(text,v),kind,by:agent,at:d2At(2+i*5+k%3,9+i,(k*7)%60)})}d2SortDesc(x.notes);
 const rid='RM-D2-'+p.id;if(!x.reminders.some(r=>r.id===rid)){const done=k%5<2;const when=done?d2At(2+k%5,10,0):new Date(Date.now()+(1+k%7)*864e5);const dt=new Date(when);dt.setHours(10,0,0,0);const text=d2Fmt(buyer?['Call {first} after the open home at {addr}','Send {first} new listings in {suburb}','Check {first} received the Section 32 for {addr}'][k%3]:['Call {first} about listing timing','Send {first} the updated appraisal figures','Check {first} has signed the authority'][k%3],v);const tid='T-D2-RM-'+p.id;
  if(!findT(tid))state.tasks.push({id:tid,contactId:p.id,dealId:own?.id||'',title:text,due:cwLocalDay(dt)===cwLocalDay()?'Today':cwDate(dt),dueISO:cwLocalDay(dt),dueTime:'10:00',priority:'Normal',category:'Follow up',status:done?'Done':'Open',origin:'Reminder on contact'});
  x.reminders.push({id:rid,text,at:dt.toISOString(),taskId:tid})}
 if(pick&&!x.linked.some(l=>l.dealId===pick.id)&&!(own&&own.id===pick.id))x.linked.push({dealId:pick.id,rel:'Interested'});
 if(buyer&&k%2&&live.length>1){const second=live[(cwHash(p.id+'l2'))%live.length];if(second.id!==pick.id&&!x.linked.some(l=>l.dealId===second.id))x.linked.push({dealId:second.id,rel:'Interested'})}
 const files=buyer?['Pre-approval letter - '+D2_BANKS[k%D2_BANKS.length]+'.pdf','Photo ID - passport.pdf']:['Photo ID sighted - drivers licence.pdf','Rates notice 2026 - '+v.addr+'.pdf'];files.slice(0,1+k%2).forEach((name,i)=>d2Add(x.files,{id:'CF-D2-'+p.id+'-'+i,name,at:d2At(6+i*4+k%5,11,20),by:agent}));
 d2SortDesc(x.history)}
function cwD2Contacts(){for(const p of state.people){if(cwPX(p).trashed)continue;cwD2Contact(p,D2_CT_FULL.includes(p.id))}
 if(typeof GV_DEMO_BUYER_ACTIVITY!=='undefined'&&!state.buyerActivity)state.buyerActivity=structuredClone(GV_DEMO_BUYER_ACTIVITY);
 if(state.buyerActivity)for(const b of [{id:'BA-D2-1',contactId:'C-1031',dealId:'D-2009',views:6,days:5,saves:1,last:'Yesterday 9:10pm',at:d2At(1,21,10)},{id:'BA-D2-2',contactId:'C-1044',dealId:'D-2028',views:4,days:2,saves:1,last:'Today 7:20am',at:d2At(0,7,20)},{id:'BA-D2-3',contactId:'C-1052',dealId:'D-2013',views:3,days:6,saves:0,last:'Mon 8:40pm',at:d2At(3,20,40)}])d2Add(state.buyerActivity,{...b,source:'Buyer portal activity (sample)',reviewed:true});
 if(typeof GV_DEMO_OFFERS!=='undefined'&&!state.offers)state.offers=structuredClone(GV_DEMO_OFFERS);
 if(state.offers){const mk=(id,dealId,buyerId,amount,days,status,cond,hist)=>{const d=findD(dealId);if(!d)return;const at=d2At(days,11,30);if(d2Add(state.offers,{id,dealId,buyerId,vendorId:d.contactId,amount,guideAtReceipt:d.guide,deposit:'10%',finance:cond,settlement:'60 days',conditions:'',received:d2When(at),at,deadline:'',status,history:[hist],source:'Offer register (sample)'})&&status==='Rejected'){const x=cwDX(d);if(!x.priceEvents.some(e=>e.id==='PE-D2-off-'+id))x.priceEvents.unshift({id:'PE-D2-off-'+id,at,what:'Written offer rejected as too low (cannot advertise below this figure)',value:cwMoney(amount)})}};
  mk('O-D2-1','D-2013','C-1016',1520000,9,'Rejected','Subject to finance','Vendor declined, below the estimated range');mk('O-D2-2','D-2028','C-1044',1540000,14,'Withdrawn','Unconditional finance','Buyer withdrew after the building report');mk('O-D2-3','D-2102','C-1027',1412000,24,'Accepted','Unconditional finance','Accepted by the vendor, contract exchanged');mk('O-D2-4','D-2033','C-1055',850000,4,'Rejected','Subject to sale of their unit','Vendor declined, needs an unconditional buyer')}}

/* ---------- 6. communications ---------- */
function cwD2Comms(){const c=state.cw.comms;c.campaigns=c.campaigns||[];c.sent=c.sent||[];c.lists=c.lists||[];c.templates=c.templates||[];c.rules=c.rules||[];c.gvsms=c.gvsms||[];
 const foot='\n\nCollings Real Estate, Preston VIC. You are receiving this because you asked to hear about property from Collings. Unsubscribe: {{unsubscribe_link}}';
 const camps=[['August market wrap: Preston and Thornbury','What sold near you in August','Twelve sales, one clear trend',CW_ME,85,'Email',388,201,54,2],['Just listed: 84 Albert Street, Fairfield','New to market in Fairfield','Four bedrooms, north facing garden',CW_ME,70,'Email',296,172,61,1],['Spring selling guide','Thinking of selling this spring?','Timing, presentation and the three costs that matter',D2_AG.priya,60,'Email',512,238,47,4],['Auction results: September','September auction results','Clearance rate and every result',D2_AG.sam,48,'Email',640,301,88,3],['Just sold: 42 Dundas Street, Thornbury','Sold in nine days in Thornbury','What the buyers paid and why',D2_AG.dan,22,'Email',271,163,39,1],['Just listed: 77 Park Street, Preston','New listing in Preston','Renovated period home, first open Saturday',D2_AG.priya,16,'Email',318,180,66,2],['Open homes this weekend','Open homes this weekend','Six opens across the north',D2_AG.alex,9,'Text',96,0,21,0],['Price update: 5 Darebin Road, Alphington','Price update in Alphington','New indicative range and this Saturday\'s open',D2_AG.priya,5,'Email',204,118,43,1]];
 camps.forEach((r,i)=>{const [name,subject,preview,owner,days,channel,rec,op,cl,un]=r;const at=d2At(days,9+i%4,15);const id='CP-D2-'+(i+1);d2Add(c.campaigns,{id,name,subject,preview,status:'Sent',recipients:rec,opened:op,clicked:cl,unsub:un,body:'Hi {{first_name}},\n\n'+preview+'. Reply to this email or call '+owner+' at Collings for the detail.'+foot,listId:'',from:'Default Collings sender',owner,at,sentAt:at,emailOnly:channel==='Email',audType:'Any contact type',audIntent:'Any intent'});d2Add(c.sent,{id:'SE-D2-'+(i+1),name,by:owner,at,channel,recipients:rec,opened:op,clicked:cl,unsub:un,campaignId:id})});
 for(const s of c.sent)d2Fill(s,'at',d2At(3));
 const P=state.people;const buyersIn=subs=>P.filter(p=>p.role!=='seller'&&subs.includes(p.suburb)&&!cwPX(p).trashed).map(p=>p.id);
 d2Add(c.lists,{id:'LS-D2-1',name:'Preston and Thornbury buyers',contactIds:buyersIn(['Preston','Thornbury','Northcote','Reservoir']),auto:false});
 const past=new Set();for(const d of state.deals.filter(d=>d.stage==='Sold')){past.add(d.contactId);cwDX(d).purchasers.forEach(id=>past.add(id))}d2Add(c.lists,{id:'LS-D2-2',name:'Past clients 2026',contactIds:[...past].filter(id=>findP(id)),auto:false});
 d2Add(c.templates,{id:'TP-D2-1',name:'Open home reminder',channel:'SMS',audience:'Buyers',body:'Hi {{first_name}}, a reminder that {{address}} is open tomorrow. See you there. {{agent_name}}, Collings. Reply STOP to opt out.'});
 d2Add(c.templates,{id:'TP-D2-2',name:'Section 32 sent',channel:'Email',audience:'Buyers',subject:'Section 32 for {{address}}',body:'Hi {{first_name}}, the Contract of Sale and Section 32 for {{address}} are attached. Your conveyancer is welcome to call me. {{agent_name}}, Collings Real Estate.'});
 d2Add(c.templates,{id:'TP-D2-3',name:'Just sold in your street',channel:'Email',audience:'Past Clients',subject:'Sold: {{address}}',body:'Hi {{first_name}}, {{address}} in {{suburb}} has just sold. If you are curious what it means for your home, reply and I will call. {{agent_name}}, Collings Real Estate.'+foot});
 d2Add(c.templates,{id:'TP-D2-4',name:'Inspection request received',channel:'Email',audience:'Buyers',subject:'Your inspection request for {{address}}',body:'Hi {{first_name}}, thanks for asking to see {{address}}. {{agent_name}} will confirm a time with you today. Collings Real Estate.'});
 d2Add(c.templates,{id:'TP-D2-5',name:'Contract of Sale request',channel:'Email',audience:'Buyers Advocates',subject:'Contract of Sale for {{address}}',body:'Hi {{first_name}}, the Contract of Sale for {{address}} is attached, together with the Property Price Statement: {{pps_link}}. {{agent_name}}, Collings Real Estate.'});
 d2Add(c.rules,{id:'RU-D2-1',name:'Send the Property Price Statement when asked',trigger:'Property Price Statement request',channel:'Email',templateId:'TP-3',delay:5,active:true,sent:41});
 d2Add(c.rules,{id:'RU-D2-2',name:'Thank buyers after an open home',trigger:'Open home check-in',channel:'SMS',templateId:'TP-1',delay:60,active:true,sent:118});
 d2Add(c.rules,{id:'RU-D2-3',name:'Acknowledge inspection requests',trigger:'Inspection request',channel:'Email',templateId:'TP-D2-4',delay:10,active:false,sent:12});
 d2Add(c.rules,{id:'RU-D2-4',name:'Contract of Sale to buyers advocates',trigger:'Contract of Sale request',channel:'Email',templateId:'TP-D2-5',delay:15,active:true,sent:9});
 const sms=[['GS-D2-1','C-1007','Needs you','Asked whether the vendor of 9 Rose Avenue would sell before auction',[['them','Would the vendor consider selling 9 Rose Avenue before the auction?'],['gv','Thanks Jack. Anything about offers is one for Caleb, he will call you this afternoon.']],0,10,5],
  ['GS-D2-2','C-1052','Needs you','Wants a private inspection of 5 Darebin Road on a weekday evening',[['them','Can I see 5 Darebin Road on Tuesday after 6?'],['gv','I can check that with Priya Shah and come back to you today, Zara.']],0,9,12],
  ['GS-D2-3','C-1031','Ready to buy','Pre-approved, wants to offer on 84 Albert Street',[['them','We are pre-approved to $1.3m and want to put an offer on 84 Albert Street.'],['gv','Great news Sophie. Caleb will call you within the hour to take the offer.']],1,16,40],
  ['GS-D2-4','C-1015','Ready to buy','Ready to offer on 77 Park Street after the building report',[['them','Building report came back fine. We are ready to make an offer on 77 Park Street.'],['gv','Thanks Oscar, passing this to Priya Shah now.']],1,12,5],
  ['GS-D2-5','C-1010','GeeVee talking','Open home times for 41 Fitzroy Street',[['them','What time is 41 Fitzroy Street open on Saturday?'],['gv','Saturday 12:00pm to 12:30pm. Shall I send a reminder on Friday?'],['them','Yes please.'],['gv','Done. See you Saturday.']],2,18,22],
  ['GS-D2-6','C-1020','GeeVee talking','Section 32 for 6 Edward Street sent',[['them','Is the Section 32 for 6 Edward Street available?'],['gv','Yes Michael, it is on file. Sent to your email just now.']],2,11,48],
  ['GS-D2-7','C-1055','Agent took over','Price question on 6 Edward Street, Caleb replied',[['them','Would the vendor take $850k for 6 Edward Street?'],['gv','Price questions go to Caleb. He will reply here shortly.'],['agent','Hi Oscar, Caleb here. The vendor is holding at the range. Happy to talk through it on the phone.']],3,14,30],
  ['GS-D2-8','C-1058','Completed','Open home reminder for 25 Victoria Road sent',[['them','Can you remind me about the 25 Victoria Road open?'],['gv','Of course Harper. It is Saturday at 11:00am. Reminder set for Friday evening.']],6,10,0]];
 for(const [id,contactId,st,topic,msgs,days,hh,mm] of sms)d2Add(c.gvsms,{id,contactId,state:st,topic,msgs,at:d2At(days,hh,mm)})}

/* ---------- 7. eSign and documents ---------- */
function cwD2Esign(){const E=state.cw.esign;E.agreements=E.agreements||[];E.forms=E.forms||{};const D=state.cw.docs;
 const rec=(a,p,role,status,order,signedAt)=>{const r={id:'RC-'+a.id+'-'+order,contactId:p?.id||'',name:p?.name||role,email:p?.email||'',role,order,status};if(signedAt)r.signedAt=signedAt;return r};
 const mk=(o)=>{const d=findD(o.dealId);if(!d||E.agreements.some(a=>a.id===o.id))return;const p=findP(d.contactId);const ag=d2AgentRec(d2Agent(d));const created=d2At(o.days,10,0),sentAt=d2At(o.days,14,30);const kind=o.kind;const a={id:o.id,title:(kind==='Authority'?'Exclusive Sale Authority - ':'Contract of Sale - ')+d.address,kind,dealId:d.id,status:o.status,created,recipients:[],fields:[],activity:[],formId:(kind==='Authority'?'AUTH-':'COS-')+d.id+'-D2'};
  const signed=['Completed'].includes(o.status);const rs=[rec(a,p,'Signer',o.status==='Draft'?'Not sent':signed?'Signed':o.status==='Void'?'Voided':o.status==='At Risk'?'Bounced':'Sent',1,signed?d2At(o.days-1,18,10):'')];
  if(kind==='Contract'){const b=findP(cwDX(d).purchasers[0]);if(b)rs.push(rec(a,b,'Signer',signed?'Signed':'Sent',2,signed?d2At(o.days-1,19,30):''))}
  if(o.agentSigns)rs.push({id:'RC-'+a.id+'-9',contactId:'',name:ag.name,email:ag.email,role:'Signer',order:rs.length+1,status:signed?'Signed':'Sent',signedAt:signed?d2At(o.days-1,20,0):''});
  rs.push({id:'RC-'+a.id+'-cc',contactId:'',name:'Jess Ng',email:'jess.ng@example.test',role:'CC',order:rs.length+1,status:'Sent'});a.recipients=rs;
  const last=kind==='Authority'?6:9;for(const r of rs.filter(r=>r.role!=='CC'))for(const [type,page] of [['Initials',1],['Signature',last],['Date signed',last]])a.fields.push({id:'FD-'+r.id+'-'+type.replace(/\s/g,''),type,recipient:r.id,page,label:'',required:true});
  const log=(days,hh,what)=>a.activity.push({at:d2At(days,hh,0),what});log(o.days,10,'Draft created from the property record by '+ag.name);log(o.days,11,'Recipients added: '+rs.filter(r=>r.role!=='CC').map(r=>r.name).join(', '));
  if(o.status!=='Draft'){log(o.days,14,'Approved on Today by '+ag.name+' (A3). Sent for signing');a.sentAt=sentAt}
  if(o.status==='In Progress')log(o.days-1,9,'Viewed by '+(p?.name||'the vendor'));
  if(signed){for(const r of rs.filter(r=>r.status==='Signed'))log(o.days-1,18,'Signed by '+r.name);log(o.days-1,21,'All parties signed. Completed copy filed under Compliance');a.completedAt=d2At(o.days-1,21,0);if(kind==='Authority')d.compliance['Signed sales authority']=true}
  if(o.status==='At Risk')log(o.days-1,8,'Email to '+(p?.email||'the vendor')+' bounced. Nothing was signed');
  if(o.status==='Void'){log(o.days-3,16,'Voided by '+ag.name+': '+o.why)}
  if(o.status==='Deleted'){a.prevStatus='Draft';log(o.days-1,9,'Moved to Deleted by '+ag.name)}
  d2SortDesc(a.activity);E.agreements.push(a)};
 mk({id:'AGR-D2-1',dealId:'D-2006',kind:'Authority',status:'Completed',days:40,agentSigns:true});
 mk({id:'AGR-D2-2',dealId:'D-2009',kind:'Authority',status:'Completed',days:33,agentSigns:true});
 mk({id:'AGR-D2-3',dealId:'D-2007',kind:'Authority',status:'Completed',days:27});
 mk({id:'AGR-D2-4',dealId:'D-2027',kind:'Authority',status:'In Progress',days:4,agentSigns:true});
 mk({id:'AGR-D2-5',dealId:'D-2102',kind:'Contract',status:'Completed',days:25});
 mk({id:'AGR-D2-6',dealId:'D-2013',kind:'Authority',status:'At Risk',days:6});
 mk({id:'AGR-D2-7',dealId:'D-2010',kind:'Authority',status:'Void',days:31,why:'vendor listed with another agency'});
 mk({id:'AGR-D2-8',dealId:'D-2011',kind:'Contract',status:'Completed',days:12});
 mk({id:'AGR-D2-9',dealId:'D-2028',kind:'Authority',status:'In Progress',days:2});
 mk({id:'AGR-D2-10',dealId:'D-2022',kind:'Authority',status:'Deleted',days:50});
 for(const a of E.agreements){d2Fill(a,'created',d2At(3));for(const x of a.activity||[])d2Fill(x,'at',a.created)}
 /* the completed authority for 91 Perry Street is waiting on Caleb: a notification says so */
 d2Add(state.cw.notifications,{id:'NT-D2-sign',title:'Your signature is needed: Exclusive Sale Authority - 91 Perry Street',body:'Sophia Hughes has signed. The authority waits for you.',kind:'ESIGN',priority:'High',read:false,at:d2At(3,9,5),route:'/esign/document/AGR-D2-4'});
 /* documents library */
 for(const [id,name] of [['F-3','Compliance'],['F-4','Authorities'],['F-5','Contracts']])if(!D.folders.some(f=>f.id===id||f.name===name))D.folders.push({id,name});
 const files=[['Property Price Statement - 9 Rose Avenue.pdf',214000,'Compliance','F-3','D-2006',CW_ME,30],['Property Price Statement - 84 Albert Street.pdf',221000,'Compliance','F-3','D-2009',CW_ME,26],['Vendor ID sighting record - 9 Rose Avenue.pdf',96000,'Compliance','F-3','D-2006',CW_ME,38],
  ['Signed authority - 9 Rose Avenue.pdf',388000,'Authorities','F-4','D-2006',CW_ME,39],['Signed authority - 84 Albert Street.pdf',391000,'Authorities','F-4','D-2009',CW_ME,32],['Signed authority - 77 Park Street.pdf',384000,'Authorities','F-4','D-2028',D2_AG.priya,11],['Signed authority - 25 Victoria Road.pdf',386000,'Authorities','F-4','D-2007',D2_AG.alex,26],
  ['Contract of Sale - 7 St Georges Road (signed).pdf',1720000,'Contracts','F-5','D-2011',CW_ME,11],['Contract of Sale - 42 Dundas Street (signed).pdf',1690000,'Contracts','F-5','D-2102',D2_AG.dan,24],['Section 32 - 5 Darebin Road.pdf',1480000,'Contracts','F-5','D-2013',D2_AG.priya,14],
  ['Brochure 84 Albert Street.pdf',2600000,'Marketing','F-2','D-2009',CW_ME,25],['Brochure 77 Park Street.pdf',2350000,'Marketing','F-2','D-2028',D2_AG.priya,10],['Spring campaign price list 2026.pdf',310000,'Marketing','F-2','',D2_AG.sam,62],
  ['Vendor ID sighting record template.pdf',84000,'Templates','F-1','',D2_AG.sam,90],['Open home sign-in sheet.pdf',72000,'Templates','F-1','',D2_AG.sam,90],['Appraisal report template.docx',410000,'Templates','F-1','',D2_AG.sam,75],['Auction day checklist.pdf',98000,'Templates','F-1','',D2_AG.sam,58]];
 files.forEach((f,i)=>{const [name,size,category,folder,dealId,by,days]=f;d2Add(D.files,{id:'FL-D2-'+(i+1),name,size,category,folder,dealId,at:d2At(days,10+i%6,20),by})});
 for(const f of D.files)d2Fill(f,'at',d2At(5))}

/* ---------- 8. reports: AI sessions, support tickets, KPI numbers, notifications ---------- */
function cwD2Reports(){const S=state.cw.sessions,T=state.cw.tickets;
 const sess=[['SS-D2-1','Website Chat','Lena Fischer',78,true,'',2,19,32,[['user','We own a townhouse in Thornbury and want to know what it would sell for.'],['ai','Happy to help, Lena. Is it a 2 or 3 bedroom townhouse, and when are you thinking of selling?'],['user','3 bedrooms, probably February.'],['ai','I can book a free appraisal with Daniel Reid, who sells in Thornbury. What number should he call?'],['user','0413 555 210']]],
  ['SS-D2-2','AI Call','Unknown caller',35,false,'',3,12,48,[['user','What time is the open at 77 Park Street?'],['ai','Saturday at 1:00pm until 1:30pm. Would you like a reminder by text?'],['user','No thanks.']]],
  ['SS-D2-3','Website Chat','Tom Hartley',66,true,'',4,9,15,[['user','Looking for a 2 bed unit in Coburg under $650k.'],['ai','Two units may suit. Can I send them to you and let Alex Morgan know?'],['user','Yes, tom.hartley@example.test']]],
  ['SS-D2-4','AI Call','Noah Chen',72,true,'C-1028',5,17,5,[['user','Hi, it is Noah Chen. Is the Section 32 for 9 Rose Avenue available?'],['ai','Yes Noah, it is on file. I have emailed it to you and let Caleb know.']]],
  ['SS-D2-5','Website Chat','Mei Lin',58,true,'',7,21,2,[['user','Is 5 Darebin Road still for sale and what is the price?'],['ai','Yes, it is for sale. The Property Price Statement shows $1,606,000 to $1,766,000. Would you like the statement emailed?'],['user','Yes please, mei.lin@example.test']]],
  ['SS-D2-6','AI Call','Unknown caller',22,false,'',8,8,40,[['user','Do you do rentals?'],['ai','Collings sells and manages property in the northern suburbs. I can have the property management team call you back.'],['user','I will call back later.']]],
  ['SS-D2-7','Website Chat','Ben Walsh',81,true,'C-1046',10,18,25,[['user','Ben Walsh here. We want to see 9 Rose Avenue again before the auction.'],['ai','Of course Ben. The next open is Saturday at 2:30pm, or I can ask Caleb about a private inspection.'],['user','Private inspection Thursday evening if possible.'],['ai','Noted. Caleb will confirm a time with you today.']]]];
 for(const [id,channel,name,score,qualified,contactId,days,hh,mm,msgs] of sess)d2Add(S,{id,channel,name,score,qualified,contactId,at:d2At(days,hh,mm),msgs});
 for(const s of S)d2Fill(s,'at',d2At(2));d2SortDesc(S);
 const tk=[['TK-D2-1','Technical Issue','Cannot reset my portal password','C-1007','Open',0,8,25,[]],['TK-D2-2','Property Inquiry','Is 5 Darebin Road still available?','C-1052','In Progress',1,12,10,[['Agent','Yes, it is. Priya will call you about an inspection.']]],['TK-D2-3','Selling My Property','What happens at settlement?','C-1026','Closed',9,10,0,[['Agent','Your conveyancer handles the transfer. We do the final inspection the day before.']]],['TK-D2-4','Auction Information','How do I register to bid at 84 Albert Street?','C-1031','Open',1,19,45,[]],['TK-D2-5','Feedback','The open home at 9 Rose Avenue was well run, thanks','C-1058','Closed',4,15,30,[['Agent','Thank you Harper, passed on to Caleb.']]],['TK-D2-6','General Inquiry','Can you recommend a conveyancer?','C-1020','In Progress',2,11,5,[['Agent','Three local firms are on the way by email.']]]];
 for(const [id,topic,subject,from,status,days,hh,mm,replies] of tk)d2Add(T,{id,topic,subject,from,status,at:d2At(days,hh,mm),replies});
 for(const t of T)d2Fill(t,'at',d2At(1));d2SortDesc(T);
 const K=state.cw.kpi;K.manual=K.manual||{};const seedManual={texts:18,emails:11,knocks:6,letters:40,posts:1},want={texts:23,emails:14,knocks:8,letters:60,posts:2};for(const k in want)if(K.manual[k]===undefined||K.manual[k]===seedManual[k])K.manual[k]=want[k];
 const N=state.cw.notifications;
 for(const n of [{id:'NT-D2-1',title:'Offer rejected on 5 Darebin Road',body:'$1,520,000 from Ella Campbell declined by the vendor. The advertised price cannot go below this figure.',kind:'OFFER',priority:'High',read:true,at:d2At(9,13,0),route:'/properties/D-2013?tab=enquiries'},{id:'NT-D2-2',title:'Campaign sent: Open homes this weekend',body:'96 texts by Alex Morgan. 21 link clicks so far.',kind:'CAMPAIGN',priority:'Normal',read:true,at:d2At(9,9,0),route:'/communications?tab=sent'},{id:'NT-D2-3',title:'Settlement in 7 days: 5/16 Cramer Street',body:'Priya Shah. Final inspection to book with the buyer.',kind:'SETTLEMENT',priority:'Normal',read:false,at:d2At(1,8,0),route:'/commissions'},{id:'NT-D2-4',title:'Support ticket: Cannot reset my portal password',body:'Jack Wilson. Open ticket for the web team.',kind:'SUPPORT',priority:'Normal',read:false,at:d2At(0,8,26),route:'/support-tickets'},{id:'NT-D2-5',title:'Open home closed: 9 Rose Avenue',body:'6 groups through. Two contract requests.',kind:'INSPECTION',priority:'Normal',read:true,at:d2At(2,15,10),route:'/inspections'}])d2Add(N,n);
 for(const n of N)d2Fill(n,'at',d2At(1));d2SortDesc(N)}

/* ---------- 1. dates everywhere: activity, calls, actions, settlements ---------- */
function cwD2Dates(){
 state.activity.forEach((a,i)=>d2Fill(a,'at',d2ParseWhen(a.when,i)));
 const acts=[['sync',1,8,10,'GeeVee','Office pipeline refreshed','Overnight sync. 41 properties, 66 contacts, no conflicts.'],['auto',1,9,5,'GeeVee','Enquiry answered on its own: inspection time for 41 Fitzroy Street','Every fact came from the open home record. No price or vendor detail given.'],['policy',1,20,0,'GeeVee','Reminder: Mia Russo not called yet','3 hours left under the 24-hour seller-lead rule.'],['draft',2,10,30,'GeeVee','GeeVee prepared a vendor report for 5 Darebin Road','Email · A2 · waiting for Priya Shah to review'],['call',2,11,15,D2_AG.dan,'Daniel Reid logged call with Hugo Hill','Settlement booked for 13 Cambridge Street. Keys to the office.'],['esign',3,14,30,D2_AG.priya,'Exclusive Sale Authority - 77 Park Street sent for signing','Approved on Today (A3).'],['inspection',2,15,10,CW_ME,'Open home closed: 9 Rose Avenue','6 groups through. Calls for HOT buyers added to Today.'],['campaign',9,9,0,D2_AG.alex,'Campaign sent: Open homes this weekend','96 texts. Opt-outs and seller leads excluded.'],['pipeline',17,16,0,D2_AG.alex,'28 Westgarth Street moved to Sold','Sold at auction for $1,735,000.'],['consent',12,10,20,'GeeVee','Opt-out honoured: Priya Liu','Removed from the November buyer newsletter.'],['settings',30,9,0,D2_AG.sam,'Auto-response rule saved: Thank buyers after an open home','Open home check-in'],['property',24,17,40,D2_AG.dan,'42 Dundas Street: Marked sold','Private sale, $1,412,000. Contract exchanged.']];
 acts.forEach((r,i)=>{const [type,days,hh,mm,by,title,details]=r;const at=d2At(days,hh,mm);d2Add(state.activity,{id:'E-D2-'+(i+1),type,title,details,when:d2When(at),at,by})});
 d2SortDesc(state.activity);if(state.activity.length>90)state.activity.length=90;
 const noCall=new Set(state.deals.filter(d=>d.stage==='New lead').map(d=>d.contactId));
 const calls=[['C-1003',CW_ME,1,10,40,'Appraisal confirmed for Tuesday 10:30. Anne will be there. Bring the Heidelberg Heights sales.','Answered, recap logged'],['C-1012',CW_ME,2,9,15,'Walked Lucas through the authority. Exclusive 90 days, 1.8% plus GST. Signing Thursday.','Answered, recap logged'],['C-1021',CW_ME,2,17,30,'Campaign update for Hannah: 6 groups Saturday, two contract requests. Holding price.','Answered, recap logged'],['C-1026',CW_ME,4,11,0,'Settlement questions for 7 St Georges Road. Keys to the office on the morning.','Answered, recap logged'],['C-1005',CW_ME,0,8,50,'Jordan wants to firm up the offer on 9 Rose Avenue. Finance clause 14 days.','Answered, recap logged'],['C-1046',CW_ME,1,15,20,'Ben asked about price flexibility. Told him the vendor is holding the range.','Answered, recap logged'],['C-1059',D2_AG.dan,2,11,15,'Settlement booked for 13 Cambridge Street. Final inspection Friday.','Answered, recap logged'],['C-1033',D2_AG.dan,3,14,0,'Emily wants the three Rosanna sales before deciding on 33 Station Street.','Answered, recap logged'],['C-1042',D2_AG.priya,1,13,45,'Nathan agreed to a price review on 5 Darebin Road after the rejected offer.','Answered, recap logged'],['C-1048',D2_AG.priya,3,10,10,'Marcus happy with the 77 Park Street open. Wants a report Monday.','Answered, recap logged'],['C-1053',D2_AG.alex,2,16,30,'Finn asked for the marketing budget on 15 Burgundy Street in writing.','Call back requested'],['C-1017',D2_AG.alex,5,9,30,'Sam still deciding on 20 Lygon Street. Exclusive period explained.','Answered, recap logged'],['C-1028',D2_AG.alex,4,12,20,'Noah pre-approved to $1.15m. Sending Preston listings.','No answer, left a message'],['C-1102',D2_AG.dan,6,15,0,'Bruno: contract exchanged on 42 Dundas Street, settlement in five weeks.','Answered, recap logged']];
 calls.forEach((r,i)=>{const [contactId,by,days,hh,mm,summary,outcome]=r;const p=findP(contactId);if(!p)return;const at=d2At(days,hh,mm);if(d2Add(state.calls,{id:'CALL-D2-'+(i+1),contactId,summary,outcome,when:d2When(at),at,by,recording:false})&&!noCall.has(contactId)){const s=d2SeedP(contactId);if(!s||p.callStatus===s.callStatus)p.callStatus='contacted';if(!s||p.lastContact===s.lastContact)p.lastContact=d2When(at)}});
 d2SortDesc(state.calls);
 state.actions.forEach((a,i)=>d2Fill(a,'at',d2ParseWhen(a.created,i)));
 state.tasks.forEach((t,i)=>d2Fill(t,'at',d2At(1+i%4,9,i%60)));
 for(const e of state.cw.events)d2Fill(e,'at',d2At(7));
 for(const o of state.cw.openHomes)for(const a of o.attendees||[])d2Fill(a,'at',o.day);
 (state.offers||[]).forEach((o,i)=>d2Fill(o,'at',d2ParseWhen(o.received,i)));
}
/* entries other layers create later (audit, saveCall, addAction, addTask, offers) get an ISO stamp on the next render */
function cwD2Stamp(){if(!state||!state.activity)return;const now=cwNowISO();for(const list of [state.activity,state.calls,state.actions,state.tasks,state.offers||[]])for(const x of list||[]){if(!x.at)x.at=now}}
const cwD2PrevPersist=persist;
persist=function(){try{cwD2Stamp()}catch(e){}return cwD2PrevPersist()};

/* three seeded drafts were task notes, not messages (24 Nov 2026); replace them where a browser still holds the old words */
function cwD2Words(){
 /* comparables picked before 24 Nov 2026 carry no key features; add them from the sales record by address */
 if(typeof cwJnFeatures==='function')for(const dl of state.deals){const x=dl.cw;if(!x||!Array.isArray(x.comps))continue;for(const c of x.comps){if(Array.isArray(c)&&c.length===3){const sale=(state.cw.sales||[]).find(s=>String(c[0]).startsWith(s.address));if(sale)c.push(cwJnFeatures(sale))}}}
 /* sales records gained key features (cars, land, internal area, type) for the Property Price Statement */
 if(typeof cwSalesSeed==='function'&&state.cw.sales){const fresh=cwSalesSeed();for(const x of state.cw.sales){if(x.cars==null){const f=fresh.find(y=>y.address===x.address);if(f)Object.assign(x,{cars:f.cars,land:f.land,internal:f.internal,type:f.type})}}}
const fix=(id,test,patch)=>{const a=state.actions.find(x=>x.id===id);if(a&&test(a))Object.assign(a,patch)};const seed=id=>SEED.actions.find(x=>x.id===id)||{};
 /* the seeded authority approval must drive its agreement: approve on Today sends it, reject stops it */
 {const g=(state.cw.esign?.agreements||[]).find(x=>x.id==='AGR-1'),act=state.actions.find(x=>x.id==='A-6004');if(g&&act&&!g.pendingAction&&act.status==='Awaiting review'){g.pendingAction=act.id;if(!(g.recipients||[]).length&&typeof cwEsAddRecipient==='function'){const p=findP(act.contactId);if(p)cwEsAddRecipient(g,{contactId:p.id,name:p.name,email:p.email,role:'Vendor',order:1})}}}
 fix('A-6004',a=>!a.jnAgr&&!a.auAgr&&!a.j3Agr,{jnAgr:'AGR-1',body:seed('A-6004').body});
 fix('A-6003',a=>/prepared for agent review/.test(a.body||''),{title:seed('A-6003').title,subject:seed('A-6003').subject,body:seed('A-6003').body,attachments:seed('A-6003').attachments});
 fix('A-6002',a=>/^Thanks Jordan. I will confirm/.test(a.body||''),{subject:seed('A-6002').subject,body:seed('A-6002').body,attachments:seed('A-6002').attachments});
 fix('A-6006',a=>/pending agent verification/.test(a.body||''),{contactId:seed('A-6006').contactId,dealId:seed('A-6006').dealId,body:seed('A-6006').body});
 const w=state.gvx&&state.gvx.withdrawn;const c=state.actions.find(x=>x.id==='A-6006');if(w&&w['A-6006']&&c&&/^Withdrawn/.test(c.status||'')){delete w['A-6006'];c.status='Awaiting review'}}

/* ---------- apply once per version ---------- */
function cwD2Ensure(){if(!state.cw||state.cw.d2===CW_D2_VERSION)return;
 try{cwD2Repoint();cwD2Agents();cwD2Leads();cwD2Properties();cwD2Messages();cwD2Contacts();cwD2Comms();cwD2Esign();cwD2Reports();cwD2Dates();cwD2Words()}catch(e){console.error('cw-data2',e)}
 state.cw.d2=CW_D2_VERSION;persist()}

/* ---------- date ranges on Analytics, Commissions and Agent analytics ---------- */
function cwD2Since(key){if(!key)return 0;const days={'1W':7,'2W':14,'1M':30,'3M':91,'6M':182,'12M':365,'Last 1 day':1,'Last 7 days':7,'Last 30 days':30,'Last 90 days':90,'Last 180 days':180}[key];if(days)return Date.now()-days*864e5;if(key==='FY'){const n=new Date();const y=n.getMonth()>=6?n.getFullYear():n.getFullYear()-1;return new Date(y,6,1).getTime()}return 0}
function cwD2PageSince(){if(ui.route!=='cw')return 0;const path=cwParse(ui.cwRoute||'').path;if(path==='/commissions')return cwD2Since(cwF('pfc:r','FY'));if(path.indexOf('/analytics/agent')===0)return cwD2Since(cwF('pfag:r','FY'));if(path==='/analytics')return cwD2Since(cwF('pfan:range','Overall (all time)'));return 0}
function cwD2DealAt(d){const x=cwDX(d);if(d.stage==='Sold')return x.soldAt||x.listedAt;if(['Appraisal','Proposal','Authority'].includes(d.stage))return x.appraisalAt||x.listedAt;if(['New lead','Connected'].includes(d.stage))return x.leadAt||x.listedAt;if(d.stage==='Lost')return x.lostAt||x.listedAt;return x.listedAt}
function cwD2SpanDays(d){const x=cwDX(d);const start=Date.parse(x.listedAt)||Date.now();const end=d.stage==='Sold'&&x.soldAt?Date.parse(x.soldAt):Date.now();return Math.max(1,(end-start)/864e5)}
let cwD2Wrapped=false;
function cwD2Wrap(){if(cwD2Wrapped)return;cwD2Wrapped=true;
 if(typeof cwPfPortal==='function'){const prev=cwPfPortal;cwPfPortal=function(){const P=prev();const since=cwD2Since(cwF('pfan:range','Overall (all time)'));if(!since||ui.route!=='cw')return P;const days=(Date.now()-since)/864e5;let views=0,saves=0;const ds=cwProps();
  for(const d of ds){const x=cwDX(d);if(d.stage==='Sold'&&Date.parse(x.soldAt||0)<since)continue;const f=Math.min(1,days/cwD2SpanDays(d));views+=Math.round(x.views*f);saves+=Math.round(x.saves*f)}
  const enq=state.cw.enquiries.filter(e=>Date.parse(e.received)>=since).length+state.messages.filter(m=>m.dealId&&Date.parse(m.at||0)>=since).length;
  const insp=state.cw.openHomes.filter(o=>Date.parse(o.day)>=since).reduce((a,o)=>a+(o.attendees||[]).length,0);
  const offers=(state.offers||[]).filter(o=>!o.at||Date.parse(o.at)>=since).length;
  const signups=cwContacts().filter(p=>cwPX(p).portal&&(!cwPX(p).portalAt||Date.parse(cwPX(p).portalAt)>=since)).length;
  const sold=ds.filter(d=>d.stage==='Sold'&&Date.parse(cwDX(d).soldAt||0)>=since);
  return{views,saves,enq,insp,offers,signups,sold,influenced:sold.reduce((a,d)=>a+comm(d),0)}}}
 if(typeof cwPfStats==='function'){const prev=cwPfStats;cwPfStats=function(name){const s=prev(name);const since=cwD2PageSince();if(!since)return s;const ds=s.ds.filter(d=>Date.parse(cwD2DealAt(d)||0)>=since);
  const n=st=>ds.filter(d=>st.includes(d.stage)).length;return{...s,leads:n(['New lead','Connected']),appraisals:n(['Appraisal','Proposal','Authority']),onMkt:n(['For sale']),offMkt:n(['Listed']),listings:n(['Listed','For sale','Sold']),sales:n(['Sold']),commission:ds.filter(d=>d.stage==='Sold').reduce((a,d)=>a+comm(d),0),pipeline:ds.filter(d=>d.active).reduce((a,d)=>a+comm(d)*(stageP[d.stage]||0),0),ds:s.ds}}}
 const an=CW_ROUTES.find(x=>x.pattern==='/analytics');if(an){const prevR=an.def.render;an.def.render=function(ctx){const html=prevR(ctx);const old=cwNote('Sample activity is not dated, so every range shows the same totals in this prototype.','warn');const range=cwF('pfan:range','Overall (all time)');return html.split(old).join(cwNote('Showing '+h(range).toLowerCase()+'. Views are spread evenly across each listing\'s days on market; enquiries, inspections, sign-ups and sales use their recorded dates.','info'))}}
 const cm=CW_ROUTES.find(x=>x.pattern==='/commissions');if(cm){const prevR=cm.def.render;cm.def.render=function(ctx){const html=prevR(ctx);const r=cwF('pfc:r','FY');return r==='FY'?html:html.replace('Office commission and attribution.','Office commission and attribution for the last '+({'1W':'week','2W':'two weeks','1M':'month','3M':'three months','6M':'six months','12M':'twelve months'})[r]+'.')}}
}
const cwD2PrevRender=render;
render=function(){cwEnsure();cwD2Ensure();cwD2Wrap();try{cwD2Stamp()}catch(e){console.error('cw-data2 stamp',e)}return cwD2PrevRender()};
