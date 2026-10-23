const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../assets/core.js');
test('produto secundário preenchido substitui o produto principal',()=>{
  assert.equal(core.effectiveProduct('VIDA',' CELULAR '),'CELULAR');
  for(const empty of ['',null,undefined,'   '])assert.equal(core.effectiveProduct('VIDA',empty),'VIDA');
  assert.equal(core.effectiveProduct('',''),'—');
});
test('terceiros nunca contam para eficiência, mesmo em LEAD ou criação aleatória',()=>{
  for(const third of ['Terceiros',' terceiros ','TERCEIROS']){
    assert.equal(core.efficiencyPriority('LEAD','',third),false);
    assert.equal(core.efficiencyPriority('INDICACAO','IND. CRIACAO ALEATORIA',third),false);
  }
  assert.equal(core.efficiencyPriority('LEAD','','CMHE2J'),true);
  assert.equal(core.efficiencyPriority('INDICAÇÃO','IND. CRIAÇÃO ALEATÓRIA','CMHE2J'),true);
  assert.equal(core.efficiencyPriority('INDICACAO','IND. BOLA DA VEZ','CMHE2J'),false);
  assert.equal(core.efficiencyPriority('RENOVACAO','IND. CRIACAO ALEATORIA','CMHE2J'),false);
});
test('regressão: variantes Porto e vazios viram PORTO sem trocar outras seguradoras',()=>{
  for(const value of ['Porto Seguro','Porto Seguro - Itau','Porto Seguro - Azul','Porto Seguro - Frota','',null])assert.equal(core.normalizeInsurer(value),'PORTO');
  assert.equal(core.normalizeInsurer('Tokio Marine'),'Tokio Marine');
});
test('regressão: colunas opcionais novas entram após as já ordenadas',()=>{
  assert.deepEqual(core.orderedKeys(['produto','cliente','produto','obsoleta'],['cliente','produto','empresa']),['produto','cliente','empresa']);
  assert.deepEqual(core.moveKey(['cliente','produto','modelo'],'modelo','cliente'),['modelo','cliente','produto']);
  assert.deepEqual(core.moveKey(['cliente'],'inexistente','cliente'),['cliente']);
});
test('migração de organização preserva exclusões e ordem antigas',()=>{
  const state=core.cleanLayout({order:['a','b'],hidden:['b']});
  assert.deepEqual(state.order,['a','b']);assert.deepEqual(state.hidden,['b']);assert.equal(state.sections.length,4);
});
test('nomes e destinos de seções inválidos são reparados',()=>{
  const state=core.cleanLayout({sections:[{id:'panorama',name:'  Minha seção  '}],placements:{x:'tempo',y:'removida'}});
  assert.equal(state.sections[0].name,'Minha seção');assert.deepEqual(state.placements,{x:'tempo'});
  assert.equal(core.defaultSection('propostasporproduto'),'panorama');
  assert.equal(core.defaultSection('prioridadedeeficiencia'),'eficiencia');
  assert.equal(core.defaultSection('enviospordia'),'tempo');
});

test('regressão: somente CMHE2J e CMN32J podem impactar eficiência',()=>{
  for(const susep of ['CMHE2J','CMN32J',' cmhe2j ']){
    assert.equal(core.efficiencyPriority('LEAD','',susep),true);
    for(const referral of ['IND. CRIACAO ALEATORIA','CRIAÇÃO ALEATÓRIA'])assert.equal(core.efficiencyPriority('INDICAÇÃO',referral,susep),true);
  }
  for(const susep of ['2GAJ6J','A805TJ','Terceiros','',null,'DESCONHECIDA']){
    assert.equal(core.efficiencyPriority('LEAD','',susep),false);
    assert.equal(core.efficiencyPriority('INDICACAO','IND. CRIACAO ALEATORIA',susep),false);
  }
  assert.equal(core.efficiencyPriority('RENOVACAO','IND. CRIACAO ALEATORIA','CMHE2J'),false);
  assert.equal(core.efficiencyPriority('INDICACAO','IND. BOLA DA VEZ','CMN32J'),false);
});
