# Admin anterior — apenas contexto

Código preservado sem alterações da versão Next anterior (commit 1e5a7ac). Não é um serviço instalado, não é compilado pelo build atual e não é incluído no Docker. Nenhuma rota desta pasta está publicada.

## Conteúdo preservado

- `src/app/ca-guest-admin/`: interface de gestão, login, layout e CSS.
- `src/app/api/`: login/logout/sessão, manifesto do catálogo, categorias, upload e consulta/remoção de imagens.
- `src/lib/auth.ts`: autenticação e sessões anteriores.
- `src/lib/catalog.ts`: diretórios do catálogo, categorias e títulos.
- `src/lib/translate.ts`: dependência da API de categorias; usava MyMemory para tradução automática. Preservada como contexto, sem chamadas executadas.

Foram analisados os imports do admin e da API: estas três bibliotecas são as suas dependências locais. O código dependia de Next 16, React 19, TypeScript e do alias `@/` para `src/`. Esses ambientes não estão instalados no frontend atual. Não copiar este diretório para a raiz pública nem tentar ativá-lo diretamente.

## Contratos anteriores a considerar numa futura integração

O catálogo era guardado em `public/assets/img/catalogo`, com pastas por categoria, `categories.json` e `titles.json`. Na VPS estes dados viviam num volume Docker. Os dados e imagens antigos não fazem parte desta referência; o script de atualização guarda uma cópia quando encontra o catálogo no container anterior e não elimina o volume.

O login lia `ADMIN_USER` e `ADMIN_PASSWORD`; o código tinha valores por omissão e sessões em memória que precisam de revisão antes de reutilização. Não foram copiadas configurações privadas ou credenciais da VPS. Os ecrãs apontavam para `/assets/img/logo.png`, um asset do site antigo que foi removido; numa futura implementação usar o logo aprovado do frontend atual.

Este arquivo documenta o comportamento anterior, sem aprovar a arquitetura ou a segurança para produção. A futura administração requer decisões sobre autenticação, persistência, permissões e validação de uploads. O formulário de contactos do frontend atual continua independente, por mailto.
