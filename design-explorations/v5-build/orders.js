<script>
/* ==== v5 (Nov 25): how a quote becomes an order, from the backend research the same day ====
   Nobody creates an order directly in QOM, so there's no "New order" button. An order comes from one of three paths:
   1. The client pays the deposit on the checkout page (Send to client's link). QOM then asks M3 to create the order. Until M3 answers,
      the quote has no order number ("paid, order pending"); if M3 rejects it, the payment waits for someone to release it by hand.
   2. The SC converts a no-charge quote. Today it's the same button as Send to client, relabelled "Convert to Order"; QOM's backend
      allows it only for Samples and Warranty Replacement, and refuses it without a Primary Specifier Contact or a Responsible, or once
      the quote has converted. Here it's shown as its own action: its own icon, its own checks in Before you convert, and a confirm step.
   3. M3 creates the order itself (keyed in M3, migrated, e-commerce): the Orders tab's "No quote" rows, already in quotes-list.js.
   Demo bar: "Pricing" (Standard, Trade, At no charge · …) and "Deposit" (Not paid, Paid, order pending, Paid, on hold, Paid, order created).
   Wraps v2's sendItems, renderSend, sendClient and renderQuote. Mock only. */
(function(){
const q=s=>document.querySelector(s);
const O=window.qomOrd={mode:"std",pay:"none",ord:"",nc:false,paidDate:"11/25/2026",paidTime:"2:14 PM",ordDate:"",convAt:""};
const MODES={std:["Standard",""],trade:["Trade",""],samples:["At no charge · Samples","Samples"],warranty:["At no charge · Warranty replacement","Warranty Replacement"],sales:["At no charge · Sales order","Sales Order"]};
const isNc=()=>!!MODES[O.mode][1];
const NEW_ORD="1000480117";
const fmtD=s=>{ const d=new Date(+s.slice(6),+s.slice(0,2)-1,+s.slice(3,5)); return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const conv=s=>String(s||"").replace(/sending/g,"converting").replace(/Sending/g,"Converting").replace(/ to send\b/g," to convert");
const IC={
  box:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>', /* Lucide package */
  info:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>',
  alert:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5h.01"/></svg>',
  cash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  spin:'<svg class="ocspin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>'
};
const sb=q("#pbSend"), IC_SEND=sb?sb.querySelector("svg").outerHTML:"";

/* ---------- demo bar: Pricing and Deposit, after "Blocked outside QOM" ---------- */
const ext=q("#extBlk")?.closest("label");
if(ext){ const wrap=document.createElement("span"); wrap.className="orddemo";
  wrap.innerHTML=`<label title="v5 only: the quote's pricing mode. At no charge turns Send to client into Convert to order; QOM allows that only for Samples and Warranty Replacement.">Pricing
    <select id="ordMode" autocomplete="off">${Object.entries(MODES).map(([k,[l]])=>`<option value="${k}">${l}</option>`).join("")}</select></label>
  <label title="v5 only: what happens after the client pays the deposit. M3 creates the order a few minutes later, or rejects it and the payment waits for someone to release it.">Deposit
    <select id="ordPay" autocomplete="off"><option value="none">Not paid</option><option value="pending">Paid, order pending</option><option value="held">Paid, M3 rejected (on hold)</option><option value="created">Paid, M3 created the order</option></select></label>`;
  ext.after(wrap); }
q("#ordMode")?.addEventListener("change",e=>{ O.mode=e.target.value; O.ord=""; O.nc=false;
  const ps=q("#ordPay"); if(isNc()){ O.pay="none"; ps.value="none"; } ps.disabled=isNc(); renderQuote(); });
q("#ordPay")?.addEventListener("change",e=>{ const v=e.target.value; O.pay=v; O.ord=""; O.nc=false;
  if(v==="created"){ O.ord=NEW_ORD; O.ordDate="11/25/2026"; barToast(`Order ${NEW_ORD} created`,"M3 answered: the quote now links to its order."); }
  renderQuote(); });

/* ---------- the banner under the title, beside v2's outside-QOM banner ---------- */
const bn=document.createElement("div"); bn.className="extbn ordbn"; bn.id="ordBanner"; bn.setAttribute("role","status"); bn.setAttribute("aria-live","polite"); bn.hidden=true;
q("#extBanner")?.after(bn);
function bannerHtml(){
  if(O.ord) return ["ok",`${IC.check}<span><b>${O.nc?`Converted to order ${O.ord}`:`Order ${O.ord} created`}.</b> ${O.nc?`At no charge, today at ${O.convAt}.`:`The client paid the deposit ${fmtD(O.paidDate)} at ${O.paidTime}, and M3 created the order.`}</span><button type="button" class="tolink" data-ord="open">Open order</button>`];
  if(O.pay==="pending") return ["info",`${IC.info}<span><b>Deposit paid ${fmtD(O.paidDate)} at ${O.paidTime}. M3 is creating the order.</b> Its number shows here when it's ready, usually within a few minutes. If M3 is slow, QOM keeps trying for up to 24 hours.</span>`];
  if(O.pay==="held") return ["bad",`${IC.alert}<span><b>Deposit paid, but M3 couldn't create the order.</b> The payment is on hold until someone releases it. Ask your CSS, and give them the quote number.</span>`];
  return null; }

/* ---------- Before you send: what the order paths add ---------- */
const oSendItems=sendItems;
sendItems=function(){ const items=oSendItems.apply(this,arguments), add=[];
  if(!O.ord&&O.pay==="pending") add.push({id:"paid",st:"prog",t:"Deposit paid, order being created",d:`The client paid ${fmtD(O.paidDate)} at ${O.paidTime}. M3 is creating the order, so there's nothing left to send.`});
  if(!O.ord&&O.pay==="held") add.push({id:"paid",st:"block",t:"Deposit paid, order on hold",d:"M3 rejected the order, so the payment waits for someone to release it. Ask your CSS."});
  if(isNc()&&!O.ord) add.push(O.mode==="sales"
    ?{id:"nctype",st:"block",t:"Sales orders can't convert at no charge",d:"Only Samples and Warranty Replacement quotes convert at no charge. Change the order type, or turn off At No Charge to send it with a payment link."}
    :{id:"nctype",st:"done",t:`${MODES[O.mode][1]} at no charge`,d:"This order type can convert at no charge"});
  if(!add.length) return items;
  const rank={block:0,prog:1,todo:2,done:3};
  return items.concat(add).map((x,i)=>({...x,i})).sort((a,b)=>rank[a.st]-rank[b.st]||a.i-b.i); };

/* ---------- the footer's main action, the facts row and the banner, after every render ---------- */
function paint(){
  if(!sb) return;
  const nc=isNc(), lab=nc?"Convert to order":O.mode==="trade"?"Send trade quote":"Send to client", bg=q("#pbSendBadge");
  if(sb._lab!==lab){ sb.innerHTML=(nc?IC.box:IC_SEND)+lab; if(bg) sb.append(bg); sb._lab=lab; }
  const tip=q("#tipSend"), done=!!O.ord, wait=!done&&O.pay==="pending";
  if(done||wait){ sb.setAttribute("aria-disabled","true"); sb.classList.remove("primary"); if(done&&bg) bg.hidden=true; }
  if(tip){ const t=done?`This quote is order ${O.ord} now. There's nothing left to ${nc?"convert":"send"}.`:wait?"The client has paid. M3 is creating the order."
      :nc?(sb.getAttribute("aria-disabled")==="true"?conv(tip.textContent):"Creates the order in M3 at no charge. You'll confirm first.")
      :O.mode==="trade"?tip.textContent.replace("Sends the quote and payment link","Sends the trade quote and payment link"):tip.textContent;
    if(tip.textContent!==t) tip.textContent=t; }
  const ti=q("#spTitle"); if(ti){ const t=nc?"Before you convert":"Before you send"; if(ti.textContent!==t) ti.textContent=t; }
  const sp=q("#spStatus"); if(sp){
    if(done){ sp.textContent=`Converted to order ${O.ord}`; sp.className="tone-done"; }
    else if(wait){ sp.textContent="Deposit paid, order being created"; sp.className="tone-prog"; }
    else if(nc&&sp.textContent==="Ready to send") sp.textContent="Ready to convert"; }
  const b=bannerHtml(); bn.hidden=!b; if(b){ bn.className="extbn ordbn "+b[0]; if(bn._h!==b[1]){ bn.innerHTML=b[1]; bn._h=b[1]; } }
  paintFacts(); }
/* the facts row: the order, or the deposit's state; a tag by the title for a no-charge quote */
const ptype=q(".ptitle .ptype"), nct=document.createElement("span"); nct.className="pnc"; nct.hidden=true;
if(ptype) ptype.before(nct);
function factHtml(){ if(O.ord) return `<span class="pord ok">${IC.box}Order ${O.ord}</span>`;
  if(O.pay==="pending") return `<span class="pord info">${IC.cash}Paid, no order</span>`;
  if(O.pay==="held") return `<span class="pord bad">${IC.cash}Paid, order held</span>`; return ""; }
function paintFacts(){ const f=q(".pfacts"); if(!f) return; const h=factHtml(), cur=f.querySelector(".pord");
  if(!h){ cur?.remove(); } else if(!cur||cur.outerHTML!==h){ cur?.remove(); f.insertAdjacentHTML("beforeend",h); }
  const ex=f.querySelector(".pexp"); if(ex) ex.hidden=!!O.ord; /* a converted quote's expiry no longer matters */
  const t=isNc()?MODES[O.mode][0]:""; nct.hidden=!t; if(nct.textContent!==t) nct.textContent=t; }
const pf=q(".pfacts"); if(pf) new MutationObserver(()=>{ if((!pf.querySelector(".pord")&&factHtml())||(O.ord&&pf.querySelector(".pexp:not([hidden])"))) paintFacts(); }).observe(pf,{childList:true}); /* the proposal layer rewrites the row */
const oRenderSend=renderSend; renderSend=function(){ const r=oRenderSend.apply(this,arguments); paint(); return r; };
const oRenderQuote=renderQuote; renderQuote=function(){ const r=oRenderQuote.apply(this,arguments); paint(); return r; };

/* ---------- the button: convert (with a confirm step), send a trade quote, or explain why not ---------- */
const oSendClient=sendClient;
sendClient=function(){
  if(O.ord){ barToast(`This quote is order ${O.ord} now`,O.nc?"It was converted at no charge.":"M3 created the order after the client paid."); return; }
  if(O.pay==="pending"){ barToast("The client has already paid","M3 is creating the order. Its number shows on the quote when it's ready."); return; }
  const F=footState();
  if(isNc()){ if(F.canSend){ confirmConvert(); return; } if(F.others.length){ openSend(false,"issues","#pbSend"); return; } barToast(conv(F.help)||"Not ready to convert yet.","",true); return; }
  if(O.mode==="trade"&&F.canSend){ barToast("Trade quote sent to [Client name]","The trade quote and payment link are on their way (prototype)."); return; }
  return oSendClient.apply(this,arguments); };
function confirmConvert(){
  const L=quoteLines(), nr=new Set(L.map(x=>x.r.name)).size, d=document.createElement("div"); d.className="dlgwrap ordcv";
  const facts=`<dl class="ocfacts"><div><dt>Order type</dt><dd>${MODES[O.mode][1]}</dd></div><div><dt>Products</dt><dd>${L.length} ${L.length===1?"line":"lines"} in ${nr} ${nr===1?"room":"rooms"}</dd></div><div><dt>Charge to the client</dt><dd>$0.00</dd></div></dl>`;
  const ask=()=>`<div class="dlg ocdlg" role="alertdialog" aria-modal="true" aria-labelledby="ocT" aria-describedby="ocD"><h2 id="ocT" tabindex="-1">Convert quote ${QI.id} to an order?</h2>
    <p id="ocD" class="dlgwhat">M3 creates the order now, at no charge to the client.</p>${facts}
    <div class="dlgbtns"><button type="button" class="btn ghost" data-oc="cancel">Cancel</button><button type="button" class="btn" data-oc="go">${IC.box}Convert to order</button></div></div>`;
  d.innerHTML=ask(); document.body.append(d); d.querySelector('[data-oc="go"]').focus();
  let busy=false;
  const close=()=>{ d.remove(); q("#pbSend")?.focus(); };
  d.addEventListener("keydown",ev=>{ if(ev.key==="Escape"&&!busy){ ev.stopPropagation(); close(); } });
  d.addEventListener("click",ev=>{ if(busy) return; const b=ev.target.closest("[data-oc]"); if(!b){ if(ev.target===d) close(); return; }
    const k=b.dataset.oc;
    if(k==="cancel"||k==="close"){ close(); return; }
    if(k==="open"){ close(); barToast(`Opens order ${O.ord}`,"The order page isn't built in the prototype."); return; }
    if(k==="go"){ busy=true; b.disabled=true; b.innerHTML=`${IC.spin}Converting in M3…`; d.querySelector('[data-oc="cancel"]').disabled=true; $("#sendLive").textContent="Converting the quote to an order in M3.";
      setTimeout(()=>{ busy=false; O.ord=NEW_ORD; O.nc=true; O.ordDate="11/25/2026"; O.convAt=nowTime(); renderQuote();
        d.innerHTML=`<div class="dlg ocdlg" role="alertdialog" aria-modal="true" aria-labelledby="ocT" aria-describedby="ocD"><div class="ocok" aria-hidden="true">${IC.check}</div><h2 id="ocT" tabindex="-1">Converted to order ${O.ord}</h2>
          <p id="ocD" class="dlgwhat">The quote now links to its order. You'll find it on the Orders tab of Quotes &amp; orders.</p>
          <div class="dlgbtns"><button type="button" class="btn ghost" data-oc="close">Close</button><button type="button" class="btn" data-oc="open">Open order</button></div></div>`;
        d.querySelector("#ocT").focus(); $("#sendLive").textContent=`Converted to order ${O.ord}.`; },1600); } });
}
bn.addEventListener("click",ev=>{ if(ev.target.closest('[data-ord="open"]')) barToast(`Opens order ${O.ord}`,"The order page isn't built in the prototype."); });
renderQuote();
})();
</script>
