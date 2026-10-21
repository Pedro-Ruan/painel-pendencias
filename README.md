# Painel de Pendências

Dashboard estático em HTML, CSS e JavaScript, pronto para GitHub Pages.

## Publicação

Envie index.html, README.md, .gitignore e .nojekyll para a raiz do repositório. Em Settings > Pages, selecione Deploy from a branch, main e / (root), e salve. Não envie relatórios ou exportações. Se uma versão antiga de config.example.json estiver no repositório, ela pode ser removida; não é mais utilizada.

No GitHub Free, Pages exige repositório público. O site não possui login.

## Empresa e SUSEP

O mapeamento SUSEP está fixo no código e é aplicado automaticamente, sem senha, importação JSON ou seleção manual. Os códigos e nomes das empresas estarão visíveis no código público. Edite SUSEP_EMPRESA no index.html para atualizar o mapeamento.

Uma empresa detectada gera apenas sua aba; duas ou mais geram Geral e as abas presentes. O nome do arquivo não define a empresa. Nos relatórios com códigos conhecidos de uma única empresa, linhas de terceiros ou sem código conhecido ficam nessa empresa, mantendo a origem separada. Em relatórios com várias empresas, linhas sem código conhecido ficam como Não identificada.

## Recursos

- Importação XLSX/XLS/CSV e filtros.
- Padronização das quatro variações Porto Seguro e de campos vazios para PORTO, preservando outras seguradoras.
- Tipos de indicação e prioridade de eficiência: LEAD e INDICACAO com IND. CRIACAO ALEATORIA.
- Exportação XLSX da tabela exibida, com filtros e ordenação.
- Organização, exclusão visual e restauração de gráficos, com preferências salvas.
- Modo claro/escuro e atualização com data e horário.

## Dados

Relatórios são processados no navegador e gravados no localStorage. Cada navegador mantém seus próprios dados. A aplicação não implementa envio de relatórios a um servidor nem sincronização. O código do site e dependências executadas nessa origem podem acessar os dados locais. Limpe os dados do site em computadores compartilhados.

O pacote inclui apenas exemplos fictícios de propostas e o mapeamento SUSEP operacional autorizado. Não inclui relatórios reais, senhas ou chaves de API. SheetJS é carregado de cdnjs; fontes vêm de Google Fonts e exigem conexão.

## Etapa futura

Integração Goalfy e atualização automática serão implementadas posteriormente. Chaves de API deverão ficar em serviço protegido, fora do HTML público.
