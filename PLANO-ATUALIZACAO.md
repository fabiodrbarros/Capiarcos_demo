# Atualização da versão pública

Decisão do utilizador: substituir integralmente o site servido pela versão estática atual; desenvolver o admin mais tarde. Empresa removida do menu/footer até existir uma página nova.

Entrega: frontend/dist, Docker Nginx na porta interna 3000, compose com porta pública 8080 e rede externa web. Código antigo conservado como referência, sem execução nem exposição HTTP. Volume antigo não montado nem eliminado.

Publicação manual pelo utilizador na sessão SSH, com deploy/update.sh: backup, atualização Git por fast-forward, build, substituição apenas do serviço Capiarcos, teste de saúde e recuperação automática em caso de falha de ativação. Consultar README.md.

Não foram alterados DNS, Cloudflare, outros containers ou a VPS nesta sessão.
