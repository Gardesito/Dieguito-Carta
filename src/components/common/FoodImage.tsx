import { imageSrc, placeholder, responsiveImage } from '../../utils/image'
export default function FoodImage({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <img
      className={className}
      src={imageSrc(src)}
      srcSet={
        src.startsWith('https://images.unsplash.com/')
          ? `${responsiveImage(src, 400)} 400w, ${responsiveImage(src, 800)} 800w, ${responsiveImage(src, 1200)} 1200w`
          : undefined
      }
      sizes={
        priority
          ? '(max-width: 767px) 100vw, 55vw'
          : '(max-width: 600px) 90vw, (max-width: 1023px) 45vw, 25vw'
      }
      alt={alt}
      width={640}
      height={480}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={(e) => {
        e.currentTarget.removeAttribute('srcset')
        e.currentTarget.onerror = null
        e.currentTarget.src = placeholder
      }}
    />
  )
}
