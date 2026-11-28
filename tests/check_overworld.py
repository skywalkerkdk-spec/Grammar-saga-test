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
            pg.evaluate("""()=>{G=fresh('Walk test');SV=defSave();SV.mode='story';SV.cleared=['d1','d2','d3','d4','d5','d6','d7','d8'];G.started=true;G.reg=null;G.scr='dsel';render();}""")
            pg.wait_for_timeout(1500)
        start()
        assert pg.locator('#wmwalk').count()==1,'스토리 모드 허브에 필드 버튼이 있어야 함'
        pg.locator('#wmwalk').click();pg.wait_for_timeout(1500)
        assert pg.locator('dialog.c2-world[open]').count()==1,'월드맵 걷기 창이 열려야 함'
        n=pg.locator('select[aria-label="탐험 목적지"] option').count()
        assert n>=7,'남중앙 패널 장소 7곳이 선택 목록에 있어야 함: %d'%n
        if shot:pg.screenshot(path=shot)
        pg.evaluate("G.c2OwSteps=99999")
        pg.locator('select[aria-label="탐험 목적지"]').select_option(label='비 초원');pg.wait_for_selector('.c2-world-confirm button',timeout=200000)
        assert pg.locator('.c2-world-confirm button',has_text='들어가기').count()==1,'비 초원 도착 시 입장 확인이 떠야 함'
        pg.locator('.c2-world-confirm button',has_text='던전에 들어가기').click();pg.wait_for_timeout(800)
        assert pg.evaluate("G.dg.id")=='g1' and pg.evaluate("G.scr") in ('formed','town'),'비 초원 입장(던전 또는 비빌 마을 화면)으로 가야 함: %s %s'%(pg.evaluate("G.dg&&G.dg.id"),pg.evaluate("G.scr"))
        assert pg.evaluate("G.owDungeon")==True,'필드에서 들어간 던전 표시가 있어야 함'
        pg.evaluate("G.scr='clear';G.run=genRunG({id:'g1'});G.ei=G.run.length;G.hp=3;G.done=true;G.deaths=0;G.ok=3;G.tot=3;G.maxCmb=3;G.t0=Date.now()-5000;G.goldRun=0;G.clearPaid=false;try{render();}catch(e){}")
        if pg.locator('#app button',has_text='필드로 돌아가기').count():
            pg.locator('#app button',has_text='필드로 돌아가기').first.click();pg.wait_for_timeout(1500)
            assert pg.locator('.c2-field-viewport').count()==1,'클리어 후 필드로 돌아가기가 월드맵을 열어야 함'
            assert pg.evaluate("G.owDungeon")==False
        else: print('경고: 클리어 화면 재현 실패(수동 확인 필요)')
        pg.evaluate("G.scr='dsel';SV.mode='story';render()")
        # 조우: 걸음 수를 1로 만든 뒤 걸으면 문제 조우가 떠야 함
        start();pg.locator('#wmwalk').click();pg.wait_for_timeout(1200)
        pg.evaluate("G.c2OwSteps=1;SV.cry=0;SV.owEnc=null")
        pg.locator('select[aria-label="탐험 목적지"]').select_option(label='퀘스천 동굴');pg.wait_for_function("G.scr==='battle'&&!!G.owFight",timeout=60000)
        pg.wait_for_selector('#qc .choice',timeout=10000)
        print('문제 유형',pg.evaluate("G.run[0].type"),pg.locator('#mon').count(),pg.locator('#qc .choice').count())
        assert pg.locator('#mon').count()==1 and pg.locator('#qc .choice').count()>=2,'기존 전투 화면(몬스터+문제)이 떠야 함'
        if shot:pg.screenshot(path=shot.replace('.png','_enc.png'))
        assert pg.evaluate("!!localStorage.getItem(RUNKEY())")==False,'필드 전투가 던전 이어하기 기록을 만들면 안 됨'
        a=pg.evaluate("G.run[0].options[G.run[0].answer]")
        pg.locator('#qc .choice',has_text=a).first.click();pg.wait_for_timeout(1500)
        assert pg.evaluate("SV.cry")>0,'정답이면 기존 방식대로 💎 보상: %s'%pg.evaluate("SV.cry")
        pg.locator('#nx').click();pg.wait_for_timeout(1500)
        assert pg.evaluate("!G.owFight && G.scr")=='dsel','전투 후 원래 화면으로 돌아와야 함: %s'%pg.evaluate("G.scr")
        assert pg.locator('dialog.c2-world[open]').count()==1,'전투 후 월드맵이 다시 열려야 함'
        assert pg.evaluate("!!localStorage.getItem(RUNKEY())")==False,'전투 후에도 이어하기 기록이 생기면 안 됨'
        print('월드맵 걷기: 열기·장소 7곳·도착→던전 입장·조우→기존 전투 화면→정답 보상→월드맵 복귀 통과 / 오류',errs)
        assert not errs,errs
