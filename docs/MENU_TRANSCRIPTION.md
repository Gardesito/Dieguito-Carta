# Transcripción de la carta de Dieguito

Fecha: 15 de septiembre de 2026. Fuente: texto completo proporcionado por el usuario.

## Resultado

**184 artículos en 14 categorías, más 9 adicionales de salsa.** Las salsas están relacionadas con las 10 pastas mediante 90 variantes; no cuentan como productos independientes.

| Categoría | Artículos |
| --- | ---: |
| Sándwiches | 10 |
| Parrillada | 9 |
| Del Mar | 10 |
| Platos Especiales | 7 |
| Empanadas | 20 |
| Minutas | 10 |
| Pizzas | 22 |
| Pizzas de la Bahía | 6 |
| Hamburguesas Caseras | 10 |
| Pastas | 10 |
| Postres | 8 |
| Bebidas | 7 |
| Cervezas | 15 |
| Vinos | 40 |
| **Total** | **184** |

## Precios pendientes

Todos conservan precios nulos y la leyenda `Consultar precio`:

- Pizzas de la Bahía: Merluza Negra, ambos tamaños.
- Postres: Bombón Calafate, Bombón Suizo, Budín de Pan, Choco Oreo, Flan Casero, Tiramisú, Vigilante y Adicional.

Los importes se pueden completar desde el administrador. Al cargar un precio se muestra ese importe sin repetir la leyenda de consulta.

## Decisiones y datos para revisión

- Se utiliza el esquema real con nombres `snake_case`, UUID, categorías, productos y variantes. `price_label` usa cadena vacía cuando no corresponde una aclaración porque el esquema exige texto no nulo.
- Todos los artículos comienzan disponibles, visibles y sin destacar. Se respetan los órdenes recibidos.
- Los slugs incluyen la categoría. Vacío permanece separado como `sandwich-vacio` (24000) y `parrillada-vacio` (27000). Se conservan todos los nombres repetidos entre categorías.
- Los 28 artículos de pizza son registros individuales: 27 tienen precios chico/grande y Merluza Negra tiene ambos importes pendientes. Se exige tamaño antes de consultar, también para esta última.
- Las aclaraciones de guarnición se conservan en Sándwiches, Platos Especiales y Minutas, en la categoría y en las descripciones. La nota de orégano y aceitunas se mantiene en Pizzas, sin extenderla a Pizzas de la Bahía, donde no fue proporcionada.
- Solo se cargan ingredientes expresamente recibidos. La parrillada mixta de mar conserva la descripción “Abadejo, salmón y merluza negra.”.
- Las empanadas usan `Por unidad`. Las salsas usan `is_addon: true`: se suman al precio base únicamente al elegirlas y se puede volver a “Sin adicional”. Cada pasta permite administrar sus propios adicionales.
- Cervezas contiene también los aperitivos como artículos separados, conforme a las 14 categorías solicitadas.
- `Agua 500 ml / Agua con gas` permanece como un artículo. No se deducen marcas ni volúmenes ausentes.
- `Fond de Cave / La Linda` permanece como un registro de 14500; `Fond de Cave` permanece como otro de 19500.
- Se mantienen los nombres comerciales recibidos, incluidos `Bosco M.`, `Tucumen tinto`, `Donde Manda Capitán...`, `Escorihuela Familia`, `Killka` y `D. V. Catena`. No se expanden abreviaturas ni se corrigen marcas dudosas; cualquier cambio requiere confirmación del local.
- Se conservan `Muzzarella`, `Calabreza` y `Bolognesa`. Se usa “ajo, panceta” en Dieguito.
- No se inventó qué incluye el postre “Adicional”; su detalle y precio requieren confirmación.
- Los artículos sin foto usan el placeholder gastronómico existente. Se conservaron las imágenes institucionales y de portada.

## Supabase y respaldo local

- `src/data/menuData.ts` contiene la carta completa y alimenta el catálogo sin Supabase. Se invalidó la clave antigua de caché para evitar recuperar la demostración.
- `supabase/migrations/002_variant_addons.sql` incorpora el indicador de adicional y actualiza la función transaccional `save_product`, conservando permisos y RLS.
- Aplicar las migraciones en orden y después ejecutar `supabase/seed-menu.sql` en una instalación existente. Para una instalación nueva, `supabase/seed.sql` ya contiene la carta y el contenido/configuración originales.
- Los seeds insertan o actualizan por slug y resuelven las relaciones mediante las categorías existentes; las variantes usan UUID estables. Repetirlos no duplica registros. Reejecutarlos restaura precios, textos, disponibilidad y orden de la transcripción; conserva fotografías existentes.
- La limpieza se limita a los UUID y slugs conocidos de la demostración y sus categorías sobrantes vacías. No se hace un borrado general de productos, promociones, configuración o contenido personalizado.
- Se retira la promoción ficticia “Hoy se comparte”; la funcionalidad para administrar promociones permanece.
- El administrador conserva slugs al editar y usa identificadores únicos al crear o duplicar. Mantiene edición de nombre, descripción, ingredientes, precios, tamaños, categoría, orden, disponibilidad, visibilidad y fotografías. Permite editar adicionales.
- **No se ejecutaron migraciones ni seeds en Supabase remoto.** El SQL se verificó en PostgreSQL local con PGlite y el administrador con API simulada. La administración persistente requiere Supabase y sesión autorizada, como en el proyecto original.

## Verificación

- Comparación campo por campo de categorías, productos y variantes entre TypeScript y el seed integrado, seguida de dos ejecuciones de `seed-menu.sql` y una nueva comparación: correcta.
- 184 slugs e identificadores únicos; cero productos huérfanos, categorías vacías o productos de demostración en la carta.
- Precios numéricos o nulos; formato argentino ARS, por ejemplo `$20.000`.
- Búsqueda por nombre, descripción, ingredientes y categoría sin distinguir tildes ni mayúsculas; agrupación por categoría y orden original.
- Tamaños sin productos duplicados, postres independientes y ambos Vacío correctos.
- Navegador: 184 tarjetas, filtros, precios pendientes, modal, tamaños, salsas opcionales, foco y mesa visible mediante `?mesa=`.
- WhatsApp: producto, categoría, opción, precio y mesa. Total con salsa verificado en pruebas unitarias; envío de tamaño/precio/mesa verificado con API simulada.
- Administrador: 184 artículos; edición independiente de Vacío, salsas, Merluza Negra y postres. Pruebas de fotos, ocultar, duplicar, eliminar, categorías, promociones y editor visual conservadas.
- Sin desbordes en 320, 390, 768, 1024 y 1440 px. Captura del modal móvil inspeccionada.

| Comando | Resultado |
| --- | --- |
| `npm test` | 53 pruebas aprobadas en 5 archivos |
| `npm run test:e2e` | 8 pruebas aprobadas |
| `npm run test:e2e:admin` | 4 pruebas aprobadas, API simulada |
| `npm run lint` | Correcto |
| `npm run build` | Correcto: TypeScript, Vite y generación SEO |

Las primeras ejecuciones en el sandbox recibieron `spawn EPERM`; las ejecuciones autorizadas posteriores finalizaron correctamente. El build conserva el aviso SEO sobre configurar `VITE_SITE_URL` para indexación; no es un error de compilación.

## Archivos creados o modificados

### Datos y SQL

- `src/data/menuData.ts` (nuevo).
- `src/data/demo.ts`.
- `scripts/generate-menu.mjs` (nuevo; fuente compacta que genera TypeScript y ambos seeds).
- `supabase/seed-menu.sql` (nuevo).
- `supabase/seed.sql`.
- `supabase/migrations/002_variant_addons.sql` (nuevo).

### Aplicación

- `src/types/product.ts`.
- `src/utils/products.ts`.
- `src/utils/validators.ts`.
- `src/services/catalog.service.ts`.
- `src/hooks/useCatalog.tsx`.
- `src/pages/public/HomePage.tsx`.
- `src/components/catalog/ProductCard/ProductCard.tsx`.
- `src/components/catalog/ProductModal/ProductModal.tsx`.
- `src/components/admin/ProductForm/ProductForm.tsx`.

### Verificación y documentación

- `src/data/menuData.test.ts` (nuevo).
- `tests/database.test.ts`.
- `tests/e2e/catalog.spec.ts`.
- `tests/admin-e2e/admin.spec.ts`.
- `tests/fixtures/demo.ts` (ejemplos antiguos aislados exclusivamente para pruebas de regresión).
- `src/utils/core.test.ts`.
- `src/hooks/usePromotionTime.test.tsx`.
- `docs/MENU_TRANSCRIPTION.md`.
- Capturas regeneradas en `test-results/` y artefactos del build en `dist/`.
