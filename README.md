# Vocab Platform - Plataforma Educativa de Vocabulario Español

Plataforma funcional para enseñanza de vocabulario español a estudiantes angloparlantes, construida con Cloudflare Stack.

## 🏗️ Stack Tecnológico

- **Frontend**: React + Vite + TypeScript
- **Backend**: Cloudflare Workers
- **Base de datos**: Cloudflare D1 (SQLite distribuido)
- **Storage**: Cloudflare R2 (preparado)
- **Auth**: Custom (email + password hash)
- **Deploy**: Cloudflare Pages + Wrangler

## 📁 Estructura del Proyecto

```
vocab-platform/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── pages/    # Páginas principales
│   │   ├── components/  # Componentes reutilizables
│   │   ├── hooks/    # Custom hooks
│   │   ├── services/ # API client
│   │   └── main.tsx  # Entry point
│   └── vite.config.ts
│
├── backend/          # Cloudflare Workers API
│   ├── src/
│   │   ├── routes/   # Endpoints (auth, vocab, progress)
│   │   ├── db/       # Schema + queries
│   │   └── utils/    # Auth helpers
│   └── wrangler.toml
│
└── README.md
```

## 🚀 Instalación y Setup

### Prerequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Cloudflare (gratis)
- Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 1. Backend Setup

```bash
cd backend
npm install

# Crear D1 database
wrangler d1 create vocab-platform-db

# Copiar el database_id que aparece y actualizar wrangler.toml

# Inicializar schema
wrangler d1 execute vocab-platform-db --file=./src/db/schema.sql

# Desarrollo local
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configurar API URL en .env
echo "VITE_API_URL=http://localhost:8787" > .env

# Desarrollo local
npm run dev
```

## 🌐 Deploy a Producción

### Backend (Workers)

```bash
cd backend

# Deploy worker
wrangler deploy

# Ejecutar migrations en producción
wrangler d1 execute vocab-platform-db --file=./src/db/schema.sql --remote
```

### Frontend (Pages)

```bash
cd frontend

# Build
npm run build

# Deploy a Cloudflare Pages
wrangler pages deploy dist --project-name=vocab-platform
```

## 🔐 Variables de Entorno

### Backend (wrangler.toml)

```toml
[vars]
JWT_SECRET = "tu-secret-super-seguro-aqui"
ENVIRONMENT = "production"
```

### Frontend (.env)

```env
VITE_API_URL=https://tu-worker.tu-cuenta.workers.dev
```

## 🎯 Funcionalidades MVP

### Para Estudiantes
- ✅ Registro e inicio de sesión
- ✅ Ver lista de vocabulario
- ✅ Flashcards interactivas
- ✅ Marcar palabras (aprendida, en progreso, difícil)
- ✅ Ver progreso personal

### Para Profesora
- ✅ Crear y editar vocabulario
- ✅ Ver progreso agregado de estudiantes
- ✅ Identificar palabras más difíciles

### Preparado (no activo)
- 🔄 Integración IA para ejemplos contextuales
- 🔄 TTS para pronunciación
- 🔄 Almacenamiento de audio (R2)

## 🗄️ Base de Datos (D1)

### Tablas

- `users` - Usuarios (estudiantes y profesoras)
- `sessions` - Sesiones activas
- `vocab_items` - Palabras y traducciones
- `vocab_examples` - Ejemplos de uso
- `user_progress` - Progreso individual por palabra

## 🧪 Testing Local

```bash
# Backend con Wrangler
cd backend
npm run dev  # http://localhost:8787

# Frontend con Vite
cd frontend
npm run dev  # http://localhost:5173
```

## 📝 Próximos Pasos (Post-MVP)

1. Integrar IA pedagógica (OpenAI/Claude API)
2. Implementar TTS con Cloudflare AI
3. Sistema de spaced repetition
4. Modo multi-profesor
5. Analytics educativo

## 💰 Costos (Plan Gratuito)

- Cloudflare Pages: ✅ Gratis (500 builds/mes)
- Cloudflare Workers: ✅ Gratis (100k requests/día)
- D1: ✅ Gratis (5GB storage, 5M reads/día)
- R2: ✅ Gratis (10GB storage)

**Total**: $0/mes para uso educativo moderado

## 🆘 Soporte

Para problemas técnicos:
- Revisar logs: `wrangler tail`
- Documentación: https://developers.cloudflare.com
- D1 Beta: https://developers.cloudflare.com/d1

## 📄 Licencia

MIT - Úsalo libremente para educación
