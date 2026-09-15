import { useTranslation } from 'react-i18next'
export default function LanguageSelector() {
  const { i18n, t } = useTranslation()
  return (
    <label className="language-selector">
      <span className="sr-only">{t('Idioma')}</span>
      <select
        aria-label={t('Idioma')}
        value={i18n.resolvedLanguage || 'es'}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
      >
        <option value="es">🇦🇷 ES · Español</option>
        <option value="pt">🇧🇷 PT · Português</option>
        <option value="en">🇺🇸 EN · English</option>
      </select>
    </label>
  )
}
