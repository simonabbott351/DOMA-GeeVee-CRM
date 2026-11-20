'use strict';
/* Accessibility and phone behaviour for the CRM pages. Wraps core functions by reassignment and tidies the rendered
   markup after every render: labels, heading levels, table header scope, duplicate ids, scrollable regions, dialog
   focus, Escape, and the GeeVee panel closed by default on phones. No page logic changes. */
function cwA11yPhone(){return !!(window.matchMedia&&window.matchMedia('(max-width:800px)').matches)}

/* GeeVee panel: closed until tapped on phones, open on desktop as before */
const cwA11yPrevAI=cwAI;
cwAI=function(items,o){const u=cwU();if(cwA11yPhone()&&!Object.prototype.hasOwnProperty.call(u.open,'ai')){u.open.ai=false;try{return cwA11yPrevAI(items,o)}finally{delete u.open.ai}}return cwA11yPrevAI(items,o)};

/* Names for the few buttons that carry only an icon and no text */
const CW_A11Y_NAMES={close:'Close',cwSelClear:'Clear selection',toggleMenu:'Open navigation',openApprovals:'Review approvals',cwAskPage:'Ask GeeVee about this page'};
const CW_A11Y_FIELD_NAMES={'stage-select':'Stage','deal-stage':'Stage filter','call-consent':'Recording consent','global-search':'Search DOMA','modal-search':'Search','ask-geevee':'Ask GeeVee','gv-dock-text':'Ask GeeVee','reply-text':'Reply'};
function cwA11yHuman(s){return String(s||'').replace(/^cw[A-Z][a-z]/,'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/^./,c=>c.toUpperCase())}
function cwA11yNamed(el){return !!(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.getAttribute('title')||(el.labels&&el.labels.length))}

function cwA11yFix(){
 const app=document.getElementById('app');if(!app)return;
 const content=document.getElementById('content');
 /* a second <main> inside the page (the Today work list) becomes a section */
 if(content)content.querySelectorAll('main').forEach(m=>{const s=document.createElement('section');for(const a of m.attributes)s.setAttribute(a.name,a.value);while(m.firstChild)s.appendChild(m.firstChild);m.replaceWith(s)});
 /* landmarks and live regions outside the page */
 const chat=document.getElementById('gv-chat-root');if(chat&&!chat.getAttribute('role')){chat.setAttribute('role','complementary');chat.setAttribute('aria-label','Ask GeeVee')}
 const toast=document.getElementById('toast');if(toast&&!toast.getAttribute('role')){toast.setAttribute('role','status');toast.setAttribute('aria-live','polite')}
 /* heading levels never skip: a card item heading under a page title reads as level 2, not 3 */
 let prev=null;
 for(const hd of app.querySelectorAll('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6,#content [role="heading"]')){
  if(!hd.getClientRects().length)continue;
  let lvl=hd.hasAttribute('aria-level')?Number(hd.getAttribute('aria-level')):Number(hd.tagName[1])||2;
  if(prev!==null&&lvl>prev+1){lvl=prev+1;hd.setAttribute('aria-level',String(lvl))}
  prev=lvl;
 }
 /* every control has a name */
 for(const el of app.querySelectorAll('input:not([type="hidden"]),select,textarea')){
  if(cwA11yNamed(el))continue;
  const name=CW_A11Y_FIELD_NAMES[el.id]||el.getAttribute('placeholder')||cwA11yLabelNear(el)||cwA11yHuman(el.name||el.dataset.cwbind||el.id)||'Field';
  el.setAttribute('aria-label',name);
 }
 for(const b of app.querySelectorAll('button')){
  if(b.getAttribute('aria-label')||b.getAttribute('aria-labelledby')||b.getAttribute('title')||b.textContent.trim())continue;
  const a=b.dataset.action||'';
  b.setAttribute('aria-label',CW_A11Y_NAMES[a]||(a==='cwGo'?'Open '+cwA11yHuman((b.dataset.id||'').split('?')[0].split('/').filter(Boolean).slice(-1)[0]):cwA11yHuman(a)||'Button'));
 }
 /* tables: header scope, no empty headers */
 for(const t of app.querySelectorAll('table')){
  for(const th of t.querySelectorAll('thead th')){if(!th.hasAttribute('scope'))th.setAttribute('scope','col');if(!th.textContent.trim()&&!th.querySelector('input,button'))th.innerHTML='<span class="sr-only">Actions</span>'}
  for(const th of t.querySelectorAll('tbody th')){if(!th.hasAttribute('scope'))th.setAttribute('scope','row')}
 }
 /* duplicate ids: the same bound input on the page and in a dialog, or a form rendered twice */
 const seen={};
 for(const el of app.querySelectorAll('[id]')){const id=el.id;if(!id)continue;if(!seen[id]){seen[id]=1;continue}
  const n=++seen[id];const labs=app.querySelectorAll('label[for="'+id.replace(/"/g,'\\"')+'"]');const lab=labs[n-1];
  el.id=id+'-'+n;if(lab)lab.setAttribute('for',el.id);seen[el.id]=1}
 /* scrollable boxes can take keyboard focus */
 const labels={'table-wrap':'Table','pipeline-cols':'Pipeline columns','thread-scroll':'Conversations','thread-body':'Conversation','cw-ai-list':'GeeVee suggestions','cw-chat':'Messages','cw-subnav':'Section pages','legacy-iframe':'Screen preview'};
 for(const el of app.querySelectorAll('.table-wrap,.pipeline-cols,.thread-scroll,.thread-body,.cw-ai-list,.cw-chat,.legacy-iframe')){
  if(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1){
   if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
   if(!el.getAttribute('role')){el.setAttribute('role','group');const key=Object.keys(labels).find(k=>el.classList.contains(k));const head=el.closest('.card')?.querySelector('.card-head h2, h2');el.setAttribute('aria-label',(head?head.textContent.trim()+': ':'')+(labels[key]||'Scrollable content'))}
  }
 }
 /* state on navigation and filter buttons */
 app.querySelectorAll('.cw-subnav button.on').forEach(b=>b.setAttribute('aria-current','page'));
 app.querySelectorAll('.cw-pill').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('on')?'true':'false'));
 app.querySelectorAll('.cw-vtabs button').forEach(b=>{if(b.classList.contains('on'))b.setAttribute('aria-current','true')});
 /* map pins never sit on top of each other, so each stays a 24px target */
 for(const map of app.querySelectorAll('.cw-map')){const placed=[];const box=map.getBoundingClientRect();const hits=r=>placed.some(p=>r.left<p.right+2&&r.right>p.left-2&&r.top<p.bottom+2&&r.bottom>p.top-2);
  for(const pin of map.querySelectorAll('.cw-pin')){pin.style.marginTop='';let r=pin.getBoundingClientRect();
   if(hits(r)){const step=r.height+3;for(let k=1;k<=8;k++){for(const dir of [1,-1]){pin.style.marginTop=(dir*k*step)+'px';const t=pin.getBoundingClientRect();if(t.top>=box.top&&t.bottom<=box.bottom&&!hits(t)){r=t;k=99;break}}}if(hits(pin.getBoundingClientRect())){pin.style.marginTop='';r=pin.getBoundingClientRect()}}
   placed.push(r)}}
 /* dialog: labelled by its title, focusable as a whole */
 const dlg=document.querySelector('#overlay .dialog');
 if(dlg){dlg.setAttribute('tabindex','-1');const t=dlg.querySelector('.dialog-head h2');if(t){t.id='cw-dialog-title';dlg.setAttribute('aria-labelledby','cw-dialog-title');dlg.removeAttribute('aria-label')}}
}
function cwA11yLabelNear(el){
 const cell=el.closest('td');if(cell){const tr=cell.parentElement,i=[...tr.children].indexOf(cell);const th=tr.closest('table')?.querySelector('thead th:nth-child('+(i+1)+')');const rowHead=tr.querySelector('td:first-child,th:first-child');const txt=[th?.textContent.trim(),rowHead&&rowHead!==cell?rowHead.textContent.trim().slice(0,60):''].filter(Boolean).join(': ');if(txt)return txt}
 const kv=el.closest('.cw-kv > div');if(kv){const dt=kv.querySelector('dt');if(dt)return dt.textContent.trim()}
 let p=el.previousElementSibling;while(p){if(/^(LABEL|B|STRONG|SPAN|DIV)$/.test(p.tagName)&&p.textContent.trim()&&p.textContent.trim().length<60)return p.textContent.trim();p=p.previousElementSibling}
 const lab=el.closest('label');if(lab){const t=lab.textContent.trim();if(t)return t}
 return '';
}

/* Focus: into a dialog when it opens, back to the opener when it closes */
let cwA11yReturn=null;
function cwA11ySel(el){if(!el||el===document.body||el===document.documentElement)return null;if(el.id)return '#'+el.id.replace(/([^\w-])/g,'\\$1');const a=el.dataset?.action;if(a)return '[data-action="'+a+'"][data-id="'+(el.dataset.id||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"]';return null}
const cwA11yPrevRender=render;
render=function(){
 const had=!!document.querySelector('#overlay');
 const active=document.activeElement;
 if(!had&&active&&!active.closest('#overlay')){const s=cwA11ySel(active);if(s)cwA11yReturn=s}
 const out=cwA11yPrevRender.apply(this,arguments);
 try{cwA11yFix()}catch(e){console.error(e)}
 const has=!!document.querySelector('#overlay');
 if(has&&!had)cwA11yFocusDialog();else if(had&&!has)cwA11yRestoreFocus();
 return out};
function cwA11yFocusDialog(){setTimeout(()=>{const d=document.querySelector('#overlay .dialog');if(!d||d.contains(document.activeElement))return;const f=d.querySelector('.dialog-content input:not([type="hidden"]):not([disabled]):not([readonly]),.dialog-content select:not([disabled]),.dialog-content textarea:not([disabled])');(f||d).focus()},0)}
function cwA11yRestoreFocus(){const s=cwA11yReturn;cwA11yReturn=null;let el=null;try{el=s?document.querySelector(s):null}catch(e){}if(el&&el.getClientRects().length){el.focus();return}const h1=document.querySelector('#content h1');if(h1){h1.setAttribute('tabindex','-1');h1.focus()}}
document.addEventListener('keydown',e=>{
 if(e.key==='Tab'){const d=document.querySelector('#overlay .dialog');if(!d)return;
  const f=[...d.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.getClientRects().length);
  if(!f.length){e.preventDefault();return}
  const first=f[0],last=f[f.length-1],cur=document.activeElement,inside=d.contains(cur)&&cur!==d;
  if(e.shiftKey&&(cur===first||!inside)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(cur===last||!inside)){e.preventDefault();first.focus()}
  return}
 if(e.key==='Escape'&&!ui.modal&&!ui.gvChatOpen&&!ui.gvToolPanel&&ui.route==='cw'){const d=document.querySelector('.cw-ai details[open]');if(d){e.preventDefault();cwU().open.ai=false;render();document.querySelector('.cw-ai summary')?.focus()}}
},true);
