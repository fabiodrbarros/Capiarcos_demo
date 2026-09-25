# Estado aprovado em 25/09/2026

## Identidade e composição

Preservar o logo original, fonte local e fundo da sala: janela à esquerda, ripado vermelho e degraus à direita. Vermelho principal #682725; dourado de destaque do menu #aa7420. Respeitar sombras e proporções. Não trocar os desenhos por ícones genéricos.

## Home

Sequência: logo → desenho alinhado com móvel → móvel realista fechado → duas amostras de materiais sobem → amostras multiplicam-se e dão lugar a 12 quadros com os desenhos enviados.
Cada gesto desencadeia uma transição completa de 1800 ms; não fazer scrub que permita parar a meio. O móvel não se abre. A grelha fica mais à esquerda, fora do ripado.
Quadros finais: aro vermelho, fundo branco, desenhos proporcionais, legendas interiores em maiúsculas. Mapeamento dos ficheiros 00–11: Cozinhas, Roupeiros, Móveis de TV, Quartos, Casas de banho, Ripados, Mesas, Portas, Escadas, Aparadores, Escritórios, Estantes.
CTA “EXPLORAR CATÁLOGO”: pequeno, afastado dos quadros e alinhado à esquerda; transparente com contorno vermelho; hover vermelho, letras brancas e seta que aparece.
Sem navegação inferior de etapas; no topo apenas o botão do menu.
O footer é revelado com o cenário e o conteúdo a subir juntos. O footer fica parado por baixo, com altura do conteúdo, nunca uma secção de ecrã inteiro.

## Catálogo

Maior aproveitamento da largura, quadros pequenos e mais quadros por linha; aro com textura de madeira tingida de vermelho. Preservar filtros e diálogo de ampliação existentes.

## Contactos

Logo acima da coluna dos contactos. Título “ENVIE-NOS UMA MENSAGEM” pequeno e em maiúsculas. Conteúdo mais à esquerda, cores vermelhas. Formulário compacto no topo da coluna direita, alinhado com o início da esquerda; mapa e final da esquerda alinhados.
Catálogo e contactos: área principal com altura mínima de um ecrã. Scroll normal move fundo e conteúdo juntos e revela o footer seguinte.

## Menu e footer

Menu branco de ecrã inteiro, três colunas com separadores finos: logo/slogan/copyright; navegação central em maiúsculas; contactos à direita. Vermelho com destaque dourado. Fechar com X/Escape, gerir foco. Layout vertical em mobile.
Footer claro: logo e slogan; navegação; contactos. Linha inferior com copyright, Livro de Reclamações e PT. EN/FR não estão implementados: não acrescentar botões sem função.

## Ficheiros principais

- `dist/index.html`: Home, SVGs de suporte, quadros, menu e footer.
- `dist/scroll-home.mjs`, `chapter-timing.mjs`: navegação e transições.
- `dist/material-story.mjs`: geometria e apresentação do móvel.
- `dist/material-tiles.mjs`: animação das amostras e desenho dos quadros com PNG.
- `dist/solution-morph.mjs`: geometria auxiliar dos alvos.
- `dist/scroll-home.css`, `fixed-home.css`: layout da Home.
- `dist/contactos/index.html`, `dist/catalogo/index.html`: páginas internas.
- `dist/showroom.css`, `catalogue-wall.css`: layout e quadros do catálogo.
- `dist/menu.css`, `footer.css`: componentes partilhados.
- `dist/app.js`: menu e formulário por mailto.


## Validação e pendências

Preparação local efetuada em 25/09/2026 sobre a versão 52. A referência recebida está em `referencia/versao-52-original.zip`. Consultar `VALIDACAO-LOCAL.md` para a matriz efetivamente verificada no browser e os testes ainda pendentes; não assumir validação em dispositivos físicos ou em todos os browsers.
Foram corrigidos o overflow do mapa em mobile, a navegação/foco, o carregamento descodificado das imagens e o alinhamento canvas/DOM ao redimensionar com o footer aberto. O build verifica também referências locais e as transições completas de 1800 ms.
A página Empresa ainda é externa. O envio de email real, um CMS/backoffice e traduções não existem. Para email de produção serão necessárias configurações do serviço escolhido; usar variáveis de ambiente e nunca inventar segredos.
O ficheiro `LICENCAS-ASSETS.md` regista as atribuições dos recursos mantidos. Rever direitos dos assets antes do lançamento comercial.

## Manutenção após preparação local

- `image-assets.mjs`: descodificação assíncrona das cópias de entrega e fallback para os originais das imagens da animação.
- `material-tiles.mjs`: carrega os 12 PNG antecipadamente e expõe a conclusão do carregamento. O mapeamento 00–11 não foi alterado.
- `scroll-home.mjs`: espera pelas imagens antes de aceitar a transição, incluindo acesso direto por hash; mantém a máquina de etapas existente. O canvas usa coordenadas locais do cenário, mesmo quando este está elevado sobre o footer.
- `solution-morph.mjs` e os SVG de suporte foram preservados; a Home já não calcula segmentos SVG que a apresentação PNG não usa.
- `assets/optimized/manifest.json`: relação entre originais e cópias. Fotografias WebP a 92, sem redimensionamento; desenhos continuam PNG, proporcionais, com lado máximo 1024 px; logo PNG sem perda e sem redimensionamento; textura a 512 px.
- Formulário continua exclusivamente `mailto`. Inclui limites de comprimento, validação nativa e estado explícito. Sem JavaScript, o botão fica desativado e o contacto por email continua disponível.
- Empresa e mapa externos não ficaram certificados como disponíveis: respostas HTTP 403 e 404, respetivamente, nesta sessão. Destinos originais preservados. Ver `INTEGRACOES.md`.

## Atualização para a VPS — 25/09/2026
Por decisão do utilizador, o link Empresa foi retirado de todas as páginas até existir a página nova. Esta decisão substitui as referências anteriores ao link externo. O novo serviço publica apenas o frontend estático; admin/API antigos ficam indisponíveis. Publicação pelo utilizador na sessão SSH, conforme README da raiz do repositório.

## Revisão pedida em 25/09/2026 — footer, quadros e mapa

Esta revisão substitui a decisão anterior de footer fixo na Home: depois dos 12 quadros, o cenário e o footer seguem o scroll normal da página. Mantêm-se as transições completas de 1,8 s entre as cinco etapas e o scroll da grelha em ecrãs pequenos. O footer mantém a altura do conteúdo.

Os quadros sobressaem 3 px e aumentam 3,5% no hover (rato) e foco visível (teclado), com animação de 200 ms e respeito por movimento reduzido. O canvas acompanha a posição dos elementos durante a animação.

Google Maps substituído por OpenStreetMap, incluindo ligações e atribuição nativa. Marcador nas coordenadas fornecidas pelo utilizador: 41.822322, -8.436533. Não requer chave de API.

## Atualização da grelha e mapa

Os 12 quadros móveis cabem numa secção sem scroll interno. O pin OpenStreetMap usa agora #682725 através de Leaflet local em map.html/map.js; atribuição e coordenadas mantidas. Leaflet está em dist/vendor/leaflet, incluindo licença. Sem dependências npm nem chave de API; o mapa necessita de rede para obter os tiles.

## Painel de catálogo — atualização em 25/09/2026

Foi acrescentado o backend Node e o painel /admin/ para um administrador, por pedido do utilizador. Categorias, títulos, descrições, ordem, publicação e retirada/recuperação de imagens são geridos no painel. Catálogo público renderizado com os mesmos componentes visuais. Ver ADMIN.md na raiz; esta atualização substitui as notas históricas de inexistência de backend/CMS. Formulário permanece mailto.

## Identidade e ícone — 25/09/2026
Assinatura atualizada para CAPIARCOS - Rigor · Autenticidade · Proximidade nos títulos, menu e rodapés. Favicon SVG derivado dos contornos existentes de logo-shapes.json, isolando o rolo com C, com cópia PNG 64 px. Logo completo e originais preservados. Build validado e título/menu confirmados no browser local.

