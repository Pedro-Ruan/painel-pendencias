# Integração Goalfy com múltiplos relatórios

## Cloudflare

1. Abra seu Worker, clique em Edit code, substitua o código por worker.mjs e publique.
2. Em Settings > Variables and Secrets, configure:

| Nome | Tipo | Conteúdo |
| --- | --- | --- |
| GOALFY_REPORTS | Secret | Lista JSON com um objeto {"url":"LINK_COMPLETO_PRIVADO"} para cada relatório; cada link contém sua própria apiKey |
| DASHBOARD_TOKEN | Secret | Senha forte de acesso ao painel, com pelo menos 24 caracteres |
| ALLOWED_ORIGIN | Text | Origem HTTPS do dashboard publicado, sem caminho nem barra final |

O arquivo privado de configuração fornecido separadamente contém o modelo dos dois relatórios. Substitua os marcadores pelas chaves corretas somente no Cloudflare. Não envie esse arquivo nem o conteúdo do Secret ao GitHub. GOALFY_API_KEY e GOALFY_REPORT_ID antigos não são usados nesta versão e podem ser removidos.

3. Publique as alterações do Worker.

## Dashboard

Abra o site publicado, clique em Configurar Goalfy e informe o endereço HTTPS do Worker e a senha DASHBOARD_TOKEN. Escolha o intervalo e conecte. O endereço é informado em tempo de uso, sem estar no código do repositório.

A importação manual funciona com arquivo local. A conexão online exige uma origem HTTP/HTTPS autorizada: abrir index.html com file://, inclusive de dentro de um ZIP, não funciona. Não libere a origem null no Worker. Para teste local, use servidor local e uma configuração de Worker separada com sua origem exata.

O relatório de cada board deve ter as colunas esperadas pelo painel. A chave é gerada nas configurações de usuário do Goalfy, conforme a documentação oficial do produto. Uma mesma chave pode ter acesso aos dois relatórios; se as permissões forem diferentes, use uma chave em cada link.

## Comportamento e proteção

Cada atualização busca todos os relatórios configurados. Só substitui os dados quando todos forem recebidos e validados. A identificação de empresa continua pelo SUSEP e a inferência de cada relatório é preservada. Não há deduplicação automática entre relatórios: configure relatórios sem sobreposição de propostas.

A senha dá acesso aos relatórios; compartilhe somente com pessoas autorizadas. O Worker verifica senha e origem, valida os links e não devolve URLs ou chaves ao navegador. A restrição de origem não substitui a senha. Nenhum identificador de relatório, endereço do Worker ou chave real faz parte deste pacote.

A opção Manter conexão nesta aba usa sessionStorage, isolado entre teste e produção. Desconectar remove a credencial; os relatórios já carregados continuam no armazenamento local. Remova-os também em computadores compartilhados.

O botão Atualizar agora faz consulta manual. A atualização periódica funciona com a aba visível e é retomada ao voltar à aba desatualizada. Os intervalos são 1, 5, 10 ou 15 minutos, ou somente manual. Não é atualização instantânea a cada alteração no Goalfy.

Se o navegador não alcançar o serviço, confira endereço, publicação do Worker e ALLOWED_ORIGIN. Senha inválida encerra as tentativas. Erros de consulta mantêm o último conjunto válido. Testes usam dados fictícios e não validam suas chaves reais.
