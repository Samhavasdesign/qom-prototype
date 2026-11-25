<script>
/* ==== v5 (Nov 25): Home, from production's Welcome screen (Sam's screenshot). The side nav's Welcome becomes Home and opens it,
   as do Home in the top bar and the top bar's wordmark. QOM opens the Quotes list; the other tiles are the Sales Portal's
   other modules, so they only show a toast. Leaving Home goes through setPage (Quotes, a quote, global search). */
(function(){
const q=s=>document.querySelector(s);
const svg=(d,w=22)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={ /* Lucide */
  dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  card:'<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
  pres:'<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  cap:'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  box:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  cog:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  ext:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
};
/* production's order, read across: two columns */
const TILES=[["Sales Dashboard","dash"],["Account Profiles","card"],["Sales Presentations","pres"],["Sales Training","cap"],["QOM","file","qom"],["M3 Tools","wrench"],["Product Availability","box"],["Spec Pack Generator","cog"]];
const page=document.createElement("section"); page.id="homePage"; page.setAttribute("aria-labelledby","hmTitle");
page.innerHTML=`<div class="hm-main">
    <div class="hm-mark" aria-hidden="true">WATERWORKS</div>
    <div class="hm-hello"><span class="hm-avatar" aria-hidden="true">AR</span><h1 id="hmTitle" tabindex="-1">Welcome,<br>Alex</h1></div>
    <ul class="hm-tiles">${TILES.map(([l,i,k])=>`<li><button type="button" class="hm-tile" data-hm="${k||l}"><span class="hm-ic">${svg(IC[i])}</span><span class="hm-l">${l}${k?"<small>Quotes and orders</small>":""}</span>${k?"":`<span class="hm-ext" title="Opens in the Sales Portal">${svg(IC.ext,14)}</span>`}</button></li>`).join("")}</ul>
    <p class="hm-note">The other tiles open the Sales Portal’s modules; only QOM is built in the prototype.</p>
  </div>
  <div class="hm-photo"><img src="images/henry-single-hook.jpg" alt="Henry single robe hook in polished nickel"></div>`;
q(".main").append(page);

/* the side nav's Welcome becomes Home */
const railHome=[...document.querySelectorAll(".rail a.rlink")].find(a=>a.textContent.trim()==="Welcome");
if(railHome){ const t=railHome.querySelector(".rl"); if(t) t.textContent="Home"; railHome.dataset.nav="home"; }
const railQuotes=document.querySelector('.rail a.rlink[data-nav="quotes"]');
function setCur(home){
  [[railHome,home],[railQuotes,!home],[q('#tnBar [data-nav="home"]:not(.tnmark)'),home],[q('#tnBar .tnlinks [data-nav="quotes"]'),!home]].forEach(([a,on])=>{ if(!a) return;
    a.classList.toggle("cur",on); if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); }); }
let prevTitle=document.title;
function openHome(){ if(document.body.classList.contains("page-home")){ q("#hmTitle").focus(); return; }
  prevTitle=document.title; document.body.classList.remove("page-create");
  document.body.classList.add("page-home"); setCur(true); document.title="Home · QOM";
  scrollTo(0,0); document.documentElement.style.setProperty("--home-top",Math.round(page.getBoundingClientRect().top+scrollY)+"px");
  q("#hmTitle").focus({preventScroll:true}); }
function leaveHome(){ if(!document.body.classList.contains("page-home")) return; document.body.classList.remove("page-home"); setCur(false); document.title=prevTitle;
  dispatchEvent(new Event("resize")); if(typeof fitPanes==="function") fitPanes(); if(typeof placeBar==="function") placeBar(); }
document.addEventListener("click",ev=>{ const a=ev.target.closest("[data-nav='home']"); if(!a) return; ev.preventDefault(); ev.stopPropagation(); openHome(); },true);
page.addEventListener("click",ev=>{ const b=ev.target.closest("[data-hm]"); if(!b) return;
  if(b.dataset.hm==="qom"){ setPage("quotes"); return; }
  showToast(`Opens ${b.dataset.hm} in the Sales Portal (not built in the prototype).`); });
/* global search: opening the built quote from Home goes to the quote (proposal.js decides by the page classes) */
const gsLeave=ev=>{ if(!document.body.classList.contains("page-home")) return; const it=ev.type==="click"?ev.target.closest(".gsit"):(ev.key==="Enter"?q('.gsit[aria-selected="true"]'):null);
  if(it&&it.textContent.includes("6000024967")) leaveHome(); };
document.addEventListener("click",ev=>{ if(ev.target.closest(".gsdlg")) gsLeave(ev); },true);
document.addEventListener("keydown",ev=>{ if(ev.target.closest&&ev.target.closest(".gsdlg")) gsLeave(ev); },true);
/* New quote (top bar, demo bar or Quotes list) opens the create form, so Home steps aside */
document.addEventListener("click",ev=>{ if(ev.target.closest('#propNew,#qlNew,[data-tn="new"]')) leaveHome(); },true);
const oSetPage=setPage; setPage=function(){ leaveHome(); return oSetPage.apply(this,arguments); };
addEventListener("resize",()=>{ if(document.body.classList.contains("page-home")) document.documentElement.style.setProperty("--home-top",Math.round(page.getBoundingClientRect().top+scrollY)+"px"); });
})();
</script>
