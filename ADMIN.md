# Administração do catálogo

## Acesso

O painel fica em `/admin/` (o endereço antigo `/ca-guest-admin/` redireciona). Existe um único administrador, conforme pedido. Não há palavra-passe predefinida, registo público ou credenciais no Git.

Depois de atualizar a VPS, criar o acesso na sessão SSH:

```bash
docker exec -it capiarcos-demo node server/setup-admin.mjs
```

Indicar um utilizador e uma palavra-passe com pelo menos 12 caracteres. A palavra-passe não aparece no terminal e é guardada como hash scrypt com salt aleatório no volume privado. O mesmo comando permite substituir o acesso mais tarde; as sessões anteriores ficam inválidas.

Abrir https://capiarcos.fabiodrbarros.cloud/admin/ . Até configurar o acesso, o painel mostra que ainda não foi configurado e a API não permite entrar. O site público continua disponível.

## Utilização

1. Criar/editar categorias em «Gerir categorias». Categorias com fotografias ativas não podem ser eliminadas.
2. «Adicionar item ao catálogo»: escolher JPEG, PNG ou WebP até 10 MB e preencher título, descrição e categoria. A publicação está selecionada por defeito; pode desmarcar para guardar um rascunho.
3. Ao criar ou guardar, os campos FR e EN em falta ou desatualizados são traduzidos automaticamente. Só depois de a tradução terminar é guardado o item. «Rever traduções FR / EN» permite ajustes posteriores; correções atuais são preservadas. Também disponível nas categorias.
4. «Editar item» permite substituir a fotografia e alterar os textos. Os itens mais recentes aparecem primeiro.
5. «Retirar item» oculta sem apagar os ficheiros. Recuperar em «Itens retirados».

## Idiomas e tradução gratuita

O menu público permite escolher PT, FR e EN. A língua é mantida nas ligações através de `?lang=fr` ou `?lang=en`. Os textos fixos estão traduzidos em `frontend/dist/languages.mjs` e são servidos pelo Node; executar com `npm start` (a pré-visualização estática isolada mantém PT).

A gravação usa MyMemory sem conta nem chave: https://mymemory.translated.net/doc/usagelimits.php . Limite anónimo anunciado de 5 000 caracteres/dia por IP, partilhado por pedidos FR e EN. A VPS precisa de saída HTTPS para `api.mymemory.translated.net`. Apenas os textos a traduzir são enviados; não são enviados fotografias, credenciais ou o catálogo completo. Não introduzir dados privados nos textos públicos.

As traduções ficam guardadas com o item/categoria; os visitantes não fazem chamadas ao tradutor. Pedidos repetidos têm cache em memória. Falhas ou limite diário impedem a gravação, apresentam um toast e mantêm os campos. É possível preencher manualmente. Se mudar o original português, traduza novamente: versões antigas deixam de ser apresentadas e o site usa PT como alternativa. Não há garantia de disponibilidade ou qualidade do serviço externo.

## Imagens e dados

Sharp valida e descodifica os uploads (limite de 40 megapíxeis; imagens animadas e SVG não aceites), corrige orientação e produz WebP até 2400×2400 sem ampliar. Metadados do original não são incluídos na cópia pública. Os originais são guardados de forma privada.

Volume Docker novo: `capiarcos-admin-data`, montado em `/app/data`. O volume do admin antigo permanece separado e não é importado automaticamente.

- `catalog.json`: categorias, imagens, estado, ordem e revisão.
- `images/`: cópias WebP. A API só serve imagens publicadas ou pedidos autenticados.
- `originals/`: uploads originais, sem acesso público.
- `admin.json`: utilizador e hash da palavra-passe; sem acesso público.
- `backups/`: cópia do catálogo anterior a cada alteração.

O script `deploy/update.sh` guarda o volume completo em `~/capiarcos-backups/` antes de atualizar, pausando brevemente o container para evitar alterações durante a cópia. Não usar `docker compose down -v`, que apagaria volumes. Monitorizar o espaço utilizado: originais, fotografias retiradas e backups não são apagados automaticamente.

Para uma cópia manual consistente:

```bash
backup="$HOME/capiarcos-admin-$(date +%Y%m%d-%H%M%S)"
umask 077
mkdir -p "$backup"
docker pause capiarcos-demo
trap 'docker unpause capiarcos-demo >/dev/null 2>&1 || true' EXIT
docker cp capiarcos-demo:/app/data "$backup/data"
docker unpause capiarcos-demo
trap - EXIT
```

Recuperação de dados exige parar o serviço, repor o diretório completo no volume com proprietário UID/GID 1000 e reiniciar. Não misturar só o JSON de uma versão com imagens de outra. Guardar backups fora da VPS. A recuperação automática do script de atualização repõe a imagem/configuração do serviço anterior; não reverte edições feitas no catálogo depois da publicação.

## Executar no computador

Na raiz deste repositório, com Node.js 22 ou superior:

```sh
npm ci
npm run admin:setup
npm start
```

Abrir http://127.0.0.1:4173/admin/ . O diretório local `data/` está excluído do Git. Dependência acrescentada: Sharp, para validar/otimizar fotografias; sem framework web. `npm ci` é necessário numa instalação nova do backend; já foi executada a instalação neste computador.

Para a pré-visualização local separada já iniciada em 4175, usar `DATA_DIR=data-preview` ao configurar o acesso. Em PowerShell, a partir da raiz do repositório:

```powershell
$env:DATA_DIR='data-preview'
npm run admin:setup
```

## Operação

O container serve frontend e API com Node, como utilizador não privilegiado, na mesma porta interna 3000 / externa 8080 e rede web. A configuração Nginx anterior já não é usada. `PUBLIC_ORIGIN` tem de corresponder exatamente ao domínio HTTPS do painel, sem caminho. Os cookies em produção exigem HTTPS; o Cloudflare/proxy continua responsável por TLS. Excluir `/admin/*`, `/api/*`, `/media/*` e `/catalogo/*` de regras manuais de cache no proxy, caso existam. O servidor envia `Cache-Control: no-store`.

Sessões em memória expiram ao fim de oito horas ou ao reiniciar o serviço. Login limitado a dez tentativas por origem de ligação em quinze minutos (atrás do proxy, este limite pode ser partilhado). Escritas exigem sessão, origem autorizada e token CSRF; revisões impedem uma janela antiga de sobrescrever alterações de outra. Textos do catálogo são escapados na saída HTML.

Persistência JSON com escrita atómica, adequada a este catálogo e a uma instância única do serviço. Não iniciar várias instâncias sobre o mesmo volume. Não inclui múltiplos utilizadores, email de recuperação, MFA, encomendas ou alterações ao formulário mailto. O admin anterior permanece apenas como referência em `referencia/admin/`.

## Atualização — fotografias e ordem dos itens
Os itens aparecem do último inserido para o primeiro, tanto na gestão como no catálogo público. Editar ou substituir uma fotografia não altera a posição do item. O campo de ordem manual foi retirado dos itens.
Para trocar a imagem: **Editar item → Substituir fotografia → Guardar alterações**. A imagem escolhida tem pré-visualização e passa pela mesma validação e otimização dos novos uploads. O item conserva a identidade e o estado de publicação. As imagens anteriores permanecem nos dados privados para recuperação por backup.

Na criação, Publicar no catálogo vem selecionado: Criar e publicar disponibiliza o item imediatamente. Desmarcar permite guardar rascunho. Não é necessário abrir o editor após criar para publicar.

