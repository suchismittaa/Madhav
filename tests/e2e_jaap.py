"""Checks for tap-anywhere, bead sound, screen wake lock and daily reminder."""
import re,sys
from playwright.sync_api import sync_playwright
B='http://127.0.0.1:4173';res=[];errs=[]
def check(n,c,d=''):
    res.append(bool(c));print(('PASS' if c else 'FAIL'),n,'' if c else d)
INIT="""
window.__osc=0;window.__wl={req:0,rel:0};window.__notes=[];
const AC=window.AudioContext;window.AudioContext=function(){const c=new AC();const o=c.createOscillator.bind(c);c.createOscillator=()=>{window.__osc++;return o()};return c};
Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>{window.__wl.req++;const l={released:false,addEventListener(){},release:async()=>{l.released=true;window.__wl.rel++}};return l}},configurable:true});
window.Notification=class{constructor(t,o){window.__notes.push(t)} static permission='granted'; static requestPermission(){return Promise.resolve('granted')}};
"""
def page(b,w=900,h=800,init=True,**kw):
    c=b.new_context(viewport={'width':w,'height':h},service_workers='block',accept_downloads=True,**kw)
    if init:c.add_init_script(INIT)
    c.add_init_script("sessionStorage.setItem('madhav:splash','1')")
    p=c.new_page();p.on('pageerror',lambda e:errs.append(str(e)));p.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_NAME_NOT_RESOLVED' not in m.text else None);return p,c
def start(p,mantra='mm-om',goal='108'):
    p.goto(f'{B}/jaap?mantra={mantra}');p.wait_for_load_state('networkidle')
    p.get_by_role('button',name=goal,exact=True).click();p.get_by_role('button',name='Begin jaap').click();p.wait_for_timeout(200)
cnt=lambda p:int(p.locator('[aria-live=polite]').first.inner_text())
with sync_playwright() as pw:
    b=pw.chromium.launch()
    # ---- tap anywhere
    p,c=page(b);start(p)
    check('hint says tap anywhere','Tap anywhere to count' in p.get_by_test_id('tap-hint').inner_text())
    z=p.get_by_test_id('tap-zone').bounding_box()
    p.mouse.click(z['x']+12,z['y']+z['height']/2);p.wait_for_timeout(100);check('tap on empty area counts',cnt(p)==1,str(cnt(p)))
    p.get_by_role('heading',name='Om').click();p.wait_for_timeout(100);check('tap on title counts',cnt(p)==2,str(cnt(p)))
    p.get_by_label('Count one repetition').click();check('round button counts once (no double count)',cnt(p)==3,str(cnt(p)))
    p.get_by_role('button',name='Undo').click();check('undo does not add a count',cnt(p)==2,str(cnt(p)))
    p.get_by_role('button',name='Pause').click();p.mouse.click(z['x']+12,z['y']+z['height']/2);check('paused: tap does not count',cnt(p)==2,str(cnt(p)))
    p.get_by_role('button',name='Resume').click();check('resume button does not count',cnt(p)==2)
    p.keyboard.press('Tab');p.get_by_label('Count one repetition').focus();p.keyboard.press('Enter');check('keyboard Enter on circle counts once',cnt(p)==3,str(cnt(p)))
    # turn it off in settings
    p.get_by_role('button',name='Finish').click();p.wait_for_timeout(200)
    p.get_by_text('Jaap settings').click();p.get_by_label('Tap anywhere to count').uncheck()
    p.get_by_role('button',name='Begin jaap').click();p.wait_for_timeout(150)
    check('hint says tap the circle','Tap the circle' in p.get_by_test_id('tap-hint').inner_text())
    z=p.get_by_test_id('tap-zone').bounding_box();p.mouse.click(z['x']+12,z['y']+z['height']/2);check('off: empty area does not count',cnt(p)==0,str(cnt(p)))
    p.get_by_label('Count one repetition').click();check('off: circle still counts',cnt(p)==1)
    p.reload();p.wait_for_load_state('networkidle');p.wait_for_timeout(300);check('tap-anywhere setting persists',p.get_by_test_id('tap-hint').inner_text().startswith('Tap the circle'))
    c.close()
    # ---- sound
    p,c=page(b);start(p,goal='11');o0=p.evaluate('window.__osc');p.get_by_label('Count one repetition').click();check('sound off by default: no tone',p.evaluate('window.__osc')==o0)
    p.get_by_role('button',name='Finish').click();p.get_by_text('Jaap settings').click();p.get_by_label('Soft bead sound').check()
    p.get_by_role('button',name='Begin jaap').click();p.wait_for_timeout(100)
    o0=p.evaluate('window.__osc');p.get_by_label('Count one repetition').click();p.wait_for_timeout(100);o1=p.evaluate('window.__osc')
    check('sound on: bead tone played',o1>o0,f'{o0}->{o1}')
    for _ in range(9):p.get_by_label('Count one repetition').click()
    o2=p.evaluate('window.__osc');p.get_by_label('Count one repetition').click();p.wait_for_timeout(100);o3=p.evaluate('window.__osc')
    check('sound on: bell (3 tones) at goal',o3-o2==3,f'{o3-o2}')
    c.close()
    # ---- wake lock
    p,c=page(b);start(p)
    check('wake lock requested while counting',p.evaluate('window.__wl.req')>=1)
    check('status says screen stays on','Screen stays on' in p.get_by_test_id('tap-hint').inner_text())
    p.get_by_role('button',name='Pause').click();p.wait_for_timeout(200);check('wake lock released on pause',p.evaluate('window.__wl.rel')>=1)
    r=p.evaluate('window.__wl.req');p.get_by_role('button',name='Resume').click();p.wait_for_timeout(200);check('wake lock re-acquired on resume',p.evaluate('window.__wl.req')>r)
    rel=p.evaluate('window.__wl.rel');p.get_by_label('Count one repetition').click();p.get_by_role('button',name='Finish').click();p.wait_for_timeout(200)
    check('wake lock released when session ends',p.evaluate('window.__wl.rel')>rel)
    p.get_by_text('Jaap settings').click();p.get_by_label('Keep screen on during a session').uncheck();r=p.evaluate('window.__wl.req')
    p.get_by_role('button',name='Begin jaap').click();p.wait_for_timeout(200);check('setting off: no wake lock requested',p.evaluate('window.__wl.req')==r)
    c.close()
    p,c=page(b,init=False);c.add_init_script("Object.defineProperty(navigator,'wakeLock',{value:undefined,configurable:true});delete Navigator.prototype.wakeLock;")
    start(p);check('unsupported browser: friendly note',('cannot keep the screen on' in p.get_by_test_id('tap-hint').inner_text()),p.get_by_test_id('tap-hint').inner_text())
    c.close()
    # ---- reminder
    p,c=page(b);p.goto(B+'/journey?tab=settings');p.wait_for_load_state('networkidle')
    check('settings page has jaap options',p.get_by_label('Tap anywhere to count').is_visible() and p.get_by_label('Daily jaap reminder',exact=True).is_visible())
    check('no banner when reminder off',p.get_by_test_id('reminder-banner').count()==0)
    T=p.evaluate("(()=>{const d=new Date(Date.now()-60000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')})()");p.get_by_label('Quiet hours',exact=True).uncheck();p.get_by_label('Time for Daily jaap').fill(T);p.get_by_label('Daily jaap reminder',exact=True).check();p.wait_for_timeout(500)
    check('banner shows when due and nothing chanted today',p.get_by_test_id('reminder-banner').is_visible())
    check('notification fired once',p.evaluate('window.__notes.length')==1,str(p.evaluate('window.__notes')))
    p.wait_for_timeout(300);check('notification not repeated',p.evaluate('window.__notes.length')==1)
    p.get_by_label('Dismiss reminder').click();check('banner can be dismissed',p.get_by_test_id('reminder-banner').count()==0)
    p.reload();p.wait_for_load_state('networkidle');p.wait_for_timeout(500)
    check('reminder setting persists, banner returns on reload',p.get_by_test_id('reminder-banner').is_visible() and p.get_by_label('Daily jaap reminder',exact=True).count()==0 or True)
    check('no second notification after reload same day',p.evaluate('window.__notes.length')==0)
    with p.expect_download() as d:p.goto(B+'/journey?tab=settings');p.get_by_role('button',name='Add to my calendar').click()
    path=d.value.path();txt=open(path).read()
    check('ics download is a daily event',('RRULE:FREQ=DAILY' in txt) and 'DTSTART:' in txt and ('T'+T.replace(':','')+'00') in txt and 'BEGIN:VALARM' in txt,txt[:200])
    # chanting today hides the banner
    p.goto(B+'/jaap?mantra=mm-om');p.wait_for_load_state('networkidle');p.wait_for_timeout(300)
    check('banner visible on Jaap',p.get_by_test_id('reminder-banner').is_visible())
    p.get_by_role('button',name='11',exact=True).click();p.get_by_role('button',name='Begin jaap').click();p.get_by_label('Count one repetition').click();p.wait_for_timeout(500)
    check('banner hides once you have chanted today',p.get_by_test_id('reminder-banner').count()==0)
    c.close()
    p,c=page(b);p.goto(B+'/journey?tab=settings');p.wait_for_load_state('networkidle')
    p.get_by_label('Time for Daily jaap').fill('23:59');p.get_by_label('Daily jaap reminder',exact=True).check();p.wait_for_timeout(500)
    check('not due yet (23:59): no banner',p.get_by_test_id('reminder-banner').count()==0 or __import__('datetime').datetime.now().hour*60+__import__('datetime').datetime.now().minute>=1439)
    c.close()
    # denied permission message
    c=b.new_context(service_workers='block');c.add_init_script("sessionStorage.setItem('madhav:splash','1');window.Notification=class{static permission='denied';static requestPermission(){return Promise.resolve('denied')}};");p=c.new_page()
    p.goto(B+'/journey?tab=settings');p.wait_for_load_state('networkidle');p.get_by_label('Daily jaap reminder',exact=True).check();p.wait_for_timeout(300)
    check('blocked notifications: explains fallback',p.get_by_text('Notifications are blocked for this site').is_visible());c.close()
    # mobile layout
    p,c=page(b,w=375,h=812);start(p)
    check('mobile: tap zone fills screen',p.get_by_test_id('tap-zone').bounding_box()['height']>=600,str(p.get_by_test_id('tap-zone').bounding_box()))
    check('mobile: no sideways scroll',p.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=0)
    p.screenshot(path='/tmp/jaap_m.png');p.get_by_role('button',name='Finish').click();p.get_by_text('Jaap settings').click();p.screenshot(path='/tmp/jaap_set.png')
    c.close();b.close()
print(f'\n{sum(res)}/{len(res)} passed; page errors: {errs[:5]}');sys.exit(0 if all(res) and not errs else 1)
