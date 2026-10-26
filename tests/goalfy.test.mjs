import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {build} from '../scripts/build.mjs';
import {serve} from '../scripts/serve.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const require=createRequire(import.meta.url),XLSX=require('../assets/xlsx.full.min.js');
const token='FAKE-VIEWER-PASSWORD-1234567890';
const row=(number,extra={})=>({'Nome do Cliente:':'Cliente exemplo '+number,'Produto - Lead':'AUTOMOVEL','Produto - Venda Secundária':'VIDA','Envio da Proposta':'01/10/2026',Modelo:'LEAD','N° Proposta':String(number),'Seleciona a(s) Pendência(s)':'Em análise',Vendedor:'VENDEDOR 1, VENDEDOR 2',SUSEP:'CMHE2J',Etiquetas:'EM TRATAMENTO',...extra});
function excel(rows){const book=XLSX.utils.book_new();const sheet=rows.length?XLSX.utils.json_to_sheet(rows):XLSX.utils.aoa_to_sheet([Object.keys(row(1))]);XLSX.utils.book_append_sheet(book,sheet,'Relatório');return Buffer.from(XLSX.write(book,{type:'buffer',bookType:'xlsx'}));}
test('Goalfy opcional: consulta, atualização, recuperação e preservação das funcionalidades',async t=>{
  const folder=await mkdtemp(join(tmpdir(),'painel-goalfy-'));await build(undefined,folder);await build(undefined,join(folder,'teste'));const server=await serve(folder,0),base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  async function scenario(fn){
    const context=await browser.newContext({reducedMotion:'reduce'});await context.route('https://fonts.googleapis.com/**',r=>r.abort());await context.route('https://fonts.gstatic.com/**',r=>r.abort());
    const state={rows:[row(1)],status:200,calls:0,delay:0,reports:null};
    await context.route('https://example.workers.dev/**',async route=>{
      const origin=route.request().headers().origin;
      const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Authorization','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Expose-Headers':'X-Goalfy-Fetched-At','X-Goalfy-Fetched-At':new Date().toISOString()};
      if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
      state.calls++;assert.equal(route.request().headers().authorization,'Bearer '+token);
      if(state.delay)await new Promise(done=>setTimeout(done,state.delay));
      await route.fulfill(state.status===200?(state.reports?{status:200,headers,contentType:'application/json',body:JSON.stringify({reports:state.reports.map(rows=>({data:excel(rows).toString('base64')}))})}:{status:200,headers,contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',body:excel(state.rows)}):{status:state.status,headers,contentType:'application/json',body:JSON.stringify({error:'Falha simulada'})}).catch(()=>{});
    });
    const page=await context.newPage(),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
    try{await page.goto(base);await page.waitForSelector('#tbl tbody tr');await fn(page,state,context);assert.deepEqual(errors,[]);}catch(error){console.error(error.message);console.error('Status:',await page.locator('#goalfy-status').textContent());throw error;}finally{await context.close();}
  }
  async function connect(page,interval='0'){
    await page.click('#goalfy-toggle');await page.fill('#goalfy-service','https://example.workers.dev');await page.selectOption('#goalfy-interval',interval);await page.fill('#goalfy-password',token);await page.click('#goalfy-connect-button');await page.waitForFunction(()=>!goalfyRequest);
  }
  try{
    await t.test('dois relatórios preservam empresas separadas; falha parcial mantém todos os dados',()=>scenario(async(page,state)=>{
      state.reports=[[row(1)],[row(2,{SUSEP:'CMN32J'})]];await connect(page);
      assert.deepEqual(await page.evaluate(()=>empresas().sort()),['ICX','INRI']);assert.equal(await page.evaluate(()=>DATA.length),2);assert.equal(await page.evaluate(()=>FILES.length),2);
      const previous=await page.evaluate(()=>JSON.stringify(FILES));state.status=502;await page.click('#goalfy-refresh');await page.waitForFunction(()=>!goalfyRequest);assert.equal(await page.evaluate(()=>JSON.stringify(FILES)),previous);
    }));
    await t.test('arquivo local informa a origem bloqueada antes de fazer consulta',()=>scenario(async(page,state)=>{
      await page.goto(pathToFileURL(resolve('outputs/painel-pendencias-github/index.html')).href);await connect(page);assert.equal(state.calls,0);assert.match(await page.locator('#goalfy-status').textContent(),/abra o dashboard publicado/);
    }));
    await t.test('configuração cabe na tela do celular sem campos excessivamente altos',()=>scenario(async page=>{
      await page.setViewportSize({width:390,height:844});await page.click('#goalfy-toggle');
      const box=await page.locator('#goalfy-password').boundingBox();assert(box.height<80);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }));
    await t.test('conecta com senha e aplica etiquetas, produto secundário e primeiro vendedor',()=>scenario(async(page,state)=>{
      assert.equal(state.calls,0);await connect(page);assert.equal(state.calls,1);assert.match(await page.locator('#goalfy-status').textContent(),/atualizado/);
      assert.deepEqual(await page.evaluate(()=>[DATA[0].produto,DATA[0].vendedor,DATA[0].etiqueta,DATA[0].eficiencia]),['VIDA','VENDEDOR 1','EM TRATAMENTO','Impactam eficiência']);
      assert.deepEqual(await page.locator('#tabs button').allTextContents(),['INRI']);assert.equal(await page.locator('#goalfy-password').inputValue(),'');assert.equal(await page.evaluate(()=>JSON.stringify(localStorage).includes('FAKE-VIEWER-PASSWORD')),false);
    }));
    await t.test('Atualizar agora preserva filtros, ordem de colunas e seções recolhidas',()=>scenario(async(page,state)=>{
      await connect(page);await page.evaluate(()=>{sel.produto.add('VIDA');render();moveColumn('produto','cliente');setSectionCollapsed('panorama',true);});
      state.rows=[row(1),row(2)];await page.click('#goalfy-refresh');await page.waitForFunction(()=>!goalfyRequest&&DATA.length===2);
      assert.equal(await page.evaluate(()=>sel.produto.has('VIDA')),true);assert.equal(await page.locator('th').first().getAttribute('data-k'),'produto');assert.equal(await page.locator('#section-panorama .section-body').isVisible(),false);assert.equal(await page.locator('.treatment-tag').count(),2);
    }));
    await t.test('intervalo configurável agenda consulta e modo manual cancela temporizador',()=>scenario(async(page,state)=>{
      await connect(page);assert.equal(await page.evaluate(()=>goalfyTimer===null),true);
      await page.selectOption('#goalfy-interval','600');assert.equal(await page.evaluate(()=>goalfyConnection.interval),600);assert.equal(await page.evaluate(()=>goalfyTimer!==null),true);
      await page.selectOption('#goalfy-interval','0');assert.equal(await page.evaluate(()=>goalfyTimer===null),true);
      await page.clock.install();await page.selectOption('#goalfy-interval','60');await page.clock.runFor(60001);await page.waitForFunction(()=>!goalfyRequest);assert.equal(state.calls,2);
    }));
    await t.test('falha mantém dados anteriores; senha inválida encerra tentativas automáticas',()=>scenario(async(page,state)=>{
      await connect(page);const previous=await page.evaluate(()=>JSON.stringify(FILES));state.status=502;await page.click('#goalfy-refresh');await page.waitForFunction(()=>!goalfyRequest);assert.equal(await page.evaluate(()=>JSON.stringify(FILES)),previous);assert.match(await page.locator('#goalfy-status').textContent(),/dados anteriores foram mantidos/);
      state.status=401;await page.click('#goalfy-refresh');await page.waitForFunction(()=>!goalfyConnection);assert.equal(await page.locator('#goalfy-refresh').isDisabled(),true);assert.equal(await page.evaluate(()=>sessionStorage.getItem(GOALFY_SESSION_KEY)),null);
    }));
    await t.test('relatório sem pendências limpa snapshot online anterior, sem exemplos antigos',()=>scenario(async(page,state)=>{
      await connect(page);state.rows=[];await page.click('#goalfy-refresh');await page.waitForFunction(()=>!goalfyRequest&&DATA.length===0);assert.equal(await page.evaluate(()=>FILES[0].sample),false);assert.match(await page.locator('#goalfy-status').textContent(),/0 proposta/);
    }));
    await t.test('recarregar reconecta nesta aba e ambiente de teste não herda a senha',()=>scenario(async(page,state,context)=>{
      await connect(page);await page.reload();await page.waitForFunction(()=>goalfyConnection&&!goalfyRequest);assert.equal(state.calls,2);
      const qa=await context.newPage();await qa.goto(base+'/teste/');await qa.waitForSelector('#tbl tbody tr');assert.equal(await qa.evaluate(()=>goalfyConnection),null);await qa.close();
    }));
    await t.test('desconectar durante a consulta impede sobrescrever dados após a resposta',()=>scenario(async(page,state)=>{
      await connect(page);const previous=await page.evaluate(()=>JSON.stringify(FILES));state.rows=[row(9)];state.delay=250;await page.click('#goalfy-refresh');await page.click('#goalfy-disconnect');await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>JSON.stringify(FILES)),previous);assert.equal(await page.evaluate(()=>goalfyConnection),null);
    }));
    await t.test('preserva relatório manual de outra empresa e desconecta ao importar manualmente',()=>scenario(async page=>{
      await page.evaluate(rows=>addFile(rows,'Outra empresa.xlsx'),[row(5,{SUSEP:'CMN32J'})]);await connect(page);assert.deepEqual(await page.evaluate(()=>empresas().sort()),['ICX','INRI']);
      await page.evaluate(rows=>addFile(rows,'Manual INRI.xlsx'),[row(6)]);assert.equal(await page.evaluate(()=>goalfyConnection),null);assert.equal(await page.evaluate(()=>DATA.some(r=>r.proposta==='6')),true);
    }));
  }finally{await browser.close();await new Promise(done=>server.close(done));if(resolve(folder).startsWith(resolve(tmpdir(),'painel-goalfy-')))await rm(folder,{recursive:true,force:true});}
});
