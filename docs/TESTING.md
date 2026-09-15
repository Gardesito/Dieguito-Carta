# Pruebas y verificación

## Resultado de esta implementación (14 de septiembre de 2026)

- `npm install`: correcto; auditoría de instalación sin vulnerabilidades reportadas.
- `npm run dev`: inicia correctamente en `http://127.0.0.1:5173/`.
- `npm run lint`: correcto, sin advertencias.
- `npm test`: **47 pruebas aprobadas** en cuatro archivos.
- `npm run test:e2e`: **7 pruebas aprobadas**, incluyendo cinco anchos de pantalla.
- `npm run test:e2e:admin`: **3 pruebas aprobadas**, con API simulada exclusivamente en tests.
- `npm run build`: TypeScript, Vite y generación SEO correctos. Carpeta de salida: `dist/`.

Las compilaciones de las fases 1 a 5 también se ejecutaron y corrigieron antes de continuar. No se validó un proyecto Supabase remoto ni se realizó un despliegue público.

## Comandos

```sh
npm run lint
npm test
npm run test:e2e
npm run test:e2e:admin
npm run build
```

## Alcance

Las pruebas de Vitest comprueban moneda, acentos, filtros combinados, productos ocultos/agotados, tamaños, variantes, número y mensajes WhatsApp, conservación y validación de mesa, fechas de promociones y enlaces seguros. También verifican el límite/tipo de imágenes, limpieza posterior al guardado, conservación de la anterior ante errores y fotografías compartidas.

PostgreSQL local PGlite ejecuta la migración y el seed. Comprueba RLS en las ocho tablas, lectura pública, categorías ocultas, permisos de admin/editor/sin perfil, ausencia de autoescalamiento de rol, promociones vigentes, políticas del bucket, integridad referencial, ordenamiento y rollback del guardado transaccional. Auth y Storage se representan mediante esquemas de prueba; no se conecta a Supabase remoto.

Playwright público ejecuta siete escenarios: búsqueda, filtro, abrir con Enter, Escape, devolución de foco, cierre por fondo, selección de tamaño, redirección de ruta protegida y render en 320, 390, 768, 1024 y 1440 px. Genera capturas en `test-results`. Se revisaron capturas del catálogo y el modal; no se proporcionó una referencia gráfica externa para comparar pixel a pixel.

Playwright administrativo usa **respuestas API simuladas dentro del test** y un servidor separado en 5175. No existe un bypass de autenticación en el código de la aplicación. Comprueba login, ruta de retorno, persistencia de sesión, crear/editar/ocultar/duplicar/eliminar productos, subida de imagen, categorías, promociones, editor visual con iframe, configuración, logout y URL real de apertura de WhatsApp interceptada antes de salir a la red.

El navegador integrado no estaba disponible; las pruebas se ejecutaron en Edge local sin ventana. Las capturas de páginas largas pueden mostrar imágenes que todavía no entraron al viewport debido al lazy loading. Las pruebas no envían mensajes a WhatsApp.

## Verificación pendiente con credenciales reales

- Crear proyecto Supabase, ejecutar SQL y crear administrador.
- Probar login/logout reales y recuperación de sesión con Auth.
- Probar CRUD y variantes contra PostgREST y las funciones RPC.
- Subir una imagen real a Storage y verificar tamaño, formatos y políticas.
- Verificar que anon y usuarios sin perfil no puedan escribir mediante la API real.
- Confirmar teléfono del negocio y recepción manual de una consulta con y sin mesa.
- Confirmar fotografías, logo, datos y precios con el restaurante.
- Medir Lighthouse en el dominio final con Supabase e imágenes definitivas. No se afirma una puntuación sin medir.

## Hallazgos corregidos

Se corrigió el orden de carga de CSS que alteraba botones de la portada y el menú desktop; se preserva `mesa` al usar enlaces internos; y los eventos de sesión de la vista previa ya no reinician el editor ni descartan borradores del mismo usuario. Las pruebas administrativas reprodujeron y verificaron este último problema.
