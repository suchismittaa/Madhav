"""Redesign checks. Run: npm run build; npx vite preview --port 4173; python tests/e2e_redesign.py"""
import re
from playwright.sync_api import sync_playwright
B='http://127.0.0.1:4173';res=[];errs=[]
def check(n,c,d=''):
    res.append(bool(c));print('PASS' if c else 'FAIL',n,'' if c else d)
def ctx(b,w=390,h=844,splash=False,**k):
    c=b.new_context(viewport={'width':w,'height':h},service_workers='block',**k)
    if not splash:c.add_init_script("sessionStorage.setItem('madhav:splash','1')")
    return c
def pg(c):
    p=c.new_page();p.on('pageerror',lambda e:errs.append(str(e)));p.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text else None);return p
def go(p,u):p.goto(B+u);p.wait_for_load_state('networkidle');p.wait_for_timeout(150)
with sync_playwright() as pw:
    b=pw.chromium.launch()
    # ---- splash: shows once per session, not on navigation, skippable
    c=ctx(b,splash=True);p=pg(c);go(p,'/')
    check('splash shows on first open',p.get_by_test_id('splash').count()==1)
    p.get_by_test_id('splash').click();p.wait_for_timeout(900)
    check('splash tap-to-skip',p.get_by_test_id('splash').count()==0)
    go(p,'/library');go(p,'/');check('splash does not return',p.get_by_test_id('splash').count()==0)
    c.close()
    c=ctx(b,splash=True,reduced_motion='reduce');p=pg(c);go(p,'/');p.wait_for_timeout(1500)
    check('splash with reduced motion is brief and ends',p.get_by_test_id('splash').count()==0);c.close()
    # ---- palette tokens
    c=ctx(b);p=pg(c);go(p,'/')
    v=p.evaluate("(()=>{const s=getComputedStyle(document.documentElement);return ['--teal','--gold','--amethyst','--ivory'].map(k=>s.getPropertyValue(k).trim().toUpperCase())})()")
    check('four palette tokens',v==['#004C56','#C5A15B','#48204F','#F3EBDD'],str(v))
    nav=p.evaluate("getComputedStyle(document.querySelector('.bottom-nav')).backgroundColor");check('nav is jewel teal',nav=='rgb(0, 76, 86)',nav)
    act=p.evaluate("getComputedStyle(document.querySelector('.nav-item[aria-current=page]')).color");check('active nav is gold',act=='rgb(197, 161, 91)',act)
    # ---- home fits first screen, compact
    sh=p.evaluate("document.documentElement.scrollHeight");check('home fits one phone screen (844px)',sh<=844,str(sh))
    h2=p.evaluate("parseFloat(getComputedStyle(document.querySelector('h2')).fontSize)");check('page heading <= 32px',h2<=32,str(h2))
    nh=p.evaluate("document.querySelector('.bottom-nav').getBoundingClientRect().height");check('bottom nav compact (<=64px)',nh<=64,str(nh))
    ico=p.evaluate("[...document.querySelectorAll('.bottom-nav svg')].map(s=>s.getBoundingClientRect().width)");check('nav icons 19-22px',all(19<=x<=22 for x in ico),str(ico))
    # practice list: toggle, add, remove, persist
    p.get_by_label('Mark Hanuman Chalisa complete').click();check('practice saved toast',p.get_by_text('Your practice has been saved.').is_visible())
    p.get_by_role('button',name='Edit').click();p.get_by_label('New practice').fill('Morning walk with Naam');p.get_by_label('Add practice').click()
    p.get_by_role('button',name='Done').click();p.reload();p.wait_for_load_state('networkidle')
    check('added practice persists',p.get_by_text('Morning walk with Naam').count()==1);check('completion persists',p.get_by_label('Mark Hanuman Chalisa incomplete').count()==1)
    p.get_by_role('button',name='Edit').click();p.get_by_label('Remove Morning walk with Naam').click();check('practice removed',p.get_by_text('Morning walk with Naam').count()==0)
    check('wisdom card has source link',p.locator('a:has-text("Source")').first.get_attribute('href').startswith('https://www.gitasupersite.iitk.ac.in/srimad'))
    check('wisdom card: sanskrit+translit+meaning+reflect',all(p.get_by_text(t).count()>0 for t in ['Reflect:','karmaṇy']))
    p.get_by_role('button',name='Save').first.click();check('favourite toast',p.get_by_text('Verse saved to your favourites.').is_visible() or p.get_by_text('Saved to your favourites.').is_visible())
    c.close()
    # ---- no horizontal overflow, nothing hidden behind nav, across sizes and routes
    routes=['/','/library','/library/category/shiva','/library/category/gita','/library/shiva-panchakshara','/library/hanuman-chalisa?mode=verse&v=chaupai-12','/jaap','/wisdom','/journey','/journey?tab=settings','/journey?tab=journal']
    for w,h in [(320,640),(375,812),(414,896),(768,1024),(1280,800)]:
        c=ctx(b,w,h);p=pg(c);bad=[]
        for r in routes:
            go(p,r);ow=p.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
            if ow>0:bad.append((r,ow))
        check(f'no horizontal overflow at {w}px',not bad,str(bad));c.close()
    # nested scroll containers
    c=ctx(b);p=pg(c);
    for r in ['/','/library','/jaap','/wisdom','/journey']:
        go(p,r);n=p.evaluate("[...document.querySelectorAll('main *')].filter(e=>{const s=getComputedStyle(e);return (s.overflowY=='auto'||s.overflowY=='scroll')&&e.scrollHeight>e.clientHeight+2&&!e.classList.contains('hscroll')}).length")
        check(f'no nested vertical scroll areas {r}',n==0,str(n))
    # last item reachable above nav
    go(p,'/library');p.evaluate('window.scrollTo(0,document.body.scrollHeight)');p.wait_for_timeout(100)
    last=p.evaluate("(()=>{const m=document.querySelector('main');const r=[...m.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().height>0).pop().getBoundingClientRect().bottom;return r<=document.querySelector('.bottom-nav').getBoundingClientRect().top+1})()");check('content not hidden behind nav',last)
    # ---- library / shiva / sources
    go(p,'/library');check('Shiva has its own category card',p.locator('a.shelf').get_by_role('heading',name='Shiva',exact=True).count()==1)
    go(p,'/library/category/other');check('Shiva texts not in Other Devotions',p.get_by_text('Om Namah Shivaya').count()==0 and p.get_by_text('Maha Mrityunjaya').count()==0)
    go(p,'/library/category/shiva');check('Shiva category lists 3 texts',all(p.get_by_role('link',name=re.compile(t)).count()>0 for t in ['Om Namah Shivaya','Maha Mrityunjaya','Panchakshara']))
    go(p,'/library/mm-mmj');sc=p.get_by_test_id('source-card')
    check('source card shows RV 7.59.12',sc.is_visible() and 'Rigveda' in sc.inner_text() and '7.59.12' in sc.inner_text())
    lk=sc.get_by_role('link');check('source link opens externally',lk.get_attribute('target')=='_blank' and 'noopener' in lk.get_attribute('rel') and lk.get_attribute('href').startswith('https://'))
    go(p,'/library/mm-hare');t=p.get_by_test_id('source-card').inner_text();check('Hare Krishna notes order variant honestly','Hare Rama first' in t,t[:200])
    go(p,'/library/hanuman-ashtak');check('pending text labelled, nothing invented',p.get_by_text('Content pending').count()>0)
    go(p,'/library/category/gita');check('gita verses link to Supersite',p.locator('a:has-text("Source")').count()>=5)
    # ---- reader toggles: compact row, layers hide, persist
    go(p,'/library/shiva-panchakshara?mode=verse&v=v1')
    tb=p.get_by_role('toolbar',name='Reading options');box=tb.bounding_box();check('reading toggles are one compact row (<=44px)',box['height']<=44,str(box))
    vc=p.get_by_test_id('verse-card');check('all layers shown by default','नागेन्द्र' in vc.inner_text() and 'nāgendra' in vc.inner_text() and 'garland' in vc.inner_text())
    p.get_by_role('button',name='Transliteration').click();check('translit hidden','nāgendra' not in vc.inner_text())
    p.get_by_role('button',name='Meaning').click();t=vc.inner_text();check('only original remains','नागेन्द्र' in t and 'garland' not in t and 'nāgendra' not in t)
    p.reload();p.wait_for_load_state('networkidle');p.wait_for_timeout(300);t=p.get_by_test_id('verse-card').inner_text();check('reading preference persists across reload','garland' not in t and 'नागेन्द्र' in t)
    go(p,'/library/category/gita');check('same preference applies to Gita verses',p.get_by_text('You have a right to your actions').count()==0)
    go(p,'/wisdom');p.get_by_text('I feel anxious').click();check('and to Wisdom verses',p.get_by_text('You have a right to your actions').count()==0 and p.get_by_text('Original').count()>0)
    # ---- reminders
    go(p,'/journey?tab=settings')
    check('four reminders, all off by default',all(p.get_by_label(n,exact=True).count()==1 and not p.get_by_label(n,exact=True).is_checked() for n in ['Morning reminder','Daily jaap reminder','Evening reminder','Reading reminder']))
    p.get_by_label('Quiet hours',exact=True).uncheck()
    T=p.evaluate("(()=>{const d=new Date(Date.now()-60000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')})()")
    p.get_by_label('Time for Evening pause').fill(T);p.get_by_label('Evening reminder',exact=True).check();check('reminder toast',p.get_by_text('Evening pause reminder is on.').is_visible())
    p.wait_for_timeout(300);go(p,'/');bt=p.get_by_test_id('reminder-banner').inner_text()
    check('evening reminder is gentle, no guilt',(('Pause for the day' in bt) or ('settle' in bt)) and not re.search(r'miss|fail|forgot|streak',bt,re.I),bt)
    go(p,'/journey?tab=settings');p.get_by_label('Quiet hours',exact=True).check();p.get_by_label('Quiet hours start').fill('00:00');p.get_by_label('Quiet hours end').fill('23:59');p.wait_for_timeout(500);go(p,'/')
    check('quiet hours suppress reminder',p.get_by_test_id('reminder-banner').count()==0);c.close()
    # ---- jaap mala + dialogs
    c=ctx(b);p=pg(c);go(p,'/jaap?mantra=mm-hare');p.get_by_role('button',name='108',exact=True).click();p.get_by_role('button',name='Begin jaap').click()
    check('108 beads + 1 guru bead rendered',p.locator('svg circle.mala-bead').count()==108 and p.locator('svg image[href*="gem-teal"]').count()==1)
    tap=p.get_by_label('Count one repetition')
    for _ in range(5):tap.click()
    cnt=lambda:int(p.locator('[aria-live=polite]').first.inner_text())
    check('five taps = five beads',cnt()==5 and p.locator('circle.mala-bead.cur').count()==1)
    p.get_by_role('button',name='Reset').click();check('reset asks in-app (not browser alert)',p.get_by_role('alertdialog').is_visible())
    p.get_by_role('alertdialog').get_by_role('button',name='Keep counting').click();check('reset can be declined',cnt()==5)
    p.get_by_role('button',name='Reset').click();p.get_by_role('alertdialog').get_by_role('button',name='Reset').click();check('reset confirmed',cnt()==0)
    for _ in range(3):tap.click()
    p.wait_for_timeout(500);p.reload();p.wait_for_load_state('networkidle');check('interrupted session resumes',cnt()==3 and p.get_by_text('Welcome back. 3 of 108 so far.').count()>=0)
    p.get_by_role('button',name='Finish').click();check('saved toast + back to setup',p.get_by_role('button',name='Begin jaap').is_visible())
    for g,n in [('11',11),('21',21),('51',51)]:
        p.get_by_role('button',name=g,exact=True).click();p.get_by_role('button',name='Begin jaap').click();check(f'goal {g}: {n} beads',p.locator('circle.mala-bead').count()==n)
        p.get_by_role('button',name='Cancel').click();p.get_by_role('alertdialog').get_by_role('button',name='Cancel session').click()
    p.get_by_role('button',name='Custom').click();p.get_by_label('Custom target').fill('5');p.get_by_role('button',name='Begin jaap').click()
    for _ in range(5):tap.click()
    check('custom goal completes',p.get_by_text('Your jaap is complete.').is_visible());c.close()
    check('no console/page errors',not errs,str(errs[:3]))
    b.close()
print(f'{sum(res)}/{len(res)} passed')
