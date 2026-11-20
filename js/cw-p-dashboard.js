'use strict';
/* Dashboard group: /, /notifications, /tasks, /calendar, /google-calender, /mailbox, /messenger, /chat-history */
function cwTaskDue(t){if(t.dueISO)return t.dueISO.slice(0,10);const d=new Date();if(/tomorrow/i.test(t.due))d.setDate(d.getDate()+1);else if(/next week/i.test(t.due))d.setDate(d.getDate()+7);return cwLocalDay(d)}
function cwTaskOverdue(t){return t.status==='Open'&&(/now|overdue/i.test(t.due||'')||cwTaskDue(t)<cwLocalDay())}
function cwTaskDueLabel(t){if(t.dueISO){const d=new Date(t.dueISO);return cwDate(d)+(t.dueTime?' '+t.dueTime:'')}return t.due||'No due date'}
function cwEventsAll(){const ev=state.cw.events.map(e=>({...e,src:'cal'}));for(const o of state.cw.openHomes){const d=findD(o.dealId);ev.push({id:o.id,title:'Open home: '+(d?d.address:''),start:o.day,mins:30,where:d?cwAddr(d):'',kind:'Open home',dealId:o.dealId,src:'oh'})}return ev.sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))}
const CW_TASK_TYPES=['Call','Admin','Email','Meeting','Follow up','Appraisal'];

/* ----- Dashboard ----- */
cwPage('/',{title:'Dashboard',group:'dash',render(){
 const ds=cwProps(),st=['New','Connected','Long Term','Appraisal','Listed','For Sale','Sold','Lost'];
 const stageOf=d=>cwDX(d).longTerm?'Long Term':CW_PROSPECT_STAGE[d.stage]||'New';
 const counts=st.map(s=>[s,ds.filter(d=>stageOf(d)===s).length]);
 const due=state.tasks.filter(t=>t.status==='Open'&&cwTaskDue(t)<=cwLocalDay());
 const enq=state.cw.enquiries.filter(e=>e.status==='Pending');
 const offers=(state.offers||[]).filter(o=>o.status==='New');
 const sellerLeads=ds.filter(d=>['New lead','Connected'].includes(d.stage));
 const contracts=state.cw.esign.agreements.filter(a=>['In Progress','Completed'].includes(a.status));
 const listings=ds.filter(d=>d.stage==='For sale');
 const target=state.cw.settings.gciTarget||0;
 const earned=state.cw.settlements.reduce((a,s)=>a+s.commission,0);
 const week=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d});
 const ev=cwEventsAll();
 const filt=cwF('dash:who','All');
 return `${cwHeader('Dashboard','Your CRM at a glance. GeeVee ranks the same work on Today.',`${cwInput('dash:q','Search properties, contacts...',{cls:'',label:'Search CRM'})}${cwSelect('dash:who',['All','Buyers','Sellers'],{label:'Search in'})}${cwBtn('Search','cwDashSearch','','primary')}`,'Collings CRM')}
 ${cwStats([['Prospecting',sellerLeads.length,'seller leads to work'],['GCI target progress',target?Math.round(earned/target*100)+'%':cwMoney(earned),target?cwMoney(earned)+' of '+cwMoney(target):'No target set. '+cwBtn('Set target','cwGciTarget','','sm ghost')],['Tasks due today',due.length,due.filter(cwTaskOverdue).length+' overdue'],['Enquiries waiting',enq.length+offers.length,offers.length+' written offers']])}
 ${cwCard('Pipeline snapshot',`<div class="grid-4">${counts.map(([s,n])=>`<button type="button" class="stat cw-stat-btn" data-action="cwGo" data-id="/prospects"><div class="label">${h(s)}</div><div class="value">${n}</div></button>`).join('')}</div>`,cwGoBtn('Open prospects','/prospects','sm'))}
 <div class="cw-two">
 ${cwCard('Priority today',due.slice(0,6).map(t=>`<div class="list-row"><div class="number-circle">${ico(t.category==='Call'?'phone':'check','sm')}</div><div class="list-main"><strong>${h(t.title)}</strong><div class="sub">${h(personName(t.contactId))} · ${h(cwTaskDueLabel(t))}</div></div>${cwBtn('Done','cwTaskDone',t.id,'sm')}</div>`).join('')||cwEmpty('No tasks due today'),cwGoBtn('All tasks','/tasks','sm'))}
 ${cwCard('Buyer enquiries & offers',[...offers.map(o=>`<div class="list-row"><div class="number-circle" style="background:#fff0e9;color:#bf5436">${ico('alert','sm')}</div><div class="list-main"><strong>Offer ${h(cwMoney(o.amount))} · ${h(findD(o.dealId)?.address||'')}</strong><div class="sub">${h(personName(o.buyerId))} · written offer</div></div>${cwBtn('Review','route','today','sm primary')}</div>`),...enq.slice(0,5).map(e=>`<div class="list-row"><div class="number-circle">${ico('messages','sm')}</div><div class="list-main"><strong>${h(e.contactId?cwPName(e.contactId):e.name)} · ${h(e.type)}</strong><div class="sub">${h(findD(e.dealId)?.address||'')} · ${h(e.comments||'')}</div></div>${cwGoBtn('View','/leads?tab=enquiries','sm')}</div>`)].join('')||cwEmpty('All clear','No pending enquiries or offers.'),cwGoBtn('Enquiries','/leads','sm'))}
 ${cwCard('New seller leads',sellerLeads.slice(0,5).map(d=>`<div class="list-row">${cwAvatar(cwPName(d.contactId))}<div class="list-main"><strong>${h(cwPName(d.contactId))}</strong><div class="sub">${h(d.address)}, ${h(d.suburb)} · ${h(d.source)}</div></div>${cwBtn('Call','call',d.contactId,'sm primary')}</div>`).join('')||cwEmpty('No new seller leads'),cwGoBtn('Seller leads','/seller-leads','sm'))}
 ${cwCard('Sent contracts',contracts.map(a=>`<div class="list-row"><div class="number-circle">${ico('file','sm')}</div><div class="list-main"><strong>${h(a.title)}</strong><div class="sub">${h(a.status)}</div></div>${cwGoBtn('Open','/esign/document/'+a.id,'sm')}</div>`).join('')||cwEmpty('No contracts sent by anyone in the office yet.'),cwGoBtn('eSign','/esign','sm'))}
 ${cwCard('Market signal alerts',Object.entries(state.marketSignals||{}).map(([id,s])=>{const d=findD(id);return d?`<div class="list-row"><div class="number-circle" style="background:#fff3df;color:#a86a15">${ico('chart','sm')}</div><div class="list-main"><strong>${h(d.address)}</strong><div class="sub">${s.days} days on market · ${s.enquiries} enquiries · ${s.offers} offers</div></div>${cwGoBtn('Open','/properties/'+d.id+'?tab=analytics','sm')}</div>`:''}).join('')||cwEmpty('No stalling listings right now.'))}
 ${cwCard('Re-listing opportunities',state.cw.relisting.slice(0,4).map(r=>`<div class="list-row"><div class="number-circle">${ico('refresh','sm')}</div><div class="list-main"><strong>${h(r.address)}, ${h(r.suburb)}</strong><div class="sub">${h(r.kind)} · ${r.dom} days · ${h(r.agency)}</div></div></div>`).join(''),cwGoBtn('All','/prospecting/relisting-opportunities','sm'))}
 ${cwCard('Calendar',`<div class="cw-timeline">${week.map(d=>{const day=cwLocalDay(d);const es=ev.filter(e=>cwLocalDay(e.start)===day);return es.length?`<div class="cw-tl"><span class="cw-tl-dot"></span><div><b>${d.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'})}</b>${es.map(e=>`<small>${new Date(e.start).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})} · ${h(e.title)}</small>`).join('<br>')}</div></div>`:''}).join('')||cwEmpty('Nothing booked this week')}</div>`,cwGoBtn('Calendar','/calendar','sm'))}
 ${cwCard('Current listings: days on market',`<div class="cw-funnel">${listings.map(d=>`<div><span class="clip">${h(d.address)}</span><div class="cw-bar"><span style="width:${Math.min(100,cwDX(d).dom/60*100)}%;background:${cwDX(d).dom>40?'#e6a344':'var(--teal)'}"></span></div><b>${cwDX(d).dom}d</b></div>`).join('')||cwEmpty('No active listings found')}</div>`)}
 </div>
 ${cwCard('New developments',state.cw.developments.filter(x=>x.status==='Active').slice(0,3).map(x=>`<div class="list-row"><div class="number-circle">${ico('building','sm')}</div><div class="list-main"><strong>${h(x.name)}, ${h(x.suburb)}</strong><div class="sub">${x.units} units · ${cwShort(x.value)} · ${h(x.stage)}</div></div></div>`).join(''),cwGoBtn('All','/prospecting/new-developments','sm'))}
 ${cwCard('Real estate news',['Melbourne auction clearance rate steady at 68% this weekend','Northern suburbs lead quarterly price growth','Rate decision: what it means for first home buyers'].map((x,i)=>`<div class="list-row"><div class="number-circle">${i+1}</div><div class="list-main"><strong>${h(x)}</strong><div class="sub">Sample headline · prototype</div></div></div>`).join(''))}`},
 ai(){const due=state.tasks.filter(cwTaskOverdue).length,leads=cwProps().filter(d=>d.stage==='New lead').length,risk=cwProps().filter(d=>d.active&&d.risk);
  return[{k:'check',t:`${leads} new seller leads to call`,b:'Seller leads are always a call from you. GeeVee has put each one at the top of Today with a brief.',a:[['Open Today','route','today','primary']]},
   due?{k:'check',t:`${due} overdue tasks`,b:'Move them to tomorrow in one step, or work them on Today.',a:[['Move to tomorrow','cwTaskRollOver','']]}:null,
   risk.length?{k:'info',t:`${risk.length} deals need attention`,b:risk.slice(0,3).map(d=>h(d.address)+': '+h(d.risk)).join('<br>'),a:[['My deals','route','deals']]}:null]}});
cwOn('cwDashSearch',()=>{ui.searchGlobal=cwF('dash:q','');ui.modal={type:'search'};render()});
cwOn('cwGciTarget',()=>cwModal('gci'));
cwModalDef('gci',()=>({title:'Set your GCI target',body:cwForm('gci',[{n:'target',l:'Gross commission target for this financial year ($)',t:'number',req:true,ph:'500000'}],{target:state.cw.settings.gciTarget||''}),foot:cwBtn('Cancel','close')+cwBtn('Save target','cwGciSave','','primary')}));
cwOn('cwGciSave',()=>{const v=cwRead('gci',[{n:'target',l:'Target',t:'number',req:true}]);if(!v)return;state.cw.settings.gciTarget=Number(v.target);ui.modal=null;cwPersist('GCI target saved.')});

/* ----- Notifications ----- */
cwPage('/notifications',{title:'Notifications',group:'dash',render(){
 const n=state.cw.notifications,f=cwF('nt:f','All');const list=n.filter(x=>f==='All'||(f==='Unread'&&!x.read)||(f==='High Priority'&&x.priority==='High'));
 return `${cwHeader('Notifications','Alerts from your leads, listings and inspections.',cwBtn('Mark all read','cwNtAll','',''))}
 ${cwStats([['Total',n.length],['Unread',n.filter(x=>!x.read).length],['High priority',n.filter(x=>x.priority==='High').length],['Today',n.filter(x=>cwLocalDay(x.at)===cwLocalDay()).length]])}
 ${cwPills('nt:f',[['All','All'],['Unread','Unread'],['High Priority','High priority']])}
 <div class="card">${list.map(x=>`<div class="list-row" style="padding:13px 16px;${x.read?'':'background:#f5fbfb'}"><div class="number-circle">${ico('bell','sm')}</div><div class="list-main"><strong>${h(x.title)}</strong><div class="sub">${tag(x.kind,'outline')} ${h(x.body||'No description available')} · ${cwDateTime(x.at)}</div></div><div class="action-side">${x.route?cwBtn('Open','cwNtOpen',x.id,'sm'):''}${x.read?'':cwBtn('Mark read','cwNtRead',x.id,'sm ghost')}${cwBtn('Delete','cwNtDel',x.id,'sm ghost')}</div></div>`).join('')||cwEmpty('No notifications')}</div>`},
 ai(){const u=state.cw.notifications.filter(x=>!x.read).length;return[{k:'info',t:u?u+' unread notifications':'You are up to date',b:'Offers, hot seller leads and appointment changes also appear on Today in priority order.'}]}});
cwOn('cwNtAll',()=>{state.cw.notifications.forEach(x=>x.read=true);cwPersist('All marked read.')});
cwOn('cwNtRead',id=>{const x=state.cw.notifications.find(n=>n.id===id);if(x)x.read=true;cwPersist()});
cwOn('cwNtDel',id=>{state.cw.notifications=state.cw.notifications.filter(n=>n.id!==id);cwPersist('Notification deleted.')});
cwOn('cwNtOpen',id=>{const x=state.cw.notifications.find(n=>n.id===id);if(!x)return;x.read=true;persist();cwGo(x.route)});

/* ----- Tasks ----- */
const CW_TASK_FIELDS=[{n:'title',l:'Task',req:true,full:true,ph:'Call Helen about the campaign'},{n:'category',l:'Type',t:'select',o:CW_TASK_TYPES},{n:'priority',l:'Priority',t:'select',o:['Normal','High','Urgent']},{n:'dueISO',l:'Due date',t:'date',req:true},{n:'dueTime',l:'Time',t:'time'},{n:'contactId',l:'Contact',t:'select',o:[]},{n:'dealId',l:'Property',t:'select',o:[]},{n:'notes',l:'Notes',t:'textarea'}];
function cwTaskFields(){return CW_TASK_FIELDS.map(f=>f.n==='contactId'?{...f,o:[['','No contact'],...cwContacts().map(p=>[p.id,p.name])]}:f.n==='dealId'?{...f,o:[['','No property'],...cwProps().map(d=>[d.id,d.address+', '+d.suburb])]}:f)}
cwPage('/tasks',{title:'Tasks',group:'dash',render(){
 const all=state.tasks,tab=cwTab('tasks','All'),type=cwF('tasks:type','All Types'),q=cwF('tasks:q','');
 let list=all.filter(t=>(tab==='All'||(tab==='Pending'&&t.status==='Open')||(tab==='Completed'&&t.status==='Done'))&&(type==='All Types'||t.category===type));
 list=cwSearchRows(list,q,t=>t.title+' '+personName(t.contactId)+' '+(findD(t.dealId)?.address||''));
 const rank=t=>t.status!=='Open'?3:cwTaskOverdue(t)?0:({Urgent:0,High:1,Normal:2})[t.priority]??2;
 return `${cwHeader('Tasks & Activities','Manage your daily tasks and follow-ups. Tasks GeeVee creates land here too.',cwBtn(ico('check','sm')+' Add task','cwTaskNew','','primary'))}
 ${cwStats([['Total tasks',all.length],['Pending',all.filter(t=>t.status==='Open').length],['Completed',all.filter(t=>t.status==='Done').length],['Overdue',all.filter(cwTaskOverdue).length,'',all.some(cwTaskOverdue)?'highlight':'']])}
 <div class="toolbar">${cwTabs('tasks',[['All','All tasks',all.length],['Pending','Pending',all.filter(t=>t.status==='Open').length],['Completed','Completed',all.filter(t=>t.status==='Done').length]])}${cwSelect('tasks:type',['All Types',...CW_TASK_TYPES],{label:'Task type'})}${cwInput('tasks:q','Search tasks')}</div>
 ${cwTable('tasks',[['Task',t=>`<b style="${t.status==='Done'?'text-decoration:line-through;color:#8a9aa1':''}">${h(t.title)}</b><div class="tiny muted">${h(t.origin||'')}</div>`,t=>t.title],['Type',t=>tag(t.category||'Admin','outline'),t=>t.category],['Contact',t=>t.contactId?cwLink(h(personName(t.contactId)),'/contacts/'+t.contactId):'<span class="muted">None</span>',t=>personName(t.contactId)],['Property',t=>t.dealId&&findD(t.dealId)?cwLink(h(findD(t.dealId).address),'/properties/'+t.dealId):'<span class="muted">None</span>'],['Due',t=>`<span class="${cwTaskOverdue(t)?'tag red':''}">${h(cwTaskDueLabel(t))}</span>`,t=>cwTaskDue(t)],['Priority',t=>tag(t.priority||'Normal',t.priority==='Urgent'?'red':t.priority==='High'?'yellow':''),rank],['',t=>`<div class="cw-row">${t.status==='Open'?cwBtn('Complete','cwTaskDone',t.id,'sm primary'):cwBtn('Reopen','cwTaskReopen',t.id,'sm')}${cwBtn('Edit','cwTaskEdit',t.id,'sm')}${cwBtn('Delete','cwTaskDel',t.id,'sm ghost')}</div>`]],list.sort((a,b)=>rank(a)-rank(b)),{select:true,empty:'No tasks found',emptyActions:cwBtn('Add task','cwTaskNew','','primary'),bulk:s=>cwBtn('Complete','cwTaskBulkDone','','sm')+cwBtn('Move to tomorrow','cwTaskBulkTomorrow','','sm')+cwBtn('Delete','cwTaskBulkDel','','sm warn')})}`},
 ai(){const od=state.tasks.filter(cwTaskOverdue),noC=state.tasks.filter(t=>t.status==='Open'&&!t.contactId);return[od.length?{k:'check',t:od.length+' overdue tasks',b:'GeeVee can move them to tomorrow morning. Calls stay at the top of Today.',a:[['Move to tomorrow','cwTaskRollOver','']]}:{k:'info',t:'Nothing overdue',b:'Every open task has a due date in the future.'},noC.length?{k:'info',t:noC.length+' tasks have no contact',b:'Linking a contact lets GeeVee prepare the call brief and the follow-up.'}:null,{k:'auto',t:'Tasks from calls and recaps',b:'When you save a call recap or a meeting note, GeeVee adds the follow-up here with a due date. It never creates the same task twice.'}]}});
cwOn('cwTaskNew',()=>cwModal('task',null));
cwOn('cwTaskEdit',id=>cwModal('task',id));
cwModalDef('task',id=>{const t=id?findT(id):null;return{title:t?'Edit task':'Add task',body:cwForm('task',cwTaskFields(),t?{...t,dueISO:cwTaskDue(t)}:{dueISO:cwLocalDay(),priority:'Normal',category:'Call'}),foot:cwBtn('Cancel','close')+cwBtn(t?'Save task':'Add task','cwTaskSave',id||'','primary')}});
cwOn('cwTaskSave',id=>{const v=cwRead('task',cwTaskFields());if(!v)return;const due=v.dueISO===cwLocalDay()?'Today':cwDate(v.dueISO);
 if(id){const t=findT(id);Object.assign(t,v,{due});audit('task','Task updated: '+t.title,'Edited on the Tasks page.')}else{addTask({...v,due,origin:'Added by agent'})}
 ui.modal=null;cwPersist(id?'Task saved.':'Task added.')});
cwOn('cwTaskDone',id=>{const t=findT(id);if(!t)return;t.status='Done';audit('task','Task completed: '+t.title,'Completed from the CRM pages.');cwPersist('Task completed.')});
cwOn('cwTaskReopen',id=>{const t=findT(id);if(!t)return;t.status='Open';cwPersist('Task reopened.')});
cwOn('cwTaskDel',id=>cwConfirm('Delete this task?','The task is removed from Today and the CRM. This prototype keeps no copy.','cwTaskDelYes',id,'Delete','warn'));
cwOn('cwTaskDelYes',id=>{state.tasks=state.tasks.filter(t=>t.id!==id);ui.modal=null;cwPersist('Task deleted.')});
function cwTomorrow(t){const d=new Date();d.setDate(d.getDate()+1);t.dueISO=cwLocalDay(d);t.due='Tomorrow'}
cwOn('cwTaskRollOver',()=>{const od=state.tasks.filter(cwTaskOverdue);od.forEach(cwTomorrow);audit('auto','GeeVee moved '+od.length+' overdue tasks to tomorrow','Agent asked from the CRM pages.');cwPersist(od.length+' tasks moved to tomorrow.')});
cwOn('cwTaskBulkDone',()=>{const s=cwSel('tasks');state.tasks.filter(t=>s.includes(t.id)).forEach(t=>t.status='Done');cwU().sel.tasks=[];cwPersist(s.length+' tasks completed.')});
cwOn('cwTaskBulkTomorrow',()=>{const s=cwSel('tasks');state.tasks.filter(t=>s.includes(t.id)).forEach(cwTomorrow);cwU().sel.tasks=[];cwPersist(s.length+' tasks moved to tomorrow.')});
cwOn('cwTaskBulkDel',()=>{const s=cwSel('tasks');state.tasks=state.tasks.filter(t=>!s.includes(t.id));cwU().sel.tasks=[];cwPersist(s.length+' tasks deleted.')});

/* ----- Calendar ----- */
cwPage('/calendar',{title:'Calendar',group:'dash',render(){
 const base=new Date();base.setDate(1);base.setMonth(base.getMonth()+Number(cwF('cal:off',0)));
 const y=base.getFullYear(),m=base.getMonth(),first=new Date(y,m,1),start=new Date(first);start.setDate(1-((first.getDay()+6)%7));
 const ev=cwEventsAll(),todayISO=cwLocalDay(),view=cwTab('calv','Month');
 const days=[...Array(42)].map((_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d});
 const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const evKey=e=>dayKey(new Date(e.start));
 const upcoming=ev.filter(e=>Date.parse(e.start)>=Date.now()-3600e3).slice(0,12);
 return `${cwHeader('Calendar',state.cw.google.connected?'Showing DOMA events and your connected Google Calendar.':'DOMA appointments, open homes and auctions. Connect Google Calendar to see everything in one place.',`${state.cw.google.connected?tag('Google Calendar connected','green'):cwGoBtn('Connect Google Calendar','/google-calender','')}${cwBtn(ico('calendar','sm')+' New event','cwEvNew','','primary')}`)}
 <div class="toolbar">${cwBtn('Previous','cwCalMove','-1','sm')}${cwBtn('Today','cwCalMove','0','sm')}${cwBtn('Next','cwCalMove','1','sm')}<h2 style="font-size:17px;margin:0 8px">${base.toLocaleDateString('en-AU',{month:'long',year:'numeric'})}</h2>${cwTabs('calv',[['Month','Month'],['Agenda','Agenda']])}</div>
 ${view==='Agenda'?cwCard('Upcoming',upcoming.map(e=>`<div class="list-row"><div class="number-circle">${ico('calendar','sm')}</div><div class="list-main"><strong>${h(e.title)}</strong><div class="sub">${cwDateTime(e.start)} · ${h(e.where||'')} · ${h(e.kind||'')}</div></div>${cwBtn('Open','cwEvOpen',e.id,'sm')}</div>`).join('')||cwEmpty('Nothing booked')):
 `<div class="cw-cal">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="cw-cal-h">${d}</div>`).join('')}${days.map(d=>{const k=dayKey(d);const es=ev.filter(e=>evKey(e)===k);return `<div class="cw-cal-d ${d.getMonth()!==m?'out':''} ${k===todayISO?'today':''}" data-action="cwEvNew" data-id="${k}"><span class="n">${d.getDate()}</span><button type="button" class="cw-cal-add" data-action="cwEvNew" data-id="${k}" aria-label="Add event on ${d.toDateString()}">+</button>${es.slice(0,3).map(e=>`<button type="button" class="cw-cal-e k-${h((e.kind||'').split(' ')[0])}" data-action="cwEvOpen" data-id="${h(e.id)}">${new Date(e.start).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})} ${h(e.title)}</button>`).join('')}${es.length>3?`<span class="tiny muted">+${es.length-3} more</span>`:''}</div>`}).join('')}</div>`}`},
 ai(){const ev=cwEventsAll().filter(e=>new Date(e.start).toDateString()===new Date().toDateString()&&e.where&&e.where!=='Phone');const tight=[];for(let i=1;i<ev.length;i++){const gap=(Date.parse(ev[i].start)-(Date.parse(ev[i-1].start)+ev[i-1].mins*60e3))/60e3;if(gap<30)tight.push(`${h(ev[i-1].title)} to ${h(ev[i].title)}: ${Math.max(0,Math.round(gap))} min`)}
  const appr=state.cw.events.filter(e=>e.kind==='Appraisal'&&Date.parse(e.start)>Date.now());
  return[tight.length?{k:'check',t:'Tight travel today',b:tight.join('<br>')+'<br>Allow travel time between in-person appointments.'}:{k:'info',t:'Travel time looks fine today'},appr.length?{k:'draft',t:appr.length+' appraisals coming up',b:'GeeVee can prepare a brief for each: owner history, recent nearby sales and notes.',a:[['Prepare briefs','cwApprBriefs','','primary']]}:null]}});
cwOn('cwCalMove',d=>{cwSetF('cal:off',d==='0'?0:Number(cwF('cal:off',0))+Number(d));render()});
cwOn('cwApprBriefs',()=>{const appr=state.cw.events.filter(e=>e.kind==='Appraisal'&&Date.parse(e.start)>Date.now());appr.forEach(e=>{if(!state.tasks.some(t=>t.title==='Review appraisal brief: '+e.where&&t.status==='Open'))addTask({title:'Review appraisal brief: '+e.where,contactId:e.contactId||findD(e.dealId)?.contactId||'',dealId:e.dealId||'',due:'Today',priority:'High',category:'Appraisal',origin:'GeeVee prepared the brief'})});cwPersist(appr.length+' briefs prepared. Review them in Tasks.')});
const CW_EV_FIELDS=[{n:'title',l:'Title',req:true,full:true},{n:'kind',l:'Type',t:'select',o:['Meeting','Appraisal','Open home','Auction','Call','Inspection','Personal']},{n:'date',l:'Date',t:'date',req:true},{n:'time',l:'Start time',t:'time',req:true},{n:'mins',l:'Length (minutes)',t:'number'},{n:'where',l:'Where',full:true},{n:'contactId',l:'Contact',t:'select',o:[]},{n:'notes',l:'Notes',t:'textarea'}];
function cwEvFields(){return CW_EV_FIELDS.map(f=>f.n==='contactId'?{...f,o:[['','None'],...cwContacts().map(p=>[p.id,p.name])]}:f)}
cwOn('cwEvNew',day=>cwModal('ev',{day}));
cwOn('cwEvOpen',id=>cwModal('ev',{id}));
cwModalDef('ev',a=>{const e=a.id?cwEventsAll().find(x=>x.id===a.id):null;if(e&&e.src==='oh')return{title:e.title,body:cwKV([['When',cwDateTime(e.start)],['Where',h(e.where)],['Type','Open home']])+'<p class="hint" style="margin-top:12px">Open homes are managed on the Inspections page.</p>',foot:cwBtn('Close','close')+cwGoBtn('Open session','/open-home/'+e.id,'primary')};
 const s=e?new Date(e.start):null;const v=e?{...e,date:cwLocalDay(s),time:s.toTimeString().slice(0,5)}:{date:a.day&&/^\d{4}/.test(a.day)?a.day:cwLocalDay(),time:'10:00',mins:60,kind:'Meeting'};
 return{title:e?'Edit event':'New event',body:cwForm('ev',cwEvFields(),v),foot:`${e?cwBtn('Delete','cwEvDel',e.id,'warn'):''}${cwBtn('Cancel','close')}${cwBtn('Save event','cwEvSave',e?.id||'','primary')}`}});
cwOn('cwEvSave',id=>{const v=cwRead('ev',cwEvFields());if(!v)return;const start=new Date(v.date+'T'+v.time).toISOString();const rec={title:v.title,kind:v.kind,start,mins:Number(v.mins)||60,where:v.where,contactId:v.contactId,notes:v.notes};
 if(id){Object.assign(state.cw.events.find(e=>e.id===id),rec)}else state.cw.events.push({id:cwId('EV'),...rec});audit('calendar',(id?'Event updated: ':'Event added: ')+v.title,cwDateTime(start));ui.modal=null;cwPersist('Event saved.')});
cwOn('cwEvDel',id=>{state.cw.events=state.cw.events.filter(e=>e.id!==id);ui.modal=null;cwPersist('Event deleted.')});

/* ----- Google calendar ----- */
cwPage('/google-calender',{title:'Google calendar',group:'dash',render(){const g=state.cw.google;
 return `${cwHeader('Connect Google Calendar','Link your calendar to view your events here.',g.connected?cwBtn('Disconnect','cwGDisc','','warn'):cwBtn('Connect','cwGConn','','primary'))}
 ${g.connected?cwCard('Connected as '+h(g.email),`<p class="small">Events from Google Calendar now show on the CRM calendar. In production this uses Google sign-in and read-only calendar access.</p><div class="sep"></div>${cwKV([['Account',h(g.email)],['Connected',cwDateTime(g.at)],['Calendars','Work, Personal']])}`,cwGoBtn('Open calendar','/calendar','sm')):cwCard('What connecting allows',`<ul class="bullet small"><li>See Google events beside DOMA appointments, open homes and auctions</li><li>GeeVee checks travel time between in-person appointments</li><li>DOMA never deletes or edits Google events</li></ul><div class="sep"></div>${cwForm('gconn',[{n:'email',l:'Google account email',t:'email',req:true,ph:'you@gmail.com'}])}`)}`},
 ai(){return[{k:'info',t:'Why connect',b:'GeeVee plans your day around appointments it can see. Personal events stay private: only the busy time is used.'}]}});
cwOn('cwGConn',()=>{const v=cwRead('gconn',[{n:'email',l:'Email',t:'email',req:true}]);if(!v)return;state.cw.google={connected:true,email:v.email,at:cwNowISO()};audit('settings','Google Calendar connected (simulated)',v.email);cwPersist('Google Calendar connected in this demo.')});
cwOn('cwGDisc',()=>{state.cw.google={connected:false};cwPersist('Google Calendar disconnected.')});

/* ----- Mailbox ----- */
cwPage('/mailbox',{title:'Mailbox',group:'dash',render(){const m=state.cw.mailbox;
 return `${cwHeader('My Mailbox','Connect your own Gmail so emails you send from the CRM come from your address.')}
 ${cwCard(ico('mail')+' Gmail',m.connected?`${cwNote('Connected as <b>'+h(m.email)+'</b>. Emails you approve in DOMA are sent from this address.','ok')}<div class="sep"></div>${cwBtn('Disconnect Gmail','cwMailDisc','','warn')}`:`${cwForm('mailc',[{n:'email',l:'Gmail address',t:'email',req:true,ph:'caleb@gmail.com'}])}<div style="margin-top:12px">${cwBtn('Connect Gmail','cwMailConn','','primary')}</div>`)}
 ${cwCard('What connecting allows',`<ul class="bullet small"><li>Emails you send from DOMA come from your own address</li><li>Replies come back to your inbox and are matched to the contact</li><li>GeeVee drafts replies. You approve them before anything is sent</li><li>DOMA never sends email in the background without your approval, except automatic answers you have turned on</li></ul>`)}`},
 ai(){return[{k:'info',t:'Replies you approve go from your address',b:'GeeVee only sends on its own when it can answer an enquiry fully from verified records. Everything else waits for you.'}]}});
cwOn('cwMailConn',()=>{const v=cwRead('mailc',[{n:'email',l:'Email',t:'email',req:true}]);if(!v)return;state.cw.mailbox={connected:true,email:v.email};cwPersist('Gmail connected in this demo.')});
cwOn('cwMailDisc',()=>{state.cw.mailbox={connected:false,email:''};cwPersist('Gmail disconnected.')});

/* ----- Messenger: the same inbox as Messages ----- */
cwPage('/messenger',{title:'Messenger',group:'dash',render(){return cwNote('This is the same inbox as <b>Messages</b>. GeeVee triages every conversation and drafts replies for you to approve.')+messages()},
 ai(){const u=state.messages.filter(m=>m.unread).length;return[{k:'check',t:u+' unread conversations',b:'Open one to see the reply GeeVee prepared and why it did or did not send it.',a:[['Open Messages','route','messages']]}]}});

/* ----- Chat history ----- */
cwPage('/chat-history',{title:'Chat history',group:'dash',render(){
 const f=cwF('ch:f','All Chats'),q=cwF('ch:q','');let list=state.cw.sessions.filter(s=>f==='All Chats'||s.channel===f||(f==='Qualified Leads'&&s.qualified));list=cwSearchRows(list,q,s=>s.name+' '+s.msgs.map(m=>m[1]).join(' '));
 const sel=state.cw.sessions.find(s=>s.id===cwF('ch:sel',list[0]?.id))||list[0];
 return `${cwHeader('Chat History','Review AI chat interactions and lead generation.')}
 <div class="toolbar">${cwSelect('ch:f',['All Chats','Website Chat','AI Call','Qualified Leads'],{label:'Filter chats'})}${cwInput('ch:q','Search conversations')}</div>
 <div class="cw-side"><div class="cw-vtabs">${list.map(s=>`<button type="button" class="${sel?.id===s.id?'on':''}" data-action="cwSetF" data-id="ch:sel|${s.id}"><span>${h(s.name)}<br><small class="muted">${h(s.channel)} · ${cwDate(s.at)}</small></span>${tag(s.score+'%',s.score>=70?'green':s.score>=50?'yellow':'')}</button>`).join('')||'<p class="hint" style="padding:10px">No chats</p>'}</div>
 ${sel?cwCard(h(sel.name),`<div class="cw-row" style="margin-bottom:10px">${tag(sel.channel,'teal')}${tag('Lead score '+sel.score+'%',sel.score>=70?'green':'yellow')}${sel.qualified?tag('Qualified lead','green'):''}</div><div class="cw-chat">${sel.msgs.map(([who,t])=>`<div class="cw-msg ${who==='ai'?'':'me'}">${h(t)}<small>${who==='ai'?'GeeVee':'Visitor'}</small></div>`).join('')}</div>`,`<div class="cw-row">${cwBtn('Create contact','cwChContact',sel.id,'sm')}${cwBtn('Add call task','cwChTask',sel.id,'sm primary')}</div>`):cwEmpty('No conversations yet.')}</div>`},
 ai(){const q=state.cw.sessions.filter(s=>s.qualified&&!s.contactId);return[q.length?{k:'call',t:q.length+' qualified leads without a contact',b:'Create the contact from the chat. Seller leads get a call from you, not a message.',a:[['Open first','cwSetF','ch:sel|'+q[0].id]]}:{k:'info',t:'Every qualified chat has a contact'}]}});
function cwAddPerson(o){const id='C-'+(9200+state.people.length)+Math.random().toString(10).slice(2,4);const p={id,legacyId:'NEW',name:o.name,role:o.role||'buyer',suburb:o.suburb||'',phone:o.phone||'',email:o.email||'',source:o.source||'Website',owner:o.owner||CW_ME,lastContact:'Just now',note:o.note||'',consent:o.consent||'ok',callStatus:'not called',tags:o.tags||[]};state.people.push(p);cwPX(p);Object.assign(p.cw,o.cw||{});cwContactHistory(p,'Contact created'+(o.via?' from '+o.via:''));audit('contact','Contact created: '+p.name,o.via||'Added in the CRM pages');return p}
cwOn('cwChContact',id=>{const s=state.cw.sessions.find(x=>x.id===id);if(!s)return;if(s.contactId){cwGo('/contacts/'+s.contactId);return}const phone=(s.msgs.map(m=>m[1]).join(' ').match(/04\d{2}\s?\d{3}\s?\d{3}/)||[''])[0];const seller=/sell/i.test(s.msgs.map(m=>m[1]).join(' '));const p=cwAddPerson({name:s.name==='Unknown caller'?'Unknown caller '+id:s.name,phone,role:seller?'seller':'buyer',source:s.channel,via:'chat history',note:s.msgs.map(m=>(m[0]==='ai'?'GeeVee: ':'Visitor: ')+m[1]).join('\n')});s.contactId=p.id;cwPersist('Contact created from the chat.')});
cwOn('cwChTask',id=>{const s=state.cw.sessions.find(x=>x.id===id);if(!s)return;addTask({title:'Call '+s.name+' from website chat',contactId:s.contactId||'',dealId:'',due:'Today',priority:s.score>=70?'High':'Normal',category:'Call',origin:'GeeVee · chat history'});cwPersist('Call added to Today.')});
