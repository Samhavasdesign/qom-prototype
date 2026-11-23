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
i=s.rindex('</body>')
s=s[:i]+'<style>'+open(D+'proposal.css').read()+'</style>\n'+open(D+'proposal.js').read()+s[i:]
open('qom-product-search-prototype-v5.html','w').write(s)
print('ok',len(s))
