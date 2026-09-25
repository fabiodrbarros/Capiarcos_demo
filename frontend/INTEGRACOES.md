# Integrações pendentes

O frontend está funcional localmente. Não existe backend, CMS, autenticação ou serviço de envio de email. Não foi alterado qualquer serviço externo nem efetuada publicação.

## Formulário

O formulário prepara uma ligação `mailto:patriciacapiarcos@sapo.pt` com assunto e mensagem codificados. A pessoa precisa de uma aplicação de email e de confirmar o envio nessa aplicação. A mensagem de estado não significa entrega nem envio pelo servidor.

Para implementar envio real, são necessários:

1. Serviço escolhido: API de email ou SMTP, e alojamento para um endpoint HTTPS no servidor.
2. Destinatário confirmado, remetente autorizado e domínio verificado no fornecedor. O endereço introduzido no formulário deve ser usado como Reply-To validado, não como remetente arbitrário.
3. Credencial/API key ou configuração SMTP (host, porta, TLS e credenciais), guardada no gestor de segredos/variáveis de ambiente do servidor. Não enviar segredos para o frontend nem colocá-los no repositório.
4. Texto aprovado sobre tratamento dos dados e decisão sobre conservação das mensagens, caso se pretenda armazenamento.

A integração terá de validar os campos no servidor, limitar abuso, tratar erros/timeouts e só indicar sucesso depois de o serviço aceitar a mensagem. A entrega efetiva exige um teste numa caixa de correio autorizada. Nenhuma credencial foi criada ou presumida.

## Catálogo e CMS

O pacote contém uma imagem, denominada **Cozinha Teste**, na categoria Cozinhas. A Home apresenta as 12 áreas aprovadas, mas estas não representam 12 produtos cadastrados. Os links das áreas continuam a abrir o catálogo existente.

Para completar o catálogo: fornecer imagens autorizadas, nomes finais, categorias, ordem e descrições alternativas. Confirmar se “Cozinha Teste” deve permanecer como conteúdo público. Não foram criados produtos, preços ou categorias fictícias.

Um CMS só é necessário se houver gestão editorial: escolher o serviço e indicar quem pode editar/publicar, quais os campos e onde ficam os ficheiros. O frontend estático pode continuar sem CMS; não precisa de uma framework nova para mostrar mais entradas.

## Empresa e mapa

- Empresa: `https://capiarcos.fabiodrbarros.cloud/empresa` permanece externo. O pedido HTTP HEAD respondeu **403** nesta sessão; isto não prova indisponibilidade em todos os browsers. É necessário confirmar o URL público/acesso ou fornecer o conteúdo aprovado para uma futura página local.
- Mapa: o iframe com o CID `1880678143440046317` ficou vazio no browser e o pedido HTTP HEAD respondeu **404** nesta sessão. Fornecer o URL de incorporação funcional obtido da ficha real da Capiarcos no Google Maps. Não foram inventadas coordenadas nem alterada a ficha da empresa. Os links e a morada fornecidos continuam disponíveis.
- Livro de Reclamações: o destino fornecido respondeu **200**, redirecionando para `/Inicio/`. Não foi efetuada qualquer reclamação.
- Telefones e email foram preservados; não foram feitas chamadas nem enviado email para os testar.

## Publicação e idiomas

Para alojar: indicar fornecedor, domínio final e autorização de publicação. Servir `dist/` na raiz, com HTTPS, MIME correto para `.mjs` e `.woff2`, páginas `/catalogo/` e `/contactos/` e resposta 404 para caminhos inexistentes. O servidor incluído é apenas local. Como os nomes dos assets não incluem hashes, não aplicar cache imutável sem um processo de versionamento/invalidação.

Não publicar o ZIP de referência como parte do site. Os originais usados como fallback permanecem em `dist/assets/` e devem acompanhar as cópias otimizadas.

PT é o único idioma implementado. EN/FR exigem traduções aprovadas e decisão sobre rotas; não foram acrescentados controlos sem função. As atribuições e a confirmação de direitos dos assets continuam em `LICENCAS-ASSETS.md`.

## Atualização para a VPS — 25/09/2026
Por decisão do utilizador, o link Empresa foi retirado de todas as páginas até existir a página nova. Esta decisão substitui as referências anteriores ao link externo. O novo serviço publica apenas o frontend estático; admin/API antigos ficam indisponíveis. Publicação pelo utilizador na sessão SSH, conforme README da raiz do repositório.

## Revisão pedida em 25/09/2026 — footer, quadros e mapa

Esta revisão substitui a decisão anterior de footer fixo na Home: depois dos 12 quadros, o cenário e o footer seguem o scroll normal da página. Mantêm-se as transições completas de 1,8 s entre as cinco etapas e o scroll da grelha em ecrãs pequenos. O footer mantém a altura do conteúdo.

Os quadros sobressaem 3 px e aumentam 3,5% no hover (rato) e foco visível (teclado), com animação de 200 ms e respeito por movimento reduzido. O canvas acompanha a posição dos elementos durante a animação.

Google Maps substituído por OpenStreetMap, incluindo ligações e atribuição nativa. Marcador nas coordenadas fornecidas pelo utilizador: 41.822322, -8.436533. Não requer chave de API.

## Integração de catálogo implementada — 25/09/2026

O catálogo dispõe agora de backend Node, painel /admin/ e volume persistente, com um administrador. Não são necessárias chaves externas para a gestão. É necessário criar o utilizador e a palavra-passe no terminal, através de server/setup-admin.mjs, e depois entrar no painel. A configuração PUBLIC_ORIGIN em docker-compose.yml utiliza o domínio já fornecido. Ver ADMIN.md. O conteúdo inicial é preservado; fotografias finais e seus títulos/descrições serão introduzidos pelo utilizador. O formulário de contactos continua sem envio no servidor.
