# Publicar en Vercel

1. Crear un repositorio propio y subir el proyecto de esta raíz. No incluir `node_modules`, `dist`, `.env.local` ni el borrador `dieguito-catalogo` como raíz de despliegue.
2. En Vercel, importar el repositorio. Framework: Vite. Root Directory: raíz. Install: `npm install`. Build: `npm run build`. Output: `dist`. Node: 22 o superior compatible con Vite.
3. Agregar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEFAULT_WHATSAPP` y `VITE_SITE_URL` en Environment Variables para Production. Usar otro proyecto Supabase para entornos de prueba cuando corresponda.
4. En Supabase, ejecutar migración, seed y crear administrador según SETUP_SUPABASE.md. Configurar el dominio en Auth URL Configuration y deshabilitar el registro público.
5. Desplegar. Si cambiás variables `VITE_`, desplegar de nuevo: se incorporan durante la compilación.
6. Asociar el dominio propio y actualizar `VITE_SITE_URL` con su origen HTTPS, sin rutas ni parámetros. Generar otro despliegue.
7. Verificar `/`, `/login`, `/admin/productos`, `robots.txt` y `sitemap.xml`. Recargar una ruta del panel para comprobar el fallback SPA de `vercel.json`.

El build añade canonical y `og:url` con el dominio configurado. Sin dominio, se mantiene `noindex` para la demo. Las rutas administrativas usan `noindex` y se excluyen de robots/sitemap. El catálogo agrega datos estructurados Restaurant, teléfono válido, dirección, redes y horarios que reconozcan el formato HH:MM–HH:MM. Los metadatos básicos se entregan en HTML; el contenido de Supabase es client-side. Para SEO de cada plato o prerender completo, se requeriría una fase adicional de SSR/prerender.

No se incluyó un `og:image` inventado: no se recibió material de marca para una tarjeta social definitiva. Podés añadir una imagen pública de 1200 × 630 aprobada por el local y el metadato correspondiente en `index.html`.

## Otros alojamientos

Publicar el contenido de `dist` en un hosting estático con HTTPS y regla SPA que dirija rutas de aplicación a `index.html`, preservando archivos reales. Los valores públicos de Supabase son suficientes; RLS debe permanecer habilitado.

## Comprobación final con el negocio

Confirmar logo, fotografías, precios, disponibilidad, número de WhatsApp, redes, dirección y horarios. El seed contiene datos de ejemplo y no confirma la oferta comercial real. Probar un QR de mesa y un pedido sin mesa. Probar altas, ediciones, imágenes y permisos con usuarios reales. No se configuró ni publicó un proyecto remoto durante esta implementación.
