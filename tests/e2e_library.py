"""End-to-end checks for the Sacred Library (run: vite preview --port 4173, then python tests/e2e_library.py)."""
import re, sys, json
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:4173'
results=[];errors=[]
def check(name,cond,detail=''):
    results.append((name,bool(cond),detail)); print(('PASS' if cond else 'FAIL'),name,detail if not cond else '')
def new_page(b,w=1100,h=900,ctx=None):
    ctx=ctx or b.new_context(viewport={'width':w,'height':h},service_workers='block')
    ctx.add_init_script("sessionStorage.setItem('madhav:splash','1')")
    p=ctx.new_page()
    p.on('console',lambda m: errors.append((p.url,m.text)) if m.type=='error' else None)
    p.on('pageerror',lambda e: errors.append((p.url,str(e))))
    return p,ctx
def go(p,path):
    p.goto(BASE+path); p.wait_for_load_state('networkidle'); p.wait_for_timeout(150)

IDS=['mm-hare','mm-vasu','mm-krishnaya','mm-radhe','mm-govind-hare','madhurashtakam','govind-damodar','mm-nara','vishnu-sahasranama','shantakaram','achyutam-keshavam','hanuman-chalisa','mm-hanu','hanuman-ashtak','bajrang-baan','mm-hanu-gayatri','mm-shiva','mm-mmj','mm-gayatri','mm-durga','mm-om']
CHANT={'mm-hare','mm-vasu','mm-krishnaya','mm-radhe','mm-govind-hare','govind-damodar','mm-nara','shantakaram','achyutam-keshavam','hanuman-chalisa','mm-hanu','mm-hanu-gayatri','mm-shiva','mm-mmj','mm-gayatri','mm-durga','mm-om'}
with sync_playwright() as pw:
    b=pw.chromium.launch()
    # ---------- index + categories
    p,ctx=new_page(b); go(p,'/library')
    check('index: title',p.get_by_role('heading',name='Sacred Library').is_visible())
    for c in ['Krishna','Vishnu','Hanuman','Shiva','Other Devotions','Bhagavad Gita']:
        check(f'index: category card {c}',p.locator('a.shelf').get_by_role('heading',name=c,exact=True).count()==1)
    counts={'krishna':7,'vishnu':4,'hanuman':5,'shiva':3,'other':3}
    for cid,n in counts.items():
        go(p,f'/library/category/{cid}')
        links=p.locator('main a[href^="/library/"]:not([href*="category"]):not([href*="favourites"]):not([href*="my-mantras"]):not([href*="custom"])')
        hrefs={l.get_attribute('href') for l in links.all()}
        hrefs={h for h in hrefs if h.strip('/')!='library'}
        check(f'category {cid}: {n} texts',len(hrefs)==n,str(len(hrefs)))
    go(p,'/library/category/gita'); check('category gita: verses',p.locator('.card').count()>=5)
    go(p,'/library/category/nope'); check('category: unknown handled',p.get_by_text('Category not found').is_visible())
    # ---------- every detail page
    for i in IDS:
        go(p,'/library/'+i)
        h=p.locator('main h2').first.inner_text()
        jaap=p.get_by_role('link',name='Start Jaap').count()
        check(f'detail {i}: renders ({h})',len(h)>=2)
        check(f'detail {i}: Start Jaap {"shown" if i in CHANT else "absent"}',(jaap==1)==(i in CHANT),str(jaap))
        check(f'detail {i}: favourite+My Mantras',p.get_by_role('button',name='Save',exact=True).count()>=1 and p.get_by_role('button',name='Add to My Mantras').count()==1)
    go(p,'/library/does-not-exist'); check('detail: unknown id handled',p.get_by_text('Not found').is_visible())
    # ---------- toggles & font size (simple mantra)
    go(p,'/library/mm-mmj')
    txt=lambda: p.locator('[data-testid=reading]').inner_text()
    check('toggle: all layers on',('Tryambakaṁ' in txt() or 'tryambakaṁ' in txt()) and 'worship' in txt() and 'त्र्यम्बकं' in txt())
    p.get_by_role('button',name='Original').click(); check('toggle: hide original','त्र्यम्बकं' not in txt())
    p.get_by_role('button',name='Transliteration').click(); check('toggle: hide transliteration','tryambakaṁ' not in txt().lower())
    p.get_by_role('button',name='Meaning').click(); check('toggle: hint when all off',p.get_by_text('Switch on Original').is_visible())
    for n in ['Original','Transliteration','Meaning']: p.get_by_role('button',name=n).click()
    f0=p.eval_on_selector('[data-testid=reading]','e=>parseFloat(getComputedStyle(e).fontSize)')
    p.get_by_label('Larger text').click(); p.get_by_label('Larger text').click()
    f1=p.eval_on_selector('[data-testid=reading]','e=>parseFloat(getComputedStyle(e).fontSize)')
    check('font size increases',f1>f0,f'{f0}->{f1}')
    p.wait_for_timeout(500); p.reload(); p.wait_for_load_state('networkidle')
    f2=p.eval_on_selector('[data-testid=reading]','e=>parseFloat(getComputedStyle(e).fontSize)')
    check('font size persists after refresh',f2==f1,f'{f2}')
    # ---------- Chalisa
    go(p,'/library/hanuman-chalisa')
    secs=p.locator('[data-sec]'); check('chalisa full: 43 verses',secs.count()==43,str(secs.count()))
    check('chalisa full: 40 chaupais',p.locator('[data-sec^=chaupai-]').count()==40)
    check('chalisa full: headings',p.get_by_role('heading',name='Opening Doha').count()==1 and p.get_by_role('heading',name='Closing Doha').count()==1)
    body=p.locator('[data-testid=full-reading]').inner_text()
    check('chalisa: devanagari first/last','श्रीगुरु चरन सरोज रज' in body and 'हृदय बसहु सुर भूप' in body)
    check('chalisa: transliteration','Jai Hanumān gyān gun sāgar' in body)
    check('chalisa: meaning','Victory to you, Hanuman' in body)
    check('chalisa: status verified',p.get_by_text('Verified text').count()>=1)
    p.get_by_role('button',name='Verse by verse').click(); p.wait_for_timeout(200)
    check('verse mode: starts',p.get_by_text(re.compile(r'of 43')).first.is_visible())
    for _ in range(3): p.get_by_role('button',name='Next verse').click()
    p.wait_for_timeout(300)
    card=p.locator('[data-testid=verse-card]').inner_text()
    check('verse mode: next x3 -> Chaupai 2',('राम दूत' in card) or ('Rām dūt' in card),card[:60])
    p.get_by_role('button',name='Previous verse').click(); p.wait_for_timeout(200)
    check('verse mode: previous',p.get_by_text(re.compile(r'Chaupai 1 ·')).first.is_visible())
    p.get_by_role('button',name='Next verse').click()
    p.get_by_role('button',name='Bookmark verse').click(); check('verse bookmark toggles',p.get_by_role('button',name='Verse bookmarked').is_visible())
    p.get_by_role('button',name='Save verse').click(); check('verse favourite toggles',p.get_by_role('button',name='Verse saved').is_visible())
    p.get_by_label('Larger text').click()
    pct=p.get_by_role('progressbar').get_attribute('aria-valuenow'); check('progress shown (verse 4 of 43 = 9%)',int(pct)==9,pct)
    p.reload(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(300)
    check('verse position restored after refresh',p.get_by_text(re.compile(r'Chaupai 2 ·')).first.is_visible())
    check('bookmark persists after refresh',p.get_by_role('button',name='Verse bookmarked').is_visible())
    check('verse fav persists after refresh',p.get_by_role('button',name='Verse saved').is_visible())
    # jump to last verse
    p.get_by_label('Go to verse').select_option(label='Closing Doha'); p.wait_for_timeout(200)
    check('jump to last: next disabled',p.get_by_role('button',name='Next verse').is_disabled())
    # keyboard
    p.keyboard.press('ArrowLeft'); p.wait_for_timeout(200); check('keyboard left',p.get_by_text(re.compile(r'Chaupai 40 ·')).first.is_visible())
    # full reading: scroll tracking & continue
    p.get_by_role('button',name='Full reading').click(); p.wait_for_timeout(300)
    p.evaluate("document.getElementById('s-chaupai-20').scrollIntoView()"); p.wait_for_timeout(1200)
    p.reload(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(400)
    check('full mode: reading position saved',p.get_by_role('button',name=re.compile(r'Continue from Chaupai (19|20|21)')).count()==1)
    # deep link from search result
    go(p,'/library?q=ram+duare'); check('search: verse-level result (ram duare)',p.get_by_text('Chaupai 21').first.is_visible())
    p.get_by_role('link',name=re.compile('Hanuman Chalisa · Chaupai 21')).click(); p.wait_for_timeout(400)
    check('search result opens that verse',p.get_by_text(re.compile(r'Chaupai 21 ·')).first.is_visible() and 'राम दुआरे' in p.locator('[data-testid=verse-card]').inner_text())
    # ---------- Sahasranama + pending
    go(p,'/library/vishnu-sahasranama')
    check('sahasranama: structured sections',p.locator('[data-sec]').count()==7,str(p.locator('[data-sec]').count()))
    check('sahasranama: pending clearly marked',p.get_by_text('Content pending').count()>=2 and p.get_by_text('Content pending').first.is_visible())
    go(p,'/library/bajrang-baan'); check('pending text: no fake content',p.get_by_text('Content pending verification').is_visible())
    # ---------- search
    def search(q):
        go(p,'/library'); p.get_by_label('Search the library').fill(q); p.wait_for_timeout(250)
        return p.locator('[role=region][aria-label="Search results"]').inner_text() if p.locator('[role=region][aria-label="Search results"]').count() else p.locator('main').inner_text()
    for q,exp in [('hanuman','Hanuman Chalisa'),('krishna','Hare Krishna Mahamantra'),('Krishna','Madhurashtakam'),('chalisa','Hanuman Chalisa'),('Hanuman Chalisa','Hanuman Chalisa'),
                  ('shiva','Om Namah Shivaya'),('namah shivaya','Om Namah Shivaya'),('हनुमान','Hanuman Chalisa'),('त्र्यम्बकं','Maha Mrityunjaya'),('tryambakam','Maha Mrityunjaya'),
                  ('protection','Maha Mrityunjaya'),('light','Gayatri'),('vishnu','Vishnu Sahasranama'),('other devotions','Gayatri Mantra'),('durga','Durga Mantra'),
                  ('gita','Bhagavad Gita'),('radha','Radhe Radhe'),('thousand names','Vishnu Sahasranama'),('sweet','Madhurashtakam'),('Vāsudevāya','Om Namo Bhagavate Vasudevaya')]:
        out=search(q); check(f'search "{q}" finds {exp}',exp.lower() in out.lower(),out[:80].replace('\n',' '))
    out=search('zzzzqq'); check('search: empty state',p.get_by_text('Nothing found').is_visible())
    go(p,'/library?q=hanuman'); check('search: query kept in URL after reload',p.get_by_label('Search the library').input_value()=='hanuman')
    p.get_by_label('Clear search').click(); check('search: clear returns to categories',p.locator('a.shelf').count()==6)
    ctx.close()

    # ---------- favourites persistence + Jaap from favourites
    p,ctx=new_page(b); go(p,'/library/mm-gayatri')
    p.get_by_role('button',name='Save',exact=True).click(); p.wait_for_timeout(200)
    go(p,'/library/category/krishna'); p.get_by_role('button',name=re.compile('Save to favourites: Radhe Radhe')).click(); p.wait_for_timeout(200)
    p.reload(); p.wait_for_load_state('networkidle')
    check('favourite persists after refresh (category heart)',p.get_by_role('button',name=re.compile('Remove from favourites: Radhe Radhe')).is_visible())
    go(p,'/library/favourites')
    check('favourites page lists both',p.get_by_text('Gayatri Mantra').first.is_visible() and p.get_by_text('Radhe Radhe').first.is_visible())
    p.locator('main').get_by_role('link',name='Jaap').first.click(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(200)
    check('favourites -> Jaap loads mantra',('Gayatri' in p.locator('select').first.evaluate('e=>e.options[e.selectedIndex].text')) or ('Radhe' in p.locator('select').first.evaluate('e=>e.options[e.selectedIndex].text')))
    go(p,'/journey?tab=favs'); check('journey favourites tab works',p.get_by_text('Gayatri Mantra').first.is_visible())
    # toggle off in favourites list
    go(p,'/library/favourites'); p.get_by_role('button',name=re.compile('Remove from favourites: Radhe')).click(); p.wait_for_timeout(200)
    check('unfavourite removes from list',p.get_by_text('Radhe Radhe').count()==0)
    ctx.close()

    # ---------- Start Jaap integration
    p,ctx=new_page(b); go(p,'/library/hanuman-chalisa'); p.get_by_role('link',name='Start Jaap').click(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(200)
    check('Start Jaap: URL',re.search(r'/jaap\?mantra=hanuman-chalisa',p.url) is not None,p.url)
    sel=p.locator('select').first; check('Start Jaap: mantra preloaded',sel.evaluate('e=>e.options[e.selectedIndex].text')=='Hanuman Chalisa')
    p.get_by_role('button',name='21',exact=True).click(); p.get_by_role('button',name='Begin jaap').click(); p.wait_for_timeout(150)
    check('Start Jaap: counting screen shows mantra + goal',p.get_by_role('heading',name='Hanuman Chalisa').is_visible() and p.get_by_text('of 21').is_visible())
    for _ in range(3): p.get_by_role('button',name='Count one repetition').click()
    check('Start Jaap: counts',p.locator('[aria-live=polite]').first.inner_text()=='3')
    p.wait_for_timeout(400); p.reload(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(200)
    check('Jaap session persists after refresh',p.locator('[aria-live=polite]').first.inner_text()=='3')
    # switching mantra while a session is active
    go(p,'/library/mm-om'); p.get_by_role('link',name='Start Jaap').click(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(300)
    check('Jaap: conflict prompt',p.get_by_text('is in progress. Switch to').is_visible())
    p.get_by_role('button',name='Save and switch').click(); p.wait_for_timeout(300)
    check('Jaap: switched, Om preselected',p.locator('select').first.evaluate('e=>e.options[e.selectedIndex].text')=='Om')
    p.get_by_role('button',name='Begin jaap').click(); p.get_by_role('button',name='Finish').click(); p.wait_for_timeout(200)
    p.get_by_text('Show history').click(); check('Jaap: previous session saved to history',p.locator('li.card',has_text='Hanuman Chalisa').first.is_visible() and p.get_by_text(re.compile('3/21')).count()>=1)
    ctx.close()

    # ---------- custom mantras, My Mantras
    p,ctx=new_page(b); go(p,'/library/custom/new')
    p.get_by_role('button',name='Save mantra').click(); check('custom: name required',p.get_by_role('alert').is_visible())
    p.get_by_label('Name').fill('Om Shri Ganeshaya Namah'); p.get_by_label('Category').select_option(label='Other Devotions')
    p.get_by_label('Sanskrit or original text').fill('ॐ श्री गणेशाय नमः'); p.get_by_label('Transliteration').fill('Oṁ śrī gaṇeśāya namaḥ')
    p.get_by_label('Meaning').fill('Salutations to Shri Ganesha'); p.get_by_label('Personal notes').fill('Morning practice')
    p.get_by_role('button',name='Save mantra').click(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(300)
    check('custom: created, detail page',p.get_by_role('heading',name='Om Shri Ganeshaya Namah').is_visible() and 'ॐ श्री गणेशाय नमः' in p.locator('[data-testid=reading]').inner_text())
    check('custom: notes shown',p.get_by_text('Morning practice').is_visible())
    check('custom: Start Jaap/Edit/Delete',p.get_by_role('link',name='Start Jaap').is_visible() and p.get_by_role('link',name='Edit').is_visible() and p.get_by_role('button',name='Delete').is_visible())
    cid=p.url.split('/')[-1]; check('custom: in My Mantras by default',p.get_by_role('button',name='In My Mantras').is_visible())
    p.reload(); p.wait_for_load_state('networkidle'); check('custom: persists after refresh',p.get_by_role('heading',name='Om Shri Ganeshaya Namah').is_visible())
    go(p,'/library/category/other'); check('custom: in its category',p.get_by_text('Your mantras').is_visible() and p.get_by_text('Om Shri Ganeshaya Namah').is_visible())
    go(p,'/library?q=ganesha'); check('custom: searchable (name)',p.get_by_text('Om Shri Ganeshaya Namah').first.is_visible())
    go(p,'/library?q=गणेशाय'); check('custom: searchable (Sanskrit)',p.get_by_text('Om Shri Ganeshaya Namah').first.is_visible())
    go(p,'/jaap'); opts=p.locator('select').first.evaluate('e=>[...e.querySelectorAll("optgroup")].map(g=>g.label+":"+[...g.querySelectorAll("option")].map(o=>o.text).join("|"))')
    check('custom: available in Jaap',any('Om Shri Ganeshaya Namah' in o for o in opts),str(opts))
    check('custom: My Mantras group first in Jaap',opts[0].startswith('My Mantras'))
    # edit
    go(p,'/library/'+cid); p.get_by_role('link',name='Edit').click(); p.wait_for_timeout(300)
    check('custom edit: prefilled',p.get_by_label('Name').input_value()=='Om Shri Ganeshaya Namah' and p.get_by_label('Meaning').input_value()=='Salutations to Shri Ganesha')
    p.get_by_label('Name').fill('Om Gan Ganapataye Namah'); p.get_by_label('Meaning').fill('Salutations to Ganapati'); p.get_by_role('button',name='Save changes').click(); p.wait_for_timeout(300)
    check('custom edit: saved',p.get_by_role('heading',name='Om Gan Ganapataye Namah').is_visible() and p.get_by_text('Salutations to Ganapati').count()>=1)
    p.reload(); p.wait_for_load_state('networkidle'); check('custom edit: persists after refresh',p.get_by_role('heading',name='Om Gan Ganapataye Namah').is_visible())
    # My Mantras: add library items, reorder, remove, jaap
    go(p,'/library/my-mantras'); p.get_by_role('button',name='Add from the library').click()
    p.get_by_label('Search mantras to add').fill('narayanaya'); p.get_by_role('button',name=re.compile('Add Om Namo Narayanaya')).click()
    p.get_by_label('Search mantras to add').fill('hanuman chalisa'); p.get_by_role('button',name=re.compile('Add Hanuman Chalisa')).click(); p.wait_for_timeout(200)
    names=lambda: [x.inner_text().split('\n')[0] for x in p.locator('ol > li h3').all()]
    n0=names(); check('my mantras: 3 items in order added',n0==['Om Gan Ganapataye Namah','Om Namo Narayanaya','Hanuman Chalisa'],str(n0))
    p.get_by_role('button',name='Move Hanuman Chalisa up').click(); p.wait_for_timeout(150)
    check('my mantras: reorder up',names()==['Om Gan Ganapataye Namah','Hanuman Chalisa','Om Namo Narayanaya'],str(names()))
    p.get_by_role('button',name='Move Om Gan Ganapataye Namah down').click(); p.wait_for_timeout(150)
    check('my mantras: reorder down',names()[1]=='Om Gan Ganapataye Namah',str(names()))
    p.reload(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(200)
    check('my mantras: order persists after refresh',names()==['Hanuman Chalisa','Om Gan Ganapataye Namah','Om Namo Narayanaya'],str(names()))
    p.get_by_role('button',name='Remove Om Namo Narayanaya from My Mantras').click(); p.wait_for_timeout(150)
    check('my mantras: remove',len(names())==2)
    p.locator('ol > li').first.get_by_role('link',name='Jaap',exact=True).click(); p.wait_for_load_state('networkidle'); p.wait_for_timeout(200)
    check('my mantras: Start Jaap directly',p.locator('select').first.evaluate('e=>e.options[e.selectedIndex].text')=='Hanuman Chalisa')
    # delete custom
    go(p,'/library/'+cid); p.get_by_role('button',name='Delete').click(); p.get_by_role('alertdialog').get_by_role('button',name='Delete').click(); p.wait_for_timeout(400)
    check('custom delete: removed and redirected',p.url.endswith('/library/my-mantras') and p.get_by_text('Om Gan Ganapataye Namah').count()==0)
    go(p,'/jaap'); opts=p.locator('select').first.evaluate('e=>[...e.querySelectorAll("option")].map(o=>o.text)')
    check('custom delete: gone from Jaap',not any('Ganapataye' in o for o in opts))
    go(p,'/library/'+cid); check('custom delete: route handled',p.get_by_text('Not found').is_visible())
    # quick-add in Jaap creates a library mantra
    go(p,'/jaap'); p.get_by_label('New custom mantra').fill('Sri Ram Jai Ram'); p.get_by_role('button',name='Add',exact=True).click(); p.wait_for_timeout(300)
    check('jaap quick-add selects new mantra',p.locator('select').first.evaluate('e=>e.options[e.selectedIndex].text')=='Sri Ram Jai Ram')
    go(p,'/library?q=sri+ram'); check('jaap quick-add also appears in library',p.get_by_text('Sri Ram Jai Ram').first.is_visible())
    ctx.close()

    # ---------- other pages still work
    p,ctx=new_page(b)
    for path,expect in [('/','Welcome back'),('/jaap','Jaap'),('/wisdom','Seek His Wisdom'),('/journey','My Journey')]:
        go(p,path); check(f'existing page {path}',p.get_by_role('heading',name=expect).first.is_visible())
    go(p,'/journey?tab=settings'); check('journey settings',p.get_by_text('Export my data').is_visible())
    ctx.close()

    # ---------- mobile responsiveness (no sideways scroll, tap targets)
    p,ctx=new_page(b,w=375,h=812)
    paths=['/library','/library/category/hanuman','/library/hanuman-chalisa','/library/hanuman-chalisa?mode=verse&v=chaupai-12','/library/mm-mmj','/library/madhurashtakam','/library/vishnu-sahasranama','/library/favourites','/library/my-mantras','/library/custom/new','/jaap?mantra=mm-hare','/journey?tab=favs']
    for path in paths:
        go(p,path); ow=p.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
        check(f'mobile 375px no horizontal scroll {path}',ow<=0,str(ow))
    go(p,'/library/hanuman-chalisa'); p.screenshot(path='/tmp/shot_m_chalisa.png')
    go(p,'/library'); p.screenshot(path='/tmp/shot_m_index.png')
    small=p.evaluate("[...document.querySelectorAll('main button, main a.btn, main a.btn2')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<30)}).length")
    check('mobile: tap targets >=30px (compact design) on library index',small==0,str(small))
    ctx.close(); b.close()

bad=[r for r in results if not r[1]]
print(f'\n{len(results)-len(bad)}/{len(results)} checks passed'); 
net=[e for e in errors if 'ERR_NAME_NOT_RESOLVED' in e[1]]
errors=[e for e in errors if 'ERR_NAME_NOT_RESOLVED' not in e[1]]
print('ignored offline font requests (Google Fonts):',len(net))
print('console/page errors:',len(errors)); [print('  ',e) for e in errors[:15]]
json.dump({'results':results,'errors':errors},open('/tmp/e2e.json','w'))
sys.exit(1 if bad or errors else 0)
