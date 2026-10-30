# Generiert freundliche, flache Tier-Avatare (eigene Gestaltung, keine Vorlagen).
import os, sys
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

INK = '#1F2937'
def eye(x, y, r=7):
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{INK}"/>'
            f'<circle cx="{x+r*0.35:.1f}" cy="{y-r*0.4:.1f}" r="{r*0.36:.1f}" fill="#fff"/>')
def eyes(y=105, dx=22, r=7, cx=100):
    return eye(cx-dx, y, r) + eye(cx+dx, y, r)
def cheeks(y=124, dx=36, color='#FB7185', op=0.35, r=9):
    return (f'<circle cx="{100-dx}" cy="{y}" r="{r}" fill="{color}" opacity="{op}"/>'
            f'<circle cx="{100+dx}" cy="{y}" r="{r}" fill="{color}" opacity="{op}"/>')
def smile(y=130, w=8, d=6, color=INK, sw=3.2):
    return f'<path d="M{100-w} {y} Q100 {y+d} {100+w} {y}" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" fill="none"/>'
def nose(y=121, rx=6, ry=4.2, color=INK):
    return f'<ellipse cx="100" cy="{y}" rx="{rx}" ry="{ry}" fill="{color}"/>'
def mouth_w(y=127, color=INK):
    # kleines "w"-Mäulchen
    return (f'<path d="M100 {y-3} V{y} M100 {y} Q95 {y+6} 90 {y+2} M100 {y} Q105 {y+6} 110 {y+2}" '
            f'stroke="{color}" stroke-width="3" stroke-linecap="round" fill="none"/>')
def whiskers(y=124, color='#475569'):
    s = ''
    for dy in (-5, 4):
        s += f'<path d="M66 {y+dy} L44 {y+dy*1.6-2}" stroke="{color}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>'
        s += f'<path d="M134 {y+dy} L156 {y+dy*1.6-2}" stroke="{color}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>'
    return s

def head(color, r=58, cy=110):
    return f'<circle cx="100" cy="{cy}" r="{r}" fill="{color}"/>'

A = {}

def fox():
    o, cream, dark = '#F2843A', '#FFF4E6', '#7C2D12'
    return (f'<path d="M50 92 L56 34 L92 66 Z" fill="{o}"/><path d="M150 92 L144 34 L108 66 Z" fill="{o}"/>'
            f'<path d="M58 78 L61 48 L82 66 Z" fill="{dark}" opacity=".35"/><path d="M142 78 L139 48 L118 66 Z" fill="{dark}" opacity=".35"/>'
            + head(o) +
            f'<path d="M42 112 Q60 160 100 168 Q140 160 158 112 Q130 128 100 120 Q70 128 42 112 Z" fill="{cream}"/>'
            + eyes(102) + nose(126, 7, 5) + smile(136, 7, 5) )
A['fuchs'] = fox

def cat():
    c, inner = '#A5B4C8', '#FBCFE8'
    return (f'<path d="M48 96 L54 40 L90 68 Z" fill="{c}"/><path d="M152 96 L146 40 L110 68 Z" fill="{c}"/>'
            f'<path d="M57 82 L60 54 L80 70 Z" fill="{inner}"/><path d="M143 82 L140 54 L120 70 Z" fill="{inner}"/>'
            + head(c) + f'<ellipse cx="100" cy="130" rx="22" ry="15" fill="#E2E8F0"/>'
            + eyes(104) + f'<path d="M95 119 H105 L100 125 Z" fill="#F472B6"/>' + mouth_w(129) + whiskers(124) + cheeks(122, 38))
A['katze'] = cat

def dog():
    c, ear, muz = '#E3B47C', '#8B5E3C', '#FFF1DE'
    return (f'<ellipse cx="50" cy="104" rx="17" ry="34" fill="{ear}" transform="rotate(18 50 104)"/>'
            f'<ellipse cx="150" cy="104" rx="17" ry="34" fill="{ear}" transform="rotate(-18 150 104)"/>'
            + head(c, 56) + f'<ellipse cx="122" cy="96" rx="16" ry="14" fill="{ear}" opacity=".55"/>'
            f'<ellipse cx="100" cy="132" rx="26" ry="20" fill="{muz}"/>'
            + eyes(102) + nose(124, 8, 6) + smile(134, 8, 6) +
            '<path d="M96 138 Q100 152 104 138 Z" fill="#FB7185"/>')
A['hund'] = dog

def bear():
    c, light = '#A9744F', '#E7C9A9'
    return (f'<circle cx="56" cy="62" r="20" fill="{c}"/><circle cx="144" cy="62" r="20" fill="{c}"/>'
            f'<circle cx="56" cy="62" r="10" fill="{light}"/><circle cx="144" cy="62" r="10" fill="{light}"/>'
            + head(c) + f'<ellipse cx="100" cy="130" rx="27" ry="21" fill="{light}"/>'
            + eyes(104) + nose(122, 9, 6.5) + smile(133, 7, 5) + cheeks(124, 40))
A['baer'] = bear

def panda():
    w, k = '#FFFFFF', '#1F2937'
    return (f'<circle cx="56" cy="62" r="19" fill="{k}"/><circle cx="144" cy="62" r="19" fill="{k}"/>'
            + head(w) +
            f'<ellipse cx="77" cy="106" rx="14" ry="18" fill="{k}" transform="rotate(25 77 106)"/>'
            f'<ellipse cx="123" cy="106" rx="14" ry="18" fill="{k}" transform="rotate(-25 123 106)"/>'
            '<circle cx="79" cy="105" r="5.5" fill="#fff"/><circle cx="121" cy="105" r="5.5" fill="#fff"/>'
            '<circle cx="80" cy="104" r="2.5" fill="#1F2937"/><circle cx="122" cy="104" r="2.5" fill="#1F2937"/>'
            + nose(124, 7, 5) + smile(133, 6, 5) + cheeks(126, 40))
A['panda'] = panda

def rabbit():
    c, inner = '#E9DFD3', '#FBCFE8'
    return (f'<ellipse cx="78" cy="48" rx="13" ry="36" fill="{c}" transform="rotate(-10 78 48)"/>'
            f'<ellipse cx="122" cy="48" rx="13" ry="36" fill="{c}" transform="rotate(10 122 48)"/>'
            f'<ellipse cx="78" cy="50" rx="6" ry="26" fill="{inner}" transform="rotate(-10 78 50)"/>'
            f'<ellipse cx="122" cy="50" rx="6" ry="26" fill="{inner}" transform="rotate(10 122 50)"/>'
            + head(c, 56, 116) + eyes(110) + f'<path d="M95 124 H105 L100 129 Z" fill="#F472B6"/>' + mouth_w(133)
            + '<rect x="96" y="134" width="8" height="8" rx="2" fill="#fff" stroke="#CBD5E1" stroke-width="1.5"/>' + cheeks(128, 36))
A['hase'] = rabbit

def koala():
    c, inner = '#A8B3C2', '#E2E8F0'
    return (f'<circle cx="48" cy="84" r="27" fill="{c}"/><circle cx="152" cy="84" r="27" fill="{c}"/>'
            f'<circle cx="50" cy="86" r="15" fill="{inner}"/><circle cx="150" cy="86" r="15" fill="{inner}"/>'
            + head(c, 56, 114) + eyes(108, 24, 6.5) +
            f'<ellipse cx="100" cy="126" rx="13" ry="17" fill="#334155"/><ellipse cx="96" cy="120" rx="3.5" ry="5" fill="#64748B"/>'
            + cheeks(132, 38))
A['koala'] = koala

def lion():
    mane, c, muz = '#C2702A', '#F7BE4F', '#FFF0D6'
    import math
    m = ''.join(f'<circle cx="{100+68*math.cos(a):.1f}" cy="{110+68*math.sin(a):.1f}" r="20" fill="{mane}"/>'
                for a in [i*math.pi/6 for i in range(12)])
    return (m + f'<circle cx="100" cy="110" r="66" fill="{mane}"/>'
            f'<circle cx="64" cy="68" r="12" fill="{c}"/><circle cx="136" cy="68" r="12" fill="{c}"/>'
            + head(c, 52) + f'<ellipse cx="100" cy="130" rx="24" ry="18" fill="{muz}"/>'
            + eyes(104, 20) + f'<path d="M93 120 H107 L100 128 Z" fill="#7C2D12"/>' + mouth_w(131, '#7C2D12') + cheeks(124, 34))
A['loewe'] = lion

def tiger():
    c, st, w = '#F59E42', '#3F2A1D', '#FFF7ED'
    return (f'<circle cx="58" cy="64" r="16" fill="{c}"/><circle cx="142" cy="64" r="16" fill="{c}"/>'
            f'<circle cx="58" cy="64" r="8" fill="{st}" opacity=".7"/><circle cx="142" cy="64" r="8" fill="{st}" opacity=".7"/>'
            + head(c) +
            f'<path d="M100 54 L94 70 L100 66 L106 70 Z" fill="{st}"/>'
            f'<path d="M86 56 L84 70" stroke="{st}" stroke-width="5" stroke-linecap="round"/><path d="M114 56 L116 70" stroke="{st}" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M43 100 L60 104 M44 116 L60 116" stroke="{st}" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M157 100 L140 104 M156 116 L140 116" stroke="{st}" stroke-width="5" stroke-linecap="round"/>'
            f'<ellipse cx="100" cy="132" rx="28" ry="20" fill="{w}"/>'
            + eyes(102) + f'<path d="M93 121 H107 L100 128 Z" fill="#F472B6"/>' + mouth_w(131))
A['tiger'] = tiger

def mouse():
    c, inner = '#C7CED9', '#FBCFE8'
    return (f'<circle cx="52" cy="66" r="30" fill="{c}"/><circle cx="148" cy="66" r="30" fill="{c}"/>'
            f'<circle cx="52" cy="66" r="18" fill="{inner}"/><circle cx="148" cy="66" r="18" fill="{inner}"/>'
            + head(c, 54, 116) + eyes(110, 20, 6.5) + nose(126, 6, 5, '#F472B6') + smile(134, 6, 4) + whiskers(128) )
A['maus'] = mouse

def pig():
    c, snout, dark = '#F9B4CB', '#F48FB1', '#BE185D'
    return (f'<path d="M52 82 L50 44 L84 62 Z" fill="{c}"/><path d="M148 82 L150 44 L116 62 Z" fill="{c}"/>'
            f'<path d="M57 72 L56 54 L74 64 Z" fill="{snout}"/><path d="M143 72 L144 54 L126 64 Z" fill="{snout}"/>'
            + head(c) + eyes(100, 24) +
            f'<ellipse cx="100" cy="128" rx="22" ry="16" fill="{snout}"/>'
            f'<ellipse cx="93" cy="128" rx="4" ry="6" fill="{dark}"/><ellipse cx="107" cy="128" rx="4" ry="6" fill="{dark}"/>'
            + cheeks(118, 42, '#EC4899', .3))
A['schwein'] = pig

def cow():
    c, spot, muz = '#FAFAF9', '#6B4F3A', '#F9C0CF'
    return (f'<path d="M66 60 Q60 40 72 34" stroke="#E7D7B5" stroke-width="9" stroke-linecap="round" fill="none"/>'
            f'<path d="M134 60 Q140 40 128 34" stroke="#E7D7B5" stroke-width="9" stroke-linecap="round" fill="none"/>'
            f'<ellipse cx="42" cy="88" rx="20" ry="11" fill="{c}" transform="rotate(20 42 88)"/>'
            f'<ellipse cx="158" cy="88" rx="20" ry="11" fill="{c}" transform="rotate(-20 158 88)"/>'
            + head(c, 56) +
            f'<path d="M118 60 Q150 64 152 96 Q132 98 126 84 Q116 76 118 60 Z" fill="{spot}"/>'
            f'<ellipse cx="100" cy="138" rx="36" ry="22" fill="{muz}"/>'
            '<ellipse cx="88" cy="138" rx="4.5" ry="6" fill="#9D174D"/><ellipse cx="112" cy="138" rx="4.5" ry="6" fill="#9D174D"/>'
            + eyes(104, 22))
A['kuh'] = cow

def monkey():
    c, face = '#9A6340', '#F7D2B0'
    return (f'<circle cx="44" cy="110" r="18" fill="{c}"/><circle cx="156" cy="110" r="18" fill="{c}"/>'
            f'<circle cx="44" cy="110" r="10" fill="{face}"/><circle cx="156" cy="110" r="10" fill="{face}"/>'
            + head(c) +
            f'<circle cx="82" cy="104" r="20" fill="{face}"/><circle cx="118" cy="104" r="20" fill="{face}"/>'
            f'<ellipse cx="100" cy="132" rx="32" ry="24" fill="{face}"/>'
            + eyes(104, 18, 6.5) + '<circle cx="95" cy="124" r="2.5" fill="#7C4A2D"/><circle cx="105" cy="124" r="2.5" fill="#7C4A2D"/>'
            + smile(134, 10, 7, '#7C4A2D'))
A['affe'] = monkey

def owl():
    c, belly, beak = '#8D6E9E', '#E9D5FF', '#F59E0B'
    return (f'<path d="M48 70 L52 38 L76 60 Z" fill="{c}"/><path d="M152 70 L148 38 L124 60 Z" fill="{c}"/>'
            + head(c, 60, 112) +
            f'<ellipse cx="100" cy="146" rx="34" ry="22" fill="{belly}" opacity=".7"/>'
            '<circle cx="76" cy="104" r="21" fill="#fff"/><circle cx="124" cy="104" r="21" fill="#fff"/>'
            + eyes(104, 24, 10) + f'<path d="M92 118 L108 118 L100 132 Z" fill="{beak}"/>')
A['eule'] = owl

def penguin():
    c, w, beak = '#334155', '#FFFFFF', '#F59E0B'
    return (head(c, 60, 110) +
            f'<path d="M100 82 Q84 64 66 78 Q48 96 58 130 Q74 164 100 166 Q126 164 142 130 Q152 96 134 78 Q116 64 100 82 Z" fill="{w}"/>'
            + eyes(108, 20, 6.5) + f'<path d="M90 120 Q100 114 110 120 Q100 132 90 120 Z" fill="{beak}"/>' + cheeks(128, 34))
A['pinguin'] = penguin

def frog():
    c, belly = '#5BC97A', '#C8F2D3'
    return (f'<circle cx="70" cy="72" r="22" fill="{c}"/><circle cx="130" cy="72" r="22" fill="{c}"/>'
            f'<ellipse cx="100" cy="118" rx="66" ry="50" fill="{c}"/>'
            '<circle cx="70" cy="70" r="14" fill="#fff"/><circle cx="130" cy="70" r="14" fill="#fff"/>'
            + eye(70, 71, 7.5) + eye(130, 71, 7.5) +
            f'<ellipse cx="100" cy="140" rx="34" ry="16" fill="{belly}" opacity=".7"/>'
            '<path d="M70 118 Q100 140 130 118" stroke="#166534" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
            + cheeks(116, 46, '#FB7185', .35, 8))
A['frosch'] = frog

def raccoon():
    c, mask, w = '#9CA3AF', '#374151', '#F8FAFC'
    return (f'<path d="M50 84 L54 42 L86 64 Z" fill="{c}"/><path d="M150 84 L146 42 L114 64 Z" fill="{c}"/>'
            f'<path d="M58 74 L60 54 L76 66 Z" fill="{w}"/><path d="M142 74 L140 54 L124 66 Z" fill="{w}"/>'
            + head(c) +
            f'<path d="M44 104 Q60 86 100 98 Q140 86 156 104 Q140 120 118 112 Q100 104 82 112 Q60 120 44 104 Z" fill="{mask}"/>'
            f'<path d="M64 128 Q100 108 136 128 Q128 166 100 168 Q72 166 64 128 Z" fill="{w}"/>'
            '<circle cx="78" cy="104" r="6" fill="#fff"/><circle cx="122" cy="104" r="6" fill="#fff"/>'
            '<circle cx="79" cy="104" r="3" fill="#111827"/><circle cx="123" cy="104" r="3" fill="#111827"/>'
            + nose(128, 7, 5) + smile(138, 6, 4))
A['waschbaer'] = raccoon

def hedgehog():
    sp, face = '#8B5E3C', '#F6DDBA'
    import math
    spikes = ''
    for i in range(13):
        a = math.pi + i * math.pi / 12
        x1, y1 = 100 + 58*math.cos(a-0.12), 112 + 58*math.sin(a-0.12)
        x2, y2 = 100 + 84*math.cos(a), 112 + 84*math.sin(a)
        x3, y3 = 100 + 58*math.cos(a+0.12), 112 + 58*math.sin(a+0.12)
        spikes += f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} L{x3:.1f} {y3:.1f} Z" fill="{sp}"/>'
    return (spikes + f'<circle cx="100" cy="112" r="62" fill="{sp}"/>'
            f'<path d="M48 118 Q56 78 100 78 Q144 78 152 118 Q148 166 100 168 Q52 166 48 118 Z" fill="{face}"/>'
            + eyes(112, 20, 6.5) + nose(130, 8, 6) + smile(140, 6, 4) + cheeks(130, 34))
A['igel'] = hedgehog

def deer():
    c, light, ant = '#C58A5A', '#F5DEC4', '#8B5E3C'
    return (f'<path d="M72 56 L66 28 M66 40 L54 34 M128 56 L134 28 M134 40 L146 34" stroke="{ant}" stroke-width="6" stroke-linecap="round" fill="none"/>'
            f'<ellipse cx="44" cy="84" rx="22" ry="11" fill="{c}" transform="rotate(25 44 84)"/>'
            f'<ellipse cx="156" cy="84" rx="22" ry="11" fill="{c}" transform="rotate(-25 156 84)"/>'
            + head(c, 54, 112) +
            f'<ellipse cx="100" cy="138" rx="24" ry="20" fill="{light}"/>'
            f'<circle cx="74" cy="80" r="3.5" fill="{light}"/><circle cx="126" cy="80" r="3.5" fill="{light}"/><circle cx="100" cy="72" r="3.5" fill="{light}"/>'
            + eyes(106, 20) + nose(130, 8, 6) + smile(142, 5, 4))
A['reh'] = deer

def chick():
    c, beak = '#FCD34D', '#F97316'
    return (f'<path d="M96 52 Q92 36 100 32 Q102 44 108 38 Q110 50 104 54 Z" fill="{c}"/>'
            + head(c, 60, 112) + eyes(106, 22) +
            f'<path d="M90 120 L100 112 L110 120 L100 130 Z" fill="{beak}"/>' + cheeks(126, 38, '#FB923C', .4))
A['kueken'] = chick

def sheep():
    wool, face = '#FFFFFF', '#5B5560'
    import math
    puffs = ''.join(f'<circle cx="{100+56*math.cos(a):.1f}" cy="{104+50*math.sin(a):.1f}" r="22" fill="{wool}"/>'
                    for a in [i*math.pi/5 for i in range(10)])
    return (puffs + f'<circle cx="100" cy="104" r="58" fill="{wool}"/>'
            f'<ellipse cx="54" cy="112" rx="18" ry="9" fill="{face}" transform="rotate(25 54 112)"/>'
            f'<ellipse cx="146" cy="112" rx="18" ry="9" fill="{face}" transform="rotate(-25 146 112)"/>'
            f'<ellipse cx="100" cy="122" rx="34" ry="40" fill="{face}"/>'
            f'<circle cx="86" cy="86" r="14" fill="{wool}"/><circle cx="100" cy="80" r="15" fill="{wool}"/><circle cx="114" cy="86" r="14" fill="{wool}"/>'
            '<circle cx="86" cy="114" r="6.5" fill="#fff"/><circle cx="114" cy="114" r="6.5" fill="#fff"/>'
            '<circle cx="87" cy="115" r="3.2" fill="#111827"/><circle cx="115" cy="115" r="3.2" fill="#111827"/>'
            + smile(140, 7, 5, '#fff', 3) + cheeks(130, 24, '#FDA4AF', .5, 6))
A['schaf'] = sheep

def elephant():
    c, ear = '#A5B4CB', '#C7D2E3'
    return (f'<ellipse cx="44" cy="104" rx="30" ry="38" fill="{c}"/><ellipse cx="156" cy="104" rx="30" ry="38" fill="{c}"/>'
            f'<ellipse cx="46" cy="104" rx="18" ry="26" fill="{ear}"/><ellipse cx="154" cy="104" rx="18" ry="26" fill="{ear}"/>'
            + head(c, 54, 104) +
            f'<path d="M88 116 Q86 150 98 166 Q106 174 114 166 Q106 160 108 150 Q112 132 112 116 Z" fill="{c}"/>'
            + eyes(100, 22, 6.5) + cheeks(120, 32))
A['elefant'] = elephant

def seal():
    c = '#CBD5E1'
    return (head(c, 62, 112) + f'<ellipse cx="100" cy="132" rx="30" ry="20" fill="#E2E8F0"/>'
            + eyes(102, 24, 7.5) + nose(122, 8, 5.5) + smile(132, 7, 5) +
            ''.join(f'<circle cx="{x}" cy="{y}" r="1.8" fill="#64748B"/>' for x, y in [(84,128),(80,134),(88,134),(116,128),(120,134),(112,134)])
            + cheeks(126, 42))
A['robbe'] = seal

def sloth():
    c, face, patch = '#B99A7A', '#EAD8C0', '#5B4636'
    return (head(c, 60, 110) +
            f'<ellipse cx="100" cy="116" rx="46" ry="38" fill="{face}"/>'
            f'<ellipse cx="78" cy="108" rx="16" ry="10" fill="{patch}" transform="rotate(-25 78 108)"/>'
            f'<ellipse cx="122" cy="108" rx="16" ry="10" fill="{patch}" transform="rotate(25 122 108)"/>'
            '<circle cx="80" cy="107" r="5" fill="#fff"/><circle cx="120" cy="107" r="5" fill="#fff"/>'
            '<circle cx="81" cy="107" r="2.6" fill="#111827"/><circle cx="121" cy="107" r="2.6" fill="#111827"/>'
            + nose(124, 8, 5.5, '#3F2E22') + smile(134, 9, 6, '#3F2E22'))
A['faultier'] = sloth

def unicorn_free_otter():
    c, light = '#A47551', '#EBD3B8'
    return (f'<circle cx="58" cy="70" r="12" fill="{c}"/><circle cx="142" cy="70" r="12" fill="{c}"/>'
            + head(c) + f'<ellipse cx="100" cy="128" rx="34" ry="24" fill="{light}"/>'
            + eyes(102, 22) + nose(120, 9, 6) + mouth_w(127) + whiskers(130, '#5B4636'))
A['otter'] = unicorn_free_otter

BGS = ['#DBEAFE', '#EDE9FE', '#FCE7F3', '#DCFCE7', '#FEF3C7', '#E0F2FE', '#FFE4E6', '#FFEDD5']

names = list(A.keys())
count = 0
for i, n in enumerate(names):
    for k in range(3):
        bg = BGS[(i * 3 + k * 3) % len(BGS)]
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="128" height="128">'
               f'<rect width="200" height="200" fill="{bg}"/>{A[n]()}</svg>')
        open(os.path.join(OUT, f'tiere-{i*3+k}.svg'), 'w').write(svg)
        count += 1
open(os.path.join(OUT, '_names.txt'), 'w').write('\n'.join(names))
print(count, len(names))
