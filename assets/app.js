const {hasTreatmentLabel,AGING_LIMIT,AGING_BANDS,agingCounts,effectiveProduct,normalizeInsurer,referralType,isThirdParty,efficiencyPriority,orderedKeys,moveKey,sections:DEFAULT_SECTIONS,defaultSection,cleanLayout}=window.PendenciasCore;

const SAMPLE = [{"Nome do Cliente:": "TESTE1", "Produto - Lead": "CELULAR", "Envio da Proposta": "15/10/2026", "Modelo": "RENOVACAO", "N° Proposta": 10, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE2", "Produto - Lead": "BIKE", "Envio da Proposta": "15/10/2026", "Modelo": "LEAD", "N° Proposta": 11, "Seleciona a(s) Pendência(s)": "Vistoria Reprovada ou Pendente", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE3", "Produto - Lead": "VIDA", "Envio da Proposta": "09/10/2026", "Modelo": "INDICACAO", "N° Proposta": 12, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "BIKE", "Envio da Proposta": "13/10/2026", "Modelo": "LEAD", "N° Proposta": 13, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "RESIDENCIAL", "Envio da Proposta": "07/10/2026", "Modelo": "INDICACAO", "N° Proposta": 14, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "CELULAR", "Envio da Proposta": "16/10/2026", "Modelo": "LEAD", "N° Proposta": 15, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE9", "Produto - Lead": "AUTOMOVEL", "Envio da Proposta": "05/10/2026", "Modelo": "RENOVACAO", "N° Proposta": 16, "Seleciona a(s) Pendência(s)": "Restrições Cadastrais ou Financeiras", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "CELULAR", "Envio da Proposta": "16/10/2026", "Modelo": "RENOVACAO", "N° Proposta": 17, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE0", "Produto - Lead": "AUTOMOVEL", "Envio da Proposta": "15/10/2026", "Modelo": "INDICACAO", "N° Proposta": 18, "Seleciona a(s) Pendência(s)": "Vistoria Reprovada ou Pendente", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "BIKE", "Envio da Proposta": "18/10/2026", "Modelo": "CONTINGENCIA", "N° Proposta": 19, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE4", "Produto - Lead": "VIDA", "Envio da Proposta": "14/10/2026", "Modelo": "LEAD", "N° Proposta": 20, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE9", "Produto - Lead": "MOTO", "Envio da Proposta": "07/10/2026", "Modelo": "LEAD", "N° Proposta": 21, "Seleciona a(s) Pendência(s)": "Vistoria Reprovada ou Pendente", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "MOTO", "Envio da Proposta": "13/10/2026", "Modelo": "INDICACAO", "N° Proposta": 22, "Seleciona a(s) Pendência(s)": "Vistoria Reprovada ou Pendente", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE3", "Produto - Lead": "MOTO", "Envio da Proposta": "07/10/2026", "Modelo": "LEAD", "N° Proposta": 23, "Seleciona a(s) Pendência(s)": "Vistoria Reprovada ou Pendente", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE4", "Produto - Lead": "VIDA", "Envio da Proposta": "07/10/2026", "Modelo": "INDICACAO", "N° Proposta": 24, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "CELULAR", "Envio da Proposta": "14/10/2026", "Modelo": "INDICACAO", "N° Proposta": 25, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE3", "Produto - Lead": "AUTOMOVEL", "Envio da Proposta": "15/10/2026", "Modelo": "INDICACAO", "N° Proposta": 26, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE0", "Produto - Lead": "AUTOMOVEL", "Envio da Proposta": "14/10/2026", "Modelo": "INDICACAO", "N° Proposta": 27, "Seleciona a(s) Pendência(s)": "Vistoria Reprovada ou Pendente", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE4", "Produto - Lead": "MOTO", "Envio da Proposta": "06/10/2026", "Modelo": "LEAD", "N° Proposta": 28, "Seleciona a(s) Pendência(s)": "Instalação Rastreador", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE1", "Produto - Lead": "RESIDENCIAL", "Envio da Proposta": "14/10/2026", "Modelo": "RENOVACAO", "N° Proposta": 29, "Seleciona a(s) Pendência(s)": "Pagamento Pendente", "Vendedor": "VENDEDOR 2"}, {"Nome do Cliente:": "TESTE1", "Produto - Lead": "BIKE", "Envio da Proposta": "14/10/2026", "Modelo": "RENOVACAO", "N° Proposta": 30, "Seleciona a(s) Pendência(s)": "Pagamento Pendente", "Vendedor": "VENDEDOR 3"}, {"Nome do Cliente:": "TESTE8", "Produto - Lead": "CELULAR", "Envio da Proposta": "16/10/2026", "Modelo": "INDICACAO", "N° Proposta": 31, "Seleciona a(s) Pendência(s)": "Em análise", "Vendedor": "VENDEDOR 1"}, {"Nome do Cliente:": "TESTE1", "Produto - Lead": "MOTO", "Envio da Proposta": "16/10/2026", "Modelo": "LEAD", "N° Proposta": 32, "Seleciona a(s) Pendência(s)": "Existe Outra Proposta Pendente", "Vendedor": "VENDEDOR 2"}];
const $ = s => document.querySelector(s);
const TEST_ENV=location.pathname.split('/').includes('teste');
const storage={getItem:key=>localStorage.getItem((TEST_ENV?'teste:':'')+key),setItem:(key,value)=>localStorage.setItem((TEST_ENV?'teste:':'')+key,value)};
$('#environment-badge').hidden=!TEST_ENV;
if(TEST_ENV)document.title='TESTE — Painel de Pendências';
const NORM = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ALIAS = {
  cliente:['nomedocliente','cliente','nome'],
  produto:['produtolead','produto','lead'],
  secundaria:['produtovendasecundaria','produtodavendasecundaria','produtodevendasecundaria','vendasecundaria','produtosecundario'],
  envio:['enviodaproposta','envio','datadeenvio','data'],
  modelo:['modelo'],
  indicacao:['modelodeindicacao','modelodaindicacao','tipoindicacao','tipodeindicacao'],
  proposta:['nproposta','numeroproposta','numproposta','proposta'],
  pend:['selecionaaspendencias','selecionaapendencias','pendencias','pendencia','motivo'],
  vendedor:['vendedor','consultor'],
  seguradora:['seguradora'],
  susep:['susep','codigosusep','nsusep'],
  empresa:['empresa','empresas','corretora'],
  etiquetas:['etiquetas','etiqueta','tags','tag']
};
const titleCase = s => (s===s.toUpperCase()||s===s.toLowerCase()) ? s.toLowerCase().replace(/(^|[\s\/-])\S/g,m=>m.toUpperCase()) : s;
/* Mapeamento SUSEP fixo, aplicado automaticamente na importação. */
const SUSEP_EMPRESA = {'CMHE2J':'INRI','2GAJ6J':'INRI','CMN32J':'ICX','A805TJ':'ICX'};
const origemOf = s => {
  if(!s || s==='—') return s ? 'Sem SUSEP' : '';
  if(NORM(s).startsWith('terceiro')) return 'Terceiros';
  return SUSEP_EMPRESA[s.trim().toUpperCase()] || ('SUSEP '+s.trim());
};
const DIMS = [
  {k:'vendedor', label:'Vendedor'},
  {k:'produto', label:'Produto'},
  {k:'modelo', label:'Modelo'},
  {k:'indicacao', label:'Tipo de indicação', optional:true},
  {k:'eficiencia', label:'Prioridade de eficiência'},
  {k:'seguradora', label:'Seguradora', optional:true},
  {k:'origem', label:'Origem da venda', optional:true},
  {k:'tratamento', label:'Tratamento'}
];
const HAS = {seguradora:false, susep:false, origem:false, indicacao:false};
const KNOWN = ['Em análise','Vistoria Reprovada ou Pendente','Pagamento Pendente','Restrições Cadastrais ou Financeiras','Instalação Rastreador','Existe Outra Proposta Pendente'];
const colorMap = {};
function colorOf(r){
  if(!(r in colorMap)){
    let i = KNOWN.findIndex(k=>NORM(k)===NORM(r));
    if(i<0){ const used = new Set(Object.values(colorMap)); i = 6; while(i<8 && used.has('var(--s'+(i+1)+')')) i++; }
    colorMap[r] = i<8 ? 'var(--s'+(i+1)+')' : 'var(--sx)';
  }
  return colorMap[r];
}
KNOWN.forEach(colorOf);

/* cor fixa por entidade (a mesma seguradora mantém a cor ao filtrar) */
let ENT = {};
function buildEnt(){
  ENT = {};
  ['modelo','produto','seguradora','susep','origem','empresa','vendedor','indicacao','eficiencia'].forEach(k=>{
    const c = {}; DATA.forEach(r=>{ c[r[k]] = (c[r[k]]||0)+1; });
    ENT[k] = {};
    const fixed = (k==='origem'||k==='empresa') ? {'Empresa A':1,'Empresa B':2,Terceiros:4} : {};
    Object.entries(fixed).forEach(([n,i])=>{ if(n in c) ENT[k][n]='var(--s'+i+')'; });
    let slot = 1; const taken = new Set(Object.values(fixed));
    Object.entries(c).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR')).forEach(([n])=>{
      if(ENT[k][n]) return;
      while(taken.has(slot)) slot++;
      if(slot<=7){ ENT[k][n]='var(--s'+slot+')'; slot++; }
    });
  });
}

let FILES = [], DATA = [];
const sel = {tratamento:new Set(),indicacao:new Set(),eficiencia:new Set(),vendedor:new Set(),produto:new Set(),modelo:new Set(),seguradora:new Set(),susep:new Set(),origem:new Set(),empresa:new Set(),pend:new Set()};
let query = '', sort = {k:'dias', dir:-1};

/* ---------- leitura da planilha ---------- */
function parseDate(v){
  if(v==null || v==='') return null;
  if(v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if(typeof v==='number'){ const d = new Date(Math.round((v-25569)*86400000)); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if(m){ let y=+m[3]; if(y<100) y+=2000; return new Date(y,+m[2]-1,+m[1]); }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return new Date(+m[1],+m[2]-1,+m[3]);
  return null;
}
function toRows(json){
  if(!json.length) return [];
  const keys = Object.keys(json[0]);
  const map = {};
  for(const f in ALIAS){ const hit = keys.find(k => ALIAS[f].includes(NORM(k))); if(hit) map[f]=hit; }
  if(!map.secundaria){const key=keys.find(k=>NORM(k).includes('produto')&&NORM(k).includes('vendasecundaria'));if(key)map.secundaria=key;}
  if(!map.pend){ const k = keys.find(k=>NORM(k).includes('pendenc')); if(k) map.pend=k; }
  if(!map.seguradora){ const k = keys.find(k=>NORM(k).startsWith('seguradora')); if(k) map.seguradora=k; }
  const missing = ['cliente','produto','envio','modelo','proposta','pend','vendedor'].filter(f=>!map[f]);
  if(missing.length){
    const names = {cliente:'Nome do Cliente',produto:'Produto - Lead',envio:'Envio da Proposta',modelo:'Modelo',proposta:'N° Proposta',pend:'Seleciona a(s) Pendência(s)',vendedor:'Vendedor'};
    throw new Error('Não encontrei estas colunas: ' + missing.map(m=>names[m]).join(', ') + '. Confira os títulos na primeira linha.');
  }
  const txt = v => (v==null ? '' : String(v)).trim();
  return json.map(r=>{
    const pend = txt(r[map.pend]).split(/[;\n|]+/).map(s=>s.trim()).filter(Boolean);
    return {
      cliente: txt(r[map.cliente]) || '—',
      etiqueta: hasTreatmentLabel(map.etiquetas?r[map.etiquetas]:'')?'EM TRATAMENTO':'',
      tratamento: hasTreatmentLabel(map.etiquetas?r[map.etiquetas]:'')?'EM TRATAMENTO':'A TRATAR',
      produto: effectiveProduct(r[map.produto],map.secundaria?r[map.secundaria]:''),
      envio: parseDate(r[map.envio]),
      modelo: txt(r[map.modelo]) || '—',
      indicacao: NORM(txt(r[map.modelo]))==='indicacao'?referralType(map.indicacao?r[map.indicacao]:''):'Não se aplica',
      eficiencia: efficiencyPriority(txt(r[map.modelo]),map.indicacao?r[map.indicacao]:'',map.susep?r[map.susep]:'')?'Impactam eficiência':'Demais pendências',
      proposta: txt(r[map.proposta]) || '—',
      pend: pend.length ? pend : ['Sem motivo informado'],
      vendedor: txt(r[map.vendedor]).split(',')[0].trim() || '—',
      seguradora: map.seguradora ? normalizeInsurer(r[map.seguradora]) : '',
      susep: map.susep ? (txt(r[map.susep]) || '—') : '',
      origem: map.susep ? origemOf(txt(r[map.susep])) : '',
      empresa: map.empresa ? txt(r[map.empresa]) : ''
    };
  }).filter(r => r.cliente!=='—' || r.proposta!=='—');
}
const today = () => { const n=new Date(); return new Date(n.getFullYear(),n.getMonth(),n.getDate()); };
const fmtDate = d => d ? String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear() : '—';
const fmtShort = d => String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
const hhmm = d => String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');

function rowsWithCompanies(file){
  const rows=toRows(file.json);
  if(file.sample)return rows.map(r=>({...r,empresa:'Exemplo'}));
  const mapped=code=>SUSEP_EMPRESA[String(code||'').trim().toUpperCase()]||'';
  const detected=[...new Set(rows.map(r=>mapped(r.susep)).filter(Boolean))];
  const owner=detected.length===1?detected[0]:'';
  return rows.map(r=>({...r,empresa:mapped(r.susep)||owner||'Não identificada'}));
}
function rebuild(){
  const t = today(); DATA = [];
  FILES.forEach(f=>{
    rowsWithCompanies(f).forEach(r=>{ r.dias = r.envio ? Math.max(0,Math.round((t-r.envio)/86400000)) : null; DATA.push(r); });
  });
  HAS.seguradora = DATA.some(r=>r.seguradora!=='');
  HAS.susep = DATA.some(r=>r.susep!==''); HAS.origem = HAS.susep;
  HAS.indicacao = DATA.some(r=>NORM(r.modelo)==='indicacao');
  buildEnt();
}
function persist(){
  try{
    const real = FILES.filter(f=>!f.sample).map(f=>({empresa:f.empresa,label:f.label,time:f.time,source:f.source||'manual',owners:f.owners||[],json:f.json.map(r=>{const o={};for(const k in r){o[k]=r[k] instanceof Date? r[k].toISOString().slice(0,10):r[k]}return o;})}));
    storage.setItem('pend-files', JSON.stringify(real));
  }catch(e){}
}
function clearFilters(){ Object.values(sel).forEach(s=>s.clear()); query=''; $('#q').value=''; }
const fileEmps = f => [...new Set(rowsWithCompanies(f).map(r=>r.empresa))];
function addFile(json, name, fallback){
  toRows(json); // valida antes de aceitar
  if(typeof goalfyConnection!=='undefined'&&goalfyConnection)disconnectGoalfy('Consulta automática desconectada pela importação manual.');
  const empresa = (fallback || name.replace(/\.[^.]+$/,'').replace(/[_]+/g,' ')).trim() || 'Empresa';
  const nf = {empresa, label:name, time:Date.now(), json, sample:false};
  const emps = fileEmps(nf);
  FILES = FILES.filter(f=>!f.sample && (emps.some(e=>e!=='Não identificada')?!fileEmps(f).some(e=>e!=='Não identificada'&&emps.includes(e)):f.label!==name));
  FILES.push(nf);
  rebuild(); persist(); clearFilters(); render();
}
function showMsg(t, err){ const m=$('#msg'); m.hidden=!t; m.className='msg'+(err?' err':''); m.textContent=t||''; }
function parseReportData(buffer){
        const wb = XLSX.read(buffer, {type:'array', cellDates:true});
        const grid = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, defval:'', raw:true});
        const known = new Set(Object.values(ALIAS).flat());
        const h = grid.findIndex(row => row.filter(c=>c!=='' && known.has(NORM(c))).length>=4);
        if(h<0) throw new Error('não achei a linha de títulos (Nome do Cliente, Produto, Envio da Proposta...).');
        let fallback = '';
        for(let i=0;i<h && !fallback;i++){ const row=grid[i]; const j=row.findIndex(c=>NORM(c)==='empresa'); if(j>=0) fallback=String(row.slice(j+1).find(c=>c!=='')||'').trim(); }
        const heads = grid[h];
        const json = grid.slice(h+1).filter(row=>row.some(c=>c!=='')).map(row=>{ const o={}; heads.forEach((k,i)=>{ if(k!=='') o[k]=row[i]; }); return o; });
        // Validate the header even when there are no pending proposals.
        toRows([Object.fromEntries(heads.filter(k=>k!=='').map(k=>[k,'']))]);
        toRows(json);
        return {json,fallback};
}
function readOne(f){
  return new Promise((res,rej)=>{
    const rd = new FileReader();
    rd.onload = e => {
      try{
        const {json,fallback}=parseReportData(e.target.result);
        addFile(json, f.name, fallback); res();
      }catch(err){ rej(new Error(f.name+': '+(err.message||'não consegui ler este arquivo.'))); }
    };
    rd.onerror = () => rej(new Error('Não consegui abrir '+f.name));
    rd.readAsArrayBuffer(f);
  });
}
async function handleFiles(list){
  const files = [...list]; if(!files.length) return;
  if(typeof XLSX==='undefined'){ showMsg('Não consegui carregar o leitor de planilhas. Verifique a conexão e recarregue a página.', true); return; }
  showMsg('');
  for(const f of files){ try{ await readOne(f); }catch(err){ showMsg(err.message, true); } }
}
$('#pick').onclick = () => $('#file').click();
$('#file').onchange = e => { handleFiles(e.target.files); e.target.value=''; };
['dragenter','dragover'].forEach(t=>document.addEventListener(t,e=>{e.preventDefault();$('#drop').classList.add('over')}));
['dragleave','drop'].forEach(t=>document.addEventListener(t,e=>{e.preventDefault();$('#drop').classList.remove('over')}));
document.addEventListener('drop', e => { if(e.dataTransfer) handleFiles(e.dataTransfer.files); });

/* ---------- filtros ---------- */
const reasonsOf = r => sel.pend.size ? r.pend.filter(p=>sel.pend.has(p)) : r.pend;
function match(r, skip){
  for(const d of DIMS){ if(d.k===skip) continue; const s=sel[d.k]; if(s.size && !s.has(r[d.k])) return false; }
  if(skip!=='empresa' && sel.empresa.size && !sel.empresa.has(r.empresa)) return false;
  if(skip!=='pend' && sel.pend.size && !r.pend.some(p=>sel.pend.has(p))) return false;
  if(query){ const q=NORM(query); if(!NORM(r.cliente+r.proposta+r.vendedor+r.etiqueta+r.produto+r.indicacao+r.eficiencia+r.seguradora+r.susep+r.origem+r.empresa).includes(q)) return false; }
  return true;
}
const uniq = (rows,k) => [...new Set(rows.map(r=>r[k]))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
function toggle(set, v){ set.has(v)?set.delete(v):set.add(v); render(); }
const empresas = () => [...new Set(DATA.map(r=>r.empresa))];

function renderReports(){
  const el = $('#reports'); el.innerHTML='';
  const real = FILES.filter(f=>!f.sample);
  if(!real.length){ el.innerHTML = '<span style="color:var(--ink2);font-size:13px">Mostrando <b>dados de exemplo</b> (sua planilha de teste). Carregue os relatórios reais para ver os números da operação.</span>'; return; }
  const h = document.createElement('h2'); h.textContent='Relatórios carregados'; el.appendChild(h);
  real.forEach(f=>{
    const row = document.createElement('div'); row.className='rep';
    const emps = fileEmps(f), n = FILES.indexOf(f);
    const nm = document.createElement('b'); nm.textContent=emps.join(' · ')||'Sem propostas';nm.style.fontSize='14px';
    const info = document.createElement('span'); info.textContent = toRows(f.json).length+' propostas · '+(f.label||'arquivo')+' · '+hhmm(new Date(f.time));
    const rm = document.createElement('button'); rm.type='button'; rm.className='btn small'; rm.textContent='Remover';
    rm.onclick = () => { if(f.source==='goalfy'&&typeof disconnectGoalfy==='function')disconnectGoalfy(); FILES.splice(n,1); if(!FILES.length) FILES=[{empresa:'Exemplo',time:Date.now(),json:SAMPLE,sample:true}]; sel.empresa.clear(); rebuild(); persist(); render(); };
    row.append(nm, info, rm); el.appendChild(row);
  });
}
function renderTabs(){
  const em = empresas().sort((a,b)=>a.localeCompare(b,'pt-BR')), el = $('#tabs');
  el.hidden = false; el.innerHTML='';
  const mk = (label, on, fn) => { const b=document.createElement('button'); b.type='button'; b.className='tab'; b.textContent=label; b.setAttribute('aria-pressed', on); b.onclick=fn; el.appendChild(b); };
  if(em.length>1)mk('Geral', sel.empresa.size===0, ()=>{sel.empresa.clear();render()});
  em.forEach(e=>mk(e, (sel.empresa.size===1 && sel.empresa.has(e))||(em.length===1&&!sel.empresa.size), ()=>{sel.empresa.clear();sel.empresa.add(e);render()}));
}
function renderFilters(){
  const el = $('#filters'); el.innerHTML='';
  DIMS.filter(d=>!d.optional || HAS[d.k]).forEach(d=>{
    const row = document.createElement('div'); row.className='frow';
    const lab = document.createElement('label'); lab.textContent=d.label.toLocaleUpperCase('pt-BR'); row.appendChild(lab);
    const chips = document.createElement('div'); chips.className='chips'; chips.setAttribute('role','group'); chips.setAttribute('aria-label',d.label);
    const all = document.createElement('button'); all.type='button'; all.className='chip'; all.textContent='TODOS'; all.setAttribute('aria-pressed', sel[d.k].size===0);
    all.onclick=()=>{sel[d.k].clear();render()}; chips.appendChild(all);
    const values=d.k==='eficiencia'?['Demais pendências','Impactam eficiência']:d.k==='tratamento'?['A TRATAR','EM TRATAMENTO']:uniq(DATA.filter(r=>!sel.empresa.size || sel.empresa.has(r.empresa)),d.k);
    values.forEach(v=>{
      const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=String(v).toLocaleUpperCase('pt-BR'); b.setAttribute('aria-pressed', sel[d.k].has(v));
      b.onclick=()=>toggle(sel[d.k],v); chips.appendChild(b);
    });
    row.appendChild(chips); el.appendChild(row);
  });
  const tools = document.createElement('div'); tools.className='ftools';
  const c = document.createElement('span'); c.className='count'; c.id='fcount'; tools.appendChild(c);
  const clr = document.createElement('button'); clr.type='button'; clr.className='btn small'; clr.textContent='LIMPAR FILTROS';
  clr.onclick=()=>{ const e=new Set(sel.empresa); clearFilters(); e.forEach(x=>sel.empresa.add(x)); render(); }; tools.appendChild(clr);
  el.appendChild(tools);
}

/* ---------- tooltip ---------- */
const tip = $('#tip');
function bindTip(el, html){
  const move = e => { tip.style.left = Math.min(e.clientX+14, innerWidth-270)+'px'; tip.style.top = (e.clientY+14)+'px'; };
  el.addEventListener('mouseenter', e=>{ tip.innerHTML=html; tip.style.display='block'; move(e); });
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', ()=>{ tip.style.display='none'; });
}

/* ---------- gráficos ---------- */
function panel(title, sub){
  const box = document.createElement('section'); box.className='panel ch'; box.dataset.chartId=NORM(title);
  box.innerHTML = '<h2>'+esc(title)+'</h2>' + (sub?'<p class="sub" style="margin-top:4px">'+esc(sub)+'</p>':'<div style="height:8px"></div>');
  return box;
}
function legendRow(items){
  const l = document.createElement('div'); l.className='clegend';
  items.forEach(it=>{ const s=document.createElement('span'); s.innerHTML='<i style="background:'+it[1]+'"></i>'+esc(it[0]); l.appendChild(s); });
  return l;
}
const SVGNS = 'http://www.w3.org/2000/svg';
/* rosca: items [{name,value,color,off,onclick,pressed}] */
function donut(title, sub, items, unit){
  const box = panel(title, sub);
  const live = items.filter(i=>!i.off && i.value>0);
  const total = live.reduce((a,b)=>a+b.value,0);
  if(!total){ box.insertAdjacentHTML('beforeend','<div class="empty">Nenhuma proposta com esses filtros.</div>'); return box; }
  const wrap = document.createElement('div'); wrap.className='donut';
  const R=56, C=2*Math.PI*R;
  const svg = document.createElementNS(SVGNS,'svg'); svg.setAttribute('viewBox','0 0 168 168'); svg.setAttribute('role','img');
  svg.setAttribute('aria-label', title+': '+live.map(i=>i.name+' '+i.value).join(', '));
  const bg = document.createElementNS(SVGNS,'circle'); bg.setAttribute('cx',84);bg.setAttribute('cy',84);bg.setAttribute('r',R);bg.setAttribute('fill','none');bg.setAttribute('stroke','var(--grid)');bg.setAttribute('stroke-width',26);svg.appendChild(bg);
  let acc = 0;
  live.forEach(i=>{
    const len = i.value/total*C, gap = live.length>1 ? 2 : 0;
    const c = document.createElementNS(SVGNS,'circle');
    c.setAttribute('cx',84);c.setAttribute('cy',84);c.setAttribute('r',R);c.setAttribute('fill','none');
    c.setAttribute('stroke', i.color); c.setAttribute('stroke-width',26);
    c.setAttribute('stroke-dasharray', Math.max(0,len-gap)+' '+(C-Math.max(0,len-gap)));
    c.setAttribute('stroke-dashoffset', -acc); c.setAttribute('transform','rotate(-90 84 84)');
    bindTip(c, '<b>'+esc(i.name)+'</b><br>'+i.value+' ('+Math.round(i.value/total*100)+'%)');
    svg.appendChild(c); acc += len;
  });
  const t1 = document.createElementNS(SVGNS,'text'); t1.setAttribute('x',84);t1.setAttribute('y',86);t1.setAttribute('text-anchor','middle');t1.setAttribute('font-size',28);t1.setAttribute('font-weight',700);t1.setAttribute('fill','var(--ink)');t1.textContent=total; svg.appendChild(t1);
  const t2 = document.createElementNS(SVGNS,'text'); t2.setAttribute('x',84);t2.setAttribute('y',104);t2.setAttribute('text-anchor','middle');t2.setAttribute('font-size',11);t2.setAttribute('fill','var(--ink2)');t2.textContent=unit||'propostas'; svg.appendChild(t2);
  wrap.appendChild(svg);
  const dl = document.createElement('div'); dl.className='dl';
  items.forEach(i=>{
    const r = document.createElement(i.onclick?'button':'div'); r.className='dr'+(i.off?' off':'');
    if(i.onclick){ r.type='button'; r.onclick=i.onclick; r.setAttribute('aria-pressed', !!i.pressed); }
    r.innerHTML = '<i style="background:'+i.color+'"></i><span class="nm" title="'+esc(i.name)+'">'+esc(i.name)+'</span><b>'+i.value+'</b><em>'+(i.off?'':Math.round(i.value/total*100)+'%')+'</em>';
    dl.appendChild(r);
  });
  wrap.appendChild(dl); box.appendChild(wrap);
  return box;
}
/* itens de uma dimensão, respeitando os outros filtros */
function dimItems(dim, ownOnly=false){
  const base = DATA.filter(r=>match(r,dim)&&(dim!=='indicacao'||NORM(r.modelo)==='indicacao')&&(!(ownOnly||dim==='eficiencia'||dim==='indicacao')||!isThirdParty(r.susep))), c = {};
  if(dim==='pend') base.forEach(r=>r.pend.forEach(p=>c[p]=(c[p]||0)+1));
  else base.forEach(r=>c[r[dim]]=(c[r[dim]]||0)+1);
  const active = sel[dim].size>0;
  let items = Object.entries(c).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR')).map(([name,value])=>({
    name, value, color: dim==='pend' ? colorOf(name) : (ENT[dim][name]||'var(--sx)'),
    off: active && !sel[dim].has(name), pressed: sel[dim].has(name), onclick: ()=>toggle(sel[dim],name)
  }));
  if(dim!=='pend' && dim!=='indicacao' && dim!=='eficiencia'){
    const small = items.filter(i=>!ENT[dim][i.name]);
    if(small.length>1){
      const rest = small.reduce((a,b)=>a+b.value,0);
      items = items.filter(i=>ENT[dim][i.name]); items.push({name:'Outros', value:rest, color:'var(--sx)'});
    }
  }
  return items;
}

function stacked(title, sub, key, rows, o){
  o = o || {};
  const segs = o.segs || reasonsOf, colorFn = o.color || colorOf, ord = o.order || (n=>KNOWN.indexOf(n));
  const box = panel(title, sub);
  const groups = {}, present = new Set();
  rows.forEach(r=>{ const g = groups[r[key]] ||= {total:0, by:{}}; g.total++; segs(r).forEach(p=>{ g.by[p]=(g.by[p]||0)+1; present.add(p); }); });
  const names = Object.keys(groups).sort((a,b)=>groups[b].total-groups[a].total || a.localeCompare(b,'pt-BR'));
  if(!names.length){ box.insertAdjacentHTML('beforeend','<div class="empty">Nenhuma proposta com esses filtros.</div>'); return box; }
  const max = Math.max(...names.map(n=>Object.values(groups[n].by).reduce((a,b)=>a+b,0)));
  const list = document.createElement('div'); list.className='rows';
  names.forEach(n=>{
    const g = groups[n], sum = Object.values(g.by).reduce((a,b)=>a+b,0);
    const row = document.createElement('div'); row.className='br';
    const nb = document.createElement('button'); nb.type='button'; nb.className='n'; nb.textContent=n; nb.title='Filtrar por '+n;
    nb.setAttribute('aria-pressed', sel[key].has(n)); nb.onclick=()=>toggle(sel[key],n);
    const tr = document.createElement('div'); tr.className='track'; tr.style.width = (sum/max*100)+'%';
    Object.keys(g.by).sort((a,b)=>ord(a)-ord(b)).forEach(p=>{
      const s = document.createElement('div'); s.className='seg'; s.style.flex = g.by[p]+' 1 0'; s.style.background = colorFn(p);
      bindTip(s, '<b>'+esc(n)+'</b><br>'+esc(p)+': '+g.by[p]);
      tr.appendChild(s);
    });
    const wt = document.createElement('div'); wt.style.minWidth='0'; wt.appendChild(tr);
    const t = document.createElement('div'); t.className='t'; t.textContent=g.total;
    row.append(nb, wt, t); list.appendChild(row);
  });
  box.appendChild(list);
  box.appendChild(legendRow([...present].sort((a,b)=>ord(a)-ord(b)).map(p=>[p,colorFn(p)])));
  return box;
}
function aging(rows){
  const box = panel('Tempo parado desde o envio','Quantas propostas estão em cada faixa de dias desde o envio.');
  const B = AGING_BANDS;
  const c = agingCounts(rows);
  const max = Math.max(1,...c);
  const cols = document.createElement('div'); cols.className='cols';
  const lab = document.createElement('div'); lab.className='collab';
  B.forEach((b,i)=>{
    const col = document.createElement('div'); col.className='col';
    col.innerHTML = '<b>'+c[i]+'</b><div class="bar'+(i===3?' late':'')+'" style="height:'+(c[i]/max*115)+'px"></div>';
    bindTip(col, '<b>'+b[0]+'</b><br>'+c[i]+' proposta(s)');
    cols.appendChild(col); lab.insertAdjacentHTML('beforeend','<span>'+b[0]+'</span>');
  });
  box.append(cols, lab, legendRow([['Até 9 dias','var(--s1)'],['10+ dias (atenção)','var(--crit)']]));
  return box;
}
function perDay(rows){
  const box = panel('Envios por dia','Propostas pendentes agrupadas pela data de envio.');
  const dated = rows.filter(r=>r.envio);
  if(!dated.length){ box.insertAdjacentHTML('beforeend','<div class="empty">Sem datas de envio para mostrar.</div>'); return box; }
  const cnt = {}; dated.forEach(r=>{ const k=r.envio.getTime(); cnt[k]=(cnt[k]||0)+1; });
  let lo = Math.min(...dated.map(r=>r.envio.getTime())), hi = Math.max(...dated.map(r=>r.envio.getTime()));
  const days = []; for(let t=new Date(lo); t.getTime()<=hi; t=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1)) days.push(new Date(t));
  const shown = days.slice(-31), max = Math.max(1,...shown.map(d=>cnt[d.getTime()]||0));
  const sc = document.createElement('div'); sc.className='dayscroll';
  const cols = document.createElement('div'); cols.className='days'; cols.style.minWidth = shown.length*26+'px';
  const lab = document.createElement('div'); lab.className='daylab'; lab.style.minWidth = shown.length*26+'px';
  const step = Math.ceil(shown.length/12);
  shown.forEach((d,i)=>{
    const v = cnt[d.getTime()]||0, col = document.createElement('div'); col.className='col';
    col.innerHTML = '<b>'+(v||'')+'</b><div class="bar" style="height:'+(v/max*105)+'px"></div>';
    bindTip(col, '<b>'+fmtDate(d)+'</b><br>'+v+' proposta(s)');
    cols.appendChild(col);
    lab.insertAdjacentHTML('beforeend','<span>'+(i%step===0?fmtShort(d):'')+'</span>');
  });
  sc.append(cols, lab); box.appendChild(sc);
  box.appendChild(legendRow([['Propostas enviadas no dia','var(--s1)']]));
  return box;
}

/* ---------- tabela ---------- */
let tableView={cols:[],rows:[]}, columnOrder=[];
try{columnOrder=JSON.parse(storage.getItem('pend-column-order')||'[]');if(!Array.isArray(columnOrder))columnOrder=[];}catch(e){}
let draggingColumn=null, suppressColumnSort=false;
function moveColumn(from,to){
  const keys=tableView.cols.map(c=>c[0]);
  const next=moveKey(keys,from,to);
  if(next.join('|')===keys.join('|'))return;
  const nextOrder=[...next,...columnOrder.filter(k=>!keys.includes(k))];
  try{storage.setItem('pend-column-order',JSON.stringify(nextOrder));columnOrder=nextOrder;$('#column-status').textContent='Ordem das colunas salva neste navegador.';}
  catch(e){columnOrder=nextOrder;$('#column-status').textContent='Ordem aplicada nesta sessão; o navegador não permitiu salvar.';}
  renderTable(tableView.rows);
}
function renderTable(rows){
  const multi = empresas().length>1;
  const cols = [['cliente','Cliente'],['produto','Produto'],['modelo','Modelo'],['proposta','Nº Proposta','num'],['envio','Envio'],['dias','Dias parado','num'],['pend','Pendência']];
  if(HAS.indicacao) cols.splice(3,0,['indicacao','Modelo de indicação']);
  cols.push(['eficiencia','Prioridade de eficiência']);
  if(HAS.seguradora) cols.push(['seguradora','Seguradora']);
  if(HAS.susep){ cols.push(['susep','SUSEP']); cols.push(['origem','Origem da venda']); }
  cols.push(['vendedor','Vendedor']);
  if(multi) cols.push(['empresa','Empresa']);
  cols.push(['etiqueta','Etiquetas']);
  const order=orderedKeys(columnOrder,cols.map(c=>c[0]));cols.sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0]));
  const val = (r,k) => k==='pend' ? r.pend.join(', ') : k==='envio' ? (r.envio?r.envio.getTime():0) : (r[k]==null?-1:r[k]);
  const sorted = [...rows].sort((a,b)=>{
    const x=val(a,sort.k), y=val(b,sort.k);
    const c = (typeof x==='number'&&typeof y==='number') ? x-y : String(x).localeCompare(String(y),'pt-BR',{numeric:true});
    return c*sort.dir;
  });
  tableView={cols,rows:sorted};
  const t = $('#tbl');
  t.innerHTML = '<thead><tr>'+cols.map(c=>'<th class="'+(c[2]||'')+'" data-k="'+c[0]+'"><button type="button" class="column-grip" draggable="true" aria-label="Mover coluna '+esc(c[1])+'" title="Arrastar ou Alt + setas para mover">⠿</button><button type="button" class="column-sort">'+c[1]+(sort.k===c[0]?(sort.dir>0?' ▲':' ▼'):'')+'</button></th>').join('')+'</tr></thead>';
  const tb = document.createElement('tbody');
  sorted.forEach(r=>{
    const d = r.dias, cls = d==null?'ok':d>=AGING_LIMIT?'late':d>=8?'mid':'ok', mark = d==null?'':d>=AGING_LIMIT?'▲ ':d>=8?'● ':'';
    const tr = document.createElement('tr');
    tr.innerHTML = cols.map(c=>{
      switch(c[0]){
        case 'proposta': return '<td class="num">'+esc(r.proposta)+'</td>';
        case 'envio': return '<td>'+fmtDate(r.envio)+'</td>';
        case 'dias': return '<td class="num"><span class="pill '+cls+'">'+mark+(d==null?'—':d+' d')+'</span></td>';
        case 'etiqueta': return '<td>'+(r.etiqueta?'<span class="treatment-tag">EM TRATAMENTO</span>':'')+'</td>';
        case 'pend': return '<td>'+r.pend.map(p=>'<span class="dot"><i style="background:'+colorOf(p)+'"></i>'+esc(p)+'</span>').join('')+'</td>';
        default: return '<td>'+esc(r[c[0]])+'</td>';
      }
    }).join('');
    tb.appendChild(tr);
  });
  if(!sorted.length) tb.innerHTML='<tr><td colspan="'+cols.length+'" class="empty">Nenhuma proposta com esses filtros.</td></tr>';
  t.appendChild(tb);
  t.querySelectorAll('th').forEach(th=>{
    const key=th.dataset.k, grip=th.querySelector('.column-grip');
    th.querySelector('.column-sort').onclick=()=>{if(suppressColumnSort)return;sort={k:key,dir:sort.k===key?-sort.dir:(key==='dias'?-1:1)};renderTable(tableView.rows);};
    grip.ondragstart=e=>{draggingColumn=key;suppressColumnSort=true;e.dataTransfer.setData('text/plain',key);e.dataTransfer.effectAllowed='move';};
    grip.ondragend=()=>{draggingColumn=null;setTimeout(()=>{suppressColumnSort=false;},0);};
    grip.onkeydown=e=>{if(e.altKey&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const keys=tableView.cols.map(c=>c[0]),index=keys.indexOf(key)+(e.key==='ArrowLeft'?-1:1);if(keys[index]){moveColumn(key,keys[index]);$('#tbl').querySelector('th[data-k="'+key+'"] .column-grip').focus();}}};
    th.ondragover=e=>{if(draggingColumn){e.preventDefault();th.classList.add('drop-target');}};
    th.ondragleave=()=>th.classList.remove('drop-target');
    th.ondrop=e=>{if(!draggingColumn)return;e.preventDefault();const from=draggingColumn;draggingColumn=null;moveColumn(from,key);setTimeout(()=>{suppressColumnSort=false;},0);};
  });
}
// Exporta exatamente as colunas, linhas e ordenação da tabela atual.
function generalWorkbook(){
  const {rows}=tableView;
  const cols=[...tableView.cols];
  if(!cols.some(c=>c[0]==='empresa'))cols.push(['empresa','Empresa']);
  const data = [cols.map(c=>c[1]), ...rows.map(r=>cols.map(([k])=>k==='envio'?(r.envio||null):k==='pend'?r.pend.join(', '):(r[k]==null?null:r[k])))];
  const sheet = XLSX.utils.aoa_to_sheet(data, {cellDates:true, dateNF:'dd/mm/yyyy'});
  sheet['!cols'] = cols.map(([k])=>({wch:({empresa:20,cliente:35,produto:22,modelo:20,proposta:20,envio:14,dias:14,pend:55,vendedor:28,seguradora:24,susep:20,origem:22,indicacao:30,eficiencia:28,etiqueta:22})[k]||20}));
  sheet['!autofilter'] = {ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:data.length-1,c:cols.length-1}})};
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Pendências');
  return book;
}
$('#export').onclick = () => {
  if(typeof XLSX==='undefined'){
    showMsg('Não consegui carregar o exportador de planilhas. Verifique a conexão e recarregue a página.', true);
    return;
  }
  try{
    const d=today();
    const name=(tableView.rows.length===DATA.length?'Pendencias-geral-':'Pendencias-filtradas-')+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'.xlsx';
    XLSX.writeFile(generalWorkbook(), name, {bookType:'xlsx', compression:true});
    showMsg('');
  }catch(err){ showMsg('Não consegui exportar a tabela: '+(err.message||err), true); }
};
$('#q').oninput = e => { query=e.target.value; render(true); };

/* ---------- render geral ---------- */
function render(keepFilters){
  const rows = DATA.filter(r=>match(r));
  const real = FILES.filter(f=>!f.sample);
  $('#src').innerHTML = real.length
    ? '<b>'+DATA.length+' propostas</b> de '+real.length+' relatório'+(real.length>1?'s':'')+' · última atualização em '+fmtDate(new Date(Math.max(...real.map(f=>f.time))))+' às '+hhmm(new Date(Math.max(...real.map(f=>f.time))))
    : 'Dados de exemplo';
  renderReports(); renderTabs();
  if(!keepFilters) renderFilters();
  $('#fcount').textContent = rows.length+' DE '+DATA.length+' PROPOSTAS';

  const reasonCount = {};
  rows.forEach(r=>reasonsOf(r).forEach(p=>reasonCount[p]=(reasonCount[p]||0)+1));
  const top = Object.entries(reasonCount).sort((a,b)=>b[1]-a[1])[0];
  const ds = rows.filter(r=>r.dias!=null).map(r=>r.dias);
  const avg = ds.length ? Math.round(ds.reduce((a,b)=>a+b,0)/ds.length) : null;
  const old = rows.filter(r=>r.dias!=null).sort((a,b)=>b.dias-a.dias)[0];
  const late = rows.filter(r=>r.dias!=null && r.dias>=AGING_LIMIT).length;
  const cnt = k => Object.entries(rows.reduce((o,r)=>(o[r[k]]=(o[r[k]]||0)+1,o),{})).sort((a,b)=>b[1]-a[1])[0];
  const topV = cnt('vendedor');
  const priority=rows.filter(r=>r.eficiencia==='Impactam eficiência').length;
  const terc = rows.filter(r=>r.origem==='Terceiros').length;
  $('#kpis').innerHTML =
    '<div class="kpi"><div class="l">Propostas pendentes</div><div class="v">'+rows.length+'</div><div class="s">'+(rows.length===DATA.length?'total do relatório':'com os filtros aplicados')+'</div></div>'+
    '<div class="kpi"><div class="l">Motivo mais comum</div><div class="v t">'+(top?esc(top[0]):'—')+'</div><div class="s">'+(top?top[1]+' ocorrência(s)':'')+'</div></div>'+
    '<div class="kpi"><div class="l">Média de dias parado</div><div class="v">'+(avg==null?'—':avg)+'</div><div class="s">'+(old?'mais antiga: '+old.dias+' dias (proposta '+esc(old.proposta)+') · Produto: '+esc(old.produto):'')+'</div></div>'+
    '<div class="kpi"><div class="l">Prioridade de eficiência</div><div class="v">'+priority+'</div><div class="s">LEAD ou indicação de criação aleatória, com SUSEP CMHE2J ou CMN32J.</div></div>'+
    (HAS.susep ? '<div class="kpi"><div class="l">Vendas de terceiros</div><div class="v">'+terc+'</div><div class="s">'+(rows.length?Math.round(terc/rows.length*100):0)+'% das pendências, fechadas em outra corretora</div></div>' : '')+
    '<div class="kpi"><div class="l">Com 10 dias ou mais</div><div class="v" style="color:'+(late?'var(--crit)':'inherit')+'">'+late+'</div><div class="s">'+(topV?'mais pendências: '+esc(topV[0])+' ('+topV[1]+')':'')+'</div></div>';

  const ch = $('#charts'); ch.innerHTML='';
  const main = document.createDocumentFragment();
  const group = (...charts) => main.append(...charts);
  group(donut('Propostas por produto','Participação de cada produto. Clique para filtrar.', dimItems('produto')),
    stacked('Produtos por pendência','Propostas de cada produto, divididas pelo motivo.','produto',rows));
  group(donut('Propostas por vendedor','Participação de cada vendedor. Clique para filtrar.', dimItems('vendedor')),
    stacked('Vendedores por pendência','Propostas de cada vendedor, divididas pelo motivo.','vendedor',rows));
  group(donut('Pendências por motivo','Participação de cada motivo. Clique para filtrar.', dimItems('pend'), 'ocorrências'));
  ch.appendChild(main);
  if(HAS.indicacao) ch.appendChild(donut('Modelos de indicação','Tipos de indicação das vendas próprias. Terceiros excluídos. Clique para filtrar.',dimItems('indicacao')));
  ch.appendChild(donut('Prioridade de eficiência','Impactam: LEAD ou indicação de criação aleatória com SUSEP CMHE2J ou CMN32J. Terceiros excluídos deste gráfico. Clique para filtrar.',dimItems('eficiencia')));
  if(HAS.susep) ch.appendChild(donut('Origem da venda','Venda própria de cada empresa (pelo SUSEP) e vendas de terceiros, fechadas em outra corretora. Clique para filtrar.', dimItems('origem')));
  if(HAS.seguradora) ch.appendChild(donut('Propostas por seguradora','Participação de cada seguradora. Clique para filtrar.', dimItems('seguradora')));
  ch.appendChild(donut('Propostas por modelo','Modelos das vendas próprias. Terceiros excluídos. Clique para filtrar.', dimItems('modelo',true)));
  if(empresas().length>1) ch.appendChild(donut('Propostas por empresa','Quanto cada empresa representa nas pendências.', dimItems('empresa')));
  if(HAS.susep) ch.appendChild(stacked('Empresas: própria x terceiros','Pendências de cada empresa, divididas pela origem da venda.','empresa',rows,{segs:r=>[r.origem], color:n=>ENT.origem[n]||'var(--sx)', order:n=>['Empresa A','Empresa B','Terceiros'].indexOf(n)===-1?9:['Empresa A','Empresa B','Terceiros'].indexOf(n)}));
  if(empresas().length>1) ch.appendChild(stacked('Empresas por pendência','Pendências de cada empresa, divididas pelo motivo.','empresa',rows));
  if(HAS.seguradora) ch.appendChild(stacked('Seguradoras por pendência','Propostas de cada seguradora, divididas pelo motivo.','seguradora',rows));
  ch.appendChild(stacked('Modelos por pendência','Propostas de cada modelo, divididas pelo motivo.','modelo',rows));
  ch.appendChild(aging(rows));
  ch.appendChild(perDay(rows));
  applyChartLayout();
  $('#tcount').textContent = '('+rows.length+')';
  renderTable(rows);
}

let editingLayout=false, draggingChart=null, savedLayout=cleanLayout(null), draftLayout;
try{savedLayout=cleanLayout(JSON.parse(storage.getItem('pend-sections-layout')||storage.getItem('pend-chart-layout')||'null'));if(!savedLayout.order.length){savedLayout=cleanLayout({...savedLayout,order:JSON.parse(storage.getItem('pend-chart-order')||'[]')});}}catch(e){savedLayout=cleanLayout(null);}
draftLayout=cleanLayout(savedLayout);
let collapsedSections=new Set();
try{const value=JSON.parse(storage.getItem('pend-collapsed-sections')||'[]');if(Array.isArray(value))collapsedSections=new Set(value.filter(id=>DEFAULT_SECTIONS.some(s=>s.id===id)));}catch(e){}
function applySectionCollapse(wrapper){
  const id=wrapper.dataset.sectionId,section=activeLayout().sections.find(s=>s.id===id),collapsed=!editingLayout&&collapsedSections.has(id);
  const button=wrapper.querySelector('.section-toggle');button.disabled=editingLayout;button.setAttribute('aria-expanded',!collapsed);
  button.setAttribute('aria-label',(collapsed?'Expandir seção ':'Recolher seção ')+section.name);
  wrapper.querySelector('.section-body').hidden=collapsed;
}
function setSectionCollapsed(id,collapsed){
  if(!DEFAULT_SECTIONS.some(s=>s.id===id))return;
  if(collapsed)collapsedSections.add(id);else collapsedSections.delete(id);
  try{storage.setItem('pend-collapsed-sections',JSON.stringify([...collapsedSections]));}catch(e){$('#layout-status').textContent='Visualização aplicada nesta sessão; não foi possível salvar as seções recolhidas.';}
  const wrapper=document.getElementById('section-'+id);if(wrapper)applySectionCollapse(wrapper);
  if(collapsed&&$('#section-nav').value==='section-'+id)$('#section-nav').value='';
}
const chartCards=()=>[...$('#charts').querySelectorAll('.ch')];
const activeLayout=()=>editingLayout?draftLayout:savedLayout;
const chartSection=(id,layout=activeLayout())=>layout.placements[id]||defaultSection(id);
function updateSectionNavigation(){
  const nav=$('#section-nav'),previous=nav.value;nav.innerHTML='';
  const prompt=document.createElement('option');prompt.value='';prompt.textContent='Selecione uma seção';nav.appendChild(prompt);
  [...$('#charts').children].filter(section=>!section.hidden).forEach(section=>{
    const item=activeLayout().sections.find(s=>'section-'+s.id===section.id),option=document.createElement('option');
    option.value=section.id;option.textContent=item.name;nav.appendChild(option);
  });
  nav.value=[...nav.options].some(o=>o.value===previous)?previous:'';
}
$('#section-nav').onchange=e=>{const wrapper=document.getElementById(e.target.value);if(!wrapper)return;setSectionCollapsed(wrapper.dataset.sectionId,false);wrapper.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});};
function moveChart(id,targetId){
  if(!editingLayout||id===targetId)return;
  const cards=chartCards(),keys=cards.map(c=>c.dataset.chartId);
  if(!keys.includes(id)||!keys.includes(targetId))return;
  draftLayout.order=moveKey(orderedKeys(draftLayout.order,keys),id,targetId).concat(draftLayout.order.filter(k=>!keys.includes(k)));
  draftLayout.placements[id]=chartSection(targetId,draftLayout);draggingChart=null;applyChartLayout();
  $('#layout-status').textContent='Organização alterada. Salve para manter as posições e seções.';
}
function assignChartSection(id,sectionId){
  if(!editingLayout||!draftLayout.sections.some(s=>s.id===sectionId))return;
  draftLayout.placements[id]=sectionId;
  const keys=chartCards().map(c=>c.dataset.chartId);
  draftLayout.order=orderedKeys(draftLayout.order,keys).filter(k=>k!==id).concat(id,draftLayout.order.filter(k=>!keys.includes(k)));
  draggingChart=null;applyChartLayout();$('#layout-status').textContent='Gráfico movido de seção. Salve a organização para manter a alteração.';
}
function applyChartLayout(){
  const root=$('#charts'),cards=chartCards(),layout=activeLayout();
  const defaults=['propostasporproduto','pendenciaspormotivo','propostasporvendedor','propostaspormodelo','prioridadedeeficiencia','origemdavenda','modelosdeindicacao'];
  const rank=id=>{const n=layout.order.indexOf(id),fallback=defaults.indexOf(id);return n<0?layout.order.length+(fallback<0?defaults.length:fallback):n;};
  cards.sort((a,b)=>rank(a.dataset.chartId)-rank(b.dataset.chartId));
  // Detach cards before clearing section wrappers; do not recreate chart/filter state.
  cards.forEach(card=>card.remove());root.innerHTML='';
  layout.sections.forEach(section=>{
    const wrapper=document.createElement('section');wrapper.id='section-'+section.id;wrapper.className='chart-section'+(editingLayout?' editing':'');wrapper.dataset.sectionId=section.id;
    const heading=document.createElement('div');heading.className='section-heading';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='section-toggle';toggle.setAttribute('aria-controls','section-content-'+section.id);toggle.innerHTML='<span class="section-chevron" aria-hidden="true">›</span>';toggle.onclick=()=>setSectionCollapsed(section.id,!collapsedSections.has(section.id));heading.appendChild(toggle);
    const title=document.createElement('h2');title.textContent=section.name;heading.appendChild(title);
    if(editingLayout){
      const name=document.createElement('input');name.className='section-name';name.value=section.name;name.maxLength=60;name.setAttribute('aria-label','Nome da seção '+section.name);
      name.oninput=()=>{section.name=name.value.trim().slice(0,60)||DEFAULT_SECTIONS.find(s=>s.id===section.id).name;title.textContent=section.name;applySectionCollapse(wrapper);updateSectionNavigation();};
      heading.appendChild(name);
    }
    const content=document.createElement('div');content.className='section-body';content.id='section-content-'+section.id;
    const description=document.createElement('p');description.className='section-description';description.textContent=section.description;content.appendChild(description);
    const grid=document.createElement('div');grid.className='grid2';grid.dataset.sectionId=section.id;
    const assigned=cards.filter(c=>chartSection(c.dataset.chartId,layout)===section.id),visible=assigned.filter(c=>!layout.hidden.includes(c.dataset.chartId));
    wrapper.hidden=!editingLayout&&!visible.length;
    grid.ondragover=e=>{if(editingLayout&&draggingChart)e.preventDefault();};
    grid.ondrop=e=>{if(!editingLayout||!draggingChart)return;e.preventDefault();assignChartSection(draggingChart,section.id);};
    assigned.forEach(card=>{
      const id=card.dataset.chartId;card.hidden=layout.hidden.includes(id);card.querySelector('.chart-tools')?.remove();card.classList.remove('moving','drop-target');
      card.ondragover=e=>{if(editingLayout&&draggingChart){e.preventDefault();e.stopPropagation();card.classList.add('drop-target');}};
      card.ondragleave=()=>card.classList.remove('drop-target');
      card.ondrop=e=>{if(!editingLayout||!draggingChart)return;e.preventDefault();e.stopPropagation();moveChart(draggingChart,id);};
      if(editingLayout){
        const tools=document.createElement('div');tools.className='chart-tools';
        const handle=document.createElement('button');handle.type='button';handle.className='btn small drag-handle';handle.textContent='⠿ Arrastar';handle.draggable=true;handle.setAttribute('aria-label','Arrastar '+card.querySelector('h2').textContent);
        handle.ondragstart=e=>{draggingChart=id;e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';card.classList.add('moving');};
        handle.ondragend=()=>{draggingChart=null;chartCards().forEach(c=>c.classList.remove('moving','drop-target'));};tools.appendChild(handle);
        const index=visible.indexOf(card);
        [['← Anterior',-1],['Próximo →',1]].forEach(([label,delta])=>{const button=document.createElement('button');button.type='button';button.className='btn small';button.textContent=label;button.disabled=!visible[index+delta];button.onclick=()=>{moveChart(id,visible[index+delta].dataset.chartId);chartCards().find(c=>c.dataset.chartId===id).querySelector('.drag-handle').focus();};tools.appendChild(button);});
        const select=document.createElement('select');select.className='btn small';select.setAttribute('aria-label','Seção de '+card.querySelector('h2').textContent);
        layout.sections.forEach(s=>{const option=document.createElement('option');option.value=s.id;option.textContent=s.name;select.appendChild(option);});select.value=section.id;select.onchange=()=>assignChartSection(id,select.value);tools.appendChild(select);
        const remove=document.createElement('button');remove.type='button';remove.className='btn small';remove.textContent='Excluir gráfico';remove.onclick=()=>{draftLayout.hidden=[...new Set([...draftLayout.hidden,id])];applyChartLayout();};tools.appendChild(remove);card.prepend(tools);
      }
      grid.appendChild(card);
    });
    content.appendChild(grid);wrapper.append(heading,content);root.appendChild(wrapper);applySectionCollapse(wrapper);
  });
  const restore=$('#hidden-charts');restore.innerHTML='';restore.hidden=!editingLayout||!layout.hidden.length;
  if(editingLayout){layout.hidden.forEach(id=>{const card=cards.find(c=>c.dataset.chartId===id);if(!card)return;const button=document.createElement('button');button.type='button';button.className='btn small';button.textContent='Restaurar: '+card.querySelector('h2').textContent;button.onclick=()=>{draftLayout.hidden=draftLayout.hidden.filter(k=>k!==id);applyChartLayout();};restore.appendChild(button);});}
  $('#layout-edit').hidden=editingLayout;$('#layout-save').hidden=!editingLayout;$('#layout-cancel').hidden=!editingLayout;updateSectionNavigation();
}
$('#layout-edit').onclick=()=>{editingLayout=true;draftLayout=cleanLayout(savedLayout);applyChartLayout();$('#layout-status').textContent='Arraste os gráficos, escolha a seção, renomeie ou exclua. Depois, salve a organização.';};
$('#layout-save').onclick=()=>{
  const ids=chartCards().map(c=>c.dataset.chartId);draftLayout.order=[...ids,...draftLayout.order.filter(k=>!ids.includes(k))];
  try{storage.setItem('pend-sections-layout',JSON.stringify(draftLayout));savedLayout=cleanLayout(draftLayout);editingLayout=false;applyChartLayout();$('#layout-status').textContent='Seções, nomes e posições salvos neste navegador.';}
  catch(e){$('#layout-status').textContent='Não foi possível salvar; mantenha esta página aberta ou tente novamente.';}
};
$('#layout-cancel').onclick=()=>{editingLayout=false;draftLayout=cleanLayout(savedLayout);render(true);$('#layout-status').textContent='Alterações canceladas. Organização anterior restaurada.';};

function currentTheme(){return document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}
function updateThemeButton(){const dark=currentTheme()==='dark';$('#theme').textContent=dark?'Modo claro':'Modo escuro';$('#theme').setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');}
$('#theme').onclick=()=>{const theme=currentTheme()==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{storage.setItem('pend-theme',theme);}catch(e){}updateThemeButton();};
updateThemeButton();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',updateThemeButton);

$('#back-to-top').onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});

/* ---------- início ---------- */
(function init(){
  try{
    const s = JSON.parse(storage.getItem('pend-files')||'null');
    if(s && s.length) FILES = s.map(f=>({empresa:f.empresa,label:f.label,time:f.time,source:f.source||'manual',owners:f.owners||[],json:f.json,sample:false}));
  }catch(e){}
  if(!FILES.length) FILES = [{empresa:'Exemplo',time:Date.now(),json:SAMPLE,sample:true}];
  rebuild(); render();
})();
