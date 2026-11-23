import re,sys
src=open('qom-product-search-prototype-v2.html').read()
s=src
def rep(a,b,count=1):
    global s
    n=s.count(a)
    if n<count or n==0: sys.exit(f"MISSING ({n}): {a[:70]}")
    s=s.replace(a,b)
rep('<title>QOM product search prototype</title>','<title>QOM product search prototype v4 (theme v1)</title>')
rep('family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Figtree:wght@400;500;600','family=Libre+Caslon+Text:ital,wght@0,400;1,400&family=Figtree:wght@400;500;700')
# root tokens -> theme v1 (sp-fe/audit/theme.css)
for a,b in [
 ('--amber:#8a5200;--amber-bg:#fdf1d6;--surface:#f5f5f5;--surface-2:#ebebeb;','--amber:#b45309;--amber-bg:#f8eee6;--surface:#f3f3f3;--surface-2:#e5e5e5;'),
 ('--ink:#111111;--ink-2:#4a4a4a;--ink-3:#6f6f6f;','--ink:#121212;--ink-2:#666666;--ink-3:#666666;'),
 ('--line:#dcdcdc;--line-2:#ebebeb;','--line:#e5e5e5;--line-2:#e5e5e5;'),
 ('--rail-2:#262626;','--rail-2:#2a2a2a;'),
 ('--accent:#111111;','--accent:#121212;'),
 ('--ok:#2d6a4f;--ok-bg:#e8f3ed;','--ok:#047857;--ok-bg:#e6f2ee;'),
 ('--done:#2E6B45;--block:#C62828;--block-bg:#fdecea;--prog:#2B5C8A;--prog-bg:#eef3f8;','--done:#047857;--block:#c62828;--block-bg:#f9eaea;--prog:#1d4ed8;--prog-bg:#e8edfb;'),
 ('--focus:#111111;','--focus:rgb(18 18 18 / .5);'),
 ('--control-line:#949494;','--control-line:#8a8a8a;'),
]: rep(a,b)
rep('  --bp-sm:640px;','''  /* theme v1 (Nov 20): Spartan's radius steps from --radius 4px; sm buttons, inputs, tags; md menus, toasts; lg cards, dialogs */
  --radius:4px;--r-sm:calc(var(--radius)*.6);--r-md:calc(var(--radius)*.8);--r-lg:var(--radius);
  --bp-sm:640px;''')
rep('body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:14px;line-height:1.4}',
    'body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:14px;line-height:20px;font-synthesis:none} /* theme v1: body 14/20, no fake bold */\nbutton,input,select,textarea{border-radius:var(--r-sm)} /* theme v1: near-square controls; pills and round icons set their own */')
rep(':focus-visible{outline:2px solid var(--focus);outline-offset:2px}',':focus-visible{outline:3px solid var(--focus);outline-offset:1px} /* theme v1: Spartan\'s ring, #121212 at 50% */')
# weights: Gotham Narrow has 400 and 500 only; 700 stays as the font-heading stand-in
s=s.replace('font-weight:600','font-weight:500')
# square controls -> radius sm
s=re.sub(r'border-radius:0(?=[;}])','border-radius:var(--r-sm)',s)
rep('.qmore{position:fixed;z-index:220;min-width:300px;max-height:calc(100vh - 24px);overflow-y:auto;padding:10px 0;background:var(--bg);border-radius:6px;','.qmore{position:fixed;z-index:220;min-width:300px;max-height:calc(100vh - 24px);overflow-y:auto;padding:10px 0;background:var(--bg);border-radius:var(--r-md);')
rep('.tag{display:inline-block;border-radius:3px;','.tag{display:inline-block;border-radius:var(--r-sm);')
# control heights: 36 default
for a,b in [
 ('.btn.sm{height:44px;','.btn.sm{height:36px;'),
 ('.qroom .room-btn{height:44px;','.qroom .room-btn{height:36px;'),
 ('.search input{width:100%;height:44px;','.search input{width:100%;height:36px;'),
 ('.fc-f select{width:100%;height:48px;','.fc-f select{width:100%;height:36px;'),
 ('.fc-loadsel{display:flex;align-items:center;gap:10px;height:48px;','.fc-loadsel{display:flex;align-items:center;gap:10px;height:36px;'),
 ('.fc-foot .dbtn{flex:0 0 150px;height:50px','.fc-foot .dbtn{flex:0 0 150px;height:36px'),
 ('.dbtn{flex:1 1 0;max-width:200px;height:50px;','.dbtn{flex:1 1 0;max-width:200px;height:36px;'),
 ('.cpx input[type=text]{width:100%;height:38px;','.cpx input[type=text]{width:100%;height:36px;'),
 ('.shiprow input,.shiprow select{width:100%;height:38px;','.shiprow input,.shiprow select{width:100%;height:36px;'),
 ('.fpill{position:relative;display:inline-flex;align-items:stretch;height:44px;','.fpill{position:relative;display:inline-flex;align-items:stretch;height:36px;'),
 ('.fpsrch input{width:100%;height:44px;','.fpsrch input{width:100%;height:36px;'),
 ('.lfilter{display:flex;align-items:center;gap:10px;height:44px;','.lfilter{display:flex;align-items:center;gap:10px;height:36px;'),
 ('.pf-l{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:22px;font-size:15px;','.pf-l{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:20px;font-size:14px;font-weight:500;'),
 ('.pf-chk{display:inline-flex;align-items:center;gap:10px;font-weight:500;font-size:15px;','.pf-chk{display:inline-flex;align-items:center;gap:10px;font-weight:500;font-size:14px;'),
 ('.pf-chk input{width:20px;height:20px;','.pf-chk input{width:16px;height:16px;'),
 ('.pf-box{position:relative;display:flex;align-items:stretch;height:56px;border:1px solid var(--line);','.pf-box{position:relative;display:flex;align-items:stretch;height:36px;border:1px solid var(--control-line);border-radius:var(--r-sm);'),
 ('padding:0 18px;font-size:15px;letter-spacing:.02em;','padding:0 12px;font-size:14px;letter-spacing:0;'),
 ('.pf-box .pf-caret{position:absolute;right:18px;','.pf-box .pf-caret{position:absolute;right:12px;'),
 ('.pf-ic{flex:none;width:44px;','.pf-ic{flex:none;width:36px;'),
 ('.pf-go{flex:none;width:56px;margin:-1px -1px -1px 0;','.pf-go{flex:none;width:36px;margin:-1px -1px -1px 0;border-radius:0 var(--r-sm) var(--r-sm) 0;'),
 ('.pf-add{height:56px;display:flex;align-items:center;justify-content:center;gap:14px;','.pf-add{height:36px;display:flex;align-items:center;justify-content:center;gap:10px;'),
 ('.pf-addwrap{display:flex;flex-direction:column;gap:6px;padding-top:30px}','.pf-addwrap{display:flex;flex-direction:column;gap:6px;padding-top:28px}'),
 ('.sideform select,.sideform input{font:inherit;font-size:14px;padding:9px 10px;','.sideform select,.sideform input{font:inherit;font-size:14px;height:36px;padding:0 10px;'),
 ('.qm-item{display:flex;align-items:center;gap:22px;width:100%;min-height:48px;padding:6px 28px 6px 24px;border:0;background:none;font:inherit;font-size:16px;','.qm-item{display:flex;align-items:center;gap:12px;width:100%;min-height:36px;padding:6px 16px 6px 14px;border:0;background:none;font:inherit;font-size:14px;'),
 ('.fc-cur{margin:0;min-height:48px;display:flex;align-items:center;padding:0 12px;background:var(--surface);font-size:15px}','.fc-cur{margin:0;min-height:36px;display:flex;align-items:center;padding:0 12px;background:var(--surface);font-size:14px;border-radius:var(--r-sm)}'),
 ('.addroomrow{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;','.addroomrow{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:36px;'),
 ('.qlnew{display:inline-flex;align-items:center;gap:14px;height:48px;','.qlnew{display:inline-flex;align-items:center;gap:14px;height:36px;'),
 ('.empty-quote.none.xl .btn{display:inline-flex;align-items:center;gap:10px;height:48px;','.empty-quote.none.xl .btn{display:inline-flex;align-items:center;gap:10px;height:40px;'),
]: rep(a,b)
# hard-coded colours -> theme
for a,b in [
 ('background:#d21e2b;','background:var(--block);'),
 ('.rb.bad{background:var(--warn-bg);color:var(--warn);border-color:#ecc9b8}','.rb.bad{background:var(--warn-bg);color:var(--warn);border-color:#eebfbf}'),
 ('.rb.risk{background:var(--amber-bg);color:var(--amber);border-color:#ecd9a4}','.rb.risk{background:var(--amber-bg);color:var(--amber);border-color:#ecc9a6}'),
 ('background:#2D6A4F;','background:var(--ok);'),
 ('background:#1B4332;','background:#065f46;'),
]: rep(a,b)
s=re.sub(r'#111(?![0-9a-fA-F])','#121212',s)
s=s.replace('#111111','#121212')
# radius for overlays, appended at the end of the first stylesheet
i=s.index('</style>')
s=s[:i]+'''
/* ---- theme v1 (Nov 20): overlays get Spartan's radius steps (sp-fe/audit/theme.css, design.md) ---- */
.menu,.lmenu,.qmore,.costpop,.fpop,.dtip,.ctoast,.pb-tip{border-radius:var(--r-md)}
.dlg,.dlgcard{border-radius:var(--r-lg)}
/* a narrower side nav: 184px, down from 220 (Sam, Nov 23); the folded icon rail stays 56px */
.app{grid-template-columns:184px 1fr}
html:not(.topnav) .app{--rail-w:184px}
html.navstrip .app{grid-template-columns:56px 1fr;--rail-w:56px}
html.navmid .rail.open{width:184px;margin-right:-128px}
.rail .mark{padding-left:18px;padding-right:18px;letter-spacing:.26em}
.rail a.rlink{padding-left:18px;padding-right:12px}
'''+s[i:]
open('qom-product-search-prototype-v4.html','w').write(s)
print("ok", len(s))
# ---- Spartan components layer and its demo-bar switch ----
import os
D=os.environ['TMPDIR']+'/v4src/'
s=open('qom-product-search-prototype-v4.html').read()
i=s.index('</style>'); s=s[:i]+open(D+'spartan.css').read()+s[i:]
rep('<html lang="en">','<html lang="en" class="sp">')
rep('<label><input type="checkbox" id="riskDemo" checked autocomplete="off"> Stock warning examples</label>',
    '<label title="v4 only: restyles controls to match Spartan components. Off shows theme v1 on QOM controls."><input type="checkbox" id="spSkin" checked autocomplete="off"> <strong>Spartan components</strong></label>\n  <label><input type="checkbox" id="riskDemo" checked autocomplete="off"> Stock warning examples</label>')
rep('</body>',open(D+'toggle.html').read().rstrip('\n'))
open('qom-product-search-prototype-v4.html','w').write(s)
print('spartan layer added')
