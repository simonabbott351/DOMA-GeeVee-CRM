'use strict';
/* Design pass (18 Nov 2026): less chrome before the work, one elevated thing per page, property art,
   a slimmer Ask bar. Nothing here changes data or journeys. Prefix cwDs. */

/* ---------- property art: a clean illustration per property, seeded so it stays the same ---------- */
const CW_DS_PAL=[
 {sky:['#e3f2f3','#f6fbfb'],far:'#cfe3e2',ground:'#c9ded4',wall:'#f8f4ec',roof:'#2f5f66',trim:'#2f5f66',tree:'#7fb09a',trunk:'#8a7b66',sun:'#ffe9b8'},
 {sky:['#f3e9da','#fbf6ee'],far:'#e3d6c2',ground:'#d7cdb3',wall:'#fcf8f1',roof:'#8a5a3c',trim:'#7a5a44',tree:'#93a86c',trunk:'#7a6450',sun:'#ffd9a8'},
 {sky:['#e4eee4','#f5f9f5'],far:'#cfdccd',ground:'#bfd3bd',wall:'#f8f6ef',roof:'#3f5a4b',trim:'#3f5a4b',tree:'#6f9b7c',trunk:'#7d6a58',sun:'#fff0c4'},
 {sky:['#e8edf2','#f6f8fa'],far:'#d4dce3',ground:'#c6cfd6',wall:'#f9f9f7',roof:'#3b4a5a',trim:'#3b4a5a',tree:'#8aa3b1',trunk:'#7b7470',sun:'#fbe6c2'}];
function cwDsSeed(s){let x=0;for(const c of String(s||''))x=(x*31+c.charCodeAt(0))>>>0;return x}
function cwDsKind(t){t=String(t||'').toLowerCase();if(/unit|apartment|flat|studio/.test(t))return 'unit';if(/town|terrace|villa|duplex/.test(t))return 'town';if(/land|block/.test(t))return 'land';return 'house'}
function cwDsArt(seed,type,o={}){
 const n=cwDsSeed(seed);const P=CW_DS_PAL[(n>>>8)%CW_DS_PAL.length];const kind=cwDsKind(type);const id='g'+(n%9973);
 const flip=(n>>>2)&1;const treeX=flip?48:272;const sunX=flip?262:58;const cloud=(n>>>5)&1;
 const win=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#cfe4ea"/>`;
 let b='';
 if(kind==='unit'){b=`<rect x="112" y="46" width="96" height="112" rx="3" fill="${P.wall}"/><rect x="112" y="46" width="96" height="9" fill="${P.roof}"/>${[0,1,2,3].map(r=>[0,1,2].map(c=>win(124+c*28,66+r*22,16,12)).join('')).join('')}<rect x="150" y="136" width="20" height="22" rx="2" fill="${P.trim}"/><rect x="208" y="84" width="40" height="74" rx="3" fill="${P.wall}" opacity=".85"/>${[0,1,2].map(r=>win(218,96+r*20,18,11)).join('')}`}
 else if(kind==='town'){b=`${[0,1].map(i=>{const x=96+i*68;return `<rect x="${x}" y="84" width="66" height="74" rx="2" fill="${P.wall}"/><polygon points="${x-6},86 ${x+33},54 ${x+72},86" fill="${P.roof}"/>${win(x+10,98,16,16)}${win(x+40,98,16,16)}<rect x="${x+24}" y="128" width="18" height="30" rx="2" fill="${P.trim}"/>`}).join('')}`}
 else if(kind==='land'){b=`<path d="M70 158 L140 112 L250 112 L300 158 Z" fill="${P.ground}" stroke="${P.far}" stroke-width="2"/>${[[110,150],[135,132],[160,118],[200,118],[238,118],[262,132],[285,150]].map(([x,y])=>`<rect x="${x}" y="${y-14}" width="3" height="16" fill="${P.trunk}"/>`).join('')}<path d="M110 140 L285 140" stroke="${P.trunk}" stroke-width="1.5"/>`}
 else{b=`<rect x="98" y="88" width="124" height="70" rx="2" fill="${P.wall}"/><polygon points="88,90 160,44 232,90" fill="${P.roof}"/><rect x="186" y="54" width="12" height="24" fill="${P.trim}"/>${win(112,104,22,20)}${win(186,104,22,20)}<rect x="150" y="118" width="22" height="40" rx="2" fill="${P.trim}"/><rect x="92" y="156" width="136" height="3" fill="${P.far}"/>`}
 const tree=kind==='land'?'':`<rect x="${treeX-3}" y="124" width="6" height="34" fill="${P.trunk}"/><circle cx="${treeX}" cy="112" r="22" fill="${P.tree}"/><circle cx="${treeX-12}" cy="122" r="14" fill="${P.tree}" opacity=".85"/>`;
 return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient></defs><rect width="320" height="200" fill="url(#${id})"/><circle cx="${sunX}" cy="52" r="20" fill="${P.sun}"/>${cloud?`<g fill="#fff" opacity=".8"><circle cx="${sunX+70}" cy="66" r="11"/><circle cx="${sunX+84}" cy="62" r="14"/><circle cx="${sunX+99}" cy="67" r="10"/><rect x="${sunX+59}" y="66" width="52" height="11" rx="5"/></g>`:''}<path d="M0 132 Q80 118 160 128 T320 124 L320 200 L0 200 Z" fill="${P.far}"/><rect x="0" y="158" width="320" height="42" fill="${P.ground}"/>${b}${tree}</svg>${o.cap?`<span class="cw-ds-cap">${o.cap}</span>`:''}`}
/* every placeholder thumbnail becomes art */
function cwDsThumbs(html){return html.replace(/<div class="cw-thumb( big)?\s*"([^>]*)>([^<]*)<\/div>/g,(m,big,attrs,text)=>{const t=text.trim();const cap=/^no image/i.test(t)?'No photos yet':t.replace(/\s*·\s*(\d+) photos$/,' · $1 photos');const type=/unit|apartment|town|terrace|villa|land/i.test(t)?t:'';return `<div class="cw-thumb${big||''} cw-ds-thumb"${attrs}>${cwDsArt(t||'x',type,{cap:big?cap:''})}</div>`})}

/* ---------- chrome diet ---------- */
/* Headers: no "Collings CRM" eyebrow unless the page gives a real one */
cwHeader=function(title,sub,actions='',eyebrow=''){return `<div class="page-header cw-head"><div>${eyebrow?`<div class="eyebrow">${h(eyebrow)}</div>`:''}<h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>${actions?`<div class="page-actions">${cwCollapse(actions,3)}</div>`:''}</div>`};
/* Detail pages (anything with an id in the route) keep the breadcrumb and drop the group tab rows */
const cwDsPrevGroupNav=cwGroupNav;
cwGroupNav=function(g,ctx){if(ctx&&ctx.params&&Object.keys(ctx.params).length)return '';return cwDsPrevGroupNav(g,ctx)};
/* Sidebar numbers for the agent */
function cwDsMine(d){return d.owner===CW_ME||cwDX(d).agents?.[0]===CW_ME}
function cwDsWeek(){try{const mine=state.deals.filter(cwDsMine);const appr=mine.filter(d=>d.stage==='Appraisal').length;const live=mine.filter(d=>d.stage==='For sale').length;const offers=(state.offers||[]).filter(o=>!/accept|reject|withdraw|declin|expired/i.test(o.status||'')&&mine.some(d=>d.id===o.dealId)).length;const f=typeof cwGrForecast==='function'?cwGrForecast():null;
 return `<button type="button" class="cw-ds-week" data-action="cwGo" data-id="/forecast" aria-label="Your numbers. Open the GCI forecast"><span class="caps muted">Your numbers</span><div><b>${appr}</b><small>appraisals</small></div><div><b>${live}</b><small>live listings</small></div><div><b>${offers}</b><small>open offers</small></div>${f?`<em>${cwMoney(f.earned+f.booked)} earned and booked</em>`:''}</button>`}catch(e){return ''}}
const cwDsPrevShell=shell;
shell=function(){let html=cwDsPrevShell();
 html=html.replace(/<span class="topflag">[\s\S]*?<\/span><span class="topflag demo">[\s\S]*?<\/span>/,'');
 html=html.replace('placeholder="Search people, properties, tasks or ask GeeVee…"','placeholder="Search people, properties or tasks"');
 html=html.replace('Property Executive · Demo</span>','Property Executive</span>');
 html=html.replace('<div class="side-tip">',cwDsWeek()+'<div class="side-tip">');
 return html};
/* Today: the welcome line carries the message, so the page header stays short */
const cwDsPrevToday=today;
today=function(){return cwDsPrevToday().replace('<p>Everything you need to do, in the order GeeVee recommends.</p>','')};

/* ---------- property page: hero with art, 6 tabs plus More ---------- */
const CW_DS_PRIMARY_TABS=['property','owner','enquiries','photos','open_homes','compliance'];
const CW_DS_CONTACT_TABS=['overview','profile','activity','notes','properties','offers'];
function cwDsPropTabs(html,PRIMARY=CW_DS_PRIMARY_TABS){
 let done=false;
 return html.replace(/<div class="tabs cw-tabs" role="tablist">((?:<button[\s\S]*?<\/button>)+)<\/div>/,(m,inner)=>{
  if(done||!/\?tab=/.test(inner))return m;done=true;
  const btns=inner.match(/<button[\s\S]*?<\/button>/g)||[];if(btns.length<8)return m;
  const key=b=>(b.match(/\?tab=([a-z_]+)/)||[])[1]||'';const active=b=>/aria-selected="true"/.test(b);
  const prim=btns.filter(b=>PRIMARY.includes(key(b))).sort((a,b)=>PRIMARY.indexOf(key(a))-PRIMARY.indexOf(key(b)));
  const rest=btns.filter(b=>!PRIMARY.includes(key(b)));
  const shown=prim.concat(rest.filter(active));const hidden=rest.filter(b=>!active(b));
  const plain=b=>b.replace(/ role="tab"| aria-selected="(true|false)"/g,'').replace('class="','class="btn sm ');
  return `<div class="cw-ds-tabrow"><div class="tabs cw-tabs cw-ds-tabs" role="tablist">${shown.join('')}</div>${hidden.length?`<details class="cw-more-menu"><summary class="btn sm" aria-label="More tabs">More ▾</summary><div class="cw-more-menu-list">${hidden.map(plain).join('')}</div></details>`:''}</div>`})}
function cwDsPropHero(html,d){const x=cwDX(d);const cap=x.photos.length?x.photos.length+' photo'+(x.photos.length===1?'':'s'):'No photos yet';
 html=html.replace('<div class="cw-prop-head">',`<div class="cw-prop-head cw-ds-hero"><div class="cw-ds-art">${cwDsArt(d.id,x.type,{cap})}</div>`);
 if(x.dom&&['For sale','Offer','Under contract'].includes(d.stage))html=html.replace('</div></div></div><div class="cw-prop-actions">',`<span>${x.dom} days on market</span></div></div></div><div class="cw-prop-actions">`);
 /* the property comes first, then the journey strip, then the tabs */
 const a=html.indexOf('<div class="cw-prop-head'),b=html.indexOf('<div class="tabs cw-tabs" role="tablist">');
 if(a>0&&b>a)html=html.slice(a,b)+html.slice(0,a)+html.slice(b);
 return html}
{for(const pat of ['/properties/:id','/collings-properties/:id']){const r=CW_ROUTES.find(x=>x.pattern===pat);if(r){const prev=r.def.render;r.def.render=function(ctx){let html=prev(ctx);const d=cwD(ctx.params.id);if(!d)return html;return cwDsPropTabs(cwDsPropHero(html,d))}}}
 const c=CW_ROUTES.find(x=>x.pattern==='/contacts/:id');if(c){const prev=c.def.render;c.def.render=function(ctx){return cwDsPropTabs(prev(ctx),CW_DS_CONTACT_TABS)}}}

/* ---------- contact overview: read it, do not edit it here ---------- */
function cwDsCtOverview(p){const x=cwPX(p);
 const flags=[['Email Marketing',x.emailOptIn],['SMS Marketing',x.smsOptIn],['Buyer Advocate',x.tags.includes('Buyer Advocate')],['Recently Purchased',x.tags.includes('Recently Purchased')],['Actively looking',x.tags.includes('Actively looking')]];
 const dated=[];
 for(const n of (x.notes||[]))dated.push({at:n.at,t:(n.kind||'Note')+' by '+n.by,b:n.text});
 for(const e of state.cw.enquiries.filter(z=>z.contactId===p.id))dated.push({at:e.received,t:'Enquiry: '+(findD(e.dealId)?.address||e.type),b:e.comments||e.source||''});
 for(const a of state.actions.filter(a=>a.contactId===p.id))dated.push({at:a.created,t:a.type+': '+a.title,b:a.status});
 for(const e of (x.history||[]))dated.push({at:e.at,t:e.what,b:e.by});
 const recent=dated.filter(e=>e.at&&!isNaN(Date.parse(e.at))).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,5).map(e=>({...e,when:cwDateTime(e.at)}));
 const msgs=state.messages.filter(m=>m.contactId===p.id).slice(0,2).map(m=>({t:'Message: '+(m.subject||m.channel),b:m.last,when:m.time}));
 const tl=[...msgs,...recent].slice(0,6);
 const ds=cwCtDeals(p);
 const rel=d=>d.contactId===p.id||cwDX(d).owners.includes(p.id)?'Owner':cwDX(d).purchasers.includes(p.id)?'Purchaser':'Linked';
 return `${cwCard('Contact details',cwKV([['Mobile',h(p.phone||'')],['Email',h(p.email||x.email||'')],['Suburb',h(p.suburb||'')],['Preferred contact',h(x.method||'Phone')],['Other phone',h(x.altPhone||'')||'<span class="muted">None</span>'],['Birthday',x.birthday?cwDate(x.birthday):'<span class="muted">Not recorded</span>']]),cwGoBtn(ico('edit','sm')+' Edit','/contacts/edit/'+p.id,'sm'))}
 ${cwCard('Recent activity',tl.length?`<div class="cw-timeline">${tl.map(e=>`<div class="cw-tl"><span class="cw-tl-dot"></span><div><b>${h(e.t)}</b><small>${h(e.when||'')}</small>${e.b?`<p>${h(String(e.b)).slice(0,180)}</p>`:''}</div></div>`).join('')}</div>`:cwEmpty('Nothing recorded yet','Calls, notes and messages will show here.'),cwGoBtn('See all','/contacts/'+p.id+'?tab=activity','sm'))}
 ${cwCard('Properties',ds.length?ds.slice(0,4).map(d=>`<div class="list-row"><div class="cw-thumb">${h(cwDX(d).type)}</div><div class="list-main">${cwLink(h(d.address)+', '+h(d.suburb),'/properties/'+d.id)}<div class="sub">${tag(rel(d),'teal')} ${cwStatusTag(cwDX(d).status)} · ${h(cwPrice(d))}</div></div></div>`).join(''):cwEmpty('No properties linked yet'),cwGoBtn(ds.length>4?'All '+ds.length:'Link a property','/contacts/'+p.id+'?tab=properties','sm'))}
 ${cwCard('Status',`<div class="cw-pills">${flags.map(([l,on])=>`<button type="button" class="cw-pill ${on?'on':''}" data-action="cwCtFlag" data-id="${h(p.id+'|'+l)}">${h(l)}</button>`).join('')}</div>`)}
 ${cwCard('Marketing permission',`${cwOptedOut(p)?cwNote('<b>Do not market.</b> '+h(p.name)+' has opted out or is marked do not contact. GeeVee sends nothing to them.','danger'):cwKV([['Email marketing',x.emailOptIn?'Yes':'No'],['SMS marketing',x.smsOptIn?'Yes':'No'],['Evidence',h(x.permission?.evidence||'')],['Recorded',x.permission?.at?cwDate(x.permission.at):'']])}${!cwOptedOut(p)&&!x.permission?.evidence?`<div style="margin-top:10px">${cwBtn('Record consent evidence','cwCtEvidence',p.id,'sm primary')}</div>`:''}`)}
 ${cwCard('Open tasks',state.tasks.filter(t=>t.contactId===p.id&&t.status==='Open').map(t=>`<div class="list-row"><div class="number-circle">${ico('check','sm')}</div><div class="list-main"><strong>${h(t.title)}</strong><div class="sub">${h(t.due)} · ${h(t.priority)}</div></div>${cwBtn('Done','cwTaskDone',t.id,'sm')}</div>`).join('')||cwEmpty('Nothing on record yet.'))}`}
const cwDsPrevCtTab=cwCtTab;
cwCtTab=function(p,tab){if(tab==='overview')return cwDsCtOverview(p);return cwDsPrevCtTab(p,tab)};

/* ---------- Today: a finished card leaves, it does not vanish ---------- */
const CW_DS_LEAVE=/^(quickApprove|dayReplyApprove|quickIgnore|dayReplyIgnore|quickSnooze(Tomorrow|Week|Date)|dayReply(Tomorrow|Week)|quickConfirmProtected)$/;
function cwDsWillLeave(name,id){if(name==='quickApprove'){const a=state.actions.find(a=>a.id===id);return !!a&&a.status==='Awaiting review'&&a.tier!=='A3'}return true}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!b||!CW_DS_LEAVE.test(b.dataset.action||''))return;
 const card=b.closest('.gv-day-items .gv-compact-item');if(!card||card.classList.contains('cw-ds-leaving'))return;
 if(!cwDsWillLeave(b.dataset.action,b.dataset.id||''))return;
 if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 e.preventDefault();e.stopPropagation();const name=b.dataset.action,id=b.dataset.id||'';
 card.style.height=card.offsetHeight+'px';card.classList.add('cw-ds-leaving');requestAnimationFrame(()=>{card.style.height='0px'});
 setTimeout(()=>{try{doAction(name,id)}catch(x){console.error(x)}},170)},true);

/* ---------- art on every CRM page ---------- */
const cwDsPrevPage=page;
page=function(){let html=cwDsPrevPage();if(ui.route==='cw')html=cwDsThumbs(html);return html};
