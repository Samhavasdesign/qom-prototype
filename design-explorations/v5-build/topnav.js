<script>
/* ==== v5 (Nov 25): top navigation bar, a trial (see topnav.css). The demo bar's "Top navigation bar" switch turns it on;
   off by default, remembered in the browser. It reuses the side nav's own icons and actions: Quotes opens the Quotes list,
   Search opens global search (the side nav's Search button), New quote opens the one-step New quote form, Log out opens the same
   sign-out dialog. Search and New quote sit in the right-hand group (Sam, Nov 25), so the links have room. */
(function(){
const q=s=>document.querySelector(s);
let on=false; try{ on=localStorage.getItem("qom-v5-topnav")==="on"; }catch(e){}
const rail=q(".rail"); if(!rail) return;
/* Quotes is found by data-nav: the Quotes list layer may already have renamed it "Quotes & orders" */
const icon=name=>{ const a=(name==="Quotes"&&rail.querySelector('a.rlink[data-nav="quotes"]'))||[...rail.querySelectorAll("a.rlink")].find(x=>x.textContent.trim()===name); const s=a&&a.querySelector("svg"); return s?s.outerHTML.replace(/width="22" height="22"/,'width="16" height="16"'):""; };
const LINKS=["Home","Clients","Projects","Quotes","Orders"]; /* Home was Welcome (Nov 25); home.js opens it */
const bar=document.createElement("nav"); bar.className="tnbar"; bar.id="tnBar"; bar.setAttribute("aria-label","QOM navigation");
bar.innerHTML=`<a href="#" class="tnmark" data-nav="home" aria-label="Waterworks QOM, Home">WATERWORKS</a>
  <div class="tnlinks">${LINKS.map(n=>`<a href="#"${n==="Quotes"?' data-nav="quotes" aria-current="page"':n==="Home"?' data-nav="home"':` data-tn="${n}"`}>${icon(n==="Home"?"Welcome":n)||icon(n)}${n}</a>`).join("")}</div>
  <div class="tnright">
    <button type="button" class="tnsearch" data-tn="search" aria-label="Search clients, projects, quotes and orders"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span>Search</span><kbd>${/Mac|iPhone|iPad/.test(navigator.platform)?"⌘":"Ctrl "}K</kbd></button>
    <button type="button" class="tncta" data-tn="new" title="Start a new quote"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>New quote</span></button>
    <span class="tndiv" aria-hidden="true"></span>
    <span class="tnenv" title="You're on the staging environment">STAGING</span>
    <button type="button" class="tnicon" data-tn="bell" aria-label="Notifications" title="Notifications"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg></button>
    <div class="tnav-acct"><button type="button" class="tnicon" data-tn="acct" aria-haspopup="menu" aria-expanded="false" aria-controls="tnMenu" aria-label="Account: Alex Rivera" title="Alex Rivera"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="9" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6z"/></svg></button>
      <div class="tnmenu" id="tnMenu" role="menu" aria-label="Account" hidden>
        <div class="who"><b>Alex Rivera</b>Sales consultant · USC</div>
        <button type="button" role="menuitem" data-tn="import">${icon("Import Tools")}Import tools</button>
        <button type="button" role="menuitem" data-tn="prod">Go to production</button>
        <div class="sep" role="separator"></div>
        <button type="button" role="menuitem" data-tn="logout"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>Log out</button>
      </div></div>
  </div>`;
q(".app").before(bar);
const menu=q("#tnMenu"), acct=bar.querySelector('[data-tn="acct"]');
function closeMenu(focus){ if(menu.hidden) return; menu.hidden=true; acct.setAttribute("aria-expanded","false"); if(focus) acct.focus(); }
bar.addEventListener("click",ev=>{ const b=ev.target.closest("[data-tn]"); if(!b) return; ev.preventDefault(); const k=b.dataset.tn;
  if(k==="search"){ q("#gsBtn")?.click(); return; }
  if(k==="new"){ q("#propNew")?.click(); return; } /* the one-step New quote form (proposal.js), as Quotes list → Create new */
  if(k==="acct"){ const open=menu.hidden; menu.hidden=!open; acct.setAttribute("aria-expanded",String(open)); if(open) menu.querySelector("button")?.focus(); return; }
  closeMenu();
  if(k==="logout"){ q("#logoutBtn")?.click(); return; }
  const what={bell:"Notifications",import:"Import tools",prod:"Production"}[k]||k;
  showToast(`${what} isn't built in the prototype.`); });
document.addEventListener("click",ev=>{ if(!ev.target.closest(".tnav-acct")) closeMenu(); });
menu.addEventListener("keydown",ev=>{ const items=[...menu.querySelectorAll("button")], i=items.indexOf(document.activeElement);
  if(ev.key==="Escape"){ ev.preventDefault(); closeMenu(true); }
  else if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ ev.preventDefault(); items[(i+(ev.key==="ArrowDown"?1:-1)+items.length)%items.length].focus(); } });
function apply(){ document.documentElement.classList.toggle("tnav",on); closeMenu(); dispatchEvent(new Event("resize")); if(typeof fitPanes==="function") fitPanes(); if(typeof placeBar==="function") placeBar(); }
const sw=q("#tnOn"); if(sw){ sw.checked=on; sw.addEventListener("change",()=>{ on=sw.checked; try{ localStorage.setItem("qom-v5-topnav",on?"on":"off"); }catch(e){} apply(); }); }
apply();
})();
</script>
