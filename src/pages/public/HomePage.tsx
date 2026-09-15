import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../types/product'
import type { Catalog } from '../../services/catalog.service'
import { useCatalog } from '../../hooks/useCatalog'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import HeroCarousel from '../../components/catalog/Hero/HeroCarousel'
import OfferBanner from '../../components/catalog/OfferBanner'
import SearchBar from '../../components/catalog/SearchBar/SearchBar'
import { useTranslation } from 'react-i18next'
import { localized } from '../../i18n'
import { preserveTable } from '../../utils/navigation'
import CategoryNavigation from '../../components/catalog/CategoryNavigation/CategoryNavigation'
import ProductGrid from '../../components/catalog/ProductGrid/ProductGrid'
import ProductModal from '../../components/catalog/ProductModal/ProductModal'
import PromotionSlider from '../../components/catalog/PromotionSlider/PromotionSlider'
import ContactSection from '../../components/catalog/ContactSection/ContactSection'
import EmptyState from '../../components/common/EmptyState/EmptyState'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import { ProductSkeletons } from '../../components/common/LoadingSpinner/LoadingSpinner'
import EditableText from '../../components/admin/EditableText/EditableText'
import { filterProducts, featuredProducts } from '../../utils/products'
import { tableFromSearch } from '../../utils/whatsapp'
import '../../styles/catalog.css'
import '../../styles/home.css'

export default function HomePage({
  previewData,
  onEdit,
}: { previewData?: Catalog; onEdit?: (key: string) => void } = {}) {
  const catalog = useCatalog()
  const { t, i18n } = useTranslation()
  const source = previewData || catalog.data
  const translated = useMemo(
    () => ({
      categories: source.categories.map((c) => localized(c)),
      products: source.products.map((p) => ({
        ...localized(p),
        product_variants: p.product_variants.map((v) => localized(v)),
      })),
      content: source.content.map((c) => localized(c)),
      promotions: source.promotions.map((p) => localized(p)),
      settings: {
        ...localized(source.settings),
        opening_hours: source.settings.opening_hours.map((h) => localized(h)),
      },
    }),
    [source, i18n.resolvedLanguage],
  )
  const { categories, products, promotions, content, settings } = translated
  const { loading, error, reload } = catalog
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
  const scrollMenu = () =>
    requestAnimationFrame(() =>
      document
        .getElementById('menu')
        ?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        }),
    )
  const chooseCategory = (id: string) => {
    setSearch('')
    setQuery('')
    setCategory(id)
    scrollMenu()
  }
  const popular = featuredProducts(products, categories)
  const quick = [
    'pizzas',
    'empanadas',
    'hamburguesas-caseras',
    'parrillada',
    'pastas',
    'del-mar',
    'bebidas',
    'postres',
  ].flatMap((slug) => {
    const c = categories.find((c) => c.slug === slug)
    return c ? [c.slug === 'hamburguesas-caseras' ? { ...c, name: t('Hamburguesas') } : c] : []
  })
  return (
    <>
      <Header settings={settings} />
      <main id="inicio">
        <div className="public-search container">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        {error && !previewData && (
          <div className="container">
            <ErrorState message={t(error)} retry={() => void reload()} />
          </div>
        )}
        <EditableText label="portada" onEdit={onEdit ? () => onEdit('hero') : undefined}>
          <HeroCarousel
            slides={source.content.filter((c) => c.content_key.startsWith('hero'))}
            onCategory={(slug) => {
              const c = categories.find((c) => c.slug === slug && c.is_active)
              chooseCategory(c?.id || '')
            }}
          />
        </EditableText>
        <div className="quick-categories container">
          <CategoryNavigation categories={quick} value={category} onChange={chooseCategory} />
        </div>
        {popular.length > 0 && (
          <section className="popular-section container" aria-label={t('Los más elegidos')}>
            <div className="section-heading">
              <h2>{t('Los más elegidos')}</h2>
              <a href={preserveTable('/#menu')} onClick={() => chooseCategory('')}>
                {t('Ver todo el menú')} ↗
              </a>
            </div>
            <ProductGrid products={popular} categories={categories} onSelect={setSelected} />
          </section>
        )}
        <EditableText label="oferta" onEdit={onEdit ? () => onEdit('offer') : undefined}>
          <OfferBanner
            promotions={promotions}
            general={content.find((c) => c.content_key === 'offer')}
            phone={settings.whatsapp_number}
          />
        </EditableText>
        <section id="menu" className="section container">
          {tableFromSearch(window.location.search) && (
            <p className="eyebrow primary">
              {t('Mesa')}: {tableFromSearch(window.location.search)}
            </p>
          )}
          <div className="section-heading">
            <div>
              <p className="eyebrow primary">{t('RECIÉN HECHO. BIEN NUESTRO.')}</p>
              <h2>{t('¿Qué se te antoja hoy?')}</h2>
            </div>
          </div>
          <CategoryNavigation categories={categories} value={category} onChange={setCategory} />
          <div className="menu-heading">
            <h3>{categories.find((c) => c.id === category)?.name || t('Nuestra carta')}</h3>
          </div>
          {loading && !previewData ? (
            <ProductSkeletons />
          ) : filtered.length ? (
            categories
              .filter((c) => filtered.some((p) => p.category_id === c.id))
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((c) => (
                <section key={c.id} id={`menu-${c.slug}`} aria-label={c.name}>
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
              text={t(
                query
                  ? 'No encontramos productos con esa búsqueda.'
                  : 'No encontramos productos en esta categoría.',
              )}
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
          product={products.find((p) => p.id === selected.id) || selected}
          category={categories.find((c) => c.id === selected.category_id)?.name || ''}
          phone={settings.whatsapp_number}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
