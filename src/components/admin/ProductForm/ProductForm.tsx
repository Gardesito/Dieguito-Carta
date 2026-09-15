import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Product } from '../../../types/product'
import type { Category } from '../../../types/category'
import { productSchema, type ProductValues } from '../../../utils/validators'
import { slugify } from '../../../utils/products'
import { productsService } from '../../../services/products.service'
import { persistWithImage } from '../../../services/storage.service'
import ImageUploader from '../../common/ImageUploader/ImageUploader'
import Modal from '../../common/Modal/Modal'
import PublishBar from '../PublishBar/PublishBar'
import ProductCard from '../../catalog/ProductCard/ProductCard'
import ProductModal from '../../catalog/ProductModal/ProductModal'
import { useCatalog } from '../../../hooks/useCatalog'
export function newProduct(category = ''): Product {
  return {
    id: crypto.randomUUID(),
    category_id: category,
    name: '',
    slug: 'nuevo',
    description: '',
    ingredients: '',
    image_url: '',
    image_alt: '',
    price: null,
    small_price: null,
    large_price: null,
    price_label: '',
    is_available: true,
    is_featured: false,
    is_visible: true,
    sort_order: 0,
    product_variants: [],
  }
}
export default function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState('')
  useEffect(() => {
    if (!file) {
      setPreviewImage('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewImage(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const [preview, setPreview] = useState(false)
  const [detail, setDetail] = useState(false)
  const {
    data: { settings },
  } = useCatalog()
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductValues>({ resolver: zodResolver(productSchema), defaultValues: product })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'product_variants',
    keyName: 'fieldKey',
  })
  const values = watch()
  const current = { ...product, ...values, image_url: previewImage || values.image_url }
  const money = { setValueAs: (v: unknown) => (v === '' ? null : Number(v)) }
  const submit = handleSubmit(async (values) => {
    try {
      const item = {
        ...product,
        ...values,
        slug:
          product.slug === 'nuevo'
            ? `${slugify(categories.find((c) => c.id === values.category_id)?.name || '')}-${slugify(values.name)}-${product.id.slice(0, 8)}`
            : product.slug,
      }
      const result = await persistWithImage(
        file,
        product.image_url,
        values.image_url,
        values.image_alt,
        (url) => productsService.save({ ...item, image_url: url }),
      )
      toast.success('Producto guardado')
      if (result.cleanupWarning)
        toast.warning('Se guardó el producto. La imagen anterior quedó pendiente de limpieza.')
      onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    }
  })
  return (
    <Modal
      titleId="product-form-title"
      onClose={() => {
        if (!isSubmitting) onClose()
      }}
      className="admin-modal"
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <h2 id="product-form-title">{product.name ? 'Editar producto' : 'Nuevo producto'}</h2>
          <div className="form-columns">
            <div>
              <label className="field">
                Nombre
                <input {...register('name')} required maxLength={120} />
                {errors.name && <small className="error">{errors.name.message}</small>}
              </label>
              <label className="field">
                Categoría
                <select {...register('category_id')} required>
                  <option value="">Elegí una categoría</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                      {!c.is_active ? ' (oculta)' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Descripción
                <textarea {...register('description')} maxLength={2000} />
              </label>
              <label className="field">
                Ingredientes
                <textarea {...register('ingredients')} maxLength={2000} />
              </label>
              <div className="form-columns">
                <label className="field">
                  Precio ($)
                  <input type="number" min="0" step="0.01" {...register('price', money)} />
                </label>
                <label className="field">
                  Aclaración del precio
                  <input placeholder="c/u, porción…" {...register('price_label')} maxLength={30} />
                </label>
                <label className="field">
                  Precio chico ($)
                  <input type="number" min="0" step="0.01" {...register('small_price', money)} />
                </label>
                <label className="field">
                  Precio grande ($)
                  <input type="number" min="0" step="0.01" {...register('large_price', money)} />
                </label>
              </div>
              <p className="muted form-hint">
                Los adicionales se suman al precio base solo al elegirlos. Las demás variantes usan
                sus precios. Si cargás tamaños, reemplazan el precio único. Un precio vacío se
                muestra como “Consultar”.
              </p>
              <fieldset className="variants-admin">
                <legend>Variantes</legend>
                {fields.map((v, i) => (
                  <div key={v.fieldKey} className="variant-admin">
                    <label className="field">
                      Opción
                      <input {...register(`product_variants.${i}.name`)} required />
                    </label>
                    <label className="field">
                      Precio
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`product_variants.${i}.price`, { valueAsNumber: true })}
                        required
                      />
                    </label>
                    <label className="check">
                      <input type="checkbox" {...register(`product_variants.${i}.is_addon`)} />
                      Adicional al precio base
                    </label>
                    <label className="check">
                      <input type="checkbox" {...register(`product_variants.${i}.is_available`)} />
                      Disponible
                    </label>
                    <button type="button" className="btn secondary" onClick={() => remove(i)}>
                      Quitar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    append({
                      id: crypto.randomUUID(),
                      product_id: product.id,
                      name: '',
                      price: 0,
                      is_available: true,
                      sort_order: fields.length,
                    })
                  }
                >
                  Agregar variante
                </button>
              </fieldset>
              <label className="field">
                Orden
                <input type="number" {...register('sort_order', { valueAsNumber: true })} />
              </label>
              <div className="checks">
                {[
                  ['is_available', 'Disponible'],
                  ['is_featured', 'Destacado'],
                  ['is_visible', 'Visible en el menú'],
                ].map(([name, label]) => (
                  <label className="check" key={name}>
                    <input
                      type="checkbox"
                      {...register(name as 'is_available' | 'is_featured' | 'is_visible')}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <ImageUploader
                url={values.image_url}
                file={file}
                onFile={setFile}
                alt={values.image_alt}
                onAlt={(v) => setValue('image_alt', v)}
                onUrl={(v) => setValue('image_url', v)}
              />
              <button
                type="button"
                className="btn secondary wide"
                onClick={() => setPreview(!preview)}
              >
                {preview ? 'Ocultar vista previa' : 'Previsualizar producto'}
              </button>
              {preview && (
                <div className="product-preview">
                  <ProductCard
                    product={current}
                    category={categories.find((c) => c.id === values.category_id)?.name || ''}
                    onOpen={() => setDetail(true)}
                  />
                </div>
              )}
            </div>
          </div>
          {Object.keys(errors).length > 0 && (
            <p className="error" role="alert">
              Revisá los campos. El nombre, la categoría y las variantes deben ser válidos y los
              precios no pueden ser negativos.
            </p>
          )}
        </div>
        <PublishBar busy={isSubmitting} onCancel={onClose} />
      </form>
      {detail && (
        <ProductModal
          product={current}
          category={categories.find((c) => c.id === current.category_id)?.name || ''}
          phone={settings.whatsapp_number}
          onClose={() => setDetail(false)}
        />
      )}
    </Modal>
  )
}
