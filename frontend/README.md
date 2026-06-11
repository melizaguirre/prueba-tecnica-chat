# Prueba Técnica Chat

### Frontend

(Pegar aquí la URL de Vercel)

### Backend

https://backend.prueba-tecnica-chat.workers.dev

### Chat de ejemplo

/chats/1


## Ejecutar Backend Localmente

```bash
cd backend
bun install
bun run dev


Variable de entorno requerida:

```env
DATABASE_URL=tu_database_url
```


## Ejecutar Frontend Localmente

```bash
cd frontend
bun install
bun run dev
```

Variable de entorno requerida:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```