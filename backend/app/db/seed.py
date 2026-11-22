"""Carga el usuario admin, las categorías y los productos de prueba.

Uso (desde la carpeta backend, con la base creada y el .env configurado):

    python -m app.db.seed

Idempotente: antes de insertar cada registro verifica si ya existe,
por lo que se puede ejecutar varias veces sin duplicar datos.

Usuario administrador:
    admin / Admin1234!  -> rol admin
"""
from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401 (registra las tablas)
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

IMG = "https://images.unsplash.com/photo-{}?w=600&q=70"

# (username, nombre completo, email, contraseña, rol)
ADMIN = ("admin", "Administrador Food Store", "admin@foodstore.com", "Admin1234!", "admin")

# (nombre, descripción)
CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas de carne con papas opcionales"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Acompañamientos", "Papas, ensaladas y más"),
    ("Bebidas", "Aguas y gaseosas"),
    ("Postres", "Dulces para terminar"),
]

# (nombre, descripción, precio, stock, imagen, categoría)
PRODUCTOS = [
    ("Hamburguesa cheddar", "Carne, doble queso cheddar", 8500, 20,
     IMG.format("1568901346375-23c9450c58cd"), "Hamburguesas"),
    ("Hamburguesa doble", "Doble medallón de carne y doble cheddar", 11200, 15,
     IMG.format("1550547660-d9450f859349"), "Hamburguesas"),
    ("Combo burger con papas", "Hamburguesa cheddar con porción de papas", 12500, 10,
     IMG.format("1571091718767-18b5b1457add"), "Hamburguesas"),
    ("Pizza muzzarella", "Salsa de tomate, muzzarella y orégano", 9800, 12,
     IMG.format("1513104890138-7c749659a591"), "Pizzas"),
    ("Pizza de pollo", "Pollo grillado, cebolla morada y muzzarella", 11500, 8,
     IMG.format("1565299624946-b28f40a0ae38"), "Pizzas"),
    ("Papas fritas", "Porción grande con perejil y ajo", 3200, 30,
     IMG.format("1573080496219-bb080dd4f877"), "Acompañamientos"),
    ("Ensalada fresca", "Hojas verdes, tomate, palta y semillas", 5600, 10,
     IMG.format("1512621776951-a57141f2eefd"), "Acompañamientos"),
    ("Agua mineral 500 ml", "Sin gas", 1800, 50,
     IMG.format("1548839140-29a749e1cf4d"), "Bebidas"),
    ("Gaseosa 500 ml", "Línea cola, botella individual", 2200, 40, "", "Bebidas"),
    ("Brownie con helado", "Brownie tibio con dos bochas de helado de vainilla", 4800, 10,
     IMG.format("1624353365286-3f8d62daad51"), "Postres"),
]


def _cargar_admin(session: Session) -> None:
    username, full_name, email, password, role = ADMIN
    if session.exec(select(Usuario).where(Usuario.username == username)).first():
        return
    session.add(
        Usuario(
            username=username,
            full_name=full_name,
            email=email,
            hashed_password=hash_password(password),
            role=role,
        )
    )
    session.commit()
    print(f"  [+] Usuario {username} / {password} (rol {role})")


def _cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    nuevas = 0
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            nuevas += 1
        categorias[nombre] = categoria
    session.commit()
    if nuevas:
        print(f"  [+] {nuevas} categorías")
    return categorias


def _cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    nuevos = 0
    for nombre, descripcion, precio, stock, imagen, categoria in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
            continue
        session.add(
            Producto(
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                stock=stock,
                imagen_url=imagen,
                categoria_id=categorias[categoria].id,
            )
        )
        nuevos += 1
    session.commit()
    if nuevos:
        print(f"  [+] {nuevos} productos con stock")


def run() -> None:
    print("=== Seed — Food Store ===")
    create_all_tables()

    with Session(engine) as session:
        _cargar_admin(session)
        categorias = _cargar_categorias(session)
        _cargar_productos(session, categorias)
    print("Seed finalizado.")


if __name__ == "__main__":
    run()
