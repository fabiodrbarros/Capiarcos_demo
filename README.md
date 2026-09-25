# Capiarcos — site e gestão do catálogo

A proposta visual aprovada está em `frontend/dist/`: são os próprios fontes. O servidor em `server/` serve estas páginas e liga o catálogo aos dados editados no painel `admin/`. Home, contactos, assets e animações mantêm a versão aprovada.

## Executar

Node.js 22 ou superior:

```sh
npm ci
npm run admin:setup
npm start
```

Abrir http://127.0.0.1:4173 e http://127.0.0.1:4173/admin/ . Numa cópia já instalada basta `npm start`. Sem configurar o administrador, o site funciona e o painel informa que falta criar o acesso. Não existem credenciais predefinidas.

`npm run build` valida os fontes sem apagar/reconstruir dist. `npm test` testa autenticação, upload, publicação, segurança dos textos, conflitos e persistência numa pasta temporária.

## Atualizar a VPS

Na sessão SSH:

```bash
cd ~/Capiarcos_demo
git fetch origin
bash <(git show origin/main:deploy/update.sh)
```

O script guarda cópia de segurança, constrói e substitui apenas capiarcos-demo, mantendo 8080:3000 e a rede web. Tenta recuperar o serviço anterior se a ativação falhar. Não altera Cloudflare nem outros serviços. A execução na VPS é feita pelo utilizador.

Na primeira publicação do admin, criar o acesso:

```bash
docker exec -it capiarcos-demo node server/setup-admin.mjs
```

Depois abrir https://capiarcos.fabiodrbarros.cloud/admin/ . Consultar [ADMIN.md](ADMIN.md) para utilização, armazenamento, backups, recuperação, configuração e limites. Os dados persistem no novo volume capiarcos-admin-data; o volume antigo não é apagado nem importado automaticamente.

## Estrutura

- `frontend/dist/`: site aprovado, assets originais e cópias otimizadas.
- `admin/`: interface de administração sem framework.
- `server/`: API, autenticação, persistência, processamento de imagens e testes.
- `data/`: dados locais privados, excluídos do Git e da imagem Docker.
- `deploy/`: atualização e recuperação na VPS.
- `referencia/admin/`: código do admin anterior, apenas contexto.

O Docker passou de Nginx estático para Node para suportar a API, mantendo nome, rede e portas do serviço. Sharp é a única dependência direta acrescentada, necessária para validar e otimizar uploads. O catálogo é renderizado pelo servidor com o mesmo HTML/CSS do site e continua a funcionar sem JavaScript; filtros e ampliação utilizam o módulo existente.

Empresa continua sem link até existir página nova. O formulário continua mailto, sem envio de email pelo servidor. Não foram acrescentadas traduções, produtos fictícios ou credenciais. As notas históricas em frontend/ESTADO-ATUAL.md e frontend/INTEGRACOES.md devem ser lidas com a atualização do admin documentada em ADMIN.md.
