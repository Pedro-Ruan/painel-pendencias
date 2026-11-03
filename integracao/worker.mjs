// Cole este arquivo em Edit code no Cloudflare Worker. As chaves ficam em Secrets.
// Report URLs and their keys are configured only in the private GOALFY_REPORTS Secret.
const MAX_BYTES=20*1024*1024;
const WORKER_VERSION='GOALFY-WORKER-20261030-R4';
const DIAGNOSTIC_PAGE=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Diagnóstico Goalfy</title><body><h1>Diagnóstico Goalfy R4</h1><p>Executa duas consultas ao relatório selecionado, sem alterar o dashboard. Informe a senha DASHBOARD_TOKEN, não a chave do Goalfy.</p><form><label>Senha <input id="token" type="password" required autocomplete="off"></label><label>Posição do relatório no Secret <input id="number" type="number" min="1" max="5" value="1" required></label><button>Executar diagnóstico</button></form><pre role="status" id="result"></pre><script>document.querySelector('form').onsubmit=async e=>{e.preventDefault();const button=document.querySelector('button'),input=document.querySelector('#token'),token=input.value;input.value='';button.disabled=true;document.querySelector('#result').textContent='Consultando…';try{const response=await fetch('/diagnostic?report='+encodeURIComponent(document.querySelector('#number').value),{method:'POST',headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit'});document.querySelector('#result').textContent=JSON.stringify(await response.json(),null,2);}catch(e){document.querySelector('#result').textContent='Falha ao acessar o diagnóstico.';}finally{button.disabled=false;}};</script></body></html>`;
const REDIRECTS=new Set([301,302,303,307,308]);
function downloadError(message){const error=new Error(message);error.safeMessage=message;return error;}
async function downloadReport(endpoint,signal,extraHosts=[],profile='atual',trace=[]){
  let current=new URL(endpoint);
  const secret=endpoint.searchParams.get('apiKey');
  for(let hop=0;hop<=5;hop++){
    const headers=profile==='navegador'?{Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}:{Accept:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream'};
    const response=await fetch(current,{redirect:'manual',signal,headers});
    trace.push({etapa:hop+1,status:response.status,origem:current.origin===endpoint.origin?'Goalfy':'armazenamento'});
    if(!REDIRECTS.has(response.status))return response;
    const location=response.headers.get('Location');await response.body?.cancel();
    if(!location)throw downloadError('O Goalfy retornou redirecionamento sem destino.');
    if(hop===5)throw downloadError('O download excedeu o limite de redirecionamentos.');
    let next;try{next=new URL(location,current);}catch(e){throw downloadError('O Goalfy retornou um destino de download inválido.');}
    const host=next.hostname;
    const approved=host==='goalfy.com.br'||host.endsWith('.goalfy.com.br')||host.endsWith('.amazonaws.com')||host.endsWith('.cloudfront.net')||host==='storage.googleapis.com'||host.endsWith('.blob.core.windows.net')||extraHosts.includes(host);
    if(next.protocol!=='https:'||next.username||next.password||next.port||!approved)throw downloadError('Destino do download não autorizado. Configure GOALFY_DOWNLOAD_HOSTS se o Goalfy usar outro domínio de armazenamento.');
    if(next.origin!==endpoint.origin&&(next.searchParams.has('apiKey')||decodeURIComponent(next.href).includes(secret)))throw downloadError('Redirecionamento bloqueado para proteger a chave do Goalfy.');
    // Do not copy query parameters, Authorization or cookies to the download host.
    current=next;
  }
}
async function validToken(request,secret){
  const hash=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const [a,b]=await Promise.all([hash(request.headers.get('Authorization')||''),hash('Bearer '+secret)]);
  let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/diagnostico'&&request.method==='GET')return new Response(DIAGNOSTIC_PAGE,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'"}});
    if(url.pathname==='/'&&request.method==='GET')return new Response('Serviço de integração Goalfy\nVersão: '+WORKER_VERSION+'\nUse o dashboard para consultar os relatórios.',{headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store','X-Worker-Version':WORKER_VERSION}});
    const origin=request.headers.get('Origin');
    if(!env.ALLOWED_ORIGIN||(origin!==env.ALLOWED_ORIGIN&&!(url.pathname==='/diagnostic'&&origin===url.origin)))return new Response('Origem não permitida.',{status:403});
    const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Expose-Headers':'X-Goalfy-Fetched-At,X-Worker-Version','X-Worker-Version':WORKER_VERSION,'Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    const fail=(message,status)=>new Response(JSON.stringify({error:message,version:WORKER_VERSION}),{status,headers:{...headers,'Content-Type':'application/json;charset=utf-8'}});
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Authorization','Access-Control-Max-Age':'600'}});
    if(!((url.pathname==='/report'&&request.method==='GET')||(url.pathname==='/diagnostic'&&request.method==='POST')))return fail('Endereço não encontrado.',404);
    if(!env.GOALFY_REPORTS||!env.DASHBOARD_TOKEN||env.DASHBOARD_TOKEN.length<24)return fail('Configure GOALFY_REPORTS e DASHBOARD_TOKEN nos Secrets do Worker.',503);
    if(!(await validToken(request,env.DASHBOARD_TOKEN)))return fail('Senha de acesso inválida.',401);
    let reports;
    try{
      reports=JSON.parse(env.GOALFY_REPORTS);
      if(!Array.isArray(reports)||reports.length<1||reports.length>5)throw new Error();
      reports=reports.map(report=>{
        const endpoint=new URL(report.url);
        if(endpoint.protocol!=='https:'||endpoint.hostname!=='api.goalfy.com.br'||endpoint.port||endpoint.username||endpoint.password||endpoint.hash||!/^\/api\/reports\/createExcelDownload\/[a-zA-Z0-9-]+\/external$/.test(endpoint.pathname)||!endpoint.searchParams.get('apiKey')||[...endpoint.searchParams.keys()].some(key=>key!=='apiKey'))throw new Error();
        return endpoint;
      });
    }catch(e){return fail('Configure GOALFY_REPORTS com uma lista válida de relatórios.',503);}
    if(url.pathname==='/diagnostic'){
      const number=Number(url.searchParams.get('report'));
      if(!Number.isInteger(number)||number<1||number>reports.length)return fail('Escolha uma posição existente na lista GOALFY_REPORTS.',400);
      const results=[],extraHosts=(env.GOALFY_DOWNLOAD_HOSTS||'').split(',').map(host=>host.trim().toLowerCase());
      for(const profile of ['atual','navegador']){
        const started=Date.now(),trace=[];let reader;
        try{
          const upstream=await downloadReport(reports[number-1],AbortSignal.timeout(20000),extraHosts,profile,trace);
          reader=upstream.body?.getReader();let prefix=new Uint8Array(0);
          while(reader&&prefix.length<512){const chunk=await reader.read();if(chunk.done)break;const next=new Uint8Array(Math.min(512,prefix.length+chunk.value.length));next.set(prefix);next.set(chunk.value.subarray(0,next.length-prefix.length),prefix.length);prefix=next;}
          const content=(upstream.headers.get('Content-Type')||'').toLowerCase();
          results.push({perfil:profile,status:upstream.status,formato:content.includes('json')?'JSON':content.includes('html')?'HTML':content.includes('spreadsheet')?'Excel':'outro',assinaturaZIP:prefix[0]===80&&prefix[1]===75,etapas:trace,duracaoMs:Date.now()-started});
        }catch(e){results.push({perfil:profile,erro:e.safeMessage||(e.name==='TimeoutError'||e.name==='AbortError'?'tempo limite':'falha de conexão'),etapas:trace,duracaoMs:Date.now()-started});}
        finally{try{await reader?.cancel();}catch(e){}}
      }
      return new Response(JSON.stringify({version:WORKER_VERSION,relatorio:number,comparacao:results}),{headers:{...headers,'Content-Type':'application/json;charset=utf-8'}});
    }
    let reportNumber=0;
    try{
      const results=[];let total=0;
      const signal=AbortSignal.timeout(50000);
      const extraHosts=(env.GOALFY_DOWNLOAD_HOSTS||'').split(',').map(host=>host.trim().toLowerCase()).filter(host=>/^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/.test(host));
      for(const endpoint of reports){
      reportNumber++;
      const upstream=await downloadReport(endpoint,signal,extraHosts);
      if(!upstream.ok)return fail('Relatório '+reportNumber+': o Goalfy retornou HTTP '+upstream.status+'. Confira a chave e as permissões desse relatório.',502);
      if(Number(upstream.headers.get('Content-Length'))>MAX_BYTES)return fail('O relatório ultrapassa o limite de 20 MB.',413);
      if(!upstream.body)return fail('O Goalfy retornou uma resposta vazia.',502);
      const reader=upstream.body.getReader(),chunks=[];let size=0;
      while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES){await reader.cancel();return fail('O relatório ultrapassa o limite de 20 MB.',413);}chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      if(bytes[0]!==0x50||bytes[1]!==0x4b)return fail('O Goalfy não retornou um arquivo Excel XLSX válido.',502);
      total+=size;if(total>MAX_BYTES)return fail('A soma dos relatórios ultrapassa o limite de 20 MB.',413);
      let binary='';for(let start=0;start<bytes.length;start+=8192)binary+=String.fromCharCode(...bytes.subarray(start,start+8192));
      results.push({data:btoa(binary)});
      }
      return new Response(JSON.stringify({reports:results}),{headers:{...headers,'Content-Type':'application/json;charset=utf-8','X-Goalfy-Fetched-At':new Date().toISOString()}});
    }catch(e){const reason=e.safeMessage||(e.name==='TimeoutError'||e.name==='AbortError'?'A consulta excedeu o tempo limite.':'Falha de conexão entre o Worker e o Goalfy.');return fail('Relatório '+reportNumber+': '+reason,502);}
  }
};
