#!/usr/bin/env bash
# Execute from the existing VPS checkout after git fetch origin.
set -Eeuo pipefail
original_umask=$(umask)
umask 077
repo=$(git rev-parse --show-toplevel)
cd "$repo"
test "$(git branch --show-current)" = main || { echo 'Seleciona a branch main antes de atualizar.'; exit 1; }
test -z "$(git status --porcelain --untracked-files=no)" || { echo 'Existem alterações locais: guardar antes de atualizar.'; exit 1; }
git merge-base --is-ancestor HEAD origin/main
docker inspect capiarcos-demo >/dev/null
backup="$HOME/capiarcos-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup"
git rev-parse HEAD > "$backup/commit"
# After a rollback, the running service may use a compose file from a backup.
compose_source=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' capiarcos-demo)
if test -z "$compose_source" || test "$compose_source" = '<no value>'; then compose_source="$repo/docker-compose.yml"; fi
if test ! -f "$compose_source"; then
  echo 'Não foi possível localizar a configuração do serviço atual para recuperação.'
  exit 1
fi
cp "$compose_source" "$backup/docker-compose.yml"
if test -f .env; then cp .env "$backup/.env"; fi
docker inspect capiarcos-demo > "$backup/container.json"
old_image=$(docker inspect --format '{{.Image}}' capiarcos-demo)
rollback_tag="capiarcos-rollback:$(date +%Y%m%d-%H%M%S)"
docker tag "$old_image" "$rollback_tag"
printf '%s\n' "$rollback_tag" > "$backup/image"
if docker exec capiarcos-demo test -d /app/public/assets/img/catalogo; then
  docker cp capiarcos-demo:/app/public/assets/img/catalogo "$backup/catalogo"
fi
if docker exec capiarcos-demo test -f /app/data/catalog.json; then
  # Pause writes while taking a consistent catalogue + image snapshot.
  docker pause capiarcos-demo >/dev/null
  trap 'docker unpause capiarcos-demo >/dev/null 2>&1 || true' EXIT
  docker cp capiarcos-demo:/app/data "$backup/admin-data"
  docker unpause capiarcos-demo >/dev/null
  trap - EXIT
fi
printf '#!/usr/bin/env bash\nset -euo pipefail\ncd %q\ndocker tag %q capiarcos_demo-capiarcos-demo\ndocker compose --project-directory %q -f %q up -d --no-deps --no-build capiarcos-demo\n' "$repo" "$rollback_tag" "$repo" "$backup/docker-compose.yml" > "$backup/rollback.sh"
switching=0
on_error() {
  code=$?
  trap - ERR
  echo "Atualização falhou. Cópia: $backup"
  if test "$switching" = 1; then
    docker logs --tail 100 capiarcos-demo > "$backup/failed-container.log" 2>&1 || true
    docker inspect --format '{{json .State}}' capiarcos-demo > "$backup/failed-state.json" 2>&1 || true
    echo "Diagnóstico guardado em $backup/failed-container.log e failed-state.json"
    bash "$backup/rollback.sh" || echo "Executar recuperação manual: bash $backup/rollback.sh"
  fi
  exit "$code"
}
trap on_error ERR
echo "Cópia de segurança: $backup"
# Restrict backup files only, not files created by the Git checkout.
umask "$original_umask"
git merge --ff-only origin/main
docker compose config --quiet
docker compose build capiarcos-demo
switching=1
docker compose up -d --no-deps --no-build capiarcos-demo
ready=0
for attempt in {1..45}; do
  if test "$(docker inspect --format '{{.State.Health.Status}}' capiarcos-demo)" = healthy; then ready=1; break; fi
  sleep 2
done
test "$ready" = 1
for path in / /catalogo/ /contactos/ /scroll-home.mjs; do
  docker exec capiarcos-demo wget -q -O /dev/null "http://127.0.0.1:3000$path"
done
switching=0
echo "Atualização concluída. Commit: $(git rev-parse --short HEAD)"
echo 'Verificar agora https://capiarcos.fabiodrbarros.cloud/ no browser.'
echo "Para recuperar o serviço anterior: bash $backup/rollback.sh"
