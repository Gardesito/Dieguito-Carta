import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../types/product'
import type { Catalog } from '../../services/catalog.service'
import { useCatalog } from '../../hooks/useCatalog'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import Hero from '../../components/catalog/Hero/Hero'
import CategoryNavigation from '../../components/catalog/CategoryNavigation/CategoryNavigation'
import ProductGrid from '../../components/catalog/ProductGrid/ProductGrid'
import ProductModal from '../../components/catalog/ProductModal/ProductModal'
import PromotionSlider from '../../components/catalog/PromotionSlider/PromotionSlider'
import ContactSection from '../../components/catalog/ContactSection/ContactSection'
import EmptyState from '../../components/common/EmptyState/EmptyState'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import { ProductSkeletons } from '../../components/common/LoadingSpinner/LoadingSpinner'
import EditableText from '../../components/admin/EditableText/EditableText'
import { filterProducts } from '../../utils/products'
import { isPromotionActive } from '../../utils/promotions'
import { usePromotionTime } from '../../hooks/usePromotionTime'
import { tableFromSearch } from '../../utils/whatsapp'
import '../../styles/catalog.css'

export default function HomePage({
  previewData,
  onEdit,
}: { previewData?: Catalog; onEdit?: (key: string) => void } = {}) {
  const catalog = useCatalog()
  const { categories, products, promotions, content, settings } = previewData || catalog.data
  const { loading, error, demo, reload } = catalog
  const [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 220)
    return () => clearTimeout(t)
  }, [search])
  useEffect(() => {
    if (!query) return
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [query])
  const filtered = useMemo(
    () => filterProducts(products, categories, query, category),
    [products, categories, query, category],
  )
  const hero = content.find((c) => c.content_key === 'hero')
  const promotionTime = usePromotionTime(promotions)
  return (
    <>
      <Header settings={settings} search={search} onSearchChange={setSearch} />
      <main id="inicio">
        {demo && !previewData && (
          <div className="demo-banner">Carta de Dieguito · Versión de respaldo local.</div>
        )}
        {error && !previewData && (
          <div className="container">
            <ErrorState message={error} retry={() => void reload()} />
          </div>
        )}
        {hero && (
          <EditableText label="portada" onEdit={onEdit ? () => onEdit('hero') : undefined}>
            <Hero
              content={hero}
              phone={settings.whatsapp_number}
              promotion={promotions.find(
                (p) => p.id === hero.metadata.promotion_id && isPromotionActive(p, promotionTime),
              )}
            />
          </EditableText>
        )}
        <div className="flavor-strip">
          <span>PIZZAS A LA PIEDRA</span>
          <b>✦</b>
          <span>COCINA CASERA</span>
          <b>✦</b>
          <span>PORCIONES PARA COMPARTIR</span>
          <b>✦</b>
          <span>SABOR FUEGUINO</span>
        </div>
        <section id="menu" className="section container">
          {tableFromSearch(window.location.search) && (
            <p className="eyebrow primary">Mesa: {tableFromSearch(window.location.search)}</p>
          )}
          <div className="section-heading">
            <div>
              <p className="eyebrow primary">RECIÉN HECHO. BIEN NUESTRO.</p>
              <h2>¿Qué se te antoja hoy?</h2>
            </div>
          </div>
          <CategoryNavigation categories={categories} value={category} onChange={setCategory} />
          <div className="menu-heading">
            <h3>
              {categories.find((c) => c.id === category)?.name || 'Nuestros favoritos y mucho más'}
            </h3>
            <span className="muted" role="status">
              {filtered.length} opciones
            </span>
          </div>
          {loading && !previewData ? (
            <ProductSkeletons />
          ) : filtered.length ? (
            categories
              .filter((c) => filtered.some((p) => p.category_id === c.id))
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((c) => (
                <section key={c.id} aria-label={c.name}>
                  <h3>{c.name}</h3>
                  {c.description && <p className="muted">{c.description}</p>}
                  <ProductGrid
                    products={filtered
                      .filter((p) => p.category_id === c.id)
                      .sort((a, b) => a.sort_order - b.sort_order)}
                    categories={categories}
                    onSelect={setSelected}
                  />
                </section>
              ))
          ) : (
            <EmptyState
              text={
                query
                  ? 'No encontramos productos con esa búsqueda.'
                  : 'No encontramos productos en esta categoría.'
              }
            />
          )}
        </section>
        <PromotionSlider promotions={promotions} phone={settings.whatsapp_number} />
        <EditableText label="nosotros" onEdit={onEdit ? () => onEdit('about') : undefined}>
          <ContactSection
            about={content.find((c) => c.content_key === 'about')}
            settings={settings}
          />
        </EditableText>
      </main>
      <Footer />
      {selected && (
        <ProductModal
          key={selected.id}
          product={selected}
          category={categories.find((c) => c.id === selected.category_id)?.name || ''}
          phone={settings.whatsapp_number}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
