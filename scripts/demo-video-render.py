import subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=936,2025; OW,OH=720,1558; FPS=30
L=lambda n: Image.open(f'/tmp/vid/{n}.png').convert('RGB')
FONT='/sessions/optimistic-lucid-mayer/.fonts/'
def strip(parts,total):
    s=Image.new('RGB',(W,total),'white')
    for n,y in parts: s.paste(L(n),(0,y))
    return s
HDR=155
home=strip([('H0',0),('H1',1000),('H2',2000)],3065)
vote=strip([('V0',0),('V1',1000),('V2',2000),('V3',2560)],3625)
sub=strip([('U0',0),('U1',1000),('U2',2000),('U3',2400)],3465)
subc=sub.copy(); subc.paste(L('U3c'),(0,2400))
hdr={k:v.crop((0,0,W,HDR)) for k,v in [('home',home),('vote',vote),('sub',sub)]}
sheet=Image.new('RGB',(W,H)); sheet.paste(L('SH0'),(0,0)); sheet.paste(L('SH1'),(0,960))
# Schritt 2: Basis mit leerem Titel
step2=Image.new('RGB',(W,H)); step2.paste(L('E0'),(0,0)); step2.paste(L('D1'),(0,960))
step2c=step2.copy(); step2c.paste(L('F1'),(0,960))
F38=ImageFont.truetype(FONT+'Inter-400.ttf',38); F27=ImageFont.truetype(FONT+'Inter-400.ttf',27)
PH='z. B. Essensretter für unser Dorf'
def typed(base,txt,caret):
    im=base.copy(); d=ImageDraw.Draw(im)
    d.rectangle((110,650,820,728),fill='white'); d.rectangle((700,560,860,605),fill='white')
    if txt: d.text((128,689),txt,font=F38,fill='#0f172a',anchor='lm')
    else: d.text((128,689),PH,font=F38,fill='#94a3b8',anchor='lm')
    d.text((849,582),f'{len(txt)}/80',font=F27,fill='#94a3b8',anchor='rm')
    if caret:
        x=128+(d.textlength(txt,font=F38) if txt else 0)+2
        d.rectangle((x,668,x+3,712),fill='#2563eb')
    # Fokus-Rahmen
    d.rounded_rectangle((88,625,849,752),radius=40,outline='#3b82f6',width=4)
    return im

def view(st,key,s):
    s=int(round(s)); im=st.crop((0,s,W,s+H))
    if s>0:
        im.paste(hdr[key],(0,0))
        sh=Image.new('RGBA',(W,18)); dd=ImageDraw.Draw(sh)
        for i in range(18): dd.line((0,i,W,i),fill=(15,23,42,int(22*(1-i/18))))
        im.paste(sh,(0,HDR),sh)
    return im

def ease(t): return t*t*(3-2*t) if t<1 else 1
def tap(im,x,y,t):
    # t 0..1: Finger-Tipp mit Ripple
    o=Image.new('RGBA',im.size); d=ImageDraw.Draw(o)
    r=34+60*t; a=int(110*(1-t))
    d.ellipse((x-r,y-r,x+r,y+r),fill=(37,99,235,int(a*0.35)),outline=(37,99,235,a),width=4)
    r2=30*(1-0.3*t); a2=int(150*(1-t*t))
    d.ellipse((x-r2,y-r2,x+r2,y+r2),fill=(15,23,42,int(a2*0.45)))
    im=im.convert('RGBA'); im.alpha_composite(o); return im.convert('RGB')

def rounded_panel(img,top,rad=70):
    m=Image.new('L',(W,H-top),0); ImageDraw.Draw(m).rounded_rectangle((0,0,W,H-top+rad),radius=rad,fill=255)
    return img.crop((0,top,W,H)),m

ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{OW}x{OH}','-r',str(FPS),'-i','-',
  '-c:v','libx264','-preset','slow','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-tune','stillimage','/tmp/vid/out.mp4'],stdin=subprocess.PIPE)
first=[None]
def emit(im,n=1):
    fr=im.resize((OW,OH),Image.LANCZOS)
    if first[0] is None: first[0]=fr; fr.save('/tmp/vid/poster.jpg',quality=88)
    b=fr.tobytes()
    for _ in range(n): ff.stdin.write(b)
def hold(im,sec): emit(im,int(sec*FPS))
def scroll(st,key,a,b,sec):
    n=int(sec*FPS)
    for i in range(n): emit(view(st,key,a+(b-a)*ease(i/(n-1))))
def tapanim(im,x,y,sec=0.45):
    n=int(sec*FPS)
    for i in range(n): emit(tap(im,x,y,i/(n-1)))
def fade(a,b,sec):
    n=int(sec*FPS)
    for i in range(n): emit(Image.blend(a,b,ease(i/(n-1))))

# 1 Startseite
hold(view(home,'home',0),1.4)
scroll(home,'home',0,1040,2.6)
hv=view(home,'home',1040); hold(hv,0.8)
tapanim(hv,468,1923)
# 2 Abstimmung
fade(hv,view(vote,'vote',0),0.35)
hold(view(vote,'vote',0),1.1)
scroll(vote,'vote',0,1536,3.0)
vv=view(vote,'vote',1536); hold(vv,0.5)
tapanim(vv,634,1359)
# Bottom-Sheet fährt herein
SHEET_TOP=200
panel,mask=rounded_panel(sheet,SHEET_TOP)
back=vv.filter(ImageFilter.GaussianBlur(10)); back=Image.blend(back,Image.new('RGB',(W,H),(100,108,125)),0.45)
n=int(0.55*FPS)
for i in range(n):
    t=ease(i/(n-1)); im=Image.blend(vv,back,t)
    y=int(SHEET_TOP+(H-SHEET_TOP)*(1-t)); im.paste(panel,(0,y),mask); emit(im)
sv=back.copy(); sv.paste(panel,(0,SHEET_TOP),mask)
hold(sv,2.6)
# 3 Idee einreichen
s0=view(sub,'sub',0); fade(sv,s0,0.4); hold(s0,1.1)
scroll(sub,'sub',0,1440,2.2)
u=view(sub,'sub',1440); hold(u,0.35)
tapanim(u,163,1408); uc=view(subc,'sub',1440); hold(uc,0.6)
tapanim(uc,480,1660)
st0=typed(step2,'',True); fade(uc,st0,0.35); hold(st0,0.35)
txt='Mitfahrbörse für Unken'
for k in range(1,len(txt)+1):
    emit(typed(step2,txt[:k],True),2)
for i in range(int(0.6*FPS)): emit(typed(step2,txt,(i//8)%2==0))
done=typed(step2,txt,False); 
tapanim(done,665,1105)
done2=typed(step2c,txt,False); hold(done2,1.5)
# 4 Abschluss-Karte
end=Image.new('RGB',(W,H),'#f8fafc'); d=ImageDraw.Draw(end)
g=Image.new('RGB',(W,H)); gd=ImageDraw.Draw(g)
# sanfter Lichtschein
glow=Image.new('L',(W,H),0); ImageDraw.Draw(glow).ellipse((W-520,-260,W+260,520),fill=150); glow=glow.filter(ImageFilter.GaussianBlur(160))
end.paste(Image.new('RGB',(W,H),'#c7d2fe'),(0,0),glow)
logo=Image.open('/sessions/optimistic-lucid-mayer/mnt/GoodVibes/social/goodvibes-logo.png').convert('RGBA').resize((210,210),Image.LANCZOS)
end.paste(logo,((W-210)//2,640),logo)
F80=ImageFont.truetype(FONT+'Inter-800.ttf',86); F40=ImageFont.truetype(FONT+'Inter-400.ttf',40); F36b=ImageFont.truetype(FONT+'Inter-600.ttf',38)
d=ImageDraw.Draw(end)
d.text((W//2,960),'Deine Idee',font=F80,fill='#0f172a',anchor='mm')
# Verlaufswort
gw=Image.new('L',(W,140),0); ImageDraw.Draw(gw).text((W//2,70),'zählt.',font=F80,fill=255,anchor='mm')
grad=Image.new('RGB',(W,140)); gdr=ImageDraw.Draw(grad)
for x in range(W):
    t=x/W; c=(int(37+(124-37)*t),int(99+(58-99)*t),int(235+(237-235)*t)); gdr.line((x,0,x,140),fill=c)
end.paste(grad,(0,1000),gw)
d.text((W//2,1170),'Gemeinnützig · kostenlos · anonym',font=F40,fill='#64748b',anchor='mm')
pill=Image.new('RGBA',(700,104)); pm=Image.new('L',(700,104),0); ImageDraw.Draw(pm).rounded_rectangle((0,0,699,103),radius=52,fill=255)
pg=Image.new('RGB',(700,104)); pgd=ImageDraw.Draw(pg)
for x in range(700):
    t=x/700; pgd.line((x,0,x,104),fill=(int(37+(124-37)*t),int(99+(58-99)*t),int(235+(237-235)*t)))
end.paste(pg,((W-700)//2,1280),pm)
d.text((W//2,1332),'goodvibes.mosaik-design.at',font=F36b,fill='white',anchor='mm')
fade(done2,end,0.5); hold(end,2.2)
ff.stdin.close(); ff.wait()
print('ok')
