<script>
/* ==== v5 (Nov 24): Quotes list redesign, first pass (QOM-3332; brief "Improved Quote Search") ====
   A layer over v2's Quotes list (QL, renderQL, setPage). The demo bar's "Quotes list redesign" switch turns it on (default) or off (today's list).
   From the brief's requirements: a Pipeline status column you can sort and filter; no Actions column; the whole row opens its Quick view (the quote until Nov 25);
   a Project column for every quote; no Converted / Not yet converted Status column. Quotes and orders share one list here
   (open decision 1, pending Max): a converted quote shows its order number in Order, and the Converted filter narrows it.
   From the Sales Portal demo (Jen, Nov 24): a Total column with a value filter, a flag when the estimated conversion date has passed
   (stale pipelines skew the forecast), a Quick view of what's on a quote without opening it, and the delivery address in search.
   Mock data only: pipeline status, project, address, conversion date, order number and lines are added to QL's made-up rows.
   Quote 6000024967 reads the open quote itself (its rooms, lines, address and Est. Conv. Date).
   Three kinds of row (codebase check, Nov 25): an open quote; a converted quote, one row with its order number (the quote and order
   link both ways); and an order with no QOM quote behind it (keyed in M3, or e-commerce), which needs its own row and opens the order. */
(function(){
const q=s=>document.querySelector(s);
const X={on:true,q:"",who:"me",type:"",pipes:new Set(),stale:false,soon:false,paid:false,due:false,ship:false,val:0,sort:"id",dir:-1,size:50,page:1,qv:null,
  tab:"quotes",sortBy:{quotes:["id",-1],orders:["odate",-1]},found:""};
try{ X.on=localStorage.getItem("qom-v5-qlx")!=="off"; if(localStorage.getItem("qom-v5-qlxtab")==="orders"){ X.tab="orders"; [X.sort,X.dir]=X.sortBy.orders; } }catch(e){}

/* pipeline status: sp-fe's PROJECT_STATUS (quote-constants.ts) plus Lost; rank sets the sort order */
const PIPE=[["Predictable",">95%","pr"],["Feasible","75–95%","fe"],["Possible","<75%","po"],["Lead","","le"],["On Hold","","oh"],["Duplicate","","du"],["Lost","","lo"]]; /* colours: the Sales Portal's, see quotes-list.css */
const RANK=Object.fromEntries(PIPE.map((p,i)=>[p[0],i]));
const PROJ=["Henry bar and club house","Hudson Street residence","Ocean View 127","Maple Row townhouse","Lakeside spa","Park Avenue penthouse","Hotel Linden","Bayside model units","Cedar Point lodge","Greenwich renovation","Tribeca loft","Harbor house","Chelsea office","Orchard Lane phase 2","Stonegate kitchen","Willow Brook cottage","Fenwick hotel lobby","Grey Owl duplex","Ashford residence","Linden Street brownstone"];
const STREETS=["Ocean View Road","Harbor Lane","Main Street","Elm Avenue","Shore Drive","Hill Road","Park Place","Mill Street","Bay Road","Orchard Way"];
const TOWNS=["Anytown NY 01001","Sampleville CT 06001","Exampleton NJ 07001","Mocksburg MA 01003"];
const ROOMS=["Primary Bath","Guest Bath","Powder Room","Kitchen","Bar","Laundry","Lobby Restroom","Spa"];
const POOL=CAT.filter(p=>p.price>0&&p.st===20&&!p.part);
const pname=p=>p.name+(p.fin?" in "+p.fin:"");
const STALE_OK=p=>!["Lost","Duplicate"].includes(p); /* a passed date on a lost or duplicate quote doesn't matter */
(function seedRows(){ let seed=31; const rnd=n=>{ seed=(seed*9301+49297)%233280; return Math.floor(seed/233280*n); };
  const W=[[0,14],[1,20],[2,24],[3,16],[4,8],[5,7],[6,11]], tot=W.reduce((a,b)=>a+b[1],0);
  const pick=()=>{ let r=rnd(tot); for(const [i,w] of W){ if(r<w) return PIPE[i][0]; r-=w; } return "Possible"; };
  const md=(y,m,d)=>String(m).padStart(2,"0")+"/"+String(d).padStart(2,"0")+"/"+y;
  QL.rows.forEach(r=>{ const conv=r.status==="Converted";
    r.pipe=r.built?"Predictable":conv?(rnd(5)?"Predictable":"Feasible"):pick();
    r.proj=r.built?r.project:PROJ[1+rnd(PROJ.length-1)];
    r.ord=conv?String(1000400000+rnd(99999)):"";
    const qd=new Date(2026,9,30-Math.round((6000024967-+r.id)/3*2.2)); r.date=md(qd.getFullYear(),qd.getMonth()+1,qd.getDate());
    if(r.built) return; /* the open quote's own data is read live, below */
    r.addr=r.proj==="Ocean View 127"?"127 Ocean View Road, "+TOWNS[rnd(TOWNS.length)]:(10+rnd(480))+" "+STREETS[rnd(STREETS.length)]+", "+TOWNS[rnd(TOWNS.length)];
    /* estimated conversion: Jul 2026 to Jun 2027, so about a third of open quotes have a date that's passed */
    const m=7+rnd(12); r.conv=md(m>12?2027:2026,m>12?m-12:m,1+rnd(28));
    if(!rnd(7)){ const cd=new Date(2026,10,25+rnd(14)); r.conv=md(cd.getFullYear(),cd.getMonth()+1,cd.getDate()); } /* a few close in the next two weeks */
    const nr=1+rnd(3), names=[...ROOMS].sort(()=>rnd(3)-1).slice(0,nr), big=r.type==="Commercial"?4:1;
    r.rooms=names.map(n=>({name:n,lines:Array.from({length:1+rnd(4)},()=>{ const p=POOL[rnd(POOL.length)]; return {sku:p.sku,name:pname(p),qty:(1+rnd(3))*big,unit:p.price}; })})); }); })();

/* paid, order pending (backend research, Nov 25): the customer pays the deposit on the checkout page, then QOM asks M3 to create the
   order. Until M3 answers, the quote has no order number, so it still sits on the Quotes tab. "pending": M3 hasn't answered yet (QOM
   retries every 5 minutes for up to 24 hours); "held": M3 rejected it and the payment waits for someone to release it by hand.
   Mock: four open quotes (two of them Mine); the open quote 6000024967 reads the demo bar's Order state (orders.js, window.qomOrd) */
(function seedPaid(){ const open=QL.rows.filter(r=>!r.built&&!r.ord&&["Predictable","Feasible"].includes(r.pipe));
  const mine=open.filter(r=>r.sc===QL.ME), rest=open.filter(r=>r.sc!==QL.ME);
  [[mine[1],"pending","11/25/2026","9:42 AM"],[mine[3],"held","11/23/2026","4:18 PM"],[rest[2],"pending","11/25/2026","11:05 AM"],[rest[6],"pending","11/24/2026","6:51 PM"]]
    .forEach(([r,st,d,t])=>{ if(r) r.pay={st,date:d,time:t}; }); })();
const payOf=r=>{ if(!r.built) return r.pay||null; const o=window.qomOrd; return o&&!o.ord&&(o.pay==="pending"||o.pay==="held")?{st:o.pay,date:o.paidDate,time:o.paidTime}:null; };
const isPaid=r=>!!payOf(r);
/* the open quote converts in the prototype (Convert to order, or M3 answering a paid quote): it moves to the Orders tab */
function syncBuilt(){ const b=QL.rows.find(r=>r.built), o=window.qomOrd; if(!b||!o) return; const was=b.ord;
  b.ord=o.ord||""; if(b.ord&&!was){ b.odate=o.ordDate||"11/25/2026"; b.nc=!!o.nc; b.paidR=o.nc?0:.5; b.shipR=1; } }
/* orders with no QOM quote: m3-services takes in every M3 sales order, whether or not a QOM quote exists. Mock only */
const ORD_ONLY=(()=>{ let seed=77; const rnd=n=>{ seed=(seed*9301+49297)%233280; return Math.floor(seed/233280*n); };
  const md=(y,m,d)=>String(m).padStart(2,"0")+"/"+String(d).padStart(2,"0")+"/"+y, out=[];
  const custs=[...new Set(QL.rows.map(r=>r.cust))], scs=[QL.ME,"Jordan Lee","Riley Chen","Taylor Brooks","Sam Okafor"];
  for(let i=0;i<7;i++){ const web=i%3===2, dd=new Date(2026,9,28-i*9-rnd(5)), c=web?"WEB CUSTOMER "+(10400+rnd(500)):custs[rnd(custs.length)];
    out.push({oo:true,id:"",ord:String(1000500000+rnd(99999)),src:web?"E-commerce":"Keyed in M3",date:md(dd.getFullYear(),dd.getMonth()+1,dd.getDate()),
      type:web||rnd(4)?"Residential":"Commercial",cust:c,payer:c,proj:"",desc:web?"":["Showroom order","Replacement parts","Add-on to job"][rnd(3)],
      sc:web?"":scs[i===0?0:rnd(scs.length)],exp:"",pipe:"",m3:"",
      addr:(10+rnd(480))+" "+STREETS[rnd(STREETS.length)]+", "+TOWNS[rnd(TOWNS.length)],
      rooms:[{name:"Order lines",lines:Array.from({length:1+rnd(3)},()=>{ const p=POOL[rnd(POOL.length)]; return {sku:p.sku,name:pname(p),qty:1+rnd(2),unit:p.price}; })}]}); }
  return out; })();
const ALL=()=>QL.rows.concat(ORD_ONLY);
const K=x=>x.id||"o"+x.ord; /* a row's key: its quote number, or its order number when there's no quote */

/* the open quote (6000024967) as the list sees it */
const tfv=k=>{ try{ return (TF&&TF[k])||""; }catch(e){ return ""; } };
const rowRooms=r=>r.built?S.quote.rooms.map(x=>({name:x.name,lines:x.lines.map(l=>{ const p=CAT.find(c=>c.sku===l.sku); return {sku:l.sku,name:p?pname(p):l.sku,qty:l.qty,unit:l.unit}; })})):r.rooms;
const rowAddr=r=>r.built?tfv("addr"):r.addr;
const rowConv=r=>r.built?(tfv("conv")||QI.conv):r.conv;
const rowTotal=r=>rowRooms(r).reduce((a,x)=>a+x.lines.reduce((b,l)=>b+l.qty*l.unit,0),0);
const usd0=n=>"$"+Math.round(n).toLocaleString("en-US");

const TODAY=new Date(2026,10,24);
const pd=s=>new Date(+s.slice(6),+s.slice(0,2)-1,+s.slice(3,5));
const fmt=s=>pd(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fmtS=s=>{ const d=pd(s); return d.toLocaleDateString("en-US",d.getFullYear()===TODAY.getFullYear()?{month:"short",day:"numeric"}:{month:"short",year:"numeric"}); }; /* "Oct 30" this year, "Dec 2025" before */
const daysTo=s=>Math.round((pd(s)-TODAY)/864e5);
const isStale=r=>!r.ord&&STALE_OK(r.pipe)&&!!rowConv(r)&&daysTo(rowConv(r))<0;
/* the Sales Portal's "Closing in Next 2 Weeks": an open quote expected to convert in the next 14 days */
const isSoon=r=>!r.ord&&STALE_OK(r.pipe)&&!!rowConv(r)&&daysTo(rowConv(r))>=0&&daysTo(rowConv(r))<=14;
/* Quotes and Orders tabs (Sam, Nov 25): one page, one search across both, each tab with its own columns and quick filters.
   Quotes: quotes not converted yet (Lost and Duplicate included). Orders: converted quotes and orders with no QOM quote.
   Mock order data: order date, and how much is paid and still to ship (production's Orders list adds Amount Paid and
   Unshipped Product Value, QOM-3336). Mock only */
(function seedOrders(){ let s2=5; const r2=n=>{ s2=(s2*9301+49297)%233280; return Math.floor(s2/233280*n); };
  const md=d=>String(d.getMonth()+1).padStart(2,"0")+"/"+String(d.getDate()).padStart(2,"0")+"/"+d.getFullYear();
  ALL().filter(x=>x.ord).forEach(x=>{ x.paidR=[1,1,1,.5,.5,.3,0][r2(7)]; x.shipR=x.paidR===1?[0,0,0,.25][r2(4)]:[1,1,.6,.3][r2(4)];
    if(x.oo){ x.odate=x.date; return; } const d=pd(x.date); d.setDate(d.getDate()+5+r2(30)); if(d>=TODAY) d.setTime(TODAY-864e5*(1+r2(4))); x.odate=md(d); }); })();
const rowPaid=x=>Math.round(rowTotal(x)*(x.paidR??0)), rowShip=x=>Math.round(rowTotal(x)*(x.shipR??0));
const isDue=x=>!x.nc&&rowPaid(x)<Math.round(rowTotal(x)), isShip=x=>rowShip(x)>0;
const TABS={quotes:{name:"Quotes",one:"quote",
    icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7z"/><path d="M14 3v4h4"/><path d="M13.7 11.1c-.3-.5-.9-.8-1.7-.8-.9 0-1.7.5-1.7 1.2 0 1.7 3.4.9 3.4 2.7 0 .7-.7 1.2-1.7 1.2-.8 0-1.5-.3-1.8-.9M12 9.4v.9M12 15.4v1"/></svg>'},
  orders:{name:"Orders",one:"order",
    icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5h11M4 12h11M4 17.5h11"/><path d="M19 6.5h.01M19 12h.01M19 17.5h.01" stroke-width="2.6"/></svg>'}};
const tabOk=(x,t)=>t==="quotes"?!x.ord:!!x.ord;
const COLSQ=[["id","Quote"],["proj","Project"],["desc","Description"],["cust","Customer"],["pipe","Pipeline status"],["tot","Total"],["sc","Sales consultant"],["exp","Expires"]];
const COLSO=[["odate","Order"],["id","Quote"],["proj","Project"],["cust","Customer"],["tot","Total"],["paid","Paid"],["ship","Unshipped"],["sc","Sales consultant"]];
const SORTS={quotes:["id","pipe","tot","exp"],orders:["odate","tot","paid","ship"]};
const COLS=()=>X.tab==="orders"?COLSO:COLSQ;
const VALS=[[0,"Any"],[10000,"Over $10,000"],[50000,"Over $50,000"],[100000,"Over $100,000"]];
const title=s=>String(s).toLowerCase().replace(/(^|[\s&-])([a-z])/g,(m,a,b)=>a+b.toUpperCase());
const words=()=>X.q.toLowerCase().split(/\s+/).filter(Boolean);
const hl=(s,ws)=>{ let h=esc(s); ws.forEach(t=>{ h=h.replace(new RegExp("("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>"); }); return h; };
/* done = green, always with a check and the word (design audit, Color in use) */
const DONE=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const IC={
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  chev:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  sort:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>',
  up:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v14"/></svg>',
  copy:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  plus:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  x:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  eye:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  prev:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>',
  next:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  cal:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  cash:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
  truck:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  clock:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

/* ---------- markup: sits inside #quotesPage, after v2's own title (which stays: setPage focuses it) ---------- */
const root=document.createElement("div"); root.className="qlx"; root.id="qlx";
root.innerHTML=`
  <button type="button" class="btn lg qlxnew" data-qlx="new">${IC.plus}Create new</button>
  <div class="qlxsearch">${IC.search}<input type="search" id="qlxQ" placeholder="Search by quote #, order #, project, customer or description" aria-label="Search quotes and orders" autocomplete="off"></div>
  <div class="qlxtabs" role="tablist" aria-label="Quotes or orders">${Object.entries(TABS).map(([k,t])=>`<button type="button" role="tab" class="qlxtab" id="qlxTab-${k}" data-qlxtab="${k}" aria-controls="qlxPanel">${t.icon}<span>${t.name}</span><em id="qlxTabN-${k}"></em></button>`).join("")}</div>
  <div id="qlxPanel" role="tabpanel">
  <div class="qlxbar">
    <div class="qlxseg" role="group" aria-label="Whose quotes">${[["me","Mine"],["team","My team"],["all","Everyone"]].map(([v,l])=>`<button type="button" data-qlxwho="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
    ${''/* Type is a filter pill like Total, not a toggle group (Sam, Nov 25): "All types" is the default, so it reads as a filter only once set */}
    <div class="qlxpill" id="qlxTypeW"><button type="button" class="qlxpb" data-qlxpop="type" aria-expanded="false" aria-controls="qlxTypePop"><span id="qlxTypeL">All types</span>${IC.chev}</button>
      <div class="qlxpop" id="qlxTypePop" hidden role="radiogroup" aria-label="Type"></div></div>
    <div class="qlxpill" id="qlxPipeW"><button type="button" class="qlxpb" data-qlxpop="pipe" aria-expanded="false" aria-controls="qlxPipePop"><span id="qlxPipeL">Pipeline status</span>${IC.chev}</button>
      <div class="qlxpop" id="qlxPipePop" hidden role="group" aria-label="Pipeline status"></div></div>
    <div class="qlxpill" id="qlxValW"><button type="button" class="qlxpb" data-qlxpop="val" aria-expanded="false" aria-controls="qlxValPop"><span id="qlxValL">Total</span>${IC.chev}</button>
      <div class="qlxpop" id="qlxValPop" hidden role="radiogroup" aria-label="Total"></div></div>
    <button type="button" class="qlxclear" data-qlx="clear" hidden>Clear filters</button>
  </div>
  <div class="qlxmeta"><div class="qlxcount" id="qlxCount" aria-live="polite"></div>
    <div class="qlxquick" id="qlxQuick" role="group" aria-label="Quick filters"></div></div>
  <div class="qlxwrap"><table class="qlxt"><caption class="sr">Select a row to open it, or Quick view to see what's on it.</caption><thead><tr id="qlxHead"></tr></thead><tbody id="qlxBody"></tbody></table></div>
  <div class="qlxfoot"><span id="qlxRange" class="qlxrange" aria-live="polite"></span><nav class="qlxpager" id="qlxPager" aria-label="Pages"></nav>
    <div class="qlxsize"><span id="qlxSizeL">Rows per page</span><div class="qlxpill"><button type="button" class="qlxpb qlxsizeb" data-qlxpop="size" aria-haspopup="listbox" aria-expanded="false" aria-controls="qlxSizePop" aria-labelledby="qlxSizeL qlxSizeV"><span id="qlxSizeV">50</span>${IC.chev}</button>
      <div class="qlxpop qlxsizepop" id="qlxSizePop" hidden role="listbox" aria-labelledby="qlxSizeL">${[25,50,100].map(n=>`<button type="button" class="qlxopt" role="option" data-qlxsize="${n}" aria-selected="${n===50}"><span>${n}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></button>`).join("")}</div></div></div></div>
  </div>`;
q("#quotesPage").append(root);
/* Quick view: a panel from the right, over the list */
const qv=document.createElement("div"); qv.className="qlxqv"; qv.hidden=true;
qv.innerHTML=`<div class="qlxqvp" role="dialog" aria-modal="true" aria-labelledby="qlxQvT" id="qlxQvP"></div>`;
document.body.append(qv);

/* ---------- rows ---------- */
function matchesBase(x){ return (X.who==="all"||(X.who==="me"?x.sc===QL.ME:QL.TEAM.includes(x.sc)))&&(!X.type||x.type===X.type); }
/* the search and the shared filters (whose, type, total) cover both tabs; each tab adds its own quick filters */
function rowsFor(t){ const ws=words();
  return ALL().filter(x=>tabOk(x,t)&&matchesBase(x)&&(!X.val||rowTotal(x)>X.val)
    &&(t==="quotes"?(!X.pipes.size||X.pipes.has(x.pipe))&&(!X.stale||isStale(x))&&(!X.soon||isSoon(x))&&(!X.paid||isPaid(x)):(!X.due||isDue(x))&&(!X.ship||isShip(x)))
    &&ws.every(w=>[x.id,x.ord,x.proj,rowAddr(x),x.desc,x.cust,x.payer,x.m3,x.sc].some(v=>String(v||"").toLowerCase().includes(w)))); }
function rowsX(){ const ws=words(); let r=rowsFor(X.tab);
  const ymd=s=>s?s.slice(6)+s.slice(0,2)+s.slice(3,5):"";
  /* "Quote" sorts by date, so orders with no quote fall in among the quotes; rows with no pipeline status or expiry sort last */
  const k=X.sort, key=v=>k==="id"?(X.tab==="orders"&&v.oo?(X.dir>0?"9":"0"):ymd(v.date)+K(v)):k==="odate"?ymd(v.odate)+v.ord:k==="paid"?rowPaid(v):k==="ship"?rowShip(v):k==="exp"?(v.exp?ymd(v.exp):(X.dir>0?"9":"0")):k==="pipe"?(RANK[v.pipe]??(X.dir>0?99:-1)):k==="tot"?rowTotal(v):String(v[k]||"").toLowerCase();
  /* exact quote or order number first, then the chosen sort */
  const exact=v=>ws.length===1&&(v.id===ws[0]||v.ord===ws[0])?0:1;
  return [...r].sort((a,b)=>exact(a)-exact(b)||(key(a)<key(b)?-X.dir:key(a)>key(b)?X.dir:0)||(a.id<b.id?1:-1)); }
let shown=[]; /* the current page's rows, for Quick view's previous and next */

function pipeCell(x){ if(x.oo) return `<span class="qlxsrc">Order</span><span class="p2">${esc(x.src)}</span>`; const d=PIPE[RANK[x.pipe]];
  /* in the table the likelihood is a tooltip (it made the table too wide at 1440px); the filter shows it in full */
  return `<span class="qlxpipe ${d[2]}"${d[1]?` title="${x.pipe} (${d[1]})"`:""}><i aria-hidden="true"></i>${x.pipe}${d[1]?`<span class="sr"> (${d[1]})</span>`:""}</span>`
    +(payOf(x)?payNote(payOf(x)):"")+(!payOf(x)&&isStale(x)?`<span class="p2 stale" title="Estimated conversion date was ${fmt(rowConv(x))}. Update the date or the status so the forecast stays right.">${IC.clock}Conv. date passed</span>`:""); }
const payNote=p=>p.st==="held"
  ?`<span class="p2 paid held" title="The deposit was paid ${fmt(p.date)}, but M3 rejected the order. It's on hold until someone releases it.">${IC.cash}Paid · order on hold</span>`
  :`<span class="p2 paid" title="The deposit was paid ${fmt(p.date)} at ${p.time}. M3 is creating the order; the order number shows here when it's ready.">${IC.cash}Paid · order pending</span>`;
function render(){ if(!X.on) return; syncBuilt();
  const all=rowsX(), pages=Math.max(1,Math.ceil(all.length/X.size)); X.page=Math.min(X.page,pages);
  const rows=all.slice((X.page-1)*X.size,X.page*X.size), ws=words(); shown=rows;
  root.querySelectorAll("[data-qlxwho]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.qlxwho===X.who)));
  /* pills: black once set, the label says what's set */
  const other=X.tab==="quotes"?"orders":"quotes", nOther=rowsFor(other).length;
  Object.keys(TABS).forEach(k=>{ const b=q("#qlxTab-"+k), n=k===X.tab?all.length:nOther; b.setAttribute("aria-selected",String(k===X.tab)); b.tabIndex=k===X.tab?0:-1;
    q("#qlxTabN-"+k).textContent=n.toLocaleString("en-US"); b.setAttribute("aria-label",`${TABS[k].name}, ${n}${X.q?" matching":""}`); });
  q("#qlxPanel").setAttribute("aria-labelledby","qlxTab-"+X.tab); root.classList.toggle("qlx-ords",X.tab==="orders");
  q("#qlxPipeW").hidden=X.tab!=="quotes";
  const np=X.tab==="quotes"?X.pipes.size:0;
  q("#qlxPipeW").classList.toggle("on",np>0); q("#qlxPipeL").textContent=np===0?"Pipeline status":np===1?[...X.pipes][0]:`Pipeline status · ${np}`;
  q("#qlxTypeW").classList.toggle("on",!!X.type); q("#qlxTypeL").textContent=X.type||"All types";
  q("#qlxValW").classList.toggle("on",X.val>0); q("#qlxValL").textContent=X.val?VALS.find(v=>v[0]===X.val)[1]:"Total";
  const base=ALL().filter(x=>matchesBase(x)&&tabOk(x,X.tab));
  q("#qlxPipePop").innerHTML=PIPE.map(([n,s,c])=>`<label class="qlxopt"><input type="checkbox" data-qlxpipe="${n}"${X.pipes.has(n)?" checked":""}><span class="qlxpipe ${c}"><i aria-hidden="true"></i>${n}${s?` <small>${s}</small>`:""}</span><em>${base.filter(x=>x.pipe===n).length}</em></label>`).join("")
    +(np?`<div class="qlxpopf"><button type="button" data-qlx="clearpipe">Clear</button></div>`:"");
  const baseT=ALL().filter(x=>tabOk(x,X.tab)&&(X.who==="all"||(X.who==="me"?x.sc===QL.ME:QL.TEAM.includes(x.sc)))); /* counts for Type ignore the type itself */
  q("#qlxTypePop").innerHTML=[["","All types"],["Residential","Residential"],["Commercial","Commercial"]].map(([v,l])=>`<label class="qlxopt"><input type="radio" name="qlxtype" data-qlxtype="${v}"${X.type===v?" checked":""}><span>${l}</span><em>${v?baseT.filter(x=>x.type===v).length:baseT.length}</em></label>`).join("");
  q("#qlxValPop").innerHTML=VALS.map(([v,l])=>`<label class="qlxopt"><input type="radio" name="qlxval" data-qlxval="${v}"${X.val===v?" checked":""}><span>${l}</span><em>${v?base.filter(x=>rowTotal(x)>v).length:base.length}</em></label>`).join("");
  /* quick filters: the Sales Portal's pipeline pair on Quotes; on Orders, what SCs get asked about (Kelli, Nov 25) */
  const QF=X.tab==="quotes"?[["stale",IC.clock,"Conv. date passed",isStale,"Open quotes whose estimated conversion date has passed. Update the date or the status so the forecast stays right."],["soon",IC.cal,"Closing in 2 weeks",isSoon,"Open quotes expected to convert in the next 14 days"],["paid",IC.cash,"Paid, no order yet",isPaid,"The customer paid the deposit, but M3 hasn't created the order yet, or rejected it"]]
    :[["due",IC.cash,"Balance due",isDue,"Orders not paid in full yet"],["ship",IC.truck,"Not fully shipped",isShip,"Orders with products still to ship"]];
  q("#qlxQuick").innerHTML=QF.map(([k,ic,l,fn,t])=>`<button type="button" data-qlxquick="${k}" aria-pressed="${X[k]}" title="${t}">${ic}${l} <em>${base.filter(fn).length}</em></button>`).join("");
  root.querySelector("[data-qlx=clear]").hidden=!(np||X.stale||X.soon||X.paid||X.due||X.ship||X.val||X.type||X.who!=="me"||X.q); /* Mine is the default (Sam, Nov 25), so it isn't a filter */
  /* count */
  const mq=X.q?` matching “${esc(X.q)}”`:"", nOO=all.filter(x=>x.oo).length, n=all.length.toLocaleString("en-US");
  q("#qlxCount").innerHTML=(X.tab==="quotes"?`<b>${n}</b> ${all.length===1?"quote":"quotes"} not converted yet${mq}`
    :`<b>${n}</b> ${all.length===1?"order":"orders"}${mq}${all.length?` · ${all.length-nOO} from quotes · ${nOO} with no quote`:""}`)
    +(X.found?` · <span class="qlxfound">${X.found}</span>`:"");
  /* head */
  const COLS_=COLS();
  /* only the columns worth sorting sort (Sam, Nov 25): names and descriptions are found by search, not by scrolling A to Z */
  q("#qlxHead").innerHTML=COLS_.map(([k,l])=>`<th scope="col" class="c-${k}"${X.sort===k?` aria-sort="${X.dir>0?"ascending":"descending"}"`:""}>${SORTS[X.tab].includes(k)?`<button type="button" data-qlxsort="${k}">${l}<span class="si${X.sort===k?" on":""}">${X.sort===k?IC.up:IC.sort}</span></button>`:`<span class="th">${l}</span>`}</th>`).join("");
  /* body */
  const idCell=x=>`<span class="qlxid"><a href="#" data-qlxopen="${x.id}">${hl(x.id,ws)}</a><button type="button" class="qlxcp" data-qlxcopy="${x.id}" aria-label="Copy quote number ${x.id}" title="Copy">${IC.copy}</button></span>`;
  const qvb=x=>`<button type="button" class="qlxqvb" data-qlxqv="${K(x)}" aria-label="Quick view of ${x.oo?"order "+x.ord:"quote "+x.id}" title="Quick view">${IC.eye}<span>Quick view</span></button>`;
  const projCell=x=>{ const ad=rowAddr(x); return `<td class="c-proj">${x.proj?`<span class="p1" title="${esc(x.proj)}">${hl(x.proj,ws)}</span>`:`<span class="p1 none">—</span>`}${ad?`<span class="p2" title="${esc(ad)}">${hl(ad,ws)}</span>`:""}</td>`; };
  const custCell=x=>`<td class="c-cust"><span class="p1" title="${esc(title(x.cust))}">${hl(title(x.cust),ws)}</span>${x.payer!==x.cust?`<span class="p2" title="Payer: ${esc(title(x.payer))}">Payer: ${hl(title(x.payer),ws)}</span>`:""}</td>`;
  const orderRow=x=>{ const tot=rowTotal(x), paid=rowPaid(x), sh=rowShip(x), bal=Math.round(tot)-paid;
    return `<tr data-qlxrow="${K(x)}" data-qlxgo="o${x.ord}" class="${x.oo?"oo":""}">
    <td class="c-ord"><span class="qlxid"><a href="#" data-qlxopen="o${x.ord}">${hl(x.ord,ws)}</a><button type="button" class="qlxcp" data-qlxcopy="${x.ord}" aria-label="Copy order number ${x.ord}" title="Copy">${IC.copy}</button></span><span class="p2" title="Ordered ${fmt(x.odate)} · ${esc(x.type)}">${fmtS(x.odate)} · ${x.type==="Commercial"?"Com.":"Resi."}</span></td>
    <td class="c-id">${x.oo?`<span class="qlxsrc">No quote</span><span class="p2">${esc(x.src)}</span>`:`${idCell(x)}<span class="p2" title="Quoted ${fmt(x.date)}">Quoted ${fmtS(x.date)}</span>`}</td>
    ${projCell(x)}${custCell(x)}
    <td class="c-tot">${tot?usd0(tot):`<span class="none">$0</span>`}</td>
    <td class="c-tot c-paid">${x.nc?`<span class="none">$0</span><span class="p2">No charge</span>`:`${usd0(paid)}<span class="p2">${bal>0?`${usd0(bal)} due`:`<span class="qlxdone">${DONE}Paid in full</span>`}</span>`}</td>
    <td class="c-tot c-ship">${sh?usd0(sh):`<span class="qlxdone">${DONE}Shipped</span>`}</td>
    <td class="c-sc c-qv">${x.sc?hl(x.sc,ws):`<span class="none">—</span>`}${qvb(x)}</td></tr>`; };
  const oName=TABS[other].name.toLowerCase(), tName=TABS[X.tab].name.toLowerCase();
  q("#qlxBody").innerHTML=rows.length?rows.map(x=>X.tab==="orders"?orderRow(x):(()=>{ const dd=x.exp?daysTo(x.exp):NaN, soon=dd>=0&&dd<=14, gone=dd<0, ad=rowAddr(x), tot=rowTotal(x);
    return `<tr data-qlxrow="${K(x)}" class="${x.built?"built":""}${x.oo?" oo":""}">
    <td class="c-id">${idCell(x)}<span class="p2" title="${x.oo?"Ordered":"Quoted"} ${fmt(x.date)} · ${esc(x.type)}">${fmtS(x.date)} · ${x.type==="Commercial"?"Com.":"Resi."}</span></td>
    ${projCell(x)}
    <td class="c-desc"><span class="p1" title="${esc(x.desc)}">${hl(x.desc,ws)}</span></td>
    ${custCell(x)}
    <td class="c-pipe">${pipeCell(x)}</td>
    <td class="c-tot">${tot?usd0(tot):`<span class="none">$0</span>`}</td>
    <td class="c-sc">${x.sc?hl(x.sc,ws):`<span class="none">—</span>`}</td>
    <td class="c-exp c-qv">${x.exp?`<span class="p1">${fmt(x.exp)}</span>`:`<span class="p1 none" title="Orders don't expire">—</span>`}${soon?`<span class="p2 soon">In ${dd} ${dd===1?"day":"days"}</span>`:gone?`<span class="p2 gone">Expired</span>`:""}
      ${qvb(x)}</td></tr>`; })()).join("")
    /* empty: point to the other tab when the search finds something there */
    :`<tr><td colspan="${COLS_.length}" class="qlxempty"><b>No ${tName} match${X.q?` “${esc(X.q)}”`:""}.</b><span>${nOther?`${nOther.toLocaleString("en-US")} ${nOther===1?TABS[other].one:oName} ${nOther===1?"matches":"match"}. <button type="button" data-qlxtab="${other}">Show ${oName}</button>`
      :X.who!=="all"?`They may belong to someone else. <button type="button" data-qlx="everyone">Search everyone's ${tName}</button>`:`Check the number or spelling, or <button type="button" data-qlx="clear">clear filters</button>.`}</span></td></tr>`;
  /* foot */
  q("#qlxRange").textContent=all.length?`Showing ${(X.page-1)*X.size+1}–${Math.min(X.page*X.size,all.length)} of ${all.length}`:"";
  /* up to 5 page numbers, a window that keeps the current page in the middle where it can */
  const nums=[], a=Math.max(1,Math.min(X.page-2,pages-4)); for(let i=a;i<=Math.min(pages,a+4);i++) nums.push(i);
  const arrow=(d,dis,l)=>`<button type="button" data-qlxpage="${X.page+d}" ${dis?"disabled":""} aria-label="${l} page" class="qlxstep"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d<0?"m15 18-6-6 6-6":"m9 18 6-6-6-6"}"/></svg><span>${l}</span></button>`;
  q("#qlxPager").innerHTML=pages<2?"":arrow(-1,X.page===1,"Previous")+nums.map(n=>`<button type="button" data-qlxpage="${n}"${n===X.page?' aria-current="page"':""} aria-label="Page ${n}">${n}</button>`).join("")+arrow(1,X.page===pages,"Next");
}

/* ---------- Quick view: what's on the quote, without opening it ---------- */
function qvRender(){ const x=ALL().find(r=>K(r)===X.qv); if(!x) return; if(x.oo) return qvOrder(x); const i=shown.findIndex(r=>K(r)===X.qv), rooms=rowRooms(x), tot=rowTotal(x), nl=rooms.reduce((a,r)=>a+r.lines.length,0), ad=rowAddr(x), cv=rowConv(x), d=PIPE[RANK[x.pipe]];
  const fact=(l,v)=>`<div><dt>${l}</dt><dd>${v}</dd></div>`;
  q("#qlxQvP").innerHTML=`<div class="qvhead">
      <div class="qvnav"><button type="button" data-qvgo="-1"${i<=0?" disabled":""} aria-label="Previous quote" title="Previous quote (↑)">${IC.prev}</button><button type="button" data-qvgo="1"${i<0||i>=shown.length-1?" disabled":""} aria-label="Next quote" title="Next quote (↓)">${IC.next}</button></div>
      <span class="qvid">Quote ${x.id} · ${esc(x.type)}</span>
      <button type="button" class="qvx" data-qvclose aria-label="Close quick view">${IC.x}</button></div>
    <div class="qvbody">
      <h2 id="qlxQvT" tabindex="-1">${esc(x.proj)}</h2>
      ${ad?`<p class="qvaddr">${esc(ad)}</p>`:`<p class="qvaddr none">No delivery address yet</p>`}
      <dl class="qvfacts">
        ${fact("Customer",esc(title(x.cust))+(x.payer!==x.cust?`<small>Payer: ${esc(title(x.payer))}</small>`:""))}
        ${fact("Sales consultant",esc(x.sc))}
        ${fact("Quoted",fmt(x.date))}
        ${fact("Pipeline status",`<span class="qlxpipe ${d[2]}"><i aria-hidden="true"></i>${x.pipe}${d[1]?` <small>${d[1]}</small>`:""}</span>`)}
        ${fact("Est. conversion",cv?fmt(cv)+(isStale(x)?`<small class="stale">${IC.clock}Date passed. Update it or the status.</small>`:isSoon(x)?`<small>${IC.cal}In ${daysTo(cv)} ${daysTo(cv)===1?"day":"days"}</small>`:""):"—")}
        ${fact("Expires",fmt(x.exp))}
        ${fact("Order",x.ord?esc(x.ord)+(x.m3?`<small>Project ${esc(x.m3)}</small>`:""):payOf(x)?(p=>p.st==="held"?`Not created<small class="paidq held">${IC.cash}Deposit paid ${fmtS(p.date)}. M3 rejected the order; it's on hold until someone releases it.</small>`:`Being created<small class="paidq">${IC.cash}Deposit paid ${fmtS(p.date)}, ${p.time}. M3 is creating the order.</small>`)(payOf(x)):"Not converted")}
      </dl>
      <h3>${nl?`${nl} ${nl===1?"line":"lines"} in ${rooms.length} ${rooms.length===1?"room":"rooms"}`:"No products yet"}</h3>
      ${rooms.map(r=>`<div class="qvroom"><div class="qvrn">${esc(r.name)}</div>${r.lines.map(l=>`<div class="qvline"><span class="qvq">${l.qty}</span><span class="qvn">${esc(l.name)}<small>${esc(l.sku)}</small></span><span class="qvp">${money(l.qty*l.unit)}</span></div>`).join("")||`<div class="qvline none">No lines</div>`}</div>`).join("")}
    </div>
    <div class="qvfoot"><div class="qvtot"><span>Subtotal</span><b>${money(tot)}</b><small>Before freight and tax</small></div>
      <button type="button" class="btn ghost" data-qlxcopy="${x.id}">${IC.copy}Copy quote #</button><button type="button" class="btn" data-qlxopen="${x.id}">Open quote</button></div>`;
  q("#qlxQvP").querySelector("h2").focus({preventScroll:true});
  root.querySelectorAll("tr[data-qlxrow]").forEach(t=>t.classList.toggle("qvcur",t.dataset.qlxrow===X.qv)); }
/* an order with no QOM quote: no pipeline, conversion or expiry; it opens the order */
function qvOrder(x){ const i=shown.findIndex(r=>K(r)===X.qv), lines=x.rooms[0].lines, tot=rowTotal(x);
  const fact=(l,v)=>`<div><dt>${l}</dt><dd>${v}</dd></div>`;
  q("#qlxQvP").innerHTML=`<div class="qvhead">
      <div class="qvnav"><button type="button" data-qvgo="-1"${i<=0?" disabled":""} aria-label="Previous" title="Previous (↑)">${IC.prev}</button><button type="button" data-qvgo="1"${i<0||i>=shown.length-1?" disabled":""} aria-label="Next" title="Next (↓)">${IC.next}</button></div>
      <span class="qvid">Order ${x.ord} · ${esc(x.type)}</span>
      <button type="button" class="qvx" data-qvclose aria-label="Close quick view">${IC.x}</button></div>
    <div class="qvbody">
      <h2 id="qlxQvT" tabindex="-1">${esc(title(x.cust))}</h2>
      <p class="qvaddr">${esc(x.addr)}</p>
      <dl class="qvfacts">
        ${fact("Sales consultant",x.sc?esc(x.sc):"—")}
        ${fact("Ordered",fmt(x.date))}
        ${fact("Source",esc(x.src))}
        ${fact("Quote","No QOM quote<small>Made outside QOM, so there's no quote to open</small>")}
      </dl>
      <h3>${lines.length} ${lines.length===1?"line":"lines"}</h3>
      <div class="qvroom">${lines.map(l=>`<div class="qvline"><span class="qvq">${l.qty}</span><span class="qvn">${esc(l.name)}<small>${esc(l.sku)}</small></span><span class="qvp">${money(l.qty*l.unit)}</span></div>`).join("")}</div>
    </div>
    <div class="qvfoot"><div class="qvtot"><span>Subtotal</span><b>${money(tot)}</b></div>
      <button type="button" class="btn ghost" data-qlxcopy="${x.ord}">${IC.copy}Copy order #</button><button type="button" class="btn" data-qlxopen="${K(x)}">Open order</button></div>`;
  q("#qlxQvP").querySelector("h2").focus({preventScroll:true});
  root.querySelectorAll("tr[data-qlxrow]").forEach(t=>t.classList.toggle("qvcur",t.dataset.qlxrow===X.qv)); }
let qvFrom=null;
function qvOpen(id,from){ X.qv=id; if(from) qvFrom=from; qv.hidden=false; document.body.classList.add("qlx-qv"); qvRender(); }
function qvClose(){ qv.hidden=true; document.body.classList.remove("qlx-qv"); root.querySelectorAll("tr.qvcur").forEach(t=>t.classList.remove("qvcur"));
  const b=root.querySelector(`[data-qlxqv="${X.qv}"]`)||qvFrom; X.qv=null; if(b&&b.isConnected) b.focus(); }
function qvGo(d){ const i=shown.findIndex(r=>K(r)===X.qv), n=shown[i+d]; if(n){ X.qv=K(n); qvRender(); root.querySelector(`tr[data-qlxrow="${K(n)}"]`)?.scrollIntoView({block:"nearest"}); } }
qv.addEventListener("click",ev=>{ if(ev.target===qv){ qvClose(); return; } const b=ev.target.closest("button"); if(!b) return; const d=b.dataset;
  if(d.qvclose!==undefined) qvClose(); else if(d.qvgo) qvGo(+d.qvgo);
  else if(d.qlxcopy){ navigator.clipboard?.writeText(d.qlxcopy).catch(()=>{}); showToast("Copied "+d.qlxcopy,"ok"); }
  else if(d.qlxopen){ const id=d.qlxopen; qvClose(); openQuote(id); } });
qv.addEventListener("keydown",ev=>{
  if(ev.key==="Escape"){ ev.preventDefault(); ev.stopPropagation(); qvClose(); }
  else if((ev.key==="ArrowDown"||ev.key==="ArrowUp")&&!ev.target.closest("input,select")){ ev.preventDefault(); qvGo(ev.key==="ArrowDown"?1:-1); }
  else if(ev.key==="Tab"){ /* keep focus in the panel */ const f=[...qv.querySelectorAll("button:not(:disabled),[tabindex='-1']")].filter(e=>e.tagName==="BUTTON"); if(!f.length) return;
    const a=f[0], z=f[f.length-1]; if(ev.shiftKey&&(document.activeElement===a||!f.includes(document.activeElement))){ ev.preventDefault(); z.focus(); } else if(!ev.shiftKey&&document.activeElement===z){ ev.preventDefault(); a.focus(); } } });

/* ---------- events ---------- */
function openQuote(id){ if(id==="6000024967"){ fillOpenQuote(); setPage("quote"); } else if(id[0]==="o") showToast(`Opens order ${id.slice(1)} (the order page isn't built in the prototype).`); else showToast("Only quote 6000024967 is built in the prototype."); }
function closePops(){ root.querySelectorAll(".qlxpop").forEach(p=>{ p.hidden=true; p.parentNode.querySelector(".qlxpb").setAttribute("aria-expanded","false"); }); }
function setTab(t,focus){ if(t===X.tab) return; X.sortBy[X.tab]=[X.sort,X.dir]; X.tab=t; [X.sort,X.dir]=X.sortBy[t]; X.page=1; X.found=""; closePops();
  try{ localStorage.setItem("qom-v5-qlxtab",t); }catch(e){} render(); if(focus) q("#qlxTab-"+t).focus(); }
/* an exact quote or order number that's only on the other tab switches to it, and says why
   (a converted quote's number finds its order) */
function search(v){ X.q=v.trim(); X.page=1; X.found=""; const ws=words();
  if(ws.length===1&&/^\d{8,}$/.test(ws[0])&&!rowsFor(X.tab).length){ const o=X.tab==="quotes"?"orders":"quotes", hit=rowsFor(o).find(x=>x.id===ws[0]||x.ord===ws[0]);
    if(hit){ setTab(o); X.found=o==="orders"&&hit.id===ws[0]?`Quote ${hit.id} was converted to order ${hit.ord}`:`Found in ${TABS[o].name}`; } }
  render(); }
let tq=null; q("#qlxQ").addEventListener("input",ev=>{ clearTimeout(tq); tq=setTimeout(()=>search(ev.target.value),200); });
q("#qlxQ").addEventListener("keydown",ev=>{ if(ev.key==="Enter"){ clearTimeout(tq); search(ev.target.value); } });
/* tabs: arrow keys move between them (automatic activation), Home and End jump */
root.querySelector(".qlxtabs").addEventListener("keydown",ev=>{ if(!["ArrowLeft","ArrowRight","Home","End"].includes(ev.key)) return; ev.preventDefault();
  const ks=Object.keys(TABS), i=ks.indexOf(X.tab); setTab(ev.key==="Home"?ks[0]:ev.key==="End"?ks[ks.length-1]:ks[(i+(ev.key==="ArrowRight"?1:ks.length-1))%ks.length],true); });
/* rows per page: a listbox like the filter pills' popovers, opening upward; arrows move, Enter or a click picks, Esc closes */
q("#qlxSizePop").addEventListener("keydown",ev=>{ const o=[...q("#qlxSizePop").children], i=o.indexOf(document.activeElement);
  if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ ev.preventDefault(); o[(i+(ev.key==="ArrowDown"?1:o.length-1))%o.length].focus(); }
  else if(ev.key==="Home"||ev.key==="End"){ ev.preventDefault(); o[ev.key==="Home"?0:o.length-1].focus(); }
  else if(ev.key==="Tab") closePops(); });
root.addEventListener("change",ev=>{ const d=ev.target.dataset;
  if(d.qlxpipe){ ev.target.checked?X.pipes.add(d.qlxpipe):X.pipes.delete(d.qlxpipe); X.page=1; render(); q(`[data-qlxpipe="${d.qlxpipe}"]`)?.focus(); return; }
  if(d.qlxstale){ X.stale=ev.target.checked; X.page=1; render(); q("[data-qlxstale]")?.focus(); return; }
  if(d.qlxtype!==undefined){ X.type=d.qlxtype; X.page=1; render(); q(`[data-qlxtype="${d.qlxtype}"]`)?.focus(); return; }
  if(d.qlxval!==undefined){ X.val=+d.qlxval; X.page=1; render(); q(`[data-qlxval="${d.qlxval}"]`)?.focus(); return; } });
const POPS={type:"#qlxTypePop",pipe:"#qlxPipePop",val:"#qlxValPop",size:"#qlxSizePop"};
root.addEventListener("click",ev=>{ const b=ev.target.closest("button,a"); const d=b?b.dataset:{};
  if(d.qlxcopy){ ev.stopPropagation(); navigator.clipboard?.writeText(d.qlxcopy).catch(()=>{}); showToast("Copied "+d.qlxcopy,"ok"); return; }
  if(d.qlxqv){ ev.stopPropagation(); qvOpen(d.qlxqv,b); return; }
  if(d.qlxopen){ ev.preventDefault(); openQuote(d.qlxopen); return; }
  if(d.qlxpop){ const p=q(POPS[d.qlxpop]), was=!p.hidden; closePops(); if(!was){ p.hidden=false; b.setAttribute("aria-expanded","true"); (p.querySelector("input")||p.querySelector('[aria-selected="true"]'))?.focus(); } return; }
  if(d.qlxsize){ X.size=+d.qlxsize; X.page=1; q("#qlxSizeV").textContent=d.qlxsize; q("#qlxSizePop").querySelectorAll("[data-qlxsize]").forEach(o=>o.setAttribute("aria-selected",o===b)); closePops(); render(); q(".qlxsizeb").focus(); return; }
  if(d.qlxtab){ setTab(d.qlxtab,true); return; }
  if(d.qlxquick){ X[d.qlxquick]=!X[d.qlxquick]; X.page=1; render(); root.querySelector(`[data-qlxquick="${d.qlxquick}"]`).focus(); return; }
  if(d.qlxwho!==undefined){ X.who=d.qlxwho; X.page=1; render(); return; }
  if(d.qlxsort){ if(X.sort===d.qlxsort) X.dir=-X.dir; else { X.sort=d.qlxsort; X.dir=["id","tot"].includes(d.qlxsort)?-1:1; } render(); q(`[data-qlxsort="${d.qlxsort}"]`).focus(); return; }
  if(d.qlxpage){ X.page=+d.qlxpage; render(); q("#qlxPager [aria-current]")?.focus(); q("#qlTitle").scrollIntoView({block:"start"}); return; }
  if(d.qlx==="new"){ q("#qlNew").click(); return; }
  if(d.qlx==="clearpipe"){ X.pipes.clear(); render(); return; }
  if(d.qlx==="everyone"){ X.who="all"; X.page=1; render(); return; }
  if(d.qlx==="clear"){ X.pipes.clear(); X.stale=false; X.soon=false; X.paid=false; X.due=false; X.ship=false; X.found=""; X.val=0; X.type=""; X.who="me"; X.q=""; q("#qlxQ").value=""; X.page=1; closePops(); render(); q("#qlxQ").focus(); return; }
  if(b) return;
  /* anywhere else on a row opens its Quick view (Sam, Nov 25; it opened the quote until then); the eye stays as the signifier,
     and the quote or order number still opens it directly. Text selection doesn't. */
  const tr=ev.target.closest("tr[data-qlxrow]"); if(tr&&!String(getSelection())) qvOpen(tr.dataset.qlxrow,tr.querySelector(".qlxqvb")); });
document.addEventListener("click",ev=>{ if(!ev.target.closest(".qlxpill")) closePops(); });
root.addEventListener("keydown",ev=>{ if(ev.key==="Escape"){ const open=root.querySelector(".qlxpop:not([hidden])"); if(open){ ev.stopPropagation(); closePops(); open.parentNode.querySelector(".qlxpb").focus(); } } });

/* ---------- wrap v2 and the switch ---------- */
const oRender=renderQL; renderQL=function(){ oRender.apply(this,arguments); render(); };
/* Opening quote 6000024967 from the list or Home (a row, Quick view's Open quote, Home's recent quotes) opens it with its lines (Sam, Nov 25):
   the prototype starts on the empty "Fresh quote" scenario, so an empty quote switches to Normal's mock lines first.
   New quote's own flow (from the create form) isn't affected. */
function fillOpenQuote(){ if(quoteLines().length) return; const sc=document.getElementById("scenario"); if(!sc) return;
  sc.value="normal"; sc.dispatchEvent(new Event("change",{bubbles:true})); }
document.addEventListener("click",ev=>{ if(ev.target.closest?.('[data-hmq="6000024967"]')) fillOpenQuote(); },true); // Home's recent quotes
const oSetPage=setPage; setPage=function(){ if(!qv.hidden) qvClose(); const r=oSetPage.apply(this,arguments); if(document.body.classList.contains("page-quotes")) document.title=(X.on?NAME:"Quotes")+" · QOM"; return r; };
/* one place for quotes and orders (Sam, Nov 25): with the redesign on, the nav has one item, "Quotes & orders", and no Orders;
   the page title and breadcrumb follow. Off shows today's separate Quotes and Orders. The top bar is built after this layer,
   so the labels are set again once the page has loaded */
const NAME="Quotes & orders";
window.qlxShowTab=t=>{ if(TABS[t]) setTab(t); };
function setText(el,t){ if(!el) return; const rl=el.querySelector(".rl"); if(rl){ rl.textContent=t; return; }
  const n=[...el.childNodes].reverse().find(c=>c.nodeType===3&&c.textContent.trim()); if(n) n.textContent=t; else el.append(t); }
function navLabels(){ const t=X.on?NAME:"Quotes";
  document.querySelectorAll('.rail a.rlink[data-nav="quotes"], #tnBar .tnlinks a[data-nav="quotes"]').forEach(a=>setText(a,t));
  [...document.querySelectorAll(".rail a.rlink, #tnBar .tnlinks a")].filter(a=>a.textContent.trim()==="Orders").forEach(a=>{ a.hidden=X.on; });
  const h=q("#qlTitle"); if(h) h.textContent=t; setText(q("#qlCrumb")," "+t);
  if(document.body.classList.contains("page-quotes")) document.title=t+" · QOM"; }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",navLabels); else setTimeout(navLabels,0);
function apply(){ document.body.classList.toggle("qlx-on",X.on); if(!X.on&&!qv.hidden) qvClose(); if(X.on) render(); navLabels(); }
/* the Waterworks brand bronze as the accent (Jen's deck, Nov 25): on by default, remembered in the browser */
let bronze=true; try{ bronze=localStorage.getItem("qom-v5-bronze")!=="off"; }catch(e){}
document.body.classList.toggle("qlx-bronze",bronze);
const bsw=q("#qlxBronze"); if(bsw){ bsw.checked=bronze; bsw.addEventListener("change",()=>{ bronze=bsw.checked; try{ localStorage.setItem("qom-v5-bronze",bronze?"on":"off"); }catch(e){} document.body.classList.toggle("qlx-bronze",bronze); }); }
const sw=q("#qlxOn"); if(sw){ sw.checked=X.on; sw.addEventListener("change",()=>{ X.on=sw.checked; try{ localStorage.setItem("qom-v5-qlx",X.on?"on":"off"); }catch(e){} apply(); }); }
apply();
})();
</script>
