(function(root){
  const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const clean=value=>value==null?'':String(value).trim();
  const titleCase=s=>(s===s.toUpperCase()||s===s.toLowerCase())?s.toLowerCase().replace(/(^|[\s\/-])\S/g,m=>m.toUpperCase()):s;
  function effectiveProduct(primary,secondary){return clean(secondary)||clean(primary)||'—';}
  function normalizeInsurer(value){
    const text=clean(value);
    return !text||norm(text)==='null'||['porto','portoseguro','portoseguroitau','portoseguroazul','portosegurofrota'].includes(norm(text))?'PORTO':titleCase(text);
  }
  function referralType(value){const text=clean(value);return !text||norm(text)==='null'?'Não informado':text;}
  function isThirdParty(susep){return norm(susep).startsWith('terceiro');}
  function efficiencyPriority(model,referral,susep){return ['CMHE2J','CMN32J'].includes(clean(susep).toUpperCase())&&(norm(model)==='lead'||(norm(model)==='indicacao'&&['indcriacaoaleatoria','criacaoaleatoria'].includes(norm(referral))));}
  function orderedKeys(saved,available){return [...new Set([...(Array.isArray(saved)?saved:[]),...available])].filter(key=>available.includes(key));}
  function moveKey(order,from,to){const result=[...order],a=result.indexOf(from),b=result.indexOf(to);if(a<0||b<0||a===b)return result;result.splice(a,1);result.splice(b,0,from);return result;}
  const sections=[
    {id:'panorama',name:'Panorama das pendências',description:'Distribuição das propostas por produto, motivo e vendedor.'},
    {id:'eficiencia',name:'Modelos e eficiência',description:'Modelos e indicações das vendas próprias, prioridades de eficiência e origem das vendas.'},
    {id:'operacao',name:'Detalhamento operacional',description:'Cruzamentos das pendências por produto, vendedor, seguradora, empresa e modelo.'},
    {id:'tempo',name:'Tempo e acompanhamento',description:'Tempo parado das propostas e distribuição das datas de envio.'}
  ];
  function defaultSection(id){
    if(['propostasporproduto','pendenciaspormotivo','propostasporvendedor'].includes(id))return 'panorama';
    if(['propostaspormodelo','prioridadedeeficiencia','origemdavenda','modelosdeindicacao'].includes(id))return 'eficiencia';
    if(['tempoparadodesdeoenvio','enviospordia'].includes(id))return 'tempo';
    return 'operacao';
  }
  function cleanLayout(value){
    const source=value&&typeof value==='object'?value:{};
    const strings=values=>Array.isArray(values)?[...new Set(values.filter(v=>typeof v==='string'))]:[];
    return {order:strings(source.order),hidden:strings(source.hidden),sections:sections.map(item=>{
      const saved=Array.isArray(source.sections)?source.sections.find(s=>s&&s.id===item.id):null;
      return {...item,name:typeof saved?.name==='string'&&saved.name.trim()?saved.name.trim().slice(0,60):item.name};
    }),placements:Object.fromEntries(Object.entries(source.placements||{}).filter(([key,id])=>typeof key==='string'&&sections.some(s=>s.id===id)))};
  }
  const api={norm,effectiveProduct,normalizeInsurer,referralType,isThirdParty,efficiencyPriority,orderedKeys,moveKey,sections,defaultSection,cleanLayout};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.PendenciasCore=api;
})(typeof window!=='undefined'?window:globalThis);
