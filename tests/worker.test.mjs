import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../integracao/worker.mjs';
const env={ALLOWED_ORIGIN:'https://dashboard.example',GOALFY_API_KEY:'FAKE_API_KEY_ONLY_FOR_TESTS',GOALFY_REPORTS:JSON.stringify([{url:'https://api.goalfy.com.br/api/reports/createExcelDownload/fixture-a/external?apiKey=FAKE_API_KEY_ONLY_FOR_TESTS'}]),DASHBOARD_TOKEN:'test-viewer-token-12345678901234567890'};
function request(token=env.DASHBOARD_TOKEN,origin=env.ALLOWED_ORIGIN,method='GET',path='/report'){
  return new Request('https://example.workers.dev'+path,{method,headers:{Origin:origin,Authorization:'Bearer '+token}});
}
test('somente erros controlados podem fornecer mensagem pública do download',async()=>{
  const original=globalThis.fetch;
  try{globalThis.fetch=async()=>{throw Object.assign(new Error('private upstream detail'),{safeMessage:env.GOALFY_API_KEY});};const response=await worker.fetch(request(),env),body=await response.text();assert.equal(response.status,502);assert(!body.includes(env.GOALFY_API_KEY));assert(!body.includes('private upstream detail'));assert.match(body,/Falha de conexão/);}finally{globalThis.fetch=original;}
});
test('Anexar Apólices usa Secret separado, sem fallback para Pendências',async()=>{
  const original=globalThis.fetch,seen=[];const config={...env,GOALFY_APOLICES_REPORTS:JSON.stringify([{url:'https://api.goalfy.com.br/api/reports/createExcelDownload/fixture-apolices/external?apiKey=FAKE_APOLICES'}])};
  try{globalThis.fetch=async url=>{seen.push(new URL(url).pathname);return new Response(new Uint8Array([80,75,3,4]));};
    assert.equal((await worker.fetch(request(undefined,undefined,'GET','/report?dataset=apolices'),config)).status,200);assert.match(seen[0],/fixture-apolices/);
    assert.equal((await worker.fetch(request(),config)).status,200);assert.match(seen[1],/fixture-a/);
    assert.equal((await worker.fetch(request(undefined,undefined,'GET','/report?dataset=apolices'),env)).status,503);
    assert.equal((await worker.fetch(request(undefined,undefined,'GET','/report?dataset=invalid'),config)).status,400);assert.equal(seen.length,2);
  }finally{globalThis.fetch=original;}
});
test('diagnóstico compara cabeçalhos e não devolve corpo, URL ou credenciais do Goalfy',async()=>{
  const original=globalThis.fetch,seen=[];
  try{
    globalThis.fetch=async(url,options)=>{seen.push(options);return options.headers['User-Agent']?new Response(new Uint8Array([80,75,3,4]),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}}):new Response('SECRET_CLIENT_NAME '+env.GOALFY_API_KEY,{status:500,headers:{'Content-Type':'application/json','Location':'https://secret.example/path'}});};
    const response=await worker.fetch(request(undefined,'https://example.workers.dev','POST','/diagnostic?report=1'),env),text=await response.text(),body=JSON.parse(text);
    assert.equal(response.status,200);assert.deepEqual(body.comparacao.map(item=>item.status),[500,200]);assert.equal(body.comparacao[1].assinaturaZIP,true);assert.equal(seen.length,2);assert.notEqual(seen[0].headers.Accept,seen[1].headers.Accept);
    for(const secret of [env.GOALFY_API_KEY,env.DASHBOARD_TOKEN,'fixture-a','SECRET_CLIENT_NAME','secret.example'])assert(!text.includes(secret));
    assert.equal((await worker.fetch(request('invalid',undefined,'POST','/diagnostic?report=1'),env)).status,401);
    assert.equal((await worker.fetch(request(undefined,'https://evil.example','POST','/diagnostic?report=1'),env)).status,403);
    assert.equal((await worker.fetch(request(undefined,undefined,'POST','/diagnostic?report=2'),env)).status,400);
    assert.equal((await worker.fetch(request(undefined,'https://example.workers.dev'),env)).status,403);
  }finally{globalThis.fetch=original;}
});
test('diagnóstico público só apresenta formulário, sem relatório; exceções são sanitizadas',async()=>{
  const page=await worker.fetch(new Request('https://example.workers.dev/diagnostico'),env),html=await page.text();assert.equal(page.status,200);assert.match(html,/type="password"/);assert.equal(page.headers.get('Cache-Control'),'no-store');assert(!html.includes(env.DASHBOARD_TOKEN));assert(!html.includes(env.GOALFY_REPORTS));
  const original=globalThis.fetch;
  try{globalThis.fetch=async()=>{throw new Error(env.GOALFY_API_KEY);};const response=await worker.fetch(request(undefined,undefined,'POST','/diagnostic?report=1'),env),body=await response.text();assert(!body.includes(env.GOALFY_API_KEY));assert.match(body,/falha de conexão/);}finally{globalThis.fetch=original;}
});
test('versão pública permite conferir implantação sem expor configuração',async()=>{
  const response=await worker.fetch(new Request('https://example.workers.dev/'),env),body=await response.text();
  assert.match(body,/GOALFY-WORKER-20261103-R5/);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('X-Worker-Version'),'GOALFY-WORKER-20261103-R5');
  for(const secret of [env.DASHBOARD_TOKEN,env.GOALFY_API_KEY,env.GOALFY_REPORTS,env.ALLOWED_ORIGIN])assert(!body.includes(secret));
  const denied=await worker.fetch(request('invalid'),env);assert.equal((await denied.json()).version,'GOALFY-WORKER-20261103-R5');
});
test('regressão: segue download redirecionado sem encaminhar credenciais',async()=>{
  const original=globalThis.fetch,seen=[];
  try{
    globalThis.fetch=async(url,options)=>{seen.push({url:new URL(url),options});return seen.length===1?new Response(null,{status:302,headers:{Location:'https://fixture.s3.amazonaws.com/report.xlsx?signature=FAKE'}}):new Response(new Uint8Array([80,75,3,4]));};
    const response=await worker.fetch(request(),env);assert.equal(response.status,200);assert.equal(seen.length,2);assert.equal(seen[1].url.searchParams.get('apiKey'),null);assert.equal(seen[1].options.headers.Authorization,undefined);assert.equal(seen[1].options.headers.Cookie,undefined);assert(!JSON.stringify(seen[1]).includes(env.GOALFY_API_KEY));
    assert.equal(JSON.parse(await response.text()).reports.length,1);
  }finally{globalThis.fetch=original;}
});
test('regressão: redirecionamentos inseguros, loops e erros são diagnosticados sem segredos',async()=>{
  const original=globalThis.fetch;
  try{
    for(const destination of ['http://fixture.s3.amazonaws.com/file','https://evil.example/file','https://fixture.s3.amazonaws.com/file?apiKey='+env.GOALFY_API_KEY,'https://user:password@fixture.s3.amazonaws.com/file']){
      let calls=0;globalThis.fetch=async()=>{calls++;return new Response(null,{status:302,headers:{Location:destination}});};const response=await worker.fetch(request(),env);const body=await response.text();assert.equal(response.status,502);assert.equal(calls,1);assert(!body.includes(env.GOALFY_API_KEY));assert(!body.includes(destination));
    }
    let calls=0;globalThis.fetch=async()=>{calls++;return new Response(null,{status:307,headers:{Location:'/loop'}});};const loop=await worker.fetch(request(),env);assert.match(await loop.text(),/limite de redirecionamentos/);assert.equal(calls,6);
    globalThis.fetch=async()=>{throw new DOMException('secret detail','TimeoutError');};const timeout=await worker.fetch(request(),env);assert.match(await timeout.text(),/Relatório 1:.*tempo limite/);
    globalThis.fetch=async()=>{throw new TypeError('secret detail');};const network=await worker.fetch(request(),env);assert.match(await network.text(),/Falha de conexão entre/);
    globalThis.fetch=async()=>new Response('secret detail',{status:403});const denied=await worker.fetch(request(),env);assert.match(await denied.text(),/Relatório 1:.*HTTP 403/);
  }finally{globalThis.fetch=original;}
});
test('Worker: autenticação, origem e validação da configuração',async()=>{
  assert.equal((await worker.fetch(request('invalid'),env)).status,401);
  assert.equal((await worker.fetch(request(undefined,'https://evil.example'),env)).status,403);
  assert.equal((await worker.fetch(request(),{...env,GOALFY_REPORTS:''})).status,503);
  assert.equal((await worker.fetch(request(),{...env,DASHBOARD_TOKEN:'short'})).status,503);
  assert.equal((await worker.fetch(request(undefined,undefined,'OPTIONS'),env)).status,204);
  assert.equal((await worker.fetch(request(undefined,undefined,'POST'),env)).status,404);
  assert.equal((await worker.fetch(request(undefined,undefined,'GET','/'),env)).status,200);
});
test('Worker: consulta apenas endpoint fixo e não devolve chave ou erros internos',async()=>{
  const original=globalThis.fetch;let requested;
  try{
    globalThis.fetch=async(url,options)=>{requested={url:new URL(url),options};return new Response(new Uint8Array([80,75,3,4]));};
    const response=await worker.fetch(request(),env);assert.equal(response.status,200);
    assert.equal(requested.url.origin,'https://api.goalfy.com.br');assert.equal(requested.url.searchParams.get('apiKey'),env.GOALFY_API_KEY);assert.equal(requested.options.redirect,'manual');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'),env.ALLOWED_ORIGIN);assert.equal(response.headers.get('Cache-Control'),'no-store');assert(response.headers.get('X-Goalfy-Fetched-At'));
    assert(![...response.headers.values()].join('|').includes(env.GOALFY_API_KEY));
    globalThis.fetch=async()=>new Response('Falha interna: '+env.GOALFY_API_KEY,{status:403});const denied=await worker.fetch(request(),env);assert.equal(denied.status,502);assert(!(await denied.text()).includes(env.GOALFY_API_KEY));
    globalThis.fetch=async()=>{throw new Error('https://example/?apiKey='+env.GOALFY_API_KEY)};const failed=await worker.fetch(request(),env);assert.equal(failed.status,502);assert(!(await failed.text()).includes(env.GOALFY_API_KEY));
    globalThis.fetch=async()=>new Response('<html>not Excel</html>');assert.equal((await worker.fetch(request(),env)).status,502);
    globalThis.fetch=async()=>new Response('large',{headers:{'Content-Length':String(21*1024*1024)}});assert.equal((await worker.fetch(request(),env)).status,413);
  }finally{globalThis.fetch=original;}
});
test('Worker: dois relatórios e chaves distintas, sem publicar links; falha parcial é atômica',async()=>{
  const original=globalThis.fetch,seen=[];
  const reports=[{url:'https://api.goalfy.com.br/api/reports/createExcelDownload/fixture-a/external?apiKey=FAKE_A'},{url:'https://api.goalfy.com.br/api/reports/createExcelDownload/fixture-b/external?apiKey=FAKE_B'}];
  const config={...env,GOALFY_REPORTS:JSON.stringify(reports)};
  try{
    globalThis.fetch=async url=>{seen.push(new URL(url).searchParams.get('apiKey'));return new Response(new Uint8Array([80,75,3,4]));};
    const response=await worker.fetch(request(),config),body=await response.text();assert.equal(response.status,200);assert.equal(JSON.parse(body).reports.length,2);assert.deepEqual(seen,['FAKE_A','FAKE_B']);assert(!body.includes('FAKE_'));assert(!body.includes('fixture-'));
    let calls=0;globalThis.fetch=async()=>++calls===2?new Response('internal secret',{status:403}):new Response(new Uint8Array([80,75,3,4]));
    const failed=await worker.fetch(request(),config);assert.equal(failed.status,502);assert(!(await failed.text()).includes('data'));
    for(const invalid of ['null','[]','{}','[{"url":"https://evil.example/report"}]','[{"url":"http://api.goalfy.com.br/api/reports/createExcelDownload/fixture/external?apiKey=FAKE"}]'])assert.equal((await worker.fetch(request(),{...env,GOALFY_REPORTS:invalid})).status,503);
    assert.equal((await worker.fetch(request(undefined,'null'),config)).status,403);
  }finally{globalThis.fetch=original;}
});


