# Painel de Pendências

Importação manual e integração opcional com Goalfy via Cloudflare Worker. Importação e exportação XLSX, filtros por empresa, gráficos em seções editáveis, modo claro/escuro e identificação automática pelo SUSEP.

## Teste e produção

- **main**: produção, no endereço atual do painel.
- **develop**: homologação em `/teste/`, com selo TESTE.
- Relatórios, tema, ordem de colunas e organização de seções de teste usam armazenamento separado no navegador. Testar não altera esses dados na produção.
- Os dois endereços são públicos quando publicados pelo GitHub Pages. A separação é de versão e armazenamento, não controle de acesso.

O workflow `.github/workflows/pages.yml` testa o código com Node e navegador real, monta produção a partir de main e teste a partir de develop, e publica os dois no mesmo site. Se develop ainda não existir, teste usa main. Um snapshot antigo de main que ainda tenha apenas HTML pode ser preservado durante a primeira implantação.

Mudanças em develop atualizam a versão de teste; o conteúdo de produção continua vindo de main. Produção só muda quando o código chega a main. Falha nos testes impede a publicação desse workflow; configure também proteção de main para impedir merges sem testes aprovados. A automação não é uma garantia de ausência de qualquer erro futuro: cada correção deve ganhar um teste que reproduza o erro.

## Ativar no GitHub sem atualizar produção antes da revisão

1. Faça uma cópia de segurança da pasta atual do projeto e mantenha `.git`.
2. Na pasta do seu repositório, crie a branch de teste, se ainda não existir:

```powershell
git switch -c develop
```

3. Copie **todo o conteúdo deste pacote**, incluindo assets, scripts, tests e .github. Não substitua apenas index.html. Não copie planilhas reais ou configurações secretas. A pasta integracao contém o código do Worker e as instruções; ela não é publicada como parte do site.
4. Adicione somente os arquivos do projeto:

```powershell
git add -- index.html assets scripts tests integracao .github package.json package-lock.json README.md AGENTS.md .gitignore .nojekyll
git commit -m "Adiciona homologacao, secoes e testes de regressao"
git push -u origin develop
```

5. No GitHub, acesse **Settings > Pages > Source > GitHub Actions**. Antes de mudar essa configuração, confira que o workflow está na branch enviada. Pode ser necessário permitir main e develop no ambiente github-pages (Settings > Environments > github-pages > Deployment branches and tags). O workflow precisa publicar a partir das duas branches.
6. Aguarde o workflow **Testar e publicar painel**. Confira a homologação em `SEU_SITE/teste/`. O endereço principal mantém o snapshot atual de main.
7. Depois de revisar, abra um Pull Request de develop para main. Com os testes aprovados, faça o merge. A publicação atualiza o endereço principal; o link não muda.

Se a branch develop já existir, use `git switch develop` e atualize-a normalmente, sem recriar a branch. Não use push --force para atualizar este projeto.

Documentação da publicação: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages.

## Rodar e testar localmente

Com Node.js 22 ou superior e npm:

```powershell
npm ci
npx playwright install chromium
npm test
node scripts/build.mjs --local
npm run preview
```

Produção local: `http://127.0.0.1:4173/`.
Teste local: `http://127.0.0.1:4173/teste/`.
O build local usa a cópia atual nos dois endereços; no GitHub as versões são selecionadas por branch. Também é possível abrir index.html diretamente, mantendo a pasta assets ao lado.

## Seções e gráficos

As seções iniciais são Panorama das pendências, Modelos e eficiência, Detalhamento operacional e Tempo e acompanhamento. Cada uma explica o conjunto de gráficos. O seletor Ir para a seção rola a página até o destino, sem modificar filtros.

Em Organizar gráficos, arraste os gráficos ou use Anterior/Próximo, escolha a seção de destino pelo seletor de cada gráfico e edite os nomes das seções. Excluir gráfico apenas o remove da visualização; é possível restaurar. Salvar organização mantém os nomes, posições e exclusões naquele navegador/ambiente. Cancelar restaura a organização anterior. Preferências anteriores de ordem e exclusão são migradas na produção.

## Colunas e exportação

Arraste pelo símbolo ao lado do cabeçalho para mover colunas. No teclado, foque esse símbolo e use Alt + setas esquerda/direita. Clique no nome da coluna para ordenar as linhas. A ordem de colunas é salva automaticamente no navegador, por ambiente.

O XLSX exportado respeita linhas filtradas, busca, ordenação das linhas e sequência das colunas visíveis. Informações adicionais não visíveis, como Empresa quando há uma única empresa, vêm depois de todas as colunas exibidas.

## Regras solicitadas

- Produto - Venda Secundária preenchido substitui Produto - Lead como produto considerado pelo painel. Vazio mantém Produto - Lead. Não há indicador, gráfico ou regra adicional para venda secundária.
- Vendas com SUSEP Terceiros não contam para eficiência. São excluídas dos gráficos Prioridade de eficiência, Modelos de indicação e Propostas por modelo (vendas próprias). Continuam nas visões gerais, origem e tabela.
- Somente LEAD ou INDICACAO com IND. CRIACAO ALEATORIA/CRIAÇÃO ALEATÓRIA, quando a SUSEP é CMHE2J ou CMN32J, recebem a prioridade Impactam eficiência. Todos os outros casos, inclusive Terceiros, entram em Demais pendências no filtro e na tabela. Terceiros continuam excluídos dos gráficos de eficiência e presentes nas visões de origem e gerais. O indicador conta pendências, não calcula uma taxa de conversão.
- Porto Seguro, Porto Seguro - Itau, Porto Seguro - Azul, Porto Seguro - Frota e vazios são padronizados para PORTO. Demais seguradoras são preservadas.
- Empresas são identificadas pelo mapeamento SUSEP fixo no código. Uma empresa gera só sua aba; várias geram Geral e as abas das empresas presentes. Em relatório com códigos conhecidos de só uma empresa, os terceiros acompanham essa empresa. Em relatório misto, linhas sem código reconhecido ficam como Não identificada.

## Testes e manutenção

`npm test` executa testes unitários das regras e testes em navegador com importação e exportação XLSX reais usando propostas fictícias. Cobre produto secundário, terceiros, Porto, abas SUSEP, seções, arraste, renomeação, exclusão/restauração, persistência, colunas, exportação e isolamento dos ambientes. Consulte AGENTS.md: toda correção de erro deve receber um teste de regressão. Não versione a planilha real usada para validação.

## Dados e dependências

Relatórios são processados e mantidos no navegador. A conexão opcional consulta o Goalfy por um Cloudflare Worker autenticado. O mapeamento SUSEP é público conforme solicitado; o código não contém chave Goalfy. Quem usa o mesmo perfil pode acessar os dados locais. Limpar os dados do site apaga relatórios e preferências. O .gitignore ajuda a limitar arquivos, mas não protege dados colados no código ou adicionados manualmente/à força.

SheetJS 0.18.5 está incluído em assets, com licença em assets/LICENSE-SHEETJS.txt. Google Fonts é opcional e tem fallback de fontes locais. Nenhum relatório real é incluído no pacote.

## Validação desta entrega

A suíte de regressão inclui testes de integração com serviço simulado. Os testes anteriores passaram localmente, incluindo testes em navegador Edge headless e leitura/gravação XLSX reais. A instalação limpa com npm ci também foi validada. Nenhum dado real foi incluído nos testes ou no pacote. A execução no GitHub Actions ocorrerá quando o workflow for enviado e a publicação for configurada.

## Ajustes de 23/10/2026

- Venda secundária: AUTOMOVEL + VIDA resulta em VIDA. VENDEDOR 1, VENDEDOR 2 resulta em VENDEDOR 1. A regra está coberta na importação XLSX, nos gráficos e na exportação. Aceita também cabeçalhos como Produto da Venda Secundária e Produto - Venda Secundária (opcional).
- O cartão de propostas antigas conta 10 dias ou mais. O gráfico de tempo e os alertas da tabela também usam o marco de 10+ dias, padronizado em 26/10/2026.
- O filtro de prioridade tem apenas DEMAIS PENDÊNCIAS e IMPACTAM EFICIÊNCIA, além de TODOS. Terceiros fazem parte de DEMAIS PENDÊNCIAS, sem perder sua classificação de origem.
- IMPACTAM EFICIÊNCIA exige SUSEP CMHE2J ou CMN32J e modelo LEAD, ou modelo INDICACAO com tipo IND. CRIACAO ALEATORIA/CRIAÇÃO ALEATÓRIA. Qualquer outra combinação fica em DEMAIS PENDÊNCIAS.
- Textos dos filtros iniciais em maiúsculas; os valores internos são mantidos para preservar a filtragem.
- Recursos JS/CSS usam versão na URL para evitar reutilização da versão anterior do painel pelo cache após publicar. Reimporte o relatório se os dados antigos carregados não continham a coluna de venda secundária.

## Atualização de 26/10/2026

### Etiquetas e tratamento

A importação reconhece a coluna Etiquetas (também Etiqueta/Tags). Apenas a etiqueta exata EM TRATAMENTO é considerada, inclusive quando vier junto com outras etiquetas separadas por vírgula, ponto e vírgula, barra vertical ou quebra de linha. Listas JSON também são reconhecidas. EM ANDAMENTO e outras etiquetas não geram marcação.

A coluna Etiquetas é adicionada ao fim da tabela: exibe somente o selo EM TRATAMENTO nas linhas correspondentes e fica vazia nas demais. Ela é exportada e pode ser reorganizada como as outras colunas. O filtro TRATAMENTO oferece A TRATAR e EM TRATAMENTO. Relatórios antigos sem a coluna são compatíveis e ficam em A TRATAR. Outras etiquetas não são exibidas ou exportadas por esta coluna.

### Recolher seções

A seta ao lado do nome recolhe ou expande o conteúdo da seção. Essa preferência é salva automaticamente por navegador e ambiente, sem alterar gráficos, dados ou filtros. Navegar pelo seletor para uma seção recolhida a expande antes de rolar até ela. Durante Organizar gráficos, as seções ficam abertas temporariamente para permitir movimentação; a preferência anterior é preservada ao sair da organização.

### Prazo, início e contraste

O gráfico Tempo parado desde o envio usa 0 a 3, 4 a 7, 8 a 9 e 10+ dias. A legenda e os alertas da tabela usam o mesmo marco de 10 dias do cartão. O botão fixo Início retorna ao topo sem mudar filtros. Os seletores usam cores opacas por tema e color-scheme correto, mantendo o fundo estável ao passar o mouse no modo escuro.

Os 38 testes desta versão incluem leitura e exportação XLSX, etiquetas, filtros, compatibilidade com relatórios antigos, recolhimento persistente, isolamento entre ambientes, organização de gráficos em seções recolhidas, limites de 9/10/14/15 dias, retorno ao topo e contraste dos seletores no modo escuro.

## Conexão Goalfy

Consulte [o guia de configuração](integracao/CONFIGURAR.md). A chave fica em um Secret no Cloudflare. O painel usa uma senha separada, atualização manual e intervalos configuráveis. O Worker é publicado separadamente do GitHub Pages. Não envie o arquivo privado de senha ao GitHub.


## Dois relatórios e configuração privada

A integração aceita múltiplos relatórios, com links e chaves em GOALFY_REPORTS no Cloudflare. O endereço do Worker é digitado no painel, sem endereço de serviço ou identificadores de relatórios no código público. Ao atualizar a versão, informe novamente endereço e senha. Arquivo local permite importação manual; conexão online exige abrir o site publicado.

Validação mais recente: 53 testes passaram, incluindo dois relatórios, falha parcial, bloqueio de arquivo local e preservação dos dados. Consultas reais dependem da configuração privada no Cloudflare.
