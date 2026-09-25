# Capiarcos — frontend atual

A versão aprovada encontra-se em `frontend/dist/`: esta pasta contém os próprios fontes. Não apagar como se fosse um build descartável. Os assets originais e as cópias otimizadas são preservados.

## Executar e verificar

Com Node.js 18 ou superior, sem instalação de dependências:

```sh
npm start
npm run build
```

Abrir http://127.0.0.1:4173. O build valida os fontes sem reconstruir o site.

## Atualizar a VPS existente

Na sessão SSH `fabiodrb@100.115.15.20`:

```bash
cd ~/Capiarcos_demo
git fetch origin
bash <(git show origin/main:deploy/update.sh)
```

O script exige main sem alterações em ficheiros controlados, guarda o commit, configuração Docker, eventual .env, imagem anterior e cópia do catálogo antigo em `~/capiarcos-backups/`. Constrói antes de substituir apenas o serviço capiarcos-demo, mantendo porta 8080:3000 e rede web. Não modifica Cloudflare nem os outros serviços. Não elimina volumes.

Se a ativação ou os testes HTTP falharem, tenta recuperar automaticamente o serviço anterior. Para recuperação posterior, executar `bash CAMINHO-DA-COPIA/rollback.sh`, usando o caminho apresentado pelo script. A recuperação repõe o serviço e a imagem anteriores; não altera o checkout Git. Guardar a cópia e a imagem Docker até aceitar a publicação. A cópia do catálogo não é uma snapshot transacional: evitar alterações no admin durante a atualização.

Depois, verificar https://capiarcos.fabiodrbarros.cloud/ incluindo catálogo, contactos, menu, imagens e footer. A execução na VPS e esta verificação pública ficam a cargo do utilizador; não foram realizadas nesta sessão. Se existir cache configurada manualmente no Cloudflare, poderá ser necessário purgar essa cache após publicar.

## Estrutura e limites

O Docker serve exclusivamente `frontend/dist/` com Nginx, após validação numa etapa Node. O site antigo, os seus assets e as configurações Next foram removidos do checkout. Apenas o código do admin e as suas dependências locais foram guardados em `referencia/admin/`, como contexto para trabalho futuro. Esta referência não é uma aplicação executável e não entra na imagem Docker. O histórico Git anterior permanece disponível.

A administração, API e Empresa antigas deixam de estar disponíveis. O link Empresa foi retirado por indicação do utilizador. O formulário continua a abrir o cliente de email por mailto; não envia email através do servidor. Sem backend/CMS, traduções ou credenciais adicionadas.

Ver `frontend/ESTADO-ATUAL.md`, `frontend/VALIDACAO-LOCAL.md` e `frontend/INTEGRACOES.md` para composição, testes e integrações pendentes.
