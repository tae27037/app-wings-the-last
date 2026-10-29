import Icon from './Icon';
import { LANGUAGES, useI18n } from '../i18n';
import { useTheme } from '../theme/ThemeContext';
import s from './Header.module.css';

export default function Header({ showBack }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <header className={s.header}>
      <div className={s.left}>
        {showBack && (
          <a className={s.back} href="#/home" aria-label={t('common.back')}>
            <Icon name="back" />
          </a>
        )}
        <a className={s.logo} href="#/home">
          Maison <span>Wigs</span>
        </a>
      </div>

      <div className={s.right}>
        <div className={s.langs} role="group" aria-label={t('header.language')}>
          {LANGUAGES.map((code) => (
            <button
              key={code}
              type="button"
              className={`${s.lang} ${lang === code ? s.on : ''}`}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={s.theme}
          onClick={toggle}
          aria-label={theme === 'dark' ? t('header.toLight') : t('header.toDark')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
        </button>
      </div>
    </header>
  );
}
