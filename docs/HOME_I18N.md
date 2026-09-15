# Portada e idiomas de Dieguito

## Qué cambió

- Hero de tres slides: pizza, parrilla y mar. Avanza cada 5 segundos, admite flechas, puntos, teclado y deslizamiento táctil. Pausa durante la interacción, al ocultar la pestaña y mediante su botón. El temporizador comienza de nuevo al terminar la interacción. Con movimiento reducido se mantiene la navegación manual.
- Primer slide disponible en el HTML inicial si JavaScript no carga.
- Accesos rápidos, tres populares y banner oscuro antes de la carta completa. Se conservan los 184 artículos, los precios ARS, las salsas y los modales.
- Destacados iniciales: Muzzarella, Dieguito Casera con Fritas y Carne de Empanadas. Se usa `is_featured` y se muestran como máximo tres productos visibles de categorías activas, ordenados por `sort_order`.
- Los valores numéricos de orden se distribuyen por categoría para ordenar ese trío inicialmente, conservando el orden relativo de los artículos dentro de cada categoría.
- Banner conectado a promociones vigentes. Si no hay ninguna, muestra el contenido general editable, sin descuentos ni combos inventados.
- Español, portugués e inglés mediante i18next. Preferencia guardada en `dieguito:language`; sin preferencia se usa español. El documento usa `es`, `pt-BR` o `en`.
- Interfaz pública y WhatsApp traducidos. Precios siempre en pesos argentinos y formato argentino, sin conversiones.

## Migración de Supabase

**Sí: ejecutar `supabase/migrations/003_home_i18n.sql` después de las migraciones 001 y 002.** No se ejecutó sobre un Supabase remoto durante este trabajo.

La migración:

1. Agrega `translations jsonb` a productos, variantes, categorías, promociones, contenido y configuración.
2. Actualiza `save_product` para guardar traducciones de productos y variantes en la misma transacción.
3. Agrega `label` y `button_label` a promociones.
4. Permite las secciones `hero`, `hero-grill`, `hero-sea`, `offer` y `about` en `site_content`.
5. Carga los slides y el banner inicial; reemplaza la portada anterior solo si conserva el título de demostración original.
6. Completa traducciones iniciales donde no existían y activa los tres destacados solicitados.

Para una instalación nueva: aplicar migraciones en orden y ejecutar `supabase/seed.sql`, que integra carta y portada. `seed-menu.sql` y `seed-home.sql` permiten cargar cada parte por separado. El seed de carta restaura sus valores iniciales; no es necesario repetirlo para editar contenidos desde el administrador.

No se agregaron tablas públicas ni se quitaron las políticas RLS existentes. Los precios no se guardan en las traducciones.

## Cómo editar

### Slides

Ir a **Editar página** y elegir en **Sección**:

- Slide 1 · Pizzas.
- Slide 2 · Parrilla.
- Slide 3 · Mar.

Editar título, descripción, etiqueta, texto del botón, imagen y texto alternativo. En **Categoría del botón**, seleccionar una categoría para filtrar y desplazar la carta. Elegir **Usar enlace** para utilizar el enlace del botón. **Orden del slide** controla la secuencia; **Mostrar esta sección** controla la visibilidad. Guardar cada sección.

La vista previa existente sigue disponible en desktop y mobile. La fotografía se cambia con el cargador de imágenes habitual.

### Populares

Ir a **Productos**, editar un artículo y marcar o desmarcar **Destacado**. Ajustar **Orden** para su posición. Se recomienda mantener tres destacados visibles; si hay más, solo aparecen los tres primeros. Ocultar un producto o su categoría también lo retira de esta sección. Un agotado puede seguir destacado, pero el modal impide pedirlo.

### Oferta

- En **Promociones**, editar etiqueta, título, descripción, fotografía, precios opcionales, texto del botón, fechas, orden y estado activo. El botón consulta por WhatsApp con la promoción y su precio. No se muestran promociones futuras o vencidas.
- Si hay varias promociones vigentes, el banner principal elige la primera por orden; la sección de promociones conserva las demás.
- En **Editar página → Banner general de promociones**, editar el contenido mostrado cuando no hay promociones activas. Desmarcar **Mostrar esta sección** para ocultar ese banner general. Su botón lleva a la sección de promociones.

### Idiomas

Los formularios de productos, categorías, promociones, contenido y configuración incluyen pestañas **Español**, **Português** y **English**. El español se edita en los campos principales obligatorios. En las otras pestañas se completan traducciones opcionales; dejar un campo vacío muestra su equivalente español.

También se pueden traducir los nombres de variantes, los textos alternativos de imágenes y los textos de horarios. Las imágenes y los enlaces son compartidos entre idiomas; sus textos y etiquetas admiten traducción.

Ejemplo de estructura:

```json
{
  "name": "Muzzarella",
  "translations": {
    "pt": { "name": "Mussarela" },
    "en": { "name": "Mozzarella" }
  }
}
```

Se cargaron traducciones iniciales de categorías, aclaraciones generales, slides, banner, sección institucional y los tres destacados. Los demás nombres, descripciones e ingredientes sin traducción editorial siguen mostrándose en español. Marcas, nombres propios, vinos y cervezas mantienen su identidad. Se pueden completar las traducciones pendientes desde los formularios sin crear otros productos.

## Imágenes

Las tres imágenes de `public/images/hero/` fueron generadas como ilustraciones gastronómicas para esta portada. No contienen textos ni logos y no se presentan como fotografías reales del local. Los productos conservan el placeholder del proyecto cuando no tienen foto real.

No se recibió una imagen adjunta accesible en el mensaje; la composición se basó en las pautas escritas del pedido y en la identidad existente de Dieguito.

## Verificación

- 65 pruebas unitarias y PostgreSQL local aprobadas: idiomas, respaldo por campo, mensajes de WhatsApp, temporizador, interacción, movimiento reducido, promociones y persistencia SQL de traducciones.
- 14 pruebas públicas aprobadas, incluyendo idiomas persistidos, navegación de slides, filtros, modales, populares, responsive y JavaScript deshabilitado.
- Capturas revisadas de mobile, tablet y desktop, incluidos los slides, las tarjetas populares y el banner. Sin desbordamiento horizontal; altura estable del carrusel.
- `npm run build`: correcto. Conserva avisos no bloqueantes sobre el paquete principal de aproximadamente 503 kB y la falta de `VITE_SITE_URL` para indexación.
- `npm run lint`: correcto.
- Resultado final del administrador: pendiente de completar al terminar la última ejecución.

Las pruebas del administrador usan una API Supabase simulada; la persistencia SQL se prueba por separado con PGlite.

## Archivos principales

- `package.json`, `package-lock.json`, `src/main.tsx`, `index.html`.
- `src/i18n/index.ts`, `es.json`, `pt.json`, `en.json` y pruebas.
- `src/data/menuData.ts`, `homeData.ts`, `demo.ts` y pruebas de carta.
- `src/types/product.ts`, `category.ts`, `promotion.ts`, `siteContent.ts`.
- `src/pages/public/HomePage.tsx`, `NotFoundPage.tsx`.
- `src/components/catalog/Hero/HeroCarousel.tsx`, `OfferBanner.tsx` y pruebas.
- Componentes de categorías, búsqueda, tarjetas, modal, promociones y contacto.
- Header, navegación móvil, footer, selector de idioma, estados vacíos/de error, carga, modal común y SEO.
- `src/components/admin/TranslationFields.tsx` y formularios de productos, categorías y promociones.
- `src/pages/admin/ContentEditorPage.tsx`, `SettingsPage.tsx`.
- `src/utils/products.ts`, `validators.ts`, `whatsapp.ts`; servicios de catálogo y WhatsApp.
- `src/styles/home.css`; `public/images/hero/pizza.png`, `parrilla.png`, `mar.png`.
- `supabase/migrations/003_home_i18n.sql`, `seed.sql`, `seed-menu.sql`, `seed-home.sql`.
- Scripts de generación de carta, traducciones y portada en `scripts/`.
- Pruebas en `tests/database.test.ts`, `tests/e2e/` y `tests/admin-e2e/`.
- Este documento y la actualización de `docs/MENU_TRANSCRIPTION.md`.

Documentación de las dependencias: [configuración de i18next](https://www.i18next.com/overview/configuration-options) y [react-i18next](https://react.i18next.com/latest/usetranslation-hook).
