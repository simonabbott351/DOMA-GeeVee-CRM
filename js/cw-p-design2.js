'use strict';
/* Design pass 2 (19 Nov 2026): the list pages agents open every day. One navigation row instead of two (the old page's
   sub-tabs become a dropdown next to the title), denser tables with one action and a More menu, sentence-case titles,
   calendar chips that read, no "Refresh" buttons, no prototype wording in Messages. Prefix cwD2. */
const CW_D2_KEEP=['GeeVee','DOMA','CRM','Collings','SMS','CMA','KPI','KPIs','GCI','ID','CSV','QR','eSign','Google','Victoria','Victorian','REA','Domain','AI','SEO','Twilio','Landchecker','Property Price Statement','Section 32','Meta','Facebook','Statement'];
function cwD2Sentence(t){if(typeof t!=='string'||/[<\d]/.test(t))return t;try{if(typeof state!=='undefined'&&state&&state.people&&(state.people.some(p=>p.name&&t.includes(p.name))||(state.cw&&state.cw.agents||[]).some(a=>a.name&&t.includes(a.name))||/^(Welcome|Session)[:,]/.test(t)))return t}catch(e){}const words=t.split(' ');if(words.length<2||!words.every(w=>/^[A-Z&(]/.test(w)||CW_D2_KEEP.includes(w)||w==='&'))return t;
 return words.map((w,i)=>{if(i===0)return w;if(CW_D2_KEEP.some(k=>k===w||k.split(' ').includes(w)))return w;if(w==='&')return 'and';if(/^\(/.test(w))return w;return w.toLowerCase()}).join(' ')}
function cwD2Cluster(){const m=cwCurrent();if(!m)return '';const cl=cwClusterOf(m.ctx.route);if(!cl||cl.c.tabs.length<2)return '';const seen=new Set();const tabs=cl.c.tabs.filter(([l])=>!seen.has(l)&&seen.add(l));const cur=tabs.find(([l,r])=>r===cl.tab||(l==='Deleted'&&cl.tab.endsWith('/trash')))||tabs[0];
 return `<details class="cw-more-menu cw-d2-cluster"><summary class="btn sm" aria-label="Other views: ${h(tabs.map(t=>t[0]).join(', '))}">${h(cur[0])} <span class="cw-d2-caret">▾</span></summary><div class="cw-more-menu-list">${tabs.map(([l,r])=>`<button type="button" class="btn sm ${r===cur[1]?'primary':''}" data-action="cwGo" data-id="${h(r)}">${h(l)}</button>`).join('')}</div></details>`}
{const prev=cwHeader;cwHeader=function(title,sub,actions='',eyebrow=''){const cl=cwD2Cluster();return prev(cwD2Sentence(title),sub,cl?cl+(actions||''):actions,eyebrow)}}
{const prev=cwGroupNav;cwGroupNav=function(g,ctx){const html=prev(g,ctx);return typeof html==='string'?html.replace(/<div class="tabs cw-tabs cw-cluster"[\s\S]*?<\/div>/,''):html}}
/* one action per table cell, the rest under More */
{const prev=cwCollapse;cwCollapse=function(html,keep,label){return prev(html,keep===2?1:keep,label)}}
/* short plain cells (dates, prices, names) stay on one line */
{const prev=cwTable;cwTable=function(k,cols,rows,o){return prev(k,cols,rows,o).replace(/<td>([^<]{1,34})<\/td>/g,'<td class="cw-d2-nw">$1</td>')}}
/* calendar chips: time and the place, not the event type */
{const r=CW_ROUTES.find(x=>x.pattern==='/calendar');if(r){const prev=r.def.render;r.def.render=function(ctx){return prev(ctx).replace(/(<button type="button" class="cw-cal-e[^>]*>)(\d{1,2}:\d{2} [ap]m) (?:Open home|Property appraisal|Auction|Photography and floor plan|Photography|Private inspection|Door knock|Deposit due|Settlement|Building inspection|Appraisal)(?: at)?:? ([^<,]*)(?:,[^<]*)?/g,(m,open,time,rest)=>open+time.replace(' ','')+' '+rest.replace(/\s*\(.*\)\s*$/,'').trim())}}}
/* no Refresh buttons, no prototype wording */
{const prev=page;page=function(){let html=prev();if(ui.route==='cw')html=html.replace(/<button[^>]*data-action="[^"]*Refresh[^"]*"[^>]*>[\s\S]*?<\/button>/g,'');
 if(ui.route==='messages')html=html.replace(/(\d+) unread fictional conversations across SMS, email and portal enquiries\. GeeVee can prepare replies; in Phase 2 it cannot send real messages\./,'$1 unread conversations across SMS, email and the portal. GeeVee drafts the replies. Nothing is sent without you.').replace('unread fictional conversations','unread conversations').replace('in Phase 2 it cannot send real messages','nothing is sent without you');
 return html}}
