import Icon from './Icon';
import { useI18n } from '../i18n';
import s from './TabBar.module.css';

const TABS = [
  { id: 'home', icon: 'home' },
  { id: 'tryon', icon: 'camera' },
  { id: 'care', icon: 'drop' },
  { id: 'community', icon: 'photo' },
  { id: 'club', icon: 'star' },
];

export default function TabBar({ active }) {
  const { t } = useI18n();
  return (
    <nav className={s.bar} aria-label="Main">
      {TABS.map((tab) => (
        <a
          key={tab.id}
          href={`#/${tab.id}`}
          className={`${s.tab} ${active === tab.id ? s.on : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className={s.ico}>
            <Icon name={tab.icon} />
          </span>
          {t(`nav.${tab.id}`)}
        </a>
      ))}
    </nav>
  );
}
