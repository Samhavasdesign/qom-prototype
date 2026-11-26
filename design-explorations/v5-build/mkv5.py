# Builds v5 from v4: the Quote Page Proposal and global search, as one layer (proposal.css, proposal.js) and a demo-bar switch.
# Run from the prototype folder after rebuilding v4: python3 design-explorations/v5-build/mkv5.py
import os,sys
D=os.path.dirname(os.path.abspath(__file__))+'/'
s=open('qom-product-search-prototype-v4.html').read()
def rep(a,b):
    global s
    if s.count(a)!=1: sys.exit(f"MISSING ({s.count(a)}): {a[:70]}")
    s=s.replace(a,b)
rep('<title>QOM product search prototype v4 (theme v1)</title>','<title>QOM prototype v5 (proposal and global search)</title>')
rep('<label title="v4 only: restyles controls',
    '<label title="v5 only: the Quote Page Proposal (tool column, Details, no tabs, new quote in one step) and global search (side nav, ⌘K)."><input type="checkbox" id="propOn" checked autocomplete="off"> <strong>Proposal layout and global search</strong></label>\n  <label title="v4 only: restyles controls')
# demo bar: a button beside Scenario that opens the one-step New quote form (same as Quotes list → Create new)
j=s.index('<select id="scenario">'); j=s.index('</label>',j)+len('</label>')
s=s[:j]+'\n  <button type="button" class="pbtn" id="propNew" title="v5 only: opens the one-step New quote form, as Quotes → Create new does. Create opens a fresh quote with no lines.">New quote form</button>'+s[j:]
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'proposal.css').read()+'</style>\n'+open(D+'proposal.js').read()+s[i:]
# Quotes list redesign (QOM-3332, Nov 24): its own layer and switch, after the proposal layer
rep('<strong>Proposal layout and global search</strong></label>',
    '<strong>Proposal layout and global search</strong></label>\n  <label title="v5 only: first pass at the Quotes list redesign (QOM-3332). Off shows today\'s list."><input type="checkbox" id="qlxOn" checked autocomplete="off"> <strong>Quotes list redesign</strong></label>\n  <label title="v5 only: the Waterworks brand bronze (#8C704E, from Jen\'s deck) as the accent: the Quotes list\'s links and selection marks, and text links on every page. Off shows them in black and grey."><input type="checkbox" id="qlxBronze" checked autocomplete="off"> Bronze accent</label>')
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'quotes-list.css').read()+'</style>\n'+open(D+'quotes-list.js').read()+s[i:]
# Top navigation bar (Nov 25): a trial, off by default, with its own switch
rep('<strong>Quotes list redesign</strong></label>',
    '<strong>Quotes list redesign</strong></label>\n  <label title="v5 only: trial of a black top bar in place of the side nav (from md up). On by default."><input type="checkbox" id="tnOn" checked autocomplete="off"> <strong>Top navigation bar</strong></label>')
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'topnav.css').read()+'</style>\n'+open(D+'topnav.js').read()+s[i:]
# Notifications (Nov 25): the top bar's bell, as production's (sp-fe notifications component) in v5's styles
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'notif.css').read()+'</style>\n'+open(D+'notif.js').read()+s[i:]
# Home (Nov 25): production's Welcome screen, renamed Home; after the top bar so it can relabel both navs
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'home.css').read()+'</style>\n'+open(D+'home.js').read()+s[i:]
# Navy buttons and greys (Nov 25): a color trial, off by default, with its own switch after Bronze accent
rep('id="qlxBronze" checked autocomplete="off"> Bronze accent</label>',
    'id="qlxBronze" checked autocomplete="off"> Bronze accent</label>\n  <label title="v5 only: trial of navy for dark controls inside the page (buttons, set pills, selected toggles; the app frame stays black) and a navy bar for the room being added to, with neutral grey fills and charcoal secondary text. On by default."><input type="checkbox" id="warmOn" checked autocomplete="off"> Navy buttons and greys</label>')
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'color.css').read()+'</style>\n'+open(D+'color.js').read()+s[i:]
# How a quote becomes an order (Nov 25, backend research): Convert to order for no-charge quotes, and paid, order pending. Its demo controls are added by orders.js
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'orders.css').read()+'</style>\n'+open(D+'orders.js').read()+s[i:]
open('qom-product-search-prototype-v5.html','w').write(s)
print('ok',len(s))
