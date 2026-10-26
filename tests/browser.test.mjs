import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from '../scripts/build.mjs';
import {serve} from '../scripts/serve.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const record=(number,overrides={})=>({'Nome do Cliente:':'Cliente fictício '+number,'Produto - Lead':'VIDA','Produto - Venda Secundária':'','Envio da Proposta':'01/10/2026','Modelo':'LEAD','Modelo de Indicação:':'','N° Proposta':String(number),'Seleciona a(s) Pendência(s)':'Em análise','Vendedor':'Vendedor exemplo','Seguradora Contratada - Auto/Moto/Bike':'Porto Seguro','SUSEP':'CMHE2J',...overrides});
const fixture=[record(1,{'Produto - Venda Secundária':'CELULAR'}),record(2,{'Modelo':'INDICACAO','Modelo de Indicação:':'IND. CRIACAO ALEATORIA'}),record(3,{'SUSEP':'Terceiros'}),record(4,{'SUSEP':'Terceiros','Modelo':'INDICACAO','Modelo de Indicação:':'IND. CRIACAO ALEATORIA'}),record(5,{'Modelo':'INDICACAO','Modelo de Indicação:':'IND. BOLA DA VEZ'})];
async function loadData(page,rows=fixture){
  const bytes=await page.evaluate(rows=>{
    const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(rows),'Relatório');
    return Array.from(new Uint8Array(XLSX.write(book,{bookType:'xlsx',type:'array'})));
  },rows);
  await page.locator('#file').setInputFiles({name:'relatorio-ficticio.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(bytes)});
  await page.waitForFunction(count=>DATA.length===count&&FILES[0]&&!FILES[0].sample,rows.length);
}
test('regressões no navegador — importação, gráficos, tabela e ambientes',async t=>{
  const temp=await mkdtemp(join(tmpdir(),'painel-tests-'));await build(undefined,temp);await build(undefined,join(temp,'teste'));
  const server=await serve(temp,0),base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  const context=await browser.newContext();await context.route('https://fonts.googleapis.com/**',r=>r.abort());await context.route('https://fonts.gstatic.com/**',r=>r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(base);await page.waitForSelector('#tbl tbody tr');
    await t.test('integração Goalfy opcional mantém importação manual e começa desconectada',async()=>{
      assert.equal(await page.locator('#goalfy-settings').isVisible(),false);assert.equal(await page.evaluate(()=>goalfyConnection),null);assert.equal(await page.locator('#goalfy-refresh').isDisabled(),true);assert.equal(await page.locator('#pick').count(),1);assert.deepEqual(errors,[]);
    });
    await t.test('importação XLSX real aplica produto secundário e conserva os demais produtos',async()=>{
      await loadData(page);assert.equal(await page.evaluate(()=>DATA.find(r=>r.proposta==='1').produto),'CELULAR');assert.equal(await page.evaluate(()=>DATA.find(r=>r.proposta==='2').produto),'VIDA');
      assert.equal(await page.locator('.ch').filter({hasText:'Venda secundária'}).count(),0);
      const columns=await page.evaluate(()=>({visible:tableView.cols.map(c=>c[1]),exported:XLSX.utils.sheet_to_json(generalWorkbook().Sheets['Pendências'],{header:1})[0]}));
      assert(!columns.visible.includes('Empresa'));assert.equal(columns.exported.at(-1),'Empresa');assert.deepEqual(columns.exported.slice(0,-1),columns.visible);
    });
    await t.test('terceiros permanecem na tabela mas não entram nos gráficos de eficiência',async()=>{
      const result=await page.evaluate(()=>({rows:DATA.length,priority:DATA.filter(r=>r.eficiencia==='Impactam eficiência').length,priorityChart:dimItems('eficiencia').reduce((a,b)=>a+b.value,0),referralChart:dimItems('indicacao').reduce((a,b)=>a+b.value,0),models:dimItems('modelo',true).reduce((a,b)=>a+b.value,0),origin:dimItems('origem').reduce((a,b)=>a+b.value,0)}));
      assert.deepEqual(result,{rows:5,priority:2,priorityChart:3,referralChart:2,models:3,origin:5});
    });
    await t.test('abas automáticas usam SUSEP, sem nome de arquivo',async()=>{
      assert.deepEqual(await page.locator('#tabs button').allTextContents(),['INRI']);
      await page.evaluate(row=>addFile([row],'nome-sem-empresa.xlsx'),record(10,{'SUSEP':'CMN32J'}));
      assert.deepEqual(await page.locator('#tabs button').allTextContents(),['Geral','ICX','INRI']);
      await page.locator('#tabs').getByRole('button',{name:'INRI',exact:true}).click();assert.equal(await page.locator('#tbl tbody tr').count(),5);
    });
    await t.test('primeira seção reúne produto, motivo e vendedor; navegação rola até a seção',async()=>{
      const names=await page.locator('#section-panorama .ch>h2').allTextContents();assert.deepEqual(names,['Propostas por produto','Pendências por motivo','Propostas por vendedor']);
      await page.selectOption('#section-nav','section-tempo');await page.waitForFunction(()=>Math.abs(document.querySelector('#section-tempo').getBoundingClientRect().top)<150);
    });
    await t.test('gráfico move entre seções por arraste e a mudança pode ser cancelada',async()=>{
      await page.click('#layout-edit');
      await page.setViewportSize({width:1440,height:8000});
      const source=page.locator('.ch[data-chart-id="propostasporproduto"] .drag-handle');
      await source.dragTo(page.locator('.ch[data-chart-id="enviospordia"]'));
      assert.equal(await page.locator('#section-tempo .ch[data-chart-id="propostasporproduto"]').count(),1);assert.equal(await page.evaluate(()=>draggingChart),null);
      await page.click('#layout-cancel');await page.setViewportSize({width:1280,height:720});assert.equal(await page.locator('#section-panorama .ch[data-chart-id="propostasporproduto"]').count(),1);
    });
    await t.test('renomear, mover, excluir e restaurar persistem após recarregar',async()=>{
      await page.click('#layout-edit');await page.locator('#section-panorama .section-name').fill('Visão da equipe');
      await page.locator('.ch[data-chart-id="propostasporproduto"] select').selectOption('tempo');
      await page.locator('.ch[data-chart-id="pendenciaspormotivo"]').getByRole('button',{name:'Excluir gráfico'}).click();
      await page.click('#layout-save');await page.reload();await page.waitForSelector('#tbl tbody tr');
      assert.equal(await page.locator('#section-panorama h2').first().textContent(),'Visão da equipe');
      assert.equal(await page.locator('#section-tempo .ch[data-chart-id="propostasporproduto"]').count(),1);
      assert.equal(await page.locator('.ch[data-chart-id="pendenciaspormotivo"]').isVisible(),false);
      await page.click('#layout-edit');await page.getByRole('button',{name:'Restaurar: Pendências por motivo'}).click();await page.click('#layout-save');
      assert.equal(await page.locator('.ch[data-chart-id="pendenciaspormotivo"]').isVisible(),true);
    });
    await t.test('arrastar colunas conserva ordenação de linhas e reflete na exportação XLSX',async()=>{
      const before=await page.evaluate(()=>({...sort}));
      await page.locator('th[data-k="produto"] .column-grip').dragTo(page.locator('th[data-k="cliente"]'));
      assert.deepEqual(await page.evaluate(()=>({...sort})),before);
      assert.equal(await page.locator('th').first().getAttribute('data-k'),'produto');
      await page.locator('#q').fill('CELULAR');
      const downloadPromise=page.waitForEvent('download');await page.click('#export');const download=await downloadPromise;
      const bytes=Array.from(await readFile(await download.path()));
      const parsed=await page.evaluate(bytes=>{const book=XLSX.read(new Uint8Array(bytes),{type:'array'});return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{header:1});},bytes);
      assert.equal(parsed[0][0],'Produto');assert.equal(parsed[0].at(-1),'Etiquetas');assert.equal(parsed.length,2);assert.equal(parsed[1][0],'CELULAR');
      await page.reload();await page.waitForSelector('th');assert.equal(await page.locator('th').first().getAttribute('data-k'),'produto');
    });
    await t.test('colunas também movem pelo teclado e gráficos filtrados continuam operando',async()=>{
      await page.locator('th[data-k="produto"] .column-grip').focus();await page.keyboard.press('Alt+ArrowRight');assert.notEqual(await page.locator('th').first().getAttribute('data-k'),'produto');
      await page.evaluate(()=>{sel.produto.add('CELULAR');render();});assert.equal(await page.locator('#tbl tbody tr').count(),1);assert.equal(await page.evaluate(()=>tableView.rows[0].produto),'CELULAR');
    });
    await t.test('teste e produção isolam relatórios e preferências',async()=>{
      const productionCount=await page.evaluate(()=>DATA.length);const qa=await context.newPage();await qa.goto(base+'/teste/');await qa.waitForSelector('#tbl tbody tr');
      assert.equal(await qa.locator('#environment-badge').isVisible(),true);assert.equal(await qa.evaluate(()=>FILES.every(f=>f.sample)),true);
      await qa.click('#theme');await loadData(qa,[record(77)]);
      assert.equal(await qa.evaluate(()=>DATA.length),1);await page.reload();await page.waitForSelector('#tbl tbody tr');assert.equal(await page.evaluate(()=>DATA.length),productionCount);await qa.close();
    });
    await t.test('tema, média com produto e data de atualização continuam presentes',async()=>{
      await page.click('#theme');const theme=await page.evaluate(()=>document.documentElement.dataset.theme);await page.reload();await page.waitForSelector('#tbl tbody tr');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);
      assert.match(await page.locator('#src').textContent(),/\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/);assert.match(await page.locator('#kpis').textContent(),/Produto:/);assert.deepEqual(errors,[]);
    });
    await t.test('mobile não cria rolagem horizontal na página e mantém controles de seção',async()=>{
      await page.setViewportSize({width:390,height:844});await page.click('#layout-edit');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert(await page.locator('.chart-tools select').count()>0);await page.click('#layout-cancel');await page.setViewportSize({width:1280,height:720});
    });
    await t.test('preferência antiga malformada não impede abrir o painel',async()=>{
      const bad=await browser.newContext();await bad.addInitScript(()=>{localStorage.setItem('pend-chart-order','{"incorreto":true}');});
      const tab=await bad.newPage();await tab.goto(base);await tab.waitForSelector('#tbl tbody tr');assert(await tab.locator('.ch').count()>0);await bad.close();
    });
    if(process.env.PANEL_SCREENSHOTS){await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{clearFilters();render();window.scrollTo(0,0);});await page.screenshot({path:join(process.env.PANEL_SCREENSHOTS,'desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(process.env.PANEL_SCREENSHOTS,'mobile.png'),fullPage:true});}
  }finally{await browser.close();await new Promise(done=>server.close(done));if(resolve(temp).startsWith(resolve(tmpdir(),'painel-tests-')))await rm(temp,{recursive:true,force:true});}
});
