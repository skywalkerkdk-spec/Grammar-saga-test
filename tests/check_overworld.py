"""실제 브라우저: 월드맵 걷기 — 지도 화면 버튼으로 열림, 장소 선택으로 이동·도착 시 입장 확인, 마을/던전 입장"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os,sys
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
class Q(SimpleHTTPRequestHandler):
    def log_message(self,*_):pass
shot=sys.argv[1] if len(sys.argv)>1 else None
with ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=root)) as srv:
    Thread(target=srv.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{srv.server_port}/'
    with sync_playwright() as pw:
        br=pw.chromium.launch(executable_path=os.environ.get('GRAMMAR_CHROMIUM'))
        pg=br.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        pg.route('**/*',lambda r:r.continue_() if r.request.url.startswith(url) else r.abort())
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(url)
        def start():
            pg.goto(url)
            pg.evaluate("""()=>{G=fresh('Walk test');SV=defSave();SV.cleared=['d1','d2','d3','d4','d5','d6','d7','d8'];G.started=true;G.reg=null;G.scr='dsel';render();}""")
            pg.wait_for_timeout(1500)
        start()
        assert pg.locator('#wmwalk').count()==1,'지도 화면에 걸어서 탐험 버튼이 있어야 함'
        pg.locator('#wmwalk').click();pg.wait_for_timeout(1500)
        assert pg.locator('dialog.c2-world[open]').count()==1,'월드맵 걷기 창이 열려야 함'
        n=pg.locator('select[aria-label="탐험 목적지"] option').count()
        assert n>=47,'장소 47곳이 선택 목록에 있어야 함: %d'%n
        if shot:pg.screenshot(path=shot)
        pg.evaluate("G.c2OwSteps=99999")
        pg.locator('select[aria-label="탐험 목적지"]').select_option(label='비 초원');pg.wait_for_selector('.c2-world-confirm button',timeout=200000)
        assert pg.locator('.c2-world-confirm button',has_text='들어가기').count()==1,'비 초원 도착 시 입장 확인이 떠야 함'
        pg.locator('.c2-world-confirm button',has_text='던전에 들어가기').click();pg.wait_for_timeout(800)
        assert pg.evaluate("G.dg.id")=='g1' and pg.evaluate("G.scr") in ('formed','town'),'비 초원 입장(던전 또는 비빌 마을 화면)으로 가야 함: %s %s'%(pg.evaluate("G.dg&&G.dg.id"),pg.evaluate("G.scr"))
        # 조우: 걸음 수를 1로 만든 뒤 걸으면 문제 조우가 떠야 함
        start();pg.locator('#wmwalk').click();pg.wait_for_timeout(1200)
        pg.evaluate("G.c2OwSteps=1;SV.cry=0;SV.owEnc=null")
        pg.locator('select[aria-label="탐험 목적지"]').select_option(label='골렘의 협곡');pg.wait_for_selector('.c2-world-confirm[data-answer]',timeout=60000)
        ans=pg.evaluate("document.querySelector('.c2-world-confirm')?.dataset.answer||''")
        assert ans,'걷다 보면 몬스터 조우(문제)가 떠야 함'
        if shot:pg.screenshot(path=shot.replace('.png','_enc.png'))
        pg.locator('.c2-world-confirm button',has_text=ans).first.click();pg.wait_for_timeout(300)
        assert pg.evaluate("SV.cry")==2,'정답이면 💎+2: %s'%pg.evaluate("SV.cry")
        print('월드맵 걷기: 열기·장소 47곳·도착→던전 입장·조우→정답 보상 통과 / 오류',errs)
        assert not errs,errs
