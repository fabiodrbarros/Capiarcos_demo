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

1. Criar/editar categorias em «Gerir categorias». A ordem mais baixa aparece primeiro. Categorias com fotografias ativas não podem ser eliminadas.
2. «Adicionar fotografia»: escolher JPEG, PNG ou WebP até 10 MB, indicar título, descrição acessível e categoria. Imagens novas ficam em rascunho.
3. «Editar fotografia»: mudar título, descrição, categoria ou ordem. Marcar «Publicar no catálogo» e guardar para aparecer no site.
4. «Retirar» remove a imagem do catálogo sem apagar o ficheiro. Recuperar em «Mostrar → Retiradas»; escolher categoria e guardar. Pode recuperar como rascunho ou publicar.
5. «Ver catálogo» abre o resultado público. As alterações entram em vigor ao guardar; não é necessário novo build.

O nome da categoria pode mudar sem quebrar o identificador usado nos filtros. Não há traduções automáticas nem produtos inventados. O conteúdo inicial é apenas a «Cozinha Teste» recebida; pode retirá-la no painel quando existirem fotografias finais.

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
