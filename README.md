# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago (efectivo o transferencia). El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/MRSalas07/tpi-programacion-3-foodstore.git
- **Video de demostración:** https://drive.google.com/file/d/1cSOsY4vGYhFJnAFnju6f4HFuJb8Er4Cv/view?usp=sharing

| Proyecto | Stack |
|---|---|
| `backend/` | FastAPI · SQLModel · PostgreSQL · JWT en cookie HttpOnly · Unit of Work |
| `frontend/` | React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · TanStack Query, Form y Table · Zustand · Axios |

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 o superior (probado con 3.14) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

---

## 1. Base de datos

Crear una base vacía en PostgreSQL (las tablas las crea la aplicación):

```bash
createdb -U postgres foodstore_db
```

o desde `psql`: `CREATE DATABASE foodstore_db;`

> Para desarrollo local también se puede usar SQLite: en el `.env` del backend, `DATABASE_URL=sqlite:///./foodstore.db`.

---

## 2. Backend

Desde la carpeta `backend/`:

```bash
# 1. Entorno virtual
python -m venv .venv
.venv\Scripts\activate            # Windows (PowerShell / CMD)
# source .venv/bin/activate       # Linux / macOS / Git Bash

# 2. Dependencias (versiones fijadas)
pip install -r requirements.txt

# 3. Variables de entorno
copy .env.example .env            # Windows
# cp .env.example .env            # Linux / macOS
#    -> editar DATABASE_URL con el usuario y la contraseña de PostgreSQL

# 4. Datos iniciales (idempotente: se puede ejecutar varias veces)
python -m app.db.seed

# 5. Servidor
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000`, con todos los endpoints bajo `/api/v1`.

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (con credenciales) | `http://localhost:5173` |

Para generar una `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(48))"`
Luego agregalo al archivo .env para que lo tome el proyecto.

### Usuario administrador (lo crea el seed)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

El seed también carga 5 categorías y 10 productos con stock. Los clientes se crean desde la pantalla de registro (rol `user`).

---

## 3. Frontend

Con el backend en ejecución, desde la carpeta `frontend/`:

```bash
pnpm install
copy .env.example .env            # Windows
# cp .env.example .env            # Linux / macOS
pnpm build                        # verifica los tipos (TypeScript strict) y compila
pnpm dev
```

La aplicación queda en http://localhost:5173.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## Funcionalidades

**Cliente (`user`):** registro e inicio de sesión · catálogo paginado en el servidor con búsqueda por nombre y filtro por categoría · carrito persistido en el navegador · checkout con dirección, forma de pago y notas · «Mis pedidos» con detalle y cancelación mientras el pedido está `PENDIENTE` (se restituye el stock).

**Administrador (`admin`):** resumen del negocio (pedidos por estado, pedidos de hoy e ingresos) · ABM de categorías y productos · cambio de stock y disponibilidad · gestión de pedidos con filtro por estado y avance según la máquina de estados · listado de usuarios con activar y desactivar.

### Reglas de negocio

| Regla | Implementación |
|---|---|
| RN-01 Crear pedido | Una sola transacción (Unit of Work): valida productos repetidos, existencia, disponibilidad y stock; descuenta el stock y copia nombre y precio en cada línea. Si algo falla, rollback completo. |
| RN-02 Transiciones | `PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde los no terminales. Transición inválida: 400. |
| RN-03 Cancelar | Restituye el stock en la misma transacción que cambia el estado. |
| RN-04 Permisos | El cliente ve y cancela solo sus pedidos (en `PENDIENTE`); el admin ve todos y avanza o cancela. |
| RN-05 Inmutabilidad | Líneas y total fijos; no hay endpoints de edición ni de borrado de pedidos. |
| RN-06 Datos | `forma_pago` en `EFECTIVO`/`TRANSFERENCIA`; `direccion_entrega` de 5 a 200 caracteres. |

---

## Estructura

```
├── backend/
│   ├── app/
│   │   ├── core/        config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/     auth, usuarios, categorias, productos, pedidos
│   │   │                (router → service → unit_of_work → repository → models / schemas)
│   │   ├── db/seed.py   admin, categorías y productos (idempotente)
│   │   └── main.py      FastAPI, CORS con credenciales y routers bajo /api/v1
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── features/    auth, categorias, productos, usuarios, pedidos
│   │   │                (pages, components, hooks, api, types)
│   │   ├── shared/      api (axios, errores, queryClient), ui, components, layout
│   │   ├── store/       authStore y cartStore (Zustand + persist)
│   │   └── routes/      AppRouter y ProtectedRoute
│   ├── package.json
│   └── .env.example
└── README.md
```
