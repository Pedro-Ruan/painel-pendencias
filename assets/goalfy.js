// Only the public service URL is shipped to the browser. Never place the Goalfy API key here.
// The service address is entered at runtime; no company endpoints are published.
const GOALFY_SESSION_KEY=(TEST_ENV?'teste:':'')+'pend-goalfy-session';
let goalfyConnection=null,goalfyTimer=null,goalfyRequest=null,goalfyGeneration=0,goalfyLastSuccess=0;
function goalfyStatus(message,level='info'){
  $('#goalfy-status').textContent=message;$('#goalfy-status').dataset.level=level;
}
function goalfyControls(){
  $('#goalfy-refresh').disabled=!goalfyConnection||!!goalfyRequest;
  $('#goalfy-connect-button').disabled=!!goalfyRequest;
  $('#goalfy-disconnect').disabled=!goalfyConnection;
}
function saveGoalfyPreferences(){try{storage.setItem('pend-goalfy-preferences',JSON.stringify({interval:Number($('#goalfy-interval').value)}));}catch(e){}}
function saveGoalfySession(){
  try{if(goalfyConnection&&$('#goalfy-remember').checked)sessionStorage.setItem(GOALFY_SESSION_KEY,JSON.stringify(goalfyConnection));else sessionStorage.removeItem(GOALFY_SESSION_KEY);}catch(e){}
}
function scheduleGoalfy(){
  clearTimeout(goalfyTimer);goalfyTimer=null;
  if(goalfyConnection&&goalfyConnection.interval>0)goalfyTimer=setTimeout(()=>refreshGoalfy(),goalfyConnection.interval*1000);
}
function disconnectGoalfy(message='Desconectado. Os últimos dados continuam no painel.'){
  goalfyGeneration++;goalfyConnection=null;clearTimeout(goalfyTimer);goalfyTimer=null;
  const pending=goalfyRequest;goalfyRequest=null;pending?.controller.abort();
  try{sessionStorage.removeItem(GOALFY_SESSION_KEY);}catch(e){}
  $('#goalfy-password').value='';goalfyControls();goalfyStatus(message);
}
function applyGoalfySnapshot(reports,time){
  const next=reports.map(({json,fallback},i)=>{toRows(json);return {empresa:fallback||'',label:'Relatório Goalfy '+(i+1),json,time,sample:false,source:'goalfy'};});
  const detected=next.flatMap(fileEmps).filter(name=>name!=='Não identificada');
  const previous=FILES.filter(f=>f.source==='goalfy');
  const owners=detected.length?detected:[...new Set(previous.flatMap(f=>f.owners||fileEmps(f)).filter(name=>name!=='Não identificada'))];
  next.forEach(f=>f.owners=owners);
  FILES=[...FILES.filter(f=>!f.sample&&f.source!=='goalfy'&&!fileEmps(f).some(name=>owners.includes(name))),...next];
  rebuild();persist();render();
}
async function refreshGoalfy(){
  if(!goalfyConnection||goalfyRequest)return;
  if(document.hidden){scheduleGoalfy();return;}
  clearTimeout(goalfyTimer);
  const generation=goalfyGeneration,connection=goalfyConnection,controller=new AbortController();
  const pending={controller};goalfyRequest=pending;goalfyControls();goalfyStatus('Consultando relatório do Goalfy…','loading');
  const timeout=setTimeout(()=>controller.abort(),60000);
  try{
    if(typeof XLSX==='undefined')throw new Error('O leitor de Excel não foi carregado. Recarregue o painel.');
    if(location.protocol==='file:')throw new Error('Para conectar ao Goalfy, abra o dashboard publicado. Arquivos locais não têm a origem autorizada pelo serviço.');
    const response=await fetch(connection.service+'/report',{method:'GET',redirect:'error',cache:'no-store',credentials:'omit',signal:controller.signal,headers:{Authorization:'Bearer '+connection.token}});
    if(!response.ok){let message='Falha na conexão com o serviço ('+response.status+').';try{const body=await response.json();if(body.error)message=body.error;}catch(e){}const error=new Error(message);error.status=response.status;throw error;}
    let reports;
    if((response.headers.get('Content-Type')||'').includes('application/json')){
      const body=await response.json();
      if(!Array.isArray(body.reports)||!body.reports.length||body.reports.length>5)throw new Error('Resposta inválida do serviço.');
      reports=body.reports.map(report=>{const raw=atob(report.data);if(raw.length>20*1024*1024)throw new Error('Relatório muito grande.');return parseReportData(Uint8Array.from(raw,c=>c.charCodeAt(0)).buffer);});
    }else{
      const bytes=await response.arrayBuffer();if(bytes.byteLength>20*1024*1024)throw new Error('O relatório ultrapassa o limite de 20 MB.');
      reports=[parseReportData(bytes)];
    }
    const count=reports.reduce((sum,report)=>sum+toRows(report.json).length,0);
    if(generation!==goalfyGeneration||goalfyRequest!==pending)return;
    const fetched=Date.parse(response.headers.get('X-Goalfy-Fetched-At')),time=Number.isFinite(fetched)?fetched:Date.now();
    applyGoalfySnapshot(reports,time);goalfyLastSuccess=Date.now();
    const now=new Date(time),next=connection.interval?'Próxima consulta em '+connection.interval/60+' minuto(s).':'Atualização automática desligada.';
    goalfyStatus('Goalfy atualizado em '+fmtDate(now)+' às '+hhmm(now)+' · '+count+' proposta(s). '+next,'success');
  }catch(error){
    if(generation!==goalfyGeneration||goalfyRequest!==pending)return;
    const message=error.name==='AbortError'?'A consulta demorou demais. Tente novamente.':error instanceof TypeError?'Não foi possível acessar o serviço. Confira o endereço, a origem autorizada e a publicação do Worker.':error.message||'Não foi possível consultar o Goalfy.';
    if(error.status===401||error.status===403)disconnectGoalfy();
    goalfyStatus(message+' Os dados anteriores foram mantidos.','error');
  }finally{
    clearTimeout(timeout);
    if(goalfyRequest===pending){goalfyRequest=null;goalfyControls();scheduleGoalfy();}
  }
}
$('#goalfy-toggle').onclick=()=>{const panel=$('#goalfy-settings');panel.hidden=!panel.hidden;$('#goalfy-toggle').setAttribute('aria-expanded',!panel.hidden);};
$('#goalfy-connect').onsubmit=e=>{
  e.preventDefault();const token=$('#goalfy-password').value.trim();
  let service;try{const url=new URL($('#goalfy-service').value.trim());if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error();service=url.origin;}catch(e){goalfyStatus('Informe somente o endereço HTTPS do serviço, sem chave, parâmetros ou caminho.','error');return;}
  if(token.length<24){goalfyStatus('Informe a senha de acesso configurada no Worker, com pelo menos 24 caracteres.','error');return;}
  disconnectGoalfy();goalfyConnection={token,service,interval:Number($('#goalfy-interval').value)};goalfyGeneration++;
  saveGoalfyPreferences();saveGoalfySession();goalfyControls();refreshGoalfy();
};
$('#goalfy-refresh').onclick=()=>refreshGoalfy();
$('#goalfy-disconnect').onclick=()=>disconnectGoalfy();
$('#goalfy-interval').onchange=()=>{
  saveGoalfyPreferences();if(!goalfyConnection)return;
  goalfyConnection.interval=Number($('#goalfy-interval').value);saveGoalfySession();if(!goalfyRequest)scheduleGoalfy();
  if(!goalfyRequest)goalfyStatus(goalfyConnection.interval?'Atualização configurada para cada '+goalfyConnection.interval/60+' minuto(s).':'Atualização automática desligada. Use Atualizar agora.');
};
$('#goalfy-remember').onchange=saveGoalfySession;
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&goalfyConnection?.interval>0&&!goalfyRequest&&Date.now()-goalfyLastSuccess>=goalfyConnection.interval*1000)refreshGoalfy();});
try{const pref=JSON.parse(storage.getItem('pend-goalfy-preferences')||'null');if([0,60,300,600,900].includes(pref?.interval))$('#goalfy-interval').value=String(pref.interval);}catch(e){}
try{
  const session=JSON.parse(sessionStorage.getItem(GOALFY_SESSION_KEY)||'null');
  const service=new URL(session?.service);
  if(service.protocol==='https:'&&!service.username&&!service.password&&!service.search&&!service.hash&&service.pathname==='/'&&typeof session?.token==='string'&&session.token.length>=24&&[0,60,300,600,900].includes(session.interval)){
    goalfyConnection={token:session.token,service:service.origin,interval:session.interval};$('#goalfy-service').value=service.origin;$('#goalfy-interval').value=String(session.interval);$('#goalfy-remember').checked=true;goalfyControls();refreshGoalfy();
  }
}catch(e){}
goalfyControls();
