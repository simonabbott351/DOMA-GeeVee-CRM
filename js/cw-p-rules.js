'use strict';
/* Decisions of 17 Nov 2026:
   1. The old Dashboard is folded into Today. Its route still works and lands on Today. Its useful numbers sit in Today's side column.
   2. Seller-lead timing rule: a new seller lead must be called within 24 hours of arriving. GeeVee reminds the agent at 20 hours.
      At 24 hours the lead is escalated to the principal. The clock runs on weekends and after hours. */
const CW_RULE_HOURS=24,CW_RULE_REMIND=20;
const cwRulePrincipal=()=>state.cw.agents.find(a=>a.level==='Super Admin'&&a.active!==false)?.name||'the principal';
function cwRuleLeadAt(d){const x=cwDX(d);if(x.leadAt)return x.leadAt;const m=String(d.lastChange||'').match(/(\d+)\s*day/);const h=String(d.lastChange||'').match(/(\d+)\s*hour/);const ago=m?Number(m[1])*24-2:h?Number(h[1]):/just now|today/i.test(d.lastChange||'')?1:48;x.leadAt=new Date(Date.now()-ago*3600e3).toISOString();return x.leadAt}
function cwRuleOpenLeads(){return cwProps().filter(d=>d.stage==='New lead'&&!cwDX(d).slAction&&!cwDX(d).called&&findP(d.contactId)?.callStatus!=='contacted')}
function cwRuleAge(d){return (Date.now()-Date.parse(cwRuleLeadAt(d)))/3600e3}
function cwRuleLeft(d){return CW_RULE_HOURS-cwRuleAge(d)}
function cwRuleLabel(d){const left=cwRuleLeft(d);if(left<=0)return tag('Overdue '+Math.round(-left)+'h · escalated','red');if(left<=CW_RULE_HOURS-CW_RULE_REMIND)return tag(Math.max(1,Math.round(left))+'h left','yellow');return tag(Math.round(left)+'h left','teal')}
function cwRuleApply(){let changed=false;const principal=cwRulePrincipal();
 for(const d of cwRuleOpenLeads()){const x=cwDX(d),p=findP(d.contactId),name=p?.name||'Seller lead',left=cwRuleLeft(d);
  if(left<=CW_RULE_HOURS-CW_RULE_REMIND&&left>0&&!x.reminded){x.reminded=true;changed=true;if(!state.cw.notifications.some(n=>n.title==='Call '+name+' within '+Math.max(1,Math.round(left))+' hours'))state.cw.notifications.unshift({id:cwId('NT'),title:'Call '+name+' within '+Math.max(1,Math.round(left))+' hours',body:d.address+', '+d.suburb+'. New seller leads must be called within 24 hours.',kind:'SELLER LEAD DUE',priority:'High',read:false,at:cwNowISO(),route:'/seller-leads'});audit('policy','Reminder: '+name+' not called yet',Math.max(1,Math.round(left))+' hours left under the 24-hour seller-lead rule.')}
  if(left<=0&&!x.escalated){x.escalated=true;x.escalatedAt=cwNowISO();changed=true;if(!state.cw.notifications.some(n=>n.title==='Escalated to '+principal+': '+name+' not called in 24 hours'))state.cw.notifications.unshift({id:cwId('NT'),title:'Escalated to '+principal+': '+name+' not called in 24 hours',body:d.address+', '+d.suburb+'. The lead stays with '+(x.agents[0]||CW_ME)+' until it is called.',kind:'ESCALATED',priority:'High',read:false,at:cwNowISO(),route:'/seller-leads'});audit('policy','Escalated to '+principal+': '+name,'Seller lead not called within 24 hours. 24-hour rule, decided 17 Nov 2026.');
   if(!state.tasks.some(t=>t.status==='Open'&&t.dealId===d.id&&/escalated/i.test(t.origin||'')))addTask({title:'Call '+name+' now (escalated seller lead)',contactId:d.contactId,dealId:d.id,due:'Now',priority:'Urgent',category:'Call',origin:'Escalated to '+principal+' under the 24-hour seller-lead rule'})}}
 if(changed)persist()}
const cwRulePrevRender=render;
render=function(){try{if(state.cw)cwRuleApply()}catch(e){console.warn('24-hour rule',e)}return cwRulePrevRender()};
function cwRuleCard(){const leads=cwRuleOpenLeads().sort((a,b)=>cwRuleLeft(a)-cwRuleLeft(b));if(!leads.length)return `<div class="alert ok" style="margin-bottom:14px">${ico('check','sm')}<div><b>24-hour rule:</b> every seller lead has been called.</div></div>`;const over=leads.filter(d=>cwRuleLeft(d)<=0);
 return `<section class="card pad" style="margin-bottom:14px"><div class="card-head"><h2>Call within 24 hours</h2>${over.length?tag(over.length+' escalated to '+cwRulePrincipal(),'red'):tag(leads.length+' on the clock','teal')}</div><p class="small muted" style="margin-bottom:8px">A new seller lead is always a call from you, within 24 hours of arriving. GeeVee reminds you at 20 hours. At 24 hours it goes to ${h(cwRulePrincipal())}. The clock runs on weekends and after hours.</p>${leads.map(d=>`<div class="list-row">${cwAvatar(personName(d.contactId))}<div class="list-main"><strong>${h(personName(d.contactId))}</strong><div class="sub">${h(d.address)}, ${h(d.suburb)} · arrived ${cwDateTime(cwRuleLeadAt(d))}</div></div>${cwRuleLabel(d)}${cwBtn('Call','call',d.contactId,'sm primary')}</div>`).join('')}</section>`}
/* Seller leads page: the rule card above the table, and the panel item replaced */
{const r=CW_ROUTES.find(x=>x.pattern==='/seller-leads');if(r){const prev=r.def.render,prevAI=r.def.ai;
 r.def.render=function(ctx){const html=prev(ctx);const i=html.indexOf('<div class="table-wrap');return i<0?html+cwRuleCard():html.slice(0,i)+cwRuleCard()+html.slice(i)};
 r.def.ai=function(ctx){const items=(prevAI?prevAI(ctx):[]).filter(x=>x&&x.t!=='Escalation');const over=cwRuleOpenLeads().filter(d=>cwRuleLeft(d)<=0);items.push(over.length?{k:'check',t:over.length+' leads past 24 hours',b:'Escalated to '+h(cwRulePrincipal())+'. They stay with the agent until called. '+over.map(d=>h(personName(d.contactId))).join(', ')+'.',a:[['Call '+h(personName(over[0].contactId).split(' ')[0]),'call',over[0].contactId,'primary']]}:{k:'info',t:'24-hour rule',b:'Every new seller lead is called within 24 hours. GeeVee reminds you at 20 hours and escalates to '+h(cwRulePrincipal())+' at 24.'});return items}}}
/* Dashboard folded into Today */
const cwRulePrevOpen=cwOpen;
cwOpen=function(route){if(cwParse(route).path==='/'){navigate('today');return}return cwRulePrevOpen(route)};
{const e=CW_INDEX.find(x=>x.route==='/');if(e)e.name='Dashboard (now Today)'}
function cwRuleTodayAside(){const ds=cwProps();const st=['New','Connected','Appraisal','Listed','For Sale','Sold'];const stageOf=d=>cwDX(d).longTerm?'Long Term':CW_PROSPECT_STAGE[d.stage]||'New';
 const target=state.cw.settings.gciTarget||0,earned=state.cw.settlements.reduce((a,s)=>a+s.commission,0);const slow=ds.filter(d=>d.stage==='For sale'&&cwDX(d).dom>40);const leads=cwRuleOpenLeads(),over=leads.filter(d=>cwRuleLeft(d)<=0);
 return `<div class="gv-aside-mini cw-today-dash"><b>Your pipeline</b><div class="cw-today-stages">${st.map(s=>`<button type="button" data-action="cwGo" data-id="/prospects"><b>${ds.filter(d=>stageOf(d)===s).length}</b><span>${s}</span></button>`).join('')}</div>
 <div class="cw-today-line"><span>Seller leads to call</span><b>${leads.length}${over.length?` <span class="tag red">${over.length} past 24h</span>`:''}</b></div>
 <div class="cw-today-line"><span>Listings over 40 days</span><b>${slow.length}</b></div>
 <div class="cw-today-line"><span>GCI this year</span><b>${cwMoney(earned)}${target?' of '+cwMoney(target):''}</b></div>${target?`<div class="cw-bar" style="margin:4px 0 8px"><span style="width:${Math.min(100,Math.round(earned/target*100))}%"></span></div>`:''}
 <div class="cw-row">${cwBtn('Seller leads','cwGo','/seller-leads','sm')}${target?cwBtn('Change target','cwGciTarget','','sm ghost'):cwBtn('Set GCI target','cwGciTarget','','sm ghost')}</div></div>`}
const cwRulePrevToday=today;
today=function(){const html=cwRulePrevToday();const i=html.lastIndexOf('</aside>');return i<0?html:html.slice(0,i)+cwRuleTodayAside()+html.slice(i)};
