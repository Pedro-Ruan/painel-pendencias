import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from '../scripts/build.mjs';
import {serve} from '../scripts/serve.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const row=(id,extra={})=>({'Nome do Cliente:':'Exemplo '+id,'Produto - Lead':'VIDA','Envio da Proposta':'01/10/2026',Modelo:'LEAD','N° Proposta':String(id),'Seleciona a(s) Pendência(s)':'Em análise',Vendedor:'VENDEDOR TESTE',SUSEP:'CMHE2J',...extra});
const fixture=['EM TRATAMENTO','URGENTE; EM TRATAMENTO','EM ANDAMENTO','AGUARDANDO CONTATO','','EM TRATAMENTO FUTURO','["EM TRATAMENTO","OUTRA"]'].map((Etiquetas,index)=>row(index+1,{Etiquetas}));
async function importData(page,rows){
  const bytes=await page.evaluate(rows=>{const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(rows),'Relatório');return Array.from(new Uint8Array(XLSX.write(book,{bookType:'xlsx',type:'array'})));},rows);
  await page.locator('#file').setInputFiles({name:'etiquetas-ficticias.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(bytes)});
  await page.waitForFunction(size=>DATA.length===size&&!FILES[0].sample,rows.length);
}
test('etiquetas, seções recolhidas, prazo e contraste dos seletores',async t=>{
  const folder=await mkdtemp(join(tmpdir(),'painel-tags-'));await build(undefined,folder);await build(undefined,join(folder,'teste'));const server=await serve(folder,0),base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  async function withPage(fn){
    const context=await browser.newContext({colorScheme:'light',reducedMotion:'reduce'});await context.route('https://fonts.googleapis.com/**',r=>r.abort());await context.route('https://fonts.gstatic.com/**',r=>r.abort());
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{await page.goto(base);await page.waitForSelector('#tbl tbody tr');await importData(page,fixture);await fn(page,context);assert.deepEqual(errors,[]);}finally{await context.close();}
  }
  try{
    await t.test('somente EM TRATAMENTO gera etiqueta, no fim da tabela, e é exportada',()=>withPage(async page=>{
      assert.equal(await page.locator('th').last().getAttribute('data-k'),'etiqueta');assert.equal(await page.locator('.treatment-tag').count(),3);
      assert.deepEqual(await page.evaluate(()=>DATA.map(r=>r.etiqueta)),['EM TRATAMENTO','EM TRATAMENTO','','','','','EM TRATAMENTO']);
      const filter=page.locator('.frow').filter({has:page.locator('label',{hasText:/^TRATAMENTO$/})});
      assert.deepEqual(await filter.locator('.chip').allTextContents(),['TODOS','A TRATAR','EM TRATAMENTO']);
      await filter.getByRole('button',{name:'EM TRATAMENTO',exact:true}).click();assert.equal(await page.locator('#tbl tbody tr').count(),3);
      const pending=page.waitForEvent('download');await page.click('#export');const download=await pending;const bytes=Array.from(await readFile(await download.path()));
      const exported=await page.evaluate(bytes=>{const book=XLSX.read(new Uint8Array(bytes),{type:'array'});return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{defval:''});},bytes);
      assert.equal(exported.length,3);assert(exported.every(r=>r.Etiquetas==='EM TRATAMENTO'));
      await filter.getByRole('button',{name:'A TRATAR',exact:true}).click();await filter.getByRole('button',{name:'EM TRATAMENTO',exact:true}).click();assert.equal(await page.locator('#tbl tbody tr').count(),4);assert.equal(await page.locator('.treatment-tag').count(),0);
      assert((await page.locator('td').allTextContents()).every(value=>!value.includes('AGUARDANDO CONTATO')));
    }));
    await t.test('relatório antigo sem Etiquetas continua compatível',()=>withPage(async page=>{
      await importData(page,[row(1)]);assert.equal(await page.locator('.treatment-tag').count(),0);assert.equal(await page.evaluate(()=>DATA[0].tratamento),'A TRATAR');assert.equal(await page.locator('th').last().textContent().then(s=>s.includes('Etiquetas')),true);
    }));
    await t.test('recolher uma seção preserva seu título, filtros e preferência após recarregar',()=>withPage(async page=>{
      await page.locator('#section-panorama .section-toggle').click();assert.equal(await page.locator('#section-panorama .section-body').isVisible(),false);assert.equal(await page.locator('#section-panorama> .section-heading').isVisible(),true);
      assert.equal(await page.locator('#section-panorama .section-toggle').getAttribute('aria-expanded'),'false');
      await page.evaluate(()=>{sel.tratamento.add('EM TRATAMENTO');render();});assert.equal(await page.locator('#section-panorama .section-body').isVisible(),false);assert.equal(await page.locator('#tbl tbody tr').count(),3);
      await page.reload();await page.waitForSelector('#tbl tbody tr');assert.equal(await page.locator('#section-panorama .section-body').isVisible(),false);
      await page.selectOption('#section-nav','section-panorama');assert.equal(await page.locator('#section-panorama .section-body').isVisible(),true);assert.equal(await page.locator('#section-panorama .section-toggle').getAttribute('aria-expanded'),'true');
    }));
    await t.test('organizar gráficos abre temporariamente seções e não perde o estado recolhido',()=>withPage(async page=>{
      await page.locator('#section-tempo .section-toggle').click();await page.click('#layout-edit');assert.equal(await page.locator('#section-tempo .section-body').isVisible(),true);
      await page.locator('.ch[data-chart-id="propostasporproduto"] select').selectOption('tempo');await page.click('#layout-save');
      assert.equal(await page.locator('#section-tempo .section-body').isVisible(),false);await page.selectOption('#section-nav','section-tempo');assert.equal(await page.locator('#section-tempo .ch[data-chart-id="propostasporproduto"]').isVisible(),true);
      await page.click('#layout-edit');await page.locator('#section-tempo .section-name').fill('Prazos da equipe');await page.click('#layout-save');await page.locator('#section-tempo .section-toggle').click();
      await page.reload();await page.waitForSelector('#tbl tbody tr');assert.equal(await page.locator('#section-tempo h2').first().textContent(),'Prazos da equipe');assert.equal(await page.locator('#section-tempo .section-body').isVisible(),false);
    }));
    await t.test('recolhimento é isolado entre teste e produção',()=>withPage(async(page,context)=>{
      await page.locator('#section-panorama .section-toggle').click();const qa=await context.newPage();await qa.goto(base+'/teste/');await qa.waitForSelector('#tbl tbody tr');assert.equal(await qa.locator('#section-panorama .section-body').isVisible(),true);await qa.close();
    }));
    await t.test('10+ dias aparece no gráfico, na legenda, nos alertas e no cartão',()=>withPage(async page=>{
      const rows=await page.evaluate(template=>[9,10,14,15].map((days,i)=>({...template,'N° Proposta':String(i+1),'Envio da Proposta':fmtDate(new Date(today().getFullYear(),today().getMonth(),today().getDate()-days))})),row(1));await importData(page,rows);
      const chart=page.locator('.ch[data-chart-id="tempoparadodesdeoenvio"]');assert.deepEqual(await chart.locator('.collab span').allTextContents(),['0 a 3 dias','4 a 7 dias','8 a 9 dias','10+ dias']);assert.deepEqual(await chart.locator('.cols .col b').allTextContents(),['0','0','1','3']);
      assert.match(await chart.locator('.clegend').textContent(),/10\+ dias/);assert(!/14 dias|15/.test(await chart.locator('.clegend').textContent()));assert.equal(await page.locator('.kpi').filter({hasText:'Com 10 dias ou mais'}).locator('.v').textContent(),'3');assert.equal(await page.locator('#tbl .pill.late').count(),3);
    }));
    await t.test('Voltar ao início rola a página sem alterar filtros ou dados',()=>withPage(async page=>{
      await page.evaluate(()=>{sel.tratamento.add('EM TRATAMENTO');render();window.scrollTo(0,document.documentElement.scrollHeight);});assert(await page.evaluate(()=>scrollY)>0);
      const before=await page.evaluate(()=>JSON.stringify(tableView.rows));await page.getByRole('button',{name:'Voltar ao início'}).click();await page.waitForFunction(()=>scrollY<5);assert.equal(await page.evaluate(()=>JSON.stringify(tableView.rows)),before);assert.equal(await page.evaluate(()=>sel.tratamento.has('EM TRATAMENTO')),true);
    }));
    await t.test('regressão: opções do seletor no escuro mantêm fundo opaco e contraste ao passar o mouse',()=>withPage(async page=>{
      await page.click('#theme');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'dark');
      const colors=()=>page.locator('#section-nav').evaluate(select=>({control:getComputedStyle(select).backgroundColor,text:getComputedStyle(select).color,options:[...select.options].map(o=>({background:getComputedStyle(o).backgroundColor,color:getComputedStyle(o).color}))}));
      const before=await colors();assert.notEqual(before.control,'rgba(0, 0, 0, 0)');assert(before.options.every(o=>o.background===before.control&&o.color===before.text&&o.color!==o.background));
      await page.locator('label[for="section-nav"]').hover();assert.deepEqual(await colors(),before);await page.locator('#section-nav').hover();assert.deepEqual(await colors(),before);
      await page.click('#layout-edit');const chartSelect=page.locator('.chart-tools select').first();const bg=await chartSelect.evaluate(e=>getComputedStyle(e).backgroundColor);await chartSelect.hover();assert.equal(await chartSelect.evaluate(e=>getComputedStyle(e).backgroundColor),bg);
      await page.click('#layout-cancel');await page.click('#theme');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'light');assert.notEqual((await colors()).control,before.control);
    }));
  }finally{await browser.close();await new Promise(done=>server.close(done));if(resolve(folder).startsWith(resolve(tmpdir(),'painel-tags-')))await rm(folder,{recursive:true,force:true});}
});
