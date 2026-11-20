'use strict';
/* Boot: Ask GeeVee can open any CRM page, search finds CRM pages, and the page in the address bar opens on load. */
/* cwFindPage lives in cw-core.js so layers loaded before this file can wrap it. */
const cwPrevChat=gvChatAnswer;
gvChatAnswer=function(q){const l=q.toLowerCase().trim();
 const m=l.match(/^(open|go to|show me|show|take me to|navigate to)\s+(the\s+)?(.+?)( page| screen)?$/);
 if(m){const e=cwFindPage(m[3]);if(e)return{text:`Opening ${e.name}. It works on the same records as Today.`,actions:[{label:'Open '+e.name,type:'cwGo',id:e.route}]}}
 if(/all (crm )?pages|full crm|every page/.test(l))return{text:'All '+CW_INDEX.length+' pages of the current CRM are in Full CRM, grouped the same way as the old menu.',actions:[{label:'Full CRM',type:'cwGo',id:'/crm'}]};
 const r=cwPrevChat(q);
 const e=/contacts?|propert|listing|esign|settings|calendar|pipeline|campaign|report|kpi|commission|inspection|open home|document|enquir|seller lead|database|prospect|cma|market update/.test(l)?cwFindPage(l):null;
 if(e&&r&&Array.isArray(r.actions)&&!r.actions.some(a=>a.type==='cwGo'))r.actions.push({label:'Open '+e.name,type:'cwGo',id:e.route});
 return r};
const cwPrevSearch=searchModal;
searchModal=function(){let html=cwPrevSearch();const q=(ui.searchGlobal||'').toLowerCase().trim();
 const pages=q?CW_INDEX.filter(e=>(e.name+' '+e.group).toLowerCase().includes(q)).slice(0,6):[];
 if(pages.length)html+=`<div class="cw-search-pages"><div class="caps muted" style="margin:14px 0 8px">CRM pages</div>${pages.map(e=>`<button type="button" class="cw-search-page" data-action="cwGo" data-id="${h(e.route)}">${ico('grid','sm')}<span><b>${h(e.name)}</b><small>${h(e.group)} · ${h(e.route)}</small></span></button>`).join('')}</div>`;
 return html};
if(location.hash.startsWith('#/')){ui.route='cw';ui.cwRoute=location.hash.slice(1)}
