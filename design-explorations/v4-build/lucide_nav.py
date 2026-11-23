# Swap the side nav's hand-drawn icons for Lucide (design.md: icons are Lucide, @ng-icons/lucide).
# Paths copied from @ng-icons/lucide 32.5.0 (Lucide, ISC licence). Run from the prototype folder:
#   python3 design-explorations/v4-build/lucide_nav.py qom-product-search-prototype-v4.html
# mkv4.py calls it too, so a rebuild keeps the icons.
import re, sys

ICONS = {
    'Welcome': ('house', '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    'Clients': ('users', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>'),
    'Projects': ('folder-kanban', '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>'),
    'Quotes': ('file-text', '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'),
    'Orders': ('package', '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>'),
    'Import Tools': ('arrow-left-right', '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>'),
    'Log Out': ('log-out', '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>'),
}

def swap(s):
    for label, (name, body) in ICONS.items():
        svg = ('<svg class="lucide lucide-%s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
               'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>') % (name, body)
        pat = re.compile(r'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"[^>]*>(?:(?!</svg>).)*</svg>(<span class="rl">%s</span>)' % re.escape(label))
        s, n = pat.subn(lambda m: svg + m.group(1), s)
        if n != 1:
            sys.exit('lucide_nav: expected one "%s" icon, found %d' % (label, n))
    return s

if __name__ == '__main__':
    f = sys.argv[1]
    s = open(f).read()
    open(f, 'w').write(swap(s))
    print('lucide nav icons:', ', '.join(ICONS))
