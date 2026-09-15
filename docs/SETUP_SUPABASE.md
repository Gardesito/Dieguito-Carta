# Configuración de Supabase

## Proyecto y variables

Crear un proyecto nuevo y guardar la contraseña de la base fuera del frontend. Copiar la Project URL y la clave pública `anon` o publishable en `.env.local`. Las claves secretas no se utilizan en esta aplicación. Si el proyecto ya tiene tablas con los mismos nombres, revisar la migración antes de ejecutarla; no contiene un borrado de tablas existentes.

## Base de datos

Abrir SQL Editor, pegar `supabase/migrations/001_initial_schema.sql` completo y ejecutar. Después ejecutar `supabase/seed.sql`. Alternativa con CLI de Supabase instalada y autenticada:

```sh
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

Para el seed de producción, usar SQL Editor y ejecutar el archivo separado. No ejecutar `db reset` contra una base con datos del negocio.

La migración usa transacción: si falla, resolver el error antes de continuar. Incluye UUID, relaciones, índices, restricciones, triggers `updated_at`, políticas y funciones transaccionales. `save_product` guarda producto y variantes juntos; un error revierte ambos. `reorder_items` permite únicamente productos y categorías.

## Primer administrador

En Authentication, desactivar nuevos registros públicos. Crear usuario manualmente en Users → Add user → Create new user, con correo, contraseña y confirmación de correo habilitada. Copiar su UUID. En SQL Editor:

```sql
insert into public.profiles (id, full_name, role)
values ('REEMPLAZAR-POR-UUID', 'Equipo Dieguito', 'admin');
```

Para personal que edita el menú usar `editor`. Ambos roles administran contenido y fotos; solamente `admin` administra perfiles. La aplicación no incluye registro público ni un formulario de creación de usuarios. Los perfiles se gestionan desde Supabase. Nunca asignar roles leyendo metadata que un usuario pueda editar.

En Authentication → URL Configuration, configurar Site URL con el dominio final y las URLs locales autorizadas. El login usa contraseña; no se necesita un proveedor OAuth.

## Storage

La migración configura `product-images` como público, con tamaño máximo 5.242.880 bytes y tipos `image/jpeg`, `image/png`, `image/webp`, `image/avif`. La lectura es pública. La escritura requiere un usuario autenticado con perfil admin/editor; “authenticated” por sí solo no concede permiso.

Cada subida tiene UUID nuevo. La foto anterior se conserva hasta que el registro se guarda correctamente. Antes de eliminarla se comprueba que no esté asociada a otro producto, categoría, promoción, texto o logo. Una falla de limpieza se comunica sin revertir un guardado exitoso. Un archivo huérfano puede permanecer si hay un corte de red durante la limpieza; revisarlo desde Storage y `media`.

## Verificar permisos antes de atender clientes

1. En una ventana sin sesión, abrir el catálogo y comprobar los productos públicos.
2. Marcar un producto Oculto: no debe aparecer sin sesión, ni por REST con la clave pública.
3. Desactivar una categoría: sus productos tampoco deben aparecer.
4. Crear una promoción futura y otra vencida: ninguna debe ser pública.
5. Iniciar sesión con admin y editor: ambos deben poder actualizar productos e imágenes.
6. Un usuario Auth sin perfil no debe acceder al panel ni poder escribir por REST.
7. El editor no debe poder modificar su rol ni crear perfiles.
8. Confirmar RLS habilitado en las ocho tablas; no desactivarlo para resolver un error.

El archivo `tests/database.test.ts` ejecuta estas reglas en PostgreSQL local; repetir la comprobación sobre el proyecto real después de configurar las credenciales.
