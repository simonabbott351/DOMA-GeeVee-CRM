'use strict';
/* DOMA V2 base app: state, Today, Messages, calls, approvals, GeeVee chat, dialogs, routing. Layers in js/cw-*.js extend or replace what is here by name. */
const SEED=(window.DOMA_SEED||JSON.parse(document.getElementById('seed').textContent));
const LEGACY=(window.DOMA_LEGACY||JSON.parse(document.getElementById('legacy').textContent));
const STORAGE='doma-v2-phase2-integrated-v2';
let state;
try{const prev=JSON.parse(localStorage.getItem(STORAGE)||'null');state=prev&&prev.version===1&&prev.people?.length?prev:structuredClone(SEED)}catch(e){state=structuredClone(SEED)}
const ui={route:'today',modal:null,menu:false,filterPeople:'All',searchPeople:'',filterDeals:'All',searchDeals:'',viewDeals:'pipeline',filterMessages:'All',searchMessages:'',selectedMessage:state.messages[0]?.id,focusIndex:0,focusMode:false,moreTab:'directory',legacyKey:'dashboard',legacySearch:'',searchGlobal:'',searchOrigin:'',callSessionFilter:'Recommended',toast:'',aiReply:''};
let toastTimeout;
const ic={home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/>',phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.9L7.2 10a16 16 0 0 0 6.8 6.8l1.6-1.8a2 2 0 0 1 1.9-.6l2.8.5a2 2 0 0 1 1.7 2z"/>',building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h1M15 6h1M8 10h1M15 10h1M8 14h1M15 14h1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',messages:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',sparkles:'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7zM19 18l.7 2.3L22 21l-2.3.7L19 24l-.7-2.3L16 21l2.3-.7z"/>',check:'<path d="m5 12 4 4L19 6"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',chevron:'<path d="m9 18 6-6-6-6"/>',down:'<path d="m6 9 6 6 6-6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',alert:'<path d="m12 2 10 18H2z"/><path d="M12 9v4M12 17h.01"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',chart:'<path d="M3 3v18h18M7 15l4-4 3 2 6-7"/>',filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',refresh:'<path d="M20 11a8 8 0 1 0-2 5M20 4v7h-7"/>',external:'<path d="M14 3h7v7M10 14 21 3M21 13v7H4V3h7"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',lock:'<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 20a2 2 0 0 0 4 0"/>',copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',edit:'<path d="M12 20h9M16 4l4 4-11 11-5 1 1-5z"/>',pause:'<path d="M8 4v16M16 4v16"/>',play:'<path d="m8 5 12 7-12 7z"/>',layers:'<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 8 10-8"/>',archive:'<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v13h16V8M10 13h4"/>',zap:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.5-2.5.8a7 7 0 0 0-1.7-1L14.2 3H9.8l-.5 2.7a7 7 0 0 0-1.7 1l-2.5-.8-2 3.5 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.5 2.5-.8a7 7 0 0 0 1.7 1l.5 2.7h4.4l.5-2.7a7 7 0 0 0 1.7-1l2.5.8 2-3.5-2-1.6a7 7 0 0 0 .1-1z"/>'};
const ico=(n,cls='')=>`<svg viewBox="0 0 24 24" class="icon ${cls}" aria-hidden="true">${ic[n]||ic.grid}</svg>`;
const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dataAttr=x=>h(x);const findP=id=>state.people.find(x=>x.id===id);const findD=id=>state.deals.find(x=>x.id===id);const findT=id=>state.tasks.find(x=>x.id===id);
const personName=id=>findP(id)?.name||'Unknown contact';const comm=d=>Math.round(d.guide*(d.fee/100));const aud=n=>'$'+Math.round(n).toLocaleString('en-AU');const abbrev=n=>n>=1000000?'$'+(n/1000000).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
const stageP={'New lead':.04,'Connected':.1,'Appraisal':.18,'Proposal':.31,'Authority':.51,'Listed':.65,'For sale':.75,'Sold':1,'Lost':0};
const initials=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
const tag=(txt,cls='')=>`<span class="tag ${cls}">${h(txt)}</span>`;
const action=(label,kind,id='',cls='')=>`<button class="btn ${cls}" data-action="${h(kind)}" data-id="${dataAttr(id)}">${label}</button>`;
const field=(id,ph,value='',extra='')=>`<input id="${id}" class="field ${extra}" placeholder="${h(ph)}" value="${h(value)}" autocomplete="off">`;
const stageTag=s=>tag(s,({'Appraisal':'yellow','Proposal':'blue','Authority':'purple','For sale':'green','Listed':'teal','Sold':'green','Lost':'red','New lead':'hot'})[s]||'');
const tierTag=s=>tag(({A0:'Internal',A1:'Routine',A2:'Agent approval',A3:'Protected'}[s]||s),({A0:'green',A1:'teal',A2:'yellow',A3:'red'}[s]||''));
const navs=[['today','home','Today'],['calls','phone','Call people'],['deals','building','My deals'],['messages','messages','Messages']];
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){console.warn('Local storage not available',e)}}
function toast(msg){ui.toast=msg;const t=document.getElementById('toast');if(t)t.innerHTML=`<span>${h(msg)}</span><button data-action="dismissToast" aria-label="Dismiss">×</button>`;if(t)t.style.display='flex';clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{if(t)t.style.display='none'},4700)}
function audit(type,title,details){state.activity.unshift({id:'E-'+Date.now()+'-'+Math.random().toString(16).slice(2,5),type,title,details,when:'Just now'});if(state.activity.length>90)state.activity.length=90}
function sectionHeader(title,subtitle='',actions=''){return `<div class="page-header"><div><div class="eyebrow">Collings / GeeVee · Phase 2</div><h1>${title}</h1>${subtitle?`<p>${subtitle}</p>`:''}</div><div class="page-actions">${actions}</div></div>`}
function cardHead(title,extra=''){return `<div class="card-head"><h2>${title}</h2>${extra}</div>`}
function stats(){const active=state.deals.filter(d=>d.active), sum=arr=>arr.reduce((a,d)=>a+comm(d),0);return{potential:sum(active),weighted:active.reduce((a,d)=>a+comm(d)*(stageP[d.stage]||0),0),atRisk:sum(active.filter(d=>d.risk)),risk:active.filter(d=>d.risk).length,unread:state.messages.filter(m=>m.unread).length,approvals:state.actions.filter(a=>a.status==='Awaiting review').length,tasks:state.tasks.filter(x=>x.status==='Open').length,calls:state.calls.length}}
function avatar(name,cls=''){return `<div class="avatar ${cls}">${h(initials(name))}</div>`}
function shell(){const s=stats();return `<div class="sidebar-scrim ${ui.menu?'on':''}" data-action="toggleMenu"></div><div class="shell"><aside class="side ${ui.menu?'open':''}" aria-label="Main navigation"><div class="logo-area"><div class="wordmark">COLLI<span>N</span>GS</div><div class="underlogo"><span>DOMA CRM <span style="color:#92a0a5">/</span> GEEVEE</span><span class="tiny"><span class="mini-pulse"></span> V2</span></div></div><nav class="side-nav"><div class="caps muted" style="margin:7px 12px 10px">My working day</div>${navs.map(([r,i,label])=>`<button class="nav-button ${ui.route===r?'active':''}" data-action="route" data-id="${r}">${ico(i)}<span class="nav-label">${label}</span>${r==='messages'&&s.unread?`<span class="nav-count">${s.unread}</span>`:r==='today'&&s.approvals?`<span class="nav-count">${s.approvals}</span>`:''}</button>`).join('')}<div class="nav-separator"></div><button class="nav-button ${ui.route==='more'?'active':''}" data-action="route" data-id="more">${ico('grid')}<span class="nav-label">More tools</span>${ico('chevron','sm')}</button><div class="side-tip"><b>Built on your existing CRM.</b><br>GeeVee puts the next task first. Advanced tools and original screens remain available.</div></nav><div class="side-bottom">${avatar('Caleb Richards')}<div style="flex:1;min-width:0"><strong style="display:block;font-size:12px">Caleb Richards</strong><span class="muted tiny">Property Executive · Demo</span></div>${ico('settings','sm')}</div></aside><div class="main"><header class="top"><button class="top-icon menubtn" data-action="toggleMenu" aria-label="Open navigation">${ico('menu')}</button><div class="top-breadcrumb"><strong>${h(({today:'Today',calls:'Call people',deals:'My deals',people:'People',messages:'Messages',more:'More tools'})[ui.route])}</strong><span class="muted tiny">/ DOMA</span></div><label class="searchbar">${ico('search','sm')}<input id="global-search" placeholder="Search people, properties, tasks or ask GeeVee…" aria-label="Search DOMA"><kbd>Ctrl K</kbd></label><div class="top-spacer"></div><span class="topflag">${ico('link','sm')} V1 records linked</span><span class="topflag demo">Prototype · no live sends</span><button class="top-icon" data-action="openApprovals" aria-label="Review approvals">${ico('bell')} ${s.approvals?`<span style="position:absolute;margin:0 0 24px 27px;border-radius:100px;background:#ca4e4b;width:8px;height:8px"></span>`:''}</button></header><main class="main-inner" id="content">${page()}</main></div></div><nav class="mobile-dock" aria-label="Mobile navigation">${[['today','home','Today'],['calls','phone','Calls'],['deals','building','Deals'],['messages','messages','Messages'],['more','grid','More']].map(([r,i,label])=>`<button type="button" class="mobile-dock-item ${ui.route===r?'is-active':''}" data-action="route" data-id="${r}" aria-label="${label}">${ico(i)}<span>${label}</span></button>`).join('')}</nav><div id="modal-layer">${ui.modal?modal():''}</div><div class="toast" id="toast" style="display:none"></div>`}
function page(){return ({today,calls,deals,people,messages,more})[ui.route]?.()||today()}
function render(){document.getElementById('app').innerHTML=shell()}
function navigate(r){ui.route=r;ui.menu=false;ui.modal=null;render();window.scrollTo(0,0)}
function openModal(m){ui.modal=m;render()}
function closeModal(){ui.modal=null;render()}
function todaysList(limit=6){return state.tasks.filter(t=>t.status==='Open').sort((a,b)=>({'Urgent':0,'High':1,'Normal':2}[a.priority]??2)-({'Urgent':0,'High':1,'Normal':2}[b.priority]??2)).slice(0,limit)}
function taskRow(t,compact=false){const p=findP(t.contactId),d=findD(t.dealId);return `<div class="list-row"><div class="number-circle">${ico(t.category==='Call'?'phone':'check','sm')}</div><div class="list-main"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><strong>${h(t.title)}</strong>${t.priority==='Urgent'?tag('Call first','hot'):t.due==='Tomorrow'?tag('Tomorrow','outline'):''}</div><div class="sub">${h(p?.name||'Team task')} ${d?'· '+h(d.address+', '+d.suburb):''} · ${h(t.due)}</div></div><div class="action-side">${t.category==='Call'&&p?action('Call','call',p.id,'primary sm'):action('Open','openTask',t.id,'sm')}${!compact?action('✓','taskDone',t.id,'sm'):''}</div></div>`}
function homeOpportunity(d){const p=findP(d.contactId);return `<div class="list-row"><div class="number-circle" style="background:#fdf0e1;color:#b77227">${ico('target','sm')}</div><div class="list-main"><strong>${h(p?.name||'Contact')}</strong> ${stageTag(d.stage)}<div class="sub">${h(d.address+', '+d.suburb)} · ${h(d.why)}<br><b style="color:#176d75">${aud(comm(d))}</b> potential gross commission (estimate)</div></div><div class="action-side">${action('Call','call',p?.id||'','primary sm')}${action('View','openDeal',d.id,'sm')}</div></div>`}
function moneyMapMini(){const focus=['New lead','Appraisal','Proposal','Authority','Listed','For sale'];const d=focus.map(st=>({st,amt:state.deals.filter(x=>x.stage===st).reduce((a,x)=>a+comm(x),0)}));const max=Math.max(...d.map(x=>x.amt),1);return `<div class="card pad">${cardHead('Where your potential commission sits',action('Full Money Map','showMoney','','sm'))}${d.map(x=>`<div class="money-row"><div class="category">${h(x.st)}</div><div class="progress"><span style="width:${Math.round(x.amt/max*100)}%"></span></div><div class="value num">${abbrev(x.amt)}</div></div>`).join('')}<div class="hint">Estimated gross commission by stage, not guaranteed earnings. Sold and Lost are excluded from this view.</div></div>`}
function activityMini(){return `<div class="card pad">${cardHead('GeeVee has prepared',tag('Reviewable actions','teal'))}<div class="alert info" style="margin-bottom:10px">${ico('shield','sm')} Internal summaries can be prepared automatically. External messages and sensitive changes remain under your control.</div>${state.activity.slice(0,5).map(a=>`<div class="activity"><div class="activity-dot"></div><div><strong>${h(a.title)}</strong><p>${h(a.details)} · ${h(a.when)}</p></div></div>`).join('')}${action('View system activity','moreTab','audit','sm block')}</div>`}
function today(){const s=stats();const priority=state.deals.filter(d=>d.active&&(d.stage==='New lead'||d.risk)).sort((a,b)=>(b.stage==='New lead')-(a.stage==='New lead')).slice(0,4);const approval=state.actions.filter(x=>x.status==='Awaiting review').slice(0,3);return `
${sectionHeader('Good morning, Caleb','Monday 16 November · Here’s what GeeVee recommends based on your connected CRM records.',action(`${ico('shield')} ${s.approvals} approvals to review`,'openApprovals','','')+action(`${ico('eye')} Current CRM`,'legacy','dashboard',''))}
<div class="hero"><div class="hero-top"><div class="hero-eyebrow">✦ GEEVEE · YOUR PERSONAL ASSISTANT</div>${tag('Phase 2 · preparation + review','')}</div><div class="hero-title">You have people worth calling. Let's turn those conversations into listings.</div><div class="hero-sub">I've organised your most valuable work, linked it to existing contacts and properties, and prepared ${s.approvals} items for your decision.</div><div class="hero-actions">${action(`${ico('play')} Start my day`,'startDay','','big primary')}${action(`${ico('phone')} Start a call session`,'route','calls','big')}${action(`${ico('shield')} Review approvals`,'openApprovals','','big')}</div><div class="hero-input">${ico('sparkles')}<input id="ask-geevee" aria-label="Ask GeeVee" placeholder="Ask GeeVee… for example, 'show my appraisal leads' or 'prepare my day'"><button class="btn primary sm" data-action="askGeeVee">Ask GeeVee ${ico('arrow','sm')}</button></div></div>
<div class="grid-4" style="margin:16px 0"><div class="stat highlight"><div class="label">Potential commission · Active</div><div class="value num">${abbrev(s.potential)}</div><div class="foot">Estimated, not guaranteed</div></div><div class="stat"><div class="label">Work needing your decision</div><div class="value num">${s.approvals}</div><div class="foot">${s.approvals?'Drafts already prepared':'Nothing awaiting review'}</div></div><div class="stat"><div class="label">Unread conversations</div><div class="value num">${s.unread}</div><div class="foot"><a href="#" data-action="route" data-id="messages">Emails, texts and portal enquiries</a></div></div><div class="stat"><div class="label">Deals needing rescue</div><div class="value num">${s.risk}</div><div class="foot">${abbrev(s.atRisk)} estimated commission involved</div></div></div>
<div class="split" style="margin-top:15px"><div style="display:flex;flex-direction:column;gap:15px"><div class="card pad">${cardHead('What to do first',tag('Priority order','teal'))}<div class="inline-help" style="margin-bottom:5px">${ico('sparkles','sm')} GeeVee has put the most important calls and decisions at the top. You can act here, no need to find another screen.</div>${todaysList(6).map(x=>taskRow(x)).join('')}${action('See all calls','route','calls','sm')}</div><div class="card pad">${cardHead('Revenue opportunities',action('See all deals','route','deals','sm'))}${priority.map(d=>homeOpportunity(d)).join('')}</div><div class="card pad">${cardHead('Waiting for your approval',action('Open all approvals','openApprovals','','sm'))}${approval.map(a=>`<div class="list-row"><div class="number-circle" style="background:#fff0e5;color:#b96b23">${ico('file','sm')}</div><div class="list-main"><strong>${h(a.title)}</strong><div class="sub">${h(personName(a.contactId))} · ${h(a.type)} · ${a.tier==='A3'?'Must review individually':'Agent approval'}</div></div>${action('Review','openApproval',a.id,'sm primary')}</div>`).join('')||'<p class="muted">Everything has been reviewed.</p>'}</div></div><div style="display:flex;flex-direction:column;gap:15px">${activityMini()}${moneyMapMini()}<div class="card pad">${cardHead('Your CRM stays connected',tag('Migration safe','green'))}<p class="small muted">The original lead pipeline, contacts, property compliance, CMA tools, campaign manager and other operational workspaces remain accessible while Phase 2 foundations are introduced.</p><div class="sep"></div>${[['lead_pipeline','Existing lead pipeline'],['seller_opportunities','Seller opportunities'],['property_compliance','Property compliance'],['campaign_manager','Campaign manager']].map(([key,label])=>`<button data-action="legacy" data-id="${key}" class="command-row">${ico('external','sm')}<span style="flex:1">${label}</span>${ico('chevron','sm')}</button>`).join('')}</div></div></div>`}
function calls(){const recommended=state.people.filter((p,i)=>(p.role==='seller'||p.role==='both')&&p.consent==='ok').sort((a,b)=>({ 'not called':0, 'contacted':1}[a.callStatus]??1)-({'not called':0,'contacted':1}[b.callStatus]??1));const all=ui.callSessionFilter==='Recommended'?recommended:ui.callSessionFilter==='All people'?state.people:state.people.filter(p=>p.role==='buyer'||p.role==='both');let list=all.filter(p=>p.consent==='ok').slice(0,22);return `${sectionHeader('Call people','Agent calls are designed to start in DOMA. GeeVee prepares the context and handles the post-call administration.',action(`${ico('eye')} Current CRM voice tools`,'legacy','voice',''))}
<div class="alert info" style="margin-bottom:16px">${ico('phone')} <div><b>Phase 2 demonstration:</b> The call interface below simulates the workflow. It does not dial a number, capture audio or transcribe calls. Live calling, recording and consent handling require the later telephony integration.</div></div>
<div class="grid-3" style="margin-bottom:16px"><div class="stat highlight"><div class="label">Suggested calls today</div><div class="value">${recommended.slice(0,16).length}</div><div class="foot">Sorted by uncontacted sellers first</div></div><div class="stat"><div class="label">Calls logged in this demo</div><div class="value">${state.calls.length}</div><div class="foot">Linked to existing contact records</div></div><div class="stat"><div class="label">CRM actions prepared</div><div class="value">${state.actions.length}</div><div class="foot">Reviewable, auditable changes</div></div></div>
<div class="split"><div class="card pad">${cardHead('My calling session',tag('One person at a time','teal'))}<div class="toolbar"><div class="tabs">${['Recommended','Buyer calls','All people'].map(x=>`<button class="${ui.callSessionFilter===x?'active':''}" data-action="callFilter" data-id="${h(x)}">${x}</button>`).join('')}</div></div><p class="small muted" style="margin-bottom:14px">Tap <b>Call in DOMA</b>. GeeVee will display their history, suggest questions, and prepare a structured recap for approval afterward.</p>${list.map((p,i)=>`<div class="list-row">${avatar(p.name,i%4===2?'orange':'soft')}<div class="list-main"><strong>${h(p.name)}</strong> ${p.tags.includes('Hot seller')?tag('Potential seller','hot'):''}<div class="sub">${h(p.suburb)} · ${h(p.note)}<br><span style="color:#41808a">${h(p.source)} · ${p.callStatus==='not called'?'Not yet called':'Previously contacted'}</span></div></div><div class="action-side">${action('Call in DOMA','call',p.id,'primary sm')}${action('Open','openPerson',p.id,'sm')}</div></div>`).join('')}</div><div style="display:flex;flex-direction:column;gap:15px"><div class="card pad">${cardHead('What GeeVee handles after a call')}<div class="check-list">${[['calendar','Extract appointment suggestions'],['users','Prepare contact-detail changes'],['file','Prepare an appraisal pack request'],['messages','Draft seller follow-up'],['link','Link results to existing CRM records']].map(([i,t])=>`<div class="list-row">${ico(i)}<div class="list-main"><strong>${t}</strong></div>${tag('Review','outline')}</div>`).join('')}</div><div class="card pad">${cardHead('Recent call recaps')}${state.calls.length?state.calls.slice(0,6).map(c=>`<div class="list-row"><div class="number-circle">${ico('phone','sm')}</div><div class="list-main"><strong>${h(personName(c.contactId))}</strong><div class="sub">${h(c.summary.slice(0,75))} · ${h(c.when)}</div></div>${action('View','showCall',c.id,'sm')}</div>`).join(''):'<p class="small muted">No calls logged in this browser yet. Try a simulated call to see the next-step workflow.</p>'}</div><div class="card pad">${cardHead('Existing CRM tools')}${[['seller_opportunities','Seller opportunities'],['relisting','Re-listing opportunities'],['find_buyers','Find Buyers'],['voice_agents','Voice agents and scripts']].map(([key,label])=>`<button class="command-row" data-action="legacy" data-id="${key}">${ico('external','sm')}<span style="flex:1">${label}</span>${ico('chevron','sm')}</button>`).join('')}</div></div></div>`}
function deals(){const list=state.deals.filter(d=>(ui.filterDeals==='All'||d.stage===ui.filterDeals)&&(!ui.searchDeals||(d.address+' '+d.suburb+' '+personName(d.contactId)).toLowerCase().includes(ui.searchDeals.toLowerCase())));const counts=stats();return `${sectionHeader('My deals','Every appraisal, authority, listing and sale, connected to the same property records as your existing CRM.',action(`${ico('chart')} Money Map`,'showMoney','','')+action(`${ico('eye')} Existing pipeline`,'legacy','lead_pipeline',''))}
<div class="grid-4" style="margin-bottom:16px"><div class="stat highlight"><div class="label">Active gross commission estimate</div><div class="value">${abbrev(counts.potential)}</div><div class="foot">Across ${state.deals.filter(x=>x.active).length} active opportunities</div></div><div class="stat"><div class="label">Weighted scenario estimate</div><div class="value">${abbrev(counts.weighted)}</div><div class="foot">Illustrative stage weights · not a forecast</div></div><div class="stat"><div class="label">Stalled / at-risk deals</div><div class="value">${counts.risk}</div><div class="foot">${abbrev(counts.atRisk)} gross commission involved</div></div><div class="stat"><div class="label">Closed lost potential</div><div class="value">${abbrev(state.deals.filter(x=>x.stage==='Lost').reduce((a,d)=>a+comm(d),0))}</div><div class="foot">Historical opportunity estimates</div></div></div>
<div class="toolbar"><div class="tabs"><button class="${ui.viewDeals==='pipeline'?'active':''}" data-action="dealView" data-id="pipeline">Pipeline</button><button class="${ui.viewDeals==='list'?'active':''}" data-action="dealView" data-id="list">List</button></div><select class="field" id="deal-stage">${['All',...['New lead','Connected','Appraisal','Proposal','Authority','Listed','For sale','Sold','Lost']].map(x=>`<option ${ui.filterDeals===x?'selected':''}>${x}</option>`).join('')}</select>${field('deal-search','Search property, suburb or person',ui.searchDeals,'search')}</div>
${ui.viewDeals==='pipeline'?`<div class="pipeline-cols">${['New lead','Connected','Appraisal','Proposal','Authority','Listed','For sale','Sold','Lost'].filter(st=>ui.filterDeals==='All'||st===ui.filterDeals).map(st=>{const ds=list.filter(x=>x.stage===st);return `<div class="pipe-col"><div class="pipe-title"><span>${h(st)} <span class="muted">(${ds.length})</span></span><span>${abbrev(ds.reduce((a,d)=>a+comm(d),0))}</span></div>${ds.map(d=>`<div class="pipe-card" data-action="openDeal" data-id="${d.id}" role="button" tabindex="0"><h3>${h(d.address)}</h3><div class="sub">${h(d.suburb)} · ${h(personName(d.contactId))}</div><div class="money">${aud(comm(d))} <span class="tiny muted">potential GCI</span></div>${d.risk?tag('Needs attention','hot'):tag(d.next,'outline')}</div>`).join('')||'<p class="muted small" style="padding:8px">No properties</p>'}</div>`}).join('')}</div>`:`<div class="table-wrap"><table class="table"><thead><tr><th>Property</th><th>Contact</th><th>Stage</th><th>Price assumption</th><th>Fee</th><th>Potential GCI</th><th>Next step</th><th></th></tr></thead><tbody>${list.map(d=>`<tr><td><strong>${h(d.address)}</strong><div class="muted">${h(d.suburb)}</div></td><td>${h(personName(d.contactId))}</td><td>${stageTag(d.stage)}</td><td>${aud(d.guide)}</td><td>${d.fee}%</td><td><b>${aud(comm(d))}</b></td><td>${d.risk?tag(d.risk,'hot'):h(d.next)}</td><td>${action('Open','openDeal',d.id,'sm')}</td></tr>`).join('')}</tbody></table></div>`}
<div class="inline-help" style="margin-top:15px">${ico('link','sm')} A property, contact, lead, listing and activity use linked IDs. Changing a stage or adding an approved internal action appears across My deals, People, Today and activity history.</div>`}
function people(){const list=state.people.filter(p=>(ui.filterPeople==='All'||p.role===ui.filterPeople||ui.filterPeople==='Seller opportunities'&&['seller','both'].includes(p.role))&&(!ui.searchPeople||(p.name+' '+p.suburb+' '+p.phone+' '+p.email).toLowerCase().includes(ui.searchPeople.toLowerCase())));return `${sectionHeader('People','One place for sellers, buyers and their relationships, linked to the existing CRM contact records.',action(`${ico('eye')} Existing Contacts`,'legacy','contacts','')+action(`${ico('phone')} Call session`,'route','calls','primary'))}
<div class="grid-3" style="margin-bottom:17px"><div class="stat"><div class="label">Connected contacts</div><div class="value">${state.people.length}</div><div class="foot">Fictional demo records with V1 IDs</div></div><div class="stat"><div class="label">Seller relationships</div><div class="value">${state.people.filter(p=>p.role==='seller'||p.role==='both').length}</div><div class="foot">Ready for approved prospecting</div></div><div class="stat"><div class="label">Linked active property records</div><div class="value">${state.deals.filter(x=>x.active).length}</div><div class="foot">One source of truth in the proposed architecture</div></div></div>
<div class="toolbar"><div class="tabs">${[['All','All'],['Seller opportunities','Potential sellers'],['buyer','Buyers'],['both','Both']].map(([v,t])=>`<button class="${ui.filterPeople===v?'active':''}" data-action="peopleFilter" data-id="${v}">${t}</button>`).join('')}</div>${field('people-search','Search by name, suburb, phone or email',ui.searchPeople,'search')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Contact</th><th>Relationship</th><th>Recent context</th><th>Source</th><th>Record link</th><th></th></tr></thead><tbody>${list.map(p=>`<tr><td><div style="display:flex;align-items:center;gap:9px">${avatar(p.name,'soft')}<div><strong>${h(p.name)}</strong><div class="muted">${h(p.suburb)}</div></div></div></td><td>${tag(p.role==='both'?'Buyer & seller':p.role)}</td><td style="max-width:320px"><div class="clip">${h(p.note)}</div></td><td>${h(p.source)}</td><td><span class="tiny muted">${h(p.legacyId)} ↔ ${h(p.id)}</span></td><td style="white-space:nowrap">${action('Call','call',p.id,'primary sm')} ${action('Open','openPerson',p.id,'sm')}</td></tr>`).join('')}</tbody></table></div><div class="hint" style="margin-top:13px">Showing ${list.length} of ${state.people.length} example people. Real records and ownership will require migration and API validation.</div>`}
function messages(){const filtered=state.messages.filter(m=>(ui.filterMessages==='All'||ui.filterMessages==='Unread'&&m.unread||m.channel===ui.filterMessages)&&(!ui.searchMessages||(personName(m.contactId)+' '+m.last+' '+m.subject).toLowerCase().includes(ui.searchMessages.toLowerCase())));let m=state.messages.find(x=>x.id===ui.selectedMessage)||filtered[0];if(m&&!filtered.includes(m)&&filtered.length)m=filtered[0];if(m&&m.id!==ui.selectedMessage)ui.selectedMessage=m.id;const p=m?findP(m.contactId):null;const d=m?findD(m.dealId):null;return `${sectionHeader('Messages','Every SMS, email and portal enquiry, linked to the person and property it concerns.',action(`${ico('shield')} Review replies`,'openApprovals','','')+action(`${ico('eye')} Existing messenger`,'legacy','messages',''))}
<div class="alert info" style="margin-bottom:16px">${ico('messages')} ${state.messages.filter(x=>x.unread).length} unread fictional conversations across SMS, email and portal enquiries. GeeVee can prepare replies; in Phase 2 it cannot send real messages.</div>
<div class="card" style="overflow:hidden"><div style="padding:13px 15px;border-bottom:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap;align-items:center"><div class="tabs">${['All','Unread','SMS','Email','Portal enquiry'].map(x=>`<button class="${ui.filterMessages===x?'active':''}" data-action="messageFilter" data-id="${x}">${x==='Portal enquiry'?'Portal':x}${x==='Unread'?` (${state.messages.filter(m=>m.unread).length})`:''}</button>`).join('')}</div><div style="margin-left:auto;flex:1;max-width:315px">${field('message-search','Search names and messages',ui.searchMessages,'full')}</div></div>
<div class="inbox-layout"><div class="thread-list"><div style="padding:12px 15px;border-bottom:1px solid var(--line);font-size:11px;color:#73828b;font-weight:750">${filtered.length} CONVERSATIONS</div><div class="thread-scroll">${filtered.map(x=>`<div class="thread ${x.id===m?.id?'selected':''} ${x.unread?'unread':''}" data-action="selectMessage" data-id="${x.id}"><div class="circle">${h(initials(personName(x.contactId)))}</div><div class="thread-main"><div class="thread-top"><strong>${h(personName(x.contactId))}</strong><time>${h(x.time)}</time></div><div style="margin-top:5px">${tag(x.channel, x.channel==='Portal enquiry'?'blue':x.channel==='Email'?'purple':'teal')} ${x.triage==='Urgent'?tag('Urgent','hot'):''}</div><div class="thread-line">${h(x.subject)}</div><div class="thread-line">${h(x.last)}</div></div>${x.unread?'<span style="width:6px;height:6px;border-radius:50%;background:#0a96a2;margin-top:5px"></span>':''}</div>`).join('')||'<div class="pad muted small">No conversations match these filters.</div>'}</div></div><div class="thread-detail">${m?`<div class="thread-head"><div style="display:flex;gap:10px;align-items:center">${avatar(p?.name||'Contact','soft')}<div><strong>${h(p?.name||'Contact')}</strong><div class="small muted">${h(m.channel)} · ${h(d?.address||p?.suburb||'General enquiry')} · ${h(m.subject)}</div></div></div><div style="display:flex;gap:6px;flex-wrap:wrap">${action(`${ico('phone','sm')} Call`,'call',p?.id||'','sm')}${action('Person','openPerson',p?.id||'','sm')}${m.unread?action('Mark read','markRead',m.id,'sm'):''}</div></div><div class="thread-body"><div class="alert info" style="margin-bottom:17px">${ico('sparkles','sm')} <div><b>GeeVee summary:</b> ${h(m.last)}<br><span class="tiny">Suggested next step: ${m.channel==='Portal enquiry'?'Respond promptly, check buyer needs and consider a call.':m.triage==='Urgent'?'Contact the person as a priority.':'Prepare a considered response.'}</span></div></div>${m.thread.map(x=>`<div class="bubble ${x.from==='us'?'out':''}"><div>${h(x.text)}</div><div class="meta">${x.from==='us'?'Agency':h(p?.name||'Contact')} · ${h(x.when)}</div></div>`).join('')}</div><div class="thread-compose"><label class="form-label" for="reply-text">Reply to ${h(p?.name||'contact')} <span class="muted">· Draft for approval</span></label><textarea class="field textarea full" id="reply-text" placeholder="Type a reply, or choose GeeVee draft…">${h(ui.aiReply||'')}</textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px;align-items:center">${action(`${ico('sparkles','sm')} GeeVee draft`,'draftReply',m.id,'')}${action('Queue for review','queueReply',m.id,'primary')}<span class="hint">No message is sent from this demo.</span></div></div>`:`<div class="pad">Select a conversation to view its history.</div>`}</div></div></div>`}
const toolGroups=[
{group:'Revenue & prospecting',items:[['seller_opportunities','Seller opportunities','Spot property owners worth calling'],['relisting','Re-listing opportunities','Withdrawn and expired listings'],['find_buyers','Find Buyers','Buyer demand and matching'],['cma','Sales CMA','Comparable sales and appraisal evidence'],['market_updates','Market updates','Vendor market communications']]},
{group:'Listings & transactions',items:[['on_market','On-market pipeline','Current for-sale records'],['off_market','Off-market pipeline','Off-market and upcoming listings'],['property_compliance','Property compliance','Authority, PPS, Section 32 and due diligence'],['campaign_manager','Campaign manager','Marketing plans and suppliers'],['esign','eSign','Authority and document signing'],['open_homes','Inspections','Attendance and buyer follow-up']]},
{group:'Communications & administration',items:[['messages','Communications hub','Campaigns, messages and templates'],['campaigns','Bulk communications','Audiences and sending controls'],['voice','AI Call Center','Existing voice campaign controls'],['voice_agents','Voice agent scripts','Configured AI call agents'],['access','Agent access','Permissions, assistants and ownership'],['property_id','Property identity review','Resolve duplicate property identities'],['commissions','Commission records','GCI and commission operations'],['analytics','Analytics','Reports and performance']]}
];
function toolsList(){return toolGroups.map(g=>`<div class="card pad"><h2 style="margin-bottom:12px">${h(g.group)}</h2><div class="grid-2">${g.items.map(([key,name,desc])=>`<div class="list-row"><div class="number-circle">${ico(key==='cma'?'chart':key==='esign'?'file':key==='access'?'shield':'grid','sm')}</div><div class="list-main"><strong>${h(name)}</strong><div class="sub">${h(desc)}</div></div>${action('View','legacy',key,'sm')}</div>`).join('')}</div></div>`).join('')}
function migrationView(){const row=(label,desc,st)=>`<div class="list-row"><div class="number-circle">${ico('link','sm')}</div><div class="list-main"><strong>${label}</strong><div class="sub">${desc}</div></div>${tag(st,st==='Mapped'?'green':'yellow')}</div>`;return `<div class="alert warn" style="margin-bottom:16px">${ico('alert')} <div><b>This is a Phase 2 design demonstration, not an actual migration.</b> The source export contains static screenshots, not production API schemas or database tables. IDs, sync health and audit events in this prototype are illustrative.</div></div><div class="grid-3" style="margin-bottom:15px"><div class="stat"><div class="label">Sample contacts</div><div class="value">${state.people.length}</div><div class="foot">With example V1 ↔ V2 IDs</div></div><div class="stat"><div class="label">Sample property opportunities</div><div class="value">${state.deals.length}</div><div class="foot">One linked record per example</div></div><div class="stat"><div class="label">Unified action requests</div><div class="value">${state.actions.length}</div><div class="foot">With permission tiers and states</div></div></div><div class="grid-2"><div class="card pad">${cardHead('Shared record contract')}${row('Contacts and people','Existing CRM contact ID ↔ canonical V2 contact ID','Mapped')}${row('Properties and opportunities','Property record ↔ appraisal, lead and listing','Mapped')}${row('Activity and communication','One timeline for calls, email, SMS, portal and notes','Mapped')}${row('Approvals and permissions','Draft → awaiting review → approved/blocked','Mapped')}${row('Provider acknowledgements','Future telephony, eSign, portal and send integrations','Later phase')}</div><div class="card pad">${cardHead('Migration safety rules')}<ul class="bullet small"><li>Existing CRM remains authoritative until a field or workflow is formally cut over.</li><li>Use stable IDs; never silently duplicate contacts or property records.</li><li>Store one immutable event for each proposed and executed operation.</li><li>Every approval references the exact action version.</li><li>External sends and signing remain disabled here; the UI cannot claim provider confirmation.</li><li>Use feature flags, reconciliation tests and rollback for every live release.</li></ul><div class="sep"></div>${action('See original CRM dashboard','legacy','dashboard','sm')}${action('Reset demo changes','resetDemo','','sm warn')}</div></div>`}
function auditView(){return `<div class="card pad">${cardHead('Shared activity history',tag(`${state.activity.length} events`,'teal'))}<p class="small muted" style="margin-bottom:12px">This demonstration shows how actions initiated from Today, calls, contacts and messages would create a common audit trail in the completed backend.</p>${state.activity.slice(0,35).map(a=>`<div class="activity"><div class="activity-dot"></div><div><strong>${h(a.title)}</strong><p>${h(a.details)}</p><div class="tiny muted" style="margin-top:4px">${h(a.when)} · ${h(a.type)}</div></div></div>`).join('')}</div>`}
function policyView(){return `<div class="grid-2"><div class="card pad">${cardHead('GeeVee hybrid permissions')}<div class="list-row"><div class="list-main"><strong>A0 · Internal preparation</strong><div class="sub">Summaries, recommended calls, internal tasks and draft material.</div></div>${tag('Automatic','green')}</div><div class="list-row"><div class="list-main"><strong>A1 · Pre-authorised routine</strong><div class="sub">Strictly defined workflows subject to consent, time and identity controls.</div></div>${tag('Policy gated','teal')}</div><div class="list-row"><div class="list-main"><strong>A2 · Agent approval</strong><div class="sub">Individual outbound replies and non-routine CRM changes.</div></div>${tag('Review required','yellow')}</div><div class="list-row"><div class="list-main"><strong>A3 · Protected action</strong><div class="sub">Authorities, fee terms, vendor price advice, portal publishing.</div></div>${tag('One at a time','red')}</div><div class="alert warn" style="margin-top:17px">${ico('lock')} External automations are disabled in this prototype. These settings do not affect your live CRM.</div></div><div class="card pad">${cardHead('Agent experience safeguards')}<ul class="bullet small"><li>Today first, with four everyday destinations. Advanced functions stay in More tools.</li><li>Always show a plain-language next action, not just a technical status.</li><li>Large, predictable Call and Review buttons.</li><li>Require explicit recording permissions and provide a non-recorded fallback.</li><li>Show what GeeVee knows, what is uncertain, and what it wants to change.</li><li>Support manual work if an integration is unavailable.</li><li>No sensitive or irreversible action without an authorised human.</li></ul><div class="sep"></div>${action('Review pending approvals','openApprovals','','primary')}</div></div>`}
function more(){const tabs=[['workspaces','Existing tools'],['legacy','Current CRM screens'],['migration','Phase 2 architecture'],['audit','Activity log'],['policies','Permissions']];return `${sectionHeader('More tools','The advanced capabilities from the current CRM stay here. Everyday agent work stays in the four simple sections.',action(`${ico('eye')} Original dashboard`,'legacy','dashboard',''))}<div class="toolbar"><div class="tabs">${tabs.map(([k,lab])=>`<button class="${ui.moreTab===k?'active':''}" data-action="moreTab" data-id="${k}">${lab}</button>`).join('')}</div></div>${ui.moreTab==='workspaces'?`<div class="alert info" style="margin-bottom:15px">${ico('grid')} These are the actual capabilities identified in your current CRM screen export. Open a read-only original screen to compare the future workflow with today's tool.</div><div style="display:flex;flex-direction:column;gap:15px">${toolsList()}</div>`:ui.moreTab==='migration'?migrationView():ui.moreTab==='audit'?auditView():ui.moreTab==='policies'?policyView():legacyView()}`}
function legacyView(){const keys=Object.keys(LEGACY).filter(k=>{const l=LEGACY[k];return !ui.legacySearch||(k+' '+l.title+' '+l.file).toLowerCase().includes(ui.legacySearch.toLowerCase())});return `<div class="alert warn" style="margin-bottom:14px">${ico('eye')} <div><b>Actual current CRM screen previews.</b> These are screenshots of original, read-only HTML exports from 13 November 2026 with scripts removed in the supplied source. They are not connected to the interactive V2 demo, and no original button or form is live.</div></div><div class="legacy-layout"><div><div style="margin-bottom:9px">${field('legacy-search','Find existing CRM screen',ui.legacySearch,'full')}</div><div class="legacy-list">${keys.map(key=>`<button class="${ui.legacyKey===key?'selected':''}" data-action="chooseLegacy" data-id="${key}">${h(LEGACY[key].name)}</button>`).join('')}</div></div><div><div class="card" style="padding:11px 14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px"><div><strong>${h(LEGACY[ui.legacyKey]?.title||'Existing CRM')}</strong><div class="legacy-note">Source: ${h(LEGACY[ui.legacyKey]?.file||'')} · Actual supplied screen export</div></div>${tag('Read-only snapshot','outline')}</div><div class="legacy-iframe" style="overflow:auto;height:690px"><img id="legacy-image" src="data:image/jpeg;base64,${LEGACY[ui.legacyKey]?.image||''}" alt="Current CRM ${h(LEGACY[ui.legacyKey]?.name||'screen')} screenshot" style="display:block;width:100%;height:auto;min-height:250px;object-fit:contain"></div><div class="legacy-note" style="margin-top:8px">Preview captured directly from the supplied static screen. In production the engineering team will wire this destination to the existing CRM route. For full historical screen structure, use the supplied CRM screens export.</div></div></div>`}
async function loadLegacy(){const frame=document.getElementById('legacy-frame');if(!frame)return;const item=LEGACY[ui.legacyKey];if(!item)return;frame.srcdoc=`<html><body style="font:14px sans-serif;padding:30px;color:#64757b">Loading original CRM screen…<\/body><\/html>`;try{if(!('DecompressionStream' in window))throw Error('Your browser does not support embedded gzip previews. Use Chrome or Edge to open the source snapshots.');const bytes=Uint8Array.from(atob(item.data),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));const html=await new Response(stream).text();if(ui.legacyKey!==item.file.replace(/.html$/,'')&&LEGACY[ui.legacyKey]!==item)return;frame.srcdoc=html;frame.onload=()=>{try{const doc=frame.contentDocument;doc?.addEventListener('click',ev=>{const el=ev.target.closest('a,button');if(el){ev.preventDefault();toast('Original CRM snapshot is read-only. Use the V2 controls or select another existing screen.')}},true)}catch(e){}}}catch(e){frame.srcdoc=`<div style="font:14px sans-serif;padding:30px;color:#6a7880"><h3>Original screen preview unavailable</h3><p>${h(e.message)}</p></div>`}}
function modal(){const m=ui.modal;let title='',body='',foot='',wide='';switch(m.type){
case 'call':title='Call in DOMA · '+personName(m.contactId);body=callModal(m);wide='call';break;
case 'approval':{const a=state.actions.find(x=>x.id===m.id);title='Review GeeVee action';body=approvalModal(a);break}
case 'approvals':title='Approvals · prepared by GeeVee';body=approvalsModal();wide='large';break;
case 'person':title=personName(m.id);body=personModal(findP(m.id));wide='large';break;
case 'deal':{const d=findD(m.id);title=d?d.address+', '+d.suburb:'Property';body=dealModal(d);wide='large';break}
case 'focus':title='Start my day';body=focusModal();wide='call';break;
case 'money':title='GeeVee Money Map';body=moneyModal();wide='large';break;
case 'callDetail':title='Call recap';body=callDetailModal(state.calls.find(x=>x.id===m.id));break;
case 'task':title='Task details';body=taskModal(findT(m.id));break;
case 'search':title='Search DOMA';body=searchModal();wide='large';break;
case 'answer':title='GeeVee · Demo assistant';body=answerModal(m.query);break;
case 'reset':title='Reset example data?';body='<p>This will restore all fictional contacts, tasks, calls, messages and approvals to their starting state in this browser.</p><div class="alert warn" style="margin-top:14px">This does not affect your real CRM.</div>';foot=action('Cancel','close','','')+action('Reset demo','confirmReset','','warn');break;
default:title='GeeVee';body='<p>Nothing to show.</p>'}
return `<div class="overlay" id="overlay"><div class="dialog ${wide}" role="dialog" aria-modal="true" aria-label="${h(title)}"><div class="dialog-head"><div><div class="eyebrow" style="margin-bottom:5px">DOMA CRM · Phase 2 example</div><h2>${h(title)}</h2></div><button class="close" data-action="close" aria-label="Close dialog">${ico('close')}</button></div><div class="dialog-content">${body}</div>${foot?`<div class="dialog-foot">${foot}</div>`:''}</div></div>`}
function callModal(m){const p=findP(m.contactId);if(!p)return '<p>Contact not found.</p>';const related=state.deals.filter(d=>d.contactId===p.id);let top=`<div class="call-hero">${avatar(p.name)}<div style="flex:1"><h2>${h(p.name)}</h2><div class="muted">${h(p.suburb)} · ${h(p.phone)} · ${h(p.source)}</div><div style="display:flex;gap:7px;margin-top:9px;flex-wrap:wrap">${tag('Linked to existing CRM')}${tag('Demo call · no audio captured')}${p.consent==='optout'?tag('Do not market','hot'):''}</div></div>${ico('phone','lg')}</div>`;
if(m.phase==='ready')return `${top}<div class="call-layout"><div class="card pad">${cardHead('Before you call')}<div class="call-screen-note" style="margin-bottom:12px"><b>Why GeeVee recommended this call:</b><br>${h(p.note)}</div><h3 style="margin-bottom:9px">Talking points</h3><ul class="bullet small"><li>Confirm how they are going and why they are considering moving.</li><li>Ask if there is a property they may want to sell.</li><li>Explore their timing; offer an appraisal where appropriate.</li><li>Confirm the best next step and preferred contact method.</li></ul><div class="sep"></div><div class="small muted">Relevant properties: ${related.length?related.map(d=>`${h(d.address)} (${h(d.stage)})`).join(', '):'No property linked yet'}</div></div><div class="card pad">${cardHead('Call controls & consent')}<div class="alert warn">${ico('alert')} <div><b>This is a visual simulation.</b> The current HTML cannot dial, record, listen or transcribe. Phase 2 establishes the shared workflow; the real telephony integration comes later.</div></div><label style="display:flex;gap:9px;align-items:flex-start;margin:17px 0;font-size:12px"><input id="call-consent" type="checkbox" style="accent-color:var(--teal);width:17px;height:17px;margin-top:2px"><span>I have checked the applicable recording and consent requirements. <b>Checking this does not enable real recording.</b></span></label><p class="hint">In production, if recording is not lawfully permitted, the agent must be able to continue with a non-recorded call and enter a manual summary.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px">${action(`${ico('play','sm')} Start simulated call`,'startCall',p.id,'primary big')}${action('Cancel','close','','')}</div></div></div>`;
if(m.phase==='active')return `${top}<div class="call-layout"><div class="card pad"><div class="caps" style="color:#07868d">SIMULATED CALL IN PROGRESS</div><div style="display:flex;gap:11px;align-items:center;margin:15px 0">${ico('mic','lg')}<div class="call-wave">${Array.from({length:27},(_,i)=>`<span style="--i:${i};height:${12+(i*7)%18}px"></span>`).join('')}</div></div><div class="alert info"><b>Audio recording: OFF.</b> Live listening, transcription and event extraction are not available in this standalone file.</div><div class="sep"></div><div class="small muted">You can enter a recap to demonstrate exactly how GeeVee will create proposed appointments, updates and tasks from a real call transcript later.</div>${action('Insert example conversation recap','exampleCallNote',p.id,'sm block')}</div><div class="card pad">${cardHead('Conversation recap')}<label class="form-label" for="call-notes">What did the client say?</label><textarea id="call-notes" class="field textarea full" style="min-height:160px" placeholder="For example: Daniel wants an appraisal Thursday at 11am, says his partner Rachel is also an owner, and would like an SMS confirmation.">${h(m.notes||'')}</textarea><div class="hint" style="margin-top:8px">The recap remains in this demo only until saved. No audio is collected.</div><div style="margin-top:16px;display:flex;gap:7px;flex-wrap:wrap">${action(`${ico('check','sm')} Finish & review GeeVee's work`,'finishCall',p.id,'primary big')}${action('Cancel','close','','')}</div></div></div>`;
if(m.phase==='review'){const suggestions=callSuggestions(m.notes);return `${top}<div class="alert ok" style="margin:15px 0">${ico('check')} <div><b>Call recap prepared.</b> GeeVee has identified possible actions. Review the details before they affect the demo CRM.</div></div><div class="card pad"><h3 style="margin-bottom:9px">What was understood</h3><p class="small" style="white-space:pre-wrap">${h(m.notes||'(No notes)')}</p><div class="sep"></div><h3 style="margin-bottom:10px">Proposed next steps</h3><div class="check-list"><label><input id="call-save-note" type="checkbox" checked><span><b>Save call recap to ${h(p.name)}</b><br><span class="muted">Internal record update · A0</span></span></label><label><input id="call-add-task" type="checkbox" checked><span><b>${suggestions.follow}</b><br><span class="muted">Internal task · A0</span></span></label>${suggestions.appraisal?`<label><input id="call-suggest-appraisal" type="checkbox" checked><span><b>Prepare appointment request</b><br><span class="muted">${h(suggestions.apptText)} · Requires confirmation · A2</span></span></label>`:''}${suggestions.extra?`<label><input id="call-verify-contact" type="checkbox" checked><span><b>Verify contact/owner details</b><br><span class="muted">${h(suggestions.extra)} · Don't overwrite unverified data</span></span></label>`:''}<label><input id="call-draft-followup" type="checkbox" checked><span><b>Prepare a follow-up draft</b><br><span class="muted">The agent reviews before any external communication · A2</span></span></label></div></div><div class="dialog-foot" style="padding-left:0;padding-right:0">${action('Back to recap','backToCall','','')}${action(`${ico('check','sm')} Apply selected demo updates`,'saveCall',p.id,'primary big')}</div>`}
return top}
function callSuggestions(note){const low=(note||'').toLowerCase();return{appraisal:/appraisal|valuation|value my|price opinion|market appraisal/i.test(low),apptText:/thursday/i.test(low)?'Thursday mentioned; exact date/time must be confirmed':/wednesday/i.test(low)?'Wednesday mentioned; exact date/time must be confirmed':'Date/time missing; require confirmation',extra:/partner|wife|husband|co.owner|phone number|email address/i.test(low)?'Possible additional owner or updated contact data mentioned; human verification required':'',follow:/call back|tomorrow|next week/i.test(low)?'Create a callback task':'Create a post-call follow-up task'}}
function approvalsModal(){const pending=state.actions.filter(a=>a.status==='Awaiting review');const handled=state.actions.filter(a=>a.status!=='Awaiting review').slice(0,8);return `<div class="alert info" style="margin-bottom:16px">${ico('shield')} ${pending.length} actions need your decision. The same action appears wherever GeeVee prepared it: Today, Messages, a contact or a deal. No provider sends happen in this demo.</div><div class="grid-3" style="margin-bottom:14px"><div class="stat"><div class="label">Waiting</div><div class="value">${pending.length}</div></div><div class="stat"><div class="label">Protected</div><div class="value">${pending.filter(a=>a.tier==='A3').length}</div></div><div class="stat"><div class="label">Reviewed in demo</div><div class="value">${state.actions.filter(a=>a.status==='Reviewed · not sent').length}</div></div></div>${pending.map(a=>`<div class="card pad" style="margin-bottom:10px;box-shadow:none"><div class="card-head"><div><div style="display:flex;gap:5px;align-items:center;margin-bottom:7px">${tierTag(a.tier)} ${tag(a.type,'outline')}</div><h3>${h(a.title)}</h3><div class="small muted">${h(personName(a.contactId))} · ${h(findD(a.dealId)?.address||'Contact record')}</div></div>${action('Review','openApproval',a.id,'primary')}</div><div class="small" style="background:#f6f9fa;padding:12px;border-radius:9px">${h(a.body)}</div></div>`).join('')||'<div class="alert ok">All action requests have been handled in this demo.</div>'}${handled.length?`<h3 style="margin:22px 0 10px">Recently reviewed</h3>${handled.map(a=>`<div class="list-row"><div class="list-main"><strong>${h(a.title)}</strong><div class="sub">${h(a.status)} · ${h(a.type)}</div></div>${action('View','openApproval',a.id,'sm')}</div>`).join('')}`:''}`}
function approvalModal(a){if(!a)return '<p>Action not found.</p>';const p=findP(a.contactId),d=findD(a.dealId);const waiting=a.status==='Awaiting review';return `<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:13px">${tierTag(a.tier)}${tag(a.status,a.status==='Awaiting review'?'yellow':'green')}${tag(a.type,'outline')}</div><div class="card pad" style="box-shadow:none"><h2 style="font-size:19px;margin-bottom:7px">${h(a.title)}</h2><div class="small muted">${h(p?.name||'Contact')} ${d?'· '+h(d.address+', '+d.suburb):''}</div><div class="sep"></div><label class="form-label" for="approval-body">${a.type==='SMS'||a.type==='Email'?'Proposed message':'Proposed action details'}</label><textarea id="approval-body" class="field textarea full" style="min-height:130px" ${waiting?'':'disabled'}>${h(a.body)}</textarea><div class="hint" style="margin-top:8px">Source: ${h(a.source)} · Action ID ${h(a.id)} · ${a.tier==='A3'?'Protected; approve individually.':'Agent review required.'}</div></div><div class="alert warn" style="margin-top:15px">${ico('lock')} Approving here marks the action as reviewed in this <b>offline prototype only</b>. It will not deliver an SMS/email, send a signing pack or publish a listing.</div><div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:17px">${waiting?action('Reject suggestion','rejectApproval',a.id,'warn')+action(`${ico('check','sm')} Approve demo action`,'approveAction',a.id,'primary big'):action('Close','close','','')}</div>`}
function personModal(p){if(!p)return'<p>Contact missing.</p>';const ds=state.deals.filter(d=>d.contactId===p.id),ms=state.messages.filter(x=>x.contactId===p.id),calls=state.calls.filter(c=>c.contactId===p.id);return `<div class="grid-2" style="align-items:start"><div class="card pad" style="box-shadow:none"><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">${avatar(p.name,'soft')}<div><h2>${h(p.name)}</h2><div class="small muted">${h(p.role)} · ${h(p.suburb)} · ${h(p.source)}</div></div></div><div class="detail-metrics"><div><b>${ds.length}</b><span>Properties</span></div><div><b>${ms.length}</b><span>Conversations</span></div><div><b>${calls.length}</b><span>Call recaps</span></div></div><div class="sep"></div>${[['Phone',p.phone],['Email',p.email],['Last contact',p.lastContact],['Assigned agent',p.owner],['Current CRM ID',p.legacyId],['DOMA ID',p.id]].map(([k,v])=>`<div class="list-row" style="padding:9px 0"><span class="muted small" style="width:105px">${h(k)}</span><b class="small">${h(v)}</b></div>`).join('')}<div class="alert ${p.consent==='optout'?'danger':'ok'}" style="margin-top:14px">${ico('shield')} ${p.consent==='optout'?'Marketing opt-out: do not initiate prohibited contact.':'Contact permissions must be checked before automated outreach.'}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:13px">${action(`${ico('phone','sm')} Call in DOMA`,'call',p.id,'primary')}${action('See conversations','personMessages',p.id,'')}${action('Current contact screen','legacy','contact_profile','')}</div></div><div><div class="card pad" style="margin-bottom:12px;box-shadow:none">${cardHead('GeeVee contact brief')}<div class="call-screen-note">${h(p.note)}</div><div class="small muted" style="margin-top:10px">This is a demo recommendation using example data, not verified seller intent.</div></div><div class="card pad" style="box-shadow:none">${cardHead('Linked property records')}${ds.length?ds.map(d=>`<div class="list-row"><div class="list-main"><strong>${h(d.address)}</strong><div class="sub">${h(d.suburb)} · ${h(d.stage)} · ${aud(comm(d))} potential gross commission</div></div>${action('Open','openDeal',d.id,'sm')}</div>`).join(''):'<p class="small muted">No property record is currently linked. Use the current CRM identity tools to verify relationships.</p>'}</div></div></div>`}
function dealModal(d){if(!d)return '<p>Property missing.</p>';const p=findP(d.contactId);const missing=Object.entries(d.compliance).filter(([k,v])=>!v);const isLive=d.stage==='For sale'||d.stage==='Sold';return `<div class="grid-2" style="align-items:start"><div><div class="card pad" style="box-shadow:none">${cardHead('Property & owner',stageTag(d.stage))}<div style="font-size:18px;font-weight:800;margin-bottom:4px">${h(d.address+', '+d.suburb)}</div><div class="small muted">${h(p?.name||'Contact')} · ${h(d.source)} · ${h(d.owner)}</div><div class="detail-metrics" style="margin-top:15px"><div><b>${aud(d.guide)}</b><span>Price assumption</span></div><div><b>${d.fee}%</b><span>Proposed fee</span></div><div><b>${aud(comm(d))}</b><span>Potential gross GCI</span></div></div><div class="sep"></div><div class="list-row"><div class="list-main"><strong>GeeVee's next suggestion</strong><div class="sub">${h(d.why)} · ${h(d.next)}</div></div></div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px">${action(`${ico('phone','sm')} Call person`,'call',p?.id||'','primary')}${action('Open contact','openPerson',p?.id||'','')}${action('Current property screen','legacy','properties','')}</div></div><div class="card pad" style="margin-top:14px;box-shadow:none">${cardHead('Update opportunity stage')}<p class="small muted" style="margin-bottom:10px">A human confirms significant changes. Publishing requires all compliance gates.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><select class="field" id="stage-select">${['New lead','Connected','Appraisal','Proposal','Authority','Listed','For sale','Sold','Lost'].map(x=>`<option ${x===d.stage?'selected':''}>${x}</option>`).join('')}</select>${action('Apply demo stage','updateStage',d.id,'')}</div><div class="hint" style="margin-top:8px">The source CRM is unchanged. This updates only shared demo state.</div></div><div class="card pad" style="margin-top:14px;box-shadow:none">${cardHead('AI-prepared next steps')}<div style="display:flex;gap:7px;flex-wrap:wrap">${action('Prepare appraisal pack','preparePack',d.id,'')}${action('Draft seller follow-up','draftSeller',d.id,'')}${action('Prepare authority review','prepareAuthority',d.id,'')}${action('Buyer matches','buyerMatches',d.id,'')}</div></div></div><div><div class="card pad" style="box-shadow:none">${cardHead('Listing compliance',missing.length?tag(`${missing.length} missing`,'hot'):tag('Sample gates met','green'))}<p class="small muted" style="margin-bottom:13px">Based on the actual categories shown in your current CRM compliance screen. Formal rules and jurisdiction-specific validation still need engineering and legal review.</p>${Object.entries(d.compliance).map(([key,ok])=>`<div class="list-row"><div class="number-circle" style="background:${ok?'#e8f6ef':'#fff1e6'};color:${ok?'#1a8660':'#ba6a1f'}">${ico(ok?'check':'alert','sm')}</div><div class="list-main"><strong>${h(key)}</strong><div class="sub">${ok?'Recorded complete in sample':'Required document missing in example'}</div></div></div>`).join('')}<div style="margin-top:13px">${action('Open existing compliance screen','legacy','property_compliance','sm block')}</div></div><div class="card pad" style="margin-top:14px;box-shadow:none">${cardHead('Record and activity links')}<div class="list-row"><div class="list-main"><strong>Existing property ID</strong><div class="sub">${h(d.legacyId)}</div></div>${ico('link','sm')}</div><div class="list-row"><div class="list-main"><strong>DOMA property ID</strong><div class="sub">${h(d.propertyId)}</div></div>${ico('link','sm')}</div><div class="list-row"><div class="list-main"><strong>Contact relationship</strong><div class="sub">${h(p?.legacyId||'')} ↔ ${h(p?.id||'')}</div></div>${ico('link','sm')}</div><div class="list-row"><div class="list-main"><strong>Buyer matches (illustrative)</strong><div class="sub">${d.buyerMatches} possible candidates to review</div></div>${action('See','buyerMatches',d.id,'sm')}</div></div></div></div>`}
function focusModal(){const open=todaysList(30);if(!open.length)return'<div class="alert ok">Great work, no open tasks in the demo.</div>';ui.focusIndex=Math.min(ui.focusIndex,open.length-1);const t=open[ui.focusIndex];const p=findP(t.contactId);const d=findD(t.dealId);return `<div class="alert info">${ico('sparkles')} <div><b>One thing at a time.</b> GeeVee guides the day; you only need to act on the current item.</div></div><div style="padding:18px 0 8px"><div class="small muted">Step ${ui.focusIndex+1} of ${open.length} open tasks</div><div class="progress" style="margin-top:7px"><span style="width:${Math.round((ui.focusIndex+1)/open.length*100)}%"></span></div></div><div class="card pad" style="margin-top:12px;box-shadow:none"><div style="display:flex;gap:6px;margin-bottom:10px">${tag(t.priority,t.priority==='Urgent'?'hot':'teal')}${tag(t.due,'outline')}</div><h2 style="font-size:24px;margin-bottom:8px">${h(t.title)}</h2><p class="muted" style="margin-bottom:14px">${h(p?.name||'Contact')} ${d?'· '+h(d.address+', '+d.suburb):''}</p><div class="call-screen-note">${h(p?.note||'GeeVee has prepared this task from the linked CRM record.')}</div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:16px">${t.category==='Call'?action(`${ico('phone','sm')} Call now`,'call',p?.id||'','primary big'):action('Open task','openTask',t.id,'primary big')}${action('Mark complete','taskDone',t.id,'')}${action('Next task','focusNext','','')}</div></div>`}
function moneyModal(){const stages=['New lead','Connected','Appraisal','Proposal','Authority','Listed','For sale','Sold','Lost'];const rows=stages.map(st=>{const ds=state.deals.filter(d=>d.stage===st);return{st,n:ds.length,gross:ds.reduce((a,d)=>a+comm(d),0),weight:ds.reduce((a,d)=>a+comm(d)*(stageP[st]||0),0)}});const max=Math.max(...rows.map(r=>r.gross),1);return `<div class="alert info" style="margin-bottom:14px">${ico('chart')} Estimated gross commission grouped by <b>distinct property opportunities</b>. Values are not revenue earned or a statistically validated forecast.</div><div class="grid-3" style="margin-bottom:16px"><div class="stat highlight"><div class="label">Active potential</div><div class="value">${abbrev(stats().potential)}</div></div><div class="stat"><div class="label">Illustrative weighted</div><div class="value">${abbrev(stats().weighted)}</div></div><div class="stat"><div class="label">Lost opportunity estimate</div><div class="value">${abbrev(rows.find(x=>x.st==='Lost').gross)}</div></div></div><div class="card pad">${rows.map(r=>`<div class="money-row" style="grid-template-columns:145px 1fr 90px 100px"><div><b style="font-size:12px">${h(r.st)}</b><div class="tiny muted">${r.n} properties</div></div><div class="progress"><span style="width:${Math.round(r.gross/max*100)}%"></span></div><div class="value">${abbrev(r.gross)}</div><div class="tiny muted" style="text-align:right">Weighted ${abbrev(r.weight)}</div></div>`).join('')}<div class="hint">Stage weighting is a demonstration assumption. Do not use these figures for payroll, financial reporting or commercial decisions.</div></div>`}
function callDetailModal(c){if(!c)return'<p>Call recap unavailable.</p>';return `<div class="card pad"><div class="small muted">${h(c.when)} · ${h(personName(c.contactId))}</div><h3 style="margin:9px 0">${h(c.outcome)}</h3><div class="call-screen-note" style="white-space:pre-wrap">${h(c.summary)}</div><div class="sep"></div>${tag('Manual recap','teal')} ${tag('No audio recorded','outline')}</div>`}
function taskModal(t){if(!t)return'<p>Task not found.</p>';return `<h2>${h(t.title)}</h2><p style="margin:10px 0">${h(personName(t.contactId))} · ${h(t.due)} · ${h(t.priority)}</p><div class="alert info">${ico('link')} Created from ${h(t.origin)}, linked to the example CRM records.</div><div style="display:flex;gap:8px;margin-top:17px">${action('Mark complete','taskDone',t.id,'primary')}${action('Open contact','openPerson',t.contactId,'')}</div>`}
function searchModal(){const q=ui.searchGlobal.toLowerCase().trim();const ps=q?state.people.filter(p=>(p.name+' '+p.suburb+' '+p.phone).toLowerCase().includes(q)).slice(0,7):state.people.slice(0,4);const ds=q?state.deals.filter(d=>(d.address+' '+d.suburb+' '+personName(d.contactId)).toLowerCase().includes(q)).slice(0,6):state.deals.slice(0,3);return `<div class="card pad" style="box-shadow:none"><label class="form-label">Search people, properties or tasks</label>${field('modal-search','Name, address, suburb, task...',ui.searchGlobal,'full')}<div class="hint" style="margin-top:7px">Search never changes data. Open a result to take action.</div></div><h3 style="margin:17px 0 8px">People</h3>${ps.map(p=>`<button class="command-row" data-action="openPerson" data-id="${p.id}">${ico('users')}<span style="flex:1"><strong>${h(p.name)}</strong><br><span class="muted">${h(p.suburb)} · ${h(p.role)}</span></span>${ico('chevron','sm')}</button>`).join('')||'<p class="muted small">No people found.</p>'}<h3 style="margin:17px 0 8px">Properties</h3>${ds.map(d=>`<button class="command-row" data-action="openDeal" data-id="${d.id}">${ico('building')}<span style="flex:1"><strong>${h(d.address)}</strong><br><span class="muted">${h(d.suburb)} · ${h(d.stage)}</span></span>${ico('chevron','sm')}</button>`).join('')||'<p class="muted small">No properties found.</p>'}`}
function answerModal(query){const q=(query||'').toLowerCase();let msg='I can help you prepare your day, find seller leads, open conversations or review listing tasks. In this Phase 2 prototype my commands are rule-based, not a live AI agent.',buttons=action('Go to Today','route','today','');if(/sell|lead|prospect|appraisal/.test(q)){msg='Here are your linked seller opportunities. I recommend starting with the uncontacted appraisal requests, then reviewing past appraisals and stalled proposals.';buttons=action('Open calling session','route','calls','primary')+action('My deals','route','deals','')}else if(/message|email|sms|inquiry|enquir/.test(q)){msg='Your unified inbox is ready. I can prepare drafts for your review and link each conversation to its CRM contact and property.';buttons=action('Open Messages','route','messages','primary')}else if(/day|organis|plan/.test(q)){msg='I have sorted your open tasks by urgency. Start My Day will guide you one task at a time.';buttons=action('Start my day','startDay','','primary')}else if(/money|commission|revenue/.test(q)){msg='The Money Map shows potential gross commission, stage-weighted scenarios and commission at risk. These are illustrative estimates.';buttons=action('Open Money Map','showMoney','','primary')}return `<div class="call-hero" style="margin-bottom:16px"><div class="avatar" style="background:#daf2f4;color:#087984">GV</div><div><h2 style="font-size:19px">GeeVee</h2><p class="muted small">Rule-based demonstration</p></div></div><p class="small">${h(msg)}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px">${buttons}</div>`}
function approveAction(id){const a=state.actions.find(x=>x.id===id);if(!a||a.status!=='Awaiting review')return;const input=document.getElementById('approval-body');if(input?.value.trim())a.body=input.value.trim();a.status='Reviewed · not sent';a.approvedBy='Caleb Richards · demo';audit('approval','Agent reviewed '+a.title,'Action '+a.id+' approved in offline demo. No external provider was called.');persist();openModal({type:'approvals'});toast('Reviewed in demo. No SMS, email, signing request or listing was sent.')}
function rejectAction(id){const a=state.actions.find(x=>x.id===id);if(!a)return;a.status='Rejected';audit('approval','Agent rejected '+a.title,'Nothing was sent or applied.');persist();openModal({type:'approvals'});toast('Suggestion rejected; no external action occurred.')}
function addAction(obj){const id='A-'+Date.now()+'-'+Math.random().toString(36).slice(2,5);const a={id,status:'Awaiting review',source:'GeeVee (offline demo)',created:'Just now',approvedBy:null,...obj};state.actions.unshift(a);audit('draft','GeeVee prepared '+a.title,a.type+' · '+a.tier+' · waiting for agent review');persist();return a}
function addTask(obj){const id='T-'+Date.now()+'-'+Math.random().toString(36).slice(2,5);state.tasks.unshift({id,status:'Open',origin:'GeeVee · review confirmed',...obj});audit('task','Task prepared: '+obj.title,'Linked to '+personName(obj.contactId));persist();return id}
function queryRoute(q){const l=q.toLowerCase();if(/call|dial|phone/.test(l))return'calls';if(/message|sms|email|inbox|portal/.test(l))return'messages';if(/deals|property|listing|pipeline|appraisal/.test(l))return'deals';if(/people|contact|seller/.test(l))return'people';return'today'}
function getMsg(id){return state.messages.find(x=>x.id===id)}
function getReply(m){if(!m)return'';const p=findP(m.contactId);const first=p?.name.split(' ')[0]||'there';return m.channel==='Portal enquiry'?`Hi ${first}, thanks for your enquiry. I can help with that. Would you be available for a quick call to discuss the property and what you're looking for? Kind regards, Caleb`:/appraisal|valuation/i.test(m.last+' '+m.subject)?`Hi ${first}, thanks for reaching out. I'd be happy to discuss an appraisal for your property. What day and time would suit you for a quick call? Kind regards, Caleb`:`Hi ${first}, thank you for your message. I'll check the details and get back to you shortly. Kind regards, Caleb`}
function messageSelect(id){const m=getMsg(id);if(!m)return;ui.selectedMessage=id;ui.aiReply='';m.unread=false;persist();render()}
function queueReply(id){const m=getMsg(id);if(!m)return;const text=document.getElementById('reply-text')?.value?.trim();if(!text){toast('Write a reply or use GeeVee draft first.');return}addAction({type:m.channel==='SMS'?'SMS':'Email',title:'Review reply to '+personName(m.contactId),body:text,contactId:m.contactId,dealId:m.dealId,tier:'A2'});ui.aiReply='';render();toast('Reply added to Approvals. No message has been sent.')}
function saveCall(pId){const m=ui.modal,p=findP(pId);if(!m||m.type!=='call'||!p)return;const want=id=>document.getElementById(id)?.checked;const s=callSuggestions(m.notes||'');const call={id:'CALL-'+Date.now(),contactId:p.id,summary:m.notes,outcome:'Completed simulated call',when:'Just now',recording:false};state.calls.unshift(call);p.callStatus='contacted';p.lastContact='Just now';if(want('call-save-note'))p.note='Call recap: '+m.notes;if(want('call-add-task'))addTask({title:s.follow,contactId:p.id,dealId:state.deals.find(d=>d.contactId===p.id)?.id||'',due:'Tomorrow',priority:'High',category:'Call'});if(s.appraisal&&want('call-suggest-appraisal'))addAction({type:'Calendar',title:'Confirm suggested appraisal appointment',body:`Client mentioned an appraisal. ${s.apptText}. Please verify exact date, time, location and calendar availability before confirming.`,contactId:p.id,dealId:state.deals.find(d=>d.contactId===p.id)?.id||'',tier:'A2'});if(s.extra&&want('call-verify-contact'))addTask({title:'Verify additional owner / contact information',contactId:p.id,dealId:state.deals.find(d=>d.contactId===p.id)?.id||'',due:'Today',priority:'High',category:'Admin'});if(want('call-draft-followup'))addAction({type:'SMS',title:'Review call follow-up to '+p.name,body:`Hi ${p.name.split(' ')[0]}, thanks for speaking today. I'll follow up on the next steps we discussed. Kind regards, Caleb`,contactId:p.id,dealId:state.deals.find(d=>d.contactId===p.id)?.id||'',tier:'A2'});const matching=state.tasks.find(t=>t.status==='Open'&&t.contactId===p.id&&t.category==='Call');if(matching)matching.status='Done';audit('call','Agent logged call with '+p.name,'Manual recap saved to contact. Recording: not captured. Proposed changes added for review.');persist();ui.modal=null;navigate('calls');toast('Call recap saved to connected demo records. GeeVee queued reviewable next steps.')}
function stageUpdate(id){const d=findD(id);if(!d)return;const next=document.getElementById('stage-select')?.value;if(!next||next===d.stage)return toast('No change selected.');const missing=Object.values(d.compliance).some(v=>!v);if(['Listed','For sale','Sold'].includes(next)&&missing){toast('Stage blocked: listing compliance prerequisites are missing. Open the compliance checklist.');return}if(['Sold'].includes(next)&&d.stage!=='For sale'){toast('Mark sold from an active For sale listing, after all relevant checks.');return}const prev=d.stage;d.stage=next;d.active=!['Sold','Lost'].includes(next);audit('record','Property stage changed in demo: '+d.address,`${prev} → ${next}. Manual agent action. Existing CRM unaffected.`);persist();openModal({type:'deal',id});toast('Demo property stage updated across My deals and Money Map.')}
function preparedPack(id){const d=findD(id);if(!d)return;addTask({title:'Review appraisal pack and CMA evidence',contactId:d.contactId,dealId:d.id,due:'Today',priority:'High',category:'Admin'});openModal({type:'deal',id});toast('Appraisal preparation added to Today. Existing CMA tool remains accessible.')}
function preparedSeller(id){const d=findD(id);if(!d)return;addAction({type:'Email',title:'Review seller follow-up for '+d.address,body:`Hello ${personName(d.contactId).split(' ')[0]}, I wanted to follow up about ${d.address}. Please let me know when it would suit you to discuss the next steps. Kind regards, Caleb`,contactId:d.contactId,dealId:d.id,tier:'A2'});openModal({type:'approval',id:state.actions[0].id})}
function preparedAuthority(id){const d=findD(id);if(!d)return;addAction({type:'eSign',title:'Review proposed authority for '+d.address,body:'Prepare compliant agency-approved authority. Verify all signers, price guidance, commission, marketing costs and required disclosures before any external signing request.',contactId:d.contactId,dealId:d.id,tier:'A3'});openModal({type:'approval',id:state.actions[0].id})}
function matchesModal(d){return `<div class="alert info" style="margin-bottom:13px">${ico('users')} <div><b>${d.buyerMatches} possible buyer matches</b> are indicated for ${h(d.address)} in this fictional scenario. Actual matching requires current buyer criteria and permission checks.</div></div><div class="card pad">${state.people.filter(x=>x.role==='buyer'||x.role==='both').slice(0,6).map(p=>`<div class="list-row">${avatar(p.name,'soft')}<div class="list-main"><strong>${h(p.name)}</strong><div class="sub">${h(p.suburb)} · Buyer relationship</div></div>${action('Open','openPerson',p.id,'sm')}${action('Call','call',p.id,'sm primary')}</div>`).join('')}</div><div class="hint" style="margin-top:11px">Matching scores are not implemented in Phase 2; this is an interface demonstration.</div>`}
function openCall(id){const p=findP(id);if(!p)return toast('No linked contact found.');openModal({type:'call',contactId:id,phase:'ready',notes:'',recordConsent:false})}
function openLegacy(id){ui.route='more';ui.moreTab='legacy';ui.legacyKey=LEGACY[id]?id:'dashboard';ui.modal=null;ui.menu=false;render();window.scrollTo(0,0)}
function doAction(actionName,id){switch(actionName){
case 'route':navigate(id);break;
case 'toggleMenu':ui.menu=!ui.menu;render();break;
case 'openPerson':openModal({type:'person',id});break;
case 'openDeal':openModal({type:'deal',id});break;
case 'openTask':openModal({type:'task',id});break;
case 'call':openCall(id);break;
case 'startCall':{if(!ui.modal||ui.modal.type!=='call')break;ui.modal.recordConsent=!!document.getElementById('call-consent')?.checked;ui.modal.phase='active';render();toast('Simulated call started. No telephone number dialled and no audio recorded.');break}
case 'exampleCallNote':{const p=findP(id);const el=document.getElementById('call-notes');if(el){el.value=`Spoke with ${p?.name||'client'}. They would like an appraisal next Thursday at 11am, subject to confirmation. Their partner also needs to be involved. Please send a follow-up text after details are checked.`;el.focus()}break}
case 'finishCall':{const t=document.getElementById('call-notes')?.value?.trim();if(!t){toast('Enter a call recap to demonstrate GeeVee extracting next steps.');break}ui.modal.notes=t;ui.modal.phase='review';render();break}
case 'backToCall':ui.modal.phase='active';render();break;
case 'saveCall':saveCall(id);break;
case 'openApprovals':openModal({type:'approvals'});break;
case 'openApproval':openModal({type:'approval',id});break;
case 'approveAction':approveAction(id);break;
case 'rejectApproval':rejectAction(id);break;
case 'selectMessage':messageSelect(id);break;
case 'markRead':{const m=getMsg(id);if(m)m.unread=false;persist();render();break}
case 'draftReply':{const m=getMsg(id),el=document.getElementById('reply-text');if(el){el.value=getReply(m);el.focus()}toast('GeeVee draft prepared for agent review. Nothing sent.');break}
case 'queueReply':queueReply(id);break;
case 'personMessages':{const found=state.messages.find(x=>x.contactId===id);if(!found){toast('No conversation linked to this contact.');break}ui.selectedMessage=found.id;ui.filterMessages='All';navigate('messages');messageSelect(found.id);break}
case 'taskDone':{const t=findT(id);if(t){t.status='Done';audit('task','Task completed: '+t.title,'Agent marked completed in demo.');persist();if(ui.modal?.type==='focus'){ui.focusIndex=0;render()}else if(ui.modal){closeModal()}else render();toast('Task marked complete in the demo.')};break}
case 'startDay':ui.focusIndex=0;openModal({type:'focus'});break;
case 'focusNext':ui.focusIndex++;render();break;
case 'showMoney':openModal({type:'money'});break;
case 'showCall':openModal({type:'callDetail',id});break;
case 'updateStage':stageUpdate(id);break;
case 'preparePack':preparedPack(id);break;
case 'draftSeller':preparedSeller(id);break;
case 'prepareAuthority':preparedAuthority(id);break;
case 'buyerMatches':{const d=findD(id);if(d){ui.modal={type:'matches',id};render()}break}
case 'dealView':ui.viewDeals=id;render();break;
case 'peopleFilter':ui.filterPeople=id;render();break;
case 'messageFilter':ui.filterMessages=id;ui.aiReply='';render();break;
case 'callFilter':ui.callSessionFilter=id;render();break;
case 'legacy':openLegacy(id);break;
case 'chooseLegacy':ui.legacyKey=id;render();break;
case 'moreTab':ui.moreTab=id;ui.modal=null;ui.route='more';render();break;
case 'resetDemo':openModal({type:'reset'});break;
case 'confirmReset':state=structuredClone(SEED);persist();ui.modal=null;ui.focusIndex=0;ui.selectedMessage=state.messages[0].id;navigate('today');toast('Example data reset. Your real CRM was not changed.');break;
case 'dismissToast':{const t=document.getElementById('toast');if(t)t.style.display='none';break}
case 'close':closeModal();break;
case 'askGeeVee':{const q=document.getElementById('ask-geevee')?.value.trim();if(!q){toast('Try “show my seller leads” or “plan my day”.');break}openModal({type:'answer',query:q});break}
case 'search':ui.modal={type:'search'};render();break;
}}
// Delegated controls, so changes across screens remain connected.
document.addEventListener('click',ev=>{const target=ev.target.closest('[data-action]');if(!target)return;ev.preventDefault();doAction(target.dataset.action,target.dataset.id||'')});
document.addEventListener('change',ev=>{const t=ev.target;if(t.id==='deal-stage'){ui.filterDeals=t.value;render()}else if(t.id==='call-consent'&&ui.modal?.type==='call')ui.modal.recordConsent=t.checked});
function rerenderAndFocus(id,prop,val){ui[prop]=val;render();const el=document.getElementById(id);if(el){el.focus();try{el.setSelectionRange(val.length,val.length)}catch(e){}}}
document.addEventListener('input',ev=>{const el=ev.target;if(el.id==='people-search')rerenderAndFocus('people-search','searchPeople',el.value);else if(el.id==='deal-search')rerenderAndFocus('deal-search','searchDeals',el.value);else if(el.id==='message-search')rerenderAndFocus('message-search','searchMessages',el.value);else if(el.id==='legacy-search')rerenderAndFocus('legacy-search','legacySearch',el.value);else if(el.id==='modal-search')rerenderAndFocus('modal-search','searchGlobal',el.value)});
document.addEventListener('focusin',ev=>{if(ev.target.id==='global-search'){ui.modal={type:'search'};render();setTimeout(()=>document.getElementById('modal-search')?.focus(),0)}});
document.addEventListener('keydown',ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();ui.modal={type:'search'};render();setTimeout(()=>document.getElementById('modal-search')?.focus(),0)}else if(ev.key==='Escape'&&ui.modal){closeModal()}else if(ev.key==='Enter'&&ev.target.id==='ask-geevee'){ev.preventDefault();doAction('askGeeVee')}else if(ev.key==='Enter'&&ev.target.matches('.pipe-card')){doAction('openDeal',ev.target.dataset.id)}});
// Modal extension for buyer matching.
const prevModal=modal;modal=function(){if(ui.modal?.type!=='matches')return prevModal();const d=findD(ui.modal.id);return `<div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-label="Buyer matches"><div class="dialog-head"><h2>Potential buyers · ${h(d?.address||'Property')}</h2><button class="close" data-action="close" aria-label="Close">${ico('close')}</button></div><div class="dialog-content">${d?matchesModal(d):'No property found.'}</div></div></div>`};

// Command-centre UX: Today is the decision surface; legacy workspace directory mirrors the existing sidebar.
const SIDEBAR_DESTINATIONS=[
 {name:'Core CRM',entries:[
  ['Dashboard','dashboard','Your existing dashboard','home'],
  ['Campaign Manager','campaign_manager','Campaigns and suppliers','grid'],
  ['Properties','properties','Property records and files','building'],
  ['Reports','reports','Existing CRM reports','chart'],
  ['Contacts','contacts','Your full contact database','users'],
  ['Tasks','tasks','All existing CRM tasks','check'],
  ['Calendar','calendar','Appointments and diary','calendar'],
  ['Documents','documents','Existing document library','file'],
  ['eSign','esign','Signing envelopes and documents','file'],
  ['Inspections','open_homes','Open-home sessions','calendar']
 ]},
 {name:'Properties & pipelines',entries:[
  ['On-market pipeline','on_market','Live listings','building'],
  ['Off-market pipeline','off_market','Upcoming and off-market','building'],
  ['Leads pipeline','lead_pipeline','Appraisal and prospect flow','target'],
  ['Property database','property_database','Search property database','search'],
  ['Public properties','public_properties','Public listing catalogue','building'],
  ['Property compliance','property_compliance','Compliance documents and checks','shield'],
  ['Property ID review','property_id','Identify and resolve records','link'],
  ['Property photos','property_photos','Marketing media records','grid']
 ]},
 {name:'Prospecting',entries:[
  ['Prospecting','prospecting','Existing prospecting overview','target'],
  ['Seller opportunities','seller_opportunities','Vendors with selling signals','target'],
  ['Re-listing opportunities','relisting','Expired and withdrawn listings','target'],
  ['Find Buyers','find_buyers','Match buyers to properties','users'],
  ['Sales CMA','cma','Appraisal evidence and comparables','chart'],
  ['Market updates','market_updates','Owner and vendor updates','messages'],
  ['New developments','new_developments','Development opportunities','building'],
  ['Enquiries','enquiries','Lead enquiries','messages'],
  ['Buyer database','buyers','Buyers and preferences','users']
 ]},
 {name:'Performance & people management',entries:[
  ['Agent Performance','agent_performance','Agent activity and results','chart'],
  ['Agents Access & Permissions','access','Access, teams and assistants','shield'],
  ['Appraisal Forms','appraisal_forms','Submitted appraisals','file'],
  ['KPI & Goals','kpi','Goals and progress','target'],
  ['Leaderboard','leaderboard','Team performance','chart'],
  ['Analytics','analytics','Reports and insights','chart'],
  ['Commissions','commissions','Commission and attribution','chart']
 ]},
 {name:'Communication & automation',entries:[
  ['Communications','communications','Existing inbox and campaigns','messages'],
  ['Bulk communications','campaigns','Campaign lists and sends','messages'],
  ['AI Call Center','voice','Existing automated call controls','phone'],
  ['Voice agents','voice_agents','Voice scripts and agents','phone']
 ]},
 {name:'Administration & support',entries:[
  ['Support Tickets','support_tickets','Requests and support','file'],
  ['AI-SEO','ai_seo','Search content management','sparkles'],
  ['Ticketing','ticketing','Ticketing workspace','file'],
  ['Landchecker Usage','landchecker','External data usage','chart'],
  ['Report an Issue','report_issue','Send a product issue','alert'],
  ['Settings','settings','CRM configuration','shield'],
  ['Trash','trash','Archived and removed records','grid']
 ]}
];
ui.moreTab='directory';ui.toolSearch='';ui.queueTab='Pending';ui.inlineEditing='';ui.inlineScheduling='';ui.inlineConfirming='';

// Six destinations replace 45 simultaneous tool buttons, retaining all legacy routes.
const MERGED_HUBS=[
 {id:'clients',name:'People & leads',icon:'users',desc:'Find people, buyers, sellers and new opportunities.',examples:'Contacts · Buyers · Seller opportunities',primary:'contacts',sections:[
  ['People & enquiries',['contacts','buyers','enquiries']],
  ['Find more business',['prospecting','seller_opportunities','relisting','find_buyers','new_developments']]]},
 {id:'property',name:'Properties & listings',icon:'building',desc:'Your properties, pipelines, inspections and compliance.',examples:'Properties · Pipelines · Inspections',primary:'properties',sections:[
  ['Manage properties',['properties','property_database','public_properties']],
  ['Sales pipelines',['on_market','off_market','lead_pipeline']],
  ['Listing preparation & checks',['property_compliance','property_id','property_photos','open_homes']]]},
 {id:'appraisals',name:'Appraisals & documents',icon:'file',desc:'Valuations, appraisal paperwork, documents and signing.',examples:'CMA · Appraisal forms · eSign',primary:'cma',sections:[
  ['Appraise & update',['cma','appraisal_forms','market_updates']],
  ['Documents & signing',['documents','esign']]]},
 {id:'marketing',name:'Marketing & messages',icon:'messages',desc:'Campaigns, bulk communications, calls and marketing.',examples:'Campaigns · Communications · Call centre',primary:'campaign_manager',sections:[
  ['Campaigns & messages',['campaign_manager','communications','campaigns']],
  ['Calling & automation',['voice','voice_agents','ai_seo']]]},
 {id:'work',name:'Work & results',icon:'calendar',desc:'Your diary, tasks, reports, commission and team results.',examples:'Calendar · Tasks · Reports',primary:'calendar',sections:[
  ['Daily work',['calendar','tasks','dashboard']],
  ['Performance & commission',['reports','agent_performance','kpi','leaderboard','analytics','commissions']]]},
 {id:'office',name:'Office & settings',icon:'shield',desc:'Agency access, system settings, help and administration.',examples:'Permissions · Settings · Support',primary:'settings',sections:[
  ['Manage the office',['access','settings','landchecker']],
  ['Help & maintenance',['support_tickets','ticketing','report_issue','trash']]]}
];
const CRM_TOOL_INDEX=Object.fromEntries(SIDEBAR_DESTINATIONS.flatMap(g=>g.entries.map(e=>[e[1],{name:e[0],key:e[1],desc:e[2],icon:e[3]}])));
const TOOL_TO_HUB=Object.fromEntries(MERGED_HUBS.flatMap(g=>g.sections.flatMap(s=>s[1].map(k=>[k,g.id]))));
ui.toolHub='';
const OLD_more=more;
function hubAction(key){const e=CRM_TOOL_INDEX[key];if(!e)return '';return `<button type="button" class="hub-tool" data-action="legacy" data-id="${h(key)}" aria-label="Open ${h(e.name)}"><span class="hub-tool-ic">${ico(e.icon)}</span><span style="flex:1;min-width:0"><span class="hub-tool-title">${h(e.name)}</span><span class="hub-tool-sub">${h(e.desc)}</span></span>${ico('chevron','sm')}</button>`;}
more=function(){
 if(ui.moreTab==='legacy')return `${sectionHeader('Existing CRM workspace','Your familiar CRM function, opened without restoring its long navigation sidebar.',action('← '+(MERGED_HUBS.find(g=>g.id===ui.toolHub)?.name||'All tools'),'toolHub',ui.toolHub||'','primary'))}${legacyView()}`;
 if(ui.moreTab==='migration')return `${sectionHeader('Phase 2 architecture','Developer reference',action('Back to all tools','toolHub','',''))}${migrationView()}`;
 if(ui.moreTab==='audit')return `${sectionHeader('Activity history','What GeeVee has proposed and what you decided',action('Back to all tools','toolHub','',''))}${auditView()}`;
 if(ui.moreTab==='policies')return `${sectionHeader('Permissions','Hybrid AI autonomy controls',action('Back to all tools','toolHub','',''))}${policyView()}`;
 const q=(ui.toolSearch||'').trim().toLowerCase();
 const hub=MERGED_HUBS.find(g=>g.id===ui.toolHub);
 if(q){
  const matches=Object.values(CRM_TOOL_INDEX).filter(e=>{const grp=MERGED_HUBS.find(g=>g.id===TOOL_TO_HUB[e.key]);return [e.name,e.desc,grp?.name||''].some(s=>s.toLowerCase().includes(q))});
  return `${sectionHeader('Find a tool','Search every existing CRM function without browsing categories.',action('← All tools','clearToolSearch','','primary'))}<div class="hub-intro"><input class="hub-search" id="tool-search" aria-label="Search CRM tools" placeholder="What are you looking for? E.g. contacts or CMA" value="${h(ui.toolSearch)}" autocomplete="off" autofocus><span class="hub-count">${matches.length} matching tools</span></div><section class="hub-search-results"><h2>Search results</h2>${matches.length?`<div class="hub-tool-grid">${matches.map(e=>hubAction(e.key)).join('')}</div>`:'<p class="small muted">No match. Try a simpler name such as “property”, “buyer” or “calendar”.</p>'}</section><p class="hub-footer">Search opens the same original CRM destination. No screens or functions have been removed.</p>`;
 }
 if(hub){const count=hub.sections.reduce((a,s)=>a+s[1].length,0);return `${sectionHeader(hub.name,hub.desc,action('← All tools','toolHub','','primary'))}<div class="hub-detail-hero"><div class="hub-icon">${ico(hub.icon)}</div><div><h2>Choose what you want to do</h2><p>${h(hub.examples)} · ${count} existing CRM tools available in this workspace.</p></div></div>${hub.sections.map(([title,keys])=>`<section class="hub-section"><div class="hub-section-title">${h(title)}</div><div class="hub-tool-grid">${keys.map(hubAction).join('')}</div></section>`).join('')}<p class="hub-footer">These buttons open read-only previews in this prototype. In the production CRM they should open the existing working pages, with the old long sidebar removed.</p>`;}
 return `${sectionHeader('More tools','Everything from your current CRM, organised into six easy places.',action(`${ico('home')} Back to Today`,'route','today','primary'))}<div class="simple-note">${ico('sparkles')} <div><b>Just choose what you need.</b> Your everyday work stays on Today. The tools below open the existing CRM functions when you need something extra.</div></div><div class="hub-intro"><input class="hub-search" id="tool-search" aria-label="Search all CRM tools" value="${h(ui.toolSearch||'')}" placeholder="Find a tool, for example Contacts or CMA" autocomplete="off"><span class="hub-count">${Object.keys(CRM_TOOL_INDEX).length} existing functions, six simple groups</span></div><div class="hubs">${MERGED_HUBS.map(g=>`<button type="button" class="hub-card" data-action="toolHub" data-id="${g.id}" aria-label="Open ${h(g.name)}"><div class="hub-icon">${ico(g.icon)}</div><div style="min-width:0;flex:1"><span class="hub-name">${h(g.name)}</span><div class="hub-desc">${h(g.desc)}</div><div class="hub-examples">${h(g.examples)}</div><span class="hub-cta">Open workspace →</span></div></button>`).join('')}</div><div class="card pad"><h2>For administrators and developers</h2><p class="small muted" style="margin:7px 0 12px">These are separate from agents’ everyday tools.</p><div class="toolbar">${action('Phase 2 architecture','moreTab','migration','sm')}${action('Activity history','moreTab','audit','sm')}${action('AI permissions','moreTab','policies','sm')}</div></div>`;
};
legacyView=function(){const entry=LEGACY[ui.legacyKey]||LEGACY.dashboard;const route=entry.route||'(existing CRM route)';return `<div class="simple-note" style="margin-bottom:13px">${ico('shield')} <div><b>Read-only view of your supplied CRM.</b> The content below was captured from the existing CRM screen export. For this standalone demo, it cannot save changes. In production this same button should route to <b>${h(route)}</b> inside the existing CRM backend.</div></div><div class="tool-target-card"><div><h2 style="font-size:18px;margin:0">${h(entry.name)}</h2><div class="tool-route">Existing route: ${h(route)}</div><p class="tiny muted" style="margin-top:6px">Source screen: ${h(entry.file)}</p></div><div style="display:flex;gap:7px;flex-wrap:wrap">${action('← '+(MERGED_HUBS.find(g=>g.id===ui.toolHub)?.name||'All tools'),'toolHub',ui.toolHub||'','primary')}${action('Return to Today','route','today','')}</div></div><div class="tool-preview"><img src="data:image/jpeg;base64,${entry.image}" alt="Content area of current CRM ${h(entry.name)} screen, old sidebar removed"></div><p class="hint" style="margin-top:11px">Original screen preview. The left-hand navigation is intentionally not duplicated. In the live CRM, the destination will use its real, working data and forms.</p>`};

function decisionCard(a){
 const p=findP(a.contactId),d=findD(a.dealId);const editing=ui.inlineEditing===a.id,scheduling=ui.inlineScheduling===a.id,confirming=ui.inlineConfirming===a.id;
 const protectedAction=a.tier==='A3';let source=a.type==='SMS'?'Text message':a.type==='Email'?'Email':a.type==='eSign'?'Signing / document':a.type||'Record update';
 let note=protectedAction?'Protected · review commercial terms and actual document before external execution':a.tier==='A1'?'Routine · agent review in demo':'Agent approval required';
 return `<article class="decision-card ${protectedAction?'protected':'urgent'}" data-item-id="${h(a.id)}"><div class="decision-head"><div><div class="decision-name">${h(a.title)}</div><div class="decision-context"><b>${h(p?.name||'Internal task')}</b>${d?' · '+h(d.address):''} · ${h(source)}</div></div>${tierTag(a.tier)}</div><div class="decision-info">${tag(a.type||'Action','outline')}<span class="tiny muted">${h(note)}</span></div>
 ${editing?`<div class="decision-inline"><label class="form-label" for="edit-${h(a.id)}">Edit GeeVee's proposed text</label><textarea id="edit-${h(a.id)}" class="decision-editor">${h(a.body)}</textarea><div class="decision-buttons">${action('Save changes','quickSave',a.id,'primary')}${action('Save & approve','quickSaveApprove',a.id,'')}${action('Cancel','quickCancelEdit',a.id,'')}</div></div>`:`<div class="decision-body">${h(a.body||'No message content provided. Review this action before approval.')}</div>`}
 ${protectedAction?`<div class="hint" style="margin-bottom:9px">${ico('alert','sm')} A full document or commercial-term preview and authorised verification are required for real execution. This offline button only records a demo review.</div>`:''}
 ${confirming?`<div class="decision-inline"><b>Confirm protected review</b><p class="small" style="margin:6px 0 11px">Have you checked the complete document, recipients, legal and commercial terms? This demonstration records your decision only. It will not send or sign anything.</p><label class="small" style="display:flex;gap:8px;align-items:flex-start"><input id="protect-${h(a.id)}" type="checkbox" style="margin-top:3px"> I have checked the required information for this version.</label><div class="decision-buttons">${action('Confirm review (demo)','quickConfirmProtected',a.id,'primary')}${action('Back','quickCancelProtected',a.id,'')}</div></div>`:''}
 ${scheduling?`<div class="decision-inline"><b>When should GeeVee bring this back?</b><p class="tiny muted" style="margin:4px 0 10px">Reschedule your approval reminder, not an external message or document send.</p><div class="decision-buttons">${action('Tomorrow','quickSnoozeTomorrow',a.id,'')}${action('Next week','quickSnoozeWeek',a.id,'')}<input id="date-${h(a.id)}" aria-label="Review again on" type="date">${action('Use date','quickSnoozeDate',a.id,'primary')}${action('Cancel','quickCancelSchedule',a.id,'')}</div></div>`:''}
 <div class="decision-buttons">${action('✓ Approve','quickApprove',a.id,'primary')}${action('✎ Edit','quickEdit',a.id,'')}${action('Ignore','quickIgnore',a.id,'')}${action('Reschedule','quickSchedule',a.id,'')}</div></article>`;
}
function scheduledCard(a){const p=findP(a.contactId);return `<div class="list-row"><div class="number-circle">${ico('calendar','sm')}</div><div class="list-main"><strong>${h(a.title)}</strong><div class="sub">${h(personName(a.contactId))} · Review again: ${h(a.reviewAt||'Date not set')} · Nothing scheduled to send</div></div>${action('Review now','quickReturn',a.id,'primary sm')}</div>`}
function handledCard(a){return `<div class="list-row"><div class="number-circle">${ico('check','sm')}</div><div class="list-main"><strong>${h(a.title)}</strong><div class="sub">${h(a.status)} · ${h(personName(a.contactId))}</div></div>${tierTag(a.tier)}</div>`}
function queueCentre(){const all=state.actions,pend=all.filter(a=>a.status==='Awaiting review'),sch=all.filter(a=>a.status==='Scheduled review'),done=all.filter(a=>!['Awaiting review','Scheduled review'].includes(a.status));const selected=ui.queueTab||'Pending';return `<section id="decision-centre" class="card pad"><div class="card-head" style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><div class="eyebrow">GEEVEE HAS DONE THE PREPARATION</div><h2 style="font-size:19px;margin-top:3px">Your decisions, ready to make</h2><p class="small muted" style="margin-top:4px">Read it here. You don't have to open another screen.</p></div>${tag(pend.length+' to review',pend.length?'yellow':'green')}</div><div class="queue-tabs">${[['Pending','To approve',pend.length],['Scheduled','Rescheduled',sch.length],['Handled','Handled',done.length]].map(([k,l,num])=>`<button class="${selected===k?'selected':''}" data-action="queueTab" data-id="${k}">${h(l)} (${num})</button>`).join('')}</div>${selected==='Pending'?(pend.length?pend.map(decisionCard).join(''):'<div class="simple-note" style="margin-top:15px">All caught up. GeeVee has no decisions waiting for you right now.</div>'):selected==='Scheduled'?(sch.length?sch.map(scheduledCard).join(''):'<p class="muted small" style="padding:18px 0">Nothing rescheduled.</p>'):(done.length?done.map(handledCard).join(''):'<p class="muted small" style="padding:18px 0">Nothing handled yet.</p>')}<div class="hint" style="margin-top:15px">Offline Phase 2 prototype. Approve records a simulated review; it never sends messages, publishes listings, updates production data or issues signing requests.</div></section>`}
function priorityMessagesCard(){const list=state.messages.filter(m=>m.unread).sort((a,b)=>(b.triage==='Urgent')-(a.triage==='Urgent')).slice(0,4);return `<section class="card pad">${cardHead('New enquiries to act on',tag(list.length+' highlighted','teal'))}<p class="small muted" style="margin-bottom:7px">GeeVee can prepare a response without you opening Messages.</p>${list.map(m=>`<div class="list-row"><div class="number-circle">${ico('messages','sm')}</div><div class="list-main"><strong>${h(personName(m.contactId))}</strong> ${m.triage==='Urgent'?tag('Urgent','hot'):''}<div class="sub">${h(m.channel)} · ${h(m.last).slice(0,105)}</div></div><div class="action-side">${action('Prepare reply','quickMessageDraft',m.id,'sm primary')}${action('Call','call',m.contactId,'sm')}</div></div>`).join('')||'<p class="muted small">No unread messages.</p>'}<div style="margin-top:10px">${action('All conversations','route','messages','sm')}</div></section>`}
const PREV_today=today;
function restoreDueReviews(){let changed=false;for(const a of state.actions){if(a.status==='Scheduled review'&&a.reviewAtISO&&Date.parse(a.reviewAtISO)<=Date.now()){a.status='Awaiting review';a.reviewAt=undefined;a.reviewAtISO=undefined;changed=true;audit('review','Review due again: '+a.title,'Returned to Today automatically after its review date.');}}if(changed)persist();}
const originalRender=render;render=function(){restoreDueReviews();return originalRender();};
today=function(){const s=stats(),priorities=state.deals.filter(d=>d.active&&(d.stage==='New lead'||d.risk)).slice(0,4);return `${sectionHeader('Good morning, Caleb','GeeVee has sorted your day. Start here, make decisions, speak to people and win business.',action(`${ico('grid')} More tools`,'route','more',''))}<div class="hero"><div class="hero-top"><div class="hero-eyebrow">✦ GEEVEE · YOUR PERSONAL ASSISTANT</div>${tag('Phase 2 · connected workflow demo','')}</div><div class="hero-title">Your next listing starts with the next right conversation.</div><div class="hero-sub">${s.approvals} decisions ready for you · ${s.unread} unread conversations · ${s.risk} deals needing attention. I have the details prepared below.</div><div class="hero-actions">${action(`${ico('play')} Start my day`,'startDay','','big primary')}${action(`${ico('phone')} Start calling`,'route','calls','big')}${action(`${ico('check')} My decisions (${s.approvals})`,'jumpDecisions','','big')}</div><div class="hero-input">${ico('sparkles')}<input id="ask-geevee" aria-label="Ask GeeVee" placeholder="Ask GeeVee to find sellers, prepare a message, or plan your day"><button class="btn primary sm" data-action="askGeeVee">Ask GeeVee ${ico('arrow','sm')}</button></div></div><div class="grid-4" style="margin:16px 0"><div class="stat highlight"><div class="label">Potential commission</div><div class="value num">${abbrev(s.potential)}</div><div class="foot">Estimated active opportunities</div></div><div class="stat"><div class="label">Decisions to make</div><div class="value num">${s.approvals}</div><div class="foot">Approve, edit, ignore or move</div></div><div class="stat"><div class="label">New conversations</div><div class="value num">${s.unread}</div><div class="foot">Email · Text · Portal</div></div><div class="stat"><div class="label">Deals needing help</div><div class="value num">${s.risk}</div><div class="foot">${abbrev(s.atRisk)} at risk (estimate)</div></div></div><div class="command-layout"><div style="display:flex;flex-direction:column;gap:15px">${queueCentre()}<section class="card pad">${cardHead('Who to call next',tag('High priority','teal'))}<div class="inline-help" style="margin-bottom:7px">${ico('phone','sm')} Call in DOMA from here; GeeVee prepares the post-call admin.</div>${todaysList(5).map(t=>taskRow(t)).join('')}${action('Call everyone on my list','route','calls','sm')}</section>${priorityMessagesCard()}</div><aside style="display:flex;flex-direction:column;gap:15px"><section class="card pad">${cardHead('Listing opportunities',action('My deals','route','deals','sm'))}${priorities.map(d=>homeOpportunity(d)).join('')||'<p class="muted small">No priority deals.</p>'}</section>${moneyMapMini()}<section class="card pad">${cardHead('Quick access')}<div class="agent-shortcuts">${action('Contacts database','legacy','contacts','')}${action('Seller opportunities','legacy','seller_opportunities','')}${action('Calendar','legacy','calendar','')}${action('CMA reports','legacy','cma','')}</div><p class="hint" style="margin-top:12px">These open the corresponding original CRM workspace from More tools.</p></section><section class="card pad">${cardHead('What GeeVee has already done')} ${state.activity.slice(0,4).map(a=>`<div class="activity"><div class="activity-dot"></div><div><strong>${h(a.title)}</strong><p>${h(a.details)}</p></div></div>`).join('')}</section></aside></div>`;};

// Interactions are delegated, so cards always reflect latest shared demo state.
const ORIGINAL_doAction=doAction;
doAction=function(name,id){
 const a=state.actions.find(x=>x.id===id);
 const closeInline=()=>{ui.inlineEditing='';ui.inlineScheduling='';ui.inlineConfirming=''};
 const updated=msg=>{persist();render();toast(msg)};
 switch(name){
  case 'toolHub':ui.moreTab='directory';ui.toolHub=id||'';ui.toolSearch='';render();return;
  case 'clearToolSearch':ui.moreTab='directory';ui.toolHub='';ui.toolSearch='';render();return;
  case 'legacy':if(ui.toolSearch){ui.toolHub=TOOL_TO_HUB[id]||'';ui.toolSearch='';}return ORIGINAL_doAction(name,id);
  case 'queueTab':ui.queueTab=id;closeInline();render();return;
  case 'jumpDecisions':document.getElementById('decision-centre')?.scrollIntoView({behavior:'smooth',block:'start'});return;
  case 'quickEdit':ui.queueTab='Pending';ui.inlineEditing=ui.inlineEditing===id?'':id;ui.inlineScheduling='';ui.inlineConfirming='';render();document.getElementById('edit-'+id)?.focus();return;
  case 'quickCancelEdit':ui.inlineEditing='';render();return;
  case 'quickSave':case 'quickSaveApprove':{
    if(!a||a.status!=='Awaiting review')return;const next=document.getElementById('edit-'+id)?.value?.trim();if(!next){toast('The proposed text cannot be blank.');return;}a.body=next;a.contentVersion=(a.contentVersion||1)+1;closeInline();audit('edit','Agent edited '+a.title,'Saved revised demo version '+a.contentVersion);persist();
    if(name==='quickSaveApprove'){if(a.tier==='A3'){ui.inlineConfirming=id;render();toast('Please confirm protected review of this revised version.');return;}approveAction(id);ui.modal=null;ui.queueTab='Pending';render();return;}
    updated('Changes saved. You can approve the updated version on Today.');return;
  }
  case 'quickApprove':if(!a||a.status!=='Awaiting review')return;if(a.tier==='A3'){ui.inlineConfirming=ui.inlineConfirming===id?'':id;ui.inlineEditing='';ui.inlineScheduling='';render();return;}a.status='Reviewed · not sent';a.approvedBy='Caleb Richards · offline demo';a.reviewedContentVersion=a.contentVersion||1;a.reviewedAt=new Date().toISOString();audit('approval','Agent approved '+a.title,'Approved from Today; offline demo only, nothing sent.');closeInline();updated('Approved in the demo. Nothing was sent.');return;
  case 'quickConfirmProtected':if(!a||a.tier!=='A3'||a.status!=='Awaiting review')return;if(!document.getElementById('protect-'+id)?.checked){toast('Please confirm that the protected details have been reviewed.');return;}a.status='Reviewed · not sent';a.approvedBy='Caleb Richards · offline demo';a.reviewedContentVersion=a.contentVersion||1;a.reviewedAt=new Date().toISOString();audit('approval','Protected action reviewed: '+a.title,'Specific inline confirmation recorded; no external document or message sent.');closeInline();updated('Protected review recorded in the demo. Nothing was sent or signed.');return;
  case 'quickCancelProtected':ui.inlineConfirming='';render();return;
  case 'quickIgnore':if(!a||a.status!=='Awaiting review')return;a.status='Ignored';audit('approval','Agent ignored '+a.title,'No message sent or action executed.');closeInline();updated('Ignored. Nothing was sent.');return;
  case 'quickSchedule':ui.inlineScheduling=ui.inlineScheduling===id?'':id;ui.inlineEditing='';ui.inlineConfirming='';render();return;
  case 'quickCancelSchedule':ui.inlineScheduling='';render();return;
  case 'quickSnoozeTomorrow':case 'quickSnoozeWeek':case 'quickSnoozeDate':{
    if(!a||a.status!=='Awaiting review')return;
    let next=new Date();if(name==='quickSnoozeTomorrow')next.setDate(next.getDate()+1);else if(name==='quickSnoozeWeek')next.setDate(next.getDate()+7);else{const v=document.getElementById('date-'+id)?.value;if(!v){toast('Choose a review date first.');return;}next=new Date(v+'T09:00:00');if(!Number.isFinite(next.getTime())||next<new Date(new Date().toDateString())){toast('Choose today or a future date.');return;}}
    a.reviewAtISO=next.toISOString();a.reviewAt=next.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'});a.status='Scheduled review';audit('review','Review postponed: '+a.title,'To '+a.reviewAt+'; no external action was scheduled.');closeInline();updated('Rescheduled for review '+a.reviewAt+'. Nothing will send automatically.');return;
  }
  case 'quickReturn':if(!a||a.status!=='Scheduled review')return;a.status='Awaiting review';delete a.reviewAt;delete a.reviewAtISO;ui.queueTab='Pending';updated('Moved back into Today for approval.');return;
  case 'quickMessageDraft':{
   const m=getMsg(id);if(!m)return;const existing=state.actions.find(a=>a.messageId===m.id&&a.status==='Awaiting review');if(existing){ui.queueTab='Pending';render();document.getElementById('decision-centre')?.scrollIntoView({behavior:'smooth'});toast('GeeVee has already prepared this response.');return;}
   addAction({messageId:m.id,type:m.channel==='SMS'?'SMS':m.channel==='Portal enquiry'?'Portal reply':'Email',title:'Reply to '+personName(m.contactId)+' · '+m.channel,body:getReply(m),contactId:m.contactId,dealId:m.dealId,tier:'A2'});ui.queueTab='Pending';render();document.getElementById('decision-centre')?.scrollIntoView({behavior:'smooth',block:'start'});toast('GeeVee drafted a reply on Today. Review it here.');return;
  }
  case 'route':if(id==='more'){ui.moreTab='directory';ui.toolSearch='';ui.toolHub='';}return ORIGINAL_doAction(name,id);
  case 'moreTab':if(id==='workspaces')id='directory';if(id==='directory')ui.toolSearch='';return ORIGINAL_doAction(name,id);
  default:return ORIGINAL_doAction(name,id);
 }
};
document.addEventListener('input',e=>{if(e.target.id==='tool-search'){ui.toolSearch=e.target.value;const pos=e.target.selectionStart;render();const input=document.getElementById('tool-search');if(input){input.focus();input.setSelectionRange(pos,pos)}}});


/* =============================================================
   Phase 2 / GeeVee Start My Day: one adaptive daily queue.
   This is entirely simulated and never invokes external providers.
   ============================================================= */
const DAY_LANES=[
 {id:1,label:'Reply to enquiries',desc:'Email · Text · Portal'},
 {id:2,label:'Call Meta leads',desc:'Sellers first, then buyers'},
 {id:3,label:'Complete reminders',desc:'Calls, promises and tasks'},
 {id:4,label:'Find listing opportunities',desc:'Most urgent and promising first'},
 {id:5,label:'Match buyers',desc:'Prepare tailored property messages'},
 {id:6,label:'Everything else',desc:'Deals, documents and useful research'}
];
const DAY_SAMPLE_APPOINTMENTS=[
 {id:'CAL-1',time:'9:00am',clock:540,title:'Team sales meeting',where:'Collings Office · Preston',kind:'In person',detail:'Weekly priorities and vendor updates'},
 {id:'CAL-2',time:'10:30am',clock:630,title:'Property appraisal',where:'26 Olive Street · Heidelberg Heights',kind:'In person',detail:'Meet Peter Kent and review property',contactId:'C-1003',dealId:'D-2003'},
 {id:'CAL-3',time:'12:00pm',clock:720,title:'Building inspection',where:'31 Vale Street · Reservoir',kind:'In person',detail:'Attend with building inspector'},
 {id:'CAL-4',time:'1:15pm',clock:795,title:'Vendor review call',where:'Phone appointment',kind:'Phone',detail:'Discuss the marketing campaign',contactId:'C-1006',dealId:'D-2004'},
 {id:'CAL-5',time:'2:30pm',clock:870,title:'Open for inspection',where:'9 Rose Avenue · Coburg',kind:'In person',detail:'Buyer registrations and feedback',dealId:'D-2006'},
 {id:'CAL-6',time:'4:00pm',clock:960,title:'Buyer appointment',where:'14 Mason Street · Greensborough',kind:'In person',detail:'Private property consultation',dealId:'D-2001'}
];
const DAY_MARKET_TASKS=[
 ['Review potential sellers from past appraisals','Find contacts who previously requested an appraisal and check whether there is a justified new follow-up.'],
 ['Refresh the local market briefing','Prepare an internal comparison of relevant recent sales and flag information needing agent verification.'],
 ['Review uncontacted buyer requirements','Check existing buyer preferences and identify any newly relevant listing matches.'],
 ['Check missing information on active properties','Look for incomplete ownership, marketing, price evidence or compliance fields and prepare internal follow-up tasks.'],
 ['Review lost and withdrawn listing opportunities','Find records that justify re-engagement, respecting existing ownership and contact restrictions.'],
 ['Prepare tomorrow’s appointments','Confirm which appraisal and inspection preparation tasks can be assembled in advance.']
];
ui.dayVisited=[];ui.dayReturn=false;ui.dayEditing='';ui.dayScheduling='';ui.dayFocusId='';ui.dayContinuous=0;
const DAY_EXTRA_META_PEOPLE=[
 {id:'C-9101',legacyId:'CNT-DEMO-9101',name:'Olivia Tran',role:'buyer',suburb:'Preston',phone:'0400 000 201',email:'olivia.tran@example.test',source:'Instagram',owner:'Caleb Richards',lastContact:'Today',note:'Meta buyer enquiry. Looking for a three-bedroom home; needs a call to qualify requirements.',consent:'ok',callStatus:'not called',tags:['Meta buyer']},
 {id:'C-9102',legacyId:'CNT-DEMO-9102',name:'Marcus Bell',role:'buyer',suburb:'Coburg',phone:'0400 000 202',email:'marcus.bell@example.test',source:'Facebook',owner:'Caleb Richards',lastContact:'Yesterday',note:'Asked about a listing through Meta advertising. Confirm budget and inspection interest.',consent:'ok',callStatus:'not called',tags:['Meta buyer']},
 {id:'C-9103',legacyId:'CNT-DEMO-9103',name:'Kiran Patel',role:'buyer',suburb:'Thornbury',phone:'0400 000 203',email:'kiran.patel@example.test',source:'Instagram',owner:'Caleb Richards',lastContact:'Today',note:'Requested information about current homes for sale. Qualify location and timing.',consent:'ok',callStatus:'not called',tags:['Meta buyer']},
 {id:'C-9104',legacyId:'CNT-DEMO-9104',name:'Tahlia Wells',role:'buyer',suburb:'Reservoir',phone:'0400 000 204',email:'tahlia.wells@example.test',source:'Facebook',owner:'Caleb Richards',lastContact:'Yesterday',note:'New buyer lead from social advertising. Ask about current search and property to sell.',consent:'ok',callStatus:'not called',tags:['Meta buyer']}
];
function dayLocalStamp(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function dayEnsure(){for(const p of DAY_EXTRA_META_PEOPLE){if(!state.people.some(e=>e.id===p.id))state.people.push({...p});}if(!state.dayWork)state.dayWork={date:dayLocalStamp(),handled:{},buyerPrepared:{},opportunityPrepared:{},researchIndex:0};if(!state.dayWork.handled)state.dayWork.handled={};if(!state.dayWork.buyerPrepared)state.dayWork.buyerPrepared={};if(!state.dayWork.opportunityPrepared)state.dayWork.opportunityPrepared={};if(state.dayWork.date!==dayLocalStamp()){state.dayWork.date=dayLocalStamp();state.dayWork.handled={};ui.dayVisited=[];}}
function daySnoozed(m){if(!m.dayReviewAtISO)return false;return Date.parse(m.dayReviewAtISO)>Date.now()}
function dayMessageEligible(m){return m.unread&&!m.dayHandled&&!daySnoozed(m)&&!state.actions.some(a=>a.messageId===m.id)}
function dayActionMessage(a){return ['SMS','Email','Portal reply','Portal enquiry'].includes(a.type)||/reply|message|confirmation sms/i.test(a.title||'')}
function dayRankTask(t){const priority=({Urgent:0,High:1,Normal:2})[t.priority]??3;const due=/now|overdue/i.test(t.due||'')?0:/today/i.test(t.due||'')?1:/tomorrow|next week/i.test(t.due||'')?8:2;return priority*10+due}
function dayDue(t){return !/tomorrow|next week|next month/i.test(t.due||'')}
function dayDealRank(d){const stage=({Authority:0,Proposal:1,Appraisal:2,'New lead':3,Connected:4,Listed:5,'For sale':6})[d.stage]??7;return (d.risk?-50:0)+stage*8-(/hot|urgent|new seller/i.test((d.why||'')+' '+(findP(d.contactId)?.tags||[]).join(' '))?12:0)-Math.min(10,comm(d)/10000)}
function dayQueueRaw(){
 dayEnsure();const items=[];const push=(lane,kind,key,ref,score=0)=>items.push({lane,kind,key,ref,score});
 state.actions.filter(a=>a.status==='Awaiting review'&&dayActionMessage(a)).forEach(a=>push(1,'action','action:'+a.id,a,(a.tier==='A3'?5:0)));
 state.messages.filter(dayMessageEligible).forEach(m=>push(1,'message','msg:'+m.id,m,(m.triage==='Urgent'?-15:0)));
 state.people.filter(p=>/facebook|meta|instagram/i.test(p.source||'')&&p.consent==='ok'&&p.callStatus!=='contacted').forEach(p=>push(2,'meta','meta:'+p.id,p,(p.role==='seller'||p.role==='both'?-25:0)+(p.tags?.includes('Hot seller')?-12:0)+(p.callStatus==='not called'?-5:0)));
 state.tasks.filter(t=>t.status==='Open'&&dayDue(t)).forEach(t=>push(3,'task','task:'+t.id,t,dayRankTask(t)));
 state.deals.filter(d=>d.active&&!['Sold','Lost'].includes(d.stage)&&!state.dayWork.opportunityPrepared[d.id]).forEach(d=>push(4,'listing','listing:'+d.id,d,dayDealRank(d)));
 state.deals.filter(d=>d.active&&['Listed','For sale'].includes(d.stage)&&d.buyerMatches>0&&!state.dayWork.buyerPrepared[d.id]).forEach(d=>push(5,'buyer','buyer:'+d.id,d,-d.buyerMatches));
 state.actions.filter(a=>a.status==='Awaiting review'&&!dayActionMessage(a)).forEach(a=>push(6,'action','action:'+a.id,a,a.tier==='A3'?-10:0));
 const researchIdx=state.dayWork.researchIndex||0;
 DAY_MARKET_TASKS.forEach((r,i)=>push(6,'research','research:'+i,{id:i,title:r[0],description:r[1]},20+((i-researchIdx+DAY_MARKET_TASKS.length)%DAY_MARKET_TASKS.length)));
 return items.sort((a,b)=>a.lane-b.lane||a.score-b.score||a.key.localeCompare(b.key));
}
function dayQueue(){return dayQueueRaw().filter(x=>!ui.dayVisited.includes(x.key))}
function dayCurrent(){const list=dayQueue();return list[0]||null}
function dayCounts(){const q=dayQueueRaw();return DAY_LANES.map(x=>({...x,count:q.filter(i=>i.lane===x.id&&!ui.dayVisited.includes(i.key)).length}))}
function dayNextAppointment(){const now=new Date();const t=now.getHours()*60+now.getMinutes();return DAY_SAMPLE_APPOINTMENTS.find(e=>e.clock>=t-10)||null}
function dayAgenda(compact=false){const a=DAY_SAMPLE_APPOINTMENTS;const upcoming=dayNextAppointment();return `<section class="agenda-card"><div class="agenda-head"><div><div class="eyebrow">FIRST THING · KNOW YOUR DIARY</div><h2>${ico('calendar','sm')} Your appointments today</h2><p>Here’s every appointment in your sample calendar before you start work. In production these come from your connected calendar.</p></div>${tag(a.length+' appointments · '+a.filter(e=>e.kind==='In person').length+' in person','teal')}</div><div class="agenda-items">${a.map(e=>`<div class="agenda-item ${e.kind==='In person'?'onsite':''}"><div class="agenda-time">${h(e.time)}</div><div class="agenda-detail"><strong>${h(e.title)}</strong><small>${h(e.where)}</small><span class="agenda-pill ${e.kind!=='In person'?'remote':''}">${h(e.kind)}</span></div></div>`).join('')}</div><div class="day-muted-note">Example appointments only. Times and addresses are fictional; no live calendar is connected. GeeVee should protect travel and appointment time when allocating calls.</div></section>`}
function dayLaneBar(){const q=dayCounts(),current=dayCurrent();return `<div class="work-lanes" aria-label="GeeVee's fixed order of work">${q.map(x=>`<div class="work-lane ${current?.lane===x.id?'active':''}"><div class="work-lane-num">${x.id}</div><div style="min-width:0;flex:1"><div class="work-lane-label">${h(x.label)}</div><div class="work-lane-desc">${h(x.desc)}</div></div><div class="work-lane-count">${x.count}</div></div>`).join('')}</div>`}
function dayMessageCard(m,mode='focus'){
 const p=findP(m.contactId),d=findD(m.dealId),editing=ui.dayEditing===m.id,scheduling=ui.dayScheduling===m.id;
 const text=m.preparedReply||getReply(m),title=m.subject||'Incoming '+m.channel;
 return `<div class="day-feature" data-message-id="${h(m.id)}"><div class="focus-topline"><span class="day-scope">1 · RESPOND TO ENQUIRIES</span>${m.triage==='Urgent'?tag('Urgent response','hot'):tag(m.channel,'teal')}</div><div class="day-person">${h(p?.name||'Enquirer')}</div><div class="day-prop">${h(m.channel)} · ${h(title)}${d?' · '+h(d.address):''}</div><div class="day-nextwhy"><b>Their message:</b> ${h(m.last)}</div><div class="day-reply-label">GEEVEE HAS PREPARED THIS RESPONSE</div>${editing?`<textarea class="day-reply-edit" id="day-edit-${h(m.id)}" aria-label="Edit GeeVee's reply">${h(text)}</textarea>`:`<div class="day-reply">${h(text)}</div>`}<div class="day-actions">${editing?action('Save changes','dayReplySave',m.id,'primary')+action('Cancel','dayReplyCancel',m.id,''):action('✓ Approve','dayReplyApprove',m.id,'primary')+action('✎ Edit','dayReplyEdit',m.id,'')+action('Ignore','dayReplyIgnore',m.id,'')+action('Reschedule','dayReplySchedule',m.id,'')}</div>${scheduling?`<div class="day-nextwhy"><b>Bring this message back for review:</b><div class="day-inline-bar">${action('Tomorrow','dayReplyTomorrow',m.id,'')}${action('Next week','dayReplyWeek',m.id,'')}${action('Cancel','dayReplyCancelSchedule',m.id,'')}</div><div class="day-muted-note">This postpones reviewing the reply, not the external message.</div></div>`:''}<div class="day-muted-note">This is a demonstration: Approve records an agent decision only. It does not send the reply.</div></div>`;
}
function dayWorkCard(x){if(!x)return `<div class="day-feature"><h3>Ready for another opportunity?</h3><p>GeeVee will refresh from verified CRM activity. It should not invent leads or repeatedly message people just to fill the day.</p></div>`;
 const p=(x.ref?.contactId?findP(x.ref.contactId):x.ref),d=x.kind==='listing'||x.kind==='buyer'?x.ref:findD(x.ref?.dealId);
 if(x.kind==='action')return decisionCard(x.ref);
 if(x.kind==='message')return dayMessageCard(x.ref);
 if(x.kind==='meta')return `<div class="day-feature"><div class="focus-topline"><span class="day-scope">2 · CONTACT META LEADS</span>${x.ref.role==='seller'||x.ref.role==='both'?tag('Seller first','hot'):tag('Other lead','teal')}</div><div class="day-person">${h(x.ref.name)}</div><div class="day-prop">${h(x.ref.suburb)} · ${h(x.ref.source)} lead · ${h(x.ref.phone)}</div><div class="day-nextwhy"><b>GeeVee’s talking point:</b> ${h(x.ref.note||'Introduce yourself and qualify their property plans.')}</div><div class="day-actions">${action(`${ico('phone','sm')} Call in DOMA`,'dayCall',x.ref.id,'primary')}${action('Next person','dayNext','','')}</div><div class="day-muted-note">Seller leads take priority over other Meta enquiries. Recording and live transcription require a production telephony connection and appropriate consent.</div></div>`;
 if(x.kind==='task')return `<div class="day-feature"><div class="focus-topline"><span class="day-scope">3 · REMINDERS</span>${tag(x.ref.priority,x.ref.priority==='Urgent'?'hot':'teal')}</div><div class="day-person">${h(x.ref.title)}</div><div class="day-prop">${h(personName(x.ref.contactId))} · Due ${h(x.ref.due)}${d?' · '+h(d.address):''}</div><div class="day-nextwhy"><b>Why now:</b> ${h(x.ref.origin||'An existing reminder in your CRM.')}. This is a task you or GeeVee previously scheduled.</div><div class="day-actions">${x.ref.category==='Call'&&x.ref.contactId?action(`${ico('phone','sm')} Call in DOMA`,'dayCall',x.ref.contactId,'primary'):action('✓ Mark done','dayTaskDone',x.ref.id,'primary')}${x.ref.category==='Call'?action('✓ Mark done','dayTaskDone',x.ref.id,''):''}${action('Next reminder','dayNext','','')}</div><div class="day-muted-note">Tasks are only completed when you confirm the work was done; skipping does not close them.</div></div>`;
 if(x.kind==='listing')return `<div class="day-feature"><div class="focus-topline"><span class="day-scope">4 · LISTING OPPORTUNITY</span>${x.ref.risk?tag('Needs attention','hot'):tag(x.ref.stage,'teal')}</div><div class="day-person">${h(personName(x.ref.contactId))}</div><div class="day-prop">${h(x.ref.address+', '+x.ref.suburb)} · ${h(x.ref.stage)}</div><div class="day-nextwhy"><b>Why GeeVee selected this:</b> ${h(x.ref.why)}. Next suggested step: ${h(x.ref.next)}.<br><b>${aud(comm(x.ref))} estimated gross commission</b> if won, based on sample price and fee.</div><div class="day-actions">${action(`${ico('phone','sm')} Call seller`,'dayCall',x.ref.contactId,'primary')}${action('Prepare seller follow-up','dayListingDraft',x.ref.id,'')}${action('Next opportunity','dayNext','','')}</div><div class="day-muted-note">Urgency and opportunity are illustrative, not a prediction or promised commission.</div></div>`;
 if(x.kind==='buyer')return `<div class="day-feature"><div class="focus-topline"><span class="day-scope">5 · BUYER MATCHING</span>${tag('Check preferences before sending','teal')}</div><div class="day-person">${h(x.ref.address)}</div><div class="day-prop">${h(x.ref.suburb)} · ${h(x.ref.stage)} · ${x.ref.buyerMatches} possible buyer matches (sample)</div><div class="day-nextwhy"><b>GeeVee's work:</b> Compare buyer requirements with this listing, verify suitability, then prepare a tailored text or email for the agent's approval.</div><div class="day-actions">${action('Prepare buyer message','dayBuyerDraft',x.ref.id,'primary')}${action('View property','openDeal',x.ref.id,'')}${action('Next match','dayNext','','')}</div><div class="day-muted-note">The original export has buyer matching tools. This demonstration does not verify real buyer preferences or send messages.</div></div>`;
 return `<div class="day-feature"><div class="focus-topline"><span class="day-scope">6 · MORE PRODUCTIVE WORK</span>${tag(x.kind==='research'?'Internal research':'Important review','teal')}</div><div class="day-person">${h(x.ref.title)}</div><div class="day-nextwhy">${h(x.kind==='research'?x.ref.description:x.ref.body||'Review the details GeeVee prepared.')}</div><div class="day-actions">${x.kind==='research'?action('✓ Complete internal review','dayResearchDone',String(x.ref.id),'primary'):action('Review decision','openApproval',x.ref.id,'primary')}${action('Next useful task','dayNext','','')}</div><div class="day-muted-note">GeeVee should generate real eligible opportunities from current data. It should never manufacture leads or contact people without permission.</div></div>`;
}
function dayFocus(){const x=dayCurrent(),agenda=dayNextAppointment(),counts=dayCounts();const min=agenda?agenda.clock-(new Date().getHours()*60+new Date().getMinutes()):999;return `<div class="focus-topline"><span class="focus-step">GeeVee · Start my day</span>${tag('One clear action at a time','teal')}</div><div class="focus-tip">First, your calendar is visible on Today. Now follow the work in your chosen order: enquiries → Meta leads → reminders → sellers → buyers → everything else.</div><div class="focus-progress">${counts.map(q=>`<div class="${x&&q.id<=x.lane?'done':''}"></div>`).join('')}</div><div class="focus-appointment">${ico('calendar','sm')} <div><b>Today's diary:</b> ${DAY_SAMPLE_APPOINTMENTS.length} appointments, including ${DAY_SAMPLE_APPOINTMENTS.filter(e=>e.kind==='In person').length} in person. Next sample diary item: <b>${agenda?h(agenda.time+' '+agenda.title):'No further sample entries today'}</b>. ${min>=0&&min<=30?'<b>Starts soon, allow time to travel or prepare.</b>':'All appointments are listed on Today.'}</div></div><div class="focus-current"><div class="focus-topline"><span class="focus-step">${x?'Priority '+x.lane+' of 6 · '+DAY_LANES[x.lane-1].label:'Ready for useful work'}</span><span class="day-upnext">Next action ready</span></div>${dayWorkCard(x)}</div><div class="focus-footer"><div class="focus-tip">${x?.kind==='message'||x?.kind==='action'?'Approve, edit, ignore or reschedule this item.':'Complete the work, or use Next to keep moving.'}<br>Every action shown is simulated.</div><div class="day-inline-bar">${action('Return to Today','close','','')}${action('Next →','dayNext','','primary')}</div></div>`}
function dayBriefResponseSummary(){return `<div class="day-insight"><h3>${ico('messages','sm')} Incoming requests</h3>${state.messages.filter(m=>dayMessageEligible(m)).slice(0,4).map(m=>`<div class="tiny-row"><div><b>${h(personName(m.contactId))}</b><div style="color:#5a727a;font-size:12px;margin-top:3px">${h(m.channel)} · ${h(m.subject)}</div></div>${m.triage==='Urgent'?tag('Urgent','hot'):tag('Unread','teal')}</div>`).join('')||'<p class="small muted">No unreviewed new enquiries in the sample.</p>'}<div class="day-muted-note">GeeVee writes drafts in the order of urgency. Replies appear on Today and in the guided queue.</div></div>`}
const PREVIOUS_queueCentreGuided=queueCentre;
queueCentre=function(){return PREVIOUS_queueCentreGuided().replace('Your decisions, ready to make','Needs your approval').replace('Read it here. You don\'t have to open another screen.','Approve, edit, ignore or reschedule, without opening another page.')};
const PREVIOUS_todayGuided=today;
today=function(){const s=stats(),next=dayCurrent(),counts=dayCounts();return `${sectionHeader('Good morning, Caleb','Your appointments first. Then GeeVee guides you through everything that matters today.',action(`${ico('grid')} More tools`,'route','more',''))}${dayAgenda()}<section class="day-hero"><small>✦ GEEVEE · YOUR DAILY ASSISTANT</small><h2>You focus on conversations. I’ll organise the rest.</h2><p>You have <b>${counts[0].count} replies or message approvals</b>, <b>${counts[1].count} Meta leads</b>, and <b>${counts[2].count} reminders</b> ahead of new listing opportunities and buyer matching. I'll always have a useful next step when there is eligible work to do.</p><div class="day-hero-actions">${action(`${ico('play')} Start my day`,'startDay','','primary big')}${action(`${ico('phone')} Call people`,'route','calls','big')}${action('More tools','route','more','big')}</div><div class="day-hero-note">Start My Day includes approvals, messages, Meta leads, reminders, seller opportunities, buyer matching and other work, all in one sequence.</div></section><div class="day-section-header"><h2>Your work, in this order</h2>${tag('Always prioritised','teal')}</div>${dayLaneBar()}<div class="day-split"><div class="day-stack"><section class="card pad"><div class="day-section-header"><h2>GeeVee recommends doing this next</h2>${next?tag('Priority '+next.lane,'teal'):tag('All caught up','green')}</div><p class="day-context">Everything is prepared so you can work straight from Today. For the full one-at-a-time flow, press Start my day.</p>${dayWorkCard(next)}<div class="day-inline-bar">${action('Continue with Start My Day →','startDay','','primary big')}${action('Next suggestion','dayNext','','')}</div></section><section id="decision-centre">${queueCentre()}</section></div><aside class="day-stack">${dayBriefResponseSummary()}<div class="day-insight"><h3>${ico('target','sm')} Revenue opportunities</h3><div class="tiny-row"><span>Active potential gross commission</span><strong>${abbrev(s.potential)}</strong></div><div class="tiny-row"><span>Properties requiring attention</span><strong>${s.risk}</strong></div><div class="tiny-row"><span>Unread conversations</span><strong>${s.unread}</strong></div><div class="tiny-row"><span>Waiting agent approval</span><strong>${s.approvals}</strong></div><div class="day-muted-note">Commission is illustrative, not booked or guaranteed. GeeVee places messages, leads and reminders above these longer-term opportunities.</div></div><div class="day-insight"><h3>${ico('shield','sm')} How GeeVee works</h3><p class="small muted" style="line-height:1.7">GeeVee prepares messages and internal tasks. Agents decide on consequential communications and protected actions. If an urgent new enquiry arrives, it moves to the front of the next available work slot without interrupting an in-person appointment.</p>${action('View every conversation','route','messages','sm')}</div></aside></div>`}
const PREVIOUS_focusModal=focusModal;
focusModal=function(){return dayFocus()};
const PREVIOUS_saveCall=saveCall;
saveCall=function(pId){const shouldReturn=ui.dayReturn;ui.dayReturn=false;PREVIOUS_saveCall(pId);if(shouldReturn){ui.dayVisited.push('meta:'+pId);ui.modal={type:'focus'};ui.route='today';render();toast('Call recap saved in the demo. GeeVee has your next task ready.')}};
const PREVIOUS_doActionGuided=doAction;
doAction=function(name,id){
 dayEnsure();
 const msg=getMsg(id);
 const back=()=>{persist();render()};
 const reviewedMsg=(m,status)=>{m.dayHandled=status;m.unread=false;delete m.dayReviewAtISO;ui.dayEditing='';ui.dayScheduling='';audit('communication','GeeVee reply '+status.toLowerCase()+' for '+personName(m.contactId),'Agent decided on a drafted reply; offline simulation, nothing sent.');back();};
 switch(name){
 case 'startDay':ui.dayVisited=[];ui.dayEditing='';ui.dayScheduling='';ui.modal={type:'focus'};ui.route='today';render();return;
 case 'dayNext':{const x=dayCurrent();if(x){ui.dayVisited.push(x.key)}else{state.dayWork.researchIndex=(state.dayWork.researchIndex+1)%DAY_MARKET_TASKS.length;ui.dayVisited=ui.dayVisited.filter(k=>!k.startsWith('research:'));}ui.dayEditing='';ui.dayScheduling='';render();return;}
 case 'dayCall':ui.dayReturn=ui.modal?.type==='focus';return PREVIOUS_doActionGuided('call',id);
 case 'dayTaskDone':return PREVIOUS_doActionGuided('taskDone',id);
 case 'dayReplyEdit':ui.dayEditing=ui.dayEditing===id?'':id;ui.dayScheduling='';render();document.getElementById('day-edit-'+id)?.focus();return;
 case 'dayReplyCancel':ui.dayEditing='';render();return;
 case 'dayReplySave':if(!msg)return;{const text=document.getElementById('day-edit-'+id)?.value.trim();if(!text){toast('Please enter a response before saving.');return;}msg.preparedReply=text;ui.dayEditing='';audit('draft','Agent edited GeeVee reply for '+personName(msg.contactId),'Saved a new draft. Nothing sent.');back();toast('Revised message saved. Review or approve when ready.');return;}
 case 'dayReplyApprove':if(!msg||!dayMessageEligible(msg))return;{const draft=msg.preparedReply||getReply(msg);const a=addAction({messageId:msg.id,type:msg.channel==='SMS'?'SMS':msg.channel==='Portal enquiry'?'Portal reply':'Email',title:'Approve response to '+personName(msg.contactId),body:draft,contactId:msg.contactId,dealId:msg.dealId,tier:'A2'});a.status='Reviewed · not sent';a.approvedBy='Caleb Richards · demo';a.reviewedAt=new Date().toISOString();reviewedMsg(msg,'Approved');toast('Approved in the demo. No message was sent.');return;}
 case 'dayReplyIgnore':if(!msg)return;reviewedMsg(msg,'Ignored');toast('Ignored for now. No reply sent.');return;
 case 'dayReplySchedule':ui.dayScheduling=ui.dayScheduling===id?'':id;ui.dayEditing='';render();return;
 case 'dayReplyCancelSchedule':ui.dayScheduling='';render();return;
 case 'dayReplyTomorrow':case 'dayReplyWeek':if(!msg)return;{const d=new Date();d.setDate(d.getDate()+(name==='dayReplyTomorrow'?1:7));msg.dayReviewAtISO=d.toISOString();ui.dayScheduling='';audit('reminder','Review postponed for '+personName(msg.contactId),'Review only, not a scheduled outbound send.');back();toast('Reply review rescheduled. Nothing will send automatically.');return;}
 case 'dayListingDraft':{const d=findD(id);if(!d)return;state.dayWork.opportunityPrepared[id]=true;addAction({type:'SMS',title:'Seller opportunity follow-up · '+d.address,body:`Hi ${personName(d.contactId).split(' ')[0]}, I wanted to follow up about ${d.address}. Would you be available for a quick chat about your property plans? Kind regards, Caleb`,contactId:d.contactId,dealId:d.id,tier:'A2'});audit('opportunity','GeeVee prepared listing follow-up for '+d.address,'Awaiting agent approval. Nothing sent.');back();toast('Seller follow-up is ready for review at the top of the queue.');return;}
 case 'dayBuyerDraft':{const d=findD(id);if(!d)return;const buyer=state.people.find(p=>(p.role==='buyer'||p.role==='both')&&p.consent==='ok'&&p.suburb===d.suburb)||state.people.find(p=>(p.role==='buyer'||p.role==='both')&&p.consent==='ok');if(!buyer){toast('No eligible buyer contact in this demo.');return;}state.dayWork.buyerPrepared[id]=true;addAction({type:'SMS',title:'Buyer property suggestion · '+d.address,body:`Hi ${buyer.name.split(' ')[0]}, we have a property at ${d.address}, ${d.suburb} that may be worth looking at. I will check the details against your preferences before sending further information. Would you like a quick conversation? Regards, Caleb`,contactId:buyer.id,dealId:d.id,tier:'A2'});audit('buyer','GeeVee prepared buyer introduction for '+d.address,'Candidate match must be verified before real sending.');back();toast('Buyer message drafted for approval. Suitability still needs checking.');return;}
 case 'dayResearchDone':{state.dayWork.researchIndex=(Number(id)+1)%DAY_MARKET_TASKS.length;ui.dayVisited.push('research:'+id);audit('research','Internal review noted: '+DAY_MARKET_TASKS[Number(id)][0],'Fictional workflow only. No live search or data change.');back();toast('Internal review recorded. GeeVee has another useful task.');return;}
 default:return PREVIOUS_doActionGuided(name,id);
 }
};
const PREVIOUS_renderGuided=render;
render=function(){dayEnsure();return PREVIOUS_renderGuided()};


/* ================================================================
 GeeVee Next Best Action layer: simulated unified CRM signal engine.
 External send, property sales, price changes and recording DO NOT occur.
 ================================================================ */
const GV_DEMO_OFFERS=[
 {id:'O-701',dealId:'D-2006',buyerId:'C-1005',vendorId:'C-1021',amount:1015000,guideAtReceipt:1040000,deposit:'10%',finance:'Subject to finance · 14 days',settlement:'60 days',conditions:'Building and pest inspection within 7 days',received:'Today 8:38am',deadline:'Today 5:00pm',status:'New',history:['Written buyer offer received through connected CRM (sample)'],source:'Offer register · sample record'},
 {id:'O-702',dealId:'D-2009',buyerId:'C-1017',vendorId:'C-1006',amount:1290000,guideAtReceipt:1314000,deposit:'10%',finance:'Unconditional finance',settlement:'45 days',conditions:'Subject to contract review',received:'Today 8:53am',deadline:'Today 6:00pm',status:'New',history:['Buyer’s written terms entered into the sample offer register'],source:'Agent-entered offer · sample record'}
];
const GV_DEMO_MARKET={
 'D-2028':{days:45,views:286,enquiries:5,inspections:2,offers:0,updated:'Today 8:12am',comps:[['18 Frederick Street, Preston',1510000,'2 Oct 2026'],['36 Wood Street, Preston',1480000,'17 Oct 2026'],['9 Regent Street, Preston',1530000,'29 Oct 2026']],source:'Listing analytics + example comparable-sales records (not verified real sales)',reviewed:false},
 'D-2013':{days:38,views:192,enquiries:4,inspections:3,offers:0,updated:'Today 8:08am',comps:[['7 Marshall Street, Alphington',1515000,'4 Sep 2026'],['21 Hutton Avenue, Alphington',1495000,'12 Oct 2026'],['4 Lewis Street, Alphington',1540000,'30 Oct 2026']],source:'Listing analytics + example comparable-sales records (not verified real sales)',reviewed:false}
};
const GV_DEMO_BUYER_ACTIVITY=[
 {id:'BA-01',contactId:'C-1007',dealId:'D-2006',views:7,days:4,saves:2,last:'Today 7:45am',source:'Buyer portal activity · fictional example',reviewed:false},
 {id:'BA-02',contactId:'C-1016',dealId:'D-2013',views:5,days:3,saves:1,last:'Yesterday 8:00pm',source:'Buyer portal activity · fictional example',reviewed:false}
];
ui.gvOfferChoice='';ui.gvOfferId='';ui.gvReason='';
const gvPrevDayEnsure=dayEnsure;
dayEnsure=function(){gvPrevDayEnsure();if(!state.offers)state.offers=structuredClone(GV_DEMO_OFFERS);if(!state.marketSignals)state.marketSignals=structuredClone(GV_DEMO_MARKET);if(!state.buyerActivity)state.buyerActivity=structuredClone(GV_DEMO_BUYER_ACTIVITY);if(!state.gvEvents)state.gvEvents=[];};
function gvStamp(label,detail){state.gvEvents.unshift({at:'Just now',label,detail});state.gvEvents=state.gvEvents.slice(0,30);audit('GeeVee signal',label,detail);persist()}
function gvOffer(id){return state.offers.find(o=>o.id===id)}
function gvMarket(id){return state.marketSignals[id]}
function gvBuyerActivity(id){return state.buyerActivity.find(x=>x.id===id)}
function gvPendingOffers(){return state.offers.filter(o=>o.status==='New'&&!o.reviewAfter).length}
function gvMessageThread(m){const thread=Array.isArray(m?.thread)&&m.thread.length?m.thread:[{from:'them',text:m.last,when:m.time}];return `<div class="gv-context"><div class="gv-context-head">${ico('messages','sm')} Original ${h(m.channel)} enquiry · ${h(m.subject||'Conversation')} · ${h(m.time||'')}</div><div class="gv-context-body">${thread.map(t=>`<div class="gv-thread-message ${t.from==='us'?'out':''}"><div class="gv-thread-meta">${t.from==='us'?'Agent / agency':'Client'} · ${h(t.when||'')}</div>${h(t.text)}</div>`).join('')}</div></div>`}
function gvOriginalForAction(a){if(a.messageId)return getMsg(a.messageId);const matching=state.messages.filter(m=>m.contactId===a.contactId&&(!a.dealId||!m.dealId||m.dealId===a.dealId));return matching.find(m=>m.dealId===a.dealId)||null}
const gvPrevDecision=decisionCard;
decisionCard=function(a){let html=gvPrevDecision(a);const isExternal=['SMS','Email','Portal reply','Portal enquiry'].includes(a.type);if(isExternal){const original=gvOriginalForAction(a);const block=original?gvMessageThread(original):`<div class="gv-meta-inline"><b>Original enquiry:</b> Not linked to this prepared action in the sample CRM. Before sending in production, GeeVee must resolve the original communication and verify the recipient.</div>`;html=html.replace('<div class="decision-info">',block+'<div class="decision-info">');html=html.replace('✓ Approve</button>','Approve &amp; Send</button>').replace('Save &amp; approve</button>','Save &amp; Send</button>').replace('Save & approve</button>','Save &amp; Send</button>');}
 if(a.offerId)html=html.replace('<div class="decision-info">',`<div class="gv-meta-inline"><b>Linked offer:</b> ${h(a.offerId)} · ${h(a.purpose||'Buyer / vendor negotiation')} · Approval records the reviewed draft only in this offline demo.</div><div class="decision-info">`);
 return html;};
const gvPrevMessageCard=dayMessageCard;
dayMessageCard=function(m,mode='focus'){
 let html=gvPrevMessageCard(m,mode);
 // Replace the short latest-message excerpt with the full available CRM thread.
 const start=html.indexOf('<div class="day-nextwhy"><b>Their message:</b>');
 const end=start<0?-1:html.indexOf('</div>',start);
 if(start>=0&&end>=0)html=html.slice(0,start)+gvMessageThread(m)+html.slice(end+6);
 html=html.replace('✓ Approve</button>','Approve &amp; Send</button>');
 return html;
};
function gvOfferCard(o){const d=findD(o.dealId),buyer=findP(o.buyerId),vendor=findP(o.vendorId),pct=d?Math.round((o.amount-d.guide)/d.guide*1000)/10:0;const selected=ui.gvOfferId===o.id?ui.gvOfferChoice:'';const choiceLabel=({accept:'Accept',decline:'Decline',counter:'Counter'})[selected]||'';
 return `<div class="day-feature" data-offer-id="${h(o.id)}"><div class="gv-offer-heading"><span class="gv-offer-badge">URGENT · NEW BUYER OFFER</span>${tag('Respond before '+o.deadline,'hot')}</div><div class="day-person" style="margin-bottom:2px">${h(d?.address||'Property')}, ${h(d?.suburb||'')}</div><div class="day-prop">Buyer: <b>${h(buyer?.name)}</b> · Vendor: <b>${h(vendor?.name)}</b></div><div class="gv-offer-money">${aud(o.amount)} <span style="font-size:12px;font-weight:650;color:#627982">written buyer offer</span></div><div class="day-prop">Current guide ${aud(d?.guide||o.guideAtReceipt)} · ${pct>0?'+':''}${pct}% relative to guide · Received ${h(o.received)}</div><div class="gv-offer-terms"><div class="gv-offer-term"><span>Deposit</span><b>${h(o.deposit)}</b></div><div class="gv-offer-term"><span>Finance / conditions</span><b>${h(o.finance)}</b></div><div class="gv-offer-term"><span>Settlement</span><b>${h(o.settlement)}</b></div></div><div class="gv-meta-inline"><b>Other stated condition:</b> ${h(o.conditions)}<br><b>Source:</b> ${h(o.source)} · Demonstration only. Verify written offer, deadline and conditions.</div><div class="gv-advice"><b>✦ GeeVee's recommendation</b><div>Present the full offer and conditions to the vendor promptly. Ask the buyer whether this is their best and final offer where appropriate. Confirm their finance position and flexibility on settlement. Do not promise acceptance or a price change without the seller’s instructions.</div></div><div class="gv-actions">${action('Email offer to vendor','gvPresentVendor',o.id,'primary')}${action('Ask buyer for best & final','gvBestFinal',o.id,'')}${action('Call buyer','gvCallBuyer',o.id,'')}${action('Call vendor','gvCallVendor',o.id,'')}</div><div class="gv-actions" style="margin-top:7px">${action('Accept','gvOfferAccept',o.id,'')}${action('Decline','gvOfferDecline',o.id,'')}${action('Counter offer','gvOfferCounter',o.id,'')}</div>${selected?`<div class="gv-choice-panel"><b>${h(choiceLabel)} · Record verified seller instructions</b><p class="small muted" style="margin-top:5px">GeeVee can prepare the buyer response, but cannot decide or bind the vendor. Document the vendor's exact instructions first.</p>${selected==='counter'?`<label for="gv-offer-price-${h(o.id)}">Vendor-instructed counter amount (AUD)</label><input id="gv-offer-price-${h(o.id)}" type="number" min="1" step="1000" value="${o.amount+20000}">`:''}<label><input id="gv-verify-vendor-${h(o.id)}" type="checkbox"> I have personally confirmed the vendor's instructions and checked the offer terms.</label><div class="gv-warning">This only creates a protected draft for review. No offer is legally accepted, declined or countered, and no buyer is contacted in this offline demo.</div><div class="gv-actions">${action('Prepare '+choiceLabel.toLowerCase()+' response','gvOfferConfirm',o.id,'primary')}${action('Cancel','gvOfferCancel',o.id,'')}</div></div>`:''}<div class="day-muted-note">Offer register signal · This is not a binding transaction or contract. Agency approval and jurisdiction-specific processes apply.</div></div>`}
function gvMarketCard(d,signal){const avg=Math.round(signal.comps.reduce((n,x)=>n+x[1],0)/signal.comps.length);const diff=((d.guide-avg)/avg*100).toFixed(1);return `<div class="day-feature" data-market-id="${h(d.id)}"><span class="day-scope">4 · LISTING NEEDS A PLAN</span> ${tag('Price review candidate','hot')}<div class="day-person">${h(d.address)}, ${h(d.suburb)}</div><div class="gv-signal-stats"><span class="gv-signal-stat">${signal.days} days on market</span><span class="gv-signal-stat">${signal.views} portal views</span><span class="gv-signal-stat">${signal.enquiries} enquiries</span><span class="gv-signal-stat">${signal.offers} offers</span></div><div class="gv-advice"><b>✦ GeeVee suggests:</b> This listing has been on market ${signal.days} days with ${signal.offers} recorded offers. Consider a vendor conversation about pricing and marketing, supported by verified comparable sales. The guide ${aud(d.guide)} is ${diff}% above the average of these illustrative candidate sales; that alone does not prove overpricing.</div><div class="gv-context"><div class="gv-context-head">Candidate comparable sales · Verify using Sales CMA before presenting</div><table class="gv-comp-table"><thead><tr><th>Property</th><th>Sale price</th><th>Date</th></tr></thead><tbody>${signal.comps.map(c=>`<tr><td>${h(c[0])}</td><td>${aud(c[1])}</td><td>${h(c[2])}</td></tr>`).join('')}</tbody></table></div><div class="gv-source">Sources: ${h(signal.source)}. All prices and sales above are fictional demo values, not verified actual transactions. Comparable quality and property differences require agent review.</div><div class="gv-actions">${action('Call owner','gvCallMarketVendor',d.id,'primary')}${action('Prepare vendor review','gvDraftPriceReview',d.id,'')}${action('Open Sales CMA','legacy','cma','')}${action('View property','openDeal',d.id,'')}</div></div>`}
function gvEngagementCard(x){const d=findD(x.dealId),p=findP(x.contactId);return `<div class="day-feature" data-engagement-id="${h(x.id)}"><span class="day-scope">5 · HIGHLY ENGAGED BUYER</span> ${tag('Follow up today','teal')}<div class="day-person">${h(p?.name||'Buyer')}</div><div class="day-prop">Interested in ${h(d?.address||'Property')}, ${h(d?.suburb||'')}</div><div class="gv-signal-stats"><span class="gv-signal-stat">${x.views} property views in ${x.days} days</span><span class="gv-signal-stat">Saved ${x.saves} times</span><span class="gv-signal-stat">Last visit ${h(x.last)}</span></div><div class="gv-advice"><b>✦ GeeVee suggests:</b> Call ${h(p?.name?.split(' ')[0]||'the buyer')} while the property is top of mind. Ask whether they'd like another inspection, have feedback about the guide or want information about making an offer. Repeated views are an engagement signal, not proof they're ready to buy.</div><div class="gv-source">${h(x.source)} · Check contact permissions and buyer identity before outreach.</div><div class="gv-actions">${action('Call buyer in DOMA','gvCallEngagedBuyer',x.id,'primary')}${action('Prepare personal SMS','gvEngagedDraft',x.id,'')}${action('Open contact','openPerson',x.contactId,'')}</div></div>`}
const gvOldDayWorkCard=dayWorkCard;
dayWorkCard=function(x){if(!x)return gvOldDayWorkCard(x);if(x.kind==='offer')return gvOfferCard(x.ref);if(x.kind==='rescue')return gvMarketCard(x.ref,gvMarket(x.ref.id));if(x.kind==='engaged')return gvEngagementCard(x.ref);if(x.kind==='message')return dayMessageCard(x.ref);return gvOldDayWorkCard(x)};
const gvOldDayQueueRaw=dayQueueRaw;
dayQueueRaw=function(){dayEnsure();const q=gvOldDayQueueRaw();for(const o of state.offers.filter(o=>o.status==='New'&&!o.reviewAfter))q.push({lane:0,kind:'offer',key:'offer:'+o.id,ref:o,score:0});for(const d of state.deals.filter(d=>d.active&&['Listed','For sale'].includes(d.stage)&&gvMarket(d.id)&&!gvMarket(d.id).reviewed)){const idx=q.findIndex(x=>x.key==='listing:'+d.id);if(idx>=0)q.splice(idx,1);q.push({lane:4,kind:'rescue',key:'rescue:'+d.id,ref:d,score:-100});}for(const ba of state.buyerActivity.filter(x=>!x.reviewed&&findP(x.contactId)?.consent==='ok'))q.push({lane:5,kind:'engaged',key:'engaged:'+ba.id,ref:ba,score:-100-ba.views});return q.sort((a,b)=>a.lane-b.lane||a.score-b.score||a.key.localeCompare(b.key))};
const gvOldDayLaneBar=dayLaneBar;
dayLaneBar=function(){const n=gvPendingOffers();return (n?`<div class="gv-critical" role="status"><div>${ico('alert','lg')}</div><div style="flex:1"><strong>${n} new buyer offer${n===1?'':'s'} needs attention first</strong><p>GeeVee will present urgent offers ahead of routine replies, without cancelling your six daily priorities. Buyer and vendor decisions remain yours.</p>${action('Review offer now','startDay','','primary')}</div></div>`:'')+gvOldDayLaneBar()};
const gvOldDayFocus=dayFocus;
dayFocus=function(){const x=dayCurrent(),agenda=dayNextAppointment();const stamp=x?.lane===0?'URGENT OFFER · DECISION REQUIRED':x?'PRIORITY '+x.lane+' OF 6 · '+DAY_LANES[x.lane-1].label:'READY FOR THE NEXT OPPORTUNITY';return `<div class="focus-topline"><span class="focus-step">GeeVee · Start my day</span>${tag('One decision at a time','teal')}</div><div class="focus-tip">Offer negotiations are escalated immediately. Otherwise: replies → Meta seller leads → reminders → listing opportunities → buyer matching → other useful work. Your diary stays protected.</div><div class="focus-progress">${dayCounts().map(q=>`<div class="${x&&q.id<=x.lane?'done':''}"></div>`).join('')}</div><div class="focus-appointment">${ico('calendar','sm')} <div><b>Today:</b> ${DAY_SAMPLE_APPOINTMENTS.length} appointments. Next sample appointment: <b>${agenda?h(agenda.time+' · '+agenda.title):'No further appointments'}</b>. See the full diary on Today; allow preparation and travel time.</div></div><div class="focus-current"><div class="focus-topline"><span class="focus-step">${h(stamp)}</span>${x?.kind==='offer'?tag('Immediate attention','hot'):tag('Next action ready','teal')}</div>${dayWorkCard(x)}</div><div class="focus-footer"><div class="focus-tip">GeeVee prepares work. You remain in control of external communications and commercial instructions.<br>All data and outcomes are simulated.</div><div class="day-inline-bar">${action('Return to Today','close','','')}${action('Next →','dayNext','','primary')}</div></div>`};
function gvSignalSummary(){dayEnsure();const live=state.offers.filter(o=>o.status==='New'),m=gvMarket('D-2028'),buyers=state.buyerActivity.filter(x=>!x.reviewed);return `<section class="gv-signal-section"><div class="gv-signal-head"><h2>✦ GeeVee has spotted</h2><span class="gv-feed"><i></i> Simulated CRM signal checks · offers · listings · buyer activity</span></div><div class="gv-signal-grid"><div class="gv-signal-tile urgent"><div class="eyebrow">OFFERS · NEED YOUR DIRECTION</div><h3>${live.length?`${live.length} buyer offer${live.length===1?'':'s'} requiring action`:'All incoming offers reviewed'}</h3><p>${live.length?'Review the buyer’s conditions, present the offer to the vendor and decide whether to request their best and final offer.':'New offers will return here when received.'}</p><div class="gv-signal-stats"><span class="gv-signal-stat">${live.length} open</span>${live.length?`<span class="gv-signal-stat">${aud(live[0].amount)} latest sample offer</span>`:''}</div>${action('Review offers in Start My Day','startDay','','primary')} ${action('Simulate incoming offer','gvSimulateOffer','','')}</div><div class="gv-signal-tile"><div class="eyebrow">LISTING PERFORMANCE · PRICE REVIEW</div><h3>77 Park Street, Preston</h3><p>${m.days} days on market, ${m.enquiries} enquiries, ${m.offers} offers. GeeVee recommends checking comparable sales and discussing the results with the vendor.</p><div class="gv-signal-stats"><span class="gv-signal-stat">${m.days} days</span><span class="gv-signal-stat">${m.offers} offers</span></div>${action('Review comparable sales','gvGoMarket','D-2028','')}</div><div class="gv-signal-tile"><div class="eyebrow">BUYER INTENT · PROACTIVE FOLLOW UP</div><h3>${buyers.length} highly engaged buyers</h3><p>Repeated property views and saves suggest useful follow-up conversations. GeeVee can open each buyer with a talking point and a suggested message.</p><div class="gv-signal-stats"><span class="gv-signal-stat">${state.buyerActivity[0]?.views||0} repeat views · Jack Wilson</span></div>${action('Call interested buyer','gvCallEngagedBuyer','BA-01','')} ${action('Simulate another portal visit','gvSimulateView','','')}</div><div class="gv-signal-tile"><div class="eyebrow">WORKING ACROSS THE CRM</div><h3>One source of truth</h3><p>Signals from messages, prospecting, property records, offers, buyer activity and the diary are evaluated together in this demo. Production needs permission-aware events, integrations and reconciliation.</p><div class="gv-source">Sample signals are refreshed from local demo data when the UI changes. This HTML cannot continuously read your live CRM or run in the background.</div>${action('View activity history','moreTab','audit','')}</div></div></section>`}
const gvOldToday=today;
today=function(){let html=gvOldToday();html=html.replace('Your appointments first. Then GeeVee guides you through everything that matters today.','Your diary, live offers, replies and next-best opportunities, all in one place.');html=html.replace('<div class="day-section-header"><h2>Your work, in this order</h2>',gvSignalSummary()+'<div class="day-section-header"><h2>Your work, in this order</h2>');html=html.replace('ahead of new listing opportunities and buyer matching.','alongside '+gvPendingOffers()+' urgent buyer offers, listing rescues and buyer engagement signals.');html=html.replace('Start My Day includes approvals, messages, Meta leads, reminders, seller opportunities, buyer matching and other work','Start My Day escalates offers and guides messages, Meta leads, reminders, listing rescues, buyer engagement, matching and other work');return html};
const gvOldDoAction=doAction;
doAction=function(name,id){dayEnsure();const o=gvOffer(id),d=findD(id),buyerSig=gvBuyerActivity(id);const finish=(message)=>{persist();render();if(message)toast(message)};const queueMessage=(a,update)=>{const q=addAction(a);if(update)update();ui.gvOfferChoice='';ui.gvOfferId='';ui.dayVisited=[];finish('GeeVee prepared an approval on Today. Nothing has been sent.');return q};
 switch(name){
 case 'gvSimulateOffer':{const newId='O-'+Date.now();state.offers.unshift({id:newId,dealId:'D-2006',buyerId:'C-1030',vendorId:'C-1021',amount:1030000,guideAtReceipt:findD('D-2006')?.guide||1040000,deposit:'10%',finance:'Subject to finance · 7 days',settlement:'45 days',conditions:'Subject to contract review',received:'Just now',deadline:'Today 6:00pm',status:'New',history:['Fictional inbound offer event simulated in this browser'],source:'Simulated offer event · no real buyer contact'});ui.dayVisited=[];gvStamp('New buyer offer detected',newId+' · re-prioritised to top of Start My Day');finish('New fictional offer arrived. GeeVee will show it first.');return;}
 case 'gvSimulateView':{const sig=state.buyerActivity[0];sig.views++;sig.last='Just now';sig.reviewed=false;ui.dayVisited=ui.dayVisited.filter(x=>x!=='engaged:'+sig.id);gvStamp('Repeat buyer visit detected',personName(sig.contactId)+' · '+sig.views+' views of '+findD(sig.dealId)?.address);finish('Buyer portal visit simulated. The follow-up has been re-prioritised.');return;}
 case 'gvGoMarket':{ui.dayVisited=[];ui.modal={type:'focus'};const q=dayQueueRaw().find(x=>x.key==='rescue:'+id);if(q){ui.dayVisited=dayQueueRaw().filter(x=>x.key!==q.key).map(x=>x.key).filter(x=>false);/* focus keeps global priority; show dedicated review via modal */ui.modal={type:'gvMarket',id};render();}else{ui.modal={type:'deal',id};render();}return}
 case 'gvCallBuyer':if(o)return gvOldDoAction('dayCall',o.buyerId);return;
 case 'gvCallVendor':if(o)return gvOldDoAction('dayCall',o.vendorId);return;
 case 'gvCallMarketVendor':if(d)return gvOldDoAction('dayCall',d.contactId);return;
 case 'gvCallEngagedBuyer':if(buyerSig)return gvOldDoAction('dayCall',buyerSig.contactId);return;
 case 'gvPresentVendor':if(!o)return;{const prop=findD(o.dealId),first=personName(o.vendorId).split(' ')[0];queueMessage({type:'Email',offerId:o.id,purpose:'Present written buyer offer to vendor',title:'Offer received, '+(prop?.address||''),body:`Hi ${first},\n\nWe have received a written offer of ${aud(o.amount)} for ${prop?.address||'your property'}. The buyer has proposed a ${o.deposit} deposit, ${o.finance.toLowerCase()}, ${o.settlement.toLowerCase()} settlement, and the following condition: ${o.conditions}.\n\nPlease let me know when we can discuss the full terms. No decision has been made on your behalf.\n\nKind regards,\nCaleb`,contactId:o.vendorId,dealId:o.dealId,tier:'A2'},()=>{o.status='Vendor email drafted';o.history.push('Vendor presentation drafted; still requires approved actual delivery.');gvStamp('Vendor offer presentation prepared',o.id+' · '+(prop?.address||''));});return;}
 case 'gvBestFinal':if(!o)return;queueMessage({type:'Email',offerId:o.id,purpose:'Ask buyer for best and final offer',title:'Ask buyer for best and final · '+(findD(o.dealId)?.address||''),body:`Hi ${personName(o.buyerId).split(' ')[0]},\n\nThank you for your offer on ${findD(o.dealId)?.address||'the property'}. Before I present our next steps, would you please confirm whether ${aud(o.amount)} represents your best and final offer, and whether your conditions and proposed settlement are unchanged?\n\nKind regards,\nCaleb`,contactId:o.buyerId,dealId:o.dealId,tier:'A2'},()=>{o.status='Buyer follow-up drafted';o.history.push('Best-and-final request drafted; no external message sent.');gvStamp('Best-and-final request prepared',o.id);});return;
 case 'gvOfferAccept':case 'gvOfferDecline':case 'gvOfferCounter':if(!o)return;ui.gvOfferChoice=name==='gvOfferAccept'?'accept':name==='gvOfferDecline'?'decline':'counter';ui.gvOfferId=o.id;render();return;
 case 'gvOfferCancel':ui.gvOfferChoice='';ui.gvOfferId='';render();return;
 case 'gvOfferConfirm':if(!o)return;{const check=(document.querySelector('.overlay #gv-verify-vendor-'+id)||document.getElementById('gv-verify-vendor-'+id));if(!check?.checked){toast('Please confirm the seller’s explicit instructions before preparing this response.');return;}let amount=o.amount;const choice=ui.gvOfferChoice;if(choice==='counter'){amount=Number((document.querySelector('.overlay #gv-offer-price-'+id)||document.getElementById('gv-offer-price-'+id))?.value);if(!Number.isFinite(amount)||amount<=0){toast('Enter a valid counter amount.');return;}}if(!['accept','decline','counter'].includes(choice))return;const content=choice==='accept'?`Hi ${personName(o.buyerId).split(' ')[0]},\n\nFollowing our discussion with the vendor regarding your offer of ${aud(o.amount)} for ${findD(o.dealId)?.address}, we are preparing the next formal steps. This is not confirmation of a binding agreement; all necessary documentation and conditions remain subject to completion and verification.\n\nRegards, Caleb`:choice==='decline'?`Hi ${personName(o.buyerId).split(' ')[0]},\n\nThank you for your offer of ${aud(o.amount)} for ${findD(o.dealId)?.address}. Following the vendor's instructions, we are not proceeding with that offer. Please contact me if you would like to discuss another proposal.\n\nRegards, Caleb`:`Hi ${personName(o.buyerId).split(' ')[0]},\n\nThank you for your offer on ${findD(o.dealId)?.address}. Following the vendor's instructions, would you consider a revised offer of ${aud(amount)} on the agreed terms, subject to confirmation of all conditions and formal documents? Please let me know.\n\nRegards, Caleb`;queueMessage({type:'Email',offerId:o.id,purpose:'Vendor-instructed '+choice,title:'Review '+choice+' reply · '+findD(o.dealId)?.address,body:content,contactId:o.buyerId,dealId:o.dealId,tier:'A3'},()=>{o.status='Buyer decision draft';o.decision=choice;o.counterAmount=choice==='counter'?amount:null;o.vendorInstructionConfirmedDemo=true;o.history.push('Agent declared verified vendor instructions for '+choice+'. Pending protected approval; no external action taken.');gvStamp('Offer '+choice+' prepared',o.id+' · no binding acceptance or send');});return;}
 case 'gvDraftPriceReview':if(!d||!gvMarket(d.id))return;{ui.modal={type:'focus'};const v=gvMarket(d.id),comp=v.comps.map(x=>`${x[0]} (${aud(x[1])}, ${x[2]})`).join('; ');queueMessage({type:'Email',purpose:'Vendor campaign review and potential price discussion',title:'Vendor review · '+d.address,body:`Hi ${personName(d.contactId).split(' ')[0]},\n\nI would like to arrange a review of our campaign for ${d.address}. We have been on market for approximately ${v.days} days and have received ${v.enquiries} enquiries and ${v.offers} offers in this sample report.\n\nI will verify recent comparable sales and discuss pricing and marketing options with you before any changes are made. Candidate examples for review (not verified): ${comp}.\n\nWhen would suit you for a conversation?\n\nRegards, Caleb`,contactId:d.contactId,dealId:d.id,tier:'A2'},()=>{v.reviewed=true;gvStamp('Vendor price-review draft prepared',d.address+' · requires agent verification of CMA');});return;}
 case 'gvEngagedDraft':if(!buyerSig)return;{const x=buyerSig,prop=findD(x.dealId),p=findP(x.contactId);queueMessage({type:'SMS',purpose:'Buyer follow-up from portal engagement',title:'Engaged buyer · '+(prop?.address||'Property'),body:`Hi ${p.name.split(' ')[0]}, I wanted to check whether you'd like any more information or another inspection at ${prop?.address}, ${prop?.suburb}. Happy to discuss the property and answer your questions. Regards, Caleb`,contactId:x.contactId,dealId:x.dealId,tier:'A2'},()=>{x.reviewed=true;gvStamp('Buyer engagement follow-up drafted',p.name+' viewed '+prop?.address+' '+x.views+' times in '+x.days+' days');});return;}
 default:return gvOldDoAction(name,id);
 }
};
// Reuse the existing in-CRM modal for drill-down from active intelligence cards.
const gvPrevModal=modal;
modal=function(){if(ui.modal?.type==='gvMarket'){const d=findD(ui.modal.id),v=gvMarket(ui.modal.id);return `<div class="overlay"><div class="dialog wide" role="dialog" aria-modal="true" aria-label="GeeVee listing review"><div class="dialog-head"><div><div class="eyebrow">GeeVee · Listing performance</div><h2>${h(d?.address||'Listing review')}</h2></div><button class="close" data-action="close" aria-label="Close">${ico('close')}</button></div><div class="dialog-content">${d&&v?gvMarketCard(d,v):'Record unavailable'}</div></div></div>`;}return gvPrevModal();};

/* ============================================================
   DOMA Phase 2, One-list Today / Quiet appointment diary
   Presentation upgrade; reuses the linked sample CRM model.
   All sends/calls remain simulated in this standalone file.
   ============================================================ */
ui.streamExpanded='';
ui.streamVisible=10;
ui.streamCallKey='';
ui.streamHistory=false;
ui.streamDiaryOpen=false;
function streamEnsure(){
  dayEnsure();
  if(!state.dayWork.handled) state.dayWork.handled={};
  if(!state.dayWork.deferred) state.dayWork.deferred={};
}
function streamTomorrow(){const d=new Date();d.setDate(d.getDate()+1);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function streamIsDeferred(key){const until=state.dayWork.deferred?.[key];return !!until&&until>dayLocalStamp()}
function streamRank(x){
  if(x.kind==='offer') return 0; // A new written offer is an urgent decision.
  if(x.kind==='action')return x.ref?.tier==='A3'?1:2;
  if(x.kind==='message')return x.ref?.triage==='Urgent'?3:4;
  if(x.kind==='meta')return ['seller','both'].includes(x.ref?.role)?5:6;
  if(x.kind==='task')return 7;
  if(x.kind==='rescue')return 8;
  if(x.kind==='listing')return 9;
  if(x.kind==='engaged')return 10;
  if(x.kind==='buyer')return 11;
  return 12;
}
function streamQueue(){
  streamEnsure();
  return dayQueueRaw().filter(x=>!state.dayWork.handled[x.key]&&!streamIsDeferred(x.key))
    .sort((a,b)=>streamRank(a)-streamRank(b)||a.score-b.score||a.key.localeCompare(b.key));
}
function streamIsApproval(x){return ['offer','action','message'].includes(x.kind)}
function streamIsCall(x){return x.kind==='meta'||x.kind==='task'&&x.ref?.category==='Call'||x.kind==='rescue'||x.kind==='listing'||x.kind==='engaged'}
function streamBadge(x){
  if(x.kind==='offer')return tag('New offer','hot');
  if(x.kind==='action')return tag(x.ref.tier==='A3'?'Important approval':'Approve & Send',x.ref.tier==='A3'?'red':'yellow');
  if(x.kind==='message')return tag((x.ref.channel||'Message')+' reply','teal');
  if(x.kind==='meta')return tag(['seller','both'].includes(x.ref.role)?'Meta seller · call first':'Meta lead','teal');
  if(x.kind==='task')return tag(x.ref.priority==='Urgent'?'Urgent reminder':'Reminder',x.ref.priority==='Urgent'?'hot':'');
  if(x.kind==='rescue')return tag('Listing rescue','hot');
  if(x.kind==='engaged')return tag('Buyer activity','teal');
  if(x.kind==='listing')return tag('Seller opportunity','teal');
  if(x.kind==='buyer')return tag('Buyer matching','teal');
  return tag('Useful work','');
}
function streamTitle(x){
  const r=x.ref;
  if(x.kind==='offer')return `New offer · ${findD(r.dealId)?.address||'Property'}`;
  if(x.kind==='action')return r.title||'Review GeeVee draft';
  if(x.kind==='message')return `Reply to ${personName(r.contactId)}`;
  if(x.kind==='meta')return `Call ${r.name}`;
  if(x.kind==='task')return r.title;
  if(x.kind==='rescue')return `Help sell ${r.address}`;
  if(x.kind==='listing')return `Follow up ${personName(r.contactId)}`;
  if(x.kind==='engaged')return `Call ${personName(r.contactId)} · repeat property views`;
  if(x.kind==='buyer')return `Match buyers · ${r.address}`;
  return r.title||'GeeVee recommended work';
}
function streamDescription(x){
  const r=x.ref;
  if(x.kind==='offer')return `${personName(r.buyerId)} offered ${aud(r.amount)} · ${h(r.deadline||'Time-sensitive')}`;
  if(x.kind==='action')return `${personName(r.contactId)} · ${r.type||'Prepared action'} · GeeVee draft ready`;
  if(x.kind==='message')return `${personName(r.contactId)} · ${r.channel} · ${(r.last||'').slice(0,135)}`;
  if(x.kind==='meta')return `${r.suburb} · ${r.source} · ${r.note||'Contact about their property plans'}`;
  if(x.kind==='task')return `${personName(r.contactId)} · Due ${r.due}`;
  if(x.kind==='rescue')return `${r.suburb} · ${gvMarket(r.id)?.days||'?'} days on market · ${gvMarket(r.id)?.enquiries||0} enquiries`;
  if(x.kind==='listing')return `${r.address}, ${r.suburb} · ${r.why||r.stage}`;
  if(x.kind==='engaged')return `${findD(r.dealId)?.address||'Property'} · ${r.views} views in ${r.days} days`;
  if(x.kind==='buyer')return `${r.buyerMatches} sample candidate matches · Check suitability before contact`;
  return r.description||'Review and complete this internal work';
}
function streamDiary(){
  const all=DAY_SAMPLE_APPOINTMENTS;
  return `<section class="stream-diary card" aria-label="Today's appointments">
    <div class="stream-diary-head"><div class="eyebrow">YOUR CALENDAR</div><h2>${ico('calendar','sm')} Today's appointments</h2><p>${all.length} booked · ${all.filter(a=>a.kind==='In person').length} in person</p></div>
    <div class="stream-diary-list ${ui.streamDiaryOpen?'open':''}">${all.map(a=>`<div class="stream-diary-row"><div class="stream-diary-time">${h(a.time)}</div><div class="stream-diary-info"><b>${h(a.title)}</b><span>${h(a.where)}</span></div></div>`).join('')}</div>
    <div class="stream-diary-foot"><span>Sample diary · Allow travel time</span><div class="stream-diary-buttons">${action(ui.streamDiaryOpen?'Show less':'All appointments','streamDiaryToggle','','sm')}${action('Open calendar','legacy','calendar','sm')}</div></div>
  </section>`;
}
function streamActiveCard(x,index,expanded){
  const header=`<div class="stream-item-top">
    <div class="stream-order">${index+1}</div>
    <button class="stream-open" aria-expanded="${expanded?'true':'false'}" data-action="streamExpand" data-id="${h(x.key)}"><span class="stream-labels">${streamBadge(x)} ${index===0?'<span class="stream-now">DO THIS NEXT</span>':''}</span><strong>${h(streamTitle(x))}</strong><span class="stream-excerpt">${h(streamDescription(x))}</span></button>
    <button class="stream-toggle" data-action="streamExpand" data-id="${h(x.key)}" aria-label="${expanded?'Collapse':'Expand'} ${h(streamTitle(x))}">${ico(expanded?'chevron':'arrow','sm')}</button>
  </div>`;
  if(!expanded)return `<article class="stream-item">${header}</article>`;
  let body=dayWorkCard(x);
  // The old guided flow's Next buttons only skipped items for this session.
  // In the new list, postponing is an explicit persisted choice instead.
  body=body.replace(/<button\b[^>]*data-action="dayNext"[^>]*>[\s\S]*?<\/button>/g,'');
  if(x.kind==='action')body=body.replace('✓ Approve</button>',((['Email','SMS','Portal reply','Portal enquiry'].includes(x.ref.type))?'Approve &amp; Send</button>':'Approve &amp; Continue</button>'));
  const snooze=!['offer','action','message'].includes(x.kind)&&x.kind!=='research'?`<div class="stream-foot-actions">${action('Remind me tomorrow','streamDefer',x.key,'sm')}<span>Only moves the reminder. GeeVee won’t contact anyone automatically.</span></div>`:'';
  return `<article class="stream-item expanded">${header}<div class="stream-body">${body}${snooze}</div></article>`;
}
function streamHistory(){
 const handled=Object.keys(state.dayWork.handled||{}).length;
 const actions=state.actions.filter(a=>!['Awaiting review','Scheduled review'].includes(a.status)).length;
 const all=state.activity.slice(0,7);
 return `<section class="stream-history card"><div class="stream-history-head"><div><b>Completed & activity history</b><p class="small muted">Handled work is kept on its record, but removed from your active list.</p></div>${action(ui.streamHistory?'Hide':'Show','streamHistory','','sm')}</div>${ui.streamHistory?`<div class="stream-history-list">${all.map(a=>`<div class="stream-history-row">${ico('check','sm')}<div><b>${h(a.title)}</b><small>${h(a.details||a.when||'')}</small></div></div>`).join('')||'<p class="muted">No completed work yet.</p>'}</div>`:''}</section>`;
}
const streamPreviousToday=today;
today=function(){
 const work=streamQueue();
 const pendingApprovals=work.filter(streamIsApproval).length;
 const callsNeeded=work.filter(streamIsCall).length;
 const expanded=work.some(x=>x.key===ui.streamExpanded)?ui.streamExpanded:work[0]?.key;
 ui.streamExpanded=expanded||'';
 const displayed=work.slice(0,ui.streamVisible||10);
 return `${sectionHeader('Today','Your day is organised. Start at number 1; once it’s handled, it disappears.',action(`${ico('grid')} More tools`,'route','more','sm'))}
 <div class="stream-layout"><section class="stream-work" id="geevee-worklist">
 <div class="stream-intro"><div><div class="stream-intro-eyebrow">✦ GEEVEE · YOUR DAILY WORKLIST</div><h2>One thing at a time.</h2><p>Approve what GeeVee has prepared, then make your calls. I’ll keep finding the next worthwhile task.</p></div><div class="stream-demo">DEMO · No live calls or sends</div></div>
 <div class="stream-count-line"><span><b>${pendingApprovals}</b> approvals & replies first</span><span class="stream-count-dot">•</span><span><b>${callsNeeded}</b> calls & follow-ups after</span><span class="stream-count-dot">•</span><span>More opportunities follow</span></div>
 <div class="stream-guide">${ico('sparkles','sm')} <span>Work from the top. New offers and urgent enquiries can move ahead of routine work. Once you complete, approve, ignore or reschedule an item, the list updates automatically.</span></div>
 <div class="stream-list" aria-label="GeeVee prioritised worklist">${displayed.map((x,i)=>streamActiveCard(x,i,x.key===expanded)).join('')||`<div class="stream-empty">${ico('check','lg')}<h2>You’re up to date.</h2><p>There’s no further eligible sample work right now. GeeVee will show new enquiries, offers and opportunities here when they arrive. It won’t invent prospects just to fill your day.</p>${action('Review my deals','route','deals','primary')}</div>`}</div>
 ${work.length>displayed.length?`<div class="stream-load">${action(`Show next ${Math.min(10,work.length-displayed.length)} tasks`,'streamMore','','big')} <span>${displayed.length} of ${work.length} shown</span></div>`:''}
 ${streamHistory()}
 </section><aside class="stream-sidebar">${streamDiary()}<section class="stream-tip card"><div class="eyebrow">HOW IT WORKS</div><h3>Finish it. It's gone.</h3><p>Every completed decision, logged call and handled task disappears from Today. A record of what happened remains in the CRM.</p><p class="small muted" style="margin-top:10px">Protected offer decisions still require verified vendor instructions. Sending and recording are simulated in this file.</p></section></aside></div>`;
};
// Today is already Start My Day. Keep legacy buttons pointing to the same list.
const streamPreviousDoAction=doAction;
doAction=function(name,id){
 streamEnsure();
 if(name==='startDay'){
   ui.modal=null;ui.route='today';ui.streamExpanded='';ui.streamVisible=10;render();
   document.getElementById('geevee-worklist')?.scrollIntoView({behavior:'smooth',block:'start'});
   return;
 }
 if(name==='streamExpand'){ui.streamExpanded=id;render();document.querySelector('.stream-item.expanded')?.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
 if(name==='streamMore'){ui.streamVisible=Math.min(streamQueue().length,(ui.streamVisible||10)+10);render();return;}
 if(name==='streamHistory'){ui.streamHistory=!ui.streamHistory;render();return;}
 if(name==='streamDiaryToggle'){ui.streamDiaryOpen=!ui.streamDiaryOpen;render();return;}
 if(name==='streamDefer'){
   const item=streamQueue().find(x=>x.key===id);
   if(!item||item.kind==='offer'){toast('An urgent offer requires an explicit decision.');return;}
   state.dayWork.deferred[id]=streamTomorrow();
   audit('reminder','Review tomorrow: '+streamTitle(item),'Postponed to tomorrow. No outgoing communication scheduled.');
   ui.streamExpanded='';persist();render();toast('Moved to tomorrow. The next task is ready.');return;
 }
 // Clicking a call must NOT remove its task. Only a saved call recap does.
 if(name==='dayCall'||name==='gvCallBuyer'||name==='gvCallVendor'||name==='gvCallMarketVendor'||name==='gvCallEngagedBuyer'){
   if(ui.route==='today'){
     const expanded=ui.streamExpanded;
     const work=streamQueue();
     const matching=work.find(x=>x.key===expanded);
     ui.streamCallKey=matching&&['meta','task','rescue','listing','engaged'].includes(matching.kind)?matching.key:'';
   }
 }
 if(name==='dayResearchDone'){
   const key='research:'+id;
   state.dayWork.handled[key]=dayLocalStamp();
   audit('work','Internal research completed',DAY_MARKET_TASKS[Number(id)]?.[0]||'Internal research');
   ui.streamExpanded='';persist();render();toast('Done. Your next task is ready.');return;
 }
 if(name==='dayNext'){
   const item=streamQueue().find(x=>x.key===ui.streamExpanded);
   if(item){state.dayWork.deferred[item.key]=streamTomorrow();audit('reminder','Review tomorrow: '+streamTitle(item),'Agent postponed this task.');persist();ui.streamExpanded='';render();toast('Moved to tomorrow.');}
   return;
 }
 const before=streamQueue().length;
 const result=streamPreviousDoAction(name,id);
 const next=streamQueue();
 if(next.length<before&&!next.some(x=>x.key===ui.streamExpanded))ui.streamExpanded=next[0]?.key||'';
 // Some inherited offer-drafting actions switch into the old guided modal.
 // Return the user to the single Today worklist after preparation.
 if(['gvPresentVendor','gvBestFinal','gvOfferConfirm','gvDraftPriceReview','gvEngagedDraft'].includes(name)&&ui.modal?.type==='focus'){
   ui.modal=null;ui.route='today';ui.streamExpanded='';render();
 }
 return result;
};
const streamPreviousSaveCall=saveCall;
saveCall=function(pId){
 const marker=ui.streamCallKey;
 const countBefore=state.calls.length;
 ui.streamCallKey='';
 streamPreviousSaveCall(pId);
 if(state.calls.length>countBefore&&marker){
   state.dayWork.handled[marker]=dayLocalStamp();
   if(marker.startsWith('engaged:')){const act=gvBuyerActivity(marker.slice('engaged:'.length));if(act)act.reviewed=true;}
   if(marker.startsWith('rescue:')){const d=marker.slice('rescue:'.length);const market=gvMarket(d);if(market)market.reviewed=true;}
   audit('call','Today task attended · '+personName(pId),'Saved a simulated call recap and returned to the prioritised worklist.');
   ui.route='today';ui.modal=null;ui.streamExpanded='';ui.streamVisible=10;persist();render();
   toast('Call outcome recorded. That task is off your list; GeeVee has the next one ready.');
 }
};

// The Today badge in the old shell counted only one type of approval, not the
// complete prioritised worklist. Remove the misleading badge.
const streamOldShell=shell;
shell=function(){return streamOldShell().replace(/(<button class="nav-button[^"]*" data-action="route" data-id="today">[\s\S]*?)(<span class="nav-count">\d+<\/span>)([\s\S]*?<\/button>)/,'$1$3')};

/* ================================================================
   DOMA Phase 2 · GeeVee appraisal preparation and review (OFFLINE)
   Automatically prepares sample appraisal packs from existing linked
   records. Example comparable sales are deliberately fictional.
   In production only verified evidence can be approved for release.
   ================================================================ */
const CMA_COMPARABLE_STREETS=['Example Crescent','Demo Avenue','Sample Road','Illustration Street','Prototype Lane'];
const cmaDemoDate=['17 Sep 2026','3 Oct 2026','22 Oct 2026'];
function cmaMoney(n){return aud(Number(n)||0)}
function cmaPackSeed(deal,task){
 const guide=Math.round((deal.guide||900000)/10000)*10000;
 const base=(deal.address||'').replace(/[^a-z0-9]/gi,'').length;
 const comps=[.94,.99,1.035].map((mul,i)=>({id:'E'+(i+1),address:`${12+base+i*7} ${CMA_COMPARABLE_STREETS[(base+i)%CMA_COMPARABLE_STREETS.length]}, ${deal.suburb}`,date:cmaDemoDate[i],price:Math.round(guide*mul/5000)*5000,selected:true,source:'Fictional comparable, demonstration only'}));
 const contactMismatch=!!(task&&task.contactId!==deal.contactId),alreadySold=['Sold','Lost'].includes(deal.stage)||!deal.active;
 const owner=findP(deal.contactId);
 return {id:task?'CMA-'+task.id:'CMA-'+deal.id,taskId:task?.id||null,dealId:deal.id,sourceContactId:task?.contactId||deal.contactId,recipientId:deal.contactId,contactMismatch,recipientVerified:!contactMismatch,status:alreadySold?'Needs record review':'Ready for agent review',created:'Prepared by GeeVee · sample',low:Math.round(guide*.96/5000)*5000,high:Math.round(guide*1.045/5000)*5000,comps,note:`GeeVee's preliminary review uses the existing CRM price guide for ${deal.address}. The comparable-sale examples are fictional. Verify actual sold evidence, property attributes, relevant adjustments and the agent's pricing opinion before issuing a real appraisal.`,email:`Hi ${owner?.name.split(' ')[0]||'there'},\n\nThank you for the opportunity to discuss your property at ${deal.address}, ${deal.suburb}. I've prepared an appraisal report outlining the indicative price range, recent comparable sales and recommended next steps.\n\nI'd be happy to talk you through the findings and answer any questions.\n\nKind regards,\nCaleb Richards`,edited:false,reviewMode:'summary',approvedAt:null};
}
function cmaEnsure(){
 if(!state.appraisalPacks)state.appraisalPacks={};
 const candidates=[];
 state.deals.filter(d=>d.stage==='Appraisal'&&d.active).forEach(d=>candidates.push([d,null]));
 state.tasks.filter(t=>t.status==='Open'&&/prepare comparable sales/i.test(t.title)).forEach(t=>{const d=findD(t.dealId);if(d)candidates.push([d,t])});
 candidates.forEach(([d,t])=>{let id=t?'CMA-'+t.id:'CMA-'+d.id;if(!state.appraisalPacks[id])state.appraisalPacks[id]=cmaPackSeed(d,t)});
}
function cmaP(id){cmaEnsure();return state.appraisalPacks[id]}
const cmaPrevStreamQueue=streamQueue;
streamQueue=function(){
 cmaEnsure();
 const base=cmaPrevStreamQueue().filter(x=>!(x.kind==='task'&&/prepare comparable sales/i.test(x.ref?.title||'')));
 const packs=Object.values(state.appraisalPacks).filter(p=>['Ready for agent review','Needs record review'].includes(p.status)&&(!p.taskId||findT(p.taskId)?.status==='Open')&&!state.dayWork.handled?.['cma:'+p.id]&&!streamIsDeferred('cma:'+p.id)).map(p=>({kind:'appraisal',key:'cma:'+p.id,ref:p,score:p.status==='Needs record review'?12:7,lane:1}));
 const rank=(x)=>x.kind==='appraisal'?(x.ref.status==='Needs record review'?7.5:4.5):streamRank(x);
 return [...base,...packs].sort((a,b)=>rank(a)-rank(b)||a.score-b.score||a.key.localeCompare(b.key));
};
const cmaPrevIsApproval=streamIsApproval;
streamIsApproval=function(x){return x.kind==='appraisal'||cmaPrevIsApproval(x)};
const cmaPrevBadge=streamBadge;
streamBadge=function(x){if(x.kind==='appraisal')return tag(x.ref.status==='Needs record review'?'Record to fix':'Appraisal ready to review',x.ref.status==='Needs record review'?'hot':'teal');return cmaPrevBadge(x)};
const cmaPrevTitle=streamTitle;
streamTitle=function(x){return x.kind==='appraisal'?((x.ref.status==='Needs record review'?'Check appraisal records':'Review appraisal · GeeVee prepared')+' · '+(findD(x.ref.dealId)?.address||'')):cmaPrevTitle(x)};
const cmaPrevDescription=streamDescription;
streamDescription=function(x){if(x.kind==='appraisal'){const p=x.ref,d=findD(p.dealId);return `${d?.suburb||''} · ${p.status==='Needs record review'?'Record discrepancy found, no send permitted':'Draft appraisal, 3 sample comparable candidates · '+cmaMoney(p.low)+' to '+cmaMoney(p.high)}`;}return cmaPrevDescription(x)};
function cmaChecks(p){const d=findD(p.dealId);return {sold:!d?.active||['Sold','Lost'].includes(d?.stage),mismatch:p.contactMismatch&&!p.recipientVerified,range:p.low<=0||p.high<=p.low,selected:p.comps.filter(c=>c.selected).length<2,missingContact:!findP(p.recipientId)};}
function cmaReady(p){const x=cmaChecks(p);return !Object.values(x).some(Boolean)}
function cmaCompCard(c,p){return `<tr><td><button class="cma-check ${c.selected?'selected':''}" data-action="cmaToggleComp" data-id="${h(p.id+'|'+c.id)}" aria-pressed="${c.selected}" title="${c.selected?'Remove this candidate':'Include this candidate'}">${c.selected?'✓ Included':'+ Include'}</button></td><td><strong>${h(c.address)}</strong><br><small>Fictional address · ${h(c.date)}</small></td><td><b>${cmaMoney(c.price)}</b><br><small>Sample price, not a recorded sale</small></td></tr>`}
function cmaReviewCard(p){
 const d=findD(p.dealId),original=findP(p.sourceContactId),owner=findP(p.recipientId),chk=cmaChecks(p),editing=ui.cmaEditing===p.id,confirm=ui.cmaConfirm===p.id;
 if(!d)return '<p>Linked property missing. No document can be issued.</p>';
 const checks=Object.values(chk).some(Boolean);
 return `<section class="cma-card" aria-label="GeeVee appraisal pack"><div class="cma-card-top"><div><div class="cma-eyebrow">✦ GEEVEE PREPARED THIS · APPRAISAL PACK</div><h3>${h(d.address)}, ${h(d.suburb)}</h3><div class="cma-muted">Proposed recipient: <b>${h(owner?.name||'Unknown')}</b> · ${h(d.stage)} · ${h(d.legacyId||d.id)}</div></div><span class="cma-status ${checks?'blocked':'ready'}">${checks?'Needs checking':'Ready for agent review'}</span></div>
 <div class="cma-info">${ico('sparkles','sm')} <span><b>GeeVee already did the preparation.</b> I've assembled the existing property information, three preliminary comparable candidates, a draft price range and a seller email. Review the evidence and choose Send or Print, there's nothing to research manually in this demo.</span></div>
 ${chk.sold?`<div class="cma-warning"><b>Outdated CRM task detected.</b> ${h(d.address)} is marked ${h(d.stage)}. GeeVee must not issue a fresh seller appraisal automatically against this closed record. ${action('Archive outdated reminder','cmaArchive',p.id,'sm')}</div>`:''}
 ${chk.mismatch?`<div class="cma-warning"><b>Contact link doesn't match.</b> The old task says <b>${h(original?.name||p.sourceContactId)}</b>, but the property record is linked to <b>${h(owner?.name||d.contactId)}</b>. GeeVee has prepared a draft but blocked delivery. ${action('Confirm property contact for demo','cmaConfirmContact',p.id,'sm')}${action('Open property','openDeal',d.id,'sm')}</div>`:''}
 <div class="cma-metrics"><div><small>INDICATIVE RANGE · DEMO</small><strong>${cmaMoney(p.low)} to ${cmaMoney(p.high)}</strong></div><div><small>COMPARABLE CANDIDATES</small><strong>${p.comps.filter(c=>c.selected).length} selected</strong></div><div><small>EVIDENCE STATUS</small><strong>Not verified</strong></div></div>
 <div class="cma-subhead"><h4>Comparable sales GeeVee surfaced</h4><span>Illustrative dataset only · not real transactions</span></div>
 <div class="cma-table-wrap"><table class="cma-table"><thead><tr><th>Use</th><th>Property / sale date</th><th>Illustrative sold price</th></tr></thead><tbody>${p.comps.map(c=>cmaCompCard(c,p)).join('')}</tbody></table></div>
 <p class="cma-small"><b>Production:</b> GeeVee will pull verified sold records from your licensed data provider, compare property type, land/building size, bedrooms, condition, location and sale date, show evidence links, and flag where data is missing. The agent remains responsible for their professional appraisal opinion.</p>
 ${editing?`<div class="cma-edit"><h4>Edit GeeVee's appraisal</h4><div class="cma-edit-grid"><label>Indicative lower price ($)<input type="number" id="cma-low" min="1" step="5000" value="${p.low}"></label><label>Indicative upper price ($)<input type="number" id="cma-high" min="1" step="5000" value="${p.high}"></label></div><label>Appraisal commentary<textarea id="cma-note">${h(p.note)}</textarea></label><label>Accompanying seller email<textarea id="cma-email">${h(p.email)}</textarea></label><div class="cma-actions">${action('Save appraisal changes','cmaSave',p.id,'primary')}${action('Cancel','cmaCancelEdit',p.id,'')}</div></div>`:`<div class="cma-report-summary"><b>Appraisal commentary</b><p>${h(p.note)}</p></div><details class="cma-mail"><summary>Prepared seller email (click to read)</summary><p>${h(p.email).replace(/\n/g,'<br>')}</p></details>`}
 ${confirm?`<div class="cma-confirm"><h4>${ui.cmaConfirmType==='print'?'Approve and prepare printable appraisal':'Approve and send appraisal'}</h4><p>The attached comparable sales are fictional sample data. This offline prototype cannot deliver a real appraisal. Production release must be blocked until actual sales evidence and property facts are verified.</p><label class="cma-confirm-line"><input id="cma-ack-evidence" type="checkbox"> I reviewed the indicative range and the selected sample comparisons.</label><label class="cma-confirm-line"><input id="cma-ack-demo" type="checkbox"> I understand this is a demo: no real document will be delivered and printed output is marked SAMPLE.</label><div class="cma-actions">${action(ui.cmaConfirmType==='print'?'Confirm & Open Print Preview':'Confirm Demo Approval · No Live Send','cmaComplete',p.id,'primary')}${action('Back','cmaCancelConfirm',p.id,'')}</div></div>`:''}
 <div class="cma-actions main-actions">${action('✓ Approve & Send','cmaApproveSend',p.id,'primary')}${action('Approve & Print','cmaApprovePrint',p.id,'')}${action('✎ Edit appraisal','cmaEdit',p.id,'')}${action('Open Sales CMA tool','legacy','cma','')}</div>
 <div class="cma-note">Appraisal preparation is GeeVee's responsibility. The agent only checks commercial accuracy, chooses approved comparable evidence, and authorises the final document. All interactions here are simulations.</div></section>`;
}
const cmaPrevActiveCard=streamActiveCard;
streamActiveCard=function(x,index,expanded){if(x.kind!=='appraisal')return cmaPrevActiveCard(x,index,expanded);
 const header=`<div class="stream-item-top"><div class="stream-order">${index+1}</div><button class="stream-open" data-action="streamExpand" data-id="${h(x.key)}" aria-expanded="${expanded}"><span class="stream-labels">${streamBadge(x)} ${index===0?'<span class="stream-now">DO THIS NEXT</span>':''}</span><strong>${h(streamTitle(x))}</strong><span class="stream-excerpt">${h(streamDescription(x))}</span></button><button class="stream-toggle" data-action="streamExpand" data-id="${h(x.key)}">${ico(expanded?'chevron':'arrow','sm')}</button></div>`;
 return `<article class="stream-item ${expanded?'expanded':''}">${header}${expanded?`<div class="stream-body">${cmaReviewCard(x.ref)}<div class="stream-foot-actions">${action('Review tomorrow','streamDefer',x.key,'sm')}<span>The report stays saved; this only postpones the agent's review.</span></div></div>`:''}</article>`;
};
function cmaFinish(p,mode){
 p.status=mode==='send'?'Approved · simulated send':'Approved · print preview opened';p.approvedAt=new Date().toISOString();p.approvedBy='Caleb Richards · demo';
 const t=p.taskId?findT(p.taskId):null;if(t)t.status='Done';
 state.dayWork.handled['cma:'+p.id]=dayLocalStamp();
 audit('appraisal',mode==='send'?'Appraisal approved, simulation only':'Appraisal pack approved for print',`${findD(p.dealId)?.address} · ${p.comps.filter(c=>c.selected).length} fictional comparables · ${cmaMoney(p.low)} to ${cmaMoney(p.high)}. ${mode==='send'?'No email sent.':'Print preview opened; printer completion unverified.'}`);
 ui.cmaConfirm='';ui.cmaEditing='';ui.streamExpanded='';persist();render();
}
function cmaPrintSheet(p){const d=findD(p.dealId),owner=findP(p.recipientId);return `<div id="doma-cma-print" class="cma-print-document"><div class="cma-print-top"><strong>COLLINGS</strong><span>PROPERTY APPRAISAL · DEMONSTRATION</span></div><div class="cma-watermark">SAMPLE · NOT FOR REAL USE</div><div class="cma-print-title"><small>PREPARED BY GEEVEE · REVIEWED BY AGENT</small><h1>${h(d.address)}<br>${h(d.suburb)}, VIC</h1><p>Prepared for ${h(owner?.name||'Property owner')} · Fictional data · 16 November 2026</p></div><div class="cma-print-range"><span>INDICATIVE APPRAISAL RANGE (SAMPLE)</span><h2>${cmaMoney(p.low)} to ${cmaMoney(p.high)}</h2><p>This example is not a professional valuation or compliant pricing statement.</p></div><h2>Comparable sale examples</h2><table><thead><tr><th>Fictional property</th><th>Example sale date</th><th>Example price</th></tr></thead><tbody>${p.comps.filter(c=>c.selected).map(c=>`<tr><td>${h(c.address)}</td><td>${h(c.date)}</td><td>${cmaMoney(c.price)}</td></tr>`).join('')}</tbody></table><h2>Appraisal commentary</h2><p>${h(p.note)}</p><h2>Next steps</h2><p>Discuss the seller's goals, verify actual market evidence and property details, confirm sale strategy and explain the range and its uncertainties. No publication or vendor instruction is implied.</p><div class="cma-print-foot">COLLINGS · DOMA CRM / GEEVEE · OFFLINE SAMPLE, ALL COMPARABLES ARE FICTIONAL</div></div>`}
const cmaPrevDoAction=doAction;
doAction=function(name,id){
 if(!name.startsWith('cma'))return cmaPrevDoAction(name,id);
 const p=cmaP(id.split('|')[0]);if(!p){toast('Appraisal not found.');return;}
 const d=findD(p.dealId);
 switch(name){
 case 'cmaToggleComp':{const c=p.comps.find(x=>x.id===id.split('|')[1]);if(c)c.selected=!c.selected;persist();render();return;}
 case 'cmaConfirmContact':{const ref=findP(d.contactId);if(!ref){toast('No confirmed contact on the property.');return;}p.recipientVerified=true;p.recipientId=d.contactId;audit('data','Appraisal property contact confirmed by agent',`${d.address}: verified link selected in demo · original task referenced ${personName(p.sourceContactId)}.`);persist();render();toast('Link confirmed for this demo. The original task discrepancy remains in audit history.');return;}
 case 'cmaArchive':{if(!cmaChecks(p).sold)return;p.status='Archived, outdated task';if(p.taskId){const t=findT(p.taskId);if(t)t.status='Done'}state.dayWork.handled['cma:'+p.id]=dayLocalStamp();audit('data','Stale comparable-sales task archived',`${d.address} is ${d.stage}; no new appraisal issued.`);ui.streamExpanded='';persist();render();toast('Stale task archived. No appraisal sent.');return;}
 case 'cmaEdit':{ui.cmaEditing=p.id;ui.cmaConfirm='';render();document.querySelector('#cma-low')?.focus();return;}
 case 'cmaCancelEdit':{ui.cmaEditing='';render();return;}
 case 'cmaSave':{const lo=Number(document.getElementById('cma-low')?.value),hi=Number(document.getElementById('cma-high')?.value);const note=document.getElementById('cma-note')?.value.trim(),email=document.getElementById('cma-email')?.value.trim();if(!(Number.isFinite(lo)&&Number.isFinite(hi)&&lo>0&&hi>lo)){toast('Please enter a valid lower and upper appraisal range.');return;}if(!note||!email){toast('Please retain commentary and a seller email.');return;}p.low=lo;p.high=hi;p.note=note;p.email=email;p.edited=true;ui.cmaEditing='';audit('draft','Agent revised GeeVee appraisal',`${d.address} · version updated · no send.`);persist();render();toast('Appraisal saved for approval.');return;}
 case 'cmaApproveSend':case 'cmaApprovePrint':{
   if(!cmaReady(p)){toast(cmaChecks(p).sold?'This property is already closed. Resolve the old task first.':'Confirm the linked contact and include at least two comparisons before approval.');return;}
   ui.cmaEditing='';ui.cmaConfirm=p.id;ui.cmaConfirmType=name==='cmaApproveSend'?'send':'print';render();document.querySelector('.cma-confirm')?.scrollIntoView({block:'nearest',behavior:'smooth'});return;
 }
 case 'cmaCancelConfirm':ui.cmaConfirm='';render();return;
 case 'cmaComplete':{
   if(ui.cmaConfirm!==p.id)return;
   if(!document.getElementById('cma-ack-evidence')?.checked||!document.getElementById('cma-ack-demo')?.checked){toast('Review and acknowledge both points before proceeding.');return;}
   if(!cmaReady(p)){toast('The appraisal has unresolved record or evidence checks.');return;}
   const mode=ui.cmaConfirmType;
   if(mode==='print'){const html=cmaPrintSheet(p);cmaFinish(p,'print');document.getElementById('doma-cma-print')?.remove();document.body.insertAdjacentHTML('beforeend',html);ui.cmaPrintOpen=p.id;toast('Print-ready SAMPLE opened. Use Print / Save as PDF; no live document sent.');setTimeout(()=>window.print(),75);return;}
   cmaFinish(p,'send');toast('Appraisal approved in simulation. No real email or document sent.');return;
 }
 case 'cmaPrintAgain':{const html=cmaPrintSheet(p);document.getElementById('doma-cma-print')?.remove();document.body.insertAdjacentHTML('beforeend',html);setTimeout(()=>window.print(),75);return;}
 }
};
window.addEventListener('afterprint',()=>document.getElementById('doma-cma-print')?.remove());
ui.cmaEditing='';ui.cmaConfirm='';ui.cmaConfirmType='';


/* ===========================================================
   GEEVEE AUTOMATIC CRM ADMIN / EVIDENCE SAFEGUARDS (OFFLINE)
   Routine source-backed notes are saved without approval.
   Inconsistent people/property links produce an explicit
   exception, never a generic "Approve CRM update" card.
   =========================================================== */
const GV_AUTO_SOURCES=[
 {id:'M-4005',description:'Buyer requirements captured from portal enquiry',category:'Buyer enquiry',extract:'Asked for a 3-bedroom property around $1 million in Coburg or nearby. Preferences are stated in the received enquiry; not independently verified.'},
 {id:'M-4006',description:'Seller timeframe recorded from received SMS',category:'Seller conversation',extract:'Said they are still deciding when to list and asked to speak tomorrow. No firm listing date has been recorded.'},
 {id:'M-4009',description:'Potential seller intent noted from received email',category:'Buyer-to-seller opportunity',extract:'Said a buyer is looking locally and they may need to sell first. This is a possible opportunity, not confirmed intent to list.'}
];
function gvAutoEnsure(){
 if(!state.geeVeeAuto)state.geeVeeAuto={version:1,notes:[],exceptions:[],processed:{}};
 const gv=state.geeVeeAuto;
 let changed=false;
 const addNote=(note)=>{
  if(!note?.sourceId||!findP(note.contactId)||gv.notes.some(x=>x.id===note.id))return;
  gv.notes.push({...note,recordedAt:new Date().toISOString(),status:'Automatically recorded · demo'});
  audit('auto','GeeVee saved CRM note · '+personName(note.contactId),note.text+' · Source: '+note.sourceLabel+' · No agent approval or external send.');changed=true;
 };
 for(const item of GV_AUTO_SOURCES){
  const m=state.messages.find(x=>x.id===item.id);
  if(!m||!findP(m.contactId)||!m.last||gv.processed['source:'+m.id])continue;
  // Record the exact source message beside the conservative summary. Neither
  // inferred appointments nor legal/commercial changes are auto-applied.
  addNote({id:'GV-NOTE-'+m.id,contactId:m.contactId,dealId:null,kind:item.category,text:item.extract,
   original:m.last,sourceId:m.id,sourceLabel:`Received ${m.channel} · ${m.id}`,sourceType:'Direct enquiry',verified:'Source text stored; extracted summary is reviewable'});
  gv.processed['source:'+m.id]=true;changed=true;
 }
 for(const a of state.actions){
  if(a.type!=='CRM update'||a.status!=='Awaiting review')continue;
  if(gv.processed['action:'+a.id])continue;
  const person=findP(a.contactId),deal=findD(a.dealId),owner=deal?findP(deal.contactId):null;
  // The current sample action has NO meeting notes; the description is just a
  // placeholder. This is not evidence that an appraisal was completed.
  const validStructuredNote=typeof a.noteText==='string'&&a.noteText.trim().length>8
     &&typeof a.noteSourceId==='string'&&a.noteSourceId.length>1
     &&person&&(!deal||deal.contactId===a.contactId)
     &&a.verifiedSource===true;
  if(validStructuredNote){
    addNote({id:'GV-NOTE-'+a.id,contactId:a.contactId,dealId:a.dealId||null,kind:'Meeting note',text:a.noteText.trim(),original:a.noteText.trim(),sourceId:a.noteSourceId,sourceLabel:a.noteSourceLabel||'Verified CRM source',sourceType:'Verified CRM note',verified:'Source and record link checked'});
    a.status='Handled automatically · demo';
    a.automationReason='Verified routine note saved to contact timeline without external send.';
    audit('auto','Routine CRM update completed automatically',a.title+' · '+person.name+' · source '+a.noteSourceId);changed=true;
  }else{
    // If the source is missing, we do not hallucinate the contents. If a
    // reference crosses contacts, keep the conflict available for resolution.
    const mismatched=!!(deal&&person&&deal.contactId!==person.id);
    if(person?.note){
     addNote({id:'GV-NOTE-EXISTING-'+a.id,contactId:person.id,dealId:null,kind:'Existing CRM note (preserved)',text:person.note,
      original:person.note,sourceId:'existing-contact:'+person.id,sourceLabel:'Existing CRM contact summary',sourceType:'Existing record',verified:'No new meeting transcript supplied'});
    }
    a.status=mismatched?'Automatically triaged · link exception':'Automatically triaged · source missing';
    a.automationReason=mismatched?'Source lacks actual notes; property belongs to a different contact. No cross-record update performed.':'Source lacks meeting notes; no new notes were invented or saved.';
    const exId='GV-EX-'+a.id;
    if(!gv.exceptions.some(x=>x.id===exId)){
      gv.exceptions.push({id:exId,sourceActionId:a.id,title:mismatched?'Check conflicting appraisal record link':'Check missing appraisal note evidence',
      contactId:a.contactId,dealId:a.dealId||null,status:'Needs review',reason:mismatched?'The contact on the old task does not match the property owner in CRM. The source contains only a placeholder and no actual meeting notes.':'The task contains a generic description but no meeting notes or transcript.',
      sourceText:a.body||'',conflict:mismatched,when:new Date().toISOString()});changed=true;
    }
    audit('data','GeeVee blocked an unsupported CRM update',`${a.title} · ${person?.name||a.contactId} ${mismatched?'does not match '+deal.address+' (CRM contact '+(owner?.name||deal.contactId)+')':''}. No property updates and no invented notes.`);
  }
  gv.processed['action:'+a.id]=true;changed=true;
 }
 if(changed)persist();
}
function gvAutoException(ex){
 const p=findP(ex.contactId),d=findD(ex.dealId),owner=d?findP(d.contactId):null;
 const notes=state.geeVeeAuto.notes.filter(n=>n.contactId===ex.contactId);
 return `<div class="gv-auto-card"><div class="gv-auto-header"><span class="gv-auto-eyebrow">GEEVEE FOUND A RECORD CONFLICT</span>${tag('Specific verification required','hot')}</div>
 <h3 style="margin:0 0 7px">Check ${h(p?.name||'the contact')}’s appraisal record</h3>
 <p class="small muted">GeeVee stopped the unsupported update. This is not a routine note approval or a request to type up meeting notes.</p>
 <div class="gv-auto-facts"><div class="gv-auto-fact"><small>CONTACT ON OLD TASK</small><strong>${h(p?.name||'Missing')} · ${h(p?.id||ex.contactId)}</strong></div>
 <div class="gv-auto-fact"><small>PROPERTY LINKED TO THAT TASK</small><strong>${h(d?d.address+', '+d.suburb:'No property found')}<br>CRM contact: ${h(owner?.name||'Unknown')}</strong></div></div>
 <div class="gv-auto-alert"><b>Why this needs attention:</b> ${h(ex.reason)}<div style="font-size:12px;margin-top:7px"><b>Actual source:</b> “${h(ex.sourceText)}”</div></div>
 ${notes.length?`<div class="gv-auto-person-notes"><b>Already preserved under ${h(p?.name||'the contact')}:</b><p style="margin:7px 0;font-size:13px;line-height:1.6">${h(notes.find(n=>n.kind==='Existing CRM note (preserved)')?.text||notes[0].text)}</p><div class="gv-auto-source">Source: existing contact summary. This is not a newly transcribed meeting.</div></div>`:''}
 <div class="gv-auto-actions">${action('Keep note on contact only','gvResolveException',ex.id,'primary')}${action('View contact','openPerson',ex.contactId,'')}${d?action('View linked property','openDeal',ex.dealId,''):''}${action('Review tomorrow','streamDefer','autoexception:'+ex.id,'')}</div>
 <p class="hint" style="margin-top:12px">Resolving removes the erroneous association from the demonstration action only; it does not silently change the original CRM’s source record. A valid transcript or source note would still be needed before adding new meeting facts.</p></div>`;
}
const gvAutoPreviousStreamQueue=streamQueue;
streamQueue=function(){
 gvAutoEnsure();const base=gvAutoPreviousStreamQueue();
 const issues=state.geeVeeAuto.exceptions.filter(ex=>ex.status==='Needs review'&&!streamIsDeferred('autoexception:'+ex.id))
  .map(ex=>({kind:'autoexception',key:'autoexception:'+ex.id,ref:ex,lane:1,score:5}));
 return [...base,...issues].sort((a,b)=>(a.kind==='autoexception'?2.5:streamRank(a))-(b.kind==='autoexception'?2.5:streamRank(b))||a.score-b.score||a.key.localeCompare(b.key));
};
const gvAutoPrevBadge=streamBadge;
streamBadge=function(x){return x.kind==='autoexception'?tag('Conflicting record · verify','hot'):gvAutoPrevBadge(x)};
const gvAutoPrevTitle=streamTitle;
streamTitle=function(x){return x.kind==='autoexception'?'Check appraisal record link · '+personName(x.ref.contactId):gvAutoPrevTitle(x)};
const gvAutoPrevDesc=streamDescription;
streamDescription=function(x){if(x.kind==='autoexception'){const d=findD(x.ref.dealId);return `${personName(x.ref.contactId)} · linked to ${d?.address||'unknown property'} (${personName(d?.contactId)}) · no source meeting notes`;}return gvAutoPrevDesc(x)};
const gvAutoPrevActive=streamActiveCard;
streamActiveCard=function(x,index,expanded){
 if(x.kind!=='autoexception')return gvAutoPrevActive(x,index,expanded);
 const header=`<div class="stream-item-top"><div class="stream-order">${index+1}</div><button class="stream-open" data-action="streamExpand" data-id="${h(x.key)}" aria-expanded="${expanded}"><span class="stream-labels">${streamBadge(x)} ${index===0?'<span class="stream-now">DO THIS NEXT</span>':''}</span><strong>${h(streamTitle(x))}</strong><span class="stream-excerpt">${h(streamDescription(x))}</span></button><button class="stream-toggle" data-action="streamExpand" data-id="${h(x.key)}" aria-label="Expand record verification">${ico(expanded?'chevron':'arrow','sm')}</button></div>`;
 return `<article class="stream-item ${expanded?'expanded':''}">${header}${expanded?`<div class="stream-body">${gvAutoException(x.ref)}</div>`:''}</article>`;
};
const gvAutoPrevPerson=personModal;
personModal=function(p){
 const old=gvAutoPrevPerson(p);if(!p)return old;
 gvAutoEnsure();const notes=state.geeVeeAuto.notes.filter(n=>n.contactId===p.id);
 if(!notes.length)return old;
 const section=`<div class="card pad" style="box-shadow:none;margin-bottom:12px"><div class="card-head"><h2>GeeVee-saved CRM notes</h2>${tag(notes.length+' automatic','green')}</div><p class="small muted" style="margin:5px 0 11px">Reliable information is saved without creating an approval. Sources remain available for review.</p>${notes.map(n=>`<div class="gv-auto-person-notes"><b>${h(n.kind)}</b><p style="font-size:13px;line-height:1.6;margin:5px 0">${h(n.text)}</p><div class="gv-auto-source">${h(n.sourceLabel)} · ${h(n.verified)} · Internal only</div></div>`).join('')}</div>`;
 const marker=`<div class="card pad" style="box-shadow:none">${cardHead('Linked property records')}`;
 return old.includes(marker)?old.replace(marker,section+marker):old;
};
const gvAutoPrevHistory=streamHistory;
streamHistory=function(){
 gvAutoEnsure();const old=gvAutoPrevHistory();
 const notes=state.geeVeeAuto.notes;
 if(!ui.streamHistory||!notes.length)return old;
 const addition=`<div style="border-top:1px solid #dce9e7;padding:14px"><div class="gv-auto-eyebrow" style="margin-bottom:9px">GEEVEE COMPLETED ROUTINE ADMIN AUTOMATICALLY · ${notes.length} SOURCE-BACKED NOTES</div>${notes.slice().reverse().map(n=>`<div class="gv-auto-log">${ico('check','sm')}<div><div class="gv-auto-log-title">${h(personName(n.contactId))} · ${h(n.kind)}</div><div class="gv-auto-log-desc">${h(n.text)}<br><b>Source:</b> ${h(n.sourceLabel)} · No approval needed</div></div></div>`).join('')}</div>`;
 return old.replace(/<\/section>\s*$/,addition+'</section>');
};
const gvAutoPreviousDoAction=doAction;
doAction=function(name,id){
 if(name==='gvResolveException'){
  gvAutoEnsure();const ex=state.geeVeeAuto.exceptions.find(x=>x.id===id);
  if(!ex||ex.status!=='Needs review')return;
  const a=state.actions.find(x=>x.id===ex.sourceActionId);
  if(a){a.originalIncorrectDealId=a.dealId;a.dealId=null;a.status='Resolved as contact-only · no new note applied';a.automationReason='Agent confirmed contact-only context in offline demo. Original source association requires reconciliation.';}
  ex.status='Resolved · contact only';ex.resolvedAt=new Date().toISOString();ex.resolution='Existing note retained on original contact; incorrect property association not propagated.';
  state.dayWork.handled['autoexception:'+id]=dayLocalStamp();
  audit('data','Resolved conflicting appraisal link',`Kept existing note under ${personName(ex.contactId)} only. Did not attach any notes to ${findD(ex.dealId)?.address||'another property'}, did not invent a transcript and did not modify the source system.`);
  ui.streamExpanded='';persist();render();toast('Record conflict handled. Existing contact note kept; no incorrect property update.');return;
 }
 return gvAutoPreviousDoAction(name,id);
};
// Apply once on first render. Source-backed demo changes are persisted in this
// browser; all real-world integrations remain disabled.
gvAutoEnsure();

/* ==============================================================
  GEEVEE TODAY 3.0 · Focused decisions, not dense CRM cards
  Still a self-contained, offline prototype: no live sends/calls.
  Extends the existing linked data, action guards, CMA and offer flows.
  ============================================================== */
ui.gvCompactMenu='';
ui.gvCompactHistory='';
ui.gvCompactWhy='';

function gvCFirst(id){return (personName(id)||'there').split(/\s+/)[0]||'there'}
function gvCLatestClient(m){
 const inbound=(m.thread||[]).filter(t=>t.from!=='us'&&t.text&&t.text.trim());
 return inbound.length?inbound[inbound.length-1].text:(m.last||'No message content supplied');
}
function gvCHasAcknowledgement(m){
 return !!(m?.thread||[]).some(t=>t.from==='us'&&/thanks for getting in touch|i will confirm the details and get back to you shortly|i.ll check the details/i.test(t.text||''));
}
function gvCIntent(m){
 const t=(gvCLatestClient(m)+' '+(m.subject||'')).toLowerCase();
 if(/sell|list (our|my|the)|downsizing|downsize|sell first/.test(gvCLatestClient(m).toLowerCase()))return 'seller';
 if(/offer|best and final|counter.?offer/.test(t))return 'offer';
 if(/appraisal|valuation|market appraisal|property worth/.test(t))return 'appraisal';
 if(/inspect|open home|inspection|available to inspect/.test(t))return 'inspection';
 if(/price|guide|comparable|reserve/.test(t))return 'price';
 if(/budget|bedroom|looking for|suburb|buy/.test(t))return 'buyer';
 return 'general';
}
function gvCSpecificReply(m){
 const first=gvCFirst(m.contactId),intent=gvCIntent(m),text=gvCLatestClient(m);
 if(intent==='seller')return `Hi ${first}, thanks for getting in touch. Just to clarify, are you thinking of selling your own property before purchasing? If so, I would be happy to call and discuss your plans and timing. Kind regards, Caleb`;
 if(intent==='offer')return `Hi ${first}, thank you for your message. I'd like to confirm the exact offer details and any conditions with you before we discuss next steps. When is a good time for a quick call? Kind regards, Caleb`;
 if(intent==='appraisal')return `Hi ${first}, thanks for your appraisal enquiry. Could you please confirm the property address and a suitable time for a quick call? I can then arrange the appraisal with you. Kind regards, Caleb`;
 if(intent==='inspection')return `Hi ${first}, thanks for asking about an inspection. I'll confirm the current availability for the property before suggesting a time. Would you prefer a weekday or weekend inspection? Kind regards, Caleb`;
 if(intent==='price')return `Hi ${first}, thanks for your question about the price. I'll confirm the current approved guide and relevant sales evidence so I can give you accurate information. Would you like a quick call to discuss it? Kind regards, Caleb`;
 if(intent==='buyer')return `Hi ${first}, thanks for outlining what you're looking for. Could you confirm your preferred timing and whether you'd like me to call you about suitable properties? Kind regards, Caleb`;
 return `Hi ${first}, thanks for your message. I'd like to make sure I understand what you need before I give you an answer. Would you be available for a quick call? Kind regards, Caleb`;
}
function gvCAdviceForMessage(m){
 const intent=gvCIntent(m),ack=gvCHasAcknowledgement(m);
 const lead={seller:'Potential seller. Clarify their property and selling timeframe by phone.',offer:'Offer-related enquiry. Verify the exact offer and conditions before responding.',appraisal:'Appraisal enquiry. Confirm the address and book a suitable appointment.',inspection:'Check the live inspection schedule before promising availability.',price:'Confirm the approved guide and comparable evidence before quoting prices.',buyer:'Qualify their search and prepare an accurate shortlist.',general:'Answer the specific request or call to clarify.'}[intent];
 return ack?`An acknowledgement has already been sent. ${lead} Don't send another generic receipt.`:lead;
}
function gvCIsGeneric(text){return /i.ll check the details and get back to you shortly|i will confirm the details and get back to you shortly|thanks for getting in touch. we can help with that/i.test(text||'')}
function gvCEnsureSmartDraft(m){
 if(!m||m.gvCUserEdited||m.gvCSmartDraft)return;
 if(!m.preparedReply||gvCIsGeneric(m.preparedReply)||gvCIsGeneric(getReply(m))){
   m.preparedReply=gvCSpecificReply(m);m.gvCSmartDraft=true;
 }
}
function gvCNormalise(t){return (t||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function gvCCheckDuplicateDrafts(){
 let changed=false;
 for(const a of state.actions){
  if(a.status!=='Awaiting review'||!a.messageId||!['SMS','Email','Portal reply'].includes(a.type))continue;
  const m=getMsg(a.messageId);if(!m)continue;
  const outbound=(m.thread||[]).filter(t=>t.from==='us'&&t.text);
  if(outbound.some(t=>gvCNormalise(t.text)===gvCNormalise(a.body))){
   a.status='Blocked · identical reply already in history';a.gvCDuplicateBlocked=true;
   audit('draft','GeeVee blocked a duplicate message',`Action ${a.id}: identical text already exists in ${m.id}. No send or approval required.`);changed=true;
  }
 }
 if(changed)persist();
}
function gvCCleanQueue(){
 gvCCheckDuplicateDrafts();
 return gvCPreviousQueue().filter(x=>x.kind!=='research'); // Background-only research does not belong on an agent's Today list.
}
const gvCPreviousQueue=streamQueue;
streamQueue=gvCCleanQueue;

function gvCMessageName(m){return personName(m.contactId)||'Contact'}
function gvCPreview(t,n=120){const s=String(t||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,'')+'…':s}
function gvCButton(label,name,id,style=''){return action(label,name,id,style)}
function gvCMenuButton(x){return gvCButton('More ···','gvCMenu',x.key,'sm')}
function gvCOpenMenu(x){
 const key=x.key;let items='';
 if(x.kind==='action')items=gvCButton('Ignore','quickIgnore',x.ref.id,'sm')+gvCButton('Reschedule review','quickSchedule',x.ref.id,'sm');
 else if(x.kind==='message')items=gvCButton('Ignore','dayReplyIgnore',x.ref.id,'sm')+gvCButton('Remind me later','dayReplySchedule',x.ref.id,'sm');
 else if(x.kind==='offer')items=gvCButton('Ask for best & final','gvBestFinal',x.ref.id,'sm')+gvCButton('Accept (vendor authority required)','gvOfferAccept',x.ref.id,'sm')+gvCButton('Decline (vendor authority required)','gvOfferDecline',x.ref.id,'sm')+gvCButton('Counter offer','gvOfferCounter',x.ref.id,'sm');
 else if(x.kind==='appraisal')items=gvCButton('Print appraisal','cmaApprovePrint',x.ref.id,'sm')+gvCButton('Edit appraisal','cmaEdit',x.ref.id,'sm')+gvCButton('Review tomorrow','streamDefer',x.key,'sm');
 else if(x.kind==='autoexception')items=gvCButton('Review tomorrow','streamDefer',x.key,'sm');
 else items=gvCButton('Remind me tomorrow','streamDefer',x.key,'sm')+(x.kind==='task'?gvCButton('Open original reminder','openTask',x.ref.id,'sm'):'');
 return `<div class="gvc-menu-wrap">${gvCMenuButton(x)}${ui.gvCompactMenu===key?`<div class="gvc-menu" role="group" aria-label="Additional actions">${items}</div>`:''}</div>`;
}
function gvCContextThread(m){
 const latest=gvCLatestClient(m);
 const ack=gvCHasAcknowledgement(m);
 return `<div class="gvc-copy"><div class="gvc-mini-label">${h(m.channel||'Message')} from ${h(gvCMessageName(m))}${m.time?' · '+h(m.time):''}</div><p>“${h(latest)}”</p></div>
 ${ack?`<div class="gvc-previous">${ico('check','sm')} Acknowledgement already sent · GeeVee will not repeat it</div>`:''}
 ${gvCButton(ui.gvCompactHistory===m.id?'Hide conversation':'View conversation','gvCHistory',m.id,'sm ghost')}
 ${ui.gvCompactHistory===m.id?`<div class="gvc-history"><div class="gvc-mini-label">Conversation history</div>${(m.thread||[]).map(t=>`<div class="gvc-thread-row"><b>${t.from==='us'?'Agency':'Client'}</b><span>${h(t.text||'')}</span></div>`).join('')}</div>`:''}`;
}
function gvCCardRecommendation(text){return `<div class="gvc-recommend"><span class="gvc-spark">✦</span><div><b>GeeVee suggests</b><span>${h(text)}</span></div></div>`}
function gvCInlineMessage(m){
 gvCEnsureSmartDraft(m);
 const edit=ui.dayEditing===m.id,schedule=ui.dayScheduling===m.id;
 const ack=gvCHasAcknowledgement(m),seller=gvCIntent(m)==='seller';
 const copy=m.preparedReply||gvCSpecificReply(m);
 return `<div class="gvc-content">
 <div class="gvc-message-grid"><div>${gvCContextThread(m)}</div><div class="gvc-response"><div class="gvc-mini-label">GeeVee's suggested ${ack?'follow-up':'reply'}</div>
 ${edit?`<textarea class="gvc-editor" id="day-edit-${h(m.id)}" aria-label="Edit proposed message">${h(copy)}</textarea>`:`<p>${h(copy)}</p>`}</div></div>
 ${gvCCardRecommendation(gvCAdviceForMessage(m))}
 <div class="gvc-actions">${edit?gvCButton('Save changes','dayReplySave',m.id,'primary')+gvCButton('Cancel','dayReplyCancel',m.id,''):seller&&ack?gvCButton('Call '+gvCFirst(m.contactId),'gvCCall',`msg:${m.id}`,'primary')+gvCButton('Approve & Send','dayReplyApprove',m.id,'')+gvCButton('Edit','dayReplyEdit',m.id,''):gvCButton('Approve & Send','dayReplyApprove',m.id,'primary')+gvCButton('Edit','dayReplyEdit',m.id,'')}${gvCOpenMenu({kind:'message',key:'msg:'+m.id,ref:m})}</div>
 ${schedule?`<div class="gvc-inline-panel"><b>Bring this back for review</b><div class="gvc-actions">${gvCButton('Tomorrow','dayReplyTomorrow',m.id,'sm')}${gvCButton('Next week','dayReplyWeek',m.id,'sm')}${gvCButton('Cancel','dayReplyCancelSchedule',m.id,'sm')}</div><small>No outbound send will be scheduled.</small></div>`:''}
 <div class="gvc-quiet-note">Prototype: approvals are simulated; no message is sent.</div></div>`;
}
function gvCActionCard(a){
 const m=a.messageId?getMsg(a.messageId):null,external=['SMS','Email','Portal reply','Portal enquiry'].includes(a.type),edit=ui.inlineEditing===a.id,confirm=ui.inlineConfirming===a.id,schedule=ui.inlineScheduling===a.id;
 const d=findD(a.dealId);
 const context=m?gvCContextThread(m):`<div class="gvc-copy"><div class="gvc-mini-label">${a.type==='eSign'?'Signing request':'Prepared action'} · ${h(personName(a.contactId))}</div><p>${h(a.title)}${d?' · '+h(d.address):''}</p></div>`;
 const title=external?'GeeVee’s proposed reply':a.type==='eSign'?'GeeVee prepared the signing package':'GeeVee prepared this action';
 const note=a.tier==='A3'?'Protected action: verify all terms, recipients and the actual document before authorising.':external&&!m?'The original enquiry is not linked in this sample. Verify its source and the recipient before any real send.':external?'Check the recipient and wording before sending.':'Review any material change; routine CRM notes are saved automatically.';
 return `<div class="gvc-content"><div class="gvc-message-grid"><div>${context}</div><div class="gvc-response"><div class="gvc-mini-label">${h(title)}</div>${edit?`<textarea id="edit-${h(a.id)}" class="gvc-editor" aria-label="Edit GeeVee draft">${h(a.body)}</textarea>`:`<p>${h(a.body)}</p>`}</div></div>
 ${gvCCardRecommendation(note)}
 <div class="gvc-actions">${edit?gvCButton('Save changes','quickSave',a.id,'primary')+gvCButton('Save & review','quickSaveApprove',a.id,'')+gvCButton('Cancel','quickCancelEdit',a.id,''):gvCButton(external?'Approve & Send':a.type==='eSign'?'Review signing':'Approve & Continue','quickApprove',a.id,'primary')+gvCButton('Edit','quickEdit',a.id,'')}${gvCOpenMenu({kind:'action',key:'action:'+a.id,ref:a})}</div>
 ${schedule?`<div class="gvc-inline-panel"><b>When should this return?</b><div class="gvc-actions">${gvCButton('Tomorrow','quickSnoozeTomorrow',a.id,'sm')}${gvCButton('Next week','quickSnoozeWeek',a.id,'sm')}<input type="date" id="date-${h(a.id)}" aria-label="Review date">${gvCButton('Use date','quickSnoozeDate',a.id,'sm')}${gvCButton('Cancel','quickCancelSchedule',a.id,'sm')}</div><small>Only the review is postponed, not an external send.</small></div>`:''}
 ${confirm?`<div class="gvc-inline-panel gvc-protected"><b>Confirm protected review</b><p>Check the complete commercial terms, document and recipients. This only records a demo review.</p><label><input type="checkbox" id="protect-${h(a.id)}"> I have reviewed this exact version.</label><div class="gvc-actions">${gvCButton('Confirm review','quickConfirmProtected',a.id,'primary')}${gvCButton('Back','quickCancelProtected',a.id,'')}</div></div>`:''}
 <div class="gvc-quiet-note">Prototype: no external send, document issue or publication.</div></div>`;
}
function gvCOfferCard(x){
 const o=x.ref,d=findD(o.dealId),buyer=findP(o.buyerId),vendor=findP(o.vendorId);
 return `<div class="gvc-content"><div class="gvc-offer-money"><div><span class="gvc-mini-label">Written offer · ${h(d?.address||'Property')}</span><strong>${aud(o.amount)}</strong><small>${h(buyer?.name||'Buyer')} → ${h(vendor?.name||'Vendor')}</small></div>${tag('Time-sensitive','hot')}</div>
 <div class="gvc-facts"><span><b>Deposit</b>${h(o.deposit)}</span><span><b>Finance</b>${h(o.finance)}</span><span><b>Settlement</b>${h(o.settlement)}</span><span><b>Other terms</b>${h(o.conditions)}</span></div>
 ${gvCCardRecommendation('Present the full written offer and conditions to the vendor promptly. Ask the buyer whether this is their best and final offer where appropriate. Do not accept, reject or counter without vendor instructions.')}
 <div class="gvc-actions">${gvCButton('Present to vendor','gvPresentVendor',o.id,'primary')}${gvCButton('Call buyer','gvCallBuyer',o.id,'')}${gvCButton('Call vendor','gvCallVendor',o.id,'')}${gvCOpenMenu(x)}</div>
 ${ui.gvOfferId===o.id&&ui.gvOfferChoice?`<div class="gvc-inline-panel"><b>${h(ui.gvOfferChoice)} · agent and vendor verification required</b><p>Record and verify vendor instructions before any offer acceptance, rejection or counter.</p><div class="gvc-details">${gvOfferCard(o)}</div></div>`:''}
 <div class="gvc-quiet-note">Protected offer decisions require the vendor's verified instructions. All outcomes are simulated.</div></div>`;
}
function gvCSimpleTask(x){
 const r=x.ref,kind=x.kind,person=x.ref?.contactId?personName(x.ref.contactId):x.ref?.name||'';
 if(kind==='autoexception')return `<div class="gvc-content">${gvCCardRecommendation('The contact and property do not match. GeeVee has blocked the update, so review this specific conflict before linking any new notes.')}<div class="gvc-actions">${gvCButton('Check record link','gvCWhy',x.key,'primary')}${gvCOpenMenu(x)}</div>${ui.gvCompactWhy===x.key?gvAutoException(r):''}</div>`;
 if(kind==='appraisal'){
  const p=r,d=findD(p.dealId),checks=cmaChecks(p),ready=cmaReady(p);
  return `<div class="gvc-content"><div class="gvc-offer-money"><div><div class="gvc-mini-label">Appraisal pack · ${h(d?.address||'Property')}</div><strong>${cmaMoney(p.low)} to ${cmaMoney(p.high)}</strong><small>3 fictional comparable candidates · ${ready?'Ready to review':'Property data needs checking'}</small></div>${tag(ready?'Ready for review':'Needs review',ready?'teal':'hot')}</div>
  ${gvCCardRecommendation('GeeVee has assembled the draft appraisal. Check the proposed range and comparable evidence, then approve the finished pack for sending or printing.')}
  <div class="gvc-actions">${gvCButton('Review appraisal pack','gvCWhy',x.key,'primary')}${gvCOpenMenu(x)}</div>
  ${ui.gvCompactWhy===x.key?`<div class="gvc-details">${cmaReviewCard(p)}</div>`:''}<div class="gvc-quiet-note">Sample sales are fictional; production release needs verified licensed comparable data.</div></div>`;
 }
 if(kind==='rescue'){
  const d=r,sig=gvMarket(d.id);return `<div class="gvc-content"><div class="gvc-signal"><b>${sig?.days||'?'} days on market</b><span>${sig?.enquiries||0} enquiries · ${sig?.offers||0} offers</span></div>${gvCCardRecommendation(`Interest is low. Call the vendor about a pricing and marketing review. Use verified comparable sales to support the discussion, not the demo figures.`)}
  <div class="gvc-actions">${gvCButton('Call vendor','gvCCall',x.key,'primary')}${gvCButton('Draft vendor review','gvDraftPriceReview',d.id,'')}${gvCButton('Show sales evidence','gvCWhy',x.key,'sm')}${gvCOpenMenu(x)}</div>${ui.gvCompactWhy===x.key?`<div class="gvc-details">${gvMarketCard(d,sig)}</div>`:''}</div>`;
 }
 if(kind==='engaged'){
  const d=findD(r.dealId);return `<div class="gvc-content"><div class="gvc-signal"><b>${r.views} views in ${r.days} days</b><span>${h(d?.address||'Property')} · ${r.saves} saves</span></div>${gvCCardRecommendation('This buyer has returned to the listing several times. Call to ask for feedback and whether they would like another inspection. Views alone do not establish intent.')}
  <div class="gvc-actions">${gvCButton('Call buyer','gvCCall',x.key,'primary')}${gvCButton('Prepare personal SMS','gvEngagedDraft',r.id,'')}${gvCOpenMenu(x)}</div></div>`;
 }
 if(kind==='meta')return `<div class="gvc-content"><div class="gvc-signal"><b>${h(r.name)}</b><span>${h(r.suburb)} · ${h(r.source)} lead</span></div>${gvCCardRecommendation(r.note||'Call to qualify this enquiry and confirm their plans.')}
 <div class="gvc-actions">${gvCButton('Call '+(r.name||'lead').split(' ')[0],'gvCCall',x.key,'primary')}${gvCOpenMenu(x)}</div></div>`;
 if(kind==='listing')return `<div class="gvc-content"><div class="gvc-signal"><b>${h(r.address)}, ${h(r.suburb)}</b><span>Potential commission ${aud(comm(r))} · ${h(r.stage)}</span></div>${gvCCardRecommendation((r.why||'Seller follow-up is due.')+' Suggested next step: '+(r.next||'Call to qualify the opportunity.'))}
 <div class="gvc-actions">${gvCButton('Call seller','gvCCall',x.key,'primary')}${gvCButton('Draft follow-up','dayListingDraft',r.id,'')}${gvCOpenMenu(x)}</div></div>`;
 if(kind==='buyer')return `<div class="gvc-content"><div class="gvc-signal"><b>${h(r.address)}</b><span>${r.buyerMatches} possible buyer matches</span></div>${gvCCardRecommendation('Verify each buyer’s requirements and permission to contact, then prepare a relevant property recommendation.')}
 <div class="gvc-actions">${gvCButton('Prepare buyer message','dayBuyerDraft',r.id,'primary')}${gvCButton('View property','openDeal',r.id,'')}${gvCOpenMenu(x)}</div></div>`;
 if(kind==='task'){
  const category=r.category||'Reminder';
  const note=category==='Call'?(r.title+' · Your callback is due.'):r.title.toLowerCase().includes('comparable')?'GeeVee should prepare the appraisal, not leave the research to the agent.':(r.origin||'Previously scheduled CRM reminder.');
  return `<div class="gvc-content"><div class="gvc-signal"><b>${h(r.title)}</b><span>${h(person||'CRM task')} · ${h(r.due)}${r.dealId?' · '+h(findD(r.dealId)?.address||''):''}</span></div>${gvCCardRecommendation(note)}
   <div class="gvc-actions">${category==='Call'&&r.contactId?gvCButton('Call now','gvCCall',x.key,'primary'):gvCButton('Mark complete','dayTaskDone',r.id,'primary')}${gvCOpenMenu(x)}</div><div class="gvc-quiet-note">Complete a task only after the work has actually been done.</div></div>`;
 }
 return `<div class="gvc-content">${gvCCardRecommendation('Review this outstanding work.')}${gvCOpenMenu(x)}</div>`;
}
function gvCName(x){
 if(x.kind==='message')return gvCMessageName(x.ref);
 if(x.kind==='action')return x.ref.tier==='A3'?`${x.ref.type==='eSign'?'Authority':'Proposal'} · ${personName(x.ref.contactId)}`:(personName(x.ref.contactId)||x.ref.title);
 if(x.kind==='offer')return `${findD(x.ref.dealId)?.address||'Listing'} · New offer`;
 if(x.kind==='rescue')return `${x.ref.address} · Price review`;
 if(x.kind==='engaged')return `${personName(x.ref.contactId)} · High interest`;
 if(x.kind==='appraisal')return `Appraisal ready · ${findD(x.ref.dealId)?.address||'Property'}`;
 if(x.kind==='meta')return `Call ${x.ref.name}`;
 if(x.kind==='autoexception')return `Verify ${personName(x.ref.contactId)}’s record`;
 if(x.kind==='listing')return `Follow up ${personName(x.ref.contactId)}`;
 if(x.kind==='buyer')return `Match buyers · ${x.ref.address}`;
 return x.ref.title||'Next task';
}
function gvCSub(x){
 if(x.kind==='message')return `${x.ref.channel} · ${gvCPreview(gvCLatestClient(x.ref),110)}`;
 if(x.kind==='action')return `${x.ref.type} · ${gvCPreview(x.ref.body,95)}`;
 if(x.kind==='offer')return `${aud(x.ref.amount)} · ${personName(x.ref.buyerId)} · ${x.ref.deadline}`;
 if(x.kind==='rescue')return `${gvMarket(x.ref.id)?.days||'?'} days listed · Interest has slowed`;
 if(x.kind==='appraisal')return `GeeVee prepared · ${x.ref.comps.length} comparables to verify`;
 if(x.kind==='meta')return `${x.ref.suburb} · ${x.ref.role==='seller'?'Seller lead':'Meta lead'}`;
 if(x.kind==='autoexception')return 'Conflicting CRM property link · Needs a decision';
 return gvCPreview(streamDescription(x),105);
}
function gvCKindBadge(x){
 const kind=x.kind;
 if(kind==='offer')return tag('Offer · urgent','hot');
 if(kind==='action')return tag(x.ref.tier==='A3'?'Protected review':'Approval',x.ref.tier==='A3'?'red':'yellow');
 if(kind==='message')return tag(gvCIntent(x.ref)==='seller'?'Seller enquiry':x.ref.channel,'teal');
 if(kind==='meta')return tag('Meta seller lead','teal');
 if(kind==='appraisal')return tag('Appraisal ready','teal');
 if(kind==='autoexception')return tag('Record conflict','hot');
 if(kind==='rescue')return tag('Listing rescue','hot');
 if(kind==='engaged')return tag('Buyer interest','teal');
 return tag(kind==='task'?'Reminder':kind==='buyer'?'Buyer match':'Listing opportunity','');
}
const gvCPreviousActiveCard=streamActiveCard;
streamActiveCard=function(x,index,expanded){
 if(!x)return'';
 const name=gvCName(x),sub=gvCSub(x),body=x.kind==='message'?gvCInlineMessage(x.ref):x.kind==='action'?gvCActionCard(x.ref):x.kind==='offer'?gvCOfferCard(x):gvCSimpleTask(x);
 return `<article class="stream-item gv-compact-item ${expanded?'expanded':''}" data-work-key="${h(x.key)}">
 <div class="gv-compact-header"><span class="gv-compact-num">${index+1}</span><button class="gv-compact-open" data-action="streamExpand" data-id="${h(x.key)}" aria-expanded="${expanded}"><span class="gv-compact-label">${gvCKindBadge(x)} ${index===0?'<span class="gv-compact-next">NEXT</span>':''}</span><strong>${h(name)}</strong><span class="gv-compact-excerpt">${h(sub)}</span></button><button class="gv-compact-chevron" data-action="streamExpand" data-id="${h(x.key)}" aria-label="${expanded?'Collapse':'Expand'} ${h(name)}">${ico(expanded?'chevron':'arrow','sm')}</button></div>
 ${expanded?`<div class="gv-compact-body">${body}</div>`:''}</article>`;
};
const gvCPreviousToday=today;
today=function(){
 const all=streamQueue(),shown=all.slice(0,ui.streamVisible||10),waiting=all.filter(x=>['offer','action','message','appraisal','autoexception'].includes(x.kind)).length;
 const current=all.some(x=>x.key===ui.streamExpanded)?ui.streamExpanded:all[0]?.key||'';
 ui.streamExpanded=current;
 return `${sectionHeader('Today','Start at the top. GeeVee has already done the preparation.',action('More tools','route','more','sm'))}
 <div class="stream-layout gv-clean-layout"><section class="stream-work" id="geevee-worklist"><div class="gv-clean-title"><div><div class="eyebrow">✦ GEEVEE · YOUR WORKLIST</div><h2>One thing at a time.</h2><p>Read it. Act on it. It disappears.</p></div><div class="gv-clean-total"><strong>${all.length}</strong><span>tasks remaining</span></div></div>
 <div class="gv-clean-stats"><span>${ico('check','sm')} <b>${waiting}</b> decisions or replies</span><span>${ico('phone','sm')} Calls and opportunities follow</span><span class="gv-clean-safe">Demo · No live sends</span></div>
 <div class="stream-list" aria-label="GeeVee prioritised worklist">${shown.map((x,i)=>streamActiveCard(x,i,x.key===current)).join('')||`<div class="stream-empty"><h2>You're up to date.</h2><p>GeeVee has no further eligible sample work right now. New verified opportunities will appear here.</p>${action('Explore my deals','route','deals','primary')}</div>`}</div>
 ${all.length>shown.length?`<div class="stream-load">${action('Show next '+Math.min(10,all.length-shown.length),'streamMore','','big')} <span>${shown.length} of ${all.length} shown</span></div>`:''}
 ${streamHistory()}</section><aside class="stream-sidebar">${streamDiary()}</aside></div>`;
};
const gvCPreviousDoAction=doAction;
doAction=function(name,id){
 if(name==='gvCMenu'){ui.gvCompactMenu=ui.gvCompactMenu===id?'':id;render();return;}
 if(name==='gvCHistory'){ui.gvCompactHistory=ui.gvCompactHistory===id?'':id;render();return;}
 if(name==='gvCWhy'){ui.gvCompactWhy=ui.gvCompactWhy===id?'':id;render();return;}
 if(['cmaApprovePrint','cmaApproveSend','cmaEdit'].includes(name)){ui.gvCompactWhy='cma:'+id;ui.gvCompactMenu='';}
 if(name==='gvCCall'){
  const x=streamQueue().find(item=>item.key===id);if(!x)return;
  let pId=x.kind==='meta'?x.ref.id:x.kind==='message'?x.ref.contactId:x.kind==='rescue'||x.kind==='listing'?x.ref.contactId:x.ref.contactId;
  if(!pId)return toast('No linked contact found for this call.');
  ui.streamCallKey=x.key;openCall(pId);return;
 }
 if(name==='streamExpand'){ui.gvCompactMenu='';ui.gvCompactWhy='';}
 if(['quickIgnore','quickSchedule','dayReplyIgnore','dayReplySchedule','dayReplyApprove','quickApprove','dayTaskDone','quickSnoozeTomorrow','quickSnoozeWeek','dayReplyTomorrow','dayReplyWeek'].includes(name))ui.gvCompactMenu='';
 return gvCPreviousDoAction(name,id);
};
const gvCPreviousSaveCall=saveCall;
saveCall=function(id){
 const key=ui.streamCallKey;gvCPreviousSaveCall(id);
 if(key&&key.startsWith('msg:')&&state.calls.length){
  const m=getMsg(key.slice(4));if(m){m.unread=false;m.dayHandled='Handled by call';}
  persist();render();
 }
};
// Existing data stays intact. Only exact, already-delivered duplicates are blocked.
gvCCheckDuplicateDrafts();

/* ===== GVX layer, 16 Nov 2026 =====
   1. GeeVee answers an enquiry on its own only when every fact comes from a verified record (decision 16 Nov).
   2. Seller leads are always a call from the agent: no draft, no message.
   3. Every reply GeeVee didn't send says why.
   4. The headline count is only what needs the agent. Opportunities sit in "When you have time".
   5. "Present to vendor" opens the vendor email straight away.
   6. A coach line on Today and a coach card on My deals, from deal data only.
   Prototype: nothing is sent. Automatic answers are simulated and labelled. */
const GVX_OPEN={'D-2006':{when:'today at 2:30pm',src:"Calendar: Open for inspection, 9 Rose Avenue, today 2:30pm"}};
function gvxEnsure(){
 if(!state.gvx)state.gvx={answered:{},pin:'',withdrawn:{}};
 if(state.settings.gvxAuto===undefined)state.settings.gvxAuto=true;
 // Drafted texts to brand-new seller leads are withdrawn: those people get a call
 for(const a of state.actions){
  const p=findP(a.contactId);
  if(a.status==='Awaiting review'&&['SMS','Email'].includes(a.type)&&p&&['seller','both'].includes(p.role)&&/appraisal|valuation|seller/i.test(a.title)&&!state.gvx.withdrawn[a.id]){
   state.gvx.withdrawn[a.id]=true;a.status='Withdrawn · seller leads are called';
   audit('policy','Draft withdrawn: '+a.title,'New seller leads are always a call from the agent. GeeVee does not draft or send them messages.');
  }
 }
}
function gvxClassify(m){
 const p=findP(m.contactId),d=findD(m.dealId),text=(gvCLatestClient(m)||m.last||'').toLowerCase(),intent=gvCIntent(m),first=gvCFirst(m.contactId);
 if(!p)return{mode:'approve',reason:"The sender isn't matched to one contact."};
 if(intent==='seller'||intent==='appraisal'||/when we would like to list|thinking of selling/.test(text))return{mode:'call',reason:'Seller conversations are always a call from you.'};
 if(p.consent!=='ok')return{mode:'approve',reason:first+' has opted out, so GeeVee sends nothing automatically.'};
 if(intent==='offer'||intent==='price')return{mode:'approve',reason:'Price, offers and negotiation always wait for you.'};
 if(d&&d.contactId===m.contactId||/marketing budget|proposal|authority/.test(text))return{mode:'approve',reason:'Vendor matters always wait for you.'};
 const live=d&&d.active&&['For sale','Listed'].includes(d.stage);
 if(/section 32/.test(text)){
  if(!d)return{mode:'approve',reason:"The message isn't linked to a property, so GeeVee can't tell which Section 32 they mean."};
  if(!live||!d.compliance||!d.compliance['Contract of Sale + Section 32'])return{mode:'approve',reason:'No Section 32 is recorded as available for '+d.address+'.'};
  return{mode:'auto',answer:'Hi '+first+', here is the Contract of Sale and Section 32 for '+d.address+', '+d.suburb+': [secure link]. This reply was sent by GeeVee, Caleb\'s assistant at Collings. Caleb is on 0400 000 000 if you would like to talk it through.',facts:['Property: '+d.address+' ('+d.stage+') · deal record '+d.id,'Contract of Sale + Section 32: recorded as available on the compliance checklist','Contact: '+p.name+', matched by '+m.channel+', consent OK']};
 }
 if(/inspect|open home|inspection/.test(text)){
  if(!d)return{mode:'approve',reason:"The message isn't linked to a property, so GeeVee can't tell which one they mean."};
  if(!live)return{mode:'approve',reason:d.address+' is not for sale right now ('+d.stage+').'};
  const o=GVX_OPEN[d.id];
  if(!o)return{mode:'approve',reason:'No inspection time is recorded for '+d.address+'. Add one and GeeVee can answer this next time.'};
  return{mode:'auto',answer:'Hi '+first+', yes, '+d.address+', '+d.suburb+' is still for sale. The next open for inspection is '+o.when+'. This reply was sent by GeeVee, Caleb\'s assistant at Collings. Caleb is on 0400 000 000 if you would like a private inspection.',facts:['Property: '+d.address+' ('+d.stage+') · deal record '+d.id,o.src,'Contact: '+p.name+', matched by '+m.channel+', consent OK']};
 }
 if(intent==='buyer')return{mode:'approve',reason:'Choosing which properties to suggest is your call. GeeVee has saved their requirements.'};
 return{mode:'approve',reason:"GeeVee can't answer all of this from the records."};
}
function gvxPotential(d){return Math.round((d.guide||0)*(d.fee||0)/100)}
const gvxPrevStreamQueue=streamQueue;
streamQueue=function(){
 gvxEnsure();
 let q=gvxPrevStreamQueue().filter(x=>!(x.kind==='action'&&state.gvx.withdrawn[x.ref.id]));
 let changed=false;
 q=q.filter(x=>{
  if(x.kind!=='message')return true;
  const c=gvxClassify(x.ref);x.gvx=c;
  if(c.mode==='auto'&&state.settings.gvxAuto){
   if(!state.gvx.answered[x.ref.id]){state.gvx.answered[x.ref.id]={at:new Date().toISOString(),answer:c.answer,facts:c.facts};audit('auto','GeeVee answered '+personName(x.ref.contactId)+' (simulated)','Answered from verified records only: '+c.facts.join(' | ')+'. Prototype: nothing was sent.');changed=true;}
   return false;
  }
  return true;
 });
 if(changed)persist();
 const pr=x=>x.key===state.gvx.pin?-1:x.kind==='offer'?0:(x.kind==='meta'&&['seller','both'].includes(x.ref.role))||(x.kind==='message'&&x.gvx&&x.gvx.mode==='call')?1:2;
 return q.map((x,i)=>[x,i]).sort((a,b)=>pr(a[0])-pr(b[0])||a[1]-b[1]).map(z=>z[0]);
};
const gvxPrevInlineMessage=gvCInlineMessage;
gvCInlineMessage=function(m){
 const c=gvxClassify(m),p=findP(m.contactId),d=findD(m.dealId);
 if(c.mode==='call'){
  return `<div class="gvc-content"><div class="gvx-callonly"><b>Call ${h(gvCFirst(m.contactId))}. No message.</b><span>Seller conversations are always a call from you, so GeeVee hasn't drafted a reply.</span></div>
  <div class="gvc-message-grid"><div>${gvCContextThread(m)}</div><div class="gvc-response"><div class="gvc-mini-label">What DOMA knows before you call</div><ul class="gvx-brief">
  <li>${h(p?.name||'Contact')} · ${h(p?.suburb||'')} · source: ${h(p?.source||'not recorded')}</li>
  <li>Last contact: ${h(p?.lastContact||'not recorded')}</li>
  ${p?.note?`<li>${h(p.note)}</li>`:''}
  ${d?`<li>Linked property: ${h(d.address)}, ${h(d.suburb)} (${h(d.stage)})</li>`:'<li>No property linked yet. Ask for the address.</li>'}
  ${p?.source==='Cold call'?'<li>Do Not Call Register: not checked in this demo. DOMA must check it before an unsolicited call.</li>':''}
  </ul></div></div>
  <div class="gvc-actions">${gvCButton('Call '+gvCFirst(m.contactId)+' in DOMA','gvCCall','msg:'+m.id,'primary')}${gvCOpenMenu({kind:'message',key:'msg:'+m.id,ref:m})}</div>
  <div class="gvc-quiet-note">After the call, GeeVee prepares the recap and next steps for you to confirm.</div></div>`;
 }
 const why=c.mode==='auto'?'Automatic replies are switched off, so this is waiting for you.':c.reason;
 return `<div class="gvx-why" role="note"><b>Why GeeVee didn't send this itself:</b> ${h(why)}</div>`+gvxPrevInlineMessage(m);
};
const gvxPrevKindBadge=gvCKindBadge;
gvCKindBadge=function(x){return x.kind==='message'&&x.gvx&&x.gvx.mode==='call'?tag('Seller · call','hot'):gvxPrevKindBadge(x)};
function gvxAnsweredPanel(){
 const ids=Object.keys(state.gvx.answered||{}),on=state.settings.gvxAuto;
 const rows=ids.map(id=>{const m=getMsg(id),a=state.gvx.answered[id];if(!m)return'';return `<div class="gvx-ans-row"><div class="gvx-ans-q"><b>${h(personName(m.contactId))}</b> asked by ${h(m.channel)}: "${h(gvCLatestClient(m)||m.last)}"</div><div class="gvx-ans-a">${h(a.answer)}</div><div class="gvx-ans-f"><b>Records used:</b> ${a.facts.map(h).join(' · ')}</div></div>`}).join('');
 return `<section class="gvx-answered card" aria-label="Enquiries GeeVee answered"><div class="gvx-ans-head"><div><b>${on?(ids.length?`GeeVee answered ${ids.length} ${ids.length===1?'enquiry':'enquiries'} for you`:'GeeVee has no enquiries it can fully answer yet'):'Automatic replies are off'}</b><p>${on?'Only enquiries it can answer completely from verified records. Price, offers, vendor matters and seller leads always come to you.':'Every reply waits for your approval.'} <span class="gvx-sim">Simulated · nothing was sent</span></p></div><div class="gvx-ans-btns">${ids.length&&on?action(ui.gvxAnsOpen?'Hide':'Review','gvxAnsToggle','','sm'):''}${action(on?'Turn off':'Turn on','gvxAutoToggle','','sm')}</div></div>${ui.gvxAnsOpen&&on?`<div class="gvx-ans-list">${rows}</div>`:''}</section>`;
}
function gvxCoachLine(){
 const risky=state.deals.filter(d=>d.active&&d.risk),sum=risky.reduce((n,d)=>n+gvxPotential(d),0);
 const uncalled=state.people.filter(p=>['seller','both'].includes(p.role)&&p.callStatus==='not called'&&(p.tags||[]).includes('Hot seller')).length;
 const top=risky.slice().sort((a,b)=>gvxPotential(b)-gvxPotential(a))[0];
 if(!risky.length&&!uncalled)return'';
 return `<div class="gvx-coach" role="note"><span class="gvx-coach-tag">✦ GeeVee coach</span><span>${uncalled?`<b>${uncalled} hot seller leads</b> haven't been called yet. They're at the top of your list. `:''}${top?`<b>${risky.length} deals</b> are stalled or at risk (${aud(sum)} potential commission). Start with ${h(top.address)}: ${h(top.risk||top.why)}.`:''}</span>${top?action('Show me','route','deals','sm'):''}</div>`;
}
const gvxPrevToday=today;
today=function(){
 const all=streamQueue(),later=all.filter(x=>['listing','buyer'].includes(x.kind)),need=all.filter(x=>!['listing','buyer'].includes(x.kind));
 const shown=need.slice(0,ui.streamVisible||10),decisions=need.filter(x=>['offer','action','message','appraisal','autoexception'].includes(x.kind)).length,callsN=need.filter(x=>x.kind==='meta'||(x.kind==='message'&&x.gvx&&x.gvx.mode==='call')).length;
 const current=all.some(x=>x.key===ui.streamExpanded)?ui.streamExpanded:need[0]?.key||'';
 ui.streamExpanded=current;
 const laterShown=ui.gvxLaterOpen?later.slice(0,ui.gvxLaterVisible||10):[];
 return `${sectionHeader('Today','Start at the top. GeeVee has already done the preparation.',action('More tools','route','more','sm'))}
 ${gvxCoachLine()}
 <div class="stream-layout gv-clean-layout"><section class="stream-work" id="geevee-worklist"><div class="gv-clean-title"><div><div class="eyebrow">✦ GEEVEE · YOUR WORKLIST</div><h2>One thing at a time.</h2><p>Read it. Act on it. It disappears.</p></div><div class="gv-clean-total"><strong>${need.length}</strong><span>need you today</span></div></div>
 <div class="gv-clean-stats"><span>${ico('check','sm')} <b>${decisions}</b> decisions or replies</span><span>${ico('phone','sm')} <b>${callsN}</b> calls</span><span class="gv-clean-safe">Demo · No live sends</span></div>
 ${gvxAnsweredPanel()}
 <div class="stream-list" aria-label="GeeVee prioritised worklist">${shown.map((x,i)=>streamActiveCard(x,i,x.key===current)).join('')||`<div class="stream-empty"><h2>You're up to date.</h2><p>Nothing needs you right now.</p>${action('Explore my deals','route','deals','primary')}</div>`}</div>
 ${need.length>shown.length?`<div class="stream-load">${action('Show next '+Math.min(10,need.length-shown.length),'streamMore','','big')} <span>${shown.length} of ${need.length} shown</span></div>`:''}
 <section class="gvx-later card"><div class="gvx-ans-head"><div><b>When you have time: ${later.length} opportunities GeeVee found</b><p>${later.filter(x=>x.kind==='listing').length} possible listings and ${later.filter(x=>x.kind==='buyer').length} buyer matches. None are urgent, so they don't count towards today.</p></div><div class="gvx-ans-btns">${action(ui.gvxLaterOpen?'Hide':'Show','gvxLaterToggle','','sm')}</div></div>
 ${ui.gvxLaterOpen?`<div class="stream-list">${laterShown.map((x,i)=>streamActiveCard(x,need.length+i,x.key===current)).join('')}</div>${later.length>laterShown.length?`<div class="stream-load">${action('Show 10 more','gvxLaterMore','','')}</div>`:''}`:''}</section>
 ${streamHistory()}</section><aside class="stream-sidebar">${streamDiary()}</aside></div>`;
};
const gvxPrevDeals=deals;
deals=function(){
 const risky=state.deals.filter(d=>d.active&&d.risk).sort((a,b)=>gvxPotential(b)-gvxPotential(a)).slice(0,3);
 const card=risky.length?`<section class="gvx-coachcard card" aria-label="GeeVee coach"><div class="eyebrow">✦ GEEVEE COACH · WHERE YOUR NEXT COMMISSION IS STUCK</div>${risky.map(d=>`<div class="gvx-coach-row"><div><b>${h(d.address)}, ${h(d.suburb)}</b> <span class="gvx-coach-meta">${h(d.stage)} · ${aud(gvxPotential(d))} potential · last change ${h(d.lastChange||'not recorded')}</span><p><b>What's wrong:</b> ${h(d.risk)}. <b>Next step:</b> ${h(d.next||'Call the owner')}.</p></div><div class="gvx-ans-btns">${action('Call '+h(gvCFirst(d.contactId)),'gvxCall',d.contactId,'sm')}${action('Open','openDeal',d.id,'sm')}</div></div>`).join('')}<p class="gvx-coach-note">Based only on each deal's recorded stage, risk and last change. Potential commission is guide × fee, not a forecast.</p></section>`:'';
 const html=gvxPrevDeals();
 const i=html.indexOf('</div>',html.indexOf('page-head')>-1?html.indexOf('page-head'):0);
 return card?html.replace(/(<div class="(?:grid|stat|money)[^"]*")/,card+'$1'):html;
};
const gvxPrevDoAction=doAction;
doAction=function(name,id){
 if(name==='gvxAnsToggle'){ui.gvxAnsOpen=!ui.gvxAnsOpen;render();return;}
 if(name==='gvxLaterToggle'){ui.gvxLaterOpen=!ui.gvxLaterOpen;render();return;}
 if(name==='gvxLaterMore'){ui.gvxLaterVisible=(ui.gvxLaterVisible||10)+10;render();return;}
 if(name==='gvxCall'){openCall(id);return;}
 if(name==='gvxAutoToggle'){
  gvxEnsure();state.settings.gvxAuto=!state.settings.gvxAuto;
  if(!state.settings.gvxAuto)state.gvx.answered={};
  audit('policy','Automatic replies turned '+(state.settings.gvxAuto?'on':'off'),'Changed by Caleb Richards on Today.');persist();render();
  toast(state.settings.gvxAuto?'Automatic replies are on. GeeVee only answers what it can fully answer from records.':'Automatic replies are off. Every reply waits for you.');return;
 }
 if(name==='gvPresentVendor'){
  const before=new Set(state.actions.map(a=>a.id));
  gvxPrevDoAction(name,id);
  const made=state.actions.find(a=>!before.has(a.id));
  if(made){gvxEnsure();state.gvx.pin='action:'+made.id;ui.streamExpanded='action:'+made.id;persist();render();toast('The email to the vendor is open at the top. Check it and approve. Nothing has been sent.');}
  return;
 }
 const r=gvxPrevDoAction(name,id);
 if(state.gvx&&state.gvx.pin&&!streamQueue().some(x=>x.key===state.gvx.pin)){state.gvx.pin='';persist();}
 return r;
};

/* ===== GVX Ask GeeVee, 16 Nov 2026 =====
   One box on every page. It finds records and prepares drafts. It never sends and never changes a record by itself.
   Prototype: it understands a set of phrases, not free conversation. Matching uses only what is recorded. */
function gvxFindDeal(l){
 const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(),q=' '+norm(l)+' ';
 let best=null,bs=0;
 for(const d of state.deals){
  const w=norm(d.address).split(' ').filter(x=>!['street','road','avenue','st','rd','ave','drive','crescent','court'].includes(x));
  const hits=w.filter(x=>q.includes(' '+x+' ')).length;
  const sc=hits===w.length?10+w.length:(hits>=2?hits:0);
  if(sc>bs){bs=sc;best=d;}
 }
 return best;
}
function gvxMatchBuyers(d){
 const out=[];
 for(const p of state.people.filter(x=>['buyer','both'].includes(x.role)&&x.id!==d.contactId)){
  const why=[];let score=0;
  const off=(state.offers||[]).find(o=>o.dealId===d.id&&o.buyerId===p.id);
  if(off){why.push('Made a written offer of '+aud(off.amount)+' on it ('+String(off.status).toLowerCase()+')');score+=6;}
  const ms=state.messages.filter(m=>m.contactId===p.id&&m.dealId===d.id);
  if(ms.length){why.push('Enquired about this property by '+ms[0].channel+' ('+ms[0].time+')');score+=5;}
  const ba=(state.buyerActivity||[]).find(a=>a.contactId===p.id&&a.dealId===d.id);
  if(ba){why.push('Viewed it '+ba.views+' times in '+ba.days+' days and saved it '+ba.saves+(ba.saves===1?' time':' times'));score+=4;}
  if(state.messages.some(m=>m.contactId===p.id&&new RegExp('\\b'+d.suburb+'\\b','i').test((m.thread||[]).map(t=>t.text).join(' ')+' '+m.last))){why.push('Mentioned '+d.suburb+' in a message');score+=3;}
  if(p.suburb===d.suburb){why.push('Recorded suburb is '+d.suburb);score+=2;}
  if(score)out.push({p,why,score,ok:p.consent==='ok',liveOffer:!!off&&!/declin|withdraw|not proceed|reject/i.test(String(off.status))});
 }
 return out.sort((a,b)=>b.score-a.score);
}
function gvxBuyerDraft(p,d,type){
 const first=p.name.split(' ')[0],live=d.active&&['For sale','Listed'].includes(d.stage),o=GVX_OPEN[d.id];
 const known=state.messages.some(m=>m.contactId===p.id&&m.dealId===d.id)||(state.buyerActivity||[]).some(a=>a.contactId===p.id&&a.dealId===d.id);
 const body=(type==='Email'?'Hi '+first+',\n\n':'Hi '+first+', ')+(known?'following up on your interest in ':'this one may suit what you are looking for: ')+d.address+', '+d.suburb+(known?'':' is for sale')+'.'+(o?' The next open for inspection is '+o.when+'.':'')+' Would you like the details or a private inspection?'+(type==='Email'?'\n\nCaleb Richards\nCollings Real Estate\n\nTo stop these emails, reply unsubscribe.':' Caleb, Collings. Reply STOP to opt out.');
 return{live,body};
}
function gvxBuyerRows(d,inModal){
 const ms=gvxMatchBuyers(d),live=d.active&&['For sale','Listed'].includes(d.stage),drafted=(ui.gvxAsk&&ui.gvxAsk.drafted)||{};
 const canAll=ms.filter(x=>x.ok&&!x.liveOffer&&!drafted[x.p.id+':'+d.id]).length;
 if(!ms.length)return `<p class="gvx-ask-empty">No buyer in DOMA has a recorded link to ${h(d.address)}: no enquiry, no views, no offer, and no one recorded as looking in ${h(d.suburb)}.</p>`;
 return `<p class="gvx-ask-lead"><b>${ms.length} ${ms.length===1?'buyer has':'buyers have'} a recorded reason to hear about ${h(d.address)}, ${h(d.suburb)}.</b> Strongest first. Budgets and bedroom needs aren't recorded for these buyers, so check suitability before you contact them.</p>
 ${!live?`<div class="gvx-why">${h(d.address)} isn't advertised yet (${h(d.stage)}), so GeeVee won't draft messages about it. You can still call.</div>`:''}
 <div class="gvx-ask-list">${ms.map(x=>{const k=x.p.id+':'+d.id,dr=drafted[k];return `<div class="gvx-ask-row"><div class="gvx-ask-who"><b>${h(x.p.name)}</b> <span>${h(x.p.suburb)} · ${h(x.p.phone||'')}</span><ul>${x.why.map(w=>`<li>${h(w)}</li>`).join('')}</ul></div>
 <div class="gvx-ans-btns">${x.ok?action('Call','call',x.p.id,'sm primary')+(x.liveOffer?'<span class="gvx-optout">Has a live offer. Call them, no marketing.</span>':live?(dr?`<span class="gvx-sim">${h(dr)} draft is in Today</span>`:action('Text','gvxDraft','SMS|'+k,'sm')+action('Email','gvxDraft','Email|'+k,'sm')):''):'<span class="gvx-optout">Opted out. Do not contact.</span>'}${action('Open','openPerson',x.p.id,'sm')}</div></div>`}).join('')}</div>
 ${live&&canAll>1?`<div class="gvx-ask-foot">${action('Draft a text to all '+canAll,'gvxDraftAll',d.id,'')}<span>Each draft goes to Today for your approval. Nothing is sent from here.</span></div>`:`<div class="gvx-ask-foot"><span>Drafts go to Today for your approval. Nothing is sent from here.</span></div>`}`;
}
function gvxAskRun(q){
 const l=q.toLowerCase().trim(),A={q,drafted:(ui.gvxAsk&&ui.gvxAsk.drafted)||{}};
 const thisDeal=/\b(this|that|the) (property|listing|one|place)\b/.test(l)&&ui.gvxLastDeal?findD(ui.gvxLastDeal):null;
 const d=gvxFindDeal(l)||thisDeal;
 if(/buyer/.test(l)&&!/buyers? in\b/.test(l)){
  if(d)return Object.assign(A,{kind:'buyers',dealId:d.id});
  return Object.assign(A,{kind:'pickDeal'});
 }
 const sub=[...new Set(state.deals.map(x=>x.suburb).concat(state.people.map(x=>x.suburb)))].find(s=>s&&l.includes(s.toLowerCase()));
 if(/buyers? in\b/.test(l)&&sub)return Object.assign(A,{kind:'people',ids:state.people.filter(p=>['buyer','both'].includes(p.role)&&p.suburb===sub).map(p=>p.id),label:'Buyers recorded in '+sub});
 if(d)return Object.assign(A,{kind:'deal',dealId:d.id});
 if(/(propert|listing|for sale|homes?)/.test(l)&&sub)return Object.assign(A,{kind:'deals',ids:state.deals.filter(x=>x.suburb===sub).map(x=>x.id),label:'Properties in '+sub});
 if(/stalled|at risk|stuck|coach/.test(l))return Object.assign(A,{kind:'deals',ids:state.deals.filter(x=>x.active&&x.risk).sort((a,b)=>gvxPotential(b)-gvxPotential(a)).map(x=>x.id),label:'Deals that are stalled or at risk, biggest first',risk:true});
 if(/who should i call|who do i call|call list|seller leads?|hot sellers?/.test(l))return Object.assign(A,{kind:'people',ids:state.people.filter(p=>['seller','both'].includes(p.role)&&p.callStatus==='not called'&&(p.tags||[]).includes('Hot seller')).map(p=>p.id),label:'Hot seller leads you haven\'t called yet'});
 const words=l.replace(/\b(find|show|open|me|the|a|for|please|who|is|contact|person|search|look up|get)\b/g,' ').split(/\s+/).filter(w=>w.length>1);
 const ppl=words.length?state.people.filter(p=>words.every(w=>p.name.toLowerCase().includes(w))||words.some(w=>w.length>2&&p.name.toLowerCase().split(' ').some(n=>n.startsWith(w)))):[];
 if(ppl.length)return Object.assign(A,{kind:'people',ids:ppl.slice(0,8).map(p=>p.id),label:ppl.length===1?'Found 1 person':'Found '+ppl.length+' people'});
 return Object.assign(A,{kind:'help'});
}
function gvxAskPanel(){
 const A=ui.gvxAsk;if(!A||!A.q)return'';
 let body='';
 if(A.kind==='buyers'){const d=findD(A.dealId);body=d?gvxBuyerRows(d):'';}
 else if(A.kind==='pickDeal'){body=`<p class="gvx-ask-lead"><b>Which property?</b> I couldn't tell from that. These are on the market:</p><div class="gvx-ans-btns">${state.deals.filter(d=>d.active&&['For sale','Listed'].includes(d.stage)).map(d=>action(h(d.address),'gvxAskPreset','Find buyers for '+d.address,'sm')).join('')}</div>`;}
 else if(A.kind==='deal'){const d=findD(A.dealId),p=findP(d.contactId);body=`<div class="gvx-ask-row"><div class="gvx-ask-who"><b>${h(d.address)}, ${h(d.suburb)}</b> <span>${h(d.stage)} · guide ${aud(d.guide)} · ${h(p?.name||'owner not recorded')}</span><ul><li>${h(d.why||'No reason recorded')}. Next: ${h(d.next||'not set')}.</li>${d.risk?`<li>At risk: ${h(d.risk)}</li>`:''}</ul></div><div class="gvx-ans-btns">${action('Open','openDeal',d.id,'sm primary')}${action('Find buyers','gvxAskPreset','Find buyers for '+d.address,'sm')}${p?action('Call '+h(p.name.split(' ')[0]),'call',p.id,'sm'):''}</div></div>`;}
 else if(A.kind==='deals'){const ds=A.ids.map(findD).filter(Boolean);body=`<p class="gvx-ask-lead"><b>${h(A.label)}: ${ds.length}</b></p><div class="gvx-ask-list">${ds.slice(0,8).map(d=>`<div class="gvx-ask-row"><div class="gvx-ask-who"><b>${h(d.address)}, ${h(d.suburb)}</b> <span>${h(d.stage)} · ${h(personName(d.contactId))}${A.risk?' · '+aud(gvxPotential(d))+' potential':''}</span>${A.risk?`<ul><li>${h(d.risk)}. Next: ${h(d.next||'call the owner')}.</li></ul>`:''}</div><div class="gvx-ans-btns">${action('Open','openDeal',d.id,'sm')}${action('Call','call',d.contactId,'sm')}</div></div>`).join('')||'<p class="gvx-ask-empty">None found.</p>'}</div>`;}
 else if(A.kind==='people'){const ps=A.ids.map(findP).filter(Boolean);body=`<p class="gvx-ask-lead"><b>${h(A.label)}${/^Found/.test(A.label)?'':': '+ps.length}</b></p><div class="gvx-ask-list">${ps.slice(0,8).map(p=>`<div class="gvx-ask-row"><div class="gvx-ask-who"><b>${h(p.name)}</b> <span>${h(p.role)} · ${h(p.suburb)} · ${h(p.phone||'')}</span>${p.note?`<ul><li>${h(p.note)}</li></ul>`:''}</div><div class="gvx-ans-btns">${p.consent==='ok'?action('Call','call',p.id,'sm primary'):'<span class="gvx-optout">Opted out</span>'}${action('Open','openPerson',p.id,'sm')}</div></div>`).join('')||'<p class="gvx-ask-empty">No one found.</p>'}</div>`;}
 else body=`<p class="gvx-ask-lead"><b>I couldn't work that one out.</b> In this prototype I understand requests like these:</p><div class="gvx-ans-btns">${['Find buyers for 9 Rose Avenue','Find 84 Albert Street','Find Helen','Buyers in Preston','Who should I call?','Show stalled deals'].map(x=>action(x,'gvxAskPreset',x,'sm')).join('')}</div>`;
 return `<section class="gvx-ask-result card" aria-live="polite" aria-label="GeeVee's answer"><div class="gvx-ask-q"><span>You asked: "${h(A.q)}"</span>${action('Clear','gvxAskClear','','sm')}</div>${body}</section>`;
}
function gvxAskBar(){
 return `<div class="gvx-ask" role="search"><label class="gvx-ask-label" for="gvx-ask">✦ Ask GeeVee</label><input id="gvx-ask" type="text" autocomplete="off" value="${h((ui.gvxAsk&&ui.gvxAsk.q)||'')}" placeholder="Find a property or person, or try: find buyers for 9 Rose Avenue"><button class="btn primary sm" data-action="gvxAsk">Ask</button></div>
 <p class="gvx-ask-hint">GeeVee finds things and prepares drafts. It never sends anything. Prototype: it understands set phrases, not free conversation.</p>${gvxAskPanel()}`;
}
const gvxPrevSectionHeader=sectionHeader;
sectionHeader=function(title,subtitle,actions){return gvxPrevSectionHeader(title,subtitle,actions)+gvxAskBar()};
const gvxPrevMatchesModal=matchesModal;
matchesModal=function(d){return `<div class="gvx-ask-result" style="border:0;padding:0;margin:0">${gvxBuyerRows(d,true)}</div>`};
const gvxAskPrevDoAction=doAction;
doAction=function(name,id){
 const refocus=()=>setTimeout(()=>{const el=document.getElementById('gvx-ask');if(el&&!ui.modal){el.focus();el.setSelectionRange(el.value.length,el.value.length);}},0);
 if(name==='openDeal')ui.gvxLastDeal=id;
 if(name==='gvxAsk'||name==='gvxAskPreset'){
  const q=name==='gvxAskPreset'?id:(document.getElementById('gvx-ask')?.value||'').trim();
  if(!q){toast('Type what you need, for example: find buyers for 9 Rose Avenue.');return;}
  ui.gvxAsk=gvxAskRun(q);audit('ask','Asked GeeVee: '+q,'Result: '+ui.gvxAsk.kind+'. Read only, nothing changed.');render();refocus();return;
 }
 if(name==='gvxAskClear'){ui.gvxAsk=null;render();refocus();return;}
 if(name==='gvxDraft'||name==='gvxDraftAll'){
  const make=(type,pid,did)=>{const p=findP(pid),d=findD(did);if(!p||!d||p.consent!=='ok')return false;if((state.offers||[]).some(of=>of.dealId===did&&of.buyerId===pid&&!/declin|withdraw|not proceed|reject/i.test(String(of.status))))return false;const x=gvxBuyerDraft(p,d,type);if(!x.live)return false;
   addAction({type,title:'Tell '+p.name+' about '+d.address,body:x.body,contactId:p.id,dealId:d.id,tier:'A2'});
   if(!ui.gvxAsk)ui.gvxAsk={q:'',drafted:{}};ui.gvxAsk.drafted=ui.gvxAsk.drafted||{};ui.gvxAsk.drafted[p.id+':'+d.id]=type==='SMS'?'Text':'Email';return true;};
  let n=0;
  if(name==='gvxDraft'){const [type,pid,did]=id.split(/[|:]/);n=make(type,pid,did)?1:0;}
  else{const d=findD(id);for(const x of gvxMatchBuyers(d))if(x.ok&&!x.liveOffer&&!((ui.gvxAsk&&ui.gvxAsk.drafted)||{})[x.p.id+':'+d.id]&&make('SMS',x.p.id,d.id))n++;}
  render();toast(n?(n===1?'Draft is in Today for your approval. Nothing was sent.':n+' drafts are in Today for your approval. Nothing was sent.'):'No draft was made.');return;
 }
 return gvxAskPrevDoAction(name,id);
};
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target&&ev.target.id==='gvx-ask'){ev.preventDefault();doAction('gvxAsk');}});

/* DOMA / Collings · unified desktop + mobile experience · offline prototype enhancements */
const GV_APP_VERSION='2.1 · Agent-first';
const gvLegacySectionHeader=gvxPrevSectionHeader;
sectionHeader=function(title,subtitle,actions){return gvLegacySectionHeader(title,subtitle,actions)}; // one assistant bar, not a search field on each page
ui.gvShowAll=false;ui.gvDiaryExpanded=false;ui.gvChatOpen=false;ui.gvChatDraft='';ui.gvToolPanel='';ui.gvUndo=null;ui.gvLastSpeech='';ui.gvVoiceActive=false;
if(!state.gvPlatform)state.gvPlatform={chat:[],notifications:false,autoPaused:false,recaps:[],scans:[],outbound:[],background:[],policies:{routineNotes:true,routineReplies:true},doneCount:0};
const gvP=()=>state.gvPlatform;
const gvNow=()=>new Date().toLocaleString('en-AU',{hour:'numeric',minute:'2-digit'});
function gvResetUI(){ui.gvChatOpen=false;ui.gvToolPanel='';ui.gvUndo=null;ui.gvShowAll=false}
function gvKeySummary(x){const d=x.ref?.dealId?findD(x.ref.dealId):x.ref?.id?findD(x.ref.id):null;const p=x.ref?.contactId?findP(x.ref.contactId):null;return {d,p}}
function gvValidCall(x){const p=x.ref?.id?findP(x.ref.id):findP(x.ref?.contactId);return !p||p.consent==='ok'}
const gvUnderlyingQueue=streamQueue;
streamQueue=function(){
 const list=gvUnderlyingQueue();
 const seen=new Set();
 const out=[];
 for(const x of list){
  // An action already representing exactly the same message must not generate a second task.
  if(x.kind==='message'&&state.actions.some(a=>a.messageId===x.ref.id&&a.status==='Awaiting review'))continue;
  if(x.kind==='meta'&&!gvValidCall(x))continue;
  const fingerprint=x.kind==='task'?`task:${x.ref.title.toLowerCase()}:${x.ref.contactId}:${x.ref.dealId}`:x.key;
  if(seen.has(fingerprint))continue;
  seen.add(fingerprint);out.push(x);
 }
 const priority=x=>{
  if(x.kind==='offer')return 0;
  if(x.kind==='autoexception')return 1;
  if(x.kind==='action'&&x.ref.tier==='A3')return 2;
  if(x.kind==='message'&&x.gvx?.mode==='call')return 3;
  if(x.kind==='message'&&x.ref.triage==='Urgent')return 4;
  if(x.kind==='action'||x.kind==='message'||x.kind==='appraisal')return 5;
  if(x.kind==='meta'&&['seller','both'].includes(x.ref.role))return 6;
  if(x.kind==='meta')return 7;
  if(x.kind==='task'&&x.ref.category==='Call')return 8;
  if(x.kind==='task')return 9;
  if(x.kind==='rescue')return 10;
  if(x.kind==='listing')return 11;
  if(x.kind==='engaged')return 12;
  if(x.kind==='buyer')return 13;
  return 14;
 };
 return out.map((x,i)=>({x,i})).sort((a,b)=>priority(a.x)-priority(b.x)||a.x.score-b.x.score||a.i-b.i).map(r=>r.x);
};
function gvNextMeeting(){
 const mins=new Date().getHours()*60+new Date().getMinutes();
 return DAY_SAMPLE_APPOINTMENTS.find(a=>a.clock>=mins-15)||DAY_SAMPLE_APPOINTMENTS[0];
}
function gvCompactDiary(){
 const next=gvNextMeeting();if(!next)return'';
 const all=DAY_SAMPLE_APPOINTMENTS;
 return `<section class="gv-diary-mobile" aria-label="Appointments today"><div class="gv-diary-row"><span class="gv-dot"></span><div class="gv-diary-brief"><span class="gv-eyebrow">YOUR NEXT APPOINTMENT · SAMPLE DIARY</span><strong>${h(next.time)} · ${h(next.title)}</strong><span>${h(next.where)}</span></div>${action(ui.gvDiaryExpanded?'Less':'See all '+all.length,'gvDiaryToggle','','sm')}</div>${ui.gvDiaryExpanded?`<div class="gv-diary-expanded">${all.map(a=>`<div><b>${h(a.time)}</b><span>${h(a.title)} · ${h(a.where)}</span></div>`).join('')}</div>`:''}</section>`;
}
const gvPrevHistory=streamHistory;
streamHistory=function(){return `<details class="gv-activity-details"><summary>Completed work & GeeVee activity <span>${state.activity.length} events</span></summary>${gvPrevHistory().replace('streamHistory card','streamHistory')}</details>`};
function gvAutomationSummary(){
 const x=gvP();return `<details class="gv-background"><summary><span>✦</span> What GeeVee handled in the background <small>View history</small></summary><div class="gv-background-content">Routine notes and CRM updates are handled automatically when supported by a reliable source. Ambiguous information and consequential decisions are escalated.<br><br>${state.activity.filter(a=>/auto|sync|policy|crm/i.test(a.type+' '+a.title)).slice(0,5).map(a=>`<div class="gv-bg-entry"><b>${h(a.title)}</b><span>${h(a.details||'')}</span></div>`).join('')||'<p>No automatic work logged yet.</p>'}${x.autoPaused?'<p><b>Automation paused by administrator.</b></p>':''}</div></details>`;
}
const gvNextBaseToday=today;
today=function(){
 const queue=streamQueue(),first=queue[0];
 const active=queue.some(x=>x.key===ui.streamExpanded)?ui.streamExpanded:first?.key||'';
 ui.streamExpanded=active;
 const showing=queue.slice(0,ui.gvShowAll?Math.min(25,queue.length):5);
 const approvals=queue.filter(x=>['offer','action','message','appraisal','autoexception'].includes(x.kind)).length;
 const calls=queue.filter(streamIsCall).length;
 return `${sectionHeader('Today','Everything you need to do, in the order GeeVee recommends.')}
 <div class="gv-day-shell"><main class="gv-day-primary" id="geevee-worklist">
 <div class="gv-day-welcome"><div><span class="gv-eyebrow">GEEVEE · YOUR WORKING DAY</span><h2>Just focus on the next thing.</h2><p>Finish it, and the next task moves into place.</p></div><span class="gv-small-demo">DEMO · NO LIVE SENDS</span></div>
 ${gvCompactDiary()}
 <div class="gv-day-totals"><div><b>1</b> · Approvals & offers</div><div class="gv-day-sep"></div><div><b>2</b> · Calls & follow-ups</div><span class="gv-day-queue-note">Next ${showing.length} ready · more available</span></div>
 <div class="gv-day-items" aria-label="Today, priority order">${showing.map((x,i)=>streamActiveCard(x,i,x.key===active)).join('')||`<section class="gv-all-done"><div class="gv-big-check">✓</div><h2>All urgent work is handled.</h2><p>GeeVee will show new enquiries and eligible opportunities here as they arrive. It will not create duplicate contact attempts.</p>${action('Review opportunities','route','deals','primary')}</section>`}</div>
 ${queue.length>5?`<div class="gv-queue-bottom">${action(ui.gvShowAll?'Show just 5':'View full queue · '+queue.length,'gvExpandQueue','','sm')} <span>Continue from the top, or open another task.</span></div>`:''}
 ${ui.gvUndo?`<div class="gv-undo" role="status">Last change saved in this demo. ${action('Undo last change','gvUndo','','sm')}</div>`:''}
 ${gvAutomationSummary()}${streamHistory()}
 </main><aside class="gv-day-aside">${streamDiary()}<div class="gv-aside-mini"><b>✦ GeeVee is watching your pipeline</b><p>Offers, replies, inspections, follow-ups and buyer signals feed this same queue.</p>${action('See at-risk deals','route','deals','sm')}</div></aside></div>`;
};
const gvOldCallModal=callModal;
callModal=function(m){
 let html=gvOldCallModal(m);
 if(m.phase==='active'){
  const picker=`<div class="gv-call-result"><label for="gv-call-result"><b>Call outcome</b></label><select id="gv-call-result" class="field full"><option value="Answered">Answered · spoke with client</option><option value="No answer">No answer</option><option value="Voicemail">Left voicemail</option><option value="Busy">Busy</option><option value="Disconnected">Call disconnected</option></select><p>Unanswered calls stay in the history and create an appropriate callback. Don't mark the contact as reached.</p></div>`;
  html=html.replace('<label class="form-label" for="call-notes">',picker+'<label class="form-label" for="call-notes">');
 }
 if(m.phase==='review'&&m.gvOutcome&&m.gvOutcome!=='Answered'){
  html=html.replace('Call recap prepared.','Call attempt reviewed.').replace('<div class="check-list">','<div class="gv-call-outcome-tag">'+h(m.gvOutcome)+' · no client conversation confirmed</div><div class="check-list">');
  html=html.replace(/<label><input id="call-draft-followup" type="checkbox" checked>/,'<label><input id="call-draft-followup" type="checkbox">');
  html=html.replace(/<label><input id="call-add-task" type="checkbox" checked>/,'<label><input id="call-add-task" type="checkbox">');
 }
 if(m.phase==='review'){html=html.replace('<h3 style="margin-bottom:10px">Proposed next steps</h3>','<div class="gv-call-auto-note">✦ GeeVee saves the call recap and routine internal follow-up notes automatically. Review the other proposed actions below.</div><h3 style="margin-bottom:10px">Proposed next steps</h3>');}
 return html;
};
function gvDockLabel(){if(ui.modal?.type==='call')return 'Call with '+personName(ui.modal.contactId);if(ui.modal?.type==='deal')return findD(ui.modal.id)?.address||'Property';if(ui.route==='messages')return 'Messages';if(ui.route==='deals')return 'My deals';if(ui.route==='more')return 'More tools';return 'Today';}
function gvChatMarkup(){
 const latest=gvP().chat.slice(-16);
 return `<div id="gv-chat-root"><div class="gv-assistant-bar" role="group" aria-label="Ask GeeVee from any page"><div class="gv-assistant-mark">GV</div><div class="gv-assistant-input"><span class="gv-dock-context">ASK GEEVEE · ${h(gvDockLabel())}</span><input id="gv-dock-text" aria-label="Ask GeeVee" placeholder="Ask, speak or tell GeeVee what to do…" autocomplete="off" value="${h(ui.gvChatDraft||'')}"></div><button class="gv-assistant-btn gv-voice" data-action="gvVoice" aria-label="Dictate to GeeVee" title="Speak to GeeVee">${ico('mic','lg')}</button><button class="gv-assistant-btn gv-send" data-action="gvSendChat" aria-label="Send to GeeVee">${ico('arrow')}</button><button class="gv-expand" data-action="gvOpenChat" aria-label="Open GeeVee conversation">${ico('messages')}</button></div>
 ${ui.gvChatOpen?`<div class="gv-chat-scrim" data-action="gvCloseChat"></div><section class="gv-chat-panel" role="dialog" aria-modal="true" aria-label="GeeVee assistant"><header><div><span class="gv-eyebrow">COLLINGS · GEEVEE</span><h2>Your assistant, anywhere.</h2><p>Example responses from fictional CRM data · no live AI</p></div><button class="gv-chat-close" data-action="gvCloseChat" aria-label="Close chat">×</button></header><div class="gv-chat-thread" id="gv-chat-thread">${latest.length?latest.map(m=>`<article class="gv-chat-bubble ${m.role==='you'?'human':'assistant'}"><b>${m.role==='you'?'You':'GeeVee'}</b><p>${h(m.text)}</p>${m.actions?.length?`<div class="gv-chat-quick">${m.actions.map(a=>action(h(a.label),a.type,a.id||'','sm')).join('')}</div>`:''}</article>`).join(''):`<div class="gv-chat-intro"><div class="gv-assistant-mark big">GV</div><h3>What can I take care of?</h3><p>I can find sellers, identify urgent work, open contact records and prepare your next steps.</p></div>`}</div><div class="gv-chat-suggestions">${['Who should I call?','Show urgent offers','Find buyers for 9 Rose Avenue','What is next?'].map(q=>action(q,'gvChatPrompt',q,'sm')).join('')}</div><footer><span>Try the microphone if your browser supports dictation.</span><span>All external actions require the proper approvals.</span></footer></section>`:''}
 </div>`;
}
const gvOriginalShell=shell;
shell=function(){return gvOriginalShell()+gvChatMarkup()+ (ui.gvToolPanel?gvToolOverlay():'')};
function gvToolOverlay(){
 const which=ui.gvToolPanel;
 let content='';let name='';
 if(which==='recap'){
 name='Record an appointment recap';
 content=`<p>Speak or type what happened at an appraisal, open home or vendor meeting. GeeVee saves reliable internal notes and prepares any necessary follow-ups for review.</p><label class="form-label" for="gv-recap-person">Related contact</label><select class="field full" id="gv-recap-person">${state.people.filter(p=>['seller','both'].includes(p.role)).slice(0,24).map(p=>`<option value="${p.id}">${h(p.name)}</option>`).join('')}</select><label class="form-label" for="gv-recap-text">Meeting notes</label><textarea id="gv-recap-text" class="field textarea full" placeholder="The vendor would like to list in February. I promised to call next Friday…"></textarea><div class="gv-tool-actions"><button class="btn" data-action="gvVoiceRecap">${ico('mic')} Dictate</button>${action('Save recap & prepare follow-up','gvSaveRecap','','primary')}</div><p class="gv-tool-small">Offline demonstration · speech dictation where supported · no recording uploaded.</p>`;
 } else if(which==='scan'){
 name='Scan or photograph a document';
 content=`<p>Capture an appraisal note, signed authority or other paperwork. GeeVee would classify it and verify the correct property before filing.</p><label class="form-label" for="gv-scan-contact">Link to contact</label><select class="field full" id="gv-scan-contact">${state.people.slice(0,25).map(p=>`<option value="${p.id}">${h(p.name)}</option>`).join('')}</select><label class="form-label" for="gv-scan-file">Select image or use phone camera</label><input class="field full" type="file" accept="image/*,.pdf" capture="environment" id="gv-scan-file"><p class="gv-tool-small">No files leave your device. This demo stores only the file name and a proposed verification task, not the document itself.</p>${action('Review file details','gvSaveScan','','primary')}`;
 } else if(which==='controls'){
 name='GeeVee controls & safeguards';
 content=`<div class="gv-control-card"><b>Routine internal work</b><span>GeeVee prepares and logs reliable notes automatically. Decisions, ambiguities and protected actions still come to Today.</span></div><label class="gv-setting-switch"><input id="gv-pause" type="checkbox" ${gvP().autoPaused?'checked':''}><span><b>Pause autonomous routines (demo)</b><small>New autonomous routine actions will be paused; agent calls and manual approvals remain available.</small></span></label><label class="gv-setting-switch"><input id="gv-notifications" type="checkbox" ${gvP().notifications?'checked':''}><span><b>Urgent notification previews</b><small>Only written offers, hot seller leads and immediate appointment changes. This demo does not send push notifications.</small></span></label>${action('Save preferences','gvSaveControls','','primary')}${action('Preview an urgent notification','gvNotifyPreview','','')}<div class="gv-tool-safe">All permissions must also be enforced by the production server, not just this interface.</div>`;
 }else if(which==='background'){
 name='GeeVee activity & audit';
 content=state.activity.slice(0,35).map(a=>`<div class="gv-log-row"><b>${h(a.title)}</b><p>${h(a.details||'')}</p><small>${h(a.when||'')}</small></div>`).join('')||'No activity yet';
 }
 return `<div class="gv-tool-scrim" data-action="gvToolClose"></div><div class="gv-tool-panel" role="dialog" aria-modal="true" aria-label="${h(name)}"><header><h2>${h(name)}</h2><button class="gv-chat-close" data-action="gvToolClose" aria-label="Close">×</button></header><div class="gv-tool-content">${content}</div></div>`;
}
const gvExistingMore=more;
more=function(){
 const html=gvExistingMore();
 const panel=`<div class="gv-tools-extra"><div><span class="gv-eyebrow">QUICK TOOLS</span><h2>Just ask GeeVee, or do it here.</h2><p>Useful from your phone, with the detailed CRM tools still available below.</p></div><div class="gv-tools-extra-actions">${action('Meeting recap','gvOpenTool','recap','')}${action('Scan document','gvOpenTool','scan','')}${action('GeeVee controls','gvOpenTool','controls','')}${action('Activity history','gvOpenTool','background','')}</div></div>`;
 const index=html.indexOf('</div>');return index!==-1?html.slice(0,index+6)+panel+html.slice(index+6):panel+html;
};
function gvChatAnswer(q){
 const text=q.toLowerCase(),qraw=q.trim();const queue=streamQueue();const offer=queue.find(x=>x.kind==='offer');
 const contact=state.people.find(p=>qraw.toLowerCase().includes(p.name.toLowerCase()));
 const deal=typeof gvxFindDeal==='function'?gvxFindDeal(text):null;
 if(/who.*call|call next|seller lead|prospect/.test(text)){
  const x=queue.find(x=>x.kind==='meta'||x.kind==='task'&&x.ref.category==='Call'||x.kind==='rescue');const p=x?.kind==='meta'?x.ref:x?.ref?.contactId?findP(x.ref.contactId):null;
  return {text:p?`Call ${p.name} next. ${p.note||'Their CRM record has an outstanding follow-up.'} This is a recommendation based on the sample CRM, not a prediction of a sale.`:'There are no eligible call tasks currently in the sample queue.',actions:p?[{label:'Open call in DOMA',type:'call',id:p.id},{label:'Today list',type:'route',id:'today'}]:[{label:'My deals',type:'route',id:'deals'}]};
 }
 if(/urgent offer|negotiat|new offer/.test(text))return {text:offer?`${personName(offer.ref.buyerId)} has offered ${aud(offer.ref.amount)} for ${findD(offer.ref.dealId)?.address||'a property'}. Review all terms and the vendor's instructions. I can open the decision on Today.`:'No new written offers are pending in the sample workflow.',actions:[{label:'Review Today',type:'route',id:'today'}]};
 if(/what.*next|start my day|what do i do|priority/.test(text))return {text:queue[0]?`Your next task is: ${streamTitle(queue[0])}. ${streamDescription(queue[0])}`:'All known eligible demo tasks have been handled.',actions:[{label:'Show next task',type:'gvChatNext'}]};
 if(/appraisal|comparable|market update/.test(text))return {text:'GeeVee can assemble an appraisal draft from linked property records. In this demo all comparable sales are fictional and must be replaced with verified evidence before an agent could issue a real report.',actions:[{label:'Appraisals on Today',type:'route',id:'today'},{label:'CMA tools',type:'legacy',id:'cma'}]};
 if(/scan|photograph|document/.test(text))return {text:'I can open a document capture form. The production app will need secure upload, extraction, permissions and human verification for sensitive records.',actions:[{label:'Scan a document',type:'gvOpenTool',id:'scan'}]};
 if(/recap|meeting note|voice note/.test(text))return {text:'Tell me what happened at the appointment. I will prepare a sourced internal recap and draft any outward-facing follow-up for review.',actions:[{label:'Record appointment recap',type:'gvOpenTool',id:'recap'}]};
 if(/buyer|match/.test(text))return {text:deal?`${deal.address}, ${deal.suburb} has ${deal.buyerMatches} illustrative candidate matches. Their budgets, requirements and permissions need verification before contacting anyone.`:'Tell me the property address so I can look up its existing buyer-match signals.',actions:deal?[{label:'View property',type:'openDeal',id:deal.id},{label:'Find buyers',type:'buyerMatches',id:deal.id}]:[{label:'My deals',type:'route',id:'deals'}]};
 if(contact)return {text:`${contact.name} · ${contact.suburb}. ${contact.note||'No recent notes.'} ${contact.consent==='optout'?'This contact is marked opted out; do not initiate marketing.':''}`,actions:[{label:'Open contact',type:'openPerson',id:contact.id},...(contact.consent==='ok'?[{label:'Call in DOMA',type:'call',id:contact.id}]:[])]};
 if(deal)return {text:`${deal.address}, ${deal.suburb}: ${deal.stage}. ${deal.risk?'Watch: '+deal.risk+'. ':''}Next action recorded: ${deal.next||'not recorded'}.`,actions:[{label:'Open property',type:'openDeal',id:deal.id}]};
 return {text:'I can help with your next task, sellers to call, offers, appraisals, buyer matches and record searches. This offline demo supports example requests; no live language model is connected.',actions:[{label:'Today list',type:'route',id:'today'},{label:'Search CRM',type:'search'}]};
}
function gvAddChat(role,text,actions=[]){gvP().chat.push({role,text,actions,at:gvNow()});gvP().chat=gvP().chat.slice(-40);persist()}
let gvSpeech=null;
function gvStartVoice(target='chat'){
 const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Rec){ui.gvChatOpen=true;render();toast('Speech-to-text is unavailable in this browser. You can type your request instead.');return;}
 try{if(gvSpeech){gvSpeech.stop();gvSpeech=null;ui.gvVoiceActive=false;return;}
  const r=new Rec();r.lang='en-AU';r.interimResults=false;r.continuous=false;gvSpeech=r;ui.gvVoiceActive=true;
  r.onresult=e=>{const words=Array.from(e.results).map(z=>z[0].transcript).join(' ').trim();ui.gvChatDraft=words;ui.gvVoiceActive=false;gvSpeech=null;if(target==='recap'){const f=document.getElementById('gv-recap-text');if(f)f.value=(f.value?f.value+' ':'')+words;else{ui.gvToolPanel='recap';render();}}else{ui.gvChatOpen=true;render();document.getElementById('gv-dock-text')?.focus();}toast('Dictation captured. Review the words before sending.');};
  r.onerror=()=>{gvSpeech=null;ui.gvVoiceActive=false;toast('Microphone permission or speech recognition unavailable. Type instead.');};
  r.onend=()=>{gvSpeech=null;ui.gvVoiceActive=false;};r.start();toast('Listening for dictation. No message will be sent automatically.');
 }catch(e){gvSpeech=null;ui.gvVoiceActive=false;toast('Could not start speech-to-text. Type your request.');}
}
const gvPriorDoAction=doAction;
doAction=function(name,id){
 if(name==='gvOpenChat'){ui.gvChatOpen=true;render();setTimeout(()=>{const el=document.getElementById('gv-chat-thread');if(el)el.scrollTop=el.scrollHeight;document.getElementById('gv-dock-text')?.focus()},0);return;}
 if(name==='gvCloseChat'){ui.gvChatOpen=false;render();return;}
 if(name==='gvVoice'){gvStartVoice('chat');return;}
 if(name==='gvVoiceRecap'){gvStartVoice('recap');return;}
 if(name==='gvChatPrompt'){ui.gvChatDraft=id;return doAction('gvSendChat');}
 if(name==='gvSendChat'){
  const q=(document.getElementById('gv-dock-text')?.value||ui.gvChatDraft||'').trim();if(!q)return toast('Type or speak a request first.');
  gvAddChat('you',q);const ans=gvChatAnswer(q);gvAddChat('geevee',ans.text,ans.actions||[]);ui.gvChatDraft='';ui.gvChatOpen=true;render();setTimeout(()=>{const el=document.getElementById('gv-chat-thread');if(el)el.scrollTop=el.scrollHeight;document.getElementById('gv-dock-text')?.focus()},0);return;
 }
 if(name==='gvChatNext'){ui.gvChatOpen=false;ui.route='today';ui.streamExpanded=streamQueue()[0]?.key||'';render();document.querySelector('#geevee-worklist')?.scrollIntoView({block:'start'});return;}
 if(name==='gvDiaryToggle'){ui.gvDiaryExpanded=!ui.gvDiaryExpanded;render();return;}
 if(name==='gvExpandQueue'){ui.gvShowAll=!ui.gvShowAll;render();return;}
 if(name==='gvOpenTool'){ui.gvToolPanel=id;ui.gvChatOpen=false;render();return;}
 if(name==='gvToolClose'){ui.gvToolPanel='';render();return;}
 if(name==='gvSaveControls'){
  const paused=!!document.getElementById('gv-pause')?.checked;
  if(paused&&!gvP().autoPaused){gvP().previousAutoPolicy=state.settings.gvxAuto;}
  if(paused)state.settings.gvxAuto=false;
  else if(gvP().autoPaused)state.settings.gvxAuto=gvP().previousAutoPolicy!==false;
  gvP().autoPaused=paused;
  gvP().notifications=!!document.getElementById('gv-notifications')?.checked;
  audit('settings','GeeVee automation policy updated',paused?'Simulated automatic replies paused. Routine recommendation and manual approval still work.':'Restored the previously selected demo automation policy.');
  persist();ui.gvToolPanel='';render();toast(paused?'Demo automatic replies paused.':'Demo controls saved.');return;
 }
 if(name==='gvNotifyPreview'){toast('Example urgent notification: New written offer. Open Today to review the terms. No push notification was sent.');return;}
 if(name==='gvSaveRecap'){
   const id=document.getElementById('gv-recap-person')?.value;const recap=document.getElementById('gv-recap-text')?.value?.trim();const p=findP(id);
   if(!p||!recap)return toast('Select a contact and enter the meeting recap.');
   const old=p.note||'';p.note='Meeting recap ('+gvNow()+'): '+recap+'\nPrevious: '+old;
   gvP().recaps.unshift({contactId:id,summary:recap,source:'Agent-recorded appointment recap',time:gvNow()});audit('auto','GeeVee saved an agent-supplied meeting recap',p.name+' · source: manual recap. Pending claims are not verified property facts.');
   if(/promised|follow.up|call (on|next)|call back/i.test(recap))addTask({title:'Follow up after meeting',contactId:id,dealId:state.deals.find(d=>d.contactId===id)?.id||'',due:'Tomorrow',priority:'High',category:'Call'});
   if(/appraisal|proposal|authority|list in|listing/i.test(recap))addAction({type:'Email',title:'Review follow-up to '+p.name,body:`Hi ${p.name.split(' ')[0]}, thanks for meeting today. I'll follow up on the matters we discussed. Kind regards, Caleb`,contactId:id,dealId:state.deals.find(d=>d.contactId===id)?.id||'',tier:'A2'});
   persist();ui.gvToolPanel='';render();toast('Internal recap saved in demo; external drafts require approval.');return;
 }
 if(name==='gvSaveScan'){
  const input=document.getElementById('gv-scan-file');const file=input?.files?.[0];const id=document.getElementById('gv-scan-contact')?.value;if(!file)return toast('Choose a photo or PDF first.');if(file.size>12*1024*1024)return toast('Choose a file under 12MB for this demonstration.');
  gvP().scans.unshift({name:file.name,contactId:id,when:gvNow()});audit('document','Document capture requires verification',`Selected ${file.name} for ${personName(id)}. Demo only; file was not uploaded, copied or stored.`);addTask({title:'Verify document identity and filing destination',contactId:id,dealId:state.deals.find(d=>d.contactId===id)?.id||'',due:'Today',priority:'High',category:'Admin'});
  persist();ui.gvToolPanel='';render();toast('Document details noted. No file was uploaded.');return;
 }
 if(name==='gvUndo'){if(!ui.gvUndo)return;state=structuredClone(ui.gvUndo.state);ui.gvUndo=null;audit('correction','Restored last demo task decision','Reverted the local worklist decision. No external send can be recalled.');persist();render();toast('Last task decision restored in demo.');return;}
 if(ui.gvChatOpen&&['call','route','openDeal','openPerson','legacy','buyerMatches'].includes(name))ui.gvChatOpen=false;
 if(name==='finishCall'&&ui.modal?.type==='call'){
  const outcome=document.getElementById('gv-call-result')?.value||'Answered';ui.modal.gvOutcome=outcome;
  if(outcome!=='Answered'){
   const note=(document.getElementById('call-notes')?.value||'').trim();ui.modal.notes=note||`Call attempt: ${outcome}. No conversation confirmed.`;ui.modal.phase='review';render();return;
  }
 }
 if(name==='saveCall'&&ui.modal?.gvOutcome&&ui.modal.gvOutcome!=='Answered')ui.gvCallAttempt=ui.modal.gvOutcome;
 // Preserve the ability to restore a locally dismissed or rescheduled work item.
 const reversible=['quickIgnore','dayReplyIgnore','dayTaskDone','streamDefer','quickSnoozeTomorrow','quickSnoozeWeek','dayReplyTomorrow','dayReplyWeek'];
 const snap=reversible.includes(name)?structuredClone(state):null;
 const res=gvPriorDoAction(name,id);
 if(snap){ui.gvUndo={state:snap,kind:name};if(ui.route==='today'&&!ui.modal)render();}
 return res;
};
const gvPriorSaveCall=saveCall;
saveCall=function(pid){const outcome=ui.gvCallAttempt||'Answered';ui.gvCallAttempt='';const count=state.calls.length;gvPriorSaveCall(pid);
 if(state.calls.length>count){const call=state.calls[0];call.outcome=outcome==='Answered'?'Answered · recap logged':outcome;const p=findP(pid);if(outcome!=='Answered'){
   if(p)p.callStatus='attempted';
   if(!state.tasks.some(t=>t.status==='Open'&&t.contactId===pid&&/retry.*call|call back after/i.test(t.title)))addTask({title:'Call back after '+outcome.toLowerCase(),contactId:pid,dealId:state.deals.find(d=>d.contactId===pid)?.id||'',due:'Tomorrow',priority:'High',category:'Call'});
   audit('call','Unanswered call attempt saved',personName(pid)+' · '+outcome+'. Not marked as contacted; callback prepared.');persist();render();toast('Call attempt logged, callback queued. No conversation recorded.');
 }else{audit('call','Agent conversation completed',personName(pid)+' · manual recap, no audio captured.');persist();}}
};
const gvPriorOpenCall=openCall;
openCall=function(id){const p=findP(id);if(p?.consent==='optout'){toast('Contact is opted out. Check legal basis and permissions before making an outreach call.');return;}return gvPriorOpenCall(id)};
document.addEventListener('input',e=>{if(e.target?.id==='gv-dock-text')ui.gvChatDraft=e.target.value});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='gv-dock-text'){e.preventDefault();doAction('gvSendChat')}if(e.key==='Escape'&&ui.gvChatOpen){ui.gvChatOpen=false;render();}else if(e.key==='Escape'&&ui.gvToolPanel){ui.gvToolPanel='';render();}});
