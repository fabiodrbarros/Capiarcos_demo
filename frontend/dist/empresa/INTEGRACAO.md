# Página Empresa

Integração do ZIP fornecido, em HTML/CSS/ES modules, sem dependências novas. Rota: `/empresa/` (também `/empresa/index.html`; `/empresa` redireciona preservando o idioma).

O servidor insere o header, menu e footer já existentes na Home, por referência aos seus blocos atuais. A página não mantém cópias desses componentes. A ligação Empresa é inserida apenas no menu partilhado. Os assets do ZIP são idênticos aos originais do projeto e são reutilizados.

Textos portugueses preservados; FR/EN em `languages.mjs`. O idioma é mantido nas ligações. O círculo anuncia etapa e título no idioma ativo. Navegação por scroll, teclado e gestos. Listeners são cancelados e timer limpo em pagehide, com restabelecimento em pageshow para histórico do browser.

A sequência animada está ativa também nos telemóveis e ecrãs baixos: abertura com logo, quatro temas, 25/50/75/100%, footer em scroll normal. O layout compacto mantém os textos separados do círculo e logótipo. Em alturas extremas, o texto de cada tema permite scroll antes de avançar de etapa. Movimento reduzido desativa as transições.

Verificado: build; testes de integração HTTP PT/FR/EN, rota e componentes únicos; browser local a 1440×900, 1280×800, 390×844 e 320×568; quatro percentagens, avanço/recuo, footer, Escape, troca de idioma, catálogo e regresso pelo histórico. Não verificado num iPhone/Safari físico nem publicado na VPS.
