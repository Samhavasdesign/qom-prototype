<script>
/* ==== v5 (Nov 24): Quotes list redesign, first pass (QOM-3332; brief "Improved Quote Search") ====
   A layer over v2's Quotes list (QL, renderQL, setPage). The demo bar's "Quotes list redesign" switch turns it on (default) or off (today's list).
   From the brief's requirements: a Pipeline status column you can sort and filter; no Actions column; the whole row opens the quote;
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
const X={on:true,q:"",who:"all",type:"",pipes:new Set(),stale:false,soon:false,conv:"any",val:0,sort:"id",dir:-1,size:50,page:1,qv:null};
try{ X.on=localStorage.getItem("qom-v5-qlx")!=="off"; }catch(e){}

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
const KIND=[["any","Quotes and orders"],["no","Open quotes"],["yes","Converted quotes"],["oo","Orders with no quote"]];
const kindOk=(x,v)=>v==="any"||(v==="no"?!x.ord:v==="yes"?!!x.ord&&!x.oo:!!x.oo);

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
const COLS=[["id","Quote"],["proj","Project"],["desc","Description"],["cust","Customer"],["pipe","Pipeline status"],["tot","Total"],["ord","Order"],["sc","Sales consultant"],["exp","Expires"]];
const VALS=[[0,"Any"],[10000,"Over $10,000"],[50000,"Over $50,000"],[100000,"Over $100,000"]];
const title=s=>String(s).toLowerCase().replace(/(^|[\s&-])([a-z])/g,(m,a,b)=>a+b.toUpperCase());
const words=()=>X.q.toLowerCase().split(/\s+/).filter(Boolean);
const hl=(s,ws)=>{ let h=esc(s); ws.forEach(t=>{ h=h.replace(new RegExp("("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>"); }); return h; };
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
  clock:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

/* ---------- markup: sits inside #quotesPage, after v2's own title (which stays: setPage focuses it) ---------- */
const root=document.createElement("div"); root.className="qlx"; root.id="qlx";
root.innerHTML=`
  <button type="button" class="btn qlxnew" data-qlx="new">${IC.plus}Create new</button>
  <div class="qlxsearch">${IC.search}<input type="search" id="qlxQ" placeholder="Search by quote #, order #, project, customer or description" aria-label="Search quotes and orders" autocomplete="off"></div>
  <div class="qlxbar">
    <div class="qlxseg" role="group" aria-label="Whose quotes">${[["me","Mine"],["team","My team"],["all","Everyone"]].map(([v,l])=>`<button type="button" data-qlxwho="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
    <div class="qlxseg" role="group" aria-label="Type">${[["","All types"],["Residential","Residential"],["Commercial","Commercial"]].map(([v,l])=>`<button type="button" data-qlxtype="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
    <div class="qlxpill" id="qlxPipeW"><button type="button" class="qlxpb" data-qlxpop="pipe" aria-expanded="false" aria-controls="qlxPipePop"><span id="qlxPipeL">Pipeline status</span>${IC.chev}</button>
      <div class="qlxpop" id="qlxPipePop" hidden role="group" aria-label="Pipeline status"></div></div>
    <div class="qlxpill" id="qlxValW"><button type="button" class="qlxpb" data-qlxpop="val" aria-expanded="false" aria-controls="qlxValPop"><span id="qlxValL">Total</span>${IC.chev}</button>
      <div class="qlxpop" id="qlxValPop" hidden role="radiogroup" aria-label="Total"></div></div>
    <div class="qlxpill" id="qlxConvW"><button type="button" class="qlxpb" data-qlxpop="conv" aria-expanded="false" aria-controls="qlxConvPop"><span id="qlxConvL">Quotes and orders</span>${IC.chev}</button>
      <div class="qlxpop" id="qlxConvPop" hidden role="radiogroup" aria-label="Quotes and orders"></div></div>
    <button type="button" class="qlxclear" data-qlx="clear" hidden>Clear filters</button>
  </div>
  <div class="qlxmeta"><div class="qlxcount" id="qlxCount" aria-live="polite"></div>
    <div class="qlxquick" role="group" aria-label="Quick filters"><button type="button" data-qlxquick="stale" aria-pressed="false" title="Open quotes whose estimated conversion date has passed. Update the date or the status so the forecast stays right."></button><button type="button" data-qlxquick="soon" aria-pressed="false" title="Open quotes expected to convert in the next 14 days"></button></div></div>
  <div class="qlxwrap"><table class="qlxt"><caption class="sr">Quotes and orders. Select a row to open the quote, or Quick view to see what's on it.</caption><thead><tr id="qlxHead"></tr></thead><tbody id="qlxBody"></tbody></table></div>
  <div class="qlxfoot"><label class="qlxsize">Rows per page <select id="qlxSize">${[25,50,100].map(n=>`<option${n===50?" selected":""}>${n}</option>`).join("")}</select></label><span id="qlxRange"></span><nav class="qlxpager" id="qlxPager" aria-label="Pages"></nav></div>`;
q("#quotesPage").append(root);
/* Quick view: a panel from the right, over the list */
const qv=document.createElement("div"); qv.className="qlxqv"; qv.hidden=true;
qv.innerHTML=`<div class="qlxqvp" role="dialog" aria-modal="true" aria-labelledby="qlxQvT" id="qlxQvP"></div>`;
document.body.append(qv);

/* ---------- rows ---------- */
function matchesBase(x){ return (X.who==="all"||(X.who==="me"?x.sc===QL.ME:QL.TEAM.includes(x.sc)))&&(!X.type||x.type===X.type); }
function rowsX(){ const ws=words();
  let r=ALL().filter(x=>matchesBase(x)
    &&(!X.pipes.size||X.pipes.has(x.pipe))&&(!X.stale||isStale(x))&&(!X.soon||isSoon(x))&&kindOk(x,X.conv)&&(!X.val||rowTotal(x)>X.val)
    &&ws.every(w=>[x.id,x.ord,x.proj,rowAddr(x),x.desc,x.cust,x.payer,x.m3,x.sc].some(v=>String(v||"").toLowerCase().includes(w))));
  const ymd=s=>s?s.slice(6)+s.slice(0,2)+s.slice(3,5):"";
  /* "Quote" sorts by date, so orders with no quote fall in among the quotes; rows with no pipeline status or expiry sort last */
  const k=X.sort, key=v=>k==="id"?ymd(v.date)+K(v):k==="exp"?(v.exp?ymd(v.exp):(X.dir>0?"9":"0")):k==="pipe"?(RANK[v.pipe]??(X.dir>0?99:-1)):k==="tot"?rowTotal(v):String(v[k]||"").toLowerCase();
  /* exact quote or order number first, then the chosen sort */
  const exact=v=>ws.length===1&&(v.id===ws[0]||v.ord===ws[0])?0:1;
  return [...r].sort((a,b)=>exact(a)-exact(b)||(key(a)<key(b)?-X.dir:key(a)>key(b)?X.dir:0)||(a.id<b.id?1:-1)); }
let shown=[]; /* the current page's rows, for Quick view's previous and next */

function pipeCell(x){ if(x.oo) return `<span class="qlxsrc">Order</span><span class="p2">${esc(x.src)}</span>`; const d=PIPE[RANK[x.pipe]];
  /* in the table the likelihood is a tooltip (it made the table too wide at 1440px); the filter shows it in full */
  return `<span class="qlxpipe ${d[2]}"${d[1]?` title="${x.pipe} (${d[1]})"`:""}><i aria-hidden="true"></i>${x.pipe}${d[1]?`<span class="sr"> (${d[1]})</span>`:""}</span>`
    +(isStale(x)?`<span class="p2 stale" title="Estimated conversion date was ${fmt(rowConv(x))}. Update the date or the status so the forecast stays right.">${IC.clock}Conv. date passed</span>`:""); }
function render(){ if(!X.on) return;
  const all=rowsX(), pages=Math.max(1,Math.ceil(all.length/X.size)); X.page=Math.min(X.page,pages);
  const rows=all.slice((X.page-1)*X.size,X.page*X.size), ws=words(); shown=rows;
  root.querySelectorAll("[data-qlxwho]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.qlxwho===X.who)));
  root.querySelectorAll("[data-qlxtype]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.qlxtype===X.type)));
  /* pills: black once set, the label says what's set */
  const np=X.pipes.size;
  q("#qlxPipeW").classList.toggle("on",np>0); q("#qlxPipeL").textContent=np===0?"Pipeline status":np===1?[...X.pipes][0]:`Pipeline status · ${np}`;
  q("#qlxValW").classList.toggle("on",X.val>0); q("#qlxValL").textContent=X.val?VALS.find(v=>v[0]===X.val)[1]:"Total";
  q("#qlxConvW").classList.toggle("on",X.conv!=="any"); q("#qlxConvL").textContent=KIND.find(v=>v[0]===X.conv)[1];
  const base=ALL().filter(matchesBase);
  q("#qlxPipePop").innerHTML=PIPE.map(([n,s,c])=>`<label class="qlxopt"><input type="checkbox" data-qlxpipe="${n}"${X.pipes.has(n)?" checked":""}><span class="qlxpipe ${c}"><i aria-hidden="true"></i>${n}${s?` <small>${s}</small>`:""}</span><em>${base.filter(x=>x.pipe===n).length}</em></label>`).join("")
    +(np?`<div class="qlxpopf"><button type="button" data-qlx="clearpipe">Clear</button></div>`:"");
  q("#qlxValPop").innerHTML=VALS.map(([v,l])=>`<label class="qlxopt"><input type="radio" name="qlxval" data-qlxval="${v}"${X.val===v?" checked":""}><span>${l}</span><em>${v?base.filter(x=>rowTotal(x)>v).length:base.length}</em></label>`).join("");
  q("#qlxConvPop").innerHTML=KIND.map(([v,l])=>`<label class="qlxopt"><input type="radio" name="qlxconv" data-qlxconv="${v}"${X.conv===v?" checked":""}><span>${l}${v==="oo"?` <small class="qlxhint">Keyed in M3, or e-commerce</small>`:""}</span><em>${base.filter(x=>kindOk(x,v)).length}</em></label>`).join("");
  const qb=root.querySelector('[data-qlxquick="stale"]'), sb=root.querySelector('[data-qlxquick="soon"]');
  qb.setAttribute("aria-pressed",String(X.stale)); qb.innerHTML=`${IC.clock}Conv. date passed <em>${base.filter(isStale).length}</em>`;
  sb.setAttribute("aria-pressed",String(X.soon)); sb.innerHTML=`${IC.cal}Closing in 2 weeks <em>${base.filter(isSoon).length}</em>`;
  root.querySelector("[data-qlx=clear]").hidden=!(np||X.stale||X.soon||X.val||X.conv!=="any"||X.type||X.who!=="all"||X.q);
  /* count */
  const nConv=all.filter(x=>x.ord&&!x.oo).length, nOO=all.filter(x=>x.oo).length, nQ=all.length-nOO;
  const only=nOO&&nOO===all.length, mq=X.q?` matching “${esc(X.q)}”`:"";
  q("#qlxCount").innerHTML=only?`<b>${nOO}</b> ${nOO===1?"order":"orders"} with no quote${mq}`
    :`<b>${all.length.toLocaleString("en-US")}</b> ${nOO?"quotes and orders":all.length===1?"quote":"quotes"}${mq}${nConv?` · ${nConv} converted`:""}${nOO?` · ${nOO} ${nOO===1?"order":"orders"} with no quote`:""}`;
  /* head */
  q("#qlxHead").innerHTML=COLS.map(([k,l])=>`<th scope="col" class="c-${k}"${X.sort===k?` aria-sort="${X.dir>0?"ascending":"descending"}"`:""}><button type="button" data-qlxsort="${k}">${l}<span class="si${X.sort===k?" on":""}">${X.sort===k?IC.up:IC.sort}</span></button></th>`).join("");
  /* body */
  q("#qlxBody").innerHTML=rows.length?rows.map(x=>{ const dd=x.exp?daysTo(x.exp):NaN, soon=dd>=0&&dd<=14, gone=dd<0, ad=rowAddr(x), tot=rowTotal(x);
    return `<tr data-qlxrow="${K(x)}" class="${x.built?"built":""}${x.oo?" oo":""}">
    <td class="c-id">${x.oo?`<span class="none">No quote</span>`:`<span class="qlxid"><a href="#" data-qlxopen="${x.id}">${hl(x.id,ws)}</a><button type="button" class="qlxcp" data-qlxcopy="${x.id}" aria-label="Copy quote number ${x.id}" title="Copy">${IC.copy}</button></span>`}<span class="p2" title="${x.oo?"Ordered":"Quoted"} ${fmt(x.date)} · ${esc(x.type)}">${fmtS(x.date)} · ${x.type==="Commercial"?"Com.":"Resi."}</span></td>
    <td class="c-proj">${x.proj?`<span class="p1" title="${esc(x.proj)}">${hl(x.proj,ws)}</span>`:`<span class="p1 none">—</span>`}${ad?`<span class="p2" title="${esc(ad)}">${hl(ad,ws)}</span>`:""}</td>
    <td class="c-desc"><span class="p1" title="${esc(x.desc)}">${hl(x.desc,ws)}</span></td>
    <td class="c-cust"><span class="p1" title="${esc(title(x.cust))}">${hl(title(x.cust),ws)}</span>${x.payer!==x.cust?`<span class="p2" title="Payer: ${esc(title(x.payer))}">Payer: ${hl(title(x.payer),ws)}</span>`:""}</td>
    <td class="c-pipe">${pipeCell(x)}</td>
    <td class="c-tot">${tot?usd0(tot):`<span class="none">$0</span>`}</td>
    <td class="c-ord">${x.ord?`<span class="qlxid">${x.oo?`<a href="#" data-qlxopen="${K(x)}">${hl(x.ord,ws)}</a>`:`<span>${hl(x.ord,ws)}</span>`}<button type="button" class="qlxcp" data-qlxcopy="${x.ord}" aria-label="Copy order number ${x.ord}" title="Copy">${IC.copy}</button></span>`:`<span class="none" aria-label="Not converted">—</span>`}</td>
    <td class="c-sc">${x.sc?hl(x.sc,ws):`<span class="none">—</span>`}</td>
    <td class="c-exp">${x.exp?`<span class="p1">${fmt(x.exp)}</span>`:`<span class="p1 none" title="Orders don't expire">—</span>`}${soon?`<span class="p2 soon">In ${dd} ${dd===1?"day":"days"}</span>`:gone?`<span class="p2 gone">Expired</span>`:""}
      <button type="button" class="qlxqvb" data-qlxqv="${K(x)}" aria-label="Quick view of ${x.oo?"order "+x.ord:"quote "+x.id}" title="Quick view">${IC.eye}<span>Quick view</span></button></td></tr>`; }).join("")
    :`<tr><td colspan="${COLS.length}" class="qlxempty"><b>No quotes match${X.q?` “${esc(X.q)}”`:""}.</b><span>${X.who!=="all"?`They may belong to someone else. <button type="button" data-qlx="everyone">Search everyone's quotes</button>`:`Check the number or spelling, or <button type="button" data-qlx="clear">clear filters</button>.`}</span></td></tr>`;
  /* foot */
  q("#qlxRange").textContent=all.length?`${(X.page-1)*X.size+1}–${Math.min(X.page*X.size,all.length)} of ${all.length}`:"";
  const nums=[]; if(pages<=7){ for(let i=1;i<=pages;i++) nums.push(i); } else { let a=Math.max(1,Math.min(X.page-2,pages-5)), b=a+4; for(let i=a;i<=b;i++) nums.push(i); if(a>1) nums.unshift(1,a>2?"…":null); if(b<pages) nums.push(b<pages-1?"…":null,pages); }
  const arrow=(d,dis,l)=>`<button type="button" data-qlxpage="${X.page+d}" ${dis?"disabled":""} aria-label="${l} page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d<0?"m15 18-6-6 6-6":"m9 18 6-6-6-6"}"/></svg></button>`;
  q("#qlxPager").innerHTML=pages<2?"":arrow(-1,X.page===1,"Previous")+nums.filter(n=>n!==null).map(n=>n==="…"?`<span class="gap" aria-hidden="true">…</span>`:`<button type="button" data-qlxpage="${n}"${n===X.page?' aria-current="page"':""} aria-label="Page ${n}">${n}</button>`).join("")+arrow(1,X.page===pages,"Next");
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
        ${fact("Order",x.ord?esc(x.ord)+(x.m3?`<small>Project ${esc(x.m3)}</small>`:""):"Not converted")}
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
function openQuote(id){ if(id==="6000024967") setPage("quote"); else if(id[0]==="o") showToast(`Opens order ${id.slice(1)} (the order page isn't built in the prototype).`); else showToast("Only quote 6000024967 is built in the prototype."); }
function closePops(){ root.querySelectorAll(".qlxpop").forEach(p=>{ p.hidden=true; p.parentNode.querySelector(".qlxpb").setAttribute("aria-expanded","false"); }); }
let tq=null; q("#qlxQ").addEventListener("input",ev=>{ clearTimeout(tq); tq=setTimeout(()=>{ X.q=ev.target.value.trim(); X.page=1; render(); },200); });
q("#qlxQ").addEventListener("keydown",ev=>{ if(ev.key==="Enter"){ clearTimeout(tq); X.q=ev.target.value.trim(); X.page=1; render(); } });
q("#qlxSize").addEventListener("change",ev=>{ X.size=+ev.target.value; X.page=1; render(); });
root.addEventListener("change",ev=>{ const d=ev.target.dataset;
  if(d.qlxpipe){ ev.target.checked?X.pipes.add(d.qlxpipe):X.pipes.delete(d.qlxpipe); X.page=1; render(); q(`[data-qlxpipe="${d.qlxpipe}"]`)?.focus(); return; }
  if(d.qlxstale){ X.stale=ev.target.checked; X.page=1; render(); q("[data-qlxstale]")?.focus(); return; }
  if(d.qlxval!==undefined){ X.val=+d.qlxval; X.page=1; render(); q(`[data-qlxval="${d.qlxval}"]`)?.focus(); return; }
  if(d.qlxconv){ X.conv=d.qlxconv; X.page=1; render(); q(`[data-qlxconv="${d.qlxconv}"]`)?.focus(); } });
const POPS={pipe:"#qlxPipePop",val:"#qlxValPop",conv:"#qlxConvPop"};
root.addEventListener("click",ev=>{ const b=ev.target.closest("button,a"); const d=b?b.dataset:{};
  if(d.qlxcopy){ ev.stopPropagation(); navigator.clipboard?.writeText(d.qlxcopy).catch(()=>{}); showToast("Copied "+d.qlxcopy,"ok"); return; }
  if(d.qlxqv){ ev.stopPropagation(); qvOpen(d.qlxqv,b); return; }
  if(d.qlxopen){ ev.preventDefault(); openQuote(d.qlxopen); return; }
  if(d.qlxpop){ const p=q(POPS[d.qlxpop]), was=!p.hidden; closePops(); if(!was){ p.hidden=false; b.setAttribute("aria-expanded","true"); p.querySelector("input")?.focus(); } return; }
  if(d.qlxquick){ X[d.qlxquick]=!X[d.qlxquick]; X.page=1; render(); root.querySelector(`[data-qlxquick="${d.qlxquick}"]`).focus(); return; }
  if(d.qlxwho!==undefined){ X.who=d.qlxwho; X.page=1; render(); return; }
  if(d.qlxtype!==undefined){ X.type=d.qlxtype; X.page=1; render(); return; }
  if(d.qlxsort){ if(X.sort===d.qlxsort) X.dir=-X.dir; else { X.sort=d.qlxsort; X.dir=["id","tot"].includes(d.qlxsort)?-1:1; } render(); q(`[data-qlxsort="${d.qlxsort}"]`).focus(); return; }
  if(d.qlxpage){ X.page=+d.qlxpage; render(); q("#qlxPager [aria-current]")?.focus(); q("#qlTitle").scrollIntoView({block:"start"}); return; }
  if(d.qlx==="new"){ q("#qlNew").click(); return; }
  if(d.qlx==="clearpipe"){ X.pipes.clear(); render(); return; }
  if(d.qlx==="everyone"){ X.who="all"; X.page=1; render(); return; }
  if(d.qlx==="clear"){ X.pipes.clear(); X.stale=false; X.soon=false; X.val=0; X.conv="any"; X.type=""; X.who="all"; X.q=""; q("#qlxQ").value=""; X.page=1; closePops(); render(); q("#qlxQ").focus(); return; }
  if(b) return;
  /* anywhere else on a row opens its quote (text selection doesn't) */
  const tr=ev.target.closest("tr[data-qlxrow]"); if(tr&&!String(getSelection())) openQuote(tr.dataset.qlxrow); });
document.addEventListener("click",ev=>{ if(!ev.target.closest(".qlxpill")) closePops(); });
root.addEventListener("keydown",ev=>{ if(ev.key==="Escape"){ const open=root.querySelector(".qlxpop:not([hidden])"); if(open){ ev.stopPropagation(); closePops(); open.parentNode.querySelector(".qlxpb").focus(); } } });

/* ---------- wrap v2 and the switch ---------- */
const oRender=renderQL; renderQL=function(){ oRender.apply(this,arguments); render(); };
const oSetPage=setPage; setPage=function(){ if(!qv.hidden) qvClose(); return oSetPage.apply(this,arguments); };
function apply(){ document.body.classList.toggle("qlx-on",X.on); if(!X.on&&!qv.hidden) qvClose(); if(X.on) render(); }
/* the Waterworks brand bronze as the accent (Jen's deck, Nov 25): on by default, remembered in the browser */
let bronze=true; try{ bronze=localStorage.getItem("qom-v5-bronze")!=="off"; }catch(e){}
document.body.classList.toggle("qlx-bronze",bronze);
const bsw=q("#qlxBronze"); if(bsw){ bsw.checked=bronze; bsw.addEventListener("change",()=>{ bronze=bsw.checked; try{ localStorage.setItem("qom-v5-bronze",bronze?"on":"off"); }catch(e){} document.body.classList.toggle("qlx-bronze",bronze); }); }
const sw=q("#qlxOn"); if(sw){ sw.checked=X.on; sw.addEventListener("change",()=>{ X.on=sw.checked; try{ localStorage.setItem("qom-v5-qlx",X.on?"on":"off"); }catch(e){} apply(); }); }
apply();
})();
</script>
