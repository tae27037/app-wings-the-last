import Icon from '../components/Icon';
import Wig from '../components/Wig';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import { getStyle, washInterval } from '../data/wigs';
import s from './Home.module.css';

const FEATURES = [
  { id: 'stylist', icon: 'sparkle', to: 'stylist' },
  { id: 'tryon', icon: 'camera', to: 'tryon' },
  { id: 'care', icon: 'drop', to: 'care' },
  { id: 'community', icon: 'photo', to: 'community' },
  { id: 'consult', icon: 'video', to: 'consult' },
  { id: 'club', icon: 'star', to: 'club' },
];

export default function Home() {
  const { t } = useI18n();
  const { state } = useApp();

  // Wig that most needs washing (>= 70% of its interval).
  const due = state.wigs
    .map((w) => ({ w, style: getStyle(w.id) }))
    .filter((x) => x.style)
    .map((x) => ({ ...x, ratio: x.w.sinceWash / washInterval(x.style) }))
    .filter((x) => x.ratio >= 0.7)
    .sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={s.heroText}>
          <h1 className={s.heroTitle}>{t('home.heroTitle')}</h1>
          <p className={s.heroSub}>{t('home.heroText')}</p>
          <a className={s.cta} href="#/tryon">
            <Icon name="camera" size={20} />
            {t('home.heroCta')}
          </a>
        </div>
        <div className={s.heroArt} aria-hidden="true">
          <Wig kind="long" color="#B4522E" height={170} />
        </div>
      </section>

      <a className={s.points} href="#/club">
        <span className={s.pointsIcon}>
          <Icon name="star" size={22} filled />
        </span>
        <span className={s.pointsText}>{t('home.pointsLabel')}</span>
        <strong className={s.pointsNum}>{state.points}</strong>
      </a>

      <h2 className={s.h2}>{t('home.featuresTitle')}</h2>
      <div className={s.grid}>
        {FEATURES.map((f) => (
          <a key={f.id} className={s.card} href={`#/${f.to}`}>
            <span className={s.cardIcon}>
              <Icon name={f.icon} size={24} />
            </span>
            <span className={s.cardTitle}>{t(`home.f.${f.id}.title`)}</span>
            <span className={s.cardText}>{t(`home.f.${f.id}.text`)}</span>
          </a>
        ))}
      </div>

      <section className={s.reminder} aria-label={t('home.reminderTitle')}>
        <span className={s.reminderIcon}>
          <Icon name="bell" size={22} />
        </span>
        <div className={s.reminderBody}>
          <h3 className={s.reminderTitle}>{t('home.reminderTitle')}</h3>
          <p className={s.reminderText}>
            {due
              ? t('home.reminderText', { name: due.style.name, days: due.w.sinceWash })
              : t('home.reminderOk')}
          </p>
          <a className={s.link} href="#/care">
            {t('home.reminderCta')}
          </a>
        </div>
      </section>

      <section className={s.tip}>
        <h3 className={s.tipTitle}>{t('home.tipTitle')}</h3>
        <p className={s.tipText}>{t('home.tip')}</p>
      </section>
    </div>
  );
}
