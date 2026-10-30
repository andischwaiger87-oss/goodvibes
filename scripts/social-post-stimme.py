import cairosvg, base64, sys
AV='/sessions/optimistic-lucid-mayer/mnt/GoodVibes/public/avatars/'
def img(name):
    return 'data:image/svg+xml;base64,'+base64.b64encode(open(AV+name,'rb').read()).decode()
HEART='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'
THUMB='M7 10v12 M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z'
ideas=[('tiere-72.svg','Berufskompass Saalachtal','Bildung &amp; Lernen','ZukunftsKompass'),
       ('tiere-3.svg','Inserat-Helfer','Umwelt &amp; Natur','ReUse'),
       ('tiere-18.svg','Gemeinsam rocken wir alles','Zusammenleben','Sonnenblume')]
cards=''
y0=520
for i,(av,t,cat,u) in enumerate(ideas):
    y=y0+i*132
    cards+=f'''
<rect x="80" y="{y+6}" width="920" height="112" rx="30" fill="#0F172A" opacity=".035"/>
<rect x="80" y="{y}" width="920" height="112" rx="28" fill="#fff" stroke="#E2E8F0" stroke-width="2"/>
<clipPath id="c{i}"><rect x="104" y="{y+20}" width="72" height="72" rx="20"/></clipPath>
<image href="{img(av)}" x="104" y="{y+20}" width="72" height="72" clip-path="url(#c{i})"/>
<text x="200" y="{y+52}" font-family="Inter" font-weight="700" font-size="30" fill="#0F172A">{t}</text>
<text x="200" y="{y+86}" font-family="Inter" font-size="22"><tspan font-weight="600" fill="#2563EB">{cat}</tspan><tspan fill="#64748B"> · von {u}</tspan></text>
<rect x="748" y="{y+30}" width="228" height="52" rx="26" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="2"/>
<g transform="translate(772 {y+44}) scale(1)" fill="none" stroke="#1D4ED8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="{THUMB}"/></g>
<text x="806" y="{y+64}" font-family="Inter" font-weight="600" font-size="22" fill="#1D4ED8">Unterstützen</text>'''
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1080" width="1080" height="1080">
<defs>
<radialGradient id="glow" cx="1000" cy="60" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#C7D2FE" stop-opacity=".75"/><stop offset="1" stop-color="#C7D2FE" stop-opacity="0"/></radialGradient>
<radialGradient id="glow2" cx="40" cy="1080" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#DDD6FE" stop-opacity=".55"/><stop offset="1" stop-color="#DDD6FE" stop-opacity="0"/></radialGradient>
<linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2563EB"/><stop offset=".55" stop-color="#4F46E5"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
<linearGradient id="logo" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#4F46E5"/></linearGradient>
</defs>
<rect width="1080" height="1080" fill="#F8FAFC"/>
<rect width="1080" height="1080" fill="url(#glow)"/>
<rect width="1080" height="1080" fill="url(#glow2)"/>
<rect x="80" y="80" width="64" height="64" rx="18" fill="url(#logo)"/>
<g transform="translate(96 97) scale(1.35)"><path d="{HEART}" fill="#fff"/></g>
<text x="164" y="126" font-family="Inter" font-weight="800" font-size="38" fill="#0F172A" letter-spacing="-0.5">GoodVibes</text>
<text x="76" y="300" font-family="Inter" font-weight="800" font-size="100" fill="#0F172A" letter-spacing="-3">Deine Stimme</text>
<text x="76" y="406" font-family="Inter" font-weight="800" font-size="100" fill="url(#brand)" letter-spacing="-3">zählt.</text>
<text x="80" y="466" font-family="Inter" font-size="32" fill="#64748B">Abstimmen, teilen, Ideen einreichen.</text>
{cards}
<rect x="80" y="938" width="920" height="72" rx="36" fill="url(#brand)"/>
<circle cx="118" cy="974" r="24" fill="#fff"/>
<path d="M108 974 H128 M120 966 L128 974 L120 982" stroke="#4F46E5" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<text x="164" y="985" font-family="Inter" font-weight="700" font-size="30" fill="#fff">goodvibes.mosaik-design.at</text>
<text x="976" y="984" text-anchor="end" font-family="Inter" font-weight="600" font-size="22" fill="#fff" opacity=".85">Gemeinnützig · kostenlos</text>
</svg>'''
open('/tmp/post.svg','w').write(svg)
cairosvg.svg2png(bytestring=svg.encode(), write_to=sys.argv[1], output_width=1080, output_height=1080)
