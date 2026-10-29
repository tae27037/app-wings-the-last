import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import cs from './cs';
import en from './en';

const dictionaries = { cs, en };
export const LANGUAGES = ['cs', 'en'];

const I18nContext = createContext(null);

const detect = () => {
  const l = (navigator.language || 'cs').toLowerCase();
  return l.startsWith('cs') || l.startsWith('sk') ? 'cs' : 'en';
};

const lookup = (dict, key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);

export function I18nProvider({ children }) {
  const [lang, setLang] = useLocalStorage('mw.lang', detect);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // t('key', { n: 3 }) -> interpolated string. Arrays/objects are returned as-is.
  const t = useCallback(
    (key, vars) => {
      const value = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key);
      if (typeof value !== 'string') return value ?? key;
      return vars ? value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : value;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
