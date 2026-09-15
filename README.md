# Dieguito · Pizzería y restaurante de Ushuaia

Aplicación React + Vite + TypeScript. Catálogo responsive y administrador privado con Supabase Auth, PostgreSQL y Storage. Sin carrito: los pedidos y consultas se envían por WhatsApp.

El proyecto principal está en **esta raíz**. `dieguito-catalogo/` era un borrador JavaScript preexistente y se conserva sin modificar; no hace falta entrar allí.

## Inicio rápido

Requisitos: Node.js 22.12 o superior, npm y un proyecto Supabase para usar la administración.

```sh
npm install
```

Copiar `.env.example` a `.env.local` y completar:

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON_O_PUBLISHABLE
VITE_DEFAULT_WHATSAPP=549CODIGOAREANUMERO
VITE_SITE_URL=https://TU-DOMINIO
```

Las variables `VITE_` son públicas. **Nunca usar la clave secreta ni `service_role`**. El número debe ser real, con país y área, sin espacios. `VITE_SITE_URL` es el dominio público definitivo; sin él, el build genera robots `noindex` y un sitemap vacío para no indexar la demostración.

```sh
npm run dev
```

Abrir la URL que imprime Vite. Por defecto: `http://127.0.0.1:5173`. Si ese puerto está ocupado, Vite elige otro.

Sin variables de Supabase, el catálogo muestra **datos de demostración identificados**. El login explica la configuración pendiente y no permite simular una sesión ni escrituras. No hay credenciales incluidas.

## Conectar Supabase

1. Crear un proyecto en Supabase.
2. En SQL Editor, ejecutar **completo** `supabase/migrations/001_initial_schema.sql` una sola vez sobre un proyecto vacío.
3. Ejecutar `supabase/seed.sql` para cargar 19 categorías, 5 productos, una promoción y los textos iniciales. Es repetible y no pisa registros existentes.
4. Deshabilitar el registro público en Authentication → Providers → Email / configuración de registro.
5. Crear manualmente un usuario en Authentication → Users → Add user y copiar su UUID.
6. Ejecutar, reemplazando el UUID:

```sql
insert into public.profiles(id, full_name, role)
values ('UUID-DEL-USUARIO', 'Administración Dieguito', 'admin');
```

7. Completar `.env.local`, reiniciar Vite e ingresar en `/login`.

La migración crea el bucket `product-images`, las restricciones y sus políticas. No hace falta crear otro bucket. [Configuración completa](docs/SETUP_SUPABASE.md).

## Qué incluye

- `/`: catálogo, búsqueda sin acentos, filtros combinados, promociones vigentes, contacto y detalle de productos.
- `/login`: acceso con correo y contraseña, restauración de sesión y retorno a la ruta solicitada.
- `/admin`: indicadores y accesos rápidos.
- `/admin/productos`: crear, editar, duplicar, ocultar, eliminar, variantes y orden con mouse o teclado.
- `/admin/categorias`: CRUD, visibilidad, fotos y orden.
- `/admin/promociones`: CRUD, activación y programación por fechas.
- `/admin/contenido`: portada y Nosotros, vista previa aislada desktop/mobile, textos e imágenes editables y diseño bloqueado.
- `/admin/configuracion`: WhatsApp, nombre, dirección, redes, logo y horarios.
- `/admin/vista-previa`: ruta interna protegida del editor.

Cada guardado publica inmediatamente. El editor visual mantiene borradores locales en memoria mientras estás en esa pantalla; **guardar una sección no guarda las demás**. Los borradores no son una programación editorial ni se comparten con otros administradores.

## WhatsApp y mesas

Cambiar el número desde Administración → Configuración. El valor de Supabase tiene prioridad sobre `VITE_DEFAULT_WHATSAPP`.

```text
https://TU-DOMINIO/?mesa=1
https://TU-DOMINIO/?mesa=2
https://TU-DOMINIO/?mesa=Salon-A
```

Convertir cada URL en un QR con una herramienta de QR e imprimirlo para esa mesa. El parámetro acepta solo letras ASCII, números y guiones, con máximo 20 caracteres. No se guardan datos personales ni mesas en la base. El cliente debe seleccionar tamaño o variante antes de pedir cuando corresponda.

## Comandos y comprobaciones

```sh
npm run lint
npm test
npm run test:e2e
npm run build
npm run preview
```

`build` comprueba TypeScript, compila Vite y genera los metadatos estáticos de despliegue. El resultado está en `dist/`. `test` cubre moneda, filtros, variantes, WhatsApp, imágenes y RLS con PostgreSQL local PGlite. Este último simula los esquemas de Auth y Storage: **no prueba un servicio Supabase remoto**. Las pruebas de navegador utilizan Edge sin ventana; si no está instalado, instalar Chromium con `npx playwright install chromium` y quitar `channel: 'msedge'` en las configuraciones de Playwright.

La guía de verificación y los límites de las pruebas están en [TESTING.md](docs/TESTING.md).

## Publicar en Vercel

Subir la raíz a un repositorio propio e importarlo en Vercel. Seleccionar Vite, comando `npm run build`, salida `dist`. Agregar las cuatro variables, ejecutar la migración en Supabase y desplegar. `vercel.json` permite abrir y recargar las rutas del administrador. No subir `.env.local`. [Guía completa](docs/DEPLOYMENT.md).

## Datos, fotos y recuperación ante errores

La demostración usa fotografías ilustrativas, no fotos verificadas del local. Reemplazarlas y confirmar precios, dirección, redes, WhatsApp y horarios antes de usar el sitio con clientes. El logo inicial es tipográfico porque no se proporcionó el logo oficial.

El catálogo conserva la última respuesta pública válida en el navegador, separada por proyecto Supabase. Ante un error, mantiene esa versión y muestra Reintentar. Si no hay caché, muestra la demostración identificada. Los datos privados no se guardan en esa caché. La imagen anterior se elimina solamente después del guardado exitoso y si no está compartida por otros registros.

## Errores frecuentes

- **No puedo entrar:** confirmar variables, usuario de Auth, contraseña y fila en `profiles`. Verificar que el proyecto Supabase esté activo.
- **No tengo permisos:** el usuario necesita rol `admin` o `editor`; no alcanza con estar autenticado.
- **No aparecen productos:** revisar Visible, categoría activa y políticas RLS.
- **Nombre duplicado:** elegir otro nombre; los slugs son únicos.
- **No puedo borrar una categoría:** reasignar sus productos antes de eliminarla.
- **La foto no sube:** JPG/PNG/WEBP/AVIF, hasta 5 MB, sesión válida y bucket correcto.
- **Una imagen antigua quedó pendiente:** el guardado ya está hecho; conservarla hasta confirmar en `media` que no se utiliza. No borrar archivos compartidos a ciegas.
- **WhatsApp no abre:** configurar un número real. El marcador de `.env.example` no es un teléfono.
- **Ruta 404 en hosting:** comprobar la configuración SPA de `vercel.json`.
- **Cambios en `.env` no aparecen:** reiniciar Vite o generar un nuevo despliegue.

Más documentación: [Guía del administrador](docs/ADMIN_GUIDE.md), [Base de datos](docs/DATABASE.md).
