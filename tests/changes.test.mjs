import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from '../scripts/build.mjs';
import {serve} from '../scripts/serve.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const record=(id,extra={})=>({'Nome do Cliente:':'Exemplo '+id,'Produto - Lead':'AUTOMOVEL','Produto - Venda Secundária':'VIDA','Envio da Proposta':'01/10/2026','Modelo':'LEAD','Modelo de Indicação:':'','N° Proposta':String(id),'Seleciona a(s) Pendência(s)':'Em análise','Vendedor':'VENDEDOR 1, VENDEDOR 2','SUSEP':'CMHE2J',...extra});
async function makeContext(browser){const context=await browser.newContext();await context.route('https://fonts.googleapis.com/**',route=>route.abort());await context.route('https://fonts.gstatic.com/**',route=>route.abort());return context;}
async function importRows(page,rows){
  const bytes=await page.evaluate(rows=>{const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(rows),'Relatório');return Array.from(new Uint8Array(XLSX.write(book,{bookType:'xlsx',type:'array'})));},rows);
  await page.locator('#file').setInputFiles({name:'exemplo-regressao.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(bytes)});
  await page.waitForFunction(count=>DATA.length===count&&!FILES[0].sample,rows.length);
}
test('ajustes solicitados: produto, vendedor, dez dias e eficiência',async t=>{
  const folder=await mkdtemp(join(tmpdir(),'painel-adjustments-'));await build(undefined,folder);const server=await serve(folder,0),base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  try{
    await t.test('venda secundária aparece como VIDA e usa somente VENDEDOR 1 nos gráficos',async()=>{
      for(const header of ['Produto - Venda Secundária','PRODUTO VENDA SECUNDARIA','Produto da Venda Secundária','Produto - Venda Secundária (opcional)']){
        const context=await makeContext(browser),page=await context.newPage();await page.goto(base);await page.waitForSelector('#tbl tbody tr');
        const row=record(1);delete row['Produto - Venda Secundária'];row[header]='VIDA';await importRows(page,[row]);
        const result=await page.evaluate(()=>({produto:DATA[0].produto,vendedor:DATA[0].vendedor,products:dimItems('produto').map(r=>r.name),sellers:dimItems('vendedor').map(r=>r.name)}));
        assert.deepEqual(result,{produto:'VIDA',vendedor:'VENDEDOR 1',products:['VIDA'],sellers:['VENDEDOR 1']},header);
        const exported=await page.evaluate(()=>XLSX.utils.sheet_to_json(generalWorkbook().Sheets['Pendências']));assert.equal(exported[0].Produto,'VIDA');assert.equal(exported[0].Vendedor,'VENDEDOR 1');await context.close();
      }
    });
    await t.test('venda secundária vazia preserva AUTOMOVEL e o primeiro vendedor',async()=>{
      const context=await makeContext(browser),page=await context.newPage();await page.goto(base);await page.waitForSelector('#tbl tbody tr');await importRows(page,[record(2,{'Produto - Venda Secundária':'   '})]);
      assert.deepEqual(await page.evaluate(()=>[DATA[0].produto,DATA[0].vendedor]),['AUTOMOVEL','VENDEDOR 1']);await context.close();
    });
    await t.test('filtro tem só duas categorias e inclui terceiros em DEMAIS PENDÊNCIAS',async()=>{
      const context=await makeContext(browser),page=await context.newPage();await page.goto(base);await page.waitForSelector('#tbl tbody tr');
      await importRows(page,[record(1),record(2,{SUSEP:'CMN32J',Modelo:'INDICACAO','Modelo de Indicação:':'IND. CRIACAO ALEATORIA'}),record(3,{SUSEP:'Terceiros'}),record(4,{SUSEP:'2GAJ6J'}),record(5,{SUSEP:'A805TJ'}),record(6,{SUSEP:''}),record(7,{Modelo:'INDICACAO','Modelo de Indicação:':'IND. BOLA DA VEZ'}),record(8,{Modelo:'RENOVACAO'})]);
      assert.deepEqual(await page.evaluate(()=>DATA.map(r=>r.eficiencia)),['Impactam eficiência','Impactam eficiência',...Array(6).fill('Demais pendências')]);
      const filter=page.locator('.frow').filter({has:page.locator('label',{hasText:'PRIORIDADE DE EFICIÊNCIA'})});
      assert.deepEqual(await filter.locator('.chip').allTextContents(),['TODOS','DEMAIS PENDÊNCIAS','IMPACTAM EFICIÊNCIA']);
      await filter.getByRole('button',{name:'DEMAIS PENDÊNCIAS',exact:true}).click();
      assert.equal(await page.evaluate(()=>tableView.rows.length),6);assert.equal(await page.evaluate(()=>tableView.rows.filter(r=>r.origem==='Terceiros').length),1);
      assert.equal(await page.evaluate(()=>dimItems('origem').find(r=>r.name==='Terceiros').value),1);
      assert.equal(await page.evaluate(()=>dimItems('eficiencia').filter(r=>!r.off).reduce((sum,r)=>sum+r.value,0)),5);
      await filter.getByRole('button',{name:'TODOS',exact:true}).click();await filter.getByRole('button',{name:'IMPACTAM EFICIÊNCIA',exact:true}).click();assert.equal(await page.evaluate(()=>tableView.rows.length),2);await context.close();
    });
    await t.test('cartão usa dez dias inclusive, sem contar propostas com nove dias',async()=>{
      const context=await makeContext(browser),page=await context.newPage();await page.goto(base);await page.waitForSelector('#tbl tbody tr');
      const rows=await page.evaluate(template=>[9,10,11].map((days,i)=>({...template,'N° Proposta':String(i+1),'Envio da Proposta':fmtDate(new Date(today().getFullYear(),today().getMonth(),today().getDate()-days))})),record(1));
      await importRows(page,rows);const card=page.locator('.kpi').filter({hasText:'Com 10 dias ou mais'});assert.equal(await card.locator('.v').textContent(),'2');assert.equal(await page.locator('.kpi').filter({hasText:'Com 15 dias ou mais'}).count(),0);await context.close();
    });
    await t.test('todos os textos visíveis dos filtros iniciais estão em maiúsculas',async()=>{
      const context=await makeContext(browser),page=await context.newPage();await page.goto(base);await page.waitForSelector('#tbl tbody tr');await importRows(page,[record(1),record(2,{Modelo:'INDICACAO','Modelo de Indicação:':'IND. CRIACAO ALEATORIA',SUSEP:'Terceiros'})]);
      const texts=await page.locator('#filters label,#filters button,#fcount').allTextContents();for(const text of texts)assert.equal(text,text.toLocaleUpperCase('pt-BR'));await context.close();
    });
  }finally{await browser.close();await new Promise(done=>server.close(done));if(resolve(folder).startsWith(resolve(tmpdir(),'painel-adjustments-')))await rm(folder,{recursive:true,force:true});}
});
