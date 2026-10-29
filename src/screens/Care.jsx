import { useState } from 'react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Wig from '../components/Wig';
import ScreenHead from '../components/ScreenHead';
import { STYLES, getStyle, washInterval } from '../data/wigs';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import s from './Care.module.css';

export default function Care() {
  const { t } = useI18n();
  const { state, patch, toast } = useApp();
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState('');

  const updateWig = (id, fn) =>
    patch((st) => ({ wigs: st.wigs.map((w) => (w.id === id ? fn(w) : w)) }));

  const addWig = () => {
    if (!adding || state.wigs.some((w) => w.id === adding)) return;
    patch((st) => ({ wigs: [...st.wigs, { id: adding, sinceWash: 0 }] }));
    setAdding('');
  };

  const supported = typeof Notification !== 'undefined';
  const enableNotifications = async () => {
    if (!supported) {
      toast(t('care.notif.unsupported'));
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      toast(t('care.notif.denied'));
      return;
    }
    patch({ notif: true });
    const due = state.wigs.map((w) => ({ w, st: getStyle(w.id) })).sort((a, b) => b.w.sinceWash - a.w.sinceWash)[0];
    if (due) {
      try {
        new Notification('Maison Wigs', {
          body: t('care.notif.test', { name: due.st.name, n: due.w.sinceWash }),
          icon: '/icon.svg',
        });
      } catch {
        /* some mobile browsers only allow notifications via a service worker */
      }
    }
  };

  const available = STYLES.filter((st) => !state.wigs.some((w) => w.id === st.id));

  return (
    <div className={s.page}>
      <ScreenHead title={t('care.title')} subtitle={t('care.subtitle')} />

      <h2 className={s.h2}>{t('care.myWigs')}</h2>
      {state.wigs.length === 0 && <p className={s.empty}>{t('care.empty')}</p>}
      <div className={s.list}>
        {state.wigs.map((w) => {
          const style = getStyle(w.id);
          if (!style) return null;
          const interval = washInterval(style);
          const left = Math.max(0, interval - w.sinceWash);
          const pct = Math.min(100, (w.sinceWash / interval) * 100);
          const due = w.sinceWash >= interval;
          return (
            <article key={w.id} className={s.wig}>
              <div className={s.top}>
                <div className={s.thumb}>
                  <Wig kind={style.kind} color={style.color} height={86} />
                </div>
                <div className={s.body}>
                  <h3 className={s.name}>{style.name}</h3>
                  <p className={s.meta}>{t(`common.material.${style.material}`)}</p>
                  <p className={s.meta}>{t('care.sinceWash', { n: w.sinceWash })}</p>
                </div>
                <button
                  type="button"
                  className={s.remove}
                  aria-label={`${t('care.remove')} ${style.name}`}
                  onClick={() => patch((st) => ({ wigs: st.wigs.filter((x) => x.id !== w.id) }))}
                >
                  <Icon name="trash" size={20} />
                </button>
              </div>
              <div
                className={`${s.bar} ${due ? s.due : ''}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={interval}
                aria-valuenow={Math.min(w.sinceWash, interval)}
              >
                <span style={{ width: `${pct}%` }} />
              </div>
              <p className={`${s.status} ${due ? s.dueText : ''}`}>
                {due ? t('care.washNow') : t('care.washIn', { n: left })}
              </p>
              <div className={s.actions}>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => updateWig(w.id, (x) => ({ ...x, sinceWash: x.sinceWash + 1 }))}
                >
                  {t('care.wornToday')}
                </Button>
                <Button size="sm" icon="drop" onClick={() => updateWig(w.id, (x) => ({ ...x, sinceWash: 0 }))}>
                  {t('care.washed')}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {available.length > 0 && (
        <div className={s.add}>
          <label className="sr-only" htmlFor="addwig">
            {t('care.choose')}
          </label>
          <select id="addwig" className={s.select} value={adding} onChange={(e) => setAdding(e.target.value)}>
            <option value="">{t('care.choose')}</option>
            {available.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
          <Button size="sm" icon="plus" disabled={!adding} onClick={addWig}>
            {t('care.add')}
          </Button>
        </div>
      )}

      <section className={s.notif}>
        <span className={s.notifIcon}>
          <Icon name="bell" size={22} />
        </span>
        <div className={s.notifBody}>
          <h3 className={s.notifTitle}>{t('care.notif.title')}</h3>
          <p className={s.meta}>{state.notif ? t('care.notif.on') : t('care.notif.text')}</p>
        </div>
        {!state.notif && (
          <Button size="sm" onClick={enableNotifications}>
            {t('care.notif.enable')}
          </Button>
        )}
      </section>

      <h2 className={s.h2}>{t('care.guidesTitle')}</h2>
      <div className={s.guides}>
        {t('care.guides').map((g) => {
          const isOpen = open === g.id;
          return (
            <article key={g.id} className={s.guide}>
              <button
                type="button"
                className={s.guideHead}
                aria-expanded={isOpen}
                aria-controls={`g-${g.id}`}
                onClick={() => setOpen(isOpen ? null : g.id)}
              >
                <span className={s.play}>
                  <Icon name="video" size={20} />
                </span>
                <span className={s.guideText}>
                  <strong>{g.title}</strong>
                  <small>
                    {g.duration} {t('common.min')} · {g.steps.length}×
                  </small>
                </span>
                <span className={`${s.chev} ${isOpen ? s.flip : ''}`}>
                  <Icon name="chevron" size={22} />
                </span>
              </button>
              {isOpen && (
                <ol id={`g-${g.id}`} className={s.steps}>
                  {g.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
