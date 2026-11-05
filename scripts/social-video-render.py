from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess
FONT='/sessions/optimistic-lucid-mayer/.fonts/'
F=lambda w,s: ImageFont.truetype(FONT+f'Inter-{w}.ttf',s)
logo=Image.open('/sessions/optimistic-lucid-mayer/mnt/GoodVibes/social/goodvibes-logo.png').convert('RGBA')
def grad(w,h):
    g=Image.new('RGB',(w,h)); d=ImageDraw.Draw(g)
    for x in range(w):
        t=x/max(1,w-1); d.line((x,0,x,h),fill=(int(37+(124-37)*t),int(99+(58-99)*t),int(235+(237-235)*t)))
    return g
def gtext(img,xy,text,font,anchor='la'):
    m=Image.new('L',img.size,0); ImageDraw.Draw(m).text(xy,text,font=font,fill=255,anchor=anchor)
    bb=m.getbbox(); g=grad(bb[2]-bb[0],bb[3]-bb[1])
    img.paste(g,(bb[0],bb[1]),m.crop(bb))
def base(W,H):
    bg=Image.new('RGB',(W,H),'#f8fafc')
    for (cx,cy,r,col,a) in [(W*0.9,H*0.08,W*0.55,'#c7d2fe',170),(W*0.05,H*0.95,W*0.5,'#ddd6fe',140)]:
        m=Image.new('L',(W,H),0); ImageDraw.Draw(m).ellipse((cx-r,cy-r,cx+r,cy+r),fill=a); m=m.filter(ImageFilter.GaussianBlur(r*0.45))
        bg.paste(Image.new('RGB',(W,H),col),(0,0),m)
    # dezente unscharfe Herz-Kacheln
    for (x,y,s,b,op) in [(-40,H*0.18,180,8,0.28),(W-150,H*0.55,210,12,0.24),(W*0.12,H*0.78,120,6,0.18)]:
        t=logo.resize((s,s)).rotate(12 if x>W/2 else -12,expand=True,resample=Image.BICUBIC)
        a=t.split()[3].point(lambda v:int(v*op)); t.putalpha(a); t=t.filter(ImageFilter.GaussianBlur(b))
        bg.paste(t,(int(x),int(y)),t)
    return bg
def frame(bg,x,y,w,h,rad=48,border=12):
    sh=Image.new('L',bg.size,0); ImageDraw.Draw(sh).rounded_rectangle((x-border,y-border+30,x+w+border,y+h+border+30),radius=rad+border,fill=110)
    sh=sh.filter(ImageFilter.GaussianBlur(40)); bg.paste(Image.new('RGB',bg.size,(49,46,129)),(0,0),sh)
    d=ImageDraw.Draw(bg); d.rounded_rectangle((x-border,y-border,x+w+border,y+h+border),radius=rad+border,fill='white')
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=rad,fill=255)
    return m
def pill(bg,cx,cy,text,font,padx=56,h=96):
    d=ImageDraw.Draw(bg); tw=d.textlength(text,font=font); w=int(tw+2*padx)
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=h//2,fill=255)
    bg.paste(grad(w,h),(int(cx-w/2),int(cy-h/2)),m)
    d.text((cx,cy),text,font=font,fill='white',anchor='mm')
def logo_row(bg,x,y,s,center=False,W=0):
    d=ImageDraw.Draw(bg); f=F(800,int(s*0.62)); tw=d.textlength('GoodVibes',font=f)
    if center: x=int((W-(s+20+tw))/2)
    bg.paste(logo.resize((s,s)),(x,y),logo.resize((s,s)))
    d.text((x+s+20,y+s/2),'GoodVibes',font=f,fill='#0f172a',anchor='lm')

def render(name,W,H,vx,vy,vw,vh,deco):
    bg=base(W,H); m=frame(bg,vx,vy,vw,vh); deco(bg)
    bg.save(f'/tmp/vid/{name}_bg.png'); m.save(f'/tmp/vid/{name}_mask.png')
    subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-i',f'/tmp/vid/{name}_bg.png','-i','/tmp/vid/out.mp4','-loop','1','-i',f'/tmp/vid/{name}_mask.png','-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
      '-filter_complex',f'[1:v]scale={vw}:{vh}:flags=lanczos,format=rgba[v];[2:v]format=gray[m];[v][m]alphamerge[vm];[0:v][vm]overlay={vx}:{vy}:shortest=1,format=yuv420p[out]',
      '-r','30','-c:v','libx264','-preset','medium','-crf','21','-profile:v','high','-movflags','+faststart','-t','26.6',
      '-map','[out]','-map','3:a','-c:a','aac','-b:a','96k','-shortest',
      f'/tmp/vid/{name}.mp4'],check=True)

# 9:16 Reel / Story
def deco916(bg):
    W,H=bg.size; d=ImageDraw.Draw(bg)
    logo_row(bg,0,150,80,True,W)
    d.text((W/2,300),'Deine Idee.',font=F(800,84),fill='#0f172a',anchor='mm')
    gtext(bg,(W/2,392),'Deine Stimme.',F(800,84),'mm')
    pill(bg,W/2,1700,'goodvibes.mosaik-design.at',F(600,40))
    d.text((W/2,1790),'Gemeinnützig · kostenlos · ohne Anmeldung',font=F(400,32),fill='#64748b',anchor='mm')
vh=1150; vw=int(vh*720/1558)//2*2
#render('goodvibes-reel-9x16',1080,1920,(1080-vw)//2,470,vw,vh,deco916)
# 4:5 Feed
def deco45(bg):
    W,H=bg.size; d=ImageDraw.Draw(bg)
    logo_row(bg,70,110,64)
    y=300
    for t in ['Deine Idee','für ein','besseres']: d.text((70,y),t,font=F(800,62),fill='#0f172a'); y+=74
    gtext(bg,(70,y),'Miteinander.',F(800,62)); y+=124
    for t in ['Ideen für Handy-Apps','einreichen und','gemeinsam abstimmen.']: d.text((70,y),t,font=F(400,32),fill='#475569'); y+=46
    d.text((70,y+16),'Gemeinnützig · kostenlos',font=F(600,28),fill='#64748b')
    m=F(600,32); tw=d.textlength('Jetzt mitmachen',font=m); pill(bg,70+(tw+88)/2,1130,'Jetzt mitmachen',m,padx=44,h=84)
    d.text((70,1205),'goodvibes.mosaik-design.at',font=F(600,26),fill='#2563eb')
vh=1110; vw=int(vh*720/1558)//2*2
render('goodvibes-feed-4x5',1080,1350,1080-vw-70,120,vw,vh,deco45)
print('ok')
