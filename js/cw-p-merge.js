'use strict';
/* Consolidation (decided 17 Nov 2026): 82 destinations become about 30. Pages that did the same job are one page
   with tabs. Every old route still works and every old name is still searchable in More tools. */
const CW_GROUP_ALIAS={prosp:'leads',insp:'props',esign:'comms',settings:'admin',public:'admin'};
CW_GROUPS.length=0;
CW_GROUPS.push(
 {id:'dash',name:'My day',icon:'home',home:'/app/today',pages:[['Today','/app/today'],['Tasks','/tasks'],['Calendar','/calendar'],['Messages','/app/messages'],['Notifications','/notifications']]},
 {id:'props',name:'Properties',icon:'building',home:'/properties',pages:[['Properties','/properties'],['Property database','/public-properties'],['Open homes','/inspections'],['Duplicate check','/duplicate-check'],['Records to check','/property-id-review']]},
 {id:'leads',name:'Leads & prospecting',icon:'target',home:'/seller-leads',pages:[['Seller leads','/seller-leads'],['Enquiries','/leads'],['Seller opportunities','/prospecting/seller-opportunities'],['Market update','/prospecting/market-update'],['CMA reports','/prospecting/cma'],['Campaign manager','/campaign-manager']]},
 {id:'contacts',name:'Contacts',icon:'users',home:'/contacts',pages:[['Contacts','/contacts'],['Portal accounts to review','/contacts/portal-identities']]},
 {id:'comms',name:'Communications & documents',icon:'messages',home:'/communications',pages:[['Communications','/communications'],['eSign','/esign'],['Documents','/documents']]},
 {id:'perf',name:'Reports',icon:'chart',home:'/analytics',pages:[['Analytics','/analytics'],['KPIs','/kpi'],['Commissions','/commissions'],['Vendor reports','/reports']]},
 {id:'admin',name:'Setup',icon:'settings',home:'/settings',pages:[['Settings','/settings'],['Agents & access','/agents'],['Support','/support-tickets'],['AI-SEO','/ai-seo'],['Landchecker usage','/landchecker-usage'],['Public pages','/crm-public']]}
);
const CW_CLUSTERS=[
 {kept:'/properties',group:'props',tabs:[['My listings','/properties'],['All agents','/collings-properties'],['Map','/collings-properties/map'],['Deleted','/properties/trash'],['Deleted','/collings-properties/trash']]},
 {kept:'/public-properties',group:'props',tabs:[['Profiles','/public-properties'],['Search','/public-property-search'],['Collings data','/collings-data-properties']]},
 {kept:'/seller-leads',group:'leads',tabs:[['Seller leads','/seller-leads'],['Pipeline','/leads-pipeline'],['On market','/on-market-pipeline'],['Off market','/off-market-pipeline'],['Prospects','/prospects'],['Appraisal submissions','/appraisal-submissions'],['Garage sales','/garage-sales'],['Database','/database']]},
 {kept:'/leads',group:'leads',tabs:[['Enquiries & offers','/leads'],['Portal users','/buyers'],['Find buyers','/prospecting/find-buyers']]},
 {kept:'/prospecting/seller-opportunities',group:'leads',tabs:[['Seller opportunities','/prospecting/seller-opportunities'],['Re-listing','/prospecting/relisting-opportunities'],['New developments','/prospecting/new-developments']]},
 {kept:'/communications',group:'comms',tabs:[['Hub','/communications'],['Email templates','/email-templates'],['Auto responses','/auto-email-responses'],['Canned responses','/utilities'],['Bulk sends','/send-runs'],['Portal invites','/contacts/portal-invites']]},
 {kept:'/analytics',group:'perf',tabs:[['Analytics','/analytics'],['My performance','/my-performance'],['Leaderboard','/leaderboard/sales'],['AI sessions','/session'],['Session analytics','/session-analytics'],['Chat history','/chat-history']]},
 {kept:'/support-tickets',group:'admin',tabs:[['Buyer support','/support-tickets'],['Staff requests','/ticketing'],['Bug reports','/report-issue']]},
 {kept:'/settings',group:'admin',tabs:[['Settings','/settings'],['My profile','/my-profile'],['Phone lines','/twilio-accounts'],['Voice agents','/voice-agents'],['AI voice caller','/ai-voice-caller'],['Campaign setup','/campaign-setup'],['Mailbox','/mailbox'],['Google calendar','/google-calender']]},
 {kept:'/crm-public',group:'admin',tabs:[]}
];
function cwClusterOf(route){const {path}=cwParse(route);let best=null,len=-1;for(const c of CW_CLUSTERS)for(const [l,r] of c.tabs){const p=cwParse(r).path;if((path===p||path.startsWith(p+'/'))&&p.length>len){len=p.length;best={c,tab:r}}}return best}
cwGroupOf=function(def,ctx){const cl=ctx?cwClusterOf(ctx.route):null;const id=cl?cl.c.group:(CW_GROUP_ALIAS[def.group]||def.group);return CW_GROUPS.find(g=>g.id===id)||CW_GROUPS[0]};
cwGroupNav=function(g,ctx){if(!g)return '';const cl=cwClusterOf(ctx.route);const here=ctx.route;
 const exact=r=>here===r||(r!=='/'&&ctx.path===cwParse(r).path&&(!cwParse(r).q.tab||cwParse(r).q.tab===ctx.q.tab));
 const anyExact=g.pages.some(([,r])=>exact(r));
 const prefix=g.pages.map(([,r])=>r).filter(r=>r!=='/'&&!r.startsWith('/app/')&&here.startsWith(r+'/')).sort((a,b)=>b.length-a.length)[0];
 const nav=`<nav class="cw-subnav" aria-label="${h(g.name)} pages">${g.pages.map(([n,r])=>{const on=cl?r===cl.c.kept:(exact(r)||(!anyExact&&r===prefix&&r!==g.home));return `<button type="button" class="${on?'on':''}" data-action="cwGo" data-id="${h(r)}">${h(n)}</button>`}).join('')}</nav>`;
 if(!cl||cl.c.tabs.length<2)return nav;
 const seen=new Set();const tabs=cl.c.tabs.filter(([l])=>!seen.has(l)&&seen.add(l));
 return nav+`<div class="tabs cw-tabs cw-cluster" role="tablist">${tabs.map(([l,r])=>{const on=r===cl.tab||(l==='Deleted'&&cl.tab.endsWith('/trash'));return `<button type="button" role="tab" aria-selected="${on}" class="${on?'active':''}" data-action="cwGo" data-id="${h(r)}">${h(l)}</button>`}).join('')}</div>`};
const cwMergePrevGo=CW_ACT.cwGo;
cwOn('cwGo',r=>{if(r.startsWith('/app/')){navigate(r.slice(5));return}return cwMergePrevGo(r)});
/* Old page names: everything in the old menu that is not a primary destination now */
function cwMergePrimaries(){const s=new Set();for(const g of CW_GROUPS)for(const [,r] of g.pages)s.add(cwParse(r).path);return s}
function cwMergeOldPages(){const prim=cwMergePrimaries();return CW_INDEX.filter(e=>!prim.has(cwParse(e.route).path)||e.route.includes('?tab='))}
