# 🚀 Quickstart Guide

## Setup Inicial (Solo primera vez)

### 1. Instalar Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. Crear Base de Datos D1
```bash
cd backend
wrangler d1 create vocab-platform-db
```

**IMPORTANTE**: Copia el `database_id` que aparece y reemplázalo en `backend/wrangler.toml`

### 3. Instalar Dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Inicializar Base de Datos
```bash
cd backend
wrangler d1 execute vocab-platform-db --file=./src/db/schema.sql
```

### 5. Configurar Variables de Entorno

**Backend**: Configurar JWT secret
```bash
cd backend
wrangler secret put JWT_SECRET
# Cuando pregunte, escribe un string aleatorio largo
```

**Frontend**: Crear archivo `.env`
```bash
cd frontend
cp .env.example .env
```

## Desarrollo Local

### Opción 1: Backend y Frontend separados

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Corre en http://localhost:8787
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Corre en http://localhost:5173
```

### Opción 2: Solo Frontend (con proxy)
```bash
cd backend && npm run dev &
cd frontend && npm run dev
```

## Deploy a Producción

### 1. Deploy Backend
```bash
cd backend
wrangler deploy

# Ejecutar schema en producción
wrangler d1 execute vocab-platform-db --file=./src/db/schema.sql --remote
```

### 2. Deploy Frontend
```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=vocab-platform
```

## Comandos Útiles

### Ver logs en vivo
```bash
cd backend
npm run tail
```

### Ejecutar SQL en D1
```bash
# Local
wrangler d1 execute vocab-platform-db --command="SELECT * FROM users"

# Producción
wrangler d1 execute vocab-platform-db --command="SELECT * FROM users" --remote
```

### Limpiar base de datos local
```bash
rm -rf backend/.wrangler
```

## Troubleshooting

### Error: "Database not found"
→ Asegúrate de haber actualizado el `database_id` en `wrangler.toml`

### Error: "Unauthorized"
→ Ejecuta `wrangler login` de nuevo

### Puerto ocupado
→ Cambia el puerto en `frontend/vite.config.ts` o `backend/wrangler.toml`

### Cambios en DB no aparecen
→ Re-ejecuta el schema: `wrangler d1 execute vocab-platform-db --file=./src/db/schema.sql`

## Estructura de URLs

- **Frontend Local**: http://localhost:5173
- **Backend Local**: http://localhost:8787
- **Frontend Producción**: https://vocab-platform.pages.dev
- **Backend Producción**: https://vocab-platform-api.TUUSUARIO.workers.dev
