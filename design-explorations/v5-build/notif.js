<script>
/* ==== v5 (Nov 25): notifications, the top bar's bell. Behaves as production's (sp-fe nav-bar and notifications component,
   and sp-ux-service's inbox), in v5's styles:
   - One inbox per user: the last 30 days, at most 12, newest first. The copy is QOM's own per type (the payload has no title).
   - The bell shows a count of unread ones. Opening it marks them all read, so the count goes at once; the unread dots stay
     until the panel closes, so you can see which are new.
   - A row opens what it's about: the quote (created, duplicated, freight calculated, prepayment), the import page (imports),
     or, for a freight failure, a dialog with M3's reason. The other types aren't clickable.
   - Hover or focus shows a delete button; deleting updates the count too (production's badge misses it).
   - A new notification shakes the bell and adds to the count (production does this only for some types).
   Changed from today, on purpose: an empty state instead of a disabled bell, an outcome icon (done or failed) in place of the
   read tick, and dates written out ("Nov 25, 2026 · 2:08 PM"). Mock data only; demo-bar "Notifications" sets the list. */
(function(){
const q=s=>document.querySelector(s);
const bell=q("#tnBell"), badge=q("#tnBadge"), wrap=q(".tnav-bell"); if(!bell||!wrap) return;
const BUILT="6000024967";
/* production's copy per type (notifications.component.ts); go: "quote" | "import" | "freightfail" | null */
const T={
  quote_created:   {m:"The quote has been successfully created.",        ok:true,  go:"quote"},
  quote_dup:       {m:"The quote has been successfully duplicated.",     ok:true,  go:"quote"},
  quote_updated:   {m:"The quote has been successfully updated.",        ok:true,  go:null},
  quote_upd_fail:  {m:"An error occurred while updating the quote.",     ok:false, go:null},
  freight_ok:      {m:"Freight cost has been successfully calculated for", ok:true, go:"quote"},
  freight_fail:    {m:"An error occurred when calculating the freight cost.", ok:false, go:"freightfail"},
  docs_ok:         {m:"Document has been successfully created for",      ok:true,  go:null},
  import_done:     {m:"Client import has been completed.",               ok:true,  go:"import"},
};
const d=(day,h,mi)=>new Date(2026,10,day,h,mi);
const SEED=()=>[
  {id:7,t:"freight_ok",   q:BUILT,        at:d(25,14,8),  read:false},
  {id:6,t:"docs_ok",      q:"6000024922", at:d(25,11,42), read:false},
  {id:5,t:"freight_fail", q:"6000024756", at:d(24,16,15), read:true, why:"No carrier service covers the delivery ZIP code."},
  {id:4,t:"quote_upd_fail",q:BUILT,       at:d(24,9,40),  read:true},
  {id:3,t:"import_done",  q:"",           at:d(21,17,2),  read:true},
  {id:2,t:"quote_created",q:BUILT,        at:d(20,9,39),  read:true},
  {id:1,t:"quote_dup",    q:"6000024922", at:d(18,15,20), read:true},
];
let N=SEED(), nextId=8, open=false;
const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const when=t=>`${MO[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()} · ${((t.getHours()+11)%12)+1}:${String(t.getMinutes()).padStart(2,"0")} ${t.getHours()<12?"AM":"PM"}`;
const IC_OK=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/></svg>`;
const IC_BAD=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5M12 16.5h.01"/></svg>`;
const IC_DEL=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>`;
const IC_BELL=`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`;
const panel=document.createElement("div"); panel.className="tnmenu tnnotif"; panel.id="tnNotif"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Notifications"); panel.hidden=true;
wrap.append(panel);
const live=document.createElement("div"); live.className="sr"; live.setAttribute("aria-live","polite"); wrap.append(live);
function setBadge(){ const n=N.filter(x=>!x.read).length; badge.hidden=!n; badge.textContent=n>9?"9+":n;
  bell.setAttribute("aria-label",n?`Notifications, ${n} unread`:"Notifications"); bell.title=n?`${n} unread notification${n>1?"s":""}`:"Notifications"; }
function render(){
  const rows=N.map(x=>{ const k=T[x.t], go=k.go, label=`${k.m}${x.q?` Quote ${x.q}`:""}`;
    const body=`<span class="nic ${k.ok?"ok":"bad"}">${k.ok?IC_OK:IC_BAD}<span class="sr">${k.ok?"Done: ":"Failed: "}</span></span>
      <span class="ntx"><span class="nwhen">${x.fresh?`<i class="ndot" aria-hidden="true"></i><span class="sr">New, </span>`:""}${when(x.at)}</span>
      <span class="nmsg">${k.m}</span>${x.q?`<span class="nq">#&nbsp;${x.q}</span>`:""}</span>`;
    return `<li class="nrow${x.fresh?" fresh":""}" data-n="${x.id}">${go?`<button type="button" class="nmain" data-go="${go}" title="${go==="quote"?"Open quote "+x.q:go==="import"?"Open the import":"See why"}">${body}</button>`:`<div class="nmain" tabindex="-1">${body}</div>`}
      <button type="button" class="ndel" data-del="${x.id}" aria-label="Delete notification: ${label}" title="Delete">${IC_DEL}</button></li>`; }).join("");
  panel.innerHTML=`<div class="nhead"><h2>Notifications</h2><span>Last 30 days</span></div>`+
    (N.length?`<ul class="nlist">${rows}</ul>`:`<div class="nempty">${IC_BELL}<b>No notifications</b><span>Quote, freight and import updates from the last 30 days show here.</span></div>`); }
function openP(){ if(open) return; q("#tnMenu")&&!q("#tnMenu").hidden&&document.body.click();
  N.forEach(x=>{ x.fresh=!x.read; x.read=true; }); /* production marks all read as the menu opens (one PATCH each) */
  setBadge(); render(); panel.hidden=false; open=true; bell.setAttribute("aria-expanded","true");
  (panel.querySelector(".nmain[data-go],.ndel")||panel).focus?.(); }
function closeP(focus){ if(!open) return; open=false; panel.hidden=true; bell.setAttribute("aria-expanded","false"); N.forEach(x=>x.fresh=false); if(focus) bell.focus(); }
bell.addEventListener("click",ev=>{ ev.stopPropagation(); open?closeP():openP(); });
document.addEventListener("click",ev=>{ if(!ev.target.closest(".tnav-bell")&&!ev.target.closest("#tnFfDlg")) closeP(); });
panel.addEventListener("keydown",ev=>{ if(ev.key==="Escape"){ ev.preventDefault(); ev.stopPropagation(); closeP(true); return; }
  if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ const items=[...panel.querySelectorAll("button")], i=items.indexOf(document.activeElement); if(!items.length) return;
    ev.preventDefault(); items[(i+(ev.key==="ArrowDown"?1:-1)+items.length)%items.length].focus(); } });
panel.addEventListener("click",ev=>{ ev.stopPropagation();
  const del=ev.target.closest("[data-del]");
  if(del){ const id=+del.dataset.del, li=del.closest(".nrow"), nxt=li.nextElementSibling||li.previousElementSibling;
    N=N.filter(x=>x.id!==id); setBadge(); li.remove(); live.textContent="Notification deleted";
    if(!N.length){ render(); panel.focus(); } else (nxt?.querySelector(".nmain[data-go]")||nxt?.querySelector(".ndel"))?.focus(); return; }
  const m=ev.target.closest(".nmain[data-go]"); if(!m) return; const x=N.find(y=>y.id===+m.closest(".nrow").dataset.n);
  if(m.dataset.go==="import"){ closeP(); showToast("Import tools isn't built in the prototype."); return; }
  if(m.dataset.go==="freightfail"){ freightDlg(x); return; }
  closeP();
  if(x.q!==BUILT){ showToast(`Only quote ${BUILT} is built in the prototype.`); return; }
  if(!["page-quotes","page-home","page-create"].some(c=>document.body.classList.contains(c))){ showToast(`You're on quote ${BUILT}.`); return; }
  document.body.classList.remove("page-create"); setPage("quote"); });
/* production: "Get Freight Failed" (GeneralConfirmationComponent) with the message, M3's first error cause and OK */
function freightDlg(x){ closeP(); let w=q("#tnFfDlg"); if(!w){ w=document.createElement("div"); w.className="dlgwrap"; w.id="tnFfDlg"; document.body.append(w); }
  w.innerHTML=`<div class="dlg tnffdlg" role="alertdialog" aria-modal="true" aria-labelledby="ffT" aria-describedby="ffD"><h2 id="ffT">Freight wasn't calculated</h2>
    <p class="dlgtx" id="ffD">M3 couldn't calculate freight for quote ${x.q}.<span class="ffwhy"><b>Reason from M3</b>${esc(x.why||"No reason given.")}</span></p>
    <div class="dlgbtns"><button type="button" class="dbtn yes" id="ffOk">OK</button></div></div>`;
  w.hidden=false; const done=()=>{ w.hidden=true; bell.focus(); };
  q("#ffOk").onclick=done; q("#ffOk").focus();
  w.onkeydown=e=>{ if(e.key==="Escape"||e.key==="Tab"){ e.preventDefault(); if(e.key==="Escape") done(); } };
  w.onclick=e=>{ if(e.target===w) done(); }; }
/* a new one arrives over the WebSocket: it goes on top (the list keeps 12), the count goes up and the bell shakes */
const PUSH=[["quote_updated",BUILT],["freight_ok",BUILT],["quote_created",BUILT],["docs_ok",BUILT]]; let pi=0;
function push(){ const [t,qn]=PUSH[pi++%PUSH.length]; N.unshift({id:nextId++,t,q:qn,at:new Date(),read:false}); N=N.slice(0,12); setBadge();
  if(open){ N[0].fresh=true; N[0].read=true; setBadge(); render(); }
  bell.classList.remove("shake"); void bell.offsetWidth; bell.classList.add("shake"); live.textContent=`New notification: ${T[t].m}`; }
/* ---- demo bar: after "Top navigation bar" ---- */
const tl=q("#tnOn")?.closest("label");
if(tl){ const s=document.createElement("span"); s.className="ntdemo";
  s.innerHTML=`<label title="v5 only, with the top navigation bar: the mock notifications. Production has no empty state; here the bell still opens.">Notifications
    <select id="tnNSet" autocomplete="off"><option value="some">7 (2 unread)</option><option value="none">None</option></select></label>
    <button type="button" class="pbtn" id="tnNPush" title="v5 only: a new notification arrives, as over production's WebSocket. Turn on the top navigation bar to see it.">New notification</button>`;
  tl.after(s);
  q("#tnNSet").addEventListener("change",e=>{ N=e.target.value==="none"?[]:SEED(); closeP(); setBadge(); });
  q("#tnNPush").addEventListener("click",push); }
setBadge();
})();
</script>
