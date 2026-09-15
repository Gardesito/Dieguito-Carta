import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import es from './es.json'
import pt from './pt.json'
import en from './en.json'
export type Language = 'es' | 'pt' | 'en'
export type Translations = Partial<Record<Language, Record<string, string>>>
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, pt: { translation: pt }, en: { translation: en } },
    fallbackLng: 'es',
    supportedLngs: ['es', 'pt', 'en'],
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'dieguito:language',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    keySeparator: false,
    nsSeparator: false,
    returnEmptyString: false,
    initAsync: false,
  })
function updateDocument(lng: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = lng === 'pt' ? 'pt-BR' : lng
}
i18n.on('languageChanged', updateDocument)
updateDocument(i18n.resolvedLanguage || 'es')
export const tr = (key: string) => String(i18n.t(key, { defaultValue: key }))
export function localized<T extends { translations?: Translations }>(
  item: T,
  language = i18n.resolvedLanguage || 'es',
): T {
  const fields = item.translations?.[language as Language]
  if (!fields || language === 'es') return item
  return {
    ...item,
    ...Object.fromEntries(
      Object.entries(fields).filter(
        ([key, value]) =>
          typeof value === 'string' &&
          value.trim() &&
          [
            'name',
            'description',
            'ingredients',
            'title',
            'subtitle',
            'body',
            'image_alt',
            'button_label',
            'label',
            'address',
            'logo_alt',
            'hours',
          ].includes(key),
      ),
    ),
  }
}
export default i18n
