# Modelo de datos

| Tabla            | Función                                       | Relaciones y eliminación                            |
| ---------------- | --------------------------------------------- | --------------------------------------------------- |
| profiles         | Rol admin/editor y nombre                     | UUID de auth.users; eliminar usuario elimina perfil |
| categories       | Clasificación, foto, visibilidad y orden      | No se puede eliminar con productos asociados        |
| products         | Nombre, ingredientes, precios, foto y estados | category_id obligatorio                             |
| product_variants | Opciones con precio y disponibilidad          | Se eliminan con el producto                         |
| promotions       | Ofertas y vigencia                            | Eliminar producto pone product_id en null           |
| site_content     | Portada y Nosotros                            | content_key único: hero/about                       |
| site_settings    | Datos públicos del restaurante                | Índice singleton: una sola fila                     |
| media            | Registro de archivos subidos                  | storage_path único; sin credenciales                |

Todas las tablas tienen RLS. Los registros de contenido incluyen `image_alt`; configuración incluye `logo_alt`. Son extensiones del esquema pedido para permitir texto alternativo editable. `opening_hours` es un array JSON de `{day, hours, closed}`. `site_content.metadata.promotion_id` vincula opcionalmente una promoción; si ya no existe o no está vigente, no se muestra en la portada.

Los precios son numeric(12,2), no negativos y opcionalmente null. Un null no equivale a cero. Las variantes tienen precio obligatorio. Los tamaños y variantes se seleccionan antes de generar el mensaje; no hay carrito.

## Autorización

Visitantes leen categorías activas, productos visibles pertenecientes a categorías activas, variantes de esos productos, promociones activas/vigentes, secciones visibles y configuración pública. No acceden a `media` ni a `profiles`.

Staff (admin/editor) administra contenido e imágenes. Un perfil puede leerse a sí mismo; solo admin gestiona perfiles. `is_staff()` e `is_admin()` son funciones de lectura SECURITY DEFINER con search_path vacío para evitar recursión de RLS. No permiten conceder roles.

`save_product` y `reorder_items` son SECURITY INVOKER: respetan RLS y comprueban rol. No hay una función pública que permita autoasignarse permisos. Los roles deben crearse por un administrador del proyecto.

## Guardados y orden

`save_product(payload, variants)` hace upsert del producto y reemplaza sus variantes dentro de una transacción. Un precio inválido revierte todo. Los UUID de variantes existentes se conservan si se envían de nuevo.

`reorder_items(table_name, ordered_ids)` actualiza orden con ordinalidad en una sola llamada; acepta solo products/categories. El panel deshabilita ordenar productos cuando hay filtros para evitar reordenamientos parciales ambiguos.

`updated_at` se actualiza automáticamente en profiles, categories, products, promotions, site_content y site_settings. Las fechas de vigencia de promociones usan timestamptz; el formulario convierte desde la hora local del dispositivo a UTC.

## Caché y consistencia

Se guarda únicamente la respuesta pública filtrada, por proyecto, en localStorage. Las solicitudes simultáneas se deduplican. Un guardado del panel refresca las consultas. Un visitante recibe nuevos datos al recargar; la caché no reemplaza la base ni garantiza disponibilidad en tiempo real cuando no hay conexión. Las promociones vencidas se filtran también en el cliente.

La base no almacena mesas ni mensajes de WhatsApp. No hay pagos ni datos de clientes.

## Validación

`tests/database.test.ts` crea roles y esquemas Auth/Storage de prueba en PostgreSQL embebido PGlite, aplica la migración y el seed, y verifica RLS, integridad y transacciones. Se omite `create extension pgcrypto` únicamente en ese entorno porque gen_random_uuid ya existe. No reemplaza probar Supabase Auth ni Storage reales.
