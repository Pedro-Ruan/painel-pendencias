// Cole este arquivo em Edit code no Cloudflare Worker. As chaves ficam em Secrets.
// Report URLs and their keys are configured only in the private GOALFY_REPORTS Secret.
const MAX_BYTES=20*1024*1024;
async function validToken(request,secret){
  const hash=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const [a,b]=await Promise.all([hash(request.headers.get('Authorization')||''),hash('Bearer '+secret)]);
  let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/'&&request.method==='GET')return new Response('Serviço de integração Goalfy. Use o dashboard para consultar os relatórios.',{headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});
    const origin=request.headers.get('Origin');
    if(!env.ALLOWED_ORIGIN||origin!==env.ALLOWED_ORIGIN)return new Response('Origem não permitida.',{status:403});
    const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Expose-Headers':'X-Goalfy-Fetched-At','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    const fail=(message,status)=>new Response(JSON.stringify({error:message}),{status,headers:{...headers,'Content-Type':'application/json;charset=utf-8'}});
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Authorization','Access-Control-Max-Age':'600'}});
    if(url.pathname!=='/report'||request.method!=='GET')return fail('Endereço não encontrado.',404);
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
    try{
      const results=[];let total=0;
      for(const endpoint of reports){
      // Never log this URL or follow redirects containing the API key.
      const upstream=await fetch(endpoint,{redirect:'error',signal:AbortSignal.timeout(45000),headers:{Accept:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream'}});
      if(!upstream.ok)return fail('O Goalfy não disponibilizou o relatório. Confira a chave, o relatório e suas permissões.',502);
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
    }catch(e){return fail('Não foi possível consultar o Goalfy. Tente novamente em instantes.',502);}
  }
};
