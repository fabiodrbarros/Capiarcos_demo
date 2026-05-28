# Capiarcos — site + plataforma de gestão

Site institucional da Capiarcos (Home, Empresa, Catálogo, Contactos) com
**plataforma de admin** integrada para gerir as imagens do catálogo via
drag-and-drop. As imagens carregadas aparecem automaticamente na página
pública `/catalogo.html`.

---

## Como correr (local)

Requer **Node.js 18 ou superior**.

```bash
# 1) Instalar dependências
npm install

# 2) Definir password de admin (opcional — default: capiarcos-admin)
export ADMIN_PASSWORD="qualquer-coisa-segura"

# 3) Arrancar
npm start
```

Depois:

| Endereço                                | Para quê               |
| --------------------------------------- | ---------------------- |
| `http://localhost:3000/`                | Site público           |
| `http://localhost:3000/catalogo.html`   | Catálogo (dinâmico)    |
| `http://localhost:3000/admin/`          | Plataforma de gestão   |

> Para desenvolvimento com reload automático: `npm run dev`.

---

## Plataforma de admin

1. Abrir `http://localhost:3000/admin/` e fazer login com a password
   definida em `ADMIN_PASSWORD`.
2. Selecionar uma categoria na barra lateral
   (Cozinhas, Roupeiros, Salas, Quartos, Casas de Banho, Pavimentos,
   Portas, Escadas).
3. **Arrastar imagens** para a zona de upload — ou clicar para escolher.
   Várias imagens de uma vez são suportadas.
4. As imagens aparecem de imediato na grelha; clicar no `×` apaga-as.
5. Recarregar `/catalogo.html` para ver o resultado no site.

A sessão dura 7 dias (cookie `cap_admin`).

---

## Estrutura

```
Cpi/
├── server.js                       # Express server (site + admin + API)
├── package.json
├── README.md
│
├── index.html                      # Home (pública, estática)
├── empresa.html                    # Sobre a empresa
├── catalogo.html                   # Catálogo (lê /api/manifest)
├── contactos.html                  # Contactos + mapa
│
├── admin/
│   └── index.html                  # UI da plataforma
│
└── assets/
    ├── css/
    │   ├── style.css               # Estilos do site público
    │   └── admin.css               # Estilos da plataforma
    ├── js/
    │   ├── main.js                 # i18n + nav + animações do site
    │   └── admin.js                # Lógica do admin (upload/delete)
    └── img/
        ├── logo.png                # Logotipo
        ├── empresa.png             # Foto institucional (página Empresa)
        ├── areas/                  # Thumbs das áreas da home
        └── catalogo/               # ← Onde a plataforma guarda
            ├── cozinhas/
            ├── roupeiros/
            ├── salas/
            ├── quartos/
            ├── casas-de-banho/
            ├── pavimentos/
            ├── portas/
            └── escadas/
```

---

## API (referência rápida)

| Método   | Rota                                          | Auth | O que faz                                  |
| -------- | --------------------------------------------- | ---- | ------------------------------------------ |
| `GET`    | `/api/manifest`                               | —    | Devolve categorias + imagens em cada uma  |
| `POST`   | `/api/login`                                  | —    | `{ password }` → sessão                    |
| `POST`   | `/api/logout`                                 | —    | Termina sessão                              |
| `GET`    | `/api/me`                                     | —    | `{ authed: true|false }`                   |
| `POST`   | `/api/upload?categoria=<slug>`                | ✓    | Multipart `files[]` → guarda na pasta     |
| `DELETE` | `/api/image?categoria=<slug>&file=<nome>`     | ✓    | Apaga o ficheiro indicado                  |

Categorias válidas (`slug`): `cozinhas`, `roupeiros`, `salas`, `quartos`,
`casas-de-banho`, `pavimentos`, `portas`, `escadas`.

Restrições de upload: só imagens, máx. **25 MB** por ficheiro, **30 ficheiros**
por pedido.

---

## Variáveis de ambiente

| Variável         | Default              | Descrição                                |
| ---------------- | -------------------- | ----------------------------------------- |
| `PORT`           | `3000`               | Porta HTTP                                |
| `ADMIN_PASSWORD` | `capiarcos-admin`    | Password do dashboard                     |

Para produção, **mudar sempre** o `ADMIN_PASSWORD`.

---

## Deploy (resumo)

Qualquer host que corra Node 18+ serve. Exemplos rápidos:

- **VPS / DigitalOcean** — `pm2 start server.js` (ou `systemd`),
  proxy reverso por Nginx, HTTPS via Let's Encrypt.
- **Railway / Render / Fly** — push do repositório, definir
  `ADMIN_PASSWORD` nas env vars, expor porta 3000.

> **Importante**: a pasta `assets/img/catalogo/` precisa de ser
> **persistente** (não efémera). Em hosts que rebuildam o sistema de
> ficheiros a cada deploy, montar volume / object storage.
