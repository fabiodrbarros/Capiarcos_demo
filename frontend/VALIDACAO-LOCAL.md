# Validação local — 25/09/2026

Base: versão 52 recebida, preservada em `referencia/versao-52-original.zip` antes de editar. Trabalho efetuado diretamente sobre os fontes em `dist/`. Sem instalação de dependências npm, framework nova ou publicação.

## Alterações

- Cópias de entrega em `assets/optimized/`, sem substituir o desenho, o logo ou as fotografias por outros assets. Dimensões/tamanhos em `manifest.json`. Total dos assets tratados: **25 837 073 → 8 774 042 bytes**, redução de aproximadamente **66,0%**. Não é uma medição Lighthouse ou de tempo de carregamento.
- Os 20 assets originais foram comparados por SHA-256 com o ZIP: idênticos.
- Preload dos 12 desenhos, descodificação antes das transições, fallback para os originais e aviso se ambos falharem. Acesso por hash respeita a mesma espera.
- Removido apenas o cálculo de segmentos SVG não usados pela animação PNG; ficheiro auxiliar e SVG preservados.
- Transições de 1800 ms mantidas, incluindo reversão; repetição de teclas e eventos durante uma transição não saltam etapas. Estado `aria-busy` durante a animação.
- Teclado respeita os botões e percorre o scroll interno da grelha/rodapé. Foco explícito ao abrir/fechar menu, Escape nativo e cenário fora da ordem de foco quando o footer está aberto.
- Canvas medido relativamente ao cenário, corrigindo resize com footer aberto. Footer mantém a altura do conteúdo, limitada a 75dvh na Home com scroll interno quando necessário.
- Ajustes de espaço em ecrãs baixos, legendas em 320 px e largura do mapa. O mapa causava overflow horizontal de 460 px num viewport de 320 px; corrigido para a largura da coluna.
- Formulário com limites de comprimento, proteção contra submissão GET acidental sem JavaScript e mensagem clara sobre mailto. Ícones decorativos dos contactos excluídos da árvore acessível.
- Build alargado a imports, referências HTML/CSS, âncoras, IDs duplicados, PNG dinâmicos e invariantes das transições.

## Verificado no browser integrado

As dimensões abaixo são viewports de teste, não dispositivos físicos.

| Área | Dimensões inspecionadas | Resultado |
|---|---|---|
| Home | 1280×720, 1440×900 | Logo, desenho alinhado, móvel fechado, duas amostras e 12 quadros com os PNG corretos. Grelha fora do ripado, legendas interiores e CTA pequeno preservados. |
| Home responsiva | 320×568, 768×1024, 1440×500 | Sem overflow horizontal; scroll interno permite chegar às 12 áreas e ao CTA em ecrãs baixos. |
| Footer Home | 320×568, 1440×500; resize aberto para 1024×768 | Cenário e conteúdo sobem juntos; footer fica no fundo, com altura de conteúdo e scroll interno quando necessário. Abertura/fecho por roda/teclado e alinhamento após resize conferidos. |
| Menu | 320×568, 844×390, 1440×900 | Layout vertical móvel e três colunas desktop; scroll em baixa altura, links preservados, foco inicial, Escape e retorno ao botão conferidos. |
| Catálogo | 320×568, 768×1024, 1440×900 | Filtros Todos/Cozinhas, atualização do URL/estado, imagem ampliada, fecho com Escape e retorno do foco. Conteúdo principal de um viewport seguido de footer em scroll normal. |
| Contactos | 320×568, 768×1024, 1024×600, 1440×900 | Colunas/formulário e ordem preservados; campos acessíveis; sem overflow horizontal após correção; footer seguinte em scroll normal. |

Avanço e recuo pelas cinco etapas da Home foram executados com teclado. Dois avanços imediatos ficaram na etapa seguinte, sem saltar uma etapa. Foram inspecionados os estados finais e as imagens durante a sequência. Roda/scroll interno e passagem ao footer foram exercitados em viewport móvel. O CTA mantém contorno vermelho, estilo vermelho/branco no hover e seta apenas no hover; a regra de hover foi revista no CSS, sem uma captura dedicada do ponteiro em hover.

Formulário: submissão vazia mostrou validação nativa e foco em Nome; email inválido foi rejeitado. Com dados fictícios (`teste@example.com`), o handler produziu a mensagem de confirmação na aplicação de email. **A navegação mailto foi bloqueada pela política de segurança do browser de teste.** Não foi validada a abertura do cliente nem enviado email. Os dados de teste foram removidos ao recarregar.

## Verificações automáticas

- `npm start`: servidor em `http://127.0.0.1:4173`.
- `npm run build`: passou; 3 páginas, 8 módulos, 121 referências locais e 12 pares de PNG.
- HTTP HEAD para os 55 ficheiros públicos: 200 e Content-Length correspondente ao disco.
- Testes das transições: duração 1800 ms, avanço/recuo, antes do início, antes do fim, fim exato e tempo excedido.
- Não apareceram erros/avisos JavaScript nos registos do browser consultados durante os percursos. Isto não certifica a disponibilidade dos serviços externos.

## Não verificado / dependências externas

- Dispositivos físicos, gestos tácteis reais, Safari/Firefox, leitor de ecrã dedicado e auditoria WCAG completa.
- Medição de FPS/Core Web Vitals, simulação de rede lenta/falhas de imagens e emulação efetiva de movimento reduzido. A implementação foi revista; não há resultados de benchmark ou de teste que comprovem estes cenários.
- Envio/entrega de email, backend, CMS, autenticação e traduções: não existem neste pacote.
- Empresa: HEAD 403; mapa incorporado: vazio no browser e HEAD 404. Os destinos recebidos foram preservados; requerem confirmação. Livro de Reclamações: HEAD 200 após redirecionamento.
- Nenhuma publicação, domínio, serviço externo, chamada telefónica ou envio de email foi efetuado.

Consultar `INTEGRACOES.md` para os dados estritamente necessários às etapas de produção.

## Ajuste de nitidez e tamanho dos quadros

A pedido do utilizador, quadros cerca de 9% maiores em desktop e ligeiramente maiores em mobile, com menor margem interior. PNG de entrega aumentados de 640 para 1024 px, sem alterar os originais. Canvas em repouso renderiza a pelo menos 2× (até 3× em ecrãs de alta densidade), com suavização de alta qualidade; durante a animação usa uma resolução mais leve. Grelha mantém quatro colunas em desktop, duas em mobile, aro vermelho e legendas interiores. Build validado e vistas de 320×568 e 1440×900 inspecionadas.

## Preparação Docker/GitHub — 25/09/2026

- Link Empresa retirado em todas as páginas por decisão do utilizador; menu mantém três colunas.
- npm run build: passou; docker compose config: passou; imagem Docker construída localmente.
- HTTP no Nginx local: 55 ficheiros comparados byte a byte com frontend/dist; MIME dos módulos correto; Home, catálogo, contactos e redirecionamentos passaram. Admin, Empresa, API e caminhos privados devolvem 404.
- Browser no Docker (127.0.0.1:4174): Home carrega, menu sem Empresa, navegação para catálogo, filtro Cozinhas, ampliação, Escape e contactos/formulário confirmados. Matriz responsiva e animações já verificada na preparação local descrita acima; não repetida integralmente nesta passagem Docker.
- deploy/update.sh validado com bash -n. A execução completa, recuperação automática e saúde na VPS não foram testadas: requerem a sessão SSH do utilizador. Nenhuma alteração remota à VPS nesta sessão.
- Permanecem as limitações do catálogo fornecido (uma Cozinha Teste), mapa externo sem imagem e formulário mailto. Não foi enviado email nem simulado envio pelo servidor.
