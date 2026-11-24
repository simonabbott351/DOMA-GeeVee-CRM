'use strict';
/* eSign & documents group: /esign, /esign/agreements, /esign/envelope/:id, /esign/authority/:id,
   /esign/contract-of-sale/:id, /esign/document/:id, /documents.
   Signing requests never leave from these pages: "Send for signing" puts a protected (A3) approval on Today.
   When that approval is approved, the envelope moves to In Progress (simulated send). */
const CW_ES_STATUSES=['Draft','In Progress','At Risk','Completed','Void','Deleted'];
function cwEsAll(){return state.cw.esign.agreements}
function cwEsAgr(id,kind){const all=cwEsAll();let a=all.find(x=>x.id===id);if(a)return a;
 const pool=kind?all.filter(x=>x.kind===kind):all;if(/^\d+$/.test(String(id)))return pool[0]||all[0]||null;return null}
function cwEsDeal(a){return a?findD(a.dealId):null}
function cwEsLog(a,what){a.activity=a.activity||[];a.activity.unshift({at:cwNowISO(),what})}
function cwEsDownload(name,text,type='text/plain'){try{const b=new Blob([text],{type});const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Downloaded '+name+'.')}catch(e){toast('Download is not available in this browser.')}}
function cwEsStatusTag(s){return tag(s,({Draft:'',['In Progress']:'blue',['At Risk']:'red',Completed:'green',Void:'outline',Deleted:'outline'})[s]||'')}
/* keep envelopes in step with the approval on Today */
function cwEsSync(){for(const a of cwEsAll()){if(!a.pendingAction)continue;const act=state.actions.find(x=>x.id===a.pendingAction);if(!act)continue;
 if(/^Reviewed/.test(act.status)){a.status='In Progress';a.sentAt=cwNowISO();(a.recipients||[]).forEach(r=>{if(r.status==='Not sent')r.status='Sent'});cwEsLog(a,'Approved on Today by '+CW_ME+'. Sent for signing (simulated, no email left this prototype).');delete a.pendingAction}
 else if(/Rejected|Ignored|Withdrawn/.test(act.status)){cwEsLog(a,'Approval declined on Today. Nothing was sent and nothing was signed.');delete a.pendingAction}}}
function cwEsWaiting(a){return !!a.pendingAction&&state.actions.find(x=>x.id===a.pendingAction)?.status==='Awaiting review'}
function cwEsNeedsMe(a){return a.status==='In Progress'&&(a.recipients||[]).some(r=>r.email===state.cw.profile.email&&r.status!=='Signed')}

/* ---------- send for signing (always via Today) ---------- */
function cwEsQueue(a){const d=cwEsDeal(a);const signers=(a.recipients||[]).filter(r=>r.role!=='CC');
 if(!signers.length){toast('Add at least one signer before sending.');return false}
 if(cwEsWaiting(a)){toast('This envelope is already waiting for your approval on Today.');return false}
 const vendor=d?findP(d.contactId):null;
 const act=addAction({type:'eSign',title:'Send for signing: '+a.title,body:`Send "${a.title}" to ${signers.map(r=>r.name+' ('+r.role+')').join(', ')} for electronic signature.${a.kind==='Authority'?' Check the estimated selling price range, commission and marketing costs before approving.':''}${a.kind==='Contract'?' Check price, deposit, settlement and special conditions before approving.':''}`,contactId:vendor?.id||signers[0]?.contactId||'',dealId:a.dealId||'',tier:(a.kind==='Authority'||a.kind==='Contract')?'A3':'A2',purpose:'Signing request'});
 a.pendingAction=act.id;cwEsLog(a,'Prepared for signing. Waiting for your approval on Today. Nothing has been sent.');persist();return true}

/* ---------- /esign home ---------- */
cwPage('/esign',{title:'eSign home',group:'esign',render(){cwEsSync();
 const all=cwEsAll().filter(a=>a.status!=='Deleted');const aw=all.filter(a=>a.status==='In Progress'),me=all.filter(cwEsNeedsMe),done=all.filter(a=>a.status==='Completed');
 const recent=all.slice().sort((a,b)=>Date.parse(b.created)-Date.parse(a.created)).slice(0,6);
 return `${cwHeader('Welcome, '+h(CW_ME),'Send documents for signature, track progress, and review audit activity, all in one workspace.',cwBtn(ico('file','sm')+' Send a document','cwEsNew','','primary')+cwGoBtn('View all agreements','/esign/agreements'),'eSign')}
 ${cwCard('Overview',`<div class="grid-4">${[['Total docs',all.length,''],['Awaiting signatures',aw.length,'In Progress'],['Needs my signature',me.length,'In Progress'],['Completed',done.length,'Completed']].map(([l,n,f])=>`<button type="button" class="stat cw-stat-btn" data-action="cwEsFilterGo" data-id="${h(f)}"><div class="label">${h(l)}</div><div class="value">${n}</div></button>`).join('')}</div>`)}
 ${cwCard('Recent documents',recent.map(a=>`<div class="list-row"><div class="number-circle">${ico('file','sm')}</div><div class="list-main"><strong>${h(a.title)}</strong><div class="sub">${cwEsStatusTag(a.status)} ${cwEsWaiting(a)?tag('Waiting for your approval on Today','yellow'):''} · created ${cwDate(a.created)}${cwEsDeal(a)?' · '+h(cwEsDeal(a).address):''}</div></div><div class="action-side">${cwEsOpenBtns(a)}</div></div>`).join('')||cwEmpty('No documents yet','Send a document to get started.',cwBtn('Send a document','cwEsNew','','primary')),cwGoBtn('View all','/esign/agreements','sm'))}`},
 ai(){cwEsSync();return cwEsAI()}});
function cwEsOpenBtns(a){const form=a.kind==='Authority'?cwGoBtn('Edit form','/esign/authority/'+a.id,'sm'):a.kind==='Contract'?cwGoBtn('Edit form','/esign/contract-of-sale/'+a.id,'sm'):'';return form+cwGoBtn('Envelope','/esign/envelope/'+a.id,'sm')+cwGoBtn('Details','/esign/document/'+a.id,'sm')}
function cwEsAI(){const all=cwEsAll();const items=[];
 const wait=all.filter(cwEsWaiting);if(wait.length)items.push({k:'check',t:wait.length+' signing request'+(wait.length>1?'s':'')+' waiting for your approval',b:wait.map(a=>h(a.title)).join('<br>')+'<br>Nothing is sent until you approve it on Today.',a:[['Open Today','route','today','primary']]});
 const prog=all.filter(a=>a.status==='In Progress');for(const a of prog.slice(0,2)){const p=(a.recipients||[]).find(r=>r.status!=='Signed'&&r.role!=='CC');if(p)items.push({k:'info',t:'Waiting on '+h(p.name),b:h(a.title)+' was sent '+cwDate(a.sentAt||a.created)+'. GeeVee can prepare a reminder for your approval.',a:[['Draft reminder','cwEsRemind',a.id]]})}
 const risk=all.filter(a=>a.status==='At Risk');if(risk.length)items.push({k:'check',t:risk.length+' at risk',b:risk.map(a=>h(a.title)).join('<br>')+'<br>Signing failed or stalled. Nothing was signed.',a:[['Open','cwGo','/esign/document/'+risk[0].id]]});
 const drafts=all.filter(a=>a.status==='Draft'&&!cwEsWaiting(a));if(drafts.length)items.push({k:'auto',t:drafts.length+' drafts pre-filled from the record',b:'GeeVee filled agent, property, vendor and price details from DOMA. You confirm only the gaps.',a:[['Open first','cwGo',drafts[0].kind==='Contract'?'/esign/contract-of-sale/'+drafts[0].id:drafts[0].kind==='Authority'?'/esign/authority/'+drafts[0].id:'/esign/envelope/'+drafts[0].id]]});
 return items}
cwOn('cwEsFilterGo',f=>{if(f)cwSetF('tab:esagr',f);cwGo('/esign/agreements')});
cwOn('cwEsRemind',id=>{const a=cwEsAgr(id);if(!a)return;const p=(a.recipients||[]).find(r=>r.status!=='Signed'&&r.role!=='CC');if(!p)return toast('Everyone has signed.');addAction({type:'Email',title:'Signing reminder to '+p.name,body:`Hi ${p.name.split(' ')[0]}, a quick reminder that "${a.title}" is ready for your signature. The link in the original email still works. Kind regards, ${CW_ME}`,contactId:p.contactId||'',dealId:a.dealId||'',tier:'A2'});cwEsLog(a,'Reminder to '+p.name+' drafted for approval on Today.');cwPersist('Reminder drafted. Approve it on Today.')});

/* new agreement */
cwOn('cwEsNew',()=>cwModal('cwEsNew'));
cwModalDef('cwEsNew',()=>({title:'New agreement',body:cwForm('cwEsNew',[{n:'kind',l:'Document',t:'select',o:[['Authority','Exclusive Sale Authority'],['Contract','Contract of Sale'],['Other','Other document (upload)']],req:true},{n:'dealId',l:'Property',t:'select',req:true,o:[['','Choose a property'],...cwProps().map(d=>[d.id,d.address+', '+d.suburb])]},{n:'file',l:'Document PDF (other documents)',t:'file',accept:'.pdf'}])+'<p class="hint" style="margin-top:10px">GeeVee pre-fills the form from the property, vendor and agent records.</p>',foot:cwBtn('Cancel','close')+cwBtn('Create draft','cwEsCreate','','primary')}));
cwOn('cwEsCreate',()=>{const v=cwRead('cwEsNew',[{n:'kind',l:'Document',t:'select',req:true},{n:'dealId',l:'Property',t:'select',req:true},{n:'file',l:'File',t:'file'}]);if(!v)return;const d=findD(v.dealId);
 const name=v.kind==='Authority'?'Exclusive Sale Authority - '+d.address:v.kind==='Contract'?'Contract of Sale - '+d.address:(v.file[0]||'Document')+' - '+d.address;
 const a={id:cwId('AGR'),title:name,kind:v.kind,dealId:d.id,status:'Draft',created:cwNowISO(),recipients:[],fields:[],activity:[],formId:(v.kind==='Authority'?'AUTH-':'COS-')+d.id,file:v.file[0]||''};
 cwEsLog(a,'Draft created from the property record by '+CW_ME);cwEsAll().unshift(a);audit('esign','Agreement drafted: '+name,'Created on eSign. Nothing sent.');ui.modal=null;persist();
 cwGo(v.kind==='Authority'?'/esign/authority/'+a.id:v.kind==='Contract'?'/esign/contract-of-sale/'+a.id:'/esign/envelope/'+a.id)});

/* ---------- /esign/agreements ---------- */
cwPage('/esign/agreements',{title:'Agreements',group:'esign',render(){cwEsSync();
 const all=cwEsAll(),tab=cwTab('esagr','All'),q=cwF('esagr:q',''),from=cwF('esagr:from',''),to=cwF('esagr:to',''),mine=!cwF('esagr:all',false),sort=cwF('esagr:sort','new');
 const cnt=s=>s==='All'?all.filter(a=>a.status!=='Deleted').length:all.filter(a=>a.status===s).length;
 let list=all.filter(a=>tab==='All'?a.status!=='Deleted':a.status===tab);
 if(mine)list=list.filter(a=>!cwEsDeal(a)||(cwEsDeal(a).owner||CW_ME)===CW_ME);
 if(from)list=list.filter(a=>cwLocalDay(a.created)>=from);if(to)list=list.filter(a=>cwLocalDay(a.created)<=to);
 list=cwSearchRows(list,q,a=>a.title+' '+(cwEsDeal(a)?.address||'')+' '+(a.recipients||[]).map(r=>r.name).join(' '));
 list.sort((a,b)=>(Date.parse(b.created)-Date.parse(a.created))*(sort==='new'?1:-1));
 return `${cwHeader('My Agreements','Send documents for electronic signature.',cwBtn(ico('file','sm')+' New agreement','cwEsNew','','primary'),'eSign')}
 ${cwTabs('esagr',[['All','All agreements',cnt('All')],['Draft','Drafts',cnt('Draft')],['In Progress','In Progress',cnt('In Progress')],['At Risk','At Risk',cnt('At Risk')],['Completed','Completed',cnt('Completed')],['Void','Void',cnt('Void')],['Deleted','Deleted',cnt('Deleted')]])}
 <div class="toolbar">${cwInput('esagr:q','Search agreements, properties or signers')}${cwSelect('esagr:sort',[['new','Newest to oldest'],['old','Oldest to newest']],{label:'Sort'})}<label class="tiny muted">From ${cwInput('esagr:from','',{type:'date',cls:'',label:'From date'})}</label><label class="tiny muted">To ${cwInput('esagr:to','',{type:'date',cls:'',label:'To date'})}</label>${cwCheck('esagr:all','All agents')}</div>
 ${cwTable('esagr',[['Agreement',a=>`${cwLink('<b>'+h(a.title)+'</b>','/esign/document/'+a.id)}<div class="tiny muted">${h(a.kind)}</div>`,a=>a.title],['Property',a=>cwEsDeal(a)?cwLink(h(cwEsDeal(a).address),'/properties/'+a.dealId):(a.pmId&&typeof cwPmS==='function'&&cwPmS().rentals.find(r=>r.id===a.pmId)?cwLink(h(cwPmS().rentals.find(r=>r.id===a.pmId).address),'/rentals'):'<span class="muted">None</span>')],['Signers',a=>(a.recipients||[]).filter(r=>r.role!=='CC').map(r=>h(r.name)+' '+tag(r.status,r.status==='Signed'?'green':r.status==='Sent'?'blue':'')).join('<br>')||'<span class="muted">No signers</span>'],['Status',a=>cwEsStatusTag(a.status)+(cwEsWaiting(a)?' '+tag('Approval on Today','yellow'):''),a=>a.status],['Created',a=>cwDate(a.created),a=>a.created],['',a=>`<div class="cw-row">${a.status==='Deleted'?cwBtn('Restore','cwEsRestore',a.id,'sm'):cwEsOpenBtns(a)}</div>`]],list,{select:true,key:a=>a.id,empty:'No agreements here',emptyActions:cwBtn('New agreement','cwEsNew','','primary'),bulk:s=>cwBtn('Delete','cwEsBulkDel','','sm warn')})}`},
 ai(){cwEsSync();return cwEsAI()}});
cwOn('cwEsRestore',id=>{const a=cwEsAgr(id);if(!a)return;a.status=a.prevStatus||'Draft';cwEsLog(a,'Restored from Deleted');cwPersist('Agreement restored.')});
cwOn('cwEsBulkDel',()=>{const s=cwSel('esagr');cwEsAll().filter(a=>s.includes(a.id)).forEach(a=>{if(a.status==='Completed')return;a.prevStatus=a.status;a.status='Deleted';cwEsLog(a,'Moved to Deleted')});cwU().sel.esagr=[];cwPersist('Moved to Deleted. Completed agreements are kept.')});

/* ---------- /esign/envelope/:id ---------- */
cwPage('/esign/envelope/:id',{title:ctx=>cwEsAgr(ctx.params.id)?.title||'Envelope',group:'esign',render(ctx){cwEsSync();const a=cwEsAgr(ctx.params.id);if(!a)return cwEmpty('Envelope not found','',cwGoBtn('Agreements','/esign/agreements','primary'));
 const locked=a.status!=='Draft'||cwEsWaiting(a);const rs=(a.recipients||[]).slice().sort((x,y)=>x.order-y.order);
 return `${cwHeader(h(a.title),'Envelope editor. Add the people who sign, then place their fields.',`${cwGoBtn('Back','/esign/agreements')}${cwGoBtn('Details','/esign/document/'+a.id)}${locked?'':cwBtn('Send for signing','cwEsSend',a.id,'primary')}`,'eSign')}
 ${locked?cwNote(cwEsWaiting(a)?'Waiting for your approval on Today. Nothing has been sent.':'This envelope is '+h(a.status)+'. Recipients and fields can no longer change.',cwEsWaiting(a)?'warn':'info'):''}
 ${a.file?cwNote('Document: <b>'+h(a.file)+'</b>'):''}
 <div class="cw-two">
 ${cwCard('Recipient',rs.map(r=>`<div class="list-row"><div class="number-circle">${r.order}</div><div class="list-main"><strong>${h(r.name)}</strong><div class="sub">${h(r.email)} · ${h(r.role)} · ${tag(r.status,r.status==='Signed'?'green':'')}</div></div>${locked?'':cwBtn('Remove','cwEsRecDel',a.id+'|'+r.id,'sm ghost')}</div>`).join('')||cwEmpty('No signers on this document.','Add the vendor, purchaser or anyone who needs a copy.'),locked?'':cwBtn('Add recipient','cwEsRecNew',a.id,'sm primary'))}
 ${cwCard('Fields',(a.fields||[]).map(f=>{const r=rs.find(x=>x.id===f.recipient);return `<div class="list-row"><div class="number-circle">${ico(f.type==='Signature'?'edit':'file','sm')}</div><div class="list-main"><strong>${h(f.type)}${f.label?': '+h(f.label):''}</strong><div class="sub">Page ${h(f.page)} · ${r?h(r.name):'<span class="muted">Unassigned</span>'}${f.required?' · required':''}</div></div>${locked?'':cwBtn('Remove','cwEsFieldDel',a.id+'|'+f.id,'sm ghost')}</div>`}).join('')||cwEmpty('No fields placed','Each signer needs at least a signature field.'),locked?'':`<div class="cw-row">${cwBtn('Add field','cwEsFieldNew',a.id,'sm primary')}${rs.length?cwBtn('Auto-place','cwEsAutoFields',a.id,'sm'):''}</div>`)}
 </div>`},
 ai(ctx){const a=cwEsAgr(ctx.params.id);if(!a)return[];const d=cwEsDeal(a),rs=a.recipients||[],items=[];
  const missing=rs.filter(r=>r.role==='Signer'&&!(a.fields||[]).some(f=>f.recipient===r.id&&f.type==='Signature'));
  if(d&&!rs.some(r=>r.contactId===d.contactId)&&a.status==='Draft')items.push({k:'draft',t:'Add the vendor from the record',b:h(cwPName(d.contactId))+' is the owner of '+h(d.address)+'.',a:[['Add '+h(cwPName(d.contactId).split(' ')[0]),'cwEsAddVendor',a.id,'primary']]});
  if(missing.length)items.push({k:'check',t:missing.length+' signer'+(missing.length>1?'s have':' has')+' no signature field',b:missing.map(r=>h(r.name)).join(', '),a:[['Auto-place fields','cwEsAutoFields',a.id]]});
  items.push({k:'info',t:'Sending is protected',b:'Send for signing puts a protected approval on Today. You check the full document and terms there before anything goes out.'});return items}});
const CW_ES_REC_FIELDS=[{n:'contactId',l:'From contacts',t:'select',o:[]},{n:'name',l:'Full name',ph:'Leave blank to use the contact'},{n:'email',l:'Email',t:'email'},{n:'role',l:'Role',t:'select',o:['Signer','Approver','CC'],req:true},{n:'order',l:'Signing order',t:'number',min:1}];
function cwEsRecFields(){return CW_ES_REC_FIELDS.map(f=>f.n==='contactId'?{...f,o:[['','Someone else'],...cwContacts().map(p=>[p.id,p.name])]}:f)}
cwOn('cwEsRecNew',id=>cwModal('cwEsRec',id));
cwModalDef('cwEsRec',id=>{const a=cwEsAgr(id);return{title:'Add recipient',body:cwForm('cwEsRec',cwEsRecFields(),{role:'Signer',order:(a?.recipients||[]).length+1}),foot:cwBtn('Cancel','close')+cwBtn('Add recipient','cwEsRecSave',id,'primary')}});
function cwEsAddRecipient(a,o){a.recipients=a.recipients||[];const r={id:cwId('RC'),contactId:o.contactId||'',name:o.name,email:o.email||'',role:o.role||'Signer',order:Number(o.order)||a.recipients.length+1,status:'Not sent'};a.recipients.push(r);cwEsLog(a,'Recipient added: '+r.name+' ('+r.role+')');return r}
cwOn('cwEsRecSave',id=>{const a=cwEsAgr(id);const v=cwRead('cwEsRec',cwEsRecFields());if(!v||!a)return;const p=v.contactId?findP(v.contactId):null;const name=v.name||p?.name;const email=v.email||p?.email;
 if(!name){cwU().err.cwEsRec={name:'Choose a contact or enter a name.'};cwU().draft.cwEsRec=v;render();return}
 if(!email){cwU().err.cwEsRec={email:'An email is needed to send the signing link.'};cwU().draft.cwEsRec=v;render();return}
 cwEsAddRecipient(a,{...v,name,email});ui.modal=null;cwPersist('Recipient added.')});
cwOn('cwEsAddVendor',id=>{const a=cwEsAgr(id);const d=cwEsDeal(a);const p=d&&findP(d.contactId);if(!p)return;cwEsAddRecipient(a,{contactId:p.id,name:p.name,email:p.email,role:'Signer'});cwPersist(p.name+' added as a signer.')});
cwOn('cwEsRecDel',x=>{const [id,rid]=x.split('|');const a=cwEsAgr(id);if(!a)return;const r=a.recipients.find(y=>y.id===rid);a.recipients=a.recipients.filter(y=>y.id!==rid);a.fields=(a.fields||[]).filter(f=>f.recipient!==rid);cwEsLog(a,'Recipient removed: '+(r?.name||''));cwPersist('Recipient removed.')});
cwOn('cwEsFieldNew',id=>cwModal('cwEsField',id));
function cwEsFieldFields(a){return[{n:'type',l:'Field',t:'select',o:['Signature','Initials','Date signed','Text'],req:true},{n:'recipient',l:'For',t:'select',req:true,o:[['','Choose a recipient'],...(a?.recipients||[]).filter(r=>r.role!=='CC').map(r=>[r.id,r.name])]},{n:'page',l:'Page',t:'number',min:1,req:true},{n:'label',l:'Label (text fields)'},{n:'required',l:'Required',t:'check'}]}
cwModalDef('cwEsField',id=>{const a=cwEsAgr(id);return{title:'Add field',body:cwForm('cwEsField',cwEsFieldFields(a),{type:'Signature',page:1,required:true}),foot:cwBtn('Cancel','close')+cwBtn('Add field','cwEsFieldSave',id,'primary')}});
cwOn('cwEsFieldSave',id=>{const a=cwEsAgr(id);const v=cwRead('cwEsField',cwEsFieldFields(a));if(!v||!a)return;a.fields=a.fields||[];a.fields.push({id:cwId('FD'),...v});cwEsLog(a,'Field placed: '+v.type+' on page '+v.page);ui.modal=null;cwPersist('Field added.')});
cwOn('cwEsFieldDel',x=>{const [id,fid]=x.split('|');const a=cwEsAgr(id);if(!a)return;a.fields=a.fields.filter(f=>f.id!==fid);cwPersist('Field removed.')});
cwOn('cwEsAutoFields',id=>{const a=cwEsAgr(id);if(!a)return;a.fields=a.fields||[];let n=0;const last=a.kind==='Authority'?6:a.kind==='Contract'?9:1;
 for(const r of (a.recipients||[]).filter(r=>r.role!=='CC')){for(const [type,page] of [['Initials',1],['Signature',last],['Date signed',last]]){if(!a.fields.some(f=>f.recipient===r.id&&f.type===type)){a.fields.push({id:cwId('FD'),type,recipient:r.id,page,label:'',required:true});n++}}}
 cwEsLog(a,'GeeVee placed '+n+' fields on the standard pages');audit('auto','GeeVee placed signing fields',a.title);cwPersist(n?n+' fields placed. Check them before sending.':'Every signer already has fields.')});
cwOn('cwEsSend',id=>{const a=cwEsAgr(id);if(!a)return;const rs=(a.recipients||[]).filter(r=>r.role!=='CC');const nosig=rs.filter(r=>!(a.fields||[]).some(f=>f.recipient===r.id&&f.type==='Signature'));
 if(nosig.length)return toast(nosig.map(r=>r.name).join(', ')+' needs a signature field first.');
 if(a.kind==='Authority'){const g=cwEsAuthGaps(a);if(g.length)return toast('Complete the authority first: '+g.slice(0,3).join(', ')+(g.length>3?' and more':'')+'.')}
 if(cwEsQueue(a))cwPersist('Ready for approval on Today. Nothing has been sent.')});

/* ---------- /esign/document/:id ---------- */
cwPage('/esign/document/:id',{title:ctx=>cwEsAgr(ctx.params.id)?.title||'Envelope detail',group:'esign',render(ctx){cwEsSync();const a=cwEsAgr(ctx.params.id);if(!a)return cwEmpty('Envelope not found','',cwGoBtn('Agreements','/esign/agreements','primary'));const d=cwEsDeal(a);
 const canSim=a.status==='In Progress'||a.status==='At Risk';
 return `${cwHeader(h(a.title),cwEsStatusTag(a.status)+(cwEsWaiting(a)?' '+tag('Waiting for your approval on Today','yellow'):'')+(d?' · '+h(cwAddr(d)):''),`${cwGoBtn('Back to agreements','/esign/agreements')}${cwBtn('Download','cwEsDl',a.id)}${['Void','Deleted','Completed'].includes(a.status)?'':cwBtn('Void','cwEsVoid',a.id,'warn')}${a.status==='Draft'?cwGoBtn('Edit envelope','/esign/envelope/'+a.id,'primary'):''}`,'eSign')}
 ${cwKV([['Document',h(a.kind)],['Property',d?cwLink(h(d.address),'/properties/'+d.id):(a.pmId&&typeof cwPmS==='function'&&cwPmS().rentals.find(r=>r.id===a.pmId)?cwLink(h(cwPmS().rentals.find(r=>r.id===a.pmId).address),'/rentals'):'Not linked')],['Created',cwDateTime(a.created)],['Sent',a.sentAt?cwDateTime(a.sentAt):''],['Completed',a.completedAt?cwDateTime(a.completedAt):'']])}
 <div class="cw-two">
 ${cwCard('Recipients',(a.recipients||[]).slice().sort((x,y)=>x.order-y.order).map(r=>`<div class="list-row">${cwAvatar(r.name)}<div class="list-main"><strong>${h(r.name)}</strong><div class="sub">${h(r.email)} · ${h(r.role)} ${r.order?' · order '+r.order:''}</div></div>${tag(r.status,r.status==='Signed'?'green':r.status==='Sent'?'blue':r.status==='Failed'?'red':'')}</div>`).join('')||cwEmpty('No signers.'),canSim?`<div class="cw-row">${cwBtn('Demo: next signer signs','cwEsSimSign',a.id,'sm')}${cwBtn('Demo: signing fails','cwEsSimFail',a.id,'sm ghost')}</div>`:'')}
 ${cwCard('Activity',`<div class="cw-timeline">${(a.activity||[]).map(x=>`<div class="cw-tl"><span class="cw-tl-dot"></span><div><b>${h(x.what)}</b><small>${cwDateTime(x.at)}</small></div></div>`).join('')||cwEmpty('No activity yet.')}</div>`)}
 </div>`},
 ai(ctx){const a=cwEsAgr(ctx.params.id);if(!a)return[];const items=[];
  if(a.status==='At Risk')items.push({k:'check',t:'Signing failed',b:'Nothing was signed. Fix the recipient details and send again from the envelope. It goes back to Today for approval.',a:[['Retry','cwEsRetry',a.id,'primary']]});
  if(a.status==='In Progress'){const p=(a.recipients||[]).find(r=>r.status!=='Signed'&&r.role!=='CC');if(p)items.push({k:'draft',t:'Remind '+h(p.name),b:'GeeVee drafts a short reminder. You approve it on Today.',a:[['Draft reminder','cwEsRemind',a.id]]})}
  if(a.status==='Completed'&&a.kind==='Authority')items.push({k:'auto',t:'Compliance updated',b:'The signed sales authority is ticked on the property compliance checklist.'});
  if(a.status==='Draft')items.push({k:'info',t:'Not sent yet',b:cwEsWaiting(a)?'Waiting for your approval on Today.':'Edit the envelope, then send for signing. Sending is a protected approval.'});
  return items}});
cwOn('cwEsDl',id=>{const a=cwEsAgr(id);if(!a)return;const d=cwEsDeal(a);const form=state.cw.esign.forms[a.formId]||{};
 const txt=[a.title,'Status: '+a.status,'Property: '+(d?cwAddr(d):'None'),'Created: '+cwDateTime(a.created),'','Recipients:',...(a.recipients||[]).map(r=>` - ${r.name} <${r.email}> ${r.role}, ${r.status}`),'','Form details:',...Object.entries(form).filter(([,v])=>v!==''&&v!==false).map(([k,v])=>` - ${k}: ${v}`),'','Activity:',...(a.activity||[]).map(x=>` - ${cwDateTime(x.at)}: ${x.what}`),'','Prototype summary. Not a signed document.'].join('\n');
 cwEsDownload(a.title.replace(/[^a-z0-9]+/gi,'-')+'.txt',txt)});
cwOn('cwEsVoid',id=>cwConfirm('Void this envelope?','Signers can no longer sign it. Signatures already collected stay in the history. This cannot be undone.','cwEsVoidYes',id,'Void','warn'));
cwOn('cwEsVoidYes',id=>{const a=cwEsAgr(id);if(!a)return;a.status='Void';(a.recipients||[]).forEach(r=>{if(r.status!=='Signed')r.status='Voided'});cwEsLog(a,'Voided by '+CW_ME);audit('esign','Envelope voided: '+a.title,'Voided on eSign.');ui.modal=null;cwPersist('Envelope voided.')});
cwOn('cwEsSimSign',id=>{const a=cwEsAgr(id);if(!a)return;if(a.status==='Draft'||cwEsWaiting(a))return toast('Not sent yet. Approve it on Today first; nothing can be signed before that.');const r=(a.recipients||[]).filter(x=>x.role!=='CC'&&x.status!=='Signed').sort((x,y)=>x.order-y.order)[0];if(!r)return toast('Everyone has signed.');
 r.status='Signed';r.signedAt=cwNowISO();if(a.status==='At Risk')a.status='In Progress';cwEsLog(a,r.name+' signed (demo)');
 if((a.recipients||[]).filter(x=>x.role!=='CC').every(x=>x.status==='Signed')){a.status='Completed';a.completedAt=cwNowISO();cwEsLog(a,'All parties signed. Completed.');const d=cwEsDeal(a);
  if(d&&a.kind==='Authority'){d.compliance=d.compliance||{};d.compliance['Signed sales authority']=true;cwPropActivity(d,'Sales authority signed by all parties');audit('esign','Sales authority completed: '+d.address,'Compliance checklist updated.')}
  if(d&&a.kind==='Contract'){cwPropActivity(d,'Contract of Sale signed by all parties');audit('esign','Contract signed: '+d.address,'The sold price must be published in the Property Price Statement within 7 days of the sale going unconditional.');if(!state.tasks.some(t=>/^Publish (the )?sold price/i.test(t.title)&&t.dealId===d.id))addTask({title:'Publish sold price: '+d.address,contactId:d.contactId,dealId:d.id,due:'Within 7 days of unconditional',priority:'High',category:'Admin',origin:'Victorian rule: sold price in the Property Price Statement'})}}
 cwPersist(r.name+' signed.')});
cwOn('cwEsSimFail',id=>{const a=cwEsAgr(id);if(!a)return;const r=(a.recipients||[]).find(x=>x.role!=='CC'&&x.status!=='Signed');if(r)r.status='Failed';a.status='At Risk';cwEsLog(a,'Signing failed for '+(r?.name||'a signer')+'. Nothing was signed.');cwPersist('Signing failed. Nothing was signed.')});
cwOn('cwEsRetry',id=>{const a=cwEsAgr(id);if(!a)return;(a.recipients||[]).forEach(r=>{if(r.status==='Failed')r.status='Not sent'});a.status='Draft';cwEsLog(a,'Reset for a new send after a failure');persist();cwGo('/esign/envelope/'+a.id)});

/* ---------- authority form ---------- */
const CW_ES_AUTH=[
 ['agent','Agent',[{n:'agencyName',l:'Agency name',req:true},{n:'acn',l:'ACN'},{n:'agencyAddress',l:'Agency address',req:true,full:true},{n:'agentName',l:'Listing agent (attention)',req:true},{n:'agentPhone',l:'Phone',t:'tel'},{n:'agentMobile',l:'Mobile',t:'tel',req:true},{n:'agentEmail',l:'Email',t:'email',req:true}]],
 ['property','Property for sale',[{n:'address',l:'Property address',req:true,full:true},{n:'title',l:'Certificate of title (volume / folio)',ph:'Vol 1234 Fol 567'},{n:'propType',l:'Property type',t:'select',o:['House','Townhouse','Unit','Apartment','Land']},{n:'chattels',l:'Chattels included',full:true}]],
 ['vendor','Vendor',[{n:'vendorName',l:'Vendor full name',req:true},{n:'vendorPhone',l:'Vendor mobile',t:'tel',req:true},{n:'vendorEmail',l:'Vendor email',t:'email',req:true},{n:'vendorAddress',l:'Vendor postal address',full:true},{n:'vendor2',l:'Second vendor (if any)'}]],
 ['bank','Banking details',[{n:'bankName',l:'Account name'},{n:'bsb',l:'BSB'},{n:'acct',l:'Account number'}]],
 ['body','Body corporate',[{n:'bcApplies',l:'Owners corporation applies',t:'check'},{n:'bcName',l:'Owners corporation manager'},{n:'bcFees',l:'Annual fees ($)',t:'number'}]],
 ['legal','Legal representation',[{n:'lawyer',l:'Vendor conveyancer or lawyer',req:true},{n:'lawyerEmail',l:'Conveyancer email',t:'email'},{n:'lawyerPhone',l:'Conveyancer phone',t:'tel'}]],
 ['terms','Sale terms',[{n:'method',l:'Method of sale',t:'select',o:['Private Sale','Auction'],req:true},{n:'priceLow',l:'Estimated selling price, lower ($)',t:'number',req:true},{n:'priceHigh',l:'Estimated selling price, upper ($)',t:'number',req:true,help:'Victoria: the range can be at most 10% above the lower figure.'},{n:'vendorPrice',l:'Vendor asking or reserve price ($)',t:'number'},{n:'authorityDays',l:'Exclusive authority period (days)',t:'number',req:true},{n:'continuing',l:'Continuing period (days)',t:'number'}]],
 ['fees','Agent\'s fees & costs',[{n:'commType',l:'Commission type',t:'radio',o:['Percentage','Fixed Amount'],req:true},{n:'commRate',l:'Commission rate (%) or amount ($)',t:'number',req:true},{n:'gst',l:'GST',t:'radio',o:['Inclusive of GST','Plus GST'],req:true},{n:'marketing',l:'Marketing costs ($)',t:'number',req:true,help:'State marketing and advertising costs in full.'},{n:'marketingWhen',l:'Marketing paid',t:'select',o:['Upfront','At settlement','Upfront, refunded if not sold']},{n:'otherCosts',l:'Other costs',full:true}]]
];
function cwEsAuthFields(){return CW_ES_AUTH.flatMap(s=>s[2])}
function cwEsAuthPrefill(a){const d=cwEsDeal(a)||{},x=d.id?cwDX(d):{},p=d.contactId?findP(d.contactId):null,px=p?cwPX(p):{},ag=state.cw.agents.find(g=>g.name===(d.owner||CW_ME))||state.cw.agents[0];
 return{agencyName:'Collings Real Estate',acn:'',agencyAddress:ag?.address?ag.address+', VIC':'',agentName:ag?.name||CW_ME,agentPhone:'',agentMobile:ag?.phone||'',agentEmail:ag?.email||'',
  address:d.id?cwAddr(d):'',title:'',propType:x.type||'',chattels:x.internal||'',
  vendorName:p?.name||'',vendorPhone:p?.phone||'',vendorEmail:p?.email||'',vendorAddress:px.street?`${px.street}, ${px.city} ${px.state} ${px.postcode}`:'',vendor2:'',
  bankName:'',bsb:'',acct:'',bcApplies:x.type==='Unit'||x.type==='Apartment',bcName:'',bcFees:'',lawyer:'',lawyerEmail:'',lawyerPhone:'',
  method:x.method||'Private Sale',priceLow:x.priceLow||'',priceHigh:x.priceHigh||'',vendorPrice:'',authorityDays:90,continuing:60,
  commType:x.commission?.kind||'Percentage',commRate:x.commission?.rate??d.fee??'',gst:x.commission?.gst||'Plus GST',marketing:'',marketingWhen:'Upfront',otherCosts:''}}
function cwEsAuthVals(a){const f=state.cw.esign.forms;if(!f[a.formId])f[a.formId]={...cwEsAuthPrefill(a),_pre:Object.entries(cwEsAuthPrefill(a)).filter(([,v])=>v!==''&&v!==false).map(([k])=>k)};return f[a.formId]}
function cwEsAuthGaps(a){const v=cwEsAuthVals(a);const g=cwEsAuthFields().filter(f=>f.req&&(v[f.n]===''||v[f.n]===undefined||v[f.n]===null)).map(f=>f.l);const pc=cwEsPriceCheck(v);if(pc)g.push(pc);return g}
function cwEsPriceCheck(v){const lo=Number(v.priceLow),hi=Number(v.priceHigh),vp=Number(v.vendorPrice);if(!lo||!hi)return '';if(hi<lo)return 'Upper price is below the lower price';if(hi>lo*1.1)return 'Price range is more than 10% ('+cwMoney(lo)+' to '+cwMoney(hi)+')';if(vp&&lo<vp)return 'Lower estimate is below the vendor asking price';return ''}
function cwEsSoftRead(fid,fields){const root=document.querySelector(`[data-cwform="${fid}"]`);if(!root)return null;const v={};for(const f of fields){const el=root.querySelector(`[name="${f.n}"]`);if(!el)continue;v[f.n]=f.t==='check'?!!el.checked:f.t==='radio'?(root.querySelector(`[name="${f.n}"]:checked`)?.value||''):f.t==='file'?[...(el.files||[])].map(x=>x.name):String(el.value||'').trim()}return v}
cwPage('/esign/authority/:id',{title:ctx=>cwEsAgr(ctx.params.id,'Authority')?.title||'Authority form',group:'esign',render(ctx){cwEsSync();const a=cwEsAgr(ctx.params.id,'Authority');if(!a)return cwEmpty('Authority not found','',cwBtn('New agreement','cwEsNew','','primary'));
 const v=cwEsAuthVals(a),sec=cwF('cwEsSec:'+a.id,'agent'),locked=a.status!=='Draft'||cwEsWaiting(a);
 const counts=CW_ES_AUTH.map(([k,l,fs])=>[k,l,fs.filter(f=>f.req&&(v[f.n]===''||v[f.n]===undefined)).length]);
 const pre=new Set(v._pre||[]);
 const nav=`<div class="cw-vtabs">${counts.map(([k,l,n])=>`<button type="button" class="${sec===k?'on':''}" data-action="cwEsSec" data-id="${h(a.id+'|'+k)}"><span>${h(l)}</span>${n?tag(n+' to do','yellow'):tag('Done','green')}</button>`).join('')}<button type="button" class="${sec==='review'?'on':''}" data-action="cwEsSec" data-id="${h(a.id+'|review')}"><span>Review & send</span></button></div>`;
 let body;
 if(sec==='review'){const gaps=cwEsAuthGaps(a);body=cwCard('Review & send',`${gaps.length?cwNote('<b>Still to confirm:</b><br>'+gaps.map(h).join('<br>'),'warn'):cwNote('Everything required is filled in and the price range passes the Victorian 10% rule.','ok')}<div class="sep"></div>${cwKV([['Property',h(v.address)],['Vendor',h(v.vendorName)],['Method',h(v.method)],['Estimated selling price',v.priceLow&&v.priceHigh?cwMoney(v.priceLow)+' to '+cwMoney(v.priceHigh):''],['Commission',v.commRate?h(v.commRate)+(v.commType==='Percentage'?'%':' $')+' '+h(v.gst):''],['Marketing',v.marketing!==''?cwMoney(v.marketing)+' '+h(v.marketingWhen):''],['Authority period',v.authorityDays?h(v.authorityDays)+' days':'']])}`,locked?'':`<div class="cw-row">${cwGoBtn('Envelope','/esign/envelope/'+a.id,'sm')}${cwBtn('Send for signing','cwEsAuthSend',a.id,'sm primary')}</div>`)}
 else{const s=CW_ES_AUTH.find(x=>x[0]===sec)||CW_ES_AUTH[0];const fs=s[2].map(f=>pre.has(f.n)&&v[f.n]!==''?{...f,help:'Pre-filled by GeeVee from the record. Check it.'}:f);
  body=cwCard(h(s[1]),(locked?'<fieldset disabled style="border:0;padding:0;margin:0">':'')+cwForm('cwEsAuth-'+s[0],fs,v)+(locked?'</fieldset>':''),locked?'':`<div class="cw-row">${cwBtn('Save','cwEsAuthSave',a.id+'|'+s[0]+'|stay','sm')}${cwBtn('Save & next','cwEsAuthSave',a.id+'|'+s[0]+'|next','sm primary')}</div>`)}
 return `${cwHeader(h(a.title),'Exclusive Sale Authority. GeeVee pre-filled what DOMA already knows. You confirm only the gaps.',`${cwGoBtn('Back','/esign/agreements')}${cwGoBtn('Details','/esign/document/'+a.id)}`,'eSign')}
 ${locked?cwNote(cwEsWaiting(a)?'Waiting for your approval on Today. The form is locked until then.':'This authority is '+h(a.status)+'. The form is read-only.',cwEsWaiting(a)?'warn':'info'):''}
 <div class="cw-side">${nav}<div>${body}</div></div>`},
 ai(ctx){const a=cwEsAgr(ctx.params.id,'Authority');if(!a)return[];const v=cwEsAuthVals(a);const gaps=cwEsAuthFields().filter(f=>f.req&&(v[f.n]===''||v[f.n]===undefined));const pc=cwEsPriceCheck(v);
  return[{k:'auto',t:(v._pre||[]).length+' fields pre-filled',b:'From the property, vendor contact and agent records. Each is marked so you can check it.'},
   gaps.length?{k:'check',t:gaps.length+' gaps GeeVee could not fill',b:gaps.map(f=>h(f.l)).join('<br>')+'<br>These are not in DOMA. Ask the vendor or add them here.'}:{k:'info',t:'No gaps left'},
   pc?{k:'check',t:'Victorian price check',b:h(pc)+'. The authority cannot be sent until this is fixed.'}:{k:'info',t:'Price range passes',b:'Range is within 10% and not below the vendor price.'},
   {k:'info',t:'Commission and marketing stated',b:'Victoria requires the commission and every marketing cost to be stated in the authority before the vendor signs.'}]}});
cwOn('cwEsSec',x=>{const [id,k]=x.split('|');const a=cwEsAgr(id,'Authority');if(a&&a.status==='Draft'&&!cwEsWaiting(a)){const cur=cwF('cwEsSec:'+id,'agent');const s=CW_ES_AUTH.find(z=>z[0]===cur);if(s){const v=cwEsSoftRead('cwEsAuth-'+cur,s[2]);if(v){Object.assign(cwEsAuthVals(a),v);persist()}}}cwSetF('cwEsSec:'+id,k);render()});
cwOn('cwEsAuthSave',x=>{const [id,k,mode]=x.split('|');const a=cwEsAgr(id,'Authority');const s=CW_ES_AUTH.find(z=>z[0]===k);if(!a||!s)return;const v=cwRead('cwEsAuth-'+k,s[2]);if(!v)return;
 if(k==='terms'){const pc=cwEsPriceCheck(v);if(pc){cwU().draft['cwEsAuth-'+k]=v;cwU().err['cwEsAuth-'+k]={priceHigh:pc+'.'};render();toast(pc+'.');return}}
 Object.assign(cwEsAuthVals(a),v);cwEsLog(a,s[1]+' section saved');
 if(mode==='next'){const i=CW_ES_AUTH.findIndex(z=>z[0]===k);cwSetF('cwEsSec:'+id,CW_ES_AUTH[i+1]?.[0]||'review')}
 cwPersist(s[1]+' saved.')});
cwOn('cwEsAuthSend',id=>{const a=cwEsAgr(id,'Authority');if(!a)return;const g=cwEsAuthGaps(a);if(g.length)return toast('Still to confirm: '+g.slice(0,3).join(', ')+(g.length>3?' and more':'')+'.');
 const v=cwEsAuthVals(a);if(!(a.recipients||[]).length){const d=cwEsDeal(a);const p=d&&findP(d.contactId);cwEsAddRecipient(a,{contactId:p?.id||'',name:v.vendorName,email:v.vendorEmail,role:'Signer'});cwEsAddRecipient(a,{name:v.agentName,email:v.agentEmail,role:'Signer'})}
 for(const r of a.recipients.filter(r=>r.role!=='CC'))if(!(a.fields||[]).some(f=>f.recipient===r.id&&f.type==='Signature')){a.fields=a.fields||[];a.fields.push({id:cwId('FD'),type:'Signature',recipient:r.id,page:6,label:'',required:true},{id:cwId('FD'),type:'Date signed',recipient:r.id,page:6,label:'',required:true})}
 if(cwEsQueue(a))cwPersist('Authority ready for your approval on Today. Nothing has been sent.')});

/* ---------- contract of sale form ---------- */
const CW_ES_COS=[
 ['property','Property',[{n:'address',l:'Address of the property being sold',req:true,full:true},{n:'titleRef',l:'Title reference'},{n:'vendorName',l:'Vendor',req:true}]],
 ['purchaser','Purchaser',[{n:'buyerName',l:'Purchaser full name',req:true},{n:'buyer2',l:'Second purchaser'},{n:'nominee',l:'Purchaser may nominate a substitute',t:'check'}]],
 ['pcontact','Purchaser contact',[{n:'buyerEmail',l:'Email',t:'email',req:true},{n:'buyerPhone',l:'Mobile',t:'tel',req:true},{n:'buyerAddress',l:'Postal address',full:true}]],
 ['legal','Legal representation',[{n:'buyerLawyer',l:'Purchaser conveyancer',req:true},{n:'vendorLawyer',l:'Vendor conveyancer'}]],
 ['payment','Payment',[{n:'price',l:'Price ($)',t:'number',req:true},{n:'deposit',l:'Deposit',req:true,ph:'10%'},{n:'depositDue',l:'Deposit due',t:'date'},{n:'balance',l:'Balance payable at settlement',t:'check'}]],
 ['settlement','Settlement',[{n:'settlement',l:'Settlement',req:true,ph:'60 days'},{n:'settleDate',l:'Settlement date',t:'date'}]],
 ['conditions','Conditions of Contract',[{n:'finance',l:'Finance condition',ph:'Subject to finance, 14 days'},{n:'inspection',l:'Building and pest condition'},{n:'other',l:'Other conditions',full:true}]],
 ['special','Special conditions',[{n:'special',l:'Special conditions',t:'textarea',full:true},{n:'pdf',l:'Upload contract PDF',t:'file',accept:'.pdf'}]]
];
function cwEsCosFields(){return CW_ES_COS.flatMap(s=>s[2])}
function cwEsOffer(d){const os=(state.offers||[]).filter(o=>o.dealId===d?.id);return os.find(o=>/accept/i.test(o.status))||os[0]||null}
function cwEsCosVals(a){const f=state.cw.esign.forms;if(f[a.formId])return f[a.formId];const d=cwEsDeal(a),o=cwEsOffer(d),b=o?findP(o.buyerId):null,v=d?findP(d.contactId):null;
 const pre={address:d?cwAddr(d):'',titleRef:'',vendorName:v?.name||'',buyerName:b?.name||'',buyer2:'',nominee:false,buyerEmail:b?.email||'',buyerPhone:b?.phone||'',buyerAddress:'',buyerLawyer:'',vendorLawyer:'',price:o?.amount||'',deposit:o?.deposit||'',depositDue:'',balance:true,settlement:o?.settlement||'',settleDate:'',finance:o?.finance||'',inspection:o?.conditions||'',other:'',special:'',pdf:[]};
 f[a.formId]={...pre,_pre:Object.entries(pre).filter(([,x])=>x!==''&&x!==false&&!(Array.isArray(x)&&!x.length)).map(([k])=>k),_offer:o?.id||''};return f[a.formId]}
cwPage('/esign/contract-of-sale/:id',{title:'Contract of Sale',group:'esign',render(ctx){cwEsSync();const a=cwEsAgr(ctx.params.id,'Contract');if(!a)return cwEmpty('Contract not found','',cwBtn('New agreement','cwEsNew','','primary'));
 const v=cwEsCosVals(a),pre=new Set(v._pre||[]),locked=a.status!=='Draft'||cwEsWaiting(a);
 const secs=CW_ES_COS.map(([k,l,fs])=>[l,fs.map(f=>pre.has(f.n)?{...f,help:'Pre-filled by GeeVee from '+(['address','vendorName'].includes(f.n)?'the property record':'the written offer')+'.'}:f)]);
 const o=v._offer?(state.offers||[]).find(x=>x.id===v._offer):null;
 return `${cwHeader('Contract of Sale: buyer\'s offer details',h(a.title),`${cwGoBtn('Back','/esign/agreements')}${cwGoBtn('Details','/esign/document/'+a.id)}${locked?'':cwBtn('Save','cwEsCosSave',a.id)+cwBtn('Send for signing','cwEsCosSend',a.id,'primary')}`,'eSign')}
 ${o?cwNote('Pre-filled from the written offer by <b>'+h(cwPName(o.buyerId))+'</b> for '+cwMoney(o.amount)+' ('+h(o.status)+'). Offers, price and contract terms always need your check.'):cwNote('No written offer is recorded for this property, so purchaser and price are empty.','warn')}
 ${locked?cwNote(cwEsWaiting(a)?'Waiting for your approval on Today.':'This contract is '+h(a.status)+'. Read-only.',cwEsWaiting(a)?'warn':'info'):''}
 ${v.pdf?.length?cwNote('Contract PDF: <b>'+h(v.pdf.join(', '))+'</b>'):cwNote('No contract uploaded yet','warn')}
 ${locked?'<fieldset disabled style="border:0;padding:0;margin:0">':''}${cwForm('cwEsCos',[],v,{sections:secs.map(([l,fs])=>[l,fs])})}${locked?'</fieldset>':''}`},
 ai(ctx){const a=cwEsAgr(ctx.params.id,'Contract');if(!a)return[];const v=cwEsCosVals(a);const gaps=cwEsCosFields().filter(f=>f.req&&(v[f.n]===''||v[f.n]===undefined));const d=cwEsDeal(a);
  return[{k:'auto',t:(v._pre||[]).length+' fields pre-filled',b:'From the property record and the written offer.'},gaps.length?{k:'check',t:gaps.length+' gaps',b:gaps.map(f=>h(f.l)).join('<br>')}:{k:'info',t:'All required fields filled'},
   d&&v.price&&Number(v.price)<cwDX(d).priceLow?{k:'check',t:'Price is below the advertised range',b:'Check the vendor\'s written instructions before this goes out. If the vendor rejected a lower offer as too low, the advertised price may need review.'}:null,
   {k:'info',t:'Protected send',b:'Contracts go to Today as a protected approval. After signing, GeeVee adds the task to publish the sold price in the Property Price Statement within 7 days of the sale going unconditional.'}]}});
function cwEsCosSaveInner(a){const v=cwRead('cwEsCos',cwEsCosFields());if(!v)return false;const cur=cwEsCosVals(a);if(!v.pdf.length)delete v.pdf;Object.assign(cur,v);cwEsLog(a,'Contract details saved');return true}
cwOn('cwEsCosSave',id=>{const a=cwEsAgr(id,'Contract');if(a&&cwEsCosSaveInner(a))cwPersist('Contract saved.')});
cwOn('cwEsCosSend',id=>{const a=cwEsAgr(id,'Contract');if(!a||!cwEsCosSaveInner(a))return;const v=cwEsCosVals(a);
 if(!(a.recipients||[]).length){cwEsAddRecipient(a,{name:v.buyerName,email:v.buyerEmail,role:'Signer',contactId:(state.offers||[]).find(o=>o.id===v._offer)?.buyerId||''});const d=cwEsDeal(a),p=d&&findP(d.contactId);if(p)cwEsAddRecipient(a,{contactId:p.id,name:p.name,email:p.email,role:'Signer'})}
 for(const r of a.recipients.filter(r=>r.role!=='CC'))if(!(a.fields||[]).some(f=>f.recipient===r.id&&f.type==='Signature')){a.fields=a.fields||[];a.fields.push({id:cwId('FD'),type:'Signature',recipient:r.id,page:9,label:'',required:true})}
 if(cwEsQueue(a))cwPersist('Contract ready for your approval on Today. Nothing has been sent.')});

/* ---------- /documents ---------- */
function cwEsSize(n){n=Number(n)||0;return n>1e6?(n/1e6).toFixed(2)+' MB':Math.max(1,Math.round(n/1e3))+' KB'}
const CW_ES_CATS=['Contracts','Authorities','Marketing','Templates','Compliance','Other'];
cwPage('/documents',{title:'Documents',group:'esign',render(){const D=state.cw.docs;const folder=cwF('esdoc:folder',''),cat=cwF('esdoc:cat','All Categories'),q=cwF('esdoc:q','');
 let files=D.files.filter(f=>(!folder||f.folder===folder)&&(cat==='All Categories'||f.category===cat));files=cwSearchRows(files,q,f=>f.name+' '+(f.category||''));
 const total=D.files.reduce((a,f)=>a+(Number(f.size)||0),0);
 const propDocs=cwProps().flatMap(d=>Object.entries(cwDX(d).docs||{}).flatMap(([k,arr])=>(arr||[]).map(x=>({...x,d,k}))));
 return `${cwHeader('Documents','Manage and organise your files.',cwBtn(ico('refresh','sm')+' Refresh','cwEsDocRefresh')+cwBtn('New Folder','cwEsFolderNew')+cwBtn('Upload','cwEsUpNew','','primary'),'Documents')}
 ${cwStats([['Total documents',D.files.length],['Total size',cwEsSize(total)],['Folders',D.folders.length],['Categories',new Set(D.files.map(f=>f.category)).size]])}
 <div class="toolbar">${cwInput('esdoc:q','Search documents...')}${cwSelect('esdoc:cat',['All Categories',...CW_ES_CATS],{label:'Category'})}</div>
 <div class="cw-side"><div class="cw-vtabs"><button type="button" class="${!folder?'on':''}" data-action="cwSetF" data-id="esdoc:folder|"><span>All files</span><span class="cw-count">${D.files.length}</span></button>${D.folders.map(f=>`<button type="button" class="${folder===f.id?'on':''}" data-action="cwSetF" data-id="esdoc:folder|${h(f.id)}"><span>${ico('archive','sm')} ${h(f.name)}</span><span class="cw-count">${D.files.filter(x=>x.folder===f.id).length}</span></button>`).join('')}</div>
 <div>${cwTable('esdocs',[['Name',f=>`<b>${h(f.name)}</b>${f.dealId&&findD(f.dealId)?`<div class="tiny muted">${h(findD(f.dealId).address)}</div>`:''}`,f=>f.name],['Category',f=>tag(f.category||'Other','outline'),f=>f.category],['Folder',f=>h(D.folders.find(x=>x.id===f.folder)?.name||'None')],['Size',f=>cwEsSize(f.size),f=>Number(f.size)],['Uploaded',f=>cwDate(f.at)+'<div class="tiny muted">'+h(f.by||'')+'</div>',f=>f.at],['',f=>`<div class="cw-row">${cwBtn('Rename','cwEsDocRen',f.id,'sm')}${cwBtn('Move','cwEsDocMove',f.id,'sm')}${cwBtn('Delete','cwEsDocDel',f.id,'sm ghost')}</div>`]],files,{empty:'No documents found',emptyActions:cwBtn('Upload','cwEsUpNew','','primary')})}</div></div>
 ${cwCard('Property files',propDocs.length?propDocs.slice(0,12).map(x=>`<div class="list-row"><div class="number-circle">${ico('file','sm')}</div><div class="list-main"><strong>${h(x.name)}</strong><div class="sub">${h(x.d.address)} · ${h({pps:'Property Price Statement',contract:'Contract',lease:'Lease',report:'Property Report',other:'Other'}[x.k]||x.k)} · ${cwDate(x.at)}</div></div>${cwGoBtn('Property','/properties/'+x.d.id+'?tab=documents','sm')}</div>`).join(''):cwEmpty('No property files'),tag(propDocs.length+' files','teal'))}`},
 ai(){const D=state.cw.docs;const un=D.files.filter(f=>!f.folder);const noPps=cwProps().filter(d=>d.stage==='For sale'&&!(cwDX(d).docs.pps||[]).length);
  return[un.length?{k:'auto',t:un.length+' files not in a folder',b:'GeeVee can file them by category.',a:[['File them','cwEsDocAutoFile','']]}:{k:'info',t:'Every file is in a folder'},noPps.length?{k:'check',t:noPps.length+' listings for sale without a Property Price Statement',b:noPps.map(d=>h(d.address)).join('<br>'),a:[['Open first','cwGo','/properties/'+noPps[0].id+'?tab=documents']]}:{k:'info',t:'Every listing for sale has a Property Price Statement'}]}});
cwOn('cwEsDocRefresh',()=>{render();toast('Documents refreshed.')});
cwOn('cwEsFolderNew',()=>cwModal('cwEsFolder'));
cwModalDef('cwEsFolder',()=>({title:'New folder',body:cwForm('cwEsFolder',[{n:'name',l:'Folder name',req:true}]),foot:cwBtn('Cancel','close')+cwBtn('Create folder','cwEsFolderSave','','primary')}));
cwOn('cwEsFolderSave',()=>{const v=cwRead('cwEsFolder',[{n:'name',l:'Folder name',req:true}]);if(!v)return;if(state.cw.docs.folders.some(f=>f.name.toLowerCase()===v.name.toLowerCase())){cwU().err.cwEsFolder={name:'A folder with this name exists.'};cwU().draft.cwEsFolder=v;render();return}state.cw.docs.folders.push({id:cwId('F'),name:v.name});ui.modal=null;cwPersist('Folder created.')});
function cwEsUpFields(){return[{n:'files',l:'Files',t:'file',multi:true,req:true},{n:'category',l:'Category',t:'select',o:CW_ES_CATS},{n:'folder',l:'Folder',t:'select',o:[['','No folder'],...state.cw.docs.folders.map(f=>[f.id,f.name])]},{n:'dealId',l:'Property (optional)',t:'select',o:[['','None'],...cwProps().map(d=>[d.id,d.address])]}]}
cwOn('cwEsUpNew',()=>cwModal('cwEsUp'));
cwModalDef('cwEsUp',()=>({title:'Upload documents',body:cwForm('cwEsUp',cwEsUpFields(),{folder:cwF('esdoc:folder',''),category:'Other'})+'<p class="hint" style="margin-top:10px">Prototype: only the file name and size are stored, not the file.</p>',foot:cwBtn('Cancel','close')+cwBtn('Upload','cwEsUpSave','','primary')}));
cwOn('cwEsUpSave',()=>{const el=document.querySelector('[data-cwform="cwEsUp"] [name="files"]');const list=[...(el?.files||[])];const v=cwRead('cwEsUp',cwEsUpFields());if(!v)return;
 for(const f of list)state.cw.docs.files.unshift({id:cwId('FL'),name:f.name,size:f.size,category:v.category,folder:v.folder,dealId:v.dealId||'',at:cwNowISO(),by:CW_ME});
 audit('document',list.length+' documents uploaded','Names and sizes only, prototype.');ui.modal=null;cwPersist(list.length+' file'+(list.length>1?'s':'')+' uploaded.')});
cwOn('cwEsDocRen',id=>cwModal('cwEsRen',id));
cwModalDef('cwEsRen',id=>{const f=state.cw.docs.files.find(x=>x.id===id);return{title:'Rename file',body:cwForm('cwEsRen',[{n:'name',l:'File name',req:true}],{name:f?.name}),foot:cwBtn('Cancel','close')+cwBtn('Save','cwEsRenSave',id,'primary')}});
cwOn('cwEsRenSave',id=>{const v=cwRead('cwEsRen',[{n:'name',l:'File name',req:true}]);if(!v)return;const f=state.cw.docs.files.find(x=>x.id===id);if(f)f.name=v.name;ui.modal=null;cwPersist('File renamed.')});
cwOn('cwEsDocMove',id=>cwModal('cwEsMove',id));
cwModalDef('cwEsMove',id=>{const f=state.cw.docs.files.find(x=>x.id===id);return{title:'Move file',body:cwForm('cwEsMove',[{n:'folder',l:'Folder',t:'select',o:[['','No folder'],...state.cw.docs.folders.map(x=>[x.id,x.name])]},{n:'category',l:'Category',t:'select',o:CW_ES_CATS}],{folder:f?.folder,category:f?.category}),foot:cwBtn('Cancel','close')+cwBtn('Move','cwEsMoveSave',id,'primary')}});
cwOn('cwEsMoveSave',id=>{const v=cwRead('cwEsMove',[{n:'folder',t:'select'},{n:'category',t:'select'}]);if(!v)return;const f=state.cw.docs.files.find(x=>x.id===id);if(f)Object.assign(f,v);ui.modal=null;cwPersist('File moved.')});
cwOn('cwEsDocDel',id=>cwConfirm('Delete this file?','It is removed from Documents.','cwEsDocDelYes',id,'Delete','warn'));
cwOn('cwEsDocDelYes',id=>{state.cw.docs.files=state.cw.docs.files.filter(f=>f.id!==id);ui.modal=null;cwPersist('File deleted.')});
cwOn('cwEsDocAutoFile',()=>{const D=state.cw.docs;let n=0;for(const f of D.files.filter(x=>!x.folder)){let fo=D.folders.find(x=>x.name===f.category);if(!fo){fo={id:cwId('F'),name:f.category||'Other'};D.folders.push(fo)}f.folder=fo.id;n++}audit('auto','GeeVee filed '+n+' documents by category','Documents page.');cwPersist(n+' files filed.')});
