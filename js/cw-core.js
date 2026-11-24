'use strict';
/* Core: routing, page frame, shared components, GeeVee panel, event wiring.
   Pages register with cwPage(pattern, def). def = {title, group, render(ctx), ai(ctx)}.
   ctx = {path, params, q (query object), route}. */
const CW_GROUPS=[
 {id:'dash',name:'Dashboard',icon:'home',home:'/',pages:[['Dashboard','/'],['Notifications','/notifications'],['Tasks','/tasks'],['Calendar','/calendar'],['Google calendar','/google-calender'],['Mailbox','/mailbox'],['Messenger','/messenger'],['Chat history','/chat-history']]},
 {id:'props',name:'Properties',icon:'building',home:'/properties',pages:[['My listings','/properties'],['Collings properties','/collings-properties'],['Map','/collings-properties/map'],['Public properties','/public-properties'],['Public property search','/public-property-search'],['Collings data','/collings-data-properties'],['Duplicate check','/duplicate-check'],['Property ID review','/property-id-review'],['Trash','/properties/trash']]},
 {id:'leads',name:'Leads & pipeline',icon:'target',home:'/leads',pages:[['Enquiries & offers','/leads'],['Seller leads','/seller-leads'],['Leads pipeline','/leads-pipeline'],['On market','/on-market-pipeline'],['Off market','/off-market-pipeline'],['Appraisal submissions','/appraisal-submissions'],['Database','/database'],['Prospects','/prospects'],['Garage sales','/garage-sales']]},
 {id:'prosp',name:'Prospecting',icon:'zap',home:'/prospecting/find-buyers',pages:[['Find buyers','/prospecting/find-buyers'],['Seller opportunities','/prospecting/seller-opportunities'],['Re-listing','/prospecting/relisting-opportunities'],['New developments','/prospecting/new-developments'],['Market update','/prospecting/market-update'],['CMA reports','/prospecting/cma'],['AI voice caller','/ai-voice-caller'],['Voice agents','/voice-agents'],['Campaign manager','/campaign-manager']]},
 {id:'contacts',name:'Contacts',icon:'users',home:'/contacts',pages:[['Contacts','/contacts'],['Portal users','/buyers'],['Portal invites','/contacts/portal-invites'],['Portal identity review','/contacts/portal-identities'],['Bulk sends','/send-runs'],['Trash','/contacts/trash']]},
 {id:'insp',name:'Inspections',icon:'calendar',home:'/inspections',pages:[['Open homes','/inspections']]},
 {id:'comms',name:'Communications',icon:'messages',home:'/communications',pages:[['Communications hub','/communications'],['Email templates','/email-templates'],['Auto email responses','/auto-email-responses']]},
 {id:'esign',name:'eSign & documents',icon:'file',home:'/esign',pages:[['eSign home','/esign'],['Agreements','/esign/agreements'],['Documents','/documents']]},
 {id:'perf',name:'Performance & reports',icon:'chart',home:'/reports',pages:[['Reports','/reports'],['KPIs','/kpi'],['Commissions','/commissions'],['Leaderboard','/leaderboard/sales'],['Analytics','/analytics'],['My performance','/my-performance'],['Sessions','/session'],['Session analytics','/session-analytics']]},
 {id:'admin',name:'Team & admin',icon:'shield',home:'/agents',pages:[['Agents','/agents'],['Access permissions','/agents?tab=access'],['Twilio accounts','/twilio-accounts'],['Support tickets','/support-tickets'],['Ticketing','/ticketing'],['AI-SEO','/ai-seo'],['Landchecker usage','/landchecker-usage'],['Report an issue','/report-issue']]},
 {id:'settings',name:'Settings',icon:'settings',home:'/settings',pages:[['Settings','/settings'],['My profile','/my-profile'],['Canned responses','/utilities']]},
 {id:'public',name:'Public & sign-in pages',icon:'external',home:'/crm-public',pages:[['All public pages','/crm-public']]}
];
const CW_ROUTES=[];
function cwPage(pattern,def){const keys=[];const rx=new RegExp('^'+pattern.replace(/[.*+?^${}()|[\]\\]/g,m=>m===':'?m:'\\'+m).replace(/:(\w+)/g,(m,k)=>{keys.push(k);return '([^/]+)'})+'/?$');CW_ROUTES.push({pattern,rx,keys,def})}
const CW_ACT={};const CW_MODALS={};
function cwOn(name,fn){CW_ACT[name]=fn}
function cwModalDef(name,fn){CW_MODALS[name]=fn}

/* ---------- small helpers ---------- */
const cwU=()=>ui.cw||(ui.cw={f:{},t:{},sel:{},draft:{},err:{},open:{}});
function cwF(k,def){const f=cwU().f;return Object.prototype.hasOwnProperty.call(f,k)?f[k]:def}
function cwSetF(k,v){cwU().f[k]=v}
const cwId=p=>p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const cwSlug=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'_');
const cwDate=d=>{const x=d instanceof Date?d:new Date(d);return isNaN(x)?String(d||''):x.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})};
const cwDateTime=d=>{const x=d instanceof Date?d:new Date(d);return isNaN(x)?String(d||''):x.toLocaleString('en-AU',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'})};
const cwNowISO=()=>new Date().toISOString();
const cwLocalDay=(d=new Date())=>{const x=d instanceof Date?d:new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const cwMoney=n=>n==null||n===''||isNaN(n)?'Not set':aud(Number(n));
const cwShort=n=>{n=Number(n)||0;return n>=1e6?'$'+(n/1e6).toFixed(n%1e6?2:0).replace(/\.?0+$/,'')+'m':n>=1e3?'$'+Math.round(n/1e3)+'k':'$'+n};
const cwCap=s=>String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1);
function cwPersist(msg){persist();render();if(msg)toast(msg)}
function cwLog(type,title,details){audit(type,title,details)}
function cwRec(){return state.cw}

/* ---------- routing ---------- */
function cwParse(route){const [p,qs]=String(route||'/').split('?');const q={};(qs||'').split('&').filter(Boolean).forEach(kv=>{const [k,v]=kv.split('=');q[decodeURIComponent(k)]=decodeURIComponent(v||'')});return{path:p||'/',q}}
function cwMatch(route){const {path,q}=cwParse(route);for(const r of CW_ROUTES){const m=path.match(r.rx);if(m){const params={};r.keys.forEach((k,i)=>params[k]=decodeURIComponent(m[i+1]));return{r,ctx:{path,params,q,route}}}}return null}
function cwGo(route){const target='#'+route;if(location.hash===target)cwOpen(route);else location.hash=target}
function cwOpen(route){const m=cwMatch(route);if(!m){toast('That CRM page is not in this prototype yet.');return}ui.route='cw';ui.cwRoute=route;ui.modal=null;ui.menu=false;ui.gvChatOpen=false;cwU().draft={};cwU().err={};render();window.scrollTo(0,0)}
function cwCurrent(){return ui.route==='cw'?cwMatch(ui.cwRoute||'/crm'):null}
function cwLink(label,route,cls='table-btn'){return `<button type="button" class="${cls}" data-action="cwGo" data-id="${h(route)}">${label}</button>`}
function cwGroupOf(def,ctx){return CW_GROUPS.find(g=>g.id===def.group)||CW_GROUPS[0]}
function cwTitleOf(m){if(!m)return 'Full CRM';const t=m.r.def.title;return typeof t==='function'?t(m.ctx):t}

/* ---------- components ---------- */
/* Keep at most `keep` buttons visible; the rest go into a "More" menu. Fewer buttons, same functions. */
function cwCollapse(html,keep=3,label='More'){if(!html||typeof html!=='string'||html.includes('class="cw-pill'))return html;const parts=html.match(/<button\b[\s\S]*?<\/button>/g);if(!parts||parts.length<=keep+1)return html;let i=0;const out=html.replace(/<button\b[\s\S]*?<\/button>/g,m=>(i++<keep?m:''));return out+`<details class="cw-more-menu"><summary class="btn sm" aria-label="${h(label)} actions">${h(label)} ▾</summary><div class="cw-more-menu-list">${parts.slice(keep).join('')}</div></details>`}
function cwHeader(title,sub,actions='',eyebrow=''){return `<div class="page-header cw-head"><div><div class="eyebrow">${h(eyebrow||'Collings CRM')}</div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>${actions?`<div class="page-actions">${cwCollapse(actions,3)}</div>`:''}</div>`}
function cwBtn(label,act,id='',cls=''){return `<button type="button" class="btn ${cls}" data-action="${h(act)}" data-id="${h(id)}">${label}</button>`}
function cwGoBtn(label,route,cls=''){return cwBtn(label,'cwGo',route,cls)}
function cwStats(items,cls='grid-4'){return `<div class="${cls} cw-stats">${items.map(([l,v,f,c])=>`<div class="stat ${c||''}"><div class="label">${h(l)}</div><div class="value num">${v}</div>${f?`<div class="foot">${f}</div>`:''}</div>`).join('')}</div>`}
function cwEmpty(title,body='',actions=''){return `<div class="cw-empty"><div class="cw-empty-icon">${ico('layers')}</div><h3>${h(title)}</h3>${body?`<p>${body}</p>`:''}${actions?`<div class="cw-empty-actions">${actions}</div>`:''}</div>`}
function cwCard(title,body,extra='',cls=''){return `<section class="card pad cw-card ${cls}">${title?`<div class="card-head"><h2>${title}</h2>${extra}</div>`:''}${body}</section>`}
function cwInput(k,ph,o={}){return `<input id="cwb-${cwSlug(k)}" class="field ${o.cls||'search'}" data-cwbind="${h(k)}" type="${o.type||'text'}" placeholder="${h(ph)}" value="${h(cwF(k,o.def||''))}" aria-label="${h(o.label||ph)}" autocomplete="off">`}
function cwSelect(k,opts,o={}){const list=opts.map(x=>Array.isArray(x)?x:[x,x]);const v=cwF(k,o.def!==undefined?o.def:list[0]?.[0]);return `<select id="cwb-${cwSlug(k)}" class="field ${o.cls||''}" data-cwbind="${h(k)}" aria-label="${h(o.label||k)}">${list.map(([val,lab])=>`<option value="${h(val)}" ${String(val)===String(v)?'selected':''}>${h(lab)}</option>`).join('')}</select>`}
function cwCheck(k,label,o={}){const v=cwF(k,!!o.def);return `<label class="cw-check"><input type="checkbox" data-cwbind="${h(k)}" ${v?'checked':''}> <span>${label}</span></label>`}
function cwSwitch(k,label,sub='',def=false){const v=cwF(k,def);return `<label class="cw-switch"><input type="checkbox" data-cwbind="${h(k)}" ${v?'checked':''}><span class="cw-switch-ui"></span><span><b>${label}</b>${sub?`<small>${sub}</small>`:''}</span></label>`}
function cwTabs(k,items,o={}){const active=o.active!==undefined?o.active:cwF('tab:'+k,items[0]?.[0]);return `<div class="tabs cw-tabs" role="tablist">${items.map(([v,l,n])=>`<button type="button" role="tab" aria-selected="${String(v)===String(active)}" class="${String(v)===String(active)?'active':''}" data-action="${o.route?'cwGo':'cwTab'}" data-id="${h(o.route?o.route(v):k+'|'+v)}">${h(l)}${n!==undefined&&n!==null?` <span class="cw-count">${n}</span>`:''}</button>`).join('')}</div>`}
function cwTab(k,def){return cwF('tab:'+k,def)}
function cwPills(k,items,def){const v=cwF(k,def!==undefined?def:items[0]?.[0]);return `<div class="cw-pills">${items.map(([val,lab,n])=>`<button type="button" class="cw-pill ${String(val)===String(v)?'on':''}" data-action="cwSetF" data-id="${h(k+'|'+val)}">${h(lab)}${n!==undefined?` <span>${n}</span>`:''}</button>`).join('')}</div>`}
function cwTag(t,c=''){return tag(t,c)}
function cwAvatar(name,cls='soft'){return avatar(name||'?',cls)}
function cwKV(rows){return `<dl class="cw-kv">${rows.filter(Boolean).map(([k,v])=>`<div><dt>${h(k)}</dt><dd>${v===undefined||v===null||v===''?'<span class="muted">Not recorded</span>':v}</dd></div>`).join('')}</dl>`}
function cwSteps(items,cur){return `<div class="steps cw-steps">${items.map((s,i)=>`<span class="step ${i<cur?'done':i===cur?'current':''}">${i+1}. ${h(s)}</span>`).join('')}</div>`}
function cwNote(html,cls='info'){return `<div class="alert ${cls}">${ico(cls==='warn'||cls==='danger'?'alert':'sparkles','sm')}<div>${html}</div></div>`}

/* Table: cols = [[label, cell(row), sortValue(row)?]] */
function cwTable(k,cols,rows,o={}){
 const t=cwU().t[k]||(cwU().t[k]={sort:-1,dir:1,page:0,size:o.size||10});
 let list=rows.slice();
 if(t.sort>=0&&cols[t.sort]?.[2]){const f=cols[t.sort][2];list.sort((a,b)=>{const x=f(a),y=f(b);return (x>y?1:x<y?-1:0)*t.dir})}
 const total=list.length,pages=Math.max(1,Math.ceil(total/t.size));if(t.page>=pages)t.page=pages-1;if(t.page<0)t.page=0;
 const view=list.slice(t.page*t.size,(t.page+1)*t.size);
 const keyOf=o.key||(r=>r.id);
 const sel=o.select?(cwU().sel[k]||(cwU().sel[k]=[])):null;
 const allOn=sel&&view.length&&view.every(r=>sel.includes(keyOf(r)));
 const head=`<tr>${sel?`<th class="cw-selcol"><input type="checkbox" aria-label="Select all on this page" data-cwsel="${h(k)}|*" ${allOn?'checked':''}></th>`:''}${cols.map(([l,,s],i)=>`<th>${s?`<button type="button" class="cw-sort" data-action="cwSort" data-id="${h(k+'|'+i)}">${h(l)}${t.sort===i?(t.dir>0?' ▲':' ▼'):''}</button>`:h(l)}</th>`).join('')}</tr>`;
 const body=view.length?view.map(r=>`<tr class="${o.rowCls?o.rowCls(r):''}">${sel?`<td class="cw-selcol"><input type="checkbox" aria-label="Select row" data-cwsel="${h(k)}|${h(keyOf(r))}" ${sel.includes(keyOf(r))?'checked':''}></td>`:''}${cols.map(([,c])=>`<td>${cwCollapse(c(r),2)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length+(sel?1:0)}">${cwEmpty(o.empty||'Nothing here yet.',o.emptyBody||'',o.emptyActions||'')}</td></tr>`;
 const bulk=sel&&sel.length&&o.bulk?`<div class="cw-bulk"><b>${sel.length} selected</b>${o.bulk(sel)}${cwBtn('Clear','cwSelClear',k,'sm ghost')}</div>`:'';
 const foot=total>t.size||o.alwaysFoot?`<div class="cw-tfoot"><span>Showing ${total?t.page*t.size+1:0} to ${Math.min(total,(t.page+1)*t.size)} of ${total}</span><span class="cw-tfoot-r"><label class="tiny muted">Show <select class="field cw-mini" data-cwsize="${h(k)}">${[10,25,50,100].map(n=>`<option ${n===t.size?'selected':''}>${n}</option>`).join('')}</select></label>${cwBtn('Previous','cwPageT',k+'|-1','sm')}<span class="tiny">Page ${t.page+1} of ${pages}</span>${cwBtn('Next','cwPageT',k+'|1','sm')}</span></div>`:'';
 return `${bulk}<div class="table-wrap cw-table"><table class="table"><thead>${head}</thead><tbody>${body}</tbody></table></div>${foot}`;
}
function cwSearchRows(rows,q,fn){q=(q||'').toLowerCase().trim();if(!q)return rows;return rows.filter(r=>fn(r).toLowerCase().includes(q))}
function cwKanban(cols,cardFn,o={}){return `<div class="pipeline-cols cw-kanban">${cols.map(c=>`<div class="pipe-col" data-col="${h(c.id)}"><div class="pipe-title"><span>${h(c.name)}</span><span class="cw-count">${c.items.length}</span></div>${c.sub?`<div class="tiny muted" style="margin:-6px 0 8px">${c.sub}</div>`:''}${c.items.map(cardFn).join('')||'<div class="cw-col-empty">No records</div>'}</div>`).join('')}</div>`}

/* Forms. fields: {n,l,t,o,req,ph,full,help,min,max} */
function cwField(fid,f,v){const id=`${fid}-${f.n}`,req=f.req?' *':'',err=(cwU().err[fid]||{})[f.n];let c='';
 const val=v===undefined||v===null?'':v;
 if(f.t==='textarea')c=`<textarea id="${id}" name="${f.n}" class="field textarea full" placeholder="${h(f.ph||'')}">${h(val)}</textarea>`;
 else if(f.t==='select')c=`<select id="${id}" name="${f.n}" class="field full">${(f.o||[]).map(x=>Array.isArray(x)?x:[x,x]).map(([a,b])=>`<option value="${h(a)}" ${String(a)===String(val)?'selected':''}>${h(b)}</option>`).join('')}</select>`;
 else if(f.t==='check'||f.t==='switch')return `<div class="cw-ff ${f.full?'full':''}"><label class="${f.t==='switch'?'cw-switch':'cw-check'}"><input id="${id}" name="${f.n}" type="checkbox" ${val?'checked':''}>${f.t==='switch'?'<span class="cw-switch-ui"></span>':''}<span><b>${h(f.l)}</b>${f.help?`<small>${h(f.help)}</small>`:''}</span></label></div>`;
 else if(f.t==='radio')c=`<div class="cw-radios" role="radiogroup" aria-label="${h(f.l)}">${(f.o||[]).map(x=>`<label class="cw-check"><input type="radio" name="${f.n}" value="${h(x)}" ${String(x)===String(val)?'checked':''}> <span>${h(x)}</span></label>`).join('')}</div>`;
 else if(f.t==='file')c=`<input id="${id}" name="${f.n}" type="file" class="field full" ${f.multi?'multiple':''} accept="${h(f.accept||'')}">${val?`<div class="hint">Current: ${h(Array.isArray(val)?val.join(', '):val)}</div>`:''}`;
 else c=`<input id="${id}" name="${f.n}" type="${f.t||'text'}" class="field full" placeholder="${h(f.ph||'')}" value="${h(val)}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} ${f.step?`step="${f.step}"`:''}>`;
 return `<div class="cw-ff ${f.full||f.t==='textarea'?'full':''} ${err?'has-err':''}"><label class="form-label" for="${id}">${h(f.l)}${req}</label>${c}${err?`<div class="cw-err">${h(err)}</div>`:f.help?`<div class="hint">${h(f.help)}</div>`:''}</div>`}
function cwForm(fid,fields,values={},o={}){const vals={...values,...(cwU().draft[fid]||{})};return `<div class="cw-form ${o.cls||''}" data-cwform="${h(fid)}">${o.sections?o.sections.map(([title,fs,sub])=>`<fieldset class="cw-fs"><legend>${h(title)}</legend>${sub?`<p class="hint" style="margin:-4px 0 10px">${sub}</p>`:''}<div class="cw-grid">${fs.map(f=>cwField(fid,f,vals[f.n])).join('')}</div></fieldset>`).join(''):`<div class="cw-grid">${fields.map(f=>cwField(fid,f,vals[f.n])).join('')}</div>`}</div>`}
function cwRead(fid,fields){const root=document.querySelector(`[data-cwform="${fid}"]`);const v={},err={};
 const all=fields.length?fields:[];
 for(const f of all){const el=root?.querySelector(`[name="${f.n}"]`);if(!el)continue;
  if(f.t==='check'||f.t==='switch')v[f.n]=!!el.checked;
  else if(f.t==='radio')v[f.n]=root.querySelector(`[name="${f.n}"]:checked`)?.value||'';
  else if(f.t==='file')v[f.n]=[...(el.files||[])].map(x=>x.name);
  else v[f.n]=String(el.value||'').trim();
  const val=v[f.n];
  if(f.req&&(val===''||val===false||(Array.isArray(val)&&!val.length)))err[f.n]=(f.l||'This field')+' is required.';
  else if(f.t==='email'&&val&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val))err[f.n]='Enter a valid email address.';
  else if(f.t==='tel'&&val&&String(val).replace(/\D/g,'').length<8)err[f.n]='Enter a full phone number.';
  else if(f.t==='number'&&val!==''&&isNaN(Number(val)))err[f.n]='Enter a number.';
 }
 if(Object.keys(err).length){cwU().draft[fid]=v;cwU().err[fid]=err;render();toast('Check the highlighted fields.');const first=document.querySelector(`[data-cwform="${fid}"] .has-err input,[data-cwform="${fid}"] .has-err select,[data-cwform="${fid}"] .has-err textarea`);first?.focus();return null}
 delete cwU().draft[fid];delete cwU().err[fid];return v}
function cwAllFields(sections){return sections.flatMap(s=>s[1])}

/* Modals */
function cwModal(name,arg){ui.modal={type:'cw',name,arg};render();setTimeout(()=>document.querySelector('#overlay input,#overlay select,#overlay textarea')?.focus(),0)}
function cwModalHtml(){const def=CW_MODALS[ui.modal.name];if(!def)return '';const m=def(ui.modal.arg)||{};return `<div class="overlay" id="overlay"><div class="dialog ${m.wide||''}" role="dialog" aria-modal="true" aria-label="${h(m.title||'')}"><div class="dialog-head"><div><div class="eyebrow" style="margin-bottom:5px">${h(m.eyebrow||'Collings CRM')}</div><h2>${h(m.title||'')}</h2></div><button class="close" data-action="close" aria-label="Close dialog">${ico('close')}</button></div><div class="dialog-content">${m.body||''}</div>${m.foot?`<div class="dialog-foot">${m.foot}</div>`:''}</div></div>`}
function cwConfirm(title,body,act,id,label='Confirm',cls='primary'){cwModal('confirm',{title,body,act,id,label,cls})}
cwModalDef('confirm',a=>({title:a.title,body:`<p>${a.body}</p>`,foot:`${cwBtn('Cancel','close','','')}${cwBtn(a.label,a.act,a.id,a.cls)}`}));

/* ---------- GeeVee panel ---------- */
const CW_AI_KIND={auto:['Done by GeeVee','green'],draft:['Draft for your approval','yellow'],check:['Needs you','red'],info:['GeeVee noticed','teal'],call:['Call, no message','purple']};
function cwAI(items,o={}){
 const list=(items||[]).filter(Boolean);
 return `<aside class="cw-ai" aria-label="GeeVee on this page"><details ${cwU().open.ai===false?'':'open'} data-cwdetails="ai"><summary><span class="cw-ai-mark">GV</span><span><b>GeeVee on this page</b><small>${h(o.sub||'Prepares the work. You approve anything that leaves DOMA.')}</small></span></summary>
 <div class="cw-ai-list">${list.length?list.map(x=>{const k=CW_AI_KIND[x.k||'info']||CW_AI_KIND.info;return `<div class="cw-ai-item"><div class="cw-ai-top">${tag(k[0],k[1])}</div><b>${x.t}</b>${x.b?`<p>${x.b}</p>`:''}${x.a?.length?`<div class="cw-ai-acts">${x.a.map(a=>cwBtn(a[0],a[1],a[2]||'',(a[3]||'')+' sm')).join('')}</div>`:''}</div>`}).join(''):'<p class="hint">Nothing needs attention on this page right now.</p>'}</div>
 <div class="cw-ai-foot">${cwBtn(ico('messages','sm')+' Ask about this page','cwAskPage','','sm')}<span>Sample data. Nothing is sent from this prototype.</span></div></details></aside>`}

/* ---------- frame ---------- */
function cwGroupNav(g,ctx){if(!g||g.pages.length<2)return '';const here=ctx.route;
 const exact=r=>here===r||(r!=='/'&&ctx.path===cwParse(r).path&&(!cwParse(r).q.tab||cwParse(r).q.tab===ctx.q.tab));
 const anyExact=g.pages.some(([,r])=>exact(r));
 const prefix=g.pages.map(([,r])=>r).filter(r=>r!=='/'&&here.startsWith(r+'/')).sort((a,b)=>b.length-a.length)[0];
 return `<nav class="cw-subnav" aria-label="${h(g.name)} pages">${g.pages.map(([n,r])=>{const on=exact(r)||(!anyExact&&r===prefix&&r!==g.home);return `<button type="button" class="${on?'on':''}" data-action="cwGo" data-id="${h(r)}">${h(n)}</button>`}).join('')}</nav>`}
function cwFrame(){
 const m=cwCurrent();
 if(!m)return cwHeader('Page not found','This CRM page is not part of the prototype.',cwGoBtn('All CRM pages','/crm','primary'));
 const {r,ctx}=m;const def=r.def;const g=cwGroupOf(def,ctx);
 let main='',ai=[];
 try{main=def.render(ctx);ai=def.ai?def.ai(ctx):[]}catch(e){console.error(e);main=cwNote('This page hit an error in the prototype: '+h(e.message),'danger')}
 if(def.bare)return `<div class="cw-page cw-bare">${main}</div>`;
 const title=cwTitleOf(m);
 return `<div class="cw-page"><div class="cw-crumbs"><button type="button" data-action="cwGo" data-id="/crm">More tools</button><span>/</span><button type="button" data-action="cwGo" data-id="${h(g.home)}">${h(g.name)}</button><span>/</span><b>${h(title)}</b><span class="cw-route" title="Route in the current CRM">${h(ctx.route)}</span></div>${cwGroupNav(g,ctx)}<div class="cw-wrap ${def.wide?'wide':''}"><div class="cw-main">${main}</div>${def.noAI?'':cwAI(ai,{sub:def.aiSub})}</div></div>`}

/* ---------- directory of every page ---------- */
cwPage('/crm',{title:'Full CRM',group:'dash',noAI:false,render(ctx){
 const q=(cwF('crm:q','')||'').toLowerCase();
 const byGroup={};for(const e of CW_INDEX){(byGroup[e.group]=byGroup[e.group]||[]).push(e)}
 const groups=Object.entries(byGroup).map(([g,items])=>[g,items.filter(e=>!q||(e.name+' '+e.route+' '+g).toLowerCase().includes(q))]).filter(([,i])=>i.length);
 const n=groups.reduce((a,[,i])=>a+i.length,0);
 return `${cwHeader('Full CRM','Every screen from the current Collings CRM, rebuilt as working pages on the same records GeeVee uses. '+CW_INDEX.length+' screens across '+Object.keys(byGroup).length+' areas.',cwGoBtn(ico('home','sm')+' Back to Today','/today-exit',''))}
 <div class="toolbar">${cwInput('crm:q','Find a page, for example "contacts", "eSign" or "settings"')}<span class="tiny muted">${n} of ${CW_INDEX.length} pages</span></div>
 <div class="cw-dir">${groups.map(([g,items])=>`<section class="card pad"><div class="card-head"><h2>${h(g)}</h2>${tag(items.length+' screens','teal')}</div><ul class="cw-dir-list">${items.map(e=>`<li><button type="button" data-action="cwGo" data-id="${h(e.route)}"><b>${h(e.name)}</b><code>${h(e.route)}</code></button></li>`).join('')}</ul></section>`).join('')||cwEmpty('No pages match','Try another word.')}</div>`},
 ai(){return[{k:'info',t:'Every page works on one record',b:'Contacts, properties, tasks, messages and approvals on these pages are the same records as Today, My deals and Messages. A change here shows there.'},{k:'info',t:'Ask instead of browsing',b:'Type "open seller leads" or "go to eSign" in Ask GeeVee at the bottom of the screen.',a:[['Try it','cwAskPrompt','open seller leads']]}]}});
cwOn('cwAskPrompt',q=>{ui.gvChatDraft=q;doAction('gvSendChat')});

/* ---------- actions ---------- */
cwOn('cwGo',r=>{if(r==='/today-exit'){navigate('today');return}if(r==='/crm'){ui.moreTab='directory';ui.toolHub='';ui.toolSearch='';navigate('more');return}cwGo(r)});
cwOn('cwTab',id=>{const i=id.indexOf('|');cwSetF('tab:'+id.slice(0,i),id.slice(i+1));cwResetPages();render()});
cwOn('cwSetF',id=>{const i=id.indexOf('|');cwSetF(id.slice(0,i),id.slice(i+1));cwResetPages();render()});
cwOn('cwSort',id=>{const [k,i]=id.split('|');const t=cwU().t[k];if(!t)return;const n=Number(i);if(t.sort===n)t.dir*=-1;else{t.sort=n;t.dir=1}render()});
cwOn('cwPageT',id=>{const [k,d]=id.split('|');const t=cwU().t[k];if(!t)return;t.page+=Number(d);render()});
cwOn('cwSelClear',k=>{cwU().sel[k]=[];render()});
cwOn('cwAskPage',()=>{const m=cwCurrent();ui.gvChatDraft='What should I do on '+cwTitleOf(m)+'?';ui.gvChatOpen=true;render();setTimeout(()=>document.getElementById('gv-dock-text')?.focus(),0)});
function cwResetPages(){for(const t of Object.values(cwU().t))t.page=0}
function cwSel(k){return cwU().sel[k]||[]}

/* ---------- wiring into the existing app ---------- */
const cwPrevPage=page;
page=function(){if(ui.route==='cw')return cwFrame();return cwPrevPage()};
const cwPrevNavigate=navigate;
navigate=function(r){if(r!=='cw'&&location.hash){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}return cwPrevNavigate(r)};
const cwPrevModal=modal;
modal=function(){if(ui.modal?.type==='cw')return cwModalHtml();return cwPrevModal()};
const cwPrevDoAction=doAction;
doAction=function(name,id){
 if(CW_ACT[name]){try{return CW_ACT[name](id)}catch(e){console.error(e);toast('Something went wrong on this page: '+e.message)}return}
 if(name==='legacy'){const L=LEGACY[id];const r=L?.route||CW_LEGACY_ROUTE[id];if(r){ui.gvChatOpen=false;cwGo(r);return}}
 return cwPrevDoAction(name,id)};
const CW_LEGACY_ROUTE={trash:'/properties/trash'};
function cwNavHtml(){const m=cwCurrent();const g=m?cwGroupOf(m.r.def,m.ctx):null;return `<div class="cw-sidenav"><div class="caps muted" style="margin:16px 12px 8px">Full CRM</div>${CW_GROUPS.map(x=>`<button type="button" class="nav-button cw-nav ${ui.route==='cw'&&g?.id===x.id?'active':''}" data-action="cwGo" data-id="${h(x.home)}">${ico(x.icon,'sm')}<span class="nav-label">${h(x.name)}</span></button>`).join('')}<button type="button" class="nav-button cw-nav ${ui.route==='cw'&&ui.cwRoute==='/crm'?'active':''}" data-action="cwGo" data-id="/crm">${ico('grid','sm')}<span class="nav-label">All ${CW_INDEX.length} pages</span></button></div>`}
const cwPrevShell=shell;
shell=function(){let html=cwPrevShell();
 if(ui.route==='cw'){const t=cwTitleOf(cwCurrent());html=html.replace(/<div class="top-breadcrumb"><strong>[^<]*<\/strong>/,`<div class="top-breadcrumb"><strong>${h(t)}</strong>`);
  html=html.replace('class="nav-button " data-action="route" data-id="more"','class="nav-button active" data-action="route" data-id="more"').replace(/(class="mobile-dock-item) (" data-action="route" data-id="more")/,'$1 is-active$2')}
 return html};
const cwPrevDock=gvDockLabel;
gvDockLabel=function(){if(ui.route==='cw'&&!ui.modal)return cwTitleOf(cwCurrent());return cwPrevDock()};

/* bound inputs */
document.addEventListener('input',e=>{const el=e.target;const k=el?.dataset?.cwbind;if(!k||el.type==='checkbox'||el.tagName==='SELECT')return;cwSetF(k,el.value);cwResetPages();const id=el.id,pos=el.selectionStart;render();const n=document.getElementById(id);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}});
document.addEventListener('change',e=>{const el=e.target;
 if(el?.dataset?.cwbind&&(el.type==='checkbox'||el.tagName==='SELECT')){cwSetF(el.dataset.cwbind,el.type==='checkbox'?el.checked:el.value);cwResetPages();render();return}
 if(el?.dataset?.cwsel){const [k,v]=el.dataset.cwsel.split('|');const sel=cwU().sel[k]||(cwU().sel[k]=[]);if(v==='*'){const boxes=[...document.querySelectorAll(`[data-cwsel^="${k}|"]`)].map(b=>b.dataset.cwsel.split('|')[1]).filter(x=>x!=='*');if(el.checked)boxes.forEach(b=>{if(!sel.includes(b))sel.push(b)});else cwU().sel[k]=sel.filter(x=>!boxes.includes(x))}else{if(el.checked){if(!sel.includes(v))sel.push(v)}else cwU().sel[k]=sel.filter(x=>x!==v)}render();return}
 if(el?.dataset?.cwsize){const t=cwU().t[el.dataset.cwsize];if(t){t.size=Number(el.value);t.page=0;render()}return}
});
document.addEventListener('toggle',e=>{const d=e.target;if(d?.dataset?.cwdetails)cwU().open[d.dataset.cwdetails]=d.open},true);
window.addEventListener('hashchange',()=>{const r=location.hash.slice(1);if(r.startsWith('/'))cwOpen(r)});

/* ---------- page finder (used by Ask GeeVee and search; wrapped by cw-p-language.js) ---------- */
function cwFindPage(text){const l=text.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();if(!l)return null;
 let best=null,score=0;
 for(const e of CW_INDEX){const n=e.name.toLowerCase().replace(/[^a-z0-9 ]/g,' ');let s=0;if(l===n)s=100;else if(l.includes(n))s=50+n.length;else{const w=n.split(' ').filter(x=>x.length>2);const hit=w.filter(x=>l.includes(x)).length;if(hit&&hit===w.length)s=20+hit;}
  if(/ tab$/.test(n)&&!/tab/.test(l))s-=5;if(/\b1\b|sample/.test(e.route)&&!/detail|profile/.test(l))s-=3;if(s>score){score=s;best=e}}
 for(const g of CW_GROUPS)for(const [n,r] of g.pages){const nn=n.toLowerCase();if(l.includes(nn)&&nn.length+60>score){score=nn.length+60;best={name:n,route:r}}}
 return score>0?best:null}
/* one count of enquiries for a property: enquiry records plus conversations not already linked to one */
function cwEnqCount(d){if(!d||!state.cw)return 0;const enq=(state.cw.enquiries||[]).filter(e=>e.dealId===d.id);const msgs=(state.messages||[]).filter(m=>m.dealId===d.id&&!enq.some(e=>e.msgId===m.id));return enq.length+msgs.length}
