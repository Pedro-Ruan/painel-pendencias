import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../integracao/worker.mjs';
const env={ALLOWED_ORIGIN:'https://dashboard.example',GOALFY_API_KEY:'FAKE_API_KEY_ONLY_FOR_TESTS',GOALFY_REPORTS:JSON.stringify([{url:'https://api.goalfy.com.br/api/reports/createExcelDownload/fixture-a/external?apiKey=FAKE_API_KEY_ONLY_FOR_TESTS'}]),DASHBOARD_TOKEN:'test-viewer-token-12345678901234567890'};
function request(token=env.DASHBOARD_TOKEN,origin=env.ALLOWED_ORIGIN,method='GET',path='/report'){
  return new Request('https://example.workers.dev'+path,{method,headers:{Origin:origin,Authorization:'Bearer '+token}});
}
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
    assert.equal(requested.url.origin,'https://api.goalfy.com.br');assert.equal(requested.url.searchParams.get('apiKey'),env.GOALFY_API_KEY);assert.equal(requested.options.redirect,'error');
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
