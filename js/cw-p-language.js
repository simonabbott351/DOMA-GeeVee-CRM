'use strict';
/* Language layer, 17 Nov 2026. GeeVee understands everyday Australian phrasing without a live model and asks
   instead of guessing. Wraps cwJnWhen, cwJnMoney, cwJnExtractCall, cwJnParseRecap, cwJnApplyCall, callModal, saveCall,
   gvChatAnswer and cwFindPage by reassignment. Every extracted item carries conf ('high'|'medium'|'low') and why. Prefix cwLg. */
const CW_LG_DAYS=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const CW_LG_MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
const CW_LG_WORDNUM={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
const CW_LG_WN='(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';
const CW_LG_STREET='(?:street|st|road|rd|avenue|ave|av|crescent|cres|court|ct|drive|dr|lane|ln|place|pl|way|parade|pde|highway|hwy|grove|gr|close|terrace|tce|boulevard|blvd|esplanade|esp|square|sq|circuit|cct|rise|walk|mews|row)';
const CW_LG_ADDR_AHEAD='(?!\\s+[a-z]+\\s+'+CW_LG_STREET+'\\b)';
function cwLgCap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)}
function cwLgNorm(text){let l=String(text||'').toLowerCase().replace(/[\u2018\u2019`]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ');
 l=l.replace(/\barvo\b/g,'afternoon').replace(/\b(tmrw|tomoz|tmr|tomorow|tommorow|tomorro)\b/g,'tomorrow').replace(/\bo'?clock\b/g,'oclock').replace(/\b(noon|12 noon|12 midday)\b/g,'midday').replace(/\b(sarvo|s'arvo)\b/g,'this afternoon').replace(/\bthe weekend\b/g,'weekend');
 const ab={mon:'monday',tue:'tuesday',tues:'tuesday',wed:'wednesday',weds:'wednesday',thu:'thursday',thur:'thursday',thurs:'thursday',fri:'friday',sat:'saturday',sun:'sunday'};
 l=l.replace(/\b(this|next|on|for|by|until|till|every|coming)\s+(mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sun)\b\.?/g,(m,a,b)=>a+' '+ab[b]);
 l=l.replace(/\b(mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sun)\b\.?(?=\s*(?:week|morning|afternoon|evening|night|at|\d|around|about|after|before|first|the|lunch|midday|,|\.|!|\?|$))/g,(m,b)=>ab[b]);
 return l}
/* ---------- 1. Dates and times ---------- */
function cwLgTimeWords(l){const W=CW_LG_WORDNUM;const n=w=>W[w]??Number(w);
 l=l.replace(/\b(half|quarter|twenty five|twenty|ten|five)\s+(past|to)\s+(\d{1,2}|[a-z]+)\b/g,(m,a,b,c)=>{let h=n(c);if(!(h>=1&&h<=12))return m;const mins={half:30,quarter:15,'twenty five':25,twenty:20,ten:10,five:5}[a];if(b==='past')return h+':'+String(mins).padStart(2,'0');h=h-1||12;return h+':'+String(60-mins).padStart(2,'0')});
 l=l.replace(new RegExp('\\b('+CW_LG_WN+')\\s+(thirty|fifteen|forty[- ]five|oclock)\\b','g'),(m,a,b)=>n(a)+({thirty:':30',fifteen:':15',oclock:':00'}[b]||':45'));
 l=l.replace(new RegExp('\\b(at|around|about|from|by|till|until)\\s+('+CW_LG_WN+')(?:[- ]?ish)?\\b(?!\\s*(?:bed|bath|car|people|days?|weeks?|months?|minutes?|mins?|hours?|years?|percent|%|k\\b|m\\b|mil|million|thousand|hundred|point|and a half|to\\b|or\\b|of\\b))','g'),(m,a,b)=>a+' '+n(b)+(/ish/.test(m)?' ish':''));
 l=l.replace(new RegExp('\\b('+CW_LG_WN+')\\s*(am|pm|ish|oclock)\\b','g'),(m,a,b)=>n(a)+' '+b);
 return l}
function cwLgTime(s,adjacent){if(!s)return null;let approx=false;s=' '+s+' ';
 s=s.replace(/(\d)\s*-?\s*ish\b/g,(m,d)=>{approx=true;return d+' '});s=s.replace(/\b(around|about|roughly|circa|approx(?:imately)?)\b/g,m=>{approx=true;return m});
 const money='(?!\\s*(?:k\\b|m\\b|mil|million|thousand|grand|%|percent|,\\d|\\.\\d))';const r=(hh,mm,ap,why,explicit=true)=>({hh,mm,ap,why:why.trim(),explicit,approx});
 let m;
 if((m=s.match(new RegExp('(?:^|[\\s(])(\\d{1,2}):(\\d{2})\\s*(am|pm)?\\b'+money))))return r(+m[1],+m[2],m[3]||'',m[0]);
 if((m=s.match(new RegExp('(?:\\b(?:at|around|about|from|by|till|until)\\s+|^\\s*)(\\d{1,2})\\.(\\d{2})\\s*(am|pm)?\\b'+money)))&&+m[2]<60)return r(+m[1],+m[2],m[3]||'',m[0]);
 if((m=s.match(new RegExp('\\b(\\d{1,2})\\.(\\d{2})\\s*(am|pm)\\b'+money))))return r(+m[1],+m[2],m[3],m[0]);
 if((m=s.match(new RegExp('\\b(\\d{1,2})\\s*(am|pm|oclock)\\b'+money))))return r(+m[1],0,m[2]==='oclock'?'':m[2],m[0]);
 if((m=s.match(/(?:\b(?:at|around|about)\s+|^\s*)(\d{2})(\d{2})\s*(?:hrs|h)?\b(?![\/,.\d-])/))&&+m[1]<24&&+m[2]<60&&(adjacent||/hrs|h\b/.test(m[0])||/at|around|about/.test(m[0])))return r(+m[1],+m[2],'24',m[0]);
 if((m=s.match(/\b(\d{3})\s*(?:hrs|h)\b/))&&+m[1].slice(1)<60)return r(+m[1][0],+m[1].slice(1),'24',m[0]);
 if((m=s.match(new RegExp('\\b(?:at|around|about|from|by|till|until)\\s+(\\d{1,2})\\b'+money+CW_LG_ADDR_AHEAD+'(?!\\s*(?:days?|weeks?|months?|minutes?|mins?|hours?|hrs?|people|bed|bath|years?|grand|dollars?|[\\/-]\\d|st\\b|nd\\b|rd\\b|th\\b|of\\b|'+CW_LG_MONTHS.map(x=>x.slice(0,3)).join('|')+'))')))&&+m[1]>=1&&+m[1]<=12)return r(+m[1],0,'',m[0]);
 if(adjacent&&(m=s.match(new RegExp('^\\s*(?:on\\s+)?(\\d{1,2})\\b'+money+'(?!\\s*(?:days?|weeks?|months?|minutes?|mins?|hours?|people|bed|bath|years?|[\\/-]\\d|st\\b|nd\\b|rd\\b|th\\b|of\\b|'+CW_LG_MONTHS.map(x=>x.slice(0,3)).join('|')+'))')))&&+m[1]>=1&&+m[1]<=12)return r(+m[1],0,'',m[0]);
 if(adjacent==='before'&&(m=s.match(/\b(\d{1,2})\s*(?:on|,)?\s*$/))&&+m[1]>=1&&+m[1]<=12)return r(+m[1],0,'',m[0]);
 const P=[[/\bafter lunch\b/,13,30],[/\bbefore lunch\b/,11,30],[/\blunch(?:time)?\b/,12,30],[/\bmidday\b/,12,0],[/\bfirst thing\b/,8,30],[/\bmid[- ]?morning\b/,10,30],[/\bearly (?:morning)\b/,8,0],[/\bbreakfast\b/,7,30],[/\bmorning\b/,9,0],[/\bearly afternoon\b/,13,0],[/\blate afternoon\b/,16,0],[/\bmid[- ]?afternoon\b/,15,0],[/\bafternoon\b/,14,0],[/\bafter work\b/,17,30],[/\bevening\b/,18,0],[/\btonight\b|\bnight\b/,19,0]];
 for(const [re,hh,mm] of P){const k=s.match(re);if(k)return r(hh,mm,'fixed',k[0],false)}
 return approx?{approx:true}:null}
function cwLgAmPm(t,period){let hh=t.hh,mm=t.mm;if(t.ap==='24'||t.ap==='fixed')return[hh,mm];
 if(t.ap==='pm'){if(hh<12)hh+=12}else if(t.ap==='am'){if(hh===12)hh=0}
 else if(period==='am'){if(hh===12)hh=0}else if(period==='pm'){if(hh<12)hh+=12}
 else if(hh<=7)hh+=12;return[hh,mm]}
function cwLgWhenX(text,base=new Date()){const src=cwLgTimeWords(cwLgNorm(text));let l=src;const out={date:null,hasTime:false,approx:false,conf:'low',why:'',reason:''};if(!l.trim())return out;
 const b=new Date(base);b.setHours(0,0,0,0);let d=null,span='',dayConf='high';const mon=CW_LG_MONTHS.map(x=>x.slice(0,3)+'[a-z]*').join('|');
 const at=(y,mo,da)=>{const x=new Date(b);x.setFullYear(y,mo,da);return x};const plus=n=>{const x=new Date(b);x.setDate(x.getDate()+n);return x};
 const take=(m)=>{span=m[0].trim();l=l.replace(m[0],' ')};
 let m;
 /* explicit dates */
 if((m=l.match(new RegExp('\\b(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{2,4}))?\\b'+CW_LG_ADDR_AHEAD+'(?!\\s*(?:bed|bath|weeks?|days?|months?|minutes?|hours?|%|k\\b|m\\b))')))&&+m[1]>=1&&+m[1]<=31&&+m[2]>=1&&+m[2]<=12){let y=m[3]?+m[3]:b.getFullYear();if(y<100)y+=2000;d=at(y,+m[2]-1,+m[1]);if(!m[3]&&d<plus(-1))d=at(y+1,+m[2]-1,+m[1]);take(m)}
 else if((m=l.match(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/))&&+m[1]<=31&&+m[2]<=12){d=at(+m[3],+m[2]-1,+m[1]);take(m)}
 else if((m=l.match(new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?(?: of)? ('+mon+')\\b(?:,? (\\d{4}))?')))&&+m[1]>=1&&+m[1]<=31){const mo=CW_LG_MONTHS.findIndex(x=>x.startsWith(m[2].slice(0,3)));let y=m[3]?+m[3]:b.getFullYear();d=at(y,mo,+m[1]);if(!m[3]&&d<plus(-1))d=at(y+1,mo,+m[1]);take(m)}
 else if((m=l.match(new RegExp('\\b('+mon+') (\\d{1,2})(?:st|nd|rd|th)?\\b(?!\\s*(?:bed|bath|weeks?|days?|months?|%|k\\b|m\\b|:\\d|am|pm))(?:,? (\\d{4}))?')))&&+m[2]>=1&&+m[2]<=31&&m[1]!=='may'){const mo=CW_LG_MONTHS.findIndex(x=>x.startsWith(m[1].slice(0,3)));let y=m[3]?+m[3]:b.getFullYear();d=at(y,mo,+m[2]);if(!m[3]&&d<plus(-1))d=at(y+1,mo,+m[2]);take(m)}
 else if((m=l.match(/\bthe (\d{1,2})(?:st|nd|rd|th)\b/))&&+m[1]>=1&&+m[1]<=31){d=at(b.getFullYear(),b.getMonth(),+m[1]);if(d<b)d=at(b.getFullYear(),b.getMonth()+1,+m[1]);take(m)}
 const explicit=!!d;
 /* relative phrases */
 if((m=l.match(/\b(?:a|one) week (today|tomorrow)\b/))){const x=plus(m[1]==='today'?7:8);if(d&&d.getTime()!==x.getTime())return{...out,reason:'two different days'};d=x;take(m)}
 else if((m=l.match(/\b(?:a |one )?fortnight (today|tomorrow)\b/))){d=plus(m[1]==='today'?14:15);take(m)}
 else if((m=l.match(/\b(?:the )?day after tomorrow\b/))){d=plus(2);take(m)}
 else if((m=l.match(/\bin (a|an|one|two|three|four|five|six|\d+) (day|week|fortnight)s?(?: time)?\b/))){const n=m[1]==='a'||m[1]==='an'?1:(CW_LG_WORDNUM[m[1]]??+m[1]);d=plus(n*(m[2]==='day'?1:m[2]==='week'?7:14));take(m)}
 else if((m=l.match(/\bin a fortnight\b/))){d=plus(14);take(m)}
 const wdRe='(sunday|monday|tuesday|wednesday|thursday|friday|saturday)';
 if(!d&&(m=l.match(new RegExp('\\b(?:next week(?: on)? '+wdRe+'|'+wdRe+' next week|'+wdRe+' week|'+wdRe+' (?:of )?(?:the )?week after next)\\b')))){const wd=CW_LG_DAYS.indexOf(m[1]||m[2]||m[3]||m[4]);
  if(m[4]){let diff=(wd-b.getDay()+7)%7;if(!diff)diff=7;d=plus(diff+14)}else if(m[3]){let diff=(wd-b.getDay()+7)%7;if(!diff)diff=7;d=plus(diff+7)}else{const mondayNext=plus((8-b.getDay())%7||7);d=new Date(mondayNext);d.setDate(d.getDate()+(wd+6)%7)}take(m)}
 if((m=l.match(new RegExp('\\b(?:(next|this|coming|on|for|by)\\s+)?'+wdRe+'\\b')))){const wd=CW_LG_DAYS.indexOf(m[2]);
  if(d){if(d.getDay()!==wd)return{...out,reason:cwLgCap(m[2])+' and '+span+' are not the same day'};take(m)}
  else{let diff=(wd-b.getDay()+7)%7;if(!diff)diff=7;d=plus(diff);take(m)}}
 if(!d){
  if((m=l.match(/\btomorrow\b/))){d=plus(1);take(m)}
  else if((m=l.match(/\btoday\b|\btonight\b|\bthis (?:morning|afternoon|evening)\b/))){d=plus(0);take(m)}
  else if((m=l.match(/\bend of (?:the |this )?month\b/))){d=at(b.getFullYear(),b.getMonth()+1,0);take(m);dayConf='medium'}
  else if((m=l.match(/\bend of next month\b/))){d=at(b.getFullYear(),b.getMonth()+2,0);take(m);dayConf='medium'}
  else if((m=l.match(/\b(?:start|beginning|first) of next month\b|\bearly next month\b/))){d=at(b.getFullYear(),b.getMonth()+1,1);take(m);dayConf='medium'}
  else if((m=l.match(/\bnext week\b/))){d=plus(7);take(m);dayConf='medium'}
  else if((m=l.match(/\bfirst thing\b/))){d=plus(1);dayConf='medium';span='first thing (tomorrow)'}
  else if(/\bweekend\b/.test(l))return{...out,reason:'Saturday or Sunday?'};
  else if(/\bnext month\b|\bthis week\b|\blater\b|\bsometime\b|\bnext year\b/.test(l))return{...out,reason:'no exact day'};
  else return out}
 if(!d)return out;
 /* time: after the day phrase first, then before it */
 const i=src.indexOf(span.split(' ')[0]);const after=i>=0?src.slice(i+span.length):'',before=i>=0?src.slice(0,i):'';
 let t=cwLgTime(l===src?src:after,true);if(!t||!('hh' in t))t=cwLgTime(before,'before')||t;if(!t||!('hh' in t))t=cwLgTime(l,false)||t;
 const period=/\bmorning\b|\bam\b/.test(l)?'am':/\bafternoon\b|\bevening\b|\btonight\b|\bnight\b|\bafter lunch\b|\bafter work\b/.test(l)?'pm':'';
 let hh=10,mm=0;
 if(t&&'hh' in t){if(t.hh>23||t.mm>59)return{...out,reason:'bad time'};[hh,mm]=cwLgAmPm(t,period);out.hasTime=!!t.explicit;out.approx=!!t.approx}
 else if(/\btonight\b/.test(span))hh=19;
 if(t&&t.approx)out.approx=true;
 d.setHours(hh,mm,0,0);out.date=d;out.why=cwLgCap((span+(t&&t.why?' '+t.why:'')).replace(/\s+/g,' ').trim());
 out.conf=dayConf==='high'&&out.hasTime&&!out.approx?'high':'medium';if(!out.hasTime&&!(t&&'hh' in t))out.conf=dayConf==='high'?'medium':'low';
 return out}
function cwLgWhen(text,base){return cwLgWhenX(text,base).date}
const cwLgPrevWhen=cwJnWhen;
cwJnWhen=function(text,base=new Date()){return cwLgWhen(text,base)||cwLgPrevWhen(text,base)};
/* ---------- 2. Money ---------- */
function cwLgNumWords(l){const W=CW_LG_WORDNUM;const n=w=>W[w]??Number(w);const w1='(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)';
 l=l.replace(new RegExp('\\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[- ]('+w1+')\\b','g'),(m,a,b)=>n(a)+n(b));
 l=l.replace(new RegExp('\\b('+w1+'|\\d+) point ('+w1+'|\\d)(?: ('+w1+'|\\d))?(?: ('+w1+'|\\d))?\\b','g'),(m,a,b,c,e)=>n(a)+'.'+n(b)+(c?n(c):'')+(e?n(e):''));
 l=l.replace(new RegExp('\\b('+w1+'|\\d+) and a half\\b','g'),(m,a)=>(n(a)+0.5));
 l=l.replace(new RegExp('\\b('+w1+'|\\d+) hundred(?: and ('+w1+'))?\\b','g'),(m,a,b)=>n(a)*100+(b?n(b):0));
 l=l.replace(new RegExp('\\b(one|two|three|four|five|six|seven|eight|nine) (ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\\b(?=\\s*(?:k\\b|thousand|grand|to\\b|and\\b|or\\b|$|[,.]))','g'),(m,a,b)=>n(a)*100+n(b));
 l=l.replace(new RegExp('\\b('+w1+')\\b(?=\\s*(?:thousand|million|mil\\b|mill\\b|grand|k\\b|m\\b|percent|per cent|%))','g'),m=>n(m));
 return l}
function cwLgAmt(num,unit){const n=Number(String(num).replace(/,/g,''));if(isNaN(n))return null;unit=unit||'';if(/^(m|mil|mill|million)$/.test(unit))return Math.round(n*1e6);if(/^(k|thousand|grand)$/.test(unit))return Math.round(n*1e3);if(n<100)return Math.round(n*1e6);if(n<10000)return Math.round(n*1e3);return Math.round(n)}
const CW_LG_BANDS={ones:[1.0e6,2e5],twos:[2.0e6,2e5],threes:[3.0e6,2e5],elevens:[1.1e6,1e5],twelves:[1.2e6,1e5],thirteens:[1.3e6,1e5],fourteens:[1.4e6,1e5],fifteens:[1.5e6,1e5],sixteens:[1.6e6,1e5],seventeens:[1.7e6,1e5],eighteens:[1.8e6,1e5],nineteens:[1.9e6,1e5]};
function cwLgBand(base,width,part){const r=x=>Math.round(x/1e4)*1e4;let low=base,high=base+width-1e4;
 if(part==='low'||part==='early')high=r(base+width*0.3)-1e4+1e4,high=base+Math.round(width*0.3/1e4)*1e4;else if(part==='mid')low=base+Math.round(width*0.4/1e4)*1e4,high=base+Math.round(width*0.6/1e4)*1e4;else if(part==='high'||part==='late')low=base+Math.round(width*0.5/1e4)*1e4;
 if(part==='low'||part==='early')high=high-1e4;if(part==='mid'&&width===1e5)low=base+4e4,high=base+6e4;if(part==='mid'&&width===2e5)low=base+5e4,high=base+1.4e5;if((part==='high'||part==='late')&&width===2e5)low=base+1e5;if((part==='high'||part==='late')&&width===1e5)low=base+7e4;if((part==='low'||part==='early')&&width===1e5)high=base+3e4;if((part==='low'||part==='early')&&width===2e5)high=base+9e4;
 return{low,high,point:part==='mid'?base+Math.round(width/2/1e4)*1e4:Math.round((low+high)/2/5e3)*5e3,approx:true}}
function cwLgMoney(text){if(text==null)return null;let l=cwLgNumWords(cwLgNorm(text));const out={low:null,high:null,point:null,approx:false,why:''};let m;
 if((m=l.match(/\b(low|mid|high|early|late)[- ]?(\d)00s\b/))){const b=cwLgBand(+m[2]*1e5,1e5,m[1]);return{...out,...b,why:m[0]}}
 if((m=l.match(/\b(\d)00s\b/))){const b=cwLgBand(+m[1]*1e5,1e5,'');return{...out,...b,why:m[0]}}
 if((m=l.match(/\b(?:(low|mid|high|early|late)[- ]?)?(ones|twos|threes|elevens|twelves|thirteens|fourteens|fifteens|sixteens|seventeens|eighteens|nineteens)\b/))){const [base,w]=CW_LG_BANDS[m[2]];const b=cwLgBand(base,w,m[1]||'');return{...out,...b,why:m[0]}}
 const num='\\$?\\s?(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)\\s*(million|mil|mill|m|thousand|grand|k)?\\b(?!\\s*(?:%|percent|per cent|bed|bath|car|days?|weeks?|months?|minutes?|hours?|people|am\\b|pm\\b|oclock|:\\d|st\\b|nd\\b|rd\\b|th\\b|[\\/-]\\d))';
 const approx=/\b(around|about|roughly|circa|ballpark|approx(?:imately)?|close to|near|ish|somewhere|or so|give or take)\b/.test(l);
 if((m=l.match(new RegExp('\\b(?:between\\s+)?'+num+'\\s*(?:to|-|and|or|through to|up to)\\s*'+num)))&&!/\b\d{1,2}\/\d/.test(m[0])){const u1=m[2]||m[4],u2=m[4]||m[2];let lo=cwLgAmt(m[1],m[2]||(m[4]?u2:'')),hi=cwLgAmt(m[3],m[4]||(m[2]?u1:''));
  if(lo!=null&&hi!=null&&lo<=hi&&hi/lo<=3)return{...out,low:lo,high:hi,point:Math.round((lo+hi)/2),approx,why:m[0].trim()}}
 if((m=l.match(new RegExp('\\b(?:at least|minimum|min|from|upwards of|no less than|not less than|more than|over|above)\\s+'+num))))return{...out,low:cwLgAmt(m[1],m[2]),high:null,point:cwLgAmt(m[1],m[2]),approx,why:m[0].trim()}
 if((m=l.match(new RegExp(num+'\\s*(?:plus|\\+|or more|or better|and up|upwards)\\b'))))return{...out,low:cwLgAmt(m[1],m[2]),high:null,point:cwLgAmt(m[1],m[2]),approx,why:m[0].trim()}
 if((m=l.match(new RegExp('\\b(?:under|below|up to|max(?:imum)?|no more than|not more than|less than|capped at)\\s+'+num))))return{...out,low:null,high:cwLgAmt(m[1],m[2]),point:cwLgAmt(m[1],m[2]),approx,why:m[0].trim()}
 const all=[...l.matchAll(new RegExp(num,'g'))].filter(x=>!/^\d{1,2}$/.test(x[1])||x[2]);
 if(all.length){const x=all[0];const v=cwLgAmt(x[1],x[2]);if(v==null||v<1000)return null;return{...out,low:v,high:v,point:v,approx,why:x[0].trim()}}
 return null}
const cwLgPrevMoney=cwJnMoney;
cwJnMoney=function(n,unit){if(typeof n==='string'&&unit===undefined&&isNaN(Number(n.replace(/,/g,'')))){const r=cwLgMoney(n);return r?r.point:0}if(typeof n==='string')n=n.replace(/,/g,'');return cwLgPrevMoney(n,unit)};
/* ---------- 2b. Recap: commission, method, marketing, photos, chase ---------- */
function cwLgCommission(text){const l=cwLgNumWords(cwLgNorm(text));const o={};let m;
 if((m=l.match(/\bflat(?: fee| rate| commission)?(?: of)?\s*\$?(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|grand)?\b/))||(m=l.match(/\$?(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|grand)?\s*flat\b/))){let n=Number(m[1].replace(/,/g,''));if(m[2]||n<1000)n*=1000;o.flat=Math.round(n);o.why='flat fee '+m[0].trim()}
 if((m=l.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|per cent|pc)\b/)))o.rate=Number(m[1]);
 else if((m=l.match(/\b(?:commission|comm|fee|rate)\b[^.\d]{0,25}(\d(?:\.\d+)?)\b(?!\s*(?:k|m|mil|million|thousand|,\d|\d))/))&&Number(m[1])<=5)o.rate=Number(m[1]);
 else if((m=l.match(/\b(\d(?:\.\d+)?)\s*(?:plus|\+|inc|incl|including|inclusive|ex|excluding)\s*(?:of\s*)?gst\b/))&&Number(m[1])<=5)o.rate=Number(m[1]);
 if(o.rate!=null||o.flat)o.gst=/\binc(?:l|luding|lusive)?\b(?: of)?(?:\s*gst)?|\bgst inc(?:lusive|luded)?\b/.test(l)&&!/\bplus gst\b|\bex(?:cluding)? gst\b|\+\s*gst/.test(l)?'Inclusive of GST':'Plus GST';
 if(o.rate!=null)o.why='commission '+(m?m[0].trim():o.rate+'%');
 return o}
function cwLgMethod(l){l=cwLgNorm(l);const o={};
 if(/\bauction\b/.test(l))o.method='Auction';else if(/\bexpressions? of interest\b|\beoi\b/.test(l))o.method='Expressions of interest';else if(/\bset[- ]date\b|\bset sale date\b|\bclosing date sale\b|\bsale by set date\b/.test(l))o.method='Set date sale';else if(/\bprivate (?:sale|treaty)\b|\bby negotiation\b|\bfor sale by private\b/.test(l))o.method='Private Sale';
 if(/\boff[- ]market\b/.test(l)){o.offMarket=true;if(!o.method)o.method='Private Sale'}
 return o}
function cwLgMarketing(l){l=cwLgNumWords(cwLgNorm(l));let m=l.match(/\bmarketing(?: budget| spend| campaign| costs?| contribution)?(?: of| is| at| around| about|:)?\s*\$?(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|grand)?\b/)||l.match(/\$?(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|grand)?\s*(?:for |on |of |in |towards )?(?:the )?marketing\b/);
 if(!m)return null;let n=Number(m[1].replace(/,/g,''));if(m[2]||n<100)n*=1000;return Math.round(n)}
function cwLgSentences(text){const out=[];for(const line of String(text||'').split(/\r?\n/)){const lm=line.match(/^\s*([A-Za-z][A-Za-z .'-]{0,30}?):\s*(.*)$/);const who=lm?lm[1].trim().toLowerCase():'';const body=lm?lm[2]:line;
  for(const s of body.split(/(?<=[.!?])\s+/))if(s.trim())out.push({s:s.trim(),who})}return out}
function cwLgParseRecap(text){const o={};const sents=cwLgSentences(text);const l=cwLgNorm(text);
 const c=cwLgCommission(text);if(c.rate!=null){o.rate=c.rate;o.gst=c.gst}if(c.flat){o.flat=c.flat;o.gst=o.gst||c.gst}
 Object.assign(o,cwLgMethod(text));const mk=cwLgMarketing(text);if(mk)o.marketing=mk;
 const priceS=sents.find(x=>/\b(estimate|range|price|quote|guide|worth|list(?:ing)? (?:at|for)|expect|agreed|ask(?:ing)?|appraised|come on at|go to market at|in the (?:low|mid|high)|ones|twelves|elevens)\b/i.test(x.s))||null;
 let pm=null;const mask=s=>s.replace(/\d+(?:\.\d+)?\s*(?:%|percent|per cent)/g,' ').replace(/\b(?:plus|\+|inc\w*|ex\w*)\s*gst\b/g,' ').replace(/\bmarketing[^.]*?\d[\d,]*\s*(?:k|thousand|grand)?/g,' ').replace(/\bflat[^.]*?\d[\d,]*\s*(?:k|thousand|grand)?/g,' ').replace(/\b\d(?:\.\d+)?\s*(?:plus|\+|inc|incl|including|ex|excluding)\s*gst\b/g,' ');
 if(priceS)pm=cwLgMoney(mask(priceS.s));if(!pm)pm=cwLgMoney(mask(text));
 if(pm&&(pm.low||pm.high)){o.low=pm.low||pm.high;o.high=pm.high||pm.low;o.approx=pm.approx;o.priceWhy=pm.why}
 const ph=sents.find(x=>/photo|shoot|photographer/i.test(x.s));if(ph){const w=cwLgWhenX(ph.s.replace(/\bchase[^.]*$/i,''));if(w.date)o.photos=w.date.toISOString()}
 const ch=l.match(/\b(?:chase|follow[- ]up(?: with)?|check in(?: with)?|ring them|call them|remind them)\b([^.]{0,80})/);if(ch){const w=cwLgWhenX(ch[1]);if(w.date)o.chase=w.date.toISOString()}
 o.authority=/authority|agreement|paperwork|contract to sign|send (?:them |it )?(?:the )?(?:docs|documents)|sign(?:ed)? up/.test(l);
 o.listing=!!(o.low&&(o.rate!=null||o.flat))||(/go ahead|going ahead|list(?:ing)? with us|signed? up|agreed to list|we got it|won it|happy to proceed/.test(l)&&!!(o.low||o.rate!=null||o.flat));
 return o}
const cwLgPrevRecap=cwJnParseRecap;
cwJnParseRecap=function(text){const o=cwLgPrevRecap(text);const m=cwLgParseRecap(text);
 if(m.low){o.low=m.low;o.high=m.high;o.approx=m.approx}if(m.rate!=null){o.rate=m.rate;o.gst=m.gst}if(m.flat){o.flat=m.flat;o.gst=o.gst||m.gst}
 if(m.method)o.method=m.method;if(m.offMarket)o.offMarket=true;if(m.marketing)o.marketing=m.marketing;if(m.photos)o.photos=m.photos;if(m.chase)o.chase=m.chase;o.authority=o.authority||m.authority;
 o.listing=o.listing||m.listing;return o};
if(typeof cwJnApplyRecap==='function'){const prev=cwJnApplyRecap;cwJnApplyRecap=function(p,d,o,text){const id=prev(p,d,o,text);const x=cwDX(d);const card=cwJnS().cards.find(c=>c.id===id);const push=(t,r)=>card&&card.items.push([t,r]);
 if(o.flat&&o.rate==null){x.commission={kind:'Flat fee',amount:o.flat,gst:o.gst||'Plus GST'};addTask({title:'Confirm the flat fee of '+cwMoney(o.flat)+' on the authority for '+d.address,contactId:p.id,dealId:d.id,due:'Today',priority:'High',category:'Admin',origin:'Heard in the recap. The authority form needs the fee entered by hand.'});push('Flat fee '+cwMoney(o.flat)+' '+(o.gst||'Plus GST').toLowerCase()+'. Task added to put it on the authority','/properties/'+d.id)}
 if(o.offMarket){x.market='Off market';x.visibility=false;push('Off market first, as agreed. Nothing goes to the portals until you say so','/properties/'+d.id)}
 if(o.approx&&o.low)push('The price was approximate ("'+(o.priceWhy||'about')+'"). Confirm the exact range before the authority goes out','/properties/'+d.id+'?tab=compliance');
 return id}}
/* ---------- 3. Call transcript extraction ---------- */
function cwLgHeard(text,re){const s=cwLgSentences(text).find(x=>re.test(x.s));return s?s.s.replace(/\s+/g,' ').slice(0,90):''}
function cwLgAgentSpeaker(sents,p){const names=[...new Set(sents.map(x=>x.who).filter(Boolean))];if(!names.length)return '';const me=CW_ME.split(' ')[0].toLowerCase();const first=(p?.name||'').split(' ')[0].toLowerCase();
 return names.find(n=>n===me||n.startsWith(me))||names.find(n=>n!==first&&!n.startsWith(first))||''}
const CW_LG_WHENFMT=w=>w.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short'})+' at '+w.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});
function cwLgExtract(text,p,d,prevItems){const items=[];const sents=cwLgSentences(text);const agent=cwLgAgentSpeaker(sents,p);const first=(p?.name||'there').split(' ')[0];const role=p?.role||'';const buyer=role==='buyer'||role==='both';const seller=role!=='buyer';
 const theirs=sents.filter(x=>!x.who||x.who!==agent),mine=sents.filter(x=>x.who&&x.who===agent);const has=k=>prevItems.some(i=>i.k===k);
 const deal=d||(typeof gvxFindDeal==='function'?gvxFindDeal(text):null)||(p&&(cwPX(p).linked||[]).map(findD).find(Boolean))||null;
 /* opt out */
 const oo=theirs.find(x=>/\b(?:do not|don'?t|never|stop|please don'?t) (?:call|contact|ring|phone|text|email|message)(?: me| us)?(?: again| any ?more)?\b|\bnot interested\b|\bno longer interested\b|\btake (?:me|us) off\b|\bremove (?:me|us|my number)\b|\bstop calling\b|\bunsubscribe\b|\bleave (?:me|us) alone\b|\bdo not contact\b/i.test(x.s));
 if(oo)items.push({k:'optout',t:'Mark '+(p?.name||'the contact')+' as do not contact',s:'They asked not to be contacted. No marketing, no drafts. '+(/not interested|no longer/i.test(oo.s)?'The lead is marked lost.':''),lost:/not interested|no longer interested|changed (?:our|my) mind/i.test(oo.s),conf:'high',why:oo.s.slice(0,90)});
 /* inspection request (buyers, or anyone asking to see a property) */
 const ins=theirs.find(x=>/\b(?:can|could|may|able to|want to|like to|keen to|love to)\s+(?:i|we)?\s*(?:come )?(?:see|view|look at|inspect|have a look|come through|get through|check out|go through|walk through)\b|\b(?:private )?(?:inspection|viewing)\b|\blook through\b/i.test(x.s)&&!/appraisal|valuation/i.test(x.s));
 if(ins&&(buyer||/\bsee it\b|\binspection\b|\bviewing\b|\blook through\b/i.test(ins.s))){const w=cwLgWhenX(ins.s);const w2=w.date?w:cwLgWhenX(theirs.filter(x=>x!==ins).map(x=>x.s).join('. '));
  if(w2.date)items.push({k:'inspection',t:'Book a private inspection: '+CW_LG_WHENFMT(w2.date),s:(deal?cwAddr(deal):'Property to confirm')+' · in the calendar, with a confirmation text to '+first+' for your approval',when:w2.date.toISOString(),dealId:deal?.id||'',conf:w2.conf,why:ins.s.slice(0,90)});
  else{items.push({k:'inspectionTask',t:'Inspection wanted, no time agreed',s:'GeeVee adds a task to arrange it.',dealId:deal?.id||'',conf:'medium',why:ins.s.slice(0,90)});items.push({k:'ask',ask:'inspection',input:'jn-ask-insp',t:'When is the inspection? GeeVee heard a request but no day and time.',s:'',conf:'low',why:ins.s.slice(0,90)})}}
 /* offer from a buyer */
 const off=theirs.find(x=>/\b(?:offer|offering|put in|pay|go to|bid|stretch to|give you|come in at|put forward)\b/i.test(x.s)&&cwLgMoney(x.s));
 if(off&&!has('offer')&&(buyer||/\boffer\b/i.test(off.s))){const mo=cwLgMoney(off.s);const cond=[];const sl=off.s.toLowerCase()+' '+theirs.filter(x=>x!==off).map(x=>x.s.toLowerCase()).join(' ');
  if(/finance|loan|bank approval|pre-?approval/.test(sl))cond.push('Subject to finance');if(/building|pest|inspection report/.test(sl))cond.push('Subject to building and pest');if(/subject to (?:the )?sale|sell (?:our|my) (?:place|house|home)/.test(sl))cond.push('Subject to sale of their property');const st=sl.match(/(\d{2,3})[- ]day settlement|settlement (?:of |in )?(\d{2,3})/);if(st)cond.push((st[1]||st[2])+' day settlement');if(/unconditional|cash|no conditions/.test(sl))cond.push('Unconditional');
  const dep=sl.match(/(\d{1,2})\s*(?:%|percent|per cent)\s*deposit|deposit (?:of )?(\d{1,2})\s*(?:%|percent|per cent)/);
  items.push({k:'offer',lg:true,t:'Offer mentioned: '+cwMoney(mo.point)+(mo.approx?' (about)':'')+(cond.length?', '+cond.join(', ').toLowerCase():''),s:'Verbal only. GeeVee records it in the offer register. Nothing goes to the vendor until it is written and you approve it.',amount:mo.point,low:mo.low,high:mo.high,approx:mo.approx,conditions:cond,dealId:deal?.id||'',
   offer:{amount:mo.point,settlement:st?(st[1]||st[2])+' days':'',deposit:dep?(dep[1]||dep[2])+'%':'',finance:/finance|loan|bank/.test(sl)?'Subject to finance':/unconditional|cash/.test(sl)?'Unconditional finance':'',conditions:cond.filter(c=>!/finance|settlement/.test(c)).join('; ')},conf:mo.approx||!mo.low?'medium':'high',why:off.s.slice(0,90)})}
 /* seller price expectation, when the lead's extractor found none */
 if(seller&&!has('expect')){const ex=theirs.find(x=>/\b(?:want|wants|hoping|hope|expect|expecting|need to get|worth|thinking|looking for|not (?:selling|going|taking) (?:for |anything )?(?:less|under)|wouldn'?t take less|at least|ballpark|ideally|in the (?:low|mid|high)|ones|twelves|elevens|thirteens|minimum|figure in mind)\b/i.test(x.s)&&cwLgMoney(x.s.replace(/\d+(?:\.\d+)?\s*(?:%|percent)/g,'')));
  if(ex){const mo=cwLgMoney(ex.s.replace(/\d+(?:\.\d+)?\s*(?:%|percent)/g,''));const amt=mo.low||mo.point;if(amt)items.push({k:'expect',t:'Vendor expectation: '+cwMoney(amt)+(mo.high&&mo.high!==mo.low?' to '+cwMoney(mo.high):'')+(mo.approx?' (approximate)':''),s:'Saved as a fact on the property, with this call as the source',amount:amt,high:mo.high,approx:mo.approx,conf:mo.approx?'medium':'high',why:ex.s.slice(0,90)})}}
 /* co-owner, when the lead's extractor found none */
 if(!has('coOwner')){const rel='(wife|husband|partner|brother|sister|mother|father|mum|dad|son|daughter|co-?owner|business partner|ex)';let name='',relw='',heard='';
  for(const x of theirs){let m=x.s.match(new RegExp('\\b(?:my|our) '+rel+',? ([A-Z][a-z]+)\\b'))||x.s.match(new RegExp('\\b([A-Z][a-z]+),? (?:my|our) '+rel+'\\b'))||x.s.match(/\b(?:and|with) ([A-Z][a-z]+)\b[^.]*?\bon the title\b/)||x.s.match(/\b([A-Z][a-z]+) (?:is|'s) (?:also )?on the title\b/);
   if(m){const cands=m.slice(1).filter(Boolean);name=cands.find(c=>/^[A-Z]/.test(c)&&!/^(I|We|My|Our|And|The|She|He|They|Yes|No)$/.test(c))||'';relw=cands.find(c=>/^[a-z]/.test(c))||'co-owner';if(name){heard=x.s;break}}}
  if(name)items.push({k:'coOwner',t:'Record co-owner: '+name+' ('+relw+')',s:'Details to confirm at the appraisal',name,conf:'medium',why:heard.slice(0,90)})}
 /* promises by the agent */
 const pr='\\bi(?:\'ll| will| can| am going to|\'m going to| gonna| shall)\\s+(send|email|text|sms|forward|shoot|flick|get|call|ring|phone|give you a (?:call|ring|buzz|bell)|drop|post|share|put together|book|organise|organize|arrange|chase|check|find out|come back|get back|confirm|look into|speak to|talk to|have a look|pop|bring)\\b([^.!?\\n]*)';
 for(const x of (mine.length?mine:sents))for(const piece of x.s.split(/\s+(?:and|then|,|;|also)?\s*(?=i(?:'ll|'m going to| will| can| am going to| gonna| shall)\s)/i)){const re=new RegExp(pr,'gi');let m;while((m=re.exec(piece))){const verb=m[1].toLowerCase(),rest=m[2].trim();if(/confirmation/.test(rest)&&/text|sms|message/.test(verb+' '+rest))continue;if(verb==='bring'||/\bbring\b/.test(rest)&&/comparable|pack|plan/.test(rest))continue;if(/\bthere\b|\bthen\b/.test(rest)&&!rest.replace(/\b(there|then|be)\b/g,'').trim())continue;
   const callV=/^(call|ring|phone|give you a|come back|get back|speak to|talk to)/.test(verb),sendV=/^(send|email|text|sms|forward|shoot|flick|share|post)/.test(verb);
   const w=cwLgWhenX(rest);let what=rest.replace(/^(?:you|them|him|her|it|that)\b\s*/,'').replace(/\b(?:you|them)\b/g,first).replace(/\s+/g,' ').trim();if(w.date&&w.why)what=what.replace(new RegExp(w.why.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'').replace(/\b(?:on|by|at)\s*$/,'').trim();what=what.replace(/^(?:through|over|across|out)\s+/,'').replace(/^(?:a |an |the )?copy of\s+/,'the ').trim();
   if(sendV){const sms=/^(text|sms)/.test(verb)||/\btext\b|\bsms\b/.test(rest);if(!what)continue;items.push({k:'promise',channel:sms?'SMS':'Email',what:what.replace(/^(?:over |through )/,''),t:(sms?'Text ':'Email ')+first+' '+what+' (you promised it on the call)',s:'Draft goes to Today for your approval. Nothing is sent until you approve it.',conf:what.length>3?'high':'medium',why:x.s.slice(0,90)})}
   else if(callV){const due=w.date||cwLgWhen('tomorrow');items.push({k:'promiseTask',t:'Call '+first+' '+(w.date?cwDate(due):'tomorrow')+(what&&!/^(?:you|them)$/.test(what)?': '+what:''),s:'Task on Today. You said you would '+verb+(what?' '+what:'')+'.',due:due.toISOString(),category:'Call',conf:w.date?w.conf:'medium',why:x.s.slice(0,90)})}
   else{if(!what)continue;const due=w.date||cwLgWhen('tomorrow');items.push({k:'promiseTask',t:cwLgCap(verb)+' '+what,s:'Task for '+(w.date?cwDate(due):'tomorrow')+'. Promised on the call.',due:due.toISOString(),category:/book|organise|organize|arrange/.test(verb)?'Admin':'Admin',conf:'medium',why:x.s.slice(0,90)})}}}
 /* appraisal wanted but no day heard */
 if(prevItems.some(i=>i.k==='appraisalTask')&&!prevItems.some(i=>i.k==='appraisal'))items.push({k:'ask',ask:'appraisal',input:'jn-ask-when',t:'When is the appraisal? GeeVee could not hear a day and time.',s:'',conf:'low',why:cwLgHeard(text,/appraisal|valuation|come out|have a look|worth/i)});
 return items}
function cwLgDecorate(items,text){for(const it of items){if(it.conf){if(it.conf==='low'&&it.on===undefined)it.on=false;continue}
 switch(it.k){case 'appraisal':{const w=cwLgWhenX(text);const s=cwLgSentences(text).find(x=>{const y=cwLgWhenX(x.s);return y.date&&w.date&&cwLocalDay(y.date)===cwLocalDay(w.date)});it.conf=w.conf==='high'?'high':'medium';it.why=s?s.s.slice(0,90):(w.why||'a day and time');break}
  case 'appraisalTask':it.conf='medium';it.why=cwLgHeard(text,/appraisal|valuation|come out|have a look|worth/i);break;
  case 'pack':it.conf='high';it.why='an appraisal is wanted';break;
  case 'coOwner':it.conf='medium';it.why=cwLgHeard(text,new RegExp('\\b'+(it.name||'')+'\\b'));break;
  case 'expect':{const s=cwLgHeard(text,/at least|around|about|hoping|want|looking for|expect/i);const mo=cwLgMoney(s);it.conf=mo&&mo.approx?'medium':'high';it.why=s;break}
  case 'timeframe':it.conf='medium';it.why=cwLgHeard(text,new RegExp((it.tf||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));break;
  case 'confirmSms':it.conf='high';it.why=cwLgHeard(text,/text you|confirmation/i);break;
  case 'followUp':it.conf='high';it.why='standard after an appraisal';break;
  case 'note':it.conf='high';it.why='every call is saved';break;
  default:it.conf=it.conf||'medium'}
 if(it.conf==='low'&&it.on===undefined)it.on=false}
 return items}
const cwLgPrevExtract=cwJnExtractCall;
cwJnExtractCall=function(text,p,d){const prev=cwLgPrevExtract(text,p,d);const extra=cwLgExtract(text,p,d,prev);
 const note=prev.findIndex(i=>i.k==='note');const items=note>=0?[...prev.slice(0,note),...extra,...prev.slice(note)]:[...prev,...extra];
 if(items.some(i=>i.k==='optout'))items.forEach(i=>{if(['confirmSms','promise','inspection','followUp'].includes(i.k)){i.on=false;i.s='Not done: they asked not to be contacted.'}});
 return cwLgDecorate(items,text)};
/* apply the new item kinds */
const cwLgPrevApplyCall=cwJnApplyCall;
cwJnApplyCall=function(items,p,d,transcript){cwLgDedupe(items);const on=k=>items.filter(i=>i.k===k&&i.on!==false);const opt=on('optout')[0];if(opt)items.forEach(i=>{if(['confirmSms','promise','inspection'].includes(i.k))i.on=false});
 const clean=items.filter(i=>i.k!=='ask');const id=cwLgPrevApplyCall(clean,p,d,transcript);const card=cwJnS().cards.find(c=>c.id===id);const push=(t,r)=>card&&card.items.push([t,r]);const first=(p?.name||'').split(' ')[0],me=CW_ME.split(' ')[0];const withdrawn=a=>{(state.gvx??={answered:{},pin:'',withdrawn:{}}).withdrawn[a.id]=true};
 if(opt){p.consent='optout';const x=cwPX(p);x.dnc=true;x.emailOptIn=false;x.smsOptIn=false;(state.cw.comms.unsub??=[]).unshift({id:cwId('US'),contactId:p.id,how:'Asked on a call',channel:'Both',at:cwNowISO(),reason:opt.why});cwContactHistory(p,'Asked not to be contacted (said on a call). Marked do not contact.','GeeVee');audit('consent','Do not contact: '+p.name,'Said on a call: "'+opt.why+'". Applied straight away.');state.tasks.filter(t=>t.status==='Open'&&t.contactId===p.id&&t.category==='Call').forEach(t=>t.status='Done');
  if(opt.lost&&d&&typeof cwLdSetStage==='function'&&!['Sold','For sale','Listed'].includes(d.stage))cwLdSetStage(d,'Lost','not interested, said on the call');push('Marked '+p.name+' as do not contact and closed the call tasks'+(opt.lost&&d?'. '+d.address+' moved to Lost':''),'/contacts/'+p.id)}
 for(const it of on('inspection')){const dd=findD(it.dealId)||d;if(!dd){addTask({title:'Arrange an inspection for '+p.name+' (property to confirm)',contactId:p.id,dealId:'',due:'Today',priority:'High',category:'Call',origin:'Asked on the call: "'+it.why+'"'});push('Added a task to arrange the inspection (property to confirm)','/tasks');continue}
  const ev={id:cwId('EV'),title:'Private inspection: '+dd.address,start:it.when,mins:30,where:cwAddr(dd),kind:'Inspection',contactId:p.id,dealId:dd.id,notes:'Booked by GeeVee from the call. Heard: "'+it.why+'"'};state.cw.events.push(ev);cwContactHistory(p,'Private inspection booked at '+dd.address+' for '+cwDateTime(it.when),'GeeVee');cwPropActivity(dd,'Private inspection booked for '+p.name+', '+cwDateTime(it.when),'GeeVee');
  if(!cwOptedOut(p)){const a=addAction({type:'SMS',title:'Confirm the inspection with '+p.name,body:`Hi ${first}, confirming your inspection of ${dd.address}, ${dd.suburb} on ${new Date(it.when).toLocaleDateString('en-AU',{weekday:'long'})} at ${new Date(it.when).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})}. See you there. ${me}, Collings.`,contactId:p.id,dealId:dd.id,tier:'A2',jn:'inspection'});withdrawn(a)}
  push('Booked a private inspection at '+dd.address+' for '+cwDateTime(it.when)+(cwOptedOut(p)?'':'. Confirmation text on Today for approval'),'/calendar')}
 for(const it of on('inspectionTask')){const dd=findD(it.dealId)||d;addTask({title:'Arrange an inspection for '+p.name+(dd?' at '+dd.address:''),contactId:p.id,dealId:dd?.id||'',due:'Today',priority:'High',category:'Call',origin:'Asked on the call: "'+it.why+'"'});push('Added a task to arrange the inspection','/tasks')}
 for(const it of on('promise')){const a=addAction({type:it.channel,title:(it.channel==='SMS'?'Text ':'Email ')+p.name+': '+it.what+' (promised on the call)',body:it.channel==='SMS'?`Hi ${first}, as promised, here is ${it.what}. ${me}, Collings.`:`Hi ${first},\n\nAs promised on our call, please find ${it.what} attached.\n\nLet me know if you have any questions.\n\n${CW_ME}, Collings Real Estate`,contactId:p.id,dealId:d?.id||'',tier:'A2',jn:'promise'});withdrawn(a);push('Drafted the '+(it.channel==='SMS'?'text':'email')+' you promised ('+it.what+'). It is on Today for approval','/app/today')}
 for(const it of on('promiseTask')){const due=new Date(it.due);addTask({title:it.t,contactId:p.id,dealId:d?.id||'',due:cwLocalDay(due)===cwLocalDay(new Date())?'Today':cwLocalDay(due)===cwLocalDay(new Date(Date.now()+864e5))?'Tomorrow':cwDate(due),dueISO:cwLocalDay(due),priority:'High',category:it.category||'Admin',origin:'Promised on the call: "'+it.why+'"'});push('Task: '+it.t,'/tasks')}
 for(const it of on('offer')){if(it.applied||(typeof cwJ3RecordOffer==='function'&&findD(it.dealId)))continue;const dd=findD(it.dealId)||d;addTask({title:'Record the verbal offer from '+p.name+': '+cwMoney(it.amount)+(it.conditions?.length?' ('+it.conditions.join(', ').toLowerCase()+')':'')+(dd?' on '+dd.address:''),contactId:p.id,dealId:dd?.id||'',due:'Today',priority:'Urgent',category:'Admin',origin:'Heard on the call: "'+it.why+'". Get it in writing before it goes to the vendor.'});push('Noted the verbal offer of '+cwMoney(it.amount)+'. Task to get it in writing','/tasks')}
 for(const it of on('expect')){if(!d||!it.high||it.high===it.amount)continue;const x=cwDX(d);x.expectHigh=it.high;x.expectApprox=!!it.approx}
 return id};
/* call modal: confidence tags, heard text, the "ask" input */
const cwLgPrevCallModal=callModal;
function cwLgDedupe(items){const theirs=items.find(i=>i.k==='offer'&&!i.lg),mine=items.find(i=>i.k==='offer'&&i.lg);if(theirs&&mine){theirs.conf=theirs.conf||mine.conf;theirs.why=theirs.why||mine.why;const at=items.indexOf(mine);if(at>=0)items.splice(at,1)}for(const it of items)if(!it.conf)it.conf='high';return items}
callModal=function(m){if(m.phase==='review'&&m.jnTranscript&&!m.jnItems){const p=findP(m.contactId);m.jnItems=cwJnExtractCall(m.jnTranscript,p,p?cwJnDealFor(p):null)}if(m.jnItems)cwLgDedupe(m.jnItems);let html=cwLgPrevCallModal(m);if(m.phase!=='review'||!m.jnItems)return html;const items=m.jnItems;let i=0;
 return html.replace(/<label class="cw-jn-item">[\s\S]*?<\/label>/g,()=>{const it=items[i],idx=i;i++;if(!it)return '';
  if(it.k==='ask')return `<div class="cw-jn-item cw-lg-ask"><span class="cw-lg-q">?</span><span><b>${h(it.t)}</b>${it.why?`<small class="cw-lg-why">Heard: ${h(it.why)}</small>`:''}<input id="${h(it.input||'jn-ask-when')}" class="field" placeholder="For example Thursday at 2, Sat week arvo, 24/11 10am" value="${h(m.jnAsk?.[it.input]||'')}"></span></div>`;
  const conf=it.conf||'high';return `<label class="cw-jn-item cw-lg-${conf}"><input type="checkbox" data-jn-item="${idx}" ${it.on===false?'':'checked'}><span><b>${h(it.t)} ${conf==='low'?tag('Check','red'):conf==='medium'?tag('Heard','yellow'):''}</b><small>${h(it.s)}</small>${it.why?`<small class="cw-lg-why">${conf==='low'?'Check what was said: ':'Heard: '}"${h(it.why)}"</small>`:''}</span></label>`})};
document.addEventListener('input',e=>{const id=e.target?.id||'';if(id.startsWith('jn-ask-')&&ui.modal){(ui.modal.jnAsk??={})[id]=e.target.value}});
const cwLgPrevDo=doAction;
doAction=function(name,id){if(name==='finishCall'&&ui.modal?.type==='call'){const tr=document.getElementById('jn-transcript')?.value?.trim();if(tr){const p=findP(ui.modal.contactId);const items=cwLgDedupe(cwJnExtractCall(tr,p,p?cwJnDealFor(p):null));ui.modal.jnItems=items;const n=document.getElementById('call-notes');if(n&&!n.value.trim())n.value='Summary by GeeVee: '+items.filter(i=>i.k!=='note'&&i.k!=='ask'&&i.on!==false).map(i=>i.t).join('; ')+(items.some(i=>i.conf==='low')?'. Low confidence items need a check.':'')}}return cwLgPrevDo(name,id)};
const cwLgPrevSaveCall=saveCall;
saveCall=function(pId){const m=ui.modal;const items=m?.jnItems;
 if(items&&m.jnTranscript){const p=findP(pId);const first=(p?.name||'').split(' ')[0];
  for(const it of items.filter(x=>x.k==='ask')){it.on=false;const v=(document.getElementById(it.input)?.value||m.jnAsk?.[it.input]||'').trim();if(!v)continue;const w=cwLgWhenX(v);
   if(!w.date){toast('I could not read "'+v+'" as a day and time'+(w.reason?' ('+w.reason+')':'')+'. Try "Thursday at 2" or "Sat week 10am".');document.getElementById(it.input)?.focus();return}
   if(it.ask==='appraisal'){items.filter(x=>x.k==='appraisalTask').forEach(x=>x.on=false);const d=p?cwJnDealFor(p):null;items.push({k:'appraisal',t:'Book the appraisal: '+CW_LG_WHENFMT(w.date),s:(d?cwAddr(d):'')+' · 30 minutes travel time before it',when:w.date.toISOString(),conf:'high',why:'you typed "'+v+'"'});items.push({k:'followUp',t:'Follow-up call 2 days after the appraisal',s:'Task on Today with the brief',conf:'high',why:'standard after an appraisal'});if(/text you|confirmation/i.test(m.jnTranscript))items.push({k:'confirmSms',t:'Confirmation text to '+first,s:'You promised it on the call. The draft goes to Today for your approval.',conf:'high',why:'promised on the call'})}
   else{items.filter(x=>x.k==='inspectionTask').forEach(x=>x.on=false);const dealId=items.find(x=>x.k==='inspectionTask')?.dealId||'';const dd=findD(dealId);items.push({k:'inspection',t:'Book a private inspection: '+CW_LG_WHENFMT(w.date),s:dd?cwAddr(dd):'Property to confirm',when:w.date.toISOString(),dealId,conf:'high',why:'you typed "'+v+'"'})}}}
 return cwLgPrevSaveCall(pId)};
{const st=document.createElement('style');st.id='cw-lg-style';st.textContent='.cw-lg-why{display:block;color:#687984;font-size:11px;margin-top:3px;font-style:italic}.cw-jn-item.cw-lg-low{background:#fff8ec;border-color:#f0d9a8}.cw-lg-ask{display:flex;gap:10px;align-items:flex-start;background:#eef7f8;border:1px dashed #9fd3d6;border-radius:10px;padding:10px}.cw-lg-ask .field{margin-top:6px;width:100%;max-width:420px}.cw-lg-q{display:inline-flex;width:22px;height:22px;border-radius:50%;background:#0e8790;color:#fff;align-items:center;justify-content:center;font-weight:700;flex:none}.cw-lg-list{margin:6px 0 0;padding-left:18px;font-size:13px}';document.head.appendChild(st)}
/* ---------- 4. Ask GeeVee ---------- */
function cwLgAddrNorm(s){return cwLgNorm(s).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').replace(/\b(st)\b/g,'street').replace(/\b(rd)\b/g,'road').replace(/\b(ave|av)\b/g,'avenue').replace(/\b(cres)\b/g,'crescent').replace(/\b(dr)\b/g,'drive').replace(/\b(ct)\b/g,'court').replace(/\b(pl)\b/g,'place').replace(/\b(pde)\b/g,'parade').replace(/\b(tce)\b/g,'terrace').replace(/\b(hwy)\b/g,'highway').replace(/\b(blvd)\b/g,'boulevard').trim()}
function cwLgDeals(text){const l=' '+cwLgAddrNorm(text)+' ';const exact=[],loose=[];
 for(const d of cwProps()){const a=cwLgAddrNorm(d.address);const parts=a.split(' ');const num=parts.filter(x=>/^\d/.test(x)).join(' ');const street=parts.filter(x=>!/^\d/.test(x)).join(' ');if(!street)continue;
  const full=(num?num+' ':'')+street;if(l.includes(' '+full+' '))exact.push({d,span:full});else if(l.includes(' '+street+' ')&&!new RegExp('\\d+ '+street).test(l))loose.push({d,span:street})}
 return exact.length?exact:loose}
function cwLgPeople(text){let l=' '+cwLgNorm(text).replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ')+' ';for(const x of cwLgDeals(text))l=l.replace(' '+x.span+' ',' ');
 const all=cwContacts();const norm=n=>cwLgNorm(n).replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
 const full=all.filter(p=>l.includes(' '+norm(p.name)+' '));if(full.length)return{list:full,span:norm(full[0].name)};
 const by=all.filter(p=>{const [f,...r]=norm(p.name).split(' ');return l.includes(' '+f+' ')||(r.length&&l.includes(' '+r.join(' ')+' '))});
 const f=by.length?(l.includes(' '+norm(by[0].name).split(' ')[0]+' ')?norm(by[0].name).split(' ')[0]:norm(by[0].name).split(' ').slice(1).join(' ')):'';return{list:by,span:f}}
const cwLgA=(label,type,id)=>({label,type,id:id||''});
function cwLgAskWho(q,r,what){const names=r.list.slice(0,4);return{text:'Which '+cwLgCap(r.span)+(what?' for '+what:'')+': '+names.map(p=>p.name+' ('+p.suburb+')').join(' or ')+'?',actions:names.map(p=>cwLgA(p.name,'gvChatPrompt',q.replace(new RegExp('\\b'+r.span+'\\b','i'),p.name)))}}
function cwLgAskWhich(q,ds){const list=ds.slice(0,4);return{text:'Which property: '+list.map(x=>x.d.address+', '+x.d.suburb).join(' or ')+'?',actions:list.map(x=>cwLgA(x.d.address,'gvChatPrompt',q.replace(new RegExp('\\b'+x.span+'\\b','i'),x.d.address)))}}
function cwLgPerson(q,text,what){const r=cwLgPeople(text);if(!r.list.length)return{ask:{text:'Who do you mean'+(what?' for '+what:'')+'? Give me a name from the contacts.',actions:[cwLgA('Contacts','cwGo','/contacts')]}};if(r.list.length>1)return{ask:cwLgAskWho(q,r,what)};return{p:r.list[0],span:r.span}}
function cwLgDeal(q,text){const ds=cwLgDeals(text);if(!ds.length)return{};if(ds.length>1)return{ask:cwLgAskWhich(q,ds)};return{d:ds[0].d,span:ds[0].span}}
function cwLgCtxDeal(){const r=ui.route==='cw'?cwParse(ui.cwRoute||'').path:'';const m=r.match(/^\/(?:collings-)?properties\/(D-[^/?]+)/);if(m&&findD(m[1]))return findD(m[1]);if(ui.modal?.type==='deal'&&findD(ui.modal.id))return findD(ui.modal.id);if(ui.gvxLastDeal&&findD(ui.gvxLastDeal))return findD(ui.gvxLastDeal);return null}
function cwLgDue(w){const day=cwLocalDay(w),t=cwLocalDay(new Date()),tm=cwLocalDay(new Date(Date.now()+864e5));return{due:day===t?'Today':day===tm?'Tomorrow':cwDate(w),dueISO:day}}
function cwLgUncalled(p){return cwProps().filter(d=>d.contactId===p.id&&d.stage==='New lead'&&!cwDX(d).called)&&p.callStatus!=='contacted'&&cwProps().some(d=>d.contactId===p.id&&d.stage==='New lead'&&!cwDX(d).called)}
function cwLgCard(title,done,opts){cwJnSnap();const id=cwJnCard(title,done,opts);audit('auto','GeeVee: '+title,done.map(x=>x[0]).join('. '));persist();return id}
function cwLgIntent(l){l=cwLgNorm(l).replace(/[?!.]+$/,'').trim();
 if(/^(?:add|put|save|write|leave|make)(?: a)? note\b|^note\b/.test(l))return 'note';
 if(/^remind me\b|^set (?:a )?reminder\b|^reminder\b/.test(l))return 'remind';
 if(/^(?:task|todo|to-do|to do|add (?:a )?task|new task|create (?:a )?task)\b/.test(l))return 'task';
 if(/what'?s on\b|what is on\b|^my (?:day|diary|calendar|schedule)\b|what do i have (?:on|today|tomorrow)|^(?:any )?appointments\b|what'?s (?:in|on) (?:my|the) (?:diary|calendar)/.test(l))return 'whatson';
 if(/who (?:hasn'?t|has not|haven'?t|still needs? to|do i still need to|needs?) (?:been )?(?:called|contacted|call|ring)|not (?:been )?called|uncalled|still (?:need|have|got) to call|who'?s (?:left|overdue) to call/.test(l))return 'uncalled';
 if(/\boverdue\b|\bpast due\b|\blate tasks\b/.test(l))return 'overdue';
 if(/^(?:book|schedule|arrange|set up|put in|lock in)\b.*\b(?:inspection|viewing|look through|private inspection)\b/.test(l))return 'inspection';
 if(/^(?:mark|flag|set|record|log)\b.*\b(?:as )?(?:called|contacted)\b|^(?:i )?(?:called|rang|phoned|spoke to|spoke with|just called)\b|^log (?:a |the )?call\b/.test(l))return 'called';
 if(/^(?:move|put|change|set|progress|bump|shift)\b.*\b(?:to|into|as)\s+(?:the )?(?:stage )?(?:new lead|connected|appraisal|proposal|authority|listed|for sale|on market|sold|lost|withdrawn)\b/.test(l))return 'stage';
 if(/^(?:text|sms|message|txt)\b|^send (?:a |an )?(?:text|sms|message)\b/.test(l))return 'text';
 if(/^email\b|^send (?:an |a )?email\b|^draft (?:an |a )?email\b/.test(l))return 'email';
 if(/how many (?:enquir|offer|view|buyer|open home|inspection|attendee|save|message)/.test(l))return 'howmany';
 if(/\bgci\b|commission (?:earned|so far|this year|to date)|how much (?:have i|did i|i'?ve) (?:earned|made|billed|written)|my earnings|how am i tracking/.test(l))return 'gci';
 if(/^(?:call|ring|phone|dial)\s+\S/.test(l))return 'call';
 if(/^(?:open|show|go to|pull up|bring up|find|look up|take me to|show me|where is|where'?s)\s+\S/.test(l))return 'open';
 return ''}
function cwLgChat(q){const raw=String(q||'').trim();const l=cwLgNorm(raw).replace(/[?!.]+$/,'').trim();const intent=cwLgIntent(l);if(!intent)return null;const me=CW_ME.split(' ')[0];let m;
 switch(intent){
 case 'note':{m=l.match(/^(?:add|put|save|write|leave|make)(?: a)? note (?:to|on|for|about|against) (.+?)(?::|,| that | saying | - |\s-\s)\s*(.+)$/)||l.match(/^note (?:to|on|for|about) (.+?)(?::|,| that | saying )\s*(.+)$/)||l.match(/^note:?\s*(.+?)(?::|,| that | saying )\s*(.+)$/);
  if(!m){const r=cwLgPeople(l);if(!r.list.length)return{text:'Who is the note for, and what should it say? For example "add a note to Helen: wants to list in March".'};return{text:'What should the note on '+r.list[0].name+' say?'}}
  const who=cwLgPerson(raw,m[1],'the note');if(who.ask)return who.ask;const p=who.p;const text=cwLgCap(raw.slice(raw.length-m[2].length).trim()||m[2]);
  (cwPX(p).notes??=[]).unshift({id:cwId('CN'),text,kind:'Contact',by:CW_ME+' via GeeVee',at:cwNowISO()});const prev=p.note||'';p.note=text+(prev?'\nPrevious: '+prev:'');cwContactHistory(p,'Note added: '+text);
  let extra='';const tf=text.match(/\b(?:list|sell|selling|listing|go to market|on the market)\b[^.]*?\b(january|february|march|april|may|june|july|august|september|october|november|december|new year|christmas|spring|autumn|winter|summer|next year|next month|\d+ months?)\b/i);const d=cwJnDealFor(p);if(tf&&d){cwDX(d).timeframe=tf[1];extra=' Selling time frame "'+tf[1]+'" saved on '+d.address+'.'}
  const cid=cwLgCard('Note on '+p.name,[['Added a note to '+p.name+': '+text,'/contacts/'+p.id+'?tab=notes']].concat(extra?[['Time frame saved: '+tf[1],'/properties/'+d.id]]:[]),{contactId:p.id,dealId:d?.id});
  return{text:'Added a note to '+p.name+': "'+text+'".'+extra,actions:[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id),cwLgA('Notes','cwGo','/contacts/'+p.id+'?tab=notes'),cwLgA('What I did','cwJnShow',cid)]}}
 case 'remind':{const body=l.replace(/^(?:remind me|set (?:a )?reminder|reminder)\s*(?:to|that|about|:)?\s*/,'');const w=cwLgWhenX(body);if(!w.date){const ds=cwLgDeals(body);return{text:'When should I remind you'+(w.reason?' ('+w.reason+')':'')+'? For example "Friday", "tomorrow 9am" or "Sat week".',actions:[cwLgA('Tomorrow 9am','gvChatPrompt',raw+' tomorrow 9am'),cwLgA('Friday','gvChatPrompt',raw+' Friday')]}}
  const rest=body.replace(new RegExp(w.why.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),' ').replace(/\b(?:on|at|by|to)\s*$/,'').replace(/^\s*(?:on|at|by)\s+/,'').replace(/\s+/g,' ').trim();
  let p=null;const r=cwLgPeople(rest);if(r.list.length>1)return cwLgAskWho(raw,r,'the reminder');if(r.list.length===1)p=r.list[0];const dd=cwLgDeal(raw,rest);if(dd.ask)return dd.ask;const d=dd.d||(p?cwJnDealFor(p):null);
  let title=cwLgCap((rest||'Reminder').replace(/^(?:to )/,''));if(p&&r.span)title=title.replace(new RegExp('\\b'+r.span+'\\b','i'),p.name);if(!title.trim())title='Reminder';
  const due=cwLgDue(w.date);const id=addTask({title,contactId:p?.id||'',dealId:d?.id||'',due:due.due,dueISO:due.dueISO,dueAt:w.date.toISOString(),priority:'High',category:/call|ring|phone/.test(rest)?'Call':/email|send|text/.test(rest)?'Admin':'Admin',origin:'Reminder set in Ask GeeVee: "'+raw+'"'});
  const cid=cwLgCard('Reminder',[['Reminder for '+cwDateTime(w.date)+': '+title,'/tasks']],{contactId:p?.id,dealId:d?.id});
  return{text:'Reminder set for '+cwDateTime(w.date)+': '+title+'.'+(w.conf!=='high'&&!w.hasTime?' I used '+w.date.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})+' as no time was given.':''),actions:[cwLgA('Open tasks','cwGo','/tasks')].concat(p?[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]:[]).concat([cwLgA('What I did','cwJnShow',cid)])}}
 case 'task':{const body=raw.replace(/^(?:task|todo|to-do|to do|add (?:a )?task|new task|create (?:a )?task)\s*[:\-]?\s*/i,'').trim();if(!body)return{text:'What is the task? For example "task: send Jordan the Section 32 tomorrow".'};
  const w=cwLgWhenX(body);const r=cwLgPeople(body);if(r.list.length>1)return cwLgAskWho(raw,r,'the task');const p=r.list[0]||null;const dd=cwLgDeal(raw,body);if(dd.ask)return dd.ask;const d=dd.d||(p?cwJnDealFor(p):null);
  let title=cwLgCap(body);if(p&&r.span)title=title.replace(new RegExp('\\b'+r.span+'\\b','i'),p.name);
  const due=w.date?cwLgDue(w.date):{due:'Today',dueISO:cwLocalDay(new Date())};
  addTask({title,contactId:p?.id||'',dealId:d?.id||'',due:due.due,dueISO:due.dueISO,dueAt:w.date?w.date.toISOString():'',priority:'Normal',category:/call|ring|phone/i.test(body)?'Call':'Admin',origin:'Added in Ask GeeVee'});
  const cid=cwLgCard('Task added',[['Task: '+title+' (due '+due.due+')','/tasks']],{contactId:p?.id,dealId:d?.id});
  return{text:'Task added: '+title+', due '+due.due+(p?', linked to '+p.name:'')+(d?' and '+d.address:'')+'.'+(!w.date?' No date given, so it is due today.':''),actions:[cwLgA('Open tasks','cwGo','/tasks')].concat(p?[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]:[]).concat([cwLgA('What I did','cwJnShow',cid)])}}
 case 'whatson':{const w=cwLgWhenX(l.replace(/what'?s on|what is on|my (?:day|diary|calendar|schedule)/,''));const day=w.date||new Date();const key=cwLocalDay(day);const evs=(typeof cwEventsAll==='function'?cwEventsAll():state.cw.events).filter(e=>cwLocalDay(e.start)===key);const tasks=state.tasks.filter(t=>t.status==='Open'&&(t.dueISO===key||(key===cwLocalDay(new Date())&&/today|now/i.test(t.due||''))));
  const label=key===cwLocalDay(new Date())?'today':key===cwLocalDay(new Date(Date.now()+864e5))?'tomorrow':day.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short'});
  const lines=evs.slice(0,8).map(e=>new Date(e.start).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})+' '+e.title+(e.where?' ('+e.where+')':''));
  return{text:(evs.length?evs.length+' in the diary '+label+':\n'+lines.join('\n'):'Nothing in the diary '+label+'.')+(tasks.length?'\n'+tasks.length+' task'+(tasks.length>1?'s':'')+' due.':''),actions:[cwLgA('Open calendar','cwGo','/calendar'),cwLgA('Tasks','cwGo','/tasks'),cwLgA('Today','route','today')]}}
 case 'uncalled':{const leads=cwRuleOpenLeads().sort((a,b)=>cwRuleLeft(a)-cwRuleLeft(b));if(!leads.length)return{text:'Every seller lead has been called.',actions:[cwLgA('Seller leads','cwGo','/seller-leads')]};
  const lines=leads.slice(0,6).map(d=>{const left=cwRuleLeft(d);return personName(d.contactId)+', '+d.address+' ('+(left<=0?'overdue '+Math.round(-left)+'h':Math.max(1,Math.round(left))+'h left')+')'});
  return{text:leads.length+' seller lead'+(leads.length>1?'s':'')+' not called yet:\n'+lines.join('\n'),actions:[cwLgA('Call '+personName(leads[0].contactId).split(' ')[0],'call',leads[0].contactId),cwLgA('Seller leads','cwGo','/seller-leads')]}}
 case 'overdue':{const t0=cwLocalDay(new Date());const ts=state.tasks.filter(t=>t.status==='Open'&&(/now|overdue/i.test(t.due||'')||(t.dueISO&&t.dueISO<t0)));if(!ts.length)return{text:'No overdue tasks.',actions:[cwLgA('Open tasks','cwGo','/tasks')]};
  return{text:ts.length+' overdue task'+(ts.length>1?'s':'')+':\n'+ts.slice(0,6).map(t=>t.title+(t.contactId?' ('+personName(t.contactId)+')':'')).join('\n')+(ts.length>6?'\nand '+(ts.length-6)+' more':''),actions:[cwLgA('Open tasks','cwGo','/tasks')].concat(ts[0].contactId?[cwLgA('Open '+personName(ts[0].contactId).split(' ')[0],'openPerson',ts[0].contactId)]:[])}}
 case 'inspection':{const dd=cwLgDeal(raw,l);if(dd.ask)return dd.ask;let d=dd.d||null;const rest=dd.span?l.replace(dd.span,' '):l;const who=cwLgPerson(raw,rest.replace(/\b(?:book|schedule|arrange|set up|put in|lock in)\b|\b(?:an? )?(?:private )?(?:inspection|viewing|look through)\b|\bfor\b|\bwith\b/g,' '),'the inspection');if(who.ask)return who.ask;const p=who.p;
  if(!d){d=cwLgCtxDeal();if(!d)return{text:'Which property is the inspection at? Give me the address, for example "9 Rose Avenue".'}}
  const w=cwLgWhenX(rest.replace(new RegExp('\\b'+who.span+'\\b'),' '));if(!w.date)return{text:'When is the inspection for '+p.name+' at '+d.address+(w.reason?' ('+w.reason+')':'')+'? For example "Saturday 11am".',actions:[cwLgA('Saturday 11am','gvChatPrompt',raw+' Saturday 11am')]};
  const ev={id:cwId('EV'),title:'Private inspection: '+d.address,start:w.date.toISOString(),mins:30,where:cwAddr(d),kind:'Inspection',contactId:p.id,dealId:d.id,notes:'Booked by GeeVee from Ask GeeVee: "'+raw+'"'};state.cw.events.push(ev);cwContactHistory(p,'Private inspection booked at '+d.address+' for '+cwDateTime(w.date),'GeeVee');cwPropActivity(d,'Private inspection booked for '+p.name+', '+cwDateTime(w.date),'GeeVee');
  const done=[['Booked a private inspection at '+d.address+' for '+cwDateTime(w.date),'/calendar']];let sms='';
  if(cwOptedOut(p))sms=' No text: '+p.name+' is marked do not contact.';else{const a=addAction({type:'SMS',title:'Confirm the inspection with '+p.name,body:`Hi ${p.name.split(' ')[0]}, confirming your inspection of ${d.address}, ${d.suburb} on ${w.date.toLocaleDateString('en-AU',{weekday:'long'})} at ${w.date.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})}. See you there. ${me}, Collings.`,contactId:p.id,dealId:d.id,tier:'A2',jn:'inspection'});(state.gvx??={answered:{},pin:'',withdrawn:{}}).withdrawn[a.id]=true;done.push(['Drafted a confirmation text. It is on Today for approval','/app/today']);sms=' A confirmation text is on Today for your approval.'}
  const cid=cwLgCard('Inspection for '+p.name,done,{contactId:p.id,dealId:d.id});
  return{text:'Booked a private inspection for '+p.name+' at '+d.address+', '+cwDateTime(w.date)+'.'+(w.conf!=='high'&&!w.hasTime?' No time was given, so I used '+w.date.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})+'.':'')+sms,actions:[cwLgA('Open calendar','cwGo','/calendar'),cwLgA('Today','route','today'),cwLgA('What I did','cwJnShow',cid)]}}
 case 'called':{const who=cwLgPerson(raw,l.replace(/\b(?:mark|flag|set|record|log|as|called|contacted|i|just|rang|phoned|spoke|to|with|a|the|call)\b/g,' '),'the call');if(who.ask)return who.ask;const p=who.p;
  p.callStatus='contacted';p.lastContact='Just now';const leads=cwProps().filter(d=>d.contactId===p.id&&d.stage==='New lead'&&!cwDX(d).called);leads.forEach(d=>{cwDX(d).called=true;cwPropActivity(d,'Seller lead called (marked in Ask GeeVee)')});
  const closed=state.tasks.filter(t=>t.status==='Open'&&t.contactId===p.id&&t.category==='Call'&&!/follow up/i.test(t.title));closed.forEach(t=>t.status='Done');cwContactHistory(p,'Marked as called');
  const cid=cwLgCard('Call logged: '+p.name,[['Marked '+p.name+' as called','/contacts/'+p.id]].concat(leads.map(d=>[d.address+' is off the 24-hour clock','/seller-leads'])).concat(closed.length?[['Closed '+closed.length+' call task'+(closed.length>1?'s':''),'/tasks']]:[]),{contactId:p.id,dealId:leads[0]?.id});
  return{text:'Marked '+p.name+' as called.'+(leads.length?' '+leads.map(d=>d.address).join(' and ')+' is off the 24-hour clock.':'')+(closed.length?' Closed '+closed.length+' call task'+(closed.length>1?'s':'')+'.':''),actions:[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id),cwLgA('Seller leads','cwGo','/seller-leads'),cwLgA('What I did','cwJnShow',cid)]}}
 case 'stage':{m=l.match(/\b(?:to|into|as)\s+(?:the )?(?:stage )?(new lead|connected|appraisal|proposal|authority|listed|for sale|on market|sold|lost|withdrawn)\b/);const map={'new lead':'New lead',connected:'Connected',appraisal:'Appraisal',proposal:'Proposal',authority:'Authority',listed:'Listed','for sale':'For sale','on market':'For sale',sold:'Sold',lost:'Lost',withdrawn:'Lost'};const stage=map[m[1]];
  const dd=cwLgDeal(raw,l.replace(m[0],' '));if(dd.ask)return dd.ask;let d=dd.d;if(!d){const who=cwLgPeople(l.replace(m[0],' '));if(who.list.length===1)d=cwJnDealFor(who.list[0]);if(who.list.length>1)return cwLgAskWho(raw,who,'the stage change')}
  if(!d)return{text:'Which property should move to '+stage+'? Give me the address.'};if(d.stage===stage)return{text:d.address+' is already at '+stage+'.',actions:[cwLgA('Open property','openDeal',d.id)]};
  const from=d.stage;cwLdSetStage(d,stage,'Ask GeeVee');const cid=cwLgCard('Stage change: '+d.address,[['Moved '+d.address+' from '+from+' to '+stage,'/properties/'+d.id]],{dealId:d.id,contactId:d.contactId});
  return{text:'Moved '+d.address+' from '+from+' to '+stage+'.',actions:[cwLgA('Open property','openDeal',d.id),cwLgA('Pipeline','cwGo','/prospects'),cwLgA('What I did','cwJnShow',cid)]}}
 case 'text':{const body=raw.replace(/^(?:text|sms|message|txt)\s+|^send (?:a |an )?(?:text|sms|message)\s+(?:to\s+)?/i,'').trim();const who=cwLgPerson(raw,body.split(/\b(?:that|saying|to say|:|,)\b/)[0].split(' ').slice(0,3).join(' '),'the text');if(who.ask)return who.ask;const p=who.p;
  let msg=body.replace(new RegExp('^.*?\\b'+who.span+'\\b\\s*','i'),'').replace(/^(?:that|saying|to say|and say|:|,|-)\s*/i,'').trim();if(!msg)return{text:'What should the text to '+p.name+' say?'};
  if(cwOptedOut(p))return{text:p.name+' is marked do not contact, so I did not draft a text.',actions:[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]};
  const lead=cwProps().find(d=>d.contactId===p.id&&d.stage==='New lead'&&!cwDX(d).called);if(lead&&p.callStatus!=='contacted')return{text:p.name+' is a new seller lead ('+lead.address+') who has not been called yet. New seller leads always get a call first, so I did not draft a text. Call now?',actions:[cwLgA('Call '+p.name.split(' ')[0],'call',p.id),cwLgA('Seller leads','cwGo','/seller-leads')]};
  const text=`Hi ${p.name.split(' ')[0]}, ${cwLgCap(msg).replace(/[.]?$/,'.')} ${me}, Collings.`;const d=cwJnDealFor(p);const a=addAction({type:'SMS',title:'Text to '+p.name,body:text,contactId:p.id,dealId:d?.id||'',tier:'A2'});(state.gvx??={answered:{},pin:'',withdrawn:{}}).withdrawn[a.id]=true;
  return{text:'Drafted a text to '+p.name+': "'+text+'" It is on Today for your approval. Nothing is sent until you approve it.',actions:[cwLgA('Today','route','today'),cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]}}
 case 'email':{const body=raw.replace(/^(?:email|send (?:an |a )?email(?: to)?|draft (?:an |a )?email(?: to)?)\s+/i,'').trim();let p=null,d=null;const dd=cwLgDeal(raw,body);if(dd.ask)return dd.ask;d=dd.d||null;
  if(/^(?:the )?(?:vendor|owner|seller)s?\b/i.test(body)){if(!d)d=cwLgCtxDeal();if(!d)return{text:'Which property\'s vendor? Give me the address, for example "email the vendor of 9 Rose Avenue the weekly report".'};p=findP(d.contactId)}
  else{const who=cwLgPerson(raw,body.split(/\b(?:that|saying|about|the|:|,)\b/)[0],'the email');if(who.ask)return who.ask;p=who.p;if(!d)d=cwJnDealFor(p)}
  if(!p)return{text:'I could not find the vendor for '+d.address+'.'};if(cwOptedOut(p))return{text:p.name+' is marked do not contact, so I did not draft an email.',actions:[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]};
  const lead=cwProps().find(x=>x.contactId===p.id&&x.stage==='New lead'&&!cwDX(x).called);if(lead&&p.callStatus!=='contacted'&&!d)return{text:p.name+' is a new seller lead who has not been called yet, so I did not draft an email. Call first.',actions:[cwLgA('Call '+p.name.split(' ')[0],'call',p.id)]};
  const first=p.name.split(' ')[0];let subject,text;
  if(/weekly (?:report|update)|vendor report|campaign (?:report|update)|week'?s update/i.test(body)&&d){const x=cwDX(d);const enq=state.cw.enquiries.filter(e=>e.dealId===d.id).length+state.messages.filter(mm=>mm.dealId===d.id).length;const oh=state.cw.openHomes.filter(o=>o.dealId===d.id);const att=oh.reduce((a,o)=>a+(o.attendees||[]).length,0);const offers=(state.offers||[]).filter(o=>o.dealId===d.id).length;
   subject='Weekly campaign report: '+d.address;text=`Hi ${first},\n\nHere is this week's update for ${d.address}, ${d.suburb}.\n\nPortal views: ${x.views||0}\nSaved by buyers: ${x.saves||0}\nEnquiries: ${enq}\nOpen home attendees: ${att} across ${oh.length} session${oh.length===1?'':'s'}\nOffers: ${offers}\nDays on market: ${x.dom||0}\n\nI will call you to talk through buyer feedback and the next steps.\n\n${CW_ME}, Collings Real Estate`}
  else{const what=body.replace(new RegExp('^.*?\\b(?:'+(p.name.split(' ')[0].toLowerCase())+'|vendor|owner|seller)s?\\b\\s*(?:of\\s+'+(dd.span||'x').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')?\\s*','i'),'').replace(/^(?:that|saying|about|:|,|-)\s*/i,'').trim();if(!what)return{text:'What should the email to '+p.name+' say?'};subject=cwLgCap(what).slice(0,60);text=`Hi ${first},\n\n${cwLgCap(what).replace(/[.]?$/,'.')}\n\n${CW_ME}, Collings Real Estate`}
  const a=addAction({type:'Email',title:'Email to '+p.name+': '+subject,body:text,contactId:p.id,dealId:d?.id||'',tier:'A2'});(state.gvx??={answered:{},pin:'',withdrawn:{}}).withdrawn[a.id]=true;
  return{text:'Drafted the email to '+p.name+(d?' about '+d.address:'')+' ("'+subject+'"). It is on Today for your approval.',actions:[cwLgA('Today','route','today')].concat(d?[cwLgA('Open property','openDeal',d.id)]:[]).concat([cwLgA('Open '+first,'openPerson',p.id)])}}
 case 'howmany':{const dd=cwLgDeal(raw,l);if(dd.ask)return dd.ask;const d=dd.d||cwLgCtxDeal();if(!d)return{text:'Which property? Give me the address, for example "how many enquiries on 9 Rose Avenue".'};const x=cwDX(d);
  const enq=state.cw.enquiries.filter(e=>e.dealId===d.id),pend=enq.filter(e=>e.status==='Pending').length,msgs=state.messages.filter(mm=>mm.dealId===d.id&&!enq.some(e=>e.msgId===mm.id)).length;const offers=(state.offers||[]).filter(o=>o.dealId===d.id);const oh=state.cw.openHomes.filter(o=>o.dealId===d.id);const att=oh.reduce((a,o)=>a+(o.attendees||[]).length,0);
  let text;if(/offer/.test(l))text=d.address+' has '+offers.length+' offer'+(offers.length===1?'':'s')+(offers.length?' ('+offers.filter(o=>o.status==='New').length+' new)':'')+'.';else if(/view|save/.test(l))text=d.address+': '+(x.views||0)+' portal views, '+(x.saves||0)+' saves.';else if(/open home|attendee|inspection/.test(l))text=d.address+': '+att+' attendees across '+oh.length+' open home'+(oh.length===1?'':'s')+'.';else text=d.address+' has '+(enq.length+msgs)+' enquir'+(enq.length+msgs===1?'y':'ies')+(pend?' ('+pend+' pending)':'')+'.';
  return{text,actions:[cwLgA('Enquiries','cwGo','/properties/'+d.id+'?tab=enquiries'),cwLgA('Open property','openDeal',d.id)]}}
 case 'gci':{const earned=(state.cw.settlements||[]).reduce((a,s)=>a+(s.commission||0),0),target=state.cw.settings.gciTarget||0;const st=typeof stats==='function'?stats():{};
  return{text:'GCI this financial year: '+cwMoney(earned)+(target?' of '+cwMoney(target)+' target ('+Math.round(earned/target*100)+'%)':' (no target set)')+'.'+(st.potential?' Pipeline potential '+cwMoney(Math.round(st.potential))+'.':''),actions:[cwLgA('My performance','cwGo','/my-performance'),cwLgA(target?'Change target':'Set target','cwGciTarget','')]}}
 case 'call':{const who=cwLgPerson(raw,l.replace(/^(?:call|ring|phone|dial)\s+/,''),'the call');if(who.ask)return who.ask;const p=who.p;
  if(cwOptedOut(p)&&!cwProps().some(d=>d.contactId===p.id&&d.stage==='New lead'))return{text:p.name+' is marked do not contact. I did not start a call.',actions:[cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]};
  const lead=cwProps().find(d=>d.contactId===p.id&&d.stage==='New lead'&&!cwDX(d).called);setTimeout(()=>doAction('call',p.id),0);
  return{text:'Opening the call with '+p.name+' on the DOMA line.'+(lead?' Seller lead at '+lead.address+', '+Math.max(0,Math.round(cwRuleLeft(lead)))+'h left on the 24-hour rule.':'')+' GeeVee listens and does the work when you finish.',actions:[cwLgA('Call '+p.name.split(' ')[0],'call',p.id),cwLgA('Open '+p.name.split(' ')[0],'openPerson',p.id)]}}
 case 'open':{const body=l.replace(/^(?:open|show me|show|go to|pull up|bring up|find|look up|take me to|where is|where'?s)\s+(?:the\s+)?(?:my\s+)?/,'');const pg=cwLgPage(body);if(pg&&!cwLgDeals(body).length){setTimeout(()=>cwGo(pg.route),0);return{text:'Opening '+pg.name+'.',actions:[cwLgA('Open '+pg.name,'cwGo',pg.route)]}}
  const ds=cwLgDeals(body);if(ds.length>1)return cwLgAskWhich(raw,ds);
  if(ds.length===1){const d=ds[0].d;const route='/properties/'+d.id;setTimeout(()=>cwGo(route),0);return{text:'Opened '+d.address+', '+d.suburb+' ('+d.stage+', '+personName(d.contactId)+').',actions:[cwLgA('Property','cwGo',route),cwLgA('Owner','openPerson',d.contactId)]}}
  const r=cwLgPeople(body);if(r.list.length>1)return cwLgAskWho(raw,r,'');if(r.list.length===1){const p=r.list[0];const route='/contacts/'+p.id;setTimeout(()=>cwGo(route),0);const d=cwJnDealFor(p);return{text:'Opened '+p.name+' ('+p.role+', '+p.suburb+').'+(d?' Linked property: '+d.address+'.':''),actions:[cwLgA('Contact','cwGo',route)].concat(d?[cwLgA('Property','openDeal',d.id)]:[])}}
  return null}}
 return null}
const cwLgPrevChat=gvChatAnswer;
gvChatAnswer=function(q){let r=null;try{r=cwLgChat(q)}catch(e){console.warn('cwLg chat',e)}if(r){if(ui.gvChatOpen!==undefined)r.actions=r.actions||[];return r}return cwLgPrevChat(q)};
/* ---------- 5. Page finding ---------- */
const CW_LG_PAGES=[[/\bdiary\b|\bcalendar\b/,'Calendar','/calendar'],[/\bmy listings?\b|\blistings\b|\bstock\b|\bmy properties\b/,'Properties','/properties'],[/\bvendors?\b|\bseller leads?\b|\bnew leads?\b/,'Seller leads','/seller-leads'],[/\bbuyers?\b/,'Buyers','/buyers'],[/\bcomms\b|\bcommunications?\b/,'Communications','/communications'],[/\bauthorit(?:y|ies)\b|\bsales authority\b|\bagreements?\b/,'eSign agreements','/esign/agreements'],[/\be-?sign\b|\bsigning\b/,'eSign','/esign'],[/\bprice statement\b|\bproperty price statement\b|\bsoi\b|\bstatement of information\b|\bpps\b/,'Property Price Statement (compliance tab)','/properties/1?tab=compliance'],[/\bsettings?\b/,'Settings','/settings'],[/\bkpis?\b/,'KPIs','/kpi'],[/\bleaderboard\b/,'Leaderboard','/leaderboard/sales'],[/\bopen homes?\b|\bofis?\b|\bopens\b|\bopen for inspections?\b|\binspections\b/,'Inspections','/inspections'],[/\bappraisals?\b/,'Appraisal submissions','/appraisal-submissions'],[/\btasks?\b|\bto[- ]?dos?\b/,'Tasks','/tasks'],[/\benquir(?:y|ies)\b|\bleads\b/,'Leads (enquiries)','/leads?tab=enquiries'],[/\boffers\b/,'Offers','/leads?tab=offers'],[/\bpipeline\b/,'Leads pipeline','/leads-pipeline'],[/\bcontacts?\b|\bpeople\b/,'Contacts','/contacts'],[/\bdatabase\b|\bthe db\b/,'Database','/database'],[/\bnotifications?\b/,'Notifications','/notifications'],[/\bperformance\b/,'My performance','/my-performance'],[/\bprospects?\b/,'Prospects','/prospects'],[/\bcampaigns?\b/,'Communications (campaigns)','/communications?tab=campaigns'],[/\bdocuments?\b/,'Documents','/documents'],[/\bcommissions?\b/,'Commissions','/commissions']];
function cwLgPage(l){for(const [re,name,route] of CW_LG_PAGES)if(re.test(l))return{name,route};return null}
const cwLgPrevFind=cwFindPage;
cwFindPage=function(text){const l=cwLgNorm(text).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();if(!l)return null;
 const intent=cwLgIntent(l);if(intent&&intent!=='open'&&intent!=='whatson')return null;
 const page=cwLgPage(l);if(page)return page;
 if(cwLgDeals(l).length||cwLgPeople(l).list.length)return null;
 return cwLgPrevFind(text)};
/* test hooks */
window.cwLgTest={when:(t,b)=>{const d=cwLgWhen(t,b?new Date(b):new Date());return d?cwLocalDay(d)+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):null},whenX:(t,b)=>{const x=cwLgWhenX(t,b?new Date(b):new Date());return{...x,date:x.date?x.date.toISOString():null}},money:cwLgMoney,commission:cwLgCommission,method:cwLgMethod,marketing:cwLgMarketing,recap:cwJnParseRecap,extract:(t,pid)=>{const p=findP(pid);return cwLgDedupe(cwJnExtractCall(t,p,p?cwJnDealFor(p):null))},chat:q=>gvChatAnswer(q),find:cwFindPage,intent:cwLgIntent,st:()=>state,ui:()=>ui,log:()=>gvP().chat.slice(-1)[0]};
