<script>
/* ==== v5 (Nov 23): the Quote Page Proposal and global search, layered on v4 ====
   Built by design-explorations/v5-build/mkv5.py from v4; v4 itself is built from v2. Nothing here changes v2 or v4.
   It reuses v2's own functions (setPTab, PT_FORMS, openSend, sendAction, pdfHtml, QL, ...) and wraps a few of them. */
(function(){
const P={on:true,fold:false,assoc:false};
try{ P.on=localStorage.getItem("qom-v5-proposal")!=="off"; }catch(e){}
const q=s=>document.querySelector(s);
const IC={
  warn:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', /* Lucide clock */
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  form:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke-linecap="round"/></svg>',
  doc:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5v4h4"/></svg>',
  x:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  user:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  folder:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/></svg>',
  quote:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M6 2.5h8l4 4v15H6z"/><path d="M9 11h6M9 15h6" stroke-linecap="round"/></svg>',
  order:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
  lock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="margin-right:12px;align-self:center;opacity:.55"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
};
const e_=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const title=s=>String(s).toLowerCase().replace(/(^|[\s&-])([a-z])/g,(m,a,b)=>a+b.toUpperCase());
const fmtDate=t=>{ if(!t) return "—"; const d=pDate(t); return isNaN(d)?t:d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); };

/* ---------- header: title row with Preview PDF and •••, then the key facts ---------- */
const h1=q("#quoteTitle"), tabs=q(".main > .tabs"), more=q("#qMoreBtn");
const tr=document.createElement("div"); tr.className="ptitle"; h1.before(tr); tr.append(h1);
const acts=document.createElement("div"); acts.className="pacts"; acts.innerHTML=`<button type="button" class="btn ghost" id="pPdfBtn">${IC.doc}Preview PDF</button>`; tr.append(acts);
const ptype=document.createElement("span"); ptype.className="ptype"; h1.after(ptype);
const facts=document.createElement("div"); facts.className="pfacts"; facts.setAttribute("aria-label","Key facts about this quote"); q(".main > p.sub").after(facts);
/* trimmed (Sam, Nov 23): only what tells the SC which quote this is. Order type is a tag by the title; expiry shows only when it needs action
   (7 days or less, or past); requested delivery and status stay in Details, where the late-date alerts and Things to fix already point */
function renderFacts(){
  if(!TF) return;
  const exp=pDate(QI.expires), days=Math.round((exp-new Date(new Date().toDateString()))/864e5);
  const cust=(TF.cust||"").split(" - ").pop();
  const f=(k,l,v)=>`<button type="button" data-pgo="${k}" title="${l} · edit in Details" aria-label="${l}: ${e_(v)}"><b>${e_(v)}</b></button>`;
  const ex=days>7?"":`<button type="button" class="pexp${days<0?" past":""}" data-pgo="exp" title="Expiration date · ${fmtDate(QI.expires)}">${IC.warn||""}${days>1?"Expires in "+days+" days":days===1?"Expires tomorrow":days===0?"Expires today":"Expired "+fmtDate(QI.expires)}</button>`;
  facts.innerHTML=f("cust","Customer",title(cust)+" (USC)")+(TF.proj?`<span class="psep" aria-hidden="true">·</span>`+f("proj","Project",TF.proj):"")+ex;
  const ot=S.view==="commercial"?"Commercial":S.view==="residential"?"Residential":(TF.otype||""); ptype.textContent=ot; ptype.hidden=!ot; /* follows the View switch, like the expiry */
}

/* ---------- the tool column: Search and Details ---------- */
const tools=document.createElement("nav"); tools.className="ptools"; tools.setAttribute("aria-label","Quote tools");
tools.innerHTML=`<a href="#" class="ptab ptool" data-ptab="4">${IC.search}<span>Search</span></a><a href="#" class="ptab ptool" data-ptab="5" aria-describedby="pDotLbl">${IC.form}<span>Details</span><span class="pdot" id="pDot" hidden></span><span class="sr" id="pDotLbl"></span></a>`;
q("#work").prepend(tools);

/* Details: every field from the four tabs, grouped by job. Each field's markup comes from v2's own forms, so it stays in step with them */
const SECS=[["cust","Customer",["cust","aspec"]],["bill","Bill to",["payer","billto","po"]],["ship","Ship to",["addr","shipto","svc","acc"]],
  ["quote","Quote",["desc","proj","otype","osub","status","rdd","conv","exp"]],["team","Team",["sc","scadd","resp","cost"]]];
const ORIG={0:PT_FORMS[0],1:PT_FORMS[1],2:PT_FORMS[2],3:PT_FORMS[3]};
function fieldMap(){ const m={}, tmp=document.createElement("div");
  [0,1,2,3].forEach(i=>{ tmp.innerHTML=ORIG[i](); [...tmp.children].forEach(el=>{ const f=el.querySelector('[id^="pf-"]'); const k=f?f.id.slice(3):el.classList.contains("pf-addwrap")?"scadd":null; if(k&&!m[k]) m[k]=el.outerHTML; }); });
  return m; }
const secOf=k=>(SECS.find(s=>s[2].includes(k))||[])[0];
function missingKeys(){ return [...(SEND.addr?[]:["addr"]),...reqMissing().map(x=>x[0])]; }
PT_FORMS[5]=()=>{ const m=fieldMap(), miss=new Set(missingKeys().map(secOf));
  const nav=`<div class="pf wide dnav" role="navigation" aria-label="Details sections">${SECS.map(([id,t],i)=>`<button type="button" data-dsec="${id}"${i?"":' aria-current="true"'}>${t}${miss.has(id)?'<span class="sdot" aria-label="needs a field before sending"></span>':""}</button>`).join("")}</div>`;
  return nav+SECS.map(([id,t,keys])=>`<div class="pf wide dsech" id="dsec-${id}"><h3>${t}</h3></div>`+keys.map(k=>m[k]||"").join("")
    +(id==="cust"?(P.assoc?["p2","p3","p4","p5","p6"].map(k=>m[k]||"").join(""):`<div class="pf wide"><button type="button" class="dmore" data-dassoc>+ Add associated party</button></div>`):"")).join("")+`<div class="pf wide dspacer" aria-hidden="true"></div>`; };
PT_NAMES[5]="Quote details";

function refreshTools(){
  const n=missingKeys().length, d=q("#pDot"); d.hidden=!n; q("#pDotLbl").textContent=n?`${n} field${n>1?"s":""} needed before you send`:"";
  renderFacts();
}
function applyFold(){ document.body.classList.toggle("prop-fold",P.on&&P.fold); if(typeof fitPanes==="function") fitPanes(); if(typeof placeBar==="function") placeBar(); }

/* wrap v2: the field tabs all open Details; opening a tool unfolds the column */
const oSetPTab=setPTab;
setPTab=function(n){ if(P.on&&n>=0&&n<=3) n=5; if(!P.on&&n===5) n=4; if(P.on&&P.fold){ P.fold=false; applyFold(); } oSetPTab(n); };
const oRenderQuote=renderQuote;
renderQuote=function(){ oRenderQuote.apply(this,arguments); if(P.on) refreshTools(); };
/* Things to fix: a missing field is in Details now, not on a tab */
const oSendItems=sendItems;
sendItems=function(){ const it=oSendItems.apply(this,arguments); if(!P.on) return it;
  const names=Object.fromEntries(SECS.map(([id,t])=>[id,t]));
  return it.map(x=>x.id&&x.id.startsWith("f-")?{...x,d:`Required in Details · ${names[secOf(x.id.slice(2))]||"Quote"}`}:x); };
/* Before you send folds the open tool, so the quote keeps its width */
const oOpenSend=openSend;
openSend=function(){ oOpenSend.apply(this,arguments); if(P.on&&!P.fold){ P.fold=true; applyFold(); } };

document.addEventListener("click",ev=>{
  if(!P.on) return;
  const t=ev.target.closest("a.ptool"); if(t){ ev.preventDefault(); ev.stopPropagation(); const n=+t.dataset.ptab;
    if(S.ptab===n&&!P.fold){ P.fold=true; applyFold(); } else { if(P.fold){ P.fold=false; applyFold(); } setPTab(n); if(n===4) q("#q")?.focus(); }
    t.focus(); return; }
  const g=ev.target.closest("[data-pgo]"); if(g){ goField(g.dataset.pgo); return; }
  const s=ev.target.closest("[data-dsec]"); if(s){ const el=q("#dsec-"+s.dataset.dsec); dPick={id:s.dataset.dsec,t:Date.now()}; fitDspacer(); if(s.dataset.dsec===SECS[0][0]){ const v=q("#ptView"); if(!v) return; if(v.scrollHeight>v.clientHeight&&getComputedStyle(v).overflowY!=="visible") v.scrollTop=0; else v.scrollIntoView({block:"start"}); } else el?.scrollIntoView({block:"start"}); syncDnav(); return; }
  if(ev.target.closest("[data-dassoc]")){ P.assoc=true; renderPTab(); q("#pf-p2")?.focus(); return; }
  if(ev.target.closest("#pPdfBtn")){ openPdf(); return; }
},true);
/* the tab for the section in view is current; a clicked tab stays current even when its section is too short to reach the top */
let dPick=null;
/* Team is the last and shortest section: a spacer after it lets it scroll up to the tabs like the others */
function fitDspacer(){ const sp=q(".dspacer"), last=[...document.querySelectorAll(".dsech")].pop(); if(!sp||!last) return;
  const v=q("#ptView"), own=v&&getComputedStyle(v).overflowY!=="visible"&&v.scrollHeight>v.clientHeight-1;
  const view=own?v.clientHeight:window.innerHeight-(q("#pbar")?.offsetHeight||0);
  sp.style.height="0px"; const h=sp.getBoundingClientRect().top-last.getBoundingClientRect().top;
  sp.style.height=Math.max(0,view-h-parseFloat(getComputedStyle(last).scrollMarginTop||0))+"px"; }
function syncDnav(){ const nav=q(".dnav"); if(!nav) return; const secs=[...document.querySelectorAll(".dsech")].filter(x=>x.getClientRects().length||x.id==="dsec-"+SECS[0][0]); if(!secs.length) return;
  let id; if(dPick&&Date.now()-dPick.t<700) id=dPick.id;
  else { const line=nav.getBoundingClientRect().bottom+20; id=secs[0].id.slice(5); secs.forEach(x=>{ if(x.getBoundingClientRect().top<=line) id=x.id.slice(5); });
    const v=q("#ptView"); if(v&&v.scrollHeight>v.clientHeight&&v.scrollTop+v.clientHeight>=v.scrollHeight-2) id=secs[secs.length-1].id.slice(5); }
  nav.querySelectorAll("[data-dsec]").forEach(b=>b.setAttribute("aria-current",b.dataset.dsec===id?"true":"false")); }
let dRaf=0; document.addEventListener("scroll",()=>{ if(!P.on||dRaf) return; dRaf=requestAnimationFrame(()=>{ dRaf=0; syncDnav(); }); },true);
function goField(k){ setPTab(5); const el=q("#pf-"+k); if(el){ el.scrollIntoView({block:"center"}); el.focus({preventScroll:true}); } }

/* ---------- PDF preview: opens over the page ---------- */
const pdf=document.createElement("div"); pdf.className="pdfdlg"; pdf.hidden=true;
pdf.innerHTML=`<div class="pdfcard" role="dialog" aria-modal="true" aria-labelledby="pdfT"><div class="pdfhd"><h2 id="pdfT">Sales quote PDF · preview</h2><button type="button" class="xbtn" id="pdfX" aria-label="Close preview">${IC.x}</button></div><div class="pdfbody" id="pdfBody"></div></div>`;
document.body.append(pdf);
function openPdf(){ q("#pdfBody").innerHTML=pdfHtml(); pdf.hidden=false; q("#pdfX").focus(); }
function closePdf(){ pdf.hidden=true; q("#pPdfBtn").focus(); }
pdf.addEventListener("click",ev=>{ if(ev.target===pdf||ev.target.closest("#pdfX")) closePdf(); });

/* ---------- global search ---------- */
const gs=document.createElement("button"); gs.type="button"; gs.className="gsbtn"; gs.id="gsBtn"; gs.setAttribute("aria-haspopup","dialog");
gs.innerHTML=`${IC.search}<span class="gsl">Search</span><kbd>${/Mac|iPhone|iPad/.test(navigator.platform)?"⌘":"Ctrl "}K</kbd>`;
gs.setAttribute("aria-label","Search clients, projects, quotes and orders");
/* full or folded rail: under the wordmark; phone-width top bar: inside the bar, on the right */
function placeGs(){ const top=q(".railtop"); if(document.documentElement.classList.contains("topnav")){ if(gs.parentNode!==top) top.append(gs); } else if(gs.previousElementSibling!==top) top.after(gs); }
placeGs(); new MutationObserver(placeGs).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
const pal=document.createElement("div"); pal.className="gsdlg"; pal.hidden=true;
pal.innerHTML=`<div class="gspal" role="dialog" aria-modal="true" aria-label="Search QOM"><div class="gsin">${IC.search}<input id="gsQ" type="text" role="combobox" aria-expanded="true" aria-controls="gsList" aria-autocomplete="list" placeholder="Search clients, projects, quotes and orders" autocomplete="off"><kbd>Esc</kbd></div><div class="gslist" id="gsList" role="listbox" aria-label="Results"></div><div class="gsfoot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span>Mock data</span></div></div>`;
document.body.append(pal);
/* the index: built from the Quotes list's mock rows */
const IDX=(()=>{ const out=[], seen=new Set();
  QL.rows.forEach(r=>{ out.push({g:"Quotes",t:`${r.id} · ${title(r.cust)}`,m:`${r.desc} · ${r.type}`,id:r.id,kind:"quote"});
    if(!seen.has("c"+r.cust)){ seen.add("c"+r.cust); out.push({g:"Clients",t:title(r.cust),m:"Client",kind:"client"}); }
    if(r.project&&r.project!=="-"&&!seen.has("p"+r.project+r.cust)){ seen.add("p"+r.project+r.cust); out.push({g:"Projects",t:r.project,m:title(r.cust),kind:"project"}); }
    if(r.m3) out.push({g:"Orders",t:`Order ${r.m3}`,m:`${title(r.cust)} · from quote ${r.id}`,kind:"order"}); });
  return out; })();
const GROUPS=["Clients","Projects","Quotes","Orders"];
const RECENT=()=>[IDX.find(x=>x.id==="6000024967"),IDX.find(x=>x.kind==="client"&&x.t==="Quality Finishes"),IDX.find(x=>x.kind==="project"),IDX.filter(x=>x.kind==="quote")[3],IDX.find(x=>x.kind==="order")].filter(Boolean);
let gsHits=[], gsCur=0, gsFrom=null;
function gsMatch(x,words){ const hay=(x.t+" "+x.m).toLowerCase(); const w=hay.split(/[^a-z0-9]+/).filter(Boolean); return words.every(t=>w.some(y=>y.startsWith(t))); }
const hl=(s,words)=>{ let h=e_(s); words.forEach(t=>{ h=h.replace(new RegExp("(^|[^a-z0-9])("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"$1<mark>$2</mark>"); }); return h; };
function gsRender(){ const v=q("#gsQ").value.trim().toLowerCase(), words=v.split(/\s+/).filter(Boolean), L=q("#gsList");
  if(!words.length){ gsHits=RECENT(); L.innerHTML=`<div class="gsgrp">Recent</div>`+gsHits.map((x,i)=>item(x,i,[])).join(""); }
  else { gsHits=[]; let html="";
    GROUPS.forEach(g=>{ const hs=IDX.filter(x=>x.g===g&&gsMatch(x,words)).slice(0,5); if(!hs.length) return; html+=`<div class="gsgrp" role="presentation">${g}</div>`+hs.map(x=>{ gsHits.push(x); return item(x,gsHits.length-1,words); }).join(""); });
    L.innerHTML=html||`<div class="gsnone">No clients, projects, quotes or orders match "${e_(v)}".</div>`; }
  gsCur=Math.min(gsCur,Math.max(0,gsHits.length-1)); gsSel(); }
function item(x,i,words){ const ic={client:IC.user,project:IC.folder,quote:IC.quote,order:IC.order}[x.kind];
  return `<button type="button" class="gsit" role="option" id="gsi${i}" data-gsi="${i}" aria-selected="false"><span class="gsic">${ic}</span><span class="gst">${hl(x.t,words)}</span><span class="gsm">${hl(x.m,words)}</span></button>`; }
function gsSel(){ document.querySelectorAll(".gsit").forEach(b=>b.setAttribute("aria-selected",String(+b.dataset.gsi===gsCur))); const c=q("#gsi"+gsCur); q("#gsQ").setAttribute("aria-activedescendant",c?c.id:""); c?.scrollIntoView({block:"nearest"}); }
function gsOpen(){ if(!P.on) return; gsFrom=document.activeElement; pal.hidden=false; q("#gsQ").value=""; gsCur=0; gsRender(); q("#gsQ").focus(); }
function gsClose(){ pal.hidden=true; (gsFrom&&gsFrom.isConnected?gsFrom:gs).focus(); }
function gsGo(x){ if(!x) return; gsClose();
  const onQuote=!document.body.classList.contains("page-quotes")&&!document.body.classList.contains("page-create");
  if(x.kind==="quote"&&x.id==="6000024967"){ if(onQuote){ showToast("You're on quote 6000024967."); return; } leaveCreate(); setPage("quote"); return; }
  const go=()=>showToast(`Opening ${x.kind==="quote"?"quote "+x.id:x.t} isn't built in the prototype.`);
  if(onQuote&&S.dirty) guard(go); else go(); }
gs.addEventListener("click",gsOpen);
pal.addEventListener("click",ev=>{ if(ev.target===pal){ gsClose(); return; } const b=ev.target.closest("[data-gsi]"); if(b) gsGo(gsHits[+b.dataset.gsi]); });
pal.addEventListener("mousemove",ev=>{ const b=ev.target.closest("[data-gsi]"); if(b&&+b.dataset.gsi!==gsCur){ gsCur=+b.dataset.gsi; gsSel(); } });
q("#gsQ").addEventListener("input",()=>{ gsCur=0; gsRender(); });
q("#gsQ").addEventListener("keydown",ev=>{
  if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ ev.preventDefault(); if(!gsHits.length) return; gsCur=(gsCur+(ev.key==="ArrowDown"?1:-1)+gsHits.length)%gsHits.length; gsSel(); }
  else if(ev.key==="Enter"){ ev.preventDefault(); gsGo(gsHits[gsCur]); }
  else if(ev.key==="Escape"){ ev.preventDefault(); ev.stopPropagation(); gsClose(); }
  else if(ev.key==="Tab"){ ev.preventDefault(); } });
document.addEventListener("keydown",ev=>{
  if(P.on&&(ev.metaKey||ev.ctrlKey)&&!ev.altKey&&ev.key.toLowerCase()==="k"){ ev.preventDefault(); pal.hidden?gsOpen():gsClose(); return; }
  if(ev.key==="Escape"&&!pdf.hidden){ ev.preventDefault(); ev.stopPropagation(); closePdf(); }
},true);

/* leaving a quote with unsaved changes: Save, Discard or Stay */
function guard(then){ const n=typeof linesChanged==="function"?linesChanged():0;
  const d=document.createElement("div"); d.className="dlgwrap gsguard";
  d.innerHTML=`<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="gdT" aria-describedby="gdD"><h2 id="gdT">Leave this quote?</h2><p id="gdD" class="dlgwhat" style="margin:0 0 24px">${n?n+" line"+(n>1?"s":"")+" changed":"Your changes"} on quote 6000024967 ${n===1?"isn't":"aren't"} saved.</p><div class="dlgbtns"><button type="button" class="btn ghost" data-gd="stay">Stay</button><button type="button" class="btn ghost" data-gd="discard">Discard and leave</button><button type="button" class="btn" data-gd="save">Save and leave</button></div></div>`;
  document.body.append(d); d.querySelector('[data-gd="save"]').focus();
  d.addEventListener("click",ev=>{ const b=ev.target.closest("[data-gd]"); if(!b&&ev.target!==d) return; const k=b?b.dataset.gd:"stay"; d.remove();
    if(k==="save"){ saveQuote(); then(); } else if(k==="discard"){ discardChanges(); then(); } else gs.focus(); });
  d.addEventListener("keydown",ev=>{ if(ev.key==="Escape"){ ev.stopPropagation(); d.remove(); gs.focus(); } }); }

/* ---------- new quote: one short step (Quotes list → Create new) ---------- */
const nc=document.createElement("section"); nc.id="ncPage"; nc.setAttribute("aria-labelledby","ncT"); q("#quotesPage").after(nc);
const fld=(id,l,v,o={})=>`<div class="pf${o.wide?" wide":""}"><div class="pf-l"><label for="nc-${id}">${l}${o.req?" *":""}</label></div><div class="pf-box${o.lock?" lock":""}">${o.sel?`<select id="nc-${id}">${o.sel.map(x=>`<option${x===v?" selected":""}>${x}</option>`).join("")}</select>${PI.caret}`:`<input id="nc-${id}" value="${e_(v)}"${o.ph?` placeholder="${o.ph}"`:""}${o.lock?" readonly aria-readonly=\"true\"":""}>${o.lock?IC.lock:""}`}</div>${o.note?`<span class="pf-hint">${o.note}</span>`:""}</div>`;
function renderNc(busy){ nc.innerHTML=`<form class="nccard" id="ncForm" aria-labelledby="ncT"><h1 id="ncT" tabindex="-1">New quote</h1><p class="ncsub">These create the quote in M3. Everything else can wait.</p>
  <div class="ncgrid">
    ${fld("cust","Customer","10000418 - QUALITY FINISHES",{req:1})}${fld("spec","Primary Specifier Contact (optional)","Dana Whitfield · Whitfield Design Studio",{note:"Needed before sending"})}
    ${fld("otype","Order Type","Residential",{req:1,lock:1,note:"Set by the customer's warehouse (USR)"})}${fld("osub","Order Subtype","US Domestic",{req:1,sel:["US Domestic","US Export"],note:"Narrowed by the customer's country"})}
    ${fld("rdd","Requested Delivery Date","12/19/2026",{req:1,note:"Orders entered after 3pm ET can't be requested for today."})}${fld("conv","Est. Conv. Date","11/30/2026",{req:1})}
    ${fld("proj","Project (optional)","",{ph:"Choose a project",note:"Needed before sending a Commercial quote"})}
  </div>
  <div class="ncdef"><div><b>Filled in for you.</b> Change these later in Details. The expiry is fixed.</div><div class="dl"><span>Responsible <b>Alex Rivera (you)</b></span><span>Payer <b>Same as customer</b></span><span>Sales Consultant <b>The customer's salesperson in M3</b></span><span>Cost Center <b>Their showroom</b></span><span>Status <b>Predictable (&gt;95%)</b></span><span>Expires <b>in 30 days</b></span></div></div>
  <div class="ncacts"><button type="button" class="btn ghost" id="ncDiscard"${busy?" disabled":""}>Discard</button><button type="submit" class="btn" id="ncCreate"${busy?' aria-disabled="true"':""}>${busy?'<span class="ncspin" aria-hidden="true"></span>Creating the quote in M3…':"Create quote"}</button></div></form>`; }
function openCreate(){ renderNc(false); document.body.classList.add("page-create"); scrollTo(0,0); q("#ncT").focus(); }
function leaveCreate(){ document.body.classList.remove("page-create"); }
nc.addEventListener("click",ev=>{ if(ev.target.closest("#ncDiscard")){ leaveCreate(); setPage("quotes"); } });
nc.addEventListener("submit",ev=>{ ev.preventDefault(); if(q("#ncCreate").getAttribute("aria-disabled")==="true") return; renderNc(true);
  setTimeout(()=>{ leaveCreate(); const sc=q("#scenario"); sc.value="fresh"; sc.dispatchEvent(new Event("change",{bubbles:true})); setPage("quote"); setPTab(4); q("#q")?.focus();
    barToast("Quote 6000024967 created","Add a room, then products. Details marks what's needed before you send."); },1400); }); // M3 confirms over a websocket a moment after Create
document.addEventListener("click",ev=>{ if(ev.target.closest("#propNew")){ ev.preventDefault(); if(!P.on){ P.on=true; const w=q("#propOn"); if(w) w.checked=true; try{ localStorage.setItem("qom-v5-proposal","on"); }catch(e){} apply(); } openCreate(); return; } if(P.on&&ev.target.closest("#qlNew")){ ev.preventDefault(); ev.stopPropagation(); openCreate(); } },true);
const oSetPage=setPage; setPage=function(p){ leaveCreate(); return oSetPage.apply(this,arguments); };

/* ---------- the switch in the demo bar ---------- */
function apply(){
  document.body.classList.toggle("proposal",P.on);
  if(P.on){ acts.append(more); } else { tabs.append(more); P.fold=false; if(S.ptab===5) oSetPTab(4); leaveCreate(); if(!pal.hidden) gsClose(); }
  if(P.on&&S.ptab>=0&&S.ptab<=3) setPTab(5);
  if(P.on&&S.qview!=="products"&&typeof setQView==="function") setQView("products");
  document.querySelectorAll("a.ptool").forEach(t=>t.classList.toggle("cur",+t.dataset.ptab===S.ptab));
  applyFold(); placeExpand(); renderQuote(); }
/* the quote panel's expand button sits in the title row between Preview PDF and ••• (Sam, Nov 23), so the panel loses its empty top row.
   In full view the title row is covered, so it goes back to v2's floating "Exit full view" spot */
function placeExpand(){ const eb=q("#expandBtn"); if(!eb) return;
  if(P.on&&!S.expanded){ if(more.parentNode===acts) acts.insertBefore(eb,more); else acts.append(eb); }
  else if(eb.parentNode!==q("#qTop")) q("#qTop").append(eb); }
const oSetExpanded=setExpanded;
setExpanded=function(){ const r=oSetExpanded.apply(this,arguments); placeExpand(); if(!S.expanded&&P.on) q("#expandBtn")?.focus({preventScroll:true}); return r; };
/* settled behaviour is the rule in v5, not a demo-bar choice (Sam, Nov 23): search runs as you type, Spartan components are on, stock shows
   in results, price doesn't (it needs an M3 call per item), and discontinued and in-development items are hidden only by More filters' own
   "Hide…" checkbox. The inputs stay (hidden) because v2's code reads and sets them */
[["liveSearch",true],["spSkin",true],["showStock",true],["showPrice",false],["showDisc",null]].forEach(([id,v])=>{ const c=q("#"+id); if(!c) return;
  if(v!==null&&c.checked!==v){ c.checked=v; c.dispatchEvent(new Event("change",{bubbles:true})); c.dispatchEvent(new Event("click",{bubbles:true})); }
  const l=c.closest("label"); if(l) l.hidden=true; });
document.documentElement.classList.add("sp"); S.stock=true; S.price=false;
const sw=q("#propOn"); if(sw){ sw.checked=P.on; sw.addEventListener("change",()=>{ P.on=sw.checked; try{ localStorage.setItem("qom-v5-proposal",P.on?"on":"off"); }catch(e){} apply(); }); }
apply();
})();
</script>
