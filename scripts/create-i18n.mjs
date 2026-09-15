import { mkdirSync, writeFileSync } from 'node:fs'
const rows = `Idioma|Idioma|Language
Inicio|Início|Home
Menú|Cardápio|Menu
Promociones|Promoções|Promotions
Nosotros|Sobre nós|About us
Contacto|Contato|Contact
Saltar al menú|Ir para o cardápio|Skip to menu
Navegación principal|Navegação principal|Main navigation
Navegación móvil|Navegação móvel|Mobile navigation
Abrir menú|Abrir menu|Open menu
Cerrar menú|Fechar menu|Close menu
Pedir por WhatsApp|Pedir pelo WhatsApp|Order on WhatsApp
Buscar productos|Buscar produtos|Search products
Buscar productos, ingredientes...|Buscar produtos, ingredientes...|Search products, ingredients...
Borrar búsqueda|Limpar busca|Clear search
Categorías|Categorias|Categories
Todos|Todos|All
Los más elegidos|Os mais pedidos|Popular picks
Ver todo el menú|Ver cardápio completo|View full menu
Favorito|Favorito|Favorite
Popular|Popular|Popular
Disponible|Disponível|Available
Agotado|Esgotado|Sold out
disponible|disponível|available
agotado|esgotado|sold out
Ver|Ver|View
Chico|Pequena|Small
Chica|Pequena|Small
Grande|Grande|Large
Consultar|Consultar|Ask for price
Consultar precio|Consultar preço|Ask for price
Por unidad|Por unidade|Per item
Ingredientes: |Ingredientes: |Ingredients:
Elegí una opción para pedir|Escolha uma opção para pedir|Choose an option to order
Salsa (opcional)|Molho (opcional)|Sauce (optional)
Sin adicional|Sem adicional|No extra
PRECIO|PREÇO|PRICE
Seleccioná una opción|Selecione uma opção|Select an option
Agotado por el momento|Esgotado no momento|Currently sold out
Pedir en la mesa / Dudas|Pedir na mesa / Tirar dúvidas|Order at the table / Questions
Te respondemos por WhatsApp. Sin carrito, sin vueltas.|Respondemos pelo WhatsApp. Sem carrinho, sem complicações.|We reply on WhatsApp. No cart, no hassle.
Cerrar ventana|Fechar janela|Close dialog
Reintentar|Tentar novamente|Retry
Probá con otra categoría o cambiá tu búsqueda.|Tente outra categoria ou altere sua busca.|Try another category or change your search.
No encontramos productos con esa búsqueda.|Nenhum produto encontrado.|No products match your search.
No encontramos productos en esta categoría.|Não há produtos nesta categoria.|No products in this category.
No pudimos actualizar el menú. Estamos mostrando la carta de respaldo local.|Não foi possível atualizar o cardápio. Mostramos a versão local.|We could not update the menu. Showing the local menu.
No pudimos actualizar el menú. Estamos mostrando la última versión disponible.|Não foi possível atualizar o cardápio. Mostramos a última versão disponível.|We could not update the menu. Showing the last available version.
Carta de Dieguito · Versión de respaldo local.|Cardápio Dieguito · Versão local.|Dieguito menu · Local version.
Nuestra carta|Nosso cardápio|Our menu
¿Qué se te antoja hoy?|O que você quer saborear hoje?|What are you craving today?
RECIÉN HECHO. BIEN NUESTRO.|FEITO NA HORA. DO NOSSO JEITO.|FRESHLY MADE. OUR WAY.
Mesa|Mesa|Table
OFERTA ESPECIAL|OFERTA ESPECIAL|SPECIAL OFFER
Consultá nuestras promociones|Confira nossas promoções|Ask about our promotions
Descubrí las promociones disponibles de esta semana.|Descubra as promoções disponíveis nesta semana.|Discover this week's available promotions.
Ver promociones|Ver promoções|View promotions
Quiero esta promo|Quero esta promoção|Ask about this offer
Promociones de la semana|Promoções da semana|This week's promotions
Estamos preparando nuevas promociones. ¡Volvé pronto!|Estamos preparando novas promoções. Volte em breve!|We're preparing new promotions. Check back soon!
Anterior|Anterior|Previous
Siguiente|Próximo|Next
Pausar carrusel|Pausar carrossel|Pause carousel
Reproducir carrusel|Reproduzir carrossel|Play carousel
Ir al slide|Ir para o slide|Go to slide
Especialidades de Dieguito|Especialidades de Dieguito|Dieguito specialties
El fin del mundo.|O fim do mundo.|The end of the world.
El principio de una buena mesa.|O começo de uma boa mesa.|The start of a great meal.
Cómo llegar|Como chegar|Get directions
CERQUITA TUYO|PERTO DE VOCÊ|CLOSE TO YOU
Nos vemos en Dieguito.|Nos vemos no Dieguito.|See you at Dieguito.
En el corazón de Ushuaia|No coração de Ushuaia|In the heart of Ushuaia
Te esperamos|Esperamos você|Come visit us
Cerrado|Fechado|Closed
Hablemos de comida|Vamos falar de comida|Let's talk food
Pedidos, consultas o una mesa para compartir.|Pedidos, dúvidas ou uma mesa para compartilhar.|Orders, questions or a table to share.
Escribinos por WhatsApp|Fale conosco pelo WhatsApp|Message us on WhatsApp
Hecho con sabor, en el fin del mundo.|Feito com sabor, no fim do mundo.|Made with flavor, at the end of the world.
Administración|Administração|Administration
Créditos de fotografías|Créditos das imagens|Image credits
Lunes|Segunda-feira|Monday
Martes|Terça-feira|Tuesday
Miércoles|Quarta-feira|Wednesday
Jueves|Quinta-feira|Thursday
Viernes|Sexta-feira|Friday
Sábado|Sábado|Saturday
Domingo|Domingo|Sunday
Consultar en el local|Consulte no restaurante|Ask at the restaurant
Hola, quiero consultar el menú de Dieguito.|Olá, gostaria de consultar o cardápio do Dieguito.|Hello, I would like to ask about Dieguito's menu.
Hola, quiero consultar/pedir:|Olá, gostaria de consultar/pedir:|Hello, I would like to ask about/order:
Producto|Produto|Product
Categoría|Categoria|Category
Opción|Opção|Option
Precio|Preço|Price
¿Está disponible?|Está disponível?|Is it available?
El WhatsApp del local todavía no está configurado. Consultanos en el local.|O WhatsApp do restaurante ainda não foi configurado. Consulte no restaurante.|The restaurant's WhatsApp is not configured yet. Please ask at the restaurant.
Hamburguesas|Hambúrgueres|Burgers
Cargando…|Carregando…|Loading…
Cargando el menú…|Carregando o cardápio…|Loading the menu…
Cargando el menú|Carregando o cardápio|Loading the menu
Esta mesa está vacía.|Esta mesa está vazia.|This table is empty.
No encontramos la página que buscás.|Não encontramos a página que você procura.|We couldn't find that page.
Volver al menú|Voltar ao cardápio|Back to menu
No pudimos abrir esta página.|Não foi possível abrir esta página.|We couldn't open this page.
Recargá para reintentar. Los cambios ya guardados permanecen en la base.|Recarregue para tentar novamente. As alterações salvas permanecem no banco de dados.|Reload to try again. Saved changes remain in the database.
PIZZERÍA & RESTAURANTE|PIZZARIA & RESTAURANTE|PIZZERIA & RESTAURANT`
mkdirSync('src/i18n', { recursive: true })
for (const [i, lang] of ['es', 'pt', 'en'].entries())
  writeFileSync(
    `src/i18n/${lang}.json`,
    JSON.stringify(
      Object.fromEntries(
        rows.split('\n').map((row) => {
          const cols = row.split('|')
          return [cols[0], cols[i]]
        }),
      ),
      null,
      2,
    ) + '\n',
  )
