# Anexar Apólices — primeira versão

Abra `apolices.html`, mantendo a pasta assets ao lado. A navegação superior alterna entre Pendências e Anexar Apólices. A importação manual funciona localmente; para conexão online, abra o site publicado ou um servidor com origem autorizada.

## Planilha

Campos: Nome do Cliente:, Produto - Lead, Produto - Venda Secundária, Envio da Proposta, Modelo, Modelo de Indicação:, N° Proposta, Seguradora Contratada - Auto/Moto e SUSEP. A coluna secundária é opcional; quando preenchida, substitui o produto principal. Nenhuma coluna de vendedor, etiqueta ou motivo de pendência é exigida.

Envio da Proposta representa a data da venda. Todo o histórico recebido aparece inicialmente. Datas inválidas permanecem na visão geral, mas ficam fora de intervalos de datas. Os atalhos hoje e ontem usam o calendário local do dispositivo, inclusive fins de semana.

Eficiência e padronização de seguradoras reutilizam o núcleo de Pendências. Empresa é inferida pela SUSEP; se o relatório contém somente uma empresa conhecida, linhas sem identificação herdam a empresa do relatório, como no painel anterior. Em relatório misto, empresas não identificadas continuam separadas. Não é criado histórico de snapshots, status de anexo ou deduplicação automática.

## Cloudflare R5

1. Publique `worker.mjs` atualizado no mesmo Worker. A rota antiga `/report` continua consultando Pendências.
2. Preserve GOALFY_REPORTS, DASHBOARD_TOKEN e ALLOWED_ORIGIN.
3. Crie o novo Secret **GOALFY_APOLICES_REPORTS** com a mesma estrutura de lista JSON de objetos `{ "url": "LINK_COMPLETO_PRIVADO" }`, usando os novos relatórios de Anexar Apólices. Cada link contém sua própria chave. Não use os relatórios antigos neste Secret.
4. Abra Anexar Apólices > Configurar Goalfy. Informe endereço do Worker, senha e intervalo. A página consulta `/report?dataset=apolices`.

Se o novo Secret não existir, a aba informa que precisa de configuração. Nunca retorna dados de Pendências como alternativa. Os links e chaves são cadastrados somente no Cloudflare, sem enviá-los ao GitHub ou ao chat.

Para diagnóstico do novo conjunto, as requisições autenticadas podem usar `/diagnostic?dataset=apolices&report=1`. O formulário de diagnóstico padrão continua selecionando Pendências.

## Separação e atualização

Relatórios, filtros, tema, organização e credenciais da nova página são separados de Pendências e do ambiente /teste/. Credenciais opcionais ficam no sessionStorage da aba; relatórios normalizados ficam no localStorage. Em dispositivo compartilhado, remova relatórios após o uso. A atualização automática funciona com a página ativa e visível e é retomada ao voltar para ela; não funciona com o navegador fechado. Alternar para Pendências interrompe o temporizador de Anexar Apólices, retomado ao voltar à página e restaurar a sessão.

A atualização online só troca o conjunto completo após validar todos os relatórios. Falhas preservam os dados anteriores. Importação manual desconecta a atualização automática desta página. A planilha exportada acompanha as linhas filtradas, a ordenação das linhas e a ordem das colunas.

## Publicação

Esta entrega é para revisão, sem publicação automática. Copie o pacote completo, incluindo apolices.html, assets, scripts, tests e integracao, preservando .git. Não substitua apenas index.html. O novo build inclui as duas páginas em produção e em /teste/. A publicação do GitHub não faz deploy do Worker: atualize-o separadamente no Cloudflare.

## Usabilidade da versão 2

Clique nos valores dos gráficos para aplicar filtros combináveis; clique novamente para desfazer a seleção. Organizar gráficos abre uma edição: Salvar organização confirma e persiste, Cancelar restaura a ordem e os gráficos anteriores. Os botões de restauração individual aparecem para cada gráfico oculto. A confirmação de salvamento só aparece após gravação bem-sucedida no navegador.

Colunas têm alças de arraste e também aceitam Alt + setas. A ordem é salva automaticamente, com confirmação, e acompanha a exportação XLSX. Dias parado é recalculado a partir do envio em dias corridos: 0–1 neutro, 2 amarelo e 3+ vermelho. O cartão Com mais de 2 dias conta somente 3+ dias nas linhas filtradas. Datas inválidas recebem — e ficam fora desse contador. O prazo de 10 dias em Pendências permanece separado.
