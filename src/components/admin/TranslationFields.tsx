import { useId, useState, type ReactNode } from 'react'
import type { Language, Translations } from '../../i18n'
export default function TranslationFields({
  value = {},
  onChange,
  fields,
  children,
}: {
  value?: Translations
  onChange: (value: Translations) => void
  fields: [string, string][]
  children?: ReactNode
}) {
  const [language, setLanguage] = useState<Language>('es')
  const id = useId()
  return (
    <div className="translation-fields">
      <div className="row" role="tablist" aria-label="Idioma del contenido">
        {(
          [
            ['es', 'Español'],
            ['pt', 'Português'],
            ['en', 'English'],
          ] as const
        ).map(([code, name]) => (
          <button
            type="button"
            role="tab"
            aria-selected={language === code}
            className={`btn ${language === code ? '' : 'secondary'}`}
            key={code}
            onClick={() => setLanguage(code)}
          >
            {name}
          </button>
        ))}
      </div>
      {language === 'es' ? (
        children || (
          <p className="form-hint">
            El contenido obligatorio en español se edita en los campos principales.
          </p>
        )
      ) : (
        <div role="tabpanel">
          <p className="form-hint">Los campos vacíos usan el contenido en español.</p>
          {fields.map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={`${id}-${language}-${key}`}>
                {label} ({language.toUpperCase()})
              </label>
              <textarea
                id={`${id}-${language}-${key}`}
                value={value[language]?.[key] || ''}
                onChange={(e) =>
                  onChange({ ...value, [language]: { ...value[language], [key]: e.target.value } })
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
